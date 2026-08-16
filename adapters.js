/**
 * sync/adapters.js — source adapters: MangaDex (primary), AniList (enrichment),
 * Comick (alternative), + stubs for MangaUpdates / Consumet / mirrors.
 */
'use strict';
const { fetchMD } = require('../mdlib');

const UA = 'MeloVerse/1.0 (sync; +https://meloverse.app)';

async function fetchJSON(url, opts = {}) {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), opts.timeout || 25000);
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'application/json', ...(opts.headers || {}) },
        method: opts.method || 'GET',
        body: opts.body,
        signal: ctrl.signal,
      });
      if (!res.ok) {
        if ((res.status === 429 || res.status >= 500) && attempt < maxAttempts) {
          await sleep(1500 * attempt);
          continue;
        }
        throw new Error(`HTTP ${res.status} for ${url.slice(0, 90)}`);
      }
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(`HTTP failed for ${url.slice(0, 90)}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------- MangaDex (primary) ---------------- */
const MangaDexAdapter = {
  id: 'mangadex',
  name: 'MangaDex',

  async search(q, lang = 'en', limit = 24) {
    const d = await fetchMD('/manga', {
      title: q,
      'contentRating[]': ['safe', 'suggestive'],
      'availableTranslatedLanguage[]': [lang],
      'includes[]': ['cover_art'],
      limit,
    });
    return (d.data || []).map((m) => this.normalize(m));
  },

  async getWork(sourceId, lang = 'en') {
    const d = await fetchMD(`/manga/${sourceId}`, { 'includes[]': ['cover_art', 'author', 'artist'] });
    if (!d.data) throw new Error('manga not found');
    return this.normalize(d.data, lang);
  },

  async getChapters(sourceId, lang = 'en', limit = 100) {
    const d = await fetchMD(`/manga/${sourceId}/feed`, {
      'translatedLanguage[]': [lang],
      'order[publishAt]': 'desc',
      'order[chapter]': 'desc',
      'contentRating[]': ['safe', 'suggestive'],
      limit,
    });
    return (d.data || [])
      .filter((c) => !(c.attributes && c.attributes.externalUrl))
      .map((c) => ({
        source_chapter_id: c.id,
        number: c.attributes.chapter || '',
        title: c.attributes.title || '',
        published_at: c.attributes.publishAt || null,
        page_count: c.attributes.pages || 0,
      }));
  },

  async getPages(sourceId) {
    const atHome = await fetchJSON(`https://api.mangadex.org/at-home/server/${sourceId}`);
    if (!atHome.chapter || !atHome.chapter.data || atHome.chapter.data.length === 0) {
      throw new Error('empty at-home response');
    }
    const base = atHome.baseUrl;
    const hash = atHome.chapter.hash;
    return (atHome.chapter.data || []).map((f) => `${base}/data/${hash}/${f}`);
  },

  async trending(lang = 'en', limit = 24) {
    const d = await fetchMD('/manga', {
      'order[followedCount]': 'desc',
      'contentRating[]': ['safe', 'suggestive'],
      'availableTranslatedLanguage[]': [lang],
      'includes[]': ['cover_art'],
      limit,
    });
    return (d.data || []).map((m) => this.normalize(m));
  },

  async latest(lang = 'en', limit = 24) {
    const d = await fetchMD('/manga', {
      'order[latestUploadedChapter]': 'desc',
      'contentRating[]': ['safe', 'suggestive'],
      'availableTranslatedLanguage[]': [lang],
      'includes[]': ['cover_art'],
      limit,
    });
    return (d.data || []).map((m) => this.normalize(m));
  },

  normalize(m, lang = 'en') {
    const a = m.attributes || {};
    const cover = (m.relationships || []).find((r) => r.type === 'cover_art');
    return {
      source: 'mangadex',
      source_id: m.id,
      title_ar: a.title.ar || '',
      title_en: a.title.en || a.title['ko-ro'] || a.title['ja-ro'] || a.title['zh-ro'] || Object.values(a.title)[0] || '',
      alt_titles: (a.altTitles || []).map((t) => Object.values(t)[0] || '').filter(Boolean),
      description: a.description.en || a.description.ar || '',
      cover_url: cover ? `https://uploads.mangadex.org/covers/${m.id}/${cover.attributes.fileName}.256.jpg` : '',
      cover_full: cover ? `https://uploads.mangadex.org/covers/${m.id}/${cover.attributes.fileName}` : '',
      status: a.status || '',
      original_language: a.originalLanguage || '',
      content_type: a.tags && a.tags.length
        ? (['Web Comic', 'Manhwa', 'Manhua', 'Manga'].find((n) => a.tags.some((t) => t.attributes.name.en === n)) || '')
        : '',
      genres: (a.tags || []).map((t) => t.attributes.name.en || '').filter(Boolean).slice(0, 10),
    };
  },
};

/* ---------------- AniList (enrichment: ratings/titles/descriptions) ---------------- */
const AniListAdapter = {
  id: 'anilist',
  name: 'AniList',

  async enrich(work) {
    const query = `query($q:String){Media(search:$q,type:MANGA){title{romaji english native},description(asHtml:false),averageScore,popularity,meanScore,status,coverImage{extraLarge}}}`;
    const candidates = [work.title_en, work.title_ar, work.alt_titles && work.alt_titles[0]]
      .filter(Boolean)
      .slice(0, 2);
    for (const q of candidates) {
      try {
        const d = await fetchJSON('https://graphql.anilist.co', {
          method: 'POST',
          timeout: 15000,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables: { q } }),
        });
        const m = d.data && d.data.Media;
        if (!m) continue;
        return {
          anilist_id: null,
          rating: m.averageScore ? m.averageScore / 10 : null,
          rating_count: m.popularity || null,
          description_anilist: (m.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 3000),
        };
      } catch {
        /* try next candidate */
      }
    }
    return {};
  },
};

/* ---------------- Comick (alternative source: search/chapters/pages) ---------------- */
const ComickAdapter = {
  id: 'comick',
  name: 'Comick',
  // NOTE: comick moved to comick.dev and is Cloudflare-challenged for bots;
  // adapter kept wired — requests may fail until their API opens again.
  API: 'https://comick.dev',

  async search(q, lang = 'en', limit = 24) {
    const d = await fetchJSON(`${this.API}/search?q=${encodeURIComponent(q)}&limit=${limit}`);
    return (Array.isArray(d) ? d : []).map((m) => this.normalize(m));
  },

  async getWork(sourceId) {
    const d = await fetchJSON(`${this.API}/comic/${encodeURIComponent(sourceId)}`);
    if (!d.comic) throw new Error('comic not found');
    return this.normalize({ ...d.comic, hid: sourceId });
  },

  async getChapters(sourceId, lang = 'en', limit = 100) {
    const d = await fetchJSON(`${this.API}/comic/${encodeURIComponent(sourceId)}`);
    const chs = (d.chapters || []).slice(0, limit).map((c) => ({
      source_chapter_id: c.hid,
      number: String(c.chap || ''),
      title: c.title || '',
      published_at: c.created_at ? new Date(c.created_at * 1000).toISOString() : null,
      page_count: c.md_images ? c.md_images.length : (c.images || 0),
    }));
    return chs;
  },

  async getPages(sourceId) {
    const d = await fetchJSON(`${this.API}/chapter/${encodeURIComponent(sourceId)}`);
    const imgs = d.chapter && d.chapter.md_images ? d.chapter.md_images : [];
    if (!imgs.length) throw new Error('comick chapter empty');
    return imgs.map((im) =>
      im.s.startsWith('http') ? im.s : im.s.startsWith('/') ? `https://meo.comick.party${im.s}` : `https://meo.comick.party/${im.s}`
    );
  },

  async trending(lang = 'en', limit = 24) {
    const d = await fetchJSON(`${this.API}/v1.0/search?sort=popular&limit=${limit}&tachiyomi=true`);
    return (Array.isArray(d) ? d : []).map((m) => this.normalize(m));
  },

  normalize(m) {
    return {
      source: 'comick',
      source_id: m.slug || m.hid,
      title_ar: '',
      title_en: m.title || m.slug || '',
      alt_titles: (m.titles || []).map((t) => t.title || '').filter(Boolean),
      description: m.desc || '',
      cover_url: m.md_covers && m.md_covers[0] && m.md_covers[0].b2 ? `https://meo.comick.party/${m.md_covers[0].b2}` : '',
      status: m.status || '',
      original_language: m.lang || '',
      content_type: m.comic_type || '',
      genres: m.genres || [],
    };
  },
};

/* ---------------- stubs (configurable, not yet wired) ---------------- */
const MangaUpdatesAdapter = {
  id: 'mangaupdates',
  name: 'MangaUpdates',
  ready: false,
  async search() {
    throw new Error('MangaUpdates adapter غير مفعّل (يتطلب مفتاح API)');
  },
};

const ConsumetAdapter = {
  id: 'consumet',
  name: 'Consumet',
  ready: false,
  async search() {
    throw new Error('Consumet adapter غير مفعّل (عُقد عامة غير مستقرة)');
  },
};

/* image mirror stubs — replace with real scrapers when targets allow it */
const MirrorAdapters = {
  batoto: { id: 'batoto', ready: false, name: 'Bato.to' },
  mangabuddy: { id: 'mangabuddy', ready: false, name: 'MangaBuddy' },
  mangapill: { id: 'mangapill', ready: false, name: 'MangaPill' },
};

const ADAPTERS = {
  mangadex: MangaDexAdapter,
  comick: ComickAdapter,
  anilist: AniListAdapter,
  mangaupdates: MangaUpdatesAdapter,
  consumet: ConsumetAdapter,
};

module.exports = { ADAPTERS, MangaDexAdapter, AniListAdapter, ComickAdapter, MirrorAdapters, fetchJSON, sleep, UA };

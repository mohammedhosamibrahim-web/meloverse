/**
 * sync/engine.js — local catalog (works + chapters), enrichment, mirror chain
 */
'use strict';
const db = require('../db');
const { ADAPTERS, AniListAdapter, MangaDexAdapter, ComickAdapter, fetchJSON, sleep, UA } = require('./adapters');

const POLLITE_DELAY = 300; // ms between upstream calls

function blockedIds(type) {
  return new Set(db.filter('blocked', (b) => b.targetType === type).map((b) => b.targetId));
}

function isBlocked(type, id) {
  return blockedIds(type).has(id);
}

async function syncWork(source, sourceId, opts = {}) {
  const adapter = ADAPTERS[source];
  if (!adapter || !adapter.getWork) throw new Error(`مصدر غير معروف: ${source}`);
  const lang = opts.lang || 'en';
  const work = await adapter.getWork(sourceId, lang);
  if (!work || !work.source_id) throw new Error('لم يُرجع المصدر عملًا صالحًا');
  if (isBlocked('manga', work.source_id)) return null;

  let enriched = {};
  if (source === 'mangadex') {
    try {
      enriched = await AniListAdapter.enrich(work);
    } catch {
      /* enrichment is best-effort */
    }
    await sleep(POLLITE_DELAY);
  }

  const saved = db.upsert('works', 'source_id', {
    ...work,
    ...enriched,
    last_synced: new Date().toISOString(),
  });

  if (opts.deep !== false) {
    const chapters = await adapter.getChapters(sourceId, lang, opts.chapterLimit || 100);
    let added = 0;
    for (const ch of chapters) {
      const exists = db.find('chapters', (c) => c.source_chapter_id === ch.source_chapter_id);
      if (!exists) {
        db.insert('chapters', { ...ch, source, work_id: saved.id, pages_json: null, synced_at: new Date().toISOString() });
        added++;
      } else if (opts.updateExisting) {
        db.update('chapters', exists.id, { ...ch, synced_at: new Date().toISOString() });
      }
    }
    saved.chapters_added = added;
    await sleep(POLLITE_DELAY);
  }
  return saved;
}

/* daily bulk: pull N new works from MangaDex latest updates */
async function dailyBulk(opts = {}) {
  const quota = opts.quota || 75;
  const lang = opts.lang || 'en';
  const list = await MangaDexAdapter.latest(lang, Math.min(quota, 100));
  let done = 0, errors = 0;
  for (const item of list.slice(0, quota)) {
    try {
      await syncWork('mangadex', item.source_id, { deep: false, lang });
      done++;
    } catch (e) {
      errors++;
    }
    await sleep(POLLITE_DELAY);
  }
  return { job: 'daily_bulk', done, errors, total: list.length };
}

/* ongoing tracking: check all catalog works for new chapters */
async function ongoingTracking(opts = {}) {
  const works = db.all('works');
  let newChapters = 0, worksChecked = 0;
  for (const w of works.slice(0, 200)) {
    try {
      const adapter = ADAPTERS[w.source];
      if (!adapter || !adapter.getChapters) continue;
      const chapters = await adapter.getChapters(w.source_id, opts.lang || 'en', 30);
      for (const ch of chapters) {
        if (!db.find('chapters', (c) => c.source_chapter_id === ch.source_chapter_id)) {
          db.insert('chapters', { ...ch, source: w.source, work_id: w.id, pages_json: null, synced_at: new Date().toISOString() });
          newChapters++;
        }
      }
      worksChecked++;
      await sleep(POLLITE_DELAY);
    } catch {
      /* skip failing work */
    }
  }
  return { job: 'ongoing', worksChecked, newChapters };
}

/* popular sync: MangaDex trending into local catalog */
async function popularSync(opts = {}) {
  const lang = opts.lang || 'en';
  const list = await MangaDexAdapter.trending(lang, 24);
  let done = 0;
  for (const item of list) {
    try {
      await syncWork('mangadex', item.source_id, { deep: false, lang });
      done++;
    } catch {}
    await sleep(POLLITE_DELAY);
  }
  return { job: 'popular', done, total: list.length };
}

/* full catalog: paginated pull with a safety cap */
async function fullCatalog(opts = {}) {
  const cap = Math.min(opts.cap || 500, 2000);
  const lang = opts.lang || 'en';
  let done = 0;
  for (let offset = 0; offset < cap && done < cap; offset += 100) {
    const d = await fetchJSON(
      `https://api.mangadex.org/manga?order%5BlatestUploadedChapter%5D=desc&contentRating%5B%5D=safe&contentRating%5B%5D=suggestive&availableTranslatedLanguage%5B%5D=${lang}&includes%5B%5D=cover_art&limit=100&offset=${offset}`,
      { headers: { 'User-Agent': UA } }
    );
    for (const m of (d.data || [])) {
      if (done >= cap) break;
      try {
        await syncWork('mangadex', m.id, { deep: false, lang });
        done++;
      } catch {}
      await sleep(POLLITE_DELAY);
    }
  }
  return { job: 'full', done, cap };
}

/* full pull: N works (popular + latest), deep (chapters + enrichment) */
async function syncMany(quota = 1000, opts = {}, onProgress) {
  const lang = opts.lang || 'en';
  const seen = new Set();
  const list = [];
  // mix trending + latest pages up to quota
  const fetchPage = async (kind, offset) => {
    const d = await fetchJSON(
      `https://api.mangadex.org/manga?${kind}&contentRating%5B%5D=safe&contentRating%5B%5D=suggestive&availableTranslatedLanguage%5B%5D=${lang}&includes%5B%5D=cover_art&limit=100&offset=${offset}`,
      { headers: { 'User-Agent': UA } }
    );
    return d.data || [];
  };
  for (let offset = 0; offset < quota && list.length < quota; offset += 100) {
    const items = await fetchPage('order%5BfollowedCount%5D=desc', offset);
    for (const m of items) {
      if (list.length >= quota) break;
      if (!seen.has(m.id)) { seen.add(m.id); list.push(m); }
    }
    if (items.length < 100) break;
    await sleep(250);
  }
  for (let offset = 0; offset < quota && list.length < quota; offset += 100) {
    const items = await fetchPage('order%5BlatestUploadedChapter%5D=desc', offset);
    for (const m of items) {
      if (list.length >= quota) break;
      if (!seen.has(m.id)) { seen.add(m.id); list.push(m); }
    }
    if (items.length < 100) break;
    await sleep(250);
  }

  let done = 0, errors = 0, chapters = 0;
  const deep = opts.deep !== false;
  for (const m of list) {
    try {
      const w = await syncWork('mangadex', m.id, { deep, lang });
      if (w) chapters += w.chapters_added || 0;
    } catch {
      errors++;
    }
    done++;
    const pct = Math.min(100, Math.round((done / list.length) * 100));
    if (onProgress) onProgress(pct, `تمت معالجة ${done}/${list.length}`);
    await sleep(POLLITE_DELAY);
  }
  return { job: 'sync1000', requested: quota, done, errors, chaptersAdded: chapters };
}

/* ---- mirror chain: fetch chapter pages trying sources in order ---- */
async function readiness(url, timeoutMs = 6000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: 'HEAD', signal: ctrl.signal, headers: { 'User-Agent': UA } });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function findComickChapter(work, chapterNumber) {
  if (!work || !chapterNumber) return null;
  const query = work.title_en || work.title_ar;
  const results = await ComickAdapter.search(query, 'en', 5).catch(() => []);
  for (const r of results.slice(0, 3)) {
    try {
      const chs = await ComickAdapter.getChapters(r.source_id, 'en', 200);
      const hit = chs.find((c) => c.number === String(chapterNumber));
      if (hit) return { comicId: r.source_id, chapter: hit };
    } catch {}
    await sleep(200);
  }
  return null;
}

/* get pages with mirror fallback; returns {pages, via} */
async function getChapterPages(work, chapter, opts = {}) {
  // 1) primary: same source as the work
  if (work && work.source === 'mangadex') {
    try {
      const pages = await MangaDexAdapter.getPages(chapter.source_chapter_id);
      if (pages.length) {
        const ok = await readiness(pages[0]);
        if (ok) return { pages, via: 'mangadex' };
      }
    } catch {}
  }
  // 2) mirror: Comick
  if (work && work.source === 'comick') {
    try {
      const pages = await ComickAdapter.getPages(chapter.source_chapter_id);
      if (pages.length && (await readiness(pages[0]))) return { pages, via: 'comick' };
    } catch {}
  } else if (work) {
    try {
      const found = await findComickChapter(work, chapter.number);
      if (found) {
        const pages = await ComickAdapter.getPages(found.chapter.source_chapter_id);
        if (pages.length && (await readiness(pages[0]))) return { pages, via: 'comick' };
      }
    } catch {}
  }
  throw new Error('no image source available');
}

/* store chapter pages locally (offline pull by manga/chapter id) */
async function pullChapter(workId, chapterId) {
  const chapter = db.get('chapters', chapterId);
  if (!chapter) throw new Error('الفصل غير موجود في الفهرس');
  const work = db.get('works', chapter.work_id);
  const { pages, via } = await getChapterPages(work, chapter);
  db.update('chapters', chapterId, { pages_json: JSON.stringify(pages), pages_via: via, synced_at: new Date().toISOString() });
  return { chapterId, pages: pages.length, via };
}

/* deep sync everything: existing works' chapters + N new works */
async function deepAll(opts = {}, onProgress) {
  const lang = opts.lang || 'en';
  const existing = db.all('works');
  let syncedExisting = 0;
  for (let i = 0; i < existing.length; i++) {
    const w = existing[i];
    try {
      await syncWork(w.source, w.source_id, { deep: true, lang });
      syncedExisting++;
    } catch {}
    if (onProgress) onProgress(Math.round((i / Math.max(existing.length, 1)) * 25), `فصول الأعمال الموجودة: ${i + 1}/${existing.length}`);
    await sleep(POLLITE_DELAY);
  }
  const out = await syncMany(opts.quota || 500, { deep: true, lang }, (p, msg) =>
    onProgress(25 + Math.round(p * 0.75), msg)
  );
  return { existingSynced: syncedExisting, ...out };
}

module.exports = {
  syncWork,
  dailyBulk,
  ongoingTracking,
  popularSync,
  fullCatalog,
  syncMany,
  deepAll,
  getChapterPages,
  pullChapter,
  findComickChapter,
  isBlocked,
  blockedIds,
};

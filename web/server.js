/**
 * MeloVerse — Web Server
 * Proxy layer over MangaDex API v5 with in-memory caching.
 * Serves the SPA from ./public
 */
const express = require('express');
const path = require('path');
const db = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));

const UA = 'MeloVerse/1.0 (web; +https://meloverse.app)';
const isBlocked = (type, id) => db.find('blocked', (b) => b.targetType === type && b.targetId === id) != null;
const { fetchMD, cached, CACHE_TTL } = require('./mdlib');

const LANG_FILTERS = {
  ar: { titleLang: 'ar', feedLang: 'ar' },
  en: { titleLang: 'en', feedLang: 'en' },
};

// ---------- API ----------

// Trending / popular mangas
app.get('/api/trending', async (req, res) => {
  const lang = LANG_FILTERS[req.query.lang] ? req.query.lang : 'ar';
  try {
    const data = await cached(
      `trending:${lang}`,
      CACHE_TTL.trending,
      () =>
        fetchMD('/manga', {
          'order[followedCount]': 'desc',
          'contentRating[]': ['safe', 'suggestive'],
          'availableTranslatedLanguage[]': [lang],
          'includes[]': ['cover_art'],
          limit: 24,
          offset: 0,
        }),
    );
    res.json({ ...data, data: (data.data || []).filter((m) => !isBlocked('manga', m.id)) });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// Latest updated mangas
app.get('/api/latest', async (req, res) => {
  const lang = LANG_FILTERS[req.query.lang] ? req.query.lang : 'ar';
  try {
    const data = await cached(
      `latest:${lang}`,
      CACHE_TTL.trending,
      () =>
        fetchMD('/manga', {
          'order[latestUploadedChapter]': 'desc',
          'contentRating[]': ['safe', 'suggestive'],
          'availableTranslatedLanguage[]': [lang],
          'includes[]': ['cover_art'],
          limit: 24,
          offset: 0,
        }),
    );
    res.json({ ...data, data: (data.data || []).filter((m) => !isBlocked('manga', m.id)) });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// Search
app.get('/api/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  const lang = LANG_FILTERS[req.query.lang] ? req.query.lang : 'ar';
  if (!q) return res.json({ result: 'ok', data: [] });
  try {
    const data = await cached(
      `search:${lang}:${q.toLowerCase()}`,
      CACHE_TTL.search,
      () =>
        fetchMD('/manga', {
          title: q,
          'availableTranslatedLanguage[]': [lang],
          'contentRating[]': ['safe', 'suggestive'],
          'includes[]': ['cover_art'],
          limit: 24,
          offset: 0,
        }),
    );
    res.json({ ...data, data: (data.data || []).filter((m) => !isBlocked('manga', m.id)) });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// Manga detail
app.get('/api/manga/:id', async (req, res) => {
  if (isBlocked('manga', req.params.id)) return res.status(404).json({ error: 'المحتوى محجوب' });
  try {
    const data = await cached(
      `manga:${req.params.id}`,
      CACHE_TTL.manga,
      () => fetchMD(`/manga/${req.params.id}`, { 'includes[]': ['cover_art', 'author', 'artist'] }),
    );
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// Chapter feed for a manga
app.get('/api/manga/:id/feed', async (req, res) => {
  const lang = LANG_FILTERS[req.query.lang] ? req.query.lang : 'ar';
  const offset = parseInt(req.query.offset || '0', 10);
  try {
    const data = await cached(
      `feed:${req.params.id}:${lang}:${Math.floor(offset / 100)}`,
      CACHE_TTL.feed,
      () =>
        fetchMD(`/manga/${req.params.id}/feed`, {
          'translatedLanguage[]': [lang],
          'order[publishAt]': 'desc',
          'order[volume]': 'desc',
          'order[chapter]': 'desc',
          'includes[]': ['scanlation_group'],
          'contentRating[]': ['safe', 'suggestive'],
          limit: 100,
          offset,
        }),
    );
    // filter out externally-hosted chapters (no pages available via at-home)
    if (data && Array.isArray(data.data)) {
      data.data = data.data.filter((c) => !(c.attributes && c.attributes.externalUrl));
      data.data = data.data.filter((c) => !isBlocked('chapter', c.id));
    }
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// Chapter pages via at-home server (never cached long — base URLs expire)
app.get('/api/chapter/:id', async (req, res) => {
  if (isBlocked('chapter', req.params.id)) return res.status(404).json({ error: 'المحتوى محجوب' });
  try {
    const data = await cached(
      `chapter:${req.params.id}`,
      CACHE_TTL.chapter,
      () => fetchMD(`/at-home/server/${req.params.id}`),
    );
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// ---------- anime: Kitsu primary + Jikan fallback (cloud-IP friendly) ----------
async function jikanFetch(path) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch('https://api.jikan.moe/v4' + path, {
        headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: ctrl.signal,
      });
      if (!res.ok) {
        if ((res.status === 429 || res.status >= 500) && attempt < 3) { await new Promise((r) => setTimeout(r, 4000 * attempt)); continue; }
        throw new Error('jikan ' + res.status);
      }
      return await res.json();
    } finally { clearTimeout(timer); }
  }
  throw new Error('jikan failed');
}
async function kitsuFetch(path) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch('https://kitsu.io/api/edge' + path, {
        headers: { 'User-Agent': UA, Accept: 'application/vnd.api+json' }, signal: ctrl.signal,
      });
      if (!res.ok) {
        if ((res.status === 429 || res.status >= 500) && attempt < 3) { await new Promise((r) => setTimeout(r, 4000 * attempt)); continue; }
        throw new Error('kitsu ' + res.status);
      }
      return await res.json();
    } finally { clearTimeout(timer); }
  }
  throw new Error('kitsu failed');
}
function mapKitsu(m) {
  const a = m.attributes || {};
  const t = a.titles || {};
  return {
    id: m.id,
    title: a.canonicalTitle || t.en || t.en_jp || '',
    titleEnglish: t.en || '',
    cover: (a.posterImage && (a.posterImage.large || a.posterImage.original)) || '',
    rating: a.averageRating ? Math.round((parseFloat(a.averageRating) / 10) * 10) / 10 : null,
    episodes: a.episodeCount || 0,
    status: a.status || '',
    genres: [],
    description: (a.synopsis || '').slice(0, 1200),
    nextEpisode: null,
  };
}
function mapJikan(m) {
  return {
    id: m.mal_id,
    title: m.title || m.title_english || '',
    titleEnglish: m.title_english || '',
    cover: (m.images && m.images.jpg && (m.images.jpg.large_image_url || m.images.jpg.image_url)) || '',
    rating: m.score ? Math.round(m.score * 10) / 10 : null,
    episodes: m.episodes || 0,
    status: m.status || '',
    genres: (m.genres || []).map((g) => g.name),
    description: (m.synopsis || '').slice(0, 1200),
    nextEpisode: null,
  };
}
app.get('/api/anime/trending', async (req, res) => {
  try {
    const d = await cached('anime:trending', 10 * 60000, async () => {
      try { return { via: 'kitsu', data: (await kitsuFetch('/trending/anime?limit=24')).data.map(mapKitsu) }; } catch {}
      return { via: 'jikan', data: (await jikanFetch('/top/anime?filter=bypopularity&limit=24')).data.map(mapJikan) };
    });
    res.json({ result: 'ok', data: d.data });
  } catch (e) { res.status(502).json({ error: e.message }); }
});
app.get('/api/anime/popular', async (req, res) => {
  try {
    const d = await cached('anime:popular', 30 * 60000, async () => {
      try { return { via: 'kitsu', data: (await kitsuFetch('/anime?sort=-userCount&page%5Blimit%5D=20')).data.map(mapKitsu) }; } catch {}
      return { via: 'jikan', data: (await jikanFetch('/top/anime?filter=bypopularity&limit=24')).data.map(mapJikan) };
    });
    res.json({ result: 'ok', data: d.data });
  } catch (e) { res.status(502).json({ error: e.message }); }
});
app.get('/api/anime/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ result: 'ok', data: [] });
  try {
    const d = await cached('anime:search:' + q.toLowerCase(), 10 * 60000, async () => {
      try { return { via: 'kitsu', data: (await kitsuFetch('/anime?filter%5Btext%5D=' + encodeURIComponent(q) + '&page%5Blimit%5D=20')).data.map(mapKitsu) }; } catch {}
      return { via: 'jikan', data: (await jikanFetch('/anime?q=' + encodeURIComponent(q) + '&limit=24')).data.map(mapJikan) };
    });
    res.json({ result: 'ok', data: d.data });
  } catch (e) { res.status(502).json({ error: e.message }); }
});
app.get('/api/anime/airing', async (req, res) => {
  try {
    const d = await cached('anime:airing', 30 * 60000, async () => {
      try {
        const r = (await jikanFetch('/seasons/upcoming')).data || [];
        return { via: 'jikan', data: r.slice(0, 20).map((m) => ({ animeId: m.mal_id, title: m.title || '', cover: (m.images && m.images.jpg && m.images.jpg.image_url) || '', rating: m.score ? Math.round(m.score * 10) / 10 : null, episode: null, airingAt: null })) };
      } catch {}
      const r = (await kitsuFetch('/anime?filter[status]=upcoming&page[limit]=20')).data || [];
      return { via: 'kitsu', data: r.map(mapKitsu) };
    });
    res.json({ result: 'ok', data: d.data });
  } catch (e) { res.status(502).json({ error: e.message }); }
});
app.get('/api/anime/:id', async (req, res) => {
  try {
    const d = await cached('anime:id:' + req.params.id, 60 * 60000, async () => {
      try { return { via: 'jikan', data: mapJikan((await jikanFetch('/anime/' + req.params.id + '/full')).data) }; } catch {}
      return { via: 'kitsu', data: mapKitsu((await kitsuFetch('/anime/' + req.params.id)).data) };
    });
    res.json({ result: 'ok', data: d.data });
  } catch (e) { res.status(502).json({ error: e.message }); }
});

// ---------- public remote config (ads & access) ----------
const { getConfig, updateConfig } = require('./config');
app.get('/api/config', (req, res) => {
  res.json({ result: 'ok', ...getConfig() });
});

// ---------- image CDN proxy (disk cache) ----------
const crypto = require('crypto');
const fs = require('fs');
const IMG_CACHE = path.join(__dirname, 'data', 'imgcache');
fs.mkdirSync(IMG_CACHE, { recursive: true });
const ALLOWED_IMG_HOSTS = ['uploads.mangadex.org', 'mangadex.network', 'meo.comick.party', 'comick.dev', 'uploads.mangadex.network'];
app.get('/img/*', async (req, res) => {
  try {
    const raw = decodeURIComponent(req.params[0] || '');
    if (!/^https?:\/\//.test(raw)) return res.status(400).json({ error: 'bad url' });
    const host = new URL(raw).hostname;
    if (!ALLOWED_IMG_HOSTS.some((h) => host === h || host.endsWith('.' + h))) {
      return res.status(403).json({ error: 'host not allowed' });
    }
    const key = crypto.createHash('sha256').update(raw).digest('hex');
    const file = path.join(IMG_CACHE, key);
    const typeFromExt = (u) => {
      const ext = (u.split('?')[0].split('.').pop() || '').toLowerCase();
      return { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', gif: 'image/gif' }[ext] || 'image/jpeg';
    };
    res.setHeader('Content-Type', typeFromExt(raw));
    if (fs.existsSync(file)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      res.setHeader('X-Cache', 'HIT');
      return res.sendFile(file);
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    const upstream = await fetch(raw, { signal: ctrl.signal, headers: { 'User-Agent': UA } });
    clearTimeout(timer);
    if (!upstream.ok) return res.status(upstream.status).end();
    const buf = Buffer.from(await upstream.arrayBuffer());
    fs.writeFileSync(file, buf);
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    res.setHeader('X-Cache', 'MISS');
    res.send(buf);
  } catch (e) {
    res.status(502).json({ error: 'image fetch failed' });
  }
});
// periodic cache cleanup (>14 days)
setInterval(() => {
  try {
    const now = Date.now();
    for (const f of fs.readdirSync(IMG_CACHE)) {
      const p = path.join(IMG_CACHE, f);
      try { if (now - fs.statSync(p).mtimeMs > 14 * 86400000) fs.unlinkSync(p); } catch {}
    }
  } catch {}
}, 6 * 3600000);

// ---------- static ----------
app.use('/builds', express.static(path.join(__dirname, 'builds')));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- auth ----------
const auth = require('./auth');
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body || {};
  const out = auth.register(username, password);
  if (out.error) return res.status(400).json({ error: out.error });
  res.json({ result: 'ok', ...out });
});
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const out = auth.login(username, password);
  if (out.error) return res.status(401).json({ error: out.error });
  res.json({ result: 'ok', ...out });
});
app.get('/api/auth/me', auth.requireAuth, (req, res) => {
  res.json({ result: 'ok', user: { id: req.user.id, username: req.user.username, role: req.user.role } });
});

// ---------- comments & admin ----------
app.use('/api/comments', require('./comments'));
app.use('/api/admin', require('./admin'));

// ---------- sync admin endpoints ----------
const engine = require('./sync/engine');
const queue = require('./queue');
const sources = require('./sources');
const { exec } = require('child_process');
const BUILD_DIR = path.join(__dirname, 'builds');
fs.mkdirSync(BUILD_DIR, { recursive: true });

// content sync actions through the task queue
app.post('/api/admin/sync/run', auth.requireAdmin, (req, res) => {
  const type = (req.body || {}).type || 'daily';
  const quota = Math.min(parseInt((req.body || {}).quota, 10) || 100, 2000);
  const runners = {
    '1000': () => engine.syncMany(quota, { deep: true }),
    deep_all: () => engine.deepAll({ quota }),
    daily: () => engine.dailyBulk({ quota }),
    ongoing: () => engine.ongoingTracking(),
    popular: () => engine.popularSync(),
    full: () => engine.fullCatalog({ cap: quota * 10 }),
  };
  const fn = runners[type];
  if (!fn) return res.status(400).json({ error: 'type غير معروف' });
  const taskId = queue.enqueue(`sync:${type}`, async (progress) => {
    if (type === '1000') return engine.syncMany(quota, { deep: true }, progress);
    if (type === 'deep_all') return engine.deepAll({ quota }, progress);
    return fn();
  }, { priority: type === '1000' || type === 'deep_all' ? 8 : 6 });
  res.json({ result: 'ok', taskId });
});

// task queue admin
app.get('/api/admin/tasks', auth.requireAdmin, (req, res) => res.json({ result: 'ok', data: queue.list() }));
app.post('/api/admin/tasks/:id/cancel', auth.requireAdmin, (req, res) => {
  res.json({ result: 'ok', cancelled: queue.cancel(req.params.id) });
});

// sources management + health
app.get('/api/admin/sources', auth.requireAdmin, (req, res) => res.json({ result: 'ok', data: sources.all() }));
app.post('/api/admin/sources/:id/config', auth.requireAdmin, (req, res) => {
  const s = db.get('sources', req.params.id);
  if (!s) return res.status(404).json({ error: 'المصدر غير موجود' });
  const { enabled, priority } = req.body || {};
  const patch = {};
  if (typeof enabled === 'boolean') patch.enabled = enabled;
  if (priority && priority > 0) patch.priority = priority;
  res.json({ result: 'ok', data: db.update('sources', s.id, patch) });
});
app.post('/api/admin/sources/check', auth.requireAdmin, async (req, res) => {
  const results = await sources.checkAll();
  res.json({ result: 'ok', data: results });
});

// ads & access config
app.get('/api/admin/config', auth.requireAdmin, (req, res) => res.json({ result: 'ok', data: getConfig() }));
app.post('/api/admin/config', auth.requireAdmin, (req, res) => {
  const cfg = updateConfig(req.body || {});
  res.json({ result: 'ok', data: cfg });
});

// automated APK builder (uses local Android toolchain)
app.post('/api/admin/build', auth.requireAdmin, (req, res) => {
  const taskId = queue.enqueue('apk_build', async (progress) => {
    const androidDir = path.join(__dirname, '..', 'android');
    const gradleBin = path.join(__dirname, '..', 'tools', 'gradle-dist', 'gradle-8.13', 'bin', 'gradle');
    const sdkDir = path.join(__dirname, '..', 'tools', 'android-sdk');
    const logFile = path.join(BUILD_DIR, `build-${Date.now()}.log`);
    progress(5, 'بدء البناء...');
    await new Promise((resolve, reject) => {
      const child = exec(
        `"${gradleBin}" :app:assembleRelease --no-daemon --console=plain`,
        { cwd: androidDir, env: { ...process.env, ANDROID_HOME: sdkDir, PATH: process.env.PATH } },
        (err, stdout, stderr) => {
          fs.appendFileSync(logFile, '\n' + (stdout || '') + '\n' + (stderr || ''));
          if (err) reject(new Error((stderr || stdout || '').split('\n').filter((l) => /error/i.test(l)).slice(-3).join(' | ') || err.message));
          else resolve();
        }
      );
      child.stdout.on('data', (d) => {
        fs.appendFileSync(logFile, d);
        const txt = d.toString();
        if (/BUILD SUCCESSFUL/.test(txt)) progress(95, 'اكتمل البناء، نسخ الناتج');
      });
      child.stderr.on('data', (d) => fs.appendFileSync(logFile, d));
    });
    const apk = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
    if (!fs.existsSync(apk)) throw new Error('لم يُنتَج ملف APK');
    const outName = `MeloVerse-${Date.now()}.apk`;
    fs.copyFileSync(apk, path.join(BUILD_DIR, outName));
    progress(100, 'تم البناء');
    return { artifact: `/builds/${outName}`, log: path.basename(logFile) };
  }, { priority: 10 });
  res.json({ result: 'ok', taskId });
});
app.get('/api/admin/builds', auth.requireAdmin, (req, res) => {
  const tasks = queue.list().filter((t) => t.name === 'apk_build');
  const artifacts = fs.readdirSync(BUILD_DIR).filter((f) => f.endsWith('.apk')).map((f) => ({
    name: f,
    url: `/builds/${f}`,
    size: Math.round(fs.statSync(path.join(BUILD_DIR, f)).size / 1048576 * 10) / 10 + ' MB',
  }));
  res.json({ result: 'ok', tasks, artifacts });
});
app.get('/api/admin/builds/:name/log', auth.requireAdmin, (req, res) => {
  const f = path.join(BUILD_DIR, req.params.name);
  if (!fs.existsSync(f)) return res.status(404).json({ error: 'log not found' });
  res.type('text/plain').send(fs.readFileSync(f, 'utf8').slice(-20000));
});
app.post('/api/admin/sync/work', auth.requireAdmin, async (req, res) => {
  const { source, sourceId } = req.body || {};
  if (!source || !sourceId) return res.status(400).json({ error: 'source و sourceId مطلوبان' });
  try {
    const work = await engine.syncWork(source, sourceId, { deep: true });
    res.json({ result: 'ok', work: work && { id: work.id, title: work.title_en, source: work.source, chapters: work.chapters_added } });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});
app.post('/api/admin/sync/pull', auth.requireAdmin, async (req, res) => {
  const { workId, chapterId } = req.body || {};
  if (!workId || !chapterId) return res.status(400).json({ error: 'workId و chapterId مطلوبان' });
  try {
    const out = await engine.pullChapter(workId, chapterId);
    res.json({ result: 'ok', ...out });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});
// ---------- catalog search (advanced filters over the local index) ----------
app.get('/api/catalog/search', (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  const status = req.query.status || '';
  const type = req.query.type || '';
  const source = req.query.source || '';
  const minRating = parseFloat(req.query.minRating || '0') || 0;
  const sort = req.query.sort || 'rating';
  let rows = db.all('works');
  if (q) {
    rows = rows.filter((w) =>
      [w.title_en, w.title_ar, ...(w.alt_titles || [])].filter(Boolean).some((t) => t.toLowerCase().includes(q))
    );
  }
  if (status) rows = rows.filter((w) => w.status === status);
  if (type) {
    const t = type.toLowerCase();
    rows = rows.filter((w) => {
      if ((w.content_type || '').toLowerCase().includes(t)) return true;
      const lang = (w.original_language || '').toLowerCase();
      if (t === 'manga' && lang === 'ja') return true;
      if (t === 'manhwa' && lang === 'ko') return true;
      if (t === 'manhua' && ['zh', 'zh-hk', 'zh-hans', 'zh-hant'].includes(lang)) return true;
      return false;
    });
  }
  if (source) rows = rows.filter((w) => w.source === source);
  if (minRating) rows = rows.filter((w) => (w.rating || 0) >= minRating);
  rows.sort((a, b) => {
    if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sort === 'title') return (a.title_en || '').localeCompare(b.title_en || '');
    return (b.last_synced || '').localeCompare(a.last_synced || '');
  });
  const chapterCounts = {};
  for (const c of db.all('chapters')) chapterCounts[c.work_id] = (chapterCounts[c.work_id] || 0) + 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 60, 200);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
  res.json({
    result: 'ok',
    data: rows.slice(offset, offset + limit).map((w) => ({
      id: w.source_id,
      source: w.source,
      title: w.title_en || w.title_ar,
      alt: w.title_ar,
      cover: w.cover_url,
      rating: w.rating,
      status: w.status,
      type: w.content_type,
      chapters: chapterCounts[w.id] || 0,
      synced_at: w.last_synced,
    })),
    total: rows.length,
  });
});

// ratings map for grid cards: GET /api/catalog/by-ids?ids=a,b,c
app.get('/api/catalog/by-ids', (req, res) => {
  const ids = new Set(String(req.query.ids || '').split(',').filter(Boolean));
  if (!ids.size) return res.json({ result: 'ok', data: {} });
  const works = db.all('works').filter((w) => ids.has(w.source_id));
  const chapters = db.all('chapters');
  const countByWork = {};
  for (const c of chapters) countByWork[c.work_id] = (countByWork[c.work_id] || 0) + 1;
  const out = {};
  for (const w of works) {
    out[w.source_id] = { rating: w.rating || null, ratingCount: w.rating_count || null, chapters: countByWork[w.id] || 0 };
  }
  res.json({ result: 'ok', data: out });
});

// ---------- latest synced chapters (home feed) ----------
app.get('/api/catalog/latest-chapters', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 12, 30);
  const chapters = db
    .all('chapters')
    .filter((c) => c.published_at)
    .sort((a, b) => (a.published_at < b.published_at ? 1 : -1))
    .slice(0, limit * 2);
  const works = db.all('works');
  const data = [];
  const seenWorks = new Set();
  for (const c of chapters) {
    const w = works.find((x) => x.id === c.work_id);
    if (!w || seenWorks.has(w.id)) continue;
    seenWorks.add(w.id);
    data.push({
      mangaId: w.source_id,
      title: w.title_en || w.title_ar,
      cover: w.cover_url,
      chapterNumber: c.number,
      chapterId: c.source_chapter_id,
      publishedAt: c.published_at,
      type: w.content_type,
    });
    if (data.length >= limit) break;
  }
  res.json({ result: 'ok', data });
});

// ---------- stable APK link + update check ----------
function newestApk() {
  const dir = path.join(__dirname, 'builds');
  if (!fs.existsSync(dir)) return null;
  const apks = fs.readdirSync(dir).filter((f) => f.endsWith('.apk'));
  if (!apks.length) return null;
  apks.sort((a, b) => fs.statSync(path.join(dir, b)).mtimeMs - fs.statSync(path.join(dir, a)).mtimeMs);
  return apks[0];
}
app.get('/builds/latest.apk', (req, res) => {
  const latest = newestApk();
  if (!latest) return res.status(404).json({ error: 'no apk yet' });
  res.redirect('/builds/' + latest);
});
app.get('/api/update/latest', (req, res) => {
  const latest = newestApk();
  res.json({
    result: 'ok',
    versionCode: 8,
    versionName: "0.7.0",
    url: '/builds/latest.apk',
    size: latest ? Math.round(fs.statSync(path.join(__dirname, 'builds', latest)).size / 1048576 * 10) / 10 : null,
    notes: 'أحدث نسخة MeloVerse',
  });
});

// in-server orphan chapters cleanup
app.post('/api/admin/cleanup', auth.requireAdmin, (req, res) => {
  const works = new Set(db.all('works').map((w) => w.id));
  const chapters = db.all('chapters');
  let removed = 0;
  for (const c of chapters) {
    if (!works.has(c.work_id)) { db.remove('chapters', c.id); removed++; }
  }
  res.json({ result: 'ok', removed, remaining: db.all('chapters').length });
});

// ---------- user profile ----------
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads', 'avatars');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.post('/api/profile/avatar', auth.requireAuth, (req, res) => {
  const dataUrl = (req.body || {}).dataUrl || '';
  const m = dataUrl.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/);
  if (!m) return res.status(400).json({ error: 'صورة غير صالحة (PNG/JPG/WebP)' });
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
  const file = path.join(UPLOADS_DIR, `${req.user.id}.${ext}`);
  fs.writeFileSync(file, Buffer.from(m[2], 'base64'));
  const avatar = `/uploads/avatars/${req.user.id}.${ext}`;
  db.update('users', req.user.id, { avatar });
  res.json({ result: 'ok', avatar });
});
app.post('/api/profile', auth.requireAuth, (req, res) => {
  const { username, currentPassword, newPassword } = req.body || {};
  const out = {};
  if (username && username !== req.user.username) {
    if (!/^[a-zA-Z0-9_\u0600-\u06FF]{3,20}$/.test(username)) return res.status(400).json({ error: 'اسم مستخدم غير صالح' });
    if (db.find('users', (u) => u.username.toLowerCase() === username.toLowerCase())) return res.status(400).json({ error: 'الاسم مستخدم مسبقًا' });
    db.update('users', req.user.id, { username });
    out.username = username;
  }
  if (newPassword) {
    const { hashPassword } = require('./auth');
    if (hashPassword(currentPassword || '', req.user.salt) !== req.user.pass_hash) {
      return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
    }
    if (newPassword.length < 6) return res.status(400).json({ error: 'كلمة المرور الجديدة 6 أحرف على الأقل' });
    const salt = crypto.randomBytes(16).toString('hex');
    db.update('users', req.user.id, { salt, pass_hash: hashPassword(newPassword, salt) });
    out.passwordChanged = true;
  }
  res.json({ result: 'ok', ...out });
});

app.get('/api/admin/catalog', auth.requireAdmin, (req, res) => {
  const works = db.all('works').sort((a, b) => (a.last_synced < b.last_synced ? 1 : -1)).slice(0, 50);
  res.json({ result: 'ok', data: works.map((w) => ({ id: w.id, source: w.source, title: w.title_en, rating: w.rating, last_synced: w.last_synced })) });
});

if (require.main === module) {
  auth.ensureAdmin();
  app.listen(PORT, () => {
    console.log(`MeloVerse web running on http://localhost:${PORT}`);
    queue.start();
    require('./scheduler').start();
    sources.start();
  });
}

module.exports = { fetchMD, app, db };

/**
 * sources.js — source registry with health monitoring (latency, status) & priority.
 * Status: healthy | degraded | down | unknown
 */
'use strict';
const db = require('./db');
const { fetchJSON, UA } = require('./sync/adapters');

const DEFAULTS = [
  { id: 'mangadex', name: 'MangaDex', kind: 'api', enabled: true, priority: 1, baseUrl: 'https://api.mangadex.org', check: '/ping' },
  { id: 'anilist', name: 'AniList', kind: 'api', enabled: true, priority: 2, baseUrl: 'https://graphql.anilist.co', check: null },
  { id: 'comick', name: 'Comick', kind: 'api', enabled: true, priority: 3, baseUrl: 'https://comick.dev', check: '/' },
  { id: 'mangaupdates', name: 'MangaUpdates', kind: 'api', enabled: false, priority: 4, baseUrl: 'https://api.mangaupdates.com', check: '/v1/series/search' },
  { id: 'consumet', name: 'Consumet', kind: 'api', enabled: false, priority: 5, baseUrl: 'https://api.consumet.org', check: '/meta/anilist/trending' },
  { id: 'batoto', name: 'Bato.to', kind: 'mirror', enabled: false, priority: 6, baseUrl: 'https://bato.to', check: '/' },
  { id: 'mangabuddy', name: 'MangaBuddy', kind: 'mirror', enabled: false, priority: 7, baseUrl: 'https://mangabuddy.com', check: '/' },
  { id: 'mangapill', name: 'MangaPill', kind: 'mirror', enabled: false, priority: 8, baseUrl: 'https://mangapill.com', check: '/' },
];

function seed() {
  for (const s of DEFAULTS) {
    if (!db.find('sources', (x) => x.id === s.id)) {
      db.insert('sources', { ...s, latency: null, status: 'unknown', lastCheck: null });
    }
  }
}

function all() {
  return db
    .all('sources')
    .sort((a, b) => (a.priority || 99) - (b.priority || 99));
}

function enabledApiSources() {
  return all().filter((s) => s.enabled && s.status !== 'down' && s.kind === 'api');
}

async function checkOne(src) {
  const t0 = Date.now();
  let latency = null;
  let status = 'down';
  try {
    const url = src.check ? src.baseUrl + src.check : src.baseUrl;
    // reachability = any HTTP response (health, not content validation)
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      await fetch(url, {
        method: src.id === 'anilist' ? 'POST' : 'GET',
        signal: ctrl.signal,
        headers: { 'User-Agent': UA },
      });
    } finally {
      clearTimeout(timer);
    }
    latency = Date.now() - t0;
    status = latency < 1500 ? 'healthy' : latency < 5000 ? 'degraded' : 'down';
  } catch {
    latency = Date.now() - t0;
    status = 'down';
  }
  db.update('sources', src.id, { latency, status, lastCheck: new Date().toISOString() });
  return { id: src.id, latency, status };
}

async function checkAll() {
  const results = [];
  for (const s of all()) {
    if (!s.enabled) continue;
    results.push(await checkOne(s));
    await new Promise((r) => setTimeout(r, 400));
  }
  return results;
}

let timer = null;
function start(intervalMs = 60000) {
  seed();
  if (timer) clearInterval(timer);
  checkAll().catch(() => {});
  timer = setInterval(() => checkAll().catch(() => {}), intervalMs);
  console.log('[sources] health monitor started (every 60s)');
}

module.exports = { seed, all, checkOne, checkAll, start, enabledApiSources };

/**
 * mdlib.js — shared MangaDex fetch helper with in-memory cache.
 * Lives outside server.js to avoid circular requires with the sync engine.
 */
'use strict';

const UA = 'MeloVerse/1.0 (web; +https://meloverse.app)';
const CACHE_TTL = {
  trending: 10 * 60 * 1000,
  search: 10 * 60 * 1000,
  manga: 10 * 60 * 1000,
  feed: 5 * 60 * 1000,
  chapter: 10 * 60 * 1000,
};
const cache = new Map(); // key -> {expires, data}

async function fetchMD(pathname, query = {}) {
  const url = new URL('https://api.mangadex.org' + pathname);
  for (const [k, v] of Object.entries(query)) {
    if (Array.isArray(v)) v.forEach((x) => url.searchParams.append(k, x));
    else if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'application/json' },
        signal: ctrl.signal,
      });
      if (!res.ok) {
        if ((res.status === 429 || res.status >= 500) && attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 1500 * attempt));
          continue;
        }
        throw new Error(`MangaDex ${res.status} for ${pathname}`);
      }
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(`MangaDex failed for ${pathname}`);
}

function cached(key, ttl, fn) {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.data;
  return Promise.resolve(fn()).then((data) => {
    cache.set(key, { expires: Date.now() + ttl, data });
    if (cache.size > 500) {
      cache.delete(cache.keys().next().value);
    }
    return data;
  });
}

module.exports = { fetchMD, cached, CACHE_TTL, UA };

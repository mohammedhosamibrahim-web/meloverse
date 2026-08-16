/**
 * db.js — persistent JSON store (atomic writes, in-memory cache).
 * Tables: users, comments, works, chapters, blocked, jobs, meta
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const cache = new Map(); // table -> array of rows
const timers = new Map();

function fileOf(table) {
  return path.join(DATA_DIR, `${table}.json`);
}

function load(table) {
  if (cache.has(table)) return cache.get(table);
  let rows = [];
  try {
    rows = JSON.parse(fs.readFileSync(fileOf(table), 'utf8'));
  } catch {
    rows = [];
  }
  cache.set(table, rows);
  return rows;
}

function persist(table) {
  const rows = load(table);
  const tmp = fileOf(table) + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(rows, null, 2));
  fs.renameSync(tmp, fileOf(table));
}

function backup() {
  try {
    const bak = path.join(DATA_DIR, 'backups');
    fs.mkdirSync(bak, { recursive: true });
    for (const t of ['works', 'chapters', 'users', 'comments', 'blocked', 'jobs']) {
      if (fs.existsSync(fileOf(t))) {
        fs.copyFileSync(fileOf(t), path.join(bak, `${t}.json`));
      }
    }
    console.log('[db] backup written');
  } catch (e) {
    console.error('[db] backup failed:', e.message);
  }
}

backup(); // on boot
setInterval(backup, 6 * 3600000); // every 6h

function scheduleSave(table) {
  clearTimeout(timers.get(table));
  timers.set(
    table,
    setTimeout(() => {
      try {
        persist(table);
      } catch (e) {
        console.error(`[db] save ${table} failed:`, e.message);
      }
    }, 300)
  );
}

const db = {
  all(table) {
    return load(table);
  },
  get(table, id) {
    return load(table).find((r) => r.id === id) || null;
  },
  find(table, pred) {
    return load(table).find(pred) || null;
  },
  filter(table, pred) {
    return load(table).filter(pred);
  },
  insert(table, row) {
    if (!row.id) row.id = crypto.randomUUID();
    if (row.created_at === undefined) row.created_at = new Date().toISOString();
    load(table).push(row);
    scheduleSave(table);
    return row;
  },
  update(table, id, patch) {
    const rows = load(table);
    const idx = rows.findIndex((r) => r.id === id);
    if (idx < 0) return null;
    rows[idx] = { ...rows[idx], ...patch };
    scheduleSave(table);
    return rows[idx];
  },
  remove(table, id) {
    const rows = load(table);
    const idx = rows.findIndex((r) => r.id === id);
    if (idx < 0) return false;
    rows.splice(idx, 1);
    scheduleSave(table);
    return true;
  },
  upsert(table, keyField, row) {
    const rows = load(table);
    const idx = rows.findIndex((r) => r[keyField] === row[keyField]);
    if (idx >= 0) {
      rows[idx] = { ...rows[idx], ...row };
      scheduleSave(table);
      return rows[idx];
    }
    return db.insert(table, row);
  },
  flush() {
    for (const t of cache.keys()) {
      clearTimeout(timers.get(t));
      try {
        persist(t);
      } catch {}
    }
  },
};

// server secret (persisted)
if (!db.get('meta', 'secret')) {
  db.insert('meta', { id: 'secret', value: crypto.randomBytes(32).toString('hex') });
}

module.exports = db;

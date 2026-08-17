/**
 * queue.js — background task queue (Celery-like, no Redis).
 * Heavy jobs (sync, builds) run on a small worker pool so the API stays snappy.
 */
'use strict';
const db = require('./db');

const CONCURRENCY = 1; // serialize heavy sync jobs to respect upstream rate limits
const queue = []; // in-memory {id, fn}
let running = 0;
let started = false;

function list() {
  return db
    .all('tasks')
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 100);
}

function get(id) {
  return db.get('tasks', id);
}

function enqueue(name, fn, opts = {}) {
  const row = db.insert('tasks', {
    name,
    status: 'queued',
    priority: opts.priority || 5,
    progress: 0,
    message: '',
    error: null,
    result: null,
    attempts: 0,
    startedAt: null,
    finishedAt: null,
  });
  queue.push({ id: row.id, fn });
  pump();
  return row.id;
}

function cancel(id) {
  const idx = queue.findIndex((j) => j.id === id);
  if (idx >= 0) {
    queue.splice(idx, 1);
    const t = db.get('tasks', id);
    if (t && t.status === 'queued') db.update('tasks', id, { status: 'cancelled', finishedAt: new Date().toISOString() });
    return true;
  }
  return false;
}

function pump() {
  if (!started) return;
  while (running < CONCURRENCY && queue.length) {
    queue.sort((a, b) => {
      const ta = db.get('tasks', a.id);
      const tb = db.get('tasks', b.id);
      const pa = ta ? ta.priority : 5;
      const pb = tb ? tb.priority : 5;
      if (pa !== pb) return pb - pa;
      return (ta && tb) ? (ta.created_at < tb.created_at ? -1 : 1) : 0;
    });
    const job = queue.shift();
    running++;
    const startedAt = new Date().toISOString();
    db.update('tasks', job.id, { status: 'running', startedAt });
    (async () => {
      try {
        const progress = (p, message) => {
          const t = db.get('tasks', job.id);
          if (t) db.update('tasks', job.id, { progress: Math.max(t.progress || 0, p), message: message || t.message });
        };
        const result = await job.fn(progress);
        const t = db.get('tasks', job.id);
        db.update('tasks', job.id, {
          status: 'done',
          result: JSON.stringify(result || {}).slice(0, 2000),
          progress: 100,
          finishedAt: new Date().toISOString(),
        });
      } catch (e) {
        const t = db.get('tasks', job.id);
        db.update('tasks', job.id, {
          status: 'failed',
          error: String(e.message || e).slice(0, 500),
          finishedAt: new Date().toISOString(),
          attempts: (t ? t.attempts || 0 : 0) + 1,
        });
        console.error('[queue] task failed:', job.id, e.message);
      } finally {
        running--;
        pump();
      }
    })();
  }
}

function start() {
  if (started) return;
  started = true;
  // mark orphaned tasks from a previous run
  for (const t of db.all('tasks')) {
    if (t.status === 'running' || t.status === 'queued') {
      db.update('tasks', t.id, { status: 'failed', error: 'interrupted by restart', finishedAt: new Date().toISOString() });
    }
  }
  pump();
  console.log(`[queue] started (${CONCURRENCY} workers)`);
}

module.exports = { enqueue, list, get, cancel, start };

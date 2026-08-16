/**
 * scheduler.js — flexible sync jobs: daily bulk, ongoing (30 min), popular, full
 */
'use strict';
const db = require('./db');
const engine = require('./sync/engine');

const JOBS = [
  { id: 'daily_bulk', enabled: true, intervalMinutes: 1440, quota: 75, lastRun: null, nextRun: Date.now() + 2 * 60000, running: false },
  { id: 'ongoing', enabled: true, intervalMinutes: 30, lastRun: null, nextRun: Date.now() + 60000, running: false },
  { id: 'popular', enabled: true, intervalMinutes: 360, lastRun: null, nextRun: Date.now() + 10 * 60000, running: false },
  { id: 'full', enabled: false, intervalMinutes: 10080, lastRun: null, nextRun: Date.now() + 24 * 3600000, running: false },
];

function seedJobs() {
  for (const j of JOBS) {
    if (!db.find('jobs', (x) => x.id === j.id)) db.insert('jobs', j);
  }
}

const RUNNERS = {
  daily_bulk: (job) => engine.dailyBulk({ quota: job.quota || 75 }),
  ongoing: () => engine.ongoingTracking(),
  popular: () => engine.popularSync(),
  full: (job) => engine.fullCatalog({ cap: (job.quota || 500) * 10 }),
};

let tickTimer = null;

function tick() {
  const now = Date.now();
  for (const job of db.all('jobs')) {
    if (!job.enabled || job.running) continue;
    if (job.nextRun && now < job.nextRun) continue;
    const runner = RUNNERS[job.id];
    if (!runner) continue;
    db.update('jobs', job.id, { running: true, lastRun: new Date().toISOString(), lastError: null });
    runner(job)
      .then((result) => {
        const next = now + (job.intervalMinutes || 1440) * 60000;
        db.update('jobs', job.id, { running: false, nextRun: next, lastResult: JSON.stringify(result) });
        console.log(`[scheduler] ${job.id} OK:`, result);
      })
      .catch((e) => {
        const next = now + 15 * 60000; // retry in 15 min on failure
        db.update('jobs', job.id, { running: false, nextRun: next, lastError: e.message });
        console.error(`[scheduler] ${job.id} FAILED:`, e.message);
      });
  }
}

function start() {
  seedJobs();
  if (tickTimer) clearInterval(tickTimer);
  tick(); // immediate pass
  tickTimer = setInterval(tick, 30000);
  console.log('[scheduler] started — jobs:', db.all('jobs').map((j) => `${j.id}(${j.enabled ? j.intervalMinutes + 'm' : 'off'})`).join(', '));
}

module.exports = { start, tick };

/**
 * admin.js — moderation: delete comments, ban users, block content (manga/chapter)
 */
'use strict';
const express = require('express');
const db = require('./db');
const auth = require('./auth');

const router = express.Router();

router.get('/stats', auth.requireAdmin, (req, res) => {
  res.json({
    result: 'ok',
    data: {
      users: db.all('users').length,
      comments: db.all('comments').length,
      reportedComments: db.filter('comments', (c) => c.reported && c.status !== 'deleted').length,
      works: db.all('works').length,
      chapters: db.all('chapters').length,
      blocked: db.all('blocked').length,
    },
  });
});

// ---- comments moderation ----
router.get('/comments', auth.requireAdmin, (req, res) => {
  const onlyReported = req.query.filter === 'reported';
  let rows = db.all('comments');
  if (onlyReported) rows = rows.filter((c) => c.reported);
  rows = rows
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map((c) => {
      const u = db.get('users', c.userId);
      return {
        id: c.id,
        targetType: c.targetType,
        targetId: c.targetId,
        body: c.status === 'deleted' ? '(محذوف)' : c.body,
        username: u ? u.username : '—',
        created_at: c.created_at,
        reported: !!c.reported,
        status: c.status,
      };
    });
  res.json({ result: 'ok', data: rows });
});

router.post('/comments/:id/delete', auth.requireAdmin, (req, res) => {
  const c = db.get('comments', req.params.id);
  if (!c) return res.status(404).json({ error: 'التعليق غير موجود' });
  db.update('comments', c.id, { status: 'deleted' });
  res.json({ result: 'ok' });
});

// ---- users ----
router.get('/users', auth.requireAdmin, (req, res) => {
  const rows = db
    .all('users')
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map((u) => ({
      id: u.id,
      username: u.username,
      role: u.role,
      banned: !!u.banned,
      created_at: u.created_at,
    }));
  res.json({ result: 'ok', data: rows });
});

router.post('/users/:id/ban', auth.requireAdmin, (req, res) => {
  const u = db.get('users', req.params.id);
  if (!u) return res.status(404).json({ error: 'المستخدم غير موجود' });
  if (u.role === 'admin') return res.status(400).json({ error: 'لا يمكن حظر مشرف' });
  const banned = req.body && req.body.banned !== undefined ? !!req.body.banned : true;
  db.update('users', u.id, { banned: banned ? 1 : 0 });
  res.json({ result: 'ok', banned });
});

// ---- content blocking (hide manga/chapter everywhere) ----
router.post('/content/block', auth.requireAdmin, (req, res) => {
  const { targetType, targetId, reason } = req.body || {};
  if (!['manga', 'chapter', 'anime'].includes(targetType) || !targetId) {
    return res.status(400).json({ error: 'targetType (manga|chapter|anime) و targetId مطلوبان' });
  }
  if (db.find('blocked', (b) => b.targetType === targetType && b.targetId === targetId)) {
    return res.json({ result: 'ok', already: true });
  }
  db.insert('blocked', {
    targetType,
    targetId,
    reason: String(reason || '').slice(0, 500),
    byUserId: req.user.id,
  });
  res.json({ result: 'ok' });
});

router.post('/content/unblock', auth.requireAdmin, (req, res) => {
  const { targetType, targetId } = req.body || {};
  const b = db.find('blocked', (x) => x.targetType === targetType && x.targetId === targetId);
  if (b) db.remove('blocked', b.id);
  res.json({ result: 'ok' });
});

router.get('/content/blocked', auth.requireAdmin, (req, res) => {
  res.json({ result: 'ok', data: db.all('blocked') });
});

// ---- sync jobs (config + manual trigger) ----
router.get('/jobs', auth.requireAdmin, (req, res) => {
  res.json({ result: 'ok', data: db.all('jobs') });
});

router.post('/jobs/:id/run', auth.requireAdmin, async (req, res) => {
  const job = db.get('jobs', req.params.id);
  if (!job) return res.status(404).json({ error: 'المهمة غير موجودة' });
  const engine = require('./sync/engine');
  const runner = { daily_bulk: engine.dailyBulk, ongoing: engine.ongoingTracking, popular: engine.popularSync, full: engine.fullCatalog }[job.id];
  if (!runner) return res.status(400).json({ error: 'مهمة غير معروفة' });
  res.json({ result: 'ok', message: 'بدأت المهمة' });
  setTimeout(() => runner({ manual: true }).catch((e) => console.error('[job]', job.id, e.message)), 10);
});

router.post('/jobs/:id/config', auth.requireAdmin, (req, res) => {
  const job = db.get('jobs', req.params.id);
  if (!job) return res.status(404).json({ error: 'المهمة غير موجودة' });
  const { enabled, intervalMinutes, quota } = req.body || {};
  const patch = {};
  if (typeof enabled === 'boolean') patch.enabled = enabled;
  if (intervalMinutes && intervalMinutes > 0) patch.intervalMinutes = intervalMinutes;
  if (quota && quota > 0) patch.quota = quota;
  const updated = db.update('jobs', job.id, { ...patch, nextRun: Date.now() + (patch.intervalMinutes || job.intervalMinutes || 1440) * 60000 });
  res.json({ result: 'ok', data: updated });
});

module.exports = router;

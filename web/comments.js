/**
 * comments.js — comments on chapters & works (manga/manhwa/manhua), reports
 */
'use strict';
const express = require('express');
const db = require('./db');
const auth = require('./auth');

const router = express.Router();
const TARGET_TYPES = ['manga', 'chapter'];

// list comments for a target
router.get('/', (req, res) => {
  const type = req.query.type;
  const id = req.query.id || '';
  if (!TARGET_TYPES.includes(type) || !id) {
    return res.status(400).json({ error: 'type (manga|chapter) و id مطلوبان' });
  }
  const rows = db
    .filter('comments', (c) => c.targetType === type && c.targetId === id)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map((c) => {
      const u = db.get('users', c.userId);
      const out = {
        id: c.id,
        targetType: c.targetType,
        targetId: c.targetId,
        body: c.body,
        created_at: c.created_at,
        username: u ? u.username : '—',
        mine: req.user && req.user.id === c.userId,
        canModerate: req.user && req.user.role === 'admin',
        reported: !!c.reported,
        deleted: c.status === 'deleted',
      };
      if (c.status === 'deleted') out.body = '';
      return out;
    });
  res.json({ result: 'ok', data: rows });
});

// add comment (auth required)
router.post('/', auth.requireAuth, (req, res) => {
  const { targetType, targetId, body } = req.body || {};
  if (!TARGET_TYPES.includes(targetType) || !targetId) {
    return res.status(400).json({ error: 'type (manga|chapter) و id مطلوبان' });
  }
  const text = String(body || '').trim();
  if (!text || text.length > 2000) return res.status(400).json({ error: 'نص التعليق 1-2000 حرف' });
  // simple profanity filter
  const bannedWords = ['سيء جدًا', 'spam', 'buy followers'];
  const lowered = text.toLowerCase();
  if (bannedWords.some((w) => lowered.includes(w))) {
    return res.status(400).json({ error: 'التعليق يحتوي كلمات غير مقبولة' });
  }
  const c = db.insert('comments', {
    targetType,
    targetId,
    userId: req.user.id,
    body: text,
    status: 'active',
    reported: 0,
  });
  res.json({ result: 'ok', data: { id: c.id, created_at: c.created_at } });
});

// report a comment
router.post('/:id/report', auth.requireAuth, (req, res) => {
  const c = db.get('comments', req.params.id);
  if (!c) return res.status(404).json({ error: 'التعليق غير موجود' });
  db.update('comments', c.id, { reported: 1 });
  res.json({ result: 'ok' });
});

// delete comment (owner or admin)
router.delete('/:id', auth.requireAuth, (req, res) => {
  const c = db.get('comments', req.params.id);
  if (!c) return res.status(404).json({ error: 'التعليق غير موجود' });
  const isOwner = c.userId === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) return res.status(403).json({ error: 'لا تملك صلاحية الحذف' });
  db.update('comments', c.id, { status: 'deleted' });
  res.json({ result: 'ok' });
});

module.exports = router;

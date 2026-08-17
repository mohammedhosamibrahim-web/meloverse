/**
 * auth.js — registration, login, HMAC session tokens, role & ban checks
 */
'use strict';
const crypto = require('crypto');
const db = require('./db');

const SECRET = db.get('meta', 'secret').value;
const TOKEN_TTL = 30 * 24 * 3600 * 1000; // 30 days

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function publicUser(u) {
  return { id: u.id, username: u.username, role: u.role || 'user', created_at: u.created_at };
}

function createToken(userId) {
  const payload = `${userId}:${Date.now() + TOKEN_TTL}`;
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const [userId, exp] = payload.split(':');
  if (Date.now() > parseInt(exp, 10)) return null;
  return userId;
}

const auth = {
  register(username, password) {
    username = (username || '').trim();
    if (!/^[a-zA-Z0-9_\u0600-\u06FF]{3,20}$/.test(username)) {
      return { error: 'اسم المستخدم: 3-20 حرفًا (أحرف/أرقام/شرطة سفلية)' };
    }
    if (!password || password.length < 6) return { error: 'كلمة المرور 6 أحرف على الأقل' };
    if (db.find('users', (u) => u.username.toLowerCase() === username.toLowerCase())) {
      return { error: 'اسم المستخدم مستخدم مسبقًا' };
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const user = db.insert('users', {
      username,
      salt,
      pass_hash: hashPassword(password, salt),
      role: 'user',
      banned: 0,
    });
    return { user: publicUser(user), token: createToken(user.id) };
  },

  login(username, password) {
    const user = db.find('users', (u) => u.username.toLowerCase() === (username || '').trim().toLowerCase());
    if (!user) return { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    const hash = hashPassword(password || '', user.salt);
    if (hash !== user.pass_hash) return { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    if (user.banned) return { error: 'هذا الحساب محظور' };
    return { user: publicUser(user), token: createToken(user.id) };
  },

  requireAuth(req, res, next) {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const userId = verifyToken(token);
    const user = userId && db.get('users', userId);
    if (!user) return res.status(401).json({ error: 'تسجيل الدخول مطلوب' });
    if (user.banned) return res.status(403).json({ error: 'هذا الحساب محظور' });
    req.user = user;
    next();
  },

  requireAdmin(req, res, next) {
    auth.requireAuth(req, res, () => {
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'صلاحيات المشرف مطلوبة' });
      next();
    });
  },

  verifyToken,
};

function ensureAdmin() {
  if (!db.find('users', (u) => u.role === 'admin')) {
    const salt = crypto.randomBytes(16).toString('hex');
    db.insert('users', {
      username: 'admin',
      salt,
      pass_hash: hashPassword('admin123', salt),
      role: 'admin',
      banned: 0,
    });
    console.log('[auth] seeded admin (admin / admin123) — غيّر كلمة المرور فورًا');
  }
}

auth.ensureAdmin = ensureAdmin;
auth.hashPassword = hashPassword;

module.exports = auth;

// Admin sign-in for moderating dedications.
// The first person to open /admin after storage is connected sets the
// password (so do it right away). It's stored as a salted scrypt hash.
// To reset: delete the key "admin:pass" in the Upstash console.

const crypto = require('crypto');
const store = require('./store');

const SESSION_TTL = 7 * 86400;

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const key = crypto.scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${key}`;
}

function matches(password, stored) {
  const [salt, key] = String(stored).split(':');
  if (!salt || !key) return false;
  const test = crypto.scryptSync(password, salt, 32);
  const want = Buffer.from(key, 'hex');
  return want.length === test.length && crypto.timingSafeEqual(want, test);
}

async function isSetUp() {
  return Boolean(await store.get('admin:pass'));
}

async function newSession() {
  const token = crypto.randomBytes(24).toString('base64url');
  await store.set(`admin:session:${token}`, '1', SESSION_TTL);
  return token;
}

async function setup(password) {
  if (typeof password !== 'string' || password.length < 10) {
    throw Object.assign(new Error('password too short'), { status: 400, code: 'short' });
  }
  const created = await store.run('SET', 'admin:pass', hashPassword(password), 'NX');
  if (created !== 'OK') throw Object.assign(new Error('already set up'), { status: 409, code: 'exists' });
  return newSession();
}

async function login(password, ip) {
  const ipKey = crypto.createHash('sha1').update(String(ip || '')).digest('hex').slice(0, 16);
  if ((await store.incr(`admin:tries:${ipKey}`, 900)) > 10) {
    throw Object.assign(new Error('too many tries'), { status: 429, code: 'rate' });
  }
  const stored = await store.get('admin:pass');
  if (!stored || typeof password !== 'string' || !matches(password, stored)) {
    throw Object.assign(new Error('wrong password'), { status: 401, code: 'wrong' });
  }
  return newSession();
}

async function check(req) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!/^[\w-]{20,64}$/.test(token)) return false;
  return (await store.get(`admin:session:${token}`)) === '1';
}

async function logout(req) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (token) await store.del(`admin:session:${token}`);
}

module.exports = { isSetUp, setup, login, check, logout };

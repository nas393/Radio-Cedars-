// "Who's home?": a person's name and settings, kept under an easy passcode so the
// same person finds their favourites, village, recipes and scores on another phone.
// The passcode is stored only as a salted scrypt hash. Wrong guesses are limited.

const crypto = require('crypto');
const store = require('./store');
const { clean, review } = require('./dedications');

const MAX_DATA = 120 * 1024;
function err(status, code) { const e = new Error(code); e.status = status; e.code = code; return e; }
const userKey = u => 'prof:' + u;

function cleanUser(v) {
  const u = String(v || '').trim().toLowerCase().normalize('NFKC').replace(/\s+/g, '.').slice(0, 24);
  if (!/^[\p{L}\p{N}._-]{3,24}$/u.test(u)) throw err(400, 'user');
  return u;
}
function cleanPin(v) {
  const p = String(v || '').trim();
  if (!/^\d{4,8}$/.test(p)) throw err(400, 'pin');
  return p;
}
const hashPin = (pin, salt) => crypto.scryptSync(pin, salt, 32).toString('base64');
const sha = t => crypto.createHash('sha256').update(t).digest('base64');

async function guard(user, ip) {
  if ((await store.incr('rl:pf:' + user, 3600)) > 12) throw err(429, 'rate');
  if ((await store.incr('rl:pfip:' + ip, 3600)) > 40) throw err(429, 'rate');
}

// Log in (or create the name if it is free). Returns a sync token for this device.
async function login(body, ip) {
  const user = cleanUser(body && body.user);
  const pin = cleanPin(body && body.pin);
  const name = clean(body && body.name, 30) || user;
  if (review({ name, user }).reject) throw err(400, 'user');
  let rec = await store.getJSON(userKey(user));
  let created = false;
  if (!rec) {
    if ((await store.incr('rl:pfnew:' + ip, 3600)) > 10) throw err(429, 'rate');
    if (body && body.mustExist) throw err(404, 'nouser');
    const salt = crypto.randomBytes(12).toString('base64');
    rec = { salt, hash: hashPin(pin, salt), name, data: {}, tokens: [], created: Date.now(), updated: Date.now() };
    created = true;
  } else {
    await guard(user, ip);
    const ok = crypto.timingSafeEqual(Buffer.from(hashPin(pin, rec.salt)), Buffer.from(rec.hash));
    if (!ok) throw err(403, 'pin');
  }
  const token = crypto.randomBytes(18).toString('base64url');
  rec.tokens = [sha(token), ...(rec.tokens || [])].slice(0, 8);
  await store.setJSON(userKey(user), rec);
  return { user, name: rec.name, data: rec.data || {}, token, created, updated: rec.updated };
}

async function save(body) {
  const user = cleanUser(body && body.user);
  const rec = await store.getJSON(userKey(user));
  if (!rec || !body.token || !(rec.tokens || []).includes(sha(String(body.token)))) throw err(403, 'token');
  const data = body.data && typeof body.data === 'object' ? body.data : {};
  if (JSON.stringify(data).length > MAX_DATA) throw err(413, 'big');
  rec.data = data;
  if (body.name) rec.name = clean(body.name, 30) || rec.name;
  rec.updated = Date.now();
  await store.setJSON(userKey(user), rec);
  return { updated: rec.updated };
}

async function forget(body) {
  const user = cleanUser(body && body.user);
  const rec = await store.getJSON(userKey(user));
  if (!rec || !body.token || !(rec.tokens || []).includes(sha(String(body.token)))) throw err(403, 'token');
  rec.tokens = rec.tokens.filter(t => t !== sha(String(body.token)));
  await store.setJSON(userKey(user), rec);
  return { ok: true };
}

module.exports = { login, save, forget, cleanUser, cleanPin, hashPin };

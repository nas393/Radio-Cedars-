// "قعدة سوا": a small private room where family in different countries listen
// to the same thing at the same moment and leave each other a few words.
// Rooms are unlisted (only people with the link can find them) and vanish after 12 hours.

const crypto = require('crypto');
const store = require('./store');
const { clean, review, words, RUDE } = require('./dedications');

const TTL = 12 * 3600;
const PRESENT_MS = 70 * 1000;
const KINDS = new Set(['radio', 'tape', 'live', 'none']);

function err(status, code) { const e = new Error(code); e.status = status; e.code = code; return e; }
const newId = (n = 6) => crypto.randomBytes(n).toString('base64url');
const okId = id => typeof id === 'string' && /^[A-Za-z0-9_-]{6,16}$/.test(id);

function cleanNow(now) {
  const n = now && typeof now === 'object' ? now : {};
  const kind = KINDS.has(n.kind) ? n.kind : 'none';
  return { kind, id: clean(n.id, 80), name: clean(n.name, 80), src: n.src === 'sp' ? 'sp' : 'yt', at: Date.now() };
}
function cleanName(v) {
  const name = clean(v, 24);
  if (!name) throw err(400, 'missing');
  const r = review({ name });
  if (r.reject || r.flagged) throw err(400, 'name');
  return name;
}
async function touch(id) {
  await Promise.all(['q:' + id, 'q:' + id + ':who', 'q:' + id + ':m', 'q:' + id + ':n', 'q:' + id + ':host']
    .map(k => store.run('EXPIRE', k, TTL).catch(() => 0)));
}

async function create(body, ip) {
  if ((await store.incr('rl:q:' + ip, 3600)) > 12) throw err(429, 'rate');
  const name = cleanName(body && body.name);
  const id = newId();
  const host = newId(12);
  await store.setJSON('q:' + id, { v: 1, now: cleanNow(body && body.now), created: Date.now(), hostName: name }, TTL);
  await store.set('q:' + id + ':host', host, TTL);
  await store.hset('q:' + id + ':who', name, String(Date.now()));
  await touch(id);
  return { id, host };
}

async function read(id, since) {
  if (!okId(id)) throw err(404, 'gone');
  const room = await store.getJSON('q:' + id);
  if (!room) throw err(404, 'gone');
  const who = await store.hgetall('q:' + id + ':who');
  const cut = Date.now() - PRESENT_MS;
  const here = Object.entries(who).filter(([, ts]) => Number(ts) > cut).map(([n]) => n);
  const raw = (await store.lrange('q:' + id + ':m', 0, 39)) || [];
  const msgs = raw.map(x => { try { return JSON.parse(x); } catch { return null; } }).filter(m => m && m.n > (Number(since) || 0)).reverse();
  return { v: room.v, now: room.now, host: room.hostName, here, msgs };
}

async function hello(id, body) {
  if (!okId(id) || !(await store.get('q:' + id))) throw err(404, 'gone');
  const name = cleanName(body && body.name);
  await store.hset('q:' + id + ':who', name, String(Date.now()));
  return { ok: true };
}

async function say(id, body, ip) {
  if (!okId(id) || !(await store.get('q:' + id))) throw err(404, 'gone');
  if ((await store.incr('rl:qs:' + ip, 60)) > 15) throw err(429, 'rate');
  const name = cleanName(body && body.name);
  const text = clean(body && body.text, 140);
  if (!text) throw err(400, 'missing');
  const r = review({ text });
  if (r.reject) throw err(400, r.reject);
  if (words(text).some(w => RUDE.includes(w))) throw err(400, 'rude');
  const n = await store.incr('q:' + id + ':n');
  await store.lpush('q:' + id + ':m', JSON.stringify({ n, name, text, at: Date.now() }));
  await store.ltrim('q:' + id + ':m', 0, 59);
  await store.hset('q:' + id + ':who', name, String(Date.now()));
  await touch(id);
  return { n };
}

async function play(id, body) {
  if (!okId(id)) throw err(404, 'gone');
  const host = await store.get('q:' + id + ':host');
  if (!host || !body || body.host !== host) throw err(403, 'host');
  const room = await store.getJSON('q:' + id);
  if (!room) throw err(404, 'gone');
  room.now = cleanNow(body.now);
  room.v = (room.v || 0) + 1;
  await store.setJSON('q:' + id, room, TTL);
  await touch(id);
  return { v: room.v };
}

module.exports = { create, read, hello, say, play };

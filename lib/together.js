// Family rooms ("قعدة سوا"): a private room behind a passcode the creator picks.
// Inside: who is here, what is playing (everyone hears the same thing), a chat with
// written and recorded voice messages (so mama can answer by voice), and a card table.
// Rooms live 30 days after the last activity.

const crypto = require('crypto');
const store = require('./store');
const { clean, review, words, RUDE } = require('./dedications');

const TTL = 30 * 24 * 3600;
const PRESENT_MS = 70 * 1000;
const KINDS = new Set(['radio', 'tape', 'live', 'none']);
const AUDIO_TYPES = new Set(['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/aac', 'audio/x-m4a', 'audio/wav']);
const MAX_AUDIO = 640 * 1024;

function err(status, code) { const e = new Error(code); e.status = status; e.code = code; return e; }
const rnd = (n = 6) => crypto.randomBytes(n).toString('base64url');
const sha = t => crypto.createHash('sha256').update(String(t)).digest('base64url');
const okId = id => typeof id === 'string' && /^[A-Za-z0-9_-]{6,16}$/.test(id);
const K = (id, s = '') => 'q:' + id + (s ? ':' + s : '');
const hashPin = (pin, salt) => crypto.scryptSync(pin, salt, 32).toString('base64');

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
function cleanPin(v) {
  const p = String(v || '').trim();
  if (!/^\d{4,8}$/.test(p)) throw err(400, 'pin');
  return p;
}
async function touch(id) {
  await Promise.all(['', 'who', 'm', 'n', 'tok', 'mv', 'game'].map(s => store.run('EXPIRE', K(id, s), TTL).catch(() => 0)));
}
async function room(id) {
  if (!okId(id)) throw err(404, 'gone');
  const r = await store.getJSON(K(id));
  if (!r) throw err(404, 'gone');
  return r;
}
// who holds this token (the name they joined with), or throw
async function member(id, token) {
  if (!token) throw err(401, 'token');
  const toks = await store.hgetall(K(id, 'tok'));
  const name = toks[sha(token)];
  if (!name) throw err(401, 'token');
  return name;
}
async function newToken(id, name) {
  const token = rnd(18);
  await store.hset(K(id, 'tok'), sha(token), name);
  await store.hset(K(id, 'who'), name, String(Date.now()));
  return token;
}

async function create(body, ip) {
  if ((await store.incr('rl:q:' + ip, 3600)) > 12) throw err(429, 'rate');
  const name = cleanName(body && body.name);
  const pin = cleanPin(body && body.pin);
  const title = clean(body && body.title, 40) || name;
  if (review({ title }).reject) throw err(400, 'title');
  const id = rnd(6);
  const host = rnd(12);
  const salt = rnd(9);
  await store.setJSON(K(id), { v: 1, now: cleanNow(body && body.now), created: Date.now(), hostName: name, title, salt, pin: hashPin(pin, salt), host: sha(host) }, TTL);
  const token = await newToken(id, name);
  await touch(id);
  return { id, host, token, title };
}

async function join(id, body, ip) {
  const r = await room(id);
  if ((await store.incr('rl:qj:' + id + ':' + ip, 600)) > 8) throw err(429, 'rate');
  const pin = cleanPin(body && body.pin);
  if (!crypto.timingSafeEqual(Buffer.from(hashPin(pin, r.salt)), Buffer.from(r.pin))) throw err(403, 'pin');
  const name = cleanName(body && body.name);
  const token = await newToken(id, name);
  await touch(id);
  return { token, title: r.title, host: r.hostName };
}

async function peek(id) {
  const r = await room(id);
  return { title: r.title, host: r.hostName };
}

async function read(id, query) {
  const r = await room(id);
  const name = await member(id, query.token);
  await store.hset(K(id, 'who'), name, String(Date.now()));
  const who = await store.hgetall(K(id, 'who'));
  const cut = Date.now() - PRESENT_MS;
  const here = Object.entries(who).filter(([, ts]) => Number(ts) > cut).map(([n]) => n);
  const since = Number(query.since) || 0;
  const raw = (await store.lrange(K(id, 'm'), 0, 59)) || [];
  const msgs = raw.map(x => { try { return JSON.parse(x); } catch { return null; } }).filter(m => m && m.n > since).reverse();
  const out = { v: r.v, now: r.now, title: r.title, host: r.hostName, here, members: Object.keys(who), msgs };
  const game = await store.getJSON(K(id, 'game'));
  if (game) {
    out.game = { v: game.v, kind: game.kind, state: Number(query.gv) === game.v ? null : game.state };
    if (query.moves !== undefined) {
      const mv = (await store.lrange(K(id, 'mv'), 0, 99)) || [];
      out.moves = mv.map(x => { try { return JSON.parse(x); } catch { return null; } }).filter(m => m && m.i > Number(query.moves)).reverse();
    }
  }
  return out;
}

async function post(id, msg, ip) {
  if ((await store.incr('rl:qs:' + ip, 60)) > 20) throw err(429, 'rate');
  const n = await store.incr(K(id, 'n'));
  const full = { n, at: Date.now(), ...msg };
  await store.lpush(K(id, 'm'), JSON.stringify(full));
  await store.ltrim(K(id, 'm'), 0, 59);
  await touch(id);
  return full;
}

async function say(id, body, ip) {
  await room(id);
  const name = await member(id, body && body.token);
  const text = clean(body && body.text, 240);
  if (!text) throw err(400, 'missing');
  const rv = review({ text });
  if (rv.reject) throw err(400, rv.reject);
  if (words(text).some(w => RUDE.includes(w))) throw err(400, 'rude');
  const song = body.song && typeof body.song === 'object' ? cleanNow(body.song) : null;
  return post(id, { name, text, song: song && song.kind !== 'none' ? song : undefined }, ip);
}

async function voice(id, body, ip) {
  await room(id);
  const name = await member(id, body && body.token);
  if ((await store.incr('rl:qv:' + ip, 3600)) > 40) throw err(429, 'rate');
  const type = String(body.type || '').split(';')[0].trim().toLowerCase();
  if (!AUDIO_TYPES.has(type)) throw err(400, 'type');
  const audio = typeof body.audio === 'string' ? body.audio : '';
  if (!audio || audio.length > MAX_AUDIO || !/^[A-Za-z0-9+/=]+$/.test(audio)) throw err(400, 'audio');
  const aid = rnd(8);
  await store.setJSON(K(id, 'a:' + aid), { type, audio }, TTL);
  const song = body.song && typeof body.song === 'object' ? cleanNow(body.song) : null;
  const text = clean(body.text, 120);
  return post(id, { name, voice: aid, secs: Math.max(0, Math.min(90, Number(body.seconds) || 0)), text: text || undefined, song: song && song.kind !== 'none' ? song : undefined }, ip);
}

async function audio(id, aid, token) {
  await room(id);
  await member(id, token);
  if (!/^[A-Za-z0-9_-]{6,16}$/.test(aid)) throw err(404, 'gone');
  const a = await store.getJSON(K(id, 'a:' + aid));
  if (!a) throw err(404, 'gone');
  return a;
}

async function play(id, body) {
  const r = await room(id);
  await member(id, body && body.token);
  r.now = cleanNow(body.now);
  r.v = (r.v || 0) + 1;
  await store.setJSON(K(id), r, TTL);
  await touch(id);
  return { v: r.v };
}

// ---- the card table: the player who starts a game keeps the full state; others send moves
async function gameSet(id, body) {
  await room(id);
  const name = await member(id, body && body.token);
  const s = JSON.stringify(body.state || {});
  if (s.length > 40000) throw err(413, 'big');
  const cur = await store.getJSON(K(id, 'game'));
  if (cur && cur.hostTok !== sha(body.token) && !body.takeOver) throw err(409, 'busy');
  const v = (cur && cur.kind === body.kind && !body.fresh ? cur.v : 0) + 1;
  await store.setJSON(K(id, 'game'), { v, kind: clean(body.kind, 12), state: body.state, host: name, hostTok: sha(body.token) }, TTL);
  if (body.fresh) await store.del(K(id, 'mv'));
  return { v };
}
async function gameMove(id, body) {
  await room(id);
  const name = await member(id, body && body.token);
  const i = await store.incr(K(id, 'mvn'));
  await store.lpush(K(id, 'mv'), JSON.stringify({ i, name, move: body.move, at: Date.now() }));
  await store.ltrim(K(id, 'mv'), 0, 99);
  return { i };
}
async function gameEnd(id, body) {
  await room(id);
  await member(id, body && body.token);
  await store.del(K(id, 'game'));
  await store.del(K(id, 'mv'));
  return { ok: true };
}

module.exports = { create, join, peek, read, say, voice, audio, play, gameSet, gameMove, gameEnd };

// Family rooms ("قعدة سوا"): a private room behind a passcode the creator picks.
// Inside: who is here, what is playing (everyone hears the same thing), a chat with
// written and recorded voice messages (so mama can answer by voice), and a card table.
// Rooms live 30 days after the last activity.

const crypto = require('crypto');
const store = require('./store');
const alerts = require('./alerts');
const { clean, review, words, RUDE } = require('./dedications');

const TTL = 30 * 24 * 3600;
const PRESENT_MS = 70 * 1000;
const KINDS = new Set(['radio', 'tape', 'live', 'none']);
const AUDIO_TYPES = new Set(['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/aac', 'audio/x-m4a', 'audio/wav']);
const MAX_AUDIO = 640 * 1024;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/webp', 'image/png']);
const MAX_IMAGE = 700 * 1024;
const KEEP = 150;                      // messages kept in a room
const EMOJI = new Set(['❤️', '😂', '👍', '😮', '😢', '🙏', '🔥', '🌲']);
const GAMES = new Set(['tawleh', 'tarneeb', 'likha', 'trivia']);

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
  await Promise.all(['', 'who', 'm', 'n', 'tok', 'mv', 'game', 'rx', 'ty', 'sc', 'bd', 'push', 'del', 'rd', 'ev', 'pl'].map(s => store.run('EXPIRE', K(id, s), TTL).catch(() => 0)));
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
  const lite = since >= 999999999;      // a game asking: no chat needed (saves the small database)
  const raw = lite ? [] : (await store.lrange(K(id, 'm'), 0, since ? 39 : KEEP - 1)) || [];
  const msgs = raw.map(x => { try { return JSON.parse(x); } catch { return null; } }).filter(m => m && m.n > since).reverse();
  const out = { v: r.v, now: r.now, title: r.title, host: r.hostName, here, members: Object.keys(who), msgs, me: name };
  // reactions (only when they changed), who is typing, birthdays
  const rxv = lite ? 0 : Number(await store.get(K(id, 'rxv'))) || 0;
  out.rxv = rxv;
  if (!lite && Number(query.rxv) !== rxv) {
    const rx = await store.hgetall(K(id, 'rx'));
    out.rx = {};
    for (const [n, v] of Object.entries(rx)) { try { out.rx[n] = JSON.parse(v); } catch { /* skip */ } }
    out.del = Object.keys(await store.hgetall(K(id, 'del'))).map(Number);
  }
  // the chat drawer is open: who is typing, and who has seen what
  if (query.chat !== undefined) {
    const ty = await store.hgetall(K(id, 'ty'));
    out.typing = Object.entries(ty).filter(([n, ts]) => n !== name && Number(ts) > Date.now() - 6000).map(([n]) => n);
    const seen = Math.floor(Number(query.seen) || 0);
    const rd = await store.hgetall(K(id, 'rd'));
    if (seen > (Number(rd[name]) || 0)) { await store.hset(K(id, 'rd'), name, String(seen)); rd[name] = String(seen); }
    out.rd = Object.fromEntries(Object.entries(rd).map(([n, v]) => [n, Number(v) || 0]));
  }
  if (query.ev !== undefined) {
    const ev = await store.hgetall(K(id, 'ev'));
    out.events = Object.values(ev).map(v => { try { return JSON.parse(v); } catch { return null; } }).filter(Boolean);
    const pl = await store.lrange(K(id, 'pl'), 0, 49);
    out.playlist = (pl || []).map(v => { try { return JSON.parse(v); } catch { return null; } }).filter(Boolean);
  }
  if (query.bd !== undefined) out.bdays = await store.hgetall(K(id, 'bd'));
  const game = query.nogame !== undefined ? null : await store.getJSON(K(id, 'game'));
  if (game) {
    out.game = { v: game.v, kind: game.kind, host: game.host, at: game.at || 0, state: Number(query.gv) === game.v ? null : game.state };
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
  await store.ltrim(K(id, 'm'), 0, KEEP - 1);
  await touch(id);
  // tell the others whose app is closed (at most a few seconds' wait, never blocking the message)
  await Promise.race([notify(id, full).catch(() => 0), new Promise(r => setTimeout(r, 3500))]);
  return full;
}

// ---- notifications for people whose app is closed
const PN = {
  ar: { game: (n, g) => `🎲 ${n} فتح ${{ tawleh: 'طاولة', tarneeb: 'طرنيب', likha: 'ليخة', trivia: 'سهرة أسئلة' }[g] || g}، تعا العب!`, event: w => `🎉 اليوم: ${w}`, voice: '🎙️ رسالة بالصوت', photo: '📷 صورة', knock: '🔔 دقّ الجرس!', bday: w => `🎂 اليوم عيد ميلاد ${w}!`, nameday: w => `🕯️ اليوم عيد ${w}` },
  en: { game: (n, g) => `🎲 ${n} opened ${{ tawleh: 'a tawleh table', tarneeb: 'a Tarneeb table', likha: 'a Likha table', trivia: 'trivia night' }[g] || g}. Come and play!`, event: w => `🎉 Today: ${w}`, voice: '🎙️ Voice message', photo: '📷 Photo', knock: '🔔 rang the bell!', bday: w => `🎂 It’s ${w}’s birthday today!`, nameday: w => `🕯️ It’s ${w}’s name day` },
  fr: { game: (n, g) => `🎲 ${n} a ouvert ${{ tawleh: 'une table de tawlé', tarneeb: 'une table de Tarneeb', likha: 'une table de Likha', trivia: 'la soirée quiz' }[g] || g}. Viens jouer !`, event: w => `🎉 Aujourd’hui : ${w}`, voice: '🎙️ Message vocal', photo: '📷 Photo', knock: '🔔 a sonné !', bday: w => `🎂 C’est l’anniversaire de ${w} !`, nameday: w => `🕯️ C’est la fête de ${w}` }
};
async function notify(id, msg) {
  const subs = await store.hgetall(K(id, 'push'));
  if (!Object.keys(subs).length) return 0;
  const r = await store.getJSON(K(id));
  const who = await store.hgetall(K(id, 'who'));
  const looking = n => Number(who[n] || 0) > Date.now() - 12000;   // the chat is open on their phone right now
  const targets = [];
  for (const [field, json] of Object.entries(subs)) {
    let rec; try { rec = JSON.parse(json); } catch { continue; }
    if (!rec || rec.name === msg.name || looking(rec.name)) continue;
    // several messages in a row: one notification every 20 seconds is enough
    if (!(await store.claim(K(id, 'pn:' + field), 20))) continue;
    targets.push(field);
  }
  if (!targets.length) return 0;
  return alerts.sendTo(K(id, 'push'), null, rec => targets.includes(sha(rec.sub.endpoint)), rec => {
    const L = PN[rec.lang] || PN.ar;
    const body = msg.sys === 'game' ? L.game(msg.name, msg.game)
      : msg.sys ? L[['nameday', 'event'].includes(msg.sys) ? msg.sys : 'bday'](msg.who)
      : msg.knock ? `${msg.name} ${L.knock}`
      : `${msg.name}: ${msg.text || (msg.voice ? L.voice : msg.photo ? L.photo : '')}`;
    return { title: '🛋️ ' + (r ? r.title : ''), body: body.slice(0, 180), url: `/q/${id}`, tag: 'q-' + id, lang: rec.lang };
  });
}
const TURN = {
  ar: g => `🎲 دورك ${{ tawleh: 'بالطاولة', tarneeb: 'بالطرنيب', likha: 'بالليخة' }[g] || ''}!`,
  en: g => `🎲 Your turn ${{ tawleh: 'at tawleh', tarneeb: 'at Tarneeb', likha: 'at Likha' }[g] || ''}!`,
  fr: g => `🎲 À toi de jouer ${{ tawleh: 'au tawlé', tarneeb: 'au Tarneeb', likha: 'au Likha' }[g] || ''} !`
};
async function turnNudge(id, turn, kind) {
  const subs = await store.hgetall(K(id, 'push'));
  if (!Object.keys(subs).length) return 0;
  const who = await store.hgetall(K(id, 'who'));
  if (Number(who[turn] || 0) > Date.now() - 12000) return 0;          // they're looking at it
  if (!(await store.claim(K(id, 'tn:' + sha(turn)), 45))) return 0;
  const r = await store.getJSON(K(id));
  return alerts.sendTo(K(id, 'push'), null, rec => rec.name === turn, rec => ({ title: '🛋️ ' + (r ? r.title : ''), body: (TURN[rec.lang] || TURN.ar)(kind), url: `/q/${id}?play=${encodeURIComponent(kind)}`, tag: 'turn-' + id, lang: rec.lang }));
}
async function pushOn(id, body) {
  await room(id);
  const name = await member(id, body && body.token);
  const sub = body && body.subscription;
  if (!sub || typeof sub.endpoint !== 'string' || !/^https:\/\//.test(sub.endpoint) || sub.endpoint.length > 1000 || !sub.keys) throw err(400, 'missing');
  const rec = { sub: { endpoint: sub.endpoint, keys: { p256dh: String(sub.keys.p256dh), auth: String(sub.keys.auth) } }, name, lang: ['ar', 'en', 'fr'].includes(body.lang) ? body.lang : 'ar', at: Date.now() };
  await store.hset(K(id, 'push'), sha(sub.endpoint), JSON.stringify(rec));
  await store.run('EXPIRE', K(id, 'push'), TTL);
  return { ok: true };
}
async function pushOff(id, body) {
  await room(id);
  await member(id, body && body.token);
  if (body && typeof body.endpoint === 'string') await store.hdel(K(id, 'push'), sha(body.endpoint));
  return { ok: true };
}

async function say(id, body, ip) {
  await room(id);
  const name = await member(id, body && body.token);
  store.hdel(K(id, 'ty'), name).catch(() => 0);
  // a game opened on the table: everyone gets a "come and play" with a button
  if (body && body.game) {
    const game = String(body.game);
    if (!GAMES.has(game)) throw err(400, 'missing');
    if ((await store.incr('rl:qg:' + id, 120)) > 6) throw err(429, 'rate');
    return post(id, { name, sys: 'game', game }, ip);
  }
  // the doorbell: everyone in the room hears it ring
  if (body && body.knock) {
    if ((await store.incr('rl:qk:' + id + ':' + sha(name), 60)) > 2) throw err(429, 'rate');
    return post(id, { name, knock: true }, ip);
  }
  const text = clean(body && body.text, 240);
  if (!text) throw err(400, 'missing');
  const rv = review({ text });
  if (rv.reject) throw err(400, rv.reject);
  if (words(text).some(w => RUDE.includes(w))) throw err(400, 'rude');
  const song = body.song && typeof body.song === 'object' ? cleanNow(body.song) : null;
  return post(id, { name, text, song: song && song.kind !== 'none' ? song : undefined, re: cleanRe(body.re) }, ip);
}
// a reply quotes a few words of the message it answers
function cleanRe(re) {
  if (!re || typeof re !== 'object') return undefined;
  const n = Math.floor(Number(re.n));
  if (!n) return undefined;
  return { n, name: clean(re.name, 24), text: clean(re.text, 80) };
}
// delete your own message (its photo or voice goes too)
async function del(id, body) {
  await room(id);
  const name = await member(id, body && body.token);
  const n = Math.floor(Number(body && body.n));
  const raw = (await store.lrange(K(id, 'm'), 0, KEEP - 1)) || [];
  const m = raw.map(x => { try { return JSON.parse(x); } catch { return null; } }).find(x => x && x.n === n);
  if (!m) throw err(404, 'gone');
  if (m.name !== name) throw err(403, 'token');
  await store.hset(K(id, 'del'), String(n), '1');
  if (m.photo) await store.del(K(id, 'i:' + m.photo)).catch(() => 0);
  if (m.voice) await store.del(K(id, 'a:' + m.voice)).catch(() => 0);
  await store.incr(K(id, 'rxv'));
  return { ok: true };
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
  return post(id, { re: cleanRe(body.re), name, voice: aid, secs: Math.max(0, Math.min(90, Number(body.seconds) || 0)), text: text || undefined, song: song && song.kind !== 'none' ? song : undefined }, ip);
}

// a photo, made small on the phone before it is sent
async function photo(id, body, ip) {
  await room(id);
  const name = await member(id, body && body.token);
  if ((await store.incr('rl:qp:' + ip, 3600)) > 30) throw err(429, 'rate');
  const type = String(body.type || '').toLowerCase();
  if (!IMAGE_TYPES.has(type)) throw err(400, 'type');
  const data = typeof body.data === 'string' ? body.data : '';
  if (!data || data.length > MAX_IMAGE || !/^[A-Za-z0-9+/=]+$/.test(data)) throw err(413, 'big');
  const pid = rnd(8);
  await store.setJSON(K(id, 'i:' + pid), { type, data }, TTL);
  const text = clean(body.text, 120);
  if (text && review({ text }).reject) throw err(400, 'rude');
  const w = Math.max(1, Math.min(4000, Number(body.w) || 1)), h = Math.max(1, Math.min(4000, Number(body.h) || 1));
  return post(id, { name, photo: pid, w, h, text: text || undefined }, ip);
}
async function image(id, pid, token) {
  await room(id);
  await member(id, token);
  if (!/^[A-Za-z0-9_-]{6,16}$/.test(pid)) throw err(404, 'gone');
  const a = await store.getJSON(K(id, 'i:' + pid));
  if (!a) throw err(404, 'gone');
  return a;
}
// a reaction on a message: tap again to take it back
async function react(id, body) {
  await room(id);
  const name = await member(id, body && body.token);
  const n = Math.floor(Number(body.n));
  const e = String(body.e || '');
  if (!n || !EMOJI.has(e)) throw err(400, 'missing');
  const all = await store.hgetall(K(id, 'rx'));
  let cur = {}; try { cur = JSON.parse(all[n] || '{}'); } catch { cur = {}; }
  const list = cur[e] || [];
  cur[e] = list.includes(name) ? list.filter(x => x !== name) : [...list, name].slice(-30);
  if (!cur[e].length) delete cur[e];
  await store.hset(K(id, 'rx'), String(n), JSON.stringify(cur));
  await store.incr(K(id, 'rxv'));
  return { rx: cur };
}
async function typing(id, body) {
  await room(id);
  const name = await member(id, body && body.token);
  if (body && body.stop) await store.hdel(K(id, 'ty'), name);
  else await store.hset(K(id, 'ty'), name, String(Date.now()));
  return { ok: true };
}

// ---- scores: who won what, all time and this week
function weekKey(d = new Date()) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return t.getUTCFullYear() + '-W' + String(Math.ceil(((t - y0) / 86400000 + 1) / 7)).padStart(2, '0');
}
async function score(id, body) {
  await room(id);
  await member(id, body && body.token);
  const game = String(body.game || '');
  if (!GAMES.has(game)) throw err(400, 'missing');
  const gid = clean(body.gid, 40);
  if (!gid || !(await store.claim(K(id, 'scd:' + gid), 7 * 24 * 3600))) return { ok: true, dup: true };
  const players = (Array.isArray(body.players) ? body.players : []).map(x => clean(x, 24)).filter(Boolean).slice(0, 8);
  const winners = (Array.isArray(body.winners) ? body.winners : []).map(x => clean(x, 24)).filter(x => players.includes(x));
  const wk = weekKey();
  for (const key of [K(id, 'sc'), K(id, 'sc:' + wk)]) {
    const all = await store.hgetall(key);
    for (const p of players) {
      let rec = {}; try { rec = JSON.parse(all[p] || '{}'); } catch { rec = {}; }
      const g = rec[game] || { w: 0, p: 0 };
      g.p += 1; if (winners.includes(p)) g.w += 1;
      rec[game] = g;
      await store.hset(key, p, JSON.stringify(rec));
    }
    if (key !== K(id, 'sc')) await store.run('EXPIRE', key, 21 * 24 * 3600);
  }
  return { ok: true };
}
async function scores(id, token) {
  await room(id);
  await member(id, token);
  const parse = h => Object.fromEntries(Object.entries(h).map(([n, v]) => { try { return [n, JSON.parse(v)]; } catch { return [n, {}]; } }));
  return { all: parse(await store.hgetall(K(id, 'sc'))), week: parse(await store.hgetall(K(id, 'sc:' + weekKey()))) };
}

// ---- birthdays shared in the room, and the greeting on the day (posted once)
async function bday(id, body) {
  await room(id);
  await member(id, body && body.token);
  const who = clean(body.who, 24);
  if (!who) throw err(400, 'missing');
  if (body.remove) { await store.hdel(K(id, 'bd'), who); return { ok: true }; }
  const md = String(body.md || '');
  if (!/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(md)) throw err(400, 'missing');
  if (review({ name: who }).reject) throw err(400, 'name');
  await store.hset(K(id, 'bd'), who, md);
  return { ok: true };
}
async function greet(id, body, ip) {
  await room(id);
  await member(id, body && body.token);
  const who = clean(body.who, 24);
  const kind = ['nameday', 'event'].includes(body.kind) ? body.kind : 'bday';
  const day = String(body.day || '').slice(0, 10);
  if (!who || !/^\d{4}-\d{2}-\d{2}$/.test(day)) throw err(400, 'missing');
  if (!(await store.claim(K(id, `gr:${kind}:${sha(who)}:${day}`), 3 * 24 * 3600))) return { ok: true, dup: true };
  return post(id, { name: '', sys: kind, who }, ip);
}

// ---- family events (a wedding, a visit home, a baptism…), shared in the room
const EV_KINDS = new Set(['wedding', 'visit', 'baby', 'grad', 'party', 'other']);
async function event(id, body) {
  await room(id);
  const name = await member(id, body && body.token);
  if (body.remove) { await store.hdel(K(id, 'ev'), clean(body.remove, 16)); return { ok: true }; }
  const title = clean(body.title, 60);
  const date = String(body.date || '');
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw err(400, 'missing');
  if (review({ text: title }).reject) throw err(400, 'rude');
  const all = await store.hgetall(K(id, 'ev'));
  if (Object.keys(all).length >= 60) throw err(429, 'rate');
  const eid = rnd(6);
  await store.hset(K(id, 'ev'), eid, JSON.stringify({ id: eid, title, date, kind: EV_KINDS.has(body.kind) ? body.kind : 'other', by: name }));
  await touch(id);
  return { ok: true, id: eid };
}

// ---- the room's own playlist: anyone adds a YouTube song, everyone can play it
function ytId(u) {
  const s = String(u || '').trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
async function ytTitle(vid) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + vid)}&format=json`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const d = await res.json();
    return clean(d.title, 90) || null;
  } catch { return null; }
}
async function playlist(id, body, ip) {
  await room(id);
  const name = await member(id, body && body.token);
  const key = K(id, 'pl');
  const list = () => store.lrange(key, 0, 49).then(a => (a || []).map(v => { try { return JSON.parse(v); } catch { return null; } }).filter(Boolean));
  if (body.remove) {
    const raw = (await store.lrange(key, 0, 49)) || [];
    const hit = raw.find(v => { try { const x = JSON.parse(v); return x.k === body.remove && x.by === name; } catch { return false; } });
    if (hit) await store.lrem(key, hit);
    return { playlist: await list() };
  }
  if ((await store.incr('rl:qpl:' + ip, 3600)) > 40) throw err(429, 'rate');
  const vid = ytId(body.url);
  if (!vid) throw err(400, 'yt');
  if ((await list()).some(x => x.vid === vid)) return { playlist: await list() };
  const title = (await ytTitle(vid)) || 'YouTube';
  await store.lpush(key, JSON.stringify({ k: rnd(5), vid, title, by: name, at: Date.now() }));
  await store.ltrim(key, 0, 49);
  await touch(id);
  return { playlist: await list() };
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
  // a stale write (someone else moved since this player last looked) loses
  if (cur && body.base !== undefined && body.base !== null && Number(body.base) !== cur.v && cur.kind === body.kind && !body.fresh) throw err(409, 'stale');
  const v = (cur && cur.kind === body.kind && !body.fresh ? cur.v : 0) + 1;
  const turn = clean(body.turn, 24) || null;
  await store.setJSON(K(id, 'game'), { v, kind: clean(body.kind, 12), state: body.state, host: name, hostTok: sha(body.token), at: Date.now(), turn }, TTL);
  // "your turn": a nudge to the one whose turn it is, if their app is closed
  if (turn && (!cur || cur.turn !== turn)) await Promise.race([turnNudge(id, turn, clean(body.kind, 12)).catch(() => 0), new Promise(r => setTimeout(r, 2500))]);
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

module.exports = { event, playlist, ytId, del, pushOn, pushOff, create, join, peek, read, say, voice, audio, photo, image, react, typing, score, scores, bday, greet, play, gameSet, gameMove, gameEnd, weekKey };

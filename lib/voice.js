// Voice dedications: a short recording (up to about 40 seconds) with a song,
// sent privately by link, like a voice note. Nothing is listed publicly;
// each one disappears after 30 days.

const crypto = require('crypto');
const store = require('./store');
const { clean, review } = require('./dedications');

const TTL = 30 * 24 * 3600;
const MAX_B64 = 640 * 1024;          // about 480 KB of audio
const TYPES = new Set(['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/aac', 'audio/x-m4a', 'audio/wav']);

function err(status, code) { const e = new Error(code); e.status = status; e.code = code; return e; }
const okId = id => typeof id === 'string' && /^[A-Za-z0-9_-]{8,20}$/.test(id);

async function save(body, ip) {
  if ((await store.incr('rl:v:' + ip, 3600)) > 8) throw err(429, 'rate');
  const b = body || {};
  const type = String(b.type || '').split(';')[0].trim().toLowerCase();
  if (!TYPES.has(type)) throw err(400, 'type');
  const audio = typeof b.audio === 'string' ? b.audio : '';
  if (!audio || audio.length > MAX_B64 || !/^[A-Za-z0-9+/=]+$/.test(audio)) throw err(400, 'audio');
  const fromName = clean(b.fromName, 40), toName = clean(b.toName, 40);
  if (!fromName || !toName) throw err(400, 'missing');
  const r = review({ fromName, toName });
  if (r.reject) throw err(400, r.reject);
  const song = b.song && typeof b.song === 'object'
    ? { kind: ['radio', 'tape'].includes(b.song.kind) ? b.song.kind : 'none', id: clean(b.song.id, 80), name: clean(b.song.name, 80) }
    : { kind: 'none', id: '', name: '' };
  const seconds = Math.max(0, Math.min(90, Number(b.seconds) || 0));
  const id = crypto.randomBytes(8).toString('base64url');
  await store.setJSON('v:' + id, { id, type, audio, fromName, toName, song, seconds, lang: ['ar', 'en', 'fr'].includes(b.lang) ? b.lang : 'ar', at: Date.now() }, TTL);
  return { id };
}

async function one(id) {
  if (!okId(id)) return null;
  return store.getJSON('v:' + id);
}

module.exports = { save, one };

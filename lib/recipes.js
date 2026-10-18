// The family cookbook: recipes people add with their name. Each waits for the
// admin before it is shown to everyone (the author sees theirs straight away on
// their own device).

const crypto = require('crypto');
const store = require('./store');
const { clean, review } = require('./dedications');

function err(status, code) { const e = new Error(code); e.status = status; e.code = code; return e; }

function cleanRecipe(b) {
  const lines = (v, n, max) => (Array.isArray(v) ? v : String(v || '').split('\n')).map(x => clean(String(x), max)).filter(Boolean).slice(0, n);
  const r = {
    title: clean(b && b.title, 60),
    author: clean(b && b.author, 40),
    place: clean(b && b.place, 40),
    serves: Math.max(1, Math.min(30, Number(b && b.serves) || 4)),
    time: Math.max(1, Math.min(1440, Number(b && b.time) || 30)),
    ingredients: lines(b && b.ingredients, 40, 120),
    steps: lines(b && b.steps, 30, 400),
    timers: [],
    lang: ['ar', 'en', 'fr'].includes(b && b.lang) ? b.lang : 'ar'
  };
  r.timers = r.steps.map((_, i) => { const t = Number(b && b.timers && b.timers[i]); return t > 0 && t <= 86400 ? Math.round(t) : 0; });
  if (!r.title || !r.author || r.ingredients.length < 1 || r.steps.length < 1) throw err(400, 'missing');
  const v = review({ title: r.title, author: r.author, place: r.place, i: r.ingredients.join(' '), s: r.steps.join(' ') });
  if (v.reject) throw err(422, v.reject);
  r.flagged = v.flagged;
  return r;
}

async function submit(body, ip) {
  const r = cleanRecipe(body);
  const ipKey = crypto.createHash('sha1').update(String(ip || '')).digest('hex').slice(0, 16);
  if ((await store.incr('rec:rate:' + ipKey, 3600)) > 5) throw err(429, 'rate');
  const id = crypto.randomBytes(6).toString('base64url');
  const rec = { id, ...r, status: 'pending', at: Date.now() };
  await store.setJSON('rec:' + id, rec, 365 * 86400);
  await store.lpush('rec:pending', id);
  return { id, status: 'pending' };
}
const publicView = r => ({ id: r.id, title: r.title, author: r.author, place: r.place, serves: r.serves, time: r.time, ingredients: r.ingredients, steps: r.steps, timers: r.timers, lang: r.lang, at: r.at });
async function load(ids) { const out = []; for (const id of ids) { const r = await store.getJSON('rec:' + id); if (r) out.push(r); } return out; }
async function list() { return (await load(await store.lrange('rec:approved', 0, 199))).filter(r => r.status === 'approved').map(publicView); }
async function pending() { return (await load(await store.lrange('rec:pending', 0, 199))).sort((a, b) => (b.flagged - a.flagged) || (a.at - b.at)); }
async function decide(id, approve) {
  const r = await store.getJSON('rec:' + id);
  if (!r) throw err(404, 'gone');
  await store.lrem('rec:pending', id);
  r.status = approve ? 'approved' : 'rejected';
  await store.setJSON('rec:' + id, r, approve ? 5 * 365 * 86400 : 7 * 86400);
  if (approve) await store.lpush('rec:approved', id);
  return r;
}
async function remove(id) { await store.lrem('rec:approved', id); await store.lrem('rec:pending', id); await store.del('rec:' + id); }

module.exports = { submit, list, pending, decide, remove, cleanRecipe };

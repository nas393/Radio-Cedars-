// Dedications wall: "From Rima in Montreal to Teta in Zahle: Fairuz, Shady".
//
// Every dedication waits in a queue until the admin approves it. Before that,
// automatic checks reject links, phone numbers, oversized fields and floods,
// and flag rude words so the admin sees them first.

const crypto = require('crypto');
const store = require('./store');

const LIMITS = { fromName: 40, fromPlace: 40, toName: 40, toPlace: 40, song: 80, message: 240 };
const WALL_SIZE = 60;
const PER_IP_PER_HOUR = 3;

// Kept short on purpose: a flag only puts the item at the top of the queue
// with a warning, it never rejects. The admin makes the call.
const RUDE = [
  // Arabic (incl. common Lebanese)
  'شرموط', 'شرموطة', 'منيك', 'منيوك', 'عرص', 'عرصة', 'كلب', 'حمار', 'زبالة', 'خرا', 'تفو', 'قحبة', 'كس', 'طيز', 'زب',
  // Arabizi
  'charmouta', 'sharmouta', 'manyak', 'manyouk', '3ars', 'ars', 'kos', 'ays', 'zeb', 'tiz', '2a7ba',
  // English / French
  'fuck', 'shit', 'bitch', 'bastard', 'whore', 'slut', 'cunt', 'dick', 'putain', 'merde', 'salope', 'connard', 'enculé', 'pute'
];

const LINK = /(https?:\/\/|www\.|\.com\b|\.net\b|\.org\b|\.lb\b|\.me\b|t\.me|wa\.me|bit\.ly)/i;
const PHONE = /(\+?\d[\d\s().-]{7,}\d)/;
const AT_HANDLE = /(^|\s)@\w{3,}/;

function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function words(text) {
  return text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean)
    // strip the Arabic definite article and attached conjunctions so "والكلب" matches "كلب"
    .map(w => w.replace(/^(و|ف|ب|ل)?(ال)/, ''));
}

function review(fields) {
  const all = Object.values(fields).join(' ');
  if (LINK.test(all) || AT_HANDLE.test(all)) return { reject: 'links' };
  if (PHONE.test(all)) return { reject: 'phone' };
  if (/(.)\1{9,}/u.test(all)) return { reject: 'spam' };
  const rude = words(all).some(w => RUDE.includes(w));
  return { flagged: rude };
}

const ERRORS = {
  missing: 'missing',
  links: 'links',
  phone: 'phone',
  spam: 'spam',
  rate: 'rate'
};

async function submit(body, ip) {
  const fields = {};
  for (const [k, max] of Object.entries(LIMITS)) fields[k] = clean(body && body[k], max);
  if (!fields.fromName || !fields.toName || !fields.song) {
    throw Object.assign(new Error(ERRORS.missing), { status: 400, code: ERRORS.missing });
  }
  const verdict = review(fields);
  if (verdict.reject) throw Object.assign(new Error(verdict.reject), { status: 422, code: verdict.reject });

  const ipKey = crypto.createHash('sha1').update(String(ip || 'unknown')).digest('hex').slice(0, 16);
  const n = await store.incr(`ded:rate:${ipKey}`, 3600);
  if (n > PER_IP_PER_HOUR) throw Object.assign(new Error(ERRORS.rate), { status: 429, code: ERRORS.rate });

  const id = crypto.randomBytes(6).toString('base64url');
  const record = {
    id,
    ...fields,
    lang: ['ar', 'en', 'fr'].includes(body.lang) ? body.lang : 'ar',
    flagged: verdict.flagged,
    status: 'pending',
    at: Date.now()
  };
  await store.setJSON(`ded:${id}`, record, 180 * 86400);
  await store.lpush('ded:pending', id);
  return record;
}

const publicView = d => ({
  id: d.id, fromName: d.fromName, fromPlace: d.fromPlace, toName: d.toName, toPlace: d.toPlace,
  song: d.song, message: d.message, lang: d.lang, at: d.at
});

async function load(ids) {
  const out = [];
  for (const id of ids) {
    const d = await store.getJSON(`ded:${id}`);
    if (d) out.push(d);
  }
  return out;
}

async function wall() {
  const ids = await store.lrange('ded:approved', 0, WALL_SIZE - 1);
  return (await load(ids)).filter(d => d.status === 'approved').map(publicView);
}

async function one(id) {
  if (!/^[\w-]{4,20}$/.test(id)) return null;
  const d = await store.getJSON(`ded:${id}`);
  return d && d.status === 'approved' ? publicView(d) : null;
}

async function pending() {
  const ids = await store.lrange('ded:pending', 0, 199);
  const items = await load(ids);
  // Flagged first, then oldest first so nothing waits forever.
  return items.sort((a, b) => (b.flagged - a.flagged) || (a.at - b.at));
}

async function decide(id, approve) {
  const d = await store.getJSON(`ded:${id}`);
  if (!d) throw Object.assign(new Error('not found'), { status: 404 });
  await store.lrem('ded:pending', id);
  if (approve) {
    d.status = 'approved';
    d.approvedAt = Date.now();
    await store.setJSON(`ded:${id}`, d, 365 * 86400);
    await store.lpush('ded:approved', id);
    await store.ltrim('ded:approved', 0, 499);
  } else {
    d.status = 'rejected';
    await store.setJSON(`ded:${id}`, d, 7 * 86400);
  }
  return d;
}

async function remove(id) {
  await store.lrem('ded:approved', id);
  await store.lrem('ded:pending', id);
  await store.del(`ded:${id}`);
}

module.exports = { submit, wall, one, pending, decide, remove, LIMITS };

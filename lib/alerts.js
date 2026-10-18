// Breaking-news alerts: web push to people who opted in, in their language.
//
// - VAPID keys are generated once and kept in the store, so nothing has to be
//   configured by hand.
// - check() is safe to call by anyone: it takes a short lock, only alerts on
//   headlines that look like breaking news, never repeats one, and caps each
//   language at a few alerts a day.

const crypto = require('crypto');
const webpush = require('web-push');
const store = require('./store');

const SITE = process.env.SITE_URL || 'https://radio-cedars.vercel.app';
const MAX_PER_DAY = 4;
const FRESH_MS = 2 * 60 * 60 * 1000;          // only headlines from the last 2 hours
const LANGS = ['ar', 'en', 'fr'];

// Whole-word match that also works with accented letters (\b doesn't).
const word = alternatives => new RegExp(`(?<!\\p{L})(?:${alternatives})(?!\\p{L})`, 'iu');

// Explicit "breaking" markers outlets put in titles.
const MARKERS = {
  ar: /عاجل|خبر عاجل/,
  en: word('breaking|just in|urgent'),
  fr: word('urgent|alerte|derni[eè]re minute|flash')
};

// Events big enough to alert on even without a marker.
const MAJOR = {
  ar: /زلزال|انفجار|اغتيال|وقف (إ|ا)طلاق النار|انتخاب رئيس|تشكيل الحكومة|استقالة الحكومة|إقفال المطار|اقفال المطار|إغلاق المطار|غارة على بيروت|غارات على بيروت/,
  en: word('earthquake|explosion|blast|assassinat\\p{L}*|ceasefire|elected president|government formed|government resigns?|airport (closed|shut)|strikes? on beirut'),
  fr: word('s[ée]isme|explosion|assassinat|cessez-le-feu|[ée]lu pr[ée]sident|gouvernement form[ée]|d[ée]mission du gouvernement|a[ée]roport ferm[ée]|frappes? sur beyrouth')
};

const hash = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 20);
const today = () => new Date().toISOString().slice(0, 10);

let vapidReady = null;
async function vapid() {
  if (!vapidReady) {
    vapidReady = (async () => {
      let keys = await store.getJSON('push:vapid');
      if (!keys) {
        const fresh = webpush.generateVAPIDKeys();
        // Another instance may have raced us; keep whichever landed first.
        await store.run('SET', 'push:vapid', JSON.stringify(fresh), 'NX');
        keys = await store.getJSON('push:vapid');
      }
      webpush.setVapidDetails(SITE, keys.publicKey, keys.privateKey);
      return keys;
    })().catch(err => { vapidReady = null; throw err; });
  }
  return vapidReady;
}

async function publicKey() {
  return (await vapid()).publicKey;
}

function validSubscription(sub) {
  return sub && typeof sub.endpoint === 'string' && /^https:\/\//.test(sub.endpoint)
    && sub.endpoint.length < 1000
    && sub.keys && typeof sub.keys.p256dh === 'string' && typeof sub.keys.auth === 'string';
}

async function subscribe(sub, lang, role = 'reader') {
  if (!validSubscription(sub)) throw Object.assign(new Error('invalid subscription'), { status: 400 });
  const key = role === 'admin' ? 'push:admins' : 'push:subs';
  const record = { sub: { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } }, lang: LANGS.includes(lang) ? lang : 'ar', at: Date.now() };
  await store.hset(key, hash(sub.endpoint), JSON.stringify(record));
}

async function unsubscribe(endpoint) {
  if (typeof endpoint !== 'string') return;
  await store.hdel('push:subs', hash(endpoint));
  await store.hdel('push:admins', hash(endpoint));
}

// Send one payload to a set of stored subscriptions; drop the ones that are gone.
// payload is one object for everyone, unless makePayload(rec) builds one per subscriber
async function sendTo(key, payload, filter = () => true, makePayload = null) {
  await vapid();
  const all = await store.hgetall(key);
  let sent = 0;
  await Promise.all(Object.entries(all).map(async ([id, json]) => {
    let rec;
    try { rec = JSON.parse(json); } catch { return store.hdel(key, id); }
    if (!filter(rec)) return;
    try {
      await webpush.sendNotification(rec.sub, JSON.stringify(makePayload ? makePayload(rec) : payload), { TTL: 3600, urgency: 'high' });
      sent++;
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) await store.hdel(key, id);
      else console.warn('[push] send failed', err.statusCode || err.message);
    }
  }));
  return sent;
}

function isBreaking(item, lang) {
  if (!item.date || Date.now() - new Date(item.date) > FRESH_MS) return false;
  return MARKERS[lang].test(item.title) || MAJOR[lang].test(item.title);
}

const TITLES = { ar: 'عاجل من لبنان', en: 'Breaking from Lebanon', fr: 'Urgent : Liban' };

// Look through the current headlines and alert on anything new and big.
async function check(getNews) {
  if (!(await store.claim('breaking:lock', 240))) return { skipped: 'recently checked' };
  const news = await getNews();
  const result = { checked: 0, alerts: [] };
  for (const source of news.sources) {
    const lang = LANGS.includes(source.lang) ? source.lang : 'en';
    for (const item of source.items || []) {
      result.checked++;
      if (!isBreaking(item, lang)) continue;
      // Same headline (any source) is only ever sent once.
      const id = hash(item.title.toLowerCase().replace(/\s+/g, ' '));
      if (!(await store.claim(`breaking:sent:${id}`, 3 * 86400))) continue;
      const count = await store.incr(`breaking:count:${lang}:${today()}`, 2 * 86400);
      if (count > MAX_PER_DAY) continue;
      const sent = await sendTo('push:subs', {
        title: TITLES[lang],
        body: `${item.title} (${source.source})`,
        url: item.link,
        tag: `breaking-${id}`,
        lang
      }, rec => rec.lang === lang);
      result.alerts.push({ lang, title: item.title, sent });
    }
  }
  return result;
}

async function notifyAdmins(payload) {
  try { return await sendTo('push:admins', payload); } catch { return 0; }
}

async function stats() {
  const subs = await store.hgetall('push:subs');
  const byLang = { ar: 0, en: 0, fr: 0 };
  for (const json of Object.values(subs)) {
    try { byLang[JSON.parse(json).lang]++; } catch { /* skip */ }
  }
  return byLang;
}

module.exports = { publicKey, subscribe, unsubscribe, check, notifyAdmins, stats, isBreaking, sendTo };

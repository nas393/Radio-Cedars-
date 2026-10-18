// "صباح الخير": at 7 in the morning, Beirut time, a greeting with the day's weather
// (for your village if you picked one) and an invitation to Fairuz.

const store = require('./store');
const alerts = require('./alerts');
const { clean } = require('./dedications');
const crypto = require('crypto');

const LANGS = ['ar', 'en', 'fr'];
const hash = s => crypto.createHash('sha256').update(s).digest('base64url').slice(0, 32);

async function subscribe(body) {
  const sub = body && body.subscription;
  if (!sub || typeof sub.endpoint !== 'string' || !/^https:\/\//.test(sub.endpoint) || !sub.keys) throw Object.assign(new Error('invalid'), { status: 400, code: 'invalid' });
  const v = body.village && typeof body.village === 'object' ? body.village : null;
  const rec = {
    sub: { endpoint: sub.endpoint, keys: { p256dh: String(sub.keys.p256dh), auth: String(sub.keys.auth) } },
    lang: LANGS.includes(body.lang) ? body.lang : 'ar',
    name: clean(body.name, 30),
    village: v && Number.isFinite(+v.lat) && Number.isFinite(+v.lon) ? { name: clean(v.name, 40), lat: +(+v.lat).toFixed(3), lon: +(+v.lon).toFixed(3) } : null,
    at: Date.now()
  };
  await store.hset('push:morning', hash(sub.endpoint), JSON.stringify(rec));
  return { ok: true };
}
async function unsubscribe(body) {
  if (body && typeof body.endpoint === 'string') await store.hdel('push:morning', hash(body.endpoint));
  return { ok: true };
}

function beirutNow() {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Beirut', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const g = t => p.find(x => x.type === t).value;
  return { day: `${g('year')}-${g('month')}-${g('day')}`, h: Number(g('hour')), m: Number(g('minute')) };
}

const WORDS = {
  ar: c => c === 0 ? 'صحو' : c <= 3 ? 'غيم خفيف' : c <= 48 ? 'ضباب' : c <= 67 ? 'شتي' : c <= 77 ? 'تلج' : c <= 82 ? 'زخّات' : 'عواصف',
  en: c => c === 0 ? 'clear skies' : c <= 3 ? 'a few clouds' : c <= 48 ? 'fog' : c <= 67 ? 'rain' : c <= 77 ? 'snow' : c <= 82 ? 'showers' : 'storms',
  fr: c => c === 0 ? 'ciel dégagé' : c <= 3 ? 'quelques nuages' : c <= 48 ? 'brouillard' : c <= 67 ? 'pluie' : c <= 77 ? 'neige' : c <= 82 ? 'averses' : 'orages'
};

// Called by the regular check. Sends once a day, between 7:00 and 7:20 in Beirut.
async function maybeSend(weatherAt, force) {
  const now = beirutNow();
  if (!force && !(now.h === 7 && now.m < 20)) return { morning: 'not now' };
  if (!force && !(await store.claim('morning:' + now.day, 2 * 86400))) return { morning: 'already sent' };
  const all = await store.hgetall('push:morning');
  const places = new Map();
  const recs = Object.values(all).map(j => { try { return JSON.parse(j); } catch { return null; } }).filter(Boolean);
  for (const r of recs) {
    const k = r.village ? `${r.village.lat},${r.village.lon}` : 'beirut';
    if (!places.has(k)) places.set(k, r.village || { name: null, lat: 33.89, lon: 35.5 });
  }
  const weather = new Map();
  for (const [k, p] of places) { try { weather.set(k, await weatherAt(p.lat, p.lon)); } catch { /* no weather line */ } }
  const sent = await alerts.sendTo('push:morning', null, () => true, rec => {
    const k = rec.village ? `${rec.village.lat},${rec.village.lon}` : 'beirut';
    const w = weather.get(k);
    const place = rec.village && rec.village.name ? rec.village.name : { ar: 'بيروت', en: 'Beirut', fr: 'Beyrouth' }[rec.lang];
    const line = w ? { ar: `${place} اليوم: ${WORDS.ar(w.code)}، بين ${w.min}° و ${w.max}°.`, en: `${place} today: ${WORDS.en(w.code)}, ${w.min}° to ${w.max}°.`, fr: `${place} aujourd’hui : ${WORDS.fr(w.code)}, de ${w.min}° à ${w.max}°.` }[rec.lang] : '';
    return {
      title: { ar: `صباح الخير${rec.name ? ' يا ' + rec.name : ''} ☕`, en: `Good morning${rec.name ? ', ' + rec.name : ''} ☕`, fr: `Bonjour${rec.name ? ' ' + rec.name : ''} ☕` }[rec.lang],
      body: `${line} ${{ ar: 'فيروز الصبح؟', en: 'Fairuz with your coffee?', fr: 'Fairouz avec le café ?' }[rec.lang]}`.trim(),
      url: '/?morning=1',
      tag: 'morning',
      lang: rec.lang
    };
  });
  return { morning: sent };
}

module.exports = { subscribe, unsubscribe, maybeSend };

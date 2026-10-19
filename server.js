const path = require('path');
const express = require('express');
const Parser = require('rss-parser');

const store = require('./lib/store');
const alerts = require('./lib/alerts');
const dedications = require('./lib/dedications');
const admin = require('./lib/admin');
const together = require('./lib/together');
const voice = require('./lib/voice');
const profiles = require('./lib/profiles');
const recipes = require('./lib/recipes');
const morning = require('./lib/morning');

const app = express();
app.disable('x-powered-by');
// Small JSON bodies everywhere, except voice notes (a few hundred KB of audio).
const smallJson = express.json({ limit: '10kb' });
const bigJson = express.json({ limit: '700kb' });
const midJson = express.json({ limit: '200kb' });
const photoJson = express.json({ limit: '900kb' });
app.use((req, res, next) => {
  const p = req.path;
  if (/^\/api\/q\/[^/]+\/photo$/.test(p)) return photoJson(req, res, next);
  if (p === '/api/voice' || /^\/api\/q\/[^/]+\/voice$/.test(p)) return bigJson(req, res, next);
  if (p.startsWith('/api/profile') || p === '/api/recipes' || /^\/api\/q\/[^/]+\/game$/.test(p)) return midJson(req, res, next);
  return smallJson(req, res, next);
});
const PORT = process.env.PORT || 3000;
const USER_AGENT = 'SawtElBeit/2.0 (Lebanese radio and news for the diaspora)';

// ---------------------------------------------------------------------------
// News feeds
// ---------------------------------------------------------------------------
// Each outlet has its own feed plus a Google News fallback for the same site.
// Many news sites block requests from cloud servers, so the fallback keeps
// headlines flowing when the direct feed refuses us.
function googleNews(site, lang, window = '2d') {
  const locale = {
    ar: 'hl=ar&gl=LB&ceid=LB:ar',
    fr: 'hl=fr&gl=LB&ceid=LB:fr',
    en: 'hl=en-US&gl=LB&ceid=LB:en'
  }[lang];
  return `https://news.google.com/rss/search?q=${encodeURIComponent(`${site} when:${window}`)}&${locale}`;
}

// `lang` is the language the headlines are written in; the page uses it to
// pick a default tab and set reading direction.
const FEEDS = [
  { name: 'Annahar', lang: 'ar', url: 'https://www.annahar.com/rss/article.xml', fallback: googleNews('site:annahar.com', 'ar') },
  {
    name: "L'Orient-Le Jour",
    lang: 'fr',
    url: 'https://www.lorientlejour.com/rss',
    // The French edition only: exclude its English sister site.
    fallback: googleNews('site:lorientlejour.com -site:today.lorientlejour.com', 'fr')
  },
  { name: "L'Orient Today", lang: 'en', url: 'https://today.lorientlejour.com/feed.xml', fallback: googleNews('site:today.lorientlejour.com', 'en') },
  { name: 'Al-Manar English', lang: 'en', url: 'https://eng.almanar.com.lb/feed.php', fallback: googleNews('site:almanar.com.lb', 'en') },
  {
    name: 'The961',
    lang: 'en',
    url: 'https://www.the961.com/feed/',
    fallback: googleNews('site:the961.com', 'en', '7d'),
    // The961's page titles end in "- 961 - Lebanon News".
    titleSuffix: /\s*[-–—|]\s*(961(\s*[-–—|]\s*Lebanon News)?|Lebanon News)$/iu
  }
];

const ITEMS_PER_FEED = 6;
const NEWS_TTL_MS = 10 * 60 * 1000;        // refresh news every 10 minutes
const RADIO_TTL_MS = 6 * 60 * 60 * 1000;   // refresh station list every 6 hours

// A browser-like User-Agent: several outlets reject unknown bots outright.
const FEED_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 SawtElBeit/2.0',
  'Accept': 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5',
  'Accept-Language': 'ar,en;q=0.8,fr;q=0.6'
};

const parser = new Parser({ timeout: 8000, headers: FEED_HEADERS });

// Plain text only: drop tags, decode the common entities, collapse spaces.
function cleanText(value, max = 300) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

// Only allow real web links (blocks javascript:, data:, etc.).
function safeUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null;
  } catch {
    return null;
  }
}

function toIsoDate(value) {
  const d = new Date(value);
  return isNaN(d) ? null : d.toISOString();
}

// Small cache helper: serves the last good result, refreshes when stale,
// and shares one in-flight request between concurrent visitors.
function cached(ttl, load) {
  let value = null;
  let fetchedAt = 0;
  let inFlight = null;
  return async function get() {
    if (value && Date.now() - fetchedAt < ttl) return value;
    if (!inFlight) {
      inFlight = load()
        .then(result => {
          value = result;
          fetchedAt = Date.now();
          return result;
        })
        .finally(() => { inFlight = null; });
    }
    try {
      return await inFlight;
    } catch (err) {
      if (value) return value; // keep serving the last good copy
      throw err;
    }
  };
}

// Google's site: search also returns non-article pages (archives, search
// results, ads pages); keep only what reads like an actual headline.
const NON_ARTICLE = /^(page \d+|search results?|advertise|about|contact|tag:|category:)|lebanon news, stories/i;

const MAX_FALLBACK_AGE_MS = 8 * 24 * 60 * 60 * 1000;

function isRealHeadline(item) {
  // Index pages come back with old dates; real news from the last week only.
  const fresh = item.date && Date.now() - new Date(item.date) < MAX_FALLBACK_AGE_MS;
  return fresh
    && item.title.split(/\s+/).length >= 4
    && !NON_ARTICLE.test(item.title)
    && !/page \d+ of \d+/i.test(item.title);
}

function toItems(feed, fromGoogle, titleSuffix) {
  return (feed.items || [])
    .map(item => {
      let title = cleanText(item.title);
      if (fromGoogle) {
        // Google News appends " - Publisher" to every headline; drop that last
        // spaced segment (names like "Al-Manar" keep their own hyphen).
        const parts = title.split(/\s[-–—]\s/);
        if (parts.length > 1) title = parts.slice(0, -1).join(' - ').trim();
      }
      // Then the outlet's own page-title suffix, if it has one.
      if (titleSuffix) title = title.replace(titleSuffix, '').trim();
      return {
        title,
        link: safeUrl(item.link),
        date: toIsoDate(item.isoDate || item.pubDate)
      };
    })
    .filter(item => item.title && item.link)
    // Google sometimes returns section pages ("Shopping - Lebanon News");
    // real headlines have at least four words.
    .filter(item => !fromGoogle || isRealHeadline(item))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, ITEMS_PER_FEED);
}

async function loadSource(feed) {
  let directError = null;
  try {
    const items = toItems(await parser.parseURL(feed.url), false, feed.titleSuffix);
    if (items.length) return { source: feed.name, lang: feed.lang, ok: true, via: 'direct', items };
    directError = 'feed returned no items';
  } catch (err) {
    directError = err.message;
  }
  console.warn(`[news] ${feed.name} direct feed failed (${directError}); trying Google News`);

  try {
    const items = toItems(await parser.parseURL(feed.fallback), true, feed.titleSuffix);
    if (items.length) return { source: feed.name, lang: feed.lang, ok: true, via: 'google-news', items };
    throw new Error('fallback returned no items');
  } catch (err) {
    console.warn(`[news] ${feed.name} fallback failed: ${err.message}`);
    return {
      source: feed.name,
      lang: feed.lang,
      ok: false,
      items: [],
      error: cleanText(`direct: ${directError}; fallback: ${err.message}`, 200)
    };
  }
}

const getNews = cached(NEWS_TTL_MS, async () => {
  const sources = await Promise.all(FEEDS.map(loadSource));
  return { updatedAt: new Date().toISOString(), sources };
});

// ---------------------------------------------------------------------------
// Radio stations — pulled from the free Radio Browser directory, which checks
// every stream regularly. Only working HTTPS streams are kept, so the page
// never lists dead stations or ones the browser would block.
// ---------------------------------------------------------------------------
const RADIO_MIRRORS = [
  'https://de1.api.radio-browser.info',
  'https://de2.api.radio-browser.info',
  'https://fi1.api.radio-browser.info'
];
const MAX_STATIONS = 24;
// Listed under Lebanon in the directory but not Lebanese stations (a Persian stream,
// an international news service, a Quran-commentary feed): left out.
const NOT_LEBANESE = ['avazfarsi.com', 'mp3islam.com', 'anghamy', 'qurango.net', 'mc-doualiya', 'montcarlo', 'monte carlo'];

// Signed links (zeno "zt=", radiojar "rj-tok=") expire within minutes, so a
// cached copy would stop playing. Those are dropped in favour of the station's
// permanent link, which redirects to a fresh signed URL each time.
const EXPIRING_PARAMS = ['zt', 'rj-tok', 'rj-ttl', 'token', 'expires'];

function hasExpiringToken(url) {
  try {
    const params = new URL(url).searchParams;
    return EXPIRING_PARAMS.some(p => params.has(p));
  } catch {
    return true;
  }
}

// Playlist files (.pls/.m3u/.asx) can't be played by an <audio> element.
function isPlaylist(url) {
  // .m3u8 is HLS video/audio, which Chrome and Firefox can't play natively.
  return /\.(pls|m3u|m3u8|asx|xspf)$/i.test(new URL(url).pathname);
}

function pickStreamUrl(station) {
  // Prefer the resolved stream; fall back to the station's own link when the
  // resolved one is signed and about to expire.
  const candidates = [station.url_resolved, station.url]
    .map(safeUrl)
    .filter(u => u && u.startsWith('https:') && !hasExpiringToken(u) && !isPlaylist(u));
  return candidates[0] || null;
}

// Same stream listed twice under different names (e.g. "Al Bal Radio" / "راديو عالبال").
function streamKey(url) {
  const u = new URL(url);
  return (u.host + u.pathname).toLowerCase().replace(/\/+$/, '').replace(/\.(mp3|aac)$/, '');
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const getStations = cached(RADIO_TTL_MS, async () => {
  const query = new URLSearchParams({
    countrycode: 'LB',
    hidebroken: 'true',
    is_https: 'true',
    order: 'clickcount',
    reverse: 'true',
    limit: '80'
  });

  let lastError;
  for (const base of RADIO_MIRRORS) {
    try {
      const raw = await fetchJson(`${base}/json/stations/search?${query}`);
      const seenNames = new Set();
      const seenUrls = new Set();
      const stations = [];
      for (const s of raw) {
        const url = pickStreamUrl(s);
        const name = cleanText(s.name, 80);
        if (!url || !name || s.lastcheckok !== 1) continue;
        if (NOT_LEBANESE.some(x => url.includes(x) || name.toLowerCase().includes(x))) continue;
        const nameKey = name.toLowerCase();
        const urlKey = streamKey(url);
        if (seenNames.has(nameKey) || seenUrls.has(urlKey)) continue;
        seenNames.add(nameKey);
        seenUrls.add(urlKey);
        stations.push({
          id: s.stationuuid,
          name,
          url,
          favicon: safeUrl(s.favicon) && s.favicon.startsWith('https:') ? s.favicon : null,
          tags: cleanText(s.tags, 60),
          codec: cleanText(s.codec, 10),
          bitrate: Number(s.bitrate) || null
        });
        if (stations.length >= MAX_STATIONS) break;
      }
      if (!stations.length) throw new Error('no working stations returned');
      return { updatedAt: new Date().toISOString(), stations };
    } catch (err) {
      lastError = err;
      console.warn(`[radio] ${base} failed: ${err.message}`);
    }
  }
  throw lastError || new Error('all radio mirrors failed');
});

// ---------------------------------------------------------------------------
// Weather across Lebanon — free Open-Meteo API, one request for all cities.
// ---------------------------------------------------------------------------
const WEATHER_TTL_MS = 30 * 60 * 1000;
const CITIES = [
  { id: 'beirut',   lat: 33.8938, lon: 35.5018 },
  { id: 'tripoli',  lat: 34.4367, lon: 35.8497 },
  { id: 'saida',    lat: 33.5631, lon: 35.3689 },
  { id: 'sour',     lat: 33.2705, lon: 35.2038 },
  { id: 'zahle',    lat: 33.8463, lon: 35.9020 },
  { id: 'jounieh',  lat: 33.9808, lon: 35.6178 },
  { id: 'baalbek',  lat: 34.0047, lon: 36.2110 },
  { id: 'nabatieh', lat: 33.3772, lon: 35.4836 }
];
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast'
  + `?latitude=${CITIES.map(c => c.lat).join(',')}`
  + `&longitude=${CITIES.map(c => c.lon).join(',')}`
  + '&current=temperature_2m,weather_code,is_day'
  + '&daily=temperature_2m_max,temperature_2m_min&forecast_days=1'
  + '&timezone=Asia%2FBeirut';

const getWeather = cached(WEATHER_TTL_MS, async () => {
  const data = await fetchJson(WEATHER_URL);
  // Several locations come back as an array, one as an object.
  const list = Array.isArray(data) ? data : [data];
  const cities = CITIES.map((city, i) => {
    const d = list[i];
    const c = d && d.current;
    if (!c || typeof c.temperature_2m !== 'number') return null;
    const daily = d.daily || {};
    return {
      id: city.id,
      temperature: Math.round(c.temperature_2m),
      code: Number(c.weather_code),
      isDay: c.is_day === 1,
      high: Array.isArray(daily.temperature_2m_max) ? Math.round(daily.temperature_2m_max[0]) : null,
      low: Array.isArray(daily.temperature_2m_min) ? Math.round(daily.temperature_2m_min[0]) : null
    };
  }).filter(Boolean);
  if (!cities.length) throw new Error('unexpected weather response');
  const beirut = cities.find(c => c.id === 'beirut') || cities[0];
  // Top-level fields keep the earlier single-city shape working.
  return { updatedAt: new Date().toISOString(), ...beirut, cities };
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.get('/api/weather', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=900, s-maxage=1800, stale-while-revalidate=1800');
    res.json(await getWeather());
  } catch (err) {
    console.error('[weather]', err);
    res.status(502).json({ error: 'Failed to load weather' });
  }
});

app.get('/api/news', async (req, res) => {
  try {
    // Browsers keep it 5 min; Vercel's CDN keeps it 10 min and refreshes in the background.
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=600');
    res.json(await getNews());
  } catch (err) {
    console.error('[news]', err);
    res.status(502).json({ error: 'Failed to fetch news' });
  }
});

app.get('/api/radio', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=21600, stale-while-revalidate=3600');
    res.json(await getStations());
  } catch (err) {
    console.error('[radio]', err);
    res.status(502).json({ error: 'Failed to load radio stations' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

// ---------------------------------------------------------------------------
// Pages with their own share preview: /s/<station> and /d/<dedication>.
// Same page, but WhatsApp and others show what was shared.
// ---------------------------------------------------------------------------
const fs = require('fs');
let pageTemplate = null;
function readPage() {
  if (!pageTemplate) pageTemplate = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
  return pageTemplate;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function sendPreview(req, res, meta, fallbackQuery) {
  let html;
  try {
    html = readPage();
  } catch (err) {
    // If the page file isn't bundled with the server, the page itself
    // still understands the query string, so the link keeps working.
    console.error('[preview]', err.message);
    return res.redirect(302, `/?${fallbackQuery}`);
  }
  if (meta) {
    const title = escapeHtml(meta.title);
    const desc = escapeHtml(meta.description);
    const url = escapeHtml(`https://${req.get('host')}${req.originalUrl.split('?')[0]}`);
    html = html
      .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`)
      .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${desc}">`)
      .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`)
      .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  }
  res.set('Cache-Control', 'public, max-age=300, s-maxage=3600');
  res.type('html').send(html);
}

app.get('/s/:id', async (req, res) => {
  let meta = null;
  try {
    const { stations } = await getStations();
    const st = stations.find(s => s.id === req.params.id);
    if (st) meta = {
      title: `${st.name} · صوت البيت Sawt el Beit`,
      description: `اسمع ${st.name} مباشرة على صوت البيت. Listen to ${st.name} live on Sawt el Beit.`
    };
  } catch { /* generic preview */ }
  sendPreview(req, res, meta, `station=${encodeURIComponent(req.params.id)}`);
});

app.get('/d/:id', async (req, res) => {
  let meta = null;
  try {
    if (store.enabled) {
      const d = await dedications.one(req.params.id);
      if (d) {
        const from = d.fromPlace ? `${d.fromName} (${d.fromPlace})` : d.fromName;
        const to = d.toPlace ? `${d.toName} (${d.toPlace})` : d.toName;
        meta = {
          title: `💌 من ${from} إلى ${to} · صوت البيت`,
          description: `إهداء: ${d.song}${d.message ? ` · "${d.message}"` : ''}. From ${d.fromName} to ${d.toName}, on Sawt el Beit.`
        };
      }
    }
  } catch { /* generic preview */ }
  sendPreview(req, res, meta, `dedication=${encodeURIComponent(req.params.id)}`);
});

app.get('/v/:id', async (req, res) => {
  let meta = {
    title: '🎙️ رسالة بصوت حدا بيحبّك · صوت البيت',
    description: 'إهداء بالصوت مع أغنية. A voice dedication with a song, on Sawt el Beit.'
  };
  try {
    if (store.enabled) {
      const v = await voice.one(req.params.id);
      if (v) meta = {
        title: `🎙️ من ${v.fromName} لـ ${v.toName} · صوت البيت`,
        description: `رسالة بصوت ${v.fromName}${v.song && v.song.name ? ` مع ${v.song.name}` : ''}. A voice dedication from ${v.fromName} to ${v.toName}.`
      };
    }
  } catch { /* generic preview */ }
  sendPreview(req, res, meta, `v=${encodeURIComponent(req.params.id)}`);
});

app.get('/q/:id', async (req, res) => {
  let title = null;
  try { if (store.enabled) title = (await together.peek(req.params.id)).title; } catch { /* generic */ }
  sendPreview(req, res, {
    title: title ? `🛋️ ${title} · صوت البيت` : '🛋️ تعا نقعد سوا · صوت البيت',
    description: 'نفس الإذاعة، بنفس اللحظة، ولو كل واحد ببلد. Come and listen together on Sawt el Beit.'
  }, `listen=${encodeURIComponent(req.params.id)}`);
});

app.get('/admin', (req, res) => res.redirect(302, '/admin.html'));

// ---------------------------------------------------------------------------
// Features that need storage: alerts and dedications
// ---------------------------------------------------------------------------
const clientIp = req => String(req.get('x-forwarded-for') || req.socket.remoteAddress || '').split(',')[0].trim();

function needStore(req, res, next) {
  if (!store.enabled) return res.status(503).json({ error: 'not set up', code: 'no-store' });
  next();
}
async function needAdmin(req, res, next) {
  try {
    if (await admin.check(req)) return next();
  } catch (err) { return fail(res, err); }
  res.status(401).json({ error: 'sign in', code: 'auth' });
}
function fail(res, err) {
  const status = err.status || 500;
  if (status >= 500) console.error('[api]', err);
  res.status(status).json({ error: status >= 500 ? 'server error' : err.message, code: err.code || 'error' });
}
const noStore = (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); };

app.get('/api/config', noStore, async (req, res) => {
  const config = { alerts: false, dedications: store.enabled, publicKey: null };
  if (store.enabled) {
    try { config.publicKey = await alerts.publicKey(); config.alerts = true; } catch (err) { console.error('[config]', err.message); }
  }
  res.json(config);
});

app.post('/api/alerts/subscribe', noStore, needStore, async (req, res) => {
  try { await alerts.subscribe(req.body && req.body.subscription, req.body && req.body.lang); res.json({ ok: true }); }
  catch (err) { fail(res, err); }
});

app.post('/api/alerts/unsubscribe', noStore, needStore, async (req, res) => {
  try { await alerts.unsubscribe(req.body && req.body.endpoint); res.json({ ok: true }); }
  catch (err) { fail(res, err); }
});

// Called every 10 minutes by the scheduled GitHub workflow (and harmless to call by hand).
app.all('/api/alerts/check', noStore, needStore, async (req, res) => {
  try {
    const out = await alerts.check(getNews);
    try { Object.assign(out, await morning.maybeSend(weatherAt)); } catch (err) { console.error('[morning]', err.message); }
    res.json(out);
  } catch (err) { fail(res, err); }
});

app.get('/api/dedications', needStore, async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
    res.json({ items: await dedications.wall() });
  } catch (err) { fail(res, err); }
});

app.get('/api/dedications/:id', needStore, async (req, res) => {
  try {
    const d = await dedications.one(req.params.id);
    if (!d) return res.status(404).json({ error: 'not found', code: 'missing' });
    res.json(d);
  } catch (err) { fail(res, err); }
});

app.post('/api/dedications', noStore, needStore, async (req, res) => {
  try {
    const d = await dedications.submit(req.body || {}, clientIp(req));
    alerts.notifyAdmins({
      title: d.flagged ? '⚠️ إهداء جديد يحتاج مراجعة' : '💌 إهداء جديد بانتظار الموافقة',
      body: `${d.fromName} ← ${d.toName}: ${d.song}`,
      url: '/admin.html',
      tag: 'dedication-queue'
    });
    res.status(201).json({ ok: true, id: d.id });
  } catch (err) { fail(res, err); }
});

// ---- admin
// ---------------------------------------------------------------------------
// Listen together (rooms), voice dedications, exchange rates
// ---------------------------------------------------------------------------
const qTok = req => String(req.get('x-q-token') || (req.body && req.body.token) || req.query.token || '');
const qRoute = (fn) => async (req, res) => { try { res.json(await fn(req)); } catch (err) { fail(res, err); } };
app.post('/api/q', noStore, needStore, qRoute(req => together.create(req.body, clientIp(req))));
app.get('/api/q/:id/peek', noStore, needStore, qRoute(req => together.peek(req.params.id)));
app.post('/api/q/:id/join', noStore, needStore, qRoute(req => together.join(req.params.id, req.body, clientIp(req))));
app.get('/api/q/:id', noStore, needStore, qRoute(req => together.read(req.params.id, { ...req.query, token: qTok(req) })));
app.post('/api/q/:id/say', noStore, needStore, qRoute(req => together.say(req.params.id, { ...req.body, token: qTok(req) }, clientIp(req))));
app.post('/api/q/:id/voice', noStore, needStore, qRoute(req => together.voice(req.params.id, { ...req.body, token: qTok(req) }, clientIp(req))));
app.post('/api/q/:id/play', noStore, needStore, qRoute(req => together.play(req.params.id, { ...req.body, token: qTok(req) })));
app.post('/api/q/:id/game', noStore, needStore, qRoute(req => together.gameSet(req.params.id, { ...req.body, token: qTok(req) })));
app.post('/api/q/:id/move', noStore, needStore, qRoute(req => together.gameMove(req.params.id, { ...req.body, token: qTok(req) })));
app.post('/api/q/:id/game/end', noStore, needStore, qRoute(req => together.gameEnd(req.params.id, { ...req.body, token: qTok(req) })));
app.post('/api/q/:id/photo', noStore, needStore, qRoute(req => together.photo(req.params.id, { ...req.body, token: qTok(req) }, clientIp(req))));
app.post('/api/q/:id/push', noStore, needStore, qRoute(req => together.pushOn(req.params.id, { ...req.body, token: qTok(req) })));
app.post('/api/q/:id/push/off', noStore, needStore, qRoute(req => together.pushOff(req.params.id, { ...req.body, token: qTok(req) })));
app.post('/api/q/:id/del', noStore, needStore, qRoute(req => together.del(req.params.id, { ...req.body, token: qTok(req) })));
app.post('/api/q/:id/event', noStore, needStore, qRoute(req => together.event(req.params.id, { ...req.body, token: qTok(req) })));
app.post('/api/q/:id/playlist', noStore, needStore, qRoute(req => together.playlist(req.params.id, { ...req.body, token: qTok(req) }, clientIp(req))));
app.post('/api/q/:id/react', noStore, needStore, qRoute(req => together.react(req.params.id, { ...req.body, token: qTok(req) })));
app.post('/api/q/:id/typing', noStore, needStore, qRoute(req => together.typing(req.params.id, { ...req.body, token: qTok(req) })));
app.post('/api/q/:id/score', noStore, needStore, qRoute(req => together.score(req.params.id, { ...req.body, token: qTok(req) })));
app.get('/api/q/:id/scores', noStore, needStore, qRoute(req => together.scores(req.params.id, qTok(req))));
app.post('/api/q/:id/bday', noStore, needStore, qRoute(req => together.bday(req.params.id, { ...req.body, token: qTok(req) })));
app.post('/api/q/:id/greet', noStore, needStore, qRoute(req => together.greet(req.params.id, { ...req.body, token: qTok(req) }, clientIp(req))));
app.get('/api/q/:id/photo/:pid', needStore, async (req, res) => {
  try {
    const a = await together.image(req.params.id, req.params.pid, qTok(req));
    res.set('Cache-Control', 'private, max-age=604800, immutable');
    res.type(a.type).send(Buffer.from(a.data, 'base64'));
  } catch (err) { res.status(err.status || 500).end(); }
});
app.get('/api/q/:id/audio/:aid', needStore, async (req, res) => {
  try {
    const a = await together.audio(req.params.id, req.params.aid, qTok(req));
    res.set('Cache-Control', 'private, max-age=86400');
    res.type(a.type).send(Buffer.from(a.audio, 'base64'));
  } catch (err) { res.status(err.status || 500).end(); }
});

// "Who's home?": the same person on another device
app.post('/api/profile/login', noStore, needStore, qRoute(req => profiles.login(req.body, clientIp(req))));
app.post('/api/profile/save', noStore, needStore, qRoute(req => profiles.save(req.body)));
app.post('/api/profile/forget', noStore, needStore, qRoute(req => profiles.forget(req.body)));

// The family cookbook
app.get('/api/recipes', needStore, async (req, res) => {
  try { res.set('Cache-Control', 'public, max-age=60, s-maxage=300'); res.json({ items: await recipes.list() }); } catch (err) { fail(res, err); }
});
app.post('/api/recipes', noStore, needStore, async (req, res) => {
  try {
    const r = await recipes.submit(req.body, clientIp(req));
    alerts.notifyAdmins({ title: 'New recipe waiting', body: String(req.body && req.body.title || ''), url: '/admin', tag: 'recipe' }).catch(() => {});
    res.json(r);
  } catch (err) { fail(res, err); }
});

// Villages and their weather (Open-Meteo, free and keyless)
const placeCache = new Map();
app.get('/api/places', async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 40);
  if (q.length < 2) return res.json({ items: [] });
  const lang = ['ar', 'en', 'fr'].includes(req.query.lang) ? req.query.lang : 'en';
  const key = lang + ':' + q.toLowerCase();
  if (placeCache.has(key)) return res.json(placeCache.get(key));
  try {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=12&language=${lang}&format=json&countryCode=LB`, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(6000) });
    const data = await r.json();
    const items = ((data && data.results) || []).filter(x => x.country_code === 'LB').map(x => ({ id: x.id, name: x.name, area: x.admin2 || x.admin1 || '', lat: +x.latitude.toFixed(3), lon: +x.longitude.toFixed(3) }));
    const body = { items };
    if (placeCache.size > 500) placeCache.clear();
    placeCache.set(key, body);
    res.set('Cache-Control', 'public, max-age=86400');
    res.json(body);
  } catch (err) { console.error('[places]', err.message); res.json({ items: [] }); }
});
const atCache = new Map();
async function weatherAt(lat, lon) {
  const key = `${(+lat).toFixed(2)},${(+lon).toFixed(2)}`;
  const hit = atCache.get(key);
  if (hit && Date.now() - hit.t < 20 * 60e3) return hit.v;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FBeirut&forecast_days=4`;
  const r = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(6000) });
  const d = await r.json();
  if (!d || !d.current) throw new Error('no weather');
  const v = {
    temperature: Math.round(d.current.temperature_2m), code: d.current.weather_code, isDay: d.current.is_day,
    min: Math.round(d.daily.temperature_2m_min[0]), max: Math.round(d.daily.temperature_2m_max[0]),
    days: d.daily.time.map((t, i) => ({ date: t, code: d.daily.weather_code[i], min: Math.round(d.daily.temperature_2m_min[i]), max: Math.round(d.daily.temperature_2m_max[i]) }))
  };
  if (atCache.size > 300) atCache.clear();
  atCache.set(key, { t: Date.now(), v });
  return v;
}
app.get('/api/weather/at', async (req, res) => {
  const lat = Number(req.query.lat), lon = Number(req.query.lon);
  if (!(lat > 32.9 && lat < 34.8 && lon > 34.9 && lon < 36.8)) return res.status(400).json({ error: 'outside Lebanon', code: 'place' });
  try { res.set('Cache-Control', 'public, max-age=600, s-maxage=900'); res.json(await weatherAt(lat, lon)); }
  catch (err) { res.status(502).json({ error: 'weather unavailable', code: 'weather' }); }
});

// The 7 o'clock greeting
app.post('/api/morning/subscribe', noStore, needStore, qRoute(req => morning.subscribe(req.body)));
app.post('/api/morning/unsubscribe', noStore, needStore, qRoute(req => morning.unsubscribe(req.body)));

app.post('/api/voice', noStore, needStore, async (req, res) => {
  try { res.json(await voice.save(req.body, clientIp(req))); } catch (err) { fail(res, err); }
});
app.get('/api/voice/:id', noStore, needStore, async (req, res) => {
  try {
    const v = await voice.one(req.params.id);
    if (!v) return res.status(404).json({ error: 'gone', code: 'gone' });
    const { audio, ...meta } = v;
    res.json(meta);
  } catch (err) { fail(res, err); }
});
app.get('/api/voice/:id/audio', needStore, async (req, res) => {
  try {
    const v = await voice.one(req.params.id);
    if (!v) return res.status(404).end();
    res.set('Cache-Control', 'private, max-age=86400');
    res.type(v.type).send(Buffer.from(v.audio, 'base64'));
  } catch (err) { fail(res, err); }
});

// The dollar and a few currencies in Lebanese pounds, for the expat corner.
let ratesCache = null;
app.get('/api/rates', async (req, res) => {
  const fresh = ratesCache && Date.now() - ratesCache.fetched < 6 * 3600e3;
  if (!fresh) {
    try {
      const r = await fetch('https://open.er-api.com/v6/latest/USD', { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(6000) });
      const data = await r.json();
      if (data && data.rates && data.rates.LBP) {
        const keep = ['LBP', 'EUR', 'GBP', 'CAD', 'AUD', 'AED', 'SAR', 'QAR', 'KWD', 'CHF', 'SEK', 'BRL', 'MXN', 'NGN', 'CIV', 'XOF', 'TRY', 'EGP', 'JOD', 'CNY', 'JPY'];
        const rates = {};
        keep.forEach(k => { if (data.rates[k]) rates[k] = data.rates[k]; });
        ratesCache = { fetched: Date.now(), body: { base: 'USD', rates, updated: data.time_last_update_unix ? data.time_last_update_unix * 1000 : Date.now(), source: 'open.er-api.com' } };
      }
    } catch (err) { console.error('[rates]', err.message); }
  }
  res.set('Cache-Control', 'public, max-age=1800, s-maxage=3600');
  res.json(ratesCache ? ratesCache.body : { base: 'USD', rates: { LBP: 89500 }, updated: null, source: null });
});

app.get('/api/admin/status', noStore, needStore, async (req, res) => {
  try { res.json({ setUp: await admin.isSetUp(), signedIn: await admin.check(req) }); }
  catch (err) { fail(res, err); }
});
app.post('/api/admin/setup', noStore, needStore, async (req, res) => {
  try { res.json({ token: await admin.setup(req.body && req.body.password) }); }
  catch (err) { fail(res, err); }
});
app.post('/api/admin/login', noStore, needStore, async (req, res) => {
  try { res.json({ token: await admin.login(req.body && req.body.password, clientIp(req)) }); }
  catch (err) { fail(res, err); }
});
app.post('/api/admin/logout', noStore, needStore, async (req, res) => {
  try { await admin.logout(req); res.json({ ok: true }); }
  catch (err) { fail(res, err); }
});
app.get('/api/admin/queue', noStore, needStore, needAdmin, async (req, res) => {
  try { res.json({ items: await dedications.pending() }); }
  catch (err) { fail(res, err); }
});
app.get('/api/admin/wall', noStore, needStore, needAdmin, async (req, res) => {
  try { res.json({ items: await dedications.wall() }); }
  catch (err) { fail(res, err); }
});
app.post('/api/admin/decide', noStore, needStore, needAdmin, async (req, res) => {
  try {
    const { id, approve } = req.body || {};
    const d = await dedications.decide(String(id || ''), Boolean(approve));
    res.json({ ok: true, status: d.status });
  } catch (err) { fail(res, err); }
});
app.post('/api/admin/remove', noStore, needStore, needAdmin, async (req, res) => {
  try { await dedications.remove(String((req.body && req.body.id) || '')); res.json({ ok: true }); }
  catch (err) { fail(res, err); }
});
app.get('/api/admin/recipes', noStore, needStore, needAdmin, qRoute(async () => ({ pending: await recipes.pending(), approved: await recipes.list() })));
app.post('/api/admin/recipes/decide', noStore, needStore, needAdmin, qRoute(async req => { const r = await recipes.decide(String(req.body.id || ''), Boolean(req.body.approve)); return { ok: true, status: r.status }; }));
app.post('/api/admin/recipes/remove', noStore, needStore, needAdmin, qRoute(async req => { await recipes.remove(String(req.body.id || '')); return { ok: true }; }));
app.get('/api/admin/stats', noStore, needStore, needAdmin, async (req, res) => {
  try { res.json({ subscribers: await alerts.stats(), pending: (await dedications.pending()).length, store: store.kind }); }
  catch (err) { fail(res, err); }
});
app.post('/api/admin/alerts-subscribe', noStore, needStore, needAdmin, async (req, res) => {
  try { await alerts.subscribe(req.body && req.body.subscription, 'ar', 'admin'); res.json({ ok: true }); }
  catch (err) { fail(res, err); }
});
app.post('/api/admin/test-alert', noStore, needStore, needAdmin, async (req, res) => {
  try {
    const sent = await alerts.notifyAdmins({ title: 'صوت البيت', body: 'تجربة: الإشعارات تعمل ✅ Test: notifications work.', url: '/', tag: 'test' });
    res.json({ ok: true, sent });
  } catch (err) { fail(res, err); }
});

app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

// Run as a normal server locally (npm start); on Vercel the exported app is used.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Sawt el Beit running on port ${PORT}`);
  });
}

module.exports = app;

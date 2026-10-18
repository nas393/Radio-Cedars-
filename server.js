const path = require('path');
const express = require('express');
const Parser = require('rss-parser');

const app = express();
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

// Shared station links: /s/<station id>. Same page, but the preview that
// WhatsApp and others show names the station.
const fs = require('fs');
let pageTemplate = null;
function readPage() {
  if (!pageTemplate) pageTemplate = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
  return pageTemplate;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

app.get('/s/:id', async (req, res) => {
  let html;
  try {
    html = readPage();
  } catch (err) {
    // If the page file isn't bundled with the server, the page itself
    // still understands ?station=, so the link keeps working.
    console.error('[share]', err.message);
    return res.redirect(302, `/?station=${encodeURIComponent(req.params.id)}`);
  }
  let name = null;
  try {
    const { stations } = await getStations();
    const st = stations.find(s => s.id === req.params.id);
    if (st) name = st.name;
  } catch { /* fall back to the generic preview */ }

  if (name) {
    const title = escapeHtml(`${name} · صوت البيت Sawt el Beit`);
    const desc = escapeHtml(`اسمع ${name} مباشرة على صوت البيت. Listen to ${name} live on Sawt el Beit.`);
    const url = escapeHtml(`https://${req.get('host')}/s/${encodeURIComponent(req.params.id)}`);
    html = html
      .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`)
      .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${desc}">`)
      .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`)
      .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  }
  res.set('Cache-Control', 'public, max-age=300, s-maxage=3600');
  res.type('html').send(html);
});

app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

// Run as a normal server locally (npm start); on Vercel the exported app is used.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Sawt el Beit running on port ${PORT}`);
  });
}

module.exports = app;

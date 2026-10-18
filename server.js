const path = require('path');
const express = require('express');
const Parser = require('rss-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const USER_AGENT = 'Warde/1.1 (Lebanese Diaspora Hub)';

// ---------------------------------------------------------------------------
// News feeds
// ---------------------------------------------------------------------------
const FEEDS = [
  { name: 'Annahar (Arabic)', url: 'https://www.annahar.com/rss/article.xml' },
  { name: "L'Orient Today (English)", url: 'https://today.lorientlejour.com/feed.xml' },
  { name: 'Al-Manar English', url: 'https://eng.almanar.com.lb/feed.php' },
  { name: 'The961 (English)', url: 'https://www.the961.com/feed' }
];

const ITEMS_PER_FEED = 6;
const NEWS_TTL_MS = 10 * 60 * 1000;        // refresh news every 10 minutes
const RADIO_TTL_MS = 6 * 60 * 60 * 1000;   // refresh station list every 6 hours

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': USER_AGENT }
});

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

const getNews = cached(NEWS_TTL_MS, async () => {
  const results = await Promise.allSettled(FEEDS.map(f => parser.parseURL(f.url)));
  const sources = results.map((result, i) => {
    if (result.status !== 'fulfilled') {
      console.warn(`[news] ${FEEDS[i].name} failed: ${result.reason && result.reason.message}`);
      return { source: FEEDS[i].name, ok: false, items: [] };
    }
    const items = (result.value.items || [])
      .map(item => ({
        title: cleanText(item.title),
        link: safeUrl(item.link),
        date: toIsoDate(item.isoDate || item.pubDate)
      }))
      .filter(item => item.title && item.link)
      .slice(0, ITEMS_PER_FEED);
    return { source: FEEDS[i].name, ok: true, items };
  });
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
      const seen = new Set();
      const stations = [];
      for (const s of raw) {
        const url = safeUrl(s.url_resolved || s.url);
        const name = cleanText(s.name, 80);
        if (!url || !url.startsWith('https:') || !name || s.lastcheckok !== 1) continue;
        const key = name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
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
// Routes
// ---------------------------------------------------------------------------
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

app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

// Run as a normal server locally (npm start); on Vercel the exported app is used.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Wardé running on port ${PORT}`);
  });
}

module.exports = app;

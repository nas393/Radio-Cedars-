# 🇱🇧 صوت البيت · Sawt el Beit

"The sound of home": Lebanese radio, news from Lebanon and live Lebanese TV in one page, for Lebanese abroad. Live at https://radio-cedars.vercel.app

## What's on the page

- **The window home**: the page opens on the triple-arched window of a Lebanese house. Through it you see Beirut's sky as it is right now: the sun and moon are placed from Beirut's real solar position and moon phase, and clouds and rain follow Beirut's current weather.
- **The radio on the sill**: swipe the dial under the needle to tune, with a burst of static between stations. Working Lebanese stations come from the free [Radio Browser](https://www.radio-browser.info) directory. Favourites, search, a Fairuz filter, lock-screen controls and a mini-player.
- **الزمن الجميل (Classics)**: Fairuz, Wadih El Safi, Sabah and Zaki Nassif in three moods (Morning coffee, Sunday lunch at Teta's, Homesick), each song with YouTube and Spotify links, plus one tap to put the radio on in that mood.
- **Dedications home**: send a song and a message to family in Lebanon. Automatic checks block links, phone numbers and floods (3 an hour); rude words are flagged; nothing appears until it's approved on `/admin`. Each dedication has a share link (`/d/<id>`) with its own WhatsApp preview.
- **Breaking-news alerts**: phone notifications in the reader's language when big news breaks (explicit "breaking" markers or major events), checked every 10 minutes by a GitHub workflow, never repeated, at most 4 a day.
- **Morning alarm and sleep timer**, **news** from Annahar, L'Orient-Le Jour, L'Orient Today, Al-Manar English and The961, **live TV** links, **weather for 8 cities**.
- **Arabic, English and French**, right-to-left aware, installable to the home screen.

## Turning on dedications and alerts

They need a small free database:

1. In Vercel, open the project, then **Storage** → **Create** → **Upstash for Redis** (free plan) → connect it to this project.
2. Redeploy (Deployments → ⋯ → Redeploy).
3. Open `/admin` straight away and create the admin password.

Until then the site works as before and those two sections stay hidden.

## Run it

Requires Node.js 18 or newer.

```bash
npm install
npm start
```

Then open http://localhost:3000.

## API

| Route | Returns |
|---|---|
| `GET /api/news` | Headlines grouped by source (`ok: false` if a source is down) |
| `GET /api/radio` | Working HTTPS radio stations |
| `GET /api/weather` | Current weather for 8 Lebanese cities (Open-Meteo) |
| `GET /s/:id` | The page, with a share preview naming that station |
| `GET /d/:id` | The page, with a share preview for that dedication |
| `GET /api/config` | Which optional features are switched on |
| `GET/POST /api/dedications` | The wall / send a dedication |
| `POST /api/alerts/subscribe` | Turn on alerts for a browser |
| `POST /api/alerts/check` | Look for breaking news and alert (called every 10 minutes) |
| `/api/admin/*` | Moderation (password protected) |
| `GET /api/health` | `{ "ok": true }` |

## Adding sources

- News feeds: edit `FEEDS` in `server.js`.
- TV channels: edit `TV` in `public/app.js` (use the channel's YouTube handle, without the `@`).

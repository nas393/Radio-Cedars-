# 🇱🇧 صوت البيت · Sawt el Beit

"The sound of home": Lebanese radio, news from Lebanon and live Lebanese TV in one page, for Lebanese abroad. Live at https://radio-cedars.vercel.app

## What's on the page

The site is a room: a photoreal 1990s Beirut living room (rendered in Blender) that you walk into and look around by dragging or swiping. Every object in it works.

- **The walk-in and the light**: you start at the door and step in. The room's light follows Beirut's real sun: sunrise, midday, afternoon, sunset over the sea, and night with the coast lit up. Tap the time chip to change it yourself.
- **The radio**: swipe the dial under the needle to tune, with a burst of static between stations. Working Lebanese stations come from the free [Radio Browser](https://www.radio-browser.info) directory. Favourites, search, a Fairuz filter, lock-screen controls and a mini-player.
- **The cassettes**: twelve tapes, one per mood (morning coffee with Fairuz, Sunday dabke, homesick nights, 90s pop, the mountain road, weddings, Batroun beach, rainy Beirut, Christmas and Eid, kids' songs, national songs, Ziad Rahbani's plays), opening in Spotify, plus the golden-age classics with one tap to tune the radio to that mood.
- **The telephone and the family photos**: send a song and a message to family in Lebanon, and read the dedications wall. Automatic checks block links, phone numbers and floods (3 an hour); rude words are flagged; nothing appears until it's approved on `/admin`. Each dedication has a share link (`/d/<id>`) with its own WhatsApp preview.
- **The newspaper**: news from Annahar, L'Orient-Le Jour, L'Orient Today, Al-Manar English and The961, with **breaking-news alerts** (checked every 10 minutes by a GitHub workflow, at most 4 a day).
- **The TV** (live channels), **the window** (weather for 8 cities), **the clock** (Beirut time and a morning alarm), **the lamp** (sleep timer), **the calendar** (Lebanese occasions, today's sunrise and sunset, iftar in Ramadan), **the coffee cup** (a cup reading, for fun) and **Teta's notebook** (recipes).
- **Arabic, English and French**, right-to-left aware, installable to the home screen. Deep links open an object directly: `/#radio`, `/#news`, `/#cassettes`…

The room's images live in `public/room/` (equirectangular panoramas at 4K and 2K, one per time of day). 3D models of the chairs, plant, vase and teacups are from the [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) (CC BY 4.0 and CC0).

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

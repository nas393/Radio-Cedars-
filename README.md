# 🇱🇧 صوت البيت · Sawt el Beit

"The sound of home": Lebanese radio, news from Lebanon and live Lebanese TV in one page, for Lebanese abroad. Live at https://radio-cedars.vercel.app

## What's on the page

The site is a room: a 1990s Lebanese living room (patchwork sofa, the painting of the bay, the flag, the pendulum clock, the hi-fi on the dresser, the CRT in the wooden unit, tawleh on the coffee table, bougainvillea on the balcony). Slide to look around, pinch to come closer, tap any object. Every object works. It installs on phones like an app.

- **Three lights**: Day, Sunset and Night, chosen by Beirut's sun. The season and Beirut's real weather tint the light (grey and cool when it rains, warm in summer). The time pill at the top (or the air conditioner) lets you choose yourself.
- **Alive**: rain runs down the balcony glass when it rains in Beirut (lightning in storms), city lights shimmer across the bay at night, steam rises from the tea, the room breathes a little when you leave it alone, and now and then the power cuts and the neighbourhood generator kicks in ("عالموتير"; can be switched off). Optional room sounds (clock, rain, kettle, crickets, cicadas, the generator) are made live with Web Audio.
- **The calendar dresses the room**: lights and a star in December, lanterns and a crescent in Ramadan, red-and-white bunting for Independence Day (drawn on the picture; try `/?decor=xmas`).
- **Tawleh** (on the coffee table): full backgammon rules, against Abou Samir (the computer, with opinions), two players on one phone, or a friend far away: each turn travels as a WhatsApp link (`/?t=…`). A "mars" counts double.
- **Listen together** (the sofa): start a sitting, send the link (`/q/<id>`), and whoever opens it hears what you play at the same moment and can write a few words. Rooms are private and vanish after 12 hours. Without the store, it still shares the station or tape by link.
- **Voice dedications** (the photos on the dresser): record up to 40 seconds for mama or teta and pick a song; they hear your voice, then the song starts. Private link `/v/<id>` (30 days) with the store; otherwise the recording itself is shared.
- **Far from home** (the painting of the bay): Beirut time next to yours and whether it's a good moment to call, Beirut weather, the dollar (and your currency) in lira, and a countdown to your next trip home.
- **Teta's chair / Simple mode ("كبّر")**: big buttons for relatives who won't swipe around a room.
- **Your family photos on the wall**: pick photos and they hang in the frames; they stay in your browser.
- **The radio**: swipe the dial under the needle to tune, with a burst of static between stations. Working Lebanese stations come from the free [Radio Browser](https://www.radio-browser.info) directory. Favourites, search, a Fairuz filter, lock-screen controls and a mini-player.
- **The tapes**: twelve tapes, one per mood. They play inside the page: YouTube playlists (full songs for everyone) or Spotify (full songs when logged in to Spotify, previews otherwise). The radio and the tapes never play over each other.
- **The written dedications wall**: send a song and a message; automatic checks block links, phone numbers and floods; nothing appears until it's approved on `/admin`. Each has a share link (`/d/<id>`).
- **The newspaper**: news from Annahar, L'Orient-Le Jour, L'Orient Today, Al-Manar English and The961, with **breaking-news alerts**.
- **The TV**: LBCI, MTV, Al Jadeed and OTV live, playing inside the page and on the TV set in the room. **The balcony** (weather for 8 cities), **the clock** (Beirut time and a morning alarm), **the lamp** (sleep timer), **occasions** (Lebanese holidays, sunrise and sunset, iftar in Ramadan), **the coffee cup** (a cup reading, for fun) and **Teta's table** (recipes).
- **Arabic, English and French**, right-to-left aware. Deep links open an object directly: `/#radio`, `/#tawleh`, `/#together`…

The room's pictures live in `public/room/` (`day`, `sunset`, `night`, each with a light `-s` version), upscaled with Real-ESRGAN. Hotspot positions are in `room.js` (`SPOTS`, `TV`, `FRAMES`).

## Turning on dedications, alerts, live sittings and voice links

They need a small free database:

1. In Vercel, open the project, then **Storage** → **Create** → **Upstash for Redis** (free plan) → connect it to this project.
2. Redeploy (Deployments → ⋯ → Redeploy).
3. Open `/admin` straight away and create the admin password.

Until then everything else works: tawleh, the expat corner, and sharing by link (listen together shares the station or tape; voice dedications share the recording itself).

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
| `GET /v/:id`, `GET /q/:id` | The page, with a share preview for a voice dedication / a sitting |
| `GET /api/config` | Which optional features are switched on |
| `POST /api/q`, `GET /api/q/:id`, `POST /api/q/:id/{hello,say,play}` | Listen-together sittings |
| `POST /api/voice`, `GET /api/voice/:id[/audio]` | Voice dedications |
| `GET /api/rates` | The dollar and other currencies in Lebanese pounds |
| `GET/POST /api/dedications` | The wall / send a dedication |
| `POST /api/alerts/subscribe` | Turn on alerts for a browser |
| `POST /api/alerts/check` | Look for breaking news and alert (called every 10 minutes) |
| `/api/admin/*` | Moderation (password protected) |
| `GET /api/health` | `{ "ok": true }` |

## Adding sources

- News feeds: edit `FEEDS` in `server.js`.
- TV channels: edit `TV` in `public/app.js` (use the channel's YouTube handle, without the `@`).

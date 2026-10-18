# 🇱🇧 صوت البيت · Sawt el Beit

"The sound of home": Lebanese radio, news from Lebanon and Lebanese TV shows in one page, for Lebanese abroad. Live at https://radio-cedars.vercel.app

## What's on the page

The site is a room: a 1990s Lebanese living room (patchwork sofa, the painting of the bay, the flag, the pendulum clock, the hi-fi on the dresser, the CRT in the wooden unit, tawleh on the coffee table, bougainvillea on the balcony). Slide to look around, pinch to come closer, tap any object. Every object works. It installs on phones like an app.

- **Three lights**: Day, Sunset and Night, chosen by Beirut's sun. The season and Beirut's real weather tint the light (grey and cool when it rains, warm in summer). The time pill at the top (or the air conditioner) lets you choose yourself.
- **Alive**: rain runs down the balcony glass when it rains in Beirut (lightning in storms), city lights shimmer across the bay at night, steam rises from the tea, the room breathes a little when you leave it alone, and now and then the power cuts and the neighbourhood generator kicks in ("عالموتير"; can be switched off). Optional room sounds (clock, rain, kettle, crickets, cicadas, the generator) are made live with Web Audio.
- **The calendar dresses the room**: lights and a star in December, lanterns and a crescent in Ramadan, red-and-white bunting for Independence Day (drawn on the picture; try `/?decor=xmas`).
- **Tawleh** (on the coffee table): full backgammon rules, against Abou Samir (the computer, with opinions), two players on one phone, or a friend far away: each turn travels as a WhatsApp link (`/?t=…`). A "mars" counts double.
- **Who's home?** Each person in the family has their own corner (name, picture, favourites, village, recipes, scores, photos), with an optional easy passcode (4–8 digits) on a shared phone. With the store on, the same username and passcode bring a person's things to any device.
- **The TV stays on the set**: once on, the channel's playlist plays on the CRT in the room and keeps playing while you open other things; the sound steps aside when the radio or a tape plays. On the side of the set: power, a volume knob you turn like the old ones, channel up/down, skip to the next video, and a big-screen button.
- **Family rooms** (the sofa): a private room behind a passcode its creator picks (`/q/<id>`). Inside: who's here, the same station or tape for everyone at the same moment, written and voice messages back and forth (mama can answer by voice), and a card table for the family.
- **Voice dedications** (the photos on the dresser): record up to 40 seconds and pick a song; it goes into a family room (new or existing) with a passcode, and they answer by voice. Without the store, the recording itself is shared.
- **Cards on the coffee table**: Tarneeb (bids 7–13, trump, game to 41) and Likha (pass 3, hearts 1, queen of spades 13, ten of diamonds 10, the must-play rule, 101 ends it), against the computer, or with the family in a room (empty seats are computer players).
- **My village** (the balcony): pick your village for its weather now and the next days, the dedications sent there, and a button to send one.
- **Good morning**: in the morning (Beirut time) a greeting with your name, the day's weather for Beirut or your village, a steaming cup and Fairuz one tap away; or a notification every day at 7 am Beirut time (with alerts on).
- **Teta's table** (the dining table): 29 Lebanese recipes in three languages, a step-by-step cooking mode with timers when a step needs one (several can run, the screen stays on), and your own recipes with your name: kept on your device, sent by link, or offered to the family cookbook (approved on `/admin`).
- **Far from home** (the painting of the bay): Beirut time next to yours and whether it's a good moment to call, Beirut weather, the dollar (and your currency) in lira, and a countdown to your next trip home.
- **Teta's chair / Simple mode ("كبّر")**: big buttons for relatives who won't swipe around a room.
- **Your family photos on the wall**: pick photos and they hang in the frames; they stay in your browser.
- **The radio**: swipe the dial under the needle to tune, with a burst of static between stations. Working Lebanese stations come from the free [Radio Browser](https://www.radio-browser.info) directory. Favourites, search, a Fairuz filter, lock-screen controls and a mini-player.
- **The tapes**: twelve tapes, one per mood. They play inside the page: YouTube playlists (full songs for everyone) or Spotify (full songs when logged in to Spotify, previews otherwise). The radio and the tapes never play over each other.
- **The written dedications wall**: send a song and a message; automatic checks block links, phone numbers and floods; nothing appears until it's approved on `/admin`. Each has a share link (`/d/<id>`).
- **The newspaper**: news from Annahar, L'Orient-Le Jour, L'Orient Today, Al-Manar English and The961, with **breaking-news alerts**.
- **The TV**: no live streams and nothing paid. Six Lebanese channels (LBCI, MTV, Al Jadeed, OTV, NBN, Télé Liban) as remote buttons; press one to see its official YouTube playlists (programmes, series, bulletins, latest uploads, about 140 in all, in `public/tv-channels.js`), pick one and it plays embedded on the TV set in the room. Videos a channel won't let other sites show are skipped automatically. **The balcony** (weather for 8 cities), **the clock** (Beirut time and a morning alarm), **the lamp** (sleep timer), **occasions** (Lebanese holidays, sunrise and sunset, iftar in Ramadan), **the coffee cup** (a cup reading, for fun) and **Teta's table** (recipes).
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
| `POST /api/profile/{login,save,forget}` | A person's settings on all their devices (username + passcode) |
| `GET /api/q/:id/peek`, `POST /api/q/:id/join`, `/say`, `/voice`, `/play`, `/game`, `/move` | Family rooms (passcode, chat, voice, card table) |
| `GET/POST /api/recipes` | The family cookbook |
| `GET /api/places?q=`, `GET /api/weather/at?lat&lon` | Lebanese villages and their weather |
| `POST /api/morning/subscribe` | The 7 o'clock greeting |
| `GET/POST /api/dedications` | The wall / send a dedication |
| `POST /api/alerts/subscribe` | Turn on alerts for a browser |
| `POST /api/alerts/check` | Look for breaking news and alert (called every 10 minutes) |
| `/api/admin/*` | Moderation (password protected) |
| `GET /api/health` | `{ "ok": true }` |

## Adding sources

- News feeds: edit `FEEDS` in `server.js`.
- TV channels: edit `TV` in `public/app.js` (use the channel's YouTube handle, without the `@`).

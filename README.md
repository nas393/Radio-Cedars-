# 🇱🇧 صوت البيت · Sawt el Beit

"The sound of home": Lebanese radio, news from Lebanon and live Lebanese TV in one page, for Lebanese abroad. Live at https://radio-cedars.vercel.app

## What's on the page

- **The radio dial**: swipe or drag the scale under the needle to tune, like an old radio, with a short burst of static between stations. Working Lebanese stations come automatically from the free [Radio Browser](https://www.radio-browser.info) directory (HTTPS streams that passed its latest check), refreshed every 6 hours.
- **Favourites and memory**: star stations, filter to favourites or Fairuz, and the last station is remembered.
- **Lock-screen controls**: play, stop and next/previous station from the phone's lock screen.
- **Beirut time and weather** next to your local time, and between 6 and 10 am Beirut time a one-tap "Fairuz in the morning".
- **News**: Annahar, L'Orient-Le Jour (French), L'Orient Today, Al-Manar English and The961 in tabs. Direct feeds first, Google News for the same outlet when a site blocks servers. Refreshed every 10 minutes.
- **TV**: LBCI, MTV Lebanon, Al Jadeed and OTV open their official YouTube live pages.
- **Morning alarm and sleep timer**: wake up to any station with a slow fade-in (snooze included), or let the radio switch itself off after 15–90 minutes.
- **Search and share**: find a station by name; share it as a link (`/s/<station>`) whose WhatsApp preview names the station.
- **Mini-player** that stays on screen while you read the news.
- **Weather across Lebanon**: Beirut, Tripoli, Saida, Tyre, Zahle, Jounieh, Baalbek and Nabatieh.
- **Arabic, English and French**, right-to-left aware, and installable to the home screen.

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
| `GET /api/health` | `{ "ok": true }` |

## Adding sources

- News feeds: edit `FEEDS` in `server.js`.
- TV channels: edit `TV` in `public/app.js` (use the channel's YouTube handle, without the `@`).

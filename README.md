# 🇱🇧 Wardé (وردة) — Lebanese Diaspora Hub

One page for Lebanese abroad: the latest headlines from Lebanon, live Lebanese radio, and quick links to the main TV channels' live broadcasts.

## What's on the page

- **News**: the latest headlines from Annahar, L'Orient Today, Al-Manar English and The961. Refreshed on the server every 10 minutes; the page updates itself while open.
- **Radio**: working Lebanese stations, pulled automatically from the free [Radio Browser](https://www.radio-browser.info) directory. Only streams that passed the directory's latest check and use HTTPS are listed, so dead or browser-blocked stations don't appear. The list refreshes every 6 hours.
- **TV**: LBCI, MTV Lebanon, Al Jadeed and OTV. Each card opens the channel's official YouTube live page.

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
| `GET /api/health` | `{ "ok": true }` |

## Adding sources

- News feeds: edit `FEEDS` in `server.js`.
- TV channels: edit `tvChannels` in `public/index.html` (use the channel's YouTube handle, without the `@`).

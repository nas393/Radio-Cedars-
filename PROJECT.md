# Sawt el Beit (صوت البيت) — project brief

The working memory for this project. Upload it as a file in the Claude Project. It also lives in the repo as `PROJECT.md`.

## What it is

**Sawt el Beit** ("the sound of home") is a web app for Lebanese families living abroad. It is shaped as a **1990s Lebanese living room**, built from the owner's own photos of the room by day, at sunset and at night. Every object in the room opens something.

- **Live site:** https://radio-cedars.vercel.app. It can be installed on the home screen as an app.
- **Owner:** Nassim, who is not a developer. He writes short requests in English, sometimes with typos, and wants finished, working changes.
- **Languages:** Arabic (Lebanese dialect, right to left), English and French. All three are written by hand, never machine-literal.
- **Rule from the owner:** "you are allowed to do anything to make it all work, **except payments**". Nothing paid, and no live TV streams.

## Where things live

| What | Where |
|---|---|
| Code | GitHub `nas393/Radio-Cedars-`. Work on branch `room`, then fast-forward `main`. |
| Hosting | Vercel project `radio-cedars`. A push to `room` gives a preview; a push to `main` goes to production. |
| Database | Upstash Redis, free tier, created by Nassim in Vercel → Storage. The app reads `KV_REST_API_URL` and `KV_REST_API_TOKEN`. |
| Server | `server.js` (Express) and `lib/*.js`: rooms, profiles, alerts, morning greeting, recipes, voice, admin. |
| Page | `src/index.html` is the source. `npm run build` writes `public/index.html`, `public/dist/app.js` and `public/dist/app.css`. |
| Front-end scripts | `public/*.js`. Each is one feature in its own `(() => { … })()` block. |
| Styles | `public/app.css` and `public/room.css` (most of the look). |
| Offline copy | `public/sw.js`. The build sets its cache name automatically. |

## How to make a change (every time)

1. Edit the files in `public/`, `lib/`, `server.js` or `src/index.html`.
2. Run `npm run build`. **Always do this after changing front-end files**, or the live page won't change.
3. Test locally with `PORT=3460 SAWT_MEMORY_STORE=1 node server.js` and Playwright (Chromium is pre-installed). Test as two people on two simulated phones for anything shared.
4. Commit to `room`, wait for the Vercel preview, then fast-forward `main` and push. Check that production shows success.
5. Tell Nassim in plain words what changed and what to try. Remind him to close and reopen the app to get the new version.

## The room: objects and what they do

| Object | Feature |
|---|---|
| Door | Asks your name first; after that, "who's coming in?" (pick a person, add someone new, or sign in with an account from another device) |
| Radio | Lebanese stations from Radio Browser; non-Lebanese feeds are filtered out in `server.js` |
| TV | Six Lebanese channels (LBCI, MTV, Al Jadeed, OTV, NBN, Télé Liban) as remote buttons. Each opens its YouTube playlists (`tv-channels.js`). They play on the TV set in the room. No live streams. |
| Cassettes | Twelve mood tapes (YouTube or Spotify playlists) |
| Newspaper | Lebanese news with breaking-news alerts; each person can hide sources (⚙︎) |
| Sofa (قعدة سوا) | Family rooms behind a passcode. Chat with text, voice notes, photos, reactions, replies, delete, "seen by", typing, quick words and the doorbell. Also: listening together, the room's song list, alerts when the app is closed, and **＋ ادعي حدا** to invite |
| Coffee table | Tawleh, Tarneeb, Likha and trivia night, alone against the computer or online in a room. The computer fills empty seats or plays for absent players. Also game invitations, rematch and a scoreboard (🏆). |
| Phone | Voice message with a song, sent into the family room |
| Calendar | Lebanese occasions, sunrise and sunset, iftar, family birthdays and name days, family events with countdowns, and the Lebanese word of the day |
| Balcony | Weather for Beirut and 7 more cities, and "my village" |
| Painting of the bay | Far from home: both clocks, a good time to call, the lira, and a countdown to the next trip |
| Dining table | Teta's 29 recipes, cooking mode with timers, and your own recipes |
| Clock and lamp | Alarm, sleep timer |
| Time pill at the top | Time of day, weather (rain or snow), occasion (Christmas or Ramadan decorations), room sounds, power cuts (off by default) |
| Teta's chair | Simple big-button mode (stays at full size) |
| Morning | A 7 am Beirut greeting with Fairuz and the weather |

## Design rules Nassim has asked for

- On phones it starts a little closer; double-tap shows the whole room. Small dots and names over the room.
- Fonts are small everywhere, but tap targets stay big. Teta's chair stays large.
- Family photos stay on each phone; they are **not shared**.
- The public dedications wall was removed. Family rooms replaced it.
- Keep it easy for older relatives: one tap where possible, plain Lebanese wording.

## Things to watch

- **Database use:** Upstash's free tier has a monthly limit. Chat polling backs off when quiet; games use light reads (`since=999999999` skips the chat).
- **Untested with real people:** the game hand-off when the host leaves, the computer taking over an away player, and real push notifications on phones.
- **iPhone:** notifications only work after "Add to Home Screen".
- **YouTube:** some videos refuse to play inside other sites; the TV skips them automatically.
- **Admin:** the `/admin` page (password set on first visit) moderates the family cookbook.

## Ideas offered but not chosen

- Teta's voice recipes, a shared photo album, and a "call mama" button.

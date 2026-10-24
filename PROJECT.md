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
| Console (الأتاري) under the TV | Four cartridges of our own (tennis, wall breaker, snake, space war), with the on-screen pad, drag or the keyboard; best scores and a big screen. Tennis three ways: against the computer, two on one phone, or live on two phones (trial, WebRTC with free STUN only; signalling through `/api/q/:id/rtc`). "Beat my score" challenges post to the room chat with a button; this week's console champions show on the scoreboard (`atari.js`, `/api/q/:id/arcade`) |
| 🙂 button at the top | My corner: name, picture, passcode, account, switch person, sign out, language, text size, Teta's chair, sounds, power cuts, weather, newspapers, install, my rooms, scores, events, help, and erase this phone |
| Morning | A 7 am Beirut greeting with Fairuz and the weather |
| Bottom bar (phones) | Radio, TV, chat, games, everything (`bar.js`); on for phones, off for computers, switchable in My corner |
| /radio | Teta's radio on its own page with its own home-screen icon (`radio.webmanifest`); no door, no names |

## Design rules Nassim has asked for

- **Mainly used on phones.** Design for the phone first.
- Ask Nassim before building anything new; act as a devil's advocate and keep him in the loop.
- On phones it starts a little closer; double-tap shows the whole room. Small dots and names over the room.
- The chat is full screen on phones (like WhatsApp); room extras sit behind "⋯ أكتر". Hold the mic to talk.
- Fonts are small everywhere, but tap targets stay big. Teta's chair stays large.
- Family photos stay on each phone; they are **not shared**.
- The public dedications wall was removed. Family rooms replaced it.
- Keep it easy for older relatives: one tap where possible, plain Lebanese wording.

## Things to watch

- **Database use:** Upstash's free tier has a monthly limit. Chat polling backs off when quiet; games use light reads (`since=999999999` skips the chat).
- **Untested with real people:** the game hand-off when the host leaves, the computer taking over an away player, real push notifications on phones, quiet hours, hold-to-talk, and live tennis on mobile data.
- **Quiet hours** cover chat and "your turn" alerts only; the morning greeting and breaking news keep their own switches. A room can also be muted.
- **Console scores** are sent by the phone, so a determined cheater could fake one. Fine for a family.
- **iPhone:** notifications only work after "Add to Home Screen".
- **YouTube:** some videos refuse to play inside other sites; the TV skips them automatically.
- **Admin:** the `/admin` page (password set on first visit) moderates the family cookbook.

## Ideas offered but not chosen

- Teta's voice recipes, a shared photo album, a "call mama" button, and a family birthday card.

## Room eras

- Eight rooms: 1980s, 1990s, 2000s and 2026, each as a **Beirut apartment** or a **village house**. Today's photo room is the 1990s apartment; the other seven were made with Gemini in Nassim's browser and chosen by him.
- Pictures live in `public/room/<era>/` (`80s`, `80sh`, `90sh`, `00s`, `00sh`, `26`, `26h`): day, sunset, night, the small `-s` copies, and `thumb-<object>.jpg`.
- Each era's spots, TV corners, photo frames, window glass, coffee steam and curtain line are in `public/eras.js`. Per-era names: e.g. records instead of tapes in 2026.
- The door asks "which living room?" (era cards, then apartment / village house), and 🙂 My corner can switch. The choice is per phone.
- All eight are live (since 21 Oct 2026). A new era can be added with `ready: false` and checked with `?eras=preview` before going live.
- To add or redo a room: generate the day picture, then use Gemini's edit for sunset and night (same room, only the light), download all three, place the spots on a % grid, and zoom in for the TV and frame corners in pixels.

## Winter, summer and the walls (Oct 2026)
- Every room has a heater (eras.js `heat`: kind, box in px, spot %): 80s kerosene sobia, 90s gas heater, 2000s oil radiator, 2026 electric heater; village houses a fireplace. Baked into the photos with Gemini; `heat.png` is the light it adds. Lights itself with rain, snow or cold (≤13°, ≤16° after dark); a tap lights/puts it out for the day.
- Rain fixed: streak width follows screen pixels, no drop trails (the dark/light lines).
- Frames never show strangers: empty frames show Lebanese places (`/room/places/`, sepia for 80s/90s, colour after). Your photos take frames in order. Tap a frame: name + one line + "put your photo here".
- Living room: curtains sway (mask.png alpha), birds pass, real moon phase and stars, ceiling fan / AC on 30°+ days with cicadas, seasons outside (leaves, blossom, haze).

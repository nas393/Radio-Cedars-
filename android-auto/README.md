# Sawt el Beit — Android + Android Auto

The phone and car version of the Sawt el Beit website: radio, news, TV and weather, without games, chats or recipes.

## What it does
- **Phone:** family profiles (kids mode for children), Lebanese and world radio, the site's news, Lebanese TV (the channels' official YouTube playlists, paused while the car is moving), live wallpaper from your photos or real photos of the station's region matching its weather, weather and Lebanon time, sleep timer, share to WhatsApp, home-screen widget. English, Arabic, French, Portuguese.
- **Drive mode (car icon):** the car theme with a big speedometer, the station and big buttons.
- **Android Auto:** favorites, recent, featured, Lebanon, world, profiles, station of the day, night ride, news flash; morning brief before 10am; car speed in the now-playing line (switch in Settings); steering-wheel next/previous; "Hey Google, play … on Sawt el Beit".

## Get the APK
Push to any branch → GitHub **Actions** → *Build Sawt el Beit Android app* → download **sawt-el-beit-apk** → install on the phone.
In Android Auto settings tap *Version* 10 times → Developer settings → **Unknown sources** to see it in the car.

## Lists you can edit without an app update (on `main`)
- `android-auto/featured.json` — Featured stations (`{"search": "name", "cc": "LB"}` or `{"name": "...", "url": "https://..."}`)
- `android-auto/tv.json` — TV channels and playlists (exported from `public/tv-channels.js`)

## Publish on Google Play
1. Play developer account (one-time US$25).
2. `keytool -genkey -v -keystore release.jks -alias sawt -keyalg RSA -keysize 2048 -validity 10000`
3. GitHub → Settings → Secrets → Actions: `KEYSTORE_BASE64` (`base64 -w0 release.jks`), `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`.
4. The next build also makes **sawt-el-beit-playstore-aab** — upload it, then opt in to Android Auto in *Advanced settings → Form factors*. Turn off "Speed on the car screen" if review objects to it.

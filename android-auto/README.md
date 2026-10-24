# Dandana — Android + Android Auto

World radio (Lebanon first) for the phone and the car. Stations come live from the free Radio Browser directory, so dead streams are filtered out automatically.

## What it does
- **Phone:** full-screen app, 5 family profiles (Netflix-style) each with its own theme, favorites and recents; tabs for Favorites, Recent, Featured, Lebanon, World (by country) and Search; weather of the station's country; sleep timer; share to WhatsApp; EN / العربية / FR / PT.
- **Car (Android Auto + Android Automotive):** Google's driving screen with your favorites, recents, featured, Lebanon, countries, profiles and optional news flash; steering-wheel next/previous; "Hey Google, play … on Dandana"; heart button to save a station; resumes the last station on connect.
- **Reliability:** backup stream per station, auto-reconnect after tunnels, data-saver mode.

## Get the APK
1. Push to any branch → GitHub **Actions** → *Build Dandana Android app* → download **dandana-apk**.
2. Install `app-debug.apk` on the phone (allow "install unknown apps").
3. To see it in the car while testing: Android Auto settings → tap *Version* 10 times → developer settings → enable **Unknown sources**.

## Edit the Featured list without an app update
Edit `android-auto/featured.json` on the `main` branch. Each entry is either `{"search": "name", "cc": "LB"}` or a direct `{"name": "...", "url": "https://..."}`.

## Publish on Google Play
1. Create a Play developer account (one-time US$25).
2. Make a signing key once: `keytool -genkey -v -keystore release.jks -alias mawja -keyalg RSA -keysize 2048 -validity 10000`
3. In GitHub → Settings → Secrets → Actions add `KEYSTORE_BASE64` (`base64 -w0 release.jks`), `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`.
4. The next build also produces **dandana-playstore-aab** — upload it in Play Console, then opt in to Android Auto / Automotive in *Advanced settings → Form factors*.

/* The window home: three Lebanese arches framing Beirut's sky as it is right
   now. The sun and moon are placed from Beirut's real solar position and the
   moon's real phase; clouds and rain follow Beirut's current weather. */
(() => {
  'use strict';
  const S = window.Sawt;
  if (!S) return;

  const LAT = 33.8938, LON = 35.5018;
  const rad = Math.PI / 180;
  const win = document.getElementById('window');
  const sky = document.getElementById('sky');
  const svg = document.getElementById('arches');
  const sun = document.getElementById('sun');
  const moon = document.getElementById('moon');
  const caption = document.getElementById('sky-caption');
  const root = document.documentElement;

  const WORDS = {
    ar: { now: 'بيروت الآن', yours: 'عندك', night: 'الليل', dawn: 'الفجر', morning: 'الصبح', midday: 'الظهر', afternoon: 'بعد الظهر', sunset: 'المغرب', evening: 'المسا' },
    en: { now: 'Beirut now', yours: 'Your time', night: 'Night', dawn: 'Dawn', morning: 'Morning', midday: 'Midday', afternoon: 'Afternoon', sunset: 'Sunset', evening: 'Evening' },
    fr: { now: 'Beyrouth', yours: 'Chez vous', night: 'Nuit', dawn: 'Aube', morning: 'Matin', midday: 'Midi', afternoon: 'Après-midi', sunset: 'Coucher du soleil', evening: 'Soir' }
  };

  // ---------------------------------------------------------------- astronomy

  function sunPosition(date) {
    const d = date / 86400000 + 2440587.5 - 2451545.0;
    const g = (357.529 + 0.98560028 * d) * rad;
    const q = 280.459 + 0.98564736 * d;
    const L = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * rad;
    const e = (23.439 - 0.00000036 * d) * rad;
    const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / rad;
    const dec = Math.asin(Math.sin(e) * Math.sin(L));
    const gmst = (18.697374558 + 24.06570982441908 * d) % 24;
    let H = ((gmst * 15 + LON - ra) % 360 + 540) % 360 - 180;   // hour angle, -180..180
    const elev = Math.asin(Math.sin(LAT * rad) * Math.sin(dec) + Math.cos(LAT * rad) * Math.cos(dec) * Math.cos(H * rad)) / rad;
    return { elev, H };
  }

  function moonAge(date) { // 0 = new, 0.5 = full
    const synodic = 29.530588853;
    const knownNew = Date.UTC(2000, 0, 6, 18, 14);
    return (((date - knownNew) / 86400000) % synodic + synodic) % synodic / synodic;
  }

  // ---------------------------------------------------------------- colour

  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const toHex = c => '#' + c.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));

  // Keyframes by sun elevation: [elev, top, mid, low, seaTop, seaLow, coast, stars]
  const MORNING = [
    [-18, '#070E1D', '#0D1A33', '#1A2B4E', '#0E1A30', '#060B16', '#03060D', 1],
    [-6, '#0E1A36', '#24345F', '#4A5A8C', '#1A2850', '#0B1328', '#070B18', 0.5],
    [0, '#3B5A93', '#9AA8C9', '#F3BC8B', '#6E7FA6', '#2F3D63', '#1A1426', 0],
    [8, '#5E95CF', '#A9C8E6', '#F7D9AA', '#4F7FAE', '#294C78', '#2A2A35', 0],
    [25, '#3E86CF', '#7DB6E6', '#C9E4F5', '#2F6FA8', '#1D4F86', '#3A3A44', 0]
  ];
  const EVENING = [
    [-18, '#070E1D', '#0D1A33', '#1A2B4E', '#0E1A30', '#060B16', '#03060D', 1],
    [-6, '#151638', '#3A2E5E', '#6B4A72', '#22234A', '#0C0F24', '#08081A', 0.5],
    [0, '#2E2A5E', '#8B5D86', '#F2925A', '#7A4F6A', '#2A2342', '#1A1022', 0],
    [8, '#4F86C4', '#B3B8CF', '#F6C58C', '#4C6F9A', '#283F66', '#2A2430', 0],
    [25, '#3E86CF', '#7DB6E6', '#C9E4F5', '#2F6FA8', '#1D4F86', '#3A3A44', 0]
  ];

  function palette(elev, evening) {
    const k = evening ? EVENING : MORNING;
    if (elev <= k[0][0]) return k[0].slice(1);
    for (let i = 1; i < k.length; i++) {
      if (elev <= k[i][0]) {
        const t = (elev - k[i - 1][0]) / (k[i][0] - k[i - 1][0]);
        return k[i].slice(1).map((v, j) => typeof v === 'number' ? k[i - 1][j + 1] + (v - k[i - 1][j + 1]) * t : mix(k[i - 1][j + 1], v, t));
      }
    }
    return k[k.length - 1].slice(1);
  }

  // ---------------------------------------------------------------- the arches

  function buildArches() {
    const W = win.clientWidth, H = win.clientHeight;
    if (!W || !H) return;
    // Top band: tall enough for the caption that sits on it.
    const capH = caption.scrollHeight || 0;
    const T = Math.round(Math.max(36, Math.min(64, H * 0.12), capH + 8));
    const S = Math.round(Math.max(12, W * 0.022));                     // side frame
    const C = Math.round(Math.max(9, W * 0.016));                      // columns
    const w = (W - 2 * S - 2 * C) / 3;                                 // each opening
    const archH = Math.min(w * 0.62, (H - T) * 0.5);
    const peak = T + 6;
    const spring = peak + archH;
    const r = w * 0.82;

    const openings = [0, 1, 2].map(i => {
      const x0 = S + i * (w + C), x1 = x0 + w, cx = x0 + w / 2;
      return `M${x0} ${H}V${spring}A${r} ${r} 0 0 1 ${cx} ${peak}A${r} ${r} 0 0 1 ${x1} ${spring}V${H}Z`;
    });
    const caps = [1, 2].map(i => {
      const x = S + i * w + (i - 1) * C;
      return `<rect class="capital" x="${x - 5}" y="${spring - 2}" width="${C + 10}" height="7" rx="1.5"/>`;
    }).join('');

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML =
      `<path class="frame" fill-rule="evenodd" d="M0 0H${W}V${H}H0Z ${openings.join(' ')}"/>` +
      `<path class="inner" d="${openings.join(' ')}"/>` + caps;
    win.style.setProperty('--frame-top', T + 'px');
    // Keep the sky's own landmarks out from under the stone top band.
    sky.style.setProperty('--frame-top', T + 'px');
  }

  // ---------------------------------------------------------------- stars + clouds

  function makeStars() {
    const box = document.getElementById('stars');
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const out = [];
    for (let i = 0; i < 80; i++) {
      const s = document.createElement('i');
      if (rnd() > 0.85) s.className = 'big';
      s.style.left = (rnd() * 100).toFixed(2) + '%';
      s.style.top = (8 + rnd() * 88).toFixed(2) + '%';
      s.style.opacity = (0.35 + rnd() * 0.65).toFixed(2);
      out.push(s);
    }
    box.replaceChildren(...out);
  }

  function setClouds(amount, dark) {
    const box = document.getElementById('clouds');
    let seed = 3;
    const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
    const list = [];
    for (let i = 0; i < amount; i++) {
      const c = document.createElement('div');
      c.className = 'cloud';
      c.style.left = (rnd() * 85 - 5).toFixed(1) + '%';
      c.style.top = (14 + rnd() * 50).toFixed(1) + '%';
      c.style.width = (18 + rnd() * 26).toFixed(1) + '%';
      c.style.setProperty('--cloud-a', dark ? (0.18 + rnd() * 0.12).toFixed(2) : (0.4 + rnd() * 0.3).toFixed(2));
      list.push(c);
    }
    box.replaceChildren(...list);
  }

  // ---------------------------------------------------------------- paint

  function phaseWord(elev, H) {
    const w = WORDS[S.lang()] || WORDS.ar;
    if (H < 0) {
      if (elev < -6) return w.night;
      if (elev < 4) return w.dawn;
      if (elev < 45 && H < -25) return w.morning;
      return w.midday;
    }
    if (elev > 45 || H < 20) return w.midday;
    if (elev > 6) return w.afternoon;
    if (elev > -4) return w.sunset;
    if (elev > -14) return w.evening;
    return w.night;
  }

  function paint() {
    const now = new Date();
    const { elev, H } = sunPosition(now);
    const evening = H > 0;
    let [top, mid, low, seaTop, seaLow, coast, stars] = palette(elev, evening);

    // Weather: grey the sky down for cloud, more for rain.
    const wx = S.weather();
    const code = wx ? wx.code : 0;
    const rainy = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;
    const overcast = code === 3 || code === 45 || code === 48;
    const veil = rainy ? 0.5 : overcast ? 0.35 : 0;
    if (veil) {
      const grey = elev > 0 ? '#8C949E' : '#1B2130';
      [top, mid, low, seaTop, seaLow] = [top, mid, low, seaTop, seaLow].map(c => mix(c, grey, veil));
      stars *= 0.2;
    }
    sky.classList.toggle('is-raining', rainy);
    const cloudCount = rainy ? 8 : overcast ? 7 : code === 2 ? 4 : code === 1 ? 2 : 0;
    setClouds(cloudCount, elev < -4);

    const vars = { '--sky-top': top, '--sky-mid': mid, '--sky-low': low, '--sea-top': seaTop, '--sea-low': seaLow, '--coast': coast, '--stars': stars.toFixed(2) };
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#17120E');

    // The sun crosses the window and sets over the sea by the rocks.
    const ltr = root.dir === 'ltr';
    let x = 50 + (H / 110) * 44;
    x = Math.max(4, Math.min(96, ltr ? 100 - x : x));
    const horizon = 74, zenith = 18;
    const y = horizon - (Math.max(-6, Math.min(70, elev)) / 70) * (horizon - zenith);
    const sunUp = elev > -3 && !rainy && !overcast;
    sun.style.display = sunUp ? 'block' : 'none';
    sun.style.left = x + '%';
    sun.style.top = y + '%';

    const night = elev < -4;
    const age = moonAge(now);
    const moonVisible = night && age > 0.04 && age < 0.96 && !rainy && !overcast;
    moon.style.display = moonVisible ? 'block' : 'none';
    // Middle of the outer arch, below its point, so the frame never hides it.
    const mx = ltr ? 17 : 83;
    moon.style.left = mx + '%';
    moon.style.top = '40%';
    const shift = age < 0.5 ? -2 * age : 2 - 2 * age; // shadow slides off, then back
    moon.firstElementChild.style.transform = `translateX(${(age < 0.5 ? shift : shift) * 100}%)`;

    const glitter = sunUp && elev < 30 ? 0.55 : moonVisible ? 0.22 : 0;
    root.style.setProperty('--glitter', glitter);
    root.style.setProperty('--glitter-x', (sunUp ? x : mx) + '%');

    // Caption on the stone band
    const w = WORDS[S.lang()] || WORDS.ar;
    const fmt = tz => new Intl.DateTimeFormat(S.locale(), { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(now);
    const parts = [];
    const add = (html) => parts.push(html);
    const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    add(`<span>${esc(w.now)} <b>${esc(fmt('Asia/Beirut'))}</b></span>`);
    add(`<span>${esc(phaseWord(elev, H))}</span>`);
    if (wx) add(`<span>${esc(S.num(wx.temperature))}° ${esc(S.weatherWord(wx.code))}</span>`);
    if (!S.sameZoneAsBeirut()) add(`<span>${esc(w.yours)} <b>${esc(fmt(undefined))}</b></span>`);
    const html = parts.join('<span class="sep" aria-hidden="true">|</span>');
    if (caption.innerHTML !== html) {
      caption.innerHTML = html;
      buildArches(); // the band follows the caption's height
    }
  }

  // ---------------------------------------------------------------- go

  makeStars();
  buildArches();
  paint();
  let resizeTimer = null;
  new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = setTimeout(buildArches, 60); }).observe(win);
  setInterval(paint, 60000);
  document.addEventListener('sawt:lang', paint);
  document.addEventListener('sawt:weather', paint);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) paint(); });
})();

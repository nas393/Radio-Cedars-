/* The salon: a photographed 1990s Beirut living room you can look around.
   Each object opens one part of the app. The light follows Beirut's sun. */
(() => {
  'use strict';

  const S = window.Sawt;
  const C = window.SAWT_CONTENT || {};
  const $ = id => document.getElementById(id);
  const el = S.el;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ================================================================== words

  const R = {
    ar: {
      introTitle: 'تفضّل، البيت بيتك',
      introSub: 'صالون بيت لبناني من التسعينات. كل غرض فيه بيشتغل.',
      introEnter: 'ادخل',
      dragHint: 'اسحب لتتفرّج على الغرفة',
      dockLabel: 'أغراض الغرفة',
      turnLeft: 'لفّ عالشمال', turnRight: 'لفّ عاليمين', tapToOpen: 'اضغط لتفتح',
      lookAround: 'اسحب لتتفرّج', allObjects: 'الصالون', allObjectsTitle: 'شو في بالصالون؟',
      paperName: 'جريدة البيت', paperPrice: 'الثمن ١٠٠٠ ل.ل.', comingUp: 'المناسبات الجايّة',
      tearNext: 'اقلب الورقة', tearBack: 'رجوع لليوم', sea: 'البحر المتوسط',
      daysLeft: n => n === 0 ? 'اليوم' : n === 1 ? 'بكرا' : `بعد ${S.num(n)} يوم`,
      close: 'سكّر',
      scenes: { sunrise: 'طلوع الشمس', day: 'الضهر', afternoon: 'بعد الضهر', sunset: 'المغرب', night: 'الليل' },
      sceneManual: 'اضغط لتغيّر الوقت والطقس',
      timeLabel: 'الوقت', weatherLabel: 'الطقس', autoBeirut: 'متل بيروت هلّق', clearW: 'صحو', rainW: 'شتي',
      beirut: 'بيروت',
      here: 'عندك',
      objects: {
        radio: 'الراديو', tv: 'التلفزيون', news: 'الجريدة', phone: 'التلفون', photos: 'صور العيلة',
        cassettes: 'الكاسيتات', clock: 'الساعة', lamp: 'اللمبادير', window: 'الشبّاك', calendar: 'الروزنامة',
        coffee: 'فنجان القهوة', books: 'دفتر تيتا'
      },
      hints: {
        radio: 'محطات لبنان مباشرة', tv: 'البث المباشر', news: 'أخبار اليوم', phone: 'ابعت إهداء', photos: 'حائط الإهداءات',
        cassettes: 'الزمن الجميل', clock: 'المنبّه', lamp: 'مؤقت النوم', window: 'الطقس', calendar: 'المناسبات',
        coffee: 'نقرا الفنجان؟', books: 'طبخات تيتا'
      },
      tvLede: 'اختار قناة، وبتشتغل هون عالتلفزيون.',
      photosLede: 'رسائل من الغربة لأهلنا بلبنان.',
      cassettesLede: 'كاسيت لكل جوّ. اضغط وبتشتغل هون بالبيت.',
      lampLede: 'سكّر الراديو لحاله بعد شوي، وإنت عم تغفى.',
      approxNote: 'الأعياد الهجرية تقريبية وبتتأكد مع رؤية الهلال.',
      coffeeLede: 'اشرب القهوة، اقلب الفنجان، وخلّينا نشوف شو مكتوبلك. (للتسلية بس!)',
      coffeeFlip: 'اقلب الفنجان',
      coffeeAgain: 'فنجان تاني',
      coffeeSee: 'شايف بالفنجان',
      sunrise: 'طلوع الشمس', sunset: 'غياب الشمس', iftar: 'الإفطار تقريباً', today: 'اليوم', inDays: n => n === 1 ? 'بكرا' : `بعد ${S.num(n)} يوم`,
      serves: n => `لـ ${S.num(n)} أشخاص`, minutes: n => `${S.num(n)} دقيقة`, ingredients: 'المكوّنات', method: 'الطريقة',
      playOnSpotify: 'شغّل', listen: 'اسمع',
      nowOutside: (w, t) => `هلّق ببيروت: ${w}، ${t}°`,
      credits: 'مجسّمات من Khronos glTF Sample Assets (CC BY 4.0 وCC0).'
    },
    en: {
      introTitle: 'Come in, make yourself at home',
      introSub: 'A 1990s Lebanese living room. Everything in it works.',
      introEnter: 'Come in',
      dragHint: 'Drag to look around the room',
      dockLabel: 'Things in the room',
      turnLeft: 'Turn left', turnRight: 'Turn right', tapToOpen: 'Tap to open',
      lookAround: 'Drag to look around', allObjects: 'The room', allObjectsTitle: 'What’s in the room',
      paperName: 'The Home Gazette', paperPrice: 'LBP 1,000', comingUp: 'Coming up',
      tearNext: 'Tear the page', tearBack: 'Back to today', sea: 'Mediterranean Sea',
      daysLeft: n => n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : `In ${n} days`,
      close: 'Close',
      scenes: { sunrise: 'Sunrise', day: 'Midday', afternoon: 'Afternoon', sunset: 'Sunset', night: 'Night' },
      sceneManual: 'Tap to change the time and weather',
      timeLabel: 'Time of day', weatherLabel: 'Weather', autoBeirut: 'Like Beirut now', clearW: 'Clear', rainW: 'Rain',
      beirut: 'Beirut',
      here: 'Where you are',
      objects: {
        radio: 'Radio', tv: 'Television', news: 'Newspaper', phone: 'Telephone', photos: 'Family photos',
        cassettes: 'Cassettes', clock: 'Clock', lamp: 'Lamp', window: 'Window', calendar: 'Calendar',
        coffee: 'Coffee cup', books: 'Teta’s notebook'
      },
      hints: {
        radio: 'Lebanese stations, live', tv: 'Live channels', news: 'Today’s headlines', phone: 'Send a dedication', photos: 'Dedications wall',
        cassettes: 'Golden-age classics', clock: 'Alarm', lamp: 'Sleep timer', window: 'Weather', calendar: 'Occasions',
        coffee: 'Read my cup?', books: 'Teta’s recipes'
      },
      tvLede: 'Pick a channel and it plays right here on the TV.',
      photosLede: 'Messages from abroad to family in Lebanon.',
      cassettesLede: 'A tape for every mood. Tap one and it plays right here.',
      lampLede: 'Let the radio switch itself off while you drift to sleep.',
      approxNote: 'Islamic holidays are approximate and confirmed by the moon sighting.',
      coffeeLede: 'Finish your coffee, flip the cup, and let’s see what it says. (Just for fun!)',
      coffeeFlip: 'Flip the cup',
      coffeeAgain: 'Another cup',
      coffeeSee: 'I can see',
      sunrise: 'Sunrise', sunset: 'Sunset', iftar: 'Iftar, around', today: 'Today', inDays: n => n === 1 ? 'Tomorrow' : `In ${n} days`,
      serves: n => `Serves ${n}`, minutes: n => `${n} min`, ingredients: 'Ingredients', method: 'Method',
      playOnSpotify: 'Play', listen: 'Listen',
      nowOutside: (w, t) => `Beirut right now: ${w}, ${t}°`,
      credits: '3D models from Khronos glTF Sample Assets (CC BY 4.0 and CC0).'
    },
    fr: {
      introTitle: 'Entrez, vous êtes chez vous',
      introSub: 'Un salon libanais des années 90. Tout y fonctionne.',
      introEnter: 'Entrer',
      dragHint: 'Faites glisser pour regarder autour',
      dockLabel: 'Les objets du salon',
      turnLeft: 'Tourner à gauche', turnRight: 'Tourner à droite', tapToOpen: 'Touchez pour ouvrir',
      lookAround: 'Glissez pour regarder', allObjects: 'Le salon', allObjectsTitle: 'Dans le salon',
      paperName: 'La Gazette de la maison', paperPrice: '1 000 L.L.', comingUp: 'À venir',
      tearNext: 'Arracher la page', tearBack: 'Revenir à aujourd’hui', sea: 'Mer Méditerranée',
      daysLeft: n => n === 0 ? 'Aujourd’hui' : n === 1 ? 'Demain' : `Dans ${n} jours`,
      close: 'Fermer',
      scenes: { sunrise: 'Lever du soleil', day: 'Midi', afternoon: 'Après-midi', sunset: 'Coucher du soleil', night: 'Nuit' },
      sceneManual: 'Touchez pour changer l’heure et la météo',
      timeLabel: 'Moment', weatherLabel: 'Météo', autoBeirut: 'Comme à Beyrouth', clearW: 'Dégagé', rainW: 'Pluie',
      beirut: 'Beyrouth',
      here: 'Chez vous',
      objects: {
        radio: 'Radio', tv: 'Télévision', news: 'Journal', phone: 'Téléphone', photos: 'Photos de famille',
        cassettes: 'Cassettes', clock: 'Horloge', lamp: 'Lampe', window: 'Fenêtre', calendar: 'Calendrier',
        coffee: 'Tasse de café', books: 'Le cahier de Teta'
      },
      hints: {
        radio: 'Radios libanaises en direct', tv: 'Chaînes en direct', news: 'Les titres du jour', phone: 'Envoyer une dédicace', photos: 'Le mur des dédicaces',
        cassettes: 'Les classiques', clock: 'Réveil', lamp: 'Minuterie', window: 'Météo', calendar: 'Fêtes',
        coffee: 'Lire ma tasse ?', books: 'Les recettes de Teta'
      },
      tvLede: 'Choisissez une chaîne, elle passe ici, sur la télé.',
      photosLede: 'Des messages de l’étranger pour la famille au Liban.',
      cassettesLede: 'Une cassette pour chaque ambiance. Touchez, elle joue ici.',
      lampLede: 'La radio s’éteint toute seule pendant que vous vous endormez.',
      approxNote: 'Les fêtes musulmanes sont approximatives, selon l’observation de la lune.',
      coffeeLede: 'Finissez votre café, retournez la tasse, et voyons ce qu’elle dit. (Pour rire !)',
      coffeeFlip: 'Retourner la tasse',
      coffeeAgain: 'Une autre tasse',
      coffeeSee: 'Je vois',
      sunrise: 'Lever', sunset: 'Coucher', iftar: 'Iftar, vers', today: 'Aujourd’hui', inDays: n => n === 1 ? 'Demain' : `Dans ${n} jours`,
      serves: n => `Pour ${n}`, minutes: n => `${n} min`, ingredients: 'Ingrédients', method: 'Préparation',
      playOnSpotify: 'Écouter', listen: 'Écouter',
      nowOutside: (w, t) => `À Beyrouth en ce moment : ${w}, ${t}°`,
      credits: 'Modèles 3D : Khronos glTF Sample Assets (CC BY 4.0 et CC0).'
    }
  };
  const r = (key, ...args) => {
    const v = (R[S.lang()] || R.ar)[key];
    return typeof v === 'function' ? v(...args) : v;
  };

  // ================================================================== the objects

  // yaw/pitch in degrees, measured in the panorama (0,0 = the window).
  const OBJECTS = [
    { id: 'calendar', yaw: -176.8, pitch: 10.4 },
    { id: 'clock', yaw: -145.6, pitch: 27.0 },
    { id: 'phone', yaw: -104.9, pitch: -12.6 },
    { id: 'photos', yaw: -69.4, pitch: 14.3 },
    { id: 'lamp', yaw: -46.9, pitch: -3.5 },
    { id: 'coffee', yaw: -38.8, pitch: -18.4 },
    { id: 'books', yaw: -24.3, pitch: -36.7 },
    { id: 'window', yaw: -10.6, pitch: 10.5 },
    { id: 'news', yaw: 0.8, pitch: -28.1 },
    { id: 'tv', yaw: 34.6, pitch: -8.0 },
    { id: 'cassettes', yaw: 82.7, pitch: -2.0 },
    { id: 'radio', yaw: 85.0, pitch: -12.7 }
  ];
  const hidden = new Set(); // objects switched off by the server config

  // ================================================================== Beirut's sun

  const RAD = Math.PI / 180;
  const BEIRUT = { lat: 33.89, lon: 35.5 };
  function sun(date) {
    const d = date.valueOf() / 864e5 - 0.5 + 2440588 - 2451545;
    const M = RAD * (357.5291 + 0.98560028 * d);
    const Cc = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    const L = M + Cc + RAD * 102.9372 + Math.PI;
    const e = RAD * 23.4397;
    const dec = Math.asin(Math.sin(e) * Math.sin(L));
    const ra = Math.atan2(Math.sin(L) * Math.cos(e), Math.cos(L));
    let H = RAD * (280.16 + 360.9856235 * d) + RAD * BEIRUT.lon - ra;
    H = Math.atan2(Math.sin(H), Math.cos(H));
    const phi = RAD * BEIRUT.lat;
    const alt = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
    return { alt: alt / RAD, H };
  }

  function sceneFor(date = new Date()) {
    const { alt, H } = sun(date);
    if (H < 0) { // morning
      if (alt < -6) return 'night';
      if (alt < 10) return 'sunrise';
      return 'day';
    }
    if (alt > 35) return 'day';
    if (alt > 8) return 'afternoon';
    if (alt > -6) return 'sunset';
    return 'night';
  }

  // Sunrise and sunset around a given moment (searched minute by minute).
  function sunTimes(date = new Date()) {
    const dayStr = beirutDate(date);
    const out = {};
    let prev = null;
    const start = date.valueOf() - 26 * 3600e3;
    for (let t = start; t < start + 52 * 3600e3; t += 120e3) {
      const a = sun(new Date(t)).alt + 0.833;
      if (prev !== null && beirutDate(new Date(t)) === dayStr) {
        if (prev < 0 && a >= 0) out.rise = new Date(t);
        if (prev >= 0 && a < 0) out.set = new Date(t);
      }
      prev = a;
    }
    return out;
  }

  function beirutDate(d) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Beirut', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  }
  function timeIn(d, tz) {
    return new Intl.DateTimeFormat(S.locale(), { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(d);
  }

  // ================================================================== images

  const SCENES = ['sunrise', 'day', 'afternoon', 'sunset', 'night'];
  const small = Math.min(screen.width, screen.height) < 700;
  let maxTex = 4096;
  function panoUrl(scene) { return `/room/pano-${scene}-${small || maxTex < 4096 ? 2 : 4}k.jpg`; }
  function doorUrl(scene) { return `/room/door-${scene}${small ? '-m' : ''}.jpg`; }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // ================================================================== the viewer

  const canvas = $('view');
  const view = { yaw: 10, pitch: -6, fov: 0, vy: 0, vp: 0 };
  let gl = null, prog = null, tex = [null, null], mixAmount = 0, uni = {};
  let needsDraw = true;

  function defaultFov() { return innerWidth < innerHeight ? 88 : 68; }
  view.fov = defaultFov();

  const VERT = 'attribute vec2 a;varying vec2 p;void main(){p=a;gl_Position=vec4(a,0.,1.);}';
  const FRAG = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    varying vec2 p;
    uniform mat3 rot;
    uniform vec2 th;
    uniform sampler2D t0;
    uniform sampler2D t1;
    uniform float mixv;
    uniform sampler2D tm;      // where the window glass is
    uniform float rain;        // 0 dry .. 1 pouring
    uniform float time;
    uniform float flash;       // lightning
    const float PI = 3.14159265;
    float h21(vec2 q) { q = fract(q * vec2(123.34, 456.21)); q += dot(q, q + 45.32); return fract(q.x * q.y); }
    // Running drops with trails on glass (after Martijn Steinrucken's "Heartfelt" idea).
    vec3 drops(vec2 g0, float t) {
      vec2 aspect = vec2(2.0, 1.0);
      vec2 g = g0 * aspect;
      g.y += t * 0.25;
      vec2 id = floor(g);
      vec2 gv = fract(g) - 0.5;
      float n = h21(id);
      t += n * 6.2831;
      float wv = g0.y * 10.0;
      float x = (n - 0.5) * 0.8;
      x += (0.4 - abs(x)) * sin(3.0 * wv) * pow(sin(wv), 6.0) * 0.45;
      float y = -sin(t + sin(t + sin(t) * 0.5)) * 0.45;
      y -= (gv.x - x) * (gv.x - x);
      vec2 dp = (gv - vec2(x, y)) / aspect;
      float drop = smoothstep(0.05, 0.03, length(dp));
      vec2 tp = (gv - vec2(x, t * 0.25)) / aspect;
      tp.y = (fract(tp.y * 8.0) - 0.5) / 8.0;
      float trail = smoothstep(0.03, 0.01, length(tp));
      float fog = smoothstep(-0.05, 0.05, dp.y) * smoothstep(0.5, y, gv.y);
      trail *= fog;
      return vec3(drop * dp + trail * tp, max(drop, trail));
    }
    vec3 beads(vec2 g) {      // small still droplets
      vec2 id = floor(g); vec2 gv = fract(g) - 0.5;
      float n = h21(id);
      vec2 c = vec2(n - 0.5, fract(n * 7.3) - 0.5) * 0.7;
      vec2 d = gv - c;
      float r = 0.08 + 0.12 * fract(n * 13.1);
      float m = smoothstep(r, r * 0.6, length(d)) * step(0.35, fract(n * 3.7));
      return vec3(d * m * 0.6, m);
    }
    void main(){
      vec3 d = normalize(rot * vec3(p.x * th.x, p.y * th.y, -1.0));
      float lon = atan(d.x, -d.z);
      float lat = asin(clamp(d.y, -1.0, 1.0));
      vec2 uv = vec2(0.5 + lon / (2.0 * PI), 0.5 - lat / PI);
      vec4 c = texture2D(t0, uv);
      if (mixv > 0.0) c = mix(c, texture2D(t1, uv), mixv);
      if (rain > 0.001) {
        float m = texture2D(tm, uv).r;
        if (m > 0.02) {
          vec2 st = vec2(lon, lat) * 6.0;
          vec3 a = drops(st, time);
          vec3 b = drops(st * 1.65 + vec2(7.54, 2.1), time * 1.1);
          vec3 e = beads(st * 6.0);
          vec2 o = (a.xy + b.xy * 0.7 + e.xy) * rain;
          float wetness = max(max(a.z, b.z), e.z);
          vec2 u2 = uv + o * 0.045;
          float bl = 0.0024 * (1.0 - wetness);    // drops are clear, the fogged glass between is soft
          vec3 g = (texture2D(t0, u2 + vec2(bl, 0.0)).rgb + texture2D(t0, u2 - vec2(bl, 0.0)).rgb +
                    texture2D(t0, u2 + vec2(0.0, bl)).rgb + texture2D(t0, u2 - vec2(0.0, bl)).rgb) * 0.25;
          g *= mix(vec3(0.72, 0.78, 0.9), vec3(1.05), wetness);
          g += wetness * 0.06 + pow(wetness, 3.0) * 0.08;
          c.rgb = mix(c.rgb, g, clamp(m, 0.0, 1.0) * rain);
          c.rgb += flash * m * 0.9;
        }
      }
      c.rgb += flash * 0.06;
      gl_FragColor = vec4(c.rgb, 1.0);
    }`;

  function initGL() {
    gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false }) ||
         canvas.getContext('experimental-webgl');
    if (!gl) return false;
    maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
    } catch { gl = null; return false; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    for (const n of ['rot', 'th', 't0', 't1', 'mixv', 'tm', 'rain', 'time', 'flash']) uni[n] = gl.getUniformLocation(prog, n);
    gl.uniform1i(uni.t0, 0);
    gl.uniform1i(uni.t1, 1);
    gl.uniform1i(uni.tm, 2);
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); }, false);
    canvas.addEventListener('webglcontextrestored', () => { initGL(); if (currentImg) setTexture(0, currentImg); needsDraw = true; });
    return true;
  }

  function setTexture(unit, img) {
    if (!tex[unit]) tex[unit] = gl.createTexture();
    gl.activeTexture([gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2][unit]);
    gl.bindTexture(gl.TEXTURE_2D, tex[unit]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  function basis() {
    const y = view.yaw * RAD, p = view.pitch * RAD;
    const cy = Math.cos(y), sy = Math.sin(y), cp = Math.cos(p), sp = Math.sin(p);
    return {
      r: [cy, 0, sy],
      u: [-sy * sp, cp, cy * sp],
      f: [sy * cp, sp, -cy * cp]
    };
  }
  function tanHalf() {
    const ty = Math.tan(view.fov * RAD / 2);
    return [ty * canvas.clientWidth / Math.max(1, canvas.clientHeight), ty];
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 2 : 1.75);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    needsDraw = true;
  }

  function draw() {
    if (gl && tex[0]) {
      const { r: rr, u, f } = basis();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniformMatrix3fv(uni.rot, false, [...rr, ...u, -f[0], -f[1], -f[2]]);
      gl.uniform2fv(uni.th, tanHalf());
      gl.uniform1f(uni.mixv, mixAmount);
      gl.uniform1f(uni.rain, tex[2] ? rainNow : 0);
      gl.uniform1f(uni.time, (performance.now() / 1000) % 3600);
      gl.uniform1f(uni.flash, flashNow);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex[0]);
      if (tex[1]) { gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex[1]); }
      if (tex[2]) { gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, tex[2]); }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    } else if (!gl && currentImg) {
      // No WebGL: slide a flat strip of the panorama instead.
      const w = canvas.clientHeight * 2.2;
      canvas.style.backgroundImage = `url("${currentImg.src}")`;
      canvas.style.backgroundSize = `${w}px auto`;
      canvas.style.backgroundPosition = `${-(0.5 + view.yaw / 360) * w + canvas.clientWidth / 2}px ${50 - view.pitch}%`;
    }
    placeHotspots();
  }

  // ------------------------------------------------------------------ hotspots

  const hotLayer = $('hotspots');
  const hotEls = new Map();

  function renderHotspots() {
    hotLayer.replaceChildren(...OBJECTS.filter(o => !hidden.has(o.id)).map(o => {
      const b = el('button', { type: 'button', className: 'hot', tabIndex: -1 }, [
        el('span', { className: 'hot-dot' }),
        el('span', { className: 'hot-label', text: r('objects')[o.id] })
      ]);
      b.dataset.id = o.id;
      b.setAttribute('aria-hidden', 'true');
      b.addEventListener('click', e => { e.stopPropagation(); openObject(o.id, true); });
      hotEls.set(o.id, b);
      return b;
    }));
    needsDraw = true;
  }

  // The object closest to the middle of the view is "in focus": it gets its
  // label, and the card at the bottom offers to open it.
  let focusId = null;
  function placeHotspots() {
    const { r: rr, u, f } = basis();
    let best = null, bestDot = Math.cos(25 * RAD);
    const [tx, ty] = tanHalf();
    const W = canvas.clientWidth, H = canvas.clientHeight;
    for (const o of OBJECTS) {
      const b = hotEls.get(o.id);
      if (!b || !b.isConnected) continue;
      const y = o.yaw * RAD, p = o.pitch * RAD;
      const h = [Math.sin(y) * Math.cos(p), Math.sin(p), -Math.cos(y) * Math.cos(p)];
      const z = h[0] * f[0] + h[1] * f[1] + h[2] * f[2];
      if (z > bestDot) { bestDot = z; best = o.id; }
      if (z < 0.2) { b.style.visibility = 'hidden'; continue; }
      const x = (h[0] * rr[0] + h[1] * rr[1] + h[2] * rr[2]) / z / tx;
      const yy = (h[0] * u[0] + h[1] * u[1] + h[2] * u[2]) / z / ty;
      if (Math.abs(x) > 1.15 || Math.abs(yy) > 1.15) { b.style.visibility = 'hidden'; continue; }
      b.style.visibility = 'visible';
      b.style.transform = `translate(${((x + 1) / 2 * W).toFixed(1)}px, ${((1 - yy) / 2 * H).toFixed(1)}px)`;
    }
    if (best !== focusId) setFocus(best);
  }

  function setFocus(id) {
    focusId = id;
    hotEls.forEach((b, k) => b.classList.toggle('is-focus', k === id));
    const card = $('focus-card');
    card.classList.toggle('is-empty', !id);
    $('focus-name').textContent = id ? r('objects')[id] : r('lookAround');
    $('focus-hint').textContent = id ? r('hints')[id] : '';
    card.setAttribute('aria-label', id ? `${r('objects')[id]}: ${r('hints')[id]}. ${r('tapToOpen')}` : r('allObjectsTitle'));
    card.classList.remove('is-new'); void card.offsetWidth; if (id) card.classList.add('is-new');
  }

  // Step to the next object to the left or right.
  function step(dir) {
    const list = OBJECTS.filter(o => !hidden.has(o.id));
    let bestO = null, bestD = 1e9;
    for (const o of list) {
      let d = ((o.yaw - view.yaw) * dir + 720) % 360;
      if (o.id === focusId || d < 4) d += 360;
      if (d < bestD) { bestD = d; bestO = o; }
    }
    if (bestO) { hideHint(); turnTo(bestO.yaw, Math.max(-22, Math.min(14, bestO.pitch * 0.85))); }
  }
  $('focus-prev').addEventListener('click', () => step(-1));
  $('focus-next').addEventListener('click', () => step(1));
  $('focus-card').addEventListener('click', () => { if (focusId) openObject(focusId, true); else openGrid(); });

  // ------------------------------------------------------------------ looking around

  let dragging = false, moved = 0, lastX = 0, lastY = 0, lastT = 0;
  const pointers = new Map();
  let pinchStart = 0, fovStart = 0;

  function degPerPx() { return view.fov / Math.max(1, canvas.clientHeight); }
  function clampView() {
    view.pitch = Math.max(-75, Math.min(75, view.pitch));
    view.fov = Math.max(38, Math.min(100, view.fov));
    view.yaw = ((view.yaw + 540) % 360) - 180;
  }

  canvas.addEventListener('pointerdown', e => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    canvas.setPointerCapture(e.pointerId);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchStart = Math.hypot(a.x - b.x, a.y - b.y); fovStart = view.fov;
      dragging = false;
      return;
    }
    dragging = true; moved = 0;
    lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
    view.vy = view.vp = 0;
    stopTurn();
  });
  canvas.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchStart) { view.fov = fovStart * pinchStart / d; clampView(); needsDraw = true; }
      return;
    }
    if (!dragging) return;
    const now = performance.now();
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    moved += Math.abs(dx) + Math.abs(dy);
    const k = degPerPx();
    view.yaw -= dx * k;
    view.pitch += dy * k;
    const dt = Math.max(1, now - lastT);
    view.vy = -dx * k / dt * 16; view.vp = dy * k / dt * 16;
    lastX = e.clientX; lastY = e.clientY; lastT = now;
    clampView();
    needsDraw = true;
    if (moved > 12) hideHint();
  });
  const endPointer = e => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchStart = 0;
    if (pointers.size === 0) {
      dragging = false;
      if (performance.now() - lastT > 80) view.vy = view.vp = 0;
    }
  };
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    view.fov *= Math.exp(e.deltaY * 0.0012);
    clampView(); needsDraw = true;
  }, { passive: false });

  document.addEventListener('keydown', e => {
    if (!document.body.classList.contains('in-room') || sheetOpen() || introOn) return;
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    const step = e.shiftKey ? 30 : 10;
    const dir = document.documentElement.dir === 'rtl' ? 1 : 1;
    if (e.key === 'ArrowLeft') view.yaw -= step * dir;
    else if (e.key === 'ArrowRight') view.yaw += step * dir;
    else if (e.key === 'ArrowUp') view.pitch += step / 2;
    else if (e.key === 'ArrowDown') view.pitch -= step / 2;
    else if (e.key === '+' || e.key === '=') view.fov -= 6;
    else if (e.key === '-') view.fov += 6;
    else return;
    clampView(); needsDraw = true; hideHint();
  });

  // Smooth turn towards an object.
  let turn = null;
  function turnTo(yaw, pitch, done) {
    if (reduceMotion) { view.yaw = yaw; view.pitch = pitch; clampView(); needsDraw = true; if (done) done(); return; }
    let dy = ((yaw - view.yaw + 540) % 360) - 180;
    turn = { y0: view.yaw, dy, p0: view.pitch, dp: pitch - view.pitch, t0: performance.now(), dur: 450 + Math.min(500, Math.abs(dy) * 4), done };
  }
  function stopTurn() { turn = null; }

  function frame(now) {
    if (turn) {
      const k = Math.min(1, (now - turn.t0) / turn.dur);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      view.yaw = turn.y0 + turn.dy * e;
      view.pitch = turn.p0 + turn.dp * e;
      clampView();
      needsDraw = true;
      if (k >= 1) { const d = turn.done; turn = null; if (d) d(); }
    } else if (!dragging && (Math.abs(view.vy) > 0.01 || Math.abs(view.vp) > 0.01)) {
      view.yaw += view.vy; view.pitch += view.vp;
      view.vy *= 0.92; view.vp *= 0.92;
      clampView();
      needsDraw = true;
    }
    if (fade) {
      const k = Math.min(1, (now - fade.t0) / 1400);
      mixAmount = k;
      needsDraw = true;
      if (k >= 1) {
        setTexture(0, fade.img);
        mixAmount = 0;
        fade = null;
      }
    }
    // weather: ease the rain in and out; keep the drops moving (about 30 fps)
    const target = rainTarget();
    if (Math.abs(rainNow - target) > 0.002) { rainNow += (target - rainNow) * 0.03; needsDraw = true; }
    if (rainNow > 0.01 && !document.hidden && now - lastRainDraw > 33) { lastRainDraw = now; needsDraw = true; }
    if (stormy() && rainNow > 0.5 && now > nextFlash) {
      flashNow = 1; nextFlash = now + 9000 + Math.random() * 22000;
    }
    if (flashNow > 0) { flashNow = Math.max(0, flashNow - 0.06); needsDraw = true; }
    if (needsDraw) { needsDraw = false; draw(); }
    requestAnimationFrame(frame);
  }

  // ------------------------------------------------------------------ weather on the window
  let rainNow = 0, flashNow = 0, lastRainDraw = 0, nextFlash = performance.now() + 6000;
  let weatherMode = 'auto';              // auto | clear | rain
  function beirutCode() {
    const w = S.weather();
    const c = w && (w.cities || []).find(x => x.id === 'beirut');
    return c ? c.code : null;
  }
  function rainingInBeirut() {
    const code = beirutCode();
    return code !== null && ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95);
  }
  function stormy() { const c = beirutCode(); return weatherMode === 'auto' && c !== null && c >= 95; }
  function isRaining() { return weatherMode === 'rain' || (weatherMode === 'auto' && rainingInBeirut()); }
  function rainTarget() {
    if (!isRaining()) return 0;
    const code = beirutCode();
    if (weatherMode === 'rain' || code === null) return 0.85;
    if (code === 51 || code === 56 || code === 61 || code === 80) return 0.55;    // light
    return 0.95;
  }
  function loadMask() {
    if (!gl) return;
    loadImage('/room/mask.png').then(img => { setTexture(2, img); needsDraw = true; }).catch(() => {});
  }
  document.addEventListener('sawt:weather', () => { renderSceneChip(); needsDraw = true; });

  // ------------------------------------------------------------------ hint

  const hint = $('drag-hint');
  function showHint() {
    if (S.store.get('lookedAround', false)) return;
    hint.textContent = r('dragHint');
    hint.hidden = false;
  }
  function hideHint() {
    if (hint.hidden) return;
    hint.classList.add('is-gone');
    setTimeout(() => { hint.hidden = true; }, 600);
    S.store.set('lookedAround', true);
  }

  // ================================================================== scenes

  let scene = sceneFor();
  let manualScene = false;
  let currentImg = null;
  let fade = null;

  async function showScene(name, animate) {
    scene = name;
    renderSceneChip();
    let img;
    try { img = await loadImage(panoUrl(name)); }
    catch { return; }
    if (name !== scene) return; // a newer choice won
    if (!gl) { currentImg = img; needsDraw = true; return; }
    if (!currentImg || !animate || reduceMotion) {
      setTexture(0, img);
      currentImg = img;
      needsDraw = true;
      return;
    }
    setTexture(1, img);
    currentImg = img;
    fade = { img, t0: performance.now() };
  }

  const chip = $('scene-chip');
  function renderSceneChip() {
    const now = new Date();
    const wet = isRaining();
    chip.replaceChildren(...[
      el('span', { className: 'scene-dot scene-' + scene }),
      el('span', { className: 'scene-name', text: r('scenes')[scene] }),
      wet ? el('span', { className: 'scene-rain', 'aria-hidden': 'true' }) : null,
      el('span', { className: 'scene-time', text: `${timeIn(now, 'Asia/Beirut')} · ${r('beirut')}` })
    ].filter(Boolean));
    chip.title = r('sceneManual');
    chip.setAttribute('aria-label', `${r('scenes')[scene]}${wet ? ', ' + r('rainW') : ''}, ${timeIn(now, 'Asia/Beirut')} ${r('beirut')}. ${r('sceneManual')}`);
    chip.setAttribute('aria-expanded', String(!pop.hidden));
    renderPop();
  }
  // the little panel under the chip: choose the time of day and the weather
  const pop = el('div', { className: 'scene-pop', id: 'scene-pop', role: 'dialog', hidden: true });
  chip.after(pop);
  chip.setAttribute('aria-controls', 'scene-pop');
  function opt(label, pressed, onClick, cls) {
    const b = el('button', { type: 'button', className: 'pop-opt' + (cls ? ' ' + cls : ''), text: label });
    b.setAttribute('aria-pressed', String(pressed));
    b.addEventListener('click', e => { e.stopPropagation(); onClick(); renderSceneChip(); });
    return b;
  }
  function renderPop() {
    if (pop.hidden) return;
    pop.replaceChildren(
      el('p', { className: 'pop-k', text: r('timeLabel') }),
      el('div', { className: 'pop-row' }, [
        opt(r('autoBeirut'), !manualScene, () => { manualScene = false; showScene(sceneFor(), true); }, 'is-auto'),
        ...SCENES.map(sc => opt(r('scenes')[sc], manualScene && scene === sc, () => { manualScene = true; showScene(sc, true); }, 'scene-opt-' + sc))
      ]),
      el('p', { className: 'pop-k', text: r('weatherLabel') }),
      el('div', { className: 'pop-row' }, [
        opt(r('autoBeirut'), weatherMode === 'auto', () => { weatherMode = 'auto'; }, 'is-auto'),
        opt(r('clearW'), weatherMode === 'clear', () => { weatherMode = 'clear'; }),
        opt(r('rainW'), weatherMode === 'rain', () => { weatherMode = 'rain'; })
      ])
    );
  }
  chip.addEventListener('click', e => {
    e.stopPropagation();
    pop.hidden = !pop.hidden;
    renderSceneChip();
    if (!pop.hidden) { const f = pop.querySelector('[aria-pressed="true"]'); if (f) f.focus({ preventScroll: true }); }
  });
  document.addEventListener('click', e => { if (!pop.hidden && !pop.contains(e.target)) { pop.hidden = true; renderSceneChip(); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) { pop.hidden = true; renderSceneChip(); chip.focus(); } });
  setInterval(() => {
    renderSceneChip();
    if (!manualScene) {
      const s = sceneFor();
      if (s !== scene) showScene(s, true);
    }
  }, 30000);

  // ================================================================== the whole room at a glance

  const grid = $('objects');
  function renderGrid() {
    $('objects-grid').replaceChildren(...OBJECTS.filter(o => !hidden.has(o.id)).map((o, i) => {
      const img = el('img', { className: 'tile-img', alt: '', loading: 'lazy', decoding: 'async', src: `/room/thumb-${o.id}.jpg` });
      img.addEventListener('error', () => img.remove());
      const b = el('button', { type: 'button', className: 'tile' }, [
        img,
        el('span', { className: 'tile-text' }, [
          el('span', { className: 'tile-name', text: r('objects')[o.id] }),
          el('span', { className: 'tile-hint', text: r('hints')[o.id] })
        ])
      ]);
      b.style.setProperty('--i', i);
      b.dataset.id = o.id;
      b.addEventListener('click', () => { closeGrid(false); openObject(o.id, true); });
      return b;
    }));
  }
  function openGrid() {
    if (sheetOpen()) closeSheet();
    grid.hidden = false;
    requestAnimationFrame(() => grid.classList.add('is-open'));
    $('all-btn').setAttribute('aria-expanded', 'true');
    setTimeout(() => $('objects-close').focus({ preventScroll: true }), 30);
  }
  function closeGrid(restore = true) {
    if (grid.hidden) return;
    grid.classList.remove('is-open');
    $('all-btn').setAttribute('aria-expanded', 'false');
    setTimeout(() => { if (!grid.classList.contains('is-open')) grid.hidden = true; }, reduceMotion ? 0 : 250);
    if (restore) $('all-btn').focus({ preventScroll: true });
  }
  $('all-btn').addEventListener('click', () => (grid.hidden ? openGrid() : closeGrid()));
  $('objects-close').addEventListener('click', () => closeGrid());
  grid.addEventListener('click', e => { if (e.target === grid) closeGrid(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !grid.hidden) closeGrid(); });

  // ================================================================== the sheet

  const sheet = $('sheet');
  let openId = null;
  let returnFocus = null;
  function sheetOpen() { return !sheet.hidden; }

  function openObject(id, look) {
    const o = OBJECTS.find(x => x.id === id);
    if (!o || hidden.has(id)) return;
    returnFocus = document.activeElement;
    if (look && !introOn) {
      // On wide screens the drawer covers one side: centre the object in what is left.
      let yaw = o.yaw;
      if (innerWidth >= 900) {
        const W = canvas.clientWidth;
        const sheetW = Math.min(460, W * 0.42) + 16;
        const hfov = 2 * Math.atan(tanHalf()[0]) / RAD;
        yaw += (document.documentElement.dir === 'rtl' ? -1 : 1) * (sheetW / 2) / W * hfov;
      }
      turnTo(yaw, Math.max(-20, Math.min(15, o.pitch)));
    }
    hideHint();
    openId = id;
    document.querySelectorAll('.pv').forEach(p => { p.hidden = p.dataset.panel !== id; });
    $('sheet-title').textContent = r('objects')[id];
    sheet.dataset.panel = id;
    sheet.hidden = false;
    requestAnimationFrame(() => sheet.classList.add('is-open'));
    document.body.classList.add('sheet-on');
    $('sheet-body').scrollTop = 0;
    hotEls.forEach((b, k) => b.classList.toggle('is-active', k === id));
    if (history.replaceState) history.replaceState(null, '', location.pathname.startsWith('/d/') ? location.pathname : '#' + id);
    onOpen(id);
    setTimeout(() => $('sheet-close').focus({ preventScroll: true }), 30);
  }

  function closeSheet() {
    if (!sheetOpen()) return;
    sheet.classList.remove('is-open');
    document.body.classList.remove('sheet-on');
    openId = null;
    hotEls.forEach(b => b.classList.remove('is-active'));
    setTimeout(() => { if (!openId) sheet.hidden = true; }, reduceMotion ? 0 : 280);
    if (history.replaceState) history.replaceState(null, '', location.pathname.startsWith('/d/') ? '/' : location.pathname + location.search);
    if (returnFocus && returnFocus.focus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
  }
  $('sheet-close').addEventListener('click', closeSheet);
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !sheetOpen()) return;
    if (!$('ring').hidden) return;
    closeSheet();
  });
  canvas.addEventListener('click', () => { if (moved < 6 && sheetOpen() && innerWidth < 900) closeSheet(); });

  // Swipe the sheet down to close (phones).
  (() => {
    const head = sheet.querySelector('.sheet-head');
    let y0 = null, dy = 0;
    head.addEventListener('pointerdown', e => { if (innerWidth >= 900 || e.target.closest('button')) return; y0 = e.clientY; dy = 0; head.setPointerCapture(e.pointerId); sheet.style.transition = 'none'; });
    head.addEventListener('pointermove', e => { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); sheet.style.transform = `translateY(${dy}px)`; });
    const end = () => {
      if (y0 === null) return;
      y0 = null; sheet.style.transition = ''; sheet.style.transform = '';
      if (dy > 90) closeSheet();
    };
    head.addEventListener('pointerup', end);
    head.addEventListener('pointercancel', end);
  })();

  document.addEventListener('sawt:open', e => openObject(e.detail, true));
  document.addEventListener('sawt:config', e => {
    const cfg = e.detail || {};
    hidden.clear();
    if (!cfg.dedications) { hidden.add('phone'); hidden.add('photos'); }
    renderHotspots(); renderGrid(); setFocus(null); needsDraw = true;
  });

  function onOpen(id) {
    if (id === 'clock') { renderClocks(); tickAnalog(); }
    if (id === 'news') renderMast();
    if (id === 'calendar') renderCalendar();
    if (id === 'window') renderWindow();
    if (id === 'radio') {
      // The dial measures itself; give it a frame to be visible first.
      requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    }
  }

  // ================================================================== object contents

  // ---- clock: an analog wall clock on Beirut time, and the time where you are
  const SVGNS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs = {}, kids = []) {
    const n = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    kids.forEach(k => n.appendChild(k));
    return n;
  }
  let hands = null;
  function buildAnalog() {
    const face = svg('svg', { viewBox: '-110 -110 220 220', class: 'analog-svg' });
    face.appendChild(svg('circle', { r: 104, class: 'a-rim' }));
    face.appendChild(svg('circle', { r: 96, class: 'a-face' }));
    for (let i = 0; i < 60; i++) {
      const big = i % 5 === 0;
      const a = i * 6 * RAD;
      face.appendChild(svg('line', {
        x1: (Math.sin(a) * (big ? 78 : 84)).toFixed(2), y1: (-Math.cos(a) * (big ? 78 : 84)).toFixed(2),
        x2: (Math.sin(a) * 90).toFixed(2), y2: (-Math.cos(a) * 90).toFixed(2), class: big ? 'a-tick big' : 'a-tick'
      }));
    }
    for (let h = 1; h <= 12; h++) {
      const a = h * 30 * RAD;
      const t = svg('text', { x: (Math.sin(a) * 64).toFixed(2), y: (-Math.cos(a) * 64 + 7).toFixed(2), class: 'a-num' });
      t.textContent = String(h);
      face.appendChild(t);
    }
    const brand = svg('text', { x: 0, y: 34, class: 'a-brand' });
    brand.textContent = 'BEYROUTH';
    face.appendChild(brand);
    hands = {
      h: svg('line', { x1: 0, y1: 12, x2: 0, y2: -48, class: 'a-hand h' }),
      m: svg('line', { x1: 0, y1: 16, x2: 0, y2: -72, class: 'a-hand m' }),
      s: svg('line', { x1: 0, y1: 22, x2: 0, y2: -80, class: 'a-hand s' })
    };
    face.append(hands.h, hands.m, hands.s, svg('circle', { r: 4.5, class: 'a-pin' }));
    $('analog').replaceChildren(face);
  }
  function beirutHMS(d = new Date()) {
    const parts = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Beirut' }).formatToParts(d);
    const g = t => Number(parts.find(p => p.type === t).value);
    return [g('hour'), g('minute'), g('second')];
  }
  let analogTimer = null;
  function tickAnalog() {
    if (!hands) buildAnalog();
    const [h, m, sec] = beirutHMS();
    hands.h.setAttribute('transform', `rotate(${(h % 12) * 30 + m * 0.5})`);
    hands.m.setAttribute('transform', `rotate(${m * 6 + sec * 0.1})`);
    hands.s.setAttribute('transform', `rotate(${sec * 6})`);
    clearTimeout(analogTimer);
    if (openId === 'clock') analogTimer = setTimeout(tickAnalog, 1000 - (Date.now() % 1000));
  }
  function renderClocks() {
    const now = new Date();
    const rows = [[r('beirut'), 'Asia/Beirut']];
    if (!S.sameZoneAsBeirut()) rows.push([r('here'), undefined]);
    $('two-clocks').replaceChildren(...rows.map(([name, tz]) => el('div', { className: 'big-clock' }, [
      el('span', { className: 'big-clock-place', text: name }),
      el('span', { className: 'big-clock-time', text: timeIn(now, tz) })
    ])));
  }
  setInterval(() => { if (openId === 'clock') renderClocks(); }, 15000);

  // ---- window: Lebanon on the evening-news weather map
  const MAP = {"d": "M428 11 L422 12 L421 14 L419 15 L416 21 L418 26 L417 27 L415 34 L411 36 L409 35 L408 37 L404 37 L397 33 L395 35 L394 35 L394 37 L391 36 L390 37 L384 34 L379 33 L373 36 L370 35 L363 34 L358 31 L356 31 L354 35 L348 34 L347 36 L346 36 L344 35 L343 36 L342 35 L340 37 L340 35 L338 34 L337 35 L337 34 L334 35 L333 37 L331 36 L327 37 L327 36 L324 36 L324 34 L318 31 L318 30 L312 31 L312 28 L309 28 L310 30 L308 31 L308 34 L306 35 L310 47 L310 72 L307 79 L302 80 L298 82 L282 99 L278 101 L269 103 L261 102 L252 104 L249 108 L252 116 L255 119 L253 123 L240 132 L227 136 L226 140 L223 143 L223 146 L223 154 L218 164 L211 161 L209 162 L205 165 L203 171 L200 173 L198 177 L200 181 L199 186 L201 190 L199 197 L192 208 L189 232 L193 235 L195 241 L196 253 L194 264 L187 276 L188 282 L195 285 L192 291 L186 292 L182 296 L172 322 L167 325 L163 321 L157 323 L153 322 L137 326 L137 332 L139 337 L141 345 L139 349 L142 358 L140 371 L130 389 L127 406 L120 410 L120 425 L114 428 L113 442 L111 444 L111 451 L107 459 L106 457 L104 457 L103 460 L100 478 L85 496 L77 502 L69 519 L65 535 L62 553 L55 564 L50 576 L46 575 L44 579 L48 583 L52 590 L44 619 L38 620 L32 634 L25 637 L18 643 L18 650 L35 652 L33 653 L36 654 L37 653 L41 652 L41 651 L46 652 L46 655 L47 654 L47 654 L52 653 L54 648 L59 649 L62 651 L76 648 L81 645 L83 648 L86 648 L89 646 L89 648 L90 648 L90 649 L91 650 L90 652 L92 657 L94 657 L96 660 L101 665 L102 665 L103 668 L105 668 L105 666 L107 667 L108 666 L110 669 L109 667 L111 664 L127 662 L131 652 L138 651 L150 652 L150 642 L158 640 L161 636 L158 632 L162 619 L163 610 L162 604 L162 596 L165 594 L166 587 L171 579 L171 572 L178 576 L177 581 L184 587 L191 592 L190 587 L189 586 L190 579 L197 576 L202 578 L208 570 L210 572 L213 569 L215 569 L219 566 L221 564 L220 563 L221 558 L223 556 L226 556 L229 561 L231 557 L247 554 L253 547 L255 547 L256 542 L254 540 L258 529 L264 525 L265 523 L268 523 L268 521 L277 518 L277 517 L278 517 L282 515 L282 512 L283 510 L286 510 L290 508 L290 506 L293 505 L294 507 L295 503 L297 503 L298 500 L299 500 L300 498 L296 486 L295 486 L293 484 L296 480 L298 479 L303 480 L306 473 L308 476 L312 476 L315 473 L320 479 L331 462 L333 461 L331 459 L330 454 L330 451 L321 445 L319 445 L317 442 L315 442 L305 439 L299 441 L297 440 L296 434 L294 431 L295 427 L297 425 L298 419 L305 418 L307 411 L305 408 L307 396 L310 398 L312 396 L316 390 L316 387 L320 383 L322 385 L327 382 L328 379 L331 375 L336 363 L345 362 L352 359 L355 355 L358 355 L361 354 L364 357 L379 351 L382 355 L386 357 L388 359 L392 360 L395 357 L395 350 L398 346 L409 349 L413 352 L418 352 L421 356 L441 360 L444 359 L446 357 L446 347 L439 342 L438 338 L427 338 L425 336 L424 334 L422 334 L421 330 L417 328 L415 329 L413 326 L410 326 L409 325 L408 327 L407 325 L408 321 L416 316 L416 311 L422 311 L426 300 L433 294 L436 295 L438 290 L442 287 L446 288 L448 286 L444 281 L445 277 L451 277 L449 272 L451 270 L457 272 L456 267 L472 271 L475 273 L478 268 L482 269 L481 266 L487 259 L484 251 L491 242 L499 236 L504 235 L506 225 L509 224 L512 214 L522 210 L523 206 L516 200 L509 197 L512 179 L509 175 L511 173 L513 175 L516 171 L514 166 L511 164 L507 165 L502 162 L503 157 L498 155 L494 142 L491 140 L500 132 L501 124 L493 117 L493 116 L491 115 L490 117 L489 114 L487 113 L487 114 L486 112 L485 112 L486 110 L484 108 L481 109 L477 105 L470 103 L468 96 L465 96 L464 86 L456 88 L452 86 L450 87 L444 89 L443 87 L437 89 L427 87 L427 78 L435 76 L446 71 L453 65 L449 59 L449 50 L451 48 L450 47 L451 44 L457 46 L459 51 L466 52 L468 49 L469 35 L469 34 L466 35 L464 37 L459 39 L455 39 L449 33 L446 36 L443 35 L436 29 L432 23 L434 15 L430 12 L429 12 L428 11Z", "cities": {"beirut": [150, 330], "tripoli": [266, 113], "saida": [106, 463], "sour": [51, 580], "zahle": [283, 349], "jounieh": [189, 296], "baalbek": [386, 286], "nabatieh": [144, 537]}, "box": [8, 1, 525, 678]};
  function renderWindow() {
    const w = S.weather();
    const cities = (w && w.cities) || [];
    const lang = S.lang();
    const names = { ar: { beirut: 'بيروت', tripoli: 'طرابلس', saida: 'صيدا', sour: 'صور', zahle: 'زحلة', jounieh: 'جونية', baalbek: 'بعلبك', nabatieh: 'النبطية' },
      en: { beirut: 'Beirut', tripoli: 'Tripoli', saida: 'Saida', sour: 'Tyre', zahle: 'Zahle', jounieh: 'Jounieh', baalbek: 'Baalbek', nabatieh: 'Nabatieh' },
      fr: { beirut: 'Beyrouth', tripoli: 'Tripoli', saida: 'Saïda', sour: 'Tyr', zahle: 'Zahlé', jounieh: 'Jounieh', baalbek: 'Baalbek', nabatieh: 'Nabatieh' } }[lang];
    const [bx, by, bw, bh] = MAP.box;
    const map = svg('svg', { viewBox: `${bx - 150} ${by - 10} ${bw + 290} ${bh + 20}`, class: 'lb-svg', direction: 'ltr', role: 'img', 'aria-label': r('objects').window });
    const sea = svg('text', { x: bx - 80, y: by + bh * 0.55, class: 'lb-sea', transform: `rotate(-62 ${bx - 80} ${by + bh * 0.55})` });
    sea.textContent = r('sea');
    map.append(sea, svg('path', { d: MAP.d, class: 'lb-land' }));
    const right = { tripoli: 1, baalbek: 1, zahle: 1, jounieh: 1, nabatieh: 1 };
    for (const c of cities) {
      const pt = MAP.cities[c.id];
      if (!pt) continue;
      const [x, y] = pt;
      const g = svg('g', { class: 'lb-city' + (c.id === 'beirut' ? ' is-capital' : '') });
      g.appendChild(svg('circle', { cx: x, cy: y, r: c.id === 'beirut' ? 9 : 7 }));
      const t = svg('text', { x: x + (right[c.id] ? 16 : -16), y: y + 9, class: 'lb-temp', 'text-anchor': right[c.id] ? 'start' : 'end' });
      t.textContent = `${S.num(c.temperature)}°`;
      const n = svg('text', { x: x + (right[c.id] ? 16 : -16), y: y - 16, class: 'lb-name', 'text-anchor': right[c.id] ? 'start' : 'end' });
      n.textContent = names[c.id] || c.id;
      g.append(n, t);
      map.appendChild(g);
    }
    $('lb-map').replaceChildren(map);
    $('lb-map').hidden = !cities.length;
    const box = $('window-now');
    const c = cities.find(x => x.id === 'beirut');
    box.textContent = c ? r('nowOutside', S.weatherWord(c.code), S.num(c.temperature)) : '';
    box.hidden = !c;
  }
  document.addEventListener('sawt:weather', () => { if (openId === 'window') renderWindow(); });

  // ---- newspaper masthead
  function renderMast() {
    $('mast-date').textContent = new Intl.DateTimeFormat(S.locale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Beirut' }).format(new Date());
  }

  // ---- calendar: the tear-off calendar from the kitchen door, brought to the salon
  const LB_MONTHS = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];
  let tearAt = 0;
  function calendarPages() {
    const today = beirutDate(new Date());
    const list = (C.occasions || []).filter(o => o.date >= today).slice(0, 8);
    const pages = [{ date: today, occ: list.find(o => o.date === today) || null }];
    for (const o of list) if (o.date !== today) pages.push({ date: o.date, occ: o });
    return pages;
  }
  function pageEl(pg, isToday) {
    const lang = S.lang();
    const d = new Date(pg.date + 'T12:00:00Z');
    const loc = S.locale();
    const month = lang === 'ar' ? LB_MONTHS[d.getUTCMonth()] : new Intl.DateTimeFormat(loc, { month: 'long', timeZone: 'UTC' }).format(d);
    const other = lang === 'ar' ? new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC' }).format(d) : '';
    let hijri = '';
    try { hijri = new Intl.DateTimeFormat(loc + '-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d); } catch { /* old browsers */ }
    const weekday = new Intl.DateTimeFormat(loc, { weekday: 'long', timeZone: 'UTC' }).format(d);
    const n = Math.round((Date.parse(pg.date) - Date.parse(beirutDate(new Date()))) / 864e5);
    const sunday = d.getUTCDay() === 0;
    return el('div', { className: 'tear-page' + (sunday || pg.occ ? ' is-red' : '') }, [
      el('div', { className: 'tear-rings', 'aria-hidden': 'true' }, [el('i'), el('i'), el('i'), el('i'), el('i'), el('i')]),
      el('div', { className: 'tear-head' }, [
        el('span', { className: 'tear-month', text: month }),
        other ? el('span', { className: 'tear-month-2', text: other, lang: 'en' }) : null,
        el('span', { className: 'tear-year', text: new Intl.NumberFormat(loc, { useGrouping: false }).format(d.getUTCFullYear()) })
      ]),
      el('div', { className: 'tear-day', text: S.num(d.getUTCDate()) }),
      el('div', { className: 'tear-week', text: weekday }),
      el('div', { className: 'tear-foot' }, [
        el('span', { className: 'tear-occ', text: pg.occ ? (pg.occ[lang] || pg.occ.en) + (pg.occ.approx ? ' *' : '') : '' }),
        el('span', { className: 'tear-when', text: isToday ? '' : r('daysLeft', n) }),
        el('span', { className: 'tear-hijri', text: hijri })
      ])
    ]);
  }
  function renderTear() {
    const pages = calendarPages();
    if (tearAt >= pages.length) tearAt = 0;
    const box = $('tear');
    const btn = el('button', { type: 'button', className: 'tear-btn', text: tearAt === pages.length - 1 ? r('tearBack') : r('tearNext') });
    const under = pages[(tearAt + 1) % pages.length];
    const stack = el('div', { className: 'tear-stack' }, [
      pageEl(under, (tearAt + 1) % pages.length === 0),
      pageEl(pages[tearAt], tearAt === 0)
    ]);
    stack.lastChild.classList.add('is-top');
    btn.addEventListener('click', () => {
      const top = stack.querySelector('.is-top');
      tearAt = (tearAt + 1) % pages.length;
      if (reduceMotion) { renderTear(); return; }
      top.classList.add('is-torn');
      setTimeout(renderTear, 650);
    });
    stack.addEventListener('click', e => { if (!e.target.closest('button')) btn.click(); });
    box.replaceChildren(stack, btn);
  }
  function renderCalendar() {
    renderTear();
    const now = new Date();
    const times = sunTimes(now);
    const today = beirutDate(now);
    const R0 = C.ramadan;
    const inRamadan = R0 && today >= R0.start && today <= R0.end;
    $('sun-today').replaceChildren(
      el('div', { className: 'sun-cell' }, [el('span', { className: 'sun-k', text: r('sunrise') }), el('b', { text: times.rise ? timeIn(times.rise, 'Asia/Beirut') : '–' })]),
      el('div', { className: 'sun-cell' }, [el('span', { className: 'sun-k', text: inRamadan ? r('iftar') : r('sunset') }), el('b', { text: times.set ? timeIn(times.set, 'Asia/Beirut') : '–' })])
    );
    const lang = S.lang();
    const fmt = new Intl.DateTimeFormat(S.locale(), { day: 'numeric', month: 'long', timeZone: 'UTC' });
    const t0 = Date.parse(today + 'T00:00:00Z');
    const list = (C.occasions || []).filter(o => o.date >= today).slice(0, 8);
    $('occasions').replaceChildren(...list.map(o => {
      const d = Date.parse(o.date + 'T00:00:00Z');
      const n = Math.round((d - t0) / 864e5);
      return el('li', { className: 'occasion' + (n === 0 ? ' is-today' : '') }, [
        el('span', { className: 'occ-date', text: fmt.format(new Date(d)) + (o.approx ? ' *' : '') }),
        el('span', { className: 'occ-name', text: o[lang] || o.en }),
        el('span', { className: 'occ-when', text: r('daysLeft', n) })
      ]);
    }));
  }

  // ---- coffee cup
  const cup = $('cup');
  $('cup-btn').addEventListener('click', () => {
    const c = C.coffee;
    if (!c) return;
    const lang = S.lang();
    cup.classList.remove('is-flipped');
    void cup.offsetWidth;
    cup.classList.add('is-flipped');
    const pool = [...c.symbols];
    const picks = [];
    for (let i = 0; i < 3 && pool.length; i++) picks.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    const wishes = c.wishes[lang] || c.wishes.en;
    const box = $('reading');
    box.hidden = true;
    setTimeout(() => {
      box.replaceChildren(
        el('p', { className: 'reading-k', text: r('coffeeSee') }),
        el('ul', { className: 'reading-list' }, picks.map(s => el('li', {}, [el('b', { text: s[lang] || s.en }), document.createTextNode(' · ' + (s.mean[lang] || s.mean.en))]))),
        el('p', { className: 'reading-wish', text: wishes[Math.floor(Math.random() * wishes.length)] })
      );
      box.hidden = false;
      $('cup-btn').textContent = r('coffeeAgain');
    }, reduceMotion ? 0 : 900);
  });

  // ---- Teta's recipes
  let recipeId = (C.recipes && C.recipes[0] && C.recipes[0].id) || null;
  function renderRecipes() {
    const list = C.recipes || [];
    const lang = S.lang();
    $('recipe-tabs').replaceChildren(...list.map(rc => {
      const b = el('button', { type: 'button', className: 'chip', role: 'tab', text: rc.title[lang] || rc.title.en });
      b.setAttribute('aria-selected', String(rc.id === recipeId));
      b.addEventListener('click', () => { recipeId = rc.id; renderRecipes(); });
      return b;
    }));
    const rc = list.find(x => x.id === recipeId);
    if (!rc) return;
    $('recipe').replaceChildren(
      el('h3', { className: 'recipe-title', text: rc.title[lang] || rc.title.en }),
      el('p', { className: 'recipe-meta', text: `${r('serves', rc.serves)} · ${r('minutes', rc.time)}` }),
      el('h4', { text: r('ingredients') }),
      el('ul', { className: 'recipe-ing' }, (rc.ingredients[lang] || rc.ingredients.en).map(x => el('li', { text: x }))),
      el('h4', { text: r('method') }),
      el('ol', { className: 'recipe-steps' }, (rc.steps[lang] || rc.steps.en).map(x => el('li', { text: x })))
    );
  }

  // ---- the cassette shelf
  function renderTapes() {
    const lang = S.lang();
    const playing = window.SawtScreen && window.SawtScreen.current();
    $('tapes').replaceChildren(...(C.moods || []).map(m => {
      const b = el('button', { type: 'button', className: 'tape' + (playing && playing.mood && playing.mood.id === m.id ? ' is-playing' : '') }, [
        el('span', { className: 'tape-shell' }, [
          el('span', { className: 'tape-label' }, [
            el('span', { className: 'tape-title', text: m[lang] || m.en }),
            el('span', { className: 'tape-who', text: m.who, dir: 'ltr' })
          ]),
          el('span', { className: 'tape-window' }, [el('i'), el('i')])
        ]),
        el('span', { className: 'tape-cta', text: r('playOnSpotify') })
      ]);
      b.dataset.id = m.id;
      b.style.setProperty('--c1', m.colors[0]);
      b.style.setProperty('--c2', m.colors[1]);
      b.addEventListener('click', () => { if (window.SawtScreen) window.SawtScreen.playTape(m); });
      return b;
    }));
  }

  // ================================================================== walk-in

  const intro = $('intro');
  let introOn = true;

  function enterRoom() {
    if (!introOn) return;
    introOn = false;
    S.store.set('visited', true);
    intro.classList.add('is-leaving');
    document.body.classList.remove('intro-on');
    setTimeout(() => { intro.hidden = true; }, reduceMotion ? 0 : 1300);
    setTimeout(showHint, 1400);
    const target = deepLink();
    if (target) setTimeout(() => openObject(target, true), reduceMotion ? 0 : 900);
  }
  $('intro-btn').addEventListener('click', enterRoom);

  function deepLink() {
    if (/^\/s\//.test(location.pathname)) return 'radio';
    if (/^\/d\//.test(location.pathname) || new URLSearchParams(location.search).get('dedication')) return 'photos';
    const h = location.hash.slice(1);
    if (OBJECTS.some(o => o.id === h)) return h;
    const legacy = { set: 'radio', classics: 'cassettes', dedications: 'phone' };
    if (legacy[h]) return legacy[h];
    if (new URLSearchParams(location.search).get('station')) return 'radio';
    return null;
  }

  // ================================================================== language

  function applyRoomLanguage() {
    document.querySelectorAll('[data-r]').forEach(n => { n.textContent = r(n.dataset.r); });
    document.querySelectorAll('[data-r-label]').forEach(n => n.setAttribute('aria-label', r(n.dataset.rLabel)));
    if (openId) $('sheet-title').textContent = r('objects')[openId];
    renderSceneChip();
    renderHotspots();
    renderGrid();
    setFocus(focusId);
    renderTapes();
    renderRecipes();
    if (openId) onOpen(openId);
    const credits = $('credits');
    if (credits) credits.textContent = r('credits');
  }
  document.addEventListener('sawt:lang', applyRoomLanguage);

  // ================================================================== start

  function start() {
    document.body.classList.add('intro-on');
    initGL();
    resize();
    window.addEventListener('resize', () => {
      if (!pointers.size) view.fov = Math.min(view.fov, 100);
      resize();
    });
    applyRoomLanguage();
    requestAnimationFrame(frame);

    const img = $('intro-img');
    img.src = doorUrl(scene);
    img.addEventListener('error', () => { img.src = doorUrl('afternoon'); }, { once: true });

    const ready = showScene(scene, false);
    loadMask();
    const fast = S.store.get('visited', false) || deepLink();
    if (fast) {
      intro.classList.add('is-quick');
      Promise.race([ready, new Promise(res => setTimeout(res, 2500))]).then(() => setTimeout(enterRoom, reduceMotion ? 0 : 500));
    }
  }

  start();
})();

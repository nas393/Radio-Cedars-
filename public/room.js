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
      close: 'سكّر',
      scenes: { sunrise: 'طلوع الشمس', day: 'الضهر', afternoon: 'بعد الضهر', sunset: 'المغرب', night: 'الليل' },
      sceneManual: 'اضغط لتغيّر الوقت',
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
      tvLede: 'شغّل التلفزيون على المحطات اللبنانية، مباشرة.',
      photosLede: 'رسائل من الغربة لأهلنا بلبنان.',
      cassettesLede: 'كاسيت لكل جوّ. بيفتح على Spotify.',
      lampLede: 'سكّر الراديو لحاله بعد شوي، وإنت عم تغفى.',
      approxNote: 'الأعياد الهجرية تقريبية وبتتأكد مع رؤية الهلال.',
      coffeeLede: 'اشرب القهوة، اقلب الفنجان، وخلّينا نشوف شو مكتوبلك. (للتسلية بس!)',
      coffeeFlip: 'اقلب الفنجان',
      coffeeAgain: 'فنجان تاني',
      coffeeSee: 'شايف بالفنجان',
      sunrise: 'طلوع الشمس', sunset: 'غياب الشمس', iftar: 'الإفطار تقريباً', today: 'اليوم', inDays: n => n === 1 ? 'بكرا' : `بعد ${S.num(n)} يوم`,
      serves: n => `لـ ${S.num(n)} أشخاص`, minutes: n => `${S.num(n)} دقيقة`, ingredients: 'المكوّنات', method: 'الطريقة',
      playOnSpotify: 'افتح على Spotify', listen: 'اسمع',
      nowOutside: (w, t) => `هلّق ببيروت: ${w}، ${t}°`,
      credits: 'مجسّمات من Khronos glTF Sample Assets (CC BY 4.0 وCC0).'
    },
    en: {
      introTitle: 'Come in, make yourself at home',
      introSub: 'A 1990s Lebanese living room. Everything in it works.',
      introEnter: 'Come in',
      dragHint: 'Drag to look around the room',
      dockLabel: 'Things in the room',
      close: 'Close',
      scenes: { sunrise: 'Sunrise', day: 'Midday', afternoon: 'Afternoon', sunset: 'Sunset', night: 'Night' },
      sceneManual: 'Tap to change the time',
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
      tvLede: 'Lebanese channels, live.',
      photosLede: 'Messages from abroad to family in Lebanon.',
      cassettesLede: 'A tape for every mood. Opens in Spotify.',
      lampLede: 'Let the radio switch itself off while you drift to sleep.',
      approxNote: 'Islamic holidays are approximate and confirmed by the moon sighting.',
      coffeeLede: 'Finish your coffee, flip the cup, and let’s see what it says. (Just for fun!)',
      coffeeFlip: 'Flip the cup',
      coffeeAgain: 'Another cup',
      coffeeSee: 'I can see',
      sunrise: 'Sunrise', sunset: 'Sunset', iftar: 'Iftar, around', today: 'Today', inDays: n => n === 1 ? 'Tomorrow' : `In ${n} days`,
      serves: n => `Serves ${n}`, minutes: n => `${n} min`, ingredients: 'Ingredients', method: 'Method',
      playOnSpotify: 'Open in Spotify', listen: 'Listen',
      nowOutside: (w, t) => `Beirut right now: ${w}, ${t}°`,
      credits: '3D models from Khronos glTF Sample Assets (CC BY 4.0 and CC0).'
    },
    fr: {
      introTitle: 'Entrez, vous êtes chez vous',
      introSub: 'Un salon libanais des années 90. Tout y fonctionne.',
      introEnter: 'Entrer',
      dragHint: 'Faites glisser pour regarder autour',
      dockLabel: 'Les objets du salon',
      close: 'Fermer',
      scenes: { sunrise: 'Lever du soleil', day: 'Midi', afternoon: 'Après-midi', sunset: 'Coucher du soleil', night: 'Nuit' },
      sceneManual: 'Touchez pour changer l’heure',
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
      tvLede: 'Les chaînes libanaises, en direct.',
      photosLede: 'Des messages de l’étranger pour la famille au Liban.',
      cassettesLede: 'Une cassette pour chaque ambiance. S’ouvre dans Spotify.',
      lampLede: 'La radio s’éteint toute seule pendant que vous vous endormez.',
      approxNote: 'Les fêtes musulmanes sont approximatives, selon l’observation de la lune.',
      coffeeLede: 'Finissez votre café, retournez la tasse, et voyons ce qu’elle dit. (Pour rire !)',
      coffeeFlip: 'Retourner la tasse',
      coffeeAgain: 'Une autre tasse',
      coffeeSee: 'Je vois',
      sunrise: 'Lever', sunset: 'Coucher', iftar: 'Iftar, vers', today: 'Aujourd’hui', inDays: n => n === 1 ? 'Demain' : `Dans ${n} jours`,
      serves: n => `Pour ${n}`, minutes: n => `${n} min`, ingredients: 'Ingrédients', method: 'Préparation',
      playOnSpotify: 'Ouvrir dans Spotify', listen: 'Écouter',
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
    { id: 'radio', yaw: -36.4, pitch: -4.8 },
    { id: 'cassettes', yaw: -28.8, pitch: -9.5 },
    { id: 'photos', yaw: -33.3, pitch: 7.5 },
    { id: 'lamp', yaw: -47.5, pitch: 3.2 },
    { id: 'coffee', yaw: -13.7, pitch: -27.1 },
    { id: 'window', yaw: 0, pitch: 8.9 },
    { id: 'news', yaw: 11.2, pitch: -29.6 },
    { id: 'calendar', yaw: 23.8, pitch: 9.6 },
    { id: 'clock', yaw: 32.7, pitch: 13.5 },
    { id: 'books', yaw: 30.4, pitch: -9.9 },
    { id: 'tv', yaw: 36.6, pitch: -6.7 },
    { id: 'phone', yaw: 93.5, pitch: -14.6 }
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
  const view = { yaw: 0, pitch: -6, fov: 0, vy: 0, vp: 0 };
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
    const float PI = 3.14159265;
    void main(){
      vec3 d = normalize(rot * vec3(p.x * th.x, p.y * th.y, -1.0));
      float lon = atan(d.x, -d.z);
      float lat = asin(clamp(d.y, -1.0, 1.0));
      vec2 uv = vec2(0.5 + lon / (2.0 * PI), 0.5 - lat / PI);
      vec4 c = texture2D(t0, uv);
      if (mixv > 0.0) c = mix(c, texture2D(t1, uv), mixv);
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
    for (const n of ['rot', 'th', 't0', 't1', 'mixv']) uni[n] = gl.getUniformLocation(prog, n);
    gl.uniform1i(uni.t0, 0);
    gl.uniform1i(uni.t1, 1);
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); }, false);
    canvas.addEventListener('webglcontextrestored', () => { initGL(); if (currentImg) setTexture(0, currentImg); needsDraw = true; });
    return true;
  }

  function setTexture(unit, img) {
    if (!tex[unit]) tex[unit] = gl.createTexture();
    gl.activeTexture(unit ? gl.TEXTURE1 : gl.TEXTURE0);
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
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex[0]);
      if (tex[1]) { gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex[1]); }
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

  function placeHotspots() {
    const { r: rr, u, f } = basis();
    const [tx, ty] = tanHalf();
    const W = canvas.clientWidth, H = canvas.clientHeight;
    for (const o of OBJECTS) {
      const b = hotEls.get(o.id);
      if (!b || !b.isConnected) continue;
      const y = o.yaw * RAD, p = o.pitch * RAD;
      const h = [Math.sin(y) * Math.cos(p), Math.sin(p), -Math.cos(y) * Math.cos(p)];
      const z = h[0] * f[0] + h[1] * f[1] + h[2] * f[2];
      if (z < 0.2) { b.style.visibility = 'hidden'; continue; }
      const x = (h[0] * rr[0] + h[1] * rr[1] + h[2] * rr[2]) / z / tx;
      const yy = (h[0] * u[0] + h[1] * u[1] + h[2] * u[2]) / z / ty;
      if (Math.abs(x) > 1.15 || Math.abs(yy) > 1.15) { b.style.visibility = 'hidden'; continue; }
      b.style.visibility = 'visible';
      b.style.transform = `translate(${((x + 1) / 2 * W).toFixed(1)}px, ${((1 - yy) / 2 * H).toFixed(1)}px)`;
    }
  }

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
    if (needsDraw) { needsDraw = false; draw(); }
    requestAnimationFrame(frame);
  }

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
    chip.replaceChildren(
      el('span', { className: 'scene-dot scene-' + scene }),
      el('span', { className: 'scene-name', text: r('scenes')[scene] }),
      el('span', { className: 'scene-time', text: `${timeIn(now, 'Asia/Beirut')} · ${r('beirut')}` })
    );
    chip.title = r('sceneManual');
    chip.setAttribute('aria-label', `${r('scenes')[scene]}, ${timeIn(now, 'Asia/Beirut')} ${r('beirut')}. ${r('sceneManual')}`);
  }
  chip.addEventListener('click', () => {
    manualScene = true;
    showScene(SCENES[(SCENES.indexOf(scene) + 1) % SCENES.length], true);
  });
  setInterval(() => {
    renderSceneChip();
    if (!manualScene) {
      const s = sceneFor();
      if (s !== scene) showScene(s, true);
    }
  }, 30000);

  // ================================================================== the dock

  const dock = $('dock');
  function renderDock() {
    dock.replaceChildren(...OBJECTS.filter(o => !hidden.has(o.id)).map(o => {
      const img = el('img', { className: 'dock-img', alt: '', loading: 'lazy', decoding: 'async', src: `/room/thumb-${o.id}.jpg` });
      img.addEventListener('error', () => img.remove());
      const b = el('button', { type: 'button', className: 'dock-item' }, [
        img,
        el('span', { className: 'dock-name', text: r('objects')[o.id] }),
        el('span', { className: 'dock-hint', text: r('hints')[o.id] })
      ]);
      b.dataset.id = o.id;
      b.setAttribute('aria-pressed', String(openId === o.id));
      b.addEventListener('click', () => openObject(o.id, true));
      return b;
    }));
  }

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
    dock.querySelectorAll('.dock-item').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
    const dockItem = dock.querySelector(`[data-id="${id}"]`);
    if (dockItem) dockItem.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
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
    dock.querySelectorAll('.dock-item').forEach(b => b.setAttribute('aria-pressed', 'false'));
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
    renderHotspots(); renderDock();
  });

  function onOpen(id) {
    if (id === 'clock') renderClocks();
    if (id === 'calendar') renderCalendar();
    if (id === 'window') renderWindow();
    if (id === 'radio') {
      // The dial measures itself; give it a frame to be visible first.
      requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    }
  }

  // ================================================================== object contents

  // ---- clock
  function renderClocks() {
    const now = new Date();
    const rows = [[r('beirut'), 'Asia/Beirut']];
    if (!S.sameZoneAsBeirut()) rows.push([r('here'), undefined]);
    $('two-clocks').replaceChildren(...rows.map(([name, tz]) => el('div', { className: 'big-clock' }, [
      el('span', { className: 'big-clock-time', text: timeIn(now, tz) }),
      el('span', { className: 'big-clock-place', text: name })
    ])));
  }
  setInterval(() => { if (openId === 'clock') renderClocks(); }, 15000);

  // ---- window
  function renderWindow() {
    const w = S.weather();
    const box = $('window-now');
    const c = w && (w.cities || []).find(x => x.id === 'beirut');
    box.textContent = c ? r('nowOutside', S.weatherWord(c.code), S.num(c.temperature)) : '';
    box.hidden = !c;
  }
  document.addEventListener('sawt:weather', () => { if (openId === 'window') renderWindow(); });

  // ---- calendar
  function renderCalendar() {
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
    const dayMs = 864e5;
    const t0 = Date.parse(today + 'T00:00:00Z');
    const list = (C.occasions || []).filter(o => o.date >= today).slice(0, 8);
    $('occasions').replaceChildren(...list.map(o => {
      const d = Date.parse(o.date + 'T00:00:00Z');
      const n = Math.round((d - t0) / dayMs);
      return el('li', { className: 'occasion' + (n === 0 ? ' is-today' : '') }, [
        el('span', { className: 'occ-date', text: fmt.format(new Date(d)) + (o.approx ? ' *' : '') }),
        el('span', { className: 'occ-name', text: o[lang] || o.en }),
        el('span', { className: 'occ-when', text: n === 0 ? r('today') : r('inDays', n) })
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
    $('tapes').replaceChildren(...(C.moods || []).map(m => {
      const href = m.spotify ? `https://open.spotify.com/playlist/${m.spotify}` : `https://open.spotify.com/search/${encodeURIComponent(m.q)}`;
      const a = el('a', { className: 'tape', href, target: '_blank', rel: 'noopener noreferrer' }, [
        el('span', { className: 'tape-shell' }, [
          el('span', { className: 'tape-label' }, [
            el('span', { className: 'tape-title', text: m[lang] || m.en }),
            el('span', { className: 'tape-who', text: m.who, dir: 'ltr' })
          ]),
          el('span', { className: 'tape-window' }, [el('i'), el('i')])
        ]),
        el('span', { className: 'tape-cta', text: r('playOnSpotify') })
      ]);
      a.style.setProperty('--c1', m.colors[0]);
      a.style.setProperty('--c2', m.colors[1]);
      return a;
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
    renderDock();
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
    const fast = S.store.get('visited', false) || deepLink();
    if (fast) {
      intro.classList.add('is-quick');
      Promise.race([ready, new Promise(res => setTimeout(res, 2500))]).then(() => setTimeout(enterRoom, reduceMotion ? 0 : 500));
    }
  }

  start();
})();

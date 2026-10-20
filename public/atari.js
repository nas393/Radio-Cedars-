/* "الأتاري": the game console under the TV, like every Lebanese living room had in the 80s
   and 90s. Four cartridges of our own: tennis, the wall-breaker, the snake and space war.
   Arrows or the buttons on screen, or drag on the screen; best scores are kept, and in a
   family room you can show off your score in the chat. */
(() => {
  'use strict';
  const S = window.Sawt;
  const $ = id => document.getElementById(id);
  const el = S.el;
  const box = $('atari');
  if (!box) return;

  const T = {
    ar: { lede: 'حطّ خرطوشة وكبّس ▶. بتلعب بالأسهم أو بالأزرار تحت، أو اسحب عالشاشة.', pick: 'اختار خرطوشة', start: '▶ ابدأ', again: '↻ كمان مرّة', pause: '⏸ وقّف', resume: '▶ كمّل', big: '⛶ كبّر', small: '⛶ صغّر', eject: '⏏ طلّع الخرطوشة',
      score: 'النتيجة', best: 'أحسن نتيجة', lives: 'أرواح', over: 'خلصت اللعبة', win: 'ربحت! 🎉', lose: 'خسرت 😅', press: 'كبّس ▶ لتبلّش', share: '📤 خبّر الغرفة', shared: 'وصلت للغرفة 👾', newBest: 'رقم قياسي جديد! 🏆',
      brag: (n, s, g) => `👾 ${n} جاب ${S.num(s)} بـ«${g}» عالأتاري! مين بيغلبو؟`, you: 'إنت', cpu: 'الكمبيوتر', level: 'مرحلة',
      carts: { tennis: 'تنس', breaker: 'كسّر الحيط', snake: 'الحيّة', space: 'حرب الفضاء' },
      how: { tennis: 'ردّ الطابة عالكمبيوتر. أوّل واحد بيوصل ٧ بيربح.', breaker: 'كسّر كل الحجارة وما توقّع الطابة.', snake: 'كول التفّاح وكبّر، وما تخبط بحالك ولا بالحيط.', space: 'تحرّك يمين وشمال وكبّس Ⓐ لتضرب.' } },
    en: { lede: 'Put in a cartridge and press ▶. Play with the arrows or the buttons below, or drag on the screen.', pick: 'Pick a cartridge', start: '▶ Start', again: '↻ Play again', pause: '⏸ Pause', resume: '▶ Resume', big: '⛶ Big screen', small: '⛶ Smaller', eject: '⏏ Eject',
      score: 'Score', best: 'Best', lives: 'Lives', over: 'Game over', win: 'You win! 🎉', lose: 'You lose 😅', press: 'Press ▶ to start', share: '📤 Tell the room', shared: 'Sent to the room 👾', newBest: 'New best score! 🏆',
      brag: (n, s, g) => `👾 ${n} scored ${s} at ${g} on the console! Who can beat that?`, you: 'You', cpu: 'Computer', level: 'Level',
      carts: { tennis: 'Tennis', breaker: 'Wall Breaker', snake: 'The Snake', space: 'Space War' },
      how: { tennis: 'Hit the ball back past the computer. First to 7 wins.', breaker: 'Break every brick and don’t drop the ball.', snake: 'Eat the apples and grow; don’t bite yourself or the wall.', space: 'Move left and right, press Ⓐ to fire.' } },
    fr: { lede: 'Mettez une cartouche et appuyez sur ▶. Jouez avec les flèches ou les boutons, ou glissez sur l’écran.', pick: 'Choisissez une cartouche', start: '▶ Jouer', again: '↻ Rejouer', pause: '⏸ Pause', resume: '▶ Reprendre', big: '⛶ Grand écran', small: '⛶ Réduire', eject: '⏏ Éjecter',
      score: 'Score', best: 'Record', lives: 'Vies', over: 'Partie terminée', win: 'Gagné ! 🎉', lose: 'Perdu 😅', press: 'Appuyez sur ▶', share: '📤 Le dire à la pièce', shared: 'Envoyé à la pièce 👾', newBest: 'Nouveau record ! 🏆',
      brag: (n, s, g) => `👾 ${n} a fait ${s} à ${g} sur la console ! Qui fait mieux ?`, you: 'Vous', cpu: 'Ordinateur', level: 'Niveau',
      carts: { tennis: 'Tennis', breaker: 'Casse-mur', snake: 'Le Serpent', space: 'Guerre spatiale' },
      how: { tennis: 'Renvoyez la balle. Le premier à 7 gagne.', breaker: 'Cassez toutes les briques sans lâcher la balle.', snake: 'Mangez les pommes et grandissez ; évitez les murs et votre queue.', space: 'Bougez à gauche et à droite, Ⓐ pour tirer.' } }
  };
  const t = (k, ...a) => { const v = (T[S.lang()] || T.ar)[k]; return typeof v === 'function' ? v(...a) : v; };
  const CARTS = [
    { id: 'tennis', color: '#E8792B', icon: '🏓' },
    { id: 'breaker', color: '#2E7D9B', icon: '🧱' },
    { id: 'snake', color: '#3C9A4A', icon: '🐍' },
    { id: 'space', color: '#8E3BA8', icon: '👾' }
  ];

  // ------------------------------------------------------------------ the screen and the sound
  const W = 256, H = 224;
  const PAL = { bg: '#0b0b14', fg: '#F4E9C8', a: '#F5C66A', b: '#E2573C', c: '#5BC0EB', d: '#7BD389', e: '#C77DFF', dim: '#3a3550' };
  let actx = null;
  function beep(f = 440, d = 0.06, type = 'square', vol = 0.06) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(vol, actx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + d);
      o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + d + 0.02);
    } catch { /* silent */ }
  }
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ------------------------------------------------------------------ input
  const keys = { left: false, right: false, up: false, down: false, fire: false };
  let pointerX = null, pointerY = null, firePressed = false, dirQueue = [];
  function press(k, on) {
    if (k === 'fire' && on && !keys.fire) firePressed = true;
    if (on && ['left', 'right', 'up', 'down'].includes(k) && !keys[k]) dirQueue.push(k);
    keys[k] = on;
  }
  const KEYMAP = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', ' ': 'fire', Enter: 'fire', a: 'left', d: 'right', w: 'up', s: 'down' };
  document.addEventListener('keydown', e => {
    if (!active()) return;
    const k = KEYMAP[e.key]; if (!k) return;
    e.preventDefault();
    if (k === 'fire' && state !== 'play') { startOrResume(); return; }
    press(k, true);
  });
  document.addEventListener('keyup', e => { const k = KEYMAP[e.key]; if (k) press(k, false); });

  // ------------------------------------------------------------------ the four cartridges
  const games = {
    tennis: {
      init(g) { g.p = { y: H / 2 }; g.c = { y: H / 2 }; g.s = [0, 0]; this.serve(g, 1); },
      serve(g, dir) { g.ball = { x: W / 2, y: H / 2, vx: 110 * dir, vy: rnd(-70, 70) }; },
      update(g, dt) {
        const PH = 34;
        if (pointerY !== null) g.p.y += (pointerY - g.p.y) * Math.min(1, dt * 14);
        else g.p.y += ((keys.down ? 1 : 0) - (keys.up ? 1 : 0)) * 180 * dt;
        g.p.y = clamp(g.p.y, PH / 2 + 4, H - PH / 2 - 4);
        const target = g.ball.vx > 0 ? g.ball.y : H / 2;
        g.c.y += clamp(target - g.c.y, -1, 1) * Math.min(Math.abs(target - g.c.y), (95 + g.s[1] * 4) * dt);
        g.c.y = clamp(g.c.y, PH / 2 + 4, H - PH / 2 - 4);
        const b = g.ball;
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.y < 6 || b.y > H - 6) { b.vy *= -1; b.y = clamp(b.y, 6, H - 6); beep(300, 0.03); }
        const hit = (px, py) => Math.abs(b.x - px) < 6 && Math.abs(b.y - py) < PH / 2 + 3;
        if (b.vx < 0 && hit(16, g.p.y)) { b.vx = Math.abs(b.vx) * 1.06; b.vy += (b.y - g.p.y) * 4; beep(620, 0.04); g.score += 10; }
        if (b.vx > 0 && hit(W - 16, g.c.y)) { b.vx = -Math.abs(b.vx) * 1.04; b.vy += (b.y - g.c.y) * 3; beep(520, 0.04); }
        b.vx = clamp(b.vx, -320, 320);
        if (b.x < -8) { g.s[1]++; beep(140, 0.25, 'sawtooth'); if (g.s[1] >= 7) return g.end(false); this.serve(g, 1); }
        if (b.x > W + 8) { g.s[0]++; g.score += 100; beep(880, 0.15); if (g.s[0] >= 7) return g.end(true); this.serve(g, -1); }
      },
      draw(g, x) {
        x.fillStyle = PAL.dim; for (let y = 4; y < H; y += 12) x.fillRect(W / 2 - 1, y, 2, 6);
        x.fillStyle = PAL.a; x.fillRect(12, g.p.y - 17, 6, 34);
        x.fillStyle = PAL.c; x.fillRect(W - 18, g.c.y - 17, 6, 34);
        x.fillStyle = PAL.fg; x.fillRect(g.ball.x - 3, g.ball.y - 3, 6, 6);
        big(x, String(g.s[0]), W / 2 - 34, 12, PAL.a); big(x, String(g.s[1]), W / 2 + 22, 12, PAL.c);
      }
    },
    breaker: {
      init(g) { g.lives = 3; g.level = 1; g.pad = { x: W / 2, w: 40 }; this.bricks(g); this.reset(g); },
      bricks(g) {
        g.br = [];
        const cols = ['#E2573C', '#E8792B', '#F5C66A', '#7BD389', '#5BC0EB', '#C77DFF'];
        for (let r = 0; r < 6; r++) for (let c = 0; c < 10; c++) g.br.push({ x: 8 + c * 24, y: 28 + r * 10, w: 22, h: 8, c: cols[r], p: (6 - r) * 10 });
      },
      reset(g) { g.ball = { x: g.pad.x, y: H - 30, vx: rnd(-60, 60), vy: -(120 + g.level * 12), stuck: true }; },
      update(g, dt) {
        if (pointerX !== null) g.pad.x += (pointerX - g.pad.x) * Math.min(1, dt * 16);
        else g.pad.x += ((keys.right ? 1 : 0) - (keys.left ? 1 : 0)) * 220 * dt;
        g.pad.x = clamp(g.pad.x, g.pad.w / 2, W - g.pad.w / 2);
        const b = g.ball;
        if (b.stuck) { b.x = g.pad.x; if (firePressed || pointerX !== null && g.tapped) { b.stuck = false; g.tapped = false; } return; }
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.x < 3 || b.x > W - 3) { b.vx *= -1; b.x = clamp(b.x, 3, W - 3); beep(300, 0.02); }
        if (b.y < 18) { b.vy = Math.abs(b.vy); beep(300, 0.02); }
        if (b.vy > 0 && b.y > H - 22 && b.y < H - 14 && Math.abs(b.x - g.pad.x) < g.pad.w / 2 + 3) {
          b.vy = -Math.abs(b.vy) * 1.01; b.vx = (b.x - g.pad.x) * 5; beep(520, 0.03);
        }
        for (const k of g.br) {
          if (k.dead) continue;
          if (b.x > k.x - 2 && b.x < k.x + k.w + 2 && b.y > k.y - 2 && b.y < k.y + k.h + 2) {
            k.dead = true; g.score += k.p; b.vy *= -1; beep(700 + k.p * 6, 0.03); break;
          }
        }
        if (g.br.every(k => k.dead)) { g.level++; beep(990, 0.2); this.bricks(g); this.reset(g); }
        if (b.y > H + 6) { g.lives--; beep(140, 0.3, 'sawtooth'); if (g.lives <= 0) return g.end(false); this.reset(g); }
      },
      draw(g, x) {
        g.br.forEach(k => { if (!k.dead) { x.fillStyle = k.c; x.fillRect(k.x, k.y, k.w, k.h); } });
        x.fillStyle = PAL.a; x.fillRect(g.pad.x - g.pad.w / 2, H - 20, g.pad.w, 5);
        x.fillStyle = PAL.fg; x.fillRect(g.ball.x - 3, g.ball.y - 3, 6, 6);
        small(x, `${t('level')} ${g.level}  ♥${g.lives}`, 6, 10, PAL.fg);
      }
    },
    snake: {
      init(g) { g.cell = 8; g.cols = W / 8; g.rows = (H - 16) / 8; g.sn = [{ x: 10, y: 12 }, { x: 9, y: 12 }, { x: 8, y: 12 }]; g.dir = { x: 1, y: 0 }; g.next = g.dir; g.acc = 0; g.speed = 7; this.food(g); },
      food(g) { do { g.f = { x: Math.floor(rnd(1, g.cols - 1)), y: Math.floor(rnd(1, g.rows - 1)) }; } while (g.sn.some(s => s.x === g.f.x && s.y === g.f.y)); },
      update(g, dt) {
        const D = { left: { x: -1, y: 0 }, right: { x: 1, y: 0 }, up: { x: 0, y: -1 }, down: { x: 0, y: 1 } };
        while (dirQueue.length) { const d = D[dirQueue.shift()]; if (d && !(d.x === -g.dir.x && d.y === -g.dir.y)) { g.next = d; break; } }
        g.acc += dt;
        if (g.acc < 1 / g.speed) return;
        g.acc = 0; g.dir = g.next;
        const h = { x: g.sn[0].x + g.dir.x, y: g.sn[0].y + g.dir.y };
        if (h.x < 0 || h.y < 0 || h.x >= g.cols || h.y >= g.rows || g.sn.some(s => s.x === h.x && s.y === h.y)) { beep(140, 0.35, 'sawtooth'); return g.end(false); }
        g.sn.unshift(h);
        if (h.x === g.f.x && h.y === g.f.y) { g.score += 10; g.speed = Math.min(16, g.speed + 0.35); beep(760, 0.05); this.food(g); }
        else g.sn.pop();
      },
      draw(g, x) {
        const c = g.cell, oy = 16;
        x.strokeStyle = PAL.dim; x.strokeRect(0.5, oy + 0.5, W - 1, H - oy - 1);
        x.fillStyle = PAL.b; x.fillRect(g.f.x * c + 1, oy + g.f.y * c + 1, c - 2, c - 2);
        x.fillStyle = '#3C9A4A'; x.fillRect(g.f.x * c + 3, oy + g.f.y * c - 1, 2, 3);
        g.sn.forEach((s, i) => { x.fillStyle = i ? PAL.d : PAL.a; x.fillRect(s.x * c + 1, oy + s.y * c + 1, c - 2, c - 2); });
      }
    },
    space: {
      init(g) { g.lives = 3; g.wave = 1; g.ship = { x: W / 2 }; g.shots = []; g.bombs = []; g.cool = 0; this.wave(g); },
      wave(g) {
        g.al = []; g.dx = 22 + g.wave * 5; g.drop = 0;
        for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) g.al.push({ x: 30 + c * 24, y: 28 + r * 16, r });
      },
      update(g, dt) {
        if (pointerX !== null) g.ship.x += (pointerX - g.ship.x) * Math.min(1, dt * 12);
        else g.ship.x += ((keys.right ? 1 : 0) - (keys.left ? 1 : 0)) * 150 * dt;
        g.ship.x = clamp(g.ship.x, 8, W - 8);
        g.cool -= dt;
        if ((firePressed || keys.fire || g.autofire) && g.cool <= 0 && g.shots.length < 3) { g.shots.push({ x: g.ship.x, y: H - 22 }); g.cool = 0.3; beep(900, 0.03, 'square', 0.04); }
        g.shots.forEach(s => { s.y -= 240 * dt; });
        g.shots = g.shots.filter(s => s.y > 10);
        // the fleet marches, turns and comes down
        let edge = false;
        g.al.forEach(a => { a.x += g.dx * dt; if (a.x < 8 || a.x > W - 8) edge = true; });
        if (edge) { g.dx *= -1.05; g.al.forEach(a => { a.y += 8; a.x = clamp(a.x, 8, W - 8); }); }
        for (const s of g.shots) for (const a of g.al) {
          if (!a.dead && Math.abs(s.x - a.x) < 8 && Math.abs(s.y - a.y) < 6) { a.dead = true; s.y = -99; g.score += (4 - a.r) * 10; beep(220, 0.06, 'triangle', 0.08); }
        }
        g.al = g.al.filter(a => !a.dead);
        if (Math.random() < dt * (0.8 + g.wave * 0.3) && g.al.length) { const a = g.al[Math.floor(Math.random() * g.al.length)]; g.bombs.push({ x: a.x, y: a.y + 6 }); }
        g.bombs.forEach(b => { b.y += (90 + g.wave * 10) * dt; });
        for (const b of g.bombs) if (b.y > H - 26 && b.y < H - 12 && Math.abs(b.x - g.ship.x) < 9) { b.y = H + 99; g.lives--; beep(120, 0.35, 'sawtooth'); if (g.lives <= 0) return g.end(false); }
        g.bombs = g.bombs.filter(b => b.y < H);
        if (g.al.some(a => a.y > H - 34)) return g.end(false);
        if (!g.al.length) { g.wave++; g.score += 100; beep(990, 0.2); this.wave(g); }
      },
      draw(g, x) {
        const alien = (a) => { x.fillStyle = [PAL.e, PAL.c, PAL.d, PAL.a][a.r]; const f = Math.floor(performance.now() / 300) % 2; x.fillRect(a.x - 6, a.y - 3, 12, 6); x.fillRect(a.x - 4, a.y - 5, 8, 2); x.fillStyle = PAL.bg; x.fillRect(a.x - 3, a.y - 2, 2, 2); x.fillRect(a.x + 1, a.y - 2, 2, 2); x.fillStyle = [PAL.e, PAL.c, PAL.d, PAL.a][a.r]; x.fillRect(a.x - 6 + (f ? 0 : 1), a.y + 3, 2, 2); x.fillRect(a.x + 4 - (f ? 0 : 1), a.y + 3, 2, 2); };
        g.al.forEach(alien);
        x.fillStyle = PAL.a; x.fillRect(g.ship.x - 8, H - 18, 16, 5); x.fillRect(g.ship.x - 2, H - 22, 4, 4);
        x.fillStyle = PAL.fg; g.shots.forEach(s => x.fillRect(s.x - 1, s.y - 4, 2, 6));
        x.fillStyle = PAL.b; g.bombs.forEach(b => x.fillRect(b.x - 1, b.y - 3, 2, 6));
        small(x, `${t('level')} ${g.wave}  ♥${g.lives}`, 6, 10, PAL.fg);
      }
    }
  };
  // a chunky little font, drawn with the canvas font at a small size
  function small(x, s, px, py, col) { x.fillStyle = col; x.font = 'bold 9px ui-monospace, monospace'; x.textBaseline = 'top'; x.fillText(s, px, py - 6); }
  function big(x, s, px, py, col) { x.fillStyle = col; x.font = 'bold 22px ui-monospace, monospace'; x.textBaseline = 'top'; x.fillText(s, px, py); }

  // ------------------------------------------------------------------ the console
  let cart = null, state = 'menu', g = null, raf = 0, last = 0, isBig = false, frames = 0;
  const bestAll = () => S.store.get('atariBest', {}) || {};
  const canvas = el('canvas', { width: W, height: H, className: 'at-canvas', 'aria-label': 'game' });
  const ctx2 = canvas.getContext('2d');
  ctx2.imageSmoothingEnabled = false;
  const active = () => !!(window.SawtRoom && window.SawtRoom.isOpen() === 'atari') || isBig;

  function newGame() {
    g = { score: 0, end: won => endGame(won) };
    const G = games[cart];
    G.init.call(G, g);
    if (cart === 'tennis') g.serve = dir => G.serve(g, dir);
  }
  function endGame(won) {
    state = 'over'; g.won = won;
    const b = bestAll();
    g.newBest = g.score > (b[cart] || 0);
    if (g.newBest) { b[cart] = g.score; S.store.set('atariBest', b); }
    render();
  }
  function startOrResume() {
    if (!cart) return;
    if (state === 'menu' || state === 'over') { newGame(); state = 'play'; }
    else if (state === 'paused') state = 'play';
    try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); } catch { /* fine */ }
    render(); loop();
  }
  function loop() {
    cancelAnimationFrame(raf);
    last = performance.now();
    const step = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (state === 'play' && !active()) { state = 'paused'; render(); }
      if (state === 'play') games[cart].update.call(games[cart], g, dt);
      if (state === 'play' && (++frames % 20 === 0)) { const h = box.querySelector('.at-head .small'); if (h) h.textContent = `${t('score')} ${S.num(g.score)} · ${t('best')} ${S.num(Math.max(g.score, bestAll()[cart] || 0))}`; }
      firePressed = false;
      draw();
      if (state === 'play') raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  function draw() {
    const x = ctx2;
    x.fillStyle = PAL.bg; x.fillRect(0, 0, W, H);
    if (!cart) { big(x, '▶', W / 2 - 8, H / 2 - 12, PAL.a); return; }
    if (g) games[cart].draw.call(games[cart], g, x);
    small(x, `${t('score')} ${g ? g.score : 0}`, W - 96, 10, PAL.a);
    if (state !== 'play') {
      x.fillStyle = 'rgba(11,11,20,.72)'; x.fillRect(0, H / 2 - 26, W, 52);
      const msg = state === 'over' ? (cart === 'tennis' ? (g.won ? 'YOU WIN!' : 'GAME OVER') : 'GAME OVER') : state === 'paused' ? 'PAUSE' : 'PRESS ▶';
      x.font = 'bold 18px ui-monospace, monospace'; x.textAlign = 'center'; x.fillStyle = PAL.a; x.fillText(msg, W / 2, H / 2 - 12); x.textAlign = 'start';
    }
  }

  // drag on the screen moves the paddle or the ship; a tap fires or serves; swipes steer the snake
  let sx = 0, sy = 0;
  canvas.addEventListener('pointerdown', e => {
    if (!cart) return;
    if (state !== 'play') { startOrResume(); return; }
    canvas.setPointerCapture(e.pointerId);
    const r = canvas.getBoundingClientRect();
    sx = e.clientX; sy = e.clientY;
    pointerX = (e.clientX - r.left) / r.width * W; pointerY = (e.clientY - r.top) / r.height * H;
    if (g) g.tapped = true;
    if (cart === 'space') g.autofire = true;
    if (cart === 'snake') { pointerX = pointerY = null; }
  });
  canvas.addEventListener('pointermove', e => {
    if (state !== 'play' || cart === 'snake' || pointerX === null) return;
    const r = canvas.getBoundingClientRect();
    pointerX = (e.clientX - r.left) / r.width * W; pointerY = (e.clientY - r.top) / r.height * H;
  });
  const up = e => {
    if (cart === 'snake' && state === 'play') {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 18) dirQueue.push(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    }
    pointerX = pointerY = null; if (g) g.autofire = false;
  };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);

  function pad() {
    const b = (k, label, cls) => {
      const n = el('button', { type: 'button', className: 'at-btn ' + (cls || ''), text: label, 'aria-label': k });
      const on = e => { e.preventDefault(); if (k === 'fire' && state !== 'play') { startOrResume(); return; } press(k, true); };
      const off = () => press(k, false);
      n.addEventListener('pointerdown', on); n.addEventListener('pointerup', off); n.addEventListener('pointerleave', off); n.addEventListener('pointercancel', off);
      return n;
    };
    return el('div', { className: 'at-pad', dir: 'ltr' }, [
      el('div', { className: 'at-dpad' }, [b('up', '▲', 'u'), b('left', '◀', 'l'), b('right', '▶', 'r'), b('down', '▼', 'd')]),
      b('fire', 'Ⓐ', 'at-fire')
    ]);
  }

  function shareScore() {
    const R = window.SawtRooms, r = R && R.current();
    if (!r || !g) return;
    R.api(r, '/say', { text: t('brag', r.name, g.score, t('carts')[cart]) }).then(() => S.toast(t('shared'))).catch(() => {});
  }

  function render() {
    box.dir = S.lang() === 'ar' ? 'rtl' : 'ltr';
    const best = bestAll();
    const kids = [];
    if (!cart || state === 'menu' && !g) {
      kids.push(el('p', { className: 'pv-lede', text: t('lede') }), el('p', { className: 'q-k', text: t('pick') }));
      kids.push(el('div', { className: 'at-carts' }, CARTS.map(c => {
        const b = el('button', { type: 'button', className: 'at-cart' + (cart === c.id ? ' is-in' : ''), style: `--c:${c.color}` }, [
          el('span', { className: 'at-cart-label' }, [el('b', { text: c.icon }), el('span', { text: t('carts')[c.id] })]),
          best[c.id] ? el('small', { text: `${t('best')}: ${S.num(best[c.id])}` }) : null
        ].filter(Boolean));
        b.addEventListener('click', () => { cart = c.id; state = 'menu'; g = null; newGame(); render(); draw(); beep(520, 0.05); });
        return b;
      })));
      if (!cart) { box.replaceChildren(...kids); return; }
    }
    const head = el('div', { className: 'at-head' }, [
      el('b', { text: `${CARTS.find(c => c.id === cart).icon} ${t('carts')[cart]}` }),
      el('span', { className: 'quiet small', text: `${t('score')} ${S.num(g ? g.score : 0)} · ${t('best')} ${S.num(best[cart] || 0)}` })
    ]);
    const tv = el('div', { className: 'at-tv' }, [canvas, el('i', { className: 'at-scan' })]);
    const ctl = el('div', { className: 'q-row at-ctl' });
    const btn = (label, fn, cls) => { const n = el('button', { type: 'button', className: cls || 'btn', text: label }); n.addEventListener('click', fn); return n; };
    if (state === 'play') ctl.append(btn(t('pause'), () => { state = 'paused'; render(); draw(); }));
    else ctl.append(btn(state === 'over' ? t('again') : state === 'paused' ? t('resume') : t('start'), startOrResume, 'btn btn-primary'));
    ctl.append(btn(isBig ? t('small') : t('big'), () => { isBig = !isBig; render(); draw(); }));
    if (state !== 'play') ctl.append(btn(t('eject'), () => { cancelAnimationFrame(raf); cart = null; g = null; state = 'menu'; isBig = false; render(); draw(); beep(300, 0.06); }, 'link-btn'));
    const extra = [];
    if (state === 'over') {
      extra.push(el('p', { className: 'at-over', text: (cart === 'tennis' ? (g.won ? t('win') : t('lose')) : t('over')) + (g.newBest ? ' · ' + t('newBest') : '') }));
      if (window.SawtRooms && window.SawtRooms.storeOn() && window.SawtRooms.current() && g.score > 0) extra.push(btn(t('share'), shareScore, 'btn'));
    }
    if (state === 'menu') extra.push(el('p', { className: 'quiet small', text: t('how')[cart] }));
    kids.push(head, el('div', { className: 'at-stage' + (isBig ? ' is-big' : '') }, [tv, pad(), ctl]), ...extra);
    box.replaceChildren(...kids);
  }

  document.addEventListener('sawt:panel', e => { if (e.detail === 'atari') { render(); draw(); } });
  document.addEventListener('sawt:lang', () => { render(); draw(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isBig) { isBig = false; render(); draw(); } });
  window.SawtAtari = { render };
  render(); draw();
})();

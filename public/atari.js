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
      modeCpu: '🤖 ضد الكمبيوتر', modeTwo: '👥 اتنين عهالتلفون', modeLive: '🌐 مع حدا بالغرفة (تجريبي)',
      howTwo: 'كل واحد بيسحب عنصّو من الشاشة أو بيكبس زرّيه: الأصفر شمال والأزرق يمين. أوّل واحد بيوصل ٧ بيربح. أحسن عالشاشة الكبيرة.',
      howLive: 'منبعت خبر للغرفة، وأوّل حدا بيكبس «العب» بيلعب معك من تلفونو. إنت الأصفر.',
      goldWins: '🟡 الأصفر ربح! 🎉', blueWins: '🔵 الأزرق ربح! 🎉', gold: '🟡', blue: '🔵',
      challenge: r => `📤 تحدّى «${r}»`, challengeSent: 'وصل التحدّي للغرفة 👾',
      target: (n, s) => `🎯 اغلب ${n}: ${s}`, beat: n => `غلبت ${n}! 🏆`, notYet: (n, s) => `بعد شوي لتغلب ${n} (${s}). جرّب كمان!`,
      champ: (n, s) => `👑 ${n} · ${s}`, noRoom: 'لتتحدّى حدا أو تلعب معو من تلفونو، فوت أوّل عغرفة عالكنباية (قعدة سوا).',
      waiting: r => `ناطرين حدا من «${r}»… بعتنالهن خبر بالدردشة.`, connecting: 'عم نوصل التلفونين…', joining: 'عم نفوت عاللعبة…',
      liveFail: 'ما زبط الوصل بين التلفونين على هالشبكة (بيصير أحياناً عالداتا). جرّبوا عالـWi‑Fi، أو ابعت تحدّي بالنتيجة.',
      liveLost: 'انقطع الوصل 😕', gone: 'هاللعبة خلصت أو حدا تاني سبقك عليها.', cancel: 'إلغي', leave: '⏏ اطلع', youGold: 'إنت الأصفر 🟡', youBlue: 'إنت الأزرق 🔵', noRtc: 'هالمتصفّح ما بيقدر يوصل التلفونين ببعض.',
      carts: { tennis: 'تنس', breaker: 'كسّر الحيط', snake: 'الحيّة', space: 'حرب الفضاء' },
      how: { tennis: 'ردّ الطابة عالكمبيوتر. أوّل واحد بيوصل ٧ بيربح.', breaker: 'كسّر كل الحجارة وما توقّع الطابة.', snake: 'كول التفّاح وكبّر، وما تخبط بحالك ولا بالحيط.', space: 'تحرّك يمين وشمال وكبّس Ⓐ لتضرب.' } },
    en: { lede: 'Put in a cartridge and press ▶. Play with the arrows or the buttons below, or drag on the screen.', pick: 'Pick a cartridge', start: '▶ Start', again: '↻ Play again', pause: '⏸ Pause', resume: '▶ Resume', big: '⛶ Big screen', small: '⛶ Smaller', eject: '⏏ Eject',
      score: 'Score', best: 'Best', lives: 'Lives', over: 'Game over', win: 'You win! 🎉', lose: 'You lose 😅', press: 'Press ▶ to start', share: '📤 Tell the room', shared: 'Sent to the room 👾', newBest: 'New best score! 🏆',
      brag: (n, s, g) => `👾 ${n} scored ${s} at ${g} on the console! Who can beat that?`, you: 'You', cpu: 'Computer', level: 'Level',
      modeCpu: '🤖 Against the computer', modeTwo: '👥 Two on this phone', modeLive: '🌐 With someone in the room (trial)',
      howTwo: 'Each player drags on their half of the screen or presses their own buttons: gold on the left, blue on the right. First to 7 wins. Best on the big screen.',
      howLive: 'We tell the room, and the first person to press “Play” joins from their own phone. You are gold.',
      goldWins: '🟡 Gold wins! 🎉', blueWins: '🔵 Blue wins! 🎉', gold: '🟡', blue: '🔵',
      challenge: r => `📤 Challenge “${r}”`, challengeSent: 'Challenge sent to the room 👾',
      target: (n, s) => `🎯 Beat ${n}: ${s}`, beat: n => `You beat ${n}! 🏆`, notYet: (n, s) => `Not quite ${n}’s ${s} yet. Try again!`,
      champ: (n, s) => `👑 ${n} · ${s}`, noRoom: 'To challenge someone or play from two phones, first enter a family room on the sofa.',
      waiting: r => `Waiting for someone from “${r}”… we told them in the chat.`, connecting: 'Connecting the two phones…', joining: 'Joining the game…',
      liveFail: 'The two phones couldn’t connect on this network (it happens on mobile data). Try on Wi‑Fi, or send a score challenge instead.',
      liveLost: 'The connection dropped 😕', gone: 'This game is over, or someone else got there first.', cancel: 'Cancel', leave: '⏏ Leave', youGold: 'You are gold 🟡', youBlue: 'You are blue 🔵', noRtc: 'This browser can’t connect two phones.',
      carts: { tennis: 'Tennis', breaker: 'Wall Breaker', snake: 'The Snake', space: 'Space War' },
      how: { tennis: 'Hit the ball back past the computer. First to 7 wins.', breaker: 'Break every brick and don’t drop the ball.', snake: 'Eat the apples and grow; don’t bite yourself or the wall.', space: 'Move left and right, press Ⓐ to fire.' } },
    fr: { lede: 'Mettez une cartouche et appuyez sur ▶. Jouez avec les flèches ou les boutons, ou glissez sur l’écran.', pick: 'Choisissez une cartouche', start: '▶ Jouer', again: '↻ Rejouer', pause: '⏸ Pause', resume: '▶ Reprendre', big: '⛶ Grand écran', small: '⛶ Réduire', eject: '⏏ Éjecter',
      score: 'Score', best: 'Record', lives: 'Vies', over: 'Partie terminée', win: 'Gagné ! 🎉', lose: 'Perdu 😅', press: 'Appuyez sur ▶', share: '📤 Le dire à la pièce', shared: 'Envoyé à la pièce 👾', newBest: 'Nouveau record ! 🏆',
      brag: (n, s, g) => `👾 ${n} a fait ${s} à ${g} sur la console ! Qui fait mieux ?`, you: 'Vous', cpu: 'Ordinateur', level: 'Niveau',
      modeCpu: '🤖 Contre l’ordinateur', modeTwo: '👥 À deux sur ce téléphone', modeLive: '🌐 Avec quelqu’un de la pièce (essai)',
      howTwo: 'Chacun glisse sur sa moitié de l’écran ou appuie sur ses boutons : or à gauche, bleu à droite. Le premier à 7 gagne. Mieux en grand écran.',
      howLive: 'On prévient la pièce ; la première personne qui appuie sur « Jouer » vous rejoint depuis son téléphone. Vous êtes or.',
      goldWins: '🟡 L’or gagne ! 🎉', blueWins: '🔵 Le bleu gagne ! 🎉', gold: '🟡', blue: '🔵',
      challenge: r => `📤 Défier « ${r} »`, challengeSent: 'Défi envoyé à la pièce 👾',
      target: (n, s) => `🎯 Battez ${n} : ${s}`, beat: n => `Vous avez battu ${n} ! 🏆`, notYet: (n, s) => `Pas encore les ${s} de ${n}. Encore une !`,
      champ: (n, s) => `👑 ${n} · ${s}`, noRoom: 'Pour défier quelqu’un ou jouer à deux téléphones, entrez d’abord dans une pièce sur le canapé.',
      waiting: r => `On attend quelqu’un de « ${r} »… prévenu dans la discussion.`, connecting: 'Connexion des deux téléphones…', joining: 'On rejoint la partie…',
      liveFail: 'Les deux téléphones n’ont pas pu se connecter sur ce réseau (ça arrive en données mobiles). Essayez en Wi‑Fi, ou envoyez plutôt un défi.',
      liveLost: 'La connexion a été coupée 😕', gone: 'Cette partie est finie, ou quelqu’un est passé avant vous.', cancel: 'Annuler', leave: '⏏ Quitter', youGold: 'Vous êtes or 🟡', youBlue: 'Vous êtes bleu 🔵', noRtc: 'Ce navigateur ne peut pas relier deux téléphones.',
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
  const held = new Set();                 // raw keys, for two players on one keyboard (W/S and the arrows)
  const touches = new Map();              // every finger on the screen, for two players on one phone
  const side = { l: 0, r: 0 };            // the on-screen buttons of each player: -1 up, 1 down
  function press(k, on) {
    if (k === 'fire' && on && !keys.fire) firePressed = true;
    if (on && ['left', 'right', 'up', 'down'].includes(k) && !keys[k]) dirQueue.push(k);
    keys[k] = on;
  }
  const KEYMAP = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', ' ': 'fire', Enter: 'fire', a: 'left', d: 'right', w: 'up', s: 'down' };
  document.addEventListener('keydown', e => {
    if (!active()) return;
    held.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    const k = KEYMAP[e.key]; if (!k) return;
    e.preventDefault();
    if (k === 'fire' && state !== 'play') { startOrResume(); return; }
    press(k, true);
  });
  document.addEventListener('keyup', e => { held.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key); const k = KEYMAP[e.key]; if (k) press(k, false); });

  // ------------------------------------------------------------------ the four cartridges
  const games = {
    tennis: {
      init(g) { g.p = { y: H / 2 }; g.c = { y: H / 2 }; g.s = [0, 0]; this.serve(g, 1); },
      serve(g, dir) { g.ball = { x: W / 2, y: H / 2, vx: 110 * dir, vy: rnd(-70, 70) }; },
      update(g, dt) {
        const PH = 34, lim = y => clamp(y, PH / 2 + 4, H - PH / 2 - 4);
        if (mode === 'two') {
          // each player has their own half of the screen, their own two keys and their own two buttons
          let tl = null, tr = null;
          touches.forEach(p => { if (p.x < W / 2) tl = p.y; else tr = p.y; });
          const kl = (held.has('s') ? 1 : 0) - (held.has('w') ? 1 : 0) || side.l;
          const kr = (held.has('ArrowDown') ? 1 : 0) - (held.has('ArrowUp') ? 1 : 0) || side.r;
          g.p.y = lim(tl !== null ? g.p.y + (tl - g.p.y) * Math.min(1, dt * 14) : g.p.y + kl * 180 * dt);
          g.c.y = lim(tr !== null ? g.c.y + (tr - g.c.y) * Math.min(1, dt * 14) : g.c.y + kr * 180 * dt);
        } else {
          const mine = mode === 'live' && live && live.role === 'guest' ? g.c : g.p;
          if (pointerY !== null) mine.y += (pointerY - mine.y) * Math.min(1, dt * 14);
          else mine.y += ((keys.down ? 1 : 0) - (keys.up ? 1 : 0)) * 180 * dt;
          mine.y = lim(mine.y);
          if (mode === 'live') { Live.tick(g); if (live && live.role === 'guest') return; }
          else {
            const target = g.ball.vx > 0 ? g.ball.y : H / 2;
            g.c.y += clamp(target - g.c.y, -1, 1) * Math.min(Math.abs(target - g.c.y), (95 + g.s[1] * 4) * dt);
            g.c.y = lim(g.c.y);
          }
        }
        const b = g.ball;
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.y < 6 || b.y > H - 6) { b.vy *= -1; b.y = clamp(b.y, 6, H - 6); beep(300, 0.03); }
        const hit = (px, py) => Math.abs(b.x - px) < 6 && Math.abs(b.y - py) < PH / 2 + 3;
        const vs = mode !== 'cpu';
        if (b.vx < 0 && hit(16, g.p.y)) { b.vx = Math.abs(b.vx) * 1.06; b.vy += (b.y - g.p.y) * 4; beep(620, 0.04); if (!vs) g.score += 10; }
        if (b.vx > 0 && hit(W - 16, g.c.y)) { b.vx = -Math.abs(b.vx) * (vs ? 1.06 : 1.04); b.vy += (b.y - g.c.y) * (vs ? 4 : 3); beep(520, 0.04); }
        b.vx = clamp(b.vx, -320, 320);
        if (b.x < -8) { g.s[1]++; beep(140, 0.25, 'sawtooth'); if (g.s[1] >= 7) return g.end(false); this.serve(g, 1); }
        if (b.x > W + 8) { g.s[0]++; if (!vs) g.score += 100; beep(880, 0.15); if (g.s[0] >= 7) return g.end(true); this.serve(g, -1); }
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
  let mode = 'cpu';                 // tennis: 'cpu', 'two' (one phone) or 'live' (two phones)
  let target = null;                // a challenge from the chat: { cart, score, by }
  let live = null;                  // the live game: { role, pc, dc, status, room, sid, … }
  let champs = null, champsFor = null;
  const Rooms = () => window.SawtRooms;
  const theRoom = () => { const R = Rooms(); if (!R || !R.storeOn()) return null; return R.current() || R.list()[0] || null; };
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
    if (cart === 'tennis' && mode === 'live') Live.ended(won);
    if (cart === 'tennis' && mode !== 'cpu') { render(); return; }
    const b = bestAll();
    g.newBest = g.score > (b[cart] || 0);
    if (g.newBest) { b[cart] = g.score; S.store.set('atariBest', b); }
    // this week's console champion, in the family room (quietly)
    const r = theRoom();
    if (r && g.score > 0) Rooms().api(r, '/arcade', { cart, score: g.score }).then(() => { champsFor = null; }).catch(() => {});
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
      if (state === 'play' && !active() && mode !== 'live') { state = 'paused'; render(); }
      if (state === 'play') games[cart].update.call(games[cart], g, dt);
      if (state === 'play' && !(cart === 'tennis' && mode !== 'cpu') && (++frames % 20 === 0)) { const h = box.querySelector('.at-head .small'); if (h) h.textContent = `${t('score')} ${S.num(g.score)} · ${t('best')} ${S.num(Math.max(g.score, bestAll()[cart] || 0))}`; }
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
    if (!(cart === 'tennis' && mode !== 'cpu')) small(x, `${t('score')} ${g ? g.score : 0}`, W - 96, 10, PAL.a);
    if (state !== 'play') {
      x.fillStyle = 'rgba(11,11,20,.72)'; x.fillRect(0, H / 2 - 26, W, 52);
      const msg = state === 'over' ? (cart === 'tennis' ? (mode === 'two' ? (g.won ? 'GOLD WINS!' : 'BLUE WINS!') : g.won ? 'YOU WIN!' : 'GAME OVER') : 'GAME OVER') : state === 'paused' ? 'PAUSE' : mode === 'live' ? '…' : 'PRESS ▶';
      x.font = 'bold 18px ui-monospace, monospace'; x.textAlign = 'center'; x.fillStyle = PAL.a; x.fillText(msg, W / 2, H / 2 - 12); x.textAlign = 'start';
    }
  }

  // drag on the screen moves the paddle or the ship; a tap fires or serves; swipes steer the snake
  let sx = 0, sy = 0;
  const at = e => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; };
  canvas.addEventListener('pointerdown', e => {
    if (!cart) return;
    if (state !== 'play') { if (mode !== 'live') startOrResume(); return; }
    canvas.setPointerCapture(e.pointerId);
    touches.set(e.pointerId, at(e));
    const r = canvas.getBoundingClientRect();
    sx = e.clientX; sy = e.clientY;
    pointerX = (e.clientX - r.left) / r.width * W; pointerY = (e.clientY - r.top) / r.height * H;
    if (g) g.tapped = true;
    if (cart === 'space') g.autofire = true;
    if (cart === 'snake') { pointerX = pointerY = null; }
  });
  canvas.addEventListener('pointermove', e => {
    if (touches.has(e.pointerId)) touches.set(e.pointerId, at(e));
    if (state !== 'play' || cart === 'snake' || pointerX === null) return;
    const r = canvas.getBoundingClientRect();
    pointerX = (e.clientX - r.left) / r.width * W; pointerY = (e.clientY - r.top) / r.height * H;
  });
  const up = e => {
    if (cart === 'snake' && state === 'play') {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 18) dirQueue.push(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    }
    touches.delete(e.pointerId);
    if (touches.size) return;
    pointerX = pointerY = null; if (g) g.autofire = false;
  };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);

  function pad2() {
    // two players: up and down for gold on the left, up and down for blue on the right
    const b = (who, d, label) => {
      const n = el('button', { type: 'button', className: 'at-btn at-' + (who === 'l' ? 'gold' : 'blue'), text: label, 'aria-label': (who === 'l' ? t('gold') : t('blue')) + (d < 0 ? ' ▲' : ' ▼') });
      const on = e => { e.preventDefault(); if (state !== 'play') { startOrResume(); return; } side[who] = d; };
      const off = () => { if (side[who] === d) side[who] = 0; };
      n.addEventListener('pointerdown', on); n.addEventListener('pointerup', off); n.addEventListener('pointerleave', off); n.addEventListener('pointercancel', off);
      return n;
    };
    return el('div', { className: 'at-pad at-pad2', dir: 'ltr' }, [
      el('div', { className: 'at-col' }, [b('l', -1, '▲'), b('l', 1, '▼')]),
      el('div', { className: 'at-col' }, [b('r', -1, '▲'), b('r', 1, '▼')])
    ]);
  }
  function pad() {
    if (cart === 'tennis' && mode === 'two') return pad2();
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

  // post a "beat my score" in the family room chat, with a button that opens the same cartridge
  function shareScore(btnNode) {
    const r = theRoom();
    if (!r || !g) return;
    if (btnNode) btnNode.disabled = true;
    const body = { cart, score: g.score, challenge: true };
    if (target && target.cart === cart && g.score > target.score) { body.beat = target.by; body.target = target.score; }
    Rooms().api(r, '/arcade', body).then(() => { S.toast(t('challengeSent')); champsFor = null; }).catch(() => { if (btnNode) btnNode.disabled = false; S.toast('⚠️'); });
  }
  async function loadChamps() {
    const r = theRoom();
    if (!r || champsFor === r.id) return;
    champsFor = r.id;
    try { const d = await Rooms().scores(r); champs = d.arcade || {}; render(); } catch { champsFor = null; }
  }
  const champOf = id => {
    let top = null;
    for (const [name, rec] of Object.entries(champs || {})) { const v = Number((rec || {})[id]) || 0; if (v && (!top || v > top[1])) top = [name, v]; }
    return top;
  };

  function render() {
    box.dir = S.lang() === 'ar' ? 'rtl' : 'ltr';
    const best = bestAll();
    const kids = [];
    const btn = (label, fn, cls) => { const n = el('button', { type: 'button', className: cls || 'btn', text: label }); n.addEventListener('click', () => fn(n)); return n; };
    if (theRoom()) loadChamps();
    if (!cart || state === 'menu' && !g) {
      kids.push(el('p', { className: 'pv-lede', text: t('lede') }), el('p', { className: 'q-k', text: t('pick') }));
      kids.push(el('div', { className: 'at-carts' }, CARTS.map(c => {
        const ch = champOf(c.id);
        const b = el('button', { type: 'button', className: 'at-cart' + (cart === c.id ? ' is-in' : ''), style: `--c:${c.color}` }, [
          el('span', { className: 'at-cart-label' }, [el('b', { text: c.icon }), el('span', { text: t('carts')[c.id] })]),
          best[c.id] ? el('small', { text: `${t('best')}: ${S.num(best[c.id])}` }) : null,
          ch ? el('small', { className: 'at-champ', dir: 'auto', text: t('champ', ch[0], S.num(ch[1])) }) : null
        ].filter(Boolean));
        b.addEventListener('click', () => { pick(c.id); beep(520, 0.05); });
        return b;
      })));
      if (!cart) { box.replaceChildren(...kids); return; }
    }
    const vs = cart === 'tennis' && mode !== 'cpu';
    const head = el('div', { className: 'at-head' }, [
      el('b', { text: `${CARTS.find(c => c.id === cart).icon} ${t('carts')[cart]}` }),
      el('span', { className: 'quiet small', text: vs ? (mode === 'live' && live ? (live.role === 'host' ? t('youGold') : t('youBlue')) : `${t('gold')} ${t('blue')}`) : `${t('score')} ${S.num(g ? g.score : 0)} · ${t('best')} ${S.num(best[cart] || 0)}` })
    ]);
    const kidsTop = [head];
    if (target && target.cart === cart && !vs) kidsTop.push(el('p', { className: 'at-target', dir: 'auto', text: t('target', target.by, S.num(target.score)) }));
    // tennis: against the computer, two on this phone, or two phones
    if (cart === 'tennis' && (state === 'menu' || state === 'over') && !(mode === 'live' && live && ['waiting', 'connecting', 'joining', 'play'].includes(live.status))) {
      const modes = el('div', { className: 'at-modes', role: 'group' }, [['cpu', t('modeCpu')], ['two', t('modeTwo')], ['live', t('modeLive')]].map(([k, label]) => {
        const b = el('button', { type: 'button', className: 'chip', text: label });
        b.setAttribute('aria-pressed', String(mode === k));
        b.addEventListener('click', () => { Live.stop(); mode = k; state = 'menu'; newGame(); render(); draw(); });
        return b;
      }));
      kidsTop.push(modes);
    }
    const tv = el('div', { className: 'at-tv' }, [canvas, el('i', { className: 'at-scan' })]);
    const ctl = el('div', { className: 'q-row at-ctl' });
    if (mode === 'live' && cart === 'tennis') {
      if (!live || live.status === 'over' || live.status === 'failed') ctl.append(btn(state === 'over' ? t('again') : t('start'), () => Live.host(), 'btn btn-primary'));
      else ctl.append(btn(state === 'play' ? t('leave') : t('cancel'), () => { Live.stop(true); render(); draw(); }, 'btn'));
    } else if (state === 'play') ctl.append(btn(t('pause'), () => { state = 'paused'; render(); draw(); }));
    else ctl.append(btn(state === 'over' ? t('again') : state === 'paused' ? t('resume') : t('start'), startOrResume, 'btn btn-primary'));
    ctl.append(btn(isBig ? t('small') : t('big'), () => { isBig = !isBig; render(); draw(); }));
    if (state !== 'play' && !(live && ['waiting', 'connecting', 'joining'].includes(live.status))) ctl.append(btn(t('eject'), () => { Live.stop(true); cancelAnimationFrame(raf); cart = null; g = null; state = 'menu'; isBig = false; target = null; render(); draw(); beep(300, 0.06); }, 'link-btn'));
    const extra = [];
    if (live && live.note) extra.push(el('p', { className: 'at-live' + (live.status === 'failed' || live.status === 'lost' ? ' is-bad' : ''), dir: 'auto', role: 'status', text: live.note }));
    if (live && live.status === 'failed') extra.push(btn(t('modeCpu'), () => { Live.stop(); mode = 'cpu'; state = 'menu'; newGame(); render(); draw(); }, 'btn'));
    if (state === 'over') {
      let line = cart === 'tennis' ? (mode === 'two' ? (g.won ? t('goldWins') : t('blueWins')) : g.won ? t('win') : t('lose')) : t('over');
      if (g.newBest) line += ' · ' + t('newBest');
      extra.push(el('p', { className: 'at-over', text: line }));
      if (target && target.cart === cart && !vs) extra.push(el('p', { className: 'at-target', dir: 'auto', text: g.score > target.score ? t('beat', target.by) : t('notYet', target.by, S.num(target.score)) }));
      const r = theRoom();
      if (!vs && g.score > 0) extra.push(r ? btn(t('challenge', r.title), shareScore, 'btn') : el('p', { className: 'quiet small', text: t('noRoom') }));
    }
    if (state === 'menu') {
      extra.push(el('p', { className: 'quiet small', text: cart === 'tennis' && mode === 'two' ? t('howTwo') : cart === 'tennis' && mode === 'live' ? t('howLive') : t('how')[cart] }));
      if (cart === 'tennis' && mode === 'live' && !theRoom()) extra.push(el('p', { className: 'quiet small', text: t('noRoom') }));
    }
    kids.push(...kidsTop, el('div', { className: 'at-stage' + (isBig ? ' is-big' : '') }, [tv, pad(), ctl]), ...extra);
    box.replaceChildren(...kids);
  }
  function pick(id) { Live.stop(); cart = id; state = 'menu'; g = null; if (id !== 'tennis') mode = 'cpu'; newGame(); render(); draw(); }
  function openConsole() { if (window.SawtRoom && window.SawtRoom.isOpen() !== 'atari') window.SawtRoom.open('atari'); }

  // ------------------------------------------------------------------ live tennis on two phones
  // A direct link between the two phones (WebRTC). The family room only carries the two
  // "connection notes" between them. Free STUN servers only, so on some mobile networks the
  // link can't be made; then we say so and offer a score challenge instead.
  const ICE = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }, { urls: 'stun:stun.cloudflare.com:3478' }];
  const Live = {
    note(status, text) { if (!live) return; live.status = status; live.note = text || ''; render(); draw(); },
    stop(tell) {
      if (!live) return;
      const L = live; live = null;
      clearTimeout(L.timer); clearInterval(L.poll);
      try { if (tell && L.dc && L.dc.readyState === 'open') L.dc.send(JSON.stringify({ t: 'bye' })); } catch { /* fine */ }
      try { L.dc && L.dc.close(); L.pc && L.pc.close(); } catch { /* fine */ }
      if (state === 'play') { state = 'menu'; newGame(); }
    },
    gather(pc) {
      return new Promise(res => {
        if (pc.iceGatheringState === 'complete') return res();
        const done = () => { if (pc.iceGatheringState === 'complete') res(); };
        pc.addEventListener('icegatheringstatechange', done);
        setTimeout(res, 3500);
      });
    },
    wire(dc) {
      live.dc = dc;
      dc.onopen = () => {
        if (!live) return;
        clearTimeout(live.timer); clearInterval(live.poll);
        live.status = 'play'; live.note = live.role === 'host' ? t('youGold') : t('youBlue');
        newGame(); state = 'play';
        try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); } catch { /* fine */ }
        render(); loop(); beep(880, 0.1);
      };
      dc.onmessage = e => {
        let m; try { m = JSON.parse(e.data); } catch { return; }
        if (!live || !g) return;
        if (m.t === 'p' && live.role === 'host') live.remoteY = clamp(Number(m.y) || H / 2, 0, H);
        if (m.t === 's' && live.role === 'guest') { g.ball.x = m.b[0]; g.ball.y = m.b[1]; g.p.y = m.p; g.s = m.s; if (m.k) beep(m.k, 0.04); }
        if (m.t === 'end' && live.role === 'guest') { g.s = m.s; live.status = 'over'; live.note = ''; endGame(m.w === 'guest'); }
        if (m.t === 'bye') { const was = state === 'play'; Live.stop(); if (was) { state = 'menu'; newGame(); } live = { status: 'lost', note: t('liveLost') }; render(); draw(); }
      };
      dc.onclose = () => { if (live && live.status === 'play') { live = { status: 'lost', note: t('liveLost') }; state = 'menu'; newGame(); render(); draw(); } };
    },
    fail() { if (!live) return; const L = live; Live.stop(); live = { status: 'failed', note: t('liveFail') }; void L; render(); draw(); },
    async host() {
      const r = theRoom();
      if (!r) { S.toast(t('noRoom')); return; }
      if (!window.RTCPeerConnection) { S.toast(t('noRtc')); return; }
      Live.stop();
      cart = 'tennis'; mode = 'live'; state = 'menu'; newGame();
      const sid = Math.random().toString(36).slice(2, 12).replace(/[^a-z0-9]/g, '') || 'x' + Date.now().toString(36);
      live = { role: 'host', room: r, sid, status: 'waiting', note: t('connecting'), remoteY: H / 2 };
      render(); draw();
      try {
        const pc = new RTCPeerConnection({ iceServers: ICE });
        live.pc = pc;
        Live.wire(pc.createDataChannel('tennis', { ordered: false, maxRetransmits: 0 }));
        await pc.setLocalDescription(await pc.createOffer());
        await Live.gather(pc);
        if (!live || live.pc !== pc) return;
        await Rooms().api(r, '/rtc', { sid, role: 'offer', sdp: pc.localDescription.sdp });
        Live.note('waiting', t('waiting', r.title));
        const L = live;
        const started = Date.now();
        L.poll = setInterval(async () => {
          if (live !== L) { clearInterval(L.poll); return; }
          if (Date.now() - started > 180000) { Live.stop(); live = { status: 'over', note: '' }; render(); draw(); return; }
          try {
            const d = await Rooms().api(r, '/rtc/' + sid);
            if (d.answer && live === L && !L.answered) {
              L.answered = true; clearInterval(L.poll);
              Live.note('connecting', t('connecting'));
              await pc.setRemoteDescription({ type: 'answer', sdp: d.answer });
              L.timer = setTimeout(() => { if (live === L && L.status !== 'play') Live.fail(); }, 20000);
            }
          } catch { /* keep waiting */ }
        }, 2500);
      } catch { Live.fail(); }
    },
    async join(r, sid) {
      if (!window.RTCPeerConnection) { S.toast(t('noRtc')); return; }
      Live.stop();
      openConsole();
      cart = 'tennis'; mode = 'live'; state = 'menu'; target = null; newGame();
      live = { role: 'guest', room: r, sid, status: 'joining', note: t('joining') };
      render(); draw();
      const L = live;
      try {
        const d = await Rooms().api(r, '/rtc/' + sid);
        if (d.answer || !d.offer) throw new Error('gone');
        const pc = new RTCPeerConnection({ iceServers: ICE });
        L.pc = pc;
        pc.ondatachannel = e => { if (live === L) Live.wire(e.channel); };
        await pc.setRemoteDescription({ type: 'offer', sdp: d.offer });
        await pc.setLocalDescription(await pc.createAnswer());
        await Live.gather(pc);
        if (live !== L) return;
        await Rooms().api(r, '/rtc', { sid, role: 'answer', sdp: pc.localDescription.sdp });
        Live.note('connecting', t('connecting'));
        L.timer = setTimeout(() => { if (live === L && L.status !== 'play') Live.fail(); }, 20000);
      } catch (e) {
        if (live !== L) return;
        const gone = e && (e.message === 'gone' || e.code === 'gone' || e.code === 'taken');
        Live.stop(); live = gone ? { status: 'over', note: t('gone') } : { status: 'failed', note: t('liveFail') }; render(); draw();
      }
    },
    // every frame: the host sends the ball, the guest sends its paddle (about 30 times a second)
    tick(gm) {
      if (!live || !live.dc || live.dc.readyState !== 'open') return;
      const now = performance.now();
      if (now - (live.sent || 0) < 33) { if (live.role === 'host') gm.c.y += (live.remoteY - gm.c.y) * 0.5; return; }
      live.sent = now;
      try {
        if (live.role === 'host') { gm.c.y += (live.remoteY - gm.c.y) * 0.5; live.dc.send(JSON.stringify({ t: 's', b: [Math.round(gm.ball.x), Math.round(gm.ball.y)], p: Math.round(gm.p.y), s: gm.s })); }
        else live.dc.send(JSON.stringify({ t: 'p', y: Math.round(gm.c.y) }));
      } catch { /* a dropped frame */ }
    },
    ended(won) {
      if (!live) return;
      if (live.role === 'host') { try { live.dc.send(JSON.stringify({ t: 'end', w: won ? 'host' : 'guest', s: g.s })); } catch { /* fine */ } }
      const L = live; setTimeout(() => { if (live === L) { Live.stop(); live = { status: 'over', note: '' }; render(); draw(); } }, 1500);
    }
  };

  document.addEventListener('sawt:panel', e => { if (e.detail === 'atari') { render(); draw(); } });
  document.addEventListener('sawt:lang', () => { render(); draw(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isBig) { isBig = false; render(); draw(); } });
  window.SawtAtari = {
    render,
    carts: () => CARTS,
    cartName: id => t('carts')[id] || id,
    // from the chat: "beat my score" opens the same cartridge with the score to beat
    challenge(c) {
      if (!CARTS.some(x => x.id === c.cart)) return;
      Live.stop(); target = { cart: c.cart, score: Number(c.score) || 0, by: c.by || '' };
      openConsole(); cart = c.cart; mode = 'cpu'; state = 'menu'; g = null; newGame(); render(); draw();
    },
    joinLive: (r, sid) => Live.join(r, sid)
  };
  render(); draw();
})();

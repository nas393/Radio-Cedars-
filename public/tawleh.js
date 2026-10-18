/* Tawleh (backgammon) on the coffee table.
   Play Abou Samir (the computer), pass the phone to someone next to you,
   or play a friend far away: each move travels as a WhatsApp link.
   Full rules: entering from the bar, hitting, blocked points, using both dice
   (or the larger one), doubles played four times, bearing off, and "mars" (gammon). */
(() => {
  'use strict';
  const S = window.Sawt;
  const $ = id => document.getElementById(id);
  const el = S.el;
  const box = $('tawleh');
  if (!box) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const T = {
    ar: {
      vsAi: 'ضدّ أبو سمير', vsHere: 'نحنا التنين هون', vsLink: 'مع حدا بعيد (واتساب)',
      ai: 'أبو سمير', you: 'إنت', p1: 'الأبيض', p2: 'الأسود',
      roll: 'زَت الزهر', done: 'خلصت', undo: 'رجّع', newGame: 'دقّة جديدة',
      yourTurn: 'دورك', turnOf: n => `دور ${n}`, thinking: 'أبو سمير عم يفكّر…', noMove: 'ما في ولا حركة، الدور راح.',
      pick: 'اختار حجر، بعدين وين بدّك تحطّه', bearOff: 'شيل', won: n => `${n} ربح!`, mars: 'مارس! (نقطتين)',
      score: 'النتيجة', send: 'ابعت الدور لصاحبك', sent: 'بعتنا الدور. استنّى يردّلك.', waiting: n => `ناطرين ${n} يلعب`,
      linkIntro: 'إلعب أوّل نقلة وبعدين ابعتها على واتساب. صاحبك بيلعب وبيرجعلك الدور.',
      yourName: 'اسمك', friendName: 'اسم صاحبك', start: 'يلّا نبلّش', shareText: n => `دورك بالطاولة يا ${n}! 🎲`,
      fromLink: n => `${n} بعتلك دورك بالطاولة`, rules: 'القوانين متل ما منلعب بلبنان: الطاولة الإفرنجية، والمارس بنقطتين.',
      calls: { 65: 'شيش بيش!', 66: 'دو شيش!', 55: 'دو بيش!', 44: 'دو جهار!', 33: 'دو سي!' },
      aiHit: ['خود هيدي 😏', 'سامحني يا حبيبي', 'هيك بتتعلّم'], aiHurt: ['حرام عليك!', 'ولو؟ هيك؟', 'ماشي… ماشي'],
      aiWin: 'قلتلّك ما حدا بيغلب أبو سمير ☕', aiLose: 'حظّك بيكسّر الصخر! دقّة تانية؟'
    },
    en: {
      vsAi: 'Play Abou Samir', vsHere: 'Two of us, here', vsLink: 'A friend far away (WhatsApp)',
      ai: 'Abou Samir', you: 'You', p1: 'White', p2: 'Black',
      roll: 'Roll the dice', done: 'Done', undo: 'Undo', newGame: 'New game',
      yourTurn: 'Your turn', turnOf: n => `${n}’s turn`, thinking: 'Abou Samir is thinking…', noMove: 'No move possible, turn passes.',
      pick: 'Pick a checker, then where it goes', bearOff: 'Off', won: n => `${n} won!`, mars: 'Mars! (2 points)',
      score: 'Score', send: 'Send the turn to your friend', sent: 'Turn sent. Wait for their reply.', waiting: n => `Waiting for ${n}`,
      linkIntro: 'Play the first move, then send it on WhatsApp. Your friend plays and sends the turn back.',
      yourName: 'Your name', friendName: 'Friend’s name', start: 'Let’s play', shareText: n => `Your move at tawleh, ${n}! 🎲`,
      fromLink: n => `${n} sent you your turn`, rules: 'Standard backgammon, the Lebanese way: a "mars" (gammon) counts double.',
      calls: { 65: 'Shesh besh!', 66: 'Dou shesh!', 55: 'Dou besh!', 44: 'Dou jhar!', 33: 'Dou se!' },
      aiHit: ['Take that 😏', 'Sorry, habibi', 'That’ll teach you'], aiHurt: ['Have mercy!', 'Really? Like that?', 'Fine… fine'],
      aiWin: 'Told you, nobody beats Abou Samir ☕', aiLose: 'Your luck could split rocks! Another one?'
    },
    fr: {
      vsAi: 'Contre Abou Samir', vsHere: 'À deux, ici', vsLink: 'Avec un ami au loin (WhatsApp)',
      ai: 'Abou Samir', you: 'Vous', p1: 'Blanc', p2: 'Noir',
      roll: 'Lancer les dés', done: 'Terminé', undo: 'Annuler', newGame: 'Nouvelle partie',
      yourTurn: 'À vous', turnOf: n => `Au tour de ${n}`, thinking: 'Abou Samir réfléchit…', noMove: 'Aucun coup possible, on passe.',
      pick: 'Choisissez un pion, puis sa case', bearOff: 'Sortir', won: n => `${n} a gagné !`, mars: 'Mars ! (2 points)',
      score: 'Score', send: 'Envoyer le tour à votre ami', sent: 'Tour envoyé. Attendez sa réponse.', waiting: n => `On attend ${n}`,
      linkIntro: 'Jouez le premier coup, puis envoyez-le sur WhatsApp. Votre ami joue et vous renvoie le tour.',
      yourName: 'Votre prénom', friendName: 'Le prénom de votre ami', start: 'On joue', shareText: n => `À toi de jouer au tawlé, ${n} ! 🎲`,
      fromLink: n => `${n} vous a envoyé votre tour`, rules: 'Backgammon classique, à la libanaise : le « mars » compte double.',
      calls: { 65: 'Chech bech !', 66: 'Dou chech !', 55: 'Dou bech !', 44: 'Dou jhar !', 33: 'Dou sé !' },
      aiHit: ['Tiens, prends ça 😏', 'Pardon, habibi', 'Ça t’apprendra'], aiHurt: ['Pitié !', 'Sérieux ? Comme ça ?', 'D’accord… d’accord'],
      aiWin: 'Je te l’avais dit : personne ne bat Abou Samir ☕', aiLose: 'Quelle chance ! On remet ça ?'
    }
  };
  const t = (k, ...a) => { const v = (T[S.lang()] || T.ar)[k]; return typeof v === 'function' ? v(...a) : v; };
  const pickOne = a => a[Math.floor(Math.random() * a.length)];

  // ================================================================== the rules
  // pts[i] > 0: white checkers on point i+1 (white runs 24 → 1); < 0: black (runs 1 → 24).
  // Moves are written in the mover's own numbering: 25 is the bar, 0 is off the board.
  const START = () => {
    const p = new Array(24).fill(0);
    p[23] = 2; p[12] = 5; p[7] = 3; p[5] = 5;
    p[0] = -2; p[11] = -5; p[16] = -3; p[18] = -5;
    return { pts: p, bar: [0, 0], off: [0, 0] };
  };
  const idx = (pl, r) => (pl === 0 ? r - 1 : 24 - r);
  const own = (st, pl, i) => (pl === 0 ? Math.max(0, st.pts[i]) : Math.max(0, -st.pts[i]));
  const clone = st => ({ pts: st.pts.slice(), bar: st.bar.slice(), off: st.off.slice() });
  const key = st => st.pts.join(',') + '|' + st.bar + '|' + st.off;

  function singles(st, pl, d) {
    const out = [];
    const opp = 1 - pl;
    const free = r => own(st, opp, idx(pl, r)) < 2;
    if (st.bar[pl] > 0) {
      const to = 25 - d;
      if (free(to)) out.push({ from: 25, to, d });
      return out;
    }
    let allHome = true, highest = 0;
    for (let r = 1; r <= 24; r++) if (own(st, pl, idx(pl, r)) > 0) { highest = r; if (r > 6) allHome = false; }
    for (let r = 24; r >= 1; r--) {
      if (!own(st, pl, idx(pl, r))) continue;
      const to = r - d;
      if (to >= 1) { if (free(to)) out.push({ from: r, to, d }); }
      else if (allHome && (to === 0 || r === highest)) out.push({ from: r, to: 0, d });
    }
    return out;
  }
  function apply(st, pl, m) {
    const n = clone(st);
    const s = pl === 0 ? 1 : -1;
    if (m.from === 25) n.bar[pl]--; else n.pts[idx(pl, m.from)] -= s;
    let hit = false;
    if (m.to === 0) n.off[pl]++;
    else {
      const i = idx(pl, m.to);
      if (own(n, 1 - pl, i) === 1) { n.pts[i] = 0; n.bar[1 - pl]++; hit = true; }
      n.pts[i] += s;
    }
    return { st: n, hit };
  }
  // Every legal way to play a roll, already filtered by "use as many dice as you can,
  // and the larger one if only one can be used".
  function sequences(st, pl, dice) {
    const ds = dice[0] === dice[1] ? [dice[0], dice[0], dice[0], dice[0]] : dice.slice();
    const out = [];
    const seen = new Set();
    function rec(s, left, seq) {
      let any = false;
      const tried = new Set();
      for (let k = 0; k < left.length; k++) {
        const d = left[k];
        if (tried.has(d)) continue;
        tried.add(d);
        for (const m of singles(s, pl, d)) {
          any = true;
          const r = apply(s, pl, m);
          rec(r.st, left.slice(0, k).concat(left.slice(k + 1)), seq.concat([{ ...m, hit: r.hit }]));
        }
      }
      if (!any) {
        const kk = seq.map(m => `${m.from}-${m.to}-${m.d}`).join(' ');
        if (!seen.has(kk)) { seen.add(kk); out.push({ seq, st: s }); }
      }
    }
    rec(st, ds, []);
    const max = Math.max(0, ...out.map(o => o.seq.length));
    let res = out.filter(o => o.seq.length === max);
    if (max === 1 && dice[0] !== dice[1]) {
      const big = Math.max(...dice);
      if (res.some(o => o.seq[0].d === big)) res = res.filter(o => o.seq[0].d === big);
    }
    return res;
  }
  function pips(st, pl) {
    let n = st.bar[pl] * 25;
    for (let r = 1; r <= 24; r++) n += own(st, pl, idx(pl, r)) * r;
    return n;
  }
  function winner(st) { return st.off[0] === 15 ? 0 : st.off[1] === 15 ? 1 : -1; }

  // ================================================================== Abou Samir
  function evaluate(st, pl) {
    const opp = 1 - pl;
    let v = (pips(st, opp) - pips(st, pl)) * 1.0;
    v += st.off[pl] * 4 + st.bar[opp] * 9 - st.bar[pl] * 9;
    // where could the opponent hit from?  (their checkers in their own numbering)
    const oppAt = [];
    for (let r = 1; r <= 24; r++) if (own(st, opp, idx(opp, r))) oppAt.push(r);
    if (st.bar[opp]) oppAt.push(25);
    let contact = false;
    let run = 0, bestRun = 0;
    for (let r = 1; r <= 24; r++) {
      const c = own(st, pl, idx(pl, r));
      if (c >= 2) {
        v += r <= 6 ? 3.2 : r <= 8 ? 2.4 : 1.2;
        run++; bestRun = Math.max(bestRun, run);
      } else run = 0;
      if (c === 1) {
        const oppR = 25 - r;    // the same point in the opponent's numbering
        let shots = 0;
        for (const o of oppAt) { const dist = o - oppR; if (dist > 0 && dist <= 12) { shots += dist <= 6 ? 2 : 1; contact = true; } }
        v -= shots ? 2.5 + shots * 1.4 * (r > 12 ? 0.8 : 1.15) : 0.3;
      }
    }
    v += bestRun >= 3 ? bestRun * bestRun * 0.9 : 0;
    if (!contact) v += (pips(st, opp) - pips(st, pl)) * 0.6;
    return v;
  }
  function aiChoose(st, pl, dice) {
    const all = sequences(st, pl, dice);
    if (!all.length || !all[0].seq.length) return [];
    let best = null, bestV = -1e9;
    for (const o of all) {
      const v = evaluate(o.st, pl) + Math.random() * 1.2;
      if (v > bestV) { bestV = v; best = o; }
    }
    return best.seq;
  }

  // ================================================================== the game

  let mode = S.store.get('tawlehMode', 'ai');      // ai | here | link
  let G = null;                                   // the game in play
  let score = S.store.get('tawlehScore', { ai: [0, 0], here: [0, 0] });
  let msg = '';
  let selected = null;
  let busy = false;
  let link = null;                                // { me, names:[a,b], n }

  function newGame(keepMode = true) {
    const st = START();
    G = { st, turn: 0, dice: null, played: [], options: null, before: null, lastDice: null, over: -1, mars: false };
    selected = null; msg = '';
    if (mode === 'ai' && Math.random() < 0.5) { G.turn = 1; setTimeout(aiTurn, 900); }
    if (!keepMode) mode = 'ai';
    save(); render();
  }
  function save() {
    if (mode === 'link') return;
    try { S.store.set('tawlehGame', { mode, G }); } catch { /* full */ }
  }
  function names() {
    if (mode === 'ai') return [t('you'), t('ai')];
    if (mode === 'link' && link) return link.names;
    return [t('p1'), t('p2')];
  }
  function humanTurn() {
    if (G.over >= 0) return false;
    if (mode === 'ai') return G.turn === 0;
    if (mode === 'link') return link && G.turn === link.me;
    return true;
  }

  function call(d) {
    const k = Math.max(...d) * 10 + Math.min(...d);
    return t('calls')[k] || '';
  }
  function roll() {
    if (busy || G.dice || G.over >= 0) return;
    const d = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)];
    G.dice = d; G.lastDice = d; G.played = []; G.before = clone(G.st);
    G.options = sequences(G.st, G.turn, d);
    rolling = performance.now();
    msg = call(d);
    if (!G.options.length || !G.options[0].seq.length) {
      msg = (msg ? msg + ' ' : '') + t('noMove');
      render();
      setTimeout(endTurn, 1400);
      return;
    }
    render();
  }
  let rolling = 0;

  // moves still allowed after the ones already played this turn
  function nextMoves() {
    if (!G.dice || !G.options) return [];
    const n = G.played.length;
    const same = (a, b) => a.from === b.from && a.to === b.to && a.d === b.d;
    const out = [];
    for (const o of G.options) {
      if (o.seq.length <= n) continue;
      if (!G.played.every((m, i) => same(m, o.seq[i]))) continue;
      const m = o.seq[n];
      if (!out.some(x => same(x, m))) out.push(m);
    }
    return out;
  }
  function play(m) {
    const r = apply(G.st, G.turn, m);
    G.st = r.st;
    G.played.push({ ...m, hit: r.hit });
    selected = null;
    if (r.hit && mode === 'ai') msg = G.turn === 1 ? pickOne(t('aiHit')) : pickOne(t('aiHurt'));
    const w = winner(G.st);
    if (w >= 0) return finish(w);
    if (!nextMoves().length && mode !== 'ai') { render(); return; }      // humans press "done"
    if (!nextMoves().length && G.turn === 0) { render(); return; }
    render();
  }
  function undo() {
    if (!G.played.length || !G.before) return;
    G.st = clone(G.before); G.played = []; selected = null; render();
  }
  function endTurn() {
    G.dice = null; G.options = null; G.played = []; G.before = null; selected = null;
    G.turn = 1 - G.turn;
    if (mode === 'link') { save(); render(); share(); return; }
    save(); render();
    if (mode === 'ai' && G.turn === 1) setTimeout(aiTurn, 700);
  }
  function finish(w) {
    G.over = w;
    G.mars = G.st.off[1 - w] === 0;
    const pts = G.mars ? 2 : 1;
    if (mode === 'ai' || mode === 'here') {
      const sc = score[mode] || [0, 0];
      sc[w] += pts; score[mode] = sc;
      S.store.set('tawlehScore', score);
    }
    msg = t('won', names()[w]) + (G.mars ? ' ' + t('mars') : '');
    if (mode === 'ai') msg += ' ' + (w === 1 ? t('aiWin') : t('aiLose'));
    G.dice = null;
    save(); render();
    if (mode === 'link') share();
  }

  async function aiTurn() {
    if (mode !== 'ai' || G.turn !== 1 || G.over >= 0) return;
    busy = true; msg = t('thinking'); render();
    await wait(650);
    busy = false;
    roll();
    if (!G.dice) return;              // no move: roll() passes the turn
    busy = true;
    const seq = aiChoose(G.st, 1, G.dice);
    for (const m of seq) {
      await wait(reduceMotion ? 120 : 520);
      if (mode !== 'ai') { busy = false; return; }
      const r = apply(G.st, 1, m);
      G.st = r.st; G.played.push({ ...m, hit: r.hit });
      if (r.hit) msg = pickOne(t('aiHit'));
      lastMoved = { pl: 1, to: m.to };
      render();
      const w = winner(G.st);
      if (w >= 0) { busy = false; finish(w); return; }
    }
    await wait(500);
    busy = false;
    endTurn();
  }
  const wait = ms => new Promise(res => setTimeout(res, ms));
  let lastMoved = null;

  // ------------------------------------------------------------------ a game by link
  function encode() {
    const o = { p: G.st.pts, b: G.st.bar, o: G.st.off, t: G.turn, n: link.names, d: G.lastDice, k: (link.n || 0) + 1, w: G.over };
    return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(s) {
    try {
      const o = JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))));
      if (!Array.isArray(o.p) || o.p.length !== 24) return null;
      return o;
    } catch { return null; }
  }
  async function share() {
    const url = `${location.origin}/?t=${encode()}#tawleh`;
    const other = link.names[1 - link.me];
    const text = t('shareText', other);
    msg = t('sent');
    render();
    if (navigator.share) {
      try { await navigator.share({ text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    window.open('https://wa.me/?text=' + encodeURIComponent(`${text}\n${url}`), '_blank', 'noopener');
  }
  function fromUrl() {
    const q = new URLSearchParams(location.search).get('t');
    if (!q) return false;
    const o = decode(q);
    if (!o) return false;
    mode = 'link';
    link = { me: o.t, names: o.n || [t('p1'), t('p2')], n: o.k || 0 };
    G = { st: { pts: o.p, bar: o.b, off: o.o }, turn: o.t, dice: null, played: [], options: null, before: null, lastDice: o.d, over: typeof o.w === 'number' ? o.w : -1, mars: false };
    msg = t('fromLink', link.names[1 - o.t]);
    return true;
  }

  // ================================================================== drawing the board
  const NS = 'http://www.w3.org/2000/svg';
  function sv(tag, a = {}, kids = []) { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) n.setAttribute(k, v); kids.forEach(c => n.appendChild(c)); return n; }
  const BW = 330, BH = 250, F = 9, BAR = 18, TRAY = 26;
  const PW = (BW - TRAY - 2 * F - BAR) / 12;
  const PH = 98, R = Math.min(PW / 2 - 0.6, 10.4);

  // screen position of absolute point i (0..23), white's home bottom right
  function pointX(i) {
    const col = i < 12 ? 11 - i : i - 12;      // 0 = leftmost
    return F + col * PW + (col >= 6 ? BAR : 0) + PW / 2;
  }
  const isTop = i => i >= 12;

  function render() {
    const lang = S.lang();
    box.dir = lang === 'ar' ? 'rtl' : 'ltr';
    const nm = names();
    const sc = mode === 'link' ? null : (score[mode] || [0, 0]);
    const head = el('div', { className: 'tw-head' }, [
      el('div', { className: 'tw-modes', role: 'group' }, ['ai', 'here', 'link'].map(md => {
        const b = el('button', { type: 'button', className: 'chip', text: t(md === 'ai' ? 'vsAi' : md === 'here' ? 'vsHere' : 'vsLink') });
        b.setAttribute('aria-pressed', String(mode === md));
        b.addEventListener('click', () => { if (mode === md) return; mode = md; S.store.set('tawlehMode', md); link = null; if (md === 'link') { G = null; render(); return; } newGame(); });
        return b;
      }))
    ]);
    if (mode === 'link' && !link) { box.replaceChildren(head, linkForm()); return; }
    if (!G) newGameSilent();
    const players = el('div', { className: 'tw-players' }, [0, 1].map(pl => el('div', { className: 'tw-player' + (G.turn === pl && G.over < 0 ? ' is-turn' : '') }, [
      el('span', { className: 'tw-chip tw-chip-' + pl }),
      el('span', { className: 'tw-name', text: nm[pl] }),
      sc ? el('b', { className: 'tw-score', text: S.num(sc[pl]) }) : el('span', { className: 'tw-pips', text: S.num(pips(G.st, pl)) })
    ])));
    const board = drawBoard();
    const controls = el('div', { className: 'tw-controls' });
    const dice = el('div', { className: 'tw-dice' + (performance.now() - rolling < 500 && !reduceMotion ? ' is-rolling' : '') });
    const shown = G.dice || G.lastDice;
    if (shown) {
      const used = G.dice ? G.played.map(m => m.d) : [];
      const all = G.dice && G.dice[0] === G.dice[1] ? [G.dice[0], G.dice[0], G.dice[0], G.dice[0]] : shown;
      const left = used.slice();
      all.forEach(d => {
        const k = left.indexOf(d);
        const spent = k >= 0; if (spent) left.splice(k, 1);
        dice.appendChild(die(d, spent || !G.dice));
      });
    }
    controls.appendChild(dice);
    const btns = el('div', { className: 'tw-btns' });
    if (G.over >= 0) {
      const b = el('button', { type: 'button', className: 'btn btn-primary', text: t('newGame') });
      b.addEventListener('click', () => { if (mode === 'link') { link = null; G = null; render(); } else newGame(); });
      btns.appendChild(b);
    } else if (humanTurn() && !busy) {
      if (!G.dice) {
        const b = el('button', { type: 'button', className: 'btn btn-primary tw-roll', text: '🎲 ' + t('roll') });
        b.addEventListener('click', roll);
        btns.appendChild(b);
      } else {
        if (G.played.length) { const u = el('button', { type: 'button', className: 'btn', text: t('undo') }); u.addEventListener('click', undo); btns.appendChild(u); }
        if (!nextMoves().length) { const d = el('button', { type: 'button', className: 'btn btn-primary', text: t('done') }); d.addEventListener('click', endTurn); btns.appendChild(d); }
      }
    } else if (mode === 'link' && G.over < 0) {
      const b = el('button', { type: 'button', className: 'btn', text: '📲 ' + t('send') });
      b.addEventListener('click', share);
      btns.appendChild(b);
    }
    controls.appendChild(btns);
    const turnLine = G.over >= 0 ? '' : humanTurn()
      ? (G.dice ? t('pick') : (mode === 'here' ? t('turnOf', nm[G.turn]) : t('yourTurn')))
      : (mode === 'link' ? t('waiting', nm[G.turn]) : '');
    box.replaceChildren(head, players, board, controls,
      el('p', { className: 'tw-msg', 'aria-live': 'polite', text: [msg, msg ? '' : turnLine].filter(Boolean).join(' ') }),
      el('p', { className: 'quiet small', text: t('rules') }));
  }
  function newGameSilent() { const st = START(); G = { st, turn: 0, dice: null, played: [], options: null, before: null, lastDice: null, over: -1, mars: false }; }

  function die(n, spent) {
    const pipsAt = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] }[n];
    const s = sv('svg', { viewBox: '0 0 30 30', class: 'tw-die' + (spent ? ' is-spent' : ''), role: 'img', 'aria-label': String(n) });
    s.appendChild(sv('rect', { x: 1, y: 1, width: 28, height: 28, rx: 6, class: 'tw-die-face' }));
    pipsAt.forEach(([x, y]) => s.appendChild(sv('circle', { cx: 8 + x * 7, cy: 8 + y * 7, r: 2.6, class: 'tw-die-pip' })));
    return s;
  }

  function drawBoard() {
    const flip = mode === 'link' && link && link.me === 1;     // your own checkers at the bottom
    const svg = sv('svg', { viewBox: `0 0 ${BW} ${BH}`, class: 'tw-board', role: 'img', 'aria-label': 'tawleh' });
    const defs = sv('defs');
    defs.innerHTML = `<linearGradient id="twWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6b3f1f"/><stop offset=".5" stop-color="#53301a"/><stop offset="1" stop-color="#3c2112"/></linearGradient>
      <linearGradient id="twFelt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b98a"/><stop offset="1" stop-color="#c9a571"/></linearGradient>
      <radialGradient id="twW" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fffaf0"/><stop offset=".7" stop-color="#eadfca"/><stop offset="1" stop-color="#bfae90"/></radialGradient>
      <radialGradient id="twB" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#6a3b2a"/><stop offset=".7" stop-color="#2d1710"/><stop offset="1" stop-color="#170b07"/></radialGradient>`;
    svg.appendChild(defs);
    const FLIP = `translate(0 ${BH}) scale(1 -1)`;     // mirrored top to bottom: your home stays bottom right
    const g = sv('g', flip ? { transform: FLIP } : {});
    const side = sv('g', flip ? { transform: FLIP } : {});
    svg.appendChild(sv('rect', { x: 0, y: 0, width: BW, height: BH, rx: 10, fill: 'url(#twWood)' }));
    g.appendChild(sv('rect', { x: F, y: F, width: BW - TRAY - 2 * F, height: BH - 2 * F, rx: 3, fill: 'url(#twFelt)' }));
    // the bar
    const barX = F + 6 * PW;
    g.appendChild(sv('rect', { x: barX, y: F - 2, width: BAR, height: BH - 2 * F + 4, fill: 'url(#twWood)' }));
    // points
    const moves = humanTurn() ? nextMoves() : [];
    const pl = G.turn;
    const srcs = new Set(moves.map(m => m.from));
    const dsts = new Set(selected !== null ? moves.filter(m => m.from === selected).map(m => m.to) : []);
    for (let i = 0; i < 24; i++) {
      const x = pointX(i), top = isTop(i);
      const y0 = top ? F : BH - F, y1 = top ? F + PH : BH - F - PH;
      const dark = i % 2 === 0;
      g.appendChild(sv('path', { d: `M${x - PW / 2 + 0.6} ${y0} L${x} ${y1} L${x + PW / 2 - 0.6} ${y0} Z`, fill: dark ? '#7a1f1a' : '#f3e6c8', stroke: dark ? '#5a140f' : '#d9c79f', 'stroke-width': 0.6 }));
      // mother-of-pearl dot at the base
      g.appendChild(sv('circle', { cx: x, cy: top ? F + 4 : BH - F - 4, r: 1.3, fill: '#fff8e6', opacity: 0.7 }));
    }
    // checkers
    const drawStack = (n, pl2, x, top, i) => {
      const maxShow = 5;
      for (let k = 0; k < Math.min(n, maxShow); k++) {
        const cy = top ? F + R + 1 + k * (2 * R - 0.5) : BH - F - R - 1 - k * (2 * R - 0.5);
        g.appendChild(sv('circle', { cx: x, cy, r: R, fill: pl2 === 0 ? 'url(#twW)' : 'url(#twB)', stroke: pl2 === 0 ? '#a8987a' : '#0c0503', 'stroke-width': 0.8 }));
        g.appendChild(sv('circle', { cx: x, cy, r: R * 0.6, fill: 'none', stroke: pl2 === 0 ? 'rgba(150,130,100,.5)' : 'rgba(150,90,60,.45)', 'stroke-width': 0.7 }));
      }
      if (n > maxShow) {
        const cy = top ? F + R + 1 + (maxShow - 1) * (2 * R - 0.5) : BH - F - R - 1 - (maxShow - 1) * (2 * R - 0.5);
        const tx = sv('text', { x, y: cy + 3.5, 'text-anchor': 'middle', class: 'tw-count', fill: pl2 === 0 ? '#3a2a1a' : '#f3e6c8' });
        if (flip) tx.setAttribute('transform', `translate(0 ${2 * (cy + 3.5) - 3.5 * 2}) scale(1 -1) translate(0 0)`);
        tx.textContent = String(n);
        g.appendChild(tx);
      }
    };
    for (let i = 0; i < 24; i++) {
      const v = G.st.pts[i];
      if (v) drawStack(Math.abs(v), v > 0 ? 0 : 1, pointX(i), isTop(i), i);
    }
    // on the bar: white sits on the top half (it enters at the top), black on the bottom
    for (const p of [0, 1]) {
      for (let k = 0; k < G.st.bar[p]; k++) {
        const cy = p === 0 ? BH / 2 - R - 4 - k * (2 * R - 2) : BH / 2 + R + 4 + k * (2 * R - 2);
        g.appendChild(sv('circle', { cx: barX + BAR / 2, cy, r: R, fill: p === 0 ? 'url(#twW)' : 'url(#twB)', stroke: p === 0 ? '#a8987a' : '#0c0503', 'stroke-width': 0.8 }));
      }
    }
    // borne off, in the tray on the side
    const trayX = BW - TRAY + 3;
    for (const p of [0, 1]) {
      for (let k = 0; k < G.st.off[p]; k++) {
        const y = p === 0 ? BH - F - 4 - k * 5.4 : F + k * 5.4;
        side.appendChild(sv('rect', { x: trayX, y, width: TRAY - 9, height: 4.4, rx: 1.6, fill: p === 0 ? '#efe4cd' : '#2a140c', stroke: p === 0 ? '#a8987a' : '#000', 'stroke-width': 0.5 }));
      }
    }
    // what can be played: sources glow, destinations get a marker
    const mark = (absI, kind) => {
      const x = pointX(absI), top = isTop(absI);
      const n = Math.abs(G.st.pts[absI]);
      const k = Math.min(n, 5);
      const cy = top ? F + R + 1 + Math.max(0, k - (kind === 'src' ? 1 : 0)) * (2 * R - 0.5) : BH - F - R - 1 - Math.max(0, k - (kind === 'src' ? 1 : 0)) * (2 * R - 0.5);
      g.appendChild(sv('circle', { cx: x, cy, r: R + 1.6, class: kind === 'src' ? 'tw-src' + (selected !== null && idx(pl, selected) === absI ? ' is-sel' : '') : 'tw-dst' }));
    };
    if (G.dice && humanTurn()) {
      srcs.forEach(r => { if (r !== 25) mark(idx(pl, r), 'src'); });
      dsts.forEach(r => { if (r !== 0) mark(idx(pl, r), 'dst'); });
      if (srcs.has(25)) g.appendChild(sv('circle', { cx: barX + BAR / 2, cy: pl === 0 ? BH / 2 - R - 4 : BH / 2 + R + 4, r: R + 1.6, class: 'tw-src' + (selected === 25 ? ' is-sel' : '') }));
      if (dsts.has(0)) side.appendChild(sv('rect', { x: BW - TRAY + 1, y: pl === 0 ? BH / 2 + 4 : F, width: TRAY - 5, height: BH / 2 - F - 4, rx: 4, class: 'tw-dst-tray' }));
    }
    svg.appendChild(g);
    svg.appendChild(side);
    // tap targets (in board coordinates, flipped like the board)
    const hit = sv('g', flip ? { transform: FLIP } : {});
    for (let i = 0; i < 24; i++) {
      const x = pointX(i), top = isTop(i);
      const rct = sv('rect', { x: x - PW / 2, y: top ? 0 : BH / 2, width: PW, height: BH / 2, fill: 'transparent', class: 'tw-hit' });
      rct.addEventListener('click', () => tap(i));
      hit.appendChild(rct);
    }
    const barHit = sv('rect', { x: barX, y: 0, width: BAR, height: BH, fill: 'transparent', class: 'tw-hit' });
    barHit.addEventListener('click', () => tap('bar'));
    hit.appendChild(barHit);
    svg.appendChild(hit);
    const trayHit = sv('rect', { x: BW - TRAY, y: 0, width: TRAY, height: BH, fill: 'transparent', class: 'tw-hit' });
    trayHit.addEventListener('click', () => tap('off'));
    svg.appendChild(trayHit);
    return el('div', { className: 'tw-wrap' }, [svg]);
  }

  function tap(where) {
    if (!G || !G.dice || !humanTurn() || busy) return;
    const pl = G.turn;
    const moves = nextMoves();
    const r = where === 'bar' ? 25 : where === 'off' ? 0 : (pl === 0 ? where + 1 : 24 - where);
    if (selected !== null) {
      const m = moves.filter(x => x.from === selected && x.to === r);
      if (m.length) { play(m.sort((a, b) => a.d - b.d)[0]); return; }
    }
    if (moves.some(x => x.from === r)) {
      selected = r;
      // only one place to go? go there straight away
      const dst = [...new Set(moves.filter(x => x.from === r).map(x => x.to))];
      if (dst.length === 1 && !S.store.get('tawlehConfirm', false)) { render(); setTimeout(() => { if (selected === r) play(moves.find(x => x.from === r && x.to === dst[0])); }, 160); return; }
      render();
      return;
    }
    selected = null; render();
  }

  // ------------------------------------------------------------------ starting a link game
  function linkForm() {
    const f = el('form', { className: 'tw-link' });
    const me = el('input', { name: 'me', maxLength: 20, required: true, value: S.store.get('tawlehMe', '') });
    const them = el('input', { name: 'them', maxLength: 20, required: true });
    f.append(
      el('p', { className: 'pv-lede', text: t('linkIntro') }),
      el('label', { className: 'field' }, [el('span', { text: t('yourName') }), me]),
      el('label', { className: 'field' }, [el('span', { text: t('friendName') }), them]),
      el('button', { type: 'submit', className: 'btn btn-primary', text: t('start') })
    );
    f.addEventListener('submit', e => {
      e.preventDefault();
      const a = me.value.trim() || t('p1'), b = them.value.trim() || t('p2');
      S.store.set('tawlehMe', a);
      link = { me: 0, names: [a, b], n: 0 };
      newGameSilent(); msg = ''; render();
    });
    return f;
  }

  // ------------------------------------------------------------------ start
  function boot() {
    if (!fromUrl()) {
      const saved = S.store.get('tawlehGame', null);
      if (saved && saved.G && saved.mode === mode && saved.mode !== 'link' && saved.G.over < 0) {
        G = saved.G; G.dice = null; G.options = null; G.played = []; G.before = null;
        if (mode === 'ai' && G.turn === 1) setTimeout(aiTurn, 900);
      } else if (mode === 'link') { mode = 'ai'; }
    }
    render();
  }
  document.addEventListener('sawt:lang', () => render());
  window.SawtTawleh = { _engine: { START, sequences, apply, pips, aiChoose, singles } };
  boot();
})();

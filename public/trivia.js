/* Trivia night ("سهرة أسئلة"): ten questions on Lebanon (places, songs, food, proverbs,
   games), fifteen seconds each, points for the right answer and for being quick.
   Alone it's you against Abou Samir and Im George; in a family room everyone answers
   on their own phone at the same moment. Empty chairs are filled by the computer, and
   if the one running the game leaves, the next person carries it on. */
(() => {
  'use strict';
  const S = window.Sawt;
  const $ = id => document.getElementById(id);
  const el = S.el;
  const box = $('trivia');
  if (!box) return;
  const QS = window.SAWT_TRIVIA || [];

  const T = {
    ar: {
      title: 'سهرة أسئلة 🧠', lede: 'عشر أسئلة عن لبنان: ضيع، أغاني، أكل، أمثال وألعاب. كل سؤال ١٥ ثانية، والأسرع بياخد أكتر.',
      solo: '📱 أنا والكمبيوتر', inRoom: '🛋️ مع العيلة بالغرفة', start: 'يلّا نبلّش', again: 'كمان مرّة', join: 'أنا معكن', joined: 'إنت معهن ✓',
      lobby: r => `أسئلة بغرفة "${r}"`, autoStart: n => `منبلّش بعد ${S.num(n)} ثانية؛ إذا كنّا قلال بينضمّ الكمبيوتر`, players: 'اللاعبين',
      qOf: (i, n) => `سؤال ${S.num(i)} من ${S.num(n)}`, secs: n => `${S.num(n)}″`, waiting: 'ناطرين الباقيين…', right: 'صح! 👏', wrong: 'لأ 😅', late: 'خلص الوقت ⏰',
      final: 'النتيجة', won: n => `${n} ربح/ت سهرة الأسئلة! 🏆`, pts: n => `${S.num(n)} نقطة`, other: k => `عالطاولة هلّق: ${k}`, playHere: 'العبوا أسئلة بدالها',
      bots: ['أبو سمير', 'أم جورج', 'خالد'], tookOver: 'اللي كان عم يدير الأسئلة راح، فكمّلنا عندك.', games: { tawleh: 'طاولة', tarneeb: 'طرنيب', likha: 'ليخة' }
    },
    en: {
      title: 'Trivia night 🧠', lede: 'Ten questions on Lebanon: villages, songs, food, proverbs and games. Fifteen seconds each; the quicker, the more points.',
      solo: '📱 Me and the computer', inRoom: '🛋️ With the family', start: 'Let’s go', again: 'Play again', join: 'Count me in', joined: 'You’re in ✓',
      lobby: r => `Trivia in "${r}"`, autoStart: n => `Starting in ${n}s; if we’re few, the computer joins`, players: 'Players',
      qOf: (i, n) => `Question ${i} of ${n}`, secs: n => `${n}s`, waiting: 'Waiting for the others…', right: 'Right! 👏', wrong: 'Nope 😅', late: 'Time’s up ⏰',
      final: 'Final scores', won: n => `${n} wins trivia night! 🏆`, pts: n => `${n} pts`, other: k => `On the table now: ${k}`, playHere: 'Play trivia instead',
      bots: ['Abou Samir', 'Im George', 'Khaled'], tookOver: 'The quiz host left, so the game carries on here.', games: { tawleh: 'Tawleh', tarneeb: 'Tarneeb', likha: 'Likha' }
    },
    fr: {
      title: 'Soirée quiz 🧠', lede: 'Dix questions sur le Liban : villages, chansons, cuisine, proverbes et jeux. Quinze secondes chacune ; plus vite, plus de points.',
      solo: '📱 Moi et l’ordinateur', inRoom: '🛋️ En famille', start: 'On y va', again: 'Rejouer', join: 'Je joue', joined: 'Vous jouez ✓',
      lobby: r => `Quiz dans « ${r} »`, autoStart: n => `On commence dans ${n} s ; si on est peu, l’ordinateur joue`, players: 'Joueurs',
      qOf: (i, n) => `Question ${i} sur ${n}`, secs: n => `${n} s`, waiting: 'On attend les autres…', right: 'Bravo ! 👏', wrong: 'Raté 😅', late: 'Temps écoulé ⏰',
      final: 'Résultats', won: n => `${n} gagne la soirée quiz ! 🏆`, pts: n => `${n} pts`, other: k => `Sur la table : ${k}`, playHere: 'Jouer au quiz à la place',
      bots: ['Abou Samir', 'Im George', 'Khaled'], tookOver: 'L’animateur est parti, la partie continue ici.', games: { tawleh: 'Tawlé', tarneeb: 'Tarneeb', likha: 'Likha' }
    }
  };
  const t = (k, ...a) => { const v = (T[S.lang()] || T.ar)[k]; return typeof v === 'function' ? v(...a) : v; };
  const tl = x => (typeof x === 'string' ? x : (x[S.lang()] || x.en));
  const CAT = { place: '🏞️', land: '🇱🇧', song: '🎶', food: '🍽️', proverb: '📜', game: '🎲' };
  const N = 10, Q_MS = 15000, REVEAL_MS = 3800, LOBBY_MS = 30000;
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const R = () => window.SawtRooms;

  let mode = 'solo';            // solo | room
  let st = null;                // the game
  let host = true;              // this device runs the clock
  let ctx = null;               // room: { room, v, seen, movesSeen, takeOver, other, here, hostGoneAt }
  let qSeen = 0;                // when this device first saw the current question
  let localDeadline = 0;
  let botPlan = {};
  const myAns = {};             // my answers, kept until the host has them

  const me = () => (mode === 'room' && ctx ? ctx.room.name : ((window.SawtMe && window.SawtMe.name()) || 'إنت'));

  // ------------------------------------------------------------------ the game, run by the host
  function newState(players) {
    const pick = shuffle(QS.map((q, i) => i)).slice(0, Math.min(N, QS.length));
    return { phase: 'lobby', players, qs: pick.map(i => ({ i, p: shuffle([0, 1, 2, 3]) })), qi: 0, ans: {}, scores: {}, gained: {}, lobbyAt: Date.now(), qLeft: Q_MS, gid: (ctx ? ctx.room.id + '-q-' : 'l') + Date.now().toString(36) };
  }
  function fillBots() {
    const humans = st.players.filter(p => !p.bot).length;
    const want = Math.max(0, 3 - st.players.length);
    t('bots').slice(0, want).forEach(n => st.players.push({ n, bot: true }));
    if (!humans) st.players.unshift({ n: me(), bot: false });
  }
  function beginQuestion() {
    st.phase = 'q'; st.ans = {}; st.gained = {}; st.qStart = Date.now(); st.qLeft = Q_MS;
    botPlan = {};
    st.players.filter(p => p.bot).forEach(p => {
      const q = QS[st.qs[st.qi].i];
      const right = Math.random() < (q.c === 'proverb' ? 0.7 : 0.55);
      botPlan[p.n] = { at: 2500 + Math.random() * 9500, c: right ? q.k : [0, 1, 2, 3].filter(x => x !== q.k)[Math.floor(Math.random() * 3)] };
    });
  }
  function startGame() {
    fillBots();
    st.scores = Object.fromEntries(st.players.map(p => [p.n, 0]));
    st.qi = 0; beginQuestion(); push(); render();
  }
  function reveal() {
    const q = QS[st.qs[st.qi].i];
    st.players.forEach(p => {
      const a = st.ans[p.n];
      const g = a && a.c === q.k ? 100 + Math.round(50 * Math.max(0, 1 - a.ms / Q_MS)) : 0;
      st.gained[p.n] = g; st.scores[p.n] = (st.scores[p.n] || 0) + g;
    });
    st.phase = 'reveal'; st.revealAt = Date.now();
    push(); render();
  }
  function nextQuestion() {
    if (st.qi + 1 >= st.qs.length) { st.phase = 'end'; push(); render(); recordEnd(); return; }
    st.qi += 1; beginQuestion(); push(); render();
  }
  function answerAs(name, c, ms) {
    if (!st || st.phase !== 'q' || st.ans[name] || !st.players.some(p => p.n === name)) return false;
    st.ans[name] = { c, ms: Math.max(0, Math.min(Q_MS, ms)) };
    return true;
  }
  // the host's clock
  let tickT = 0;
  function tick() {
    clearTimeout(tickT);
    if (st && host) {
      const now = Date.now();
      if (st.phase === 'lobby' && mode === 'room' && now - st.lobbyAt > LOBBY_MS) startGame();
      else if (st.phase === 'q') {
        let changed = false;
        Object.entries(botPlan).forEach(([n, b]) => { if (!st.ans[n] && now - st.qStart >= b.at) changed = answerAs(n, b.c, b.at) || changed; });
        const all = st.players.every(p => st.ans[p.n]);
        if (all || now - st.qStart >= Q_MS) reveal();
        else if (changed) { push(); render(); }
      } else if (st.phase === 'reveal' && now - st.revealAt >= REVEAL_MS) nextQuestion();
    }
    if (st && st.phase !== 'end') tickT = setTimeout(tick, 250);
  }
  function recordEnd() {
    if (!st || st.phase !== 'end' || !window.SawtScores) return;
    const best = Math.max(...st.players.map(p => st.scores[p.n] || 0));
    const humans = st.players.filter(p => !p.bot).map(p => p.n);
    window.SawtScores.record('trivia', { gid: st.gid, players: humans, winners: humans.filter(n => (st.scores[n] || 0) === best && best > 0), room: mode === 'room' && ctx ? ctx.room : null });
  }

  // ------------------------------------------------------------------ in a room
  let chain = Promise.resolve();
  function push(fresh) {
    if (mode !== 'room' || !ctx || !host) return;
    const state = JSON.parse(JSON.stringify({ ...st, qLeft: st.phase === 'q' ? Math.max(0, Q_MS - (Date.now() - st.qStart)) : st.qLeft }));
    const c = ctx;
    chain = chain.then(async () => {
      if (ctx !== c) return;
      try { const d = await R().api(c.room, '/game', { kind: 'trivia', state, fresh: !!fresh, takeOver: true }); c.v = d.v; c.seen = d.v; }
      catch (e) { console.warn(e); }
    }).catch(() => {});
  }
  function enterRoom() {
    const room = R() && R().current();
    if (!room) { mode = 'solo'; render(); return; }
    mode = 'room'; st = null; host = false;
    ctx = { room, v: 0, seen: 0, movesSeen: 0, takeOver: false, other: null, here: [], hostGoneAt: 0 };
    poll();
  }
  function hostNew() {
    host = true; ctx.other = null;
    st = newState([{ n: me(), bot: false }]);
    push(true); render(); tick();
    if (R().announce) R().announce(ctx.room, 'trivia');
  }
  async function send(move) {
    if (mode !== 'room' || !ctx) return;
    if (host) { applyMove({ name: me(), move }); return; }
    try { await R().api(ctx.room, '/move', { move }); } catch (e) { console.warn(e); }
    setTimeout(poll, 300);
  }
  function applyMove(m) {
    const a = m.move || {};
    if (!st) return;
    if (a.type === 'join' && st.phase === 'lobby' && !st.players.some(p => p.n === m.name)) { st.players.push({ n: m.name, bot: false }); push(); render(); }
    if (a.type === 'ans' && a.qi === st.qi && answerAs(m.name, a.c, a.ms)) { push(); render(); }
  }
  let pT = 0;
  async function poll() {
    clearTimeout(pT);
    if (mode !== 'room' || !ctx) return;
    try {
      const d = await R().api(ctx.room, `?since=999999999&gv=${host ? ctx.v : ctx.seen}&moves=${ctx.movesSeen}`);
      ctx.here = d.here || [];
      const g = d.game;
      if (!g) { if (!st && !host) hostNew(); }
      else if (g.kind !== 'trivia') { if (ctx.other !== g.kind) { ctx.other = g.kind; st = null; host = false; render(); } }
      else {
        ctx.other = null;
        if (host && g.host !== me() && !ctx.takeOver) host = false;
        if (host) {
          for (const m of d.moves || []) { ctx.movesSeen = Math.max(ctx.movesSeen, m.i); applyMove(m); }
        } else {
          if (g.state) {
            const prevQi = st ? st.qi : -1, prevPhase = st ? st.phase : '';
            st = g.state; ctx.seen = g.v;
            const mineNow = myAns[st.gid + ':' + st.qi];
            if (st.phase === 'q' && mineNow && !st.ans[me()]) st.ans[me()] = mineNow;
            if (st.phase === 'q' && (prevQi !== st.qi || prevPhase !== 'q')) { qSeen = Date.now(); localDeadline = Date.now() + (st.qLeft || Q_MS); }
            if (d.moves && d.moves.length) ctx.movesSeen = d.moves[d.moves.length - 1].i;
            if (g.host === me()) { host = true; ctx.v = g.v; resumeClock(); }
            if (st.phase === 'end') recordEnd();
            render();
          }
          // whoever ran it has gone: the first one still here carries on
          const gone = g.host && !ctx.here.includes(g.host);
          ctx.hostGoneAt = gone ? (ctx.hostGoneAt || Date.now()) : 0;
          const next = st ? st.players.filter(p => !p.bot && ctx.here.includes(p.n)).map(p => p.n).sort()[0] : null;
          if (st && st.phase !== 'end' && ctx.hostGoneAt && Date.now() - ctx.hostGoneAt > 20000 && next === me()) {
            host = true; ctx.takeOver = true; ctx.v = g.v;
            const old = st.players.find(p => p.n === g.host); if (old) old.bot = true;
            resumeClock(); S.toast(t('tookOver')); push(); render();
          }
        }
      }
    } catch (e) { console.warn(e); }
    const open = window.SawtRoom && window.SawtRoom.isOpen() === 'tawleh' && !box.hidden;
    if (mode === 'room') pT = setTimeout(poll, document.hidden ? 15000 : open ? 1000 : 5000);
  }
  function resumeClock() {
    if (!st) return;
    if (st.phase === 'q') { st.qStart = Date.now() - (Q_MS - (st.qLeft || Q_MS)); botPlan = {}; }
    if (st.phase === 'reveal') st.revealAt = Date.now();
    tick();
  }

  // ------------------------------------------------------------------ drawing
  let rT = 0;
  function render() {
    cancelAnimationFrame(rT);
    box.dir = S.lang() === 'ar' ? 'rtl' : 'ltr';
    const kids = [];
    const canRoom = R() && R().storeOn() && R().current();
    const modes = el('div', { className: 'tw-modes', role: 'group' }, [['solo', t('solo')], ['room', t('inRoom')]].filter(([k]) => k === 'solo' || canRoom || mode === 'room').map(([k, label]) => {
      const b = el('button', { type: 'button', className: 'chip', text: label });
      b.setAttribute('aria-pressed', String(mode === k));
      b.addEventListener('click', () => { if (mode === k) return; clearTimeout(tickT); clearTimeout(pT); if (k === 'room') enterRoom(); else { mode = 'solo'; ctx = null; st = null; host = true; } render(); });
      return b;
    }));
    kids.push(el('h3', { className: 'pv-sub', text: t('title') }), modes);
    if (mode === 'room' && ctx && ctx.other) {
      const b = el('button', { type: 'button', className: 'btn btn-primary', text: '🧠 ' + t('playHere') });
      b.addEventListener('click', hostNew);
      kids.push(el('div', { className: 'cg-lobby' }, [el('p', { className: 'q-k', text: t('other', t('games')[ctx.other] || ctx.other) }), b]));
      box.replaceChildren(...kids); return;
    }
    if (!st) {
      if (mode === 'room') { kids.push(el('p', { className: 'quiet', text: '…' })); box.replaceChildren(...kids); return; }
      const go = el('button', { type: 'button', className: 'btn btn-primary', text: '🧠 ' + t('start') });
      go.addEventListener('click', () => { host = true; st = newState([{ n: me(), bot: false }]); startGame(); tick(); });
      kids.push(el('p', { className: 'pv-lede', text: t('lede') }), go);
      box.replaceChildren(...kids); return;
    }
    if (st.phase === 'lobby') kids.push(lobbyView());
    else if (st.phase === 'end') kids.push(endView());
    else kids.push(questionView());
    box.replaceChildren(...kids);
    if (st.phase === 'q' || st.phase === 'lobby') rT = requestAnimationFrame(() => { if (!box.hidden) { const bar = box.querySelector('.tq-bar i'); const sec = box.querySelector('.tq-secs'); const cd = box.querySelector('.tq-auto'); if (bar || cd) liveTimer(bar, sec, cd); } });
  }
  function left() { return st.phase !== 'q' ? 0 : host ? Math.max(0, Q_MS - (Date.now() - st.qStart)) : Math.max(0, localDeadline - Date.now()); }
  function liveTimer(bar, sec, cd) {
    const step = () => {
      if (!box.isConnected || box.hidden || !st) return;
      if (bar && st.phase === 'q') { const l = left(); bar.style.transform = `scaleX(${l / Q_MS})`; if (sec) sec.textContent = t('secs', Math.ceil(l / 1000)); }
      if (cd && st.phase === 'lobby') cd.textContent = t('autoStart', Math.max(0, Math.ceil((LOBBY_MS - (Date.now() - st.lobbyAt)) / 1000)));
      rT = requestAnimationFrame(step);
    };
    step();
  }
  function lobbyView() {
    const inIt = st.players.some(p => p.n === me());
    const list = el('div', { className: 'tq-players' }, st.players.map(p => el('span', { className: 'q-person' + (p.n === me() ? ' is-me' : ''), dir: 'auto', text: (p.bot ? '🤖 ' : '') + p.n })));
    const kids = [el('p', { className: 'q-k', dir: 'auto', text: ctx ? t('lobby', ctx.room.title) : '' }), el('p', { className: 'quiet small', text: t('players') }), list, el('p', { className: 'quiet small tq-auto', text: t('autoStart', LOBBY_MS / 1000) })];
    const row = el('div', { className: 'q-row' });
    if (!inIt) { const j = el('button', { type: 'button', className: 'btn btn-primary', text: '🙋 ' + t('join') }); j.addEventListener('click', () => send({ type: 'join' })); row.appendChild(j); }
    else row.appendChild(el('span', { className: 'quiet', text: t('joined') }));
    if (host) { const go = el('button', { type: 'button', className: 'btn btn-primary', text: '🧠 ' + t('start') }); go.addEventListener('click', startGame); row.appendChild(go); }
    if (ctx) { const inv = el('button', { type: 'button', className: 'btn', text: { ar: '＋ ادعي حدا يلعب', en: '＋ Invite someone to play', fr: '＋ Inviter quelqu’un à jouer' }[S.lang()] || '＋' }); inv.addEventListener('click', () => R().invite(ctx.room, true, 'trivia')); row.appendChild(inv); }
    kids.push(row);
    return el('div', { className: 'cg-lobby' }, kids);
  }
  function questionView() {
    const cur = st.qs[st.qi];
    const q = QS[cur.i];
    const mine = st.ans[me()];
    const revealed = st.phase === 'reveal';
    const head = el('div', { className: 'tq-head' }, [el('span', { text: `${CAT[q.c] || '❓'} ${t('qOf', st.qi + 1, st.qs.length)}` }), el('span', { className: 'tq-secs', text: revealed ? '' : t('secs', Math.ceil(left() / 1000)) })]);
    const bar = el('div', { className: 'tq-bar' + (revealed ? ' is-off' : '') }, [el('i')]);
    const answers = el('div', { className: 'tq-answers' }, cur.p.map(ai => {
      const b = el('button', { type: 'button', className: 'tq-a', dir: 'auto', text: tl(q.a[ai]) });
      if (revealed) { b.disabled = true; if (ai === q.k) b.classList.add('is-right'); else if (mine && mine.c === ai) b.classList.add('is-wrong'); }
      else if (mine) { b.disabled = true; if (mine.c === ai) b.classList.add('is-picked'); }
      else b.addEventListener('click', () => {
        const ms = host ? Date.now() - st.qStart : Date.now() - qSeen;
        if (mode === 'room' && !host) { st.ans[me()] = { c: ai, ms }; myAns[st.gid + ':' + st.qi] = { c: ai, ms }; send({ type: 'ans', qi: st.qi, c: ai, ms }); render(); return; }
        if (answerAs(me(), ai, ms)) { push(); render(); }
      });
      return b;
    }));
    const who = el('div', { className: 'tq-players' }, st.players.map(p => {
      const a = st.ans[p.n];
      const g = revealed ? st.gained[p.n] || 0 : null;
      return el('span', { className: 'q-person' + (p.n === me() ? ' is-me' : '') + (a ? ' has-ans' : '') + (revealed && g ? ' is-right' : ''), dir: 'auto', text: `${p.bot ? '🤖 ' : ''}${p.n}${revealed ? ` +${S.num(g)}` : a ? ' ✓' : ''} · ${S.num(st.scores[p.n] || 0)}` });
    }));
    const line = revealed ? (mine ? (mine.c === q.k ? t('right') : t('wrong')) : t('late')) : (mine ? t('waiting') : '');
    return el('div', { className: 'tq' }, [head, bar, el('p', { className: 'tq-q', dir: 'auto', text: tl(q.q) }), answers, el('p', { className: 'tq-line', 'aria-live': 'polite', text: line }), who]);
  }
  function endView() {
    const rows = st.players.slice().sort((a, b) => (st.scores[b.n] || 0) - (st.scores[a.n] || 0));
    const medals = ['🥇', '🥈', '🥉'];
    const kids = [el('p', { className: 'sb-champ', dir: 'auto', text: t('won', rows[0].n) }), el('h4', { className: 'q-k', text: t('final') })];
    kids.push(el('ol', { className: 'tq-final' }, rows.map((p, i) => el('li', { className: p.n === me() ? 'is-me' : '' }, [el('span', { text: medals[i] || S.num(i + 1) }), el('span', { dir: 'auto', text: (p.bot ? '🤖 ' : '') + p.n }), el('b', { text: t('pts', st.scores[p.n] || 0) })]))));
    if (host || mode === 'solo') {
      const b = el('button', { type: 'button', className: 'btn btn-primary', text: '🧠 ' + t('again') });
      b.addEventListener('click', () => { if (mode === 'room') hostNew(); else { st = newState([{ n: me(), bot: false }]); startGame(); tick(); } });
      kids.push(b);
    }
    return el('div', { className: 'tq-end' }, kids);
  }

  document.addEventListener('sawt:gametab', e => { if (e.detail === 'trivia') { if (mode === 'room') poll(); render(); } });
  document.addEventListener('sawt:trivia-room', () => { if (R() && R().current()) { clearTimeout(tickT); enterRoom(); render(); } });
  document.addEventListener('sawt:lang', () => { if (!box.hidden) render(); });
  window.SawtTrivia = { render, _st: () => st };
  render();
})();

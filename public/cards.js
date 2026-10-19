/* Cards on the coffee table: Tarneeb (طرنيب) and Likha (ليخة).
   Four seats around the table: you at the bottom, your partner across, the
   others on each side. Empty seats are played by the computer. In a family room
   the whole family sits at the same table from different countries.

   Tarneeb: bid 7 to 13 tricks, the winner names the trump, partners play together,
   game to 41. Likha: pass three cards, don't take hearts (1 each), the queen of
   spades (13) or the ten of diamonds (10); if you can't follow suit and hold one of
   those two you must play it. Someone reaching 101 ends the game; the lower team wins. */
(() => {
  'use strict';
  const S = window.Sawt;
  const $ = id => document.getElementById(id);
  const el = S.el;
  const box = $('cards');
  if (!box) return;

  const T = {
    ar: {
      tarneeb: 'طرنيب', likha: 'ليخة', you: 'إنت', partner: 'شريكك', bot: n => ['أبو سمير', 'أم جورج', 'خالد', 'ريتا'][n % 4],
      newGame: 'دقّة جديدة', bid: 'شو بتطلب؟', pass: 'باص', trump: 'اختار الطرنيب', passing: n => `اختار ٣ ورقات تعطيهن ${n}`, give: 'أعطي', yourTurn: 'دورك', waiting: n => `دور ${n}`,
      bidOf: (n, b) => b ? `${n} طلب ${b}` : `${n}: باص`, wonBid: (n, b) => `${n} أخد الطلب بـ ${b}`, trumpIs: s => `الطرنيب: ${s}`, tricks: 'لمّات', us: 'نحنا', them: 'هنّي',
      made: (n, b) => `${n} جاب طلبو (${b}) 👏`, failed: (n, b) => `${n} ما جاب طلبو (${b}) وانكسر`, allPass: 'كلّن باص، منوزّع من جديد', gameWon: w => `${w} ربحوا الدقّة! 🎉`,
      points: 'نقاط', handPts: 'هالجولة', target: n => `للـ ${S.num(n)}`, mustPlay: 'لازم تلعب البنت أو العشرة الديناري (ليخة!)', likhaTaken: (n, c) => `${n} أكل ${c} 😬`,
      rulesT: 'طرنيب: كل فريق اتنين، طلب من ٧ لـ ١٣، اللي بياخد الطلب بيختار الطرنيب. الدقّة للـ ٤١.', rulesL: 'ليخة: مرّر ٣ ورقات. كل كبّة بنقطة، البنت السبيت بـ ١٣ والعشرة الديناري بـ ١٠. اللي بيوصل ١٠١ بيخسّر فريقه.',
      room: r => `على الطاولة بغرفة "${r}"`, sit: 'اقعد هون', seatFree: 'كرسي فاضي (الكمبيوتر)', start: 'بلّشوا', local: 'هون على جهازي', inRoom: 'مع العيلة بالغرفة', host: 'صاحب الطاولة', leaveTable: 'قوم عن الطاولة',
      noRooms: 'لتلعبوا مع بعض من بعيد، فوتوا عغرفة عالكنباية (قعدة سوا) وبعدين ارجعوا لهون.', suits: { S: 'سبيت ♠', H: 'كبّة ♥', D: 'ديناري ♦', C: 'سباتي ♣' }
    },
    en: {
      tarneeb: 'Tarneeb', likha: 'Likha', you: 'You', partner: 'Partner', bot: n => ['Abou Samir', 'Im George', 'Khaled', 'Rita'][n % 4],
      newGame: 'New game', bid: 'Your bid?', pass: 'Pass', trump: 'Pick the trump', passing: n => `Pick 3 cards to give ${n}`, give: 'Give', yourTurn: 'Your turn', waiting: n => `${n}’s turn`,
      bidOf: (n, b) => b ? `${n} bids ${b}` : `${n} passes`, wonBid: (n, b) => `${n} won the bid with ${b}`, trumpIs: s => `Trump: ${s}`, tricks: 'tricks', us: 'Us', them: 'Them',
      made: (n, b) => `${n} made the bid (${b}) 👏`, failed: (n, b) => `${n} missed the bid (${b})`, allPass: 'Everyone passed, dealing again', gameWon: w => `${w} win the game! 🎉`,
      points: 'points', handPts: 'this hand', target: n => `to ${n}`, mustPlay: 'You must play the queen of spades or the ten of diamonds (Likha!)', likhaTaken: (n, c) => `${n} took ${c} 😬`,
      rulesT: 'Tarneeb: two teams of two, bid 7 to 13 tricks, the winning bidder names the trump. Game to 41.', rulesL: 'Likha: pass 3 cards. Each heart is 1 point, the queen of spades 13, the ten of diamonds 10. Reaching 101 loses it for your team.',
      room: r => `At the table in "${r}"`, sit: 'Sit here', seatFree: 'Empty seat (computer)', start: 'Start', local: 'Here on my device', inRoom: 'With the family in the room', host: 'Table host', leaveTable: 'Leave the table',
      noRooms: 'To play together from afar, enter a room on the sofa (Family rooms), then come back here.', suits: { S: 'Spades ♠', H: 'Hearts ♥', D: 'Diamonds ♦', C: 'Clubs ♣' }
    },
    fr: {
      tarneeb: 'Tarneeb', likha: 'Likha', you: 'Vous', partner: 'Partenaire', bot: n => ['Abou Samir', 'Im George', 'Khaled', 'Rita'][n % 4],
      newGame: 'Nouvelle partie', bid: 'Votre enchère ?', pass: 'Passe', trump: 'Choisissez l’atout', passing: n => `Choisissez 3 cartes à donner à ${n}`, give: 'Donner', yourTurn: 'À vous', waiting: n => `Au tour de ${n}`,
      bidOf: (n, b) => b ? `${n} annonce ${b}` : `${n} passe`, wonBid: (n, b) => `${n} remporte l’enchère à ${b}`, trumpIs: s => `Atout : ${s}`, tricks: 'plis', us: 'Nous', them: 'Eux',
      made: (n, b) => `${n} a réussi son contrat (${b}) 👏`, failed: (n, b) => `${n} a chuté (${b})`, allPass: 'Tout le monde passe, on redistribue', gameWon: w => `${w} gagnent la partie ! 🎉`,
      points: 'points', handPts: 'cette donne', target: n => `en ${n}`, mustPlay: 'Vous devez jouer la dame de pique ou le dix de carreau (Likha !)', likhaTaken: (n, c) => `${n} a pris ${c} 😬`,
      rulesT: 'Tarneeb : deux équipes de deux, enchères de 7 à 13 plis, le preneur choisit l’atout. Partie en 41.', rulesL: 'Likha : passez 3 cartes. Chaque cœur vaut 1 point, la dame de pique 13, le dix de carreau 10. Atteindre 101 fait perdre son équipe.',
      room: r => `À la table de « ${r} »`, sit: 'S’asseoir ici', seatFree: 'Place libre (ordinateur)', start: 'Commencer', local: 'Ici, sur mon appareil', inRoom: 'Avec la famille dans la pièce', host: 'Hôte de la table', leaveTable: 'Quitter la table',
      noRooms: 'Pour jouer ensemble à distance, entrez dans une pièce sur le canapé (Pièces de famille), puis revenez ici.', suits: { S: 'Pique ♠', H: 'Cœur ♥', D: 'Carreau ♦', C: 'Trèfle ♣' }
    }
  };
  Object.assign(T.ar, { rematch: '🔁 دقّة كمان، نفس اللاعبين', autoStart: n => `منبلّش بعد ${S.num(n)} ثانية، والكراسي الفاضية للكمبيوتر`, away: n => `${n} مش هون، الكمبيوتر عم يلعب عنّو`, imBack: 'رجعت! بكمّل أنا', youAway: 'غبت شوي، فالكمبيوتر لعب عنّك.', other: k => `عالطاولة هلّق: ${k}`, playCardsHere: 'لعبوا شدّة بدالها', tookOver: 'صاحب الطاولة راح، فكمّلنا عندك.', trivia: 'أسئلة', tawleh: 'طاولة' });
  Object.assign(T.en, { rematch: '🔁 Rematch, same players', autoStart: n => `Starting in ${n}s; empty seats go to the computer`, away: n => `${n} is away; the computer is playing for them`, imBack: 'I’m back, my turn', youAway: 'You were away, so the computer played for you.', other: k => `On the table now: ${k}`, playCardsHere: 'Play cards instead', tookOver: 'The table host left, so the game carries on here.', trivia: 'Trivia', tawleh: 'Tawleh' });
  Object.assign(T.fr, { rematch: '🔁 Revanche, mêmes joueurs', autoStart: n => `On commence dans ${n} s ; les places vides vont à l’ordinateur`, away: n => `${n} est absent·e ; l’ordinateur joue pour lui/elle`, imBack: 'Je suis là, je reprends', youAway: 'Vous étiez absent·e, l’ordinateur a joué pour vous.', other: k => `Sur la table : ${k}`, playCardsHere: 'Jouer aux cartes à la place', tookOver: 'L’hôte est parti, la partie continue ici.', trivia: 'Quiz', tawleh: 'Tawlé' });
  const t = (k, ...a) => { const v = (T[S.lang()] || T.ar)[k]; return typeof v === 'function' ? v(...a) : v; };

  // ================================================================== the rules (pure functions on a plain state object)
  const SUITS = ['S', 'H', 'D', 'C'];
  const RANKS = '23456789TJQKA';
  const SYM = { S: '♠', H: '♥', D: '♦', C: '♣' };
  const rank = c => RANKS.indexOf(c[0]);
  const suit = c => c[1];
  const next = s => (s + 1) % 4;                   // counter-clockwise: you, your right, across, your left
  const team = s => s % 2;
  const deck = () => SUITS.flatMap(su => [...RANKS].map(r => r + su));
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const sortHand = h => h.slice().sort((a, b) => (SUITS.indexOf(suit(a)) - SUITS.indexOf(suit(b))) || (rank(b) - rank(a)));
  const clone = s => JSON.parse(JSON.stringify(s));
  const POINTS = c => (c === 'QS' ? 13 : c === 'TD' ? 10 : suit(c) === 'H' ? 1 : 0);

  function newGame(kind, names, bots) {
    const st = { kind, names, bots, dealer: 3, handNo: 0, scores: kind === 'tarneeb' ? [0, 0] : [0, 0, 0, 0], target: kind === 'tarneeb' ? 41 : 101, over: null, msg: '' };
    return deal(st);
  }
  function deal(st) {
    const d = shuffle(deck());
    st.hands = [0, 1, 2, 3].map(i => sortHand(d.slice(i * 13, i * 13 + 13)));
    st.dealer = next(st.dealer);
    st.handNo++;
    st.trick = []; st.lastTrick = null; st.played = []; st.won = [0, 0, 0, 0]; st.taken = [0, 0, 0, 0];
    st.leader = next(st.dealer); st.turn = st.leader;
    if (st.kind === 'tarneeb') {
      st.phase = 'bid'; st.bids = []; st.bid = null; st.trump = null; st.passes = 0;
    } else {
      st.phase = 'pass'; st.passDir = st.handNo % 2 ? 1 : 3; st.picks = [null, null, null, null];
    }
    return st;
  }
  function legalCards(st, seat) {
    const h = st.hands[seat];
    if (!st.trick.length) return h.slice();
    const led = suit(st.trick[0].card);
    const follow = h.filter(c => suit(c) === led);
    if (follow.length) return follow;
    if (st.kind === 'likha') {
      const forced = h.filter(c => c === 'QS' || c === 'TD');
      if (forced.length) return forced;
    }
    return h.slice();
  }
  function trickWinner(st) {
    const led = suit(st.trick[0].card);
    let best = st.trick[0];
    for (const p of st.trick.slice(1)) {
      const a = p.card, b = best.card;
      const trumpA = st.kind === 'tarneeb' && suit(a) === st.trump, trumpB = st.kind === 'tarneeb' && suit(b) === st.trump;
      if (trumpA && !trumpB) best = p;
      else if (trumpA === trumpB && suit(a) === suit(b) && rank(a) > rank(b)) best = p;
      else if (!trumpA && !trumpB && suit(a) === led && suit(b) !== led) best = p;
    }
    return best.seat;
  }
  // apply one action; returns a new state or throws
  function apply(st0, a) {
    const st = clone(st0);
    st.msg = '';
    if (st.over) throw new Error('over');
    if (a.type === 'bid') {
      if (st.phase !== 'bid' || a.seat !== st.turn) throw new Error('turn');
      const top = st.bid ? st.bid.value : 6;
      if (a.value && (a.value <= top || a.value > 13)) throw new Error('bid');
      st.bids.push({ seat: a.seat, value: a.value || 0 });
      st.msg = t('bidOf', st.names[a.seat], a.value);
      if (a.value) { st.bid = { seat: a.seat, value: a.value }; st.passes = 0; } else st.passes++;
      const everyone = st.bids.length >= 4;
      if (a.value === 13 || (st.bid && st.passes >= 3 && everyone)) {
        st.phase = 'trump'; st.turn = st.bid.seat; st.msg = t('wonBid', st.names[st.bid.seat], st.bid.value);
      } else if (!st.bid && everyone && st.passes >= 4) {
        const keep = { msg: t('allPass') };
        st.dealer = (st.dealer + 3) % 4; st.handNo--;   // same dealer deals again
        deal(st); st.msg = keep.msg;
      } else st.turn = next(st.turn);
      return st;
    }
    if (a.type === 'trump') {
      if (st.phase !== 'trump' || a.seat !== st.turn || !SUITS.includes(a.suit)) throw new Error('turn');
      st.trump = a.suit; st.phase = 'play'; st.leader = st.bid.seat; st.turn = st.bid.seat;
      st.msg = t('trumpIs', t('suits')[a.suit]);
      return st;
    }
    if (a.type === 'pass3') {
      if (st.phase !== 'pass' || st.picks[a.seat] || !Array.isArray(a.cards) || a.cards.length !== 3) throw new Error('pass');
      if (!a.cards.every(c => st.hands[a.seat].includes(c)) || new Set(a.cards).size !== 3) throw new Error('cards');
      st.picks[a.seat] = a.cards.slice();
      if (st.picks.every(Boolean)) {
        for (let s = 0; s < 4; s++) st.hands[s] = st.hands[s].filter(c => !st.picks[s].includes(c));
        for (let s = 0; s < 4; s++) st.hands[(s + st.passDir) % 4].push(...st.picks[s]);
        st.hands = st.hands.map(sortHand);
        st.phase = 'play'; st.turn = st.leader;
      }
      return st;
    }
    if (a.type === 'play') {
      if (st.phase !== 'play' || a.seat !== st.turn) throw new Error('turn');
      if (!legalCards(st, a.seat).includes(a.card)) throw new Error('card');
      st.hands[a.seat] = st.hands[a.seat].filter(c => c !== a.card);
      st.trick.push({ seat: a.seat, card: a.card });
      st.played.push(a.card);
      if (st.trick.length < 4) { st.turn = next(st.turn); return st; }
      const w = trickWinner(st);
      st.won[w]++;
      const pts = st.trick.reduce((n, p) => n + (st.kind === 'likha' ? POINTS(p.card) : 0), 0);
      st.taken[w] += pts;
      const bad = st.trick.map(p => p.card).filter(c => c === 'QS' || c === 'TD');
      if (st.kind === 'likha' && bad.length) st.msg = t('likhaTaken', st.names[w], bad.map(face).join(' + '));
      st.lastTrick = { cards: st.trick, winner: w };
      st.trick = []; st.leader = w; st.turn = w;
      if (st.hands.every(h => !h.length)) endHand(st);
      return st;
    }
    throw new Error('action');
  }
  function face(c) { return (c[0] === 'T' ? '10' : c[0]) + SYM[suit(c)]; }
  function endHand(st) {
    if (st.kind === 'tarneeb') {
      const bt = team(st.bid.seat), ot = 1 - bt;
      const got = st.won[bt] + st.won[bt + 2], other = st.won[ot] + st.won[ot + 2];
      if (got >= st.bid.value) { st.scores[bt] += got; st.msg = t('made', st.names[st.bid.seat], st.bid.value); }
      else { st.scores[bt] -= st.bid.value; st.msg = t('failed', st.names[st.bid.seat], st.bid.value); }
      st.scores[ot] += other;
      st.handResult = { got, other, bt };
      if (st.scores[0] >= st.target || st.scores[1] >= st.target) {
        st.over = { winner: st.scores[0] >= st.target && st.scores[0] >= st.scores[1] ? 0 : 1 };
      }
    } else {
      for (let s = 0; s < 4; s++) st.scores[s] += st.taken[s];
      st.handResult = { taken: st.taken.slice() };
      if (st.scores.some(x => x >= st.target)) {
        const tA = st.scores[0] + st.scores[2], tB = st.scores[1] + st.scores[3];
        st.over = { winner: tA <= tB ? 0 : 1 };
      }
    }
    st.phase = 'handEnd';
  }
  function nextHand(st0) { const st = clone(st0); if (st.over) return st; return deal(st); }

  // ------------------------------------------------------------------ the computer players
  function botAction(st, seat) {
    const h = st.hands[seat];
    if (st.phase === 'bid') {
      let best = 0, bestSuit = 'S';
      for (const su of SUITS) {
        const mine = h.filter(c => suit(c) === su);
        let v = 0;
        for (const c of h) {
          const r = rank(c), same = h.filter(x => suit(x) === suit(c)).length;
          if (r === 12) v += 1; else if (r === 11 && same >= 2) v += 0.8; else if (r === 10 && same >= 3) v += 0.45;
        }
        v += Math.max(0, mine.length - 3) * 0.75 + mine.filter(c => rank(c) >= 9).length * 0.3;
        if (v > best) { best = v; bestSuit = su; }
      }
      const expect = Math.floor(best + 2.6);
      const top = st.bid ? st.bid.value : 6;
      const partnerBid = st.bid && team(st.bid.seat) === team(seat);
      if (expect > top && expect >= 7 && !(partnerBid && expect - top < 2)) return { type: 'bid', seat, value: Math.min(13, Math.max(top + 1, Math.min(expect, top + 1 + (expect - top > 2 ? 1 : 0)))) };
      return { type: 'bid', seat, value: 0 };
    }
    if (st.phase === 'trump') {
      let best = null, bv = -1;
      for (const su of SUITS) { const m = h.filter(c => suit(c) === su); const v = m.length * 2 + m.reduce((n, c) => n + Math.max(0, rank(c) - 7) * 0.4, 0); if (v > bv) { bv = v; best = su; } }
      return { type: 'trump', seat, suit: best };
    }
    if (st.phase === 'pass') {
      const score = c => (c === 'QS' ? 100 : c === 'TD' ? 90 : (c === 'AS' || c === 'KS') && h.filter(x => suit(x) === 'S').length < 4 ? 80 : suit(c) === 'H' ? 40 + rank(c) : rank(c) * 2 + (h.filter(x => suit(x) === suit(c)).length <= 2 ? 10 : 0));
      return { type: 'pass3', seat, cards: h.slice().sort((a, b) => score(b) - score(a)).slice(0, 3) };
    }
    if (st.phase !== 'play') return null;
    const legal = legalCards(st, seat);
    if (legal.length === 1) return { type: 'play', seat, card: legal[0] };
    const lo = cs => cs.slice().sort((a, b) => rank(a) - rank(b))[0];
    const hi = cs => cs.slice().sort((a, b) => rank(b) - rank(a))[0];
    const unseenHigher = c => [...RANKS].slice(rank(c) + 1).some(r => { const x = r + suit(c); return !st.played.includes(x) && !h.includes(x); });
    if (st.kind === 'tarneeb') {
      if (!st.trick.length) {
        const boss = legal.filter(c => suit(c) !== st.trump && !unseenHigher(c));
        if (boss.length) return { type: 'play', seat, card: hi(boss) };
        const myTeamBid = team(st.bid.seat) === team(seat);
        const trumps = legal.filter(c => suit(c) === st.trump);
        if (myTeamBid && trumps.length >= 3 && !unseenHigher(hi(trumps))) return { type: 'play', seat, card: hi(trumps) };
        const side = legal.filter(c => suit(c) !== st.trump);
        return { type: 'play', seat, card: lo(side.length ? side : legal) };
      }
      const w = trickWinner(st);
      const partnerWins = team(w) === team(seat);
      const tmp = c => { const s2 = clone(st); s2.trick.push({ seat, card: c }); return trickWinner(s2) === seat; };
      const winners = legal.filter(tmp);
      const last = st.trick.length === 3;
      if (partnerWins && (last || !unseenHigher(st.trick.find(p => p.seat === w).card))) return { type: 'play', seat, card: lo(legal.filter(c => suit(c) !== st.trump).length ? legal.filter(c => suit(c) !== st.trump) : legal) };
      if (winners.length) return { type: 'play', seat, card: lo(winners) };
      const side = legal.filter(c => suit(c) !== st.trump);
      return { type: 'play', seat, card: lo(side.length ? side : legal) };
    }
    // likha: stay out of trouble, push the points onto the other team
    const pointsIn = cs => cs.reduce((n, c) => n + POINTS(c), 0);
    if (!st.trick.length) {
      const safe = legal.filter(c => POINTS(c) === 0 && !(suit(c) === 'S' && rank(c) >= 10 && !st.played.includes('QS')));
      return { type: 'play', seat, card: lo(safe.length ? safe : legal) };
    }
    const led = suit(st.trick[0].card);
    const w = trickWinner(st);
    const partnerWins = team(w) === team(seat);
    if (legal.every(c => suit(c) === led)) {
      const curHigh = st.trick.filter(p => suit(p.card) === led).map(p => rank(p.card)).reduce((a, b) => Math.max(a, b), -1);
      const under = legal.filter(c => rank(c) < curHigh);
      if (under.length) return { type: 'play', seat, card: hi(under) };
      if (st.trick.length === 3 && pointsIn(st.trick.map(p => p.card)) === 0) return { type: 'play', seat, card: hi(legal.filter(c => POINTS(c) === 0).length ? legal.filter(c => POINTS(c) === 0) : legal) };
      return { type: 'play', seat, card: lo(legal) };
    }
    // void in the led suit: dump the worst card, unless it would land on your partner
    const dump = legal.slice().sort((a, b) => (POINTS(b) - POINTS(a)) || (rank(b) - rank(a)));
    if (partnerWins && st.trick.length === 3) {
      const clean = legal.filter(c => POINTS(c) === 0);
      if (clean.length) return { type: 'play', seat, card: hi(clean) };
    }
    return { type: 'play', seat, card: dump[0] };
  }

  // ================================================================== the table
  let G = null;                 // the local game, or the room's game
  let mySeat = 0;
  let kind = S.store.get('cardsKind', 'tarneeb');
  let picks = [];
  let busy = false;
  let roomCtx = null;           // { room, isHost, v, movesSeen, lobby }
  let showTrick = null;         // the last trick, held on the table for a moment

  const seatPos = s => (s - mySeat + 4) % 4;    // 0 bottom, 1 right, 2 top, 3 left
  function cardEl(c, opts = {}) {
    const red = suit(c) === 'H' || suit(c) === 'D';
    const b = el(opts.button ? 'button' : 'span', { className: 'cd' + (red ? ' is-red' : '') + (opts.cls ? ' ' + opts.cls : ''), 'aria-label': face(c), type: opts.button ? 'button' : undefined, dir: 'ltr' }, [
      el('span', { className: 'cd-c', text: (c[0] === 'T' ? '10' : c[0]) + SYM[suit(c)] }),
      el('span', { className: 'cd-m', text: SYM[suit(c)] })
    ]);
    return b;
  }
  const back = () => el('span', { className: 'cd cd-back' });

  function names() {
    const me = (window.SawtMe && window.SawtMe.name()) || t('you');
    return [me, t('bot', 0), t('bot', 1), t('bot', 2)];
  }
  function startLocal(k) {
    kind = k; S.store.set('cardsKind', k);
    roomCtx = null; mySeat = 0; picks = [];
    G = newGame(k, names(), [false, true, true, true]);
    G.gid = 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    render(); drive();
  }
  // a finished game counts on the scoreboard (once, whoever sees it first)
  function recordEnd() {
    if (!G || !G.over || !G.gid || recorded === G.gid || !window.SawtScores) return;
    recorded = G.gid;
    const humans = G.names.filter((n, s) => G.bots[s] !== true);
    const winners = G.names.filter((n, s) => team(s) === G.over.winner && G.bots[s] !== true);
    window.SawtScores.record(G.kind, { gid: G.gid, players: humans, winners, room: roomCtx ? roomCtx.room : null });
  }
  let recorded = null;
  // ---- in a room: players who are away are played by the computer until they come back
  let roomHere = [];
  document.addEventListener('sawt:room', e => { roomHere = (e.detail && e.detail.here) || []; });
  let turnKey = '', turnAt = 0;
  function pendingSeats() {
    if (!G || G.over || G.phase === 'handEnd') return [];
    if (G.phase === 'pass') return [0, 1, 2, 3].filter(s => !G.picks[s] && !G.bots[s]);
    return G.bots[G.turn] ? [] : [G.turn];
  }
  function checkAway() {
    if (!roomCtx || !roomCtx.isHost || !G) return;
    const pend = pendingSeats().filter(s => s !== mySeat);
    const key = [G.phase, G.turn, G.handNo, G.trick.length, pend.join('')].join(':');
    if (key !== turnKey) { turnKey = key; turnAt = Date.now(); return; }
    let changed = false;
    for (const s of pend) {
      const gone = !roomHere.includes(G.names[s]);
      if (Date.now() - turnAt > (gone ? 20000 : 75000)) { G.bots[s] = 'away'; changed = true; }
    }
    if (changed) { turnKey = ''; commit().then(drive); }
  }

  // the computer players move, one after another (on the host's device in a room)
  let driving = false;
  async function drive() {
    if (driving) return;
    driving = true;
    try {
      while (G && !G.over) {
        if (G.phase === 'handEnd') break;
        if (G.phase === 'pass') {
          let changed = false;
          for (let s = 0; s < 4; s++) if (G.bots[s] && !G.picks[s]) { G = apply(G, botAction(G, s)); changed = true; }
          if (changed) await commit();
          break;
        }
        if (!G.bots[G.turn]) break;
        if (roomCtx && !roomCtx.isHost) break;
        await wait(G.phase === 'play' ? 650 : 900);
        if (!G || G.over || !G.bots[G.turn]) break;
        const before = G;
        G = apply(G, botAction(G, G.turn));
        if (before.trick.length === 3 && G.trick.length === 0) holdTrick(G.lastTrick);
        await commit();
        if (G.trick.length === 0 && G.phase === 'play') await wait(900);
      }
    } catch (e) { console.warn(e); }
    driving = false;
    render();
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  function holdTrick(lt) { showTrick = lt; setTimeout(() => { if (showTrick === lt) { showTrick = null; render(); } }, 1100); }
  async function commit() {
    render();
    if (roomCtx && roomCtx.isHost) await pushRoom();
    recordEnd();
  }
  async function act(a) {
    if (!G || busy) return;
    if (roomCtx && !roomCtx.isHost) { sendMove(a); return; }
    try {
      const before = G;
      G = apply(G, a);
      if (before.trick.length === 3 && G.trick.length === 0) holdTrick(G.lastTrick);
      picks = [];
      await commit();
      drive();
    } catch (e) { console.warn(e); render(); }
  }

  // ------------------------------------------------------------------ drawing
  function render() {
    const lang = S.lang();
    box.dir = lang === 'ar' ? 'rtl' : 'ltr';
    const kids = [];
    kids.push(whereRow());
    if (roomCtx && roomCtx.other) {
      const b = el('button', { type: 'button', className: 'btn btn-primary', text: '🃏 ' + t('playCardsHere') });
      b.addEventListener('click', () => { roomCtx.other = null; hostNew(kind); });
      kids.push(el('div', { className: 'cg-lobby' }, [el('p', { className: 'q-k', text: t('other', t(roomCtx.other) || roomCtx.other) }), b]));
      box.replaceChildren(...kids); return;
    }
    if (roomCtx && roomCtx.lobby) { kids.push(lobbyView()); box.replaceChildren(...kids); return; }
    if (!G) { kids.push(el('p', { className: 'quiet', text: '…' })); box.replaceChildren(...kids); return; }
    if (roomCtx && G.bots[mySeat] === 'away') {
      const b = el('button', { type: 'button', className: 'btn btn-primary', text: '🙋 ' + t('imBack') });
      b.addEventListener('click', () => sendMove({ type: 'back', seat: mySeat }));
      kids.push(el('div', { className: 'cg-away' }, [el('span', { text: t('youAway') }), b]));
    }
    kids.push(scoreLine(), tableView(), handView(), controls());
    kids.push(el('p', { className: 'quiet small', text: G.kind === 'tarneeb' ? t('rulesT') : t('rulesL') }));
    box.replaceChildren(...kids);
  }
  function whereRow() {
    const rooms = window.SawtRooms && window.SawtRooms.storeOn() ? window.SawtRooms.list() : [];
    const row = el('div', { className: 'cg-where' });
    const local = el('button', { type: 'button', className: 'chip', text: '📱 ' + t('local') });
    local.setAttribute('aria-pressed', String(!roomCtx));
    local.addEventListener('click', () => { if (roomCtx) { roomCtx = null; startLocal(kind); } });
    row.appendChild(local);
    const cur = window.SawtRooms && window.SawtRooms.current();
    if (cur) {
      const b = el('button', { type: 'button', className: 'chip', text: '🛋️ ' + t('inRoom') });
      b.setAttribute('aria-pressed', String(!!roomCtx));
      b.addEventListener('click', () => joinRoomTable(cur));
      row.appendChild(b);
    } else if (window.SawtRooms && window.SawtRooms.storeOn() && !rooms.length) {
      row.appendChild(el('span', { className: 'quiet small', text: t('noRooms') }));
    }
    return row;
  }
  function scoreLine() {
    if (G.kind === 'tarneeb') {
      const myT = team(mySeat);
      return el('div', { className: 'cg-score' }, [
        el('span', { className: 'cg-team is-us' }, [el('b', { text: S.num(G.scores[myT]) }), el('span', { text: ` ${t('us')}` })]),
        el('span', { className: 'cg-mid', text: [G.bid ? `${G.names[G.bid.seat]} · ${S.num(G.bid.value)}` : '', G.trump ? SYM[G.trump] : '', t('target', G.target)].filter(Boolean).join('  ·  ') }),
        el('span', { className: 'cg-team' }, [el('b', { text: S.num(G.scores[1 - myT]) }), el('span', { text: ` ${t('them')}` })])
      ]);
    }
    return el('div', { className: 'cg-score' }, [0, 1, 2, 3].map(s => el('span', { className: 'cg-team' + (team(s) === team(mySeat) ? ' is-us' : '') }, [el('b', { text: S.num(G.scores[s]) }), el('span', { dir: 'auto', text: ' ' + G.names[s] })])));
  }
  function tableView() {
    const tbl = el('div', { className: 'cg-table' + (G.kind === 'likha' ? ' is-likha' : '') });
    for (let s = 0; s < 4; s++) {
      const pos = seatPos(s);
      if (pos === 0) continue;
      const n = G.hands[s].length;
      const seat = el('div', { className: `cg-seat cg-p${pos}` + (G.turn === s && !G.over && G.phase !== 'handEnd' ? ' is-turn' : '') }, [
        el('span', { className: 'cg-name', dir: 'auto', text: G.names[s] + (G.bots[s] ? ' 🤖' : ''), title: G.bots[s] === 'away' ? t('away', G.names[s]) : '' }),
        el('span', { className: 'cg-backs' }, Array.from({ length: Math.min(n, 13) }, back)),
        pos !== 2 ? el('span', { className: 'cg-count', text: '×' + S.num(n) }) : null,
        el('span', { className: 'cg-tricks', text: G.kind === 'tarneeb' ? `${S.num(G.won[s])} ${t('tricks')}` : `${S.num(G.taken[s])} ${t('points')}` })
      ].filter(Boolean));
      tbl.appendChild(seat);
    }
    // the trick in the middle
    const mid = el('div', { className: 'cg-trick' });
    const show = showTrick ? showTrick.cards : G.trick;
    show.forEach(p => { const c = cardEl(p.card, { cls: `cg-t${seatPos(p.seat)}` + (showTrick && p.seat === showTrick.winner ? ' is-win' : '') }); mid.appendChild(c); });
    tbl.appendChild(mid);
    const msg = G.over ? t('gameWon', G.kind === 'tarneeb' ? (team(mySeat) === G.over.winner ? t('us') : t('them')) : (G.over.winner === team(mySeat) ? t('us') : t('them'))) : G.msg;
    if (msg) tbl.appendChild(el('p', { className: 'cg-msg', 'aria-live': 'polite', text: msg }));
    const me = el('div', { className: 'cg-me' + (G.turn === mySeat && !G.over && G.phase !== 'handEnd' ? ' is-turn' : '') }, [
      el('span', { className: 'cg-name', dir: 'auto', text: G.names[mySeat] }),
      el('span', { className: 'cg-tricks', text: G.kind === 'tarneeb' ? `${S.num(G.won[mySeat])} ${t('tricks')}` : `${S.num(G.taken[mySeat])} ${t('points')}` })
    ]);
    tbl.appendChild(me);
    return tbl;
  }
  function handView() {
    const h = G.hands[mySeat] || [];
    const myTurn = G.phase === 'play' && G.turn === mySeat && !showTrick;
    const legal = myTurn ? legalCards(G, mySeat) : [];
    const passing = G.phase === 'pass' && !G.picks[mySeat];
    const wrap = el('div', { className: 'cg-hand', dir: 'ltr' });
    wrap.style.setProperty('--n', String(h.length));
    h.forEach((c, i) => {
      const can = myTurn ? legal.includes(c) : passing;
      const b = cardEl(c, { button: true, cls: (can ? 'is-legal' : 'is-off') + (picks.includes(c) ? ' is-picked' : '') });
      b.style.setProperty('--i', String(i));
      b.disabled = !can;
      b.addEventListener('click', () => {
        if (passing) { picks = picks.includes(c) ? picks.filter(x => x !== c) : picks.length < 3 ? [...picks, c] : picks; render(); return; }
        if (myTurn) act({ type: 'play', seat: mySeat, card: c });
      });
      wrap.appendChild(b);
    });
    return wrap;
  }
  function controls() {
    const row = el('div', { className: 'cg-ctl' });
    if (G.over || G.phase === 'handEnd') {
      const canNext = !roomCtx || roomCtx.isHost;
      if (canNext) {
        const b = el('button', { type: 'button', className: 'btn btn-primary', text: G.over ? t('newGame') : '▶' });
        b.addEventListener('click', () => {
          if (G.over) { if (roomCtx) hostNew(G.kind); else startLocal(G.kind); return; }
          G = nextHand(G); picks = []; commit().then(drive);
        });
        if (G.over && roomCtx) {
          // the same people around the same table, straight away
          const again = el('button', { type: 'button', className: 'btn btn-primary', text: t('rematch') });
          again.addEventListener('click', async () => {
            G = newGame(G.kind, G.names, G.bots.map(x => x === true));
            G.gid = roomCtx.room.id + '-' + Date.now().toString(36);
            picks = []; await pushRoom(true); render(); drive();
          });
          row.appendChild(again);
          b.className = 'btn';
        }
        row.appendChild(b);
      }
      return row;
    }
    if (G.phase === 'bid' && G.turn === mySeat) {
      const top = G.bid ? G.bid.value : 6;
      row.appendChild(el('span', { className: 'cg-k', text: t('bid') }));
      for (let v = top + 1; v <= 13; v++) { const b = el('button', { type: 'button', className: 'btn cg-bid', text: S.num(v) }); b.addEventListener('click', () => act({ type: 'bid', seat: mySeat, value: v })); row.appendChild(b); }
      const p = el('button', { type: 'button', className: 'btn', text: t('pass') }); p.addEventListener('click', () => act({ type: 'bid', seat: mySeat, value: 0 })); row.appendChild(p);
    } else if (G.phase === 'trump' && G.turn === mySeat) {
      row.appendChild(el('span', { className: 'cg-k', text: t('trump') }));
      SUITS.forEach(su => { const b = el('button', { type: 'button', className: 'btn cg-suit' + (su === 'H' || su === 'D' ? ' is-red' : ''), text: SYM[su] }); b.setAttribute('aria-label', t('suits')[su]); b.addEventListener('click', () => act({ type: 'trump', seat: mySeat, suit: su })); row.appendChild(b); });
    } else if (G.phase === 'pass' && !G.picks[mySeat]) {
      row.appendChild(el('span', { className: 'cg-k', text: t('passing', G.names[(mySeat + G.passDir) % 4]) }));
      const b = el('button', { type: 'button', className: 'btn btn-primary', text: `${t('give')} (${S.num(picks.length)}/٣)`.replace('٣', S.num(3)) });
      b.disabled = picks.length !== 3;
      b.addEventListener('click', () => act({ type: 'pass3', seat: mySeat, cards: picks }));
      row.appendChild(b);
    } else {
      row.appendChild(el('span', { className: 'cg-k', text: G.turn === mySeat ? (G.kind === 'likha' && G.trick.length && legalCards(G, mySeat).every(c => c === 'QS' || c === 'TD') && !G.hands[mySeat].some(c => suit(c) === suit(G.trick[0].card)) ? t('mustPlay') : t('yourTurn')) : t('waiting', G.names[G.turn]) }));
    }
    return row;
  }

  // ================================================================== the family's table, in a room
  const R = () => window.SawtRooms;
  function myRoomName() { const c = roomCtx && roomCtx.room; return c ? c.name : ''; }
  function joinRoomTable(room) {
    roomCtx = { room, isHost: false, v: 0, movesSeen: 0, lobby: null };
    G = null;
    pollGame(true);
    render();
  }
  async function hostNew(k) {
    kind = k;
    const lobby = { kind: k, seats: [myRoomName(), null, null, null], host: myRoomName(), at: Date.now() };
    roomCtx.isHost = true; roomCtx.lobby = lobby; G = null;
    try { await R().api(roomCtx.room, '/game', { kind: k, state: { lobby }, fresh: true, takeOver: true }); } catch (e) { console.warn(e); }
    render();
    if (R().announce) R().announce(roomCtx.room, k);
  }
  function lobbyView() {
    const lb = roomCtx.lobby;
    const me = myRoomName();
    const wrap = el('div', { className: 'cg-lobby' }, [el('p', { className: 'q-k', text: t('room', roomCtx.room.title) + ' · ' + t(lb.kind) })]);
    const grid = el('div', { className: 'cg-seats' });
    lb.seats.forEach((n, i) => {
      const b = el('button', { type: 'button', className: 'cg-chair' + (n === me ? ' is-me' : ''), disabled: !!n && n !== me }, [
        el('span', { className: 'cg-chair-t', text: i % 2 === 0 ? 'A' : 'B' }),
        el('span', { dir: 'auto', text: n || t('seatFree') }),
        !n ? el('span', { className: 'cg-chair-sit', text: t('sit') }) : null
      ].filter(Boolean));
      b.addEventListener('click', () => { if (!n) sendMove({ type: 'sit', seat: i }); });
      grid.appendChild(b);
    });
    wrap.appendChild(grid);
    const left = Math.max(0, Math.ceil((LOBBY_MS - (Date.now() - (lb.at || Date.now()))) / 1000));
    wrap.appendChild(el('p', { className: 'quiet small cg-auto', text: t('autoStart', left) }));
    const row = el('div', { className: 'q-row' });
    if (roomCtx.isHost) {
      const go = el('button', { type: 'button', className: 'btn btn-primary', text: '🃏 ' + t('start') });
      go.addEventListener('click', hostStart);
      row.appendChild(go);
    }
    const inv = el('button', { type: 'button', className: 'btn', text: { ar: '＋ ادعي حدا يلعب', en: '＋ Invite someone to play', fr: '＋ Inviter quelqu’un à jouer' }[S.lang()] || '＋' });
    inv.addEventListener('click', () => R().invite(roomCtx.room, true, lb.kind));
    row.appendChild(inv);
    wrap.appendChild(row);
    return wrap;
  }
  const LOBBY_MS = 60000;
  async function hostStart() {
    const lb = roomCtx.lobby;
    if (!lb) return;
    const ns = lb.seats.map((n, i) => n || t('bot', i));
    G = newGame(lb.kind, ns, lb.seats.map(n => !n));
    G.gid = roomCtx.room.id + '-' + Date.now().toString(36);
    roomCtx.lobby = null;
    mySeat = lb.seats.indexOf(myRoomName()); if (mySeat < 0) mySeat = 0;
    await pushRoom(true);
    render(); drive();
  }
  async function pushRoom(fresh) {
    if (!roomCtx || !roomCtx.isHost) return;
    const turn = G && !G.over && G.phase !== 'handEnd' && G.phase !== 'pass' && !G.bots[G.turn] ? G.names[G.turn] : null;
    try { const d = await R().api(roomCtx.room, '/game', { kind: G ? G.kind : kind, state: G ? { game: G } : { lobby: roomCtx.lobby }, fresh: !!fresh, takeOver: !!roomCtx.takeOver, turn }); roomCtx.v = d.v; }
    catch (e) { if (e.code === 'busy') { roomCtx.isHost = false; roomCtx.takeOver = false; roomCtx.seenV = 0; } else console.warn(e); }
  }
  async function sendMove(a) {
    if (!roomCtx) return;
    if (roomCtx.isHost) { applyRemote({ name: myRoomName(), move: a }); return; }
    try { await R().api(roomCtx.room, '/move', { move: a }); } catch (e) { console.warn(e); }
    setTimeout(() => pollGame(true), 400);
  }
  // the host applies moves sent by the others
  async function applyRemote(m) {
    const a = m.move || {};
    if (a.type === 'sit' && roomCtx.lobby) {
      const lb = roomCtx.lobby;
      if (!lb.seats.includes(m.name) && !lb.seats[a.seat]) lb.seats[a.seat] = m.name;
      else if (lb.seats.includes(m.name) && !lb.seats[a.seat]) { lb.seats[lb.seats.indexOf(m.name)] = null; lb.seats[a.seat] = m.name; }
      await pushRoom(); render(); return;
    }
    if (!G) return;
    const seat = G.names.indexOf(m.name);
    if (seat < 0 || G.bots[seat] === true || a.seat !== seat) return;     // you can only play your own seat
    if (G.bots[seat] === 'away') { G.bots[seat] = false; if (a.type === 'back') { await pushRoom(); render(); return; } }
    if (a.type === 'back') return;
    try {
      const before = G;
      G = apply(G, a);
      if (before.trick.length === 3 && G.trick.length === 0) holdTrick(G.lastTrick);
      await pushRoom(); render(); drive();
    } catch { /* not a legal move: ignore */ }
  }
  let gTimer = null;
  async function pollGame(force) {
    clearTimeout(gTimer);
    if (!roomCtx) return;
    const open = window.SawtRoom && window.SawtRoom.isOpen() === 'tawleh';
    try {
      const d = await R().api(roomCtx.room, `?since=999999999&gv=${roomCtx.isHost ? roomCtx.v : (roomCtx.seenV || 0)}&moves=${roomCtx.movesSeen}`);
      if (d.here) roomHere = d.here;
      const mine = d.game && (d.game.kind === 'tarneeb' || d.game.kind === 'likha');
      if (d.game && !mine) {
        // someone set up another game on the table (tawleh, trivia)
        roomCtx.isHost = false; roomCtx.lobby = null; G = null; roomCtx.other = d.game.kind; render();
      } else if (d.game) {
        roomCtx.other = null;
        if (roomCtx.isHost && d.game.host !== myRoomName() && !roomCtx.takeOver) { roomCtx.isHost = false; roomCtx.seenV = 0; }
        if (roomCtx.isHost) {
          for (const m of d.moves || []) { roomCtx.movesSeen = Math.max(roomCtx.movesSeen, m.i); await applyRemote(m); }
          if (roomCtx.lobby && Date.now() - (roomCtx.lobby.at || 0) > LOBBY_MS) await hostStart();
          else if (roomCtx.lobby) render();
          checkAway();
        } else {
          // the host has gone: the first one still here carries the table on
          const hostGone = d.game.host && !(d.here || []).includes(d.game.host);
          if (hostGone) { roomCtx.hostGoneAt = roomCtx.hostGoneAt || Date.now(); } else roomCtx.hostGoneAt = 0;
          const humans = (G ? G.names.filter((n, s) => !G.bots[s]) : (roomCtx.lobby ? roomCtx.lobby.seats.filter(Boolean) : [])).filter(n => (d.here || []).includes(n)).sort();
          if (roomCtx.hostGoneAt && Date.now() - roomCtx.hostGoneAt > 40000 && humans[0] === myRoomName() && (G || roomCtx.lobby)) {
            roomCtx.isHost = true; roomCtx.takeOver = true; roomCtx.v = d.game.v;
            if (G) { const hs = G.names.indexOf(d.game.host); if (hs >= 0 && G.bots[hs] !== true) G.bots[hs] = 'away'; }
            if (roomCtx.lobby) { roomCtx.lobby.host = myRoomName(); }
            S.toast(t('tookOver'));
            await pushRoom(); render(); drive();
          }
        }
        if (!roomCtx.isHost && d.game.state) {
          roomCtx.seenV = d.game.v;
          const s = d.game.state;
          if (s.lobby) { roomCtx.lobby = s.lobby; G = null; }
          else if (s.game) {
            const prev = G;
            roomCtx.lobby = null; G = s.game;
            mySeat = G.names.indexOf(myRoomName()); if (mySeat < 0) mySeat = 0;
            if (!G.over && G.turn === mySeat && G.phase !== 'handEnd' && (!prev || prev.turn !== G.turn || prev.phase !== G.phase) && !(window.SawtRoom && window.SawtRoom.isOpen() === 'tawleh')) S.toast(t('yourTurn') + ' 🃏');
            if (prev && prev.trick.length && !G.trick.length && G.lastTrick) holdTrick(G.lastTrick);
          }
          if (d.moves && d.moves.length) roomCtx.movesSeen = d.moves[d.moves.length - 1].i;
          // my own table (after a reload): carry on hosting it
          if (d.game.host === myRoomName()) { roomCtx.isHost = true; roomCtx.v = d.game.v; setTimeout(drive, 50); }
          recordEnd();
          render();
        } else if (!roomCtx.isHost && roomCtx.lobby) render();
      } else if (!roomCtx.isHost && !roomCtx.lobby && !G) {
        // nobody has set up a table yet: you become the host
        await hostNew(kind);
      }
    } catch (e) { console.warn(e); }
    if (roomCtx) gTimer = setTimeout(pollGame, document.hidden ? 60000 : open ? 1500 : 12000);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && roomCtx) pollGame(); });
  document.addEventListener('sawt:cards-room', () => { const cur = R() && R().current(); if (cur) { joinRoomTable(cur); showTab('cards'); } });

  // ================================================================== tabs over the coffee table: tawleh / tarneeb / likha
  const tabs = $('games-tabs');
  const PANES = { tawleh: 'tawleh', cards: 'cards', trivia: 'trivia', scores: 'scores' };
  function showTab(which) {
    if (!PANES[which]) which = 'tawleh';
    S.store.set('gameTab', which);
    Object.entries(PANES).forEach(([k, id]) => { const n = $(id); if (n) n.hidden = k !== which; });
    tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === which || (which === 'cards' && b.dataset.tab === kind))));
    if (which === 'cards' && !G && !roomCtx) startLocal(kind);
    document.dispatchEvent(new CustomEvent('sawt:gametab', { detail: which }));
  }
  function renderTabs() {
    const L = { ar: ['طاولة 🎲', 'طرنيب 🃏', 'ليخة ♠', 'أسئلة 🧠', '🏆'], en: ['Tawleh 🎲', 'Tarneeb 🃏', 'Likha ♠', 'Trivia 🧠', '🏆'], fr: ['Tawlé 🎲', 'Tarneeb 🃏', 'Likha ♠', 'Quiz 🧠', '🏆'] }[S.lang()] || [];
    const LBL = { ar: 'النتايج', en: 'Scores', fr: 'Scores' }[S.lang()];
    tabs.replaceChildren(...['tawleh', 'tarneeb', 'likha', 'trivia', 'scores'].map((k, i) => {
      const b = el('button', { type: 'button', role: 'tab', className: 'gt-tab' + (k === 'scores' ? ' gt-icon' : ''), text: L[i] });
      if (k === 'scores') { b.setAttribute('aria-label', LBL); b.title = LBL; }
      b.dataset.tab = k;
      b.addEventListener('click', () => {
        if (k === 'tawleh' || k === 'trivia' || k === 'scores') { showTab(k); return; }
        if (!roomCtx && (!G || G.kind !== k)) startLocal(k);
        else if (roomCtx && roomCtx.isHost && (!G || G.kind !== k)) hostNew(k);
        kind = k; showTab('cards');
      });
      return b;
    }));
    const cur = S.store.get('gameTab', 'tawleh');
    showTab(cur === 'scores' ? 'tawleh' : cur);
  }
  document.addEventListener('sawt:lang', () => { renderTabs(); render(); });
  if (new URLSearchParams(location.search).get('t')) S.store.set('gameTab', 'tawleh');
  window.SawtCards = { showTab, _engine: { newGame, apply, botAction, legalCards, nextHand, trickWinner } };
  document.addEventListener('sawt:gametab-open', e => showTab(e.detail));
  renderTabs();
})();

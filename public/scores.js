/* The scoreboard ("لوح النتايج"). Every finished game counts: tawleh, Tarneeb, Likha and
   trivia. On this device for you; in a family room for everyone, this week and from the
   start. A game is counted once, whoever's phone sees the end first. */
(() => {
  'use strict';
  const S = window.Sawt;
  const $ = id => document.getElementById(id);
  const el = S.el;
  const box = $('scores');
  if (!box) return;

  const T = {
    ar: {
      title: 'لوح النتايج', week: 'هالجمعة', all: 'من الأوّل', mine: 'نتايجي على هالجهاز', none: 'بعد ما في نتايج. العبوا شي دقّة! 🎲',
      inRoom: r => `غرفة "${r}"`, games: { tawleh: 'طاولة', tarneeb: 'طرنيب', likha: 'ليخة', trivia: 'أسئلة' }, wins: 'ربح', of: 'من', total: 'المجموع',
      pickRoom: 'لتشوفوا لوح العيلة كلّها، فوتوا عغرفة عالكنباية (قعدة سوا).', champ: n => `👑 ${n} بطل/ة الجمعة`, arcade: '👾 أبطال الأتاري هالجمعة', loading: '…', err: 'ما قدرنا نجيب النتايج هلّق.'
    },
    en: {
      title: 'Scoreboard', week: 'This week', all: 'All time', mine: 'My scores on this device', none: 'No scores yet. Go play a game! 🎲',
      inRoom: r => `Room "${r}"`, games: { tawleh: 'Tawleh', tarneeb: 'Tarneeb', likha: 'Likha', trivia: 'Trivia' }, wins: 'won', of: 'of', total: 'Total',
      pickRoom: 'To see the whole family’s board, enter a room on the sofa (Family rooms).', champ: n => `👑 ${n} is this week’s champion`, arcade: '👾 Console champions this week', loading: '…', err: 'Couldn’t load the scores right now.'
    },
    fr: {
      title: 'Tableau des scores', week: 'Cette semaine', all: 'Depuis le début', mine: 'Mes scores sur cet appareil', none: 'Pas encore de scores. À vous de jouer ! 🎲',
      inRoom: r => `Pièce « ${r} »`, games: { tawleh: 'Tawlé', tarneeb: 'Tarneeb', likha: 'Likha', trivia: 'Quiz' }, wins: 'gagnées', of: 'sur', total: 'Total',
      pickRoom: 'Pour voir le tableau de toute la famille, entrez dans une pièce sur le canapé.', champ: n => `👑 ${n}, champion·ne de la semaine`, arcade: '👾 Champions de la console cette semaine', loading: '…', err: 'Impossible de charger les scores.'
    }
  };
  const t = (k, ...a) => { const v = (T[S.lang()] || T.ar)[k]; return typeof v === 'function' ? v(...a) : v; };
  const GAMES = ['tawleh', 'tarneeb', 'likha', 'trivia'];
  const R = () => window.SawtRooms;

  // ------------------------------------------------------------------ counting a game
  function record(game, { gid, players = [], winners = [], pts = 1, room = null } = {}) {
    if (!gid || !GAMES.includes(game)) return;
    const gids = S.store.get('scoreGids', []) || [];
    if (gids.includes(gid)) return;
    S.store.set('scoreGids', [gid, ...gids].slice(0, 60));
    const me = room ? room.name : ((window.SawtMe && window.SawtMe.name()) || '');
    if (players.includes(me) || !room) {
      const mine = S.store.get('scores', {}) || {};
      const g = mine[game] || { w: 0, p: 0 };
      g.p += 1; if (winners.includes(me)) g.w += 1;
      mine[game] = g; S.store.set('scores', mine);
    }
    if (room && R() && R().storeOn()) R().score(room, { game, gid, players, winners, pts }).catch(() => {});
    if (!box.hidden) render();
  }

  // ------------------------------------------------------------------ the board
  let span = 'week';
  let data = null, dataFor = null, loading = false, failed = false;
  async function load(room) {
    loading = true; failed = false;
    try { data = await R().scores(room); dataFor = room.id; } catch { failed = true; }
    loading = false; render();
  }
  function table(rows) {
    const games = GAMES.filter(g => rows.some(([, rec]) => rec[g]));
    const head = el('tr', {}, [el('th', { text: '' }), ...games.map(g => el('th', { text: t('games')[g] })), el('th', { text: t('total') })]);
    const body = rows.map(([name, rec], i) => {
      const tot = games.reduce((a, g) => a + ((rec[g] || {}).w || 0), 0);
      return el('tr', { className: i === 0 && tot > 0 ? 'is-top' : '' }, [
        el('th', { scope: 'row', dir: 'auto', text: (i === 0 && tot > 0 ? '👑 ' : '') + name }),
        ...games.map(g => { const r = rec[g]; return el('td', { text: r ? `${S.num(r.w)} ${t('of')} ${S.num(r.p)}` : '·' }); }),
        el('td', {}, [el('b', { text: S.num(tot) })])
      ]);
    });
    return el('div', { className: 'sb-wrap' }, [el('table', { className: 'sb-table' }, [el('thead', {}, [head]), el('tbody', {}, body)])]);
  }
  // the console: the best score on each cartridge this week
  function arcadeChamps(ar) {
    const A = window.SawtAtari;
    if (!ar || !A) return null;
    const rows = A.carts().map(c => {
      let top = null;
      for (const [name, rec] of Object.entries(ar)) { const v = Number((rec || {})[c.id]) || 0; if (v && (!top || v > top[1])) top = [name, v]; }
      return top ? el('li', { dir: 'auto' }, [el('span', { text: `${c.icon} ${A.cartName(c.id)}` }), el('b', { text: `👑 ${top[0]} · ${S.num(top[1])}` })]) : null;
    }).filter(Boolean);
    return rows.length ? el('div', { className: 'sb-arcade' }, [el('p', { className: 'q-k', text: t('arcade') }), el('ul', {}, rows)]) : null;
  }
  const total = rec => GAMES.reduce((a, g) => a + ((rec[g] || {}).w || 0), 0);
  function render() {
    const kids = [el('h3', { className: 'pv-sub', text: '🏆 ' + t('title') })];
    const room = R() && R().storeOn() && R().current();
    if (room) {
      if (dataFor !== room.id && !loading) load(room);
      const tabs = el('div', { className: 'sb-tabs', role: 'group' }, ['week', 'all'].map(k => {
        const b = el('button', { type: 'button', className: 'chip', text: t(k) });
        b.setAttribute('aria-pressed', String(span === k));
        b.addEventListener('click', () => { span = k; render(); });
        return b;
      }));
      kids.push(el('p', { className: 'q-k', dir: 'auto', text: t('inRoom', room.title) }), tabs);
      if (!data || dataFor !== room.id) kids.push(el('p', { className: 'quiet', text: failed ? t('err') : t('loading') }));
      else {
        const rows = Object.entries(data[span] || {}).sort((a, b) => total(b[1]) - total(a[1]));
        if (!rows.length) kids.push(el('p', { className: 'quiet', text: t('none') }));
        else {
          if (span === 'week' && total(rows[0][1]) > 0) kids.push(el('p', { className: 'sb-champ', dir: 'auto', text: t('champ', rows[0][0]) }));
          kids.push(table(rows));
        }
        if (span === 'week') { const a = arcadeChamps(data.arcade); if (a) kids.push(a); }
      }
    } else if (R() && R().storeOn()) kids.push(el('p', { className: 'quiet small', text: t('pickRoom') }));
    // mine, here
    const mine = S.store.get('scores', {}) || {};
    kids.push(el('h3', { className: 'pv-sub sb-mine', text: t('mine') }));
    if (!Object.keys(mine).length) kids.push(el('p', { className: 'quiet', text: t('none') }));
    else kids.push(table([[(window.SawtMe && window.SawtMe.name()) || '🙂', mine]]));
    box.replaceChildren(...kids);
  }
  document.addEventListener('sawt:gametab', e => { if (e.detail === 'scores') { dataFor = null; render(); } });
  document.addEventListener('sawt:lang', () => { if (!box.hidden) render(); });
  window.SawtScores = { record, render };
})();

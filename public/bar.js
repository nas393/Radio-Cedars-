/* The bar at the bottom of the phone: the five things people reach for most
   (radio, TV, chat, games, and everything else), one tap each, over the room.
   It can be switched off in My corner. */
(() => {
  'use strict';
  const S = window.Sawt;
  const el = S.el;
  const T = {
    ar: { radio: 'الراديو', tv: 'التلفزيون', chat: 'الدردشة', games: 'الألعاب', more: 'كل شي' },
    en: { radio: 'Radio', tv: 'TV', chat: 'Chat', games: 'Games', more: 'Everything' },
    fr: { radio: 'Radio', tv: 'Télé', chat: 'Discussion', games: 'Jeux', more: 'Tout' }
  };
  const t = k => (T[S.lang()] || T.ar)[k];
  const phone = () => window.matchMedia('(max-width: 700px)').matches;
  const want = () => S.store.get('bottomBar', null);           // null: on for phones, off for computers
  const on = () => (want() === null ? phone() : !!want());
  const R = () => window.SawtRoom;

  const ITEMS = [
    { id: 'radio', ic: '📻', go: () => R().open('radio') },
    { id: 'tv', ic: '📺', go: () => R().open('tv') },
    { id: 'chat', ic: '💬', go: () => { const b = document.getElementById('chat-btn'); if (b && !b.hidden) b.click(); else R().open('together'); } },
    { id: 'games', ic: '🎲', go: () => R().open('tawleh') },
    { id: 'more', ic: '☰', go: () => { const b = document.getElementById('all-btn'); if (b) b.click(); } }
  ];
  const bar = el('nav', { className: 'bbar', id: 'bbar', 'aria-label': 'menu', hidden: true });
  document.body.appendChild(bar);
  function render() {
    bar.replaceChildren(...ITEMS.map(it => {
      const b = el('button', { type: 'button', className: 'bbar-b', 'data-id': it.id }, [el('span', { className: 'bbar-ic', text: it.ic }), el('span', { className: 'bbar-t', text: t(it.id) }), it.id === 'chat' ? el('b', { className: 'bbar-n', hidden: true }) : null].filter(Boolean));
      b.addEventListener('click', () => { if (R()) it.go(); });
      return b;
    }));
    sync();
  }
  function sync() {
    const show = on() && R() && R().inRoom();
    bar.hidden = !show;
    document.body.classList.toggle('has-bar', !!show);
    // the chat button's unread count, mirrored
    const n = document.querySelector('#chat-btn .chat-n'), m = bar.querySelector('.bbar-n');
    if (m) { m.hidden = !n || n.hidden; m.textContent = n ? n.textContent : ''; }
    const open = R() && R().isOpen();
    bar.querySelectorAll('.bbar-b').forEach(b => b.classList.toggle('is-on', open && ({ radio: 'radio', tv: 'tv', chat: 'together', games: 'tawleh' })[b.dataset.id] === open));
  }
  document.addEventListener('sawt:lang', render);
  document.addEventListener('sawt:entered', sync);
  document.addEventListener('sawt:panel', () => setTimeout(sync, 30));
  window.addEventListener('resize', sync);
  setInterval(sync, 1500);
  window.SawtBar = { on, set: v => { S.store.set('bottomBar', !!v); sync(); } };
  render();
})();

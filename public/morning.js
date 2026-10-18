/* Sabah el kheir. In the morning (Beirut time), the first time you come in each day:
   a greeting with your name, today's weather for Beirut or your village, a cup of
   coffee steaming, and Fairuz one tap away. You can also ask for it as a notification
   every day at 7 o'clock Beirut time. */
(() => {
  'use strict';
  const S = window.Sawt;
  const $ = id => document.getElementById(id);
  const el = S.el;
  const T = {
    ar: {
      hi: n => `صباح الخير${n ? ' يا ' + n : ''}`, beirut: 'بيروت', today: (p, w, a, b) => `${p} اليوم: ${w}، بين ${S.num(b)}° و ${S.num(a)}°`, now: (p, w, x) => `${p} هلّق: ${w}، ${S.num(x)}°`,
      fairuz: '☕ فيروز الصبح', tape: '📼 الصبحية مع فيروز', later: 'بعدين', every: '🔔 كل يوم عـ٧ الصبح', everyOn: '🔔 كل يوم عـ٧ ✓', alarm: '⏰ صحّيني عالراديو', blocked: 'التنبيهات مسكّرة لهالموقع بالمتصفّح.', ios: 'على الآيفون، ثبّت التطبيق عالشاشة أوّل.',
      wish: ['نهارك سعيد ☀️', 'يسعد صباحك 🌿', 'صباح الورد 🌹', 'صباح الفل والياسمين', 'يا صباح الخير يا اللي معانا 🎶']
    },
    en: {
      hi: n => `Good morning${n ? ', ' + n : ''}`, beirut: 'Beirut', today: (p, w, a, b) => `${p} today: ${w}, ${b}° to ${a}°`, now: (p, w, x) => `${p} now: ${w}, ${x}°`,
      fairuz: '☕ Fairuz with coffee', tape: '📼 Morning coffee tape', later: 'Later', every: '🔔 Every day at 7 am', everyOn: '🔔 Every day at 7 ✓', alarm: '⏰ Wake me with the radio', blocked: 'Notifications are blocked for this site in your browser.', ios: 'On iPhone, add the app to your home screen first.',
      wish: ['Have a lovely day ☀️', 'Sabah el kheir 🌿', 'A morning of roses 🌹', 'Jasmine and coffee', 'Yalla, a new day 🎶']
    },
    fr: {
      hi: n => `Bonjour${n ? ' ' + n : ''}`, beirut: 'Beyrouth', today: (p, w, a, b) => `${p} aujourd’hui : ${w}, de ${b}° à ${a}°`, now: (p, w, x) => `${p} maintenant : ${w}, ${x}°`,
      fairuz: '☕ Fairouz avec le café', tape: '📼 La cassette du matin', later: 'Plus tard', every: '🔔 Chaque jour à 7 h', everyOn: '🔔 Chaque jour à 7 h ✓', alarm: '⏰ Me réveiller à la radio', blocked: 'Les notifications sont bloquées pour ce site.', ios: 'Sur iPhone, ajoutez d’abord l’app à l’écran d’accueil.',
      wish: ['Belle journée ☀️', 'Sabah el kheir 🌿', 'Un matin de roses 🌹', 'Jasmin et café', 'Yalla, une nouvelle journée 🎶']
    }
  };
  const t = (k, ...a) => { const v = (T[S.lang()] || T.ar)[k]; return typeof v === 'function' ? v(...a) : v; };

  let cfg = { alerts: false, dedications: false, publicKey: null };
  let card = null;
  const q = new URLSearchParams(location.search);
  const forced = q.get('morning') === '1';
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Beirut' }).format(new Date());

  function line() {
    const v = window.SawtVillage && window.SawtVillage.get();
    const vw = window.SawtVillage && window.SawtVillage.weather();
    if (v && vw) return t('today', v.name, S.weatherWord(vw.code), vw.max, vw.min);
    const w = S.weather && S.weather();
    const c = w && (w.cities || []).find(x => x.id === 'beirut');
    if (c) return c.high != null && c.low != null ? t('today', t('beirut'), S.weatherWord(c.code), c.high, c.low) : t('now', t('beirut'), S.weatherWord(c.code), c.temperature);
    return '';
  }
  function show() {
    if (card) { card.querySelector('.mo-w').textContent = line(); return; }
    const name = window.SawtMe && window.SawtMe.name();
    const wish = t('wish')[new Date().getDate() % t('wish').length];
    const play = el('button', { type: 'button', className: 'btn btn-primary', text: t('fairuz') });
    play.addEventListener('click', () => { const b = $('morning-btn'); if (b && !$('morning').hidden) b.click(); else { const m = (window.SAWT_CONTENT.moods || []).find(x => x.id === 'morning'); if (m && window.SawtScreen) window.SawtScreen.playTape(m); } close(); });
    const later = el('button', { type: 'button', className: 'link-btn', text: t('later') });
    later.addEventListener('click', close);
    const every = el('button', { type: 'button', className: 'link-btn mo-every', text: S.store.get('morningPush', false) ? t('everyOn') : t('every') });
    every.addEventListener('click', subscribe);
    card = el('div', { className: 'mo', role: 'dialog', 'aria-label': t('hi', name) }, [
      el('div', { className: 'mo-cup', 'aria-hidden': 'true' }, [el('i'), el('i'), el('i'), el('span', { className: 'mo-mug' })]),
      el('div', { className: 'mo-text' }, [
        el('p', { className: 'mo-hi', dir: 'auto', text: t('hi', name) }),
        el('p', { className: 'mo-w', dir: 'auto', text: line() }),
        el('p', { className: 'mo-wish', text: wish }),
        el('div', { className: 'mo-acts' }, [play, (cfg.alerts ? every : null), later].filter(Boolean))
      ])
    ]);
    document.body.appendChild(card);
    requestAnimationFrame(() => card.classList.add('is-on'));
    const old = $('morning'); if (old) old.classList.add('is-replaced');
    S.store.set('morningSeen', today());
  }
  function close() { if (!card) return; card.classList.remove('is-on'); const c = card; card = null; setTimeout(() => c.remove(), 400); }

  async function subscribe() {
    const b = document.querySelector('.mo-every');
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) throw new Error('ios');
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      if ((await Notification.requestPermission()) !== 'granted') { S.toast(t('blocked')); return; }
      const raw = atob((cfg.publicKey + '='.repeat((4 - cfg.publicKey.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/'));
      const key = Uint8Array.from(raw, c => c.charCodeAt(0));
      const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
      const v = window.SawtVillage && window.SawtVillage.get();
      const res = await fetch('/api/morning/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription: sub.toJSON(), lang: S.lang(), name: (window.SawtMe && window.SawtMe.name()) || '', village: v }) });
      if (!res.ok) throw new Error('server');
      S.store.set('morningPush', true);
      if (b) b.textContent = t('everyOn');
    } catch (e) {
      S.toast(e.message === 'ios' ? t('ios') : t('blocked'));
    }
  }

  function maybe() {
    const h = S.beirutHour ? S.beirutHour() : new Date().getHours();
    if (forced || (h >= 5 && h < 11 && S.store.get('morningSeen', '') !== today())) setTimeout(show, forced ? 1200 : 2600);
  }
  document.addEventListener('sawt:config', e => { cfg = e.detail || cfg; });
  document.addEventListener('sawt:entered', maybe);
  document.addEventListener('sawt:weather', () => { if (card) card.querySelector('.mo-w').textContent = line(); });
  document.addEventListener('sawt:village', () => { if (card) card.querySelector('.mo-w').textContent = line(); });
  // keep the greeting's weather in step with the village
  document.addEventListener('sawt:entered', () => { if (window.SawtVillage && window.SawtVillage.get()) window.SawtVillage.load(); }, { once: true });
  window.SawtMorning = { show };
})();

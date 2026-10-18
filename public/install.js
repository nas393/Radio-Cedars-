/* Install Sawt el Beit like an app: an icon on the home screen, full screen,
   opens straight into the salon. Android and desktop Chrome get the real
   install prompt; iPhone and iPad get the two steps to do it from Safari. */
(() => {
  'use strict';
  const S = window.Sawt;
  const el = S.el;
  const T = {
    ar: { ask: 'خلّي صوت البيت عشاشتك متل تطبيق', install: 'ثبّت', later: 'بعدين', title: 'صوت البيت عشاشتك', grid: 'ثبّت التطبيق',
      ios1: 'دوس على زرّ المشاركة', ios2: 'اختار «إضافة إلى الشاشة الرئيسية»', ios3: 'بيصير عندك أيقونة صوت البيت، وبيفتح عالصالون دغري.', ok: 'تمام', done: 'تثبّت! لاقيه عشاشتك 🏠' },
    en: { ask: 'Keep Sawt el Beit on your home screen, like an app', install: 'Install', later: 'Later', title: 'Sawt el Beit on your home screen', grid: 'Install the app',
      ios1: 'Tap the Share button', ios2: 'Choose “Add to Home Screen”', ios3: 'You’ll get the Sawt el Beit icon, and it opens straight into the salon.', ok: 'Got it', done: 'Installed! Find it on your home screen 🏠' },
    fr: { ask: 'Gardez Sawt el Beit sur votre écran d’accueil, comme une app', install: 'Installer', later: 'Plus tard', title: 'Sawt el Beit sur votre écran d’accueil', grid: 'Installer l’app',
      ios1: 'Touchez le bouton Partager', ios2: 'Choisissez « Sur l’écran d’accueil »', ios3: 'L’icône Sawt el Beit apparaît, et s’ouvre directement sur le salon.', ok: 'Compris', done: 'Installée ! Elle est sur votre écran d’accueil 🏠' }
  };
  const t = k => (T[S.lang()] || T.ar)[k];
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const safari = ios && !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
  let deferred = null;

  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; renderTile(); maybeAsk(); });
  window.addEventListener('appinstalled', () => { deferred = null; S.toast(t('done')); hideBar(); renderTile(); });

  const canInstall = () => !standalone() && (deferred || safari);

  async function install() {
    hideBar();
    if (deferred) {
      deferred.prompt();
      try { await deferred.userChoice; } catch { /* closed */ }
      deferred = null; renderTile();
      return;
    }
    if (safari) iosSheet();
  }

  // ---- iPhone / iPad: show the two taps
  function iosSheet() {
    const share = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5M6 11H5v10h14V11h-1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const add = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    const step = (n, icon, text) => { const li = el('li', { className: 'ins-step' }); const i = el('span', { className: 'ins-icon' }); i.innerHTML = icon; li.append(el('b', { text: S.num(n) }), i, el('span', { text })); return li; };
    const ok = el('button', { type: 'button', className: 'btn btn-primary', text: t('ok') });
    const wrap = el('div', { className: 'ins-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('title') }, [
      el('div', { className: 'ins-card' }, [
        el('img', { className: 'ins-app', src: '/icon-192.png', alt: '' }),
        el('p', { className: 'ins-title', text: t('title') }),
        el('ol', { className: 'ins-steps' }, [step(1, share, t('ios1')), step(2, add, t('ios2'))]),
        el('p', { className: 'quiet small', text: t('ios3') }),
        ok
      ])
    ]);
    const close = () => wrap.remove();
    ok.addEventListener('click', close);
    wrap.addEventListener('click', e => { if (e.target === wrap) close(); });
    document.body.appendChild(wrap);
    ok.focus();
  }

  // ---- a gentle bar, from the second visit, at most every two weeks
  let bar = null;
  function hideBar() { if (bar) { bar.remove(); bar = null; } }
  function maybeAsk() {
    if (!canInstall() || bar) return;
    const visits = S.store.get('visits', 0);
    const last = S.store.get('installAsked', 0);
    if (visits < 2 || Date.now() - last < 14 * 864e5) return;
    if (!(window.SawtRoom && window.SawtRoom.inRoom())) return;
    S.store.set('installAsked', Date.now());
    const yes = el('button', { type: 'button', className: 'btn btn-primary', text: t('install') });
    const no = el('button', { type: 'button', className: 'link-btn', text: t('later') });
    yes.addEventListener('click', install);
    no.addEventListener('click', hideBar);
    bar = el('div', { className: 'ins-bar', role: 'region', 'aria-label': t('ask') }, [el('img', { src: '/icon-192.png', alt: '' }), el('span', { text: t('ask') }), yes, no]);
    document.body.appendChild(bar);
    setTimeout(hideBar, 20000);
  }
  S.store.set('visits', S.store.get('visits', 0) + 1);
  document.addEventListener('sawt:entered', () => setTimeout(maybeAsk, 6000));

  // ---- always reachable from "the room" overview
  function renderTile() {
    const head = document.querySelector('.objects-head');
    if (!head) return;
    let b = document.getElementById('install-btn');
    if (!canInstall()) { if (b) b.remove(); return; }
    if (!b) {
      b = el('button', { type: 'button', className: 'install-btn', id: 'install-btn' });
      b.addEventListener('click', () => { document.getElementById('objects-close').click(); install(); });
      head.querySelector('h2').after(b);
    }
    b.textContent = '📲 ' + t('grid');
  }
  document.addEventListener('sawt:lang', renderTile);
  renderTile();
  window.SawtInstall = { install, can: canInstall };
})();

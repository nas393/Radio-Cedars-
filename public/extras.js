/* Classics, dedications, breaking-news alerts and the section bar. */
(() => {
  'use strict';
  const S = window.Sawt;
  const DATA = window.SAWT_CLASSICS;
  if (!S || !DATA) return;
  const $ = id => document.getElementById(id);
  const { el, t } = S;

  let config = { alerts: false, dedications: false, publicKey: null };

  // ================================================================== classics

  let mood = null;

  function moodForNow() {
    const day = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'Asia/Beirut' }).format(new Date());
    const h = S.beirutHour();
    if (day === 'Sun' && h >= 10 && h < 18) return 'sunday';
    if (h >= 5 && h < 12) return 'morning';
    return 'nostalgia';
  }

  const searchUrl = (site, q) => site === 'yt'
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
    : `https://open.spotify.com/search/${encodeURIComponent(q)}`;

  const STATION_MATCH = {
    fairuz: S.FAIRUZ,
    classics: /رحبان|ذكريات|zikrayat|tarab|طرب|classic|كلاسيك|sawt el ghad|صوت الغد/i,
    nostalgia: /ذكريات|zikrayat|nostalg|حنين|memor|souvenir|رحبان/i
  };
  function stationFor(key) {
    const list = S.stations();
    return list.find(s => STATION_MATCH[key].test(s.name) || STATION_MATCH[key].test(s.tags || ''))
      || list.find(s => S.FAIRUZ.test(s.name)) || list[0] || null;
  }

  function songLabel(song) {
    const a = DATA.artists[song.artist];
    return `${a[S.lang()] || a.en}: ${S.lang() === 'ar' ? song.ar : song.latin}`;
  }

  function renderMoods() {
    if (!mood) mood = moodForNow();
    const lang = S.lang();
    $('moods').replaceChildren(...DATA.moods.map(m => {
      const tab = el('button', {
        type: 'button', role: 'tab', className: 'mood-tab',
        id: 'mood-' + m.id,
        'aria-selected': String(m.id === mood),
        'aria-controls': 'mood',
        tabindex: m.id === mood ? '0' : '-1',
        text: m.title[lang]
      });
      tab.addEventListener('click', () => { mood = m.id; renderMoods(); });
      return tab;
    }));

    const m = DATA.moods.find(x => x.id === mood);
    const panel = $('mood');
    panel.setAttribute('aria-labelledby', 'mood-' + m.id);
    const tune = el('button', { type: 'button', className: 'btn' }, [
      (() => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', '16'); s.setAttribute('height', '16'); s.innerHTML = '<use href="#i-play"/>'; return s; })(),
      document.createTextNode(t('moodTune'))
    ]);
    tune.addEventListener('click', () => {
      const st = stationFor(m.station);
      if (!st) return;
      S.showStation(st.id);
      S.setPower(true);
      document.getElementById('set').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    tune.disabled = !S.stations().length;

    const songs = el('ul', { className: 'songs' }, m.songs.map(song => {
      const artist = DATA.artists[song.artist];
      const query = `${artist.search} ${song.latin}`;
      const dedicate = config.dedications ? el('button', { type: 'button', text: '💌 ' + t('dedicateSong') }) : null;
      if (dedicate) dedicate.addEventListener('click', () => startDedication(songLabel(song)));
      return el('li', { className: 'song' }, [
        el('div', {}, [
          el('p', { className: 'song-title', lang: 'ar', dir: 'rtl', text: song.ar }),
          el('p', { className: 'song-meta' }, [
            el('span', { text: artist[lang] || artist.en }),
            el('span', { lang: 'en', dir: 'ltr', text: song.latin })
          ])
        ]),
        el('div', { className: 'song-actions' }, [
          el('a', { href: searchUrl('yt', query), target: '_blank', rel: 'noopener noreferrer', text: 'YouTube' }),
          el('a', { href: searchUrl('sp', query), target: '_blank', rel: 'noopener noreferrer', text: 'Spotify' }),
          dedicate
        ])
      ]);
    }));

    panel.replaceChildren(
      el('div', { className: 'mood-intro' }, [el('p', { className: 'mood-line', text: m.line[lang] }), tune]),
      songs
    );

    // Song suggestions for the dedication form
    const list = $('song-list');
    list.replaceChildren(...DATA.moods.flatMap(x => x.songs).map(song => el('option', { value: songLabel(song) })));
  }

  $('moods').addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const ids = DATA.moods.map(m => m.id);
    const rtl = document.documentElement.dir === 'rtl';
    const forward = (e.key === 'ArrowLeft') === rtl;
    mood = ids[(ids.indexOf(mood) + (forward ? 1 : -1) + ids.length) % ids.length];
    renderMoods();
    $('mood-' + mood).focus();
  });

  // ================================================================== dedications

  let wall = [];
  let wallFailed = false;
  let focusId = null;

  function dedicationLink(id) { return `${location.origin}/d/${encodeURIComponent(id)}`; }

  function renderWall() {
    const box = $('ded-wall');
    if (wallFailed) { box.replaceChildren(el('p', { className: 'ded-empty', text: t('dedLoadFailed') })); return; }
    if (!wall.length) { box.replaceChildren(el('p', { className: 'ded-empty', text: t('dedEmpty') })); return; }
    box.replaceChildren(...wall.map(d => {
      const dir = d.lang === 'ar' ? 'rtl' : 'ltr';
      const share = el('button', { type: 'button', className: 'link-btn', text: t('dedShare') });
      share.addEventListener('click', () => shareDedication(d));
      return el('article', { className: 'postcard' + (d.id === focusId ? ' is-focus' : ''), id: 'ded-' + d.id, lang: d.lang, dir }, [
        el('p', { className: 'postcard-route' }, [
          el('span', {}, [el('b', { text: S.tIn(d.lang, 'dedFrom', d.fromName, d.fromPlace) })]),
          el('span', { text: S.tIn(d.lang, 'dedTo', d.toName, d.toPlace) })
        ]),
        el('p', { className: 'postcard-song', dir: 'auto', text: d.song }),
        d.message ? el('p', { className: 'postcard-msg', dir: 'auto', text: d.message }) : null,
        el('div', { className: 'postcard-foot' }, [
          el('time', { datetime: new Date(d.at).toISOString(), text: S.timeAgo(new Date(d.at).toISOString()) }),
          share
        ])
      ]);
    }));
    if (focusId) {
      const card = $('ded-' + focusId);
      if (card) requestAnimationFrame(() => card.scrollIntoView({ block: 'center' }));
      focusId = null;
    }
  }

  async function shareDedication(d) {
    const url = dedicationLink(d.id);
    const text = t('dedShareText', d.fromName, d.toName);
    if (navigator.share) {
      try { await navigator.share({ title: t('brand'), text, url }); return; }
      catch (err) { if (err && err.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(`${text}\n${url}`); S.toast(t('linkCopied')); }
    catch { S.toast(t('shareFailed')); }
  }

  async function loadWall() {
    try {
      const res = await fetch('/api/dedications');
      if (!res.ok) throw new Error(res.status);
      wall = (await res.json()).items || [];
      wallFailed = false;
    } catch { wallFailed = true; }
    renderWall();
  }

  const form = $('ded-form');
  const count = $('ded-count');
  function updateCount() {
    const n = form.message.value.length;
    count.textContent = `${S.num(n)}/${S.num(240)}`;
  }
  form.message.addEventListener('input', updateCount);

  function startDedication(songText) {
    form.classList.remove('is-done');
    $('ded-done').hidden = true;
    form.song.value = songText;
    $('dedications').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => (form.fromName.value ? form.toName : form.fromName).focus({ preventScroll: true }), 400);
  }

  function showError(code) {
    const errors = t('dedErrors');
    const box = $('ded-error');
    box.textContent = errors[code] || errors.server;
    box.hidden = false;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    $('ded-error').hidden = true;
    const body = {};
    for (const name of ['fromName', 'fromPlace', 'toName', 'toPlace', 'song', 'message']) body[name] = form[name].value.trim();
    if (!body.fromName || !body.toName || !body.song) {
      showError('missing');
      (!body.fromName ? form.fromName : !body.toName ? form.toName : form.song).focus();
      return;
    }
    body.lang = S.lang();
    const btn = $('ded-submit');
    btn.disabled = true;
    btn.textContent = t('dedSending');
    try {
      const res = await fetch('/api/dedications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { showError(data.code); return; }
      // Remember the sender's own details for next time.
      S.store.set('dedFrom', { fromName: body.fromName, fromPlace: body.fromPlace });
      form.song.value = '';
      form.message.value = '';
      updateCount();
      form.classList.add('is-done');
      $('ded-done').hidden = false;
      $('ded-done').focus();
    } catch {
      showError('server');
    } finally {
      btn.disabled = false;
      btn.textContent = t('dedSubmit');
    }
  });

  $('ded-again').addEventListener('click', () => {
    form.classList.remove('is-done');
    $('ded-done').hidden = true;
    form.toName.focus();
  });

  // ================================================================== alerts

  const alertsBtn = $('alerts-btn');
  const alertsNote = $('alerts-note');
  const isIos = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  function b64ToBytes(base64) {
    const pad = '='.repeat((4 - (base64.length % 4)) % 4);
    const raw = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(raw, c => c.charCodeAt(0));
  }

  async function currentSubscription() {
    if (!pushSupported) return null;
    const reg = await navigator.serviceWorker.ready;
    return reg.pushManager.getSubscription();
  }

  let alertsOn = false;
  function renderAlerts() {
    const usable = config.alerts && (pushSupported || isIos);
    alertsBtn.hidden = !usable;
    if (!usable) return;
    alertsBtn.setAttribute('aria-pressed', String(alertsOn));
    $('alerts-label').textContent = alertsOn ? t('alertsActive') : t('alertsOn');
  }

  function note(text) {
    alertsNote.textContent = text;
    alertsNote.hidden = !text;
  }

  alertsBtn.addEventListener('click', async () => {
    note('');
    if (isIos && !standalone) { note(t('alertsIos')); return; }
    if (!pushSupported) { note(t('alertsFailed')); return; }
    alertsBtn.disabled = true;
    try {
      const reg = await navigator.serviceWorker.ready;
      if (alertsOn) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch('/api/alerts/unsubscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) });
          await sub.unsubscribe();
        }
        alertsOn = false;
        S.toast(t('alertsDisabled'));
      } else {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') { note(t('alertsDenied')); return; }
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(config.publicKey) });
        const res = await fetch('/api/alerts/subscribe', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub.toJSON(), lang: S.lang() })
        });
        if (!res.ok) throw new Error(res.status);
        alertsOn = true;
        note(t('alertsEnabled'));
      }
    } catch {
      note(t('alertsFailed'));
    } finally {
      alertsBtn.disabled = false;
      renderAlerts();
    }
  });

  // Keep the alert language in step with the page language.
  async function syncAlertLanguage() {
    if (!alertsOn) return;
    const sub = await currentSubscription().catch(() => null);
    if (sub) fetch('/api/alerts/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription: sub.toJSON(), lang: S.lang() }) }).catch(() => {});
  }

  // ================================================================== section bar

  const nav = $('sections');
  const links = [...nav.querySelectorAll('a')];
  links.forEach(a => a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    target.focus({ preventScroll: true });
    history.replaceState(null, '', a.getAttribute('href'));
  }));
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + entry.target.id)));
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['classics', 'dedications', 'news', 'tv'].forEach(id => spy.observe($(id)));
  }

  // ================================================================== start

  function dedicationFromUrl() {
    const m = location.pathname.match(/^\/d\/([^/]+)/);
    if (m) return decodeURIComponent(m[1]);
    return new URLSearchParams(location.search).get('dedication');
  }

  async function start() {
    renderMoods();
    const saved = S.store.get('dedFrom', null);
    if (saved) { form.fromName.value = saved.fromName || ''; form.fromPlace.value = saved.fromPlace || ''; }
    updateCount();

    try {
      const res = await fetch('/api/config');
      if (res.ok) config = await res.json();
    } catch { /* features stay off */ }

    $('dedications').hidden = !config.dedications;
    $('nav-dedications').hidden = !config.dedications;
    if (config.dedications) {
      focusId = dedicationFromUrl();
      await loadWall();
      renderMoods(); // adds the "dedicate" buttons
      if (dedicationFromUrl()) $('dedications').scrollIntoView({ block: 'start' });
    }

    if (config.alerts) {
      try { alertsOn = Boolean(await currentSubscription()) && Notification.permission === 'granted'; } catch { alertsOn = false; }
    }
    renderAlerts();
  }

  document.addEventListener('sawt:lang', () => { renderMoods(); renderWall(); renderAlerts(); updateCount(); syncAlertLanguage(); });
  document.addEventListener('sawt:stations', renderMoods);
  setInterval(() => { if (!document.hidden && config.dedications) loadWall(); }, 5 * 60 * 1000);

  start();
})();

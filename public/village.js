/* "ضيعتي": pick your village. On the balcony you see its weather (now and the next
   days), dedications sent there, and a button to send one; the morning greeting
   uses its weather too. */
(() => {
  'use strict';
  const S = window.Sawt;
  const $ = id => document.getElementById(id);
  const el = S.el;
  const panel = document.querySelector('.pv[data-panel="window"]');
  if (!panel) return;
  const box = el('section', { className: 'vl', id: 'village' });
  panel.prepend(box);

  const T = {
    ar: {
      title: '🏡 ضيعتي', pick: 'شو ضيعتك؟', ph: 'اكتب اسم الضيعة أو المدينة…', change: 'غيّر', now: 'هلّق', days: ['الأحد', 'الاتنين', 'التلاتا', 'الأربعا', 'الخميس', 'الجمعة', 'السبت'],
      send: n => `💌 ابعت إهداء لـ${n}`, voice: n => `🎙️ رسالة بصوتك لـ${n}`, toHere: n => `إهداءات لـ${n}`, noneHere: 'ما في إهداءات لهون بعد. كون أوّل واحد!', nothing: 'ما لقينا هالاسم. جرّب بالعربي أو بالإنكليزي.',
      from: (a, b) => `${a}${b ? ' من ' + b : ''}`, loading: '…'
    },
    en: {
      title: '🏡 My village', pick: 'Which is your village?', ph: 'Type your village or town…', change: 'Change', now: 'Now', days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      send: n => `💌 Send a dedication to ${n}`, voice: n => `🎙️ A voice message to ${n}`, toHere: n => `Dedications to ${n}`, noneHere: 'No dedications here yet. Be the first!', nothing: 'No place by that name. Try in Arabic or English.',
      from: (a, b) => `${a}${b ? ' from ' + b : ''}`, loading: '…'
    },
    fr: {
      title: '🏡 Mon village', pick: 'Quel est votre village ?', ph: 'Tapez votre village ou votre ville…', change: 'Changer', now: 'Maintenant', days: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
      send: n => `💌 Envoyer une dédicace à ${n}`, voice: n => `🎙️ Un message vocal pour ${n}`, toHere: n => `Dédicaces pour ${n}`, noneHere: 'Pas encore de dédicace ici. Soyez le premier !', nothing: 'Aucun lieu à ce nom. Essayez en arabe ou en anglais.',
      from: (a, b) => `${a}${b ? ' de ' + b : ''}`, loading: '…'
    }
  };
  const t = (k, ...a) => { const v = (T[S.lang()] || T.ar)[k]; return typeof v === 'function' ? v(...a) : v; };
  const ICON = c => c === 0 ? '☀️' : c <= 2 ? '🌤️' : c === 3 ? '☁️' : c <= 48 ? '🌫️' : c <= 67 ? '🌧️' : c <= 77 ? '🌨️' : c <= 82 ? '🌦️' : '⛈️';

  let village = S.store.get('village', null);
  let weather = null, picking = !village, results = [], storeOn = false, wall = null, q = '';

  async function search(text) {
    q = text;
    if (text.trim().length < 2) { results = []; paint(); return; }
    try {
      const r = await fetch(`/api/places?q=${encodeURIComponent(text.trim())}&lang=${S.lang()}`);
      const d = await r.json();
      if (q !== text) return;
      results = d.items || [];
    } catch { results = []; }
    paintResults();
  }
  async function loadWeather() {
    if (!village) return;
    try { const r = await fetch(`/api/weather/at?lat=${village.lat}&lon=${village.lon}`); weather = r.ok ? await r.json() : null; } catch { weather = null; }
    paint();
  }
  async function loadWall() {
    if (!storeOn || !village) return;
    try { const r = await fetch('/api/dedications'); wall = r.ok ? (await r.json()).items || [] : []; } catch { wall = []; }
    paint();
  }
  const norm = s => String(s || '').toLowerCase().replace(/[ًٌٍَُِّْ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/\s+/g, ' ').trim();
  function matches(d) { const p = norm(d.toPlace); return p && (p.includes(norm(village.name)) || norm(village.name).includes(p)); }

  function choose(p) {
    village = { name: p.name, area: p.area, lat: p.lat, lon: p.lon };
    S.store.set('village', village);
    picking = false; results = []; weather = null;
    paint(); loadWeather(); loadWall();
    document.dispatchEvent(new CustomEvent('sawt:village', { detail: village }));
  }
  function resultsEl() {
    if (!q || q.trim().length < 2) return el('div', { className: 'vl-results' });
    if (!results.length) return el('p', { className: 'vl-results quiet small', text: t('nothing') });
    return el('div', { className: 'vl-results' }, results.map(p => {
      const b = el('button', { type: 'button', className: 'vl-r' }, [el('b', { dir: 'auto', text: p.name }), el('span', { dir: 'auto', text: p.area })]);
      b.addEventListener('click', () => choose(p));
      return b;
    }));
  }
  function paintResults() { const old = box.querySelector('.vl-results'); if (old) old.replaceWith(resultsEl()); }
  function paint() {
    const kids = [el('h3', { className: 'pv-sub vl-title', text: t('title') })];
    if (picking || !village) {
      const input = el('input', { type: 'search', className: 'vl-search', placeholder: t('ph'), value: q, 'aria-label': t('pick') });
      let timer = null;
      input.addEventListener('input', () => { clearTimeout(timer); const v = input.value; timer = setTimeout(() => search(v), 250); });
      kids.push(el('p', { className: 'quiet', text: t('pick') }), input, resultsEl());
      box.replaceChildren(...kids);
      return;
    }
    const ch = el('button', { type: 'button', className: 'link-btn', text: t('change') });
    ch.addEventListener('click', () => { picking = true; q = ''; paint(); setTimeout(() => { const i = box.querySelector('input'); if (i) i.focus(); }, 30); });
    kids.push(el('div', { className: 'vl-head' }, [el('b', { className: 'vl-name', dir: 'auto', text: village.name }), el('span', { className: 'quiet small', dir: 'auto', text: village.area || '' }), ch]));
    if (weather) {
      kids.push(el('div', { className: 'vl-now' }, [el('span', { className: 'vl-ic', text: ICON(weather.code) }), el('b', { text: `${S.num(weather.temperature)}°` }), el('span', { text: S.weatherWord ? S.weatherWord(weather.code) : '' })]));
      kids.push(el('div', { className: 'vl-days' }, (weather.days || []).slice(0, 4).map((d, i) => el('div', { className: 'vl-day' }, [
        el('span', { className: 'quiet small', text: i === 0 ? t('now') : t('days')[new Date(d.date + 'T12:00:00').getDay()] }),
        el('span', { className: 'vl-ic', text: ICON(d.code) }),
        el('span', { className: 'small', text: `${S.num(d.max)}° / ${S.num(d.min)}°` })
      ]))));
    } else kids.push(el('p', { className: 'quiet', text: t('loading') }));
    const row = el('div', { className: 'q-row vl-acts' });
    if (storeOn) {
      const b = el('button', { type: 'button', className: 'btn', text: t('send', village.name) });
      b.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('sawt:open', { detail: 'phone' }));
        setTimeout(() => { const f = $('ded-form'); if (f && f.toPlace) { f.toPlace.value = village.name; f.scrollIntoView({ block: 'start' }); } }, 450);
      });
      row.appendChild(b);
    }
    const v = el('button', { type: 'button', className: 'btn', text: t('voice', village.name) });
    v.addEventListener('click', () => document.dispatchEvent(new CustomEvent('sawt:open', { detail: 'phone' })));
    row.appendChild(v);
    kids.push(row);
    if (storeOn && wall) {
      const here = wall.filter(matches).slice(0, 6);
      kids.push(el('h4', { className: 'vl-sub', text: t('toHere', village.name) }));
      kids.push(here.length ? el('div', { className: 'vl-wall' }, here.map(d => el('article', { className: 'postcard', dir: d.lang === 'ar' ? 'rtl' : 'ltr' }, [
        el('p', { className: 'postcard-route' }, [el('b', { text: t('from', d.fromName, d.fromPlace) }), el('span', { text: ' → ' + d.toName })]),
        el('p', { className: 'postcard-song', dir: 'auto', text: d.song }),
        d.message ? el('p', { className: 'postcard-msg', dir: 'auto', text: d.message }) : null
      ].filter(Boolean)))) : el('p', { className: 'quiet small', text: t('noneHere') }));
    }
    box.replaceChildren(...kids);
  }

  document.addEventListener('sawt:config', e => { storeOn = !!(e.detail && e.detail.dedications); loadWall(); paint(); });
  document.addEventListener('sawt:panel', e => { if (e.detail === 'window') { if (!weather) loadWeather(); loadWall(); } });
  document.addEventListener('sawt:lang', paint);
  window.SawtVillage = { get: () => village, weather: () => weather, load: loadWeather };
  paint();
  if (village) loadWeather();
})();

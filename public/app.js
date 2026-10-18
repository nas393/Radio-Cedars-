/* Wardé — Lebanese radio, news and TV for Lebanese abroad. */
(() => {
  'use strict';

  // ------------------------------------------------------------------ text

  const STRINGS = {
    ar: {
      brand: 'وردة',
      skipToNews: 'انتقل إلى الأخبار',
      beirut: 'بيروت',
      yourTime: 'عندك',
      radioHeading: 'راديو لبنان',
      morning: 'صباح الخير. فيروز الصبح؟',
      morningAction: 'شغّل فيروز',
      stations: 'المحطات',
      loadingStations: 'جاري تحميل المحطات…',
      dialHint: 'اسحب المؤشر لتغيير المحطة',
      filterStations: 'تصفية المحطات',
      filterAll: 'كل المحطات',
      filterFav: 'المفضلة',
      filterFairuz: 'فيروز',
      newsHeading: 'أخبار من لبنان',
      refresh: 'تحديث',
      loadingNews: 'جاري تحميل الأخبار…',
      tvHeading: 'تلفزيون مباشر',
      tvNote: 'يفتح البث المباشر على يوتيوب.',
      watchLive: 'شاهد مباشر',
      footer: 'المحطات من دليل Radio Browser المجاني. الأخبار تتجدد كل ١٠ دقائق.',
      play: 'تشغيل',
      stop: 'إيقاف',
      addFav: 'أضف إلى المفضلة',
      removeFav: 'أزل من المفضلة',
      pressPlay: 'اضغط تشغيل للاستماع',
      connecting: 'جاري الاتصال…',
      live: 'مباشر الآن',
      stationDown: 'هذه المحطة لا تبث الآن. جرّب المحطة التالية.',
      stationsFailed: 'تعذّر تحميل المحطات. أعد تحميل الصفحة بعد قليل.',
      noFavs: 'لا مفضلة بعد. اضغط ★ على أي محطة لإضافتها.',
      noFairuz: 'لا توجد محطة فيروز تبث الآن.',
      newsFailed: 'تعذّر تحميل الأخبار. اضغط تحديث للمحاولة مجدداً.',
      sourceDown: 'هذا المصدر لا يستجيب الآن. جرّب مصدراً آخر.',
      noHeadlines: 'لا عناوين جديدة من هذا المصدر.',
      updated: 'آخر تحديث',
      updateFailed: 'لم يتم التحديث. الأخبار المعروضة أقدم.',
      langSwitch: 'English',
      weather: {
        clear: 'صافٍ', partly: 'غائم جزئياً', cloudy: 'غائم', fog: 'ضباب',
        drizzle: 'رذاذ', rain: 'مطر', snow: 'ثلج', showers: 'زخات', storm: 'عاصفة رعدية'
      }
    },
    en: {
      brand: 'Wardé',
      skipToNews: 'Skip to news',
      beirut: 'Beirut',
      yourTime: 'Your time',
      radioHeading: 'Lebanese radio',
      morning: 'Good morning. Fairuz with your coffee?',
      morningAction: 'Play Fairuz',
      stations: 'Stations',
      loadingStations: 'Loading stations…',
      dialHint: 'Drag the dial to change station',
      filterStations: 'Filter stations',
      filterAll: 'All stations',
      filterFav: 'Favourites',
      filterFairuz: 'Fairuz',
      newsHeading: 'News from Lebanon',
      refresh: 'Refresh',
      loadingNews: 'Loading news…',
      tvHeading: 'Live TV',
      tvNote: 'Opens the live broadcast on YouTube.',
      watchLive: 'Watch live',
      footer: 'Stations come from the free Radio Browser directory. News refreshes every 10 minutes.',
      play: 'Play',
      stop: 'Stop',
      addFav: 'Add to favourites',
      removeFav: 'Remove from favourites',
      pressPlay: 'Press play to listen',
      connecting: 'Connecting…',
      live: 'Live now',
      stationDown: 'This station isn’t broadcasting right now. Try the next one.',
      stationsFailed: 'Stations didn’t load. Reload the page in a moment.',
      noFavs: 'No favourites yet. Tap ★ on any station to add it.',
      noFairuz: 'No Fairuz station is broadcasting right now.',
      newsFailed: 'News didn’t load. Press Refresh to try again.',
      sourceDown: 'This source isn’t responding right now. Try another.',
      noHeadlines: 'No new headlines from this source.',
      updated: 'Updated',
      updateFailed: 'Couldn’t refresh. Showing earlier headlines.',
      langSwitch: 'العربية',
      weather: {
        clear: 'Clear', partly: 'Partly cloudy', cloudy: 'Cloudy', fog: 'Fog',
        drizzle: 'Drizzle', rain: 'Rain', snow: 'Snow', showers: 'Showers', storm: 'Thunderstorm'
      }
    }
  };

  const TV = [
    { name: 'LBCI', handle: 'lbcilebanonofficial' },
    { name: 'MTV Lebanon', handle: 'mtvlebanon' },
    { name: 'Al Jadeed', handle: 'aljadeednewslb' },
    { name: 'OTV', handle: 'otvlebanonofficial' }
  ];

  const FAIRUZ = /fair[uo]+z|fayrouz|فيروز|رحبان/i;
  const NEWS_REFRESH_MS = 10 * 60 * 1000;
  const STALL_MS = 15000;

  // ------------------------------------------------------------------ helpers

  const $ = id => document.getElementById(id);

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem('warde:' + key); return v === null ? fallback : JSON.parse(v); }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('warde:' + key, JSON.stringify(value)); } catch { /* private mode */ }
    }
  };

  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'text') node.textContent = v;
      else if (k === 'className') node.className = v;
      else node.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children) if (c) node.append(c);
    return node;
  }

  let lang = store.get('lang', 'ar');
  const t = key => STRINGS[lang][key];
  const locale = () => (lang === 'ar' ? 'ar-LB' : 'en-GB');

  function timeAgo(iso) {
    if (!iso) return '';
    const rtf = new Intl.RelativeTimeFormat(locale(), { numeric: 'auto' });
    const min = Math.round((new Date(iso) - Date.now()) / 60000);
    if (Math.abs(min) < 60) return rtf.format(min, 'minute');
    const hr = Math.round(min / 60);
    if (Math.abs(hr) < 24) return rtf.format(hr, 'hour');
    return rtf.format(Math.round(hr / 24), 'day');
  }

  // ------------------------------------------------------------------ language

  function applyLanguage() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = lang === 'ar' ? 'وردة · راديو لبنان وأخبار لبنان' : 'Wardé · Lebanese radio, news and TV';
    document.querySelectorAll('[data-i18n]').forEach(n => { n.textContent = t(n.dataset.i18n); });
    document.querySelectorAll('[data-i18n-label]').forEach(n => n.setAttribute('aria-label', t(n.dataset.i18nLabel)));
    const toggle = $('lang-toggle');
    toggle.textContent = t('langSwitch');
    toggle.lang = lang === 'ar' ? 'en' : 'ar';
    updateClocks();
    renderWeather();
    renderTV();
    renderPowerAndFav();
    renderStatus();
    renderNews();
  }

  $('lang-toggle').addEventListener('click', () => {
    lang = lang === 'ar' ? 'en' : 'ar';
    store.set('lang', lang);
    applyLanguage();
    // The dial's reading direction flips with the page; keep the needle on the same station.
    requestAnimationFrame(() => centreOn(selected, false));
  });

  // ------------------------------------------------------------------ clocks + weather

  const beirutFmt = () => new Intl.DateTimeFormat(locale(), { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Beirut' });
  const localFmt = () => new Intl.DateTimeFormat(locale(), { hour: 'numeric', minute: '2-digit' });

  function beirutHour() {
    return Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Beirut' }).format(new Date()));
  }

  function sameZoneAsBeirut() {
    const now = new Date();
    const fmt = tz => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: tz }).format(now);
    return fmt('Asia/Beirut') === fmt(undefined);
  }

  function updateClocks() {
    const now = new Date();
    $('beirut-time').textContent = beirutFmt().format(now);
    const showLocal = !sameZoneAsBeirut();
    $('local-clock').hidden = !showLocal;
    if (showLocal) $('local-time').textContent = localFmt().format(now);
    updateMorning();
  }
  setInterval(updateClocks, 15000);

  let weather = null;
  function weatherWord(code) {
    const w = t('weather');
    if (code === 0) return w.clear;
    if (code <= 2) return w.partly;
    if (code === 3) return w.cloudy;
    if (code === 45 || code === 48) return w.fog;
    if (code >= 51 && code <= 57) return w.drizzle;
    if (code >= 61 && code <= 67) return w.rain;
    if (code >= 71 && code <= 77) return w.snow;
    if (code >= 80 && code <= 86) return w.showers;
    if (code >= 95) return w.storm;
    return '';
  }
  function renderWeather() {
    const node = $('weather');
    if (!weather) { node.hidden = true; return; }
    const temp = new Intl.NumberFormat(locale()).format(weather.temperature);
    node.textContent = `${temp}° ${weatherWord(weather.code)}`.trim();
    node.hidden = false;
  }
  fetch('/api/weather').then(r => (r.ok ? r.json() : null)).then(d => { weather = d; renderWeather(); }).catch(() => {});

  // ------------------------------------------------------------------ radio state

  const audio = $('audio');
  const dial = $('dial');
  let stations = [];
  let visible = [];          // stations after the current filter
  let selected = -1;         // index into `visible`
  let filter = 'all';
  let powerOn = false;
  let status = 'idle';       // idle | connecting | live | error
  let stallTimer = null;
  let tuneTimer = null;
  const favs = new Set(store.get('favs', []));
  const offline = new Set();

  const current = () => visible[selected] || null;

  function renderPowerAndFav() {
    const power = $('power');
    power.setAttribute('aria-pressed', String(powerOn));
    power.setAttribute('aria-label', powerOn ? t('stop') : t('play'));
    const st = current();
    const fav = $('fav');
    const isFav = !!st && favs.has(st.id);
    fav.disabled = !st;
    fav.setAttribute('aria-pressed', String(isFav));
    fav.setAttribute('aria-label', isFav ? t('removeFav') : t('addFav'));
  }

  function renderStatus() {
    const node = $('station-status');
    node.className = 'station-status';
    if (status === 'live') { node.textContent = t('live'); node.classList.add('is-live'); }
    else if (status === 'connecting') node.textContent = t('connecting');
    else if (status === 'error') { node.textContent = t('stationDown'); node.classList.add('is-error'); }
    else node.textContent = current() ? t('pressPlay') : '';
    document.querySelector('.set').classList.toggle('is-playing', status === 'live');
  }

  function setStatus(next) { status = next; renderStatus(); }

  function renderStationName() {
    const st = current();
    $('station-name').textContent = st ? st.name : '…';
  }

  // ------------------------------------------------------------------ static between stations

  let audioCtx = null;
  function tuningStatic() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const len = Math.floor(audioCtx.sampleRate * 0.35);
      const buffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = audioCtx.createBufferSource();
      src.buffer = buffer;
      const band = audioCtx.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = 1700;
      band.Q.value = 0.7;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      src.connect(band).connect(gain).connect(audioCtx.destination);
      src.start();
    } catch { /* audio context not allowed yet: stay silent */ }
  }

  // ------------------------------------------------------------------ playback

  function startStream() {
    const st = current();
    if (!st) return;
    clearTimeout(stallTimer);
    setStatus('connecting');
    audio.src = st.url;
    audio.play().catch(err => {
      if (err && err.name === 'NotAllowedError') { powerOn = false; renderPowerAndFav(); setStatus('idle'); }
    });
    stallTimer = setTimeout(() => { if (status === 'connecting') markDown(); }, STALL_MS);
    updateMediaSession();
  }

  function stopStream() {
    clearTimeout(stallTimer);
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    setStatus('idle');
  }

  function markDown() {
    const st = current();
    if (st) offline.add(st.id);
    clearTimeout(stallTimer);
    audio.pause();
    setStatus('error');
    renderDial();
  }

  audio.addEventListener('playing', () => { clearTimeout(stallTimer); setStatus('live'); });
  audio.addEventListener('waiting', () => { if (powerOn) setStatus('connecting'); });
  audio.addEventListener('error', () => { if (powerOn && audio.getAttribute('src')) markDown(); });

  function setPower(on) {
    powerOn = on;
    renderPowerAndFav();
    if (on) startStream(); else stopStream();
  }

  $('power').addEventListener('click', () => setPower(!powerOn));

  $('fav').addEventListener('click', () => {
    const st = current();
    if (!st) return;
    if (favs.has(st.id)) favs.delete(st.id); else favs.add(st.id);
    store.set('favs', [...favs]);
    renderPowerAndFav();
    renderDial();
  });

  // ------------------------------------------------------------------ media session (lock screen)

  function updateMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const st = current();
    if (!st) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: st.name,
        artist: lang === 'ar' ? 'وردة · راديو لبنان' : 'Wardé · Lebanese radio',
        artwork: [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }]
      });
    } catch { /* older browsers */ }
  }
  if ('mediaSession' in navigator) {
    const ms = navigator.mediaSession;
    const safe = (action, fn) => { try { ms.setActionHandler(action, fn); } catch { /* unsupported */ } };
    safe('play', () => setPower(true));
    safe('pause', () => setPower(false));
    safe('stop', () => setPower(false));
    safe('nexttrack', () => step(1));
    safe('previoustrack', () => step(-1));
  }

  // ------------------------------------------------------------------ the dial

  function applyFilter() {
    if (filter === 'fav') visible = stations.filter(s => favs.has(s.id));
    else if (filter === 'fairuz') visible = stations.filter(s => FAIRUZ.test(s.name) || FAIRUZ.test(s.tags || ''));
    else visible = stations.slice();
  }

  function renderDial() {
    if (!stations.length) return;
    const ticks = visible.map((s, i) => el('button', {
      type: 'button',
      role: 'option',
      className: 'tick' + (favs.has(s.id) ? ' is-fav' : '') + (offline.has(s.id) ? ' is-offline' : ''),
      'aria-selected': String(i === selected),
      'data-i': String(i),
      id: 'station-' + i,
      tabindex: '-1'
    }, [el('span', { text: s.name, dir: 'auto' })]));

    if (!ticks.length) {
      const msg = filter === 'fav' ? t('noFavs') : t('noFairuz');
      dial.replaceChildren(el('p', { className: 'dial-loading', text: msg }));
      return;
    }
    dial.replaceChildren(el('div', { className: 'dial-spacer' }), ...ticks, el('div', { className: 'dial-spacer' }));
  }

  function tickAt(i) { return dial.querySelector(`.tick[data-i="${i}"]`); }

  function centreOn(i, smooth = true) {
    const tick = tickAt(i);
    if (!tick) return;
    const box = dial.getBoundingClientRect();
    const tb = tick.getBoundingClientRect();
    const delta = (tb.left + tb.width / 2) - (box.left + box.width / 2);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    dial.scrollBy({ left: delta, behavior: smooth && !reduce ? 'smooth' : 'auto' });
  }

  function nearestTick() {
    const box = dial.getBoundingClientRect();
    const mid = box.left + box.width / 2;
    let best = -1, bestDist = Infinity;
    dial.querySelectorAll('.tick').forEach(tick => {
      const r = tick.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - mid);
      if (d < bestDist) { bestDist = d; best = Number(tick.dataset.i); }
    });
    return best;
  }

  function highlight(i) {
    dial.querySelectorAll('.tick').forEach(tick => tick.setAttribute('aria-selected', String(Number(tick.dataset.i) === i)));
  }

  // Selecting a station: what turning the knob does.
  function select(i, { tune = true } = {}) {
    if (i < 0 || i >= visible.length) return;
    const changed = i !== selected;
    selected = i;
    highlight(i);
    renderStationName();
    renderPowerAndFav();
    dial.setAttribute('aria-activedescendant', 'station-' + i);
    store.set('last', visible[i].id);
    if (!changed) return;
    if (powerOn && tune) {
      tuningStatic();
      clearTimeout(tuneTimer);
      tuneTimer = setTimeout(startStream, 380);
    } else if (status === 'error') {
      setStatus('idle');
    } else {
      renderStatus();
    }
    updateMediaSession();
  }

  function step(dir) {
    if (!visible.length) return;
    const next = Math.min(visible.length - 1, Math.max(0, selected + dir));
    select(next);
    centreOn(next);
  }

  // Scrolling the scale = turning the knob. Settle on the nearest station.
  let scrollTimer = null;
  let frame = 0;
  dial.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => highlight(nearestTick()));
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => { if (!dragging) select(nearestTick()); }, 140);
  }, { passive: true });

  dial.addEventListener('click', e => {
    const tick = e.target.closest('.tick');
    if (!tick || movedWhileDragging) return;
    const i = Number(tick.dataset.i);
    select(i);
    centreOn(i);
  });

  // Mouse drag (touch already scrolls natively)
  let dragging = false, movedWhileDragging = false, dragX = 0, dragStart = 0;
  dial.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    dragging = true; movedWhileDragging = false;
    dragX = e.clientX; dragStart = dial.scrollLeft;
    dial.classList.add('is-dragging');
  });
  window.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - dragX;
    if (Math.abs(dx) > 4) movedWhileDragging = true;
    dial.scrollLeft = dragStart - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    dial.classList.remove('is-dragging');
    const i = nearestTick();
    select(i);
    centreOn(i);
    setTimeout(() => { movedWhileDragging = false; }, 0);
  });

  // Keyboard: arrows follow what the eye sees, in either reading direction.
  dial.addEventListener('keydown', e => {
    const rtl = document.documentElement.dir === 'rtl';
    if (e.key === 'ArrowRight') { e.preventDefault(); step(rtl ? -1 : 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(rtl ? 1 : -1); }
    else if (e.key === 'Home') { e.preventDefault(); select(0); centreOn(0); }
    else if (e.key === 'End') { e.preventDefault(); select(visible.length - 1); centreOn(visible.length - 1); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setPower(!powerOn); }
  });

  // Filters
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      filter = chip.dataset.filter;
      document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
      const keepId = current() && current().id;
      applyFilter();
      let i = visible.findIndex(s => s.id === keepId);
      const keep = i !== -1;
      if (!keep) i = visible.length ? 0 : -1;
      selected = -1;
      renderDial();
      if (i !== -1) {
        select(i, { tune: !keep });
        requestAnimationFrame(() => centreOn(i, false));
      } else {
        renderStationName();
        renderPowerAndFav();
      }
    });
  });

  // Fairuz in the morning (Beirut time)
  function fairuzIndex() { return stations.findIndex(s => FAIRUZ.test(s.name)); }
  function updateMorning() {
    const h = beirutHour();
    $('morning').hidden = !(h >= 6 && h < 10 && fairuzIndex() !== -1 && !(powerOn && current() && FAIRUZ.test(current().name)));
  }
  $('morning-btn').addEventListener('click', () => {
    const target = stations[fairuzIndex()];
    if (!target) return;
    if (filter !== 'all') document.querySelector('.chip[data-filter="all"]').click();
    const i = visible.findIndex(s => s.id === target.id);
    select(i, { tune: false });
    centreOn(i);
    setPower(true);
    updateMorning();
  });

  async function loadStations() {
    try {
      const res = await fetch('/api/radio');
      if (!res.ok) throw new Error(res.status);
      stations = (await res.json()).stations || [];
      applyFilter();
      renderDial();
      const last = store.get('last', null);
      let i = visible.findIndex(s => s.id === last);
      if (i === -1) i = 0;
      select(i, { tune: false });
      requestAnimationFrame(() => centreOn(i, false));
      renderStatus();
      updateMorning();
    } catch {
      dial.replaceChildren(el('p', { className: 'dial-loading', text: t('stationsFailed') }));
    }
  }

  // ------------------------------------------------------------------ news

  let news = null;
  let newsFailed = false;
  let activeSource = null;
  let lastNewsLoad = 0;

  function defaultSource() {
    if (!news) return null;
    const wanted = lang === 'ar' ? /arabic/i : /english/i;
    const good = news.sources.filter(s => s.ok && s.items.length);
    return (good.find(s => wanted.test(s.source)) || good[0] || news.sources[0] || {}).source || null;
  }

  function shortName(source) { return source.replace(/\s*\((Arabic|English)\)\s*$/i, ''); }

  function renderNews() {
    const tabs = $('news-tabs');
    const list = $('headlines');
    if (!news) {
      if (newsFailed) list.replaceChildren(el('p', { className: 'error', text: t('newsFailed') }));
      return;
    }
    if (!news.sources.some(s => s.source === activeSource)) activeSource = defaultSource();

    tabs.replaceChildren(...news.sources.map(s => {
      const tab = el('button', {
        type: 'button',
        role: 'tab',
        className: 'tab' + (s.ok ? '' : ' is-down'),
        'aria-selected': String(s.source === activeSource),
        tabindex: s.source === activeSource ? '0' : '-1',
        text: shortName(s.source)
      });
      tab.addEventListener('click', () => { activeSource = s.source; renderNews(); });
      return tab;
    }));

    const src = news.sources.find(s => s.source === activeSource);
    const isArabic = src && /arabic/i.test(src.source);
    if (!src || !src.ok) {
      list.replaceChildren(el('p', { className: 'quiet', text: t('sourceDown') }));
    } else if (!src.items.length) {
      list.replaceChildren(el('p', { className: 'quiet', text: t('noHeadlines') }));
    } else {
      list.replaceChildren(...src.items.map(item => el('a', {
        className: 'headline',
        href: item.link,
        target: '_blank',
        rel: 'noopener noreferrer',
        lang: isArabic ? 'ar' : 'en',
        dir: isArabic ? 'rtl' : 'ltr'
      }, [
        el('span', { className: 'headline-title', text: item.title }),
        item.date ? el('time', { datetime: item.date, text: timeAgo(item.date), lang, dir: lang === 'ar' ? 'rtl' : 'ltr' }) : null
      ])));
    }
    $('news-updated').textContent = newsFailed ? t('updateFailed') : `${t('updated')} ${timeAgo(news.updatedAt)}`;
  }

  // Arrow keys move between tabs
  $('news-tabs').addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const tabs = [...$('news-tabs').querySelectorAll('.tab')];
    const at = tabs.indexOf(document.activeElement);
    if (at === -1) return;
    const rtl = document.documentElement.dir === 'rtl';
    const forward = (e.key === 'ArrowLeft') === rtl;
    const next = tabs[(at + (forward ? 1 : -1) + tabs.length) % tabs.length];
    next.click();
    $('news-tabs').querySelectorAll('.tab')[tabs.indexOf(next)].focus();
  });

  async function loadNews() {
    const btn = $('news-refresh');
    btn.disabled = true;
    lastNewsLoad = Date.now();
    try {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error(res.status);
      news = await res.json();
      newsFailed = false;
    } catch {
      newsFailed = true;
    } finally {
      btn.disabled = false;
      renderNews();
    }
  }
  $('news-refresh').addEventListener('click', loadNews);
  function loadNewsIfStale() { if (!document.hidden && Date.now() - lastNewsLoad >= NEWS_REFRESH_MS) loadNews(); }
  setInterval(loadNewsIfStale, 60000);
  document.addEventListener('visibilitychange', () => { loadNewsIfStale(); if (!document.hidden) updateClocks(); });

  // ------------------------------------------------------------------ tv

  function renderTV() {
    $('channels').replaceChildren(...TV.map(ch => el('li', { className: 'channel' }, [
      el('a', { href: `https://www.youtube.com/@${ch.handle}/live`, target: '_blank', rel: 'noopener noreferrer' }, [
        el('span', { className: 'channel-name', text: ch.name, lang: 'en', dir: 'ltr' }),
        el('span', { className: 'channel-live', text: t('watchLive') })
      ])
    ])));
  }

  // ------------------------------------------------------------------ start

  applyLanguage();
  loadStations();
  loadNews();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
})();

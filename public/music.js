/* The screen: one player for everything that plays inside the room.
   - the TV's live channels (YouTube live)
   - the cassettes (YouTube playlists, full songs for everyone; Spotify as
     the second choice, full songs for people logged in to Spotify)
   While its object's drawer is open the player sits at the top of it; when
   the drawer closes it keeps playing in a small screen above the radio bar.
   Starting a tape switches the radio off, and switching the radio on pauses
   the tape. */
(() => {
  'use strict';

  const S = window.Sawt;
  const $ = id => document.getElementById(id);
  const el = S.el;

  const CHANNELS = {
    'LBCI': 'UCpE6gpKewomi17XDyPfpFjA',
    'MTV Lebanon': 'UCnkTo_wMqGtLiA4xX7roORg',
    'Al Jadeed': 'UC4JCsTLFcHGk10qpiNMh0Ww',
    'OTV': 'UCJu-0vnWt0wFMQuLsjzwjRQ'
  };

  const W = {
    ar: { close: 'سكّر', youtube: 'يوتيوب', spotify: 'سبوتيفاي', onYouTube: 'افتح على يوتيوب', onSpotify: 'افتح على سبوتيفاي', live: 'مباشر', tape: 'كاسيت', spotifyNote: 'على سبوتيفاي: الأغاني كاملة إذا كنت مسجّل دخول، وإلا ٣٠ ثانية من كل أغنية.', expand: 'كبّر', onTv: 'شوف عالتلفزيون' },
    en: { close: 'Close', youtube: 'YouTube', spotify: 'Spotify', onYouTube: 'Open on YouTube', onSpotify: 'Open in Spotify', live: 'Live', tape: 'Tape', spotifyNote: 'On Spotify: full songs if you’re logged in to Spotify in this browser, 30-second previews otherwise.', expand: 'Expand', onTv: 'Watch on the TV' },
    fr: { close: 'Fermer', youtube: 'YouTube', spotify: 'Spotify', onYouTube: 'Ouvrir sur YouTube', onSpotify: 'Ouvrir dans Spotify', live: 'Direct', tape: 'Cassette', spotifyNote: 'Sur Spotify : titres complets si vous êtes connecté à Spotify dans ce navigateur, sinon extraits de 30 secondes.', expand: 'Agrandir', onTv: 'Regarder sur la télé' }
  };
  const w = k => (W[S.lang()] || W.ar)[k];

  // ------------------------------------------------------------------ the player element
  const player = el('div', { className: 'screen', id: 'screen', hidden: true, role: 'region' }, [
    el('div', { className: 'screen-head' }, [
      el('span', { className: 'screen-dot' }),
      el('span', { className: 'screen-title', id: 'screen-title' }),
      el('span', { className: 'screen-src', id: 'screen-src', role: 'group' }),
      el('a', { className: 'screen-out', id: 'screen-out', target: '_blank', rel: 'noopener noreferrer' }),
      el('button', { type: 'button', className: 'screen-btn screen-tv', id: 'screen-tv' }),
      el('button', { type: 'button', className: 'screen-btn', id: 'screen-expand' }),
      el('button', { type: 'button', className: 'screen-btn', id: 'screen-close' })
    ]),
    el('div', { className: 'screen-body', id: 'screen-body' }),
    el('p', { className: 'screen-note', id: 'screen-note', hidden: true })
  ]);
  document.body.appendChild(player);
  const setOff = el('button', { type: 'button', className: 'onset-off', id: 'onset-off', hidden: true });
  document.body.appendChild(setOff);
  setOff.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v8M6.3 6.8a8 8 0 1 0 11.4 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  $('screen-close').innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  $('screen-tv').innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 3l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  $('screen-expand').innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  let current = null;       // { kind: 'live'|'tape', src: 'yt'|'sp', mood, channel, name, home: 'tv'|'cassettes' }
  let spController = null;  // Spotify iFrame API controller

  // ------------------------------------------------------------------ Spotify iFrame API (loaded on first use)
  let spApi = null, spWaiters = [];
  function spotifyApi() {
    if (spApi) return Promise.resolve(spApi);
    return new Promise(resolve => {
      spWaiters.push(resolve);
      if (spWaiters.length > 1) return;
      window.onSpotifyIframeApiReady = api => { spApi = api; spWaiters.splice(0).forEach(f => f(api)); };
      const s = document.createElement('script');
      s.src = 'https://open.spotify.com/embed/iframe-api/v1';
      s.async = true;
      s.onerror = () => spWaiters.splice(0).forEach(f => f(null));
      document.head.appendChild(s);
      setTimeout(() => { if (!spApi) spWaiters.splice(0).forEach(f => f(null)); }, 5000);
    });
  }

  // ------------------------------------------------------------------ playing
  function ytSrc(c) {
    const base = 'https://www.youtube-nocookie.com/embed/';
    const common = 'autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&origin=' + encodeURIComponent(location.origin) + '&hl=' + S.lang();
    return `${base}videoseries?list=${c.mood.yt}&${common}`;
  }
  function outLink(c) {
    if (c.src === 'sp') return `https://open.spotify.com/playlist/${c.mood.spotify}`;
    return `https://www.youtube.com/playlist?list=${c.mood.yt}`;
  }

  function radioOff() { if (S.isOn()) S.setPower(false); }

  function stopMedia() {
    if (spController) { try { spController.destroy(); } catch { /* gone */ } spController = null; }
    $('screen-body').replaceChildren();
  }

  async function mount() {
    stopMedia();
    const c = current;
    const body = $('screen-body');
    player.dataset.src = c.src;
    player.dataset.kind = c.kind;
    renderHead();
    if (c.src === 'yt') {
      const f = el('iframe', {
        title: c.name,
        allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
        referrerPolicy: 'strict-origin-when-cross-origin'
      });
      f.setAttribute('allowfullscreen', '');
      f.src = ytSrc(c);
      body.appendChild(f);
    } else {
      const host = el('div', { className: 'sp-host' });
      body.appendChild(host);
      const api = await spotifyApi();
      if (current !== c) return;
      if (api) {
        api.createController(host, { uri: `spotify:playlist:${c.mood.spotify}`, width: '100%', height: 152, theme: 'dark' }, ctrl => {
          spController = ctrl;
          ctrl.addListener('playback_update', e => { if (e && e.data && !e.data.isPaused) radioOff(); });
          try { ctrl.play(); } catch { /* the listener presses play */ }
        });
      } else {
        const f = el('iframe', { title: c.name, allow: 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture', loading: 'lazy' });
        f.src = `https://open.spotify.com/embed/playlist/${c.mood.spotify}?utm_source=generator&theme=0`;
        f.style.height = '152px';
        body.appendChild(f);
      }
    }
    $('screen-note').hidden = c.src !== 'sp';
    $('screen-note').textContent = w('spotifyNote');
    document.querySelectorAll('.tape').forEach(t => t.classList.toggle('is-playing', !!(c.mood && t.dataset.id === c.mood.id)));
    document.querySelectorAll('#channels .channel').forEach(li => li.classList.toggle('is-playing', c.kind === 'live' && li.dataset.channel === c.channel));
  }

  function renderHead() {
    const c = current;
    if (!c) return;
    $('screen-title').textContent = c.name;
    const src = $('screen-src');
    if (c.kind === 'tape' && c.mood.spotify) {
      src.replaceChildren(...['yt', 'sp'].map(k => {
        const b = el('button', { type: 'button', className: 'screen-tab', text: k === 'yt' ? w('youtube') : w('spotify') });
        b.setAttribute('aria-pressed', String(c.src === k));
        b.addEventListener('click', () => { if (c.src !== k) { c.src = k; mount(); } });
        return b;
      }));
    } else {
      src.replaceChildren(el('span', { className: 'screen-live', text: c.kind === 'live' ? w('live') : w('youtube') }));
    }
    const out = $('screen-out');
    out.href = outLink(c);
    out.textContent = c.src === 'sp' ? w('onSpotify') : w('onYouTube');
    $('screen-close').setAttribute('aria-label', w('close'));
    $('screen-tv').hidden = !(window.SawtTV && c.kind === 'tape' && c.src === 'yt');
    $('screen-tv').setAttribute('aria-label', w('onTv'));
    setOff.setAttribute('aria-label', w('close'));
    $('screen-expand').setAttribute('aria-label', w('expand'));
    player.setAttribute('aria-label', c.name);
  }

  function play(c) {
    radioOff();
    current = c;
    player.hidden = false;
    mount();
    place();
    document.dispatchEvent(new CustomEvent('sawt:screen', { detail: c }));
  }

  function close() {
    stopMedia();
    pill = false; player.classList.remove('is-pill');
    setOff.hidden = true;
    player.classList.remove('on-set'); player.style.transform = '';
    ['tv-slot', 'tape-slot'].forEach(id => { const n = $(id); if (n) n.style.height = ''; });
    current = null;
    player.hidden = true;
    player.classList.remove('is-big');
    document.querySelectorAll('.tape.is-playing, #channels .is-playing').forEach(t => t.classList.remove('is-playing'));
    document.dispatchEvent(new CustomEvent('sawt:screen', { detail: null }));
  }
  $('screen-close').addEventListener('click', close);
  setOff.addEventListener('click', close);
  // put the picture on the TV in the room: close the drawer, turn and zoom to the set
  $('screen-tv').addEventListener('click', () => {
    if (!current || !window.SawtTV || current.kind !== 'tape') return;
    const mood = current.mood;
    close();
    window.SawtTV.playTape(mood);
    if ($('sheet').classList.contains('is-open')) $('sheet-close').click();
    setTimeout(() => window.SawtRoom && window.SawtRoom.focusTv(), 340);
  });
  $('screen-expand').addEventListener('click', () => { player.classList.toggle('is-big'); place(); });

  // The radio and the screen never talk over each other.
  $('audio').addEventListener('play', () => {
    if (!current) return;
    if (current.src === 'yt') {
      const f = $('screen-body').querySelector('iframe');
      if (f && f.contentWindow) f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*');
    } else if (spController) {
      try { spController.pause(); } catch { /* fine */ }
    }
  });

  // ------------------------------------------------------------------ the folded bar on phones
  let pill = false;
  function ytCommand(func) {
    const f = $('screen-body').querySelector('iframe');
    if (f && f.contentWindow) f.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: '' }), '*');
  }
  function setPill(v) {
    if (v === pill) return;
    pill = v;
    player.classList.toggle('is-pill', v);
    // YouTube must stay visible while it plays: pause it while folded, play again when it opens up
    if (current && current.src === 'yt') ytCommand(v ? 'pauseVideo' : 'playVideo');
  }
  player.querySelector('.screen-head').addEventListener('click', e => {
    if (!pill || e.target.closest('button, a')) return;
    $('sheet-close').click();
  });

  // ------------------------------------------------------------------ where the screen sits
  function place() {
    if (!current) return;
    const sheet = $('sheet');
    const home = current.home;
    const slot = $(home === 'tv' ? 'tv-slot' : 'tape-slot');
    const docked = !player.classList.contains('is-big') && sheet.classList.contains('is-open') && sheet.dataset.panel === home && slot && slot.offsetParent;
    player.classList.toggle('is-docked', !!docked);
    // on the TV set itself, when the TV is big enough on screen (YouTube needs at least 200×200 px)
    let onSet = false;
    if (!docked && current.onSet && window.SawtRoom && window.SawtRoom.inRoom() && !$('sheet').classList.contains('is-open') && !player.classList.contains('is-big')) {
      const pts = window.SawtRoom.tvCorners().map(p => window.SawtRoom.project(p[0], p[1]));
      if (pts.every(p => p.front)) {
        const q = window.SawtRoom.orderQuad(pts);
        const wq = Math.min(q[1][0] - q[0][0], q[2][0] - q[3][0]);
        const hq = Math.min(q[3][1] - q[0][1], q[2][1] - q[1][1]);
        if (wq >= 266 && hq >= 200) {
          onSet = true;
          player.style.left = '0px'; player.style.top = '0px'; player.style.width = '400px';
          player.style.transform = window.SawtRoom.quadTransform(400, 300, q);
          setOff.hidden = false;
          setOff.style.transform = `translate(${(q[2][0] + q[3][0]) / 2 - 22}px, ${Math.max(q[2][1], q[3][1]) + 10}px)`;
        }
      }
    }
    player.classList.toggle('on-set', onSet);
    if (!onSet) { player.style.transform = ''; setOff.hidden = true; }
    if (onSet) { setPill(false); return; }
    // phones: another drawer is open, so the screen folds into a slim bar at the top
    setPill(!docked && innerWidth < 900 && $('sheet').classList.contains('is-open'));
    if (docked) {
      const r = slot.getBoundingClientRect();
      player.style.left = r.left + 'px';
      player.style.top = r.top + 'px';
      player.style.width = r.width + 'px';
      slot.style.height = player.offsetHeight + 'px';
    } else {
      player.style.left = player.style.top = player.style.width = '';
      if (slot) slot.style.height = '';
    }
  }
  // Keep the screen glued to its slot while a drawer is open (cheap: one rect read per frame).
  (function follow() {
    if (current && ($('sheet').classList.contains('is-open') || current.onSet)) place();
    requestAnimationFrame(follow);
  })();
  new MutationObserver(place).observe($('sheet'), { attributes: true, attributeFilter: ['class', 'data-panel', 'hidden'] });
  window.addEventListener('resize', place);
  $('sheet-body').addEventListener('scroll', place, { passive: true });

  // ------------------------------------------------------------------ wiring the TV and the tapes
  // the TV channels play on the set itself (tvset.js)
  document.addEventListener('sawt:lang', () => { renderHead(); if (current && current.kind === 'tape') current.name = current.mood[S.lang()] || current.mood.en; renderHead(); });

  window.SawtScreen = {
    playTape(mood, src) {
      play({ kind: 'tape', src: src || 'yt', mood, name: mood[S.lang()] || mood.en, home: 'cassettes' });
    },
    playLive(id) { if (window.SawtTV) window.SawtTV.tune(id); },
    close,
    place,
    current: () => current
  };
})();

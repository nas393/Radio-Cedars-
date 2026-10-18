/* The TV set in the room. Once it is on, the live channel plays on the set itself
   and stays there: opening other things, looking around, playing the radio, none of
   it switches it off (the sound steps aside when the radio or a tape plays).
   On the side of the set: the power button, a volume knob that turns like the old
   ones, and the channel buttons. */
(() => {
  'use strict';
  const S = window.Sawt;
  const $ = id => document.getElementById(id);
  const el = S.el;

  const CHANNELS = [
    { id: 'UCpE6gpKewomi17XDyPfpFjA', name: 'LBCI' },
    { id: 'UCnkTo_wMqGtLiA4xX7roORg', name: 'MTV Lebanon' },
    { id: 'UC4JCsTLFcHGk10qpiNMh0Ww', name: 'Al Jadeed' },
    { id: 'UCJu-0vnWt0wFMQuLsjzwjRQ', name: 'OTV' }
  ];
  const T = {
    ar: { power: 'شغّل / طفّي التلفزيون', vol: 'الصوت', up: 'القناة اللي بعد', down: 'القناة اللي قبل', big: 'كبّر الشاشة', small: 'رجّع الشاشة', muted: 'الصوت مسكّر لأنو الراديو شغّال', on: 'شغّل التلفزيون', off: 'طفّي التلفزيون', tapHint: 'دوّر الزرّ للصوت', tape: 'شريط' },
    en: { power: 'TV on / off', vol: 'Volume', up: 'Next channel', down: 'Previous channel', big: 'Big screen', small: 'Back to the set', muted: 'Muted while the radio plays', on: 'Turn the TV on', off: 'Turn the TV off', tapHint: 'Turn the knob for sound', tape: 'Tape' },
    fr: { power: 'Allumer / éteindre la télé', vol: 'Volume', up: 'Chaîne suivante', down: 'Chaîne précédente', big: 'Grand écran', small: 'Revenir au poste', muted: 'Son coupé pendant la radio', on: 'Allumer la télé', off: 'Éteindre la télé', tapHint: 'Tournez le bouton pour le son', tape: 'Cassette' }
  };
  const t = k => (T[S.lang()] || T.ar)[k];

  let on = S.store.get('tvOn', true);
  let ch = S.store.get('tvChannel', CHANNELS[0].id);
  let vol = S.store.get('tvVolume', 40);
  let tape = null;                   // a YouTube playlist shown on the set instead of a channel
  let ducked = false;
  let gestured = false;
  let big = false;
  let iframe = null, ready = false;

  // ------------------------------------------------------------------ the picture on the set
  const set = el('div', { className: 'tvset', id: 'tvset', hidden: true, 'aria-hidden': 'true' });
  const screen = el('div', { className: 'tv-screen' });
  const glass = el('div', { className: 'tv-glass' });
  const snow = el('div', { className: 'tv-snow' });
  const osd = el('div', { className: 'tv-osd' });
  const volOsd = el('div', { className: 'tv-vol' });
  set.append(screen, snow, glass, osd, volOsd);
  const room = $('room');
  room.insertBefore(set, $('hotspots'));

  // ------------------------------------------------------------------ the knobs on the side
  const svgKnob = '<svg viewBox="0 0 40 40" aria-hidden="true"><defs><radialGradient id="kg" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#5a5a60"/><stop offset="1" stop-color="#1b1b1f"/></radialGradient></defs><circle cx="20" cy="20" r="18" fill="#0d0d10"/><g class="knob-rot"><circle cx="20" cy="20" r="15.5" fill="url(#kg)"/>' +
    Array.from({ length: 18 }, (_, i) => { const a = i * 20 * Math.PI / 180; return `<line x1="${20 + Math.sin(a) * 13}" y1="${20 - Math.cos(a) * 13}" x2="${20 + Math.sin(a) * 15.5}" y2="${20 - Math.cos(a) * 15.5}" stroke="#77777d" stroke-width="1"/>`; }).join('') +
    '<rect x="19" y="6" width="2" height="8" rx="1" fill="#F5C66A"/></g></svg>';
  const ctl = el('div', { className: 'tv-ctl', id: 'tv-ctl', hidden: true });
  const pBtn = el('button', { type: 'button', className: 'tv-btn tv-power' });
  pBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v7M7 7.5a7 7 0 1 0 10 0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
  const knob = el('div', { className: 'tv-knob', role: 'slider', tabIndex: 0, 'aria-valuemin': 0, 'aria-valuemax': 100 });
  knob.innerHTML = svgKnob;
  const up = el('button', { type: 'button', className: 'tv-btn tv-ch', text: '▲' });
  const down = el('button', { type: 'button', className: 'tv-btn tv-ch', text: '▼' });
  const bigBtn = el('button', { type: 'button', className: 'tv-btn tv-big' });
  bigBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const led = el('span', { className: 'tv-led' });
  ctl.append(led, pBtn, knob, up, down, bigBtn);
  room.insertBefore(ctl, $('hotspots').nextSibling);

  function labels() {
    pBtn.setAttribute('aria-label', on ? t('off') : t('on'));
    knob.setAttribute('aria-label', t('vol'));
    knob.setAttribute('aria-valuenow', String(vol));
    up.setAttribute('aria-label', t('up'));
    down.setAttribute('aria-label', t('down'));
    bigBtn.setAttribute('aria-label', big ? t('small') : t('big'));
    pBtn.title = t('power'); knob.title = t('tapHint'); up.title = t('up'); down.title = t('down'); bigBtn.title = big ? t('small') : t('big');
  }

  // ------------------------------------------------------------------ YouTube
  function cmd(func, args = []) {
    if (!iframe || !iframe.contentWindow) return;
    try { iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), '*'); } catch { /* fine */ }
  }
  function src() {
    const q = `autoplay=1&playsinline=1&controls=0&disablekb=1&iv_load_policy=3&rel=0&modestbranding=1&enablejsapi=1&mute=${gestured && vol > 0 && !ducked ? 0 : 1}&origin=${encodeURIComponent(location.origin)}&hl=${S.lang()}`;
    if (tape) return `https://www.youtube-nocookie.com/embed/videoseries?list=${tape.yt}&${q}`;
    return `https://www.youtube.com/embed/live_stream?channel=${ch}&${q}`;
  }
  function mount() {
    screen.replaceChildren();
    iframe = null; ready = false;
    if (!on) { set.classList.remove('is-on'); render(); return; }
    set.classList.add('is-on');
    iframe = el('iframe', { title: name(), allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen', referrerPolicy: 'strict-origin-when-cross-origin', tabIndex: -1 });
    iframe.src = src();
    iframe.addEventListener('load', () => {
      ready = true;
      try { iframe.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 'tvset' }), '*'); } catch { /* fine */ }
      setTimeout(applyVolume, 600); setTimeout(applyVolume, 2000);
    });
    screen.appendChild(iframe);
    flashSnow();
    showOsd(name());
    render();
  }
  function name() { return tape ? `📼 ${tape[S.lang()] || tape.en}` : (CHANNELS.find(c => c.id === ch) || CHANNELS[0]).name; }
  function applyVolume() {
    const v = ducked ? 0 : vol;
    if (v <= 0) cmd('mute'); else { cmd('unMute'); cmd('setVolume', [v]); }
  }
  function flashSnow() { snow.classList.remove('is-on'); void snow.offsetWidth; snow.classList.add('is-on'); }
  let osdT = 0, volT = 0;
  function showOsd(text) { osd.textContent = text; osd.classList.add('is-on'); clearTimeout(osdT); osdT = setTimeout(() => osd.classList.remove('is-on'), 2600); }
  function showVol() {
    const n = Math.round((ducked ? 0 : vol) / 5);
    volOsd.replaceChildren(el('span', { text: vol === 0 || ducked ? '🔇' : '🔊' }), el('b', { text: '▮'.repeat(n) + '▯'.repeat(20 - n) }));
    volOsd.classList.add('is-on'); clearTimeout(volT); volT = setTimeout(() => volOsd.classList.remove('is-on'), 1800);
  }

  // ------------------------------------------------------------------ controls
  function setOn(v) {
    on = v; S.store.set('tvOn', on);
    if (!on) big = false;
    mount();
    document.dispatchEvent(new CustomEvent('sawt:tv', { detail: { on } }));
  }
  function tune(id) {
    tape = null; ch = id; S.store.set('tvChannel', ch);
    gestured = true;
    if (!on) { on = true; S.store.set('tvOn', true); }
    mount();
    document.dispatchEvent(new CustomEvent('sawt:tv', { detail: { on, ch } }));
  }
  function step(d) {
    const i = CHANNELS.findIndex(c => c.id === ch);
    tune(CHANNELS[(i + d + CHANNELS.length) % CHANNELS.length].id);
  }
  function setVol(v, fromUser = true) {
    vol = Math.max(0, Math.min(100, Math.round(v)));
    S.store.set('tvVolume', vol);
    if (fromUser) { ducked = false; gestured = true; }
    if (on && iframe && !ready) mount(); else applyVolume();
    knob.querySelector('.knob-rot').style.transform = `rotate(${-135 + vol * 2.7}deg)`;
    knob.setAttribute('aria-valuenow', String(vol));
    showVol();
  }
  pBtn.addEventListener('click', () => { gestured = true; setOn(!on); });
  up.addEventListener('click', () => step(1));
  down.addEventListener('click', () => step(-1));
  bigBtn.addEventListener('click', () => { big = !big; set.classList.toggle('is-big', big); labels(); place(); });
  // the knob: drag around it, or scroll, or arrow keys; a tap turns it up a notch
  (() => {
    let dragging = false, lastA = 0, moved = 0;
    const ang = e => { const r = knob.getBoundingClientRect(); return Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI; };
    knob.addEventListener('pointerdown', e => { e.stopPropagation(); dragging = true; moved = 0; lastA = ang(e); knob.setPointerCapture(e.pointerId); gestured = true; });
    knob.addEventListener('pointermove', e => {
      if (!dragging) return;
      let a = ang(e), d = a - lastA;
      if (d > 180) d -= 360; if (d < -180) d += 360;
      lastA = a; moved += Math.abs(d);
      setVol(vol + d / 2.7);
    });
    const end = () => { if (dragging && moved < 4) setVol(vol >= 100 ? 0 : vol + 10); dragging = false; };
    knob.addEventListener('pointerup', end);
    knob.addEventListener('pointercancel', () => { dragging = false; });
    knob.addEventListener('wheel', e => { e.preventDefault(); e.stopPropagation(); setVol(vol - Math.sign(e.deltaY) * 5); }, { passive: false });
    knob.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); setVol(vol + 5); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); setVol(vol - 5); }
    });
  })();
  [pBtn, up, down, bigBtn].forEach(b => b.addEventListener('pointerdown', e => e.stopPropagation()));

  // the radio and the tapes take the sound; the picture keeps going
  function duck() {
    if (!on || ducked || vol === 0) return;
    ducked = true; applyVolume(); showOsd(t('muted')); showVol();
  }
  $('audio').addEventListener('play', duck);
  document.addEventListener('sawt:screen', e => { if (e.detail) duck(); });

  // ------------------------------------------------------------------ keeping it on the set
  function place() {
    const R = window.SawtRoom;
    if (!R || !R.inRoom()) { set.hidden = true; ctl.hidden = true; return; }
    const pts = R.tvCorners().map(p => R.project(p[0], p[1]));
    const q = R.orderQuad(pts);
    const w = q[1][0] - q[0][0], h = q[3][1] - q[0][1];
    const offscreen = q[1][0] < -40 || q[0][0] > innerWidth + 40 || q[2][1] < -40 || q[0][1] > innerHeight + 40;
    set.hidden = !on || (offscreen && !big);
    if (big) { set.style.transform = ''; }
    else if (!set.hidden) set.style.transform = R.quadTransform(400, 300, q);
    // the buttons sit on the side of the set, sized to it
    const size = Math.max(26, Math.min(52, w * 0.24));
    ctl.hidden = offscreen || document.body.classList.contains('intro-on');
    if (!ctl.hidden) {
      ctl.style.setProperty('--s', size + 'px');
      const x = big ? innerWidth / 2 + Math.min(innerWidth * 0.46, 640) - size * 1.2 : q[1][0] + w * 0.035;
      const y = big ? innerHeight / 2 - size * 3 : q[1][1] + h * 0.02;
      ctl.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      ctl.classList.toggle('is-tiny', size < 30 && !big);
    }
  }
  function render() {
    set.classList.toggle('is-on', on);
    ctl.classList.toggle('is-on', on);
    led.classList.toggle('is-on', on);
    knob.querySelector('.knob-rot').style.transform = `rotate(${-135 + vol * 2.7}deg)`;
    labels();
    place();
    document.querySelectorAll('#channels .channel').forEach(li => li.classList.toggle('is-playing', on && !tape && li.dataset.channel === ch));
  }
  if (window.SawtRoom) window.SawtRoom.onFrame(place);

  // ------------------------------------------------------------------ the TV drawer
  function tagChannels() {
    document.querySelectorAll('#channels .channel').forEach(li => {
      const n = li.querySelector('.channel-name');
      const c = n && CHANNELS.find(x => x.name === n.textContent);
      if (c) li.dataset.channel = c.id;
    });
    render();
  }
  $('channels').addEventListener('click', e => {
    const a = e.target.closest('a');
    const li = a && a.closest('.channel');
    if (!li || !li.dataset.channel) return;
    e.preventDefault();
    tune(li.dataset.channel);
    if (window.SawtRoom) { window.SawtRoom.close(); setTimeout(() => window.SawtRoom.focusTv(), 320); }
  });
  // a power row at the top of the drawer
  const row = el('div', { className: 'tv-row' });
  const rowPower = el('button', { type: 'button', className: 'btn' });
  const rowVol = el('input', { type: 'range', min: 0, max: 100, step: 5, className: 'tv-range' });
  rowPower.addEventListener('click', () => { gestured = true; setOn(!on); renderRow(); });
  rowVol.addEventListener('input', () => setVol(Number(rowVol.value)));
  row.append(rowPower, el('label', { className: 'tv-range-l' }, [el('span', { text: '🔊' }), rowVol]));
  const slot = $('tv-slot');
  if (slot) slot.replaceWith(row);
  function renderRow() { rowPower.textContent = (on ? '⏻ ' : '⏻ ') + (on ? t('off') : t('on')); rowVol.value = vol; rowVol.setAttribute('aria-label', t('vol')); }

  new MutationObserver(tagChannels).observe($('channels'), { childList: true });
  document.addEventListener('sawt:lang', () => { labels(); renderRow(); tagChannels(); });
  document.addEventListener('sawt:panel', e => { if (e.detail === 'tv') renderRow(); });
  document.addEventListener('sawt:entered', () => { if (on) mount(); place(); });
  document.addEventListener('pointerdown', () => { if (!gestured) { gestured = true; if (on && ready && vol > 0 && !ducked) applyVolume(); } }, { once: true, capture: true });

  window.SawtTV = {
    tune, step, setOn, setVolume: setVol,
    playTape(mood) { tape = { ...mood }; gestured = true; if (!on) { on = true; S.store.set('tvOn', true); } mount(); },
    isOn: () => on, channel: () => ch, channels: () => CHANNELS.slice(), current: () => (on ? (tape ? { kind: 'tape', mood: tape } : { kind: 'live', id: ch, name: name() }) : null)
  };
  tagChannels(); renderRow(); labels();
  if (window.SawtRoom && window.SawtRoom.inRoom() && on) mount();
})();

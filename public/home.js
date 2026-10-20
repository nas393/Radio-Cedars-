/* Two gentle things for the family:
   - Simple mode ("كبّر"): four big buttons for relatives who won't swipe around a 3D room.
   - Your own photos on the wall: pick photos and they hang in the frames above the sofa.
     They are kept in this browser only. */
(() => {
  'use strict';
  const S = window.Sawt;
  const R = () => window.SawtRoom;
  const $ = id => document.getElementById(id);
  const el = S.el;

  const T = {
    ar: { simple: 'كبّر', title: 'أهلا وسهلا', back: 'رجوع عالصالون', on: 'شغّل الراديو', off: 'طفّي الراديو', next: 'المحطة الجاية',
      tetaSt: 'محطة تيتا', rTitle: '📻 راديو البيت', rHouse: '🏠 فوت عالبيت', rInstall: 'لتحطّ هالراديو عشاشة التلفون: بالآيفون كبّس زرّ المشاركة ← «إضافة إلى الشاشة الرئيسية». بالأندرويد كبّس ⋮ ← «تثبيت» أو «إضافة إلى الشاشة».', rPick: 'غيّر المحطة', news: 'الأخبار', tv: 'التلفزيون', tapes: 'أغاني', phone: 'رسالة بصوتك', tawleh: 'طاولة', together: 'قعدة سوا', myPhotos: 'حطّ صور العيلة عالحيط', remove: 'شيل صوري',
      note: 'الصور بتضل على جهازك بس، ما منرفعها لحدا.', added: n => `تعلّقت ${S.num(n)} صور عالحيط` },
    en: { simple: 'Simple', title: 'Welcome home', back: 'Back to the room', on: 'Radio on', off: 'Radio off', next: 'Next station',
      tetaSt: 'Teta’s station', rTitle: '📻 Home radio', rHouse: '🏠 Go into the house', rInstall: 'To put this radio on the phone’s home screen: on iPhone tap Share → “Add to Home Screen”; on Android tap ⋮ → “Install” or “Add to Home screen”.', rPick: 'Change station', news: 'News', tv: 'TV', tapes: 'Songs', phone: 'Voice message', tawleh: 'Tawleh', together: 'Listen together', myPhotos: 'Hang your family photos', remove: 'Remove my photos',
      note: 'Your photos stay on this device only. Nothing is uploaded.', added: n => `${n} photos hung on the wall` },
    fr: { simple: 'Simple', title: 'Bienvenue à la maison', back: 'Retour au salon', on: 'Allumer la radio', off: 'Éteindre la radio', next: 'Station suivante',
      tetaSt: 'La station de Teta', rTitle: '📻 La radio de la maison', rHouse: '🏠 Entrer dans la maison', rInstall: 'Pour mettre cette radio sur l’écran d’accueil : sur iPhone, Partager → « Sur l’écran d’accueil » ; sur Android, ⋮ → « Installer » ou « Ajouter à l’écran d’accueil ».', rPick: 'Changer de station', news: 'Infos', tv: 'Télé', tapes: 'Chansons', phone: 'Message vocal', tawleh: 'Tawlé', together: 'Ensemble', myPhotos: 'Accrocher vos photos de famille', remove: 'Retirer mes photos',
      note: 'Vos photos restent sur cet appareil. Rien n’est envoyé.', added: n => `${n} photos accrochées au mur` }
  };
  const t = (k, ...a) => { const v = (T[S.lang()] || T.ar)[k]; return typeof v === 'function' ? v(...a) : v; };

  // ================================================================== simple mode
  const btn = el('button', { type: 'button', className: 'simple-btn', id: 'simple-btn', 'aria-pressed': 'false' });
  document.querySelector('.room-top .langs').before(btn);
  const panel = el('div', { className: 'simple', id: 'simple', hidden: true, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'simple-title' });
  document.body.appendChild(panel);

  function bigTile(icon, label, onClick, cls = '') {
    const b = el('button', { type: 'button', className: 'big-tile ' + cls }, [
      el('span', { className: 'big-icon', text: icon }),
      el('span', { className: 'big-label', text: label })
    ]);
    b.addEventListener('click', onClick);
    return b;
  }
  function renderSimple() {
    btn.replaceChildren(el('span', { className: 'simple-aa', text: 'Aa' }), el('span', { text: t('simple') }));
    if (panel.hidden) return;
    const st = S.current && S.current();
    const playing = S.isOn && S.isOn();
    panel.replaceChildren(
      el('div', { className: 'simple-inner' }, [
        el('h2', { className: 'simple-title', id: 'simple-title', text: t('title') }),
        tetaTile(),
        el('div', { className: 'big-radio' + (playing ? ' is-on' : '') }, [
          el('p', { className: 'big-station', dir: 'auto', text: st ? st.name : '…' }),
          el('div', { className: 'big-row' }, [
            bigTile(playing ? '⏸' : '▶', playing ? t('off') : t('on'), () => { S.setPower(!S.isOn()); setTimeout(renderSimple, 200); }, 'is-primary'),
            bigTile('⏭', t('next'), () => { $('mini-next').click(); setTimeout(renderSimple, 300); })
          ])
        ]),
        el('div', { className: 'big-grid' }, [
          bigTile('📰', t('news'), () => R() && R().open('news')),
          bigTile('📺', t('tv'), () => R() && R().open('tv')),
          bigTile('📼', t('tapes'), () => R() && R().open('cassettes')),
          bigTile('🎙️', t('phone'), () => R() && R().open('phone')),
          bigTile('🎲', t('tawleh'), () => R() && R().open('tawleh')),
          bigTile('🛋️', t('together'), () => R() && R().open('together'))
        ]),
        (() => { const b = el('button', { type: 'button', className: 'btn simple-back', text: t('back') }); b.addEventListener('click', () => setSimple(false)); return b; })()
      ])
    );
  }
  // Teta's station (chosen in My corner): first, and huge
  function tetaStation() { const id = S.store.get('tetaStation', ''); return id && S.stations ? S.stations().find(x => x.id === id) : null; }
  function tetaTile() {
    const ts = tetaStation();
    if (!ts) return null;
    const cur = S.current && S.current();
    const on = S.isOn && S.isOn() && cur && cur.id === ts.id;
    const b = el('button', { type: 'button', className: 'big-teta' + (on ? ' is-on' : '') }, [
      el('span', { className: 'big-icon', text: on ? '⏸' : '▶' }),
      el('span', { className: 'big-teta-t' }, [el('small', { text: '👵 ' + t('tetaSt') }), el('b', { dir: 'auto', text: ts.name })])
    ]);
    b.addEventListener('click', () => { if (on) S.setPower(false); else { S.showStation(ts.id); S.setPower(true); } setTimeout(() => { renderSimple(); renderRadioOnly(); }, 250); });
    return b;
  }

  // ================================================================== the radio on its own (/radio): its own icon on the home screen
  const radioOnly = location.pathname.replace(/\/+$/, '') === '/radio';
  const rpanel = radioOnly ? el('div', { className: 'simple radio-only', role: 'dialog', 'aria-modal': 'true' }) : null;
  if (rpanel) { document.body.appendChild(rpanel); document.body.classList.add('is-radio-only'); }
  function renderRadioOnly() {
    if (!rpanel) return;
    const st = S.current && S.current();
    const playing = S.isOn && S.isOn();
    const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    const list = (S.stations && S.stations()) || [];
    const pick = el('select', { className: 'me-sel radio-pick', 'aria-label': t('rPick') }, list.map(x => el('option', { value: x.id, text: x.name })));
    if (st) pick.value = st.id;
    pick.addEventListener('change', () => { S.showStation(pick.value); S.setPower(true); setTimeout(renderRadioOnly, 300); });
    rpanel.replaceChildren(el('div', { className: 'simple-inner' }, [
      el('h2', { className: 'simple-title', text: t('rTitle') }),
      tetaTile(),
      el('div', { className: 'big-radio' + (playing ? ' is-on' : '') }, [
        el('p', { className: 'big-station', dir: 'auto', text: st ? st.name : '…' }),
        el('div', { className: 'big-row' }, [
          bigTile(playing ? '⏸' : '▶', playing ? t('off') : t('on'), () => { S.setPower(!S.isOn()); setTimeout(renderRadioOnly, 250); }, 'is-primary'),
          bigTile('⏭', t('next'), () => { $('mini-next').click(); setTimeout(renderRadioOnly, 300); })
        ])
      ]),
      list.length ? pick : null,
      standalone ? null : el('p', { className: 'quiet small radio-install', text: t('rInstall') }),
      (() => { const a = el('a', { className: 'btn simple-back', href: '/', text: t('rHouse') }); return a; })()
    ].filter(Boolean)));
  }
  if (radioOnly) {
    document.addEventListener('sawt:stations', () => {
      const ts = tetaStation();
      if (ts && !(S.current && S.current() && S.current().id === ts.id)) S.showStation(ts.id);
      renderRadioOnly();
    });
    ['play', 'pause'].forEach(ev => $('audio').addEventListener(ev, renderRadioOnly));
    document.addEventListener('sawt:lang', renderRadioOnly);
    renderRadioOnly();
  }
  document.addEventListener('sawt:teta-station', () => { renderSimple(); renderRadioOnly(); });

  function setSimple(v) {
    panel.hidden = !v;
    document.body.classList.toggle('is-simple', v);
    btn.setAttribute('aria-pressed', String(v));
    S.store.set('simpleMode', v);
    renderSimple();
    if (v) { const f = panel.querySelector('.big-tile'); if (f) f.focus(); }
  }
  btn.addEventListener('click', () => setSimple(panel.hidden));
  document.addEventListener('sawt:lang', renderSimple);
  document.addEventListener('sawt:stations', renderSimple);
  $('audio').addEventListener('play', renderSimple);
  $('audio').addEventListener('pause', renderSimple);
  renderSimple();
  if (S.store.get('simpleMode', false)) setTimeout(() => setSimple(true), 600);

  // ================================================================== your own photos on the wall
  const KEY = 'myPhotos';
  let photos = [];
  try { photos = S.store.get(KEY, []) || []; } catch { photos = []; }
  const layer = el('div', { className: 'my-photos', 'aria-hidden': 'true' });
  document.getElementById('room').appendChild(layer);

  function resize(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, 420 / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        const g = c.getContext('2d');
        g.drawImage(img, 0, 0, c.width, c.height);
        // a little warmth so they sit in the room like old prints
        g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(255, 236, 205, 0.55)'; g.fillRect(0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.82));
        URL.revokeObjectURL(img.src);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
  function renderLayer() {
    const frames = R() ? R().photoFrames() : [];
    layer.replaceChildren(...photos.slice(0, frames.length).map((src, i) => {
      // the print sits inside the frame's own shape, lit like the room around it
      const im = el('div', { className: 'my-photo' });
      im.style.backgroundImage = `url("${src}")`;
      im.appendChild(el('i', { className: 'my-photo-glass' }));
      im.dataset.i = i;
      return im;
    }));
    if (R()) R().redraw();
  }
  function placeLayer() {
    if (!photos.length || !R()) return;
    const frames = R().photoFrames();
    const sc = R().scene(), pw = R().power ? R().power() : 1;
    const light = (sc === 'night' ? 0.62 : sc === 'sunset' ? 0.82 : 0.96) * (0.08 + 0.92 * pw);
    const look = `brightness(${light.toFixed(3)}) sepia(${sc === 'day' ? 0.12 : 0.3}) saturate(.82) contrast(.92)`;
    if (layer.dataset.look !== look) { layer.dataset.look = look; layer.style.filter = look; }
    layer.querySelectorAll('.my-photo').forEach(im => {
      const f = frames[Number(im.dataset.i)];
      if (!f) return;
      const pts = f.map(p => R().project(p[0], p[1]));
      if (!pts.every(p => p.front)) { im.style.visibility = 'hidden'; return; }
      im.style.visibility = 'visible';
      im.style.transform = R().quadTransform(300, 300, R().orderQuad(pts));
    });
  }
  if (window.SawtRoom) window.SawtRoom.onFrame(placeLayer);

  function photoControls() {
    const box = document.querySelector('[data-panel="photos"]');
    if (!box) return;
    let wrap = $('my-photos-ctl');
    if (!wrap) {
      wrap = el('div', { className: 'my-photos-ctl', id: 'my-photos-ctl' });
      box.prepend(wrap);
    }
    const input = el('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true });
    const add = el('button', { type: 'button', className: 'btn btn-primary', text: '🖼️ ' + t('myPhotos') });
    add.addEventListener('click', () => input.click());
    input.addEventListener('change', async () => {
      const files = [...input.files].slice(0, 5);
      const out = [];
      for (const f of files) { try { out.push(await resize(f)); } catch { /* skip */ } }
      photos = out.concat(photos).slice(0, 5);
      try { S.store.set(KEY, photos); } catch { S.toast('…'); }
      renderLayer(); photoControls();
      S.toast(t('added', out.length));
    });
    const kids = [add, input];
    if (photos.length) {
      const rm = el('button', { type: 'button', className: 'link-btn', text: t('remove') });
      rm.addEventListener('click', () => { photos = []; S.store.set(KEY, []); renderLayer(); photoControls(); });
      kids.push(rm);
    }
    kids.push(el('p', { className: 'quiet small', text: t('note') }));
    wrap.replaceChildren(...kids);
  }
  photoControls();
  renderLayer();
  document.addEventListener('sawt:lang', () => { photoControls(); renderSimple(); });
})();

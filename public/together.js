/* The sofa: family rooms ("قعدة سوا").
   A room is private: you pick its name and an easy passcode, and send the link.
   Inside: who is here, the same radio or tape for everyone at the same moment,
   written and voice messages back and forth (mama can answer by voice), and a
   card table. Without the small database, the sofa still shares what you are
   playing by link. */
(() => {
  'use strict';
  const S = window.Sawt;
  const C = window.SAWT_CONTENT || {};
  const $ = id => document.getElementById(id);
  const el = S.el;
  const box = $('together');
  if (!box) return;

  const T = {
    ar: {
      lede: 'غرف خاصة للعيلة: نفس الإذاعة بنفس اللحظة، ورسائل بالصوت والكتابة رايحة جاية.',
      rooms: 'غرفنا', none: 'ما عندك غرف بعد.', newRoom: 'غرفة جديدة', title: 'اسم الغرفة', titlePh: 'مثلاً: عيلة بيت جدّي', yourName: 'اسمك',
      pin: 'رمز الغرفة (٤ لـ ٨ أرقام)', pinPh: 'مثلاً: ٢٠٢٦', pinNote: 'ما حدا بيفوت بلا هالرمز. قولو للعيلة.', create: 'افتح الغرفة', join: 'فوت', enterPin: 'الرمز', back: 'رجوع',
      invite: 'اعزم العيلة', withPin: 'حطّ الرمز بالرسالة', inviteText: (r, p) => `تعا عالغرفة "${r}" بصوت البيت 🛋️${p ? `\nالرمز: ${p}` : ''}`,
      here: 'هون هلّق', nowPlaying: 'عم يشتغل بالغرفة', nothing: 'ولا شي. شغّل الراديو أو شريط وشارك.', listen: 'إسمع معهن', listening: 'عم تسمع معهن ✓', share: 'سمّعهن اللي عم إسمعه',
      say: 'اكتب كلمة…', send: 'ابعت', rec: 'سجّل بصوتك', stopRec: 'وقّف وابعت', cancelRec: 'لغي', recNow: 'عم يسجّل…', play: 'اسمع', songOf: n => `🎵 ${n}`,
      cards: 'العب شدّة بهالغرفة', leave: 'شيل الغرفة من عندي', newMsg: n => `💬 ${n} بعتلك بالغرفة`,
      noStore: 'الغرف الخاصة بتشتغل لما تنشغّل قاعدة البيانات الصغيرة. هلّق فيك تبعت اللي عم يشتغل برابط:',
      nothingPlaying: 'شغّل الراديو أو شريط أوّل.', sendThis: 'ابعت هالأغنية لحدا يسمعها معك', sharedSong: 'حدا بعتلك تسمع هيدا', listenNow: 'إسمع هلّق',
      shareText: n => `تعا نسمع سوا عصوت البيت 🛋️ (${n})`, joinTitle: r => `غرفة "${r}"`,
      errs: { pinLen: 'الرمز لازم يكون ٤ لـ ٨ أرقام.', pin: 'الرمز غلط.', rate: 'كتير محاولات. جرّب بعد شوي.', name: 'اختار اسم تاني.', links: 'بلا روابط.', phone: 'بلا أرقام.', rude: 'خلّيها حلوة 🙂', gone: 'هالغرفة ما عادت موجودة.', token: 'لازم تفوت من جديد بالرمز.', norec: 'متصفّحك ما بيسجّل.', nomic: 'اسمحلنا نستعمل المايك.', server: 'في مشكلة، جرّب كمان مرة.' },
      radio: 'راديو', tape: 'شريط', live: 'تلفزيون'
    },
    en: {
      lede: 'Private family rooms: the same station at the same moment, and voice and written messages back and forth.',
      rooms: 'Our rooms', none: 'No rooms yet.', newRoom: 'New room', title: 'Room name', titlePh: 'e.g. Grandpa’s house', yourName: 'Your name',
      pin: 'Room passcode (4 to 8 digits)', pinPh: 'e.g. 2026', pinNote: 'Nobody comes in without it. Tell your family.', create: 'Open the room', join: 'Come in', enterPin: 'Passcode', back: 'Back',
      invite: 'Invite the family', withPin: 'Put the passcode in the message', inviteText: (r, p) => `Come to "${r}" on Sawt el Beit 🛋️${p ? `\nPasscode: ${p}` : ''}`,
      here: 'Here now', nowPlaying: 'Playing in the room', nothing: 'Nothing yet. Play the radio or a tape and share it.', listen: 'Listen with them', listening: 'Listening with them ✓', share: 'Let them hear what I play',
      say: 'Write something…', send: 'Send', rec: 'Record your voice', stopRec: 'Stop and send', cancelRec: 'Cancel', recNow: 'Recording…', play: 'Play', songOf: n => `🎵 ${n}`,
      cards: 'Play cards in this room', leave: 'Remove this room from my list', newMsg: n => `💬 ${n} wrote in the room`,
      noStore: 'Private rooms work once the small database is switched on. For now you can send what’s playing by link:',
      nothingPlaying: 'Play the radio or a tape first.', sendThis: 'Send this to someone to listen with you', sharedSong: 'Someone sent you this to listen to', listenNow: 'Listen now',
      shareText: n => `Come listen with me on Sawt el Beit 🛋️ (${n})`, joinTitle: r => `The room "${r}"`,
      errs: { pinLen: 'The passcode is 4 to 8 digits.', pin: 'Wrong passcode.', rate: 'Too many tries. Wait a little.', name: 'Pick another name.', links: 'No links, please.', phone: 'No phone numbers.', rude: 'Keep it sweet 🙂', gone: 'This room no longer exists.', token: 'Come in again with the passcode.', norec: 'This browser can’t record.', nomic: 'Please allow the microphone.', server: 'Something went wrong, try again.' },
      radio: 'Radio', tape: 'Tape', live: 'TV'
    },
    fr: {
      lede: 'Des pièces privées pour la famille : la même radio au même moment, et des messages vocaux et écrits.',
      rooms: 'Nos pièces', none: 'Pas encore de pièce.', newRoom: 'Nouvelle pièce', title: 'Nom de la pièce', titlePh: 'ex. Chez grand-père', yourName: 'Votre prénom',
      pin: 'Code de la pièce (4 à 8 chiffres)', pinPh: 'ex. 2026', pinNote: 'Personne n’entre sans ce code. Donnez-le à la famille.', create: 'Ouvrir la pièce', join: 'Entrer', enterPin: 'Code', back: 'Retour',
      invite: 'Inviter la famille', withPin: 'Mettre le code dans le message', inviteText: (r, p) => `Viens dans « ${r} » sur Sawt el Beit 🛋️${p ? `\nCode : ${p}` : ''}`,
      here: 'Présents', nowPlaying: 'Dans la pièce', nothing: 'Rien encore. Lancez la radio ou une cassette et partagez.', listen: 'Écouter avec eux', listening: 'Vous écoutez avec eux ✓', share: 'Leur faire écouter ce que j’écoute',
      say: 'Un petit mot…', send: 'Envoyer', rec: 'Enregistrer ma voix', stopRec: 'Arrêter et envoyer', cancelRec: 'Annuler', recNow: 'Enregistrement…', play: 'Écouter', songOf: n => `🎵 ${n}`,
      cards: 'Jouer aux cartes dans cette pièce', leave: 'Retirer cette pièce de ma liste', newMsg: n => `💬 ${n} a écrit dans la pièce`,
      noStore: 'Les pièces privées marchent une fois la petite base de données activée. En attendant, envoyez ce qui joue par lien :',
      nothingPlaying: 'Lancez d’abord la radio ou une cassette.', sendThis: 'Envoyer à quelqu’un pour écouter ensemble', sharedSong: 'Quelqu’un vous envoie ceci à écouter', listenNow: 'Écouter',
      shareText: n => `Viens écouter avec moi sur Sawt el Beit 🛋️ (${n})`, joinTitle: r => `La pièce « ${r} »`,
      errs: { pinLen: 'Le code fait 4 à 8 chiffres.', pin: 'Code erroné.', rate: 'Trop d’essais. Patientez.', name: 'Choisissez un autre prénom.', links: 'Pas de liens.', phone: 'Pas de numéros.', rude: 'Restons gentils 🙂', gone: 'Cette pièce n’existe plus.', token: 'Entrez à nouveau avec le code.', norec: 'Ce navigateur ne sait pas enregistrer.', nomic: 'Autorisez le micro.', server: 'Un souci, réessayez.' },
      radio: 'Radio', tape: 'Cassette', live: 'Télé'
    }
  };
  const t = (k, ...a) => { const v = (T[S.lang()] || T.ar)[k]; return typeof v === 'function' ? v(...a) : v; };
  const digits = s => String(s || '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g, '');
  const myName = () => (window.SawtMe && window.SawtMe.name()) || S.store.get('qName', '') || '';

  let storeOn = false;
  let rooms = S.store.get('rooms', []) || [];       // [{ id, title, token, name, pin? }]
  let openRoom = null;                               // { id, ...saved, v, since, here, msgs, now, following, sharing, gv }
  let screen = 'home';                               // home | new | join | room
  let joinId = null, joinTitle = '';
  let shared = null;
  let err = '';
  let recording = null;
  const saveRooms = () => S.store.set('rooms', rooms);

  // ------------------------------------------------------------------ what is playing here
  function nowHere() {
    const sc = window.SawtScreen && window.SawtScreen.current();
    if (sc && sc.kind === 'tape') return { kind: 'tape', id: sc.mood.id, name: sc.name, src: sc.src };
    const st = S.current && S.current();
    if (st && S.isOn && S.isOn()) return { kind: 'radio', id: st.id, name: st.name };
    const tv = window.SawtTV && window.SawtTV.current();
    if (tv && tv.kind === 'live') return { kind: 'live', id: tv.id, name: tv.name };
    return { kind: 'none', id: '', name: '' };
  }
  function playThing(n) {
    if (!n || n.kind === 'none') return;
    if (n.kind === 'radio') { if (S.showStation(n.id)) S.setPower(true); }
    else if (n.kind === 'tape') { const m = (C.moods || []).find(x => x.id === n.id); if (m && window.SawtScreen) window.SawtScreen.playTape(m, n.src || 'yt'); }
    else if (n.kind === 'live' && window.SawtTV) window.SawtTV.tune(n.id);
  }
  const same = (a, b) => a && b && a.kind === b.kind && a.id === b.id;
  const label = n => (n && n.kind !== 'none' ? `${t(n.kind) || ''} · ${n.name}` : '');

  // ------------------------------------------------------------------ server
  async function api(path, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['x-q-token'] = token;
    const res = await fetch(path, body ? { method: 'POST', headers, body: JSON.stringify(body) } : { headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(data.code || 'server'); e.code = data.code || 'server'; throw e; }
    return data;
  }
  const errText = e => t('errs')[e && e.code] || t('errs').server;

  async function createRoom(title, name, pin) {
    const d = await api('/api/q', { title, name, pin, now: nowHere() });
    const r = { id: d.id, title: d.title, token: d.token, name, pin };
    rooms = [r, ...rooms.filter(x => x.id !== r.id)];
    saveRooms();
    S.store.set('qName', name);
    return r;
  }
  async function joinRoom(id, name, pin) {
    const d = await api(`/api/q/${id}/join`, { name, pin });
    const r = { id, title: d.title, token: d.token, name };
    rooms = [r, ...rooms.filter(x => x.id !== id)];
    saveRooms();
    S.store.set('qName', name);
    return r;
  }
  function enter(r) {
    openRoom = { ...r, v: -1, since: 0, here: [], msgs: [], now: null, following: false, sharing: S.store.get('qShare:' + r.id, false) };
    screen = 'room'; err = '';
    render(); poll(true);
  }

  // ------------------------------------------------------------------ keeping up with the room
  let timer = null, polling = false;
  async function poll(force) {
    clearTimeout(timer);
    if (!openRoom || (polling && !force)) return schedule();
    polling = true;
    const r = openRoom;
    try {
      const d = await api(`/api/q/${r.id}?since=${r.since}`, null, r.token);
      if (openRoom !== r) return;
      r.here = d.here; r.hostName = d.host; r.title = d.title; r.game = d.game || null;
      if (d.msgs.length) {
        const fresh = d.msgs.filter(m => !r.msgs.some(x => x.n === m.n));
        r.msgs = r.msgs.concat(fresh).slice(-60);
        r.since = d.msgs[d.msgs.length - 1].n;
        const others = fresh.filter(m => m.name !== r.name);
        if (others.length && r.v !== -1 && !(window.SawtRoom && window.SawtRoom.isOpen() === 'together')) S.toast(t('newMsg', others[others.length - 1].name));
      }
      if (d.v !== r.v) {
        const first = r.v === -1;
        r.v = d.v; r.now = d.now;
        if (!first && r.following && !same(nowHere(), d.now)) playThing(d.now);
      }
      document.dispatchEvent(new CustomEvent('sawt:room', { detail: { id: r.id, game: r.game, here: r.here } }));
      render(true);
    } catch (e) {
      if (e.code === 'gone' || e.code === 'token') {
        if (e.code === 'gone') { rooms = rooms.filter(x => x.id !== r.id); saveRooms(); }
        else { const s = rooms.find(x => x.id === r.id); if (s) { s.token = null; saveRooms(); } joinId = r.id; joinTitle = r.title; screen = 'join'; }
        openRoom = null; err = errText(e); if (screen === 'room') screen = 'home';
        render();
      }
    } finally { polling = false; }
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (!openRoom) return;
    const open = window.SawtRoom && window.SawtRoom.isOpen() === 'together';
    timer = setTimeout(poll, document.hidden ? 30000 : open ? 2500 : 10000);
  }
  let lastShared = null;
  async function shareNow() {
    if (!openRoom || !openRoom.sharing) return;
    const n = nowHere();
    if (same(n, lastShared)) return;
    lastShared = n;
    try { await api(`/api/q/${openRoom.id}/play`, { now: n }, openRoom.token); openRoom.now = n; render(true); } catch { /* next change */ }
  }
  ['play'].forEach(ev => $('audio').addEventListener(ev, () => setTimeout(shareNow, 400)));
  document.addEventListener('sawt:screen', () => setTimeout(shareNow, 400));
  document.addEventListener('sawt:tv', () => setTimeout(shareNow, 400));

  async function say(text) {
    if (!openRoom || !text) return;
    try { await api(`/api/q/${openRoom.id}/say`, { text }, openRoom.token); err = ''; poll(true); }
    catch (e) { err = errText(e); render(); }
  }
  async function sendVoice(roomRef, rec, extra = {}) {
    const audio = await window.SawtRec.toB64(rec.blob);
    return api(`/api/q/${roomRef.id}/voice`, { type: rec.mime, audio, seconds: Math.round(rec.seconds), ...extra }, roomRef.token);
  }
  async function recToggle() {
    if (recording) {
      const h = recording; recording = null;
      const rec = await h.stop();
      render();
      if (rec.seconds < 0.6) return;
      try { await sendVoice(openRoom, rec); err = ''; poll(true); } catch (e) { err = errText(e); render(); }
      return;
    }
    try {
      recording = await window.SawtRec.start((s, level) => {
        const n = box.querySelector('.q-rec-time'); if (n) n.textContent = `${S.num(Math.floor(s))}″`;
        const b = box.querySelector('.q-rec-level'); if (b) b.style.transform = `scaleX(${0.05 + level * 0.95})`;
      }, 90);
      render();
    } catch (e) { err = errText(e); render(); }
  }
  async function cancelRec() { if (!recording) return; const h = recording; recording = null; await h.stop(); render(); }

  async function invite(r, withPin) {
    const url = `${location.origin}/q/${r.id}`;
    const text = t('inviteText', r.title, withPin && r.pin ? r.pin : '');
    if (navigator.share) { try { await navigator.share({ text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    window.open('https://wa.me/?text=' + encodeURIComponent(`${text}\n${url}`), '_blank', 'noopener');
  }
  async function shareLink() {
    const n = nowHere();
    if (n.kind === 'none') { S.toast(t('nothingPlaying')); return; }
    const url = `${location.origin}/?listen=${encodeURIComponent(n.kind + ':' + n.id)}#together`;
    const text = t('shareText', n.name);
    if (navigator.share) { try { await navigator.share({ text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    window.open('https://wa.me/?text=' + encodeURIComponent(`${text}\n${url}`), '_blank', 'noopener');
  }

  // ------------------------------------------------------------------ drawing
  const btn = (text, cls, fn) => { const b = el('button', { type: 'button', className: cls || 'btn', text }); b.addEventListener('click', fn); return b; };
  function render(soft) {
    if (soft && screen === 'room' && openRoom) { renderLive(); return; }
    const kids = [];
    if (shared) {
      kids.push(el('div', { className: 'q-card q-invite' }, [
        el('p', { className: 'q-k', text: t('sharedSong') }), el('p', { className: 'q-now-name', dir: 'auto', text: shared.name || shared.id }),
        btn('▶ ' + t('listenNow'), 'btn btn-primary', () => { playThing(shared); shared = null; render(); })
      ]));
    }
    if (!storeOn) {
      kids.push(el('p', { className: 'pv-lede', text: t('lede') }), el('p', { className: 'quiet', text: t('noStore') }));
      const n = nowHere();
      kids.push(el('div', { className: 'q-card' }, [el('p', { className: 'q-k', text: t('nowPlaying') }), el('p', { className: 'q-now-name', dir: 'auto', text: label(n) || t('nothingPlaying') }), btn('📲 ' + t('sendThis'), 'btn btn-primary', shareLink)]));
      box.replaceChildren(...kids); return;
    }
    if (screen === 'room' && openRoom) { box.replaceChildren(...kids, roomView()); scrollLog(); return; }
    if (screen === 'new') kids.push(newForm());
    else if (screen === 'join') kids.push(joinForm());
    else {
      kids.push(el('p', { className: 'pv-lede', text: t('lede') }), el('h3', { className: 'pv-sub', text: t('rooms') }));
      kids.push(rooms.length ? el('div', { className: 'q-rooms' }, rooms.map(r => {
        const b = el('button', { type: 'button', className: 'q-room-card' }, [el('span', { className: 'q-room-ic', text: '🛋️' }), el('span', { className: 'q-room-t', dir: 'auto', text: r.title }), el('span', { className: 'q-room-n', dir: 'auto', text: r.name })]);
        b.addEventListener('click', () => { if (r.token) enter(r); else { joinId = r.id; joinTitle = r.title; screen = 'join'; render(); } });
        return b;
      })) : el('p', { className: 'quiet', text: t('none') }));
      kids.push(btn('＋ ' + t('newRoom'), 'btn btn-primary', () => { screen = 'new'; err = ''; render(); }));
      kids.push(el('div', { className: 'q-or' }, [btn('📲 ' + t('sendThis'), 'link-btn', shareLink)]));
    }
    if (err && screen === 'home') kids.push(el('p', { className: 'form-error', role: 'alert', text: err }));
    box.replaceChildren(...kids);
    const f = box.querySelector('input'); if (f && screen !== 'home') setTimeout(() => f.focus({ preventScroll: true }), 60);
  }
  function newForm() {
    const title = el('input', { maxLength: 40, placeholder: t('titlePh'), required: true });
    const name = el('input', { maxLength: 24, value: myName(), required: true, autocomplete: 'given-name' });
    const pin = el('input', { inputMode: 'numeric', maxLength: 8, placeholder: t('pinPh'), required: true, autocomplete: 'off' });
    const f = el('form', { className: 'q-start' }, [
      el('h3', { className: 'pv-sub', text: t('newRoom') }),
      el('label', { className: 'field' }, [el('span', { text: t('title') }), title]),
      el('label', { className: 'field' }, [el('span', { text: t('yourName') }), name]),
      el('label', { className: 'field' }, [el('span', { text: t('pin') }), pin]),
      el('p', { className: 'quiet small', text: t('pinNote') }),
      err ? el('p', { className: 'form-error', role: 'alert', text: err }) : null,
      el('div', { className: 'q-row' }, [el('button', { type: 'submit', className: 'btn btn-primary', text: '🛋️ ' + t('create') }), btn(t('back'), 'link-btn', () => { screen = 'home'; err = ''; render(); })])
    ].filter(Boolean));
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const p = digits(pin.value);
      if (p.length < 4 || p.length > 8) { err = t('errs').pinLen; render(); return; }
      try { const r = await createRoom(title.value.trim() || name.value.trim(), name.value.trim(), p); err = ''; enter(r); invite(r, true); }
      catch (ex) { err = errText(ex); render(); }
    });
    return f;
  }
  function joinForm() {
    const name = el('input', { maxLength: 24, value: myName(), required: true, autocomplete: 'given-name' });
    const pin = el('input', { inputMode: 'numeric', maxLength: 8, required: true, autocomplete: 'off', type: 'password' });
    const f = el('form', { className: 'q-start' }, [
      el('h3', { className: 'pv-sub', dir: 'auto', text: '🛋️ ' + t('joinTitle', joinTitle || '…') }),
      el('label', { className: 'field' }, [el('span', { text: t('yourName') }), name]),
      el('label', { className: 'field' }, [el('span', { text: t('enterPin') }), pin]),
      err ? el('p', { className: 'form-error', role: 'alert', text: err }) : null,
      el('div', { className: 'q-row' }, [el('button', { type: 'submit', className: 'btn btn-primary', text: t('join') }), btn(t('back'), 'link-btn', () => { screen = 'home'; err = ''; render(); })])
    ].filter(Boolean));
    f.addEventListener('submit', async e => {
      e.preventDefault();
      try { const r = await joinRoom(joinId, name.value.trim(), digits(pin.value)); err = ''; enter(r); openRoom.following = true; }
      catch (ex) { err = errText(ex); render(); }
    });
    return f;
  }
  function msgView(m, r) {
    const kids = [el('b', { dir: 'auto', text: m.name })];
    if (m.voice) {
      const au = el('audio', { preload: 'none', src: `/api/q/${r.id}/audio/${m.voice}?token=${encodeURIComponent(r.token)}` });
      const pb = el('button', { type: 'button', className: 'q-voice' }, [el('span', { className: 'q-voice-ic', text: '▶' }), el('span', { className: 'q-voice-bars' }), el('span', { className: 'q-voice-t', text: `${S.num(Math.max(1, Math.round(m.secs || 0)))}″` })]);
      pb.addEventListener('click', () => {
        document.querySelectorAll('.q-log audio').forEach(a => { if (a !== au) a.pause(); });
        if (au.paused) { if (S.isOn && S.isOn()) S.setPower(false); au.play().catch(() => {}); } else au.pause();
      });
      au.addEventListener('play', () => pb.classList.add('is-playing'));
      ['pause', 'ended'].forEach(ev => au.addEventListener(ev, () => pb.classList.remove('is-playing')));
      au.addEventListener('ended', () => { if (m.song) playThing(m.song); });
      kids.push(pb, au);
    }
    if (m.text) kids.push(el('span', { dir: 'auto', text: m.text }));
    if (m.song) kids.push(btn(t('songOf', m.song.name), 'link-btn q-song', () => playThing(m.song)));
    return el('div', { className: 'q-msg' + (m.name === r.name ? ' is-me' : '') + (m.voice ? ' has-voice' : '') }, kids);
  }
  function roomView() {
    const r = openRoom;
    const head = el('div', { className: 'q-head' }, [
      btn('‹', 'q-back', () => { openRoom = null; screen = 'home'; clearTimeout(timer); render(); }),
      el('h3', { className: 'q-title', dir: 'auto', text: r.title }),
      btn('📲', 'q-inv', () => invite(r, true))
    ]);
    head.querySelector('.q-back').setAttribute('aria-label', t('back'));
    head.querySelector('.q-inv').setAttribute('aria-label', t('invite'));
    const here = el('div', { className: 'q-here' }, [el('span', { className: 'q-k', text: t('here') }), ...r.here.map(n => el('span', { className: 'q-person' + (n === r.name ? ' is-me' : ''), dir: 'auto', text: n }))]);
    const now = r.now && r.now.kind !== 'none' ? r.now : null;
    const shareToggle = el('label', { className: 'q-switch' }, [(() => { const c = el('input', { type: 'checkbox' }); c.checked = !!r.sharing; c.addEventListener('change', () => { r.sharing = c.checked; S.store.set('qShare:' + r.id, r.sharing); lastShared = null; shareNow(); }); return c; })(), el('span', { text: t('share') })]);
    const nowCard = el('div', { className: 'q-now q-card' }, [
      el('p', { className: 'q-k', text: t('nowPlaying') }),
      el('p', { className: 'q-now-name', dir: 'auto', text: now ? label(now) : t('nothing') }),
      now ? btn(r.following ? t('listening') : '▶ ' + t('listen'), r.following ? 'btn' : 'btn btn-primary', () => { r.following = true; playThing(r.now); render(); }) : null,
      shareToggle
    ].filter(Boolean));
    const log = el('div', { className: 'q-log', 'aria-live': 'polite' }, r.msgs.map(m => msgView(m, r)));
    const composer = el('div', { className: 'q-compose' });
    if (recording) {
      composer.append(el('span', { className: 'q-rec-dot' }), el('span', { className: 'q-rec-time', text: '0″' }), el('span', { className: 'q-rec-meter' }, [el('b', { className: 'q-rec-level' })]),
        btn(t('cancelRec'), 'link-btn', cancelRec), btn('■ ' + t('stopRec'), 'btn btn-primary', recToggle));
    } else {
      const f = el('form', { className: 'q-say' });
      const input = el('input', { maxLength: 240, placeholder: t('say'), 'aria-label': t('say') });
      const mic = btn('🎙️', 'q-mic', recToggle); mic.setAttribute('aria-label', t('rec')); mic.title = t('rec');
      f.append(mic, input, el('button', { type: 'submit', className: 'btn btn-primary', text: t('send') }));
      f.addEventListener('submit', e => { e.preventDefault(); const v = input.value.trim(); input.value = ''; say(v); });
      composer.append(f);
    }
    const foot = el('div', { className: 'q-row' }, [
      btn('🃏 ' + t('cards'), 'btn', () => { document.dispatchEvent(new CustomEvent('sawt:open', { detail: 'tawleh' })); document.dispatchEvent(new CustomEvent('sawt:cards-room', { detail: r.id })); }),
      btn(t('leave'), 'link-btn', () => { rooms = rooms.filter(x => x.id !== r.id); saveRooms(); openRoom = null; screen = 'home'; render(); })
    ]);
    return el('div', { className: 'q-room' }, [head, here, nowCard, log, composer, err ? el('p', { className: 'form-error', role: 'alert', text: err }) : null, foot].filter(Boolean));
  }
  function renderLive() {
    const old = box.querySelector('.q-room');
    if (!old) { render(); return; }
    const v = roomView();
    ['.q-here', '.q-now'].forEach(sel => { const a = old.querySelector(sel), b = v.querySelector(sel); if (a && b) a.replaceWith(b); });
    // only add new messages, so audio that is playing keeps playing
    const log = old.querySelector('.q-log');
    const have = log.children.length;
    const fresh = openRoom.msgs.slice(have);
    fresh.forEach(m => log.appendChild(msgView(m, openRoom)));
    if (fresh.length) scrollLog();
  }
  function scrollLog() { const log = box.querySelector('.q-log'); if (log) requestAnimationFrame(() => { log.scrollTop = log.scrollHeight; }); }

  // ------------------------------------------------------------------ arriving by link
  async function arrive() {
    const m = location.pathname.match(/^\/q\/([A-Za-z0-9_-]{6,16})/);
    const q = new URLSearchParams(location.search).get('listen');
    const id = m ? m[1] : (q && !q.includes(':') ? q : null);
    if (q && q.includes(':')) {
      const [kind, ...rest] = q.split(':');
      const sid = rest.join(':');
      let name = sid;
      if (kind === 'tape') { const md = (C.moods || []).find(x => x.id === sid); if (md) name = md[S.lang()] || md.en; }
      shared = { kind, id: sid, name };
    }
    if (!id || !storeOn) return;
    const saved = rooms.find(r => r.id === id);
    if (saved && saved.token) { enter(saved); openRoom.following = true; return; }
    joinId = id; screen = 'join';
    try { joinTitle = (await api(`/api/q/${id}/peek`)).title; } catch (e) { err = errText(e); screen = 'home'; }
    render();
  }

  document.addEventListener('sawt:config', e => {
    storeOn = !!(e.detail && e.detail.dedications);
    arrive().then(render);
    // keep an ear on the last room even when the sofa is closed
    if (storeOn && !openRoom && rooms[0] && rooms[0].token && !location.pathname.startsWith('/q/')) { openRoom = { ...rooms[0], v: -1, since: 0, here: [], msgs: [], now: null, following: false, sharing: S.store.get('qShare:' + rooms[0].id, false) }; screen = 'room'; poll(true); }
  });
  document.addEventListener('sawt:stations', () => { if (shared && shared.kind === 'radio') { const st = S.stations().find(s => s.id === shared.id); if (st) { shared.name = st.name; render(); } } });
  document.addEventListener('sawt:lang', () => render());
  document.addEventListener('sawt:panel', e => { if (e.detail === 'together') { render(); if (openRoom) poll(true); } });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && openRoom) poll(true); });
  document.addEventListener('sawt:screen', () => { if (!openRoom) render(); });

  window.SawtRooms = {
    list: () => rooms.filter(r => r.token),
    current: () => openRoom,
    create: createRoom,
    enter: r => enter(r),
    api: (r, path, body) => api(`/api/q/${r.id}${path}`, body, r.token),
    sendVoice,
    invite,
    storeOn: () => storeOn
  };
  render();
})();

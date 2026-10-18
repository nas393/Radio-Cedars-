/* Voice dedications: record a few words for mama or teta, pick a song, and send it
   like a voice note. They open the link, hear your voice, and the song starts after it.
   Recorded in the browser; with the shared store it travels as a private link,
   otherwise the recording itself is shared (WhatsApp and the like). */
(() => {
  'use strict';
  const S = window.Sawt;
  const C = window.SAWT_CONTENT || {};
  const $ = id => document.getElementById(id);
  const el = S.el;
  const box = $('voice');
  if (!box) return;
  const MAX = 40;

  const T = {
    ar: {
      title: '🎙️ إهداء بصوتك', lede: 'سجّل كلمتين لأهلك (لحد ٤٠ ثانية) واختار أغنية. بيسمعوا صوتك، وبعدها بتبلّش الأغنية.',
      forX: n => `لـ ${n}`, from: 'من', to: 'لمين؟', toHint: 'مثلاً: ماما', song: 'الأغنية', songNow: n => `اللي عم يشتغل: ${n}`, songNone: 'بلا أغنية',
      rec: 'سجّل', stop: 'وقّف', play: 'اسمع', again: 'سجّل من جديد', send: 'ابعتها', sending: 'عم نبعت…',
      noMic: 'ما قدرنا نوصل للمايك. اسمحلنا نستعمله من إعدادات المتصفّح.', noRec: 'متصفّحك ما بيقدر يسجّل. جرّب Chrome أو Safari جديد.',
      shareText: (a, b) => `🎙️ رسالة بصوت ${a} لـ ${b}، مع أغنية من البيت`, sent: 'انبعتت 💌', private: 'الرسالة خاصة: بس اللي معه الرابط بيسمعها، وبتنمحى بعد ٣٠ يوم.',
      fileNote: 'بتنبعت الرسالة كملف صوت، ومعها رابط الأغنية.',
      gotTitle: (a, b) => `🎙️ رسالة من ${a} لـ ${b}`, gotPlay: 'اسمع الرسالة', gotSong: n => `وبعدها: ${n}`, gotGone: 'هالرسالة ما عادت موجودة (بتنمحى بعد ٣٠ يوم).',
      errs: { links: 'بلا روابط بالأسامي.', phone: 'بلا أرقام.', rate: 'كتير رسائل هالساعة. جرّب بعد شوي.', audio: 'التسجيل طويل كتير.', missing: 'اكتب اسمك ولمين الرسالة.', server: 'في مشكلة، جرّب كمان مرة.' }
    },
    en: {
      title: '🎙️ A dedication in your voice', lede: 'Record a few words for your family (up to 40 seconds) and pick a song. They hear your voice, then the song starts.',
      forX: n => `For ${n}`, from: 'From', to: 'To whom?', toHint: 'e.g. Mama', song: 'Song', songNow: n => `Playing now: ${n}`, songNone: 'No song',
      rec: 'Record', stop: 'Stop', play: 'Listen', again: 'Record again', send: 'Send it', sending: 'Sending…',
      noMic: 'We couldn’t reach the microphone. Allow it in your browser settings.', noRec: 'This browser can’t record. Try a recent Chrome or Safari.',
      shareText: (a, b) => `🎙️ A voice message from ${a} to ${b}, with a song from home`, sent: 'Sent 💌', private: 'Private: only people with the link can hear it, and it disappears after 30 days.',
      fileNote: 'Your recording is sent as an audio file, with a link to the song.',
      gotTitle: (a, b) => `🎙️ From ${a} to ${b}`, gotPlay: 'Play the message', gotSong: n => `Then: ${n}`, gotGone: 'This message is no longer here (they disappear after 30 days).',
      errs: { links: 'No links in the names.', phone: 'No numbers.', rate: 'Too many messages this hour. Try again later.', audio: 'The recording is too long.', missing: 'Add your name and who it’s for.', server: 'Something went wrong, try again.' }
    },
    fr: {
      title: '🎙️ Une dédicace de vive voix', lede: 'Enregistrez quelques mots pour la famille (jusqu’à 40 secondes) et choisissez une chanson. Ils entendent votre voix, puis la chanson.',
      forX: n => `Pour ${n}`, from: 'De', to: 'Pour qui ?', toHint: 'ex. Maman', song: 'Chanson', songNow: n => `En ce moment : ${n}`, songNone: 'Sans chanson',
      rec: 'Enregistrer', stop: 'Arrêter', play: 'Écouter', again: 'Recommencer', send: 'Envoyer', sending: 'Envoi…',
      noMic: 'Impossible d’accéder au micro. Autorisez-le dans les réglages du navigateur.', noRec: 'Ce navigateur ne sait pas enregistrer. Essayez un Chrome ou Safari récent.',
      shareText: (a, b) => `🎙️ Un message de ${a} pour ${b}, avec une chanson du pays`, sent: 'Envoyé 💌', private: 'Privé : seuls ceux qui ont le lien l’entendent, et il s’efface après 30 jours.',
      fileNote: 'L’enregistrement part comme fichier audio, avec le lien de la chanson.',
      gotTitle: (a, b) => `🎙️ De ${a} pour ${b}`, gotPlay: 'Écouter le message', gotSong: n => `Puis : ${n}`, gotGone: 'Ce message n’existe plus (ils s’effacent après 30 jours).',
      errs: { links: 'Pas de liens dans les noms.', phone: 'Pas de numéros.', rate: 'Trop de messages cette heure-ci.', audio: 'Enregistrement trop long.', missing: 'Indiquez votre prénom et le destinataire.', server: 'Un souci, réessayez.' }
    }
  };
  const t = (k, ...a) => { const v = (T[S.lang()] || T.ar)[k]; return typeof v === 'function' ? v(...a) : v; };

  let storeOn = false;
  let rec = null, chunks = [], blob = null, mime = '', seconds = 0, tStart = 0, timer = null, stream = null, analyser = null, level = 0;
  let state = 'idle';           // idle | recording | done | sending | sent
  let err = '';
  let songChoice = 'now';
  let got = null;               // a voice note that arrived by link
  const fromSaved = S.store.get('dedFrom', null) || {};
  const fields = { from: fromSaved.fromName || '', to: '' };

  function pickMime() {
    if (!window.MediaRecorder) return null;
    for (const m of ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm']) {
      try { if (MediaRecorder.isTypeSupported(m)) return m; } catch { /* old */ }
    }
    return '';
  }
  async function startRec() {
    err = '';
    const m = pickMime();
    if (m === null || !navigator.mediaDevices) { err = t('noRec'); render(); return; }
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
    catch { err = t('noMic'); render(); return; }
    // radio and tapes pause while you speak
    if (S.isOn && S.isOn()) S.setPower(false);
    if (window.SawtScreen && window.SawtScreen.current()) window.SawtScreen.close();
    chunks = []; blob = null;
    rec = new MediaRecorder(stream, m ? { mimeType: m, audioBitsPerSecond: 32000 } : { audioBitsPerSecond: 32000 });
    mime = rec.mimeType || m || 'audio/webm';
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      blob = new Blob(chunks, { type: mime });
      stream.getTracks().forEach(tr => tr.stop());
      state = 'done'; render();
    };
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const src = ac.createMediaStreamSource(stream);
      analyser = ac.createAnalyser(); analyser.fftSize = 512; src.connect(analyser);
    } catch { analyser = null; }
    rec.start(250);
    state = 'recording'; tStart = Date.now(); seconds = 0;
    clearInterval(timer);
    timer = setInterval(() => {
      seconds = (Date.now() - tStart) / 1000;
      if (analyser) { const a = new Uint8Array(analyser.fftSize); analyser.getByteTimeDomainData(a); let m2 = 0; for (const v of a) m2 = Math.max(m2, Math.abs(v - 128)); level = Math.min(1, m2 / 60); }
      if (seconds >= MAX) stopRec();
      paintRec();
    }, 100);
    render();
  }
  function stopRec() { clearInterval(timer); if (rec && rec.state !== 'inactive') rec.stop(); }

  function songObj() {
    if (songChoice === 'none') return { kind: 'none', id: '', name: '' };
    if (songChoice === 'now') {
      const sc = window.SawtScreen && window.SawtScreen.current();
      if (sc && sc.kind === 'tape') return { kind: 'tape', id: sc.mood.id, name: sc.name };
      const st = S.current && S.current();
      if (st) return { kind: 'radio', id: st.id, name: st.name };
      return { kind: 'none', id: '', name: '' };
    }
    const md = (C.moods || []).find(x => x.id === songChoice);
    return md ? { kind: 'tape', id: md.id, name: md[S.lang()] || md.en } : { kind: 'none', id: '', name: '' };
  }
  function songLink(song) {
    if (song.kind === 'radio') return `${location.origin}/s/${encodeURIComponent(song.id)}`;
    if (song.kind === 'tape') return `${location.origin}/?listen=${encodeURIComponent('tape:' + song.id)}#together`;
    return location.origin + '/';
  }
  const toB64 = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = rej; r.readAsDataURL(b); });

  async function send() {
    if (!blob) return;
    if (!fields.from || !fields.to) { err = t('errs').missing; render(); return; }
    S.store.set('dedFrom', { ...(S.store.get('dedFrom', null) || {}), fromName: fields.from });
    const song = songObj();
    const text = t('shareText', fields.from, fields.to);
    err = '';
    if (storeOn) {
      state = 'sending'; render();
      try {
        const res = await fetch('/api/voice', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: mime, audio: await toB64(blob), fromName: fields.from, toName: fields.to, song, seconds: Math.round(seconds), lang: S.lang() }) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { err = t('errs')[data.code] || t('errs').server; state = 'done'; render(); return; }
        const url = `${location.origin}/v/${data.id}`;
        state = 'sent'; render();
        if (navigator.share) { try { await navigator.share({ text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
        window.open('https://wa.me/?text=' + encodeURIComponent(`${text}\n${url}`), '_blank', 'noopener');
      } catch { err = t('errs').server; state = 'done'; render(); }
      return;
    }
    // no shared store: send the recording itself
    const ext = mime.includes('mp4') ? 'm4a' : mime.includes('ogg') ? 'ogg' : 'webm';
    const file = new File([blob], `ihda2-${fields.to || 'family'}.${ext}`.replace(/\s+/g, '-'), { type: mime.split(';')[0] });
    const url = songLink(song);
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], text: `${text}\n${url}` }); state = 'sent'; render(); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
    window.open('https://wa.me/?text=' + encodeURIComponent(`${text}\n${url}`), '_blank', 'noopener');
    state = 'sent'; render();
  }

  // ------------------------------------------------------------------ drawing
  function reels(active) {
    return el('div', { className: 'vc-tape' + (active ? ' is-rolling' : '') }, [
      el('span', { className: 'vc-label', dir: 'auto', text: fields.to ? t('forX', fields.to) : 'SAWT EL BEIT' }),
      el('span', { className: 'vc-reels' }, [el('i'), el('i')]),
      el('span', { className: 'vc-level' }, [el('b')])
    ]);
  }
  function paintRec() {
    const time = box.querySelector('.vc-time');
    if (time) time.textContent = `${S.num(Math.floor(seconds))} / ${S.num(MAX)}`;
    const lv = box.querySelector('.vc-level b');
    if (lv) lv.style.transform = `scaleX(${0.05 + level * 0.95})`;
  }
  function render() {
    const kids = [];
    if (got) kids.push(gotCard());
    kids.push(el('h3', { className: 'pv-sub vc-title', text: t('title') }), el('p', { className: 'pv-lede', text: t('lede') }));
    const from = el('input', { maxLength: 40, value: fields.from, autocomplete: 'given-name' });
    from.addEventListener('input', () => { fields.from = from.value; });
    const to = el('input', { maxLength: 40, value: fields.to, placeholder: t('toHint') });
    to.addEventListener('input', () => { fields.to = to.value; const l = box.querySelector('.vc-label'); if (l) l.textContent = to.value ? t('forX', to.value) : 'SAWT EL BEIT'; });
    const sel = el('select', {});
    const nowSong = (() => { const sc = window.SawtScreen && window.SawtScreen.current(); if (sc && sc.kind === 'tape') return sc.name; const st = S.current && S.current(); return st ? st.name : ''; })();
    if (nowSong) sel.appendChild(el('option', { value: 'now', text: t('songNow', nowSong) }));
    (C.moods || []).forEach(m => sel.appendChild(el('option', { value: m.id, text: `📼 ${m[S.lang()] || m.en}` })));
    sel.appendChild(el('option', { value: 'none', text: t('songNone') }));
    if (!nowSong && songChoice === 'now') songChoice = (C.moods && C.moods[0] && C.moods[0].id) || 'none';
    sel.value = songChoice;
    sel.addEventListener('change', () => { songChoice = sel.value; });
    kids.push(el('div', { className: 'form-grid' }, [
      el('label', { className: 'field' }, [el('span', { text: t('from') }), from]),
      el('label', { className: 'field' }, [el('span', { text: t('to') }), to])
    ]), el('label', { className: 'field' }, [el('span', { text: t('song') }), sel]));
    kids.push(reels(state === 'recording'));
    const row = el('div', { className: 'vc-row' });
    const btn = (label, cls, fn) => { const b = el('button', { type: 'button', className: 'btn ' + (cls || ''), text: label }); b.addEventListener('click', fn); return b; };
    if (state === 'recording') {
      row.append(btn('■ ' + t('stop'), 'btn-primary vc-stop', stopRec), el('span', { className: 'vc-time', text: `${S.num(Math.floor(seconds))} / ${S.num(MAX)}` }));
    } else if (state === 'done' || state === 'sending' || state === 'sent') {
      const au = el('audio', { controls: true, src: URL.createObjectURL(blob), className: 'vc-audio' });
      kids.push(au);
      row.append(btn('↺ ' + t('again'), '', startRec));
      if (state === 'sent') row.append(el('span', { className: 'vc-sent', text: t('sent') }));
      const s = btn(state === 'sending' ? t('sending') : '💌 ' + t('send'), 'btn-primary', send);
      s.disabled = state === 'sending';
      row.append(s);
    } else {
      row.append(btn('● ' + t('rec'), 'btn-primary vc-rec', startRec));
    }
    kids.push(row);
    if (err) kids.push(el('p', { className: 'form-error', role: 'alert', text: err }));
    kids.push(el('p', { className: 'quiet small', text: storeOn ? t('private') : t('fileNote') }));
    box.replaceChildren(...kids);
  }

  // ------------------------------------------------------------------ a voice note that arrived
  function gotCard() {
    if (got.gone) return el('div', { className: 'q-card vc-got' }, [el('p', { text: t('gotGone') })]);
    const au = el('audio', { preload: 'auto', src: `/api/voice/${got.id}/audio` });
    const b = el('button', { type: 'button', className: 'btn btn-primary', text: '▶ ' + t('gotPlay') });
    b.addEventListener('click', () => {
      if (S.isOn && S.isOn()) S.setPower(false);
      au.play().catch(() => {});
      b.disabled = true;
    });
    au.addEventListener('ended', () => {
      b.disabled = false;
      const s = got.song;
      if (!s || s.kind === 'none') return;
      if (s.kind === 'radio') { if (S.showStation(s.id)) S.setPower(true); }
      else { const md = (C.moods || []).find(x => x.id === s.id); if (md && window.SawtScreen) { window.SawtScreen.playTape(md); document.dispatchEvent(new CustomEvent('sawt:open', { detail: 'cassettes' })); } }
    });
    return el('div', { className: 'q-card vc-got' }, [
      el('p', { className: 'vc-got-title', dir: 'auto', text: t('gotTitle', got.fromName, got.toName) }),
      got.song && got.song.name ? el('p', { className: 'quiet', dir: 'auto', text: t('gotSong', got.song.name) }) : null,
      b, au
    ].filter(Boolean));
  }
  async function loadGot() {
    const m = location.pathname.match(/^\/v\/([A-Za-z0-9_-]{8,20})/) || [null, new URLSearchParams(location.search).get('v')];
    const id = m && m[1];
    if (!id) return;
    try {
      const res = await fetch('/api/voice/' + encodeURIComponent(id));
      got = res.ok ? await res.json() : { gone: true };
    } catch { got = { gone: true }; }
    render();
  }

  document.addEventListener('sawt:config', e => { storeOn = !!(e.detail && e.detail.dedications); if (storeOn) loadGot(); render(); });
  document.addEventListener('sawt:lang', render);
  document.addEventListener('sawt:panel', e => { if (e.detail === 'phone' && state !== 'recording') render(); });
  render();
})();

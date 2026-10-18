/* "قعدة سوا" on the sofa: listen together from different countries.
   Start a sitting, send the link on WhatsApp, and whoever opens it hears what
   you play (the radio is live, so it is the very same moment) and can leave a
   few words. Without the shared store it still works as a link: the other
   side gets the same station or tape with one tap. */
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
      lede: 'اقعدوا سوا ولو كل واحد ببلد: نفس الإذاعة، بنفس اللحظة.',
      nowPlaying: 'عم يشتغل هلّق', nothing: 'ولا شي عم يشتغل. شغّل الراديو أو شريط، وبعدين اعزم أهلك.',
      yourName: 'اسمك', start: 'افتح قعدة', invite: 'اعزم أهلك على واتساب', inviteSimple: 'ابعت هالأغنية لحدا يسمعها معك',
      here: 'قاعدين هلّق', host: 'صاحب القعدة', you: 'إنت', join: 'إسمع معهن', joined: 'عم تسمع معهن ✓',
      say: 'اكتب كلمة…', send: 'ابعت', leave: 'فلّ من القعدة', gone: 'القعدة خلصت. بتقدر تفتح وحدة جديدة.',
      invited: n => `${n} عازمك تسمعوا سوا`, inviteText: n => `تعا نسمع سوا عصوت البيت 🛋️ (${n})`,
      listenNow: 'اسمع هلّق', sharedSong: 'حدا بعتلك تسمع هيدا', note: 'القعدة خاصة: بس اللي معه الرابط بيفوت. بتنمحى بعد ١٢ ساعة.',
      errs: { links: 'بلا روابط.', phone: 'بلا أرقام تلفون.', rude: 'خلّيها حلوة 🙂', rate: 'شوي شوي… جرّب بعد دقيقة.', name: 'اختار اسم تاني.', gone: 'القعدة خلصت.', server: 'في مشكلة، جرّب كمان مرة.' },
      radio: 'راديو', tape: 'شريط', live: 'تلفزيون'
    },
    en: {
      lede: 'Sit together even when you are countries apart: the same station, at the same moment.',
      nowPlaying: 'Playing now', nothing: 'Nothing is playing. Turn on the radio or a tape, then invite your family.',
      yourName: 'Your name', start: 'Start a sitting', invite: 'Invite family on WhatsApp', inviteSimple: 'Send this to someone to listen with you',
      here: 'Here now', host: 'Host', you: 'You', join: 'Listen with them', joined: 'Listening with them ✓',
      say: 'Say something…', send: 'Send', leave: 'Leave', gone: 'This sitting has ended. You can start a new one.',
      invited: n => `${n} invited you to listen together`, inviteText: n => `Come listen with me on Sawt el Beit 🛋️ (${n})`,
      listenNow: 'Listen now', sharedSong: 'Someone sent you this to listen to', note: 'Private: only people with the link can come in. It disappears after 12 hours.',
      errs: { links: 'No links, please.', phone: 'No phone numbers, please.', rude: 'Keep it sweet 🙂', rate: 'Easy… try again in a minute.', name: 'Pick another name.', gone: 'This sitting has ended.', server: 'Something went wrong, try again.' },
      radio: 'Radio', tape: 'Tape', live: 'TV'
    },
    fr: {
      lede: 'Être ensemble même à des pays de distance : la même radio, au même moment.',
      nowPlaying: 'En ce moment', nothing: 'Rien ne joue. Allumez la radio ou une cassette, puis invitez la famille.',
      yourName: 'Votre prénom', start: 'Ouvrir une veillée', invite: 'Inviter la famille sur WhatsApp', inviteSimple: 'Envoyer à quelqu’un pour écouter ensemble',
      here: 'Présents', host: 'Hôte', you: 'Vous', join: 'Écouter avec eux', joined: 'Vous écoutez avec eux ✓',
      say: 'Un petit mot…', send: 'Envoyer', leave: 'Partir', gone: 'Cette veillée est terminée. Vous pouvez en ouvrir une autre.',
      invited: n => `${n} vous invite à écouter ensemble`, inviteText: n => `Viens écouter avec moi sur Sawt el Beit 🛋️ (${n})`,
      listenNow: 'Écouter', sharedSong: 'Quelqu’un vous envoie ceci à écouter', note: 'Privé : seuls ceux qui ont le lien entrent. Tout s’efface après 12 heures.',
      errs: { links: 'Pas de liens.', phone: 'Pas de numéros.', rude: 'Restons gentils 🙂', rate: 'Doucement… réessayez dans une minute.', name: 'Choisissez un autre prénom.', gone: 'Cette veillée est terminée.', server: 'Un souci, réessayez.' },
      radio: 'Radio', tape: 'Cassette', live: 'Télé'
    }
  };
  const t = (k, ...a) => { const v = (T[S.lang()] || T.ar)[k]; return typeof v === 'function' ? v(...a) : v; };

  let storeOn = false;
  let room = null;            // { id, host?, name, v, since, here, msgs, now, followed }
  let pollTimer = null;
  let shared = null;          // a song shared by a plain link (no room)
  let err = '';

  // ------------------------------------------------------------------ what is playing here
  function nowHere() {
    const sc = window.SawtScreen && window.SawtScreen.current();
    if (sc && sc.kind === 'tape') return { kind: 'tape', id: sc.mood.id, name: sc.name, src: sc.src };
    if (sc && sc.kind === 'live') return { kind: 'live', id: sc.channel, name: sc.name };
    const st = S.current && S.current();
    if (st && S.isOn && S.isOn()) return { kind: 'radio', id: st.id, name: st.name };
    return { kind: 'none', id: '', name: '' };
  }
  function playThing(n) {
    if (!n || n.kind === 'none') return;
    if (n.kind === 'radio') { if (S.showStation(n.id)) S.setPower(true); }
    else if (n.kind === 'tape') { const m = (C.moods || []).find(x => x.id === n.id); if (m && window.SawtScreen) window.SawtScreen.playTape(m, n.src || 'yt'); }
    else if (n.kind === 'live' && window.SawtScreen) window.SawtScreen.playLive(n.id);
  }
  const same = (a, b) => a && b && a.kind === b.kind && a.id === b.id;
  function label(n) { return n.kind === 'none' ? '' : `${t(n.kind) || ''} · ${n.name}`; }

  // ------------------------------------------------------------------ server
  async function api(path, body) {
    const res = await fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(data.code || 'server'); e.code = data.code || 'server'; throw e; }
    return data;
  }
  function saveRoom() { try { S.store.set('qRoom', room ? { id: room.id, host: room.host || null, name: room.name } : null); } catch { /* fine */ } }

  async function start(name) {
    err = '';
    try {
      const d = await api('/api/q', { name, now: nowHere() });
      room = { id: d.id, host: d.host, name, v: 0, since: 0, here: [name], msgs: [], now: nowHere(), followed: true };
      S.store.set('qName', name);
      saveRoom(); poll(); render();
      invite();
    } catch (e) { err = t('errs')[e.code] || t('errs').server; render(); }
  }
  async function enter(id, name, follow) {
    room = { id, host: null, name, v: -1, since: 0, here: [], msgs: [], now: null, followed: !!follow };
    S.store.set('qName', name);
    saveRoom();
    try { await api(`/api/q/${id}/hello`, { name }); } catch (e) { if (e.code === 'gone') { room = null; saveRoom(); err = t('gone'); render(); return; } }
    poll(); render();
  }
  let polling = false;
  async function poll() {
    clearTimeout(pollTimer);
    if (!room || polling) return;
    polling = true;
    try {
      const d = await api(`/api/q/${room.id}?since=${room.since}`);
      room.here = d.here; room.hostName = d.host;
      if (d.msgs.length) { room.msgs = room.msgs.concat(d.msgs).slice(-40); room.since = d.msgs[d.msgs.length - 1].n; }
      if (!room.host && d.v !== room.v) {
        room.v = d.v; room.now = d.now;
        if (room.followed && !same(nowHere(), d.now)) playThing(d.now);   // follow the host
      }
      if (room.host) room.now = nowHere();
      if (!room.here.includes(room.name)) api(`/api/q/${room.id}/hello`, { name: room.name }).catch(() => {});
      render(true);
    } catch (e) {
      if (e.code === 'gone') { polling = false; room = null; saveRoom(); err = t('gone'); render(); return; }
    }
    polling = false;
    pollTimer = setTimeout(poll, document.hidden ? 15000 : (window.SawtRoom && window.SawtRoom.isOpen() === 'together' ? 3000 : 8000));
  }
  let lastPushed = null;
  async function pushNow() {
    if (!room || !room.host) return;
    const n = nowHere();
    if (same(n, lastPushed) || (n.kind === 'none' && (!lastPushed || lastPushed.kind === 'none'))) return;
    lastPushed = n;
    try { await api(`/api/q/${room.id}/play`, { host: room.host, now: n }); } catch { /* next change */ }
    room.now = n; render(true);
  }
  ['play', 'pause'].forEach(ev => $('audio').addEventListener(ev, () => setTimeout(pushNow, 300)));
  document.addEventListener('sawt:screen', () => setTimeout(pushNow, 300));
  async function say(text) {
    if (!room || !text) return;
    try { await api(`/api/q/${room.id}/say`, { name: room.name, text }); err = ''; poll(); }
    catch (e) { err = t('errs')[e.code] || t('errs').server; render(); }
  }
  function leave() { room = null; saveRoom(); clearTimeout(pollTimer); render(); }

  async function invite() {
    let url, text;
    if (room) { url = `${location.origin}/q/${room.id}`; text = t('inviteText', room.name); }
    else {
      const n = nowHere();
      if (n.kind === 'none') return;
      url = `${location.origin}/?listen=${encodeURIComponent(n.kind + ':' + n.id)}#together`;
      text = t('inviteText', n.name);
    }
    if (navigator.share) { try { await navigator.share({ text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    window.open('https://wa.me/?text=' + encodeURIComponent(`${text}\n${url}`), '_blank', 'noopener');
  }

  // ------------------------------------------------------------------ drawing
  let pendingJoin = null;      // arrived by a sitting's link, not in yet
  function render(soft) {
    if (soft && box.contains(document.activeElement) && document.activeElement.tagName === 'INPUT') { renderLive(); return; }
    if (!room && pendingJoin) { if (!soft) askName(pendingJoin); return; }
    const kids = [el('p', { className: 'pv-lede', text: t('lede') })];
    const n = nowHere();
    if (shared && !room) {
      const b = el('button', { type: 'button', className: 'btn btn-primary', text: '▶ ' + t('listenNow') });
      b.addEventListener('click', () => { playThing(shared); shared = null; render(); });
      kids.push(el('div', { className: 'q-card q-invite' }, [el('p', { className: 'q-k', text: t('sharedSong') }), el('p', { className: 'q-now-name', dir: 'auto', text: shared.name || shared.id }), b]));
    }
    if (!room) {
      kids.push(el('div', { className: 'q-card' }, [
        el('p', { className: 'q-k', text: t('nowPlaying') }),
        el('p', { className: 'q-now-name', dir: 'auto', text: n.kind === 'none' ? t('nothing') : label(n) })
      ]));
      if (storeOn) {
        const f = el('form', { className: 'q-start' });
        const name = el('input', { maxLength: 24, required: true, value: S.store.get('qName', '') || S.store.get('tawlehMe', '') || '', autocomplete: 'given-name' });
        f.append(el('label', { className: 'field' }, [el('span', { text: t('yourName') }), name]),
          el('button', { type: 'submit', className: 'btn btn-primary', text: '🛋️ ' + t('start') }));
        f.addEventListener('submit', e => { e.preventDefault(); const v = name.value.trim(); if (v) start(v); });
        kids.push(f);
      }
      if (n.kind !== 'none') {
        const b = el('button', { type: 'button', className: storeOn ? 'link-btn' : 'btn btn-primary', text: '📲 ' + t('inviteSimple') });
        b.addEventListener('click', invite);
        kids.push(b);
      }
    } else {
      kids.push(roomView());
    }
    if (err) kids.push(el('p', { className: 'form-error', role: 'alert', text: err }));
    if (storeOn) kids.push(el('p', { className: 'quiet small', text: t('note') }));
    box.replaceChildren(...kids);
    const log = box.querySelector('.q-log'); if (log) log.scrollTop = log.scrollHeight;
  }
  function renderLive() {
    const v = roomView();
    const old = box.querySelector('.q-room');
    if (!old) return;
    // keep the input as it is; refresh the rest
    ['.q-now', '.q-here', '.q-log'].forEach(sel => { const a = old.querySelector(sel), b = v.querySelector(sel); if (a && b) a.replaceWith(b); });
    const log = box.querySelector('.q-log'); if (log) log.scrollTop = log.scrollHeight;
  }
  function roomView() {
    const isHost = !!room.host;
    const now = isHost ? nowHere() : room.now;
    const parts = [];
    parts.push(el('div', { className: 'q-now q-card' }, [
      el('p', { className: 'q-k', text: t('nowPlaying') }),
      el('p', { className: 'q-now-name', dir: 'auto', text: now && now.kind !== 'none' ? label(now) : (isHost ? t('nothing') : '…') }),
      !isHost ? (() => {
        const b = el('button', { type: 'button', className: room.followed ? 'btn' : 'btn btn-primary', text: room.followed ? t('joined') : '▶ ' + t('join') });
        b.addEventListener('click', () => { room.followed = true; playThing(room.now); render(); });
        return b;
      })() : null
    ].filter(Boolean)));
    parts.push(el('div', { className: 'q-here' }, [
      el('span', { className: 'q-k', text: t('here') }),
      ...room.here.map(n => el('span', { className: 'q-person' + (n === room.name ? ' is-me' : ''), dir: 'auto', text: (n === (room.hostName || (isHost ? room.name : '')) ? '🛋️ ' : '') + n }))
    ]));
    parts.push(el('div', { className: 'q-log', 'aria-live': 'polite' }, room.msgs.map(m => el('p', { className: 'q-msg' + (m.name === room.name ? ' is-me' : '') }, [
      el('b', { dir: 'auto', text: m.name }), el('span', { dir: 'auto', text: m.text })
    ]))));
    const f = el('form', { className: 'q-say' });
    const input = el('input', { maxLength: 140, placeholder: t('say'), 'aria-label': t('say') });
    f.append(input, el('button', { type: 'submit', className: 'btn btn-primary', text: t('send') }));
    f.addEventListener('submit', e => { e.preventDefault(); const v = input.value.trim(); input.value = ''; say(v); });
    parts.push(f);
    const row = el('div', { className: 'q-row' });
    const inv = el('button', { type: 'button', className: 'btn', text: '📲 ' + t('invite') }); inv.addEventListener('click', invite);
    const lv = el('button', { type: 'button', className: 'link-btn', text: t('leave') }); lv.addEventListener('click', leave);
    row.append(inv, lv);
    parts.push(row);
    return el('div', { className: 'q-room' }, parts);
  }

  // ------------------------------------------------------------------ arriving by link
  function fromUrl() {
    const m = location.pathname.match(/^\/q\/([A-Za-z0-9_-]{6,16})/);
    const q = new URLSearchParams(location.search).get('listen');
    if (m || (q && !q.includes(':'))) return { room: m ? m[1] : q };
    if (q && q.includes(':')) {
      const [kind, ...rest] = q.split(':');
      const id = rest.join(':');
      let name = id;
      if (kind === 'radio') { const st = (S.stations() || []).find(s => s.id === id); if (st) name = st.name; }
      if (kind === 'tape') { const md = (C.moods || []).find(x => x.id === id); if (md) name = md[S.lang()] || md.en; }
      return { shared: { kind, id, name } };
    }
    return null;
  }
  function askName(id) {
    const kids = [el('p', { className: 'pv-lede', text: t('lede') })];
    const f = el('form', { className: 'q-start' });
    const name = el('input', { maxLength: 24, required: true, value: S.store.get('qName', '') || '', autocomplete: 'given-name' });
    f.append(el('p', { className: 'q-k', text: '🛋️' }), el('label', { className: 'field' }, [el('span', { text: t('yourName') }), name]),
      el('button', { type: 'submit', className: 'btn btn-primary', text: t('join') }));
    f.addEventListener('submit', e => { e.preventDefault(); const v = name.value.trim(); if (!v) return; pendingJoin = null; enter(id, v, true); });
    kids.push(f);
    box.replaceChildren(...kids);
  }

  document.addEventListener('sawt:config', e => {
    storeOn = !!(e.detail && e.detail.dedications);
    const arrive = fromUrl();
    const saved = S.store.get('qRoom', null);
    if (arrive && arrive.room && storeOn) {
      if (saved && saved.id === arrive.room) { room = { ...saved, v: -1, since: 0, here: [], msgs: [], now: null, followed: false }; poll(); render(); }
      else { pendingJoin = arrive.room; askName(arrive.room); }
      return;
    }
    if (arrive && arrive.shared) shared = arrive.shared;
    if (saved && storeOn) { room = { ...saved, v: -1, since: 0, here: [], msgs: [], now: null, followed: !!saved.host }; poll(); }
    render();
  });
  document.addEventListener('sawt:stations', () => { if (shared && shared.kind === 'radio') { const st = S.stations().find(s => s.id === shared.id); if (st) { shared.name = st.name; render(); } } });
  document.addEventListener('sawt:lang', () => render());
  document.addEventListener('sawt:panel', e => { if (e.detail === 'together') { render(); if (room) poll(); } });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && room) poll(); });
  ['play', 'pause'].forEach(ev => $('audio').addEventListener(ev, () => { if (!room) render(true); }));
  document.addEventListener('sawt:screen', () => { if (!room) render(true); });
  render();
})();

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
  Object.assign(T.ar, {
    inviteBtn: '＋ ادعي حدا', eventToday: w => `🎉 اليوم: ${w}!`, plTitle: 'أغاني الغرفة', plPaste: 'حطّ رابط أغنية من يوتيوب', plPlayAll: '▶ شغّلها كلّها عالتلفزيون', plEmpty: 'بعد ما حدا زاد أغنية. زيد أوّل وحدة!', plBy: n => `زادها ${n}`, reply: 'ردّ', del: 'امحي', delAsk: 'تمحي هالرسالة عند الكل؟', deleted: '🚫 انمحت هالرسالة', replyingTo: n => `↩ عم تردّ على ${n}`, seenBy: l => `✓✓ شافها ${l}`, seenAll: '✓✓ شافوها الكل', inviteGame: (r, g, p) => `تعا نلعب ${g} بغرفة "${r}" بصوت البيت 🎲${p ? `\nالرمز: ${p}` : ''}`, gameStarted: (n, g) => `🎲 ${n} فتح ${g}، تعا العب!`, joinGame: 'العب معهن', gname: { tawleh: 'طاولة', tarneeb: 'طرنيب', likha: 'ليخة', trivia: 'سهرة أسئلة' }, holdTalk: 'دوس وكفّي ضاغط لتسجّل، وشيل إصبعك لتبعت', slideCancel: '← اسحب لتلغي', mute: '🔕 اسكت هالغرفة', muted: '🔕 الغرفة ساكتة ✓', more: '⋯ أكتر', less: 'سكّر ⋯', notify: '📲 نبّهني بالرسايل', notifyOn: '📲 بتوصلك الرسايل ✓', blocked: 'التنبيهات مسكّرة لهالموقع بالمتصفّح.', ios: 'على الآيفون، ثبّت التطبيق عالشاشة أوّل (مشاركة ← زيد عالشاشة الرئيسية).', chat: 'الدردشة', playTawleh: 'طاولة بالغرفة', playTrivia: 'سهرة أسئلة', photo: 'ابعت صورة', sending: 'عم يبعت…', typing1: n => `${n} عم يكتب…`, typingN: n => `${S.num(n)} عم يكتبوا…`,
    knock: 'دقّ الجرس', knocked: n => `🔔 ${n} دقّ الجرس!`, react: 'تفاعل', quick: 'كلمات سريعة', bigPhoto: 'كبّر الصورة',
    phrases: ['وصلت بالسلامة 🏠', 'اشتقنالكن ❤️', 'صباح الخير ☕', 'تصبحوا على خير 🌙', 'كيفكن؟', 'الله يخلّيكن 🙏', 'هههههه 😂', 'يلّا نلعب طاولة؟ 🎲'],
    bday: w => `🎂 اليوم عيد ميلاد ${w}! كل سنة وإنت سالم/ة 🎉`, nameday: w => `🕯️ اليوم عيد شفيع ${w}. كل عيد وإنت بخير`,
    errs2: { type: 'هالنوع من الصور ما بيمشي.', big: 'الصورة كبيرة كتير.', yt: 'هيدا مش رابط يوتيوب.' }, today: 'اليوم', yesterday: 'مبارح'
  });
  Object.assign(T.en, {
    inviteBtn: '＋ Invite someone', eventToday: w => `🎉 Today: ${w}!`, plTitle: 'The room’s songs', plPaste: 'Paste a YouTube song link', plPlayAll: '▶ Play them all on the TV', plEmpty: 'No songs yet. Add the first one!', plBy: n => `added by ${n}`, reply: 'Reply', del: 'Delete', delAsk: 'Delete this message for everyone?', deleted: '🚫 This message was deleted', replyingTo: n => `↩ Replying to ${n}`, seenBy: l => `✓✓ Seen by ${l}`, seenAll: '✓✓ Seen by everyone', inviteGame: (r, g, p) => `Come and play ${g} in "${r}" on Sawt el Beit 🎲${p ? `\nPasscode: ${p}` : ''}`, gameStarted: (n, g) => `🎲 ${n} opened ${g}. Come and play!`, joinGame: 'Join the game', gname: { tawleh: 'tawleh', tarneeb: 'Tarneeb', likha: 'Likha', trivia: 'trivia night' }, holdTalk: 'Hold to record, let go to send', slideCancel: '← slide to cancel', mute: '🔕 Mute this room', muted: '🔕 Room muted ✓', more: '⋯ More', less: 'Close ⋯', notify: '📲 Notify me of messages', notifyOn: '📲 Message alerts on ✓', blocked: 'Notifications are blocked for this site in your browser.', ios: 'On iPhone, add the app to your home screen first (Share → Add to Home Screen).', chat: 'Chat', playTawleh: 'Tawleh in the room', playTrivia: 'Trivia night', photo: 'Send a photo', sending: 'Sending…', typing1: n => `${n} is typing…`, typingN: n => `${n} people are typing…`,
    knock: 'Ring the bell', knocked: n => `🔔 ${n} rang the bell!`, react: 'React', quick: 'Quick words', bigPhoto: 'Open the photo',
    phrases: ['Got home safe 🏠', 'Miss you all ❤️', 'Good morning ☕', 'Good night 🌙', 'How are you all?', 'Love you all 🙏', 'Hahaha 😂', 'Tawleh, anyone? 🎲'],
    bday: w => `🎂 It’s ${w}’s birthday today! Many happy returns 🎉`, nameday: w => `🕯️ Today is ${w}’s name day. Eid mubarak`,
    errs2: { type: 'That kind of picture can’t be sent.', big: 'That picture is too big.', yt: 'That isn’t a YouTube link.' }, today: 'Today', yesterday: 'Yesterday'
  });
  Object.assign(T.fr, {
    inviteBtn: '＋ Inviter quelqu’un', eventToday: w => `🎉 Aujourd’hui : ${w} !`, plTitle: 'Les chansons de la pièce', plPaste: 'Collez un lien YouTube', plPlayAll: '▶ Tout jouer sur la télé', plEmpty: 'Pas encore de chanson. Ajoutez la première !', plBy: n => `ajoutée par ${n}`, reply: 'Répondre', del: 'Supprimer', delAsk: 'Supprimer ce message pour tout le monde ?', deleted: '🚫 Message supprimé', replyingTo: n => `↩ Réponse à ${n}`, seenBy: l => `✓✓ Vu par ${l}`, seenAll: '✓✓ Vu par tout le monde', inviteGame: (r, g, p) => `Viens jouer au ${g} dans « ${r} » sur Sawt el Beit 🎲${p ? `\nCode : ${p}` : ''}`, gameStarted: (n, g) => `🎲 ${n} a ouvert ${g}. Viens jouer !`, joinGame: 'Rejoindre', gname: { tawleh: 'tawlé', tarneeb: 'Tarneeb', likha: 'Likha', trivia: 'la soirée quiz' }, holdTalk: 'Maintenez pour enregistrer, relâchez pour envoyer', slideCancel: '← glissez pour annuler', mute: '🔕 Couper cette pièce', muted: '🔕 Pièce en silence ✓', more: '⋯ Plus', less: 'Fermer ⋯', notify: '📲 M’avertir des messages', notifyOn: '📲 Alertes activées ✓', blocked: 'Les notifications sont bloquées pour ce site.', ios: 'Sur iPhone, ajoutez d’abord l’app à l’écran d’accueil (Partager → Sur l’écran d’accueil).', chat: 'Discussion', playTawleh: 'Tawlé dans la pièce', playTrivia: 'Soirée quiz', photo: 'Envoyer une photo', sending: 'Envoi…', typing1: n => `${n} écrit…`, typingN: n => `${n} personnes écrivent…`,
    knock: 'Sonner', knocked: n => `🔔 ${n} a sonné !`, react: 'Réagir', quick: 'Mots rapides', bigPhoto: 'Ouvrir la photo',
    phrases: ['Bien arrivé·e 🏠', 'Vous me manquez ❤️', 'Bonjour ☕', 'Bonne nuit 🌙', 'Comment ça va ?', 'Je vous aime 🙏', 'Hahaha 😂', 'Un tawlé ? 🎲'],
    bday: w => `🎂 C’est l’anniversaire de ${w} aujourd’hui ! 🎉`, nameday: w => `🕯️ C’est la fête de ${w} aujourd’hui`,
    errs2: { type: 'Ce type d’image ne passe pas.', big: 'Image trop lourde.', yt: 'Ce n’est pas un lien YouTube.' }, today: 'Aujourd’hui', yesterday: 'Hier'
  });
  const t = (k, ...a) => { const v = (T[S.lang()] || T.ar)[k]; return typeof v === 'function' ? v(...a) : v; };
  const EMOJI = ['❤️', '😂', '👍', '😮', '😢', '🙏', '🔥', '🌲'];
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
    else if (n.kind === 'live' && window.SawtTV) window.SawtTV.play(n.id);
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
  const errText = e => t('errs')[e && e.code] || t('errs2')[e && e.code] || t('errs').server;

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
    openRoom = { ...r, v: -1, since: 0, here: [], msgs: [], now: null, following: false, sharing: S.store.get('qShare:' + r.id, false), rx: {}, rxv: -1, typing: [], bdays: {} };
    screen = 'room'; err = ''; unread = 0; badge();
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
      const wantBd = !r.bdAt || Date.now() - r.bdAt > 120000;
      const looking0 = chatOpen();
      const d = await api(`/api/q/${r.id}?since=${r.since}&rxv=${r.rxv}&nogame=1${wantBd ? '&bd=1&ev=1' : ''}${looking0 ? `&chat=1&seen=${r.since}` : ''}`, null, r.token);
      if (openRoom !== r) return;
      r.here = d.here; r.hostName = d.host; r.title = d.title; r.game = d.game || null; r.members = d.members || [];
      r.typing = d.typing || [];
      if (d.rd) r.rd = d.rd;
      if (d.rx) { r.rx = d.rx; r.rxv = d.rxv; r.del = new Set(d.del || []); rxChanged = true; }
      if (d.events || d.playlist) { r.events = d.events || []; r.playlist = d.playlist || []; document.dispatchEvent(new CustomEvent('sawt:room-extras', { detail: { room: r } })); }
      if (d.bdays) { r.bdays = d.bdays; r.bdAt = Date.now(); document.dispatchEvent(new CustomEvent('sawt:room-bdays', { detail: { room: r, bdays: d.bdays } })); }
      quiet = d.msgs.length || (d.typing && d.typing.length) ? 0 : quiet + 1;
      if (d.msgs.length) {
        const fresh = d.msgs.filter(m => !r.msgs.some(x => x.n === m.n));
        r.msgs = r.msgs.concat(fresh).slice(-150);
        r.since = d.msgs[d.msgs.length - 1].n;
        const others = fresh.filter(m => m.name !== r.name);
        const looking = window.SawtRoom && window.SawtRoom.isOpen() === 'together' && !document.hidden;
        if (r.v !== -1) {
          if (others.some(m => m.knock)) ding();
          if (others.length && !looking) {
            unread += others.length; badge();
            const last = others[others.length - 1];
            S.toast(last.knock ? t('knocked', last.name) : t('newMsg', last.name || '🎂'));
          }
        }
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
    // quick while people are talking, slower when the room is quiet (it saves the small database)
    const open = chatOpen();
    const base = document.hidden ? 60000 : open ? 2500 : 15000;
    timer = setTimeout(poll, open ? Math.min(6000, base + quiet * 300) : base);
  }
  let quiet = 0;
  const chatOpen = () => !!(window.SawtRoom && window.SawtRoom.isOpen() === 'together' && !document.hidden);
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
    typedAt = 0;
    const re = replyTo; replyTo = null;
    try { await api(`/api/q/${openRoom.id}/say`, { text, re }, openRoom.token); err = ''; quiet = 0; render(); poll(true); }
    catch (e) { err = errText(e); render(); }
  }
  async function knock() {
    if (!openRoom) return;
    try { await api(`/api/q/${openRoom.id}/say`, { knock: true }, openRoom.token); ding(); poll(true); }
    catch (e) { err = errText(e); render(); }
  }
  // "… is typing": tell the room at most every 3 seconds
  let typedAt = 0;
  function typingPing() {
    if (!openRoom || Date.now() - typedAt < 3000) return;
    typedAt = Date.now();
    api(`/api/q/${openRoom.id}/typing`, {}, openRoom.token).catch(() => {});
  }
  // a photo: made small here (longest side 1280 px) before it travels
  async function shrink(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
      for (const [side, q] of [[1280, 0.8], [1024, 0.72], [800, 0.66]]) {
        const k = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.round(img.naturalWidth * k), h = Math.round(img.naturalHeight * k);
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        const data = c.toDataURL('image/jpeg', q).split(',')[1];
        if (data.length < 650000) return { data, w, h };
      }
      throw Object.assign(new Error('big'), { code: 'big' });
    } finally { URL.revokeObjectURL(url); }
  }
  let sendingPhoto = false;
  async function sendPhoto(file) {
    if (!openRoom || !file) return;
    sendingPhoto = true; render();
    try {
      const p = await shrink(file);
      await api(`/api/q/${openRoom.id}/photo`, { type: 'image/jpeg', data: p.data, w: p.w, h: p.h }, openRoom.token);
      err = ''; sendingPhoto = false; poll(true);
    } catch (e) { sendingPhoto = false; err = errText(e); render(); }
  }
  async function react(m, e) {
    if (!openRoom) return;
    const r = openRoom;
    const cur = { ...(r.rx[m.n] || {}) };
    const list = cur[e] || [];
    cur[e] = list.includes(r.name) ? list.filter(x => x !== r.name) : [...list, r.name];
    if (!cur[e].length) delete cur[e];
    r.rx[m.n] = cur; updateRx();
    try { const d = await api(`/api/q/${r.id}/react`, { n: m.n, e }, r.token); r.rx[m.n] = d.rx; updateRx(); } catch { /* next poll fixes it */ }
  }

  // ------------------------------------------------------------------ the doorbell and the unread count
  let actx = null;
  function ding() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = actx.currentTime + 0.02;
      [[659.3, 0], [523.3, 0.42]].forEach(([f, at]) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0 + at); g.gain.exponentialRampToValueAtTime(0.35, t0 + at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + 1.1);
        o.connect(g).connect(actx.destination); o.start(t0 + at); o.stop(t0 + at + 1.2);
      });
    } catch { /* no sound */ }
    try { navigator.vibrate && navigator.vibrate([120, 80, 160]); } catch { /* fine */ }
  }
  let unread = 0;
  const chatBtn = el('button', { type: 'button', className: 'chat-btn', id: 'chat-btn', hidden: true }, [el('span', { className: 'chat-ic', text: '💬' }), el('b', { className: 'chat-n', hidden: true })]);
  (document.getElementById('who-btn') || document.querySelector('.room-top .langs')).after(chatBtn);
  chatBtn.addEventListener('click', () => {
    if (!openRoom && rooms[0] && rooms[0].token) enter(rooms[0]);
    else if (openRoom) screen = 'room';
    if (window.SawtRoom) window.SawtRoom.open('together');
  });
  function badge() {
    chatBtn.hidden = !storeOn;
    chatBtn.setAttribute('aria-label', t('chat') + (unread ? ` (${unread})` : ''));
    chatBtn.title = t('chat');
    const n = chatBtn.querySelector('.chat-n');
    n.hidden = !unread; n.textContent = unread > 9 ? '9+' : S.num(unread);
    chatBtn.classList.toggle('has-new', unread > 0);
  }
  let rxChanged = false;
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
      const re = replyTo; replyTo = null;
      try { await sendVoice(openRoom, rec, re ? { re } : {}); err = ''; poll(true); } catch (e) { err = errText(e); render(); }
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

  async function invite(r, withPin, game) {
    const url = `${location.origin}/q/${r.id}`;
    const pin = withPin && r.pin ? r.pin : '';
    const text = game ? t('inviteGame', r.title, t('gname')[game] || game, pin) : t('inviteText', r.title, pin);
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
  const hhmm = ts => new Date(ts).toLocaleTimeString(S.locale ? S.locale() : undefined, { hour: 'numeric', minute: '2-digit' });
  function rxRow(m, r) {
    const cur = r.rx[m.n] || {};
    const row = el('div', { className: 'q-rx' });
    row.dataset.n = m.n;
    Object.entries(cur).forEach(([e, names]) => {
      if (!names.length) return;
      const b = el('button', { type: 'button', className: 'q-rx-chip' + (names.includes(r.name) ? ' is-mine' : ''), title: names.join('، ') }, [el('span', { text: e }), el('b', { text: S.num(names.length) })]);
      b.addEventListener('click', () => react(m, e));
      row.appendChild(b);
    });
    return row;
  }
  function picker(m, r, host) {
    const old = box.querySelector('.q-pick'); if (old) { const same = old.dataset.n === String(m.n); old.remove(); if (same) return; }
    const p = el('div', { className: 'q-pick', role: 'group', 'aria-label': t('react') }, EMOJI.map(e => { const b = el('button', { type: 'button', text: e }); b.addEventListener('click', () => { p.remove(); react(m, e); }); return b; }));
    const rb = el('button', { type: 'button', className: 'q-pick-w', text: '↩ ' + t('reply') });
    rb.addEventListener('click', () => { p.remove(); replyTo = { n: m.n, name: m.name, text: (m.text || (m.voice ? '🎙️' : m.photo ? '📷' : '')).slice(0, 80) }; render(); const i = box.querySelector('.q-say input'); if (i) i.focus(); });
    p.appendChild(rb);
    if (m.name === r.name) {
      const db = el('button', { type: 'button', className: 'q-pick-w', text: '🗑 ' + t('del') });
      db.addEventListener('click', async () => {
        p.remove();
        if (!window.confirm(t('delAsk'))) return;
        try { await api(`/api/q/${r.id}/del`, { n: m.n }, r.token); (r.del = r.del || new Set()).add(m.n); updateRx(); } catch (e) { err = errText(e); render(); }
      });
      p.appendChild(db);
    }
    p.dataset.n = m.n;
    host.appendChild(p);
  }
  function viewPhoto(src) {
    const ov = el('div', { className: 'q-photo-ov', role: 'dialog', tabIndex: -1 }, [el('img', { src, alt: '' })]);
    ov.addEventListener('click', () => ov.remove());
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { ov.remove(); document.removeEventListener('keydown', esc); } });
    document.body.appendChild(ov); ov.focus();
  }
  function dayLabel(ts) {
    const d = new Date(ts), now = new Date();
    const k = x => x.toDateString();
    if (k(d) === k(now)) return t('today');
    if (k(d) === k(new Date(now - 864e5))) return t('yesterday');
    return d.toLocaleDateString(S.locale ? S.locale() : undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  }
  function msgView(m, r) {
    if (m.sys === 'game') {
      const kids = [el('span', { dir: 'auto', text: t('gameStarted', m.name, t('gname')[m.game] || m.game) })];
      if (m.name !== r.name) kids.push(btn('▶ ' + t('joinGame'), 'btn btn-primary q-join', () => joinGame(m.game)));
      const n = el('div', { className: 'q-sys q-game' }, kids);
      n.dataset.n = m.n; return n;
    }
    if (m.sys || m.knock) {
      const n = el('div', { className: 'q-sys' + (m.knock ? ' q-knock' : ''), dir: 'auto', text: m.knock ? t('knocked', m.name) : m.sys === 'event' ? t('eventToday', m.who) : t(m.sys === 'nameday' ? 'nameday' : 'bday', m.who) });
      n.dataset.n = m.n; return n;
    }
    if (r.del && r.del.has(m.n)) { const n = el('div', { className: 'q-msg is-gone' + (m.name === r.name ? ' is-me' : '') }, [el('b', { dir: 'auto', text: m.name }), el('i', { text: t('deleted') })]); n.dataset.n = m.n; return n; }
    const kids = [el('b', { dir: 'auto', text: m.name })];
    if (m.re) {
      const q = el('button', { type: 'button', className: 'q-quote', dir: 'auto' }, [el('b', { text: m.re.name }), el('span', { text: m.re.text || '…' })]);
      q.addEventListener('click', () => { const o = box.querySelector(`.q-log [data-n="${m.re.n}"]`); if (o) { o.scrollIntoView({ block: 'center', behavior: 'smooth' }); o.classList.add('is-flash'); setTimeout(() => o.classList.remove('is-flash'), 1200); } });
      kids.push(q);
    }
    if (m.photo) {
      const src = `/api/q/${r.id}/photo/${m.photo}?token=${encodeURIComponent(r.token)}`;
      const im = el('img', { className: 'q-photo', src, alt: '', loading: 'lazy', width: m.w, height: m.h });
      const b = el('button', { type: 'button', className: 'q-photo-b', 'aria-label': t('bigPhoto') }, [im]);
      b.style.aspectRatio = `${m.w} / ${m.h}`;
      b.addEventListener('click', () => viewPhoto(src));
      kids.push(b);
    }
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
    const foot = el('div', { className: 'q-mfoot' }, [el('time', { text: hhmm(m.at) })]);
    const rb = el('button', { type: 'button', className: 'q-rx-add', text: '☺', 'aria-label': t('react'), title: t('react') });
    foot.appendChild(rb);
    kids.push(foot, rxRow(m, r));
    const node = el('div', { className: 'q-msg' + (m.name === r.name ? ' is-me' : '') + (m.voice ? ' has-voice' : '') + (m.photo ? ' has-photo' : '') }, kids);
    node.dataset.n = m.n;
    rb.addEventListener('click', e => { e.stopPropagation(); picker(m, r, node); });
    // a long press reacts too, like on the phone
    let lp = 0;
    node.addEventListener('pointerdown', e => { if (e.target.closest('button,audio')) return; lp = setTimeout(() => picker(m, r, node), 480); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => node.addEventListener(ev, () => clearTimeout(lp)));
    return node;
  }
  function logKids(r) {
    const out = [];
    let lastDay = '';
    r.msgs.forEach(m => {
      const d = new Date(m.at).toDateString();
      if (d !== lastDay) { lastDay = d; out.push(el('div', { className: 'q-day', text: dayLabel(m.at) })); }
      out.push(msgView(m, r));
    });
    return out;
  }
  function updateRx() {
    if (!openRoom) return;
    box.querySelectorAll('.q-msg[data-n]').forEach(node => {
      const m = openRoom.msgs.find(x => String(x.n) === node.dataset.n);
      if (m && openRoom.del && openRoom.del.has(m.n) && !node.classList.contains('is-gone')) { node.replaceWith(msgView(m, openRoom)); return; }
      const old = node.querySelector('.q-rx');
      if (m && old) old.replaceWith(rxRow(m, openRoom));
    });
  }
  function typingLine(r) {
    const n = (r.typing || []).length;
    if (n) return el('p', { className: 'q-typing', 'aria-live': 'polite', dir: 'auto', text: n === 1 ? t('typing1', r.typing[0]) : t('typingN', n) });
    // who has seen my last message
    const mine = [...r.msgs].reverse().find(m => m.name === r.name && !m.sys && !m.knock);
    let text = '';
    if (mine && r.rd) {
      const others = (r.members || []).filter(x => x !== r.name);
      const saw = others.filter(x => (r.rd[x] || 0) >= mine.n);
      if (saw.length && saw.length === others.length && others.length > 1) text = t('seenAll');
      else if (saw.length) text = t('seenBy', saw.join('، '));
    }
    return el('p', { className: 'q-typing q-seen', dir: 'auto', text });
  }
  let replyTo = null;
  function roomView() {
    const r = openRoom;
    if (showExtras === null) showExtras = !window.matchMedia('(max-width: 700px)').matches;
    const head = el('div', { className: 'q-head' }, [
      btn('‹', 'q-back', () => { openRoom = null; screen = 'home'; clearTimeout(timer); render(); }),
      el('h3', { className: 'q-title', dir: 'auto', text: r.title }),
      btn(t('inviteBtn'), 'chip q-inv', () => invite(r, true)),
      btn(showExtras ? t('less') : t('more'), 'chip q-more', () => { showExtras = !showExtras; render(); }),
      btn('×', 'q-x', () => window.SawtRoom && window.SawtRoom.close())
    ]);
    head.querySelector('.q-x').setAttribute('aria-label', t('back'));
    head.querySelector('.q-back').setAttribute('aria-label', t('back'));
    head.querySelector('.q-inv').setAttribute('aria-label', t('invite'));
    head.querySelector('.q-inv').title = t('invite');
    const here = el('div', { className: 'q-here' }, [el('span', { className: 'q-k', text: t('here') }), ...r.here.map(n => el('span', { className: 'q-person' + (n === r.name ? ' is-me' : ''), dir: 'auto', text: n }))]);
    const now = r.now && r.now.kind !== 'none' ? r.now : null;
    const shareToggle = el('label', { className: 'q-switch' }, [(() => { const c = el('input', { type: 'checkbox' }); c.checked = !!r.sharing; c.addEventListener('change', () => { r.sharing = c.checked; S.store.set('qShare:' + r.id, r.sharing); lastShared = null; shareNow(); }); return c; })(), el('span', { text: t('share') })]);
    const nowCard = el('div', { className: 'q-now q-card' }, [
      el('p', { className: 'q-k', text: t('nowPlaying') }),
      el('p', { className: 'q-now-name', dir: 'auto', text: now ? label(now) : t('nothing') }),
      now ? btn(r.following ? t('listening') : '▶ ' + t('listen'), r.following ? 'btn' : 'btn btn-primary', () => { r.following = true; playThing(r.now); render(); }) : null,
      shareToggle
    ].filter(Boolean));
    const log = el('div', { className: 'q-log', 'aria-live': 'polite' }, logKids(r));
    const composer = el('div', { className: 'q-compose' });
    if (recording) {
      composer.append(el('span', { className: 'q-rec-dot' }), el('span', { className: 'q-rec-time', text: '0″' }), el('span', { className: 'q-rec-meter' }, [el('b', { className: 'q-rec-level' })]),
        btn(t('cancelRec'), 'link-btn', cancelRec), btn('■ ' + t('stopRec'), 'btn btn-primary', recToggle));
    } else {
      const f = el('form', { className: 'q-say' });
      const input = el('input', { maxLength: 240, placeholder: sendingPhoto ? t('sending') : t('say'), 'aria-label': t('say'), enterKeyHint: 'send' });
      input.value = draft;
      input.addEventListener('input', () => { draft = input.value; if (input.value) typingPing(); });
      const mic = el('button', { type: 'button', className: 'q-mic', text: '🎙️', 'aria-label': t('rec') + ' · ' + t('holdTalk'), title: t('holdTalk') });
      holdToTalk(mic);
      const file = el('input', { type: 'file', accept: 'image/*', hidden: true });
      file.addEventListener('change', () => { const fl = file.files && file.files[0]; file.value = ''; if (fl) sendPhoto(fl); });
      const cam = btn('📷', 'q-mic q-cam', () => file.click()); cam.setAttribute('aria-label', t('photo')); cam.title = t('photo'); cam.disabled = sendingPhoto;
      const qk = btn('⚡', 'q-mic q-qk', () => { showQuick = !showQuick; render(); }); qk.setAttribute('aria-label', t('quick')); qk.title = t('quick'); qk.setAttribute('aria-pressed', String(showQuick));
      f.append(mic, cam, qk, input, file, el('button', { type: 'submit', className: 'btn btn-primary', text: t('send') }));
      f.addEventListener('submit', e => { e.preventDefault(); const v = input.value.trim(); input.value = ''; draft = ''; say(v); });
      composer.append(f);
    }
    if (replyTo && !recording) {
      const x = btn('×', 'link-btn q-reply-x', () => { replyTo = null; render(); });
      composer.prepend(el('div', { className: 'q-reply', dir: 'auto' }, [el('span', { text: t('replyingTo', replyTo.name) + ': ' + (replyTo.text || '') }), x]));
    }
    const quick = showQuick ? el('div', { className: 'q-quick' }, t('phrases').map(ph => btn(ph, 'chip', () => { showQuick = false; render(); say(ph); }))) : null;
    const foot = el('div', { className: 'q-row' }, [
      pushCfg && pushCfg.alerts ? btn(S.store.get('qPush:' + r.id, false) ? t('notifyOn') : t('notify'), S.store.get('qPush:' + r.id, false) ? 'btn' : 'btn btn-primary', () => pushToggle(r)) : null,
      pushCfg && pushCfg.alerts && S.store.get('qPush:' + r.id, false) ? btn(S.store.get('qMute:' + r.id, false) ? t('muted') : t('mute'), 'btn', () => { S.store.set('qMute:' + r.id, !S.store.get('qMute:' + r.id, false)); syncPrefs(r.id); render(); }) : null,
      btn('🔔 ' + t('knock'), 'btn', knock),
      btn('🎲 ' + t('playTawleh'), 'btn', () => { openGames('tawleh'); document.dispatchEvent(new CustomEvent('sawt:tawleh-room')); }),
      btn('🃏 ' + t('cards'), 'btn', () => { openGames('cards'); document.dispatchEvent(new CustomEvent('sawt:cards-room', { detail: r.id })); }),
      btn('🧠 ' + t('playTrivia'), 'btn', () => { openGames('trivia'); document.dispatchEvent(new CustomEvent('sawt:trivia-room')); }),
      btn(t('leave'), 'link-btn', () => { rooms = rooms.filter(x => x.id !== r.id); saveRooms(); openRoom = null; screen = 'home'; render(); })
    ]);
    const extras = showExtras ? el('div', { className: 'q-extras' }, [foot, playlistView(r), nowCard]) : null;
    return el('div', { className: 'q-room' }, [head, here, extras, log, typingLine(r), quick, composer, err ? el('p', { className: 'form-error', role: 'alert', text: err }) : null].filter(Boolean));
  }
  let draft = '', showQuick = false, showExtras = null;
  // the mic: a quick tap starts and stops; press and hold records, let go sends, slide away cancels
  let holding = false;
  function holdToTalk(mic) {
    mic.addEventListener('contextmenu', e => e.preventDefault());
    mic.addEventListener('pointerdown', e => {
      e.preventDefault();
      const x0 = e.clientX;
      let cancelled = false;
      const timer = setTimeout(async () => { holding = true; await recToggle(); const n = box.querySelector('.q-rec-time'); if (n) n.after(el('span', { className: 'q-slide', text: t('slideCancel') })); }, 250);
      const move = ev => { if (holding && Math.abs(ev.clientX - x0) > 90 && !cancelled) { cancelled = true; holding = false; cancelRec(); } };
      const done = async ev => {
        document.removeEventListener('pointerup', done); document.removeEventListener('pointercancel', done); document.removeEventListener('pointermove', move);
        clearTimeout(timer);
        if (cancelled) return;
        if (holding) { holding = false; if (ev.type === 'pointercancel') { cancelRec(); return; } if (recording) await recToggle(); }
        else if (ev.type === 'pointerup') recToggle();
      };
      document.addEventListener('pointerup', done); document.addEventListener('pointercancel', done); document.addEventListener('pointermove', move);
    });
  }
  // ------------------------------------------------------------------ the room's songs
  let plOpen = false, plBusy = false;
  function playlistView(r) {
    const list = r.playlist || [];
    const head = btn(`🎵 ${t('plTitle')} (${S.num(list.length)}) ${plOpen ? '▴' : '▾'}`, 'q-pl-head', () => { plOpen = !plOpen; render(); });
    head.setAttribute('aria-expanded', String(plOpen));
    if (!plOpen) return el('div', { className: 'q-pl' }, [head]);
    const input = el('input', { placeholder: t('plPaste'), 'aria-label': t('plPaste'), inputMode: 'url', dir: 'ltr' });
    const f = el('form', { className: 'q-say q-pl-add' }, [input, el('button', { type: 'submit', className: 'btn btn-primary', text: '＋', disabled: plBusy })]);
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const url = input.value.trim(); if (!url) return;
      plBusy = true; render();
      try { const d = await api(`/api/q/${r.id}/playlist`, { url }, r.token); r.playlist = d.playlist; err = ''; } catch (ex) { err = errText(ex); }
      plBusy = false; render();
    });
    const ordered = [...list].reverse();          // first added plays first
    const items = ordered.map((x, i) => el('li', { className: 'q-pl-item' }, [
      btn('▶', 'q-pl-play', () => playRoomList(ordered, i, r)),
      el('span', { className: 'q-pl-t', dir: 'auto' }, [el('b', { text: x.title }), el('small', { text: t('plBy', x.by) })]),
      x.by === r.name ? btn('×', 'link-btn q-pl-x', async () => { try { const d = await api(`/api/q/${r.id}/playlist`, { remove: x.k }, r.token); r.playlist = d.playlist; render(); } catch (ex) { err = errText(ex); render(); } }) : null
    ].filter(Boolean)));
    return el('div', { className: 'q-pl is-open' }, [
      head, f,
      list.length ? btn(t('plPlayAll'), 'btn q-pl-all', () => playRoomList(ordered, 0, r)) : el('p', { className: 'quiet small', text: t('plEmpty') }),
      el('ul', { className: 'q-pl-list' }, items)
    ]);
  }
  function playRoomList(ordered, i, r) {
    const ids = ordered.slice(i).concat(ordered.slice(0, i)).map(x => x.vid);
    if (!ids.length || !window.SawtTV) return;
    window.SawtTV.playVideos(ids, { ar: `🎵 ${r.title}`, en: `🎵 ${r.title}`, fr: `🎵 ${r.title}` });
    if (window.SawtRoom) { window.SawtRoom.close(); setTimeout(() => window.SawtRoom.focusTv && window.SawtRoom.focusTv(), 320); }
  }
  // ------------------------------------------------------------------ alerts when the app is closed
  let pushCfg = null;
  // quiet hours (set in My corner) travel with each room's alerts, in this phone's time zone
  function quietPrefs() { const q = S.store.get('quiet', null) || {}; return { on: !!q.on, from: q.from ?? 23, to: q.to ?? 7, tz: -new Date().getTimezoneOffset() }; }
  async function mySub() {
    try { if (!('serviceWorker' in navigator)) return null; const reg = await navigator.serviceWorker.getRegistration(); return reg ? await reg.pushManager.getSubscription() : null; } catch { return null; }
  }
  async function syncPrefs(only) {
    const sub = await mySub(); if (!sub) return;
    for (const r of rooms.filter(x => x.token && S.store.get('qPush:' + x.id, false) && (!only || x.id === only))) {
      api(`/api/q/${r.id}/push/prefs`, { endpoint: sub.endpoint, quiet: quietPrefs(), muted: S.store.get('qMute:' + r.id, false) }, r.token).catch(() => {});
    }
  }
  async function pushToggle(r) {
    const on = S.store.get('qPush:' + r.id, false);
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !pushCfg || !pushCfg.publicKey) throw new Error('ios');
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (on && existing) {
        await api(`/api/q/${r.id}/push/off`, { endpoint: existing.endpoint }, r.token).catch(() => {});
        S.store.set('qPush:' + r.id, false); render(); return;
      }
      if ((await Notification.requestPermission()) !== 'granted') { S.toast(t('blocked')); return; }
      const k = pushCfg.publicKey;
      const raw = atob((k + '='.repeat((4 - k.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/'));
      const sub = existing || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: Uint8Array.from(raw, c => c.charCodeAt(0)) });
      await api(`/api/q/${r.id}/push`, { subscription: sub.toJSON(), lang: S.lang(), quiet: quietPrefs(), muted: S.store.get('qMute:' + r.id, false) }, r.token);
      S.store.set('qPush:' + r.id, true); render();
    } catch (e) { S.toast(e.message === 'ios' ? t('ios') : t('errs').server); }
  }
  function joinGame(game) {
    if (game === 'tawleh') { openGames('tawleh'); document.dispatchEvent(new CustomEvent('sawt:tawleh-room')); }
    else if (game === 'trivia') { openGames('trivia'); document.dispatchEvent(new CustomEvent('sawt:trivia-room')); }
    else { openGames('cards'); document.dispatchEvent(new CustomEvent('sawt:cards-room', { detail: openRoom && openRoom.id })); }
  }
  // tell the room a game is open (not twice in a row for the same game)
  const announced = {};
  async function announce(r, game) {
    if (!r || !storeOn) return;
    const k = r.id + ':' + game;
    if (announced[k] && Date.now() - announced[k] < 120000) return;
    announced[k] = Date.now();
    try { await api(`/api/q/${r.id}/say`, { game }, r.token); } catch { /* the game still opens */ }
  }
  function openGames(tab) {
    if (window.SawtRoom) window.SawtRoom.open('tawleh');
    setTimeout(() => { if (window.SawtCards) window.SawtCards.showTab(tab); }, 60);
  }
  function renderLive() {
    const old = box.querySelector('.q-room');
    if (!old) { render(); return; }
    const v = roomView();
    const plBusyTyping = document.activeElement && document.activeElement.closest && document.activeElement.closest('.q-pl');
    ['.q-here', '.q-now', '.q-typing', ...(plBusyTyping ? [] : ['.q-pl'])].forEach(sel => { const a = old.querySelector(sel), b = v.querySelector(sel); if (a && b) a.replaceWith(b); });
    // only add new messages, so audio that is playing keeps playing
    const log = old.querySelector('.q-log');
    const have = new Set([...log.querySelectorAll('[data-n]')].map(n => n.dataset.n));
    const fresh = openRoom.msgs.filter(m => !have.has(String(m.n)));
    const nearBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 80;
    let lastDay = openRoom.msgs.length > fresh.length ? new Date(openRoom.msgs[openRoom.msgs.length - fresh.length - 1].at).toDateString() : '';
    fresh.forEach(m => {
      const d = new Date(m.at).toDateString();
      if (d !== lastDay) { lastDay = d; log.appendChild(el('div', { className: 'q-day', text: dayLabel(m.at) })); }
      const node = msgView(m, openRoom); node.dataset.n = m.n; log.appendChild(node);
    });
    if (fresh.length && (nearBottom || fresh.some(m => m.name === openRoom.name))) scrollLog();
    if (rxChanged) { rxChanged = false; updateRx(); }
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
    if (saved && saved.token) {
      enter(saved); openRoom.following = true;
      const play = new URLSearchParams(location.search).get('play');
      if (play) setTimeout(() => joinGame(play), 1500);
      return;
    }
    joinId = id; screen = 'join';
    try { joinTitle = (await api(`/api/q/${id}/peek`)).title; } catch (e) { err = errText(e); screen = 'home'; }
    render();
  }

  document.addEventListener('sawt:config', e => {
    storeOn = !!(e.detail && e.detail.dedications);
    pushCfg = e.detail || null;
    badge();
    arrive().then(render);
    // keep an ear on the last room even when the sofa is closed
    if (storeOn && !openRoom && rooms[0] && rooms[0].token && !location.pathname.startsWith('/q/')) { openRoom = { ...rooms[0], v: -1, since: 0, here: [], msgs: [], now: null, following: false, sharing: S.store.get('qShare:' + rooms[0].id, false) }; screen = 'room'; poll(true); }
  });
  document.addEventListener('sawt:stations', () => { if (shared && shared.kind === 'radio') { const st = S.stations().find(s => s.id === shared.id); if (st) { shared.name = st.name; render(); } } });
  document.addEventListener('sawt:lang', () => { render(); badge(); });
  document.addEventListener('sawt:panel', e => { if (e.detail === 'together') { unread = 0; badge(); render(); if (openRoom) poll(true); } });
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
    announce,
    syncPrefs,
    event: (r, body) => api(`/api/q/${r.id}/event`, body, r.token).then(d => { r.bdAt = 0; poll(true); return d; }),
    greet: (r, who, kind, day) => api(`/api/q/${r.id}/greet`, { who, kind, day }, r.token),
    bday: (r, who, md, remove) => api(`/api/q/${r.id}/bday`, { who, md, remove }, r.token),
    scores: r => api(`/api/q/${r.id}/scores`, null, r.token),
    score: (r, body) => api(`/api/q/${r.id}/score`, body, r.token),
    here: () => (openRoom ? openRoom.here : []),
    storeOn: () => storeOn
  };
  render();
})();

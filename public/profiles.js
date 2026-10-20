/* "Who's home?" Each person in the family gets their own corner of the house:
   their name, favourites, village, recipes, scores and photos. An easy passcode
   (4 to 8 digits) can lock a person's corner on a shared phone, and with the same
   passcode the person finds everything again on another device. */
(() => {
  'use strict';
  const S = window.Sawt;
  const $ = id => document.getElementById(id);
  const el = S.el;

  const T = {
    ar: {
      who: 'مين بالبيت؟', add: 'زيد حدا', you: 'إنت', name: 'الاسم', namePh: 'مثلاً: نسيم', icon: 'الصورة',
      pin: 'رمز سهل (٤ لـ ٨ أرقام)', pinPh: 'مثلاً: ١٩٧٥', setPin: 'قفل برمز', changePin: 'غيّر الرمز', removePin: 'شيل القفل',
      save: 'خلص', cancel: 'رجوع', enterPin: n => `الرمز تبع ${n}`, wrong: 'الرمز غلط، جرّب كمان مرة.', locked: 'مقفول',
      greet: n => `أهلا يا ${n}، البيت بيتك`, askName: 'شو اسمك؟', needName: 'اكتب اسمك لتفوت 🙂', switchTo: 'بدّل', edit: 'عدّل', del: 'امحي', delAsk: n => `أكيد بدك تمحي ${n} وكل شي محفوظ إلو عهالجهاز؟`,
      sync: 'على كل أجهزتي', syncLede: 'اختار اسم مستخدم ورمز، وبتلاقي أغراضك (المفضلة، الضيعة، الطبخات، النتايج) على أيّ تلفون أو كمبيوتر.',
      user: 'اسم المستخدم', userPh: 'مثلاً: nassim.beirut', connect: 'وصّل', synced: u => `موصول باسم ${u} ✓`, disconnect: 'فكّ الوصل',
      have: 'عندي حساب من قبل', noStore: 'المزامنة بين الأجهزة بتشتغل بس تنشغّل قاعدة البيانات الصغيرة.',
      errs: { user: 'اسم المستخدم لازم يكون ٣ لـ ٢٤ حرف أو رقم.', pin: 'الرمز لازم يكون ٤ لـ ٨ أرقام.', rate: 'كتير محاولات. جرّب بعد ساعة.', nouser: 'ما في حساب بهالاسم.', server: 'في مشكلة، جرّب كمان مرة.' },
      hello: n => `أهلين ${n} 👋`
    },
    en: {
      who: 'Who’s home?', add: 'Add someone', you: 'You', name: 'Name', namePh: 'e.g. Nassim', icon: 'Picture',
      pin: 'Easy passcode (4 to 8 digits)', pinPh: 'e.g. 1975', setPin: 'Lock with a passcode', changePin: 'Change passcode', removePin: 'Remove the lock',
      save: 'Done', cancel: 'Back', enterPin: n => `${n}’s passcode`, wrong: 'Wrong passcode, try again.', locked: 'Locked',
      greet: n => `Welcome home, ${n}`, askName: 'What’s your name?', needName: 'Type your name to come in 🙂', switchTo: 'Switch', edit: 'Edit', del: 'Delete', delAsk: n => `Delete ${n} and everything saved for them on this device?`,
      sync: 'On all my devices', syncLede: 'Pick a username and passcode, and find your things (favourites, village, recipes, scores) on any phone or computer.',
      user: 'Username', userPh: 'e.g. nassim.beirut', connect: 'Connect', synced: u => `Connected as ${u} ✓`, disconnect: 'Disconnect',
      have: 'I already have an account', noStore: 'Syncing between devices works once the small database is switched on.',
      errs: { user: 'Usernames are 3 to 24 letters or digits.', pin: 'The passcode is 4 to 8 digits.', rate: 'Too many tries. Try again in an hour.', nouser: 'No account with that name.', server: 'Something went wrong, try again.' },
      hello: n => `Hello ${n} 👋`
    },
    fr: {
      who: 'Qui est à la maison ?', add: 'Ajouter quelqu’un', you: 'Vous', name: 'Prénom', namePh: 'ex. Nassim', icon: 'Image',
      pin: 'Code facile (4 à 8 chiffres)', pinPh: 'ex. 1975', setPin: 'Verrouiller par un code', changePin: 'Changer le code', removePin: 'Retirer le verrou',
      save: 'OK', cancel: 'Retour', enterPin: n => `Le code de ${n}`, wrong: 'Code erroné, réessayez.', locked: 'Verrouillé',
      greet: n => `Bienvenue chez vous, ${n}`, askName: 'Votre prénom ?', needName: 'Écrivez votre prénom pour entrer 🙂', switchTo: 'Changer', edit: 'Modifier', del: 'Supprimer', delAsk: n => `Supprimer ${n} et tout ce qui est gardé pour lui sur cet appareil ?`,
      sync: 'Sur tous mes appareils', syncLede: 'Choisissez un nom d’utilisateur et un code, et retrouvez vos affaires (favoris, village, recettes, scores) sur n’importe quel appareil.',
      user: 'Nom d’utilisateur', userPh: 'ex. nassim.beyrouth', connect: 'Connecter', synced: u => `Connecté : ${u} ✓`, disconnect: 'Déconnecter',
      have: 'J’ai déjà un compte', noStore: 'La synchronisation marche une fois la petite base de données activée.',
      errs: { user: 'Le nom d’utilisateur fait 3 à 24 lettres ou chiffres.', pin: 'Le code fait 4 à 8 chiffres.', rate: 'Trop d’essais. Réessayez dans une heure.', nouser: 'Aucun compte à ce nom.', server: 'Un souci, réessayez.' },
      hello: n => `Bonjour ${n} 👋`
    }
  };
  Object.assign(T.ar, { acctAsk: 'احفظ أغراضك ☁️ اعمل اسم مستخدم ورمز، وإذا غيّرت تلفونك بتلاقي كل شي: المفضّلة، ضيعتك، طبخاتك ونتايجك.', acctYes: 'اعمل حساب', acctLater: 'بعدين', whoIn: 'مين داخل؟', someoneNew: 'حدا جديد', haveAccount: '🔑 عندي حساب (من جهاز تاني)', login: 'فوت بحسابي', loginLede: 'اكتب اسم المستخدم والرمز اللي عملتهن على جهازك التاني، وبتلاقي كل أغراضك هون.', notYou: n => `مش ${n}؟ اختار مين داخل` });
  Object.assign(T.en, { acctAsk: 'Keep your things ☁️ Pick a username and passcode, and if you change phones everything comes with you: favourites, village, recipes, scores.', acctYes: 'Make an account', acctLater: 'Later', whoIn: 'Who’s coming in?', someoneNew: 'Someone new', haveAccount: '🔑 I have an account (from another device)', login: 'Sign in', loginLede: 'Type the username and passcode you made on your other device, and all your things come here.', notYou: n => `Not ${n}? Choose who’s coming in` });
  Object.assign(T.fr, { acctAsk: 'Gardez vos affaires ☁️ Choisissez un nom d’utilisateur et un code : si vous changez de téléphone, tout vous suit (favoris, village, recettes, scores).', acctYes: 'Créer un compte', acctLater: 'Plus tard', whoIn: 'Qui entre ?', someoneNew: 'Quelqu’un d’autre', haveAccount: '🔑 J’ai un compte (d’un autre appareil)', login: 'Me connecter', loginLede: 'Tapez le nom d’utilisateur et le code créés sur votre autre appareil, et retrouvez toutes vos affaires ici.', notYou: n => `Pas ${n} ? Choisissez qui entre` });
  const t = (k, ...a) => { const v = (T[S.lang()] || T.ar)[k]; return typeof v === 'function' ? v(...a) : v; };
  const ICONS = ['🙂', '👩🏻', '👨🏻', '👵🏻', '👴🏻', '👧🏻', '👦🏻', '🧕🏻', '👩🏻‍🍳', '🌲', '☕', '🎲', '🌹', '🌙', '⭐', '🐈'];

  let storeOn = false;
  const me = S.store.profileId();
  let list = S.store.get('profiles', []) || [];
  const find = id => list.find(p => p.id === id);
  const saveList = () => S.store.set('profiles', list);
  const ss = { get(k) { try { return sessionStorage.getItem('sawt:' + k); } catch { return null; } }, set(k, v) { try { sessionStorage.setItem('sawt:' + k, v); } catch { /* fine */ } } };

  async function hashPin(pin, salt) {
    const text = salt + ':' + pin;
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return btoa(String.fromCharCode(...new Uint8Array(buf)));
    } catch {
      let h = 2166136261; for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); } return 'f' + (h >>> 0).toString(36);
    }
  }
  const salt = () => Math.random().toString(36).slice(2, 10);
  const digits = s => String(s || '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/\D/g, '');

  function current() { return find(me) || null; }
  function myName() { const p = current(); return p ? p.name : ''; }

  // ------------------------------------------------------------------ the button at the top
  const btn = el('button', { type: 'button', className: 'who-btn', id: 'who-btn' });
  const top = document.querySelector('.room-top .simple-btn') || document.querySelector('.room-top .langs');
  top.before(btn);
  function renderBtn() {
    const p = current();
    btn.replaceChildren(...[el('span', { className: 'who-icon', text: p ? p.icon || '🙂' : '👤' }), p ? el('span', { className: 'who-name', dir: 'auto', text: p.name }) : null].filter(Boolean));
    btn.setAttribute('aria-label', t('who') + (p ? ` · ${p.name}` : ''));
    btn.title = t('who');
  }
  btn.addEventListener('click', () => openPanel('me'));

  // ------------------------------------------------------------------ the overlay
  const panel = el('div', { className: 'who', id: 'who', hidden: true, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'who-title' });
  document.body.appendChild(panel);
  let view = 'list', editing = null, pinFor = null, err = '', syncErr = '';
  function close() { panel.hidden = true; document.body.classList.remove('who-on'); }
  function openPanel(v = 'list', who = null) { view = v; editing = who; err = ''; panel.hidden = false; document.body.classList.add('who-on'); render(); }
  panel.addEventListener('click', e => { if (e.target === panel && !panel.classList.contains('is-gate')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden && !panel.classList.contains('is-gate')) close(); });

  function card(p) {
    const b = el('button', { type: 'button', className: 'who-card' + (p.id === me ? ' is-me' : '') }, [
      el('span', { className: 'who-avatar', text: p.icon || '🙂' }),
      el('span', { className: 'who-card-name', dir: 'auto', text: p.name }),
      p.lock ? el('span', { className: 'who-lock', text: '🔒' }) : null
    ].filter(Boolean));
    b.addEventListener('click', () => {
      if (p.id === me) { openPanel('edit', p.id); return; }
      if (p.lock) { pinFor = p.id; view = 'pin'; render(); return; }
      switchTo(p.id);
    });
    return b;
  }
  function switchTo(id) {
    ss.set('chosen', id); ss.set('unlocked', id);
    S.store.set('profileId', id);
    location.reload();
  }

  function render() {
    panel.classList.toggle('is-gate', view === 'gate' || view === 'pin-gate');
    const kids = [];
    if (view === 'list' || view === 'gate') {
      kids.push(el('h2', { className: 'who-title', id: 'who-title', text: t('who') }));
      const grid = el('div', { className: 'who-grid' }, list.map(card));
      const add = el('button', { type: 'button', className: 'who-card who-add' }, [el('span', { className: 'who-avatar', text: '+' }), el('span', { className: 'who-card-name', text: t('add') })]);
      add.addEventListener('click', () => openPanel('edit', null));
      grid.appendChild(add);
      kids.push(grid);
      if (view === 'list') { const c = el('button', { type: 'button', className: 'link-btn who-close', text: t('cancel') }); c.addEventListener('click', close); kids.push(c); }
    } else if (view === 'pin' || view === 'pin-gate') {
      const p = find(pinFor);
      kids.push(el('span', { className: 'who-avatar big', text: p.icon || '🙂' }), el('h2', { className: 'who-title', id: 'who-title', text: t('enterPin', p.name) }));
      kids.push(pinPad(async pin => {
        if (await hashPin(pin, p.lock.salt) === p.lock.hash) { if (p.id === me) { ss.set('unlocked', me); ss.set('chosen', me); close(); greet(); } else switchTo(p.id); return true; }
        return false;
      }));
      if (view === 'pin') { const c = el('button', { type: 'button', className: 'link-btn who-close', text: t('cancel') }); c.addEventListener('click', () => { view = 'list'; render(); }); kids.push(c); }
      else if (list.length > 1) { const c = el('button', { type: 'button', className: 'link-btn who-close', text: t('who') }); c.addEventListener('click', () => { view = 'gate'; render(); }); kids.push(c); }
    } else if (view === 'edit') {
      kids.push(editor(editing ? find(editing) : null));
    } else if (view === 'login') {
      kids.push(loginForm());
    } else if (view === 'me') {
      kids.push(meView());
    }
    panel.replaceChildren(el('div', { className: 'who-box' }, kids));
    const f = panel.querySelector('input'); if (f) setTimeout(() => f.focus({ preventScroll: true }), 50);
  }

  function pinPad(check) {
    let val = '';
    const dots = el('div', { className: 'pin-dots', 'aria-live': 'polite' });
    const msg = el('p', { className: 'form-error', role: 'alert', hidden: true, text: t('wrong') });
    const input = el('input', { type: 'password', inputMode: 'numeric', autocomplete: 'off', maxLength: 8, className: 'pin-input', 'aria-label': t('pin') });
    const paint = () => { dots.replaceChildren(...Array.from({ length: Math.max(4, val.length) }, (_, i) => el('i', { className: i < val.length ? 'on' : '' }))); };
    const go = async () => {
      if (val.length < 4) return;
      if (await check(val)) return;
      msg.hidden = false; val = ''; input.value = ''; paint();
      dots.classList.remove('is-shake'); void dots.offsetWidth; dots.classList.add('is-shake');
    };
    const press = k => {
      msg.hidden = true;
      if (k === '⌫') val = val.slice(0, -1);
      else if (k === '✓') { go(); return; }
      else if (val.length < 8) val += k;
      input.value = val; paint();
      if (val.length >= 4 && k !== '⌫' && autoTry) autoTryTimer();
    };
    let autoTry = true, timer = null;
    const autoTryTimer = () => { clearTimeout(timer); timer = setTimeout(go, 650); };
    input.addEventListener('input', () => { val = digits(input.value).slice(0, 8); input.value = val; paint(); msg.hidden = true; if (val.length >= 4) autoTryTimer(); });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    const keys = el('div', { className: 'pin-keys', dir: 'ltr' }, ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'].map(k => {
      const b = el('button', { type: 'button', className: 'pin-key' + (k === '✓' ? ' is-ok' : ''), text: k === '✓' || k === '⌫' ? k : S.num(Number(k)) });
      b.addEventListener('click', () => press(k));
      return b;
    }));
    paint();
    return el('div', { className: 'pin' }, [dots, input, keys, msg]);
  }

  function editor(p) {
    const isNew = !p;
    const data = p ? { ...p } : { id: list.length ? 'p' + Date.now().toString(36) : 'p0', name: '', icon: ICONS[0], lock: null };
    const name = el('input', { maxLength: 30, value: data.name, placeholder: t('namePh'), autocomplete: 'given-name' });
    const icons = el('div', { className: 'who-icons', role: 'radiogroup', 'aria-label': t('icon') }, ICONS.map(ic => {
      const b = el('button', { type: 'button', className: 'who-ic', text: ic, role: 'radio' });
      b.setAttribute('aria-checked', String(ic === data.icon));
      b.addEventListener('click', () => { data.icon = ic; icons.querySelectorAll('.who-ic').forEach(x => x.setAttribute('aria-checked', String(x.textContent === ic))); });
      return b;
    }));
    const pin = el('input', { type: 'password', inputMode: 'numeric', maxLength: 8, placeholder: t('pinPh'), autocomplete: 'new-password' });
    let removeLock = false;
    const lockRow = el('div', { className: 'who-lockrow' });
    if (data.lock) {
      const rm = el('button', { type: 'button', className: 'link-btn', text: t('removePin') });
      rm.addEventListener('click', () => { removeLock = true; rm.disabled = true; rm.textContent = '✓ ' + t('removePin'); });
      lockRow.append(rm);
    }
    const error = el('p', { className: 'form-error', role: 'alert', hidden: !err, text: err });
    const f = el('form', { className: 'who-form' }, [
      el('label', { className: 'field' }, [el('span', { text: t('name') }), name]),
      el('div', { className: 'field' }, [el('span', { text: t('icon') }), icons]),
      el('label', { className: 'field' }, [el('span', { text: data.lock ? t('changePin') : t('setPin') + ' · ' + t('pin') }), pin]),
      lockRow, error,
      el('div', { className: 'who-actions' }, [
        el('button', { type: 'submit', className: 'btn btn-primary', text: t('save') }),
        (() => { const c = el('button', { type: 'button', className: 'btn', text: t('cancel') }); c.addEventListener('click', () => { if (!list.length) close(); else { view = 'list'; render(); } }); return c; })()
      ])
    ]);
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const n = name.value.trim();
      if (!n) { name.focus(); return; }
      const pv = digits(pin.value);
      if (pv && (pv.length < 4 || pv.length > 8)) { err = t('errs').pin; error.textContent = err; error.hidden = false; return; }
      data.name = n;
      if (pv) { const s = salt(); data.lock = { salt: s, hash: await hashPin(pv, s) }; }
      else if (removeLock) data.lock = null;
      err = '';
      const i = list.findIndex(x => x.id === data.id);
      if (i >= 0) list[i] = data; else list.push(data);
      saveList();
      if (isNew && data.id !== me) { switchTo(data.id); return; }
      if (pv) { ss.set('unlocked', data.id); }
      renderBtn(); greet(); close();
      document.dispatchEvent(new CustomEvent('sawt:me'));
    });
    const kids = [el('h2', { className: 'who-title', id: 'who-title', text: isNew ? t('add') : data.name }), f];
    // a person who isn't the one using the device can be removed
    if (!isNew && list.length > 1) {
      const d = el('button', { type: 'button', className: 'link-btn who-del', text: t('del') });
      d.addEventListener('click', () => {
        if (!window.confirm(t('delAsk', data.name))) return;
        try {
          const pre = data.id === 'p0' ? null : `sawt:${data.id}:`;
          if (pre) for (let i = localStorage.length - 1; i >= 0; i--) { const k = localStorage.key(i); if (k.startsWith(pre)) localStorage.removeItem(k); }
        } catch { /* fine */ }
        list = list.filter(x => x.id !== data.id); saveList();
        if (data.id === me) switchTo(list[0].id); else { view = 'list'; render(); }
      });
      kids.push(d);
    }
    if (!isNew && data.id === me) kids.push(syncBox(data));
    return el('div', {}, kids);
  }

  // ------------------------------------------------------------------ my corner: me, my account, settings
  const M = {
    ar: { me: 'زاويتي', local: 'محفوظ عهالتلفون بس', synced: u => `☁️ موصول باسم ${u}`, edit: '✏️ الاسم والصورة والرمز', account: '☁️ حسابي (على كل أجهزتي)', switch: '👥 بدّل الشخص أو زيد حدا', signout: '🚪 اطلع', signoutNote: 'بترجع عالباب، والباقيين بيقدروا يفوتوا بأساميهن.',
      sAccount: 'الحساب', sSettings: 'الإعدادات', sMine: 'أغراضي', lang: 'اللغة', size: 'حجم الكتابة', small: 'صغير', normal: 'عادي', large: 'كبير', teta: '👵 كرسي تيتا (أزرار كبار)', sounds: '🔊 أصوات البيت', cuts: '💡 انقطاع الكهربا', weather: '🌦️ الطقس والمناسبة', news: '📰 الجرايد اللي بتشوفها', install: '📲 ثبّت التطبيق',
      rooms: n => `🛋️ غرفي (${S.num(n)})`, scores: '🏆 نتايجي', cal: '🎂 الأعياد والمناسبات', help: '❓ كيف بستعمل صوت البيت؟', clear: '🧹 امحي كل شي عن هالتلفون', clearAsk: 'أكيد؟ بتنمحى الأسامي والمفضّلة والغرف والطبخات عن هالتلفون (يلّي موصول بحساب بيرجع).', close: 'سكّر', on: 'شغّال', off: 'مطفي',
      helpText: ['🛋️ الكنباية: غرف خاصّة للعيلة. اعمل غرفة واكبس «＋ ادعي حدا».', '🎲 الطاولة: طاولة وشدّة وأسئلة، لحالك أو مع العيلة بالغرفة.', '📺 التلفزيون: اكبس عقناة واختار برنامج.', '📻 الراديو: اسحب المؤشّر لتغيّر المحطة.', '⏰ الحبّة فوق: الوقت والطقس والمناسبة.', '👵 كرسي تيتا: أزرار كبار للكبار.'] },
    en: { me: 'My corner', local: 'Kept on this phone only', synced: u => `☁️ Connected as ${u}`, edit: '✏️ Name, picture and passcode', account: '☁️ My account (all my devices)', switch: '👥 Switch person or add someone', signout: '🚪 Sign out', signoutNote: 'Back to the door; everyone else can come in under their own name.',
      sAccount: 'Account', sSettings: 'Settings', sMine: 'My things', lang: 'Language', size: 'Text size', small: 'Small', normal: 'Normal', large: 'Large', teta: '👵 Teta’s chair (big buttons)', sounds: '🔊 Room sounds', cuts: '💡 Power cuts', weather: '🌦️ Weather and occasion', news: '📰 My newspapers', install: '📲 Install the app',
      rooms: n => `🛋️ My rooms (${n})`, scores: '🏆 My scores', cal: '🎂 Birthdays and events', help: '❓ How do I use Sawt el Beit?', clear: '🧹 Erase everything on this phone', clearAsk: 'Sure? Names, favourites, rooms and recipes are erased from this phone (anything on an account comes back).', close: 'Close', on: 'On', off: 'Off',
      helpText: ['🛋️ The sofa: private family rooms. Make one and tap “＋ Invite someone”.', '🎲 The coffee table: tawleh, cards and trivia, alone or with the family in a room.', '📺 The TV: tap a channel and pick a show.', '📻 The radio: slide the dial to change station.', '⏰ The pill at the top: time, weather and occasion.', '👵 Teta’s chair: big buttons for the grown-ups.'] },
    fr: { me: 'Mon coin', local: 'Gardé sur ce téléphone seulement', synced: u => `☁️ Connecté : ${u}`, edit: '✏️ Prénom, image et code', account: '☁️ Mon compte (tous mes appareils)', switch: '👥 Changer de personne ou en ajouter', signout: '🚪 Se déconnecter', signoutNote: 'Retour à la porte ; chacun peut entrer sous son nom.',
      sAccount: 'Compte', sSettings: 'Réglages', sMine: 'Mes affaires', lang: 'Langue', size: 'Taille du texte', small: 'Petit', normal: 'Normal', large: 'Grand', teta: '👵 Le fauteuil de Teta (gros boutons)', sounds: '🔊 Sons de la maison', cuts: '💡 Coupures de courant', weather: '🌦️ Météo et fête', news: '📰 Mes journaux', install: '📲 Installer l’app',
      rooms: n => `🛋️ Mes pièces (${n})`, scores: '🏆 Mes scores', cal: '🎂 Anniversaires et événements', help: '❓ Comment utiliser Sawt el Beit ?', clear: '🧹 Tout effacer sur ce téléphone', clearAsk: 'Sûr ? Prénoms, favoris, pièces et recettes sont effacés de ce téléphone (ce qui est sur un compte revient).', close: 'Fermer', on: 'Activé', off: 'Désactivé',
      helpText: ['🛋️ Le canapé : des pièces privées pour la famille. Créez-en une et touchez « ＋ Inviter quelqu’un ».', '🎲 La table basse : tawlé, cartes et quiz, seul ou en famille.', '📺 La télé : touchez une chaîne et choisissez une émission.', '📻 La radio : glissez le cadran pour changer de station.', '⏰ La pastille en haut : moment, météo et fête.', '👵 Le fauteuil de Teta : de gros boutons.'] }
  };
  const m = (k, ...a) => { const v = (M[S.lang()] || M.ar)[k]; return typeof v === 'function' ? v(...a) : v; };
  let showHelp = false;
  function applySize() {
    const sz = S.store.get('textSize', 'normal');
    document.documentElement.classList.toggle('ts-small', sz === 'small');
    document.documentElement.classList.toggle('ts-large', sz === 'large');
  }
  applySize();
  function signOut() {
    try { sessionStorage.removeItem('sawt:chosen'); sessionStorage.removeItem('sawt:unlocked'); } catch { /* fine */ }
    push(true).finally(() => { location.href = '/'; });
  }
  function clearPhone() {
    if (!window.confirm(m('clearAsk'))) return;
    try { for (let i = localStorage.length - 1; i >= 0; i--) { const k = localStorage.key(i); if (k && k.startsWith('sawt:')) localStorage.removeItem(k); } sessionStorage.clear(); } catch { /* fine */ }
    location.href = '/';
  }
  function meView() {
    const p = current() || { name: '', icon: '🙂' };
    const row = (label, fn, cls) => { const b = el('button', { type: 'button', className: 'me-row' + (cls ? ' ' + cls : ''), text: label }); b.addEventListener('click', fn); return b; };
    const toggle = (label, on, fn) => {
      const b = el('button', { type: 'button', className: 'me-row me-toggle' }, [el('span', { text: label }), el('b', { className: 'me-sw' + (on ? ' is-on' : ''), text: on ? m('on') : m('off') })]);
      b.setAttribute('aria-pressed', String(!!on));
      b.addEventListener('click', () => { fn(); setTimeout(render, 80); });
      return b;
    };
    const chips = (items, cur, fn) => el('div', { className: 'me-chips' }, items.map(([k, label]) => {
      const b = el('button', { type: 'button', className: 'chip', text: label });
      b.setAttribute('aria-pressed', String(k === cur));
      b.addEventListener('click', () => { fn(k); setTimeout(render, 60); });
      return b;
    }));
    const go = fn => () => { close(); setTimeout(fn, 120); };
    const rooms = window.SawtRooms ? window.SawtRooms.list() : [];
    const head = el('div', { className: 'me-head' }, [
      el('span', { className: 'who-avatar big', text: p.icon || '🙂' }),
      el('h2', { className: 'who-title', id: 'who-title', dir: 'auto', text: p.name || m('me') }),
      el('p', { className: 'quiet small', text: p.sync && p.sync.user ? m('synced', p.sync.user) : m('local') })
    ]);
    const kids = [head,
      el('h3', { className: 'me-sub', text: m('sAccount') }),
      row(m('edit'), () => openPanel('edit', me)),
      storeOn && !(p.sync && p.sync.user) ? row(m('account'), () => { openPanel('edit', me); setTimeout(() => { const f = panel.querySelector('.who-sync input'); if (f) f.focus(); }, 120); }) : null,
      row(m('switch'), () => { view = 'list'; render(); }),
      row(m('signout'), signOut, 'me-out'),
      el('p', { className: 'quiet small me-note', text: m('signoutNote') }),
      el('h3', { className: 'me-sub', text: m('sSettings') }),
      el('p', { className: 'me-k', text: m('lang') }),
      chips([['ar', 'عربي'], ['en', 'English'], ['fr', 'Français']], S.lang(), k => { const b = document.querySelector(`.lang[data-lang="${k}"]`); if (b) b.click(); }),
      el('p', { className: 'me-k', text: m('size') }),
      chips([['small', 'A− ' + m('small')], ['normal', 'A ' + m('normal')], ['large', 'A+ ' + m('large')]], S.store.get('textSize', 'normal'), k => { S.store.set('textSize', k); applySize(); }),
      toggle(m('teta'), document.body.classList.contains('is-simple'), () => { const b = document.getElementById('simple-btn'); if (b) b.click(); close(); }),
      window.SawtAmbience ? toggle(m('sounds'), window.SawtAmbience.on(), () => window.SawtAmbience.toggle()) : null,
      window.SawtRoom && window.SawtRoom.cuts ? toggle(m('cuts'), window.SawtRoom.cuts(), () => window.SawtRoom.setCuts(!window.SawtRoom.cuts())) : null,
      row(m('weather'), go(() => window.SawtRoom && window.SawtRoom.openWeather())),
      row(m('news'), go(() => window.SawtRoom && window.SawtRoom.open('news'))),
      window.SawtInstall && window.SawtInstall.can() ? row(m('install'), go(() => window.SawtInstall.install())) : null,
      el('h3', { className: 'me-sub', text: m('sMine') }),
      row(m('rooms', rooms.length), go(() => window.SawtRoom && window.SawtRoom.open('together'))),
      row(m('scores'), go(() => { if (window.SawtRoom) window.SawtRoom.open('tawleh'); setTimeout(() => window.SawtCards && window.SawtCards.showTab('scores'), 80); })),
      row(m('cal'), go(() => window.SawtRoom && window.SawtRoom.open('calendar'))),
      row(m('help'), () => { showHelp = !showHelp; render(); }),
      showHelp ? el('ul', { className: 'me-help' }, m('helpText').map(x => el('li', { dir: 'auto', text: x }))) : null,
      row(m('clear'), clearPhone, 'me-danger'),
      (() => { const c = el('button', { type: 'button', className: 'btn who-close', text: m('close') }); c.addEventListener('click', close); return c; })()
    ].filter(Boolean);
    return el('div', { className: 'me' }, kids);
  }

  // ------------------------------------------------------------------ signing in on a new device
  // The account's things land in a new corner of this device, and it becomes the one in use.
  const DEVICE = new Set(['profiles', 'profileId', 'visited', 'visits', 'installAsked', 'lookedAround']);
  function loginForm() {
    const user = el('input', { maxLength: 24, placeholder: t('userPh'), autocomplete: 'username', dir: 'ltr', autocapitalize: 'none' });
    const pin = el('input', { type: 'password', inputMode: 'numeric', maxLength: 8, autocomplete: 'current-password', placeholder: t('pinPh') });
    const msg = el('p', { className: 'form-error', role: 'alert', hidden: !syncErr, text: syncErr });
    const back = el('button', { type: 'button', className: 'btn', text: t('cancel') });
    back.addEventListener('click', () => { syncErr = ''; close(); });
    const f = el('form', { className: 'who-form' }, [
      el('p', { className: 'quiet small', text: t('loginLede') }),
      el('label', { className: 'field' }, [el('span', { text: t('user') }), user]),
      el('label', { className: 'field' }, [el('span', { text: t('pin') }), pin]),
      msg,
      el('div', { className: 'who-actions' }, [el('button', { type: 'submit', className: 'btn btn-primary', text: t('login') }), back])
    ]);
    f.addEventListener('submit', async e => {
      e.preventDefault();
      syncErr = '';
      try {
        const res = await fetch('/api/profile/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user: user.value.trim(), pin: digits(pin.value), mustExist: true }) });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(d.code || 'server');
        const same = list.find(x => x.sync && x.sync.user === d.user);
        const id = same ? same.id : (list.length ? 'p' + Date.now().toString(36) : 'p0');
        const prof = { ...(same || { icon: ICONS[0], lock: null }), id, name: d.name || d.user, sync: { user: d.user, token: d.token } };
        list = [...list.filter(x => x.id !== id), prof]; saveList();
        const pre = id === 'p0' ? 'sawt:' : `sawt:${id}:`;
        try { for (const [k, v] of Object.entries(d.data || {})) if (!DEVICE.has(k)) localStorage.setItem(pre + k, JSON.stringify(v)); } catch { /* full */ }
        try { localStorage.setItem(pre + 'syncedAt', JSON.stringify(d.updated || Date.now())); } catch { /* fine */ }
        switchTo(id);
      } catch (ex) { syncErr = t('errs')[ex.message] || t('errs').server; render(); }
    });
    return el('div', {}, [el('h2', { className: 'who-title', id: 'who-title', text: t('login') }), f]);
  }

  // ------------------------------------------------------------------ the same person on every device
  function syncBox(p) {
    const box = el('section', { className: 'who-sync' }, [el('h3', { text: '☁️ ' + t('sync') })]);
    if (!storeOn) { box.append(el('p', { className: 'quiet small', text: t('noStore') })); return box; }
    if (p.sync && p.sync.user) {
      const d = el('button', { type: 'button', className: 'link-btn', text: t('disconnect') });
      d.addEventListener('click', async () => {
        try { await fetch('/api/profile/forget', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p.sync) }); } catch { /* fine */ }
        p.sync = null; const i = list.findIndex(x => x.id === p.id); list[i] = p; saveList(); render();
      });
      box.append(el('p', { text: t('synced', p.sync.user) }), d);
      return box;
    }
    const user = el('input', { maxLength: 24, placeholder: t('userPh'), autocomplete: 'username', dir: 'ltr', value: (p.name || '').toLowerCase().replace(/\s+/g, '.') });
    const pin = el('input', { type: 'password', inputMode: 'numeric', maxLength: 8, autocomplete: 'current-password', placeholder: t('pinPh') });
    const have = el('input', { type: 'checkbox' });
    const msg = el('p', { className: 'form-error', role: 'alert', hidden: !syncErr, text: syncErr });
    const f = el('form', { className: 'who-form' }, [
      el('p', { className: 'quiet small', text: t('syncLede') }),
      el('label', { className: 'field' }, [el('span', { text: t('user') }), user]),
      el('label', { className: 'field' }, [el('span', { text: t('pin') }), pin]),
      el('label', { className: 'who-check' }, [have, el('span', { text: t('have') })]),
      msg,
      el('button', { type: 'submit', className: 'btn btn-primary', text: t('connect') })
    ]);
    f.addEventListener('submit', async e => {
      e.preventDefault();
      syncErr = '';
      try {
        const res = await fetch('/api/profile/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user: user.value, pin: digits(pin.value), name: p.name, mustExist: have.checked }) });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(d.code || 'server');
        p.sync = { user: d.user, token: d.token };
        const i = list.findIndex(x => x.id === p.id); list[i] = p; saveList();
        if (!d.created && d.data && Object.keys(d.data).length) {
          for (const [k, v] of Object.entries(d.data)) S.store.set(k, v);
          S.store.set('syncedAt', d.updated || Date.now());
          location.reload();
          return;
        }
        await push(true);
        render();
      } catch (ex) { syncErr = t('errs')[ex.message] || t('errs').server; render(); }
    });
    box.append(f);
    return box;
  }
  const SKIP = new Set(['myPhotos', 'tawlehGame', 'syncedAt', 'lastPush']);
  let lastSent = S.store.get('lastPush', '');
  async function push(force) {
    const p = current();
    if (!storeOn || !p || !p.sync) return;
    const all = S.store.dump();
    const data = {};
    for (const [k, v] of Object.entries(all)) if (!SKIP.has(k)) data[k] = v;
    const sig = JSON.stringify(data);
    if (!force && sig === lastSent) return;
    try {
      const res = await fetch('/api/profile/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user: p.sync.user, token: p.sync.token, name: p.name, data }), keepalive: sig.length < 60000 });
      if (res.ok) { lastSent = sig; S.store.set('lastPush', sig.length < 50000 ? sig : String(Date.now())); }
    } catch { /* next time */ }
  }
  setInterval(() => push(false), 120000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) push(false); });

  // ------------------------------------------------------------------ greeting by name
  function greet() {
    const n = myName();
    const title = document.querySelector('.intro-title');
    if (n && title) title.textContent = t('greet', n);
    const ask = $('intro-name');
    if (ask) ask.hidden = !!n;
    renderBtn();
  }
  // at the door: a name field for the very first visit, or who's coming in
  // (the people of this house, someone new, or an account from another device)
  const doorWho = el('div', { className: 'intro-who' });
  function renderDoor() {
    const kids = [];
    if (list.length) {
      kids.push(el('p', { className: 'intro-who-t', text: t('whoIn') }));
      const row = el('div', { className: 'intro-who-row' }, list.map(p => {
        const b = el('button', { type: 'button', className: 'intro-who-b' + (p.id === me ? ' is-me' : '') }, [el('span', { className: 'who-avatar', text: p.icon || '🙂' }), el('span', { dir: 'auto', text: p.name }), p.lock ? el('small', { text: '🔒' }) : null].filter(Boolean));
        b.setAttribute('aria-pressed', String(p.id === me));
        b.addEventListener('click', () => {
          if (p.id === me) { $('intro-btn').click(); return; }
          if (p.lock) { pinFor = p.id; view = 'pin'; panel.hidden = false; document.body.classList.add('who-on'); render(); return; }
          switchTo(p.id);
        });
        return b;
      }));
      const add = el('button', { type: 'button', className: 'intro-who-b is-add' }, [el('span', { className: 'who-avatar', text: '+' }), el('span', { text: t('someoneNew') })]);
      add.addEventListener('click', () => openPanel('edit', null));
      row.appendChild(add);
      kids.push(row);
    }
    if (storeOn) { const a = el('button', { type: 'button', className: 'link-btn intro-acct', text: t('haveAccount') }); a.addEventListener('click', () => openPanel('login')); kids.push(a); }
    doorWho.replaceChildren(...kids);
    doorWho.hidden = !kids.length;
  }
  (() => {
    const intro = document.querySelector('.intro-text');
    const btnIn = $('intro-btn');
    if (!intro || !btnIn) return;
    const input = el('input', { id: 'intro-name', className: 'intro-name', maxLength: 30, autocomplete: 'given-name', placeholder: t('askName'), 'aria-label': t('askName'), hidden: !!myName() });
    btnIn.before(input);
    btnIn.after(doorWho);
    renderDoor();
    input.required = true;
    input.addEventListener('input', () => input.removeAttribute('aria-invalid'));
    const take = e => {
      const n = input.value.trim().replace(/\s+/g, ' ');
      if (myName()) { ss.set('chosen', me); return; }
      if (!n) {
        // the name comes first: nobody walks in without one
        e.preventDefault(); e.stopImmediatePropagation();
        input.classList.remove('is-shake'); void input.offsetWidth; input.classList.add('is-shake');
        input.setAttribute('aria-invalid', 'true');
        S.toast(t('needName'));
        input.focus();
        return;
      }
      list.push({ id: me, name: n, icon: ICONS[0], lock: null }); saveList();
      ss.set('chosen', me);
      greet();
      S.toast(t('hello', n));
      document.dispatchEvent(new CustomEvent('sawt:me'));
    };
    btnIn.addEventListener('click', take, true);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); btnIn.click(); } });
  })();

  // ------------------------------------------------------------------ a gentle word about an account
  // From the second visit on, once in a while (never more than every two weeks), for someone
  // who has no account yet: a small card with "make an account" and "later".
  function askAccount() {
    const p = current();
    if (!storeOn || !p || (p.sync && p.sync.user) || document.querySelector('.acct-ask')) return;
    if ((S.store.get('visits', 0) || 0) < 2) return;
    if (Date.now() - (S.store.get('acctAskAt', 0) || 0) < 14 * 864e5) return;
    if (window.SawtRoom && window.SawtRoom.isOpen()) { setTimeout(askAccount, 60000); return; }     // not over a drawer someone is using
    S.store.set('acctAskAt', Date.now());
    const yes = el('button', { type: 'button', className: 'btn btn-primary', text: t('acctYes') });
    const no = el('button', { type: 'button', className: 'link-btn', text: t('acctLater') });
    const card = el('div', { className: 'acct-ask', role: 'dialog', 'aria-label': t('sync') }, [el('p', { dir: 'auto', text: t('acctAsk') }), el('div', { className: 'q-row' }, [yes, no])]);
    const bye = () => { card.classList.remove('is-on'); setTimeout(() => card.remove(), 350); };
    yes.addEventListener('click', () => { bye(); openPanel('edit', me); setTimeout(() => { const f = panel.querySelector('.who-sync input'); if (f) f.focus(); }, 120); });
    no.addEventListener('click', bye);
    document.body.appendChild(card);
    requestAnimationFrame(() => card.classList.add('is-on'));
  }
  document.addEventListener('sawt:entered', () => setTimeout(askAccount, 20000));

  // ------------------------------------------------------------------ at the door: who is it, and the lock
  function gate() {
    const p = current();
    if (p && p.lock && ss.get('unlocked') !== me) { pinFor = me; view = 'pin-gate'; panel.hidden = false; document.body.classList.add('who-on'); render(); return; }
  }

  document.addEventListener('sawt:config', e => { storeOn = !!(e.detail && e.detail.dedications); if (!panel.hidden && view === 'edit') render(); renderDoor(); push(false); });
  document.addEventListener('sawt:lang', () => { greet(); renderDoor(); if (!panel.hidden) render(); const i = $('intro-name'); if (i) { i.placeholder = t('askName'); i.setAttribute('aria-label', t('askName')); } });
  window.SawtMe = { needName: () => !myName(), stopAtDoor: () => !myName() || ss.get('chosen') !== me, focusName: () => { const i = $('intro-name'); if (i) { i.hidden = false; i.focus(); } }, name: myName, id: () => me, icon: () => (current() || {}).icon || '🙂', open: openPanel, push };
  renderBtn();
  greet();
  gate();
})();

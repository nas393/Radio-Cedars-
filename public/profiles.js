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
  btn.addEventListener('click', () => openPanel());

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
  // a name field in the welcome, for the very first visit
  (() => {
    const intro = document.querySelector('.intro-text');
    const btnIn = $('intro-btn');
    if (!intro || !btnIn) return;
    const input = el('input', { id: 'intro-name', className: 'intro-name', maxLength: 30, autocomplete: 'given-name', placeholder: t('askName'), 'aria-label': t('askName'), hidden: !!myName() });
    btnIn.before(input);
    input.required = true;
    input.addEventListener('input', () => input.removeAttribute('aria-invalid'));
    const take = e => {
      const n = input.value.trim().replace(/\s+/g, ' ');
      if (myName()) return;
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
      greet();
      S.toast(t('hello', n));
      document.dispatchEvent(new CustomEvent('sawt:me'));
    };
    btnIn.addEventListener('click', take, true);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); btnIn.click(); } });
  })();

  // ------------------------------------------------------------------ at the door: who is it, and the lock
  function gate() {
    const p = current();
    if (p && p.lock && ss.get('unlocked') !== me) { pinFor = me; view = 'pin-gate'; panel.hidden = false; document.body.classList.add('who-on'); render(); return; }
    if (list.length > 1 && !ss.get('chosen')) { view = 'gate'; panel.hidden = false; document.body.classList.add('who-on'); render(); }
  }

  document.addEventListener('sawt:config', e => { storeOn = !!(e.detail && e.detail.dedications); if (!panel.hidden && view === 'edit') render(); push(false); });
  document.addEventListener('sawt:lang', () => { greet(); if (!panel.hidden) render(); const i = $('intro-name'); if (i) { i.placeholder = t('askName'); i.setAttribute('aria-label', t('askName')); } });
  window.SawtMe = { needName: () => !myName(), focusName: () => { const i = $('intro-name'); if (i) { i.hidden = false; i.focus(); } }, name: myName, id: () => me, icon: () => (current() || {}).icon || '🙂', open: openPanel, push };
  renderBtn();
  greet();
  gate();
})();

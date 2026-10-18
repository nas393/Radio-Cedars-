/* Birthdays and name days ("أعياد العيلة"), on the calendar.
   Add the family's birthdays (on this device, and shared in a family room if you like).
   Name days come by themselves for the names the saints' calendar knows (Georges on
   23 April, Elias on 20 July, Charbel on the third Sunday of July…).
   On the day: a greeting here, and once in the family room for everyone. */
(() => {
  'use strict';
  const S = window.Sawt;
  const $ = id => document.getElementById(id);
  const el = S.el;
  const host = document.querySelector('[data-panel="calendar"] .sun-today');
  if (!host) return;
  const box = el('div', { className: 'bd', id: 'bdays' });
  host.after(box);

  const T = {
    ar: {
      title: '🎂 أعياد العيلة', add: 'زيد عيد ميلاد', who: 'مين؟', day: 'النهار', month: 'الشهر', save: 'زيد', cancel: 'رجوع', share: n => `شاركو بغرفة "${n}"`,
      none: 'زيدوا أعياد الميلاد، ومنذكّركن فيها كل سنة.', today: 'اليوم!', tomorrow: 'بكرا', inDays: n => `بعد ${S.num(n)} يوم`, bday: 'عيد ميلاد', nameday: s => `عيد ${s}`,
      hbd: n => `🎂 كل سنة وإنت سالم/ة يا ${n}!`, hnd: n => `🕯️ كل عيد وإنت بخير يا ${n}!`, del: 'امحي', sent: 'بعتنا المعايدة عالغرفة 🎉', fromRoom: 'من الغرفة',
      months: ['كانون التاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تمّوز', 'آب', 'أيلول', 'تشرين الأوّل', 'تشرين التاني', 'كانون الأوّل']
    },
    en: {
      title: '🎂 Family birthdays', add: 'Add a birthday', who: 'Who?', day: 'Day', month: 'Month', save: 'Add', cancel: 'Back', share: n => `Share in "${n}"`,
      none: 'Add the family’s birthdays and we’ll remind you every year.', today: 'Today!', tomorrow: 'Tomorrow', inDays: n => `In ${n} days`, bday: 'Birthday', nameday: s => `Name day (${s})`,
      hbd: n => `🎂 Happy birthday, ${n}!`, hnd: n => `🕯️ Happy name day, ${n}!`, del: 'Delete', sent: 'Greeting sent to the room 🎉', fromRoom: 'from the room',
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },
    fr: {
      title: '🎂 Anniversaires de la famille', add: 'Ajouter un anniversaire', who: 'Qui ?', day: 'Jour', month: 'Mois', save: 'Ajouter', cancel: 'Retour', share: n => `Partager dans « ${n} »`,
      none: 'Ajoutez les anniversaires de la famille, on vous les rappellera chaque année.', today: 'Aujourd’hui !', tomorrow: 'Demain', inDays: n => `Dans ${n} jours`, bday: 'Anniversaire', nameday: s => `Fête (${s})`,
      hbd: n => `🎂 Joyeux anniversaire, ${n} !`, hnd: n => `🕯️ Bonne fête, ${n} !`, del: 'Supprimer', sent: 'Vœux envoyés dans la pièce 🎉', fromRoom: 'de la pièce',
      months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
    }
  };
  const t = (k, ...a) => { const v = (T[S.lang()] || T.ar)[k]; return typeof v === 'function' ? v(...a) : v; };
  const R = () => window.SawtRooms;

  // ------------------------------------------------------------------ the saints' calendar
  const ND = [
    { m: 1, d: 17, s: ['مار أنطونيوس', 'St Anthony', 'saint Antoine'], n: ['antoine', 'anthony', 'antonio', 'antonios', 'tony', 'toni', 'mtanios', 'انطوان', 'طوني', 'انطونيوس', 'مطانيوس'] },
    { m: 2, d: 9, s: ['مار مارون', 'St Maron', 'saint Maroun'], n: ['maroun', 'maron', 'مارون'] },
    { m: 3, d: 19, s: ['مار يوسف', 'St Joseph', 'saint Joseph'], n: ['joseph', 'youssef', 'yousef', 'youssif', 'josef', 'joe', 'يوسف', 'جوزيف', 'جو'] },
    { m: 3, d: 23, s: ['القدّيسة رفقا', 'St Rafqa', 'sainte Rafqa'], n: ['rafqa', 'rafka', 'رفقا'] },
    { m: 4, d: 23, s: ['مار جرجس', 'St George', 'saint Georges'], n: ['george', 'georges', 'jirjis', 'gergi', 'jerjes', 'جورج', 'جرجس', 'جريس'] },
    { m: 5, d: 22, s: ['القدّيسة ريتا', 'St Rita', 'sainte Rita'], n: ['rita', 'ريتا'] },
    { m: 6, d: 24, s: ['مار يوحنا', 'St John', 'saint Jean'], n: ['jean', 'john', 'johnny', 'hanna', 'yohanna', 'حنا', 'جان', 'جوني', 'يوحنا'] },
    { m: 6, d: 29, s: ['مار بطرس وبولس', 'Sts Peter and Paul', 'saints Pierre et Paul'], n: ['pierre', 'peter', 'boutros', 'paul', 'boulos', 'بطرس', 'بيار', 'بولس', 'بول'] },
    { m: 7, d: 20, s: ['مار الياس', 'St Elias', 'saint Élie'], n: ['elias', 'elie', 'elia', 'ilyas', 'eliane', 'الياس', 'ايلي', 'ايليا'] },
    { m: 7, sun: 3, s: ['مار شربل', 'St Charbel', 'saint Charbel'], n: ['charbel', 'sharbel', 'شربل'] },
    { m: 8, d: 15, s: ['السيّدة', 'Our Lady', 'la Vierge'], n: ['marie', 'mary', 'maria', 'mariam', 'maryam', 'myriam', 'miriam', 'مريم', 'ماري', 'ماريا'] },
    { m: 9, d: 24, s: ['مار تقلا', 'St Thecla', 'sainte Thècle'], n: ['takla', 'thecla', 'tecla', 'تقلا'] },
    { m: 10, d: 1, s: ['القدّيسة تريزا', 'St Thérèse', 'sainte Thérèse'], n: ['therese', 'teresa', 'tereza', 'تريز', 'تيريز', 'تريزا'] },
    { m: 10, d: 7, s: ['مار سركيس', 'St Sergius', 'saint Serge'], n: ['sarkis', 'serge', 'سركيس'] },
    { m: 12, d: 4, s: ['القدّيسة بربارة', 'St Barbara', 'sainte Barbe'], n: ['barbara', 'بربارة'] },
    { m: 12, d: 6, s: ['مار نقولا', 'St Nicholas', 'saint Nicolas'], n: ['nicolas', 'nicola', 'nicole', 'nicholas', 'نقولا', 'نيكول', 'نيقولا'] },
    { m: 12, d: 14, s: ['القدّيس نعمة الله', 'St Nimatullah', 'saint Nehmetallah'], n: ['nehmetallah', 'nimatullah', 'نعمة'] }
  ];
  const norm = x => String(x || '').trim().split(/\s+/)[0].toLowerCase().normalize('NFD').replace(/[̀-ًͯ-ْـ]/g, '').replace(/[إأآ]/g, 'ا');
  // the third Sunday of July, and so on
  function sundayOf(y, m, nth) { const d = new Date(y, m - 1, 1); const first = (7 - d.getDay()) % 7 + 1; return first + (nth - 1) * 7; }
  function nameDayFor(name) {
    const k = norm(name);
    return ND.find(x => x.n.some(v => norm(v) === k)) || null;
  }
  const sName = x => x.s[{ ar: 0, en: 1, fr: 2 }[S.lang()] || 0];

  // ------------------------------------------------------------------ the list
  let list = S.store.get('bdays', []) || [];          // [{ n, m, d }]
  let roomB = {};                                     // name -> 'MM-DD' from the room
  let adding = false;
  const save = () => S.store.set('bdays', list);
  const today0 = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  function nextDate(m, d, sun) {
    const now = today0();
    for (const y of [now.getFullYear(), now.getFullYear() + 1]) {
      const day = sun ? sundayOf(y, m, sun) : d;
      const dt = new Date(y, m - 1, day);
      if (dt >= now) return dt;
    }
    return null;
  }
  function people() {
    const out = new Map();
    list.forEach(b => out.set(norm(b.n) + ':b', { kind: 'bday', n: b.n, m: b.m, d: b.d, local: true }));
    Object.entries(roomB).forEach(([n, md]) => { const [m, d] = md.split('-').map(Number); if (!out.has(norm(n) + ':b')) out.set(norm(n) + ':b', { kind: 'bday', n, m, d, room: true }); });
    // name days for everyone we know by name
    const names = new Set([...list.map(b => b.n), ...Object.keys(roomB), ...((S.store.get('profiles', []) || []).map(p => p.name)), ...(R() && R().current() ? (R().current().members || []) : [])].filter(Boolean));
    names.forEach(n => { const x = nameDayFor(n); if (x && !out.has(norm(n) + ':n')) out.set(norm(n) + ':n', { kind: 'nameday', n, m: x.m, d: x.d, sun: x.sun, saint: x }); });
    return [...out.values()].map(p => ({ ...p, at: nextDate(p.m, p.d, p.sun) })).filter(p => p.at).sort((a, b) => a.at - b.at);
  }
  const daysTo = dt => Math.round((dt - today0()) / 864e5);
  function when(dt) { const n = daysTo(dt); return n === 0 ? t('today') : n === 1 ? t('tomorrow') : t('inDays', n); }

  function render() {
    const kids = [el('h3', { className: 'pv-sub', text: t('title') })];
    const ps = people().filter(p => p.kind === 'bday' || daysTo(p.at) <= 60);
    if (!ps.length && !adding) kids.push(el('p', { className: 'quiet small', text: t('none') }));
    if (ps.length) kids.push(el('ul', { className: 'bd-list' }, ps.slice(0, 12).map(p => {
      const n = daysTo(p.at);
      const del = p.local ? el('button', { type: 'button', className: 'link-btn bd-del', text: '×', 'aria-label': t('del'), title: t('del') }) : null;
      if (del) del.addEventListener('click', () => { list = list.filter(b => !(b.n === p.n && b.m === p.m && b.d === p.d)); save(); const r = R() && R().current(); if (r && roomB[p.n]) R().bday(r, p.n, '', true).catch(() => {}); render(); });
      return el('li', { className: 'bd-item' + (n === 0 ? ' is-today' : '') }, [
        el('span', { className: 'bd-ic', text: p.kind === 'bday' ? '🎂' : '🕯️' }),
        el('span', { className: 'bd-n', dir: 'auto' }, [el('b', { text: p.n }), el('small', { text: (p.kind === 'bday' ? t('bday') : t('nameday', sName(p.saint))) + (p.room ? ' · ' + t('fromRoom') : '') })]),
        el('span', { className: 'bd-when', text: `${S.num(p.at.getDate())} ${t('months')[p.at.getMonth()]} · ${when(p.at)}` }),
        del
      ].filter(Boolean));
    })));
    if (adding) kids.push(form());
    else { const b = el('button', { type: 'button', className: 'btn', text: '＋ ' + t('add') }); b.addEventListener('click', () => { adding = true; render(); }); kids.push(b); }
    box.replaceChildren(...kids);
  }
  function form() {
    const who = el('input', { maxLength: 24, required: true, autocomplete: 'off', placeholder: t('who') });
    const day = el('select', { 'aria-label': t('day') }, Array.from({ length: 31 }, (_, i) => el('option', { value: i + 1, text: S.num(i + 1) })));
    const mon = el('select', { 'aria-label': t('month') }, t('months').map((m, i) => el('option', { value: i + 1, text: m })));
    const r = R() && R().storeOn() && R().current();
    const share = r ? el('input', { type: 'checkbox', checked: true }) : null;
    const f = el('form', { className: 'bd-form' }, [
      el('label', { className: 'field' }, [el('span', { text: t('who') }), who]),
      el('div', { className: 'bd-date' }, [el('label', { className: 'field' }, [el('span', { text: t('day') }), day]), el('label', { className: 'field' }, [el('span', { text: t('month') }), mon])]),
      share ? el('label', { className: 'q-switch' }, [share, el('span', { dir: 'auto', text: t('share', r.title) })]) : null,
      el('div', { className: 'q-row' }, [el('button', { type: 'submit', className: 'btn btn-primary', text: t('save') }), (() => { const c = el('button', { type: 'button', className: 'link-btn', text: t('cancel') }); c.addEventListener('click', () => { adding = false; render(); }); return c; })()])
    ].filter(Boolean));
    f.addEventListener('submit', e => {
      e.preventDefault();
      const n = who.value.trim(); if (!n) return;
      const m = Number(mon.value), d = Math.min(Number(day.value), new Date(2024, m, 0).getDate());
      list = [...list.filter(b => norm(b.n) !== norm(n)), { n, m, d }]; save();
      if (share && share.checked) R().bday(r, n, `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`).catch(() => {});
      adding = false; render(); check();
    });
    setTimeout(() => who.focus({ preventScroll: true }), 50);
    return f;
  }

  // ------------------------------------------------------------------ on the day
  function check() {
    const iso = new Intl.DateTimeFormat('en-CA').format(new Date());
    const done = S.store.get('bdGreeted', {}) || {};
    const r = R() && R().storeOn() && R().current();
    people().filter(p => daysTo(p.at) === 0).forEach(p => {
      const key = `${iso}:${p.kind}:${norm(p.n)}`;
      if (!done[key]) { done[key] = 1; S.toast(p.kind === 'bday' ? t('hbd', p.n) : t('hnd', p.n)); }
      if (r && !done[key + ':' + r.id]) { done[key + ':' + r.id] = 1; R().greet(r, p.n, p.kind, iso).catch(() => {}); }
    });
    // keep only this year's marks
    Object.keys(done).forEach(k => { if (!k.startsWith(iso.slice(0, 4))) delete done[k]; });
    S.store.set('bdGreeted', done);
  }

  document.addEventListener('sawt:room-bdays', e => { roomB = (e.detail && e.detail.bdays) || {}; render(); check(); });
  document.addEventListener('sawt:panel', e => { if (e.detail === 'calendar') render(); });
  document.addEventListener('sawt:lang', render);
  document.addEventListener('sawt:entered', () => setTimeout(check, 4000));
  window.SawtBdays = { nameDayFor, people, check };
  render();
})();

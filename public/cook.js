/* Teta's table: the cookbook and the cooking mode.
   Thirty Lebanese recipes, a step-by-step cooking mode with timers (only if you want
   them), and your own recipes with your name on them: kept on your device, sent by
   link, or offered to the family cookbook for everyone (after a quick review). */
(() => {
  'use strict';
  const S = window.Sawt;
  const C = window.SAWT_CONTENT || {};
  const $ = id => document.getElementById(id);
  const el = S.el;
  const panel = document.querySelector('.pv[data-panel="books"]');
  if (!panel) return;
  const box = el('div', { className: 'ck', id: 'cook' });
  panel.replaceChildren(box);

  const T = {
    ar: {
      search: 'دوّري على طبخة…', all: 'الكل', mezze: 'مازة', main: 'طبخات', breakfast: 'ترويقة', sweets: 'حلو', mine: 'طبخاتي', family: 'دفتر العيلة',
      serves: n => `لـ ${S.num(n)}`, min: n => n >= 60 ? `${S.num(Math.floor(n / 60))} س${n % 60 ? ` ${S.num(n % 60)} د` : ''}` : `${S.num(n)} د`, by: n => `من ${n}`,
      ingredients: 'المكوّنات', method: 'الطريقة', cook: '👩‍🍳 يلّا نطبخ', back: 'رجوع', step: (i, n) => `الخطوة ${S.num(i)} من ${S.num(n)}`, next: 'بعدين', prev: 'قبل',
      timer: d => `⏱ ${d}`, startTimer: 'شغّل المؤقّت', stopTimer: 'وقّف', timeUp: n => `⏰ خلص الوقت: ${n}`, done: 'صحتين وعافية! 🍽️', finish: 'خلصنا',
      add: '＋ زيدي طبختك', title: 'اسم الطبخة', author: 'اسمك', place: 'من وين؟ (اختياري)', ing: 'المكوّنات (كل وحدة بسطر)', steps: 'الطريقة (كل خطوة بسطر). إذا في وقت، اكتبيه: «١٠ دقايق»',
      servesL: 'لكم شخص؟', timeL: 'قدّيش بتاخد (دقايق)', save: 'احفظ', toBook: 'ابعتها كمان لدفتر العيلة (بتنشر بعد المراجعة)', saved: 'انحفظت بدفترك 📒', sentBook: 'انبعتت لدفتر العيلة، بتطلع بعد المراجعة 💌',
      share: 'ابعت الوصفة', shareText: n => `وصفة ${n} من دفتري بصوت البيت 🍲`, saveShared: 'احفظها بدفتري', shared: 'حدا بعتلك وصفة', del: 'امحيها', none: 'ما في طبخات هون بعد.',
      keepAwake: 'الشاشة بتضل ضاوية وإنتِ عم تطبخي.', custom: 'مؤقّت', plus: '+١ د', minus: '−١ د', ingDone: 'علّمي اللي جهّزتيه',
      errs: { missing: 'اكتبي الاسم، المكوّنات والطريقة.', links: 'بلا روابط.', phone: 'بلا أرقام.', rate: 'كتير وصفات هالساعة.', server: 'ما انبعتت، بس انحفظت عندك.' }
    },
    en: {
      search: 'Find a dish…', all: 'All', mezze: 'Mezze', main: 'Mains', breakfast: 'Breakfast', sweets: 'Sweets', mine: 'My recipes', family: 'Family book',
      serves: n => `Serves ${n}`, min: n => n >= 60 ? `${Math.floor(n / 60)} h${n % 60 ? ` ${n % 60} min` : ''}` : `${n} min`, by: n => `by ${n}`,
      ingredients: 'Ingredients', method: 'Method', cook: '👩‍🍳 Let’s cook', back: 'Back', step: (i, n) => `Step ${i} of ${n}`, next: 'Next', prev: 'Back',
      timer: d => `⏱ ${d}`, startTimer: 'Start timer', stopTimer: 'Stop', timeUp: n => `⏰ Time’s up: ${n}`, done: 'Sahtein! Enjoy 🍽️', finish: 'Done',
      add: '＋ Add your recipe', title: 'Dish name', author: 'Your name', place: 'From where? (optional)', ing: 'Ingredients (one per line)', steps: 'Method (one step per line). Put times in, like “10 minutes”',
      servesL: 'Serves', timeL: 'Time (minutes)', save: 'Save', toBook: 'Also send it to the family cookbook (shown after a review)', saved: 'Saved in your book 📒', sentBook: 'Sent to the family cookbook; it shows after a review 💌',
      share: 'Send the recipe', shareText: n => `My recipe for ${n}, from Sawt el Beit 🍲`, saveShared: 'Save to my book', shared: 'Someone sent you a recipe', del: 'Delete', none: 'No recipes here yet.',
      keepAwake: 'The screen stays on while you cook.', custom: 'Timer', plus: '+1 min', minus: '−1 min', ingDone: 'Tick what’s ready',
      errs: { missing: 'Add the name, ingredients and method.', links: 'No links, please.', phone: 'No phone numbers.', rate: 'Too many recipes this hour.', server: 'Not sent, but saved on your device.' }
    },
    fr: {
      search: 'Chercher un plat…', all: 'Tout', mezze: 'Mezzés', main: 'Plats', breakfast: 'Petit-déj', sweets: 'Douceurs', mine: 'Mes recettes', family: 'Livre de famille',
      serves: n => `Pour ${n}`, min: n => n >= 60 ? `${Math.floor(n / 60)} h${n % 60 ? ` ${n % 60}` : ''}` : `${n} min`, by: n => `par ${n}`,
      ingredients: 'Ingrédients', method: 'Préparation', cook: '👩‍🍳 On cuisine', back: 'Retour', step: (i, n) => `Étape ${i} sur ${n}`, next: 'Suivant', prev: 'Précédent',
      timer: d => `⏱ ${d}`, startTimer: 'Lancer le minuteur', stopTimer: 'Arrêter', timeUp: n => `⏰ C’est l’heure : ${n}`, done: 'Sahtein ! Bon appétit 🍽️', finish: 'Terminé',
      add: '＋ Ajouter votre recette', title: 'Nom du plat', author: 'Votre prénom', place: 'D’où ? (facultatif)', ing: 'Ingrédients (un par ligne)', steps: 'Préparation (une étape par ligne). Indiquez les durées, ex. « 10 minutes »',
      servesL: 'Pour combien', timeL: 'Durée (minutes)', save: 'Enregistrer', toBook: 'L’envoyer aussi au livre de famille (publié après relecture)', saved: 'Enregistrée dans votre livre 📒', sentBook: 'Envoyée au livre de famille, publiée après relecture 💌',
      share: 'Envoyer la recette', shareText: n => `Ma recette de ${n}, de Sawt el Beit 🍲`, saveShared: 'L’enregistrer', shared: 'On vous a envoyé une recette', del: 'Supprimer', none: 'Pas encore de recettes ici.',
      keepAwake: 'L’écran reste allumé pendant la cuisine.', custom: 'Minuteur', plus: '+1 min', minus: '−1 min', ingDone: 'Cochez ce qui est prêt',
      errs: { missing: 'Ajoutez le nom, les ingrédients et la préparation.', links: 'Pas de liens.', phone: 'Pas de numéros.', rate: 'Trop de recettes cette heure-ci.', server: 'Pas envoyée, mais enregistrée chez vous.' }
    }
  };
  const t = (k, ...a) => { const v = (T[S.lang()] || T.ar)[k]; return typeof v === 'function' ? v(...a) : v; };
  const L = () => S.lang();
  const SEP = () => (L() === 'ar' ? '، ' : ' · ');   // a middle dot next to Arabic digits reads like a zero

  // ------------------------------------------------------------------ all the recipes, one shape
  const CAT = { tabbouleh: 'mezze', hummus: 'mezze', mjaddara: 'main', fattoush: 'mezze' };
  const toMin = (n, unit) => /س|hour|heure|h$/i.test(unit) ? n * 60 : n;
  const num = s => Number(String(s).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  const TIME_RE = /(\d+|[٠-٩]+)\s*(دقيقة|دقائق|دقايق|د|ساعة|ساعات|minutes?|mins?|mn|hours?|heures?|h)(?![a-zA-Z\u0621-\u064A])/i;
  function guessTimer(text) {
    if (/دقيقتين/.test(text)) return 120;
    if (/ساعتين/.test(text)) return 7200;
    const m = String(text).match(TIME_RE);
    return m ? toMin(num(m[1]), m[2]) * 60 : 0;
  }
  function builtIn() {
    const old = (C.recipes || []).map(r => ({
      id: r.id, cat: CAT[r.id] || 'main', serves: r.serves, time: r.time, title: r.title, ing: r.ingredients, steps: r.steps,
      timers: (r.steps.en || []).map(guessTimer)
    }));
    return [...old, ...(window.SAWT_RECIPES || [])];
  }
  const loc = (v, lang = L()) => (v && typeof v === 'object' && !Array.isArray(v) ? (v[lang] || v.en || v.ar || Object.values(v)[0]) : v);
  // user recipes are written in one language: { title, author, place, ingredients[], steps[], timers[] }
  const fromUser = (r, src) => ({ id: r.id, cat: src, serves: r.serves, time: r.time, title: r.title, author: r.author, place: r.place, ing: r.ingredients, steps: r.steps, timers: r.timers || r.steps.map(guessTimer), mine: src === 'mine', lang: r.lang });

  let mine = S.store.get('myRecipes', []) || [];
  let family = [];
  let storeOn = false;
  let cat = 'all', query = '';
  let view = 'list';             // list | recipe | cook | add
  let current = null;
  let stepAt = 0;
  let shared = null;
  const checked = new Set();
  function all() { return [...builtIn(), ...mine.map(r => fromUser(r, 'mine')), ...family.map(r => fromUser(r, 'family'))]; }

  // ------------------------------------------------------------------ timers (several can run at once)
  const timers = [];             // { id, label, end, total, paused?: remaining }
  let tick = null;
  const fmt = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? `${h}:${String(m).padStart(2, '0')}` : `${m}`) + `:${String(x).padStart(2, '0')}`; };
  function addTimer(label, seconds) {
    timers.push({ id: Math.random().toString(36).slice(2), label, end: Date.now() + seconds * 1000, total: seconds });
    ensureTick(); renderDock();
  }
  function ensureTick() {
    if (tick) return;
    tick = setInterval(() => {
      const now = Date.now();
      for (const tm of timers) if (!tm.rang && now >= tm.end) { tm.rang = true; ring(tm); }
      renderDock();
      if (!timers.length) { clearInterval(tick); tick = null; }
    }, 500);
  }
  let ac = null;
  function ring(tm) {
    S.toast(t('timeUp', tm.label));
    try { navigator.vibrate && navigator.vibrate([300, 150, 300, 150, 600]); } catch { /* fine */ }
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = ac.currentTime;
      for (let k = 0; k < 6; k++) {
        const o = ac.createOscillator(), g = ac.createGain();
        o.frequency.value = k % 2 ? 880 : 1175; o.type = 'triangle';
        g.gain.setValueAtTime(0.0001, t0 + k * 0.32); g.gain.exponentialRampToValueAtTime(0.25, t0 + k * 0.32 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + k * 0.32 + 0.28);
        o.connect(g); g.connect(ac.destination); o.start(t0 + k * 0.32); o.stop(t0 + k * 0.32 + 0.3);
      }
    } catch { /* no sound */ }
  }
  // the timers float above everything while you cook (and keep going when the drawer closes)
  const dock = el('div', { className: 'ck-dock', 'aria-live': 'polite' });
  document.body.appendChild(dock);
  function renderDock() {
    dock.hidden = !timers.length;
    dock.replaceChildren(...timers.map(tm => {
      const left = (tm.end - Date.now()) / 1000;
      const x = el('button', { type: 'button', className: 'ck-x', text: '×', 'aria-label': t('stopTimer') });
      x.addEventListener('click', () => { timers.splice(timers.indexOf(tm), 1); renderDock(); });
      return el('div', { className: 'ck-tm' + (tm.rang ? ' is-up' : '') }, [
        el('span', { className: 'ck-tm-l', dir: 'auto', text: tm.label }),
        el('b', { className: 'ck-tm-t', text: tm.rang ? '⏰' : fmt(left) }),
        el('span', { className: 'ck-tm-bar' }, [el('i', { style: `transform:scaleX(${tm.rang ? 0 : Math.max(0, left / tm.total)})` })]),
        x
      ]);
    }));
  }
  renderDock();

  // keep the screen on in cooking mode
  let lock = null;
  async function wake(on) {
    try {
      if (on && 'wakeLock' in navigator && !lock) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); }
      if (!on && lock) { await lock.release(); lock = null; }
    } catch { lock = null; }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && view === 'cook') wake(true); });

  // ------------------------------------------------------------------ drawing
  const btn = (text, cls, fn) => { const b = el('button', { type: 'button', className: cls || 'btn', text }); b.addEventListener('click', fn); return b; };
  function render() {
    box.dir = L() === 'ar' ? 'rtl' : 'ltr';
    if (view === 'recipe' && current) return box.replaceChildren(recipeView(current));
    if (view === 'cook' && current) return box.replaceChildren(cookView(current));
    if (view === 'add') return box.replaceChildren(addForm());
    box.replaceChildren(listView());
  }
  function listView() {
    const kids = [];
    if (shared) {
      kids.push(el('div', { className: 'q-card q-invite' }, [
        el('p', { className: 'q-k', text: t('shared') }), el('p', { className: 'q-now-name', dir: 'auto', text: shared.title + (shared.author ? ` · ${t('by', shared.author)}` : '') }),
        el('div', { className: 'q-row' }, [btn('📖', 'btn', () => { current = fromUser(shared, 'shared'); view = 'recipe'; render(); }), btn('📒 ' + t('saveShared'), 'btn btn-primary', () => { mine = [{ ...shared, id: 'm' + Date.now().toString(36) }, ...mine]; S.store.set('myRecipes', mine); shared = null; S.toast(t('saved')); render(); })])
      ]));
    }
    const input = el('input', { type: 'search', className: 'ck-search', placeholder: t('search'), value: query, 'aria-label': t('search') });
    input.addEventListener('input', () => { query = input.value; const l = box.querySelector('.ck-list'); if (l) l.replaceWith(cards()); });
    const cats = ['all', 'mezze', 'main', 'breakfast', 'sweets', 'mine'].concat(storeOn ? ['family'] : []);
    const chips = el('div', { className: 'ck-cats' }, cats.map(c => { const b = btn(t(c), 'chip', () => { cat = c; render(); }); b.setAttribute('aria-pressed', String(cat === c)); return b; }));
    kids.push(input, chips, cards(), btn(t('add'), 'btn btn-primary ck-add', () => { view = 'add'; render(); }));
    return el('div', {}, kids);
  }
  function cards() {
    const q = query.trim().toLowerCase();
    const list = all().filter(r => (cat === 'all' ? r.cat !== 'family' || true : r.cat === cat)).filter(r => {
      if (!q) return true;
      const hay = [loc(r.title, 'ar'), loc(r.title, 'en'), loc(r.title, 'fr'), r.author || ''].join(' ').toLowerCase();
      return hay.includes(q);
    });
    if (!list.length) return el('p', { className: 'ck-list quiet', text: t('none') });
    return el('div', { className: 'ck-list' }, list.map(r => {
      const b = el('button', { type: 'button', className: 'ck-card ck-' + r.cat }, [
        el('span', { className: 'ck-card-t', dir: 'auto', text: loc(r.title) }),
        el('span', { className: 'ck-card-m', dir: 'auto', text: [t('min', r.time), t('serves', r.serves), r.author ? t('by', r.author) : ''].filter(Boolean).join(SEP()) })
      ]);
      b.addEventListener('click', () => { current = r; checked.clear(); view = 'recipe'; render(); box.closest('.sheet-body').scrollTop = 0; });
      return b;
    }));
  }
  function recipeView(r) {
    const ing = loc(r.ing) || [], steps = loc(r.steps) || [];
    const kids = [
      btn('‹ ' + t('back'), 'link-btn ck-back', () => { view = 'list'; render(); }),
      el('h3', { className: 'recipe-title', dir: 'auto', text: loc(r.title) }),
      el('p', { className: 'recipe-meta', dir: 'auto', text: [t('serves', r.serves), t('min', r.time), r.author ? t('by', r.author) + (r.place ? ` (${r.place})` : '') : ''].filter(Boolean).join(SEP()) }),
      btn(t('cook'), 'btn btn-primary ck-go', () => { stepAt = 0; view = 'cook'; wake(true); render(); }),
      el('h4', { text: t('ingredients') }),
      el('p', { className: 'quiet small', text: t('ingDone') }),
      el('ul', { className: 'ck-ing' }, ing.map((x, i) => {
        const id = r.id + ':' + i;
        const c = el('input', { type: 'checkbox' }); c.checked = checked.has(id);
        c.addEventListener('change', () => { if (c.checked) checked.add(id); else checked.delete(id); });
        return el('li', {}, [el('label', { dir: 'auto' }, [c, el('span', { text: x })])]);
      })),
      el('h4', { text: t('method') }),
      el('ol', { className: 'recipe-steps ck-steps' }, steps.map((x, i) => el('li', { dir: 'auto' }, [
        el('span', { text: x }),
        r.timers && r.timers[i] ? btn(t('timer', t('min', Math.round(r.timers[i] / 60))), 'chip ck-tchip', () => addTimer(`${loc(r.title)}${SEP()}${S.num(i + 1)}`, r.timers[i])) : null
      ].filter(Boolean))))
    ];
    const row = el('div', { className: 'q-row' }, [btn('📲 ' + t('share'), 'btn', () => shareRecipe(r))]);
    if (r.mine) row.appendChild(btn(t('del'), 'link-btn', () => { mine = mine.filter(x => x.id !== r.id); S.store.set('myRecipes', mine); view = 'list'; render(); }));
    kids.push(row);
    return el('div', { className: 'ck-recipe' }, kids);
  }
  function cookView(r) {
    const steps = loc(r.steps) || [];
    const n = steps.length;
    const i = Math.min(stepAt, n - 1);
    const sec = r.timers && r.timers[i] ? r.timers[i] : 0;
    let custom = sec || 300;
    const tLabel = el('b', { className: 'ck-cust-t', text: fmt(custom) });
    const kids = [
      el('div', { className: 'ck-top' }, [btn('‹ ' + t('back'), 'link-btn', () => { view = 'recipe'; wake(false); render(); }), el('span', { className: 'ck-step-n', text: t('step', i + 1, n) })]),
      el('div', { className: 'ck-progress' }, [el('i', { style: `transform:scaleX(${(i + 1) / n})` })]),
      el('h3', { className: 'ck-dish', dir: 'auto', text: loc(r.title) }),
      el('p', { className: 'ck-big', dir: 'auto', text: steps[i] }),
      sec ? btn('⏱ ' + t('startTimer') + SEP() + t('min', Math.round(sec / 60)), 'btn btn-primary ck-timer', () => addTimer(`${loc(r.title)}${SEP()}${S.num(i + 1)}`, sec)) : null,
      el('div', { className: 'ck-cust' }, [
        el('span', { className: 'quiet', text: t('custom') }),
        btn(t('minus'), 'chip', () => { custom = Math.max(60, custom - 60); tLabel.textContent = fmt(custom); }),
        tLabel,
        btn(t('plus'), 'chip', () => { custom += 60; tLabel.textContent = fmt(custom); }),
        btn('▶', 'chip', () => addTimer(`${loc(r.title)}${SEP()}${S.num(i + 1)}`, custom))
      ]),
      el('div', { className: 'ck-nav' }, [
        btn('‹ ' + t('prev'), 'btn', () => { stepAt = Math.max(0, i - 1); render(); }),
        i < n - 1 ? btn(t('next') + ' ›', 'btn btn-primary', () => { stepAt = i + 1; render(); }) : btn('✓ ' + t('finish'), 'btn btn-primary', () => { S.toast(t('done')); view = 'recipe'; wake(false); render(); })
      ]),
      el('p', { className: 'quiet small', text: t('keepAwake') })
    ];
    return el('div', { className: 'ck-cook' }, kids.filter(Boolean));
  }
  function addForm() {
    const f = el('form', { className: 'ck-form' });
    const v = (name, attrs) => el('input', { name, ...attrs });
    const title = v('title', { maxLength: 60, required: true });
    const author = v('author', { maxLength: 40, required: true, value: (window.SawtMe && window.SawtMe.name()) || S.store.get('qName', '') || '' });
    const place = v('place', { maxLength: 40, value: (S.store.get('village', null) || {}).name || '' });
    const serves = v('serves', { type: 'number', min: 1, max: 30, value: 4, inputMode: 'numeric' });
    const time = v('time', { type: 'number', min: 1, max: 1440, value: 30, inputMode: 'numeric' });
    const ing = el('textarea', { name: 'ing', rows: 5, required: true });
    const steps = el('textarea', { name: 'steps', rows: 6, required: true });
    const book = el('input', { type: 'checkbox', checked: storeOn });
    const msg = el('p', { className: 'form-error', role: 'alert', hidden: true });
    f.append(
      btn('‹ ' + t('back'), 'link-btn ck-back', () => { view = 'list'; render(); }),
      el('h3', { className: 'pv-sub', text: t('add').replace('＋ ', '') }),
      el('label', { className: 'field' }, [el('span', { text: t('title') }), title]),
      el('div', { className: 'form-grid' }, [el('label', { className: 'field' }, [el('span', { text: t('author') }), author]), el('label', { className: 'field' }, [el('span', { text: t('place') }), place])]),
      el('div', { className: 'form-grid' }, [el('label', { className: 'field' }, [el('span', { text: t('servesL') }), serves]), el('label', { className: 'field' }, [el('span', { text: t('timeL') }), time])]),
      el('label', { className: 'field' }, [el('span', { text: t('ing') }), ing]),
      el('label', { className: 'field' }, [el('span', { text: t('steps') }), steps]),
      storeOn ? el('label', { className: 'who-check' }, [book, el('span', { text: t('toBook') })]) : '',
      msg,
      el('button', { type: 'submit', className: 'btn btn-primary', text: t('save') })
    );
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const lines = s => s.split('\n').map(x => x.trim()).filter(Boolean);
      const r = { id: 'm' + Date.now().toString(36), title: title.value.trim(), author: author.value.trim(), place: place.value.trim(), serves: Number(serves.value) || 4, time: Number(time.value) || 30, ingredients: lines(ing.value), steps: lines(steps.value), lang: L() };
      if (!r.title || !r.author || !r.ingredients.length || !r.steps.length) { msg.textContent = t('errs').missing; msg.hidden = false; return; }
      r.timers = r.steps.map(guessTimer);
      mine = [r, ...mine]; S.store.set('myRecipes', mine);
      let note = t('saved');
      if (storeOn && book.checked) {
        try {
          const res = await fetch('/api/recipes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) });
          const d = await res.json().catch(() => ({}));
          note = res.ok ? t('sentBook') : (t('errs')[d.code] || t('errs').server);
        } catch { note = t('errs').server; }
      }
      S.toast(note);
      cat = 'mine'; current = fromUser(r, 'mine'); view = 'recipe'; render();
    });
    return f;
  }

  // ------------------------------------------------------------------ sending a recipe by link
  function encode(r) {
    const o = { title: loc(r.title), author: r.author || ((window.SawtMe && window.SawtMe.name()) || ''), place: r.place || '', serves: r.serves, time: r.time, ingredients: loc(r.ing), steps: loc(r.steps), timers: r.timers, lang: r.lang || L() };
    return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  async function shareRecipe(r) {
    const url = r.mine || r.cat === 'family' || r.cat === 'shared' ? `${location.origin}/?recipe=${encode(r)}#books` : `${location.origin}/?dish=${encodeURIComponent(r.id)}#books`;
    const text = t('shareText', loc(r.title));
    if (navigator.share) { try { await navigator.share({ text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    window.open('https://wa.me/?text=' + encodeURIComponent(`${text}\n${url}`), '_blank', 'noopener');
  }
  (() => {
    const q = new URLSearchParams(location.search);
    const rc = q.get('recipe'), dish = q.get('dish');
    if (rc) { try { const o = JSON.parse(decodeURIComponent(escape(atob(rc.replace(/-/g, '+').replace(/_/g, '/'))))); if (o && o.title && Array.isArray(o.steps)) shared = o; } catch { /* broken link */ } }
    if (dish) { const r = all().find(x => x.id === dish); if (r) { current = r; view = 'recipe'; } }
  })();

  async function loadFamily() {
    try { const r = await fetch('/api/recipes'); if (r.ok) family = (await r.json()).items || []; } catch { family = []; }
    if (view === 'list') render();
  }
  document.addEventListener('sawt:config', e => { storeOn = !!(e.detail && e.detail.dedications); if (storeOn) loadFamily(); render(); });
  document.addEventListener('sawt:lang', render);
  window.SawtCook = { open: id => { const r = all().find(x => x.id === id); if (r) { current = r; view = 'recipe'; render(); } }, count: () => all().length };
  render();
})();

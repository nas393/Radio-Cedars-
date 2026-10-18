/* The painting of the bay: "الغربة", life far from home.
   Beirut time next to yours and whether it is a good moment to call,
   the weather back home, the dollar (and your currency) in Lebanese pounds,
   and a countdown to your next trip home. */
(() => {
  'use strict';
  const S = window.Sawt;
  const C = window.SAWT_CONTENT || {};
  const $ = id => document.getElementById(id);
  const el = S.el;
  const box = $('expat');
  if (!box) return;

  const T = {
    ar: {
      lbp: 'ل.ل.',
      lede: 'بيروت من بعيد: الساعة، الطقس، الدولار، وقدّيش باقي لترجع.',
      beirut: 'بيروت', here: 'عندك', ahead: h => `بيروت قدّامك بـ ${S.num(h)} ساعة`, behind: h => `بيروت ورا منك بـ ${S.num(h)} ساعة`, sameTime: 'نفس الساعة متل بيروت',
      call: 'بتتصل هلّق؟',
      slots: [
        [0, 7, '🌙', 'نايمين هلّق. ابعتلهن رسالة بصوتك، بيسمعوها الصبح.'],
        [7, 10, '☕', 'الصبح وقهوة الصبح. أحلى وقت تتصل.'],
        [10, 14, '☀️', 'نص النهار، كل واحد بشغله. رسالة قصيرة أحسن.'],
        [14, 16, '😴', 'وقت الغدا والقيلولة. خلّيها لبعد شوي.'],
        [16, 22, '📞', 'المسا، القعدة عالبلكون. هلّق وقتها!'],
        [22, 24, '🌜', 'صار متأخر شوي… بس إذا مشتاق، اتصل.']
      ],
      voice: 'ابعت رسالة بصوتك', listenHome: 'شغّل أغاني الغربة',
      weather: (w, t) => `هلّق ببيروت: ${w}، ${S.num(t)}°`,
      money: 'الدولار بالليرة', conv: 'حوّل', rateNote: d => `سعر تقريبي${d ? ' · ' + d : ''}. للمعلومة بس، مش للتحويل.`,
      trip: 'إيمتى نازل عالبيت؟', tripSet: 'حطّ التاريخ', daysTo: n => n === 0 ? 'اليوم! حمدالله عالسلامة 🎉' : n === 1 ? 'بكرا! ضبّ الشنتة ✈️' : `باقي ${S.num(n)} يوم ✈️`, tripPast: 'إن شاء الله كانت نزلة حلوة. إيمتى الجاية؟', clear: 'امحي',
      bring: 'ما تنسى: كعك، زعتر، وبوسة لتيتا.'
    },
    en: {
      lbp: 'LBP',
      lede: 'Beirut from afar: the time, the weather, the dollar, and how long until you’re back.',
      beirut: 'Beirut', here: 'Where you are', ahead: h => `Beirut is ${h} h ahead of you`, behind: h => `Beirut is ${h} h behind you`, sameTime: 'Same time as Beirut',
      call: 'Call home now?',
      slots: [
        [0, 7, '🌙', 'They’re asleep. Send a voice message; they’ll hear it in the morning.'],
        [7, 10, '☕', 'Morning coffee time. The best moment to call.'],
        [10, 14, '☀️', 'Middle of the day, everyone’s busy. A short message is better.'],
        [14, 16, '😴', 'Lunch and the afternoon nap. Try a bit later.'],
        [16, 22, '📞', 'Evening on the balcony. Call now!'],
        [22, 24, '🌜', 'It’s getting late… but if you miss them, call.']
      ],
      voice: 'Send a voice message', listenHome: 'Play songs of longing',
      weather: (w, t) => `Beirut right now: ${w}, ${t}°`,
      money: 'The dollar in lira', conv: 'Convert', rateNote: d => `Approximate rate${d ? ' · ' + d : ''}. For information only.`,
      trip: 'When are you going home?', tripSet: 'Set the date', daysTo: n => n === 0 ? 'Today! Welcome home 🎉' : n === 1 ? 'Tomorrow! Pack your bag ✈️' : `${n} days to go ✈️`, tripPast: 'Hope it was a lovely visit. When’s the next one?', clear: 'Clear',
      bring: 'Don’t forget: ka’ak, za’atar, and a kiss for Teta.'
    },
    fr: {
      lbp: 'L.L.',
      lede: 'Beyrouth de loin : l’heure, la météo, le dollar, et combien de jours avant de rentrer.',
      beirut: 'Beyrouth', here: 'Chez vous', ahead: h => `Beyrouth a ${h} h d’avance sur vous`, behind: h => `Beyrouth a ${h} h de retard sur vous`, sameTime: 'Même heure qu’à Beyrouth',
      call: 'Appeler maintenant ?',
      slots: [
        [0, 7, '🌙', 'Ils dorment. Envoyez un message vocal, ils l’écouteront au réveil.'],
        [7, 10, '☕', 'L’heure du café du matin. Le meilleur moment pour appeler.'],
        [10, 14, '☀️', 'Milieu de journée, chacun est occupé. Un petit message, plutôt.'],
        [14, 16, '😴', 'Déjeuner et sieste. Un peu plus tard.'],
        [16, 22, '📞', 'Le soir, sur le balcon. Appelez !'],
        [22, 24, '🌜', 'Il se fait tard… mais si le cœur vous en dit, appelez.']
      ],
      voice: 'Envoyer un message vocal', listenHome: 'Chansons du pays',
      weather: (w, t) => `À Beyrouth en ce moment : ${w}, ${t}°`,
      money: 'Le dollar en livres', conv: 'Convertir', rateNote: d => `Taux approximatif${d ? ' · ' + d : ''}. À titre indicatif.`,
      trip: 'Quand rentrez-vous au pays ?', tripSet: 'Choisir la date', daysTo: n => n === 0 ? 'Aujourd’hui ! Bon retour 🎉' : n === 1 ? 'Demain ! Faites la valise ✈️' : `Encore ${n} jours ✈️`, tripPast: 'On espère que c’était un beau séjour. Le prochain ?', clear: 'Effacer',
      bring: 'N’oubliez pas : ka’ak, zaatar, et un bisou pour Teta.'
    }
  };
  const t = (k, ...a) => { const v = (T[S.lang()] || T.ar)[k]; return typeof v === 'function' ? v(...a) : v; };

  const TZ_CUR = [
    [/^America\/(Toronto|Montreal|Vancouver|Edmonton|Winnipeg|Halifax|Regina|St_Johns)/, 'CAD'], [/^America\/Sao_Paulo/, 'BRL'], [/^America\/Mexico_City/, 'MXN'],
    [/^Europe\/London/, 'GBP'], [/^Europe\/Zurich/, 'CHF'], [/^Europe\/Stockholm/, 'SEK'], [/^Europe\/Istanbul/, 'TRY'], [/^Europe\//, 'EUR'],
    [/^Australia\//, 'AUD'], [/^Asia\/Dubai/, 'AED'], [/^Asia\/Riyadh/, 'SAR'], [/^Asia\/Qatar/, 'QAR'], [/^Asia\/Kuwait/, 'KWD'], [/^Asia\/Amman/, 'JOD'],
    [/^Africa\/Lagos/, 'NGN'], [/^Africa\/(Abidjan|Dakar)/, 'XOF'], [/^Africa\/Cairo/, 'EGP']
  ];
  const zone = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { return ''; } })();
  const myCur = (TZ_CUR.find(([re]) => re.test(zone)) || [null, 'USD'])[1];
  let rates = null;
  let cur = S.store.get('expatCur', myCur);
  let amount = S.store.get('expatAmount', 100);

  function offsetHours() {
    const now = new Date();
    const part = tz => { const p = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: 'numeric', hourCycle: 'h23', timeZone: tz }).formatToParts(now); return Number(p.find(x => x.type === 'hour').value) * 60 + Number(p.find(x => x.type === 'minute').value); };
    let d = part('Asia/Beirut') - part(undefined);
    if (d > 720) d -= 1440; if (d < -720) d += 1440;
    return Math.round(d / 30) / 2;
  }
  const time = tz => new Intl.DateTimeFormat(S.locale(), { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(new Date());
  const fmt = (n, d = 0) => new Intl.NumberFormat(S.locale(), { maximumFractionDigits: d }).format(n);

  function render() {
    const kids = [el('p', { className: 'pv-lede', text: t('lede') })];
    // clocks
    const off = offsetHours();
    kids.push(el('div', { className: 'ex-clocks' }, [
      el('div', { className: 'big-clock' }, [el('span', { className: 'big-clock-place', text: t('beirut') }), el('span', { className: 'big-clock-time', text: time('Asia/Beirut') })]),
      el('div', { className: 'big-clock' }, [el('span', { className: 'big-clock-place', text: t('here') }), el('span', { className: 'big-clock-time', text: time(undefined) })])
    ]), el('p', { className: 'ex-diff', text: off === 0 ? t('sameTime') : off > 0 ? t('ahead', off) : t('behind', -off) }));
    // good time to call?
    const h = S.beirutHour ? S.beirutHour() : new Date().getHours();
    const slot = t('slots').find(([a, b]) => h >= a && h < b) || t('slots')[0];
    const voice = el('button', { type: 'button', className: 'btn', text: '🎙️ ' + t('voice') });
    voice.addEventListener('click', () => document.dispatchEvent(new CustomEvent('sawt:open', { detail: 'phone' })));
    kids.push(el('div', { className: 'q-card ex-call' }, [
      el('p', { className: 'q-k', text: t('call') }),
      el('p', { className: 'ex-call-line' }, [el('span', { className: 'ex-emoji', text: slot[2] }), el('span', { text: slot[3] })]),
      voice
    ]));
    // weather
    const w = S.weather && S.weather();
    const c = w && (w.cities || []).find(x => x.id === 'beirut');
    if (c) kids.push(el('p', { className: 'ex-weather', text: t('weather', S.weatherWord(c.code), c.temperature) }));
    // money
    const lbp = rates && rates.rates && rates.rates.LBP;
    if (lbp) {
      const curs = ['USD', ...Object.keys(rates.rates).filter(k => k !== 'LBP')];
      const per = k => (k === 'USD' ? lbp : lbp / rates.rates[k]);
      const sel = el('select', { 'aria-label': t('money') }, curs.map(k => el('option', { value: k, text: k })));
      sel.value = curs.includes(cur) ? cur : 'USD';
      const inp = el('input', { type: 'number', min: 0, step: 'any', inputMode: 'decimal', value: amount, 'aria-label': t('conv') });
      const out = el('output', { className: 'ex-out' });
      const upd = () => {
        cur = sel.value; amount = Number(inp.value) || 0;
        S.store.set('expatCur', cur); S.store.set('expatAmount', amount);
        out.textContent = `= ${fmt(amount * per(cur))} ${t('lbp')}`;
      };
      sel.addEventListener('change', upd); inp.addEventListener('input', upd); upd();
      const when = rates.updated ? new Intl.DateTimeFormat(S.locale(), { day: 'numeric', month: 'short' }).format(new Date(rates.updated)) : '';
      kids.push(el('div', { className: 'q-card ex-money' }, [
        el('p', { className: 'q-k', text: t('money') }),
        el('p', { className: 'ex-rate' }, [el('b', { text: `1 $ = ${fmt(lbp)} ${t('lbp')}` }), cur !== 'USD' && rates.rates[cur] ? el('span', { text: ` · 1 ${cur} = ${fmt(per(cur))} ${t('lbp')}` }) : null].filter(Boolean)),
        el('div', { className: 'ex-conv' }, [inp, sel, out]),
        el('p', { className: 'quiet small', text: t('rateNote', when) })
      ]));
    }
    // countdown
    const trip = S.store.get('tripHome', '');
    const date = el('input', { type: 'date', value: trip, 'aria-label': t('tripSet') });
    date.addEventListener('change', () => { S.store.set('tripHome', date.value); render(); });
    let line = '';
    if (trip) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const n = Math.round((new Date(trip + 'T00:00:00') - today) / 864e5);
      line = n < 0 ? t('tripPast') : t('daysTo', n);
    }
    const clear = el('button', { type: 'button', className: 'link-btn', text: t('clear') });
    clear.addEventListener('click', () => { S.store.set('tripHome', ''); render(); });
    kids.push(el('div', { className: 'q-card ex-trip' }, [
      el('p', { className: 'q-k', text: t('trip') }),
      line ? el('p', { className: 'ex-count', text: line }) : null,
      el('div', { className: 'ex-conv' }, [date, trip ? clear : null].filter(Boolean)),
      trip ? el('p', { className: 'quiet small', text: t('bring') }) : null
    ].filter(Boolean)));
    // songs of longing
    const homesick = (C.moods || []).find(m => m.id === 'homesick');
    if (homesick) {
      const b = el('button', { type: 'button', className: 'btn btn-primary', text: '📼 ' + t('listenHome') });
      b.addEventListener('click', () => { if (window.SawtScreen) { window.SawtScreen.playTape(homesick); document.dispatchEvent(new CustomEvent('sawt:open', { detail: 'cassettes' })); } });
      kids.push(b);
    }
    box.replaceChildren(...kids);
  }

  async function loadRates() {
    try { const r = await fetch('/api/rates'); if (r.ok) rates = await r.json(); } catch { /* offline */ }
    if (!rates) rates = { rates: { LBP: 89500 }, updated: null };
    render();
  }
  document.addEventListener('sawt:panel', e => { if (e.detail === 'expat') { render(); if (!rates) loadRates(); } });
  document.addEventListener('sawt:lang', render);
  document.addEventListener('sawt:weather', () => { if (window.SawtRoom && window.SawtRoom.isOpen() === 'expat') render(); });
  setInterval(() => { if (window.SawtRoom && window.SawtRoom.isOpen() === 'expat' && !box.contains(document.activeElement)) render(); }, 30000);
  render();
})();

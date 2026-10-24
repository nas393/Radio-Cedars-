/* The salon: a 1990s Beirut living room in three lights (day, sunset, night).
   Slide and pinch to look around; every object opens one part of the app.
   The light follows Beirut's sun and the rain follows Beirut's weather. */
(() => {
  'use strict';

  const S = window.Sawt;
  const C = window.SAWT_CONTENT || {};
  const $ = id => document.getElementById(id);
  const el = S.el;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ================================================================== words

  const R = {
    ar: {
      introTitle: 'تفضّل، البيت بيتك',
      introSub: 'صالون بيت لبناني من التسعينات. كل غرض فيه بيشتغل.',
      eraAsk: 'أيّ صالون بدّك؟', homes: { apt: '🏢 شقّة ببيروت', house: '🏡 بيت بالضيعة' }, eras: { '80s': 'التمانينات', '90s': 'التسعينات', '00s': 'الألفين', '26': '٢٠٢٦' },
      eraSub: { '80s': 'صالون بيت لبناني من التمانينات. كل غرض فيه بيشتغل.', '00s': 'صالون بيت لبناني من سنين الألفين. كل غرض فيه بيشتغل.', '26': 'صالون بيت لبناني اليوم، ٢٠٢٦. كل غرض فيه بيشتغل.' },
      introEnter: 'ادخل',
      dragHint: 'دوس على أيّ غرض، اسحب لتتفرّج، ودقّتين لتشوف الصالون كلّو',
      dockLabel: 'أغراض الغرفة',
      turnLeft: 'الغرض اللي قبل', turnRight: 'الغرض اللي بعد', tapToOpen: 'اضغط لتفتح',
      lookAround: 'شو في بالصالون؟', allObjects: 'الصالون', allObjectsTitle: 'شو في بالصالون؟',
      paperName: 'جريدة البيت', paperPrice: 'الثمن ١٠٠٠ ل.ل.', comingUp: 'المناسبات الجايّة',
      tearNext: 'اقلب الورقة', tearBack: 'رجوع لليوم', sea: 'البحر المتوسط',
      daysLeft: n => n === 0 ? 'اليوم' : n === 1 ? 'بكرا' : `بعد ${S.num(n)} يوم`,
      close: 'سكّر',
      scenes: { day: 'النهار', sunset: 'المغرب', night: 'الليل' },
      sceneManual: 'اضغط لتغيّر الوقت والطقس',
      timeLabel: 'الوقت', weatherLabel: 'الطقس', autoBeirut: 'متل بيروت هلّق', clearW: 'صحو', rainW: 'شتي', snowW: 'تلج ❄️', occLabel: 'المناسبة', occAuto: 'متل الرزنامة', xmasO: 'الميلاد 🎄', ramadanO: 'رمضان 🌙', noneO: 'ولا شي', feastTape: 'أغاني العيد',
      extrasLabel: 'بالبيت', soundsW: 'أصوات البيت', cutsW: 'انقطاع الكهربا', tryCut: 'جرّب الموتير',
      cutToast: 'قطعت الكهربا…', motorToast: 'اشتغل الموتير 😄', backToast: 'إجت الكهربا!',
      onTheTv: 'شوف عالتلفزيون',
      beirut: 'بيروت',
      here: 'عندك',
      objects: {
        radio: 'الراديو', tv: 'التلفزيون', atari: 'الأتاري', news: 'الجريدة', phone: 'رسالة بصوتك', photos: 'صور العيلة',
        cassettes: 'الشرايط', clock: 'الساعة', lamp: 'اللمبادير', window: 'البلكون', calendar: 'المناسبات',
        coffee: 'فنجان القهوة', books: 'سفرة تيتا', expat: 'الغربة', tawleh: 'الطاولة والشدّة', together: 'قعدة سوا',
        teta: 'كرسي تيتا', ac: 'المكيّف', heat: 'الصوبيا'
      },
      hints: {
        atari: 'ألعاب فيديو متل زمان', radio: 'محطات لبنان مباشرة', tv: 'برامج ومسلسلات القنوات', news: 'أخبار اليوم', phone: 'لغرفة العيلة، مع أغنية', photos: 'علّق صورك',
        cassettes: 'أغاني لكل جوّ', clock: 'المنبّه', lamp: 'مؤقت النوم', window: 'ضيعتي والطقس', calendar: 'الأعياد والمناسبات',
        coffee: 'نقرا الفنجان؟', books: '٣٠ طبخة + طبخاتك', expat: 'بيروت من بعيد', tawleh: 'طاولة، طرنيب، ليخة', together: 'غرف العيلة برمز',
        teta: 'كبير وسهل', ac: 'الوقت والطقس', heat: 'ولّعها أو طفّيها'
      },
      tvLede: 'اكبس عقناة، اختار برنامج أو مسلسل، وبيشتغل هون عالتلفزيون. بلا بثّ مباشر وبلا اشتراك.',
      photosLede: 'رسائل من الغربة لأهلنا بلبنان.',
      cassettesLede: 'شريط لكل جوّ. اضغط وبيشتغل هون بالبيت.',
      lampLede: 'سكّر الراديو لحاله بعد شوي، وإنت عم تغفى.',
      approxNote: 'الأعياد الهجرية تقريبية وبتتأكد مع رؤية الهلال.',
      coffeeLede: 'اشرب القهوة، اقلب الفنجان، وخلّينا نشوف شو مكتوبلك. (للتسلية بس!)',
      coffeeFlip: 'اقلب الفنجان',
      coffeeAgain: 'فنجان تاني',
      coffeeSee: 'شايف بالفنجان',
      sunrise: 'طلوع الشمس', sunset: 'غياب الشمس', iftar: 'الإفطار تقريباً', today: 'اليوم', inDays: n => n === 1 ? 'بكرا' : `بعد ${S.num(n)} يوم`,
      serves: n => `لـ ${S.num(n)} أشخاص`, minutes: n => `${S.num(n)} دقيقة`, ingredients: 'المكوّنات', method: 'الطريقة',
      playOnSpotify: 'شغّل', listen: 'اسمع',
      nowOutside: (w, t) => `هلّق ببيروت: ${w}، ${t}°`,
      credits: ''
    },
    en: {
      introTitle: 'Come in, make yourself at home',
      introSub: 'A 1990s Lebanese living room. Everything in it works.',
      eraAsk: 'Which living room?', homes: { apt: '🏢 Beirut apartment', house: '🏡 Village house' }, eras: { '80s': '1980s', '90s': '1990s', '00s': '2000s', '26': '2026' },
      eraSub: { '80s': 'A 1980s Lebanese living room. Everything in it works.', '00s': 'A 2000s Lebanese living room. Everything in it works.', '26': 'A Lebanese living room today, 2026. Everything in it works.' },
      introEnter: 'Come in',
      dragHint: 'Tap anything, slide to look around, double-tap for the whole room',
      dockLabel: 'Things in the room',
      turnLeft: 'Previous object', turnRight: 'Next object', tapToOpen: 'Tap to open',
      lookAround: 'What’s in the room?', allObjects: 'The room', allObjectsTitle: 'What’s in the room',
      paperName: 'The Home Gazette', paperPrice: 'LBP 1,000', comingUp: 'Coming up',
      tearNext: 'Tear the page', tearBack: 'Back to today', sea: 'Mediterranean Sea',
      daysLeft: n => n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : `In ${n} days`,
      close: 'Close',
      scenes: { day: 'Day', sunset: 'Sunset', night: 'Night' },
      sceneManual: 'Tap to change the time and weather',
      timeLabel: 'Time', weatherLabel: 'Weather', autoBeirut: 'Like Beirut now', clearW: 'Clear', rainW: 'Rain', snowW: 'Snow ❄️', occLabel: 'Occasion', occAuto: 'By the calendar', xmasO: 'Christmas 🎄', ramadanO: 'Ramadan 🌙', noneO: 'None', feastTape: 'Feast songs',
      extrasLabel: 'In the house', soundsW: 'Room sounds', cutsW: 'Power cuts', tryCut: 'Try the generator',
      cutToast: 'The power just went…', motorToast: 'The generator kicked in 😄', backToast: 'The electricity is back!',
      onTheTv: 'Watch on the TV',
      beirut: 'Beirut',
      here: 'Where you are',
      objects: {
        radio: 'Radio', tv: 'Television', atari: 'Game console', news: 'Newspaper', phone: 'Voice message', photos: 'Family photos',
        cassettes: 'Tapes', clock: 'Clock', lamp: 'Lamp', window: 'Balcony', calendar: 'Occasions',
        coffee: 'Coffee cup', books: 'Teta’s table', expat: 'Far from home', tawleh: 'Tawleh & cards', together: 'Family rooms',
        teta: 'Teta’s chair', ac: 'Air conditioner', heat: 'The heater'
      },
      hints: {
        atari: 'Old-school video games', radio: 'Lebanese stations, live', tv: 'Lebanese channels’ shows', news: 'Today’s headlines', phone: 'To a family room, with a song', photos: 'Hang your photos',
        cassettes: 'A song for every mood', clock: 'Alarm', lamp: 'Sleep timer', window: 'My village, weather', calendar: 'Feasts and holidays',
        coffee: 'Read my cup?', books: '30 recipes + yours', expat: 'Beirut from afar', tawleh: 'Tawleh, Tarneeb, Likha', together: 'Private, with a passcode',
        teta: 'Big and simple', ac: 'Time and weather', heat: 'Light it or put it out'
      },
      tvLede: 'Press a channel, pick a show or series, and it plays right here on the TV. No live streams, nothing to pay.',
      photosLede: 'Messages from abroad to family in Lebanon.',
      cassettesLede: 'A tape for every mood. Tap one and it plays right here.',
      lampLede: 'Let the radio switch itself off while you drift to sleep.',
      approxNote: 'Islamic holidays are approximate and confirmed by the moon sighting.',
      coffeeLede: 'Finish your coffee, flip the cup, and let’s see what it says. (Just for fun!)',
      coffeeFlip: 'Flip the cup',
      coffeeAgain: 'Another cup',
      coffeeSee: 'I can see',
      sunrise: 'Sunrise', sunset: 'Sunset', iftar: 'Iftar, around', today: 'Today', inDays: n => n === 1 ? 'Tomorrow' : `In ${n} days`,
      serves: n => `Serves ${n}`, minutes: n => `${n} min`, ingredients: 'Ingredients', method: 'Method',
      playOnSpotify: 'Play', listen: 'Listen',
      nowOutside: (w, t) => `Beirut right now: ${w}, ${t}°`,
      credits: ''
    },
    fr: {
      introTitle: 'Entrez, vous êtes chez vous',
      introSub: 'Un salon libanais des années 90. Tout y fonctionne.',
      eraAsk: 'Quel salon ?', homes: { apt: '🏢 Appartement à Beyrouth', house: '🏡 Maison au village' }, eras: { '80s': 'Années 80', '90s': 'Années 90', '00s': 'Années 2000', '26': '2026' },
      eraSub: { '80s': 'Un salon libanais des années 80. Tout y fonctionne.', '00s': 'Un salon libanais des années 2000. Tout y fonctionne.', '26': 'Un salon libanais d’aujourd’hui, 2026. Tout y fonctionne.' },
      introEnter: 'Entrer',
      dragHint: 'Touchez un objet, glissez pour regarder, double-touchez pour toute la pièce',
      dockLabel: 'Les objets du salon',
      turnLeft: 'Objet précédent', turnRight: 'Objet suivant', tapToOpen: 'Touchez pour ouvrir',
      lookAround: 'Qu’y a-t-il au salon ?', allObjects: 'Le salon', allObjectsTitle: 'Dans le salon',
      paperName: 'La Gazette de la maison', paperPrice: '1 000 L.L.', comingUp: 'À venir',
      tearNext: 'Arracher la page', tearBack: 'Revenir à aujourd’hui', sea: 'Mer Méditerranée',
      daysLeft: n => n === 0 ? 'Aujourd’hui' : n === 1 ? 'Demain' : `Dans ${n} jours`,
      close: 'Fermer',
      scenes: { day: 'Jour', sunset: 'Coucher du soleil', night: 'Nuit' },
      sceneManual: 'Touchez pour changer l’heure et la météo',
      timeLabel: 'Moment', weatherLabel: 'Météo', autoBeirut: 'Comme à Beyrouth', clearW: 'Dégagé', rainW: 'Pluie', snowW: 'Neige ❄️', occLabel: 'Fête', occAuto: 'Selon le calendrier', xmasO: 'Noël 🎄', ramadanO: 'Ramadan 🌙', noneO: 'Aucune', feastTape: 'Chants de fête',
      extrasLabel: 'À la maison', soundsW: 'Sons de la maison', cutsW: 'Coupures de courant', tryCut: 'Essayer le générateur',
      cutToast: 'Le courant vient de sauter…', motorToast: 'Le générateur a démarré 😄', backToast: 'L’électricité est revenue !',
      onTheTv: 'Regarder sur la télé',
      beirut: 'Beyrouth',
      here: 'Chez vous',
      objects: {
        radio: 'Radio', tv: 'Télévision', atari: 'Console de jeux', news: 'Journal', phone: 'Message vocal', photos: 'Photos de famille',
        cassettes: 'Cassettes', clock: 'Horloge', lamp: 'Lampe', window: 'Balcon', calendar: 'Fêtes',
        coffee: 'Tasse de café', books: 'La table de Teta', expat: 'Loin du pays', tawleh: 'Tawlé et cartes', together: 'Pièces de famille',
        teta: 'Le fauteuil de Teta', ac: 'Climatiseur', heat: 'Le chauffage'
      },
      hints: {
        atari: 'Jeux vidéo d’antan', radio: 'Radios libanaises en direct', tv: 'Émissions des chaînes', news: 'Les titres du jour', phone: 'Pour une pièce de famille, avec une chanson', photos: 'Accrochez vos photos',
        cassettes: 'Une chanson pour chaque humeur', clock: 'Réveil', lamp: 'Minuterie', window: 'Mon village, la météo', calendar: 'Fêtes et jours fériés',
        coffee: 'Lire ma tasse ?', books: '30 recettes + les vôtres', expat: 'Beyrouth de loin', tawleh: 'Tawlé, Tarneeb, Likha', together: 'Privées, avec un code',
        teta: 'Grand et simple', ac: 'Heure et météo', heat: 'L’allumer ou l’éteindre'
      },
      tvLede: 'Appuyez sur une chaîne, choisissez une émission ou une série, elle passe ici, sur la télé. Sans direct, sans abonnement.',
      photosLede: 'Des messages de l’étranger pour la famille au Liban.',
      cassettesLede: 'Une cassette pour chaque ambiance. Touchez, elle joue ici.',
      lampLede: 'La radio s’éteint toute seule pendant que vous vous endormez.',
      approxNote: 'Les fêtes musulmanes sont approximatives, selon l’observation de la lune.',
      coffeeLede: 'Finissez votre café, retournez la tasse, et voyons ce qu’elle dit. (Pour rire !)',
      coffeeFlip: 'Retourner la tasse',
      coffeeAgain: 'Une autre tasse',
      coffeeSee: 'Je vois',
      sunrise: 'Lever', sunset: 'Coucher', iftar: 'Iftar, vers', today: 'Aujourd’hui', inDays: n => n === 1 ? 'Demain' : `Dans ${n} jours`,
      serves: n => `Pour ${n}`, minutes: n => `${n} min`, ingredients: 'Ingrédients', method: 'Préparation',
      playOnSpotify: 'Écouter', listen: 'Écouter',
      nowOutside: (w, t) => `À Beyrouth en ce moment : ${w}, ${t}°`,
      credits: ''
    }
  };
  // an era can rename its objects (a smart speaker instead of the radio, records instead of tapes)
  try {
    const eraNow = (window.SawtEras || {})[S.store.get('era', '90s')];
    if (eraNow && eraNow.ready && eraNow.labels) for (const [lg, names] of Object.entries(eraNow.labels)) if (R[lg]) Object.assign(R[lg].objects, names);
    // the heater is named for what it is in that room
    const HN = {
      fire: { ar: 'الشومينيه', en: 'The fireplace', fr: 'La cheminée' },
      kerosene: { ar: 'صوبيا الكاز', en: 'The kerosene heater', fr: 'Le poêle à pétrole' },
      gas: { ar: 'صوبيا الغاز', en: 'The gas heater', fr: 'Le chauffage à gaz' },
      radiator: { ar: 'الشوفاج الكهربا', en: 'The oil radiator', fr: 'Le radiateur à bain d’huile' },
      electric: { ar: 'الدفّاية', en: 'The electric heater', fr: 'Le radiateur électrique' }
    };
    const hk = ((window.SawtEras || {})[S.store.get('era', '90s')] || {}).heat;
    if (hk && HN[hk.kind]) for (const lg of ['ar', 'en', 'fr']) if (R[lg]) R[lg].objects.heat = HN[hk.kind][lg];
  } catch { /* fine */ }
  const r = (key, ...args) => {
    const v = (R[S.lang()] || R.ar)[key];
    return typeof v === 'function' ? v(...args) : v;
  };

  // ================================================================== the room in three lights

  // ================================================================== the eras
  // The same family's salon in the 1980s, 1990s (this one), 2000s and 2020s. Each other era has
  // its own photos and spots in eras.js; only eras whose photos are in are offered.
  const ERA_LIST = ['80s', '80sh', '90s', '90sh', '00s', '00sh', '26', '26h'];   // 'h': the village house, otherwise the apartment
  const decadeOf = id => id.replace(/h$/, '');
  const isHouse = id => /h$/.test(id);
  const ERA_DATA = window.SawtEras || {};
  const eraReady = id => id === '90s' || !!(ERA_DATA[id] && ERA_DATA[id].ready);
  const erasReady = () => ERA_LIST.filter(eraReady);
  const decadesReady = () => [...new Set(erasReady().map(decadeOf))];
  const homesOf = d => [d, d + 'h'].filter(eraReady);
  // pick a decade, keeping the apartment or the house when that decade has it
  function pickEra(decade, house = isHouse(era)) {
    const want = decade + (house ? 'h' : '');
    setEra(eraReady(want) ? want : homesOf(decade)[0]);
  }
  let era = S.store.get('era', '90s'); if (!eraReady(era)) era = '90s';
  const E = era === '90s' ? (ERA_DATA['90s'] || {}) : ERA_DATA[era];
  const BASE = E.base || '/room/';
  function setEra(id) {
    if (!eraReady(id)) return;
    S.store.set('eraPicked', true);
    if (id === era) return;
    S.store.set('era', id);
    try { sessionStorage.setItem('sawt:era-switch', '1'); } catch { /* fine */ }
    location.reload();
  }

  const SCENES = ['day', 'sunset', 'night'];
  const SI = { day: 0, night: 1, sunset: 2 };          // index into the per-picture positions below
  // Where things are in each picture, in % of its width and height ([day, night, sunset]).
  const SPOTS = E.spots || {
    radio: [[25.5, 41.5], [25.5, 41.5], [25.5, 40]],
    phone: [[20.3, 37.5], [20.5, 38], [20.5, 36.5]],
    tv: [[91.5, 44], [91.5, 44], [90, 42]],
    atari: [[83.5, 60], [83.5, 60], [87.5, 55]],
    cassettes: [[89.5, 55.5], [77.5, 61.5], [77, 60]],
    clock: [[21, 22], null, null],
    calendar: [[27, 20], [26.8, 20], [27, 22]],
    expat: [[12.6, 23.5], [14.5, 23.5], [14.5, 23]],
    window: [[55, 33], [55, 33], [53, 36]],
    lamp: [[10, 38.5], [10, 39], [9.8, 37.5]],
    coffee: [[57.5, 58.5], [44.8, 56.5], [44.6, 54.5]],
    tawleh: [[47, 57], [61, 82], [56, 59.5]],
    news: [[30, 87], [35, 86], [13, 93]],
    books: [[88, 80], [88, 80], [90, 74]],
    photos: [[77, 27.5], [77, 27.5], [77, 27.5]],
    together: [[16, 64], [12, 58], [22, 62]],
    teta: [[71.5, 51], [71.5, 51], [70, 50]],
    ac: [[9, 2.5], [9, 2.5], [9, 2.5]]
  };
  // The objects in the order they sit in the room, left to right.
  const OBJECT_IDS = E.objects || ['ac', 'lamp', 'expat', 'phone', 'clock', 'radio', 'calendar', 'together', 'news', 'tawleh', 'window', 'coffee', 'teta', 'photos', 'cassettes', 'tv', 'atari', 'books'];
  if (E.heat) {                                     // every room has its heater
    if (!OBJECT_IDS.includes('heat')) OBJECT_IDS.push('heat');
    if (!SPOTS.heat) SPOTS.heat = [E.heat.spot, E.heat.spot, E.heat.spot];
  }
  const OBJECTS = OBJECT_IDS.map(id => ({ id }));
  const ACTION_ONLY = { teta: true, ac: true, heat: true };          // these do something instead of opening a drawer
  const PX = E.px || { day: [1264, 843], night: [1264, 843], sunset: [1536, 1024] };
  const TV = E.tv || {
    day: [[1088.3, 320], [1204, 319.3], [1202.7, 419.3], [1089.3, 418.3]],
    night: [[1094, 321], [1204, 319.5], [1203, 416], [1092, 411]],
    sunset: [[1330, 381], [1459, 379.5], [1457.5, 490], [1330, 481]]
  };
  // the family photos: the four corners of the print inside each frame (tl, tr, br, bl), in picture pixels
  const FRAMES = E.frames || {
    day: [[[959.0,213.0],[991.0,213.0],[991.0,268.0],[959.0,268.0]], [[302.0,285.0],[329.0,284.0],[332.0,319.0],[303.0,319.0]], [[247.0,303.0],[268.0,303.0],[268.0,330.0],[247.0,330.0]], [[375.0,236.0],[403.0,239.0],[400.0,280.0],[372.0,279.0]], [[1161.0,133.0],[1197.0,133.0],[1197.0,166.0],[1161.0,166.0]], [[1170.0,217.0],[1195.0,212.0],[1196.0,250.0],[1170.0,252.0]], [[1077.0,160.0],[1117.0,159.0],[1117.0,187.0],[1077.0,188.0]]],
    night: [[[958.0,212.0],[992.0,212.0],[992.0,270.0],[958.0,270.0]], [[307.0,284.0],[332.0,286.0],[333.0,319.0],[308.0,321.0]], [[262.0,303.0],[283.0,302.0],[283.0,331.0],[262.0,332.0]], [[373.0,239.0],[401.0,238.0],[400.0,277.0],[372.0,278.0]], [[1158.0,132.0],[1196.0,132.0],[1196.0,168.0],[1158.0,168.0]], [[233.5,313.5],[251.0,313.5],[251.0,333.0],[233.5,333.0]], [[1224.0,272.0],[1251.0,271.0],[1253.0,300.0],[1222.0,300.0]]],
    sunset: [[[1163.0,251.0],[1203.0,251.0],[1203.0,318.0],[1163.0,318.0]], [[370.0,337.0],[401.0,338.0],[404.0,377.0],[370.0,378.0]], [[285.0,373.0],[303.0,373.0],[303.0,392.0],[285.0,392.0]], [[452.0,279.0],[485.0,279.0],[485.0,326.0],[452.0,327.0]], [[1402.0,153.0],[1468.0,153.0],[1468.0,200.0],[1402.0,200.0]], [[316.0,362.0],[343.0,362.0],[343.0,396.0],[316.0,396.0]], [[1481.0,318.0],[1521.0,318.0],[1521.0,352.0],[1481.0,352.0]]]
  };
  const GLASS = E.glass || { day: [44.5, 21, 60.9, 55.8], night: [44.5, 21, 60.9, 55.8], sunset: [44.9, 20.7, 60.2, 54.7] };
  const STEAM = E.steam || { night: [[44.7, 55.6, 1], [48, 59.3, 0]], sunset: [[44.6, 54.2, 1], [53, 57.8, 0.7]], day: [[0, 0, 0], [0, 0, 0]] };
  const PELMET = E.pelmet || { day: [32.6, 66.4, 9.6, 11.4], night: [32.6, 66.4, 9.6, 11.4], sunset: [32.6, 66.6, 9, 10.5] };   // x0, x1, y at the ends

  const hidden = new Set();   // objects switched off by the server config
  const norm = (scene, [x, y]) => [x / PX[scene][0], y / PX[scene][1]];
  function spot(id, sc = scene) { const p = SPOTS[id] && SPOTS[id][SI[sc]]; return p ? [p[0] / 100, p[1] / 100] : null; }
  function visibleObjects(sc = scene) { return OBJECTS.filter(o => !hidden.has(o.id) && spot(o.id, sc)); }

  // ================================================================== Beirut's sun

  const RAD = Math.PI / 180;
  const BEIRUT = { lat: 33.89, lon: 35.5 };
  function sun(date) {
    const d = date.valueOf() / 864e5 - 0.5 + 2440588 - 2451545;
    const M = RAD * (357.5291 + 0.98560028 * d);
    const Cc = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    const L = M + Cc + RAD * 102.9372 + Math.PI;
    const e = RAD * 23.4397;
    const dec = Math.asin(Math.sin(e) * Math.sin(L));
    const ra = Math.atan2(Math.sin(L) * Math.cos(e), Math.cos(L));
    let H = RAD * (280.16 + 360.9856235 * d) + RAD * BEIRUT.lon - ra;
    H = Math.atan2(Math.sin(H), Math.cos(H));
    const phi = RAD * BEIRUT.lat;
    const alt = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
    return { alt: alt / RAD, H };
  }

  // After dark it is night; the golden hour before (and just after) sunset is the sunset room.
  function sceneFor(date = new Date()) {
    const { alt, H } = sun(date);
    if (alt < -5) return 'night';
    if (H > 0 && alt < 9) return 'sunset';
    if (H <= 0 && alt < 1.5) return 'sunset';
    return 'day';
  }
  // The season and the weather tint the light: grey and cool in winter, warmer in summer.
  function moodNow() {
    const month = Number(beirutDate(new Date()).slice(5, 7));
    const code = beirutCode();
    const wet = weatherMode === 'rain' || (weatherMode === 'auto' && code !== null && (code === 3 || code === 45 || code === 48 || code >= 51));
    if (weatherMode === 'clear') return month >= 6 && month <= 9 ? 'summer' : 'clear';
    if (weatherMode === 'snow' || (weatherMode === 'auto' && (occasion === 'xmas' || snowingInBeirut()))) return 'snowy';
    if (wet) return 'grey';
    if (month === 12 || month <= 2) return 'winter';
    if (hotNow()) return 'hot';
    if (month >= 6 && month <= 9) return 'summer';
    return 'clear';
  }
  const GRADE = {                       // multiply rgb, saturation
    clear: [1, 1, 1, 1], hot: [1.07, 1.02, 0.91, 1.1], snowy: [0.96, 0.99, 1.06, 0.86], summer: [1.045, 1.0, 0.93, 1.06], winter: [0.97, 0.99, 1.03, 0.92], grey: [0.86, 0.9, 0.97, 0.78]
  };

  // Sunrise and sunset around a given moment (searched minute by minute).
  function sunTimes(date = new Date()) {
    const dayStr = beirutDate(date);
    const out = {};
    let prev = null;
    const start = date.valueOf() - 26 * 3600e3;
    for (let t = start; t < start + 52 * 3600e3; t += 120e3) {
      const a = sun(new Date(t)).alt + 0.833;
      if (prev !== null && beirutDate(new Date(t)) === dayStr) {
        if (prev < 0 && a >= 0) out.rise = new Date(t);
        if (prev >= 0 && a < 0) out.set = new Date(t);
      }
      prev = a;
    }
    return out;
  }

  function beirutDate(d) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Beirut', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  }
  function timeIn(d, tz) {
    return new Intl.DateTimeFormat(S.locale(), { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(d);
  }

  // ================================================================== pictures

  const sharp = Math.max(screen.width, screen.height) * (window.devicePixelRatio || 1) > 1400;
  function picUrl(sc, small) { return `${BASE}${sc}${small ? '-s' : ''}.jpg`; }
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // ================================================================== the viewer

  const canvas = $('view');
  // cx, cy: the point of the picture in the middle of the screen (0..1); z: zoom over "just fills the screen"
  const view = { cx: 0.5, cy: 0.5, z: 1, vx: 0, vy: 0 };
  let gl = null, prog = null, tex = [null, null, null, null, null, null], mixAmount = 0, uni = {};
  let needsDraw = true;
  let aspect = 1.5;                       // of the picture on show
  let maxTex = 4096;

  const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FRAG = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    uniform vec2 res;          // canvas size in device pixels
    uniform vec4 cam;          // cx, cy, uv per device pixel (x, y)
    uniform float asp;         // picture aspect
    uniform sampler2D t0;
    uniform sampler2D t1;
    uniform float mixv;
    uniform vec4 glass;        // the balcony glass (u0, v0, u1, v1)
    uniform float rain;        // 0 dry .. 1 pouring
    uniform float snow;        // 0 .. 1 snowing
    uniform float time;
    uniform float flash;       // lightning
    uniform float power;       // 1 = mains, 0 = power cut
    uniform float motor;       // 1 = on the neighbourhood generator
    uniform vec4 steamA;       // u, v, strength
    uniform vec4 steamB;
    uniform sampler2D td;      // seasonal decorations
    uniform float decor;
    uniform float glow;        // night: decorations and city lights glow and twinkle
    uniform vec4 grade;        // rgb multiply, saturation
    uniform float vign;
    uniform sampler2D tb;      // a tiny copy of the room: blurred when stretched, fills around the long shot
    uniform vec2 bgs;          // uv per device pixel for that fill
    uniform sampler2D tm;      // the windows of this room: r = glass (what is outside), g = sky, b = glass blurred (edges)
    uniform float hasMask;
    uniform vec4 bolt;         // lightning bolt: u, where it ends (v), seed, strength
    uniform sampler2D te;      // the heater's own light (what the fire adds), over heatBox
    uniform vec4 heatBox;      // u0, v0, u1, v1
    uniform float heatOn;      // 0 out .. 1 burning
    uniform vec4 heatGlow;     // u, v, reach, how dark the room is
    uniform vec4 steamC;       // the kettle or the chestnuts
    uniform vec4 moon;         // u, v, phase (0 new .. 0.5 full .. 1), strength
    uniform float stars;
    uniform vec4 birds;        // started (s ago), height v, direction, strength
    uniform vec4 fan;          // ceiling fan: hub u, v, half-width, half-height (uv)
    uniform float fanSpin;
    uniform vec4 acBox;        // under the AC: u0, v0, u1, v1
    uniform float acShim;
    uniform vec2 seasonFx;     // kind (1 leaves, 2 blossom, 3 haze), amount
    uniform float living;      // curtains breathe (0 in the light room)
    float h21(vec2 q) { q = fract(q * vec2(123.34, 456.21)); q += dot(q, q + 45.32); return fract(q.x * q.y); }
    float vn(vec2 q) { vec2 i = floor(q), f = fract(q); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
    float steam(vec4 s, vec2 uv, float t) {
      if (s.z <= 0.0) return 0.0;
      vec2 q = vec2((uv.x - s.x) * asp, s.y - uv.y) * 260.0;
      if (q.y < -0.3 || q.y > 9.0 || abs(q.x) > 4.0) return 0.0;
      float w = 0.5 + q.y * 0.28;
      float sway = sin(q.y * 0.9 - t * 1.3) * 0.35 * q.y * 0.25;
      float body = smoothstep(w, 0.0, abs(q.x - sway));
      float n = vn(vec2(q.x * 1.6, q.y * 1.1 - t * 1.8)) * vn(vec2(q.x * 3.1 + 4.0, q.y * 2.3 - t * 2.6));
      float fade = smoothstep(-0.3, 0.6, q.y) * smoothstep(9.0, 2.0, q.y);
      return body * n * fade * s.z;
    }
    // Running drops with trails on glass (after Martijn Steinrucken's "Heartfelt" idea).
    vec3 drops(vec2 g0, float t) {
      vec2 aspect = vec2(2.0, 1.0);
      vec2 g = g0 * aspect;
      g.y += t * 0.25;
      vec2 id = floor(g);
      vec2 gv = fract(g) - 0.5;
      float n = h21(id);
      t += n * 6.2831;
      float wv = g0.y * 10.0;
      float x = (n - 0.5) * 0.8;
      x += (0.4 - abs(x)) * sin(3.0 * wv) * pow(sin(wv), 6.0) * 0.45;
      float y = -sin(t + sin(t + sin(t) * 0.5)) * 0.45;
      y -= (gv.x - x) * (gv.x - x);
      vec2 dp = (gv - vec2(x, y)) / aspect;
      float drop = smoothstep(0.05, 0.03, length(dp));
      // no trails: their thin stripes read as lines on a phone
      drop *= smoothstep(0.5, 0.42, abs(gv.x)) * smoothstep(0.5, 0.42, abs(gv.y));
      return vec3(drop * dp, drop);
    }
    // rain falling outside, seen through the glass: thin slanted streaks in two depths
    float streaks(vec2 p, float t, float sp, float dens, float px) {
      p.x += p.y * 0.22;
      vec2 q = vec2(p.x * dens, p.y * 2.2 - t * sp);
      vec2 id = floor(q); vec2 f = fract(q);
      float r = h21(id + 1.7), r2 = h21(id.yx + 9.3);
      float w = max(0.07, px * dens * 1.2);           // never thinner than a pixel: no shimmering lines
      float line = smoothstep(w, 0.0, abs(f.x - (0.15 + 0.7 * r))) * min(1.0, 0.07 / w * 1.6);
      float len = smoothstep(0.0, 0.12, f.y) * smoothstep(0.35 + 0.5 * r2, 0.2 + 0.3 * r2, f.y);
      return line * len * step(0.45, r2);
    }
    // snowflakes drifting down and swaying
    float flakes(vec2 p, float t, float sc) {
      p *= sc;
      p.y -= t * 0.9;
      p.x += sin(p.y * 0.55 + t * 0.7) * 0.3;
      vec2 id = floor(p); vec2 f = fract(p) - 0.5;
      float n = h21(id);
      vec2 o = vec2(n - 0.5, fract(n * 9.1) - 0.5) * 0.6;
      float r = 0.05 + 0.08 * fract(n * 5.3);
      return smoothstep(r, r * 0.25, length(f - o)) * step(0.28, fract(n * 3.3));
    }
    vec3 beads(vec2 g) {
      vec2 id = floor(g); vec2 gv = fract(g) - 0.5;
      float n = h21(id);
      vec2 c = vec2(n - 0.5, fract(n * 7.3) - 0.5) * 0.7;
      vec2 d = gv - c;
      float r = 0.08 + 0.12 * fract(n * 13.1);
      float m = smoothstep(r, r * 0.6, length(d)) * step(0.35, fract(n * 3.7));
      return vec3(d * m * 0.6, m);
    }
    void main(){
      vec2 fc = gl_FragCoord.xy - res * 0.5;
      vec2 uv = vec2(cam.x + fc.x * cam.z, cam.y - fc.y * cam.w);
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        vec2 bu = vec2(0.5) + vec2(fc.x, -fc.y) * bgs;
        vec3 b = texture2D(tb, bu).rgb * 0.62;
        float e = max(max(-uv.x, uv.x - 1.0) * asp, max(-uv.y, uv.y - 1.0));
        b *= 0.5 + 0.5 * smoothstep(0.0, 0.1, e);
        vec3 gen0 = vec3(1.0, 0.84, 0.66) * 0.74;
        b *= mix(vec3(0.025, 0.025, 0.04), mix(vec3(1.0), gen0, motor), power);
        gl_FragColor = vec4(b, 1.0);
        return;
      }
      vec2 su = uv;
      if (hasMask > 0.5 && living > 0.0) {             // the sheer curtains breathe a little
        float cu = texture2D(tm, uv).a;
        if (cu > 0.01) su.x += (sin(time * 0.9 + uv.y * 7.0) * 0.6 + sin(time * 1.7 + uv.y * 13.0) * 0.4) * 0.0022 * cu * living;
      }
      if (acShim > 0.0 && uv.x > acBox.x && uv.x < acBox.z && uv.y > acBox.y && uv.y < acBox.w) {
        float fy = (uv.y - acBox.y) / (acBox.w - acBox.y);
        su.x += sin(uv.y * 260.0 - time * 7.0) * 0.0007 * acShim * (1.0 - fy) * smoothstep(0.0, 0.3, fy);
      }
      vec4 c = texture2D(t0, su);
      if (mixv > 0.0) c = mix(c, texture2D(t1, su), mixv);
      if (fanSpin > 0.0) {                             // the ceiling fan turning: the blades blur into a disc
        vec2 fd = (uv - fan.xy) / fan.zw;
        float fr = length(fd);
        if (fr < 1.0 && fr > 0.12) {
          float a0 = atan(fd.y, fd.x);
          vec3 acc = vec3(0.0);
          for (int k = 0; k < 10; k++) {
            float a = a0 + (float(k) - 4.5) * 0.21;
            acc += texture2D(t0, fan.xy + vec2(cos(a), sin(a)) * fr * fan.zw).rgb;
          }
          c.rgb = mix(c.rgb, acc / 10.0, fanSpin * smoothstep(1.0, 0.85, fr) * smoothstep(0.12, 0.2, fr));
        }
      }
      float m = smoothstep(glass.x, glass.x + 0.006, uv.x) * smoothstep(glass.z, glass.z - 0.006, uv.x) *
                smoothstep(glass.y, glass.y + 0.006, uv.y) * smoothstep(glass.w, glass.w - 0.006, uv.y);
      float sky = m * smoothstep(glass.y + 0.25 * (glass.w - glass.y), glass.y, uv.y);
      float edge = 1.0;
      if (hasMask > 0.5) { vec3 mk = texture2D(tm, uv).rgb; m = mk.r; sky = mk.g; edge = mk.b; }
      if (glow > 0.0 && m > 0.0) {            // the city lights outside shimmer a little
        float l = dot(c.rgb, vec3(0.3, 0.55, 0.15));
        float tw = vn(uv * vec2(asp, 1.0) * 220.0 + vec2(time * 0.9, time * 0.35)) * 2.0 - 1.0;
        c.rgb *= 1.0 + glow * m * smoothstep(0.5, 0.85, l) * tw * 0.28;
      }
      if (m > 0.01) {
        vec2 op = vec2(uv.x * asp, uv.y);
        float olum = dot(c.rgb, vec3(0.3, 0.59, 0.11));
        float darkSky = 1.0 - smoothstep(0.08, 0.3, olum);
        if (stars > 0.0) {                             // stars in a dark sky
          vec2 g = op * 260.0; vec2 id = floor(g); vec2 f = fract(g) - 0.5;
          float n = h21(id);
          float st0 = step(0.985, n) * smoothstep(0.32, 0.0, length(f + (vec2(fract(n * 13.0), fract(n * 7.0)) - 0.5) * 0.4));
          float tw = 0.6 + 0.4 * sin(time * (1.0 + n * 3.0) + n * 40.0);
          c.rgb += vec3(0.9, 0.93, 1.0) * st0 * tw * stars * darkSky * m * (0.4 + 0.6 * sky);
        }
        if (moon.w > 0.0) {                            // the moon, in its real phase
          vec2 md = (op - vec2(moon.x * asp, moon.y)) / 0.022;
          float r = length(md);
          if (r < 3.0) {
            float disc = smoothstep(1.0, 0.92, r);
            float ph = moon.z * 2.0 - 1.0;              // -1 new .. 0 full .. 1 new
            float xs = md.x / max(0.001, sqrt(max(0.0, 1.0 - md.y * md.y)));
            float lit = ph < 0.0 ? smoothstep(-ph * 2.0 - 1.0 - 0.08, -ph * 2.0 - 1.0 + 0.08, xs) : smoothstep(1.0 - ph * 2.0 + 0.08, 1.0 - ph * 2.0 - 0.08, xs);
            float glowM = exp(-r * 1.6) * 0.35;
            vec3 mc = vec3(0.96, 0.95, 0.88) * (0.25 + 0.75 * lit) * (0.85 + 0.15 * vn(md * 3.0 + 5.0));
            c.rgb = mix(c.rgb, mc, disc * moon.w * m * darkSky);
            c.rgb += vec3(0.8, 0.82, 0.9) * glowM * moon.w * m * darkSky * (1.0 - 0.6 * abs(ph));
          }
        }
        if (birds.w > 0.0) {                           // a few birds crossing the sky
          for (int k = 0; k < 4; k++) {
            float fk = float(k);
            vec2 bp = vec2(-0.1 + birds.z * birds.x * 0.035 + fk * 0.03 * (h21(vec2(fk, 1.0)) + 0.5), birds.y + fk * 0.012 * sin(fk * 2.1) + sin(birds.x * 0.8 + fk) * 0.01);
            if (birds.z < 0.0) bp.x += 1.2 + fk * 0.06;
            vec2 q = (op - vec2(bp.x * asp, bp.y)) / 0.007;
            float flap = sin(birds.x * 11.0 + fk * 1.9) * 0.6;
            float wing = abs(q.y + abs(q.x) * (0.55 + flap * 0.5) - 0.1);
            float bd = smoothstep(0.32, 0.12, wing) * step(abs(q.x), 1.3);
            c.rgb = mix(c.rgb, vec3(0.12, 0.12, 0.14), bd * 0.75 * birds.w * m);
          }
        }
        if (seasonFx.y > 0.0) {
          if (seasonFx.x < 1.5 || seasonFx.x > 1.5 && seasonFx.x < 2.5) {   // leaves or blossom drifting down outside
            vec2 lp = op * 9.0; lp.y -= time * 0.35; lp.x += sin(lp.y * 0.8 + time * 0.6) * 0.5;
            vec2 id = floor(lp); vec2 f = fract(lp) - 0.5; float n = h21(id + 3.3);
            vec2 o2 = vec2(n - 0.5, fract(n * 9.7) - 0.5) * 0.6;
            vec2 d = f - o2; float ang = time * (1.0 + n * 2.0) + n * 6.0;
            d = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * d;
            float leaf = smoothstep(0.06, 0.03, length(d * vec2(1.0, 2.2))) * step(0.82, fract(n * 5.1));
            vec3 lc = seasonFx.x < 1.5 ? mix(vec3(0.75, 0.38, 0.1), vec3(0.85, 0.62, 0.18), fract(n * 3.7)) : mix(vec3(1.0, 0.86, 0.9), vec3(0.98, 0.97, 0.95), fract(n * 3.7));
            c.rgb = mix(c.rgb, lc * (0.4 + 0.6 * (1.0 - darkSky)), leaf * seasonFx.y * m);
          } else {                                       // summer haze over the far view
            c.rgb = mix(c.rgb, vec3(olum) * vec3(1.04, 1.0, 0.92) + 0.05, 0.18 * seasonFx.y * m * (0.4 + 0.6 * sky));
          }
        }
      }
      if (rain > 0.001 && m > 0.01) {
        vec2 sp2 = vec2(uv.x * asp, uv.y);
        // drops running down the glass bend what is outside
        vec2 st = sp2 * 6.5;
        vec3 a = drops(st, time);
        vec3 b = drops(st * 1.65 + vec2(7.54, 2.1), time * 1.1);
        vec3 e = beads(st * 6.0);
        vec2 o = (a.xy + b.xy * 0.7 + e.xy * 0.6) * rain * 0.7;
        float wet = max(max(a.z, b.z), e.z);
        vec2 u2 = uv - o * 0.05;
        float bl = 0.0022 * (1.0 - wet);
        vec3 out0 = (texture2D(t0, u2 + vec2(bl, 0.0)).rgb + texture2D(t0, u2 - vec2(bl, 0.0)).rgb +
                     texture2D(t0, u2 + vec2(0.0, bl)).rgb + texture2D(t0, u2 - vec2(0.0, bl)).rgb) * 0.25;
        float lum = dot(out0, vec3(0.3, 0.59, 0.11));
        // the weather outside: a heavy grey sky, cold flat light, rain hiding the far side
        vec3 storm = mix(vec3(lum) * vec3(0.56, 0.6, 0.68), out0 * vec3(0.62, 0.66, 0.74), 0.3);
        vec3 o2 = mix(out0, storm, rain * 0.85);
        float cl = vn(vec2(sp2.x * 2.6 + time * 0.035, sp2.y * 5.0 - time * 0.01)) * 0.6 + vn(vec2(sp2.x * 7.0 - time * 0.06, sp2.y * 11.0)) * 0.4;
        vec3 cloud = mix(vec3(0.22, 0.24, 0.29), vec3(0.5, 0.53, 0.58), cl) * (0.35 + 0.65 * smoothstep(0.05, 0.6, lum));
        o2 = mix(o2, cloud, (0.6 + 0.4 * sky) * rain * 0.8 * smoothstep(0.35, 0.0, uv.y - glass.y + (1.0 - sky) * 0.2));
        o2 = mix(o2, vec3(lum * 0.55 + 0.12) * vec3(0.9, 0.94, 1.0), rain * 0.22 * (1.0 - sky));   // mist
        // the rain itself: three depths, slanted, in gusts
        float gust = 0.55 + 0.45 * vn(vec2(sp2.x * 1.5 - time * 0.4, time * 0.25));
        float pxs = cam.z * asp;
        float rs = streaks(sp2 * 0.7 + 11.0, time, 2.0, 120.0, pxs * 0.7) * 0.45
                 + streaks(sp2, time, 2.8, 70.0, pxs) * 0.8
                 + streaks(sp2 * 1.5 + 3.1, time, 3.6, 46.0, pxs * 1.5) * 1.0;
        float dark = 1.0 - smoothstep(0.05, 0.7, lum);
        o2 += vec3(0.78, 0.83, 0.9) * rs * gust * rain * (0.22 + 0.4 * dark);
        // lightning: the whole sky lights up, and a bolt now and then
        o2 += flash * vec3(0.8, 0.86, 1.0) * (0.25 + 0.75 * sky) * (0.55 + 0.45 * dark);
        if (bolt.w > 0.0 && uv.y < bolt.y) {
          float yy = uv.y * 26.0;
          float path = bolt.x + (vn(vec2(yy, bolt.z)) - 0.5) * 0.035 + (vn(vec2(yy * 4.0, bolt.z + 7.0)) - 0.5) * 0.009;
          float d = abs(uv.x - path) * asp;
          float br = bolt.x + 0.025 * sign(h21(vec2(bolt.z)) - 0.5) * smoothstep(bolt.y * 0.45, bolt.y, uv.y);
          float d2 = abs(uv.x - br - (vn(vec2(yy * 3.0, bolt.z + 3.0)) - 0.5) * 0.012) * asp + step(uv.y, bolt.y * 0.45);
          float core = smoothstep(0.0022, 0.0, d) + smoothstep(0.0016, 0.0, d2) * 0.7;
          float halo = smoothstep(0.04, 0.0, d) * 0.35;
          o2 += (core + halo) * bolt.w * vec3(0.92, 0.95, 1.0) * smoothstep(bolt.y, bolt.y - 0.05, uv.y);
        }
        // the glass: wet, a little darker at the rims of the drops
        o2 *= 1.0 - clamp(length(o) * 2.2, 0.0, 0.25);
        o2 += pow(wet, 8.0) * 0.03;
        c.rgb = mix(c.rgb, o2, m * smoothstep(0.0, 0.25, rain));
      }
      if (snow > 0.001 && m > 0.01) {
        vec2 sp = vec2(uv.x * asp, uv.y);
        float lum = dot(c.rgb, vec3(0.3, 0.59, 0.11));
        // a soft winter sky, then flakes in three depths drifting down outside
        vec3 o3 = mix(c.rgb, mix(c.rgb, vec3(0.62, 0.66, 0.74) * (0.35 + 0.65 * smoothstep(0.05, 0.6, lum)), 0.5), sky * snow);
        float far = flakes(sp + 5.7, time * 0.5, 34.0), mid = flakes(sp + 2.3, time * 0.75, 20.0), near = flakes(sp, time, 11.0);
        float dark = 1.0 - smoothstep(0.1, 0.7, lum);
        o3 = mix(o3, vec3(0.96, 0.97, 1.0), clamp(far * 0.35 + mid * 0.65 + near * 0.9, 0.0, 1.0) * snow * (0.55 + 0.45 * dark));
        c.rgb = mix(c.rgb, o3, m);
      }
      if (decor > 0.0) {
        vec4 dd = texture2D(td, uv);
        float tw = 1.0;
        if (glow > 0.0) tw = 0.8 + 0.2 * sin(time * 1.7 + vn(uv * vec2(asp, 1.0) * 30.0) * 14.0);
        c.rgb = mix(c.rgb, dd.rgb * mix(1.0, tw, glow), dd.a * decor);
      }
      c.rgb += flash * 0.1 * vec3(0.85, 0.9, 1.0);
      // the heater: flames that move, light that flickers on the floor and the walls
      if (heatOn > 0.001) {
        float fl = 0.78 + 0.22 * vn(vec2(time * 5.0, 1.7)) + 0.08 * sin(time * 17.0);
        if (uv.x > heatBox.x && uv.x < heatBox.z && uv.y > heatBox.y && uv.y < heatBox.w) {
          vec2 eu = (uv - heatBox.xy) / (heatBox.zw - heatBox.xy);
          eu.x += sin(time * 9.0 + eu.y * 38.0) * 0.006 * (1.0 - eu.y);
          eu.y += vn(vec2(eu.x * 14.0, time * 3.0)) * 0.01;
          vec3 em = texture2D(te, eu).rgb;
          float lick = 0.75 + 0.5 * vn(vec2(eu.x * 22.0, eu.y * 9.0 + time * 4.0));
          c.rgb += em * heatOn * fl * lick * (1.0 + heatGlow.w * 0.6);
        }
        float d = length((uv - heatGlow.xy) * vec2(asp, 1.0));
        float warm = smoothstep(heatGlow.z, 0.0, d);
        c.rgb += vec3(1.0, 0.5, 0.18) * warm * warm * heatOn * fl * (0.035 + 0.11 * heatGlow.w) * (0.4 + dot(c.rgb, vec3(0.33)));
      }
      float st = steam(steamA, uv, time) + steam(steamB, uv, time) + steam(steamC * vec4(1.0, 1.0, heatOn, 1.0), uv, time);
      c.rgb = mix(c.rgb, vec3(0.96, 0.94, 0.9), clamp(st * 0.5, 0.0, 0.32));
      float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      c.rgb = mix(vec3(l), c.rgb, grade.w) * grade.rgb;
      vec2 sp = gl_FragCoord.xy / res - 0.5;
      c.rgb *= 1.0 - vign * dot(sp, sp) * 1.1;
      vec3 gen = vec3(1.0, 0.84, 0.66) * 0.74;
      c.rgb *= mix(vec3(0.025, 0.025, 0.04), mix(vec3(1.0), gen, motor), power);
      gl_FragColor = vec4(c.rgb, 1.0);
    }`;

  function initGL() {
    gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false }) ||
         canvas.getContext('experimental-webgl');
    if (!gl) return false;
    maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link');
    } catch (err) { console.warn(err); gl = null; return false; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    for (const n of ['res', 'cam', 'asp', 't0', 't1', 'mixv', 'glass', 'rain', 'snow', 'time', 'flash', 'power', 'motor', 'steamA', 'steamB', 'td', 'decor', 'glow', 'grade', 'vign', 'tb', 'bgs', 'tm', 'hasMask', 'bolt', 'te', 'heatBox', 'heatOn', 'heatGlow', 'steamC', 'moon', 'stars', 'birds', 'fan', 'fanSpin', 'acBox', 'acShim', 'seasonFx', 'living']) uni[n] = gl.getUniformLocation(prog, n);
    gl.uniform1i(uni.t0, 0);
    gl.uniform1i(uni.t1, 1);
    gl.uniform1i(uni.td, 2);
    gl.uniform1i(uni.tb, 3);
    gl.uniform1i(uni.tm, 4);
    gl.uniform1i(uni.te, 5);
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); }, false);
    canvas.addEventListener('webglcontextrestored', () => { tex = [null, null, null, null, null, null]; heatImgSet = false; initGL(); if (currentImg) { setTexture(0, currentImg); setBlur(currentImg); } if (maskImg) setTexture(4, maskImg); if (heatImg) { setTexture(5, heatImg); heatImgSet = true; } decorFor = null; loadDecor(); needsDraw = true; });
    return true;
  }

  function setTexture(unit, img) {
    if (!tex[unit]) tex[unit] = gl.createTexture();
    gl.activeTexture([gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2, gl.TEXTURE3, gl.TEXTURE4, gl.TEXTURE5][unit]);
    const rgba = unit === 2 || unit === 4;
    gl.bindTexture(gl.TEXTURE_2D, tex[unit]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, rgba ? gl.RGBA : gl.RGB, rgba ? gl.RGBA : gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  // the soft fill around the long shot: the room squeezed to a few pixels, then stretched
  function setBlur(img) {
    if (!gl) return;
    try {
      const w = 48, h = Math.max(8, Math.round(48 / (img.naturalWidth / img.naturalHeight)));
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d');
      x.filter = 'blur(2px)';
      x.drawImage(img, -3, -3, w + 6, h + 6);
      setTexture(3, c);
    } catch { /* plain dark fill */ }
  }

  // ------------------------------------------------------------------ geometry
  function vw() { return canvas.clientWidth || innerWidth; }
  function vh() { return canvas.clientHeight || innerHeight; }
  function baseScale() { return Math.max(vw() / aspect, vh()); }        // px per picture-height at z = 1
  function pxW() { return aspect * baseScale() * view.z; }              // picture width on screen
  function pxH() { return baseScale() * view.z; }
  const ZMAX = 3.2;
  // the long shot: the whole room on screen (on a phone held upright, with a soft fill above and below)
  function zMin() { return Math.min(1, Math.min(vw() / aspect, vh()) / baseScale()); }
  function clampView(v = view) {
    v.z = Math.max(zMin(), Math.min(ZMAX, v.z));
    const s = baseScale() * v.z;
    const hw = vw() / 2 / (aspect * s), hh = vh() / 2 / s;
    v.cx = hw >= 0.5 ? 0.5 : Math.max(hw, Math.min(1 - hw, v.cx));
    v.cy = hh >= 0.5 ? 0.5 : Math.max(hh, Math.min(1 - hh, v.cy));
    return v;
  }
  function project(u, v) {
    return { x: (u - view.cx) * pxW() + vw() / 2, y: (v - view.cy) * pxH() + vh() / 2, front: true };
  }
  function unproject(x, y) {
    return [(x - vw() / 2) / pxW() + view.cx, (y - vh() / 2) / pxH() + view.cy];
  }
  // The view that puts picture point (u, v) at screen point (sx, sy) with zoom z.
  function viewFor(u, v, z, sx = vw() / 2, sy = vh() / 2) {
    const s = baseScale() * z;
    return clampView({ cx: u - (sx - vw() / 2) / (aspect * s), cy: v - (sy - vh() / 2) / s, z });
  }
  function startView() {
    const portrait = vh() > vw();
    // a phone held upright starts a bit closer; a double-tap shows the whole room
    return clampView({ cx: portrait ? 0.53 : 0.5, cy: 0.5, z: portrait ? Math.min(1, zMin() * 1.6) : zMin() });
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(vw() * dpr), h = Math.round(vh() * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    clampView();
    needsDraw = true;
  }

  function draw() {
    if (gl && tex[0]) {
      const dpr = canvas.width / Math.max(1, vw());
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uni.res, canvas.width, canvas.height);
      gl.uniform4f(uni.cam, view.cx, view.cy, 1 / (pxW() * dpr), 1 / (pxH() * dpr));
      gl.uniform1f(uni.asp, aspect);
      gl.uniform1f(uni.mixv, mixAmount);
      const g = GLASS[scene];
      gl.uniform4f(uni.glass, g[0] / 100, g[1] / 100, g[2] / 100, g[3] / 100);
      gl.uniform1f(uni.rain, rainNow);
      gl.uniform1f(uni.snow, snowNow);
      gl.uniform1f(uni.time, (performance.now() / 1000) % 3600);
      gl.uniform1f(uni.flash, flashNow);
      gl.uniform1f(uni.power, powerNow);
      gl.uniform1f(uni.motor, motorNow);
      const [sa, sb] = STEAM[scene];
      gl.uniform4f(uni.steamA, sa[0] / 100, sa[1] / 100, sa[2], 0);
      gl.uniform4f(uni.steamB, sb[0] / 100, sb[1] / 100, sb[2], 0);
      gl.uniform1f(uni.glow, scene === 'day' ? 0 : scene === 'sunset' ? 0.6 : 1);
      const gr = GRADE[mood] || GRADE.clear;
      gl.uniform4f(uni.grade, gr[0], gr[1], gr[2], gr[3]);
      gl.uniform1f(uni.vign, 0.32);
      { const cs = Math.max(canvas.width / aspect, canvas.height); gl.uniform2f(uni.bgs, 1 / (aspect * cs), 1 / cs); }
      if (tex[3]) { gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, tex[3]); }
      gl.uniform1f(uni.hasMask, tex[4] ? 1 : 0);
      if (tex[4]) { gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, tex[4]); }
      gl.uniform4f(uni.bolt, boltNow.u, boltNow.v, boltNow.seed, boltNow.a);
      const wet = rainNow > 0.05 || snowNow > 0.05;
      const nowS = performance.now();
      const night = scene === 'night';
      gl.uniform1f(uni.stars, night && !wet && !lite ? 1 : 0);
      const ph = moonPhase();
      const mv = night && !wet && moonSpot && ph > 0.06 && ph < 0.94 ? 1 : 0;
      gl.uniform4f(uni.moon, moonSpot ? moonSpot[0] : 0, moonSpot ? moonSpot[1] : 0, ph, mv);
      const bt = birdStart >= 0 ? (nowS - birdStart) / 1000 : -1;
      gl.uniform4f(uni.birds, bt, birdY, birdDir, bt >= 0 && bt < 40 && !lite ? 1 : 0);
      const F = E.fan;
      gl.uniform4f(uni.fan, F ? F[0] / 100 : 0, F ? F[1] / 100 : 0, F ? F[2] / 100 : 0, F ? F[3] / 100 : 0);
      const hot = hotNow() && powerNow > 0.5 ? 1 : 0;
      gl.uniform1f(uni.fanSpin, F && !lite ? hot : 0);
      const acp = SPOTS.ac && SPOTS.ac[SI[scene]];
      if (acp && !F) gl.uniform4f(uni.acBox, (acp[0] - 9) / 100, (acp[1] + 3) / 100, (acp[0] + 9) / 100, (acp[1] + 22) / 100);
      gl.uniform1f(uni.acShim, !F && acp && !lite ? hot : 0);
      const sk = seasonKind();
      gl.uniform2f(uni.seasonFx, sk, sk && !wet && !lite ? (sk === 3 ? (scene === 'day' ? 1 : 0.4) : 1) : 0);
      gl.uniform1f(uni.living, lite ? 0 : 1);
      const hOn = HEAT && tex[5] ? heatNow : 0;
      gl.uniform1f(uni.heatOn, hOn);
      if (HEAT) {
        const HB = (HEAT.scenes && HEAT.scenes[scene]) || HEAT;   // a room whose sunset photo is framed differently
        const [bx0, by0, bx1, by1] = HB.box, P = HB.px || HEAT.px || PX.day;
        gl.uniform4f(uni.heatBox, bx0 / P[0], by0 / P[1], bx1 / P[0], by1 / P[1]);
        const g = HB.glow || HEAT.glow || [HEAT.spot[0], HEAT.spot[1] + 6];
        gl.uniform4f(uni.heatGlow, g[0] / 100, g[1] / 100, HEAT.reach || 0.32, scene === 'night' ? 1 : scene === 'sunset' ? 0.5 : 0);
        const sc = HEAT.steam;
        gl.uniform4f(uni.steamC, sc ? sc[0] / 100 : 0, sc ? sc[1] / 100 : 0, sc ? 0.8 : 0, 0);
        if (tex[5]) { gl.activeTexture(gl.TEXTURE5); gl.bindTexture(gl.TEXTURE_2D, tex[5]); }
      } else gl.uniform4f(uni.steamC, 0, 0, 0, 0);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex[0]);
      if (tex[1]) { gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex[1]); }
      gl.uniform1f(uni.decor, tex[2] && decorFor === scene ? 1 : 0);
      if (tex[2]) { gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, tex[2]); }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    } else if (!gl && currentImg) {
      // No WebGL: the picture as a plain background that slides the same way.
      canvas.style.backgroundImage = `url("${currentImg.src}")`;
      canvas.style.backgroundSize = `${pxW()}px ${pxH()}px`;
      canvas.style.backgroundPosition = `${vw() / 2 - view.cx * pxW()}px ${vh() / 2 - view.cy * pxH()}px`;
      canvas.style.filter = powerNow < 0.5 ? 'brightness(.06)' : motorNow > 0.5 ? 'brightness(.75) sepia(.3)' : '';
    }
    placeHotspots();
  }

  // ------------------------------------------------------------------ hotspots

  const hotLayer = $('hotspots');
  const hotEls = new Map();

  function renderHotspots() {
    hotLayer.replaceChildren(...OBJECTS.filter(o => !hidden.has(o.id)).map(o => {
      const b = el('button', { type: 'button', className: 'hot hot-' + o.id, tabIndex: -1 }, [
        el('span', { className: 'hot-dot' }),
        el('span', { className: 'hot-label', text: r('objects')[o.id] })
      ]);
      b.dataset.id = o.id;
      b.setAttribute('aria-hidden', 'true');
      b.addEventListener('click', e => { e.stopPropagation(); openObject(o.id, true); });
      if (finePointer) {
        b.addEventListener('pointerenter', () => { hoverId = o.id; setFocus(o.id); });
        b.addEventListener('pointerleave', () => { if (hoverId === o.id) { hoverId = null; } });
      }
      hotEls.set(o.id, b);
      return b;
    }));
    needsDraw = true;
  }

  // On touch screens the object nearest the middle of the screen is "in focus": it shows
  // its name and the card at the bottom offers to open it. With a mouse, hovering does it.
  let focusId = null, hoverId = null;
  function placeHotspots() {
    const W = vw(), H = vh();
    const cx = W / 2, cy = H * (innerWidth < 900 && sheetOpen() ? 0.28 : 0.5);
    let best = null, bestD = Math.min(W, H) * 0.3;
    for (const o of OBJECTS) {
      const b = hotEls.get(o.id);
      if (!b || !b.isConnected) continue;
      const p = spot(o.id);
      if (!p) { b.style.visibility = 'hidden'; continue; }
      const s = project(p[0], p[1]);
      if (s.x < -30 || s.x > W + 30 || s.y < -30 || s.y > H + 30) { b.style.visibility = 'hidden'; continue; }
      b.style.visibility = 'visible';
      b.style.transform = `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px)`;
      const d = Math.hypot(s.x - cx, s.y - cy);
      if (d < bestD) { bestD = d; best = o.id; }
    }
    if (finePointer) best = hoverId || focusId;
    if (best !== focusId) setFocus(best);
  }

  function setFocus(id) {
    focusId = id;
    hotEls.forEach((b, k) => b.classList.toggle('is-focus', k === id));
    const card = $('focus-card');
    card.classList.toggle('is-empty', !id);
    $('focus-name').textContent = id ? r('objects')[id] : r('lookAround');
    $('focus-hint').textContent = id ? r('hints')[id] : '';
    card.setAttribute('aria-label', id ? `${r('objects')[id]}: ${r('hints')[id]}. ${r('tapToOpen')}` : r('allObjectsTitle'));
    card.classList.remove('is-new'); void card.offsetWidth; if (id) card.classList.add('is-new');
  }

  // Step to the next object to the left or right (in the room, not in reading order).
  function step(dir) {
    const list = visibleObjects().map(o => ({ id: o.id, u: spot(o.id)[0] })).sort((a, b) => a.u - b.u);
    if (!list.length) return;
    let i = list.findIndex(o => o.id === focusId);
    if (i < 0) {
      const c = view.cx;
      i = dir > 0 ? list.findIndex(o => o.u > c) : list.length - 1 - [...list].reverse().findIndex(o => o.u < c);
      if (i < 0 || i >= list.length) i = dir > 0 ? 0 : list.length - 1;
    } else i = (i + dir + list.length) % list.length;
    const o = list[i];
    hideHint();
    const p = spot(o.id);
    glideTo(viewFor(p[0], p[1], Math.max(view.z, vh() > vw() ? 1 : 1.25)));
    if (finePointer) { hoverId = null; setFocus(o.id); }
  }
  $('focus-prev').addEventListener('click', () => step(document.documentElement.dir === 'rtl' ? 1 : -1));
  $('focus-next').addEventListener('click', () => step(document.documentElement.dir === 'rtl' ? -1 : 1));
  $('focus-card').addEventListener('click', () => { if (focusId) openObject(focusId, true); else openGrid(); });

  // ------------------------------------------------------------------ sliding and zooming

  let dragging = false, moved = 0, lastX = 0, lastY = 0, lastT = 0;
  const pointers = new Map();
  let pinch = null;

  canvas.addEventListener('pointerdown', e => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { canvas.setPointerCapture(e.pointerId); } catch { /* fine */ }
    stopGlide();
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: view.z, at: unproject(mid.x, mid.y) };
      dragging = false;
      return;
    }
    dragging = true; moved = 0;
    lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
    view.vx = view.vy = 0;
  });
  canvas.addEventListener('pointermove', e => {
    if (finePointer && !pointers.size) {
      // hovering with a mouse: light up whatever is under it
      let near = null, nd = 34;
      for (const o of visibleObjects()) {
        const p = spot(o.id), s = project(p[0], p[1]);
        const d = Math.hypot(s.x - e.clientX, s.y - e.clientY);
        if (d < nd) { nd = d; near = o.id; }
      }
      canvas.style.cursor = near ? 'pointer' : '';
      if (near !== hoverId) { hoverId = near; if (near) setFocus(near); }
    }
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && pinch) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      Object.assign(view, viewFor(pinch.at[0], pinch.at[1], pinch.z * d / pinch.d, mid.x, mid.y));
      moved += 20; needsDraw = true;
      return;
    }
    if (!dragging) return;
    const now = performance.now();
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    moved += Math.abs(dx) + Math.abs(dy);
    view.cx -= dx / pxW();
    view.cy -= dy / pxH();
    const dt = Math.max(1, now - lastT);
    view.vx = -dx / pxW() / dt * 16; view.vy = -dy / pxH() / dt * 16;
    lastX = e.clientX; lastY = e.clientY; lastT = now;
    clampView();
    needsDraw = true;
    if (moved > 12) hideHint();
  });
  const endPointer = e => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 1) {               // back to one finger after a pinch: carry on sliding from here
      const p = [...pointers.values()][0];
      lastX = p.x; lastY = p.y; lastT = performance.now(); dragging = true;
    }
    if (pointers.size === 0) {
      dragging = false;
      if (performance.now() - lastT > 80) view.vx = view.vy = 0;
    }
  };
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    stopGlide();
    const at = unproject(e.clientX, e.clientY);
    Object.assign(view, viewFor(at[0], at[1], view.z * Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY));
    needsDraw = true;
  }, { passive: false });
  canvas.addEventListener('dblclick', e => {
    const at = unproject(e.clientX, e.clientY);
    glideTo(viewFor(at[0], at[1], view.z > zMin() * 1.4 ? zMin() : Math.max(1.6, zMin() * 2.2), e.clientX, e.clientY));
  });
  function frameAt(x, y) {
    const fs = FRAMES[scene] || [];
    for (let i = 0; i < fs.length; i++) {
      const f = fs[i], q = (Array.isArray(f[0]) ? f : [[f[0], f[1]], [f[2], f[1]], [f[2], f[3]], [f[0], f[3]]]).map(p => { const n = norm(scene, p); return project(n[0], n[1]); });
      let inside = false;
      for (let a = 0, b = q.length - 1; a < q.length; b = a++) {
        if ((q[a].y > y) !== (q[b].y > y) && x < (q[b].x - q[a].x) * (y - q[a].y) / (q[b].y - q[a].y) + q[a].x) inside = !inside;
      }
      if (inside) return i;
    }
    return -1;
  }
  // Tap on the picture near an object opens it (the dots are small on phones).
  canvas.addEventListener('click', e => {
    if (moved > 8 || introOn) return;
    let near = null, nd = finePointer ? 34 : 30;
    for (const o of visibleObjects()) {
      const p = spot(o.id), s = project(p[0], p[1]);
      const d = Math.hypot(s.x - e.clientX, s.y - e.clientY);
      if (d < nd) { nd = d; near = o.id; }
    }
    if (near && near !== 'photos') { openObject(near, true); return; }
    // a tap inside a picture frame on the wall: what is in it
    const fi = frameAt(e.clientX, e.clientY);
    if (fi >= 0) { document.dispatchEvent(new CustomEvent('sawt:frame-tap', { detail: { i: fi, x: e.clientX, y: e.clientY } })); return; }
    if (near) { openObject(near, true); return; }
    if (sheetOpen() && innerWidth < 900) closeSheet();
  });

  document.addEventListener('keydown', e => {
    if (!document.body.classList.contains('in-room') || sheetOpen() || introOn) return;
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    const k = e.shiftKey ? 0.25 : 0.08;
    if (e.key === 'ArrowLeft') view.cx -= k / view.z;
    else if (e.key === 'ArrowRight') view.cx += k / view.z;
    else if (e.key === 'ArrowUp') view.cy -= k / view.z;
    else if (e.key === 'ArrowDown') view.cy += k / view.z;
    else if (e.key === '+' || e.key === '=') view.z *= 1.2;
    else if (e.key === '-') view.z /= 1.2;
    else return;
    clampView(); needsDraw = true; hideHint();
  });

  // Smooth glide to another view.
  let glide = null;
  function glideTo(to, done) {
    clampView(to);
    if (reduceMotion) { Object.assign(view, to); needsDraw = true; if (done) done(); return; }
    const dist = Math.hypot((to.cx - view.cx) * aspect, to.cy - view.cy) + Math.abs(Math.log(to.z / view.z)) * 0.5;
    glide = { from: { cx: view.cx, cy: view.cy, z: view.z }, to, t0: performance.now(), dur: 500 + Math.min(600, dist * 900), done };
    view.vx = view.vy = 0;
  }
  function stopGlide() { glide = null; }

  // A gentle breath when nobody is touching anything: the room is alive, not a photo.
  let idleSince = performance.now();
  ['pointerdown', 'wheel', 'keydown'].forEach(t => window.addEventListener(t, () => { idleSince = performance.now(); }, { passive: true }));
  let breath = 0;

  function frame(now) {
    if (glide) {
      const k = Math.min(1, (now - glide.t0) / glide.dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const f = glide.from, t = glide.to;
      view.z = Math.exp(Math.log(f.z) + (Math.log(t.z) - Math.log(f.z)) * e);
      view.cx = f.cx + (t.cx - f.cx) * e;
      view.cy = f.cy + (t.cy - f.cy) * e;
      clampView();
      needsDraw = true;
      if (k >= 1) { const d = glide.done; glide = null; if (d) d(); }
    } else if (!dragging && (Math.abs(view.vx) > 1e-5 || Math.abs(view.vy) > 1e-5)) {
      view.cx += view.vx; view.cy += view.vy;
      view.vx *= 0.92; view.vy *= 0.92;
      clampView();
      needsDraw = true;
    }
    if (!reduceMotion && !lite && !introOn && !dragging && !glide && now - idleSince > 7000 && !document.hidden) {
      const target = 0.012 * (0.5 - 0.5 * Math.cos((now - idleSince - 7000) / 9000));
      const prev = breath;
      breath = target;
      view.z = Math.max(zMin(), view.z * (1 + breath) / (1 + prev));
      clampView();
      needsDraw = true;
    } else if (breath) { breath = 0; }
    if (fade) {
      const k = Math.min(1, (now - fade.t0) / 1600);
      mixAmount = k * k * (3 - 2 * k);
      needsDraw = true;
      if (k >= 1) {
        setTexture(0, fade.img);
        mixAmount = 0;
        fade = null;
      }
    }
    // weather: ease the rain in and out; keep drops, steam and lights moving (about 30 fps)
    const target = rainTarget();
    if (Math.abs(rainNow - target) > 0.002) { rainNow += (target - rainNow) * 0.03; needsDraw = true; }
    const st = snowTarget();
    if (Math.abs(snowNow - st) > 0.002) { snowNow += (st - snowNow) * 0.03; needsDraw = true; }
    const animated = !lite && (rainNow > 0.01 || snowNow > 0.01 || scene !== 'day' || (decorFor === scene));
    if (animated && !document.hidden && now - lastRainDraw > 33) { lastRainDraw = now; needsDraw = true; }
    stepPower(now);
    if (frameHooks.size) frameHooks.forEach(f => f(now));
    if (lightning() && rainNow > 0.5 && now > nextFlash && !lite) {
      strike(now); nextFlash = now + 7000 + Math.random() * 16000;
    }
    if (flashQ.length && now >= flashQ[0][0]) { flashNow = Math.max(flashNow, flashQ.shift()[1]); }
    if (flashNow > 0) { flashNow = Math.max(0, flashNow - 0.07); needsDraw = true; }
    if (boltNow.a > 0) { boltNow.a = Math.max(0, boltNow.a - 0.045); needsDraw = true; }
    if (now > nextBirds) {
      nextBirds = now + 45000 + Math.random() * 70000;
      if (scene !== 'night' && rainNow < 0.05 && snowNow < 0.05 && boltSpots.length) {
        const p = boltSpots[Math.floor(Math.random() * boltSpots.length)];
        birdStart = now; birdY = Math.max(0.03, p[1] - 0.05); birdDir = Math.random() < 0.5 ? 1 : -1;
      }
    }
    const alive = !lite && !document.hidden && ((birdStart >= 0 && now - birdStart < 40000) || seasonKind() || scene === 'night' || hotNow());
    if (alive && now - lastRainDraw > 33) { lastRainDraw = now; needsDraw = true; }
    if (HEAT) {
      const needsPower = HEAT.kind === 'electric' || HEAT.kind === 'radiator';
      const ht = heatWanted() && (!needsPower || powerNow > 0.5) ? 1 : 0;
      if (Math.abs(heatNow - ht) > 0.003) { heatNow += (ht - heatNow) * 0.04; needsDraw = true; }
      if (heatNow > 0.01 && !lite && !document.hidden && now - lastRainDraw > 33) { lastRainDraw = now; needsDraw = true; }
    }
    if (needsDraw) { needsDraw = false; draw(); }
    requestAnimationFrame(frame);
  }

  // ------------------------------------------------------------------ weather on the glass
  let snowNow = 0;
  let rainNow = 0, flashNow = 0, lastRainDraw = 0, nextFlash = performance.now() + 4000;
  const flashQ = [];
  // ------------------------------------------------------------------ the heater: lit with rain, snow and cold days, or by a tap
  const HEAT = E.heat || null;
  let heatImg = null, heatImgSet = false, heatNow = 0;
  function todayKey() { return beirutDate(new Date()); }
  function beirutTemp() { const w = S.weather(); const c = w && (w.cities || []).find(x => x.id === 'beirut'); return c && typeof c.temperature === 'number' ? c.temperature : null; }
  function coldNow() {
    const t = beirutTemp(), m = Number(beirutDate(new Date()).slice(5, 7));
    if (t !== null) return t <= 13 || (t <= 16 && scene !== 'day');
    return [12, 1, 2].includes(m) && scene !== 'day';
  }
  function heatAuto() { return isRaining() || isSnowing() || coldNow(); }
  function heatWanted() {
    const m = S.store.get('heatManual', null);
    if (m && m.day === todayKey()) return !!m.on;
    return heatAuto();
  }
  function toggleHeat() {
    const on = !heatWanted();
    S.store.set('heatManual', { on, day: todayKey() });
    document.dispatchEvent(new CustomEvent('sawt:heat-tap', { detail: { on, kind: HEAT ? HEAT.kind : 'fire' } }));
    needsDraw = true;
  }
  function loadHeat() {
    if (!HEAT) return;
    loadImage(BASE + (HEAT.png || 'heat.png')).then(img => { heatImg = img; if (gl) { setTexture(5, img); heatImgSet = true; needsDraw = true; } }).catch(() => {});
  }
  const boltNow = { u: 0, v: 0, seed: 0, a: 0 };
  // where a bolt can show: points of open sky seen through this room's windows
  let maskImg = null, boltSpots = [], moonSpot = null;
  // the real moon: its phase from the date (0 new, 0.5 full)
  function moonPhase(d = new Date()) {
    const days = (d.valueOf() / 864e5) - 10957.5 - 5.597;   // since the new moon of 6 Jan 2000, 18:14 UTC
    return ((days % 29.530588) + 29.530588) % 29.530588 / 29.530588;
  }
  function hotNow() { const t = beirutTemp(); return t !== null && t >= 30 && !isRaining() && !isSnowing(); }
  function seasonKind() {
    const m = Number(beirutDate(new Date()).slice(5, 7));
    if (m === 10 || m === 11) return 1;        // falling leaves
    if (m === 3 || m === 4) return 2;          // blossom
    if (m === 7 || m === 8) return 3;          // summer haze
    return 0;
  }
  // birds now and then, by day and at sunset
  let birdStart = -1, birdY = 0.2, birdDir = 1, nextBirds = performance.now() + 8000;
  function loadMask() {
    loadImage(BASE + 'mask.png').then(img => {
      maskImg = img;
      if (gl) { setTexture(4, img); needsDraw = true; }
      try {
        const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
        const x = c.getContext('2d'); x.drawImage(img, 0, 0);
        const d = x.getImageData(0, 0, c.width, c.height).data, W = c.width, H = c.height, pts = [], any = [];
        for (let y = 2; y < H; y += 3) for (let k = 2; k < W; k += 3) {
          const i = (y * W + k) * 4;
          if (d[i] > 200) { any.push([k / W, y / H]); if (d[i + 1] > 150) pts.push([k / W, y / H]); }
        }
        if (pts.length > 20) {
          boltSpots = pts;
          const top = pts.slice().sort((a, b) => a[1] - b[1]).slice(0, Math.max(3, Math.floor(pts.length * 0.15)));
          const mx = top.reduce((s2, p) => s2 + p[0], 0) / top.length;
          const best = top.reduce((b, p) => (Math.abs(p[0] - mx) < Math.abs(b[0] - mx) ? p : b), top[0]);
          moonSpot = [best[0] + 0.01, best[1] + 0.06];
        }
        else { any.sort((a, b) => a[1] - b[1]); boltSpots = any.slice(0, Math.max(1, Math.floor(any.length * 0.3))); }
      } catch { boltSpots = []; }
    }).catch(() => { maskImg = null; });
  }
  // lightning: a bright double flicker, a bolt in one of the windows, and thunder a moment later
  function strike(now) {
    flashQ.push([now, 1], [now + 110, 0.55], [now + 230, 0.9]);
    if (boltSpots.length && Math.random() < 0.75) {
      const p = boltSpots[Math.floor(Math.random() * boltSpots.length)];
      Object.assign(boltNow, { u: p[0], v: Math.min(0.95, p[1] + 0.08 + Math.random() * 0.25), seed: Math.random() * 100, a: 1.4 });
    }
    const near = Math.random();
    document.dispatchEvent(new CustomEvent('sawt:thunder', { detail: { delay: 0.4 + near * 2.6, power: 1 - near * 0.55 } }));
  }
  const frameHooks = new Set();

  // ------------------------------------------------------------------ "عالموتير": the power cut
  // Now and then the power goes, the room drops dark, and the neighbourhood
  // generator kicks in with its warmer, weaker light. Then the mains come back.
  let powerNow = 1, motorNow = 0, cut = null;
  let cutsOn = S.store.get('powerCuts', false);
  let nextCut = performance.now() + (4 + Math.random() * 5) * 60e3;
  function startCut() {
    if (cut || introOn) return;
    cut = { t0: performance.now(), phase: 'drop' };
    S.toast(r('cutToast'));
  }
  function stepPower(now) {
    if (!cut) {
      if (cutsOn && now > nextCut && !document.hidden) startCut();
      return;
    }
    const t = now - cut.t0;
    needsDraw = true;
    if (cut.phase === 'drop') {                     // flicker, then dark
      powerNow = t < 260 ? (Math.random() < 0.5 ? 1 : 0.2) : 0;
      if (t > 2000) { cut.phase = 'motor'; cut.t0 = now; S.toast(r('motorToast')); }
    } else if (cut.phase === 'motor') {             // the generator coughs into life
      const k = Math.min(1, t / 700);
      powerNow = k < 1 ? k * (0.6 + 0.4 * Math.random()) : 1;
      motorNow = 1;
      if (t > 25000) { cut.phase = 'back'; cut.t0 = now; }
    } else if (cut.phase === 'back') {              // the state electricity returns
      powerNow = t < 300 ? (Math.random() < 0.5 ? 1 : 0.4) : 1;
      motorNow = Math.max(0, 1 - t / 400);
      if (t > 600) {
        cut = null; powerNow = 1; motorNow = 0;
        nextCut = now + (14 + Math.random() * 12) * 60e3;
        S.toast(r('backToast'));
      }
    }
  }
  let weatherMode = S.store.get('weatherMode', 'auto');      // auto | clear | rain | snow
  if (!['auto', 'clear', 'rain', 'snow'].includes(weatherMode)) weatherMode = 'auto';
  let occasion = S.store.get('occasion', 'auto');           // auto | xmas | ramadan | none
  function setWeather(m) { weatherMode = m; S.store.set('weatherMode', m); updateMood(); needsDraw = true; }
  function setOccasion(o) { occasion = o; S.store.set('occasion', o); decorFor = null; loadDecor(); updateMood(); needsDraw = true; }
  function beirutCode() {
    const w = S.weather();
    const c = w && (w.cities || []).find(x => x.id === 'beirut');
    return c ? c.code : null;
  }
  function rainingInBeirut() {
    const code = beirutCode();
    return code !== null && ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95);
  }
  function stormy() { const c = beirutCode(); return weatherMode === 'auto' && c !== null && c >= 95; }
  // lightning with the rain you chose, with real storms, and with heavy rain in Beirut
  function lightning() { const c = beirutCode(); return weatherMode === 'rain' || stormy() || (weatherMode === 'auto' && [65, 67, 81, 82].includes(c)); }
  function isRaining() { return weatherMode === 'rain' || (weatherMode === 'auto' && rainingInBeirut()); }
  function snowingInBeirut() { const c = beirutCode(); return c !== null && ((c >= 71 && c <= 77) || c === 85 || c === 86); }
  // snow: chosen, or Christmas chosen with the weather left to itself, or real snow
  function isSnowing() { return weatherMode === 'snow' || (weatherMode === 'auto' && (occasion === 'xmas' || snowingInBeirut())); }
  function snowTarget() { return isSnowing() ? 0.9 : 0; }
  function rainTarget() {
    if (!isRaining()) return 0;
    const code = beirutCode();
    if (weatherMode === 'rain' || code === null) return 0.85;
    if (code === 51 || code === 56 || code === 61 || code === 80) return 0.55;    // light
    return 0.95;
  }
  let mood = 'clear';
  function updateMood() { const m = moodNow(); if (m !== mood) { mood = m; needsDraw = true; } }

  // ------------------------------------------------------------------ the calendar dresses the room
  let decorFor = null;
  function season(date = new Date()) {
    const forced = new URLSearchParams(location.search).get('decor');
    if (forced) return forced;
    if (occasion === 'none') return null;
    if (occasion === 'xmas' || occasion === 'ramadan') return occasion;
    const d = beirutDate(date), md = d.slice(5);
    const R0 = C.ramadan;
    if (md >= '12-01' || md <= '01-07') return 'xmas';
    if (R0) {
      const end = new Date(Date.parse(R0.end) + 3 * 864e5).toISOString().slice(0, 10);   // and the days of Eid
      if (d >= R0.start && d <= end) return 'ramadan';
    }
    if (md >= '11-15' && md <= '11-23') return 'independence';
    return null;
  }
  // Decorations are drawn here, on the picture itself: lights along the curtain box,
  // lanterns for Ramadan, flags for Independence Day.
  function drawDecor(kind, sc) {
    const W = 1600, H = Math.round(W / (PX[sc][0] / PX[sc][1]));
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    const night = sc !== 'day';
    const [x0, x1, ya, yb] = PELMET[sc];
    const X = v => v / 100 * W, Y = v => v / 100 * H;
    const swags = 3, sag = 3.2;
    const pts = [];
    for (let i = 0; i <= 180; i++) {
      const t = i / 180;
      const x = x0 + (x1 - x0) * t;
      const local = (t * swags) % 1;
      const y = ya + (yb - ya) * t + sag * 4 * local * (1 - local);
      pts.push([X(x), Y(y)]);
    }
    const wire = () => { g.strokeStyle = night ? 'rgba(40,30,20,.85)' : 'rgba(60,50,40,.9)'; g.lineWidth = 1.6; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
    const bulb = (x, y, col, rad = 4.2) => {
      if (night) {
        const gr = g.createRadialGradient(x, y, 0, x, y, rad * 5);
        gr.addColorStop(0, col.replace('1)', '.85)')); gr.addColorStop(1, col.replace('1)', '0)'));
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad * 5, 0, 7); g.fill();
      }
      g.fillStyle = col; g.beginPath(); g.ellipse(x, y + rad * 0.4, rad * 0.75, rad, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(x - rad * 0.2, y, rad * 0.28, 0, 7); g.fill();
    };
    if (kind === 'xmas' || kind === 'ramadan') {
      wire();
      const cols = kind === 'xmas'
        ? ['rgba(255,70,60,1)', 'rgba(80,220,120,1)', 'rgba(255,200,80,1)', 'rgba(90,150,255,1)']
        : ['rgba(255,214,130,1)', 'rgba(255,190,90,1)', 'rgba(255,236,170,1)'];
      for (let i = 4; i < pts.length - 2; i += 7) bulb(pts[i][0], pts[i][1] + 5, cols[(i / 7 | 0) % cols.length]);
    }
    if (kind === 'xmas') {                         // a star where the swags meet in the middle
      const [sx, sy] = [X((x0 + x1) / 2), Y(ya) + 4];
      g.save(); g.translate(sx, sy + 26);
      if (night) { const gr = g.createRadialGradient(0, 0, 0, 0, 0, 60); gr.addColorStop(0, 'rgba(255,220,120,.7)'); gr.addColorStop(1, 'rgba(255,220,120,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 60, 0, 7); g.fill(); }
      g.strokeStyle = 'rgba(80,60,30,.8)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -26); g.lineTo(0, -12); g.stroke();
      g.fillStyle = 'rgba(255,214,90,1)'; g.beginPath();
      for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 - Math.PI / 2, rr = k % 2 ? 6 : 14; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      g.closePath(); g.fill(); g.restore();
    }
    if (kind === 'ramadan') {                      // three lanterns and a crescent
      const lantern = (x, y, s) => {
        g.save(); g.translate(x, y);
        g.strokeStyle = 'rgba(70,50,30,.9)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, -40 * s); g.lineTo(0, -16 * s); g.stroke();
        if (night) { const gr = g.createRadialGradient(0, 6 * s, 0, 0, 6 * s, 48 * s); gr.addColorStop(0, 'rgba(255,190,90,.75)'); gr.addColorStop(1, 'rgba(255,190,90,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 6 * s, 48 * s, 0, 7); g.fill(); }
        g.fillStyle = 'rgba(176,128,52,1)';
        g.beginPath(); g.moveTo(-6 * s, -16 * s); g.lineTo(6 * s, -16 * s); g.lineTo(10 * s, -8 * s); g.lineTo(-10 * s, -8 * s); g.closePath(); g.fill();
        g.fillStyle = night ? 'rgba(255,206,120,1)' : 'rgba(214,160,80,1)';
        g.beginPath(); g.moveTo(-10 * s, -8 * s); g.lineTo(10 * s, -8 * s); g.lineTo(8 * s, 18 * s); g.lineTo(-8 * s, 18 * s); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(150,100,40,1)'; g.lineWidth = 1.4 * s;
        g.beginPath(); g.moveTo(0, -8 * s); g.lineTo(0, 18 * s); g.moveTo(-9 * s, 5 * s); g.lineTo(9 * s, 5 * s); g.stroke();
        g.fillStyle = 'rgba(176,128,52,1)';
        g.beginPath(); g.moveTo(-8 * s, 18 * s); g.lineTo(8 * s, 18 * s); g.lineTo(0, 28 * s); g.closePath(); g.fill();
        g.restore();
      };
      lantern(X(x0 + (x1 - x0) * 0.17), Y(ya + sag) + 50, 1.1);
      lantern(X(x0 + (x1 - x0) * 0.83), Y(yb + sag) + 50, 1.1);
      lantern(X((x0 + x1) / 2), Y((ya + yb) / 2 + sag) + 60, 1.35);
      const [mx, my] = [X(x0 + (x1 - x0) * 0.33), Y(ya + sag * 0.9) + 46];
      g.save(); g.translate(mx, my);
      if (night) { const gr = g.createRadialGradient(0, 0, 0, 0, 0, 40); gr.addColorStop(0, 'rgba(255,230,160,.6)'); gr.addColorStop(1, 'rgba(255,230,160,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 40, 0, 7); g.fill(); }
      g.fillStyle = 'rgba(255,224,140,1)'; g.beginPath(); g.arc(0, 0, 13, 0, 7); g.fill();
      g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(5, -3, 11, 0, 7); g.fill();
      g.restore();
    }
    if (kind === 'independence') {                // bunting: red, white, red, with a little cedar
      g.strokeStyle = 'rgba(70,55,40,.9)'; g.lineWidth = 1.4; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
      for (let i = 3, k = 0; i < pts.length - 6; i += 8, k++) {
        const [ax, ay] = pts[i], [bx, by] = pts[i + 6];
        const mx = (ax + bx) / 2;
        g.fillStyle = k % 3 === 1 ? 'rgba(246,242,232,1)' : 'rgba(214,40,40,1)';
        g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.lineTo(mx, Math.max(ay, by) + 26); g.closePath(); g.fill();
        if (k % 3 === 1) { g.fillStyle = 'rgba(30,140,70,1)'; g.beginPath(); g.moveTo(mx, Math.max(ay, by) + 2); g.lineTo(mx + 6, Math.max(ay, by) + 13); g.lineTo(mx - 6, Math.max(ay, by) + 13); g.closePath(); g.fill(); }
      }
    }
    if (!night) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255,240,215,.08)'; g.fillRect(0, 0, W, H); }
    return cv;
  }
  function loadDecor() {
    const kind = season();
    if (!kind || !gl) { decorFor = null; return; }
    try { setTexture(2, drawDecor(kind, scene)); decorFor = scene; needsDraw = true; } catch { decorFor = null; }
  }
  document.addEventListener('sawt:weather', () => {
    updateMood();
    renderSceneChip(); needsDraw = true;
  });

  // ------------------------------------------------------------------ hint

  const hint = $('drag-hint');
  function showHint() {
    if (S.store.get('lookedAround', false)) return;
    hint.textContent = r('dragHint');
    hint.hidden = false;
  }
  function hideHint() {
    if (hint.hidden) return;
    hint.classList.add('is-gone');
    setTimeout(() => { hint.hidden = true; }, 600);
    S.store.set('lookedAround', true);
  }

  // ================================================================== scenes

  // the time of day: like Beirut now, or the one you chose (remembered)
  const savedScene = S.store.get('sceneChoice', 'auto');
  let scene = SCENES.includes(savedScene) ? savedScene : sceneFor();
  let manualScene = SCENES.includes(savedScene);
  function setSceneChoice(c) {
    S.store.set('sceneChoice', SCENES.includes(c) ? c : 'auto');
    manualScene = SCENES.includes(c);
    const s = manualScene ? c : sceneFor();
    if (s !== scene) showScene(s, true); else renderSceneChip();
  }
  // light mode: a still room (no rain running, no breathing, no twinkling) and the lighter picture
  let lite = S.store.get('liteRoom', false);
  let currentImg = null;
  let fade = null;

  // The light picture comes first; the sharp one replaces it when it arrives.
  async function showScene(name, animate) {
    scene = name;
    updateMood();
    renderSceneChip();
    let img;
    try { img = await loadImage(picUrl(name, true)); }
    catch { return; }
    if (name !== scene) return; // a newer choice won
    const apply = (im, anim) => {
      if (name !== scene) return;
      aspect = im.naturalWidth / im.naturalHeight;
      if (!gl) { currentImg = im; clampView(); needsDraw = true; return; }
      if (im.naturalWidth < 1600 || !tex[3]) setBlur(im);
      if (!currentImg || !anim || reduceMotion) { setTexture(0, im); currentImg = im; fade = null; mixAmount = 0; }
      else { setTexture(1, im); currentImg = im; fade = { img: im, t0: performance.now() }; }
      clampView(); needsDraw = true;
    };
    apply(img, animate);
    loadDecor();
    if (sharp && !lite && (!gl || maxTex >= 3072)) {
      loadImage(picUrl(name, false)).then(big => {
        const go = () => { if (name !== scene) return; if (fade) { setTimeout(go, 200); return; } apply(big, false); };
        go();
      }).catch(() => {});
    }
    if (window.SawtScreen) window.SawtScreen.place();
  }

  const chip = $('scene-chip');
  function renderSceneChip() {
    const now = new Date();
    const wet = isRaining();
    chip.replaceChildren(...[
      el('span', { className: 'scene-dot scene-' + scene }),
      el('span', { className: 'scene-name', text: r('scenes')[scene] }),
      wet ? el('span', { className: 'scene-rain', 'aria-hidden': 'true' }) : null,
      isSnowing() ? el('span', { className: 'scene-snow', 'aria-hidden': 'true', text: '❄' }) : null,
      el('span', { className: 'scene-time', text: `${timeIn(now, 'Asia/Beirut')} · ${r('beirut')}` })
    ].filter(Boolean));
    chip.title = r('sceneManual');
    chip.setAttribute('aria-label', `${r('scenes')[scene]}${wet ? ', ' + r('rainW') : ''}, ${timeIn(now, 'Asia/Beirut')} ${r('beirut')}. ${r('sceneManual')}`);
    chip.setAttribute('aria-expanded', String(!pop.hidden));
    renderPop();
  }
  // the little panel under the chip: choose the time of day and the weather
  const pop = el('div', { className: 'scene-pop', id: 'scene-pop', role: 'dialog', hidden: true });
  chip.after(pop);
  chip.setAttribute('aria-controls', 'scene-pop');
  function opt(label, pressed, onClick, cls) {
    const b = el('button', { type: 'button', className: 'pop-opt' + (cls ? ' ' + cls : ''), text: label });
    b.setAttribute('aria-pressed', String(pressed));
    b.addEventListener('click', e => { e.stopPropagation(); onClick(); renderSceneChip(); });
    return b;
  }
  function renderPop() {
    if (pop.hidden) return;
    pop.replaceChildren(
      el('p', { className: 'pop-k', text: r('timeLabel') }),
      el('div', { className: 'pop-row' }, [
        opt(r('autoBeirut'), !manualScene, () => setSceneChoice('auto'), 'is-auto'),
        ...SCENES.map(sc => opt(r('scenes')[sc], manualScene && scene === sc, () => setSceneChoice(sc), 'scene-opt-' + sc))
      ]),
      el('p', { className: 'pop-k', text: r('weatherLabel') }),
      el('div', { className: 'pop-row' }, [
        opt(r('autoBeirut'), weatherMode === 'auto', () => setWeather('auto'), 'is-auto'),
        opt(r('clearW'), weatherMode === 'clear', () => setWeather('clear')),
        opt(r('rainW'), weatherMode === 'rain', () => { setWeather('rain'); if (window.SawtAmbience && !window.SawtAmbience.on()) window.SawtAmbience.toggle(); nextFlash = performance.now() + 2500; }),
        opt(r('snowW'), weatherMode === 'snow', () => setWeather('snow'))
      ]),
      el('p', { className: 'pop-k', text: r('occLabel') }),
      el('div', { className: 'pop-row' }, [
        opt(r('occAuto'), occasion === 'auto', () => setOccasion('auto'), 'is-auto'),
        opt(r('xmasO'), occasion === 'xmas', () => setOccasion('xmas')),
        opt(r('ramadanO'), occasion === 'ramadan', () => setOccasion('ramadan')),
        opt(r('noneO'), occasion === 'none', () => setOccasion('none')),
        (season() === 'xmas' || season() === 'ramadan') ? opt('🎶 ' + r('feastTape'), false, () => {
          const m = (C.moods || []).find(x => x.id === 'feasts');
          pop.hidden = true;
          if (m && window.SawtScreen) window.SawtScreen.playTape(m);
        }) : null
      ].filter(Boolean)),
      el('p', { className: 'pop-k', text: r('extrasLabel') }),
      el('div', { className: 'pop-row' }, [
        opt('🔊 ' + r('soundsW'), !!(window.SawtAmbience && window.SawtAmbience.on()), () => { if (window.SawtAmbience) window.SawtAmbience.toggle(); }),
        opt('💡 ' + r('cutsW'), cutsOn, () => { cutsOn = !cutsOn; S.store.set('powerCuts', cutsOn); }),
        opt('⚡ ' + r('tryCut'), false, () => { pop.hidden = true; startCut(); })
      ])
    );
  }
  function togglePop(force) {
    pop.hidden = force === undefined ? !pop.hidden : !force;
    renderSceneChip();
    if (!pop.hidden) { const f = pop.querySelector('[aria-pressed="true"]'); if (f) f.focus({ preventScroll: true }); }
  }
  chip.addEventListener('click', e => { e.stopPropagation(); togglePop(); });
  document.addEventListener('click', e => { if (!pop.hidden && !pop.contains(e.target) && e.target !== chip) { pop.hidden = true; renderSceneChip(); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) { pop.hidden = true; renderSceneChip(); chip.focus(); } });
  setInterval(() => {
    renderSceneChip();
    updateMood();
    if (!manualScene) {
      const s = sceneFor();
      if (s !== scene) showScene(s, true);
    }
  }, 30000);

  // ================================================================== the whole room at a glance

  const grid = $('objects');
  function renderGrid() {
    const order = ['radio', 'tv', 'cassettes', 'tawleh', 'atari', 'together', 'phone', 'news', 'expat', 'window', 'calendar', 'clock', 'coffee', 'books', 'photos', 'lamp', 'teta', 'ac'];
    $('objects-grid').replaceChildren(...order.map(id => ({ id })).filter(o => !hidden.has(o.id)).map((o, i) => {
      const img = el('img', { className: 'tile-img', alt: '', loading: 'lazy', decoding: 'async', src: `${BASE}thumb-${o.id}.jpg` });
      img.addEventListener('error', () => img.remove());
      const b = el('button', { type: 'button', className: 'tile' }, [
        img,
        el('span', { className: 'tile-text' }, [
          el('span', { className: 'tile-name', text: r('objects')[o.id] }),
          el('span', { className: 'tile-hint', text: r('hints')[o.id] })
        ])
      ]);
      b.style.setProperty('--i', i);
      b.dataset.id = o.id;
      b.addEventListener('click', () => { closeGrid(false); openObject(o.id, true); });
      return b;
    }));
  }
  function openGrid() {
    if (sheetOpen()) closeSheet();
    grid.hidden = false;
    requestAnimationFrame(() => grid.classList.add('is-open'));
    $('all-btn').setAttribute('aria-expanded', 'true');
    setTimeout(() => $('objects-close').focus({ preventScroll: true }), 30);
  }
  function closeGrid(restore = true) {
    if (grid.hidden) return;
    grid.classList.remove('is-open');
    $('all-btn').setAttribute('aria-expanded', 'false');
    setTimeout(() => { if (!grid.classList.contains('is-open')) grid.hidden = true; }, reduceMotion ? 0 : 250);
    if (restore) $('all-btn').focus({ preventScroll: true });
  }
  $('all-btn').addEventListener('click', () => (grid.hidden ? openGrid() : closeGrid()));
  $('objects-close').addEventListener('click', () => closeGrid());
  grid.addEventListener('click', e => { if (e.target === grid) closeGrid(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !grid.hidden) closeGrid(); });

  // ================================================================== the sheet

  const sheet = $('sheet');
  let openId = null;
  let returnFocus = null;
  let beforeOpen = null;          // where we were looking before a drawer opened
  function sheetOpen() { return !sheet.hidden; }

  // Bring an object into the part of the screen the drawer leaves free, a little closer.
  function lookAtObject(id) {
    const p = spot(id) || (id === 'clock' ? spot('radio') : null);
    if (!p || introOn) return;
    const W = vw(), H = vh();
    let sx = W / 2, sy = H / 2, z = view.z;
    if (innerWidth >= 900) {
      const sheetW = Math.min(460, W * 0.42) + 16;
      sx = W / 2 + (document.documentElement.dir === 'rtl' ? 1 : -1) * sheetW / 2;
      z = Math.max(z, 1.35);
    } else {
      sy = H * 0.26;
      z = Math.max(z, 1.15);
    }
    glideTo(viewFor(p[0], p[1], z, sx, sy));
  }

  function openObject(id, look) {
    if (hidden.has(id)) return;
    if (id === 'teta') { const b = $('simple-btn'); if (b) b.click(); return; }
    if (id === 'ac') { togglePop(true); return; }
    if (id === 'heat') { toggleHeat(); return; }
    if (!pop.hidden) togglePop(false);
    if (!document.querySelector(`.pv[data-panel="${id}"]`)) return;
    returnFocus = document.activeElement;
    if (!openId) beforeOpen = { cx: view.cx, cy: view.cy, z: view.z };
    if (look) lookAtObject(id);
    hideHint();
    openId = id;
    document.querySelectorAll('.pv').forEach(p => { p.hidden = p.dataset.panel !== id; });
    $('sheet-title').textContent = r('objects')[id];
    sheet.dataset.panel = id;
    sheet.hidden = false;
    requestAnimationFrame(() => sheet.classList.add('is-open'));
    document.body.classList.add('sheet-on');
    $('sheet-body').scrollTop = 0;
    hotEls.forEach((b, k) => b.classList.toggle('is-active', k === id));
    if (history.replaceState && !/^\/(d|v|q)\//.test(location.pathname)) history.replaceState(null, '', location.pathname + location.search.replace(/([?&])(t|listen|q)=[^&]*/g, '$1').replace(/[?&]+$/, '') + '#' + id);
    onOpen(id);
    document.dispatchEvent(new CustomEvent('sawt:panel', { detail: id }));
    setTimeout(() => $('sheet-close').focus({ preventScroll: true }), 30);
  }

  function closeSheet() {
    if (!sheetOpen()) return;
    sheet.classList.remove('is-open');
    document.body.classList.remove('sheet-on');
    const was = openId;
    openId = null;
    hotEls.forEach(b => b.classList.remove('is-active'));
    setTimeout(() => { if (!openId) sheet.hidden = true; }, reduceMotion ? 0 : 280);
    if (history.replaceState && !/^\/(d|v|q)\//.test(location.pathname)) history.replaceState(null, '', location.pathname + location.search);
    if (beforeOpen && !(window.SawtScreen && window.SawtScreen.current() && window.SawtScreen.current().onSet)) glideTo(beforeOpen);
    beforeOpen = null;
    if (returnFocus && returnFocus.focus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent('sawt:panel', { detail: null, was }));
  }
  $('sheet-close').addEventListener('click', closeSheet);
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !sheetOpen()) return;
    if (!$('ring').hidden) return;
    closeSheet();
  });

  // Swipe the sheet down to close (phones).
  (() => {
    const head = sheet.querySelector('.sheet-head');
    let y0 = null, dy = 0;
    head.addEventListener('pointerdown', e => { if (innerWidth >= 900 || e.target.closest('button')) return; y0 = e.clientY; dy = 0; head.setPointerCapture(e.pointerId); sheet.style.transition = 'none'; });
    head.addEventListener('pointermove', e => { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); sheet.style.transform = `translateY(${dy}px)`; });
    const end = () => {
      if (y0 === null) return;
      y0 = null; sheet.style.transition = ''; sheet.style.transform = '';
      if (dy > 90) closeSheet();
    };
    head.addEventListener('pointerup', end);
    head.addEventListener('pointercancel', end);
  })();

  document.addEventListener('sawt:open', e => openObject(e.detail, true));
  document.addEventListener('sawt:config', e => {
    const cfg = e.detail || {};
    // without the shared store, written dedications are off; voice notes still go by WhatsApp
    // the public dedications wall and its written form were retired: private rooms do that job now
    document.querySelectorAll('.needs-store').forEach(n => { n.hidden = true; });
    renderHotspots(); renderGrid(); setFocus(null); needsDraw = true;
  });

  function onOpen(id) {
    if (id === 'clock') { renderClocks(); tickAnalog(); }
    if (id === 'news') renderMast();
    if (id === 'calendar') renderCalendar();
    if (id === 'window') renderWindow();
    if (id === 'radio') {
      // The dial measures itself; give it a frame to be visible first.
      requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    }
  }

  // ================================================================== object contents

  // ---- clock: an analog wall clock on Beirut time, and the time where you are
  const SVGNS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs = {}, kids = []) {
    const n = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    kids.forEach(k => n.appendChild(k));
    return n;
  }
  let hands = null;
  function buildAnalog() {
    const face = svg('svg', { viewBox: '-110 -110 220 220', class: 'analog-svg' });
    face.appendChild(svg('circle', { r: 104, class: 'a-rim' }));
    face.appendChild(svg('circle', { r: 96, class: 'a-face' }));
    for (let i = 0; i < 60; i++) {
      const big = i % 5 === 0;
      const a = i * 6 * RAD;
      face.appendChild(svg('line', {
        x1: (Math.sin(a) * (big ? 78 : 84)).toFixed(2), y1: (-Math.cos(a) * (big ? 78 : 84)).toFixed(2),
        x2: (Math.sin(a) * 90).toFixed(2), y2: (-Math.cos(a) * 90).toFixed(2), class: big ? 'a-tick big' : 'a-tick'
      }));
    }
    for (let h = 1; h <= 12; h++) {
      const a = h * 30 * RAD;
      const t = svg('text', { x: (Math.sin(a) * 64).toFixed(2), y: (-Math.cos(a) * 64 + 7).toFixed(2), class: 'a-num' });
      t.textContent = String(h);
      face.appendChild(t);
    }
    const brand = svg('text', { x: 0, y: 34, class: 'a-brand' });
    brand.textContent = 'BEYROUTH';
    face.appendChild(brand);
    hands = {
      h: svg('line', { x1: 0, y1: 12, x2: 0, y2: -48, class: 'a-hand h' }),
      m: svg('line', { x1: 0, y1: 16, x2: 0, y2: -72, class: 'a-hand m' }),
      s: svg('line', { x1: 0, y1: 22, x2: 0, y2: -80, class: 'a-hand s' })
    };
    face.append(hands.h, hands.m, hands.s, svg('circle', { r: 4.5, class: 'a-pin' }));
    $('analog').replaceChildren(face);
  }
  function beirutHMS(d = new Date()) {
    const parts = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Beirut' }).formatToParts(d);
    const g = t => Number(parts.find(p => p.type === t).value);
    return [g('hour'), g('minute'), g('second')];
  }
  let analogTimer = null;
  function tickAnalog() {
    if (!hands) buildAnalog();
    const [h, m, sec] = beirutHMS();
    hands.h.setAttribute('transform', `rotate(${(h % 12) * 30 + m * 0.5})`);
    hands.m.setAttribute('transform', `rotate(${m * 6 + sec * 0.1})`);
    hands.s.setAttribute('transform', `rotate(${sec * 6})`);
    clearTimeout(analogTimer);
    if (openId === 'clock') analogTimer = setTimeout(tickAnalog, 1000 - (Date.now() % 1000));
  }
  function renderClocks() {
    const now = new Date();
    const rows = [[r('beirut'), 'Asia/Beirut']];
    if (!S.sameZoneAsBeirut()) rows.push([r('here'), undefined]);
    $('two-clocks').replaceChildren(...rows.map(([name, tz]) => el('div', { className: 'big-clock' }, [
      el('span', { className: 'big-clock-place', text: name }),
      el('span', { className: 'big-clock-time', text: timeIn(now, tz) })
    ])));
  }
  setInterval(() => { if (openId === 'clock') renderClocks(); }, 15000);

  // ---- window: Lebanon on the evening-news weather map
  const MAP = {"d": "M428 11 L422 12 L421 14 L419 15 L416 21 L418 26 L417 27 L415 34 L411 36 L409 35 L408 37 L404 37 L397 33 L395 35 L394 35 L394 37 L391 36 L390 37 L384 34 L379 33 L373 36 L370 35 L363 34 L358 31 L356 31 L354 35 L348 34 L347 36 L346 36 L344 35 L343 36 L342 35 L340 37 L340 35 L338 34 L337 35 L337 34 L334 35 L333 37 L331 36 L327 37 L327 36 L324 36 L324 34 L318 31 L318 30 L312 31 L312 28 L309 28 L310 30 L308 31 L308 34 L306 35 L310 47 L310 72 L307 79 L302 80 L298 82 L282 99 L278 101 L269 103 L261 102 L252 104 L249 108 L252 116 L255 119 L253 123 L240 132 L227 136 L226 140 L223 143 L223 146 L223 154 L218 164 L211 161 L209 162 L205 165 L203 171 L200 173 L198 177 L200 181 L199 186 L201 190 L199 197 L192 208 L189 232 L193 235 L195 241 L196 253 L194 264 L187 276 L188 282 L195 285 L192 291 L186 292 L182 296 L172 322 L167 325 L163 321 L157 323 L153 322 L137 326 L137 332 L139 337 L141 345 L139 349 L142 358 L140 371 L130 389 L127 406 L120 410 L120 425 L114 428 L113 442 L111 444 L111 451 L107 459 L106 457 L104 457 L103 460 L100 478 L85 496 L77 502 L69 519 L65 535 L62 553 L55 564 L50 576 L46 575 L44 579 L48 583 L52 590 L44 619 L38 620 L32 634 L25 637 L18 643 L18 650 L35 652 L33 653 L36 654 L37 653 L41 652 L41 651 L46 652 L46 655 L47 654 L47 654 L52 653 L54 648 L59 649 L62 651 L76 648 L81 645 L83 648 L86 648 L89 646 L89 648 L90 648 L90 649 L91 650 L90 652 L92 657 L94 657 L96 660 L101 665 L102 665 L103 668 L105 668 L105 666 L107 667 L108 666 L110 669 L109 667 L111 664 L127 662 L131 652 L138 651 L150 652 L150 642 L158 640 L161 636 L158 632 L162 619 L163 610 L162 604 L162 596 L165 594 L166 587 L171 579 L171 572 L178 576 L177 581 L184 587 L191 592 L190 587 L189 586 L190 579 L197 576 L202 578 L208 570 L210 572 L213 569 L215 569 L219 566 L221 564 L220 563 L221 558 L223 556 L226 556 L229 561 L231 557 L247 554 L253 547 L255 547 L256 542 L254 540 L258 529 L264 525 L265 523 L268 523 L268 521 L277 518 L277 517 L278 517 L282 515 L282 512 L283 510 L286 510 L290 508 L290 506 L293 505 L294 507 L295 503 L297 503 L298 500 L299 500 L300 498 L296 486 L295 486 L293 484 L296 480 L298 479 L303 480 L306 473 L308 476 L312 476 L315 473 L320 479 L331 462 L333 461 L331 459 L330 454 L330 451 L321 445 L319 445 L317 442 L315 442 L305 439 L299 441 L297 440 L296 434 L294 431 L295 427 L297 425 L298 419 L305 418 L307 411 L305 408 L307 396 L310 398 L312 396 L316 390 L316 387 L320 383 L322 385 L327 382 L328 379 L331 375 L336 363 L345 362 L352 359 L355 355 L358 355 L361 354 L364 357 L379 351 L382 355 L386 357 L388 359 L392 360 L395 357 L395 350 L398 346 L409 349 L413 352 L418 352 L421 356 L441 360 L444 359 L446 357 L446 347 L439 342 L438 338 L427 338 L425 336 L424 334 L422 334 L421 330 L417 328 L415 329 L413 326 L410 326 L409 325 L408 327 L407 325 L408 321 L416 316 L416 311 L422 311 L426 300 L433 294 L436 295 L438 290 L442 287 L446 288 L448 286 L444 281 L445 277 L451 277 L449 272 L451 270 L457 272 L456 267 L472 271 L475 273 L478 268 L482 269 L481 266 L487 259 L484 251 L491 242 L499 236 L504 235 L506 225 L509 224 L512 214 L522 210 L523 206 L516 200 L509 197 L512 179 L509 175 L511 173 L513 175 L516 171 L514 166 L511 164 L507 165 L502 162 L503 157 L498 155 L494 142 L491 140 L500 132 L501 124 L493 117 L493 116 L491 115 L490 117 L489 114 L487 113 L487 114 L486 112 L485 112 L486 110 L484 108 L481 109 L477 105 L470 103 L468 96 L465 96 L464 86 L456 88 L452 86 L450 87 L444 89 L443 87 L437 89 L427 87 L427 78 L435 76 L446 71 L453 65 L449 59 L449 50 L451 48 L450 47 L451 44 L457 46 L459 51 L466 52 L468 49 L469 35 L469 34 L466 35 L464 37 L459 39 L455 39 L449 33 L446 36 L443 35 L436 29 L432 23 L434 15 L430 12 L429 12 L428 11Z", "cities": {"beirut": [150, 330], "tripoli": [266, 113], "saida": [106, 463], "sour": [51, 580], "zahle": [283, 349], "jounieh": [189, 296], "baalbek": [386, 286], "nabatieh": [144, 537]}, "box": [8, 1, 525, 678]};
  function renderWindow() {
    const w = S.weather();
    const cities = (w && w.cities) || [];
    const lang = S.lang();
    const names = { ar: { beirut: 'بيروت', tripoli: 'طرابلس', saida: 'صيدا', sour: 'صور', zahle: 'زحلة', jounieh: 'جونية', baalbek: 'بعلبك', nabatieh: 'النبطية' },
      en: { beirut: 'Beirut', tripoli: 'Tripoli', saida: 'Saida', sour: 'Tyre', zahle: 'Zahle', jounieh: 'Jounieh', baalbek: 'Baalbek', nabatieh: 'Nabatieh' },
      fr: { beirut: 'Beyrouth', tripoli: 'Tripoli', saida: 'Saïda', sour: 'Tyr', zahle: 'Zahlé', jounieh: 'Jounieh', baalbek: 'Baalbek', nabatieh: 'Nabatieh' } }[lang];
    const [bx, by, bw, bh] = MAP.box;
    const map = svg('svg', { viewBox: `${bx - 150} ${by - 10} ${bw + 290} ${bh + 20}`, class: 'lb-svg', direction: 'ltr', role: 'img', 'aria-label': r('objects').window });
    const sea = svg('text', { x: bx - 80, y: by + bh * 0.55, class: 'lb-sea', transform: `rotate(-62 ${bx - 80} ${by + bh * 0.55})` });
    sea.textContent = r('sea');
    map.append(sea, svg('path', { d: MAP.d, class: 'lb-land' }));
    const right = { tripoli: 1, baalbek: 1, zahle: 1, jounieh: 1, nabatieh: 1 };
    for (const c of cities) {
      const pt = MAP.cities[c.id];
      if (!pt) continue;
      const [x, y] = pt;
      const g = svg('g', { class: 'lb-city' + (c.id === 'beirut' ? ' is-capital' : '') });
      g.appendChild(svg('circle', { cx: x, cy: y, r: c.id === 'beirut' ? 9 : 7 }));
      const t = svg('text', { x: x + (right[c.id] ? 16 : -16), y: y + 9, class: 'lb-temp', 'text-anchor': right[c.id] ? 'start' : 'end' });
      t.textContent = `${S.num(c.temperature)}°`;
      const n = svg('text', { x: x + (right[c.id] ? 16 : -16), y: y - 16, class: 'lb-name', 'text-anchor': right[c.id] ? 'start' : 'end' });
      n.textContent = names[c.id] || c.id;
      g.append(n, t);
      map.appendChild(g);
    }
    $('lb-map').replaceChildren(map);
    $('lb-map').hidden = !cities.length;
    const box = $('window-now');
    const c = cities.find(x => x.id === 'beirut');
    box.textContent = c ? r('nowOutside', S.weatherWord(c.code), S.num(c.temperature)) : '';
    box.hidden = !c;
  }
  document.addEventListener('sawt:weather', () => { if (openId === 'window') renderWindow(); });

  // ---- newspaper masthead
  function renderMast() {
    $('mast-date').textContent = new Intl.DateTimeFormat(S.locale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Beirut' }).format(new Date());
  }

  // ---- calendar: the tear-off calendar from the kitchen door, brought to the salon
  const LB_MONTHS = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];
  let tearAt = 0;
  function calendarPages() {
    const today = beirutDate(new Date());
    const list = (C.occasions || []).filter(o => o.date >= today).slice(0, 8);
    const pages = [{ date: today, occ: list.find(o => o.date === today) || null }];
    for (const o of list) if (o.date !== today) pages.push({ date: o.date, occ: o });
    return pages;
  }
  function pageEl(pg, isToday) {
    const lang = S.lang();
    const d = new Date(pg.date + 'T12:00:00Z');
    const loc = S.locale();
    const month = lang === 'ar' ? LB_MONTHS[d.getUTCMonth()] : new Intl.DateTimeFormat(loc, { month: 'long', timeZone: 'UTC' }).format(d);
    const other = lang === 'ar' ? new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC' }).format(d) : '';
    let hijri = '';
    try { hijri = new Intl.DateTimeFormat(loc + '-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d); } catch { /* old browsers */ }
    const weekday = new Intl.DateTimeFormat(loc, { weekday: 'long', timeZone: 'UTC' }).format(d);
    const n = Math.round((Date.parse(pg.date) - Date.parse(beirutDate(new Date()))) / 864e5);
    const sunday = d.getUTCDay() === 0;
    return el('div', { className: 'tear-page' + (sunday || pg.occ ? ' is-red' : '') }, [
      el('div', { className: 'tear-rings', 'aria-hidden': 'true' }, [el('i'), el('i'), el('i'), el('i'), el('i'), el('i')]),
      el('div', { className: 'tear-head' }, [
        el('span', { className: 'tear-month', text: month }),
        other ? el('span', { className: 'tear-month-2', text: other, lang: 'en' }) : null,
        el('span', { className: 'tear-year', text: new Intl.NumberFormat(loc, { useGrouping: false }).format(d.getUTCFullYear()) })
      ]),
      el('div', { className: 'tear-day', text: S.num(d.getUTCDate()) }),
      el('div', { className: 'tear-week', text: weekday }),
      el('div', { className: 'tear-foot' }, [
        el('span', { className: 'tear-occ', text: pg.occ ? (pg.occ[lang] || pg.occ.en) + (pg.occ.approx ? ' *' : '') : '' }),
        el('span', { className: 'tear-when', text: isToday ? '' : r('daysLeft', n) }),
        el('span', { className: 'tear-hijri', text: hijri })
      ])
    ]);
  }
  function renderTear() {
    const pages = calendarPages();
    if (tearAt >= pages.length) tearAt = 0;
    const box = $('tear');
    const btn = el('button', { type: 'button', className: 'tear-btn', text: tearAt === pages.length - 1 ? r('tearBack') : r('tearNext') });
    const under = pages[(tearAt + 1) % pages.length];
    const stack = el('div', { className: 'tear-stack' }, [
      pageEl(under, (tearAt + 1) % pages.length === 0),
      pageEl(pages[tearAt], tearAt === 0)
    ]);
    stack.lastChild.classList.add('is-top');
    btn.addEventListener('click', () => {
      const top = stack.querySelector('.is-top');
      tearAt = (tearAt + 1) % pages.length;
      if (reduceMotion) { renderTear(); return; }
      top.classList.add('is-torn');
      setTimeout(renderTear, 650);
    });
    stack.addEventListener('click', e => { if (!e.target.closest('button')) btn.click(); });
    box.replaceChildren(stack, btn);
  }
  function renderCalendar() {
    renderTear();
    const now = new Date();
    const times = sunTimes(now);
    const today = beirutDate(now);
    const R0 = C.ramadan;
    const inRamadan = R0 && today >= R0.start && today <= R0.end;
    $('sun-today').replaceChildren(
      el('div', { className: 'sun-cell' }, [el('span', { className: 'sun-k', text: r('sunrise') }), el('b', { text: times.rise ? timeIn(times.rise, 'Asia/Beirut') : '–' })]),
      el('div', { className: 'sun-cell' }, [el('span', { className: 'sun-k', text: inRamadan ? r('iftar') : r('sunset') }), el('b', { text: times.set ? timeIn(times.set, 'Asia/Beirut') : '–' })])
    );
    const lang = S.lang();
    const fmt = new Intl.DateTimeFormat(S.locale(), { day: 'numeric', month: 'long', timeZone: 'UTC' });
    const t0 = Date.parse(today + 'T00:00:00Z');
    const list = (C.occasions || []).filter(o => o.date >= today).slice(0, 8);
    $('occasions').replaceChildren(...list.map(o => {
      const d = Date.parse(o.date + 'T00:00:00Z');
      const n = Math.round((d - t0) / 864e5);
      return el('li', { className: 'occasion' + (n === 0 ? ' is-today' : '') }, [
        el('span', { className: 'occ-date', text: fmt.format(new Date(d)) + (o.approx ? ' *' : '') }),
        el('span', { className: 'occ-name', text: o[lang] || o.en }),
        el('span', { className: 'occ-when', text: r('daysLeft', n) })
      ]);
    }));
  }

  // ---- coffee cup
  const cup = $('cup');
  $('cup-btn').addEventListener('click', () => {
    const c = C.coffee;
    if (!c) return;
    const lang = S.lang();
    cup.classList.remove('is-flipped');
    void cup.offsetWidth;
    cup.classList.add('is-flipped');
    const pool = [...c.symbols];
    const picks = [];
    for (let i = 0; i < 3 && pool.length; i++) picks.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    const wishes = c.wishes[lang] || c.wishes.en;
    const box = $('reading');
    box.hidden = true;
    setTimeout(() => {
      box.replaceChildren(
        el('p', { className: 'reading-k', text: r('coffeeSee') }),
        el('ul', { className: 'reading-list' }, picks.map(s => el('li', {}, [el('b', { text: s[lang] || s.en }), document.createTextNode(' · ' + (s.mean[lang] || s.mean.en))]))),
        el('p', { className: 'reading-wish', text: wishes[Math.floor(Math.random() * wishes.length)] })
      );
      box.hidden = false;
      $('cup-btn').textContent = r('coffeeAgain');
    }, reduceMotion ? 0 : 900);
  });

  // ---- Teta's recipes
  let recipeId = (C.recipes && C.recipes[0] && C.recipes[0].id) || null;
  function renderRecipes() {
    if (!$('recipe-tabs') || window.SawtCook) return;     // the cookbook (cook.js) draws this drawer
    const list = C.recipes || [];
    const lang = S.lang();
    $('recipe-tabs').replaceChildren(...list.map(rc => {
      const b = el('button', { type: 'button', className: 'chip', role: 'tab', text: rc.title[lang] || rc.title.en });
      b.setAttribute('aria-selected', String(rc.id === recipeId));
      b.addEventListener('click', () => { recipeId = rc.id; renderRecipes(); });
      return b;
    }));
    const rc = list.find(x => x.id === recipeId);
    if (!rc) return;
    $('recipe').replaceChildren(
      el('h3', { className: 'recipe-title', text: rc.title[lang] || rc.title.en }),
      el('p', { className: 'recipe-meta', text: `${r('serves', rc.serves)} · ${r('minutes', rc.time)}` }),
      el('h4', { text: r('ingredients') }),
      el('ul', { className: 'recipe-ing' }, (rc.ingredients[lang] || rc.ingredients.en).map(x => el('li', { text: x }))),
      el('h4', { text: r('method') }),
      el('ol', { className: 'recipe-steps' }, (rc.steps[lang] || rc.steps.en).map(x => el('li', { text: x })))
    );
  }

  // ---- the cassette shelf
  function renderTapes() {
    const lang = S.lang();
    const playing = window.SawtScreen && window.SawtScreen.current();
    $('tapes').replaceChildren(...(C.moods || []).map(m => {
      const b = el('button', { type: 'button', className: 'tape' + (playing && playing.mood && playing.mood.id === m.id ? ' is-playing' : '') }, [
        el('span', { className: 'tape-shell' }, [
          el('span', { className: 'tape-label' }, [
            el('span', { className: 'tape-title', text: m[lang] || m.en }),
            el('span', { className: 'tape-who', text: m.who, dir: 'ltr' })
          ]),
          el('span', { className: 'tape-window' }, [el('i'), el('i')])
        ]),
        el('span', { className: 'tape-cta', text: r('playOnSpotify') })
      ]);
      b.dataset.id = m.id;
      b.style.setProperty('--c1', m.colors[0]);
      b.style.setProperty('--c2', m.colors[1]);
      b.addEventListener('click', () => { if (window.SawtScreen) window.SawtScreen.playTape(m); });
      return b;
    }));
  }

  // ================================================================== walk-in

  const intro = $('intro');
  let introOn = true;

  function enterRoom() {
    if (!introOn) return;
    if (window.SawtMe && window.SawtMe.needName()) { intro.classList.remove('is-quick'); window.SawtMe.focusName(); return; }
    introOn = false;
    S.store.set('visited', true);
    if (erasReady().length > 1) S.store.set('eraPicked', true);   // coming in keeps the room on show
    intro.classList.add('is-leaving');
    document.body.classList.remove('intro-on');
    setTimeout(() => { intro.hidden = true; }, reduceMotion ? 0 : 1300);
    setTimeout(showHint, 1400);
    const target = deepLink();
    if (target) setTimeout(() => openObject(target, true), reduceMotion ? 0 : 900);
    document.dispatchEvent(new CustomEvent('sawt:entered'));
  }
  $('intro-btn').addEventListener('click', enterRoom);

  function deepLink() {
    const q = new URLSearchParams(location.search);
    if (/^\/s\//.test(location.pathname)) return 'radio';
    if (/^\/d\//.test(location.pathname) || q.get('dedication')) return 'photos';
    if (/^\/v\//.test(location.pathname)) return 'phone';
    if (/^\/q\//.test(location.pathname) || q.get('listen')) return 'together';
    if (q.get('t')) return 'tawleh';
    const h = location.hash.slice(1);
    if (OBJECTS.some(o => o.id === h) && !ACTION_ONLY[h]) return h;
    const legacy = { set: 'radio', classics: 'cassettes', dedications: 'phone' };
    if (legacy[h]) return legacy[h];
    if (q.get('station')) return 'radio';
    return null;
  }

  // ================================================================== language

  function applyRoomLanguage() {
    document.querySelectorAll('[data-r]').forEach(n => { n.textContent = r(n.dataset.r); });
    document.querySelectorAll('[data-r-label]').forEach(n => n.setAttribute('aria-label', r(n.dataset.rLabel)));
    if (era !== '90s') { const sub = document.querySelector('.intro-sub'); const t = r('eraSub')[decadeOf(era)]; if (sub && t) sub.textContent = t; }
    renderEraDoor();
    if (openId) $('sheet-title').textContent = r('objects')[openId];
    renderSceneChip();
    renderHotspots();
    renderGrid();
    setFocus(focusId);
    renderTapes();
    renderRecipes();
    if (openId) onOpen(openId);
    const credits = $('credits');
    if (credits) credits.textContent = r('credits');
  }
  document.addEventListener('sawt:lang', applyRoomLanguage);

  // ================================================================== start

  function start() {
    document.body.classList.add('intro-on');
    document.body.classList.toggle('is-lite', lite);
    initGL();
    loadMask();
    loadHeat();
    Object.assign(view, startView());
    resize();
    window.addEventListener('resize', resize);
    applyRoomLanguage();
    requestAnimationFrame(frame);

    const img = $('intro-img');
    img.src = picUrl(scene, true);

    const ready = showScene(scene, false).then(() => { Object.assign(view, startView()); needsDraw = true; });
    // Teta's radio icon (/radio): no door, no names, just the radio
    if (location.pathname.replace(/\/+$/, '') === '/radio') { introOn = false; intro.hidden = true; document.body.classList.remove('intro-on'); return; }
    let picked = false; try { picked = !!sessionStorage.getItem('sawt:chosen'); } catch { /* fine */ }
    renderEraDoor();
    const askEra = erasReady().length > 1 && !S.store.get('eraPicked', false);
    const fast = !askEra && (S.store.get('visited', false) || deepLink() || picked);
    if (fast) {
      intro.classList.add('is-quick');
      Promise.race([ready, new Promise(res => setTimeout(res, 2500))]).then(() => {
        // a new visit: the door asks who's coming in (one tap); after switching person, straight in
        if (window.SawtMe && window.SawtMe.stopAtDoor()) { intro.classList.remove('is-quick'); return; }
        setTimeout(enterRoom, reduceMotion ? 0 : 400);
      });
    }
  }

  // the door: which salon? (only when more than one era's photos are in)
  function renderEraDoor() {
    let row = document.querySelector('.intro-era');
    if (erasReady().length < 2) { if (row) row.remove(); return; }
    if (!row) {
      row = el('div', { className: 'intro-era' });
      const sub = document.querySelector('.intro-sub');
      if (sub) sub.after(row);
    }
    const label = el('p', { className: 'intro-who-t', text: r('eraAsk') });
    const here = decadeOf(era);
    const cards = el('div', { className: 'intro-era-row', role: 'group' }, decadesReady().map(d => {
      const id = eraReady(d + (isHouse(era) ? 'h' : '')) ? d + (isHouse(era) ? 'h' : '') : homesOf(d)[0];
      const base = id === '90s' ? '/room/' : (ERA_DATA[id].base || '/room/');
      const b = el('button', { type: 'button', className: 'intro-era-b' + (d === here ? ' is-on' : ''), style: `background-image:url('${base}day-s.jpg')` }, [el('span', { text: r('eras')[d] })]);
      b.setAttribute('aria-pressed', String(d === here));
      b.addEventListener('click', () => { if (d === here) { S.store.set('eraPicked', true); renderEraDoor(); } else pickEra(d); });
      return b;
    }));
    const kids = [label, cards];
    const homes = homesOf(here);
    if (homes.length > 1) {
      kids.push(el('div', { className: 'intro-home', role: 'group' }, homes.map(id => {
        const b = el('button', { type: 'button', className: 'chip intro-home-b', text: r('homes')[isHouse(id) ? 'house' : 'apt'] });
        b.setAttribute('aria-pressed', String(id === era));
        b.addEventListener('click', () => { if (id === era) { S.store.set('eraPicked', true); renderEraDoor(); } else setEra(id); });
        return b;
      })));
    }
    row.replaceChildren(...kids);
  }

  // ------------------------------------------------------------------ shared with music.js / home.js / the games
  // CSS matrix3d that maps a w×h box onto any four screen points (tl, tr, br, bl)
  function quadTransform(w, h, q) {
    const src = [[0, 0], [w, 0], [w, h], [0, h]];
    const A = [], B = [];
    for (let i = 0; i < 4; i++) {
      const [x, y] = src[i], [X, Y] = q[i];
      A.push([x, y, 1, 0, 0, 0, -X * x, -X * y]); B.push(X);
      A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y]); B.push(Y);
    }
    // Gaussian elimination
    for (let c = 0; c < 8; c++) {
      let m = c; for (let r2 = c + 1; r2 < 8; r2++) if (Math.abs(A[r2][c]) > Math.abs(A[m][c])) m = r2;
      [A[c], A[m]] = [A[m], A[c]]; [B[c], B[m]] = [B[m], B[c]];
      for (let r2 = c + 1; r2 < 8; r2++) {
        const k = A[r2][c] / A[c][c];
        for (let j = c; j < 8; j++) A[r2][j] -= k * A[c][j];
        B[r2] -= k * B[c];
      }
    }
    const X = new Array(8);
    for (let i = 7; i >= 0; i--) { let sum = B[i]; for (let j = i + 1; j < 8; j++) sum -= A[i][j] * X[j]; X[i] = sum / A[i][i]; }
    const [a, b, c, d, e, f2, g, h2] = X;
    return `matrix3d(${a},${d},0,${g},${b},${e},0,${h2},0,0,1,0,${c},${f2},0,1)`;
  }
  // order four projected points as tl, tr, br, bl on screen
  function orderQuad(pts) {
    const byY = [...pts].sort((p, q) => p.y - q.y);
    const top = byY.slice(0, 2).sort((p, q) => p.x - q.x), bot = byY.slice(2).sort((p, q) => p.x - q.x);
    return [top[0], top[1], bot[1], bot[0]].map(p => [p.x, p.y]);
  }
  // Zoom so the TV is big enough to play a picture on it (YouTube needs 200 px at least).
  function focusTv() {
    const c = TV[scene].map(p => norm(scene, p));
    const u = (c[0][0] + c[1][0]) / 2, v = (c[0][1] + c[3][1]) / 2;
    const w = c[1][0] - c[0][0], h = c[3][1] - c[0][1];
    const wantW = Math.min(vw() * 0.86, Math.max(300, vw() * 0.46));
    const z = Math.max(wantW / (w * aspect * baseScale()), 215 / (h * baseScale()), view.z);
    glideTo(viewFor(u, v, Math.min(ZMAX, z)));
  }
  window.SawtRoom = {
    project, quadTransform, orderQuad,
    tvCorners: () => TV[scene].map(p => norm(scene, p)),
    photoFrames: () => FRAMES[scene].map(f => (Array.isArray(f[0]) ? f : [[f[0], f[1]], [f[2], f[1]], [f[2], f[3]], [f[0], f[3]]]).map(p => norm(scene, p))),
    scene: () => scene,
    mood: () => mood,
    rain: () => rainNow,
    snow: () => snowNow,
    motor: () => motorNow,
    power: () => powerNow,
    onFrame: f => frameHooks.add(f),
    offFrame: f => frameHooks.delete(f),
    redraw: () => { needsDraw = true; },
    open: id => openObject(id, true),
    close: closeSheet,
    focusTv,
    isOpen: () => openId,
    inRoom: () => !introOn,
    sceneLabel: sc => r('scenes')[sc || scene],
    // for the settings panel
    cuts: () => cutsOn,
    setCuts: v => { cutsOn = !!v; S.store.set('powerCuts', cutsOn); renderPop(); },
    sceneChoice: () => (manualScene ? scene : 'auto'),
    setSceneChoice,
    lite: () => lite,
    setLite: v => { lite = !!v; S.store.set('liteRoom', lite); breath = 0; needsDraw = true; document.body.classList.toggle('is-lite', lite); },
    openWeather: () => { setTimeout(() => togglePop(true), 60); },
    era: () => era,
    strike: () => strike(performance.now()),
    heat: () => ({ on: heatNow > 0.5, level: heatNow, kind: HEAT ? HEAT.kind : null }),
    summer: () => (hotNow() ? 1 : 0),
    toggleHeat,
    eras: erasReady,
    decades: decadesReady,
    decade: () => decadeOf(era),
    homes: () => homesOf(decadeOf(era)).map(id => [id, r('homes')[isHouse(id) ? 'house' : 'apt']]),
    eraLabel: id => r('eras')[decadeOf(id || era)],
    pickEra,
    setEra
  };

  start();
})();

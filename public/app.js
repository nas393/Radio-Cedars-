/* Sawt el Beit (صوت البيت) — Lebanese radio, news and TV for Lebanese abroad. */
(() => {
  'use strict';

  // ================================================================== text

  const CITY_NAMES = {
    ar: { beirut: 'بيروت', tripoli: 'طرابلس', saida: 'صيدا', sour: 'صور', zahle: 'زحلة', jounieh: 'جونية', baalbek: 'بعلبك', nabatieh: 'النبطية' },
    en: { beirut: 'Beirut', tripoli: 'Tripoli', saida: 'Saida', sour: 'Tyre', zahle: 'Zahle', jounieh: 'Jounieh', baalbek: 'Baalbek', nabatieh: 'Nabatieh' },
    fr: { beirut: 'Beyrouth', tripoli: 'Tripoli', saida: 'Saïda', sour: 'Tyr', zahle: 'Zahlé', jounieh: 'Jounieh', baalbek: 'Baalbek', nabatieh: 'Nabatieh' }
  };

  const STRINGS = {
    ar: {
      brand: 'صوت البيت',
      title: 'صوت البيت · راديو لبنان وأخبار لبنان',
      skipToNews: 'انتقل إلى الأخبار',
      language: 'اللغة',
      beirut: 'بيروت',
      yourTime: 'عندك',
      radioHeading: 'صوت البيت: راديو لبنان',
      morning: 'صباح الخير. فيروز الصبح؟',
      morningAction: 'شغّل فيروز',
      stations: 'المحطات',
      loadingStations: 'جاري تحميل المحطات…',
      dialHint: 'اسحب المؤشر لتغيير المحطة',
      filterStations: 'تصفية المحطات',
      filterAll: 'كل المحطات',
      filterFav: 'المفضلة',
      filterFairuz: 'فيروز',
      searchLabel: 'ابحث عن محطة',
      searchPlaceholder: 'ابحث عن محطة',
      share: 'شارك المحطة',
      sleep: 'مؤقت النوم',
      sleepTitle: 'أطفئ الراديو بعد:',
      sleepOff: 'بلا مؤقت',
      minutes: n => `${n} دقيقة`,
      sleepLeft: time => `يتوقف بعد ${time}`,
      sleepSet: n => `الراديو يتوقف بعد ${n} دقيقة.`,
      sleepCleared: 'أُلغي مؤقت النوم.',
      alarm: 'منبّه الصباح',
      alarmOn: time => `المنبّه ${time}`,
      alarmTitle: 'أيقظني على المحطة المختارة الآن.',
      alarmTime: 'الساعة',
      alarmSet: 'اضبط المنبّه',
      alarmCancel: 'ألغِ المنبّه',
      alarmNote: 'اترك هذه الصفحة مفتوحة والجهاز على الشاحن. الشاشة تبقى مضاءة حتى يرنّ المنبّه. على الآيفون لا يعمل والشاشة مقفلة.',
      alarmSaved: (time, name) => `المنبّه مضبوط على ${time} مع ${name}.`,
      alarmCleared: 'أُلغي المنبّه.',
      ringTitle: 'صباح الخير',
      ringPlay: 'شغّل الراديو',
      ringSnooze: 'غفوة ١٠ دقائق',
      ringStop: 'أنا صاحي',
      snoozed: 'المنبّه يرنّ مجدداً بعد ١٠ دقائق.',
      newsHeading: 'أخبار من لبنان',
      refresh: 'تحديث',
      loadingNews: 'جاري تحميل الأخبار…',
      tvHeading: 'تلفزيون مباشر',
      tvNote: 'يفتح البث المباشر على يوتيوب.',
      watchLive: 'شاهد مباشر',
      weatherHeading: 'الطقس في لبنان',
      highLow: (hi, lo) => `العظمى ${hi}° والصغرى ${lo}°`,
      footer: 'صوت البيت مجاني. المحطات من دليل Radio Browser، والأخبار تتجدد كل ١٠ دقائق.',
      play: 'تشغيل',
      stop: 'إيقاف',
      prevStation: 'المحطة السابقة',
      nextStation: 'المحطة التالية',
      addFav: 'أضف إلى المفضلة',
      removeFav: 'أزل من المفضلة',
      pressPlay: 'اضغط تشغيل للاستماع',
      connecting: 'جاري الاتصال…',
      live: 'مباشر الآن',
      stationDown: 'هذه المحطة لا تبث الآن. جرّب المحطة التالية.',
      stationsFailed: 'تعذّر تحميل المحطات. أعد تحميل الصفحة بعد قليل.',
      noFavs: 'لا مفضلة بعد. اضغط ★ على أي محطة لإضافتها.',
      noFairuz: 'لا توجد محطة فيروز تبث الآن.',
      noResults: 'لا محطة بهذا الاسم. جرّب اسماً آخر.',
      newsFailed: 'تعذّر تحميل الأخبار. اضغط تحديث للمحاولة مجدداً.',
      sourceDown: 'هذا المصدر لا يستجيب الآن. جرّب مصدراً آخر.',
      noHeadlines: 'لا عناوين جديدة من هذا المصدر.',
      updated: 'آخر تحديث',
      updateFailed: 'لم يتم التحديث. الأخبار المعروضة أقدم.',
      shareText: name => `اسمع ${name} على صوت البيت 📻🇱🇧`,
      linkCopied: 'نُسخ الرابط. الصقه في واتساب أو أي محادثة.',
      shareFailed: 'لم يُنسخ الرابط. انسخه من شريط العنوان.',
      sharedStation: name => `${name} بانتظارك. اضغط تشغيل.`,
      mediaArtist: 'صوت البيت · راديو لبنان',
      skipToContent: 'انتقل إلى المحتوى',
      sectionsNav: 'أقسام الصفحة',
      navClassics: 'الزمن الجميل',
      navDedications: 'الإهداءات',
      navNews: 'الأخبار',
      navTv: 'التلفزيون والطقس',
      classicsHeading: 'الزمن الجميل',
      classicsLede: 'فيروز، وديع الصافي، صباح وزكي ناصيف، على حسب المزاج.',
      moodTune: 'شغّل الراديو على هالجو',
      dedicateSong: 'أهدِها',
      dedHeading: 'إهداءات للبيت',
      dedLede: 'أغنية ورسالة من الغربة لأهلك في لبنان. كل إهداء يُراجع قبل ما ينشر.',
      dedFormTitle: 'أرسل إهداء',
      dedFromName: 'اسمك',
      dedFromPlace: 'وين ساكن؟',
      dedFromPlaceHint: 'مثلاً: مونتريال',
      dedToName: 'لمين الإهداء؟',
      dedToNameHint: 'مثلاً: تيتا',
      dedToPlace: 'بأيّ ضيعة أو مدينة؟',
      dedToPlaceHint: 'مثلاً: زحلة',
      dedSong: 'الأغنية',
      dedSongHint: 'اختر من الزمن الجميل أو اكتب اسم أغنية',
      dedMessage: 'رسالتك',
      dedMessageHint: 'اشتقتلكن…',
      dedRules: 'بدون روابط أو أرقام هواتف. بيظهر الإهداء بعد الموافقة عليه.',
      dedSubmit: 'أرسل الإهداء',
      dedSending: 'جاري الإرسال…',
      dedDoneTitle: 'وصل إهداؤك 💌',
      dedDoneText: 'بيظهر على الحائط بعد المراجعة، عادةً خلال ساعات.',
      dedAgain: 'أرسل إهداء آخر',
      dedEmpty: 'ما في إهداءات بعد. كون أول واحد يهدي أغنية للبيت.',
      dedLoadFailed: 'تعذّر تحميل الإهداءات. أعد تحميل الصفحة بعد قليل.',
      dedFrom: (name, place) => place ? `من ${name}، ${place}` : `من ${name}`,
      dedTo: (name, place) => place ? `إلى ${name}، ${place}` : `إلى ${name}`,
      dedShare: 'شارك الإهداء',
      dedShareText: (from, to) => `💌 إهداء من ${from} إلى ${to} على صوت البيت`,
      dedErrors: {
        missing: 'عبّي اسمك، لمين الإهداء، والأغنية.',
        links: 'شيل الروابط وأسماء الحسابات من الإهداء.',
        phone: 'شيل أرقام الهواتف من الإهداء.',
        spam: 'في أحرف مكررة كتير. صلّح الرسالة وجرّب مرة تانية.',
        rate: 'وصلت للحد: ٣ إهداءات بالساعة. جرّب بعد شوي.',
        server: 'ما قدرنا نبعت الإهداء. جرّب مرة تانية.'
      },
      alertsOn: 'نبّهني بالأخبار العاجلة',
      alertsActive: 'التنبيهات العاجلة شغّالة',
      alertsEnabled: 'رح يوصلك تنبيه بس يصير خبر كبير بلبنان، ٤ تنبيهات بالنهار كحد أقصى.',
      alertsDisabled: 'أوقفنا التنبيهات.',
      alertsDenied: 'الإشعارات ممنوعة لهالموقع. اسمح فيها من إعدادات المتصفح وجرّب مرة تانية.',
      alertsIos: 'على الآيفون: اضغط «مشاركة» ثم «إضافة إلى الشاشة الرئيسية»، وافتح صوت البيت من هناك لتفعيل التنبيهات.',
      alertsFailed: 'ما قدرنا نفعّل التنبيهات. جرّب مرة تانية.'
    },
    en: {
      brand: 'Sawt el Beit',
      title: 'Sawt el Beit · Lebanese radio, news and TV',
      skipToNews: 'Skip to news',
      language: 'Language',
      beirut: 'Beirut',
      yourTime: 'Your time',
      radioHeading: 'Sawt el Beit: Lebanese radio',
      morning: 'Good morning. Fairuz with your coffee?',
      morningAction: 'Play Fairuz',
      stations: 'Stations',
      loadingStations: 'Loading stations…',
      dialHint: 'Drag the dial to change station',
      filterStations: 'Filter stations',
      filterAll: 'All stations',
      filterFav: 'Favourites',
      filterFairuz: 'Fairuz',
      searchLabel: 'Search stations',
      searchPlaceholder: 'Search stations',
      share: 'Share station',
      sleep: 'Sleep timer',
      sleepTitle: 'Turn the radio off after:',
      sleepOff: 'No timer',
      minutes: n => `${n} min`,
      sleepLeft: time => `Stops in ${time}`,
      sleepSet: n => `The radio will stop in ${n} minutes.`,
      sleepCleared: 'Sleep timer cleared.',
      alarm: 'Morning alarm',
      alarmOn: time => `Alarm ${time}`,
      alarmTitle: 'Wake me up with the station on the dial now.',
      alarmTime: 'Time',
      alarmSet: 'Set alarm',
      alarmCancel: 'Cancel alarm',
      alarmNote: 'Leave this page open with the device charging. The screen stays on until the alarm rings. On iPhone it won’t ring while the screen is locked.',
      alarmSaved: (time, name) => `Alarm set for ${time} with ${name}.`,
      alarmCleared: 'Alarm cancelled.',
      ringTitle: 'Good morning',
      ringPlay: 'Play the radio',
      ringSnooze: 'Snooze 10 min',
      ringStop: 'I’m up',
      snoozed: 'The alarm will ring again in 10 minutes.',
      newsHeading: 'News from Lebanon',
      refresh: 'Refresh',
      loadingNews: 'Loading news…',
      tvHeading: 'Live TV',
      tvNote: 'Opens the live broadcast on YouTube.',
      watchLive: 'Watch live',
      weatherHeading: 'Weather in Lebanon',
      highLow: (hi, lo) => `High ${hi}°, low ${lo}°`,
      footer: 'Sawt el Beit is free. Stations come from the Radio Browser directory; news refreshes every 10 minutes.',
      play: 'Play',
      stop: 'Stop',
      prevStation: 'Previous station',
      nextStation: 'Next station',
      addFav: 'Add to favourites',
      removeFav: 'Remove from favourites',
      pressPlay: 'Press play to listen',
      connecting: 'Connecting…',
      live: 'Live now',
      stationDown: 'This station isn’t broadcasting right now. Try the next one.',
      stationsFailed: 'Stations didn’t load. Reload the page in a moment.',
      noFavs: 'No favourites yet. Tap ★ on any station to add it.',
      noFairuz: 'No Fairuz station is broadcasting right now.',
      noResults: 'No station matches that name. Try another.',
      newsFailed: 'News didn’t load. Press Refresh to try again.',
      sourceDown: 'This source isn’t responding right now. Try another.',
      noHeadlines: 'No new headlines from this source.',
      updated: 'Updated',
      updateFailed: 'Couldn’t refresh. Showing earlier headlines.',
      shareText: name => `Listen to ${name} on Sawt el Beit 📻🇱🇧`,
      linkCopied: 'Link copied. Paste it into WhatsApp or any chat.',
      shareFailed: 'Couldn’t copy the link. Copy it from the address bar.',
      sharedStation: name => `${name} is ready. Press play.`,
      mediaArtist: 'Sawt el Beit · Lebanese radio',
      skipToContent: 'Skip to content',
      sectionsNav: 'Page sections',
      navClassics: 'Classics',
      navDedications: 'Dedications',
      navNews: 'News',
      navTv: 'TV and weather',
      classicsHeading: 'The golden age',
      classicsLede: 'Fairuz, Wadih El Safi, Sabah and Zaki Nassif, by mood.',
      moodTune: 'Put the radio on for this',
      dedicateSong: 'Dedicate',
      dedHeading: 'Dedications home',
      dedLede: 'A song and a message from abroad to your family in Lebanon. Every dedication is reviewed before it appears.',
      dedFormTitle: 'Send a dedication',
      dedFromName: 'Your name',
      dedFromPlace: 'Where you live',
      dedFromPlaceHint: 'e.g. Montreal',
      dedToName: 'Who it’s for',
      dedToNameHint: 'e.g. Teta',
      dedToPlace: 'Their town or village',
      dedToPlaceHint: 'e.g. Zahle',
      dedSong: 'Song',
      dedSongHint: 'Pick a classic or type any song',
      dedMessage: 'Your message',
      dedMessageHint: 'Missing you all…',
      dedRules: 'No links or phone numbers. It appears once it’s approved.',
      dedSubmit: 'Send dedication',
      dedSending: 'Sending…',
      dedDoneTitle: 'Dedication sent 💌',
      dedDoneText: 'It will appear on the wall once it’s reviewed, usually within a few hours.',
      dedAgain: 'Send another',
      dedEmpty: 'No dedications yet. Be the first to send a song home.',
      dedLoadFailed: 'Dedications didn’t load. Reload the page in a moment.',
      dedFrom: (name, place) => place ? `From ${name}, ${place}` : `From ${name}`,
      dedTo: (name, place) => place ? `To ${name}, ${place}` : `To ${name}`,
      dedShare: 'Share dedication',
      dedShareText: (from, to) => `💌 A dedication from ${from} to ${to} on Sawt el Beit`,
      dedErrors: {
        missing: 'Fill in your name, who it’s for, and the song.',
        links: 'Remove links and account names from the dedication.',
        phone: 'Remove phone numbers from the dedication.',
        spam: 'Too many repeated characters. Fix the message and try again.',
        rate: 'Limit reached: 3 dedications an hour. Try again a bit later.',
        server: 'The dedication didn’t send. Try again.'
      },
      alertsOn: 'Alert me to breaking news',
      alertsActive: 'Breaking-news alerts on',
      alertsEnabled: 'You’ll get an alert when big news breaks in Lebanon, at most 4 a day.',
      alertsDisabled: 'Alerts turned off.',
      alertsDenied: 'Notifications are blocked for this site. Allow them in your browser settings, then try again.',
      alertsIos: 'On iPhone: tap Share, then “Add to Home Screen”, and open Sawt el Beit from there to turn on alerts.',
      alertsFailed: 'Alerts didn’t turn on. Try again.'
    },
    fr: {
      brand: 'Sawt el Beit',
      title: 'Sawt el Beit · Radio, actualités et télé du Liban',
      skipToNews: 'Aller aux actualités',
      language: 'Langue',
      beirut: 'Beyrouth',
      yourTime: 'Chez vous',
      radioHeading: 'Sawt el Beit : la radio du Liban',
      morning: 'Bonjour. Un peu de Fairouz avec le café ?',
      morningAction: 'Écouter Fairouz',
      stations: 'Stations',
      loadingStations: 'Chargement des stations…',
      dialHint: 'Faites glisser le cadran pour changer de station',
      filterStations: 'Filtrer les stations',
      filterAll: 'Toutes les stations',
      filterFav: 'Favoris',
      filterFairuz: 'Fairouz',
      searchLabel: 'Chercher une station',
      searchPlaceholder: 'Chercher une station',
      share: 'Partager la station',
      sleep: 'Minuterie',
      sleepTitle: 'Éteindre la radio dans :',
      sleepOff: 'Sans minuterie',
      minutes: n => `${n} min`,
      sleepLeft: time => `Arrêt dans ${time}`,
      sleepSet: n => `La radio s’arrêtera dans ${n} minutes.`,
      sleepCleared: 'Minuterie annulée.',
      alarm: 'Réveil',
      alarmOn: time => `Réveil ${time}`,
      alarmTitle: 'Me réveiller avec la station affichée sur le cadran.',
      alarmTime: 'Heure',
      alarmSet: 'Régler le réveil',
      alarmCancel: 'Annuler le réveil',
      alarmNote: 'Laissez cette page ouverte et l’appareil en charge. L’écran reste allumé jusqu’à la sonnerie. Sur iPhone, le réveil ne sonne pas écran verrouillé.',
      alarmSaved: (time, name) => `Réveil réglé à ${time} avec ${name}.`,
      alarmCleared: 'Réveil annulé.',
      ringTitle: 'Bonjour',
      ringPlay: 'Lancer la radio',
      ringSnooze: 'Répéter dans 10 min',
      ringStop: 'Je suis réveillé',
      snoozed: 'Le réveil sonnera à nouveau dans 10 minutes.',
      newsHeading: 'Actualités du Liban',
      refresh: 'Actualiser',
      loadingNews: 'Chargement des actualités…',
      tvHeading: 'Télé en direct',
      tvNote: 'Ouvre le direct sur YouTube.',
      watchLive: 'Regarder en direct',
      weatherHeading: 'Météo au Liban',
      highLow: (hi, lo) => `Max ${hi}°, min ${lo}°`,
      footer: 'Sawt el Beit est gratuit. Les stations viennent de l’annuaire Radio Browser ; les actualités se mettent à jour toutes les 10 minutes.',
      play: 'Écouter',
      stop: 'Arrêter',
      prevStation: 'Station précédente',
      nextStation: 'Station suivante',
      addFav: 'Ajouter aux favoris',
      removeFav: 'Retirer des favoris',
      pressPlay: 'Appuyez sur lecture pour écouter',
      connecting: 'Connexion…',
      live: 'En direct',
      stationDown: 'Cette station n’émet pas en ce moment. Essayez la suivante.',
      stationsFailed: 'Les stations n’ont pas pu se charger. Rechargez la page dans un instant.',
      noFavs: 'Pas encore de favoris. Touchez ★ sur une station pour l’ajouter.',
      noFairuz: 'Aucune station Fairouz n’émet en ce moment.',
      noResults: 'Aucune station ne porte ce nom. Essayez un autre.',
      newsFailed: 'Les actualités n’ont pas pu se charger. Appuyez sur Actualiser.',
      sourceDown: 'Cette source ne répond pas en ce moment. Essayez-en une autre.',
      noHeadlines: 'Pas de nouveaux titres pour cette source.',
      updated: 'Mis à jour',
      updateFailed: 'Mise à jour impossible. Titres précédents affichés.',
      shareText: name => `Écoutez ${name} sur Sawt el Beit 📻🇱🇧`,
      linkCopied: 'Lien copié. Collez-le dans WhatsApp ou une conversation.',
      shareFailed: 'Impossible de copier le lien. Copiez-le depuis la barre d’adresse.',
      sharedStation: name => `${name} est prête. Appuyez sur lecture.`,
      mediaArtist: 'Sawt el Beit · Radio du Liban',
      skipToContent: 'Aller au contenu',
      sectionsNav: 'Sections de la page',
      navClassics: 'Classiques',
      navDedications: 'Dédicaces',
      navNews: 'Actualités',
      navTv: 'Télé et météo',
      classicsHeading: 'L’âge d’or',
      classicsLede: 'Fairouz, Wadih El Safi, Sabah et Zaki Nassif, selon l’humeur.',
      moodTune: 'Mettre la radio dans cette ambiance',
      dedicateSong: 'Dédier',
      dedHeading: 'Dédicaces pour la maison',
      dedLede: 'Une chanson et un mot depuis l’étranger pour votre famille au Liban. Chaque dédicace est relue avant publication.',
      dedFormTitle: 'Envoyer une dédicace',
      dedFromName: 'Votre prénom',
      dedFromPlace: 'Où vous vivez',
      dedFromPlaceHint: 'ex. Montréal',
      dedToName: 'Pour qui',
      dedToNameHint: 'ex. Teta',
      dedToPlace: 'Leur ville ou village',
      dedToPlaceHint: 'ex. Zahlé',
      dedSong: 'Chanson',
      dedSongHint: 'Choisissez un classique ou tapez une chanson',
      dedMessage: 'Votre message',
      dedMessageHint: 'Vous me manquez…',
      dedRules: 'Pas de liens ni de numéros de téléphone. Elle apparaît après validation.',
      dedSubmit: 'Envoyer la dédicace',
      dedSending: 'Envoi…',
      dedDoneTitle: 'Dédicace envoyée 💌',
      dedDoneText: 'Elle apparaîtra sur le mur après relecture, en général sous quelques heures.',
      dedAgain: 'En envoyer une autre',
      dedEmpty: 'Pas encore de dédicaces. Soyez le premier à envoyer une chanson.',
      dedLoadFailed: 'Les dédicaces n’ont pas pu se charger. Rechargez la page dans un instant.',
      dedFrom: (name, place) => place ? `De ${name}, ${place}` : `De ${name}`,
      dedTo: (name, place) => place ? `Pour ${name}, ${place}` : `Pour ${name}`,
      dedShare: 'Partager la dédicace',
      dedShareText: (from, to) => `💌 Une dédicace de ${from} pour ${to} sur Sawt el Beit`,
      dedErrors: {
        missing: 'Indiquez votre prénom, le destinataire et la chanson.',
        links: 'Retirez les liens et les noms de comptes.',
        phone: 'Retirez les numéros de téléphone.',
        spam: 'Trop de caractères répétés. Corrigez le message et réessayez.',
        rate: 'Limite atteinte : 3 dédicaces par heure. Réessayez un peu plus tard.',
        server: 'La dédicace n’est pas partie. Réessayez.'
      },
      alertsOn: 'M’alerter des grandes nouvelles',
      alertsActive: 'Alertes activées',
      alertsEnabled: 'Vous recevrez une alerte en cas de grande nouvelle au Liban, 4 par jour au plus.',
      alertsDisabled: 'Alertes désactivées.',
      alertsDenied: 'Les notifications sont bloquées pour ce site. Autorisez-les dans les réglages du navigateur, puis réessayez.',
      alertsIos: 'Sur iPhone : touchez Partager, puis « Sur l’écran d’accueil », et ouvrez Sawt el Beit depuis là pour activer les alertes.',
      alertsFailed: 'Impossible d’activer les alertes. Réessayez.'
    }
  };

  const LOCALES = { ar: 'ar-LB', en: 'en-GB', fr: 'fr-FR' };
  const WEATHER_WORDS = {
    ar: { clear: 'صافٍ', partly: 'غائم جزئياً', cloudy: 'غائم', fog: 'ضباب', drizzle: 'رذاذ', rain: 'مطر', snow: 'ثلج', showers: 'زخات', storm: 'عاصفة رعدية' },
    en: { clear: 'Clear', partly: 'Partly cloudy', cloudy: 'Cloudy', fog: 'Fog', drizzle: 'Drizzle', rain: 'Rain', snow: 'Snow', showers: 'Showers', storm: 'Thunderstorm' },
    fr: { clear: 'Dégagé', partly: 'Éclaircies', cloudy: 'Nuageux', fog: 'Brouillard', drizzle: 'Bruine', rain: 'Pluie', snow: 'Neige', showers: 'Averses', storm: 'Orage' }
  };

  const TV = [
    { name: 'LBCI', handle: 'lbcilebanonofficial' },
    { name: 'MTV Lebanon', handle: 'mtvlebanon' },
    { name: 'Al Jadeed', handle: 'aljadeednewslb' },
    { name: 'OTV', handle: 'otvlebanonofficial' }
  ];

  const FAIRUZ = /fair[uo]+z|fayrouz|فيروز|رحبان/i;
  const NEWS_REFRESH_MS = 10 * 60 * 1000;
  const STALL_MS = 15000;
  const SLEEP_CHOICES = [15, 30, 45, 60, 90];
  const SNOOZE_MS = 10 * 60 * 1000;

  // ================================================================== helpers

  const $ = id => document.getElementById(id);

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem('sawt:' + key); return v === null ? fallback : JSON.parse(v); }
      catch { return fallback; }
    },
    set(key, value) {
      try {
        if (value === null) localStorage.removeItem('sawt:' + key);
        else localStorage.setItem('sawt:' + key, JSON.stringify(value));
      } catch { /* private mode */ }
    }
  };

  // Bring over settings saved under the app's earlier name.
  (function migrate() {
    try {
      for (const key of ['lang', 'favs', 'last']) {
        const old = localStorage.getItem('warde:' + key);
        if (old !== null && localStorage.getItem('sawt:' + key) === null) localStorage.setItem('sawt:' + key, old);
      }
    } catch { /* ignore */ }
  })();

  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'text') node.textContent = v;
      else if (k === 'className') node.className = v;
      else node.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children) if (c) node.append(c);
    return node;
  }

  let lang = store.get('lang', 'ar');
  if (!STRINGS[lang]) lang = 'ar';
  const t = (key, ...args) => {
    const v = STRINGS[lang][key];
    return typeof v === 'function' ? v(...args) : v;
  };
  const locale = () => LOCALES[lang];
  const num = n => new Intl.NumberFormat(locale()).format(n);

  function timeAgo(iso) {
    if (!iso) return '';
    const rtf = new Intl.RelativeTimeFormat(locale(), { numeric: 'auto' });
    const min = Math.round((new Date(iso) - Date.now()) / 60000);
    if (Math.abs(min) < 60) return rtf.format(min, 'minute');
    const hr = Math.round(min / 60);
    if (Math.abs(hr) < 24) return rtf.format(hr, 'hour');
    return rtf.format(Math.round(hr / 24), 'day');
  }

  function formatClock(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return new Intl.DateTimeFormat(locale(), { hour: 'numeric', minute: '2-digit' }).format(d);
  }

  let toastTimer = null;
  function toast(message) {
    const node = $('toast');
    node.textContent = message;
    node.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('is-shown'), 3200);
  }

  // Loose matching for search: ignore case, Arabic diacritics and alef/ya variants.
  function fold(s) {
    return (s || '').toLowerCase()
      .normalize('NFKD').replace(/[̀-ًͯ-ٰٟ]/g, '')
      .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
  }

  // ================================================================== language

  function applyLanguage() {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = t('title');
    document.querySelectorAll('[data-i18n]').forEach(n => { n.textContent = t(n.dataset.i18n); });
    document.querySelectorAll('[data-i18n-label]').forEach(n => n.setAttribute('aria-label', t(n.dataset.i18nLabel)));
    document.querySelectorAll('[data-i18n-placeholder]').forEach(n => n.setAttribute('placeholder', t(n.dataset.i18nPlaceholder)));
    document.querySelectorAll('.lang').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    updateClocks();
    renderWeather();
    renderTV();
    renderPowerAndFav();
    renderStatus();
    renderNews();
    renderSleepOptions();
    renderSleepLabel();
    renderAlarmLabel();
    if (stations.length) renderDial();
    document.dispatchEvent(new CustomEvent('sawt:lang'));
  }

  document.querySelectorAll('.lang').forEach(btn => btn.addEventListener('click', () => {
    if (btn.dataset.lang === lang) return;
    lang = btn.dataset.lang;
    store.set('lang', lang);
    activeSource = null; // pick the source in the new language
    applyLanguage();
    // The dial's reading direction may flip; keep the needle on the same station.
    requestAnimationFrame(() => centreOn(selected, false));
  }));

  // ================================================================== clocks + weather

  function beirutHour() {
    return Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Beirut' }).format(new Date()));
  }

  function sameZoneAsBeirut() {
    const now = new Date();
    const fmt = tz => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: tz }).format(now);
    return fmt('Asia/Beirut') === fmt(undefined);
  }

  // The time itself is shown on the window (sky.js); here we only keep the
  // morning suggestion in step with Beirut's clock.
  function updateClocks() {
    updateMorning();
  }

  let weather = null;
  function weatherWord(code) {
    const w = WEATHER_WORDS[lang];
    if (code === 0) return w.clear;
    if (code <= 2) return w.partly;
    if (code === 3) return w.cloudy;
    if (code === 45 || code === 48) return w.fog;
    if (code >= 51 && code <= 57) return w.drizzle;
    if (code >= 61 && code <= 67) return w.rain;
    if (code >= 71 && code <= 77) return w.snow;
    if (code >= 80 && code <= 86) return w.showers;
    if (code >= 95) return w.storm;
    return '';
  }

  function renderWeather() {
    const list = $('towns');
    if (!weather) { list.closest('section').hidden = true; return; }

    const cities = weather.cities || [];
    list.closest('section').hidden = !cities.length;
    list.replaceChildren(...cities.map(c => el('li', { className: 'town' }, [
      el('span', { className: 'town-name', text: CITY_NAMES[lang][c.id] || c.id }),
      el('span', { className: 'town-sky', text: weatherWord(c.code) }),
      el('span', { className: 'town-temp', text: `${num(c.temperature)}°` }),
      c.high !== null && c.low !== null ? el('span', { className: 'town-range', text: t('highLow', num(c.high), num(c.low)) }) : null
    ])));
  }

  function loadWeather() {
    fetch('/api/weather').then(r => (r.ok ? r.json() : null)).then(d => {
      if (!d) return;
      weather = d;
      renderWeather();
      document.dispatchEvent(new CustomEvent('sawt:weather'));
    }).catch(() => {});
  }

  // ================================================================== radio state

  const audio = $('audio');
  const dial = $('dial');
  let stations = [];
  let visible = [];          // stations after filter + search
  let selected = -1;         // index into `visible`
  let filter = 'all';
  let query = '';
  let powerOn = false;
  let status = 'idle';       // idle | connecting | live | error
  let stallTimer = null;
  let tuneTimer = null;
  let notice = '';           // one-off status line, e.g. after opening a shared link
  const favs = new Set(store.get('favs', []));
  const offline = new Set();

  const current = () => visible[selected] || null;

  function renderPowerAndFav() {
    const label = powerOn ? t('stop') : t('play');
    for (const id of ['power', 'mini-power']) {
      const b = $(id);
      b.setAttribute('aria-pressed', String(powerOn));
      b.setAttribute('aria-label', label);
    }
    const st = current();
    const fav = $('fav');
    const isFav = !!st && favs.has(st.id);
    fav.disabled = !st;
    fav.setAttribute('aria-pressed', String(isFav));
    fav.setAttribute('aria-label', isFav ? t('removeFav') : t('addFav'));
    $('share-btn').disabled = !st;
  }

  function renderStatus() {
    const node = $('station-status');
    node.className = 'station-status';
    if (status === 'live') { node.textContent = t('live'); node.classList.add('is-live'); }
    else if (status === 'connecting') node.textContent = t('connecting');
    else if (status === 'error') { node.textContent = t('stationDown'); node.classList.add('is-error'); }
    else node.textContent = notice || (current() ? t('pressPlay') : '');
    const playing = status === 'live';
    $('set').classList.toggle('is-playing', playing);
    $('mini').classList.toggle('is-playing', playing);
  }

  function setStatus(next) {
    status = next;
    if (next !== 'idle') notice = '';
    renderStatus();
  }

  function renderStationName() {
    const st = current();
    $('station-name').textContent = st ? st.name : '…';
    $('mini-name').textContent = st ? st.name : '';
  }

  // ================================================================== static between stations

  let audioCtx = null;
  function tuningStatic() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const len = Math.floor(audioCtx.sampleRate * 0.35);
      const buffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = audioCtx.createBufferSource();
      src.buffer = buffer;
      const band = audioCtx.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = 1700;
      band.Q.value = 0.7;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.06 * audio.volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      src.connect(band).connect(gain).connect(audioCtx.destination);
      src.start();
    } catch { /* audio context not allowed yet: stay silent */ }
  }

  // ================================================================== playback

  // Resolves true when the browser allowed playback.
  function startStream() {
    const st = current();
    if (!st) return Promise.resolve(false);
    clearTimeout(stallTimer);
    setStatus('connecting');
    audio.src = st.url;
    stallTimer = setTimeout(() => { if (status === 'connecting') markDown(); }, STALL_MS);
    updateMediaSession();
    return audio.play().then(() => true).catch(err => {
      if (err && err.name === 'NotAllowedError') {
        clearTimeout(stallTimer);
        powerOn = false;
        renderPowerAndFav();
        setStatus('idle');
        return false;
      }
      return true; // other errors surface through the 'error' event
    });
  }

  function stopStream() {
    clearTimeout(stallTimer);
    clearTimeout(tuneTimer);
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    setStatus('idle');
  }

  function markDown() {
    const st = current();
    if (st) offline.add(st.id);
    clearTimeout(stallTimer);
    audio.pause();
    setStatus('error');
    renderDial();
  }

  audio.addEventListener('playing', () => { clearTimeout(stallTimer); setStatus('live'); });
  audio.addEventListener('waiting', () => { if (powerOn) setStatus('connecting'); });
  audio.addEventListener('error', () => { if (powerOn && audio.getAttribute('src')) markDown(); });

  function setPower(on) {
    powerOn = on;
    renderPowerAndFav();
    updateMorning();
    if (on) return startStream();
    stopStream();
    return Promise.resolve(false);
  }

  $('power').addEventListener('click', () => setPower(!powerOn));
  $('mini-power').addEventListener('click', () => setPower(!powerOn));
  $('mini-prev').addEventListener('click', () => step(-1));
  $('mini-next').addEventListener('click', () => step(1));
  $('mini-name').addEventListener('click', () => $('set').scrollIntoView({ behavior: 'smooth', block: 'center' }));

  $('fav').addEventListener('click', () => {
    const st = current();
    if (!st) return;
    if (favs.has(st.id)) favs.delete(st.id); else favs.add(st.id);
    store.set('favs', [...favs]);
    renderPowerAndFav();
    renderDial();
  });

  // Gentle volume ramps (iPhone ignores volume changes; that's fine).
  let fadeTimer = null;
  function fadeVolume(to, ms, done) {
    clearInterval(fadeTimer);
    const from = audio.volume;
    const start = Date.now();
    fadeTimer = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / ms);
      try { audio.volume = from + (to - from) * p; } catch { /* read-only on iOS */ }
      if (p >= 1) { clearInterval(fadeTimer); if (done) done(); }
    }, 200);
  }

  // ================================================================== media session (lock screen)

  function updateMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const st = current();
    if (!st) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: st.name,
        artist: t('mediaArtist'),
        artwork: [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }]
      });
    } catch { /* older browsers */ }
  }
  if ('mediaSession' in navigator) {
    const ms = navigator.mediaSession;
    const safe = (action, fn) => { try { ms.setActionHandler(action, fn); } catch { /* unsupported */ } };
    safe('play', () => setPower(true));
    safe('pause', () => setPower(false));
    safe('stop', () => setPower(false));
    safe('nexttrack', () => step(1));
    safe('previoustrack', () => step(-1));
  }

  // ================================================================== the dial

  function applyFilter() {
    let list = stations;
    if (filter === 'fav') list = list.filter(s => favs.has(s.id));
    else if (filter === 'fairuz') list = list.filter(s => FAIRUZ.test(s.name) || FAIRUZ.test(s.tags || ''));
    const q = fold(query.trim());
    if (q) list = list.filter(s => fold(s.name).includes(q) || fold(s.tags).includes(q));
    visible = list.slice();
  }

  function renderDial() {
    if (!stations.length) return;
    const ticks = visible.map((s, i) => el('button', {
      type: 'button',
      role: 'option',
      id: 'station-' + i,
      className: 'tick' + (favs.has(s.id) ? ' is-fav' : '') + (offline.has(s.id) ? ' is-offline' : ''),
      'aria-selected': String(i === selected),
      'data-i': String(i),
      tabindex: '-1'
    }, [el('span', { text: s.name, dir: 'auto' })]));

    if (!ticks.length) {
      const msg = query.trim() ? t('noResults') : filter === 'fav' ? t('noFavs') : t('noFairuz');
      dial.replaceChildren(el('p', { className: 'dial-loading', text: msg }));
      return;
    }
    dial.replaceChildren(el('div', { className: 'dial-spacer' }), ...ticks, el('div', { className: 'dial-spacer' }));
  }

  function tickAt(i) { return dial.querySelector(`.tick[data-i="${i}"]`); }

  function centreOn(i, smooth = true) {
    const tick = tickAt(i);
    if (!tick) return;
    const box = dial.getBoundingClientRect();
    const tb = tick.getBoundingClientRect();
    const delta = (tb.left + tb.width / 2) - (box.left + box.width / 2);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    dial.scrollBy({ left: delta, behavior: smooth && !reduce ? 'smooth' : 'auto' });
  }

  function nearestTick() {
    const box = dial.getBoundingClientRect();
    const mid = box.left + box.width / 2;
    let best = -1, bestDist = Infinity;
    dial.querySelectorAll('.tick').forEach(tick => {
      const r = tick.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - mid);
      if (d < bestDist) { bestDist = d; best = Number(tick.dataset.i); }
    });
    return best;
  }

  function highlight(i) {
    dial.querySelectorAll('.tick').forEach(tick => tick.setAttribute('aria-selected', String(Number(tick.dataset.i) === i)));
  }

  // Selecting a station: what turning the knob does.
  function select(i, { tune = true } = {}) {
    if (i < 0 || i >= visible.length) return;
    const changed = i !== selected;
    selected = i;
    highlight(i);
    renderStationName();
    renderPowerAndFav();
    dial.setAttribute('aria-activedescendant', 'station-' + i);
    store.set('last', visible[i].id);
    if (!changed) return;
    notice = '';
    if (powerOn && tune) {
      tuningStatic();
      clearTimeout(tuneTimer);
      tuneTimer = setTimeout(startStream, 380);
    } else if (status === 'error') {
      setStatus('idle');
    } else {
      renderStatus();
    }
    updateMediaSession();
    updateMorning();
  }

  function step(dir) {
    if (!visible.length) return;
    const next = Math.min(visible.length - 1, Math.max(0, selected + dir));
    select(next);
    centreOn(next);
  }

  // Scrolling the scale = turning the knob. Settle on the nearest station.
  let scrollTimer = null;
  let frame = 0;
  dial.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => highlight(nearestTick()));
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => { if (!dragging) select(nearestTick()); }, 140);
  }, { passive: true });

  dial.addEventListener('click', e => {
    const tick = e.target.closest('.tick');
    if (!tick || movedWhileDragging) return;
    const i = Number(tick.dataset.i);
    select(i);
    centreOn(i);
  });

  // Mouse drag (touch already scrolls natively)
  let dragging = false, movedWhileDragging = false, dragX = 0, dragStart = 0;
  dial.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    dragging = true; movedWhileDragging = false;
    dragX = e.clientX; dragStart = dial.scrollLeft;
    dial.classList.add('is-dragging');
  });
  window.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - dragX;
    if (Math.abs(dx) > 4) movedWhileDragging = true;
    dial.scrollLeft = dragStart - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    dial.classList.remove('is-dragging');
    const i = nearestTick();
    select(i);
    centreOn(i);
    setTimeout(() => { movedWhileDragging = false; }, 0);
  });

  // Keyboard: arrows follow what the eye sees, in either reading direction.
  dial.addEventListener('keydown', e => {
    const rtl = document.documentElement.dir === 'rtl';
    if (e.key === 'ArrowRight') { e.preventDefault(); step(rtl ? -1 : 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(rtl ? 1 : -1); }
    else if (e.key === 'Home') { e.preventDefault(); select(0); centreOn(0); }
    else if (e.key === 'End') { e.preventDefault(); select(visible.length - 1); centreOn(visible.length - 1); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setPower(!powerOn); }
  });

  // Re-render the dial after the list changed, keeping the current station when it's still listed.
  function refreshList({ tuneIfChanged = true } = {}) {
    const keepId = current() && current().id;
    applyFilter();
    let i = visible.findIndex(s => s.id === keepId);
    const keep = i !== -1;
    if (!keep) i = visible.length ? 0 : -1;
    selected = -1;
    renderDial();
    if (i !== -1) {
      select(i, { tune: tuneIfChanged && !keep });
      requestAnimationFrame(() => centreOn(i, false));
    } else {
      renderStationName();
      renderPowerAndFav();
    }
  }

  function setFilter(next) {
    filter = next;
    document.querySelectorAll('.chip[data-filter]').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.filter === next)));
  }

  document.querySelectorAll('.chip[data-filter]').forEach(chip => {
    chip.addEventListener('click', () => { setFilter(chip.dataset.filter); refreshList(); });
  });

  // Search: narrows the dial as you type, without retuning a playing radio.
  let searchTimer = null;
  $('search').addEventListener('input', e => {
    query = e.target.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => refreshList({ tuneIfChanged: false }), 120);
  });
  $('search').addEventListener('keydown', e => {
    if (e.key === 'Enter' && visible.length) { e.preventDefault(); dial.focus(); }
    if (e.key === 'Escape') { e.target.value = ''; query = ''; refreshList({ tuneIfChanged: false }); }
  });

  // Put a given station on the dial, clearing anything that would hide it.
  function showStation(id) {
    if (!stations.some(s => s.id === id)) return false;
    if (filter !== 'all' || query) {
      setFilter('all');
      query = '';
      $('search').value = '';
      applyFilter();
      selected = -1;
      renderDial();
    }
    const i = visible.findIndex(s => s.id === id);
    select(i, { tune: false });
    requestAnimationFrame(() => centreOn(i, false));
    return true;
  }

  // ================================================================== Fairuz in the morning

  function fairuzStation() { return stations.find(s => FAIRUZ.test(s.name)) || null; }
  function updateMorning() {
    const h = beirutHour();
    const listening = powerOn && current() && FAIRUZ.test(current().name);
    $('morning').hidden = !(h >= 6 && h < 10 && fairuzStation() && !listening);
  }
  $('morning-btn').addEventListener('click', () => {
    const target = fairuzStation();
    if (!target) return;
    showStation(target.id);
    setPower(true);
  });

  // ================================================================== share

  function shareUrl(st) { return `${location.origin}/s/${encodeURIComponent(st.id)}`; }

  $('share-btn').addEventListener('click', async () => {
    const st = current();
    if (!st) return;
    const url = shareUrl(st);
    const text = t('shareText', st.name);
    if (navigator.share) {
      try { await navigator.share({ title: t('brand'), text, url }); return; }
      catch (err) { if (err && err.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast(t('linkCopied'));
    } catch {
      history.replaceState(null, '', url);
      toast(t('shareFailed'));
    }
  });

  function sharedStationId() {
    const m = location.pathname.match(/^\/s\/([^/]+)/);
    if (m) return decodeURIComponent(m[1]);
    return new URLSearchParams(location.search).get('station');
  }

  // ================================================================== sleep timer

  let sleepEnd = 0;
  let sleepChoice = 0;
  let sleepTick = null;
  let sleepFading = false;

  function renderSleepOptions() {
    const box = $('sleep-options');
    const opts = SLEEP_CHOICES.map(m => el('button', {
      type: 'button',
      className: 'chip',
      'aria-pressed': String(!!sleepEnd && sleepChoice === m),
      'data-min': String(m),
      text: t('minutes', num(m))
    }));
    opts.push(el('button', { type: 'button', className: 'chip', 'data-min': '0', 'aria-pressed': String(!sleepEnd), text: t('sleepOff') }));
    box.replaceChildren(...opts);
  }

  $('sleep-options').addEventListener('click', e => {
    const b = e.target.closest('[data-min]');
    if (!b) return;
    setSleep(Number(b.dataset.min));
    togglePanel('sleep', false);
  });

  function setSleep(minutes) {
    clearInterval(sleepTick);
    sleepChoice = minutes;
    sleepFading = false;
    if (!minutes) {
      if (sleepEnd) toast(t('sleepCleared'));
      sleepEnd = 0;
      fadeVolume(1, 300);
    } else {
      sleepEnd = Date.now() + minutes * 60000;
      toast(t('sleepSet', num(minutes)));
      sleepTick = setInterval(checkSleep, 1000);
    }
    renderSleepOptions();
    renderSleepLabel();
  }

  function checkSleep() {
    const left = sleepEnd - Date.now();
    if (left <= 30000 && !sleepFading && powerOn) {
      sleepFading = true;
      fadeVolume(0, Math.max(left, 1000));
    }
    if (left <= 0) {
      clearInterval(sleepTick);
      sleepEnd = 0;
      sleepFading = false;
      setPower(false);
      try { audio.volume = 1; } catch { /* iOS */ }
      renderSleepOptions();
    }
    renderSleepLabel();
  }

  function renderSleepLabel() {
    $('sleep-btn').classList.toggle('is-on', !!sleepEnd);
    if (!sleepEnd) { $('sleep-label').textContent = t('sleep'); return; }
    const s = Math.max(0, Math.round((sleepEnd - Date.now()) / 1000));
    const mm = num(Math.floor(s / 60));
    const ss = new Intl.NumberFormat(locale(), { minimumIntegerDigits: 2 }).format(s % 60);
    $('sleep-label').textContent = t('sleepLeft', `${mm}:${ss}`);
  }

  // ================================================================== alarm

  let alarm = store.get('alarm', null);          // { time: 'HH:MM', stationId, name }
  let alarmFiredOn = store.get('alarmFired', ''); // 'YYYY-MM-DD HH:MM' of the last ring
  let snoozeUntil = 0;
  let wakeLock = null;

  function renderAlarmLabel() {
    const on = !!alarm;
    $('alarm-btn').classList.toggle('is-on', on);
    $('alarm-label').textContent = on ? t('alarmOn', formatClock(alarm.time)) : t('alarm');
    $('alarm-cancel').hidden = !on;
    if (on) $('alarm-time').value = alarm.time;
  }

  async function holdScreen(on) {
    try {
      if (on && 'wakeLock' in navigator && !wakeLock && !document.hidden) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      } else if (!on && wakeLock) {
        await wakeLock.release();
        wakeLock = null;
      }
    } catch { /* not supported or refused */ }
  }

  $('alarm-panel').addEventListener('submit', e => {
    e.preventDefault();
    const st = current();
    const time = $('alarm-time').value;
    if (!st || !time) return;
    alarm = { time, stationId: st.id, name: st.name };
    store.set('alarm', alarm);
    alarmFiredOn = '';
    store.set('alarmFired', '');
    // Unlock audio now, while we have a tap, so the alarm can play later.
    try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume(); } catch { /* ignore */ }
    holdScreen(true);
    renderAlarmLabel();
    togglePanel('alarm', false);
    toast(t('alarmSaved', formatClock(time), st.name));
  });

  $('alarm-cancel').addEventListener('click', () => {
    alarm = null;
    store.set('alarm', null);
    snoozeUntil = 0;
    holdScreen(false);
    renderAlarmLabel();
    togglePanel('alarm', false);
    toast(t('alarmCleared'));
  });

  function localStamp(d = new Date()) {
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  function checkAlarm() {
    if (!alarm || !stations.length || !$('ring').hidden) return;
    const stamp = localStamp();
    const due = (stamp.slice(11) === alarm.time && alarmFiredOn !== stamp) || (snoozeUntil && Date.now() >= snoozeUntil);
    if (!due) return;
    snoozeUntil = 0;
    alarmFiredOn = stamp;
    store.set('alarmFired', stamp);
    ring();
  }

  async function ring() {
    const fallback = fairuzStation() || stations[0];
    const id = stations.some(s => s.id === alarm.stationId) ? alarm.stationId : fallback.id;
    showStation(id);
    $('ring-station').textContent = current() ? current().name : '';
    $('ring').hidden = false;
    $('ring-stop').focus();
    try { audio.volume = 0.05; } catch { /* iOS */ }
    const allowed = await setPower(true);
    if (allowed) fadeVolume(1, 30000);
    $('ring-play').hidden = allowed;
  }

  $('ring-play').addEventListener('click', async () => {
    try { audio.volume = 0.3; } catch { /* iOS */ }
    const ok = await setPower(true);
    if (ok) { fadeVolume(1, 15000); $('ring-play').hidden = true; }
  });
  $('ring-stop').addEventListener('click', () => {
    $('ring').hidden = true;
    fadeVolume(1, 500);
  });
  $('ring-snooze').addEventListener('click', () => {
    $('ring').hidden = true;
    snoozeUntil = Date.now() + SNOOZE_MS;
    setPower(false);
    try { audio.volume = 1; } catch { /* iOS */ }
    toast(t('snoozed'));
  });

  // ================================================================== panels

  function togglePanel(name, force) {
    const panel = $(name + '-panel');
    const btn = $(name + '-btn');
    const open = force === undefined ? panel.hidden : force;
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    if (open) {
      const other = name === 'sleep' ? 'alarm' : 'sleep';
      $(other + '-panel').hidden = true;
      $(other + '-btn').setAttribute('aria-expanded', 'false');
      const first = panel.querySelector('button, input');
      if (first) first.focus();
    }
  }
  $('sleep-btn').addEventListener('click', () => togglePanel('sleep'));
  $('alarm-btn').addEventListener('click', () => togglePanel('alarm'));
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    for (const name of ['sleep', 'alarm']) if (!$(name + '-panel').hidden) { togglePanel(name, false); $(name + '-btn').focus(); }
  });

  // ================================================================== mini-player

  let setVisible = true;
  function updateMini() {
    const show = !setVisible && stations.length > 0;
    $('mini').hidden = !show;
    document.body.classList.toggle('has-mini', show);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { setVisible = entry.isIntersecting; updateMini(); }, { threshold: 0.15 }).observe($('set'));
  }

  // ================================================================== stations

  async function loadStations() {
    try {
      const res = await fetch('/api/radio');
      if (!res.ok) throw new Error(res.status);
      stations = (await res.json()).stations || [];
      applyFilter();
      renderDial();
      let shared = sharedStationId();
      // Home-screen shortcut: /?station=fairuz
      if (shared === 'fairuz' && fairuzStation()) shared = fairuzStation().id;
      if (shared && showStation(shared)) {
        notice = t('sharedStation', current().name);
      } else {
        const last = store.get('last', null);
        let i = visible.findIndex(s => s.id === last);
        if (i === -1) i = 0;
        select(i, { tune: false });
        requestAnimationFrame(() => centreOn(i, false));
      }
      renderStatus();
      updateMorning();
      updateMini();
      checkAlarm();
      document.dispatchEvent(new CustomEvent('sawt:stations'));
    } catch {
      dial.replaceChildren(el('p', { className: 'dial-loading', text: t('stationsFailed') }));
    }
  }

  // ================================================================== news

  let news = null;
  let newsFailed = false;
  let activeSource = null;
  let lastNewsLoad = 0;

  function defaultSource() {
    if (!news) return null;
    const good = news.sources.filter(s => s.ok && s.items.length);
    return (good.find(s => s.lang === lang) || good[0] || news.sources[0] || {}).source || null;
  }

  function renderNews() {
    const tabs = $('news-tabs');
    const list = $('headlines');
    if (!news) {
      if (newsFailed) list.replaceChildren(el('p', { className: 'error', text: t('newsFailed') }));
      return;
    }
    if (!activeSource || !news.sources.some(s => s.source === activeSource)) activeSource = defaultSource();

    tabs.replaceChildren(...news.sources.map(s => {
      const tab = el('button', {
        type: 'button',
        role: 'tab',
        className: 'tab' + (s.ok ? '' : ' is-down'),
        'aria-selected': String(s.source === activeSource),
        tabindex: s.source === activeSource ? '0' : '-1',
        lang: s.lang || undefined,
        text: s.source
      });
      tab.addEventListener('click', () => { activeSource = s.source; renderNews(); });
      return tab;
    }));

    const src = news.sources.find(s => s.source === activeSource);
    const srcLang = (src && src.lang) || 'en';
    if (!src || !src.ok) {
      list.replaceChildren(el('p', { className: 'quiet', text: t('sourceDown') }));
    } else if (!src.items.length) {
      list.replaceChildren(el('p', { className: 'quiet', text: t('noHeadlines') }));
    } else {
      list.replaceChildren(...src.items.map(item => el('a', {
        className: 'headline',
        href: item.link,
        target: '_blank',
        rel: 'noopener noreferrer',
        lang: srcLang,
        dir: srcLang === 'ar' ? 'rtl' : 'ltr'
      }, [
        el('span', { className: 'headline-title', text: item.title }),
        item.date ? el('time', { datetime: item.date, text: timeAgo(item.date), lang, dir: lang === 'ar' ? 'rtl' : 'ltr' }) : null
      ])));
    }
    $('news-updated').textContent = newsFailed ? t('updateFailed') : `${t('updated')} ${timeAgo(news.updatedAt)}`;
  }

  // Arrow keys move between tabs
  $('news-tabs').addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const tabs = [...$('news-tabs').querySelectorAll('.tab')];
    const at = tabs.indexOf(document.activeElement);
    if (at === -1) return;
    const rtl = document.documentElement.dir === 'rtl';
    const forward = (e.key === 'ArrowLeft') === rtl;
    const nextIndex = (at + (forward ? 1 : -1) + tabs.length) % tabs.length;
    tabs[nextIndex].click();
    $('news-tabs').querySelectorAll('.tab')[nextIndex].focus();
  });

  async function loadNews() {
    const btn = $('news-refresh');
    btn.disabled = true;
    lastNewsLoad = Date.now();
    try {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error(res.status);
      news = await res.json();
      newsFailed = false;
    } catch {
      newsFailed = true;
    } finally {
      btn.disabled = false;
      renderNews();
    }
  }
  $('news-refresh').addEventListener('click', loadNews);
  function loadNewsIfStale() { if (!document.hidden && Date.now() - lastNewsLoad >= NEWS_REFRESH_MS) loadNews(); }

  // ================================================================== tv

  function renderTV() {
    $('channels').replaceChildren(...TV.map(ch => el('li', { className: 'channel' }, [
      el('a', { href: `https://www.youtube.com/@${ch.handle}/live`, target: '_blank', rel: 'noopener noreferrer' }, [
        el('span', { className: 'channel-name', text: ch.name, lang: 'en', dir: 'ltr' }),
        el('span', { className: 'channel-live', text: t('watchLive') })
      ])
    ])));
  }

  // ================================================================== shared with sky.js and extras.js

  window.Sawt = {
    t, el, toast, num, fold, store,
    // a string in a specific language (postcards keep the writer's language)
    tIn: (l, key, ...args) => { const v = (STRINGS[l] || STRINGS.ar)[key]; return typeof v === 'function' ? v(...args) : v; },
    lang: () => lang,
    locale,
    timeAgo,
    weather: () => weather,
    weatherWord,
    sameZoneAsBeirut,
    beirutHour,
    stations: () => stations,
    current,
    showStation,
    setPower,
    isOn: () => powerOn,
    FAIRUZ
  };

  // ================================================================== timers + start

  setInterval(updateClocks, 15000);
  setInterval(loadNewsIfStale, 60000);
  setInterval(loadWeather, 30 * 60 * 1000);
  setInterval(checkAlarm, 5000);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    loadNewsIfStale();
    updateClocks();
    checkAlarm();
    if (alarm) holdScreen(true); // the browser drops the wake lock when the tab is hidden
  });

  applyLanguage();
  loadStations();
  loadNews();
  loadWeather();
  if (alarm) holdScreen(true);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
})();

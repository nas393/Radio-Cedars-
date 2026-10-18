/* الزمن الجميل — the golden-age classics, grouped by mood.
   Song titles only (no lyrics). Listening links open a search on YouTube or
   Spotify, so they keep working when uploads move. */
window.SAWT_CLASSICS = {
  artists: {
    fairuz: { ar: 'فيروز', en: 'Fairuz', fr: 'Fairouz', search: 'Fairuz' },
    wadih: { ar: 'وديع الصافي', en: 'Wadih El Safi', fr: 'Wadih El Safi', search: 'Wadih El Safi' },
    sabah: { ar: 'صباح', en: 'Sabah', fr: 'Sabah', search: 'Sabah' },
    zaki: { ar: 'زكي ناصيف', en: 'Zaki Nassif', fr: 'Zaki Nassif', search: 'Zaki Nassif' }
  },
  moods: [
    {
      id: 'morning',
      title: { ar: 'الصبحية', en: 'Morning coffee', fr: 'Le café du matin' },
      line: {
        ar: 'فنجان قهوة على البلكون، والضيعة بعدها نايمة.',
        en: 'Coffee on the balcony while the village is still asleep.',
        fr: 'Un café sur le balcon, le village dort encore.'
      },
      station: 'fairuz',
      songs: [
        { artist: 'fairuz', ar: 'ع هدير البوسطة', latin: 'Ala Hadir el Bosta' },
        { artist: 'fairuz', ar: 'طلعت يا محلا نورها', latin: "Tel'et ya Mahla Nourha" },
        { artist: 'fairuz', ar: 'يا أنا يا أنا', latin: 'Ya Ana Ya Ana' },
        { artist: 'fairuz', ar: 'بكتب اسمك يا حبيبي', latin: 'Bektob Esmak ya Habibi' },
        { artist: 'fairuz', ar: 'شايف البحر شو كبير', latin: 'Shayef el Bahr Shou Kbir' },
        { artist: 'zaki', ar: 'طلّوا حبابنا', latin: 'Tallou Hbabna' },
        { artist: 'sabah', ar: 'يانا يانا', latin: 'Yana Yana' }
      ]
    },
    {
      id: 'sunday',
      title: { ar: 'غدا الأحد عند التيتا', en: 'Sunday lunch at Teta’s', fr: 'Le déjeuner du dimanche chez Teta' },
      line: {
        ar: 'تبولة، دبكة، والكل عم يحكي بنفس الوقت.',
        en: 'Tabbouleh, dabke, and everyone talking at once.',
        fr: 'Taboulé, dabké, et tout le monde parle en même temps.'
      },
      station: 'classics',
      songs: [
        { artist: 'sabah', ar: 'جيب المجوز يا عبود', latin: 'Jib el Mijwiz ya Abboud' },
        { artist: 'sabah', ar: 'عالبساطة', latin: 'Al Basata' },
        { artist: 'sabah', ar: 'ساعات ساعات', latin: "Sa'at Sa'at" },
        { artist: 'sabah', ar: 'زي العسل', latin: 'Zay el Assal' },
        { artist: 'wadih', ar: 'عندك بحرية يا ريس', latin: 'Indak Bahriyeh ya Rayyes' },
        { artist: 'wadih', ar: 'ولو', latin: 'Walaw' },
        { artist: 'zaki', ar: 'يا عاشقة الورد', latin: "Ya Ashiqat el Ward" },
        { artist: 'fairuz', ar: 'عودك رنان', latin: 'Oudak Rannan' }
      ]
    },
    {
      id: 'nostalgia',
      title: { ar: 'حنين', en: 'Homesick', fr: 'Le mal du pays' },
      line: {
        ar: 'للّيالي اللي بتشتاق فيها للبيت أكتر من العادة.',
        en: 'For the nights you miss home more than usual.',
        fr: 'Pour les soirs où la maison manque plus que d’habitude.'
      },
      station: 'nostalgia',
      songs: [
        { artist: 'fairuz', ar: 'لبيروت', latin: 'Li Beirut' },
        { artist: 'fairuz', ar: 'زوروني كل سنة مرة', latin: 'Zourouni Kel Sene Marra' },
        { artist: 'fairuz', ar: 'سألوني الناس', latin: 'Saalouni el Nas' },
        { artist: 'fairuz', ar: 'أنا وشادي', latin: 'Ana w Shadi' },
        { artist: 'fairuz', ar: 'نسّم علينا الهوا', latin: 'Nassam Alayna el Hawa' },
        { artist: 'wadih', ar: 'لبنان يا قطعة سما', latin: "Lebnan ya Ot'it Sama" },
        { artist: 'wadih', ar: 'الله معك يا بيت صامد بالجنوب', latin: 'Allah Ma3ak ya Beit Samed bil Janoub' },
        { artist: 'zaki', ar: 'راجع يتعمّر لبنان', latin: "Raje' Yet'ammar Lebnan" },
        { artist: 'zaki', ar: 'مهما يتجرّح بلدنا', latin: 'Mahma Yetjarrah Baladna' }
      ]
    }
  ]
};

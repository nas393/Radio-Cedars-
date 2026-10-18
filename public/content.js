/* Content for the objects in the room: the calendar, Teta's cookbook,
   the coffee cup and the cassette shelf. Three languages each. */
window.SAWT_CONTENT = {

  // ---------------------------------------------------------------- occasions
  // Islamic dates follow the moon and can shift by a day: marked approx: true.
  occasions: [
    { date: '2026-11-22', ar: 'عيد الاستقلال', en: 'Independence Day', fr: 'Fête de l’Indépendance' },
    { date: '2026-12-25', ar: 'الميلاد المجيد', en: 'Christmas', fr: 'Noël' },
    { date: '2027-01-01', ar: 'رأس السنة', en: 'New Year’s Day', fr: 'Jour de l’an' },
    { date: '2027-01-06', ar: 'الميلاد عند الأرمن', en: 'Armenian Christmas', fr: 'Noël arménien' },
    { date: '2027-02-08', approx: true, ar: 'بداية شهر رمضان', en: 'Ramadan begins', fr: 'Début du Ramadan' },
    { date: '2027-02-09', ar: 'عيد مار مارون', en: 'Saint Maroun’s Day', fr: 'Saint-Maroun' },
    { date: '2027-03-10', approx: true, ar: 'عيد الفطر', en: 'Eid al-Fitr', fr: 'Aïd el-Fitr' },
    { date: '2027-03-21', ar: 'عيد الأم', en: 'Mother’s Day', fr: 'Fête des mères' },
    { date: '2027-03-25', ar: 'عيد البشارة', en: 'Feast of the Annunciation', fr: 'Fête de l’Annonciation' },
    { date: '2027-03-28', ar: 'الفصح (الغربي)', en: 'Easter (Western)', fr: 'Pâques (rite latin)' },
    { date: '2027-05-01', ar: 'عيد العمّال', en: 'Labour Day', fr: 'Fête du Travail' },
    { date: '2027-05-02', ar: 'الفصح (الشرقي)', en: 'Easter (Orthodox)', fr: 'Pâques (rite oriental)' },
    { date: '2027-05-16', approx: true, ar: 'عيد الأضحى', en: 'Eid al-Adha', fr: 'Aïd al-Adha' },
    { date: '2027-05-25', ar: 'عيد المقاومة والتحرير', en: 'Resistance and Liberation Day', fr: 'Fête de la Libération' },
    { date: '2027-06-06', approx: true, ar: 'رأس السنة الهجرية', en: 'Islamic New Year', fr: 'Nouvel An de l’Hégire' },
    { date: '2027-06-15', approx: true, ar: 'عاشوراء', en: 'Ashura', fr: 'Achoura' },
    { date: '2027-08-01', ar: 'عيد الجيش', en: 'Army Day', fr: 'Fête de l’Armée' },
    { date: '2027-08-15', ar: 'عيد انتقال السيدة العذراء', en: 'Assumption of Mary', fr: 'Assomption' },
    { date: '2027-08-15', approx: true, ar: 'المولد النبوي الشريف', en: 'Prophet’s Birthday', fr: 'Mawlid' },
    { date: '2027-11-22', ar: 'عيد الاستقلال', en: 'Independence Day', fr: 'Fête de l’Indépendance' }
  ],
  // Ramadan 1448 (approx), for the iftar countdown
  ramadan: { start: '2027-02-08', end: '2027-03-09' },

  // ---------------------------------------------------------------- Teta's cookbook
  recipes: [
    {
      id: 'tabbouleh',
      title: { ar: 'تبّولة', en: 'Tabbouleh', fr: 'Taboulé' },
      serves: 4, time: 30,
      ingredients: {
        ar: ['٣ باقات بقدونس، مفروم ناعم', 'نصف باقة نعناع، مفروم', '٣ حبات بندورة، مقطّعة صغار', '٤ بصلات خضراء', 'ربع كوب برغل ناعم', 'عصير ٢ ليمونة', 'ربع كوب زيت زيتون', 'ملح وبهار حلو'],
        en: ['3 bunches flat parsley, finely chopped', '½ bunch mint, chopped', '3 tomatoes, finely diced', '4 spring onions, sliced', '¼ cup fine bulgur', 'Juice of 2 lemons', '¼ cup olive oil', 'Salt and Lebanese seven-spice'],
        fr: ['3 bottes de persil plat, finement haché', '½ botte de menthe, hachée', '3 tomates en petits dés', '4 oignons verts émincés', '¼ tasse de boulgour fin', 'Le jus de 2 citrons', '¼ tasse d’huile d’olive', 'Sel et sept-épices']
      },
      steps: {
        ar: ['انقعي البرغل بعصير البندورة والليمون ١٠ دقائق.', 'اغسلي البقدونس ونشّفيه منيح، وبعدين افرميه ناعم بالسكين.', 'اخلطي البقدونس والنعناع والبصل والبندورة مع البرغل.', 'تبّلي بالملح والبهار وزيت الزيتون والليمون قبل الأكل بشوي.', 'كليها مع ورق خسّ أو ملفوف.'],
        en: ['Soak the bulgur in the tomato juices and lemon for 10 minutes.', 'Wash the parsley, dry it very well, then chop it fine with a knife.', 'Mix parsley, mint, onions and tomatoes with the bulgur.', 'Season with salt, spice, olive oil and lemon just before serving.', 'Eat it scooped with lettuce or cabbage leaves.'],
        fr: ['Faites tremper le boulgour 10 minutes dans le jus des tomates et du citron.', 'Lavez le persil, séchez-le bien, puis hachez-le finement au couteau.', 'Mélangez persil, menthe, oignons et tomates avec le boulgour.', 'Assaisonnez sel, épices, huile et citron juste avant de servir.', 'Servez avec des feuilles de laitue ou de chou.']
      }
    },
    {
      id: 'hummus',
      title: { ar: 'حمّص بطحينة', en: 'Hummus', fr: 'Houmous' },
      serves: 4, time: 20,
      ingredients: {
        ar: ['٢ كوب حمّص مسلوق (مع شوية من مايّه)', 'ثلث كوب طحينة', 'عصير ليمونة ونص', 'فص ثوم', 'ملح', 'زيت زيتون، كمون وبابريكا للتزيين'],
        en: ['2 cups cooked chickpeas (keep some cooking water)', '⅓ cup tahini', 'Juice of 1½ lemons', '1 garlic clove', 'Salt', 'Olive oil, cumin and paprika to finish'],
        fr: ['2 tasses de pois chiches cuits (garder un peu d’eau de cuisson)', '⅓ tasse de tahiné', 'Le jus d’1 citron et demi', '1 gousse d’ail', 'Sel', 'Huile d’olive, cumin et paprika pour finir']
      },
      steps: {
        ar: ['اطحني الحمّص وهو سخن مع الثوم والملح.', 'زيدي الطحينة والليمون واطحني لحتى يصير ناعم.', 'زيدي مايّة الحمّص شوي شوي لحتى يصير متل الكريما.', 'افرديه بالصحن، وزيّنيه بزيت الزيتون والكمون وحبّات حمّص.'],
        en: ['Blend the chickpeas while warm with the garlic and salt.', 'Add the tahini and lemon and blend until smooth.', 'Loosen with the cooking water, a spoon at a time, until creamy.', 'Spread on a plate and finish with olive oil, cumin and a few whole chickpeas.'],
        fr: ['Mixez les pois chiches encore tièdes avec l’ail et le sel.', 'Ajoutez le tahiné et le citron, mixez jusqu’à obtenir une texture lisse.', 'Détendez avec l’eau de cuisson, cuillère par cuillère, jusqu’à ce que ce soit crémeux.', 'Étalez dans l’assiette, arrosez d’huile, de cumin et de quelques pois chiches.']
      }
    },
    {
      id: 'mjaddara',
      title: { ar: 'مجدّرة', en: 'Mjaddara', fr: 'Mjaddara' },
      serves: 4, time: 50,
      ingredients: {
        ar: ['كوب عدس أسود', 'نص كوب رز أو برغل خشن', '٣ بصلات كبار، مقطّعة شرايح', 'نص كوب زيت زيتون', 'ملح وكمون'],
        en: ['1 cup brown lentils', '½ cup rice or coarse bulgur', '3 large onions, sliced', '½ cup olive oil', 'Salt and cumin'],
        fr: ['1 tasse de lentilles brunes', '½ tasse de riz ou de boulgour gros', '3 gros oignons émincés', '½ tasse d’huile d’olive', 'Sel et cumin']
      },
      steps: {
        ar: ['اسلقي العدس بـ٤ كاسات مايّة ٢٠ دقيقة.', 'بهالوقت، حمّري البصل بالزيت على نار وسط لحتى يصير بنّي غامق.', 'زيدي الرز ونص البصل على العدس مع الملح والكمون، وطبخيهم ٢٠ دقيقة.', 'زيّني بالبصل المحمّر الباقي، وكليها مع لبن وسلطة.'],
        en: ['Simmer the lentils in 4 cups of water for 20 minutes.', 'Meanwhile fry the onions in the oil over medium heat until deep brown.', 'Add the rice, half the onions, salt and cumin to the lentils; cook 20 more minutes.', 'Top with the rest of the onions. Serve with yoghurt and a salad.'],
        fr: ['Faites cuire les lentilles 20 minutes dans 4 tasses d’eau.', 'Pendant ce temps, faites dorer les oignons dans l’huile jusqu’à ce qu’ils soient bien bruns.', 'Ajoutez le riz, la moitié des oignons, le sel et le cumin ; cuisez encore 20 minutes.', 'Garnissez du reste des oignons. Servez avec du yaourt et une salade.']
      }
    },
    {
      id: 'fattoush',
      title: { ar: 'فتّوش', en: 'Fattoush', fr: 'Fattouch' },
      serves: 4, time: 25,
      ingredients: {
        ar: ['رغيفين خبز عربي، محمّص ومكسّر', 'خسّة، مقطّعة', '٢ بندورة و٢ خيارة', 'فجل وبصل أخضر', 'بقلة ونعناع', 'سمّاق، دبس رمّان، ليمون وزيت زيتون'],
        en: ['2 rounds pita, toasted and broken', '1 lettuce, chopped', '2 tomatoes and 2 cucumbers', 'Radishes and spring onions', 'Purslane and mint', 'Sumac, pomegranate molasses, lemon and olive oil'],
        fr: ['2 pains libanais grillés et cassés', '1 laitue émincée', '2 tomates et 2 concombres', 'Radis et oignons verts', 'Pourpier et menthe', 'Sumac, mélasse de grenade, citron et huile d’olive']
      },
      steps: {
        ar: ['حمّصي الخبز بالفرن أو اقليه لحتى يقرمش.', 'قطّعي الخضرة قطع وسط وحطّيها بجاط كبير.', 'اخلطي الليمون ودبس الرمّان والزيت والسمّاق والملح.', 'صبّي التتبيلة، وزيدي الخبز آخر شي لحتى يضل يقرمش.'],
        en: ['Toast or fry the bread until crisp.', 'Cut the vegetables into bite-size pieces in a big bowl.', 'Whisk lemon, molasses, oil, sumac and salt.', 'Dress the salad and add the bread last so it stays crunchy.'],
        fr: ['Faites griller ou frire le pain jusqu’à ce qu’il soit croustillant.', 'Coupez les légumes en bouchées dans un grand saladier.', 'Fouettez citron, mélasse, huile, sumac et sel.', 'Assaisonnez et ajoutez le pain en dernier pour qu’il reste croquant.']
      }
    }
  ],

  // ---------------------------------------------------------------- coffee-cup reading (for fun)
  coffee: {
    symbols: [
      { ar: 'طير', en: 'a bird', fr: 'un oiseau', mean: { ar: 'خبر حلو جايي من بعيد.', en: 'Good news is on its way from far away.', fr: 'Une bonne nouvelle arrive de loin.' } },
      { ar: 'طريق', en: 'a road', fr: 'une route', mean: { ar: 'سفرة قريبة، يمكن عالبيت.', en: 'A trip soon, maybe back home.', fr: 'Un voyage bientôt, peut-être vers la maison.' } },
      { ar: 'خاتم', en: 'a ring', fr: 'une bague', mean: { ar: 'فرحة بالعيلة.', en: 'A celebration in the family.', fr: 'Une fête dans la famille.' } },
      { ar: 'سمكة', en: 'a fish', fr: 'un poisson', mean: { ar: 'رزقة وبركة بالشغل.', en: 'Luck and plenty at work.', fr: 'De la chance et de l’abondance au travail.' } },
      { ar: 'جبل', en: 'a mountain', fr: 'une montagne', mean: { ar: 'تعب صغير وبعدو راحة كبيرة.', en: 'A small climb, then a long rest.', fr: 'Un petit effort, puis un grand repos.' } },
      { ar: 'باب', en: 'a door', fr: 'une porte', mean: { ar: 'فرصة جديدة عم تنفتح.', en: 'A new door is opening for you.', fr: 'Une nouvelle porte s’ouvre pour vous.' } },
      { ar: 'أرزة', en: 'a cedar', fr: 'un cèdre', mean: { ar: 'حدا بالبيت عم يفكّر فيك هلّق.', en: 'Someone back home is thinking of you right now.', fr: 'Quelqu’un à la maison pense à vous en ce moment.' } },
      { ar: 'قلب', en: 'a heart', fr: 'un cœur', mean: { ar: 'محبّة صافية حواليك.', en: 'Pure love around you.', fr: 'Un amour sincère autour de vous.' } }
    ],
    wishes: {
      ar: ['اتصل بإمّك اليوم.', 'نيّالك، الدنيا ضاحكتلك.', 'الصيف الجايي بلبنان.', 'إشرب كمان فنجان، بعد بكّير.'],
      en: ['Call your mother today.', 'Lucky you, life is smiling at you.', 'Next summer in Lebanon.', 'Have another cup; it’s still early.'],
      fr: ['Appelez votre mère aujourd’hui.', 'Quelle chance, la vie vous sourit.', 'L’été prochain au Liban.', 'Reprenez une tasse, il est encore tôt.']
    }
  },

  // ---------------------------------------------------------------- the cassette shelf: 12 moods
  // `spotify` holds a playlist id once the playlists exist in Nassim's account.
  moods: [
    { id: 'morning', colors: ['#C2452F', '#E9C46A'], ar: 'الصبحية مع فيروز', en: 'Morning coffee with Fairuz', fr: 'Café du matin avec Fairouz', who: 'Fairuz · Zaki Nassif', q: 'Fairuz morning', yt: 'PL3tcHwR_toAHc3arjIEiuPlnjpLctmv1r', spotify: '3JcICvPgmXxoxLm565mYJm' },
    { id: 'sunday', colors: ['#2F7A55', '#E9C46A'], ar: 'غدا الأحد ودبكة', en: 'Sunday lunch and dabke', fr: 'Déjeuner du dimanche et dabké', who: 'Sabah · Wadih El Safi', q: 'Lebanese dabke', yt: 'PLc1CZ02zGz6o18eZqUOSPPEqsLPPQBbkf', spotify: '7hfWeTdh0Mj07kQ6Yw7mjx' },
    { id: 'homesick', colors: ['#1F3557', '#A9C8E6'], ar: 'حنين', en: 'Homesick nights', fr: 'Nuits de nostalgie', who: 'Fairuz · Ziad Rahbani · Marcel Khalife', q: 'Fairuz Ziad Rahbani', yt: 'PLNLM7rnJMYsjSOhpEDRb-b9FDQ8hwiZbV', spotify: '2oSgXA6DmWBzDn7b2l1w1t' },
    { id: 'pop', colors: ['#8E2533', '#F2C1D1'], ar: 'بوب التسعينات والألفين', en: '90s and 2000s Lebanese pop', fr: 'Pop libanaise des années 90 et 2000', who: 'Ragheb Alameh · Nawal El Zoghbi · Elissa', q: 'Lebanese pop 90s 2000s', yt: 'PLRdd5zeONkNL7BE6y_QivFvWfGghWhpvH', spotify: '7jY2HdlSJtfTR6ivJq6pwU' },
    { id: 'roadtrip', colors: ['#5B7F3A', '#F3D6A8'], ar: 'مشوار عالجبل', en: 'Road trip to the mountains', fr: 'Virée à la montagne', who: 'Melhem Barakat · Wadih El Safi', q: 'Melhem Barakat', yt: 'PL7ViFUMYDgowU_htgZ9n4GJFmdsZypBOX', spotify: '37i9dQZF1DZ06evO35nAVh' },
    { id: 'wedding', colors: ['#D9A441', '#FBF6EC'], ar: 'عرس وزفّة', en: 'Wedding and zaffeh', fr: 'Mariage et zaffé', who: 'Zaffeh · dabke', q: 'Lebanese zaffeh wedding', yt: 'PL6gIGFZ71FWWwUCOVjxkQlHCUtGhCpsmv', spotify: '4JOqW2jjobXCXyoQg4sr9M' },
    { id: 'summer', colors: ['#3D74B8', '#F7D9AA'], ar: 'صيف بالبترون وجبيل', en: 'Summer in Batroun and Jbeil', fr: 'Été à Batroun et Byblos', who: 'Beach · sunset', q: 'Lebanese summer songs', yt: 'PL46eS-T3vbrSj5U-w0oe4Ck6RD9Ch_VH4', spotify: '3odScW3BTKjNJuVwjMuhAQ' },
    { id: 'rain', colors: ['#4A5568', '#C9D3DC'], ar: 'مسا بيروت تحت الشتي', en: 'Rainy Beirut evening', fr: 'Soir de pluie à Beyrouth', who: 'Fairuz · Ziad Rahbani', q: 'Fairuz winter', yt: 'PL5iHky7uIPtDS5L_zoWPmzxSi-RmYriaT', spotify: '37i9dQZF1DZ06evO03FbPP' },
    { id: 'feasts', colors: ['#2F7A55', '#C2452F'], ar: 'الميلاد والعيد', en: 'Christmas and Eid', fr: 'Noël et l’Aïd', who: 'Fairuz Christmas · Eid songs', q: 'Fairuz Christmas', yt: 'PLOEJMz3qzD-LM0MTnkVPRLwzqQj054sKd', spotify: '23jFlC9YIbIOe72roJdizW' },
    { id: 'kids', colors: ['#E9C46A', '#3D74B8'], ar: 'أغاني ولاد التسعينات', en: 'Kids’ songs from the 90s', fr: 'Chansons d’enfants des années 90', who: 'Morning TV favourites', q: 'أغاني أطفال التسعينات', yt: 'PLAz96y4H_OW-7FEw621wjkcC_mh5mOejM', spotify: '5skFT68BOjo9m7WFJcn32d' },
    { id: 'patriotic', colors: ['#C2452F', '#FBF6EC'], ar: 'أغاني وطنية', en: 'National and patriotic songs', fr: 'Chants nationaux et patriotiques', who: 'Wadih El Safi · Fairuz · Melhem Barakat', q: 'Lebanese patriotic songs', yt: 'PLrxkBBtRMNzhoPwgj6GP4MBCu_rrrccGS', spotify: '15ZLiXsGUmt6EKnFzmfkDJ' },
    { id: 'ziad', colors: ['#1D1A16', '#D9A441'], ar: 'مسرح زياد الرحباني', en: 'Ziad Rahbani plays and sketches', fr: 'Pièces et sketches de Ziad Rahbani', who: 'Ziad Rahbani', q: 'Ziad Rahbani', yt: 'PLlJHuyf1PY3vZ_6hbVBBc2-WnJ9rtB0A7', spotify: '37i9dQZF1DZ06evO303TAH' }
  ]
};

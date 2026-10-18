/* Teta's cookbook, the long version. Each step can carry a timer (seconds). */
window.SAWT_RECIPES = [
  {
    id: 'baba', cat: 'mezze', serves: 4, time: 45,
    title: { ar: 'بابا غنّوج', en: 'Baba ghanouj', fr: 'Baba ghanouj' },
    ing: {
      ar: ['٢ باذنجانة كبار', '٣ ملاعق طحينة', 'عصير ليمونة', 'فص ثوم مدقوق', 'ملح', 'زيت زيتون ورمّان للتزيين'],
      en: ['2 large aubergines', '3 tbsp tahini', 'Juice of 1 lemon', '1 garlic clove, crushed', 'Salt', 'Olive oil and pomegranate seeds to finish'],
      fr: ['2 grosses aubergines', '3 c. à soupe de tahiné', 'Le jus d’1 citron', '1 gousse d’ail écrasée', 'Sel', 'Huile d’olive et grains de grenade']
    },
    steps: {
      ar: ['اشوي الباذنجان عالنار أو بالفرن لحتى تسود القشرة ويطرى من جوّا.', 'حطّيه بكيس أو تحت غطا ليعرق شوي.', 'قشّريه وصفّيه من المي، واهرسيه بالشوكة.', 'زيدي الطحينة والليمون والثوم والملح وخلطي.', 'زيّنيه بالزيت والرمّان.'],
      en: ['Char the aubergines over a flame or in a hot oven until black outside and soft inside.', 'Leave them covered to sweat.', 'Peel, drain off the juices and mash with a fork.', 'Stir in tahini, lemon, garlic and salt.', 'Finish with olive oil and pomegranate.'],
      fr: ['Grillez les aubergines sur la flamme ou au four jusqu’à ce que la peau noircisse et que la chair soit fondante.', 'Laissez-les suer sous un couvercle.', 'Pelez, égouttez et écrasez à la fourchette.', 'Ajoutez tahiné, citron, ail et sel.', 'Arrosez d’huile et parsemez de grenade.']
    },
    timers: [1800, 600, 0, 0, 0]
  },
  {
    id: 'labneh', cat: 'breakfast', serves: 6, time: 15,
    title: { ar: 'لبنة البيت', en: 'Homemade labneh', fr: 'Labné maison' },
    ing: {
      ar: ['١ كيلو لبن', 'ملعقة صغيرة ملح', 'قطعة شاش', 'زيت زيتون ونعنع يابس'],
      en: ['1 kg plain yoghurt', '1 tsp salt', 'A piece of muslin', 'Olive oil and dried mint'],
      fr: ['1 kg de yaourt nature', '1 c. à café de sel', 'Une étamine', 'Huile d’olive et menthe séchée']
    },
    steps: {
      ar: ['اخلطي اللبن مع الملح.', 'حطّيه بالشاش وعلّقيه فوق وعا.', 'خلّيه يصفّي بالبرّاد ليلة كاملة.', 'افرديها بالصحن مع زيت ونعنع.'],
      en: ['Mix the yoghurt with the salt.', 'Spoon it into the muslin and hang it over a bowl.', 'Let it drain in the fridge overnight.', 'Spread on a plate with olive oil and mint.'],
      fr: ['Mélangez le yaourt et le sel.', 'Versez dans l’étamine et suspendez au-dessus d’un bol.', 'Laissez égoutter une nuit au réfrigérateur.', 'Étalez dans l’assiette avec huile et menthe.']
    },
    timers: [0, 0, 43200, 0]
  },
  {
    id: 'manoushe', cat: 'breakfast', serves: 6, time: 120,
    title: { ar: 'منقوشة زعتر', en: 'Za’atar manoushe', fr: 'Manouché au zaatar' },
    ing: {
      ar: ['٣ كوب طحين', 'ملعقة صغيرة خميرة', 'ملعقة صغيرة سكر', 'ملعقة صغيرة ملح', 'كوب مي فاترة', '٣ ملاعق زيت', 'نص كوب زعتر مع نص كوب زيت زيتون'],
      en: ['3 cups flour', '1 tsp yeast', '1 tsp sugar', '1 tsp salt', '1 cup warm water', '3 tbsp oil', '½ cup za’atar mixed with ½ cup olive oil'],
      fr: ['3 tasses de farine', '1 c. à café de levure', '1 c. à café de sucre', '1 c. à café de sel', '1 tasse d’eau tiède', '3 c. à soupe d’huile', '½ tasse de zaatar mélangé à ½ tasse d’huile d’olive']
    },
    steps: {
      ar: ['اخلطي الطحين والخميرة والسكر والملح، وزيدي المي والزيت وعجني ١٠ دقايق.', 'غطّي العجينة وخلّيها تخمر لحتى تضاعف.', 'قسّميها طابات وافرديها رقاق.', 'ادهني الزعتر وانقشي بأصابيعك.', 'اخبزيها بفرن حامي كتير لحتى تحمرّ الأطراف.'],
      en: ['Mix flour, yeast, sugar and salt, add water and oil and knead for 10 minutes.', 'Cover and let it rise until doubled.', 'Divide into balls and roll out thin.', 'Spread the za’atar and press dimples with your fingertips.', 'Bake in a very hot oven until the edges are golden.'],
      fr: ['Mélangez farine, levure, sucre et sel, ajoutez eau et huile, pétrissez 10 minutes.', 'Couvrez et laissez doubler de volume.', 'Formez des boules et étalez finement.', 'Étalez le zaatar et marquez du bout des doigts.', 'Enfournez à four très chaud jusqu’à ce que les bords dorent.']
    },
    timers: [600, 3600, 0, 0, 480]
  },
  {
    id: 'foul', cat: 'breakfast', serves: 4, time: 20,
    title: { ar: 'فول مدمّس', en: 'Foul mdammas', fr: 'Foul moudammas' },
    ing: {
      ar: ['علبتين فول', 'نص كوب حمّص مسلوق', '٢ فص ثوم', 'عصير ليمونتين', 'كمّون وملح', 'بقدونس، بندورة وزيت زيتون'],
      en: ['2 tins fava beans', '½ cup cooked chickpeas', '2 garlic cloves', 'Juice of 2 lemons', 'Cumin and salt', 'Parsley, tomato and olive oil'],
      fr: ['2 boîtes de fèves', '½ tasse de pois chiches cuits', '2 gousses d’ail', 'Le jus de 2 citrons', 'Cumin et sel', 'Persil, tomate et huile d’olive']
    },
    steps: {
      ar: ['سخّني الفول والحمّص بمايّتهن على نار خفيفة.', 'دقّي الثوم مع الملح وزيدي الليمون.', 'اهرسي الفول شوي وخلطيه مع الثوم والكمّون.', 'زيّنيه بالبقدونس والبندورة وكتير زيت.'],
      en: ['Warm the beans and chickpeas in their liquid over low heat.', 'Pound the garlic with salt and add the lemon.', 'Mash the beans a little and mix in the garlic and cumin.', 'Top with parsley, tomato and plenty of oil.'],
      fr: ['Réchauffez fèves et pois chiches dans leur jus à feu doux.', 'Pilez l’ail avec le sel et ajoutez le citron.', 'Écrasez un peu les fèves et mélangez avec l’ail et le cumin.', 'Garnissez de persil, tomate et beaucoup d’huile.']
    },
    timers: [600, 0, 0, 0]
  },
  {
    id: 'kibbeh', cat: 'main', serves: 6, time: 90,
    title: { ar: 'كبّة بالصينية', en: 'Kibbeh bil sanieh', fr: 'Kebbé au plat' },
    ing: {
      ar: ['٢ كوب برغل ناعم', '٥٠٠ غ لحمة هبرة مطحونة', 'بصلة مبروشة', '٣٠٠ غ لحمة مفرومة للحشوة', 'بصلتين مفرومين', 'نص كوب صنوبر', 'بهار، قرفة، ملح', 'سمنة أو زيت'],
      en: ['2 cups fine bulgur', '500 g lean minced meat (for the shell)', '1 onion, grated', '300 g minced meat (filling)', '2 onions, chopped', '½ cup pine nuts', 'Seven-spice, cinnamon, salt', 'Ghee or oil'],
      fr: ['2 tasses de boulgour fin', '500 g de viande maigre hachée (pâte)', '1 oignon râpé', '300 g de viande hachée (farce)', '2 oignons hachés', '½ tasse de pignons', 'Sept-épices, cannelle, sel', 'Beurre clarifié ou huile']
    },
    steps: {
      ar: ['انقعي البرغل ١٠ دقايق وعصريه منيح.', 'اعجني البرغل مع الهبرة والبصل والبهار لحتى تصير عجينة ناعمة.', 'للحشوة: قلّي البصل، زيدي اللحمة والصنوبر والبهار لحتى تستوي.', 'افردي نص العجينة بالصينية، الحشوة فوقها، وبعدين باقي العجينة.', 'قطّعيها معيّنات، ادهني سمنة، واخبزي بفرن ٢٠٠ درجة.'],
      en: ['Soak the bulgur for 10 minutes and squeeze it dry.', 'Knead the bulgur with the lean meat, onion and spice into a smooth paste.', 'Filling: fry the onions, add the meat, pine nuts and spice until cooked.', 'Press half the paste into a tray, add the filling, cover with the rest.', 'Score into diamonds, brush with ghee and bake at 200°C.'],
      fr: ['Faites tremper le boulgour 10 minutes et essorez-le.', 'Pétrissez boulgour, viande maigre, oignon et épices en pâte lisse.', 'Farce : faites revenir les oignons, ajoutez viande, pignons et épices jusqu’à cuisson.', 'Étalez la moitié de la pâte dans un plat, la farce, puis le reste de pâte.', 'Tracez des losanges, badigeonnez de beurre et enfournez à 200 °C.']
    },
    timers: [600, 0, 900, 0, 2400]
  },
  {
    id: 'kafta', cat: 'main', serves: 4, time: 60,
    title: { ar: 'كفتة بالصينية', en: 'Kafta bil sanieh', fr: 'Kafta au four' },
    ing: {
      ar: ['٦٠٠ غ لحمة مفرومة', 'بصلة وباقة بقدونس مفرومين', '٣ حبات بطاطا شرحات', '٣ بندورة شرحات', 'كوب صلصة بندورة مخففة', 'بهار وملح'],
      en: ['600 g minced meat', '1 onion and a bunch of parsley, chopped', '3 potatoes, sliced', '3 tomatoes, sliced', '1 cup thinned tomato sauce', 'Seven-spice and salt'],
      fr: ['600 g de viande hachée', '1 oignon et une botte de persil hachés', '3 pommes de terre en rondelles', '3 tomates en rondelles', '1 tasse de sauce tomate allongée', 'Sept-épices et sel']
    },
    steps: {
      ar: ['اعجني اللحمة مع البصل والبقدونس والبهار.', 'افرديها بالصينية متل الرغيف.', 'اقلي البطاطا شوي أو حمّريها بالفرن.', 'صفّي البطاطا والبندورة فوق الكفتة وزيدي الصلصة.', 'اخبزيها بالفرن لحتى تستوي البطاطا.'],
      en: ['Knead the meat with onion, parsley and spice.', 'Press it into a tray like a flat loaf.', 'Fry or roast the potato slices briefly.', 'Layer potatoes and tomatoes over the kafta and pour on the sauce.', 'Bake until the potatoes are tender.'],
      fr: ['Pétrissez la viande avec oignon, persil et épices.', 'Étalez-la dans un plat comme une galette.', 'Faites dorer brièvement les pommes de terre.', 'Disposez pommes de terre et tomates sur la kafta et versez la sauce.', 'Enfournez jusqu’à ce que les pommes de terre soient tendres.']
    },
    timers: [0, 0, 600, 0, 2100]
  },
  {
    id: 'tawouk', cat: 'main', serves: 4, time: 40,
    title: { ar: 'شيش طاووق', en: 'Shish taouk', fr: 'Chich taouk' },
    ing: {
      ar: ['٧٥٠ غ صدر دجاج مكعّبات', '٣ ملاعق لبن', 'عصير ليمونة', '٤ فصوص ثوم', 'ملعقة رب بندورة', 'بابريكا، زعتر، ملح', 'توم للتغميس'],
      en: ['750 g chicken breast, cubed', '3 tbsp yoghurt', 'Juice of 1 lemon', '4 garlic cloves', '1 tbsp tomato paste', 'Paprika, thyme, salt', 'Toum (garlic sauce) to serve'],
      fr: ['750 g de blanc de poulet en cubes', '3 c. à soupe de yaourt', 'Le jus d’1 citron', '4 gousses d’ail', '1 c. à soupe de concentré de tomate', 'Paprika, thym, sel', 'Toum (sauce à l’ail)']
    },
    steps: {
      ar: ['اخلطي اللبن والليمون والثوم ورب البندورة والبهارات.', 'تبّلي الدجاج وخلّيه بالبرّاد ساعتين أقلّ شي.', 'شكّي الدجاج بالأسياخ.', 'اشويه عالفحم أو بالفرن، وقلّبيه.', 'قدّميه مع التوم والخبز والمخلّل.'],
      en: ['Mix yoghurt, lemon, garlic, tomato paste and spices.', 'Coat the chicken and chill for at least 2 hours.', 'Thread onto skewers.', 'Grill over charcoal or under the oven grill, turning.', 'Serve with toum, bread and pickles.'],
      fr: ['Mélangez yaourt, citron, ail, concentré et épices.', 'Enrobez le poulet et réfrigérez au moins 2 heures.', 'Enfilez sur des brochettes.', 'Grillez au charbon ou au gril du four en retournant.', 'Servez avec la toum, du pain et des pickles.']
    },
    timers: [0, 7200, 0, 900, 0]
  },
  {
    id: 'warak', cat: 'main', serves: 6, time: 120,
    title: { ar: 'ورق عنب بزيت', en: 'Stuffed vine leaves', fr: 'Feuilles de vigne farcies' },
    ing: {
      ar: ['٥٠ ورقة عنب', 'كوب رز مصري', '٣ بندورة مفرومة ناعم', 'باقة بقدونس ونعنع', 'بصلة', 'عصير ٣ ليمونات', 'نص كوب زيت زيتون', 'حبتين بطاطا شرحات لقعر الطنجرة'],
      en: ['50 vine leaves', '1 cup short-grain rice', '3 tomatoes, finely chopped', 'A bunch of parsley and mint', '1 onion', 'Juice of 3 lemons', '½ cup olive oil', '2 potatoes, sliced, for the pot base'],
      fr: ['50 feuilles de vigne', '1 tasse de riz rond', '3 tomates finement hachées', 'Une botte de persil et de menthe', '1 oignon', 'Le jus de 3 citrons', '½ tasse d’huile d’olive', '2 pommes de terre en rondelles pour le fond']
    },
    steps: {
      ar: ['اسلقي ورق العنب دقيقتين وصفّيه.', 'اخلطي الرز مع الخضرا والبندورة والبصل ونص الزيت والليمون.', 'لفّي كل ورقة رفيعة ومرصوصة.', 'صفّي البطاطا بالقعر والورق فوقها، وزيدي باقي الزيت والليمون ومي.', 'غطّي بصحن وطبّخي على نار خفيفة.', 'خلّيه يبرد بالطنجرة قبل ما تقلبيه.'],
      en: ['Blanch the vine leaves for 2 minutes and drain.', 'Mix the rice with herbs, tomatoes, onion and half the oil and lemon.', 'Roll each leaf thin and tight.', 'Line the pot with potato, pack the rolls on top, add the rest of the oil, lemon and water.', 'Weigh down with a plate and simmer gently.', 'Let it cool in the pot before turning out.'],
      fr: ['Blanchissez les feuilles 2 minutes et égouttez.', 'Mélangez le riz avec herbes, tomates, oignon et la moitié de l’huile et du citron.', 'Roulez chaque feuille fine et serrée.', 'Tapissez la cocotte de pommes de terre, rangez les rouleaux, ajoutez le reste d’huile, de citron et de l’eau.', 'Couvrez d’une assiette et laissez mijoter doucement.', 'Laissez refroidir dans la cocotte avant de démouler.']
    },
    timers: [120, 0, 0, 0, 3600, 1800]
  },
  {
    id: 'mloukhieh', cat: 'main', serves: 6, time: 90,
    title: { ar: 'ملوخيّة بالدجاج', en: 'Mloukhieh with chicken', fr: 'Mloukhieh au poulet' },
    ing: {
      ar: ['دجاجة مقطّعة', '٤٠٠ غ ملوخية ورق (يابسة أو مجلّدة)', 'راس ثوم', 'باقة كزبرة', 'عصير ليمونتين', 'بصل مفروم بخلّ للتقديم', 'رز مفلفل'],
      en: ['1 chicken, jointed', '400 g mloukhieh leaves (dried or frozen)', '1 head of garlic', 'A bunch of coriander', 'Juice of 2 lemons', 'Onion chopped in vinegar, to serve', 'Plain rice'],
      fr: ['1 poulet découpé', '400 g de feuilles de mloukhieh (sèches ou surgelées)', '1 tête d’ail', 'Une botte de coriandre', 'Le jus de 2 citrons', 'Oignon haché au vinaigre', 'Riz blanc']
    },
    steps: {
      ar: ['اسلقي الدجاج مع بهار وورق غار، واحفظي المرق.', 'قلّي الثوم والكزبرة بالزيت لحتى يفوح.', 'زيدي الملوخية وقلّبي، وبعدين المرق.', 'رجّعي الدجاج وخلّيه يغلي على نار خفيفة.', 'زيدي الليمون آخر شي وقدّميها مع الرز والبصل بالخل.'],
      en: ['Boil the chicken with spice and bay leaves; keep the stock.', 'Fry the garlic and coriander in oil until fragrant.', 'Add the mloukhieh, stir, then the stock.', 'Return the chicken and simmer gently.', 'Add the lemon at the end; serve with rice and the vinegar onions.'],
      fr: ['Faites bouillir le poulet avec épices et laurier ; gardez le bouillon.', 'Faites revenir l’ail et la coriandre jusqu’à ce que ça embaume.', 'Ajoutez la mloukhieh, remuez, puis le bouillon.', 'Remettez le poulet et laissez mijoter.', 'Ajoutez le citron à la fin ; servez avec riz et oignons au vinaigre.']
    },
    timers: [2700, 180, 0, 1200, 0]
  },
  {
    id: 'fasolia', cat: 'main', serves: 6, time: 75,
    title: { ar: 'فاصوليا بيضا مع رز', en: 'White beans and rice', fr: 'Haricots blancs et riz' },
    ing: {
      ar: ['٢ كوب فاصوليا بيضا منقوعة ليلة', '٤٠٠ غ لحمة مكعّبات', 'بصلة', '٤ فصوص ثوم وكزبرة', '٣ ملاعق رب بندورة', 'بهار وملح', 'رز بشعيرية'],
      en: ['2 cups white beans, soaked overnight', '400 g beef or lamb, cubed', '1 onion', '4 garlic cloves and coriander', '3 tbsp tomato paste', 'Seven-spice and salt', 'Rice with vermicelli'],
      fr: ['2 tasses de haricots blancs trempés une nuit', '400 g de viande en cubes', '1 oignon', '4 gousses d’ail et coriandre', '3 c. à soupe de concentré de tomate', 'Sept-épices et sel', 'Riz aux vermicelles']
    },
    steps: {
      ar: ['حمّري اللحمة مع البصل.', 'زيدي المي واسلقي اللحمة لحتى تطرى.', 'زيدي الفاصوليا ورب البندورة والبهار.', 'طبّخيها لحتى تستوي الفاصوليا.', 'قلّي الثوم والكزبرة وزيديهن آخر شي.'],
      en: ['Brown the meat with the onion.', 'Add water and simmer until tender.', 'Add the beans, tomato paste and spice.', 'Cook until the beans are soft.', 'Fry garlic and coriander and stir in at the end.'],
      fr: ['Faites dorer la viande avec l’oignon.', 'Couvrez d’eau et mijotez jusqu’à tendreté.', 'Ajoutez haricots, concentré et épices.', 'Cuisez jusqu’à ce que les haricots soient fondants.', 'Faites revenir ail et coriandre et ajoutez à la fin.']
    },
    timers: [480, 2400, 0, 1800, 120]
  },
  {
    id: 'riz-djeij', cat: 'main', serves: 6, time: 90,
    title: { ar: 'رز عَ دجاج', en: 'Riz a djej (chicken and rice)', fr: 'Riz au poulet' },
    ing: {
      ar: ['دجاجة', '٢ كوب رز', '٣٠٠ غ لحمة مفرومة', 'نص كوب صنوبر ولوز', 'سمنة', 'بهار، قرفة، ملح'],
      en: ['1 chicken', '2 cups rice', '300 g minced meat', '½ cup pine nuts and almonds', 'Ghee', 'Seven-spice, cinnamon, salt'],
      fr: ['1 poulet', '2 tasses de riz', '300 g de viande hachée', '½ tasse de pignons et d’amandes', 'Beurre clarifié', 'Sept-épices, cannelle, sel']
    },
    steps: {
      ar: ['اسلقي الدجاجة مع قرفة وورق غار، واحفظي المرق.', 'حمّري اللحمة المفرومة بالسمنة مع البهار.', 'زيدي الرز وقلّبي، وبعدين المرق.', 'خلّيه يستوي على نار خفيفة.', 'قمّري المكسّرات، وقدّمي الرز والدجاج فوقه والمكسّرات.'],
      en: ['Boil the chicken with cinnamon and bay; keep the stock.', 'Brown the minced meat in ghee with the spice.', 'Add the rice, stir, then the stock.', 'Cook covered over low heat.', 'Toast the nuts; serve the rice topped with chicken and nuts.'],
      fr: ['Faites bouillir le poulet avec cannelle et laurier ; gardez le bouillon.', 'Faites dorer la viande hachée au beurre avec les épices.', 'Ajoutez le riz, remuez, puis le bouillon.', 'Cuisez à couvert à feu doux.', 'Faites griller les fruits secs ; servez le riz garni de poulet et de noix.']
    },
    timers: [3000, 480, 0, 1200, 300]
  },
  {
    id: 'sayadieh', cat: 'main', serves: 4, time: 70,
    title: { ar: 'صيّادية', en: 'Sayadieh (fish and rice)', fr: 'Sayadieh (poisson et riz)' },
    ing: {
      ar: ['كيلو سمك أبيض', '٣ بصلات شرحات', '٢ كوب رز', 'كمّون وملح', 'صنوبر محمّر', 'ليمون وطرطور للتقديم'],
      en: ['1 kg white fish', '3 onions, sliced', '2 cups rice', 'Cumin and salt', 'Toasted pine nuts', 'Lemon and tarator to serve'],
      fr: ['1 kg de poisson blanc', '3 oignons émincés', '2 tasses de riz', 'Cumin et sel', 'Pignons grillés', 'Citron et tarator']
    },
    steps: {
      ar: ['تبّلي السمك بالكمّون والملح واقليه.', 'حمّري البصل لحتى يصير بنّي غامق.', 'اسلقي البصل بالمي واعمليه مرق بنّي.', 'زيدي الرز للمرق مع الكمّون وخلّيه يستوي.', 'قدّمي الرز والسمك فوقه والصنوبر، مع الطرطور.'],
      en: ['Season the fish with cumin and salt and fry it.', 'Fry the onions until deep brown.', 'Simmer the onions in water to make a dark stock.', 'Cook the rice in the stock with cumin.', 'Serve the rice topped with fish and pine nuts, with tarator.'],
      fr: ['Assaisonnez le poisson de cumin et de sel et faites-le frire.', 'Faites brunir les oignons.', 'Faites-les mijoter dans l’eau pour un bouillon brun.', 'Cuisez le riz dans ce bouillon avec du cumin.', 'Servez le riz garni de poisson et de pignons, avec le tarator.']
    },
    timers: [600, 900, 900, 1200, 0]
  },
  {
    id: 'fatteh', cat: 'breakfast', serves: 4, time: 30,
    title: { ar: 'فتّة حمّص', en: 'Fatteh hummus', fr: 'Fatté aux pois chiches' },
    ing: {
      ar: ['رغيفين خبز عربي محمّص', '٢ كوب حمّص مسلوق سخن', '٢ كوب لبن', '٢ ملعقة طحينة', 'فص ثوم', 'صنوبر محمّر بالسمنة', 'كمّون وبابريكا'],
      en: ['2 Arabic breads, toasted and broken', '2 cups warm cooked chickpeas', '2 cups yoghurt', '2 tbsp tahini', '1 garlic clove', 'Pine nuts toasted in ghee', 'Cumin and paprika'],
      fr: ['2 pains libanais grillés et cassés', '2 tasses de pois chiches chauds', '2 tasses de yaourt', '2 c. à soupe de tahiné', '1 gousse d’ail', 'Pignons dorés au beurre', 'Cumin et paprika']
    },
    steps: {
      ar: ['حمّصي الخبز بالفرن لحتى يقرمش.', 'صفّيه بالصحن ورشّي عليه شوي من مي الحمّص.', 'زيدي الحمّص السخن.', 'اخلطي اللبن والطحينة والثوم وكبّيهن فوق.', 'زيّنيها بالصنوبر والسمنة والكمّون.'],
      en: ['Toast the bread in the oven until crisp.', 'Lay it in the dish and sprinkle with some chickpea water.', 'Add the warm chickpeas.', 'Whisk yoghurt, tahini and garlic and pour over.', 'Finish with pine nuts, ghee and cumin.'],
      fr: ['Grillez le pain au four jusqu’à ce qu’il croustille.', 'Disposez-le dans le plat et arrosez d’un peu d’eau de cuisson.', 'Ajoutez les pois chiches chauds.', 'Fouettez yaourt, tahiné et ail et versez dessus.', 'Garnissez de pignons, beurre et cumin.']
    },
    timers: [480, 0, 0, 0, 0]
  },
  {
    id: 'loubieh', cat: 'mezze', serves: 4, time: 50,
    title: { ar: 'لوبية بزيت', en: 'Green beans in oil', fr: 'Haricots verts à l’huile' },
    ing: {
      ar: ['٧٠٠ غ لوبية خضرا', '٢ بصلة شرحات', '٦ فصوص ثوم', '٤ بندورة مفرومة', 'ربع كوب زيت زيتون', 'ملح وفلفل'],
      en: ['700 g green beans', '2 onions, sliced', '6 garlic cloves', '4 tomatoes, chopped', '¼ cup olive oil', 'Salt and pepper'],
      fr: ['700 g de haricots verts', '2 oignons émincés', '6 gousses d’ail', '4 tomates hachées', '¼ tasse d’huile d’olive', 'Sel et poivre']
    },
    steps: {
      ar: ['قلّي البصل بالزيت لحتى يدبل.', 'زيدي الثوم واللوبية وقلّبي.', 'غطّي واتركيها على نار خفيفة.', 'زيدي البندورة والملح وكمّلي لحتى تطرى.', 'بتنكل باردة مع الخبز.'],
      en: ['Soften the onions in the oil.', 'Add the garlic and beans and stir.', 'Cover and sweat over low heat.', 'Add the tomatoes and salt and cook until tender.', 'Eat at room temperature with bread.'],
      fr: ['Faites fondre les oignons dans l’huile.', 'Ajoutez l’ail et les haricots, remuez.', 'Couvrez et laissez étuver à feu doux.', 'Ajoutez tomates et sel, cuisez jusqu’à tendreté.', 'Se mange à température ambiante avec du pain.']
    },
    timers: [420, 0, 900, 1200, 0]
  },
  {
    id: 'batata', cat: 'mezze', serves: 4, time: 35,
    title: { ar: 'بطاطا حرّة', en: 'Batata harra', fr: 'Batata harra' },
    ing: {
      ar: ['٤ حبات بطاطا مكعّبات', '٥ فصوص ثوم مدقوق', 'باقة كزبرة مفرومة', 'فلفل حرّ', 'عصير ليمونة', 'ملح وزيت'],
      en: ['4 potatoes, cubed', '5 garlic cloves, crushed', 'A bunch of coriander, chopped', 'Chilli', 'Juice of 1 lemon', 'Salt and oil'],
      fr: ['4 pommes de terre en cubes', '5 gousses d’ail écrasées', 'Une botte de coriandre hachée', 'Piment', 'Le jus d’1 citron', 'Sel et huile']
    },
    steps: {
      ar: ['اقلي البطاطا أو حمّريها بالفرن لحتى تقرمش.', 'بمقلاية تانية، قلّي الثوم والكزبرة والفلفل دقيقة.', 'اقلبي البطاطا معهن.', 'زيدي الليمون والملح وقدّميها سخنة.'],
      en: ['Fry or roast the potatoes until crisp.', 'In another pan, fry garlic, coriander and chilli for a minute.', 'Toss the potatoes through.', 'Add lemon and salt and serve hot.'],
      fr: ['Faites frire ou rôtir les pommes de terre jusqu’à ce qu’elles croustillent.', 'Dans une autre poêle, faites revenir ail, coriandre et piment une minute.', 'Mélangez-y les pommes de terre.', 'Citron, sel, et servez chaud.']
    },
    timers: [1500, 60, 0, 0]
  },
  {
    id: 'sfiha', cat: 'mezze', serves: 6, time: 80,
    title: { ar: 'صفيحة بعلبكية', en: 'Sfiha', fr: 'Sfiha' },
    ing: {
      ar: ['عجينة متل المنقوشة', '٤٠٠ غ لحمة مفرومة', '٢ بندورة مفرومة ناعم ومصفّاية', 'بصلة مفرومة', 'ملعقة دبس رمّان', 'لبن للتقديم'],
      en: ['Dough as for manoushe', '400 g minced meat', '2 tomatoes, finely chopped and drained', '1 onion, chopped', '1 tbsp pomegranate molasses', 'Yoghurt to serve'],
      fr: ['Pâte comme pour le manouché', '400 g de viande hachée', '2 tomates finement hachées et égouttées', '1 oignon haché', '1 c. à soupe de mélasse de grenade', 'Yaourt pour servir']
    },
    steps: {
      ar: ['حضّري العجينة وخلّيها تخمر.', 'اخلطي اللحمة مع البندورة والبصل والدبس والبهار.', 'قطّعي العجينة مربّعات صغار وحطّي الحشوة بالنص.', 'اقرصي الأطراف لتصير مربّعة مفتوحة.', 'اخبزيها بفرن حامي.'],
      en: ['Make the dough and let it rise.', 'Mix the meat with tomato, onion, molasses and spice.', 'Cut the dough into small squares and put filling in the middle.', 'Pinch the corners into open squares.', 'Bake in a hot oven.'],
      fr: ['Préparez la pâte et laissez lever.', 'Mélangez viande, tomate, oignon, mélasse et épices.', 'Découpez la pâte en petits carrés et garnissez au centre.', 'Pincez les coins pour former des carrés ouverts.', 'Enfournez à four chaud.']
    },
    timers: [3600, 0, 0, 0, 720]
  },
  {
    id: 'moujaddara-hamra', cat: 'main', serves: 4, time: 60,
    title: { ar: 'مدردرة', en: 'Mdardara (lentils and rice)', fr: 'Mdardara (lentilles et riz)' },
    ing: {
      ar: ['كوب عدس أسود', 'كوب رز', '٣ بصلات شرحات', 'نص كوب زيت', 'كمّون وملح', 'سلطة ولبن للتقديم'],
      en: ['1 cup brown lentils', '1 cup rice', '3 onions, sliced', '½ cup oil', 'Cumin and salt', 'Salad and yoghurt to serve'],
      fr: ['1 tasse de lentilles brunes', '1 tasse de riz', '3 oignons émincés', '½ tasse d’huile', 'Cumin et sel', 'Salade et yaourt']
    },
    steps: {
      ar: ['اسلقي العدس لحتى ينصّ استوا.', 'قلّي البصل لحتى يقرمش، وشيلي نصّه للتزيين.', 'زيدي الرز والعدس والكمّون للبصل والمي.', 'طبّخي على نار خفيفة لحتى يستوي الرز.', 'زيّنيها بالبصل المقرمش.'],
      en: ['Boil the lentils until half cooked.', 'Fry the onions until crisp; keep half for the top.', 'Add rice, lentils, cumin and water to the onions.', 'Cook over low heat until the rice is done.', 'Top with the crispy onions.'],
      fr: ['Cuisez les lentilles à mi-cuisson.', 'Faites frire les oignons croustillants ; gardez-en la moitié.', 'Ajoutez riz, lentilles, cumin et eau aux oignons.', 'Cuisez à feu doux jusqu’à ce que le riz soit cuit.', 'Garnissez d’oignons croustillants.']
    },
    timers: [900, 1200, 0, 1200, 0]
  },
  {
    id: 'knefeh', cat: 'sweets', serves: 8, time: 50,
    title: { ar: 'كنافة بالجبن', en: 'Knefeh with cheese', fr: 'Knefé au fromage' },
    ing: {
      ar: ['٥٠٠ غ عجينة كنافة', '٢٠٠ غ سمنة ذايبة', '٥٠٠ غ جبنة عكّاوي منقوعة ومبشورة', '٢٥٠ غ موزاريلا', 'قطر (شراب السكر) بماء الزهر', 'فستق مطحون'],
      en: ['500 g kataifi or knefeh dough', '200 g melted ghee', '500 g akkawi cheese, desalted and grated', '250 g mozzarella', 'Sugar syrup with orange blossom', 'Ground pistachios'],
      fr: ['500 g de pâte à knefé', '200 g de beurre clarifié fondu', '500 g d’akkawi dessalé et râpé', '250 g de mozzarella', 'Sirop de sucre à la fleur d’oranger', 'Pistaches moulues']
    },
    steps: {
      ar: ['افرمي العجينة واخلطيها مع السمنة.', 'اكبسي نصّها بالصينية.', 'افردي الجبنة، وغطّي بباقي العجينة.', 'اخبزيها لحتى تصير دهبية من تحت.', 'اقلبيها بالصحن، اسقيها قطر، وزيّنيها بالفستق.'],
      en: ['Chop the dough and rub it with the ghee.', 'Press half into a tray.', 'Spread the cheese and cover with the rest of the dough.', 'Bake until golden underneath.', 'Turn out, soak with syrup and sprinkle pistachios.'],
      fr: ['Hachez la pâte et mélangez-la au beurre.', 'Tassez-en la moitié dans un plat.', 'Étalez le fromage, recouvrez du reste de pâte.', 'Enfournez jusqu’à ce que le dessous soit doré.', 'Démoulez, arrosez de sirop, parsemez de pistaches.']
    },
    timers: [0, 0, 0, 1800, 0]
  },
  {
    id: 'mouhalabieh', cat: 'sweets', serves: 6, time: 25,
    title: { ar: 'مهلّبية', en: 'Mouhalabieh', fr: 'Mouhalabié' },
    ing: {
      ar: ['لتر حليب', 'نص كوب نشا', 'نص كوب سكر', 'ملعقة ماء زهر', 'فستق مطحون'],
      en: ['1 litre milk', '½ cup cornflour', '½ cup sugar', '1 tbsp orange blossom water', 'Ground pistachios'],
      fr: ['1 litre de lait', '½ tasse de maïzena', '½ tasse de sucre', '1 c. à soupe d’eau de fleur d’oranger', 'Pistaches moulues']
    },
    steps: {
      ar: ['ذوّبي النشا بشوية حليب بارد.', 'سخّني باقي الحليب مع السكر وزيدي النشا وحرّكي.', 'حرّكي على نار وسط لحتى تتكثّف.', 'زيدي ماء الزهر وصبّيها بالكاسات.', 'برّديها بالبرّاد وزيّنيها بالفستق.'],
      en: ['Dissolve the cornflour in a little cold milk.', 'Heat the rest of the milk with the sugar, then add the cornflour, stirring.', 'Stir over medium heat until thick.', 'Add the orange blossom water and pour into cups.', 'Chill and sprinkle with pistachios.'],
      fr: ['Délayez la maïzena dans un peu de lait froid.', 'Chauffez le reste du lait avec le sucre, ajoutez la maïzena en remuant.', 'Remuez à feu moyen jusqu’à épaississement.', 'Ajoutez la fleur d’oranger et versez en coupes.', 'Réfrigérez et parsemez de pistaches.']
    },
    timers: [0, 0, 600, 0, 7200]
  },
  {
    id: 'meghli', cat: 'sweets', serves: 10, time: 60,
    title: { ar: 'مغلي', en: 'Meghli (spiced rice pudding)', fr: 'Meghli (crème de riz épicée)' },
    ing: {
      ar: ['كوب طحين رز', 'كوب ونص سكر', '٢ ملعقة كراوية', 'ملعقة قرفة', '٨ كوب مي', 'جوز هند، جوز، لوز وفستق منقوع'],
      en: ['1 cup rice flour', '1½ cups sugar', '2 tbsp ground caraway', '1 tbsp cinnamon', '8 cups water', 'Coconut, walnuts, almonds and pistachios, soaked'],
      fr: ['1 tasse de farine de riz', '1½ tasse de sucre', '2 c. à soupe de carvi moulu', '1 c. à soupe de cannelle', '8 tasses d’eau', 'Noix de coco, noix, amandes et pistaches trempées']
    },
    steps: {
      ar: ['اخلطي طحين الرز والسكر والكراوية والقرفة مع المي البارد.', 'حطّيه عالنار وحرّكي بلا توقف.', 'خلّيه يغلي ويتكثّف وأنتِ عم تحرّكي.', 'صبّيه بالكاسات وبرّديه.', 'زيّنيه بجوز الهند والمكسّرات.'],
      en: ['Whisk rice flour, sugar, caraway and cinnamon into the cold water.', 'Put on the heat, stirring all the time.', 'Let it boil and thicken, still stirring.', 'Pour into cups and let cool.', 'Top with coconut and nuts.'],
      fr: ['Fouettez farine de riz, sucre, carvi et cannelle dans l’eau froide.', 'Mettez sur le feu en remuant sans cesse.', 'Laissez bouillir et épaissir en remuant.', 'Versez en coupes et laissez refroidir.', 'Garnissez de coco et de fruits secs.']
    },
    timers: [0, 0, 2100, 3600, 0]
  },
  {
    id: 'sfouf', cat: 'sweets', serves: 12, time: 50,
    title: { ar: 'صفوف', en: 'Sfouf (turmeric cake)', fr: 'Sfouf (gâteau au curcuma)' },
    ing: {
      ar: ['٢ كوب سميد', 'كوب طحين', 'كوب ونص سكر', 'ملعقة كبيرة كركم', 'ملعقة بيكنغ باودر', 'كوب حليب', 'ثلاث أرباع كوب زيت', 'طحينة للصينية وصنوبر'],
      en: ['2 cups semolina', '1 cup flour', '1½ cups sugar', '1 tbsp turmeric', '1 tsp baking powder', '1 cup milk', '¾ cup oil', 'Tahini for the tin and pine nuts'],
      fr: ['2 tasses de semoule', '1 tasse de farine', '1½ tasse de sucre', '1 c. à soupe de curcuma', '1 c. à café de levure chimique', '1 tasse de lait', '¾ tasse d’huile', 'Tahiné pour le moule et pignons']
    },
    steps: {
      ar: ['اخلطي السميد والطحين والكركم والبيكنغ باودر.', 'زيدي الزيت وفركي، وبعدين السكر والحليب.', 'ادهني الصينية طحينة وكبّي الخليط.', 'زيّنيه بالصنوبر واخبزيه على ١٨٠.', 'برّديه وقطّعيه معيّنات.'],
      en: ['Mix semolina, flour, turmeric and baking powder.', 'Rub in the oil, then add the sugar and milk.', 'Grease the tin with tahini and pour in the batter.', 'Dot with pine nuts and bake at 180°C.', 'Cool and cut into diamonds.'],
      fr: ['Mélangez semoule, farine, curcuma et levure.', 'Sablez avec l’huile, puis ajoutez sucre et lait.', 'Graissez le moule au tahiné et versez la pâte.', 'Parsemez de pignons et enfournez à 180 °C.', 'Laissez refroidir et coupez en losanges.']
    },
    timers: [0, 0, 0, 2100, 1200]
  },
  {
    id: 'maamoul', cat: 'sweets', serves: 30, time: 120,
    title: { ar: 'معمول بالتمر', en: 'Date maamoul', fr: 'Maamoul aux dattes' },
    ing: {
      ar: ['٣ كوب سميد', 'كوب سمنة ذايبة', 'ربع كوب سكر', 'ملعقة خميرة', 'ربع كوب ماء زهر وماء ورد', '٥٠٠ غ عجوة تمر', 'سكر بودرة'],
      en: ['3 cups semolina', '1 cup melted ghee', '¼ cup sugar', '1 tsp yeast', '¼ cup orange blossom and rose water', '500 g date paste', 'Icing sugar'],
      fr: ['3 tasses de semoule', '1 tasse de beurre clarifié fondu', '¼ tasse de sucre', '1 c. à café de levure', '¼ tasse d’eaux de fleur d’oranger et de rose', '500 g de pâte de dattes', 'Sucre glace']
    },
    steps: {
      ar: ['افركي السميد بالسمنة وخلّيه ليلة.', 'زيدي السكر والخميرة وماء الزهر والورد واعجني خفيف.', 'اعملي طابات تمر صغار.', 'حشي كل طابة عجين بالتمر واكبسيها بالقالب.', 'اخبزي لحتى تحمرّ شوي من تحت.'],
      en: ['Rub the semolina with the ghee and rest it overnight.', 'Add sugar, yeast and the flower waters and knead lightly.', 'Roll small balls of date paste.', 'Fill each piece of dough with dates and press into the mould.', 'Bake until lightly golden underneath.'],
      fr: ['Sablez la semoule au beurre et laissez reposer une nuit.', 'Ajoutez sucre, levure et eaux florales, pétrissez légèrement.', 'Formez de petites boules de dattes.', 'Fourrez chaque morceau de pâte et pressez dans le moule.', 'Enfournez jusqu’à ce que le dessous dore légèrement.']
    },
    timers: [0, 1800, 0, 0, 1080]
  },
  {
    id: 'riz-bi-halib', cat: 'sweets', serves: 6, time: 45,
    title: { ar: 'رز بحليب', en: 'Riz bi haleeb (rice pudding)', fr: 'Riz au lait' },
    ing: {
      ar: ['نص كوب رز مصري', 'كوب مي', 'لتر حليب', 'نص كوب سكر', 'ملعقة ماء زهر', 'قرفة أو فستق'],
      en: ['½ cup short-grain rice', '1 cup water', '1 litre milk', '½ cup sugar', '1 tbsp orange blossom water', 'Cinnamon or pistachios'],
      fr: ['½ tasse de riz rond', '1 tasse d’eau', '1 litre de lait', '½ tasse de sucre', '1 c. à soupe de fleur d’oranger', 'Cannelle ou pistaches']
    },
    steps: {
      ar: ['اسلقي الرز بالمي لحتى تتشرّب.', 'زيدي الحليب وخلّيه على نار خفيفة وحرّكي كل شوي.', 'زيدي السكر لما يتكثّف.', 'زيدي ماء الزهر وصبّيه بالكاسات.', 'برّديه وزيّنيه.'],
      en: ['Simmer the rice in the water until absorbed.', 'Add the milk and cook gently, stirring now and then.', 'Add the sugar once it thickens.', 'Stir in the orange blossom water and pour into cups.', 'Chill and decorate.'],
      fr: ['Cuisez le riz dans l’eau jusqu’à absorption.', 'Ajoutez le lait et laissez cuire doucement en remuant.', 'Ajoutez le sucre quand ça épaissit.', 'Ajoutez la fleur d’oranger et versez en coupes.', 'Réfrigérez et décorez.']
    },
    timers: [600, 1800, 300, 0, 3600]
  },
  {
    id: 'kishk', cat: 'breakfast', serves: 4, time: 25,
    title: { ar: 'شوربة كشك', en: 'Kishk soup', fr: 'Soupe de kichk' },
    ing: {
      ar: ['كوب كشك', '٤ كوب مي', 'بصلة مفرومة', '٣ فصوص ثوم', 'قاورما أو لحمة مفرومة (اختياري)', 'زيت أو سمنة'],
      en: ['1 cup kishk', '4 cups water', '1 onion, chopped', '3 garlic cloves', 'Awarma or minced meat (optional)', 'Oil or ghee'],
      fr: ['1 tasse de kichk', '4 tasses d’eau', '1 oignon haché', '3 gousses d’ail', 'Awarma ou viande hachée (facultatif)', 'Huile ou beurre clarifié']
    },
    steps: {
      ar: ['قلّي البصل والثوم والقاورما بالسمنة.', 'زيدي الكشك وقلّبي دقيقة.', 'زيدي المي شوي شوي وأنتِ عم تحرّكي.', 'خلّيها تغلي لحتى تتكثّف.', 'كليها سخنة مع خبز محمّص.'],
      en: ['Fry the onion, garlic and awarma in ghee.', 'Add the kishk and stir for a minute.', 'Add the water little by little, stirring.', 'Let it boil until thick.', 'Eat hot with toasted bread.'],
      fr: ['Faites revenir oignon, ail et awarma au beurre.', 'Ajoutez le kichk et remuez une minute.', 'Versez l’eau petit à petit en remuant.', 'Laissez bouillir jusqu’à épaississement.', 'Mangez chaud avec du pain grillé.']
    },
    timers: [300, 60, 0, 600, 0]
  },
  {
    id: 'shish-barak', cat: 'main', serves: 6, time: 100,
    title: { ar: 'شيش برك', en: 'Shish barak', fr: 'Chich barak' },
    ing: {
      ar: ['عجينة بسيطة (طحين، مي، ملح)', '٣٠٠ غ لحمة مفرومة مع بصل وصنوبر', 'كيلو لبن', 'ملعقة نشا', 'بيضة', 'ثوم وكزبرة مقليين'],
      en: ['Simple dough (flour, water, salt)', '300 g minced meat with onion and pine nuts', '1 kg yoghurt', '1 tbsp cornflour', '1 egg', 'Garlic and coriander, fried'],
      fr: ['Pâte simple (farine, eau, sel)', '300 g de viande hachée avec oignon et pignons', '1 kg de yaourt', '1 c. à soupe de maïzena', '1 œuf', 'Ail et coriandre revenus']
    },
    steps: {
      ar: ['افردي العجينة رقيقة وقطّعيها دواير صغار.', 'حشيها باللحمة وسكّريها متل الأدينات.', 'حمّريهن بالفرن شوي.', 'اطبخي اللبن مع النشا والبيضة وحرّكي لحتى يغلي.', 'زيدي الشيش برك وخلّيه يستوي، وآخر شي الثوم والكزبرة.'],
      en: ['Roll the dough thin and cut small circles.', 'Fill with the meat and fold into little ears.', 'Brown them briefly in the oven.', 'Cook the yoghurt with cornflour and egg, stirring until it boils.', 'Add the dumplings and simmer; finish with garlic and coriander.'],
      fr: ['Étalez la pâte finement et découpez de petits ronds.', 'Garnissez de viande et refermez en petites oreilles.', 'Faites-les dorer brièvement au four.', 'Cuisez le yaourt avec maïzena et œuf en remuant jusqu’à ébullition.', 'Ajoutez les raviolis et mijotez ; finissez avec ail et coriandre.']
    },
    timers: [0, 0, 600, 600, 900]
  }
];

/* The Lebanese channels on the TV. No live streams and nothing paid: each channel
   is its own official YouTube playlists (programmes, series, news bulletins), plus
   its latest uploads. Picking one plays it embedded on the set in the room.
   A channel's uploads playlist is 'UU' + the channel id without its 'UC'. */
(() => {
  'use strict';
  const up = id => 'UU' + id.slice(2);
  const P = (t, id) => ({ t, id });

  window.SAWT_TV = [
    {
      id: 'UCpE6gpKewomi17XDyPfpFjA', name: 'LBCI', ar: 'إل بي سي', short: 'LBCI', color: '#1D5FA8',
      lists: [
        P({ ar: 'آخر الفيديوهات', en: 'Latest videos', fr: 'Dernières vidéos' }, up('UCpE6gpKewomi17XDyPfpFjA')),
        P('Aal Bal ya Ziad', 'PLrCoapNSB5ggQmsV3JP8jcUGL-JbtuCwr'),
        P('Kella Mel7a', 'PLrCoapNSB5gjZCA_gh4PlJAyHFsHFFcDM'),
        P('Jamil w Jamileh', 'PLrCoapNSB5gjgpVF8-3lo-GIERzyJSbYG'),
        P('Fad w Radi', 'PLrCoapNSB5gi-k52pWvG55ef_XP5nCsvK'),
        P('Bent el Hay', 'PLrCoapNSB5gjAPdQpMCdZRXrdOxGvDZhw'),
        P('Marti w Benti w Ana', 'PLrCoapNSB5ghJHmXIhLr5H0FXSpUo3WEl'),
        P('Marti w Ana', 'PLrCoapNSB5gilFXGt2j1EO9XASQF9W2TK'),
        P('Aayle Aa Fared Mayle', 'PLrCoapNSB5gi31a1fmbfbVXXps4Bffodc'),
        P('Nharkom Said 2026', 'PLrCoapNSB5gg3BFebPLcCODRJgREQAZPE'),
        P('My Journey', 'PLrCoapNSB5gjenChnk9F9d5CUJWY9aNs8'),
        P('Al Massar', 'PLrCoapNSB5giqg6wO3aEZeVH5QHoD5c5t'),
        P('Shark Tank Lebanon', 'PLrCoapNSB5ghEYf_K1_WqQaik3ZXl53k5'),
        P('Talbin el Ereb', 'PLrCoapNSB5ggO5yihFx5UvaMBz6jU9Mlw'),
        P('Shelle 3al Helle', 'PLrCoapNSB5ggT60T10GYhtO1hSjnZOKCl'),
        P('Miss Lebanon 2025', 'PLrCoapNSB5gjO8DqiKcccvv32DuYGkQEV'),
        P('Game On', 'PLrCoapNSB5ggJ1dambH0El5kYYblPHWU5'),
        P('قويّة', 'PLrCoapNSB5ghfmawM2hVhCibdPdaBKn0z'),
        P('عندي سؤال', 'PLrCoapNSB5gj0KCtxTfFsKtAmscUm-81V'),
        P('Conversations with Ricardo Karam', 'PLrCoapNSB5gjOJ7eXDTqo7ccF4aZkE1bB'),
        P('Hsebak 3anna', 'PLrCoapNSB5gg3henehp9XU3_O9xG5n-AD'),
        P('Ahla Jalseh', 'PLrCoapNSB5giz5ZD_vBIMu5LZ6YCyZes7'),
        P('Best of Ghariba', 'PLrCoapNSB5gjuIX01i7hYYOaa4LWNj8BN'),
        P('Lo3bat Kadari', 'PLrCoapNSB5gip1KAQaqRI3xeuGD4xMXj5'),
        P('Crystal', 'PLrCoapNSB5giWEYi5MMEG1tpgheuDae6n'),
        P('Ramadan Talk 2025', 'PLrCoapNSB5gjm0chfO1799P3MQHiPLH83')
      ]
    },
    {
      id: 'UCnkTo_wMqGtLiA4xX7roORg', name: 'MTV Lebanon', ar: 'إم تي في', short: 'MTV', color: '#C4262E',
      lists: [
        P({ ar: 'آخر الفيديوهات', en: 'Latest videos', fr: 'Dernières vidéos' }, up('UCnkTo_wMqGtLiA4xX7roORg')),
        P({ ar: 'آخر الأخبار', en: 'Latest news', fr: 'Dernières infos' }, up('UC9_XmAwE5szLHF76FjMylaw')),
        P('ضيعة من لبنان', 'PLwkUf0RYttgTMjiIrD67DWqjGsXtM07V1'),
        P('الخبرية متل ما هي', 'PLwkUf0RYttgQwDG-SGBYF1_x0NR4LWCxf'),
        P('حكاية وأمل', 'PLwkUf0RYttgTuVHMK_GTuwstx8JuVFisN'),
        P('Mesh Masrahieh', 'PLwkUf0RYttgSVS9wGBccor2O1N66e0csz'),
        P('رحلة بين زمنين', 'PLwkUf0RYttgTQtQgNuzQ26sJtNf5soaQS'),
        P('UNFILTERED بلا فلتر', 'PLwkUf0RYttgTwN1Ma7xJcgt8MQ12ESELj'),
        P('هيدي قصتي', 'PLwkUf0RYttgQmpbn5r41A9T4P14RyNcr8'),
        P('الخبر عندك', 'PLwkUf0RYttgTFrvipVAHH-XQvHJ8fu8_h'),
        P('خلف المثل', 'PLwkUf0RYttgSxF-8TFFYKzFvQklBU3mi4'),
        P('يلّا ندبك', 'PLwkUf0RYttgS76Br8OuZbGXbICdTF92BJ'),
        P('نبض التاريخ', 'PLwkUf0RYttgRohEeIval9v4po8aqUfM12'),
        P('60 Seconds Lebanon', 'PLwkUf0RYttgR4b771z6OLSCW8ZLHl-NKq'),
        P('Behind the Mirror', 'PLwkUf0RYttgRPl_7I1rHb7-htS9OBRa11'),
        P('Supermarket Champions', 'PLwkUf0RYttgShnpPOnyi94JwlqIj7dBJ7'),
        P('تحت الهوا مع جو', 'PLwkUf0RYttgQ5tNxF3Phv1JauC1CuCUL0'),
        P('Power Zen', 'PLwkUf0RYttgR5D95-6RDo9qVSIVq0E8De'),
        P('Pope Leo XIV', 'PLwkUf0RYttgSsjqQu3guiSL3FOhp9T4oK'),
        P('Lebanese Volleyball 2025-26', 'PLwkUf0RYttgSiMfitqSl_yqTUnmu5sxMe'),
        P('Basketball 2025-26', 'PLwkUf0RYttgSmNCyUDGDjcTIqHN0CxSL-'),
        P('Baldati', 'PL5RWrgmZXuBg8fh5eKBkATJhrVgMDJcRM'),
        P('Woujouh', 'PL5RWrgmZXuBhryXSbaksmHZc4rLeTvQ_n'),
        P('الصورة بتحكي', 'PL5RWrgmZXuBgj29HFHakw7fODSHWLajqy'),
        P('رادار العالم', 'PL5RWrgmZXuBgLRcfKOT1ZkrrULFHcJfp6'),
        P('The Weekly Review', 'PL5RWrgmZXuBj7hWAETDAzGsF9ZZF99LdJ'),
        P('فقرة الصحة', 'PL5RWrgmZXuBhSYcLdOUT1Ty0dSZzJ0EsR'),
        P('المقدمة', 'PL5RWrgmZXuBjidL68pcFXA6dMGE3J1lOh'),
        P('الأحوال الجوية', 'PL5RWrgmZXuBjmOabfYUT4HxGcD31gpE82'),
        P('Men Kitab', 'PL5RWrgmZXuBiX4jg7t_3J3kGM07-Roj8s'),
        P('Asla w Fasla', 'PL5RWrgmZXuBjGKt441kluSH-f5gSb1m61'),
        P('Mele w Melak', 'PL5RWrgmZXuBjkyN3slG7Hb3XJ8P5y3kiY'),
        P('Press Review', 'PL5RWrgmZXuBgdslfktXvaehVSD2HyKz1A')
      ]
    },
    {
      id: 'UC4JCsTLFcHGk10qpiNMh0Ww', name: 'Al Jadeed', ar: 'الجديد', short: 'AL JADEED', color: '#D2232A',
      lists: [
        P({ ar: 'آخر الفيديوهات', en: 'Latest videos', fr: 'Dernières vidéos' }, up('UC4JCsTLFcHGk10qpiNMh0Ww')),
        P({ ar: 'آخر البرامج', en: 'Latest programmes', fr: 'Dernières émissions' }, up('UC5f_fxJa5G9AR9L3J5Z2I4A')),
        P('النشرة المسائية', 'PLbYxH17lkiCJ40AYSrKLvrPChXtlcRj2_'),
        P('الحدث 2', 'PLbYxH17lkiCJuC61Okd6OixjniUFLdfv6'),
        P('تقارير اخبارية', 'PLbYxH17lkiCKB59Jdibzo0IiBqSnLPOqb'),
        P('خلي عينك عالجديد', 'PLbYxH17lkiCKlaGx7Z5kDzLB-gEStyfqd'),
        P('عرب Talks', 'PLbYxH17lkiCK8-QkmXIl7TdKWDoiyMxHO'),
        P('Vodcast', 'PLbYxH17lkiCJt99wK_hdyfnCg4efQn-C8'),
        P('هيدا انا', 'PLzuWO-C4bnsDzcC-DtB3P_Y68_EZo_G6Z'),
        P('خاص', 'PLzuWO-C4bnsA-2oSdi1yUpJtgUYQ4idh1'),
        P('ع ارض الملعب', 'PLzuWO-C4bnsCqTLBkNqixlZWE6KdbFODg'),
        P('النشرة الجوية', 'PLzuWO-C4bnsBOLuz4U31Dwj92c5h5ViPW'),
        P('افشات', 'PLzuWO-C4bnsBMh6HPV6kdU6KPpG0aKX5F'),
        P('ليلى x نيشان', 'PLzuWO-C4bnsDwJBJZRWIGiwyD4Nk8zuPH'),
        P('بالطول والعرض', 'PLzuWO-C4bnsBpfoANJ0PZQHDFPp69Lchx'),
        P('سقف عالي', 'PLzuWO-C4bnsCL2mMLspITFL1V_mmRRlRA'),
        P('بودكاست سقف عالي', 'PLzuWO-C4bnsD1LYx3QI47_w6-TY27h_ym'),
        P('مساحة خاصّة', 'PLzuWO-C4bnsDBwq5qygzvCB7yb6FcAB-O'),
        P('بودكاست اثر', 'PLzuWO-C4bnsBRaSFMkuO9RjAlMepkTl5i'),
        P('الأم الحزينة', 'PLzuWO-C4bnsAzqSJ81K2aqlX3poJ9SQRy'),
        P('Candle Light', 'PLzuWO-C4bnsAzuBHLh4AFfyQ_ZdiTrqOe'),
        P('استوديو الجديد', 'PLzuWO-C4bnsBCUiTy5SXW2EVBm2WVzDku')
      ]
    },
    {
      id: 'UCJu-0vnWt0wFMQuLsjzwjRQ', name: 'OTV', ar: 'أو تي في', short: 'OTV', color: '#E8792B',
      lists: [
        P({ ar: 'آخر الفيديوهات', en: 'Latest videos', fr: 'Dernières vidéos' }, up('UCJu-0vnWt0wFMQuLsjzwjRQ')),
        P('نشرات الاخبار الليلية', 'PLavtn3ZqrC8IEYl_WD1RqZW-cB3LD7bov'),
        P('نشرات الاخبار الصباحية', 'PLavtn3ZqrC8LAbjmX6XEQWevkMhIjrQRs'),
        P('وين رايحين؟', 'PLavtn3ZqrC8Ldl7UNnU3KMiP9Gh7i2zav'),
        P('سياسة ع المكشوف', 'PLavtn3ZqrC8IkZOUjj4bq_RGfpwPP_n80'),
        P('مواجهة حُرّة', 'PLavtn3ZqrC8KwWngEAcw_DCSI1yAnQyYi'),
        P('peekaboo', 'PLavtn3ZqrC8Kr-fCd5CjPQPLu1PWzguD1'),
        P('قشة لفة', 'PLavtn3ZqrC8ITwA8f019ckscbQKxiW7ua'),
        P('الفقرة الرياضية', 'PLavtn3ZqrC8Lo9YRM5SohegkmQ1-USQJa'),
        P('نشرة الطقس', 'PLavtn3ZqrC8Kbsw_ElsGWlxIe3byQ81Dn'),
        P('بالصف Stars', 'PLavtn3ZqrC8JIVRqd0LV3UAEbTVfcl4Yi'),
        P('Tik Talk', 'PLavtn3ZqrC8JB6lE9aL2h17ULo4Mbkw6J'),
        P('Vibes', 'PLavtn3ZqrC8JDxtEMLjJbc7qsGO-iVqRD'),
        P('مشوا نعمل كزدورة', 'PLavtn3ZqrC8JOBewxbSW76daSynW2rnly'),
        P('شو الطريقة؟', 'PLavtn3ZqrC8Iq_Wbs-hfxTDsMw7GrsbFy'),
        P('Badda Akel Podcast', 'PLavtn3ZqrC8KbENq4DwTzNjgUeuoCn2tl'),
        P('من الجذور The Roots', 'PLavtn3ZqrC8IyvGpXnBDa-4U66hmAW3cL'),
        P('أكلة عالـOTV', 'PLavtn3ZqrC8Lc5Fna7_Tn4csYz7VQ-G5G'),
        P('ضيعة عجنب', 'PLavtn3ZqrC8K6IJZHywvY40bnAikOFmGI'),
        P('أكلة مع Panossian', 'PLavtn3ZqrC8Ir9ikDKV7MXiiiyAi8nntg'),
        P('مسافة صفر', 'PLavtn3ZqrC8KWh3dPTt4KcBhDuVLNbb9a')
      ]
    },
    {
      id: 'UCBWLHGMK10ebd2jndWUnHdw', name: 'NBN', ar: 'إن بي إن', short: 'NBN', color: '#1E8A4C',
      lists: [
        P({ ar: 'آخر الفيديوهات', en: 'Latest videos', fr: 'Dernières vidéos' }, up('UCBWLHGMK10ebd2jndWUnHdw')),
        P('قضية اليوم', 'PLYaAFixrzhSRpe3u3r9cpCUUvIEtFoL_d'),
        P('حديث الجمعة', 'PLYaAFixrzhSS0Aflgkiz_RzuIB35HGeA9'),
        P('فكرة طبخة', 'PLYaAFixrzhSQ5Fw9O8r95xwm_oQUpLrOg'),
        P('صحتين وهنا', 'PLYaAFixrzhSSbmeMJ6V3-qOPlWuchfeoj'),
        P('مائدة الرحمن', 'PLYaAFixrzhSQKZtS8hcQ-1NZY-duZ8AyL'),
        P('معا قلبا واحدا', 'PLYaAFixrzhSS5VzmYnRh_vixEXqyWoMtC'),
        P('نبض المعرفة', 'PLYaAFixrzhSS97U9rkzM-3Zd0nx8uGYW-'),
        P('عين على المجتمع', 'PLYaAFixrzhSRuzPg-SWAUsywiPQ3ht6fA'),
        P('كتاب', 'PLYaAFixrzhSQZg38PFBcusLskMP_HeR5b'),
        P('صوموا تصحوا', 'PLYaAFixrzhSTPpkHOf0EzYyq3vMHP-c4I'),
        P('أهلنا وولادنا', 'PLYaAFixrzhSS3IIxKxKHBcc8IHGo2bzIV'),
        P('مال وأعمال', 'PLYaAFixrzhSQeSp39SWiL7GEB-wCl9I_M'),
        P('صحتك', 'PLYaAFixrzhSSw6jXXWF1GJmegZCw585ZY'),
        P('Trendy', 'PLYaAFixrzhSRgolTV-Yjt3u7BjXrPSwVx'),
        P('رأيك', 'PLYaAFixrzhSRCSa6dpMD6XLiV3VIxJLkX'),
        P('هيدا وجعي', 'PLYaAFixrzhSRY7OVP1iO09fFFqRR7h1sP')
      ]
    },
    {
      id: 'UCF00D1R3Z7aAfG8OJqE34Ng', name: 'Télé Liban', ar: 'تلفزيون لبنان', short: 'TL', color: '#2E7D9B',
      lists: [
        P({ ar: 'آخر الفيديوهات', en: 'Latest videos', fr: 'Dernières vidéos' }, up('UCF00D1R3Z7aAfG8OJqE34Ng')),
        P('أحلى صباح', 'PL_aiKCsGozdPfAz_lss7XYE8hePQKiH22'),
        P('لوين تروح', 'PL_aiKCsGozdMIuCUNTGdINJT1QePUUGzx'),
        P('ضيف عزيز', 'PL_aiKCsGozdNtXj7D-2fYKcdluk9kgSIP'),
        P('رياضة مع جولي رمّال', 'PL_aiKCsGozdPhyYYBPl7n-747DjgW42Q9'),
        P('Chef Nadine', 'PL_aiKCsGozdO918AD5rXR9YdcuDnmpRDM'),
        P('The NetCast', 'PL_aiKCsGozdOvjKY-rDyYsYLRDzBeRuph'),
        P('نفحات رمضانية', 'PL_aiKCsGozdP907CdL9NjRVDd3lGkoROR'),
        P('اقتصادنا', 'PL_aiKCsGozdOIOY6SWq33wQVRrerqGLU3'),
        P('كلام يوصل', 'PL_aiKCsGozdOgUVTRoZQcpOG8op10eOOI'),
        P('Concerts', 'PL_aiKCsGozdOXb8sJFR634OeNBXO3_sdx'),
        P('مع وليد عبود', 'PL_aiKCsGozdMym7j0mp1FRlVFrnObj7z-'),
        P('لقاء خاص', 'PL_aiKCsGozdP74ny2TPeB-1R-DBCYTyng'),
        P('شو عنّا', 'PL_aiKCsGozdOg9pQ7QMT7UM8CvL8SVpFd'),
        P('Chady & Gaby Comedy Show', 'PL_aiKCsGozdM6fC7QNxBSYdWfoseMJeI9'),
        P('My Way', 'PL_aiKCsGozdNdJBNtGPJdLf5VvYUK8jzt'),
        P('زركشة', 'PL_aiKCsGozdNkhf098pB00AvQJ7kCbwYd'),
        P('Palette', 'PL_aiKCsGozdNpigU2eeIL732qtMv_E8PY'),
        P('ليل و قمر', 'PL_aiKCsGozdOm4ZmJPhunObht6tX9ozVP'),
        P('سهرة عمر', 'PL_aiKCsGozdOXu_RpPrth4QHMMmkc1trK'),
        P('IDAFA Awards', 'PL_aiKCsGozdOIrlMvcatxm5V0iU0Wce_G')
      ]
    }
  ];
})();

/* The salon in other decades. Today's room is the 1990s one (in room.js). Each other era is
   a family room photographed three times (day, sunset, night), kept in /room/<era>/ with its
   own spots. An era is offered at the door and in My corner only once `ready` is true.

   Shape of an era: { ready, base, spots, objects, px, tv, frames, glass, steam, pelmet, labels }
   (the same fields as the 1990s constants at the top of room.js; spots are % of the picture,
   tv and frames are pixels in the px frame; each per-scene list is [day, night, sunset]). */
(() => {
  const same = v => [v, v, v];
  const S3 = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, same(v)]));
  const all = v => ({ day: v, night: v, sunset: v });
  window.SawtEras = {
    // the 1980s, a Beirut apartment (Gemini, chosen by Nassim)
    '80s': {
      ready: true,
      base: '/room/80s/',
      spots: S3({
        teta: [14, 85], photos: [17, 29], tv: [17.5, 53], cassettes: [18, 66], atari: [30, 57], radio: [32, 68], window: [46, 40],
        coffee: [48, 76], tawleh: [58, 85], ac: [63, 4], phone: [67.5, 65], lamp: [71, 39], clock: [77.5, 30], news: [82, 72],
        calendar: [85.5, 35], together: [89, 73], books: [93, 88], expat: [95, 33]
      }),
      objects: ['teta', 'photos', 'tv', 'cassettes', 'atari', 'radio', 'window', 'coffee', 'tawleh', 'ac', 'phone', 'lamp', 'clock', 'news', 'calendar', 'together', 'books', 'expat'],
      px: all([1264, 848]),
      tv: all([[161.7, 402], [282.6, 402], [282.6, 492], [164.3, 494.3]]),
      frames: all([[[35.0,215.0],[79.6,215.0],[79.6,273.5],[35.0,273.5]], [[115.0,221.0],[150.0,222.0],[154.0,273.0],[116.0,274.0]], [[189.0,216.0],[236.0,220.0],[239.0,279.0],[189.0,278.0]], [[270.0,231.0],[303.0,229.0],[306.0,279.0],[271.0,278.0]], [[336.0,234.0],[365.0,234.0],[371.0,279.0],[337.0,278.0]]]),
      glass: all([36, 23, 57.8, 74]),
      steam: { day: [[0, 0, 0], [0, 0, 0]], sunset: [[54.5, 75, 1], [48.5, 73, 0.7]], night: [[54.5, 75, 1], [48.5, 73, 0.7]] },
      pelmet: all([29, 67, 10, 16.5]),
      labels: {
        ar: { ac: 'مروحة السقف' }, en: { ac: 'Ceiling fan' }, fr: { ac: 'Ventilateur' }
      }
    },
    // the 2000s, a Beirut apartment
    '00s': {
      ready: true,
      base: '/room/00s/',
      spots: S3({
        phone: [9.5, 61], books: [16, 62], news: [17, 78], together: [17, 84], window: [22, 30], coffee: [49, 74], calendar: [55, 30],
        clock: [56, 20], cassettes: [57, 54], tawleh: [58, 82], ac: [69, 8], expat: [71, 27], tv: [72, 49], atari: [72.5, 73],
        lamp: [83.5, 22], radio: [92.5, 63], photos: [94, 30], teta: [93, 92]
      }),
      objects: ['phone', 'books', 'news', 'together', 'window', 'coffee', 'calendar', 'clock', 'cassettes', 'tawleh', 'ac', 'expat', 'tv', 'atari', 'lamp', 'radio', 'photos', 'teta'],
      px: all([1264, 848]),
      tv: all([[819, 361.6], [989, 372], [989, 510], [820, 496.8]]),
      frames: all([[[1141.0,157.0],[1186.0,152.0],[1190.0,209.0],[1142.0,214.0]], [[1222.0,157.0],[1264.0,157.0],[1264.0,209.0],[1222.0,209.0]], [[1138.0,281.0],[1172.0,279.0],[1174.0,325.0],[1138.0,328.0]], [[1220.0,297.0],[1264.0,297.0],[1264.0,332.0],[1220.0,332.0]], [[1129.0,425.0],[1188.0,424.0],[1189.0,466.0],[1128.0,464.0]]]),
      glass: all([3.5, 6, 21.5, 60]),
      steam: { day: [[0, 0, 0], [0, 0, 0]], sunset: [[47.5, 77, 1], [53, 73, 0.7]], night: [[47.5, 77, 1], [53, 73, 0.7]] },
      pelmet: all([40, 53, 2.5, 5]),
      labels: {
        ar: { cassettes: 'السيديات', atari: 'البلاي', phone: 'الخلوي' },
        en: { cassettes: 'CDs', atari: 'Game console', phone: 'Mobile phone' },
        fr: { cassettes: 'Les CD', atari: 'Console', phone: 'Portable' }
      }
    },
    // 2026, a Beirut apartment (pictures made with Gemini, chosen by Nassim)
    '26': {
      ready: true,
      base: '/room/26/',
      spots: S3({
        lamp: [3, 42], expat: [4.5, 29], together: [12, 70], news: [17.5, 73], window: [30, 34],
        teta: [55, 64], coffee: [55.2, 71.5], calendar: [55.5, 37], photos: [66, 33], ac: [67, 13],
        atari: [70.5, 62], tawleh: [68, 80], clock: [83, 20], tv: [83, 45], cassettes: [84, 70],
        books: [87, 86], phone: [91.2, 75.8], radio: [94, 71]
      }),
      objects: ['lamp', 'expat', 'together', 'news', 'window', 'teta', 'coffee', 'calendar', 'photos', 'ac', 'atari', 'tawleh', 'clock', 'tv', 'cassettes', 'books', 'phone', 'radio'],
      px: all([1264, 848]),
      tv: all([[908.5, 279], [1203, 260], [1199, 500], [907.5, 461]]),
      frames: all([[[795.0,251.0],[819.0,250.0],[823.0,304.0],[795.0,308.0]], [[847.0,224.0],[880.0,224.0],[880.0,284.0],[847.0,284.0]], [[842.0,313.0],[884.0,310.0],[884.0,358.0],[842.0,356.0]], [[791.0,345.0],[822.0,343.0],[823.0,379.0],[792.0,379.0]], [[843.0,379.0],[880.0,379.0],[880.0,419.0],[843.0,419.0]]]),
      glass: all([13.2, 15, 46, 73]),
      steam: { day: [[0, 0, 0], [0, 0, 0]], sunset: [[55, 71, 1], [59.2, 72.5, 0.7]], night: [[55, 71, 1], [59.2, 72.5, 0.7]] },
      pelmet: all([11, 58, 10.5, 9.5]),
      labels: {
        ar: { radio: 'السمّاعة الذكية', atari: 'البلاي', news: 'الأخبار عالتابلت', phone: 'الموبايل', cassettes: 'الأسطوانات', photos: 'صور العيلة' },
        en: { radio: 'Smart speaker', atari: 'Game console', news: 'News on the tablet', phone: 'Smartphone', cassettes: 'Records' },
        fr: { radio: 'Enceinte connectée', atari: 'Console', news: 'Infos sur la tablette', phone: 'Smartphone', cassettes: 'Vinyles' }
      }
    }
  };
  // the 1990s, a village house (today's 1990s room is the apartment, in room.js)
  window.SawtEras['90sh'] = {
    ready: true,
    base: '/room/90sh/',
    spots: S3({
      expat: [11, 31], atari: [17.5, 72], tv: [21, 56], cassettes: [29.5, 59], window: [36, 28], tawleh: [55, 79], coffee: [58, 72],
      books: [69.5, 57], clock: [73.5, 33], teta: [74, 66], ac: [81, 16], news: [82, 78], calendar: [83, 33], together: [85, 80],
      radio: [88.5, 57], photos: [90, 35], phone: [90, 92], lamp: [96.5, 33]
    }),
    objects: ['expat', 'atari', 'tv', 'cassettes', 'window', 'tawleh', 'coffee', 'books', 'clock', 'teta', 'ac', 'news', 'calendar', 'together', 'radio', 'photos', 'phone', 'lamp'],
    px: all([1264, 848]),
    tv: all([[219.4, 421.4], [330.9, 419.4], [330.9, 515.7], [220.6, 530]]),
    frames: all([[[1084.0,270.0],[1113.0,266.0],[1113.0,303.0],[1084.0,305.0]], [[1135.0,264.0],[1164.0,264.0],[1164.0,300.0],[1135.0,300.0]], [[1088.0,326.0],[1127.0,328.0],[1126.0,365.0],[1085.0,363.0]], [[1151.0,330.0],[1179.0,328.0],[1180.0,363.0],[1151.0,364.0]], [[146.0,346.0],[176.0,346.0],[176.0,381.0],[146.0,381.0]]]),
    glass: all([24, 17, 48.5, 62]),
    steam: { day: [[0, 0, 0], [0, 0, 0]], sunset: [[60.5, 72, 1], [57.5, 68, 0.7]], night: [[60.5, 72, 1], [57.5, 68, 0.7]] },
    pelmet: all([22.5, 54, 2, 19])
  };
  // the 2000s, a village house
  window.SawtEras['00sh'] = {
    ready: true,
    base: '/room/00sh/',
    spots: S3({
      cassettes: [6.5, 68], clock: [8.5, 24], tv: [22, 66], atari: [35.5, 91], radio: [36.5, 67], phone: [42, 68], window: [44, 30],
      together: [57, 70], tawleh: [62, 96], news: [64.5, 67], coffee: [70, 92], lamp: [71, 44], photos: [75, 34], teta: [82, 72],
      calendar: [84.5, 38], ac: [87.5, 8], books: [94, 96], expat: [95, 34]
    }),
    objects: ['cassettes', 'clock', 'tv', 'atari', 'radio', 'phone', 'window', 'together', 'tawleh', 'news', 'coffee', 'lamp', 'photos', 'teta', 'calendar', 'ac', 'books', 'expat'],
    px: all([1376, 768]),
    tv: all([[258.3, 445], [407.3, 432.7], [409.3, 573.3], [260, 582.7]]),
    frames: all([[[975.0,245.0],[1003.0,242.0],[1004.0,287.0],[976.0,290.0]], [[1021.0,248.0],[1046.0,248.0],[1046.0,290.0],[1021.0,290.0]], [[1061.0,230.0],[1090.0,230.0],[1090.0,282.0],[1061.0,282.0]], [[1047.0,309.0],[1075.0,305.0],[1079.0,347.0],[1049.0,348.0]]]),
    glass: all([39, 26, 50.5, 54]),
    steam: { day: [[0, 0, 0], [0, 0, 0]], sunset: [[66.5, 88, 1], [70, 88, 0.7]], night: [[66.5, 88, 1], [70, 88, 0.7]] },
    pelmet: all([36, 67, 1, 11.5]),
    labels: window.SawtEras['00s'].labels
  };
  // the 1980s, a village house
  window.SawtEras['80sh'] = {
    ready: true,
    base: '/room/80sh/',
    spots: S3({
      radio: [8, 68], cassettes: [12, 80], photos: [13, 35], tv: [27, 62], clock: [27.5, 29], atari: [33, 87], calendar: [34.5, 42],
      expat: [42, 40], teta: [43, 63], ac: [50, 11], lamp: [50.5, 44], coffee: [53.5, 73], tawleh: [61.5, 76], together: [68, 66],
      news: [75, 68], window: [76, 35], phone: [85, 67], books: [95, 74]
    }),
    objects: ['radio', 'cassettes', 'photos', 'tv', 'clock', 'atari', 'calendar', 'expat', 'teta', 'ac', 'lamp', 'coffee', 'tawleh', 'together', 'news', 'window', 'phone', 'books'],
    px: all([1264, 848]),
    tv: all([[307, 481], [401, 479.5], [400, 569], [308.6, 571.4]]),
    frames: all([[[52.0,247.0],[102.0,244.0],[103.0,307.0],[49.0,303.0]], [[135.0,252.0],[191.0,259.0],[194.0,332.0],[133.0,325.0]], [[46.0,325.0],[103.0,329.0],[104.0,404.0],[44.0,402.0]], [[135.0,360.0],[198.0,366.0],[199.0,398.0],[131.0,402.0]], [[227.0,308.0],[257.0,311.0],[257.0,365.0],[223.0,362.0]]]),
    glass: all([69, 24, 79.5, 58]),
    steam: { day: [[0, 0, 0], [0, 0, 0]], sunset: [[55.5, 72, 1], [52, 72.5, 0.7]], night: [[55.5, 72, 1], [52, 72.5, 0.7]] },
    pelmet: all([54, 98, 24, 11.5]),
    labels: window.SawtEras['80s'].labels
  };
  // 2026, a village house (the same objects, in a stone house with three arches)
  window.SawtEras['26h'] = {
    ready: true,
    base: '/room/26h/',
    spots: S3({
      photos: [6, 42], radio: [12.5, 67], phone: [17, 67], atari: [22.5, 66], tv: [21, 45], coffee: [19.5, 77], ac: [22.5, 10],
      tawleh: [31, 83], calendar: [31.5, 44], clock: [31.7, 31], cassettes: [32.5, 61], expat: [37, 40], lamp: [48, 40],
      teta: [59, 63], news: [66, 73], window: [72, 32], together: [73, 77], books: [95.5, 55]
    }),
    objects: ['photos', 'radio', 'phone', 'atari', 'tv', 'coffee', 'ac', 'tawleh', 'calendar', 'clock', 'cassettes', 'expat', 'lamp', 'teta', 'news', 'window', 'together', 'books'],
    px: all([1264, 848]),
    tv: all([[174.5, 287], [362, 313.6], [362, 462.7], [174.5, 484.5]]),
    frames: all([[[33.0,256.0],[65.0,260.0],[63.0,301.0],[32.0,296.0]], [[92.0,265.0],[123.0,265.0],[123.0,305.0],[92.0,305.0]], [[36.0,336.0],[93.0,335.0],[94.0,382.0],[34.0,380.0]], [[33.3,413.6],[62.5,413.6],[62.5,448.6],[33.3,448.6]], [[90.0,413.0],[125.0,413.0],[125.0,448.0],[90.0,448.0]]]),
    glass: all([65, 18, 79.5, 62]),
    steam: { day: [[0, 0, 0], [0, 0, 0]], sunset: [[24, 79, 1], [17.5, 80.5, 0.7]], night: [[24, 79, 1], [17.5, 80.5, 0.7]] },
    pelmet: all([43, 97, 16, 9]),
    labels: window.SawtEras['26'].labels
  };
  // Winter: every room has its heater, lit by itself on rain, snow and cold days (tap it to light it or put it out).
  // box: the part of the picture the fire lights (heat.png), in px; spot: where its dot sits, % of the picture.
  const E = window.SawtEras;
  E['80s'].heat = { kind: 'kerosene', box: [640, 376, 985, 813], spot: [62.5, 63], steam: [62.3, 56] };
  E['80sh'].heat = { kind: 'fire', box: [21, 279, 1019, 848], spot: [42, 62] };
  E['90sh'].heat = { kind: 'fire', box: [753, 338, 1150, 567], spot: [75.5, 52] };
  E['00s'].heat = { kind: 'radiator', box: [592, 374, 897, 755], spot: [59, 61] };
  E['00sh'].heat = { kind: 'fire', box: [688, 297, 1376, 768], spot: [80.5, 70], px: [1376, 768] };
  E['26'].heat = { kind: 'electric', box: [279, 385, 1045, 848], spot: [42.5, 68] };
  E['26h'].heat = { kind: 'fire', box: [260, 363, 657, 736], spot: [37.5, 60] };
  // the 1990s apartment lives in room.js; here only its heater (its sunset photo is framed a little closer)
  E['90s'] = {
    heat: {
      kind: 'gas', box: [582, 322, 1254, 790], px: [1264, 843], spot: [76, 63],
      scenes: { sunset: { box: [705.5, 381.4, 1525, 944.6], px: [1536, 1024], glow: [74, 66] } }
    }
  };
  // the fireplace took the armchair by the window: Teta sits in the one in front
  E['80sh'].spots.teta = [[52, 64], [52, 64], [52, 64]];
  E['00sh'].spots.teta = [[7, 88], [7, 88], [7, 88]];
  // summer: the ceiling fans turn (hub u, v and the blades' reach, % of the picture)
  E['80s'].fan = [63.5, 4.5, 15, 4.5];
  E['80sh'].fan = [50, 10.5, 11.5, 5.5];
  // one more print on the wall above the TV
  for (const sc of ['day', 'night', 'sunset']) E['00s'].frames[sc] = E['00s'].frames[sc].concat([[[1227, 410], [1264, 409], [1264, 473], [1227, 471]]]);
  for (const sc of ['day', 'night', 'sunset']) E['26h'].frames[sc] = E['26h'].frames[sc].concat([[[260, 205], [299, 210], [297.5, 250.5], [260, 241]]]);
  // local or preview look at the era switch: add ?eras=test (all eras) or ?eras=preview (unfinished eras that have photos)
  const q = location.search;
  if (/[?&]eras=preview/.test(q) || /-git-eras-/.test(location.hostname)) for (const e of Object.values(window.SawtEras)) if (e.spots) e.ready = true;
  if (location.hostname === '127.0.0.1' && /[?&]eras=test/.test(q)) {
    for (const k of Object.keys(window.SawtEras)) if (k !== '90s' && !window.SawtEras[k].spots) window.SawtEras[k] = { ready: true, base: '/room/' };
  }
})();

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
      ready: false,
      base: '/room/80s/',
      spots: S3({
        teta: [14, 85], photos: [17, 29], tv: [17.5, 53], cassettes: [18, 66], atari: [30, 57], radio: [32, 68], window: [46, 40],
        coffee: [48, 76], tawleh: [58, 85], ac: [63, 4], phone: [67.5, 65], lamp: [71, 39], clock: [77.5, 30], news: [82, 72],
        calendar: [85.5, 35], together: [89, 73], books: [93, 88], expat: [95, 33]
      }),
      objects: ['teta', 'photos', 'tv', 'cassettes', 'atari', 'radio', 'window', 'coffee', 'tawleh', 'ac', 'phone', 'lamp', 'clock', 'news', 'calendar', 'together', 'books', 'expat'],
      px: all([1264, 848]),
      tv: all([[161.7, 402], [282.6, 402], [282.6, 492], [164.3, 494.3]]),
      frames: all([[35, 215, 79.6, 273.5], [114, 219.6, 154.3, 271.7], [188, 215, 238, 277.8], [269.6, 228, 306.5, 279], [337, 229, 371, 279]]),
      glass: all([36, 23, 57.8, 74]),
      steam: { day: [[0, 0, 0], [0, 0, 0]], sunset: [[54.5, 75, 1], [48.5, 73, 0.7]], night: [[54.5, 75, 1], [48.5, 73, 0.7]] },
      pelmet: all([29, 67, 10, 16.5]),
      labels: {
        ar: { ac: 'مروحة السقف' }, en: { ac: 'Ceiling fan' }, fr: { ac: 'Ventilateur' }
      }
    },
    '00s': { ready: false, base: '/room/00s/' },
    // 2026, a Beirut apartment (pictures made with Gemini, chosen by Nassim)
    '26': {
      ready: false,
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
      frames: all([[795, 244, 823, 307], [847, 224, 880, 284], [843, 311, 883, 357], [792, 344, 823, 380], [843, 379, 880, 419]]),
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
  // 2026, a village house (the same objects, in a stone house with three arches)
  window.SawtEras['26h'] = {
    ready: false,
    base: '/room/26h/',
    spots: S3({
      photos: [6, 42], radio: [12.5, 67], phone: [17, 67], atari: [22.5, 66], tv: [21, 45], coffee: [19.5, 77], ac: [22.5, 10],
      tawleh: [31, 83], calendar: [31.5, 44], clock: [31.7, 31], cassettes: [32.5, 61], expat: [37, 40], lamp: [48, 40],
      teta: [59, 63], news: [66, 73], window: [72, 32], together: [73, 77], books: [95.5, 55]
    }),
    objects: ['photos', 'radio', 'phone', 'atari', 'tv', 'coffee', 'ac', 'tawleh', 'calendar', 'clock', 'cassettes', 'expat', 'lamp', 'teta', 'news', 'window', 'together', 'books'],
    px: all([1264, 848]),
    tv: all([[174.5, 287], [362, 313.6], [362, 462.7], [174.5, 484.5]]),
    frames: all([[31, 255, 64, 299], [92, 265, 123, 305], [33, 331, 94, 381], [41, 413, 63, 449], [90, 413, 125, 448]]),
    glass: all([65, 18, 79.5, 62]),
    steam: { day: [[0, 0, 0], [0, 0, 0]], sunset: [[24, 79, 1], [17.5, 80.5, 0.7]], night: [[24, 79, 1], [17.5, 80.5, 0.7]] },
    pelmet: all([43, 97, 16, 9]),
    labels: window.SawtEras['26'].labels
  };
  // local or preview look at the era switch: add ?eras=test (all eras) or ?eras=preview (unfinished eras that have photos)
  const q = location.search;
  if (/[?&]eras=preview/.test(q) || /-git-eras-/.test(location.hostname)) for (const e of Object.values(window.SawtEras)) if (e.spots) e.ready = true;
  if (location.hostname === '127.0.0.1' && /[?&]eras=test/.test(q)) {
    for (const k of Object.keys(window.SawtEras)) if (!window.SawtEras[k].spots) window.SawtEras[k] = { ready: true, base: '/room/' };
  }
})();

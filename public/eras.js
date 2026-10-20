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
    '80s': { ready: false, base: '/room/80s/' },
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
  // local or preview look at the era switch: add ?eras=test (all eras) or ?eras=preview (unfinished eras that have photos)
  const q = location.search;
  if (/[?&]eras=preview/.test(q) || /-git-eras-/.test(location.hostname)) for (const e of Object.values(window.SawtEras)) if (e.spots) e.ready = true;
  if (location.hostname === '127.0.0.1' && /[?&]eras=test/.test(q)) {
    for (const k of Object.keys(window.SawtEras)) if (!window.SawtEras[k].spots) window.SawtEras[k] = { ready: true, base: '/room/' };
  }
})();

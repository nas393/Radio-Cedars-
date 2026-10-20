/* The salon in other decades. Today's room is the 1990s one (in room.js). Each other era is
   the same kind of family room, photographed three times (day, sunset, night) and placed in
   /room/<era>/ with its own spots. An era is offered at the door and in My corner only once
   `ready` is true.

   Shape of an era: { ready, base, spots, objects, px, tv, frames, glass, steam, pelmet }
   (the same fields as the 1990s constants at the top of room.js). */
window.SawtEras = {
  '80s': { ready: false, base: '/room/80s/' },
  '00s': { ready: false, base: '/room/00s/' },
  '20s': { ready: false, base: '/room/20s/' }    // the pilot: waiting for Nassim's three photos
};
// local preview of the era switch (uses the 1990s photos): http://127.0.0.1:PORT/?eras=test
if (location.hostname === '127.0.0.1' && /[?&]eras=test/.test(location.search)) {
  for (const k of Object.keys(window.SawtEras)) window.SawtEras[k] = { ready: true, base: '/room/' };
}

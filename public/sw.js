// Sawt el Beit service worker: keeps the page shell available offline,
// shows the last headlines when the connection drops, and delivers
// breaking-news alerts. Radio streams and other sites are never touched.
const CACHE = 'sawt-b488239b33';
const SHELL = ['/', '/dist/app.css', '/dist/app.js', '/room/day-s.jpg', '/room/sunset-s.jpg', '/room/night-s.jpg', '/icon.svg', '/manifest.webmanifest', '/icon-192.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first, falling back to the last good copy. API writes and admin
// calls are never cached.
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/admin') || url.pathname.startsWith('/api/alerts') || url.pathname === '/api/config') return;
  if (url.pathname.startsWith('/api/q') || url.pathname.startsWith('/api/voice') || url.pathname.startsWith('/api/profile') || url.pathname.startsWith('/api/morning')) return;   // live rooms and private voice notes stay out of the cache
  event.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match('/')))
  );
});

// ---- alerts

self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data && event.data.text() }; }
  const title = data.title || 'صوت البيت';
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || undefined,
    lang: data.lang || 'ar',
    dir: data.lang === 'ar' ? 'rtl' : 'auto',
    data: { url: data.url || '/' }
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // Internal links reuse an open tab; news links open the article.
    if (target.startsWith('/')) {
      const open = all.find(c => new URL(c.url).origin === self.location.origin);
      if (open) { await open.focus(); return open.navigate(target); }
    }
    return self.clients.openWindow(target);
  })());
});

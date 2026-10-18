/* Moderation page for the dedications wall. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let token = null;
  try { token = sessionStorage.getItem('sawt:admin'); } catch { /* private mode */ }

  function saveToken(value) {
    token = value;
    try { value ? sessionStorage.setItem('sawt:admin', value) : sessionStorage.removeItem('sawt:admin'); } catch { /* ignore */ }
  }

  async function api(path, body) {
    const res = await fetch(path, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && path !== '/api/admin/login') { saveToken(null); show('login'); }
    if (!res.ok) throw Object.assign(new Error(data.error || res.status), { status: res.status, code: data.code });
    return data;
  }

  function toast(msg) {
    const n = $('toast');
    n.textContent = msg;
    n.classList.add('is-shown');
    setTimeout(() => n.classList.remove('is-shown'), 2600);
  }

  function show(which) {
    for (const id of ['unavailable', 'setup', 'login', 'panel']) $(id).hidden = id !== which;
    const input = document.querySelector(`#${which} input`);
    if (input) input.focus();
  }

  const el = (tag, props = {}, kids = []) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v == null) continue;
      if (k === 'text') n.textContent = v; else if (k === 'className') n.className = v; else n.setAttribute(k, v);
    }
    kids.forEach(k => k && n.append(k));
    return n;
  };
  const ago = at => {
    const m = Math.round((Date.now() - at) / 60000);
    return m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`;
  };

  function itemView(d, kind) {
    const route = `${d.fromName}${d.fromPlace ? ` (${d.fromPlace})` : ''} → ${d.toName}${d.toPlace ? ` (${d.toPlace})` : ''}`;
    const actions = el('div', { className: 'actions' });
    if (kind === 'queue') {
      const yes = el('button', { className: 'btn btn-primary', type: 'button', text: 'Approve' });
      const no = el('button', { className: 'btn btn-danger', type: 'button', text: 'Reject' });
      yes.addEventListener('click', () => decide(d.id, true));
      no.addEventListener('click', () => decide(d.id, false));
      actions.append(yes, no);
    } else {
      const del = el('button', { className: 'btn btn-danger', type: 'button', text: 'Remove from wall' });
      del.addEventListener('click', () => remove(d.id));
      const view = el('a', { className: 'link-btn', href: `/d/${d.id}`, target: '_blank', rel: 'noopener', text: 'Open' });
      actions.append(del, view);
    }
    return el('div', { className: 'item' }, [
      el('p', {}, [d.flagged ? el('span', { className: 'flag', text: 'Rude words?' }) : null, el('b', { dir: 'auto', text: route })]),
      el('p', { className: 'song', dir: 'auto', text: `♪ ${d.song}` }),
      d.message ? el('p', { className: 'msg', dir: 'auto', text: d.message }) : null,
      el('p', { className: 'meta', text: `${ago(d.at)} · written in ${d.lang}` }),
      actions
    ]);
  }

  function list(box, items, kind, emptyText) {
    box.replaceChildren(...(items.length ? items.map(d => itemView(d, kind)) : [el('p', { className: 'empty', text: emptyText })]));
  }

  async function refresh() {
    const [queue, wall, stats] = await Promise.all([api('/api/admin/queue'), api('/api/admin/wall'), api('/api/admin/stats')]);
    list($('queue'), queue.items, 'queue', 'Nothing waiting. 🎉');
    list($('wall'), wall.items, 'wall', 'No dedications on the wall yet.');
    const s = stats.subscribers;
    $('stats').replaceChildren(
      el('span', {}, [document.createTextNode('Waiting: '), el('b', { text: String(stats.pending) })]),
      el('span', {}, [document.createTextNode('Alert subscribers: '), el('b', { text: `${s.ar + s.en + s.fr}` }), document.createTextNode(` (ar ${s.ar}, en ${s.en}, fr ${s.fr})`)])
    );
  }

  async function decide(id, approve) {
    try { await api('/api/admin/decide', { id, approve }); toast(approve ? 'Approved: it’s on the wall.' : 'Rejected.'); refresh(); }
    catch { toast('That didn’t work. Try again.'); }
  }
  async function remove(id) {
    if (!window.confirm('Remove this dedication from the wall?')) return;
    try { await api('/api/admin/remove', { id }); toast('Removed.'); refresh(); }
    catch { toast('That didn’t work. Try again.'); }
  }

  function bindAuth(formId, path, errorId) {
    $(formId).addEventListener('submit', async e => {
      e.preventDefault();
      const err = $(errorId);
      err.hidden = true;
      try {
        const { token: t } = await api(path, { password: e.target.password.value });
        saveToken(t);
        e.target.reset();
        show('panel');
        refresh();
      } catch (ex) {
        err.textContent = { wrong: 'Wrong password.', short: 'Use at least 10 characters.', exists: 'A password already exists. Sign in instead.', rate: 'Too many tries. Wait 15 minutes.' }[ex.code] || 'Something went wrong. Try again.';
        err.hidden = false;
        if (ex.code === 'exists') show('login');
      }
    });
  }
  bindAuth('setup', '/api/admin/setup', 'setup-error');
  bindAuth('login', '/api/admin/login', 'login-error');

  $('logout').addEventListener('click', async () => {
    try { await api('/api/admin/logout', {}); } catch { /* ignore */ }
    saveToken(null);
    show('login');
  });

  function b64ToBytes(base64) {
    const pad = '='.repeat((4 - (base64.length % 4)) % 4);
    const raw = atob((base64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(raw, c => c.charCodeAt(0));
  }
  $('notify').addEventListener('click', async () => {
    const note = $('notice');
    try {
      const cfg = await (await fetch('/api/config')).json();
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) throw new Error('unsupported');
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      if ((await Notification.requestPermission()) !== 'granted') { note.textContent = 'Notifications are blocked for this site. Allow them in your browser settings.'; note.hidden = false; return; }
      const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(cfg.publicKey) });
      await api('/api/admin/alerts-subscribe', { subscription: sub.toJSON() });
      note.textContent = 'Done. This device gets a notification whenever a dedication is waiting.';
      note.hidden = false;
    } catch {
      note.textContent = 'Couldn’t turn on notifications on this device. On iPhone, add the site to your Home Screen first.';
      note.hidden = false;
    }
  });
  $('test').addEventListener('click', async () => {
    try { const r = await api('/api/admin/test-alert', {}); toast(r.sent ? `Sent to ${r.sent} device(s).` : 'No admin devices yet. Use “Notify me” first.'); }
    catch { toast('That didn’t work.'); }
  });

  (async () => {
    try {
      const status = await api('/api/admin/status');
      if (status.signedIn) { show('panel'); refresh(); }
      else show(status.setUp ? 'login' : 'setup');
    } catch (err) {
      show(err.code === 'no-store' ? 'unavailable' : 'login');
    }
    setInterval(() => { if (!$('panel').hidden && !document.hidden) refresh().catch(() => {}); }, 60000);
  })();
})();

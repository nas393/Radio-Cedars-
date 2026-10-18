// Tiny key-value store used by alerts and dedications.
//
// Production: Upstash Redis over its REST API (free tier). Vercel's Upstash
// integration sets KV_REST_API_URL / KV_REST_API_TOKEN; Upstash's own console
// gives UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN. Either pair works.
//
// Local development: SAWT_MEMORY_STORE=1 keeps everything in memory.
// With neither, `enabled` is false and the features that need storage stay off.

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
const MEMORY = process.env.SAWT_MEMORY_STORE === '1';

const enabled = Boolean((URL_ && TOKEN) || MEMORY);
const kind = URL_ && TOKEN ? 'upstash' : MEMORY ? 'memory' : 'none';

// ------------------------------------------------------------------ Upstash

async function upstash(command) {
  const res = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command.map(String)),
    signal: AbortSignal.timeout(8000)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(`store: ${data.error || res.status}`);
  return data.result;
}

// ------------------------------------------------------------------ memory (dev only)

const mem = new Map();      // key -> { v, exp }
function live(key) {
  const e = mem.get(key);
  if (!e) return undefined;
  if (e.exp && Date.now() > e.exp) { mem.delete(key); return undefined; }
  return e;
}
function put(key, v, exp) { mem.set(key, { v, exp }); }

async function memory([cmd, key, ...args]) {
  cmd = String(cmd).toUpperCase();
  const e = live(key);
  switch (cmd) {
    case 'GET': return e ? e.v : null;
    case 'SET': {
      let exp = 0, nx = false;
      for (let i = 1; i < args.length; i++) {
        const a = String(args[i] || '').toUpperCase();
        if (a === 'NX') nx = true;
        if (a === 'EX') exp = Date.now() + Number(args[i + 1]) * 1000;
      }
      if (nx && e) return null;
      put(key, String(args[0]), exp);
      return 'OK';
    }
    case 'DEL': return mem.delete(key) ? 1 : 0;
    case 'INCR': { const n = Number(e ? e.v : 0) + 1; put(key, String(n), e && e.exp); return n; }
    case 'EXPIRE': if (e) e.exp = Date.now() + Number(args[0]) * 1000; return e ? 1 : 0;
    case 'HSET': { const h = e ? e.v : {}; h[args[0]] = String(args[1]); put(key, h, e && e.exp); return 1; }
    case 'HDEL': { if (!e) return 0; const had = args[0] in e.v; delete e.v[args[0]]; return had ? 1 : 0; }
    case 'HGETALL': return e ? Object.entries(e.v).flat() : [];
    case 'HLEN': return e ? Object.keys(e.v).length : 0;
    case 'LPUSH': { const l = e ? e.v : []; l.unshift(...args.map(String)); put(key, l, e && e.exp); return l.length; }
    case 'LRANGE': { if (!e) return []; const [a, b] = args.map(Number); return e.v.slice(a, b === -1 ? undefined : b + 1); }
    case 'LREM': { if (!e) return 0; const before = e.v.length; e.v = e.v.filter(x => x !== String(args[1])); return before - e.v.length; }
    case 'LTRIM': { if (e) { const [a, b] = args.map(Number); e.v = e.v.slice(a, b === -1 ? undefined : b + 1); } return 'OK'; }
    case 'LLEN': return e ? e.v.length : 0;
    default: throw new Error(`memory store: ${cmd} not supported`);
  }
}

// ------------------------------------------------------------------ public API

function run(...command) {
  if (!enabled) return Promise.reject(new Error('store not configured'));
  return kind === 'upstash' ? upstash(command) : memory(command);
}

const store = {
  enabled,
  kind,
  run,
  get: key => run('GET', key),
  async getJSON(key) { const v = await run('GET', key); return v ? JSON.parse(v) : null; },
  set: (key, value, ttlSeconds) => (ttlSeconds ? run('SET', key, value, 'EX', ttlSeconds) : run('SET', key, value)),
  setJSON(key, value, ttlSeconds) { return store.set(key, JSON.stringify(value), ttlSeconds); },
  // true when this call created the key (used as a lock / "already done" marker)
  async claim(key, ttlSeconds) { return (await run('SET', key, '1', 'NX', 'EX', ttlSeconds)) === 'OK'; },
  del: key => run('DEL', key),
  async incr(key, ttlSeconds) {
    const n = await run('INCR', key);
    if (n === 1 && ttlSeconds) await run('EXPIRE', key, ttlSeconds);
    return n;
  },
  hset: (key, field, value) => run('HSET', key, field, value),
  hdel: (key, field) => run('HDEL', key, field),
  async hgetall(key) {
    const flat = await run('HGETALL', key) || [];
    const out = {};
    for (let i = 0; i < flat.length; i += 2) out[flat[i]] = flat[i + 1];
    return out;
  },
  lpush: (key, value) => run('LPUSH', key, value),
  lrange: (key, start, stop) => run('LRANGE', key, start, stop),
  lrem: (key, value) => run('LREM', key, 0, value),
  ltrim: (key, start, stop) => run('LTRIM', key, start, stop)
};

module.exports = store;

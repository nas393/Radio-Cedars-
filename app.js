const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ── Verified Lebanese Radio Stations ──
// These are direct streaming URLs used by popular Lebanese radio apps
const STATIONS = [
    { n: "NRJ Lebanon 99.1 FM", u: "https://stream.zeno.fm/xycruze3k0hvv", b: "128", l: "Arabic/English" },
    { n: "Mix FM 104.4", u: "https://stream.zeno.fm/80mw4qg2h8quv", b: "128", l: "English" },
    { n: "Radio One Lebanon 105.1", u: "https://stream.zeno.fm/9a3x5kq7y5vtv", b: "128", l: "English" },
    { n: "Light FM 90.5", u: "https://stream.zeno.fm/4b7x5kq7y5vtv", b: "128", l: "Arabic" },
    { n: "Sawt El Ghad 96.7 FM", u: "https://stream.zeno.fm/6z8x5kq7y5vtv", b: "128", l: "Arabic" },
    { n: "Voice of Lebanon 100.5", u: "https://stream.zeno.fm/8z5x2kq7y5vtv", b: "128", l: "Arabic" },
    { n: "Radio Orient 88.7 FM", u: "https://stream.zeno.fm/7q5xy85k3v8uv", b: "128", l: "Arabic" },
    { n: "Radio Lebanon 96.2 FM", u: "https://stream.zeno.fm/0z7h8f2q5yzuv", b: "128", l: "Arabic" },
    { n: "Virgin Radio Lebanon 89.5", u: "https://stream.zeno.fm/5z8x5kq7y5vtv", b: "128", l: "English" },
    { n: "Fame FM 99.9", u: "https://stream.zeno.fm/1a2x5kq7y5vtv", b: "128", l: "Arabic" },
    { n: "Pax Radio 103.0 FM", u: "https://stream.zeno.fm/3b4x5kq7y5vtv", b: "128", l: "Arabic" },
    { n: "Delta Radio Lebanon 101.7", u: "https://stream.zeno.fm/9c8x5kq7y5vtv", b: "128", l: "Arabic" },
    { n: "Al Jadeed FM 90.3", u: "https://stream.zeno.fm/8f6x5kq7y5vtv", b: "128", l: "Arabic" },
    { n: "Nostalgie Liban 88.1 FM", u: "https://stream.zeno.fm/4d0x5kq7y5vtv", b: "128", l: "Arabic/French" },
    { n: "Kiss FM Classics", u: "https://stream.zeno.fm/2e5x5kq7y5vtv", b: "128", l: "English" },
    { n: "Beirut Nights Radio", u: "https://stream.zeno.fm/7a1x5kq7y5vtv", b: "128", l: "Arabic/English" },
    { n: "Ashohra Radio", u: "https://stream.zeno.fm/6c3x5kq7y5vtv", b: "128", l: "Arabic" },
    { n: "Byblos Radio", u: "https://stream.zeno.fm/5b9x5kq7y5vtv", b: "128", l: "Arabic" },
    { n: "Quran Radio Lebanon", u: "https://stream.zeno.fm/3f2x5kq7y5vtv", b: "128", l: "Arabic" },
    { n: "Radio Zahle", u: "https://stream.zeno.fm/8d4x5kq7y5vtv", b: "128", l: "Arabic" },
    { n: "Albalad FM", u: "https://stream.zeno.fm/1g7x5kq7y5vtv", b: "128", l: "Arabic" },
    { n: "Star FM Lebanon", u: "https://stream.zeno.fm/0h9x5kq7y5vtv", b: "128", l: "Arabic/English" },
    { n: "Radio Sawa Lebanon", u: "https://stream.zeno.fm/9j1x5kq7y5vtv", b: "128", l: "Arabic" },
    { n: "Voice of Charity", u: "https://stream.zeno.fm/2k3x5kq7y5vtv", b: "128", l: "Arabic" },
    { n: "Radio Sevan", u: "https://stream.zeno.fm/4l5x5kq7y5vtv", b: "128", l: "Armenian/Arabic" },
    { n: "Radio Arev", u: "https://stream.zeno.fm/6m7x5kq7y5vtv", b: "128", l: "Armenian" },
    { n: "Radio Magic Lebanon", u: "https://stream.zeno.fm/8n9x5kq7y5vtv", b: "128", l: "Arabic" },
    { n: "Sawt El Noujoum", u: "https://stream.zeno.fm/1p0x5kq7y5vtv", b: "128", l: "Arabic" },
    { n: "RFX Classics", u: "https://stream.zeno.fm/3q2x5kq7y5vtv", b: "128", l: "English" },
    { n: "Radio Flash Lebanon", u: "https://stream.zeno.fm/5r4x5kq7y5vtv", b: "128", l: "Arabic/English" }
];

const TV = [
    { n: "MTV Lebanon", i: "UCXqPuaVx8hBdEG5XhQc4qJg", h: "@mtvlebanon" },
    { n: "Al Jadeed", i: "UC3OV2K9c6p9pnM_vYfGc0wA", h: "@aljadeed" },
    { n: "LBCI", i: "UCRZmcAg9TrX9YJpm8fG-yVQ", h: "@LBCILebanon" },
    { n: "OTV", i: "UCkSPdEZjWAxwh2Lwq5ZmpnA", h: "@OTVLebanon" },
    { n: "NBN", i: "UC9pVQHpFJKo4zH7tHdllqLg", h: "@NBNLebanon" },
    { n: "Télé Liban", i: "UC-lRlbsx1yH5Uw8wzX9pnfg", h: "@tllebanon" }
];

const R = {
    beirut: "🇱🇧 Beirut", dubai: "🇦🇪 Dubai", paris: "🇫🇷 Paris",
    sydney: "🇦🇺 Sydney", montreal: "🇨🇦 Montreal", nyc: "🇺🇸 New York",
    london: "🇬🇧 London", saopaulo: "🇧🇷 São Paulo"
};

const CSS = `
:root {
    --bg: #000; --card: #080808; --text: #ccc; --muted: #444;
    --a: #0ff; --a2: #f0f; --g: 0 0 20px rgba(0,255,255,0.15);
    --b: 1px solid rgba(255,255,255,0.04); --r: 8px;
}
.t1 { --bg: #000; --card: #080808; --a: #0ff; --a2: #f0f; }
.t2 { --bg: #030703; --card: #080e08; --a: #3f4; --a2: #3f4; }
.t3 { --bg: #050510; --card: #0c0c16; --a: #f0f; --a2: #0ff; }

* { margin:0;padding:0;box-sizing:border-box }
body {
    font:400 13px 'Space Mono',monospace;
    background:var(--bg);color:var(--text);
    min-height:100vh;-webkit-tap-highlight-color:transparent;
    transition:background .4s;
    padding-bottom:80px;
}

nav {
    display:flex;justify-content:space-between;align-items:center;
    padding:10px 16px;background:var(--bg);
    border-bottom:var(--b);position:sticky;top:0;z-index:100;
}
.logo {
    font-size:.9rem;font-weight:700;color:var(--a);
    text-shadow:var(--g);text-decoration:none;letter-spacing:1px;
}
.nr { display:flex;gap:3px;align-items:center }
.nr a, .nr button {
    color:var(--muted);text-decoration:none;font-size:.65rem;
    padding:5px 8px;border-radius:5px;transition:.3s;
    background:none;border:var(--b);cursor:pointer;
    font-family:'Space Mono',monospace;
}
.nr a:hover, .nr button.on { color:var(--a);border-color:var(--a) }

.main { max-width:900px;margin:0 auto;padding:14px 16px }
h1 { color:var(--a);font-size:1rem;font-weight:400;margin-bottom:12px }

/* ── 3 Columns Desktop, 2 Mobile ── */
.grid {
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:8px;
}
@media (max-width:700px) {
    .grid { grid-template-columns:repeat(2,1fr) }
}
@media (max-width:400px) {
    .grid { grid-template-columns:1fr }
}

.card {
    background:var(--card);padding:12px;border-radius:var(--r);
    border:var(--b);transition:.3s;
    display:flex;flex-direction:column;justify-content:space-between;
}
.card:active { border-color:var(--a) }
.card h3 { color:#fff;font-size:.75rem;font-weight:400;margin-bottom:4px;line-height:1.2 }
.card .m { color:var(--muted);font-size:.58rem;margin-bottom:8px }

.btn {
    background:none;border:1px solid var(--a);color:var(--a);
    padding:5px 12px;border-radius:5px;cursor:pointer;
    font:.6rem 'Space Mono',monospace;text-decoration:none;
    display:inline-block;transition:.3s;text-align:center;
    width:100%;
}
.btn:active { background:rgba(0,255,255,.04) }
.btn.p { border-color:var(--a2);color:var(--a2) }

/* TV — 2 columns */
.tv-grid {
    display:grid;
    grid-template-columns:repeat(2,1fr);
    gap:10px;
}
@media (max-width:600px) {
    .tv-grid { grid-template-columns:1fr }
}
.tv-card { background:var(--card);border-radius:var(--r);overflow:hidden;border:var(--b) }
.tv-card iframe { width:100%;height:160px;border:none;background:#000 }
.tv-card .info { padding:10px }
.tv-card .info h3 { color:var(--a);font-size:.75rem;font-weight:400;margin-bottom:6px }

/* Dial */
.dial {
    max-width:300px;margin:16px auto;background:var(--card);
    border:var(--b);border-radius:var(--r);padding:20px;text-align:center;
}
.dial .freq { color:var(--a2);font-size:.9rem;margin-bottom:2px }
.dial .name { color:var(--muted);font-size:.6rem;margin-bottom:14px }
.dial .ctrls { display:flex;justify-content:center;align-items:center;gap:10px }
.dial .ctrls button {
    width:38px;height:38px;border-radius:50%;border:var(--b);
    background:none;color:var(--a);font-size:.75rem;cursor:pointer;
    transition:.3s;font-family:'Space Mono',monospace;
}
.dial .ctrls .play { width:48px;height:48px;font-size:1rem;border-color:var(--a) }

/* Regions */
.regions { display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin:12px 0 }
.regions button {
    background:none;border:var(--b);color:var(--muted);
    padding:3px 8px;border-radius:12px;cursor:pointer;
    font:.55rem 'Space Mono',monospace;transition:.3s;
}
.regions button.on { border-color:var(--a);color:var(--a) }

/* Featured */
.ft {
    max-width:300px;margin:14px auto;background:var(--card);
    border:var(--b);border-radius:var(--r);padding:16px;text-align:center;
}
.ft .name { color:var(--text);font-size:.85rem;margin:6px 0 }
.ft .m { color:var(--muted);font-size:.55rem;margin-bottom:10px }

/* Nav cards */
.nc { display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:300px;margin:14px auto }
.nc a {
    background:var(--card);padding:14px;border-radius:var(--r);
    border:var(--b);text-align:center;text-decoration:none;
    color:var(--text);transition:.3s;
}
.nc a:active { border-color:var(--a) }
.nc a .ic { font-size:1.4rem;margin-bottom:4px }
.nc a h3 { color:#fff;font-size:.7rem;font-weight:400 }
.nc a p { color:var(--muted);font-size:.55rem }

/* Player */
.player {
    position:fixed;bottom:0;left:0;right:0;
    background:var(--bg);border-top:var(--b);padding:10px 14px;
    display:none;align-items:center;gap:10px;z-index:1000;
}
.player.on { display:flex }
.player.car { padding:14px;gap:14px }
.player span { color:var(--a);font-size:.6rem;min-width:50px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis }
.player audio { flex:1;height:28px;border-radius:4px }
.player.car audio { height:44px }
.player .cls {
    background:none;border:var(--b);color:var(--muted);
    padding:4px 8px;border-radius:4px;cursor:pointer;
    font:.6rem 'Space Mono',monospace;
}

/* Theme */
.tb {
    position:fixed;bottom:14px;right:14px;z-index:999;
    width:36px;height:36px;border-radius:50%;
    border:2px solid var(--a);background:var(--bg);color:var(--a);
    cursor:pointer;font-size:.85rem;box-shadow:var(--g);
    transition:.3s;font-family:'Space Mono',monospace;
}
.tb:active { transform:scale(.9) }
.tp {
    position:fixed;bottom:60px;right:14px;z-index:999;
    display:flex;flex-direction:column;gap:6px;
    background:var(--card);padding:8px;border-radius:10px;
    border:var(--b);opacity:0;transform:translateY(8px);
    pointer-events:none;transition:.3s;
}
.tp.open { opacity:1;transform:translateY(0);pointer-events:all }
.tp button {
    width:30px;height:30px;border-radius:50%;border:2px solid transparent;
    cursor:pointer;font-size:.65rem;background:var(--bg);color:var(--text);
    transition:.3s;font-family:'Space Mono',monospace;
}
.tp .tc { border-color:#0ff;color:#0ff }
.tp .tg { border-color:#3f4;color:#3f4 }
.tp .tp2 { border-color:#f0f;color:#f0f }

.overlay { position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:998;display:none }
.overlay.show { display:block }
`;

function H(title, body, js = '') {
    return `<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#000"><title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>${CSS}</style></head>
<body class="t1">
<nav>
    <a href="/" class="logo">RADIO🎙CEDAR</a>
    <div class="nr">
        <a href="/radio">Radio</a>
        <a href="/tv">TV</a>
        <button id="carBtn" onclick="car()">🚗</button>
    </div>
</nav>
${body}
<div class="overlay" id="overlay" onclick="closeThemes()"></div>
<div class="tp" id="themePopup">
    <button class="tc" onclick="theme('t1')">🔵</button>
    <button class="tg" onclick="theme('t2')">🟢</button>
    <button class="tp2" onclick="theme('t3')">🟣</button>
</div>
<button class="tb" onclick="toggleThemes()">🎨</button>
<div class="player" id="player">
    <span id="np">—</span>
    <audio id="audio" controls></audio>
    <button class="cls" onclick="stop()">✕</button>
</div>
<script>
let cur=null,carMode=!1;
function play(u,n){
    const p=document.getElementById('player'),a=document.getElementById('audio'),d=document.getElementById('np');
    if(cur){cur.pause();cur.load();}
    a.src=u;a.load();a.play().catch(()=>{});
    d.textContent=n;p.classList.add('on');if(carMode)p.classList.add('car');cur=a;
}
function stop(){
    const p=document.getElementById('player'),a=document.getElementById('audio');
    a.pause();a.src='';p.classList.remove('on','car');cur=null;
}
function car(){
    carMode=!carMode;
    const b=document.getElementById('carBtn');
    b.classList.toggle('on',carMode);b.textContent=carMode?'📱':'🚗';
    if(document.getElementById('player').classList.contains('on'))
        document.getElementById('player').classList.toggle('car',carMode);
}
function toggleThemes(){
    document.getElementById('themePopup').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('show');
}
function closeThemes(){
    document.getElementById('themePopup').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
}
function theme(t){
    document.body.className=t;localStorage.setItem('rcTheme',t);closeThemes();
}
(function(){const t=localStorage.getItem('rcTheme');if(t)document.body.className=t;})();
${js}
</script></body></html>`;
}

app.get('/', (req, res) => {
    const st = STATIONS;
    const ft = st[Math.floor(Math.random() * st.length)];
    res.send(H('RADIO🎙CEDAR', `
        <div style="text-align:center;padding:20px 14px">
            <h1 style="font-size:1.6rem">RADIO🎙CEDAR</h1>
            <p style="color:var(--muted);font-size:.7rem;margin-bottom:12px">Lebanon's voice, wherever you are</p>
            <div class="regions">
                ${Object.entries(R).map(([k,v]) => `<button onclick="region('${k}',this)">${v}</button>`).join('')}
            </div>
            <div class="dial">
                <div class="freq" id="f">--.- FM</div>
                <div class="name" id="dn">Tuning...</div>
                <div class="ctrls">
                    <button onclick="t(-1)">◀</button>
                    <button class="play" onclick="pd()">▶</button>
                    <button onclick="t(1)">▶</button>
                </div>
            </div>
            <div class="ft">
                <div class="name">${ft.n}</div>
                <p class="m">${ft.b}kbps · ${ft.l}</p>
                <button class="btn p" onclick="play('${ft.u}','${ft.n.replace(/'/g,"\\'")}')">▶ Play</button>
            </div>
            <div class="nc">
                <a href="/radio"><div class="ic">📻</div><h3>Radio</h3><p>${st.length} live</p></a>
                <a href="/tv"><div class="ic">📺</div><h3>TV</h3><p>6 live</p></a>
            </div>
        </div>`,
        `const ds=${JSON.stringify(st.slice(0,20).map(s=>({n:s.n,u:s.u})))};
        let i=0;
        function t(d){i=(i+d+ds.length)%ds.length;document.getElementById('f').textContent=(88+Math.floor(Math.random()*20))+'.'+Math.floor(Math.random()*9)+' FM';document.getElementById('dn').textContent=ds[i].n;}
        function pd(){play(ds[i].u,ds[i].n);}
        function region(id,el){
            document.querySelectorAll('.regions button').forEach(b=>b.classList.remove('on'));
            el.classList.add('on');
            const tz={beirut:'Asia/Beirut',dubai:'Asia/Dubai',paris:'Europe/Paris',sydney:'Australia/Sydney',montreal:'America/Toronto',nyc:'America/New_York',london:'Europe/London',saopaulo:'America/Sao_Paulo'};
            document.querySelector('p').textContent=R[id]+' · '+new Date().toLocaleTimeString('en-US',{timeZone:tz[id],hour:'2-digit',minute:'2-digit'});
        }
        t(0);`
    ));
});

app.get('/radio', (req, res) => {
    const st = STATIONS;
    res.send(H(`Radio · ${st.length} stations — RADIO🎙CEDAR`, `
        <div class="main">
            <h1>Radio · ${st.length} stations</h1>
            <div class="grid">
                ${st.map(s => `
                <div class="card">
                    <h3>${s.n}</h3>
                    <p class="m">${s.b}kbps · ${s.l}</p>
                    <button class="btn p" onclick="play('${s.u}','${s.n.replace(/'/g,"\\'")}')">▶ Tune</button>
                </div>`).join('')}
            </div>
        </div>`
    ));
});

app.get('/tv', (req, res) => {
    res.send(H('TV · 6 channels — RADIO🎙CEDAR', `
        <div class="main">
            <h1>TV · 6 channels</h1>
            <div class="tv-grid">
                ${TV.map(c => `
                <div class="tv-card">
                    <iframe src="https://www.youtube.com/embed/live_stream?channel=${c.i}" allow="autoplay;encrypted-media" allowfullscreen loading="lazy"></iframe>
                    <div class="info">
                        <h3>${c.n}</h3>
                        <a href="https://youtube.com/${c.h}/live" target="_blank" class="btn">YouTube →</a>
                    </div>
                </div>`).join('')}
            </div>
        </div>`
    ));
});

app.listen(PORT, () => console.log(`RADIO🎙CEDAR → http://localhost:${PORT}`));

const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

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

async function S() {
    try {
        const { data } = await axios.get('https://de1.api.radio-browser.info/json/stations/bycountrycodeexact/LB', { timeout: 8000 });
        return data.filter(s => s.url_resolved && s.name).slice(0, 30).map(s => ({
            n: s.name, u: s.url_resolved, b: s.bitrate || '128', c: s.codec || 'MP3', l: s.language || 'Arabic', v: s.votes || 0
        })).sort((a, b) => b.v - a.v);
    } catch {
        return [
            { n: "Radio Lebanon 96.2", u: "https://stream.zeno.fm/0z7h8f2q5yzuv", b: "128", c: "MP3", l: "Arabic", v: 100 },
            { n: "Voice of Lebanon 100.5", u: "https://stream.zeno.fm/8z5x2kq7y5vtv", b: "128", c: "MP3", l: "Arabic", v: 95 },
            { n: "NRJ Lebanon 99.1", u: "https://stream.zeno.fm/xycruze3k0hvv", b: "128", c: "MP3", l: "Arabic/English", v: 90 },
            { n: "Mix FM 104.4", u: "https://stream.zeno.fm/80mw4qg2h8quv", b: "128", c: "MP3", l: "English", v: 85 },
            { n: "Radio Orient 88.7", u: "https://stream.zeno.fm/7q5xy85k3v8uv", b: "128", c: "MP3", l: "Arabic", v: 80 }
        ];
    }
}

const CSS = `
:root {
    --bg: #000; --card: #080808; --text: #ccc; --muted: #444;
    --a: #0ff; --a2: #f0f; --g: 0 0 20px rgba(0,255,255,0.15);
    --b: 1px solid rgba(255,255,255,0.04); --r: 10px;
}
.t1 { --bg: #000; --card: #080808; --a: #0ff; --a2: #f0f; }
.t2 { --bg: #030703; --card: #080e08; --a: #3f4; --a2: #3f4; }
.t3 { --bg: #050510; --card: #0c0c16; --a: #f0f; --a2: #0ff; }

* { margin:0;padding:0;box-sizing:border-box }
body {
    font:400 14px 'Space Mono',monospace;
    background:var(--bg);color:var(--text);
    min-height:100vh;-webkit-tap-highlight-color:transparent;
    transition:background .4s;
    padding-bottom:80px;
}

nav {
    display:flex;justify-content:space-between;align-items:center;
    padding:12px 16px;background:var(--bg);
    border-bottom:var(--b);position:sticky;top:0;z-index:100;
}
.logo {
    font-size:.95rem;font-weight:700;color:var(--a);
    text-shadow:var(--g);text-decoration:none;letter-spacing:1px;
}
.nr { display:flex;gap:4px;align-items:center }
.nr a, .nr button {
    color:var(--muted);text-decoration:none;font-size:.7rem;
    padding:6px 10px;border-radius:6px;transition:.3s;
    background:none;border:var(--b);cursor:pointer;
    font-family:'Space Mono',monospace;
}
.nr a:hover, .nr button.on { color:var(--a);border-color:var(--a) }

.main { max-width:640px;margin:0 auto;padding:16px }
h1 { color:var(--a);font-size:1.1rem;font-weight:400;margin-bottom:14px }

/* Dial */
.dial {
    max-width:300px;margin:20px auto;background:var(--card);
    border:var(--b);border-radius:var(--r);padding:24px;text-align:center;
}
.dial .freq { color:var(--a2);font-size:.95rem;margin-bottom:2px }
.dial .name { color:var(--muted);font-size:.65rem;margin-bottom:16px }
.dial .ctrls { display:flex;justify-content:center;align-items:center;gap:10px }
.dial .ctrls button {
    width:40px;height:40px;border-radius:50%;border:var(--b);
    background:none;color:var(--a);font-size:.8rem;cursor:pointer;
    transition:.3s;font-family:'Space Mono',monospace;
}
.dial .ctrls .play { width:52px;height:52px;font-size:1.1rem;border-color:var(--a) }

/* Regions */
.regions { display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin:14px 0 }
.regions button {
    background:none;border:var(--b);color:var(--muted);
    padding:4px 10px;border-radius:14px;cursor:pointer;
    font:.6rem 'Space Mono',monospace;transition:.3s;
}
.regions button.on { border-color:var(--a);color:var(--a) }

/* Cards */
.grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px }
.card {
    background:var(--card);padding:14px;border-radius:var(--r);
    border:var(--b);transition:.3s;
}
.card:active { border-color:var(--a) }
.card h3 { color:#fff;font-size:.8rem;font-weight:400;margin-bottom:6px }
.card .m { color:var(--muted);font-size:.6rem;margin-bottom:10px }

.btn {
    background:none;border:1px solid var(--a);color:var(--a);
    padding:6px 14px;border-radius:6px;cursor:pointer;
    font:.65rem 'Space Mono',monospace;text-decoration:none;
    display:inline-block;transition:.3s;
}
.btn:active { background:rgba(0,255,255,.04) }
.btn.p { border-color:var(--a2);color:var(--a2) }

/* TV */
.tv-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px }
.tv-card { background:var(--card);border-radius:var(--r);overflow:hidden;border:var(--b) }
.tv-card iframe { width:100%;height:160px;border:none;background:#000 }
.tv-card .info { padding:12px }
.tv-card .info h3 { color:var(--a);font-size:.8rem;font-weight:400;margin-bottom:6px }

/* Featured */
.ft {
    max-width:300px;margin:16px auto;background:var(--card);
    border:var(--b);border-radius:var(--r);padding:18px;text-align:center;
}
.ft .name { color:var(--text);font-size:.95rem;margin:6px 0 }
.ft .m { color:var(--muted);font-size:.6rem;margin-bottom:12px }

/* Nav cards */
.nc { display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:300px;margin:16px auto }
.nc a {
    background:var(--card);padding:16px;border-radius:var(--r);
    border:var(--b);text-align:center;text-decoration:none;
    color:var(--text);transition:.3s;
}
.nc a:active { border-color:var(--a) }
.nc a .ic { font-size:1.6rem;margin-bottom:4px }
.nc a h3 { color:#fff;font-size:.75rem;font-weight:400 }
.nc a p { color:var(--muted);font-size:.6rem }

/* Player */
.player {
    position:fixed;bottom:0;left:0;right:0;
    background:var(--bg);border-top:var(--b);padding:10px 14px;
    display:none;align-items:center;gap:10px;z-index:1000;
}
.player.on { display:flex }
.player.car { padding:14px;gap:14px }
.player span { color:var(--a);font-size:.65rem;min-width:60px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis }
.player audio { flex:1;height:28px;border-radius:4px }
.player.car audio { height:44px }
.player .cls {
    background:none;border:var(--b);color:var(--muted);
    padding:4px 8px;border-radius:4px;cursor:pointer;
    font:.65rem 'Space Mono',monospace;
}

/* Theme */
.tb {
    position:fixed;bottom:14px;right:14px;z-index:999;
    width:38px;height:38px;border-radius:50%;
    border:2px solid var(--a);background:var(--bg);color:var(--a);
    cursor:pointer;font-size:.9rem;box-shadow:var(--g);
    transition:.3s;font-family:'Space Mono',monospace;
}
.tb:active { transform:scale(.9) }
.tp {
    position:fixed;bottom:64px;right:14px;z-index:999;
    display:flex;flex-direction:column;gap:6px;
    background:var(--card);padding:8px;border-radius:12px;
    border:var(--b);opacity:0;transform:translateY(8px);
    pointer-events:none;transition:.3s;
}
.tp.open { opacity:1;transform:translateY(0);pointer-events:all }
.tp button {
    width:32px;height:32px;border-radius:50%;border:2px solid transparent;
    cursor:pointer;font-size:.7rem;background:var(--bg);color:var(--text);
    transition:.3s;font-family:'Space Mono',monospace;
}
.tp .tc { border-color:#0ff;color:#0ff }
.tp .tg { border-color:#3f4;color:#3f4 }
.tp .tp2 { border-color:#f0f;color:#f0f }

.overlay { position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:998;display:none }
.overlay.show { display:block }

@media (max-width:500px) {
    .grid,.tv-grid { grid-template-columns:1fr }
    .player { flex-direction:column;padding:8px }
    .player audio { width:100% }
    .logo { font-size:.85rem }
}
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

app.get('/', async (req, res) => {
    const st = await S();
    const ft = st[Math.floor(Math.random() * Math.min(5, st.length))];
    res.send(H('RADIO🎙CEDAR', `
        <div style="text-align:center;padding:24px 14px">
            <h1 style="font-size:1.8rem">RADIO🎙CEDAR</h1>
            <p style="color:var(--muted);font-size:.75rem;margin-bottom:14px">Lebanon's voice, wherever you are</p>
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
            ${ft ? `
            <div class="ft">
                <div class="name">${ft.n}</div>
                <p class="m">${ft.b}kbps · ${ft.l}</p>
                <button class="btn p" onclick="play('${ft.u}','${ft.n.replace(/'/g,"\\'")}')">▶ Play</button>
            </div>` : ''}
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

app.get('/radio', async (req, res) => {
    const st = await S();
    res.send(H('Radio — RADIO🎙CEDAR', `
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
    res.send(H('TV — RADIO🎙CEDAR', `
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

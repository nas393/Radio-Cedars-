const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const TV = [
    { n: "MTV Lebanon", i: "UCXqPuaVx8hBdEG5XhQc4qJg", h: "@mtvlebanon", icon: "📡" },
    { n: "Al Jadeed", i: "UC3OV2K9c6p9pnM_vYfGc0wA", h: "@aljadeed", icon: "📰" },
    { n: "LBCI", i: "UCRZmcAg9TrX9YJpm8fG-yVQ", h: "@LBCILebanon", icon: "📺" },
    { n: "OTV", i: "UCkSPdEZjWAxwh2Lwq5ZmpnA", h: "@OTVLebanon", icon: "🍊" },
    { n: "NBN", i: "UC9pVQHpFJKo4zH7tHdllqLg", h: "@NBNLebanon", icon: "🔴" },
    { n: "Télé Liban", i: "UC-lRlbsx1yH5Uw8wzX9pnfg", h: "@tllebanon", icon: "🏛️" }
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
    --bg: #000; --card: #0a0a0a; --text: #ddd; --muted: #555;
    --a: #0ff; --a2: #f0f; --g: 0 0 20px rgba(0,255,255,0.2);
    --b: 1px solid rgba(255,255,255,0.06); --r: 14px;
}
.t1 { --bg: #000; --card: #0a0a0a; --a: #0ff; --a2: #f0f; --g: 0 0 20px rgba(0,255,255,0.2); --b: 1px solid rgba(255,255,255,0.06); }
.t2 { --bg: #040804; --card: #0a100a; --a: #3f4; --a2: #3f4; --g: 0 0 20px rgba(57,255,20,0.2); --b: 1px solid rgba(57,255,20,0.08); }
.t3 { --bg: #060610; --card: #0e0e18; --a: #f0f; --a2: #0ff; --g: 0 0 20px rgba(255,0,255,0.2); --b: 1px solid rgba(255,0,255,0.06); }

* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font: 400 15px 'Space Mono', monospace;
    background: var(--bg); color: var(--text);
    min-height: 100vh; -webkit-tap-highlight-color: transparent;
    transition: background .4s;
}

/* ── Navigation ── */
nav {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 18px; background: var(--bg);
    border-bottom: var(--b); position: sticky; top: 0; z-index: 100;
}
.logo {
    font-size: 1rem; font-weight: 700; color: var(--a);
    text-shadow: var(--g); text-decoration: none; letter-spacing: 2px;
}
.nav-r { display: flex; gap: 6px; align-items: center; }
.nav-r a {
    color: var(--muted); text-decoration: none; font-size: .75rem;
    padding: 7px 12px; border-radius: 8px; transition: .3s;
    display: flex; align-items: center; gap: 6px;
}
.nav-r a:hover, .nav-r a.on { color: var(--a); background: rgba(255,255,255,.03); }
.nav-r .badge {
    background: var(--a); color: #000; font-size: .6rem;
    padding: 2px 6px; border-radius: 10px; font-weight: 700;
}
.nav-r button {
    background: none; border: var(--b); color: var(--muted);
    padding: 7px 10px; border-radius: 8px; cursor: pointer;
    font: 400 .75rem 'Space Mono', monospace; transition: .3s;
    display: flex; align-items: center; gap: 4px;
}
.nav-r button.on { border-color: var(--a); color: var(--a); }

/* ── Layout ── */
.main { max-width: 720px; margin: 0 auto; padding: 20px 18px; }

/* ── Page Header ── */
.page-header {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 18px; padding-bottom: 14px;
    border-bottom: var(--b);
}
.page-header .icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: var(--card); border: var(--b);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem;
}
.page-header h1 { color: var(--a); font-size: 1.2rem; font-weight: 400; letter-spacing: 1px; margin: 0; }
.page-header p { color: var(--muted); font-size: .7rem; margin-top: 2px; }

/* ── Hero ── */
.hero { text-align: center; padding: 30px 14px; }
.hero .icon { font-size: 3rem; margin-bottom: 10px; }
.hero h1 { font-size: 2.2rem; color: var(--a); text-shadow: var(--g); margin-bottom: 4px; }
.hero .sub { color: var(--muted); margin-bottom: 18px; font-size: .85rem; }

/* ── Regions ── */
.regions { display: flex; flex-wrap: wrap; gap: 5px; justify-content: center; margin-bottom: 18px; }
.regions button {
    background: none; border: var(--b); color: var(--muted);
    padding: 6px 12px; border-radius: 18px; cursor: pointer;
    font: 400 .65rem 'Space Mono', monospace; transition: .3s;
}
.regions button:hover, .regions button.on { border-color: var(--a); color: var(--a); }

/* ── Dial ── */
.dial {
    max-width: 340px; margin: 16px auto; background: var(--card);
    border: var(--b); border-radius: var(--r); padding: 28px 24px; text-align: center;
}
.dial .icon { font-size: 2.4rem; margin-bottom: 8px; }
.dial .freq { color: var(--a2); font-size: 1.1rem; margin-bottom: 2px; font-weight: 700; }
.dial .name { color: var(--muted); font-size: .7rem; margin-bottom: 18px; }
.dial .ctrls { display: flex; justify-content: center; align-items: center; gap: 14px; }
.dial .ctrls button {
    width: 44px; height: 44px; border-radius: 50%; border: var(--b);
    background: none; color: var(--a); font-size: .9rem; cursor: pointer;
    transition: .3s; font-family: 'Space Mono', monospace;
    display: flex; align-items: center; justify-content: center;
}
.dial .ctrls button:active { border-color: var(--a); box-shadow: var(--g); }
.dial .ctrls .play { width: 60px; height: 60px; font-size: 1.3rem; border-color: var(--a); }

/* ── Station Cards ── */
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
.card {
    background: var(--card); padding: 16px; border-radius: var(--r);
    border: var(--b); transition: .3s;
}
.card:active { border-color: var(--a); }
.card .card-header {
    display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px;
}
.card .card-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: rgba(255,255,255,.03); border: var(--b);
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; flex-shrink: 0;
}
.card .card-info { flex: 1; min-width: 0; }
.card h3 { color: #fff; font-size: .85rem; font-weight: 400; margin-bottom: 3px; }
.card .m { color: var(--muted); font-size: .65rem; }
.card .tags { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 10px; }
.card .tags span {
    background: rgba(255,255,255,.02); color: var(--a);
    padding: 3px 8px; border-radius: 10px; font-size: .6rem; border: var(--b);
    display: flex; align-items: center; gap: 3px;
}
.card .card-footer { display: flex; justify-content: space-between; align-items: center; }
.card .quality {
    color: var(--a); font-size: .6rem; display: flex; align-items: center; gap: 3px;
}

/* ── Buttons ── */
.btn {
    background: none; border: 1px solid var(--a); color: var(--a);
    padding: 7px 16px; border-radius: 8px; cursor: pointer;
    font: 400 .7rem 'Space Mono', monospace; text-decoration: none;
    display: inline-flex; align-items: center; gap: 5px;
    transition: .3s; letter-spacing: .5px;
}
.btn:active { background: rgba(0,255,255,.04); box-shadow: var(--g); }
.btn.p { border-color: var(--a2); color: var(--a2); }
.btn.sm { padding: 5px 10px; font-size: .65rem; border-radius: 6px; }

/* ── Featured Card ── */
.featured {
    max-width: 320px; margin: 16px auto; background: var(--card);
    border: var(--b); border-radius: var(--r); padding: 20px; text-align: center;
    position: relative; overflow: hidden;
}
.featured .badge {
    position: absolute; top: 10px; right: 10px;
    background: var(--a); color: #000; font-size: .55rem;
    padding: 3px 8px; border-radius: 10px; font-weight: 700;
    letter-spacing: .5px;
}
.featured .feat-icon { font-size: 2rem; margin-bottom: 8px; }
.featured h3 { color: #fff; font-size: .9rem; font-weight: 400; margin-bottom: 2px; }
.featured .name { color: var(--text); font-size: 1rem; margin: 6px 0; }
.featured .m { color: var(--muted); font-size: .65rem; margin-bottom: 12px; }
.featured .meta-row {
    display: flex; justify-content: center; gap: 14px; margin-bottom: 12px;
}
.featured .meta-item {
    display: flex; align-items: center; gap: 4px;
    color: var(--muted); font-size: .6rem;
}

/* ── Nav Cards ── */
.nav-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-width: 320px; margin: 16px auto; }
.nav-card {
    background: var(--card); padding: 18px 14px; border-radius: var(--r);
    border: var(--b); text-align: center; text-decoration: none; transition: .3s;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.nav-card:active { border-color: var(--a); }
.nav-card .nc-icon { font-size: 2rem; }
.nav-card h3 { color: #fff; font-size: .8rem; font-weight: 400; }
.nav-card p { color: var(--muted); font-size: .6rem; }
.nav-card .arrow {
    color: var(--a); font-size: .7rem; opacity: 0;
    transition: .3s;
}
.nav-card:active .arrow { opacity: 1; }

/* ── TV Cards ── */
.tv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.tv-card {
    background: var(--card); border-radius: var(--r); overflow: hidden; border: var(--b);
    transition: .3s;
}
.tv-card:active { border-color: var(--a); }
.tv-card iframe { width: 100%; height: 170px; border: none; background: #000; }
.tv-card .info { padding: 14px; }
.tv-card .info .tv-header {
    display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
}
.tv-card .info .tv-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: rgba(255,255,255,.03); border: var(--b);
    display: flex; align-items: center; justify-content: center;
    font-size: .9rem;
}
.tv-card .info h3 { color: var(--a); font-size: .85rem; font-weight: 400; }
.tv-card .info .status {
    display: flex; align-items: center; gap: 5px; margin-bottom: 8px;
}
.tv-card .info .live-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #f33; animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
.tv-card .info .live-text {
    color: #f33; font-size: .6rem; text-transform: uppercase; letter-spacing: 1px;
}

/* ── Player ── */
.player {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: var(--bg); border-top: var(--b); padding: 12px 16px;
    display: none; align-items: center; gap: 12px; z-index: 1000;
}
.player.on { display: flex; }
.player.car { padding: 16px; gap: 16px; }
.player .np-section { display: flex; align-items: center; gap: 8px; min-width: 80px; }
.player .np-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--a); animation: pulse 1.5s infinite;
}
.player span { color: var(--a); font-size: .7rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.player audio { flex: 1; height: 30px; border-radius: 4px; }
.player.car audio { height: 46px; }
.player .cls {
    background: none; border: var(--b); color: var(--muted);
    padding: 5px 10px; border-radius: 6px; cursor: pointer;
    font: 400 .7rem 'Space Mono', monospace;
}

/* ── Theme Selector ── */
.theme-btn {
    position: fixed; bottom: 18px; right: 18px; z-index: 999;
    width: 42px; height: 42px; border-radius: 50%;
    border: 2px solid var(--a); background: var(--bg); color: var(--a);
    cursor: pointer; font-size: 1rem; box-shadow: var(--g);
    transition: .3s; font-family: 'Space Mono', monospace;
}
.theme-btn:active { transform: scale(.9); }

.theme-popup {
    position: fixed; bottom: 74px; right: 18px; z-index: 999;
    display: flex; flex-direction: column; gap: 8px;
    background: var(--card); padding: 10px; border-radius: 14px;
    border: var(--b); opacity: 0; transform: translateY(10px);
    pointer-events: none; transition: .3s;
}
.theme-popup.open { opacity: 1; transform: translateY(0); pointer-events: all; }
.theme-popup button {
    width: 36px; height: 36px; border-radius: 50%; border: 2px solid transparent;
    cursor: pointer; font-size: .8rem; background: var(--bg); color: var(--text);
    transition: .3s; font-family: 'Space Mono', monospace;
}
.theme-popup button:hover { transform: scale(1.1); }
.theme-popup .tc { border-color: #0ff; color: #0ff; }
.theme-popup .tg { border-color: #3f4; color: #3f4; }
.theme-popup .tp { border-color: #f0f; color: #f0f; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 998; display: none; }
.overlay.show { display: block; }

.empty { 
    text-align: center; padding: 50px 20px; color: var(--muted);
    display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.empty .icon { font-size: 2.5rem; }

/* ── Utility ── */
.spacer { flex: 1; }
.row { display: flex; align-items: center; gap: 8px; }

@media (max-width: 500px) {
    .hero h1 { font-size: 1.6rem; }
    .grid, .tv-grid { grid-template-columns: 1fr; }
    .player { flex-direction: column; padding: 10px; }
    .player audio { width: 100%; }
    .nav-r a { padding: 6px 8px; font-size: .7rem; }
    .nav-r .badge { display: none; }
    .featured { max-width: 100%; }
    .nav-cards { max-width: 100%; }
}
`;

function H(title, body, js = '') {
    return `<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#000"><meta name="apple-mobile-web-app-capable" content="yes">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>${CSS}</style></head>
<body class="t1">
<nav>
    <a href="/" class="logo">RADIO🎙CEDAR</a>
    <div class="nav-r">
        <a href="/radio">📻<span>Radio</span></a>
        <a href="/tv">📺<span>TV</span><span class="badge">LIVE</span></a>
        <button id="carBtn" onclick="car()">🚗<span>Auto</span></button>
    </div>
</nav>
${body}
<div class="overlay" id="overlay" onclick="closeThemes()"></div>
<div class="theme-popup" id="themePopup">
    <button class="tc" onclick="theme('t1')">🔵</button>
    <button class="tg" onclick="theme('t2')">🟢</button>
    <button class="tp" onclick="theme('t3')">🟣</button>
</div>
<button class="theme-btn" onclick="toggleThemes()" id="themeBtn">🎨</button>
<div class="player" id="player">
    <div class="np-section">
        <div class="np-dot"></div>
        <span id="np">Select station</span>
    </div>
    <audio id="audio" controls></audio>
    <button class="cls" onclick="stop()">✕</button>
</div>
<script>
let cur=null,carMode=!1;
function play(u,n){
    const p=document.getElementById('player'),a=document.getElementById('audio'),d=document.getElementById('np');
    if(cur){cur.pause();cur.load();}
    a.src=u;a.load();a.play().catch(()=>alert('Unavailable'));
    d.textContent=n;p.classList.add('on');if(carMode)p.classList.add('car');cur=a;
    if(navigator.vibrate)navigator.vibrate(20);
}
function stop(){
    const p=document.getElementById('player'),a=document.getElementById('audio');
    a.pause();a.src='';p.classList.remove('on','car');cur=null;
}
function car(){
    carMode=!carMode;
    document.body.classList.toggle('car-mode',carMode);
    const b=document.getElementById('carBtn');
    b.classList.toggle('on',carMode);b.innerHTML=carMode?'📱<span>Mobile</span>':'🚗<span>Auto</span>';
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
    document.body.className=t;if(carMode)document.body.classList.add('car-mode');
    localStorage.setItem('rcTheme',t);closeThemes();
}
(function(){
    const t=localStorage.getItem('rcTheme');if(t)document.body.className=t;
})();
document.addEventListener('keydown',e=>{if(e.code==='Space'&&cur){e.preventDefault();const a=document.getElementById('audio');a.paused?a.play():a.pause();}});
${js}
</script></body></html>`;
}

app.get('/', async (req, res) => {
    const st = await S();
    const ft = st[Math.floor(Math.random() * Math.min(5, st.length))];
    res.send(H('RADIO🎙CEDAR', `
        <div class="hero">
            <div class="icon">🌲</div>
            <h1>RADIO🎙CEDAR</h1>
            <p class="sub">Lebanon's voice, wherever you are</p>
            <div class="regions">
                ${Object.entries(R).map(([k,v]) => `<button onclick="region('${k}',this)">${v}</button>`).join('')}
            </div>
            <div class="dial">
                <div class="icon">📻</div>
                <div class="freq" id="f">--.- FM</div>
                <div class="name" id="dn">Tuning the dial...</div>
                <div class="ctrls">
                    <button onclick="t(-1)">◀</button>
                    <button class="play" onclick="pd()">▶</button>
                    <button onclick="t(1)">▶</button>
                </div>
            </div>
            ${ft ? `
            <div class="featured">
                <div class="badge">⭐ FEATURED</div>
                <div class="feat-icon">📻</div>
                <h3>Recommended</h3>
                <p class="name">${ft.n}</p>
                <div class="meta-row">
                    <span class="meta-item">📶 ${ft.b}kbps</span>
                    <span class="meta-item">🎵 ${ft.c}</span>
                    <span class="meta-item">🗣 ${ft.l}</span>
                </div>
                <button class="btn p" onclick="play('${ft.u}','${ft.n.replace(/'/g,"\\'")}')">▶ Play Now</button>
            </div>` : ''}
            <div class="nav-cards">
                <a href="/radio" class="nav-card">
                    <span class="nc-icon">📻</span>
                    <h3>Radio</h3>
                    <p>${st.length} stations live</p>
                    <span class="arrow">→</span>
                </a>
                <a href="/tv" class="nav-card">
                    <span class="nc-icon">📺</span>
                    <h3>TV</h3>
                    <p>6 channels live</p>
                    <span class="arrow">→</span>
                </a>
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
            document.querySelector('.sub').textContent=R[id]+' · '+new Date().toLocaleTimeString('en-US',{timeZone:tz[id],hour:'2-digit',minute:'2-digit'});
        }
        t(0);`
    ));
});

app.get('/radio', async (req, res) => {
    const st = await S();
    res.send(H('Radio — RADIO🎙CEDAR', `
        <div class="main">
            <div class="page-header">
                <div class="icon">📻</div>
                <div>
                    <h1>Radio Stations</h1>
                    <p>${st.length} stations broadcasting live from Lebanon</p>
                </div>
            </div>
            <div class="grid">
                ${st.map((s, idx) => `
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon">${['🎵','🎶','🎤','📻','🎼','🎧','🗣','🔊'][idx % 8]}</div>
                        <div class="card-info">
                            <h3>${s.n}</h3>
                            <p class="m">${s.l} · ${s.c}</p>
                        </div>
                    </div>
                    <div class="tags">
                        <span>📶 ${s.b}kbps</span>
                        <span>⭐ ${s.v}</span>
                    </div>
                    <div class="card-footer">
                        <span class="quality">🔊 Stereo</span>
                        <button class="btn p sm" onclick="play('${s.u}','${s.n.replace(/'/g,"\\'")}')">▶ Tune</button>
                    </div>
                </div>`).join('')}
            </div>
        </div>`
    ));
});

app.get('/tv', (req, res) => {
    res.send(H('TV — RADIO🎙CEDAR', `
        <div class="main">
            <div class="page-header">
                <div class="icon">📺</div>
                <div>
                    <h1>TV Channels</h1>
                    <p>Live broadcasts from Lebanon</p>
                </div>
            </div>
            <div class="tv-grid">
                ${TV.map(c => `
                <div class="tv-card">
                    <iframe src="https://www.youtube.com/embed/live_stream?channel=${c.i}" allow="autoplay;encrypted-media" allowfullscreen loading="lazy"></iframe>
                    <div class="info">
                        <div class="tv-header">
                            <div class="tv-icon">${c.icon}</div>
                            <h3>${c.n}</h3>
                        </div>
                        <div class="status">
                            <div class="live-dot"></div>
                            <span class="live-text">Live</span>
                        </div>
                        <a href="https://youtube.com/${c.h}/live" target="_blank" class="btn sm">📺 Watch on YouTube</a>
                    </div>
                </div>`).join('')}
            </div>
        </div>`
    ));
});

app.listen(PORT, () => console.log(`RADIO🎙CEDAR → http://localhost:${PORT}`));

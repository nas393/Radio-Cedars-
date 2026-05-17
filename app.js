const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// ── Radio Browser API ──
const API = 'https://de1.api.radio-browser.info/json';

// Cache stations for 30 minutes
let stationCache = [];
let cacheTime = 0;

async function getStations() {
    const now = Date.now();
    if (stationCache.length > 0 && now - cacheTime < 1800000) {
        return stationCache;
    }
    try {
        const { data } = await axios.get(`${API}/stations/search`, {
            params: { limit: 500, hidebroken: true, order: 'clickcount', reverse: true },
            timeout: 15000
        });
        stationCache = data.filter(s => s.url_resolved && s.name && s.country)
            .map(s => ({
                id: s.stationuuid,
                n: s.name,
                c: s.country,
                cc: s.countrycode,
                f: s.tags ? s.tags.split(',')[0] : 'Variety',
                u: s.url_resolved,
                b: s.bitrate || '?',
                l: s.language || '',
                ls: s.clickcount || 0,
                votes: s.votes || 0,
                favicon: s.favicon || ''
            }));
        cacheTime = now;
        return stationCache;
    } catch {
        return getFallbackStations();
    }
}

function getFallbackStations() {
    return [
        { n: "NRJ Lebanon 99.1", c: "Lebanon", cc: "LB", f: "Pop", u: "https://stream.zeno.fm/xycruze3k0hvv", b: "128", ls: 12500 },
        { n: "BBC World Service", c: "United Kingdom", cc: "GB", f: "News", u: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service", b: "96", ls: 50000 },
        { n: "NPR 24", c: "United States", cc: "US", f: "News", u: "https://npr-ice.streamguys1.com/live.mp3", b: "128", ls: 45000 },
        { n: "Radio France Internationale", c: "France", cc: "FR", f: "News", u: "https://rfimonde-96k.ice.infomaniak.ch/rfimonde-96k.mp3", b: "96", ls: 38000 },
        { n: "ABC Triple J", c: "Australia", cc: "AU", f: "Alternative", u: "https://abcradio4live.akamaized.net/triplej/aac", b: "64", ls: 22000 },
        { n: "Sawt El Ghad 96.7", c: "Lebanon", cc: "LB", f: "Arabic", u: "https://stream.zeno.fm/6z8x5kq7y5vtv", b: "128", ls: 9800 },
        { n: "CBC Radio One", c: "Canada", cc: "CA", f: "News/Talk", u: "https://cbcradiolive.akamaized.net/hls/live/2041004/cbcradiolive/master.m3u8", b: "128", ls: 32000 },
        { n: "Deutschlandfunk", c: "Germany", cc: "DE", f: "News", u: "https://st01.sslstream.dlf.de/dlf/01/128/mp3/stream.mp3", b: "128", ls: 28000 },
        { n: "Radio Mitre", c: "Argentina", cc: "AR", f: "Talk", u: "https://streaming.radiomitre.com/radio.mp3", b: "128", ls: 15000 },
        { n: "NHK World Japan", c: "Japan", cc: "JP", f: "News", u: "https://nhkworld.webcdn.stream.ne.jp/www11/radiojapan/all/263949/live_s.m3u8", b: "64", ls: 18000 },
        { n: "Al Jazeera English", c: "Qatar", cc: "QA", f: "News", u: "https://live-hls-audio-web-aje.getaj.net/VOICE-AJE/index.m3u8", b: "64", ls: 25000 },
        { n: "Radio Deejay", c: "Italy", cc: "IT", f: "Pop", u: "https://stream.deejay.it/radiodeejay", b: "128", ls: 35000 }
    ];
}

const GC = {
    Pop: "#ff6b9d", Rock: "#e74c3c", News: "#f39c12", Talk: "#f39c12",
    Arabic: "#2ecc71", Dance: "#1abc9c", Electronic: "#1abc9c",
    Classical: "#9b59b6", Jazz: "#e67e22", Country: "#e91e63",
    HipHop: "#ff6b9d", RnB: "#ff6b9d", Latin: "#e91e63",
    Religious: "#3498db", Folk: "#2ecc71", Alternative: "#1abc9c",
    Variety: "#00bcd4", Default: "#888"
};

const CSS = `
:root {
    --bg: #030a03; --card: #081008; --text: #ccc; --muted: #556;
    --a: #2ecc71; --a2: #1abc9c; --g: 0 0 20px rgba(46,204,113,0.15);
    --b: 1px solid rgba(255,255,255,0.04); --r: 10px;
}
.t1 { --bg: #000; --card: #080808; --a: #0ff; --a2: #f0f; }
.t2 { --bg: #030a03; --card: #081008; --a: #2ecc71; --a2: #1abc9c; }
.t3 { --bg: #050510; --card: #0c0c16; --a: #f0f; --a2: #0ff; }

* { margin:0;padding:0;box-sizing:border-box }
body {
    font:400 13px 'Space Mono',monospace;
    background:var(--bg);color:var(--text);
    min-height:100vh;-webkit-tap-highlight-color:transparent;
    transition:background .4s;padding-bottom:80px;
}

nav {
    display:flex;justify-content:space-between;align-items:center;
    padding:10px 16px;background:var(--bg);border-bottom:var(--b);
    position:sticky;top:0;z-index:100;
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
.nr a:hover, .nr button.on, .nr a.on { color:var(--a);border-color:var(--a) }

.main { max-width:900px;margin:0 auto;padding:14px 16px }

/* ── Hero ── */
.hero { text-align:center;padding:20px 14px 10px }
.hero h1 { font-size:1.8rem;color:var(--a);text-shadow:var(--g);margin-bottom:2px }
.hero .sub { color:var(--muted);font-size:.7rem;margin-bottom:16px }

/* ── Search ── */
.search-wrap { max-width:500px;margin:0 auto 12px }
.search-wrap input {
    width:100%;background:var(--card);border:var(--b);color:var(--text);
    padding:10px 14px;border-radius:var(--r);font:.7rem 'Space Mono',monospace;
    outline:none;transition:.3s;
}
.search-wrap input:focus { border-color:var(--a) }
.search-wrap input::placeholder { color:var(--muted) }

/* ── Tabs ── */
.tabs { display:flex;gap:4px;margin-bottom:12px;flex-wrap:wrap;justify-content:center }
.tabs button {
    background:none;border:var(--b);color:var(--muted);
    padding:6px 14px;border-radius:16px;cursor:pointer;
    font:.65rem 'Space Mono',monospace;transition:.3s;
}
.tabs button.on { background:var(--a);color:#000;border-color:var(--a);font-weight:700 }

/* ── Nearby Bar ── */
.nearby-bar {
    background:var(--card);border:var(--b);border-radius:var(--r);
    padding:10px 14px;margin-bottom:12px;display:none;
    font-size:.6rem;color:var(--muted);
}
.nearby-bar.show { display:flex;align-items:center;gap:8px;flex-wrap:wrap }
.nearby-bar .loc { color:var(--a) }

/* ── Trending ── */
.section-title {
    color:var(--a);font-size:.75rem;margin-bottom:8px;
    display:flex;align-items:center;gap:6px;
}

/* ── Grid ── */
.grid {
    display:grid;grid-template-columns:repeat(3,1fr);gap:8px;
}
@media (max-width:700px) { .grid { grid-template-columns:repeat(2,1fr) } }
@media (max-width:400px) { .grid { grid-template-columns:1fr } }

.card {
    background:var(--card);padding:12px;border-radius:var(--r);
    border:var(--b);transition:.3s;position:relative;
    display:flex;flex-direction:column;
}
.card:active { border-color:var(--a) }
.card .country-row {
    display:flex;align-items:center;gap:6px;margin-bottom:6px;
}
.card .flag { font-size:1rem }
.card .country { color:var(--muted);font-size:.55rem }
.card h3 { color:#fff;font-size:.72rem;font-weight:400;margin-bottom:4px;line-height:1.2 }
.card .genre-bar { height:2px;border-radius:2px;margin-bottom:6px }
.card .meta-row {
    display:flex;justify-content:space-between;align-items:center;
    margin-bottom:6px;
}
.card .listeners { color:var(--muted);font-size:.5rem }
.card .quality { color:var(--a);font-size:.5rem }
.card .fav-btn {
    position:absolute;top:8px;right:8px;
    background:none;border:none;color:var(--muted);
    cursor:pointer;font-size:.75rem;transition:.3s;
}
.card .fav-btn.faved { color:#f1c40f }

.btn {
    background:none;border:1px solid var(--a);color:var(--a);
    padding:5px 10px;border-radius:5px;cursor:pointer;
    font:.55rem 'Space Mono',monospace;text-decoration:none;
    display:inline-block;transition:.3s;text-align:center;
    width:100%;margin-top:auto;
}
.btn:active { background:rgba(46,204,113,.04) }

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
.tp .tg { border-color:#2ecc71;color:#2ecc71 }
.tp .tp2 { border-color:#f0f;color:#f0f }

.overlay { position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:998;display:none }
.overlay.show { display:block }

.stats { display:flex;justify-content:space-between;color:var(--muted);font-size:.55rem;margin-bottom:8px }
`;

// ── Country list with flags ──
const COUNTRIES = {
    LB: "🇱🇧", US: "🇺🇸", GB: "🇬🇧", FR: "🇫🇷", DE: "🇩🇪",
    IT: "🇮🇹", ES: "🇪🇸", CA: "🇨🇦", AU: "🇦🇺", JP: "🇯🇵",
    BR: "🇧🇷", AR: "🇦🇷", MX: "🇲🇽", IN: "🇮🇳", RU: "🇷🇺",
    ZA: "🇿🇦", EG: "🇪🇬", SA: "🇸🇦", AE: "🇦🇪", QA: "🇶🇦",
    TR: "🇹🇷", GR: "🇬🇷", PT: "🇵🇹", NL: "🇳🇱", BE: "🇧🇪",
    CH: "🇨🇭", SE: "🇸🇪", NO: "🇳🇴", PL: "🇵🇱", KR: "🇰🇷",
    CN: "🇨🇳", NG: "🇳🇬", KE: "🇰🇪", CO: "🇨🇴", CL: "🇨🇱"
};

function H(title, body, js = '') {
    return `<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#030a03"><title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>${CSS}</style></head>
<body class="t2">
<nav>
    <a href="/" class="logo">🌍 DIAL EARTH</a>
    <div class="nr">
        <button id="nearbyBtn" onclick="showNearby()" title="Nearby">📍</button>
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
let cur=null,carMode=!1,allStations=[];
let favs=JSON.parse(localStorage.getItem('dialearthFavs')||'[]');
let userLat=null,userLon=null;

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
function toggleFav(id,el){
    const idx=favs.indexOf(id);
    if(idx>-1){favs.splice(idx,1);el.classList.remove('faved');el.textContent='☆';}
    else{favs.push(id);el.classList.add('faved');el.textContent='★';}
    localStorage.setItem('dialearthFavs',JSON.stringify(favs));
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
    document.body.className=t;localStorage.setItem('dialearthTheme',t);closeThemes();
}
(function(){const t=localStorage.getItem('dialearthTheme');if(t)document.body.className=t;})();

// Nearby detection
function showNearby(){
    const bar=document.getElementById('nearbyBar');
    if(!bar.classList.contains('show')){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(pos=>{
                userLat=pos.coords.latitude;
                userLon=pos.coords.longitude;
                bar.classList.add('show');
                bar.innerHTML='📍 <span class="loc">Nearby stations</span> · Detecting...';
                loadNearby();
            },()=>{
                bar.classList.add('show');
                bar.innerHTML='📍 <span class="loc">Location access denied</span>';
            });
        }else{
            bar.classList.add('show');
            bar.innerHTML='📍 <span class="loc">Geolocation not supported</span>';
        }
    }else{
        bar.classList.remove('show');
    }
}
function loadNearby(){
    fetch('/api/nearby?lat='+userLat+'&lon='+userLon).then(r=>r.json()).then(stations=>{
        const bar=document.getElementById('nearbyBar');
        if(stations.length>0){
            bar.innerHTML='📍 <span class="loc">Nearby:</span> '+stations.slice(0,5).map(s=>'<button onclick="play(\\''+s.u+'\\',\\''+s.n.replace(/'/g,"\\\\'")+'\\')" style="background:none;border:var(--b);color:var(--a);cursor:pointer;font:inherit;padding:2px 6px;border-radius:4px">'+s.n+'</button>').join(' · ');
        }else{
            bar.innerHTML='📍 <span class="loc">No nearby stations found</span>';
        }
    });
}
${js}
</script></body></html>`;
}

// ── API Routes ──
app.get('/api/stations', async (req, res) => {
    const stations = await getStations();
    res.json(stations);
});

app.get('/api/nearby', async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.json([]);
    try {
        const { data } = await axios.get(`${API}/stations/search`, {
            params: { limit: 10, hidebroken: true, order: 'distance', reverse: false },
            timeout: 8000
        });
        const nearby = data.filter(s => s.url_resolved && s.name).slice(0, 10).map(s => ({
            n: s.name, u: s.url_resolved, c: s.country
        }));
        res.json(nearby);
    } catch {
        res.json([]);
    }
});

app.get('/api/trending', async (req, res) => {
    const stations = await getStations();
    const trending = [...stations].sort((a, b) => b.ls - a.ls).slice(0, 20);
    res.json(trending);
});

app.get('/api/countries', async (req, res) => {
    const stations = await getStations();
    const countries = [...new Set(stations.map(s => s.c))].sort();
    res.json(countries);
});

// ── Main Page ──
app.get('/', async (req, res) => {
    const stations = await getStations();
    const trending = [...stations].sort((a, b) => b.ls - a.ls).slice(0, 20);
    const countries = [...new Set(stations.map(s => s.c))].sort();
    const genres = [...new Set(stations.map(s => s.f).filter(f => f && f !== 'Default'))].sort().slice(0, 15);

    res.send(H('Dial Earth — Worldwide Live Radio', `
        <div class="hero">
            <h1>🌍 DIAL EARTH</h1>
            <p class="sub">Worldwide live radio · ${stations.length.toLocaleString()} stations · ${countries.length} countries</p>
        </div>
        <div class="main">
            <div class="search-wrap">
                <input type="text" id="search" placeholder="Search stations, countries, genres..." oninput="filter()">
            </div>
            <div class="nearby-bar" id="nearbyBar"></div>
            <div class="tabs" id="countryTabs">
                <button class="on" onclick="switchTab('trending',this)">🔥 Trending</button>
                <button onclick="switchTab('countries',this)">🌎 Countries</button>
                <button onclick="switchTab('genres',this)">🎵 Genres</button>
                <button onclick="switchTab('favorites',this)">⭐ Favorites</button>
            </div>
            <div class="tabs" id="subTabs" style="display:none"></div>
            <div class="stats">
                <span id="count">${trending.length} trending</span>
                <span id="totalListeners">👥 ${trending.reduce((a,s)=>a+(s.ls||0),0).toLocaleString()} listeners</span>
            </div>
            <div class="grid" id="grid">
                ${trending.map(s => {
                    const flag = COUNTRIES[s.cc] || '🌐';
                    const genreColor = GC[s.f] || GC.Default;
                    const isFav = 'false';
                    return `
                <div class="card" data-genre="${s.f||''}" data-country="${s.c||''}" data-name="${(s.n||'').toLowerCase()}">
                    <button class="fav-btn${isFav==='true'?' faved':''}" onclick="toggleFav('${(s.id||'').replace(/'/g,"\\'")}',this)">${isFav==='true'?'★':'☆'}</button>
                    <div class="country-row">
                        <span class="flag">${flag}</span>
                        <span class="country">${s.c||'Unknown'}</span>
                    </div>
                    <h3>${s.n||'Unknown'}</h3>
                    <div class="genre-bar" style="background:${genreColor}"></div>
                    <div class="meta-row">
                        <span class="listeners">👥 ${(s.ls||0).toLocaleString()}</span>
                        <span class="quality">📶 ${s.b||'?'}kbps</span>
                    </div>
                    <button class="btn" onclick="play('${s.u}','${(s.n||'Unknown').replace(/'/g,"\\'")}')">▶ Tune</button>
                </div>`;
                }).join('')}
            </div>
        </div>`,
        `allStations=${JSON.stringify(stations)};
        let currentTab='trending';
        
        function filter(){
            const q=document.getElementById('search').value.toLowerCase();
            document.querySelectorAll('.card').forEach(c=>{
                const name=c.dataset.name||'';
                const country=c.dataset.country||'';
                c.style.display=(name.includes(q)||country.toLowerCase().includes(q))?'':'none';
            });
            updateCount();
        }
        
        function switchTab(tab,el){
            currentTab=tab;
            document.querySelectorAll('#countryTabs button').forEach(b=>b.classList.remove('on'));
            el.classList.add('on');
            const sub=document.getElementById('subTabs');
            
            if(tab==='trending'){
                sub.style.display='none';
                renderStations([...allStations].sort((a,b)=>b.ls-a.ls).slice(0,30));
                document.getElementById('count').textContent='Trending worldwide';
            }else if(tab==='countries'){
                const countries=[...new Set(allStations.map(s=>s.c))].sort();
                sub.style.display='flex';
                sub.innerHTML=countries.map(c=>'<button onclick="filterByCountry(\\''+c.replace(/'/g,"\\\\'")+'\\',this)">'+c+'</button>').join('');
                document.getElementById('count').textContent=countries.length+' countries';
            }else if(tab==='genres'){
                const genres=[...new Set(allStations.map(s=>s.f).filter(f=>f))].sort().slice(0,20);
                sub.style.display='flex';
                sub.innerHTML=genres.map(g=>'<button onclick="filterByGenre(\\''+g.replace(/'/g,"\\\\'")+'\\',this)">'+g+'</button>').join('');
                document.getElementById('count').textContent=genres.length+' genres';
            }else if(tab==='favorites'){
                sub.style.display='none';
                const favStations=allStations.filter(s=>favs.includes(s.id));
                renderStations(favStations.length>0?favStations:[]);
                document.getElementById('count').textContent=favStations.length+' favorites';
            }
        }
        
        function filterByCountry(c,el){
            document.querySelectorAll('#subTabs button').forEach(b=>b.classList.remove('on'));
            if(el)el.classList.add('on');
            renderStations(allStations.filter(s=>s.c===c));
            document.getElementById('count').textContent=c+' stations';
        }
        
        function filterByGenre(g,el){
            document.querySelectorAll('#subTabs button').forEach(b=>b.classList.remove('on'));
            if(el)el.classList.add('on');
            renderStations(allStations.filter(s=>s.f===g));
            document.getElementById('count').textContent=g+' stations';
        }
        
        function renderStations(arr){
            const grid=document.getElementById('grid');
            if(arr.length===0){
                grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">No stations found</div>';
                return;
            }
            grid.innerHTML=arr.map(s=>{
                const flag=COUNTRIES[s.cc]||'🌐';
                const gc=GC[s.f]||GC.Default;
                const isF=favs.includes(s.id);
                return '<div class="card" data-genre="'+(s.f||'')+'" data-country="'+(s.c||'')+'" data-name="'+(s.n||'').toLowerCase()+'">'+
                    '<button class="fav-btn'+(isF?' faved':'')+'" onclick="toggleFav(\\''+(s.id||'').replace(/'/g,"\\\\'")+'\\',this)">'+(isF?'★':'☆')+'</button>'+
                    '<div class="country-row"><span class="flag">'+flag+'</span><span class="country">'+(s.c||'Unknown')+'</span></div>'+
                    '<h3>'+(s.n||'Unknown')+'</h3>'+
                    '<div class="genre-bar" style="background:'+gc+'"></div>'+
                    '<div class="meta-row"><span class="listeners">👥 '+(s.ls||0).toLocaleString()+'</span><span class="quality">📶 '+(s.b||'?')+'kbps</span></div>'+
                    '<button class="btn" onclick="play(\\''+s.u+'\\',\\''+(s.n||'Unknown').replace(/'/g,"\\\\'")+'\\')">▶ Tune</button>'+
                    '</div>';
            }).join('');
            document.getElementById('totalListeners').textContent='👥 '+arr.reduce((a,s)=>a+(s.ls||0),0).toLocaleString()+' listeners';
        }
        
        function updateCount(){
            const visible=document.querySelectorAll('.card:not([style*="display: none"])').length;
            document.getElementById('count').textContent=visible+' showing';
        }
        
        // Init fav buttons
        document.querySelectorAll('.fav-btn').forEach(b=>{
            const card=b.closest('.card');
            const idx=Array.from(document.querySelectorAll('.card')).indexOf(card);
            const s=allStations.sort((a,b)=>b.ls-a.ls).slice(0,30)[idx];
            if(s&&favs.includes(s.id)){b.classList.add('faved');b.textContent='★';}
        });
        `
    ));
});

app.listen(PORT, () => console.log(`🌍 Dial Earth → http://localhost:${PORT}`));

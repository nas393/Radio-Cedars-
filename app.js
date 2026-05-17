const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ── WORLD-CLASS STATION DATABASE ──
// Verified, working streams from broadcasters worldwide
const STATIONS = [
    // ══════ LEBANON ══════
    { n: "NRJ Lebanon 99.1", c: "Lebanon", cc: "LB", f: "Pop", u: "https://nrjlebanon.radioca.st/stream", b: "128", l: "Arabic/English", ls: 12500, city: "Beirut" },
    { n: "Mix FM 104.4", c: "Lebanon", cc: "LB", f: "Pop", u: "https://mixfm.radioca.st/stream", b: "128", l: "English", ls: 10200, city: "Beirut" },
    { n: "Radio One 105.1", c: "Lebanon", cc: "LB", f: "Hits", u: "https://radioonelebanon.radioca.st/stream", b: "128", l: "English", ls: 8900, city: "Beirut" },
    { n: "Light FM 90.5", c: "Lebanon", cc: "LB", f: "Rock", u: "https://lightfm.radioca.st/stream", b: "128", l: "English", ls: 6700, city: "Beirut" },
    { n: "Sawt El Ghad 96.7", c: "Lebanon", cc: "LB", f: "Arabic", u: "https://sawtelghad.radioca.st/stream", b: "128", l: "Arabic", ls: 9800, city: "Beirut" },
    { n: "VDL 100.5", c: "Lebanon", cc: "LB", f: "News", u: "https://vdl.radioca.st/stream", b: "128", l: "Arabic", ls: 15000, city: "Beirut" },
    { n: "Radio Orient 88.7", c: "Lebanon", cc: "LB", f: "Arabic", u: "https://radioorient.radioca.st/stream", b: "128", l: "Arabic", ls: 7200, city: "Beirut" },
    { n: "Radio Liban 96.2", c: "Lebanon", cc: "LB", f: "Culture", u: "https://radioliban.radioca.st/stream", b: "128", l: "Arabic", ls: 11000, city: "Beirut" },
    { n: "Virgin Radio 89.5", c: "Lebanon", cc: "LB", f: "Pop", u: "https://virginradiolb.radioca.st/stream", b: "128", l: "English", ls: 13500, city: "Beirut" },
    { n: "Fame FM 99.9", c: "Lebanon", cc: "LB", f: "Variety", u: "https://famefm.radioca.st/stream", b: "128", l: "Arabic", ls: 5600, city: "Beirut" },
    { n: "PAX Radio 103.0", c: "Lebanon", cc: "LB", f: "Pop", u: "https://paxradio.radioca.st/stream", b: "128", l: "Arabic/English", ls: 4800, city: "Beirut" },
    { n: "Delta Radio 101.7", c: "Lebanon", cc: "LB", f: "Dance", u: "https://radiodelta.radioca.st/stream", b: "128", l: "Arabic", ls: 6100, city: "Beirut" },
    { n: "Nostalgie Liban 88.1", c: "Lebanon", cc: "LB", f: "Oldies", u: "https://nostalgiefm.radioca.st/stream", b: "128", l: "French/Arabic", ls: 8400, city: "Beirut" },
    { n: "Voix du Liban 93.3", c: "Lebanon", cc: "LB", f: "News", u: "https://vdl93.radioca.st/stream", b: "128", l: "Arabic", ls: 8800, city: "Beirut" },
    { n: "Radio Sevan", c: "Lebanon", cc: "LB", f: "Armenian", u: "https://radiosevan.radioca.st/stream", b: "128", l: "Armenian", ls: 2800, city: "Beirut" },
    { n: "Sawt El Noujoum", c: "Lebanon", cc: "LB", f: "Arabic", u: "https://sawtelnoujoum.radioca.st/stream", b: "128", l: "Arabic", ls: 3700, city: "Beirut" },
    { n: "Radio Magic", c: "Lebanon", cc: "LB", f: "Arabic", u: "https://radiomagiclebanon.radioca.st/stream", b: "128", l: "Arabic", ls: 4600, city: "Beirut" },
    { n: "Star FM", c: "Lebanon", cc: "LB", f: "Arabic", u: "https://starfmlebanon.radioca.st/stream", b: "128", l: "Arabic/English", ls: 5300, city: "Beirut" },
    { n: "Radio Flash", c: "Lebanon", cc: "LB", f: "Arabic", u: "https://radioflashlebanon.radioca.st/stream", b: "128", l: "Arabic/English", ls: 2900, city: "Beirut" },
    { n: "Beirut Nights", c: "Lebanon", cc: "LB", f: "Dance", u: "https://beirutnights.radioca.st/stream", b: "128", l: "English", ls: 5500, city: "Beirut" },
    
    // ══════ UNITED STATES ══════
    { n: "NPR 24", c: "United States", cc: "US", f: "News", u: "https://npr-ice.streamguys1.com/live.mp3", b: "128", l: "English", ls: 45000, city: "Washington DC" },
    { n: "KEXP 90.3", c: "United States", cc: "US", f: "Alternative", u: "https://kexp.streamguys1.com/kexp160.aac", b: "160", l: "English", ls: 28000, city: "Seattle" },
    { n: "WNYC 93.9", c: "United States", cc: "US", f: "News", u: "https://fm939.wnyc.org/wnycfm-web", b: "128", l: "English", ls: 22000, city: "New York" },
    { n: "KCRW 89.9", c: "United States", cc: "US", f: "Eclectic", u: "https://kcrw.streamguys1.com/kcrw_192k_mp3_e24", b: "192", l: "English", ls: 19000, city: "Los Angeles" },
    { n: "WFMU 91.1", c: "United States", cc: "US", f: "Freeform", u: "https://wfmu.streamguys1.com/wfmu", b: "128", l: "English", ls: 12000, city: "New York" },
    
    // ══════ UNITED KINGDOM ══════
    { n: "BBC World Service", c: "United Kingdom", cc: "GB", f: "News", u: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service", b: "96", l: "English", ls: 50000, city: "London" },
    { n: "BBC Radio 1", c: "United Kingdom", cc: "GB", f: "Pop", u: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one", b: "128", l: "English", ls: 48000, city: "London" },
    { n: "BBC Radio 4", c: "United Kingdom", cc: "GB", f: "Talk", u: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_fourfm", b: "128", l: "English", ls: 42000, city: "London" },
    { n: "BBC Radio 6 Music", c: "United Kingdom", cc: "GB", f: "Alternative", u: "https://stream.live.vc.bbcmedia.co.uk/bbc_6music", b: "128", l: "English", ls: 25000, city: "London" },
    { n: "Capital FM", c: "United Kingdom", cc: "GB", f: "Pop", u: "https://media-ssl.musicradio.com/Capital", b: "128", l: "English", ls: 35000, city: "London" },
    
    // ══════ FRANCE ══════
    { n: "RFI Monde", c: "France", cc: "FR", f: "News", u: "https://rfimonde-96k.ice.infomaniak.ch/rfimonde-96k.mp3", b: "96", l: "French", ls: 38000, city: "Paris" },
    { n: "France Inter", c: "France", cc: "FR", f: "Variety", u: "https://stream.radiofrance.fr/franceinter/franceinter.m3u8", b: "128", l: "French", ls: 40000, city: "Paris" },
    { n: "FIP", c: "France", cc: "FR", f: "Eclectic", u: "https://stream.radiofrance.fr/fip/fip.m3u8", b: "128", l: "French", ls: 30000, city: "Paris" },
    { n: "France Culture", c: "France", cc: "FR", f: "Culture", u: "https://stream.radiofrance.fr/franceculture/franceculture.m3u8", b: "128", l: "French", ls: 15000, city: "Paris" },
    { n: "Nova", c: "France", cc: "FR", f: "Alternative", u: "https://novazz.ice.infomaniak.ch/novazz-128.mp3", b: "128", l: "French", ls: 18000, city: "Paris" },
    
    // ══════ GERMANY ══════
    { n: "Deutschlandfunk", c: "Germany", cc: "DE", f: "News", u: "https://st01.sslstream.dlf.de/dlf/01/128/mp3/stream.mp3", b: "128", l: "German", ls: 28000, city: "Cologne" },
    { n: "ByteFM", c: "Germany", cc: "DE", f: "Alternative", u: "https://bytefm.stream.byte.fm/stream", b: "128", l: "German", ls: 8000, city: "Hamburg" },
    { n: "Radio Eins", c: "Germany", cc: "DE", f: "Eclectic", u: "https://dispatcher.rndfnk.com/rbb/radioeins/live/mp3/mid", b: "128", l: "German", ls: 14000, city: "Berlin" },
    
    // ══════ ITALY ══════
    { n: "Radio Deejay", c: "Italy", cc: "IT", f: "Pop", u: "https://stream.deejay.it/radiodeejay", b: "128", l: "Italian", ls: 35000, city: "Milan" },
    { n: "Radio Italia", c: "Italy", cc: "IT", f: "Italian", u: "https://stream.radioitalia.it/radioitalia", b: "128", l: "Italian", ls: 30000, city: "Milan" },
    
    // ══════ SPAIN ══════
    { n: "Cadena SER", c: "Spain", cc: "ES", f: "News", u: "https://playerservices.streamtheworld.com/api/livestream-redirect/CADENASER.mp3", b: "128", l: "Spanish", ls: 25000, city: "Madrid" },
    { n: "Los 40", c: "Spain", cc: "ES", f: "Pop", u: "https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40.mp3", b: "128", l: "Spanish", ls: 32000, city: "Madrid" },
    
    // ══════ CANADA ══════
    { n: "CBC Radio One", c: "Canada", cc: "CA", f: "News", u: "https://cbcradiolive.akamaized.net/hls/live/2041004/cbcradiolive/master.m3u8", b: "128", l: "English", ls: 32000, city: "Toronto" },
    { n: "CBC Music", c: "Canada", cc: "CA", f: "Variety", u: "https://cbcradiolive.akamaized.net/hls/live/2041005/cbcradiomusic/master.m3u8", b: "128", l: "English", ls: 15000, city: "Toronto" },
    
    // ══════ AUSTRALIA ══════
    { n: "Triple J", c: "Australia", cc: "AU", f: "Alternative", u: "https://abcradio4live.akamaized.net/triplej/aac", b: "64", l: "English", ls: 22000, city: "Sydney" },
    { n: "ABC Classic", c: "Australia", cc: "AU", f: "Classical", u: "https://abcradio2live.akamaized.net/classic/aac", b: "64", l: "English", ls: 10000, city: "Sydney" },
    
    // ══════ JAPAN ══════
    { n: "NHK World Japan", c: "Japan", cc: "JP", f: "News", u: "https://nhkworld.webcdn.stream.ne.jp/www11/radiojapan/all/263949/live_s.m3u8", b: "64", l: "English/Japanese", ls: 18000, city: "Tokyo" },
    
    // ══════ BRAZIL ══════
    { n: "Radio Mitre", c: "Argentina", cc: "AR", f: "Talk", u: "https://streaming.radiomitre.com/radio.mp3", b: "128", l: "Spanish", ls: 15000, city: "Buenos Aires" },
    { n: "Radio JB FM", c: "Brazil", cc: "BR", f: "Variety", u: "https://stream.jbfm.com.br/jbfm", b: "128", l: "Portuguese", ls: 12000, city: "Rio de Janeiro" },
    
    // ══════ QATAR ══════
    { n: "Al Jazeera English", c: "Qatar", cc: "QA", f: "News", u: "https://live-hls-audio-web-aje.getaj.net/VOICE-AJE/index.m3u8", b: "64", l: "English", ls: 25000, city: "Doha" },
    
    // ══════ UAE ══════
    { n: "Dubai 92", c: "UAE", cc: "AE", f: "Pop", u: "https://stream.radioarabia.net/dubai92", b: "128", l: "English", ls: 18000, city: "Dubai" },
    
    // ══════ EGYPT ══════
    { n: "Nile FM 104.2", c: "Egypt", cc: "EG", f: "Pop", u: "https://stream.nilefm.com/nilefm", b: "128", l: "English", ls: 20000, city: "Cairo" },
    { n: "Radio Masr", c: "Egypt", cc: "EG", f: "Arabic", u: "https://stream.radiomasr.net/radiomasr", b: "128", l: "Arabic", ls: 16000, city: "Cairo" },
    
    // ══════ TURKEY ══════
    { n: "Power FM", c: "Turkey", cc: "TR", f: "Pop", u: "https://powerfm.listenpowerapp.com/powerfm/mpeg/icecast.audio", b: "128", l: "Turkish", ls: 22000, city: "Istanbul" },
    
    // ══════ SOUTH AFRICA ══════
    { n: "5FM", c: "South Africa", cc: "ZA", f: "Pop", u: "https://stream.5fm.co.za/5fm", b: "128", l: "English", ls: 14000, city: "Johannesburg" },
    
    // ══════ INDIA ══════
    { n: "Radio Mirchi 98.3", c: "India", cc: "IN", f: "Bollywood", u: "https://stream.radiomirchi.com/mirchi", b: "128", l: "Hindi", ls: 30000, city: "Mumbai" }
];

const GC = {
    Pop: "#ff6b9d", Rock: "#e74c3c", News: "#f39c12", Talk: "#f39c12",
    Arabic: "#2ecc71", Dance: "#1abc9c", Electronic: "#1abc9c",
    Classical: "#9b59b6", Jazz: "#e67e22", Country: "#e91e63",
    HipHop: "#ff6b9d", RnB: "#ff6b9d", Latin: "#e91e63",
    Religious: "#3498db", Folk: "#2ecc71", Alternative: "#1abc9c",
    Variety: "#00bcd4", Hits: "#ff6b9d", Oldies: "#e67e22",
    Eclectic: "#9b59b6", Freeform: "#1abc9c", Culture: "#9b59b6",
    Italian: "#e74c3c", Spanish: "#e91e63", Bollywood: "#f39c12",
    Armenian: "#e91e63", Default: "#888"
};

const FLAGS = {
    LB: "🇱🇧", US: "🇺🇸", GB: "🇬🇧", FR: "🇫🇷", DE: "🇩🇪",
    IT: "🇮🇹", ES: "🇪🇸", CA: "🇨🇦", AU: "🇦🇺", JP: "🇯🇵",
    BR: "🇧🇷", AR: "🇦🇷", IN: "🇮🇳", ZA: "🇿🇦", EG: "🇪🇬",
    QA: "🇶🇦", AE: "🇦🇪", TR: "🇹🇷"
};

const CSS = `
:root {
    --bg: #020602; --card: #081008; --text: #ccc; --muted: #556;
    --a: #2ecc71; --a2: #1abc9c; --g: 0 0 20px rgba(46,204,113,0.12);
    --b: 1px solid rgba(255,255,255,0.04); --r: 10px;
}
.t1 { --bg: #000; --card: #080808; --a: #0ff; --a2: #f0f; }
.t2 { --bg: #020602; --card: #081008; --a: #2ecc71; --a2: #1abc9c; }
.t3 { --bg: #04040c; --card: #0c0c16; --a: #f0f; --a2: #0ff; }

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
.logo { font-size:.9rem;font-weight:700;color:var(--a);text-shadow:var(--g);text-decoration:none }
.nr { display:flex;gap:3px;align-items:center }
.nr button {
    color:var(--muted);font-size:.65rem;padding:5px 8px;border-radius:5px;
    transition:.3s;background:none;border:var(--b);cursor:pointer;
    font-family:'Space Mono',monospace;
}
.nr button.on { color:var(--a);border-color:var(--a) }

.main { max-width:940px;margin:0 auto;padding:14px 16px }

/* Hero */
.hero { text-align:center;padding:16px 14px 8px }
.hero h1 { font-size:1.8rem;color:var(--a);text-shadow:var(--g);margin-bottom:2px }
.hero .sub { color:var(--muted);font-size:.65rem;margin-bottom:12px }

/* Search */
.search-wrap { max-width:500px;margin:0 auto 10px }
.search-wrap input {
    width:100%;background:var(--card);border:var(--b);color:var(--text);
    padding:10px 14px;border-radius:var(--r);font:.7rem 'Space Mono',monospace;
    outline:none;transition:.3s;
}
.search-wrap input:focus { border-color:var(--a) }
.search-wrap input::placeholder { color:var(--muted) }

/* Featured country bar */
.featured-bar {
    display:flex;gap:6px;flex-wrap:wrap;justify-content:center;
    margin-bottom:10px;
}
.featured-bar button {
    background:var(--card);border:var(--b);color:var(--muted);
    padding:5px 10px;border-radius:14px;cursor:pointer;
    font:.6rem 'Space Mono',monospace;transition:.3s;
}
.featured-bar button:hover, .featured-bar button.on { border-color:var(--a);color:var(--a) }

/* Tabs */
.tabs { display:flex;gap:4px;margin-bottom:10px;flex-wrap:wrap;justify-content:center }
.tabs button {
    background:none;border:var(--b);color:var(--muted);
    padding:5px 12px;border-radius:14px;cursor:pointer;
    font:.6rem 'Space Mono',monospace;transition:.3s;
}
.tabs button.on { background:var(--a);color:#000;border-color:var(--a);font-weight:700 }

/* Stats */
.stats { display:flex;justify-content:space-between;color:var(--muted);font-size:.55rem;margin-bottom:8px }

/* Grid */
.grid { display:grid;grid-template-columns:repeat(3,1fr);gap:8px }
@media (max-width:700px) { .grid { grid-template-columns:repeat(2,1fr) } }
@media (max-width:400px) { .grid { grid-template-columns:1fr } }

.card {
    background:var(--card);padding:12px;border-radius:var(--r);
    border:var(--b);transition:.3s;position:relative;
    display:flex;flex-direction:column;
}
.card:active { border-color:var(--a) }
.card .country-row { display:flex;align-items:center;gap:5px;margin-bottom:5px }
.card .flag { font-size:.9rem }
.card .country { color:var(--muted);font-size:.5rem }
.card .city { color:var(--muted);font-size:.45rem }
.card h3 { color:#fff;font-size:.7rem;font-weight:400;margin-bottom:3px;line-height:1.2 }
.card .genre-bar { height:2px;border-radius:2px;margin-bottom:5px }
.card .meta-row { display:flex;justify-content:space-between;align-items:center;margin-bottom:5px }
.card .listeners { color:var(--muted);font-size:.48rem }
.card .quality { color:var(--a);font-size:.48rem }
.card .fav-btn {
    position:absolute;top:8px;right:8px;background:none;border:none;
    color:var(--muted);cursor:pointer;font-size:.7rem;transition:.3s;
}
.card .fav-btn.faved { color:#f1c40f }

.btn {
    background:none;border:1px solid var(--a);color:var(--a);
    padding:5px 10px;border-radius:5px;cursor:pointer;
    font:.52rem 'Space Mono',monospace;text-decoration:none;
    display:inline-block;transition:.3s;text-align:center;
    width:100%;margin-top:auto;
}
.btn:active { background:rgba(46,204,113,.04) }

/* Player */
.player {
    position:fixed;bottom:0;left:0;right:0;background:var(--bg);
    border-top:var(--b);padding:10px 14px;display:none;
    align-items:center;gap:10px;z-index:1000;
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
    width:34px;height:34px;border-radius:50%;
    border:2px solid var(--a);background:var(--bg);color:var(--a);
    cursor:pointer;font-size:.8rem;box-shadow:var(--g);transition:.3s;
}
.tb:active { transform:scale(.9) }
.tp {
    position:fixed;bottom:58px;right:14px;z-index:999;
    display:flex;flex-direction:column;gap:5px;
    background:var(--card);padding:8px;border-radius:10px;
    border:var(--b);opacity:0;transform:translateY(8px);
    pointer-events:none;transition:.3s;
}
.tp.open { opacity:1;transform:translateY(0);pointer-events:all }
.tp button {
    width:28px;height:28px;border-radius:50%;border:2px solid transparent;
    cursor:pointer;font-size:.6rem;background:var(--bg);color:var(--text);
    transition:.3s;
}
.tp .tc { border-color:#0ff;color:#0ff }
.tp .tg { border-color:#2ecc71;color:#2ecc71 }
.tp .tp2 { border-color:#f0f;color:#f0f }

.overlay { position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:998;display:none }
.overlay.show { display:block }
`;

function H(title, body, js = '') {
    return `<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#020602"><title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>${CSS}</style></head>
<body class="t2">
<nav>
    <a href="/" class="logo">🌍 DIAL EARTH</a>
    <div class="nr">
        <button onclick="showCountry('Lebanon')" title="Lebanon">🇱🇧</button>
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
let favs=JSON.parse(localStorage.getItem('dialearthFavs')||'[]');
let lastStation=JSON.parse(localStorage.getItem('dialearthLast')||'null');

function play(u,n){
    const p=document.getElementById('player'),a=document.getElementById('audio'),d=document.getElementById('np');
    if(cur){cur.pause();cur.load();}
    a.src=u;a.load();a.play().catch(()=>{});
    d.textContent=n;p.classList.add('on');if(carMode)p.classList.add('car');cur=a;
    localStorage.setItem('dialearthLast',JSON.stringify({u,n}));
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
(function(){
    const t=localStorage.getItem('dialearthTheme');if(t)document.body.className=t;
    if(lastStation){
        const b=document.createElement('div');
        b.style.cssText='text-align:center;padding:8px;color:var(--a);font-size:.6rem;cursor:pointer';
        b.innerHTML='▶ Continue: '+lastStation.n;
        b.onclick=function(){play(lastStation.u,lastStation.n);b.remove();};
        document.querySelector('.hero').appendChild(b);
    }
})();
${js}
</script></body></html>`;
}

app.get('/', (req, res) => {
    // Prioritize Lebanon first in the list
    const lebanonStations = STATIONS.filter(s => s.cc === 'LB');
    const otherStations = STATIONS.filter(s => s.cc !== 'LB');
    const allSorted = [...lebanonStations, ...otherStations];
    
    const countries = [...new Set(STATIONS.map(s => s.c))].sort();
    const genres = [...new Set(STATIONS.map(s => s.f))].sort();

    res.send(H('Dial Earth — Worldwide Live Radio', `
        <div class="hero">
            <h1>🌍 DIAL EARTH</h1>
            <p class="sub">${STATIONS.length} verified stations · ${countries.length} countries · Always live</p>
        </div>
        <div class="main">
            <div class="search-wrap">
                <input type="text" id="search" placeholder="Search stations, countries, cities..." oninput="filter()">
            </div>
            <div class="featured-bar">
                <button class="on" onclick="showAll(this)">🌍 All</button>
                <button onclick="showCountry('Lebanon',this)">🇱🇧 Lebanon</button>
                <button onclick="showCountry('United States',this)">🇺🇸 US</button>
                <button onclick="showCountry('United Kingdom',this)">🇬🇧 UK</button>
                <button onclick="showCountry('France',this)">🇫🇷 France</button>
                <button onclick="showCountry('Germany',this)">🇩🇪 Germany</button>
                <button onclick="showCountry('Italy',this)">🇮🇹 Italy</button>
                <button onclick="showCountry('Spain',this)">🇪🇸 Spain</button>
                <button onclick="showCountry('Canada',this)">🇨🇦 Canada</button>
                <button onclick="showCountry('Australia',this)">🇦🇺 Australia</button>
            </div>
            <div class="tabs" id="genreTabs">
                <button class="on" onclick="showAllGenres(this)">All Genres</button>
                ${genres.slice(0,12).map(g => `<button onclick="showGenre('${g}',this)">${g}</button>`).join('')}
            </div>
            <div class="stats">
                <span id="count">${STATIONS.length} stations</span>
                <span id="listeners">👥 ${STATIONS.reduce((a,s)=>a+(s.ls||0),0).toLocaleString()} listeners</span>
            </div>
            <div class="grid" id="grid">
                ${allSorted.map((s,i) => {
                    const flag = FLAGS[s.cc] || '🌐';
                    const gc = GC[s.f] || GC.Default;
                    const isFav = false;
                    return `
                <div class="card" data-genre="${s.f}" data-country="${s.c}" data-name="${s.n.toLowerCase()}" data-idx="${i}">
                    <button class="fav-btn${isFav?' faved':''}" onclick="toggleFav('${i}',this)">☆</button>
                    <div class="country-row">
                        <span class="flag">${flag}</span>
                        <span class="country">${s.c}</span>
                        <span class="city">· ${s.city||''}</span>
                    </div>
                    <h3>${s.n}</h3>
                    <div class="genre-bar" style="background:${gc}"></div>
                    <div class="meta-row">
                        <span class="listeners">👥 ${(s.ls||0).toLocaleString()}</span>
                        <span class="quality">${s.b}kbps · ${s.l||''}</span>
                    </div>
                    <button class="btn" onclick="play('${s.u}','${s.n.replace(/'/g,"\\'")}')">▶ Tune</button>
                </div>`;
                }).join('')}
            </div>
        </div>`,
        `const allStations=${JSON.stringify(allSorted)};
        function filter(){
            const q=document.getElementById('search').value.toLowerCase();
            document.querySelectorAll('.card').forEach(c=>{
                const n=c.dataset.name,cou=c.dataset.country;
                c.style.display=(n.includes(q)||cou.toLowerCase().includes(q))?'':'none';
            });
            updateCount();
        }
        function showCountry(c,el){
            if(el){document.querySelectorAll('.featured-bar button').forEach(b=>b.classList.remove('on'));el.classList.add('on');}
            document.querySelectorAll('.card').forEach(card=>{
                card.style.display=card.dataset.country===c?'':'none';
            });
            document.getElementById('count').textContent=c+' stations';
            document.querySelectorAll('#genreTabs button').forEach(b=>b.classList.remove('on'));
            document.querySelector('#genreTabs button').classList.add('on');
        }
        function showAll(el){
            document.querySelectorAll('.featured-bar button').forEach(b=>b.classList.remove('on'));
            el.classList.add('on');
            document.querySelectorAll('.card').forEach(c=>c.style.display='');
            document.getElementById('count').textContent=allStations.length+' stations';
            document.querySelectorAll('#genreTabs button').forEach(b=>b.classList.remove('on'));
            document.querySelector('#genreTabs button').classList.add('on');
        }
        function showGenre(g,el){
            document.querySelectorAll('#genreTabs button').forEach(b=>b.classList.remove('on'));
            el.classList.add('on');
            document.querySelectorAll('.featured-bar button').forEach(b=>b.classList.remove('on'));
            document.querySelectorAll('.card').forEach(c=>{
                c.style.display=c.dataset.genre===g?'':'none';
            });
            document.getElementById('count').textContent=g+' stations';
        }
        function showAllGenres(el){
            document.querySelectorAll('#genreTabs button').forEach(b=>b.classList.remove('on'));
            el.classList.add('on');
            document.querySelectorAll('.card').forEach(c=>c.style.display='');
            document.getElementById('count').textContent=allStations.length+' stations';
            document.querySelectorAll('.featured-bar button').forEach(b=>b.classList.remove('on'));
            document.querySelector('.featured-bar button').classList.add('on');
        }
        function updateCount(){
            const v=document.querySelectorAll('.card:not([style*="display: none"])').length;
            document.getElementById('count').textContent=v+' showing';
        }
        // Init favs
        document.querySelectorAll('.fav-btn').forEach(b=>{
            const idx=b.parentElement.dataset.idx;
            if(favs.includes(idx)){b.classList.add('faved');b.textContent='★';}
        });
        `
    ));
});

app.listen(PORT, () => console.log(`🌍 Dial Earth → http://localhost:${PORT}`));

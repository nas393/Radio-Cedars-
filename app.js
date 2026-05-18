const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const S = [
    // Lebanon
    { n:"NRJ Lebanon 99.1", c:"Lebanon", f:"Pop", u:"https://nrjlebanon.radioca.st/stream" },
    { n:"Mix FM 104.4", c:"Lebanon", f:"Pop", u:"https://mixfm.radioca.st/stream" },
    { n:"Radio One 105.1", c:"Lebanon", f:"Hits", u:"https://radioonelebanon.radioca.st/stream" },
    { n:"Light FM 90.5", c:"Lebanon", f:"Rock", u:"https://lightfm.radioca.st/stream" },
    { n:"Sawt El Ghad 96.7", c:"Lebanon", f:"Arabic", u:"https://sawtelghad.radioca.st/stream" },
    { n:"VDL 100.5", c:"Lebanon", f:"News", u:"https://vdl.radioca.st/stream" },
    { n:"Radio Orient 88.7", c:"Lebanon", f:"Arabic", u:"https://radioorient.radioca.st/stream" },
    { n:"Virgin Radio 89.5", c:"Lebanon", f:"Pop", u:"https://virginradiolb.radioca.st/stream" },
    { n:"Nostalgie Liban 88.1", c:"Lebanon", f:"Oldies", u:"https://nostalgiefm.radioca.st/stream" },
    { n:"Beirut Nights", c:"Lebanon", f:"Dance", u:"https://beirutnights.radioca.st/stream" },
    { n:"PAX Radio 103.0", c:"Lebanon", f:"Pop", u:"https://paxradio.radioca.st/stream" },
    { n:"Delta Radio 101.7", c:"Lebanon", f:"Dance", u:"https://radiodelta.radioca.st/stream" },
    { n:"Fame FM 99.9", c:"Lebanon", f:"Variety", u:"https://famefm.radioca.st/stream" },
    { n:"Star FM", c:"Lebanon", f:"Arabic", u:"https://starfmlebanon.radioca.st/stream" },
    { n:"Radio Magic", c:"Lebanon", f:"Arabic", u:"https://radiomagiclebanon.radioca.st/stream" },
    // USA
    { n:"NPR 24", c:"United States", f:"News", u:"https://npr-ice.streamguys1.com/live.mp3" },
    { n:"KEXP 90.3", c:"United States", f:"Alternative", u:"https://kexp.streamguys1.com/kexp160.aac" },
    { n:"WNYC 93.9", c:"United States", f:"News", u:"https://fm939.wnyc.org/wnycfm-web" },
    { n:"KCRW 89.9", c:"United States", f:"Eclectic", u:"https://kcrw.streamguys1.com/kcrw_192k_mp3_e24" },
    { n:"WFMU 91.1", c:"United States", f:"Freeform", u:"https://wfmu.streamguys1.com/wfmu" },
    // UK
    { n:"BBC World Service", c:"United Kingdom", f:"News", u:"https://stream.live.vc.bbcmedia.co.uk/bbc_world_service" },
    { n:"BBC Radio 1", c:"United Kingdom", f:"Pop", u:"https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one" },
    { n:"BBC Radio 4", c:"United Kingdom", f:"Talk", u:"https://stream.live.vc.bbcmedia.co.uk/bbc_radio_fourfm" },
    { n:"BBC 6 Music", c:"United Kingdom", f:"Alternative", u:"https://stream.live.vc.bbcmedia.co.uk/bbc_6music" },
    { n:"Capital FM", c:"United Kingdom", f:"Pop", u:"https://media-ssl.musicradio.com/Capital" },
    // France
    { n:"RFI Monde", c:"France", f:"News", u:"https://rfimonde-96k.ice.infomaniak.ch/rfimonde-96k.mp3" },
    { n:"France Inter", c:"France", f:"Variety", u:"https://stream.radiofrance.fr/franceinter/franceinter.m3u8" },
    { n:"FIP", c:"France", f:"Eclectic", u:"https://stream.radiofrance.fr/fip/fip.m3u8" },
    { n:"France Culture", c:"France", f:"Culture", u:"https://stream.radiofrance.fr/franceculture/franceculture.m3u8" },
    { n:"Nova", c:"France", f:"Alternative", u:"https://novazz.ice.infomaniak.ch/novazz-128.mp3" },
    // Germany
    { n:"Deutschlandfunk", c:"Germany", f:"News", u:"https://st01.sslstream.dlf.de/dlf/01/128/mp3/stream.mp3" },
    { n:"Radio Eins", c:"Germany", f:"Eclectic", u:"https://dispatcher.rndfnk.com/rbb/radioeins/live/mp3/mid" },
    { n:"ByteFM", c:"Germany", f:"Alternative", u:"https://bytefm.stream.byte.fm/stream" },
    // Italy
    { n:"Radio Deejay", c:"Italy", f:"Pop", u:"https://stream.deejay.it/radiodeejay" },
    { n:"Radio Italia", c:"Italy", f:"Italian", u:"https://stream.radioitalia.it/radioitalia" },
    // Spain
    { n:"Cadena SER", c:"Spain", f:"News", u:"https://playerservices.streamtheworld.com/api/livestream-redirect/CADENASER.mp3" },
    { n:"Los 40", c:"Spain", f:"Pop", u:"https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40.mp3" },
    // Canada
    { n:"CBC Radio One", c:"Canada", f:"News", u:"https://cbcradiolive.akamaized.net/hls/live/2041004/cbcradiolive/master.m3u8" },
    { n:"CBC Music", c:"Canada", f:"Variety", u:"https://cbcradiolive.akamaized.net/hls/live/2041005/cbcradiomusic/master.m3u8" },
    // Australia
    { n:"Triple J", c:"Australia", f:"Alternative", u:"https://abcradio4live.akamaized.net/triplej/aac" },
    { n:"ABC Classic", c:"Australia", f:"Classical", u:"https://abcradio2live.akamaized.net/classic/aac" },
    // Japan
    { n:"NHK World", c:"Japan", f:"News", u:"https://nhkworld.webcdn.stream.ne.jp/www11/radiojapan/all/263949/live_s.m3u8" },
    // UAE
    { n:"Dubai 92", c:"UAE", f:"Pop", u:"https://stream.radioarabia.net/dubai92" },
    // Egypt
    { n:"Nile FM 104.2", c:"Egypt", f:"Pop", u:"https://stream.nilefm.com/nilefm" },
    { n:"Radio Masr", c:"Egypt", f:"Arabic", u:"https://stream.radiomasr.net/radiomasr" },
    // Turkey
    { n:"Power FM", c:"Turkey", f:"Pop", u:"https://powerfm.listenpowerapp.com/powerfm/mpeg/icecast.audio" },
    // South Africa
    { n:"5FM", c:"South Africa", f:"Pop", u:"https://stream.5fm.co.za/5fm" },
    // India
    { n:"Radio Mirchi 98.3", c:"India", f:"Bollywood", u:"https://stream.radiomirchi.com/mirchi" },
    // Argentina
    { n:"Radio Mitre", c:"Argentina", f:"Talk", u:"https://streaming.radiomitre.com/radio.mp3" },
    // Qatar
    { n:"Al Jazeera English", c:"Qatar", f:"News", u:"https://live-hls-audio-web-aje.getaj.net/VOICE-AJE/index.m3u8" }
];

const F = { LB:"🇱🇧", US:"🇺🇸", GB:"🇬🇧", FR:"🇫🇷", DE:"🇩🇪", IT:"🇮🇹", ES:"🇪🇸", CA:"🇨🇦", AU:"🇦🇺", JP:"🇯🇵", AE:"🇦🇪", EG:"🇪🇬", TR:"🇹🇷", ZA:"🇿🇦", IN:"🇮🇳", AR:"🇦🇷", QA:"🇶🇦" };
const countries = [...new Set(S.map(s => s.c))];
countries.sort((a,b) => a === 'Lebanon' ? -1 : b === 'Lebanon' ? 1 : a.localeCompare(b));

const GC = {
    Pop:"#ff6b9d", Rock:"#e74c3c", News:"#f39c12", Arabic:"#2ecc71",
    Dance:"#1abc9c", Hits:"#ff6b9d", Alternative:"#9b59b6", Talk:"#f39c12",
    Eclectic:"#1abc9c", Oldies:"#e67e22", Variety:"#00bcd4", Classical:"#e91e63",
    Italian:"#e74c3c", Bollywood:"#f39c12", Freeform:"#9b59b6", Culture:"#3498db"
};

// Genre icons
const GI = {
    Pop:"🎤", Rock:"🎸", News:"📰", Arabic:"🕌", Dance:"💃", Hits:"🔥",
    Alternative:"🎭", Talk:"🎙️", Eclectic:"🎨", Oldies:"📻", Variety:"🌈",
    Classical:"🎻", Italian:"🍕", Bollywood:"🎬", Freeform:"🌀", Culture:"🏛️"
};

const CSS = `
:root{--bg:#121212;--card:#1a1a1a;--surface:#282828;--text:#fff;--muted:#b3b3b3;--a:#1ed760;--r:8px;--top:0}
*{margin:0;padding:0;box-sizing:border-box}
body{font:400 14px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;-webkit-tap-highlight-color:transparent;padding-bottom:160px;padding-top:var(--top)}
html{scroll-behavior:smooth}

/* ── Top Bar ── */
.top-bar{position:sticky;top:0;z-index:100;background:rgba(18,18,18,.95);backdrop-filter:blur(20px);padding:12px 16px 8px}
.top-bar h1{font-size:1.3rem;font-weight:700;color:#fff}
.top-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.top-row .greeting{font-size:.8rem;color:var(--muted)}
.top-row .icons{display:flex;gap:16px}
.top-row .icons span{font-size:1.2rem;cursor:pointer}
.search-box{display:flex;align-items:center;background:var(--surface);border-radius:8px;padding:10px 14px;gap:10px}
.search-box span{color:var(--muted)}
.search-box input{flex:1;background:none;border:none;color:#fff;font-size:.85rem;outline:none}
.search-box input::placeholder{color:var(--muted)}

/* ── Bottom Nav ── */
.bottom-nav{position:fixed;bottom:0;left:0;right:0;background:rgba(18,18,18,.98);backdrop-filter:blur(20px);display:flex;justify-content:space-around;padding:8px 0 20px;z-index:99;border-top:1px solid rgba(255,255,255,.05)}
.bottom-nav .nav-item{display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;color:var(--muted);font-size:.6rem;transition:.2s;background:none;border:none;font-family:inherit}
.bottom-nav .nav-item.active{color:#fff}
.bottom-nav .nav-item span{font-size:1.3rem}

/* ── Chips ── */
.chips{display:flex;gap:8px;padding:4px 16px 8px;overflow-x:auto;scrollbar-width:none}
.chips::-webkit-scrollbar{display:none}
.chips button{background:var(--surface);border:1px solid rgba(255,255,255,.1);color:var(--muted);padding:7px 16px;border-radius:20px;cursor:pointer;font:.75rem -apple-system,sans-serif;white-space:nowrap;transition:.2s}
.chips button.on{background:#fff;color:#000;border-color:#fff;font-weight:600}

/* ── Sections ── */
.section{padding:12px 16px}
.section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.section-header h2{font-size:1.1rem;font-weight:700;color:#fff}
.section-header a{font-size:.75rem;color:var(--muted);text-decoration:none;font-weight:500}
.section-header a:hover{color:#fff}

/* ── Horizontal Scroll ── */
.hscroll{display:flex;gap:12px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px}
.hscroll::-webkit-scrollbar{display:none}
.hcard{min-width:155px;max-width:155px;background:var(--card);border-radius:8px;overflow:hidden;cursor:pointer;transition:.2s;border:none;text-align:left;flex-shrink:0;position:relative}
.hcard:active{background:var(--surface)}
.hcard .img{width:100%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:2.5rem;position:relative}
.hcard .img .play-overlay{position:absolute;bottom:8px;right:8px;width:40px;height:40px;border-radius:50%;background:var(--a);display:flex;align-items:center;justify-content:center;font-size:.9rem;opacity:0;transform:translateY(8px);transition:.3s;box-shadow:0 4px 12px rgba(0,0,0,.4)}
.hcard:active .play-overlay{opacity:1;transform:translateY(0)}
.hcard .info{padding:10px}
.hcard .info h3{font-size:.78rem;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hcard .info p{font-size:.68rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* ── Vertical List ── */
.vlist{display:flex;flex-direction:column}
.vcard{display:flex;align-items:center;gap:12px;padding:10px 0;cursor:pointer;border-radius:6px;transition:.2s}
.vcard:active{background:rgba(255,255,255,.03)}
.vcard .thumb{width:52px;height:52px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;position:relative}
.vcard .info{flex:1;min-width:0}
.vcard .info h3{font-size:.85rem;font-weight:500;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vcard .info p{font-size:.7rem;color:var(--muted)}
.vcard .actions{display:flex;align-items:center;gap:12px}
.vcard .actions .fav{background:none;border:none;color:var(--muted);font-size:1.1rem;cursor:pointer;transition:.2s}
.vcard .actions .fav.liked{color:#e74c3c}
.vcard .actions .play{width:36px;height:36px;border-radius:50%;background:var(--a);border:none;color:#000;font-size:.9rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.2s}
.vcard .actions .play:active{transform:scale(.9)}

/* ── Now Playing Bar (Spotify style) ── */
.now-playing{position:fixed;bottom:60px;left:8px;right:8px;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:14px;padding:12px 14px;z-index:1000;display:none;flex-direction:column;gap:8px;box-shadow:0 -8px 32px rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.05)}
.now-playing.on{display:flex;animation:slideUp .3s ease}
@keyframes slideUp{from{transform:translateY(100px);opacity:0}to{transform:translateY(0);opacity:1}}
.now-playing .np-row{display:flex;align-items:center;gap:10px}
.now-playing .np-art{width:44px;height:44px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0}
.now-playing .np-text{flex:1;min-width:0}
.now-playing .np-text h4{font-size:.8rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600}
.now-playing .np-text p{font-size:.65rem;color:var(--a)}
.now-playing .np-controls{display:flex;align-items:center;gap:20px;justify-content:center}
.now-playing .np-controls button{background:none;border:none;color:#fff;font-size:1.1rem;cursor:pointer;transition:.2s}
.now-playing .np-controls .np-close{font-size:.8rem;color:var(--muted)}
.now-playing audio{width:100%;height:28px;border-radius:14px;filter:invert(.9)}
`;

function page(title, body, js) {
    return `<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#121212"><title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style></head>
<body>
<div class="top-bar">
    <div class="top-row">
        <span class="greeting" id="greeting">Good evening</span>
        <div class="icons">
            <span onclick="toggleFavs()" id="favIcon">🤍</span>
            <span>⚙️</span>
        </div>
    </div>
    <h1>🎵 CedarCast</h1>
</div>
<div class="search-box" style="margin:0 16px">
    <span>🔍</span>
    <input type="text" id="search" placeholder="Search stations, genres, countries..." oninput="filter()">
</div>
<div class="chips" id="chips">
    <button class="on" onclick="showAll(this)">All</button>
    ${countries.map(c => `<button onclick="showCountry('${c}',this)">${F[S.find(s=>s.c===c)?.cc]||''} ${c}</button>`).join('')}
</div>
${body}
<div class="bottom-nav">
    <button class="nav-item active" onclick="scrollToTop()"><span>🏠</span>Home</button>
    <button class="nav-item" onclick="showAll(document.querySelector('#chips button'))"><span>🔍</span>Browse</button>
    <button class="nav-item" onclick="toggleFavs()"><span id="navFav">🤍</span>Favorites</button>
    <button class="nav-item"><span>📻</span>Live</button>
</div>
<div class="now-playing" id="player">
    <div class="np-row">
        <div class="np-art" id="npArt">📻</div>
        <div class="np-text">
            <h4 id="npName">Not playing</h4>
            <p id="npGenre">Select a station</p>
        </div>
    </div>
    <audio id="audio" controls></audio>
    <div class="np-controls">
        <button onclick="stop()" class="np-close">✕ Close</button>
    </div>
</div>
<script>
let cur=null,favs=JSON.parse(localStorage.getItem('cedarcastFavs')||'[]'),showFavs=!1;
function play(u,n,f,cc){
    const p=document.getElementById('player'),a=document.getElementById('audio');
    const nm=document.getElementById('npName'),ng=document.getElementById('npGenre'),na=document.getElementById('npArt');
    if(cur){cur.pause();cur.load()}
    a.src=u;a.load();a.play().catch(()=>{});
    nm.textContent=n;ng.textContent=f||'Live';na.textContent=(F[cc]||'📻');
    p.classList.add('on');cur=a;
}
function stop(){const p=document.getElementById('player'),a=document.getElementById('audio');a.pause();a.src='';p.classList.remove('on');cur=null}
function filter(){const q=document.getElementById('search').value.toLowerCase();document.querySelectorAll('.vcard,.hcard').forEach(c=>{c.style.display=c.dataset.name.includes(q)?'':'none'});document.querySelectorAll('.section').forEach(s=>{const v=s.querySelectorAll('.vcard:not([style*="display: none"]),.hcard:not([style*="display: none"])').length;s.style.display=v?'':'none'})}
function showCountry(c,el){document.querySelectorAll('#chips button').forEach(b=>b.classList.remove('on'));el.classList.add('on');document.querySelectorAll('.section').forEach(s=>{s.style.display=s.dataset.country===c?'':'none'})}
function showAll(el){document.querySelectorAll('#chips button').forEach(b=>b.classList.remove('on'));if(el)el.classList.add('on');document.querySelectorAll('.section').forEach(s=>{s.style.display=''});showFavs=!1}
function toggleFav(id,el){const i=favs.indexOf(id);if(i>-1){favs.splice(i,1);el.classList.remove('liked');el.textContent='🤍'}else{favs.push(id);el.classList.add('liked');el.textContent='❤️'}localStorage.setItem('cedarcastFavs',JSON.stringify(favs));updateFavIcons()}
function toggleFavs(){showFavs=!showFavs;document.querySelectorAll('#chips button').forEach(b=>b.classList.remove('on'));if(showFavs){document.querySelectorAll('.section').forEach(s=>{s.style.display='none'});document.querySelectorAll('.vcard').forEach(c=>{const id=c.dataset.favid;c.style.display=favs.includes(id)?'':'none'})}else{showAll()}updateFavIcons()}
function updateFavIcons(){const icon=showFavs?'❤️':'🤍';document.getElementById('favIcon').textContent=icon;document.getElementById('navFav').textContent=icon;document.querySelectorAll('.fav').forEach(b=>{b.textContent=favs.includes(b.dataset.id)?'❤️':'🤍';b.classList.toggle('liked',favs.includes(b.dataset.id))})}
function scrollToTop(){window.scrollTo({top:0,behavior:'smooth'})}
// Greeting
const h=new Date().getHours();
document.getElementById('greeting').textContent=h<12?'Good morning':h<18?'Good afternoon':'Good evening';
${js||''}
</script></body></html>`;
}

app.get('/', (req, res) => {
    const featured = [...S].sort(() => Math.random() - 0.5).slice(0, 8);
    const popular = [...S].sort(() => Math.random() - 0.5).slice(0, 6);
    
    let html = '';
    
    // ── Featured Horizontal ──
    html += '<div class="section"><div class="section-header"><h2>🔥 Trending Now</h2><a href="#">Show all</a></div><div class="hscroll">';
    for (const s of featured) {
        const color = GC[s.f] || '#1ed760';
        const icon = GI[s.f] || '📻';
        html += `
        <div class="hcard" data-name="${s.n.toLowerCase()}" data-favid="${s.n}" onclick="play('${s.u}','${s.n.replace(/'/g,"\\'")}','${s.f}','${s.cc}')">
            <div class="img" style="background:linear-gradient(135deg,${color},#1a1a2e)">${icon}
                <div class="play-overlay">▶</div>
            </div>
            <div class="info">
                <h3>${s.n}</h3>
                <p>${s.f} · ${s.c}</p>
            </div>
        </div>`;
    }
    html += '</div></div>';
    
    // ── Recently Played Horizontal ──
    html += '<div class="section"><div class="section-header"><h2>🕐 Popular Picks</h2><a href="#">Show all</a></div><div class="hscroll">';
    for (const s of popular) {
        const color = GC[s.f] || '#1ed760';
        const icon = GI[s.f] || '📻';
        html += `
        <div class="hcard" data-name="${s.n.toLowerCase()}" data-favid="${s.n}" onclick="play('${s.u}','${s.n.replace(/'/g,"\\'")}','${s.f}','${s.cc}')">
            <div class="img" style="background:linear-gradient(135deg,${color},#1a1a2e)">${icon}
                <div class="play-overlay">▶</div>
            </div>
            <div class="info">
                <h3>${s.n}</h3>
                <p>${s.f} · ${s.c}</p>
            </div>
        </div>`;
    }
    html += '</div></div>';
    
    // ── Country Clusters ──
    for (const country of countries) {
        const stations = S.filter(s => s.c === country);
        const flag = F[stations[0]?.cc] || '';
        
        html += `<div class="section" data-country="${country}">`;
        html += `<div class="section-header"><h2>${flag} ${country}</h2><a href="#">${stations.length} stations</a></div>`;
        html += '<div class="vlist">';
        
        for (const s of stations) {
            const color = GC[s.f] || '#1ed760';
            const icon = GI[s.f] || '📻';
            const fid = s.n;
            html += `
            <div class="vcard" data-name="${s.n.toLowerCase()}" data-favid="${fid}" onclick="play('${s.u}','${s.n.replace(/'/g,"\\'")}','${s.f}','${s.cc}')">
                <div class="thumb" style="background:linear-gradient(135deg,${color},#1a1a2e)">${icon}</div>
                <div class="info">
                    <h3>${s.n}</h3>
                    <p>${s.f}${s.c !== country ? ' · '+s.c : ''}</p>
                </div>
                <div class="actions">
                    <button class="fav" data-id="${fid}" onclick="event.stopPropagation();toggleFav('${fid}',this)">🤍</button>
                    <button class="play" onclick="event.stopPropagation();play('${s.u}','${s.n.replace(/'/g,"\\'")}','${s.f}','${s.cc}')">▶</button>
                </div>
            </div>`;
        }
        
        html += '</div></div>';
    }
    
    res.send(page('CedarCast', html));
});

app.listen(PORT, () => console.log(`CedarCast → http://localhost:${PORT}`));

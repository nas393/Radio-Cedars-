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
    // USA
    { n:"NPR 24", c:"United States", f:"News", u:"https://npr-ice.streamguys1.com/live.mp3" },
    { n:"KEXP 90.3", c:"United States", f:"Alternative", u:"https://kexp.streamguys1.com/kexp160.aac" },
    { n:"WNYC 93.9", c:"United States", f:"News", u:"https://fm939.wnyc.org/wnycfm-web" },
    // UK
    { n:"BBC World Service", c:"United Kingdom", f:"News", u:"https://stream.live.vc.bbcmedia.co.uk/bbc_world_service" },
    { n:"BBC Radio 1", c:"United Kingdom", f:"Pop", u:"https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one" },
    { n:"BBC Radio 4", c:"United Kingdom", f:"Talk", u:"https://stream.live.vc.bbcmedia.co.uk/bbc_radio_fourfm" },
    { n:"BBC 6 Music", c:"United Kingdom", f:"Alternative", u:"https://stream.live.vc.bbcmedia.co.uk/bbc_6music" },
    // France
    { n:"RFI Monde", c:"France", f:"News", u:"https://rfimonde-96k.ice.infomaniak.ch/rfimonde-96k.mp3" },
    { n:"France Inter", c:"France", f:"Variety", u:"https://stream.radiofrance.fr/franceinter/franceinter.m3u8" },
    { n:"FIP", c:"France", f:"Eclectic", u:"https://stream.radiofrance.fr/fip/fip.m3u8" },
    // Germany
    { n:"Deutschlandfunk", c:"Germany", f:"News", u:"https://st01.sslstream.dlf.de/dlf/01/128/mp3/stream.mp3" },
    { n:"Radio Eins", c:"Germany", f:"Eclectic", u:"https://dispatcher.rndfnk.com/rbb/radioeins/live/mp3/mid" },
    // Italy
    { n:"Radio Deejay", c:"Italy", f:"Pop", u:"https://stream.deejay.it/radiodeejay" },
    { n:"Radio Italia", c:"Italy", f:"Italian", u:"https://stream.radioitalia.it/radioitalia" },
    // Spain
    { n:"Cadena SER", c:"Spain", f:"News", u:"https://playerservices.streamtheworld.com/api/livestream-redirect/CADENASER.mp3" },
    { n:"Los 40", c:"Spain", f:"Pop", u:"https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40.mp3" },
    // Canada
    { n:"CBC Radio One", c:"Canada", f:"News", u:"https://cbcradiolive.akamaized.net/hls/live/2041004/cbcradiolive/master.m3u8" },
    // Australia
    { n:"Triple J", c:"Australia", f:"Alternative", u:"https://abcradio4live.akamaized.net/triplej/aac" },
    // Japan
    { n:"NHK World", c:"Japan", f:"News", u:"https://nhkworld.webcdn.stream.ne.jp/www11/radiojapan/all/263949/live_s.m3u8" },
    // UAE
    { n:"Dubai 92", c:"UAE", f:"Pop", u:"https://stream.radioarabia.net/dubai92" },
    // Egypt
    { n:"Nile FM 104.2", c:"Egypt", f:"Pop", u:"https://stream.nilefm.com/nilefm" },
    // Turkey
    { n:"Power FM", c:"Turkey", f:"Pop", u:"https://powerfm.listenpowerapp.com/powerfm/mpeg/icecast.audio" },
    // India
    { n:"Radio Mirchi 98.3", c:"India", f:"Bollywood", u:"https://stream.radiomirchi.com/mirchi" }
];

const F = { LB:"🇱🇧", US:"🇺🇸", GB:"🇬🇧", FR:"🇫🇷", DE:"🇩🇪", IT:"🇮🇹", ES:"🇪🇸", CA:"🇨🇦", AU:"🇦🇺", JP:"🇯🇵", AE:"🇦🇪", EG:"🇪🇬", TR:"🇹🇷", IN:"🇮🇳" };
const countries = [...new Set(S.map(s => s.c))];
countries.sort((a,b) => a === 'Lebanon' ? -1 : b === 'Lebanon' ? 1 : a.localeCompare(b));

// Genre colors for card accents
const GC = {
    Pop:"#ff6b9d", Rock:"#e74c3c", News:"#f39c12", Arabic:"#2ecc71",
    Dance:"#1abc9c", Hits:"#ff6b9d", Alternative:"#1abc9c", Talk:"#f39c12",
    Eclectic:"#9b59b6", Oldies:"#e67e22", Variety:"#00bcd4", Classical:"#9b59b6",
    Italian:"#e74c3c", Bollywood:"#f39c12"
};

const CSS = `
:root{--bg:#121212;--card:#1a1a1a;--surface:#282828;--text:#fff;--muted:#aaa;--a:#1db954;--r:8px}
*{margin:0;padding:0;box-sizing:border-box}
body{font:400 14px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;-webkit-tap-highlight-color:transparent;padding-bottom:140px}

/* ── Header ── */
header{position:sticky;top:0;z-index:100;background:rgba(18,18,18,.95);backdrop-filter:blur(10px);padding:14px 16px 10px}
header h1{font-size:1.4rem;font-weight:700;color:#fff;margin-bottom:10px}
.search-box{display:flex;align-items:center;background:var(--surface);border-radius:8px;padding:10px 14px;gap:10px}
.search-box span{color:var(--muted);font-size:1rem}
.search-box input{flex:1;background:none;border:none;color:#fff;font-size:.9rem;outline:none}
.search-box input::placeholder{color:var(--muted)}

/* ── Chips ── */
.chips{display:flex;gap:8px;padding:6px 16px 0;overflow-x:auto;scrollbar-width:none;-ms-overflow-style:none}
.chips::-webkit-scrollbar{display:none}
.chips button{background:var(--surface);border:none;color:var(--muted);padding:8px 16px;border-radius:20px;cursor:pointer;font:.8rem -apple-system,sans-serif;white-space:nowrap;transition:.2s}
.chips button.on{background:#fff;color:#000;font-weight:600}

/* ── Sections ── */
.section{padding:16px}
.section h2{font-size:1.1rem;font-weight:700;margin-bottom:12px;color:#fff}

/* ── Horizontal Scroll Cards (Spotify style) ── */
.hscroll{display:flex;gap:12px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px}
.hscroll::-webkit-scrollbar{display:none}
.hcard{min-width:150px;max-width:150px;background:var(--card);border-radius:8px;padding:0;overflow:hidden;cursor:pointer;transition:.2s;border:none;text-align:left;flex-shrink:0}
.hcard:active{background:var(--surface)}
.hcard .img{width:100%;aspect-ratio:1;background:linear-gradient(135deg,var(--accent,var(--a)),#000);display:flex;align-items:center;justify-content:center;font-size:2.5rem}
.hcard .info{padding:10px}
.hcard .info h3{font-size:.8rem;font-weight:600;color:#fff;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hcard .info p{font-size:.7rem;color:var(--muted)}

/* ── Vertical List Cards ── */
.vcard{display:flex;align-items:center;gap:12px;padding:10px 0;cursor:pointer;border-radius:6px;transition:.2s}
.vcard:active{background:rgba(255,255,255,.03)}
.vcard .thumb{width:48px;height:48px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0}
.vcard .info{flex:1;min-width:0}
.vcard .info h3{font-size:.85rem;font-weight:500;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vcard .info p{font-size:.7rem;color:var(--muted)}
.vcard .play-btn{width:36px;height:36px;border-radius:50%;background:var(--a);border:none;color:#000;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:.2s}
.vcard .play-btn:active{transform:scale(.9)}

/* ── Now Playing Bar (Spotify bottom bar) ── */
.now-playing{position:fixed;bottom:0;left:0;right:0;background:var(--surface);border-radius:12px 12px 0 0;padding:8px 16px;z-index:1000;display:none;flex-direction:column;gap:8px;box-shadow:0 -4px 20px rgba(0,0,0,.5)}
.now-playing.on{display:flex}
.now-playing .np-info{display:flex;align-items:center;gap:10px}
.now-playing .np-info .np-icon{width:40px;height:40px;border-radius:6px;background:var(--a);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}
.now-playing .np-info .np-text{flex:1;min-width:0}
.now-playing .np-info .np-text h4{font-size:.8rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.now-playing .np-info .np-text p{font-size:.65rem;color:var(--a)}
.now-playing .np-close{background:none;border:none;color:var(--muted);font-size:1rem;cursor:pointer;padding:4px}
.now-playing audio{width:100%;height:32px;border-radius:4px}
`;

function page(title, body, js) {
    return `<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#121212"><title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${CSS}</style></head>
<body>
<header>
    <h1>🎵 CedarCast</h1>
    <div class="search-box">
        <span>🔍</span>
        <input type="text" id="search" placeholder="What do you want to listen to?" oninput="filter()">
    </div>
</header>
<div class="chips" id="chips">
    <button class="on" onclick="showAll(this)">All</button>
    ${countries.map(c => `<button onclick="showCountry('${c}',this)">${F[S.find(s=>s.c===c)?.cc]||''} ${c}</button>`).join('')}
</div>
${body}
<div class="now-playing" id="player">
    <div class="np-info">
        <div class="np-icon">📻</div>
        <div class="np-text">
            <h4 id="np-name">Not playing</h4>
            <p id="np-status">Select a station</p>
        </div>
        <button class="np-close" onclick="stop()">✕</button>
    </div>
    <audio id="audio" controls></audio>
</div>
<script>
let cur=null;
function play(u,n,f){
    const p=document.getElementById('player'),a=document.getElementById('audio');
    const nm=document.getElementById('np-name'),ns=document.getElementById('np-status');
    if(cur){cur.pause();cur.load()}
    a.src=u;a.load();a.play().catch(()=>{});
    nm.textContent=n;ns.textContent=f||'Live';p.classList.add('on');cur=a;
}
function stop(){const p=document.getElementById('player'),a=document.getElementById('audio');a.pause();a.src='';p.classList.remove('on');cur=null}
function filter(){const q=document.getElementById('search').value.toLowerCase();document.querySelectorAll('.vcard,.hcard').forEach(c=>{c.style.display=c.dataset.name.includes(q)?'':'none'});document.querySelectorAll('.section').forEach(s=>{const visible=s.querySelectorAll('.vcard:not([style*="display: none"]),.hcard:not([style*="display: none"])').length;s.style.display=visible?'':'none'})}
function showCountry(c,el){document.querySelectorAll('#chips button').forEach(b=>b.classList.remove('on'));el.classList.add('on');document.querySelectorAll('.section').forEach(s=>{s.style.display=s.dataset.country===c?'':'none'})}
function showAll(el){document.querySelectorAll('#chips button').forEach(b=>b.classList.remove('on'));el.classList.add('on');document.querySelectorAll('.section').forEach(s=>{s.style.display=''})}
${js||''}
</script></body></html>`;
}

app.get('/', (req, res) => {
    // Featured row — top 6 stations (random)
    const featured = [...S].sort(() => Math.random() - 0.5).slice(0, 6);
    
    let html = '';
    
    // ── Featured Horizontal Scroll ──
    html += '<div class="section"><h2>🔥 Featured Stations</h2><div class="hscroll">';
    for (const s of featured) {
        const color = GC[s.f] || '#1db954';
        html += `
        <div class="hcard" style="--accent:${color}" data-name="${s.n.toLowerCase()}" onclick="play('${s.u}','${s.n.replace(/'/g,"\\'")}','${s.f}')">
            <div class="img">${F[s.cc]||'📻'}</div>
            <div class="info">
                <h3>${s.n}</h3>
                <p>${s.f}</p>
            </div>
        </div>`;
    }
    html += '</div></div>';
    
    // ── Country Clusters (Vertical List Style) ──
    for (const country of countries) {
        const stations = S.filter(s => s.c === country);
        const flag = F[stations[0]?.cc] || '';
        
        html += `<div class="section" data-country="${country}">`;
        html += `<h2>${flag} ${country}</h2>`;
        
        for (const s of stations) {
            const color = GC[s.f] || '#1db954';
            html += `
            <div class="vcard" data-name="${s.n.toLowerCase()}" onclick="play('${s.u}','${s.n.replace(/'/g,"\\'")}','${s.f}')">
                <div class="thumb" style="background:linear-gradient(135deg,${color},#000)">${flag}</div>
                <div class="info">
                    <h3>${s.n}</h3>
                    <p>${s.f}</p>
                </div>
                <button class="play-btn" onclick="event.stopPropagation();play('${s.u}','${s.n.replace(/'/g,"\\'")}','${s.f}')">▶</button>
            </div>`;
        }
        
        html += '</div>';
    }
    
    res.send(page('CedarCast', html));
});

app.listen(PORT, () => console.log(`CedarCast → http://localhost:${PORT}`));

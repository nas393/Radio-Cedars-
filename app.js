const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ── All Stations ──
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
    { n:"NHK World Japan", c:"Japan", f:"News", u:"https://nhkworld.webcdn.stream.ne.jp/www11/radiojapan/all/263949/live_s.m3u8" },
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

// Get unique countries in order (Lebanon first)
const countries = [...new Set(S.map(s => s.c))];
countries.sort((a,b) => a === 'Lebanon' ? -1 : b === 'Lebanon' ? 1 : a.localeCompare(b));

const CSS = `
:root{--bg:#000;--card:#0a0a0a;--text:#ddd;--muted:#555;--a:#0ff;--b:1px solid rgba(255,255,255,.06);--r:10px}
*{margin:0;padding:0;box-sizing:border-box}
body{font:400 14px 'Space Mono',monospace;background:var(--bg);color:var(--text);min-height:100vh;-webkit-tap-highlight-color:transparent;padding-bottom:80px}
nav{position:sticky;top:0;z-index:100;background:var(--bg);border-bottom:var(--b);padding:12px 16px}
.logo{text-align:center;font-size:1rem;font-weight:700;color:var(--a);letter-spacing:2px;margin-bottom:10px}
.search input{width:100%;background:var(--card);border:var(--b);color:var(--text);padding:10px 14px;border-radius:var(--r);font:.7rem 'Space Mono',monospace;outline:none}
.search input:focus{border-color:var(--a)}
.chips{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:8px}
.chips button{background:var(--card);border:var(--b);color:var(--muted);padding:5px 10px;border-radius:14px;cursor:pointer;font:.6rem 'Space Mono',monospace}
.chips button.on{border-color:var(--a);color:var(--a)}

/* Clusters */
.cluster{margin-bottom:20px}
.cluster h2{color:var(--a);font-size:.8rem;margin-bottom:8px;font-weight:400}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
@media(max-width:700px){.grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:400px){.grid{grid-template-columns:1fr}}

.card{background:var(--card);padding:14px;border-radius:var(--r);border:var(--b);display:flex;flex-direction:column;justify-content:space-between}
.card:active{border-color:var(--a)}
.card h3{color:#fff;font-size:.75rem;font-weight:400;margin-bottom:10px;line-height:1.2}
.card .genre{color:var(--muted);font-size:.55rem;margin-bottom:8px}
.btn{background:transparent;border:1px solid var(--a);color:var(--a);padding:6px 10px;border-radius:6px;cursor:pointer;font:.55rem 'Space Mono',monospace;text-align:center;width:100%}
.btn:active{background:rgba(0,255,255,.05)}

.player{position:fixed;bottom:0;left:0;right:0;background:var(--bg);border-top:var(--b);padding:12px 16px;display:none;align-items:center;gap:12px;z-index:1000}
.player.on{display:flex}
.player span{color:var(--a);font-size:.7rem;min-width:50px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.player audio{flex:1;height:30px;border-radius:4px}
.player button{background:none;border:var(--b);color:var(--muted);padding:5px 10px;border-radius:4px;cursor:pointer;font:.7rem 'Space Mono',monospace}
`;

function page(title, body, js) {
    return `<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#000"><title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>${CSS}</style></head>
<body>
<nav>
    <div class="logo">CEDARCAST</div>
    <div class="search"><input type="text" id="search" placeholder="Search stations..." oninput="filter()"></div>
    <div class="chips" id="chips">
        <button class="on" onclick="showAll(this)">All</button>
        ${countries.map(c => `<button onclick="showCountry('${c}',this)">${c}</button>`).join('')}
    </div>
</nav>
${body}
<div class="player" id="player">
    <span id="np">—</span>
    <audio id="audio" controls></audio>
    <button onclick="stop()">✕</button>
</div>
<script>
let cur=null;
function play(u,n){const p=document.getElementById('player'),a=document.getElementById('audio'),d=document.getElementById('np');if(cur){cur.pause();cur.load()}a.src=u;a.load();a.play().catch(()=>{});d.textContent=n;p.classList.add('on');cur=a}
function stop(){const p=document.getElementById('player'),a=document.getElementById('audio');a.pause();a.src='';p.classList.remove('on');cur=null}
function filter(){const q=document.getElementById('search').value.toLowerCase();document.querySelectorAll('.card').forEach(c=>{c.style.display=c.dataset.name.includes(q)?'':'none'})}
function showCountry(c,el){document.querySelectorAll('#chips button').forEach(b=>b.classList.remove('on'));el.classList.add('on');document.querySelectorAll('.cluster').forEach(cl=>{cl.style.display=cl.dataset.country===c?'':'none'})}
function showAll(el){document.querySelectorAll('#chips button').forEach(b=>b.classList.remove('on'));el.classList.add('on');document.querySelectorAll('.cluster').forEach(cl=>{cl.style.display=''})}
${js||''}
</script></body></html>`;
}

app.get('/', (req, res) => {
    // Build clusters: group stations by country
    let html = '<div class="main">';
    
    for (const country of countries) {
        const stations = S.filter(s => s.c === country);
        const flag = F[stations[0]?.cc] || '';
        
        html += `<div class="cluster" data-country="${country}">`;
        html += `<h2>${flag} ${country} · ${stations.length} stations</h2>`;
        html += '<div class="grid">';
        
        for (const s of stations) {
            html += `
            <div class="card" data-name="${s.n.toLowerCase()}">
                <h3>${s.n}</h3>
                <div class="genre">${s.f}</div>
                <button class="btn" onclick="play('${s.u}','${s.n.replace(/'/g,"\\'")}')">▶ Listen</button>
            </div>`;
        }
        
        html += '</div></div>';
    }
    
    html += '</div>';
    
    res.send(page('CedarCast', html));
});

app.listen(PORT, () => console.log(`CedarCast → http://localhost:${PORT}`));

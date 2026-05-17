const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Lebanese TV channels
const TV_CHANNELS = [
    { name: "MTV Lebanon", id: "UCXqPuaVx8hBdEG5XhQc4qJg", handle: "@mtvlebanon" },
    { name: "Al Jadeed News", id: "UC3OV2K9c6p9pnM_vYfGc0wA", handle: "@aljadeed" },
    { name: "LBCI Lebanon", id: "UCRZmcAg9TrX9YJpm8fG-yVQ", handle: "@LBCILebanon" },
    { name: "OTV Lebanon", id: "UCkSPdEZjWAxwh2Lwq5ZmpnA", handle: "@OTVLebanon" },
    { name: "NBN Lebanon", id: "UC9pVQHpFJKo4zH7tHdllqLg", handle: "@NBNLebanon" },
    { name: "Télé Liban", id: "UC-lRlbsx1yH5Uw8wzX9pnfg", handle: "@tllebanon" }
];

async function getRadioStations() {
    try {
        const { data } = await axios.get(
            'https://de1.api.radio-browser.info/json/stations/bycountrycodeexact/LB',
            { timeout: 10000 }
        );
        return data
            .filter(s => s.url_resolved && s.name)
            .slice(0, 30)
            .map(s => ({
                name: s.name,
                url: s.url_resolved,
                bitrate: s.bitrate || '?',
                codec: s.codec || 'MP3'
            }));
    } catch {
        return [
            { name: "Radio Lebanon 96.2 FM", url: "https://stream.zeno.fm/0z7h8f2q5yzuv", bitrate: "128", codec: "MP3" },
            { name: "Voice of Lebanon 100.5", url: "https://stream.zeno.fm/8z5x2kq7y5vtv", bitrate: "128", codec: "MP3" },
            { name: "NRJ Lebanon 99.1 FM", url: "https://stream.zeno.fm/xycruze3k0hvv", bitrate: "128", codec: "MP3" },
            { name: "Mix FM Lebanon 104.4", url: "https://stream.zeno.fm/80mw4qg2h8quv", bitrate: "128", codec: "MP3" },
            { name: "Radio Orient 88.7 FM", url: "https://stream.zeno.fm/7q5xy85k3v8uv", bitrate: "128", codec: "MP3" }
        ];
    }
}

const STYLES = `
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Space Mono',monospace;background:#0a2a0a;color:#e0ffe0;padding-bottom:100px}
    nav{display:flex;justify-content:space-between;align-items:center;padding:1.2rem;background:#061a06;border-bottom:2px solid #39ff14;position:sticky;top:0;z-index:100;box-shadow:0 0 20px rgba(57,255,20,.2)}
    nav a{color:#e0ffe0;text-decoration:none;font-size:.9rem}
    .logo{color:#39ff14;font-weight:700;font-size:1.1rem;text-shadow:0 0 10px rgba(57,255,20,.5)}
    .logo-icon{font-size:1.3rem}
    .container{padding:1.2rem;max-width:900px;margin:0 auto}
    h1{color:#39ff14;text-shadow:0 0 15px rgba(57,255,20,.3);font-size:1.8rem;margin-bottom:1rem}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem}
    .card{background:#0d260d;padding:1.2rem;border-radius:12px;border:1px solid rgba(57,255,20,.1)}
    .card h3{color:#fff;margin-bottom:.3rem;font-size:1rem}
    .meta{color:#88aa88;font-size:.8rem;margin-bottom:1rem}
    button,.btn{background:transparent;border:2px solid #39ff14;color:#39ff14;padding:.6rem 1.2rem;font-family:'Space Mono',monospace;border-radius:8px;cursor:pointer;text-decoration:none;display:inline-block;font-size:.85rem}
    button:hover,.btn:hover{background:rgba(57,255,20,.1);box-shadow:0 0 15px rgba(57,255,20,.3)}
    .tv-card{background:#0d260d;border-radius:12px;overflow:hidden;border:1px solid rgba(57,255,20,.1)}
    .tv-card iframe{width:100%;height:180px;border:none;background:#000}
    .tv-info{padding:1rem}
    .tv-info h3{color:#39ff14;margin-bottom:.5rem}
    .player-bar{position:fixed;bottom:0;left:0;right:0;background:#061a06;border-top:2px solid #39ff14;padding:1rem;display:none;align-items:center;gap:.8rem;z-index:1000;box-shadow:0 0 20px rgba(57,255,20,.2)}
    .player-bar.active{display:flex}
    .player-bar span{color:#39ff14;font-size:.75rem;min-width:100px}
    .player-bar audio{flex:1;height:32px}
    .close-btn{background:transparent;border:1px solid #ff4444;color:#ff4444;padding:.3rem .7rem;border-radius:6px;cursor:pointer;font-family:'Space Mono',monospace}
    .hero{text-align:center;padding:2rem 1rem}
    .hero h1{font-size:2.2rem}
    .cedar{font-size:3rem;display:block;margin-bottom:.5rem}
    .nav-cards{display:grid;grid-template-columns:1fr 1fr;gap:1rem;max-width:350px;margin:2rem auto}
    .nav-card{background:#0d260d;padding:1.5rem;border-radius:12px;text-decoration:none;color:#e0ffe0;border:1px solid rgba(57,255,20,.1);text-align:center}
    .nav-card:hover{border-color:#39ff14;box-shadow:0 0 20px rgba(57,255,20,.1)}
    @media(max-width:600px){.grid{grid-template-columns:1fr}.player-bar{flex-direction:column;padding:.8rem}.player-bar audio{width:100%}}
`;

function page(title, content) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>${STYLES}</style>
</head>
<body>
    <nav>
        <a href="/" class="logo"><span class="logo-icon">🌲</span> RADIO CEDAR</a>
        <div style="display:flex;gap:1.2rem">
            <a href="/radio">📻 Radio</a>
            <a href="/tv">📺 TV</a>
        </div>
    </nav>
    ${content}
    <div id="player" class="player-bar">
        <span id="nowPlaying">No station</span>
        <audio id="audio" controls></audio>
        <button class="close-btn" onclick="closePlayer()">✕</button>
    </div>
    <script>
        let current=null;
        function playRadio(url,name){
            const p=document.getElementById('player'),
            a=document.getElementById('audio'),
            n=document.getElementById('nowPlaying');
            if(current){current.pause();current.load()}
            a.src=url;a.load();
            a.play().catch(()=>alert('Station unavailable. Try another!'));
            n.textContent='🎵 '+name;
            p.classList.add('active');
            current=a;
        }
        function closePlayer(){
            const p=document.getElementById('player'),
            a=document.getElementById('audio'),
            n=document.getElementById('nowPlaying');
            a.pause();a.src='';
            p.classList.remove('active');
            n.textContent='No station';
            current=null;
        }
    </script>
</body>
</html>`;
}

app.get('/', async (req, res) => {
    const stations = await getRadioStations();
    const feat = stations[Math.floor(Math.random() * stations.length)];
    
    res.send(page('Radio Cedar — Live from Lebanon', `
        <div class="hero">
            <span class="cedar">🌲</span>
            <h1>RADIO CEDAR</h1>
            <p style="color:#88aa88;margin-bottom:2rem">Lebanon's voice, wherever you are</p>
            ${feat ? `
            <div class="card" style="max-width:350px;margin:1rem auto;text-align:center">
                <h3>🎵 Featured Station</h3>
                <p style="margin:.5rem 0;font-size:1.1rem">${feat.name}</p>
                <p class="meta">${feat.bitrate}kbps · ${feat.codec}</p>
                <button onclick="playRadio('${feat.url}','${feat.name.replace(/'/g,"\\'")}')">▶ Play Now</button>
            </div>
            ` : ''}
            <div class="nav-cards">
                <a href="/radio" class="nav-card"><div style="font-size:2rem">📻</div><h3>Radio</h3><p style="color:#88aa88;font-size:.75rem">${stations.length} stations</p></a>
                <a href="/tv" class="nav-card"><div style="font-size:2rem">📺</div><h3>TV</h3><p style="color:#88aa88;font-size:.75rem">6 channels</p></a>
            </div>
        </div>
    `));
});

app.get('/radio', async (req, res) => {
    const stations = await getRadioStations();
    
    res.send(page('Radio — Radio Cedar', `
        <div class="container">
            <h1>🌲 Lebanese Radio Stations</h1>
            <p style="color:#88aa88;margin-bottom:1.5rem">Live from Lebanon — tune in from anywhere in the world</p>
            <div class="grid">
                ${stations.map(s => `
                <div class="card">
                    <h3>${s.name}</h3>
                    <p class="meta">${s.bitrate}kbps · ${s.codec}</p>
                    <button onclick="playRadio('${s.url}','${s.name.replace(/'/g,"\\'")}')">▶ Tune In</button>
                </div>
                `).join('')}
            </div>
        </div>
    `));
});

app.get('/tv', (req, res) => {
    res.send(page('TV — Radio Cedar', `
        <div class="container">
            <h1>🌲 Lebanese Television</h1>
            <p style="color:#88aa88;margin-bottom:1.5rem">Live broadcasts from Lebanon</p>
            <div class="grid">
                ${TV_CHANNELS.map(c => `
                <div class="tv-card">
                    <iframe src="https://www.youtube.com/embed/live_stream?channel=${c.id}" allow="autoplay;encrypted-media" allowfullscreen loading="lazy"></iframe>
                    <div class="tv-info">
                        <h3>${c.name}</h3>
                        <a href="https://youtube.com/${c.handle}/live" target="_blank" class="btn" style="margin-top:.5rem">Watch on YouTube</a>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    `));
});

app.listen(PORT, () => console.log(`🌲 Radio Cedar broadcasting on port ${PORT}`));

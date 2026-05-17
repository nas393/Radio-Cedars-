const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();

// ============================================
// BEIRUT NEON - Complete Single File Webapp
// Live Lebanese Radio & TV for the Diaspora
// ============================================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

// Create directories if they don't exist
const fs = require('fs');
['views', 'public'].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// ============================================
// RADIO SERVICE - Fetch Real Lebanese Stations
// ============================================
async function getLebaneseStations() {
    try {
        const response = await axios.get(
            'https://de1.api.radio-browser.info/json/stations/bycountrycodeexact/LB',
            { timeout: 8000 }
        );
        
        return response.data
            .filter(s => s.url_resolved && s.name)
            .map(s => ({
                name: s.name,
                url: s.url_resolved,
                bitrate: s.bitrate || '128',
                codec: s.codec || 'MP3'
            }))
            .sort((a, b) => (b.votes || 0) - (a.votes || 0))
            .slice(0, 25);
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

// ============================================
// LEBANESE TV CHANNELS
// ============================================
const tvChannels = [
    { name: "MTV Lebanon", channel: "mtvlebanon" },
    { name: "Al Jadeed", channel: "aljadeed" },
    { name: "LBCI Lebanon", channel: "LBCILebanon" },
    { name: "OTV Lebanon", channel: "OTVLebanon" },
    { name: "NBN Lebanon", channel: "NBNLebanon" },
    { name: "Télé Liban", channel: "tllebanon" }
];

// ============================================
// HTML TEMPLATES (Built-in)
// ============================================
const header = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BEIRUT//NEON</title>
    <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Space Mono', monospace;
            background: #0a0a0c;
            color: #e0e0e0;
            min-height: 100vh;
            padding-bottom: 100px;
        }
        .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            background: rgba(10,10,12,0.95);
            border-bottom: 1px solid rgba(0,255,255,0.2);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .logo {
            font-size: 1.2rem;
            font-weight: 700;
            color: #00ffff;
            text-decoration: none;
            text-shadow: 0 0 10px rgba(0,255,255,0.5);
        }
        .pink { color: #ff00ff; text-shadow: 0 0 10px rgba(255,0,255,0.5); }
        .nav-links a {
            color: #e0e0e0;
            text-decoration: none;
            margin-left: 1.5rem;
            font-size: 0.9rem;
        }
        .nav-links a:hover { color: #00ffff; }
        .container { padding: 1.5rem; max-width: 1000px; margin: 0 auto; }
        h1 {
            color: #00ffff;
            text-shadow: 0 0 20px rgba(0,255,255,0.5);
            margin-bottom: 1rem;
            font-size: 2rem;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1rem;
        }
        .card {
            background: #1a1a1e;
            padding: 1.2rem;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.05);
        }
        .card h3 {
            color: #fff;
            margin-bottom: 0.3rem;
            font-size: 1rem;
        }
        .meta {
            color: #888;
            font-size: 0.8rem;
            margin-bottom: 1rem;
        }
        button, .btn {
            background: transparent;
            border: 2px solid #39ff14;
            color: #39ff14;
            padding: 0.6rem 1.5rem;
            font-family: 'Space Mono', monospace;
            cursor: pointer;
            border-radius: 6px;
            text-decoration: none;
            display: inline-block;
            font-size: 0.9rem;
            transition: all 0.3s;
        }
        button:hover, .btn:hover {
            background: rgba(57,255,20,0.1);
            box-shadow: 0 0 20px rgba(57,255,20,0.3);
        }
        .tv-card {
            background: #1a1a1e;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.05);
        }
        .tv-card iframe {
            width: 100%;
            height: 200px;
            border: none;
            background: #000;
        }
        .tv-card .info {
            padding: 1rem;
        }
        .tv-card .info h3 {
            color: #00ffff;
            margin-bottom: 0.5rem;
        }
        .player-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(10,10,12,0.98);
            border-top: 2px solid #00ffff;
            padding: 1rem;
            display: none;
            align-items: center;
            gap: 1rem;
            z-index: 1000;
        }
        .player-bar.active { display: flex; }
        .player-bar span {
            color: #00ffff;
            font-size: 0.8rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 120px;
        }
        .player-bar audio {
            flex: 1;
            height: 30px;
            background: transparent;
        }
        .close-btn {
            background: transparent;
            border: 1px solid #ff00ff;
            color: #ff00ff;
            padding: 0.3rem 0.8rem;
            cursor: pointer;
            border-radius: 4px;
            font-family: 'Space Mono', monospace;
        }
        .hero {
            text-align: center;
            padding: 3rem 1rem;
        }
        .hero h1 { font-size: 2.5rem; }
        .hero p { color: #888; margin-bottom: 2rem; }
        .hero .nav-cards {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            max-width: 400px;
            margin: 2rem auto;
        }
        .hero .nav-card {
            background: #1a1a1e;
            padding: 1.5rem;
            border-radius: 10px;
            text-decoration: none;
            color: #e0e0e0;
            border: 1px solid rgba(255,255,255,0.05);
            text-align: center;
        }
        .hero .nav-card:hover {
            border-color: #00ffff;
        }
        @media (max-width: 600px) {
            .grid { grid-template-columns: 1fr; }
            .player-bar { flex-direction: column; padding: 0.8rem; }
            .player-bar audio { width: 100%; }
            .hero h1 { font-size: 1.8rem; }
        }
    </style>
</head>
<body>
`;

const footer = `
<div id="audioPlayer" class="player-bar">
    <span id="nowPlaying">No station selected</span>
    <audio id="radioAudio" controls></audio>
    <button class="close-btn" onclick="closePlayer()">✕</button>
</div>

<script>
let currentAudio = null;

function playRadio(url, name) {
    const player = document.getElementById('audioPlayer');
    const audio = document.getElementById('radioAudio');
    const nowPlaying = document.getElementById('nowPlaying');
    
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.load();
    }
    
    audio.src = url;
    audio.load();
    
    const playPromise = audio.play();
    if (playPromise) {
        playPromise.catch(() => {
            alert('This station may be temporarily unavailable. Try another!');
        });
    }
    
    nowPlaying.textContent = '🎵 ' + name;
    player.classList.add('active');
    currentAudio = audio;
    
    // Scroll to player
    player.scrollIntoView({ behavior: 'smooth' });
}

function closePlayer() {
    const player = document.getElementById('audioPlayer');
    const audio = document.getElementById('radioAudio');
    const nowPlaying = document.getElementById('nowPlaying');
    
    audio.pause();
    audio.src = '';
    player.classList.remove('active');
    nowPlaying.textContent = 'No station selected';
    currentAudio = null;
}
</script>
</body>
</html>
`;

// ============================================
// ROUTES
// ============================================

app.get('/', async (req, res) => {
    const stations = await getLebaneseStations();
    const featured = stations[Math.floor(Math.random() * stations.length)];
    
    const html = header + `
        <nav class="navbar">
            <a href="/" class="logo">BEIRUT<span class="pink">//</span>NEON</a>
            <div class="nav-links">
                <a href="/radio">📻 Radio</a>
                <a href="/tv">📺 TV</a>
            </div>
        </nav>
        
        <div class="hero">
            <h1>BEIRUT<span class="pink">//</span>NEON</h1>
            <p>World airwaves, summer-loud.</p>
            
            ${featured ? `
            <div class="card" style="max-width: 400px; margin: 1.5rem auto; text-align: center;">
                <h3>🎵 Featured Station</h3>
                <p style="font-size: 1.1rem; margin: 0.5rem 0;">${featured.name}</p>
                <p class="meta">${featured.bitrate}kbps · ${featured.codec}</p>
                <button onclick="playRadio('${featured.url}', '${featured.name.replace(/'/g, "\\'")}')">
                    ▶ Play Now
                </button>
            </div>
            ` : ''}
            
            <div class="nav-cards">
                <a href="/radio" class="nav-card">
                    <div style="font-size: 2rem;">📻</div>
                    <h3>Radio</h3>
                    <p style="color: #888; font-size: 0.8rem;">${stations.length} stations</p>
                </a>
                <a href="/tv" class="nav-card">
                    <div style="font-size: 2rem;">📺</div>
                    <h3>TV</h3>
                    <p style="color: #888; font-size: 0.8rem;">Live channels</p>
                </a>
            </div>
        </div>
    ` + footer;
    
    res.send(html);
});

app.get('/radio', async (req, res) => {
    const stations = await getLebaneseStations();
    
    const html = header + `
        <nav class="navbar">
            <a href="/" class="logo">BEIRUT<span class="pink">//</span>NEON</a>
            <div class="nav-links">
                <a href="/radio" style="color: #00ffff;">📻 Radio</a>
                <a href="/tv">📺 TV</a>
            </div>
        </nav>
        
        <div class="container">
            <h1>📻 Lebanese Radio</h1>
            <p style="color: #888; margin-bottom: 1.5rem;">Live from Beirut — tune in from anywhere</p>
            
            <div class="grid">
                ${stations.map(s => `
                <div class="card">
                    <h3>${s.name}</h3>
                    <p class="meta">${s.bitrate}kbps · ${s.codec}</p>
                    <button onclick="playRadio('${s.url}', '${s.name.replace(/'/g, "\\'")}')">
                        ▶ Tune In
                    </button>
                </div>
                `).join('')}
            </div>
        </div>
    ` + footer;
    
    res.send(html);
});

app.get('/tv', (req, res) => {
    const html = header + `
        <nav class="navbar">
            <a href="/" class="logo">BEIRUT<span class="pink">//</span>NEON</a>
            <div class="nav-links">
                <a href="/radio">📻 Radio</a>
                <a href="/tv" style="color: #00ffff;">📺 TV</a>
            </div>
        </nav>
        
        <div class="container">
            <h1>📺 Lebanese TV — Live</h1>
            <p style="color: #888; margin-bottom: 1.5rem;">Live broadcasts from Lebanon</p>
            
            <div class="grid">
                ${tvChannels.map(c => `
                <div class="tv-card">
                    <iframe 
                        src="https://www.youtube.com/embed?listType=user_uploads&list=${c.channel}&autoplay=0" 
                        allow="autoplay; encrypted-media" 
                        allowfullscreen>
                    </iframe>
                    <div class="info">
                        <h3>${c.name}</h3>
                        <a href="https://youtube.com/@${c.channel}/live" target="_blank" class="btn" style="margin-top: 0.5rem;">
                            Watch on YouTube
                        </a>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    ` + footer;
    
    res.send(html);
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🌃 BEIRUT//NEON is live!`);
    console.log(`📱 Open: http://localhost:${PORT}`);
    console.log(`📻 ${tvChannels.length} TV channels · Live Radio\n`);
});

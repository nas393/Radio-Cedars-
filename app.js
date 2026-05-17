const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Lebanese TV channels
const TV_CHANNELS = [
    { name: "MTV Lebanon", id: "UCXqPuaVx8hBdEG5XhQc4qJg", handle: "@mtvlebanon", logo: "📡" },
    { name: "Al Jadeed", id: "UC3OV2K9c6p9pnM_vYfGc0wA", handle: "@aljadeed", logo: "📰" },
    { name: "LBCI", id: "UCRZmcAg9TrX9YJpm8fG-yVQ", handle: "@LBCILebanon", logo: "📺" },
    { name: "OTV", id: "UCkSPdEZjWAxwh2Lwq5ZmpnA", handle: "@OTVLebanon", logo: "🍊" },
    { name: "NBN", id: "UC9pVQHpFJKo4zH7tHdllqLg", handle: "@NBNLebanon", logo: "🔴" },
    { name: "Télé Liban", id: "UC-lRlbsx1yH5Uw8wzX9pnfg", handle: "@tllebanon", logo: "🏛️" }
];

// Region data for diaspora
const REGIONS = {
    "beirut": "🇱🇧 Beirut",
    "dubai": "🇦🇪 Dubai", 
    "paris": "🇫🇷 Paris",
    "sydney": "🇦🇺 Sydney",
    "montreal": "🇨🇦 Montreal",
    "nyc": "🇺🇸 New York",
    "london": "🇬🇧 London",
    "saopaulo": "🇧🇷 São Paulo"
};

async function getRadioStations() {
    try {
        const { data } = await axios.get(
            'https://de1.api.radio-browser.info/json/stations/bycountrycodeexact/LB',
            { timeout: 10000 }
        );
        return data
            .filter(s => s.url_resolved && s.name)
            .slice(0, 40)
            .map(s => ({
                name: s.name,
                url: s.url_resolved,
                bitrate: s.bitrate || '128',
                codec: s.codec || 'MP3',
                favicon: s.favicon || null,
                language: s.language || 'Arabic',
                votes: s.votes || 0
            }))
            .sort((a, b) => b.votes - a.votes);
    } catch {
        return [
            { name: "Radio Lebanon 96.2 FM", url: "https://stream.zeno.fm/0z7h8f2q5yzuv", bitrate: "128", codec: "MP3", language: "Arabic", votes: 100 },
            { name: "Voice of Lebanon 100.5", url: "https://stream.zeno.fm/8z5x2kq7y5vtv", bitrate: "128", codec: "MP3", language: "Arabic", votes: 95 },
            { name: "NRJ Lebanon 99.1 FM", url: "https://stream.zeno.fm/xycruze3k0hvv", bitrate: "128", codec: "MP3", language: "Arabic/English", votes: 90 },
            { name: "Mix FM Lebanon 104.4", url: "https://stream.zeno.fm/80mw4qg2h8quv", bitrate: "128", codec: "MP3", language: "English", votes: 85 },
            { name: "Radio Orient 88.7 FM", url: "https://stream.zeno.fm/7q5xy85k3v8uv", bitrate: "128", codec: "MP3", language: "Arabic", votes: 80 },
            { name: "Sawt El Ghad 96.7 FM", url: "https://stream.zeno.fm/6z8x5kq7y5vtv", bitrate: "128", codec: "MP3", language: "Arabic", votes: 75 }
        ];
    }
}

const CSS = `
:root {
    --neon-cyan: #00ffff;
    --neon-pink: #ff00ff;
    --neon-green: #39ff14;
    --neon-yellow: #ffff00;
    --bg-dark: #0a0a0a;
    --bg-card: #1a1a1e;
    --text: #e0e0e0;
    --text-muted: #888;
    --glow-cyan: 0 0 10px rgba(0,255,255,0.5), 0 0 40px rgba(0,255,255,0.2);
    --glow-pink: 0 0 10px rgba(255,0,255,0.5), 0 0 40px rgba(255,0,255,0.2);
    --glow-green: 0 0 10px rgba(57,255,20,0.5), 0 0 40px rgba(57,255,20,0.2);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: 'Space Mono', monospace;
    background: var(--bg-dark);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
}

/* Background particles */
body::before {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: 
        radial-gradient(circle at 20% 50%, rgba(0,255,255,0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255,0,255,0.03) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
}

/* Navigation */
nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: rgba(10,10,10,0.95);
    border-bottom: 1px solid rgba(0,255,255,0.2);
    position: sticky;
    top: 0;
    z-index: 1000;
    backdrop-filter: blur(20px);
}

.logo {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--neon-cyan);
    text-decoration: none;
    text-shadow: var(--glow-cyan);
    letter-spacing: 2px;
    animation: flicker 3s infinite alternate;
}

@keyframes flicker {
    0%, 100% { opacity: 1; }
    92% { opacity: 1; }
    93% { opacity: 0.8; }
    94% { opacity: 1; }
    96% { opacity: 0.9; }
    97% { opacity: 1; }
}

.separator {
    color: var(--neon-pink);
    text-shadow: var(--glow-pink);
}

.nav-links {
    display: flex;
    gap: 1.5rem;
}

.nav-links a {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.9rem;
    transition: all 0.3s;
    padding: 0.5rem 0.8rem;
    border-radius: 6px;
}

.nav-links a:hover, .nav-links a.active {
    color: var(--neon-cyan);
    text-shadow: var(--glow-cyan);
    background: rgba(0,255,255,0.05);
}

.mode-toggle {
    background: transparent;
    border: 1px solid var(--neon-pink);
    color: var(--neon-pink);
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    font-family: 'Space Mono', monospace;
    font-size: 0.8rem;
    text-shadow: var(--glow-pink);
}

/* Hero Section */
.hero {
    text-align: center;
    padding: 3rem 1rem;
    position: relative;
    z-index: 1;
}

.glitch-text {
    font-size: clamp(2rem, 8vw, 4rem);
    color: var(--neon-cyan);
    text-shadow: var(--glow-cyan);
    position: relative;
    animation: glitch 2s infinite;
}

@keyframes glitch {
    0%, 100% { transform: none; }
    20% { transform: skew(-2deg); }
    40% { transform: skew(2deg); }
    60% { transform: skew(-1deg); }
    80% { transform: skew(1deg); }
}

.tagline {
    color: var(--text-muted);
    margin: 1rem 0 2rem;
    font-size: 1.1rem;
}

/* Radio Dial */
.dial-container {
    max-width: 600px;
    margin: 2rem auto;
    position: relative;
}

.dial {
    background: var(--bg-card);
    border: 2px solid rgba(0,255,255,0.2);
    border-radius: 20px;
    padding: 2rem;
    text-align: center;
    box-shadow: 0 0 30px rgba(0,255,255,0.05);
    position: relative;
    overflow: hidden;
}

.dial::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
        from 0deg,
        transparent,
        rgba(0,255,255,0.1),
        transparent,
        rgba(255,0,255,0.1),
        transparent
    );
    animation: rotate 10s linear infinite;
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.dial-display {
    font-size: 3rem;
    color: var(--neon-cyan);
    text-shadow: var(--glow-cyan);
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
}

.frequency {
    font-size: 1.5rem;
    color: var(--neon-pink);
    text-shadow: var(--glow-pink);
    position: relative;
    z-index: 1;
}

.dial-controls {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 1.5rem;
    position: relative;
    z-index: 1;
}

.dial-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid var(--neon-cyan);
    background: transparent;
    color: var(--neon-cyan);
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.dial-btn:hover {
    background: rgba(0,255,255,0.1);
    box-shadow: var(--glow-cyan);
}

/* Region Selector */
.region-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin: 1.5rem 0;
}

.region-btn {
    background: rgba(0,255,255,0.05);
    border: 1px solid rgba(0,255,255,0.2);
    color: var(--text-muted);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    font-family: 'Space Mono', monospace;
    font-size: 0.8rem;
    transition: all 0.3s;
}

.region-btn:hover, .region-btn.active {
    border-color: var(--neon-cyan);
    color: var(--neon-cyan);
    text-shadow: var(--glow-cyan);
    background: rgba(0,255,255,0.1);
}

/* Station Cards */
.container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 1rem;
    position: relative;
    z-index: 1;
}

h1 {
    color: var(--neon-cyan);
    text-shadow: var(--glow-cyan);
    margin-bottom: 1rem;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
}

.card {
    background: var(--bg-card);
    padding: 1.2rem;
    border-radius: 15px;
    border: 1px solid rgba(255,255,255,0.05);
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
}

.card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(135deg, rgba(0,255,255,0.05), rgba(255,0,255,0.05));
    opacity: 0;
    transition: opacity 0.3s;
}

.card:hover::after {
    opacity: 1;
}

.card:hover {
    border-color: rgba(0,255,255,0.3);
    box-shadow: 0 0 20px rgba(0,255,255,0.1);
    transform: translateY(-2px);
}

.card h3 {
    color: #fff;
    margin-bottom: 0.3rem;
    font-size: 1rem;
    position: relative;
    z-index: 1;
}

.meta {
    color: var(--text-muted);
    font-size: 0.8rem;
    margin-bottom: 0.8rem;
    position: relative;
    z-index: 1;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-bottom: 0.8rem;
    position: relative;
    z-index: 1;
}

.tag {
    background: rgba(0,255,255,0.1);
    color: var(--neon-cyan);
    padding: 0.2rem 0.6rem;
    border-radius: 15px;
    font-size: 0.7rem;
}

/* Buttons */
.neon-btn {
    background: transparent;
    border: 2px solid var(--neon-cyan);
    color: var(--neon-cyan);
    padding: 0.7rem 1.5rem;
    font-family: 'Space Mono', monospace;
    border-radius: 10px;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    font-size: 0.9rem;
    transition: all 0.3s;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    z-index: 1;
}

.neon-btn:hover {
    background: rgba(0,255,255,0.1);
    box-shadow: var(--glow-cyan);
}

.play-btn {
    border-color: var(--neon-green);
    color: var(--neon-green);
}

.play-btn:hover {
    background: rgba(57,255,20,0.1);
    box-shadow: var(--glow-green);
}

/* TV Grid */
.tv-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.tv-card {
    background: var(--bg-card);
    border-radius: 15px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.05);
    transition: all 0.3s;
}

.tv-card:hover {
    border-color: rgba(255,0,255,0.3);
    box-shadow: 0 0 20px rgba(255,0,255,0.1);
}

.tv-card iframe {
    width: 100%;
    height: 200px;
    border: none;
    background: #000;
}

.tv-info {
    padding: 1rem;
}

.tv-info h3 {
    color: var(--neon-pink);
    text-shadow: var(--glow-pink);
    margin-bottom: 0.5rem;
}

/* Player Bar */
.player-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(10,10,10,0.98);
    border-top: 2px solid var(--neon-cyan);
    padding: 0.8rem 1.5rem;
    display: none;
    align-items: center;
    gap: 1rem;
    z-index: 1000;
    backdrop-filter: blur(20px);
    box-shadow: 0 -10px 30px rgba(0,255,255,0.1);
    transition: transform 0.3s;
}

.player-bar.active {
    display: flex;
    animation: slideUp 0.3s ease;
}

@keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}

.now-playing-section {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    min-width: 150px;
}

.station-visualizer {
    display: flex;
    gap: 3px;
    align-items: flex-end;
    height: 30px;
}

.bar {
    width: 3px;
    background: var(--neon-cyan);
    border-radius: 2px;
    animation: equalize 0.8s infinite alternate;
}

.bar:nth-child(1) { height: 15px; animation-delay: 0s; }
.bar:nth-child(2) { height: 25px; animation-delay: 0.2s; }
.bar:nth-child(3) { height: 10px; animation-delay: 0.4s; }
.bar:nth-child(4) { height: 20px; animation-delay: 0.6s; }
.bar:nth-child(5) { height: 28px; animation-delay: 0.3s; }

@keyframes equalize {
    from { height: 5px; }
    to { height: 30px; }
}

#nowPlaying {
    color: var(--neon-cyan);
    font-size: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
}

.player-bar audio {
    flex: 1;
    height: 35px;
    border-radius: 8px;
}

.close-btn {
    background: transparent;
    border: 1px solid var(--neon-pink);
    color: var(--neon-pink);
    padding: 0.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Space Mono', monospace;
    font-size: 0.8rem;
}

/* Car Mode */
.car-mode .card {
    padding: 1.5rem;
}

.car-mode button, .car-mode .neon-btn {
    padding: 1rem 2rem;
    font-size: 1.2rem;
    min-height: 60px;
}

.car-mode .player-bar {
    padding: 1.5rem;
}

.car-mode .player-bar audio {
    height: 50px;
}

.car-mode h3 {
    font-size: 1.2rem;
}

/* Now Playing Screen */
.now-playing-full {
    text-align: center;
    padding: 2rem;
}

.station-art {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 3px solid var(--neon-cyan);
    box-shadow: var(--glow-cyan);
    margin: 0 auto 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    background: var(--bg-card);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { box-shadow: var(--glow-cyan); }
    50% { box-shadow: 0 0 30px rgba(0,255,255,0.8), 0 0 60px rgba(0,255,255,0.4); }
}

/* Responsive */
@media (max-width: 768px) {
    nav {
        padding: 0.8rem 1rem;
    }
    
    .logo {
        font-size: 1rem;
    }
    
    .nav-links a {
        font-size: 0.8rem;
        padding: 0.3rem 0.5rem;
    }
    
    .grid, .tv-grid {
        grid-template-columns: 1fr;
    }
    
    .player-bar {
        flex-direction: column;
        padding: 0.8rem;
        gap: 0.5rem;
    }
    
    .player-bar audio {
        width: 100%;
    }
    
    .dial-display {
        font-size: 2rem;
    }
}

/* Car Mode specific overrides */
@media (min-width: 768px) {
    .car-mode .grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
    
    .car-mode .card {
        cursor: pointer;
    }
}
`;

function page(title, content, extraScript = '') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no">
    <meta name="theme-color" content="#0a0a0a">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>${CSS}</style>
</head>
<body>
    <nav>
        <a href="/" class="logo">RADIO<span class="separator">//</span>CEDAR</a>
        <div class="nav-links">
            <a href="/radio">📻 Radio</a>
            <a href="/tv">📺 TV</a>
            <a href="/now-playing">🎵 Now</a>
        </div>
        <button class="mode-toggle" onclick="toggleCarMode()">🚗</button>
    </nav>
    ${content}
    <div id="player" class="player-bar">
        <div class="now-playing-section">
            <div class="station-visualizer">
                <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
            </div>
            <span id="nowPlaying">Select a station</span>
        </div>
        <audio id="audio" controls></audio>
        <button class="close-btn" onclick="closePlayer()">✕</button>
    </div>
    <script>
        let current = null;
        let carMode = false;
        
        function playRadio(url, name) {
            const p = document.getElementById('player');
            const a = document.getElementById('audio');
            const n = document.getElementById('nowPlaying');
            
            if (current) {
                current.pause();
                current.load();
            }
            
            a.src = url;
            a.load();
            
            const playPromise = a.play();
            if (playPromise) {
                playPromise.catch(() => {
                    alert('⚠️ Station temporarily unavailable. Try another.');
                });
            }
            
            n.textContent = '🎵 ' + name;
            p.classList.add('active');
            current = a;
            
            // Auto-scroll to player on mobile
            if (window.innerWidth < 768) {
                p.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Vibrate on mobile when station starts
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }
        
        function closePlayer() {
            const p = document.getElementById('player');
            const a = document.getElementById('audio');
            const n = document.getElementById('nowPlaying');
            
            a.pause();
            a.src = '';
            p.classList.remove('active');
            n.textContent = 'Select a station';
            current = null;
        }
        
        function toggleCarMode() {
            carMode = !carMode;
            document.body.classList.toggle('car-mode', carMode);
            
            const btn = document.querySelector('.mode-toggle');
            btn.textContent = carMode ? '📱' : '🚗';
            btn.style.borderColor = carMode ? '#39ff14' : '#ff00ff';
            btn.style.color = carMode ? '#39ff14' : '#ff00ff';
            
            // Announce mode change
            if ('speechSynthesis' in window) {
                const msg = new SpeechSynthesisUtterance(
                    carMode ? 'Car mode activated. Drive safely.' : 'Mobile mode activated.'
                );
                speechSynthesis.speak(msg);
            }
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && current) {
                e.preventDefault();
                const audio = document.getElementById('audio');
                audio.paused ? audio.play() : audio.pause();
            }
        });
        
        // Keep screen on while playing
        if ('wakeLock' in navigator) {
            document.getElementById('audio').addEventListener('play', async () => {
                try {
                    await navigator.wakeLock.request('screen');
                } catch {}
            });
        }
        ${extraScript}
    </script>
</body>
</html>`;
}

app.get('/', async (req, res) => {
    const stations = await getRadioStations();
    const featured = stations[Math.floor(Math.random() * 5)];
    
    res.send(page('Radio Cedar — Lebanon Live', `
        <div class="hero">
            <h1 class="glitch-text">RADIO<span class="separator">//</span>CEDAR</h1>
            <p class="tagline">Lebanon's voice, wherever you are</p>
            
            <div class="region-selector">
                ${Object.entries(REGIONS).map(([id, name]) => `
                    <button class="region-btn" onclick="selectRegion('${id}')">${name}</button>
                `).join('')}
            </div>
            
            <div class="dial-container">
                <div class="dial">
                    <div class="dial-display">📻</div>
                    <div class="frequency" id="dialFrequency">--.- FM</div>
                    <div style="color: var(--text-muted); font-size: 0.8rem;" id="dialStation">Tuning the dial...</div>
                    <div class="dial-controls">
                        <button class="dial-btn" onclick="tuneDial(-1)">◀</button>
                        <button class="dial-btn" onclick="playCurrentDial()" style="width: 70px; height: 70px; font-size: 1.5rem;">▶</button>
                        <button class="dial-btn" onclick="tuneDial(1)">▶</button>
                    </div>
                </div>
            </div>
            
            ${featured ? `
            <div class="card" style="max-width: 400px; margin: 2rem auto; text-align: center;">
                <h3>⭐ Featured Station</h3>
                <p style="font-size: 1.2rem; margin: 0.5rem 0;">${featured.name}</p>
                <p class="meta">${featured.bitrate}kbps · ${featured.codec} · ${featured.language}</p>
                <button class="neon-btn play-btn" onclick="playRadio('${featured.url}','${featured.name.replace(/'/g,"\\'")}')">
                    ▶ Play Now
                </button>
            </div>
            ` : ''}
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; max-width: 400px; margin: 2rem auto;">
                <a href="/radio" class="card" style="text-align: center; text-decoration: none;">
                    <div style="font-size: 2.5rem;">📻</div>
                    <h3>Radio</h3>
                    <p class="meta">${stations.length} stations</p>
                </a>
                <a href="/tv" class="card" style="text-align: center; text-decoration: none;">
                    <div style="font-size: 2.5rem;">📺</div>
                    <h3>TV</h3>
                    <p class="meta">6 channels</p>
                </a>
            </div>
        </div>
    `, `
        const stations = ${JSON.stringify(stations.slice(0, 20).map(s => ({ name: s.name, url: s.url })))};
        let dialIndex = 0;
        
        function tuneDial(dir) {
            dialIndex = (dialIndex + dir + stations.length) % stations.length;
            updateDial();
        }
        
        function updateDial() {
            document.getElementById('dialFrequency').textContent = 
                (Math.floor(Math.random() * 20) + 88) + '.' + Math.floor(Math.random() * 9) + ' FM';
            document.getElementById('dialStation').textContent = stations[dialIndex].name;
        }
        
        function playCurrentDial() {
            playRadio(stations[dialIndex].url, stations[dialIndex].name);
        }
        
        function selectRegion(region) {
            document.querySelectorAll('.region-btn').forEach(b => b.classList.remove('active'));
            event.target.classList.add('active');
            
            const regionNames = {
                'beirut': '🇱🇧 Beirut — Local time: ' + new Date().toLocaleTimeString('en-US', {timeZone: 'Asia/Beirut'}),
                'dubai': '🇦🇪 Dubai — Local time: ' + new Date().toLocaleTimeString('en-US', {timeZone: 'Asia/Dubai'}),
                'paris': '🇫🇷 Paris — Local time: ' + new Date().toLocaleTimeString('en-US', {timeZone: 'Europe/Paris'}),
                'sydney': '🇦🇺 Sydney — Local time: ' + new Date().toLocaleTimeString('en-US', {timeZone: 'Australia/Sydney'}),
                'montreal': '🇨🇦 Montreal — Local time: ' + new Date().toLocaleTimeString('en-US', {timeZone: 'America/Toronto'}),
                'nyc': '🇺🇸 New York — Local time: ' + new Date().toLocaleTimeString('en-US', {timeZone: 'America/New_York'}),
                'london': '🇬🇧 London — Local time: ' + new Date().toLocaleTimeString('en-US', {timeZone: 'Europe/London'}),
                'saopaulo': '🇧🇷 São Paulo — Local time: ' + new Date().toLocaleTimeString('en-US', {timeZone: 'America/Sao_Paulo'})
            };
            
            document.querySelector('.tagline').textContent = regionNames[region] || 'Lebanon\'s voice, wherever you are';
        }
        
        updateDial();
    `));
});

app.get('/radio', async (req, res) => {
    const stations = await getRadioStations();
    
    res.send(page('Radio Stations — Radio Cedar', `
        <div class="container">
            <h1>📻 Lebanese Radio</h1>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
                ${stations.length} live stations — Tune in from anywhere
            </p>
            <div class="grid">
                ${stations.map(s => `
                <div class="card">
                    <h3>${s.name}</h3>
                    <p class="meta">${s.bitrate}kbps · ${s.codec} · ${s.language}</p>
                    <div class="tags">
                        <span class="tag">📻 Live</span>
                        <span class="tag">⭐ ${s.votes}</span>
                    </div>
                    <button class="neon-btn play-btn" onclick="playRadio('${s.url}','${s.name.replace(/'/g,"\\'")}')">
                        ▶ Tune In
                    </button>
                </div>
                `).join('')}
            </div>
        </div>
    `));
});

app.get('/tv', (req, res) => {
    res.send(page('TV Channels — Radio Cedar', `
        <div class="container">
            <h1>📺 Lebanese TV</h1>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Live broadcasts from Lebanon</p>
            <div class="tv-grid">
                ${TV_CHANNELS.map(c => `
                <div class="tv-card">
                    <iframe src="https://www.youtube.com/embed/live_stream?channel=${c.id}" 
                            allow="autoplay; encrypted-media" allowfullscreen loading="lazy"></iframe>
                    <div class="tv-info">
                        <h3>${c.logo} ${c.name}</h3>
                        <a href="https://youtube.com/${c.handle}/live" target="_blank" 
                           class="neon-btn" style="margin-top: 0.5rem; border-color: var(--neon-pink); color: var(--neon-pink);">
                            Watch on YouTube
                        </a>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    `));
});

app.get('/now-playing', (req, res) => {
    res.send(page('Now Playing — Radio Cedar', `
        <div class="container" style="text-align: center;">
            <div class="now-playing-full">
                <div class="station-art">🌲</div>
                <h1 style="font-size: 2rem;">Now Playing</h1>
                <p style="color: var(--neon-pink); font-size: 1.2rem;" id="currentStation">
                    No station selected
                </p>
                <p class="meta" id="currentMeta">Select a station to start listening</p>
                <button class="neon-btn play-btn" onclick="resumeLastStation()" style="margin-top: 1rem;">
                    ▶ Resume Last Station
                </button>
            </div>
        </div>
    `, `
        const lastStation = localStorage.getItem('lastStation');
        const lastStationName = localStorage.getItem('lastStationName');
        
        if (lastStation) {
            document.getElementById('currentStation').textContent = lastStationName;
            document.getElementById('currentMeta').textContent = 'Tap to resume';
        }
        
        function resumeLastStation() {
            if (lastStation) {
                playRadio(lastStation, lastStationName || 'Last station');
            }
        }
        
        // Update now playing screen when station changes
        const observer = new MutationObserver(() => {
            const nowPlaying = document.getElementById('nowPlaying').textContent;
            if (nowPlaying.startsWith('🎵')) {
                const name = nowPlaying.replace('🎵 ', '');
                document.getElementById('currentStation').textContent = name;
                localStorage.setItem('lastStationName', name);
            }
        });
        
        observer.observe(document.getElementById('nowPlaying'), { 
            characterData: true, 
            childList: true 
        });
    `));
});

app.listen(PORT, () => console.log(`🌲 Radio Cedar broadcasting on port ${PORT}`));

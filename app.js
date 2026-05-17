const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const TV_CHANNELS = [
    { name: "MTV Lebanon", id: "UCXqPuaVx8hBdEG5XhQc4qJg", handle: "@mtvlebanon" },
    { name: "Al Jadeed", id: "UC3OV2K9c6p9pnM_vYfGc0wA", handle: "@aljadeed" },
    { name: "LBCI", id: "UCRZmcAg9TrX9YJpm8fG-yVQ", handle: "@LBCILebanon" },
    { name: "OTV", id: "UCkSPdEZjWAxwh2Lwq5ZmpnA", handle: "@OTVLebanon" },
    { name: "NBN", id: "UC9pVQHpFJKo4zH7tHdllqLg", handle: "@NBNLebanon" },
    { name: "Télé Liban", id: "UC-lRlbsx1yH5Uw8wzX9pnfg", handle: "@tllebanon" }
];

const REGIONS = {
    beirut: "🇱🇧 Beirut",
    dubai: "🇦🇪 Dubai",
    paris: "🇫🇷 Paris",
    sydney: "🇦🇺 Sydney",
    montreal: "🇨🇦 Montreal",
    nyc: "🇺🇸 New York",
    london: "🇬🇧 London",
    saopaulo: "🇧🇷 São Paulo"
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

function page(title, content, extraScript = '') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no">
    <meta name="theme-color" content="#000000">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #000000;
            --card: #0d0d0d;
            --text: #e0e0e0;
            --muted: #666;
            --accent: #00ffff;
            --accent2: #ff00ff;
            --glow: 0 0 20px rgba(0,255,255,0.3);
            --border: rgba(255,255,255,0.08);
            --radius: 16px;
            --font: 'Space Mono', monospace;
        }
        
        .theme-cyber { --bg: #060d06; --card: #0d1a0d; --accent: #39ff14; --accent2: #39ff14; --glow: 0 0 20px rgba(57,255,20,0.3); --border: rgba(57,255,20,0.1); }
        .theme-midnight { --bg: #080810; --card: #12121a; --accent: #ff00ff; --accent2: #00ffff; --glow: 0 0 20px rgba(255,0,255,0.3); --border: rgba(255,0,255,0.08); }
        .theme-dark { --bg: #000000; --card: #0d0d0d; --accent: #00ffff; --accent2: #ff00ff; --glow: 0 0 20px rgba(0,255,255,0.3); --border: rgba(255,255,255,0.08); }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: var(--font);
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            -webkit-tap-highlight-color: transparent;
            transition: background 0.5s;
        }
        
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.25rem;
            background: var(--bg);
            border-bottom: 1px solid var(--border);
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        
        .logo {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--accent);
            text-decoration: none;
            text-shadow: var(--glow);
            letter-spacing: 2px;
        }
        
        .logo .sep { color: var(--accent2); }
        
        .nav-links { display: flex; gap: 1rem; }
        
        .nav-links a {
            color: var(--muted);
            text-decoration: none;
            font-size: 0.8rem;
            transition: 0.3s;
            padding: 0.4rem 0.6rem;
            border-radius: 8px;
        }
        
        .nav-links a:hover, .nav-links a.active { color: var(--accent); }
        
        .nav-actions { display: flex; gap: 0.5rem; align-items: center; }
        
        .icon-btn {
            background: transparent;
            border: 1px solid var(--border);
            color: var(--muted);
            padding: 0.4rem 0.6rem;
            border-radius: 8px;
            cursor: pointer;
            font-family: var(--font);
            font-size: 0.8rem;
            transition: 0.3s;
        }
        
        .icon-btn:hover, .icon-btn.active { border-color: var(--accent); color: var(--accent); }
        
        .theme-selector {
            position: fixed;
            bottom: 100px;
            right: 1rem;
            z-index: 999;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            opacity: 0;
            transform: translateY(20px);
            pointer-events: none;
            transition: 0.3s;
        }
        
        .theme-selector.open {
            opacity: 1;
            transform: translateY(0);
            pointer-events: all;
        }
        
        .theme-dot {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 2px solid var(--border);
            cursor: pointer;
            transition: 0.3s;
            font-size: 0.7rem;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--card);
            color: var(--text);
            font-family: var(--font);
        }
        
        .theme-dot:hover { border-color: var(--accent); transform: scale(1.1); }
        .theme-dot.cyan { border-color: #00ffff; color: #00ffff; }
        .theme-dot.green { border-color: #39ff14; color: #39ff14; }
        .theme-dot.pink { border-color: #ff00ff; color: #ff00ff; }
        
        .theme-toggle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid var(--accent);
            background: var(--bg);
            color: var(--accent);
            cursor: pointer;
            font-size: 1.2rem;
            transition: 0.3s;
            position: fixed;
            bottom: 1.5rem;
            right: 1.5rem;
            z-index: 1000;
            box-shadow: var(--glow);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font);
        }
        
        .theme-toggle:active { transform: scale(0.9); }
        
        .container { max-width: 800px; margin: 0 auto; padding: 1rem 1.25rem; }
        
        h1 { color: var(--accent); text-shadow: var(--glow); font-size: 1.5rem; margin-bottom: 1rem; font-weight: 400; letter-spacing: 1px; }
        
        .hero { text-align: center; padding: 2.5rem 1rem; }
        
        .hero h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .hero p { color: var(--muted); margin-bottom: 1.5rem; font-size: 0.9rem; }
        
        .dial {
            max-width: 400px;
            margin: 1.5rem auto;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 2rem;
            text-align: center;
        }
        
        .dial-display { font-size: 2.5rem; margin-bottom: 0.5rem; }
        .dial-frequency { color: var(--accent2); font-size: 1.2rem; margin-bottom: 0.3rem; }
        .dial-station { color: var(--muted); font-size: 0.8rem; margin-bottom: 1.5rem; }
        
        .dial-controls { display: flex; justify-content: center; align-items: center; gap: 1.5rem; }
        
        .dial-btn {
            width: 48px; height: 48px;
            border-radius: 50%;
            border: 1px solid var(--border);
            background: transparent;
            color: var(--accent);
            font-size: 1rem;
            cursor: pointer;
            transition: 0.3s;
            font-family: var(--font);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .dial-btn:hover, .dial-btn:active { border-color: var(--accent); box-shadow: var(--glow); }
        .dial-btn.play { width: 64px; height: 64px; font-size: 1.4rem; border-color: var(--accent); }
        
        .region-selector {
            display: flex; flex-wrap: wrap; gap: 0.4rem;
            justify-content: center; margin: 1rem 0;
        }
        
        .region-btn {
            background: transparent;
            border: 1px solid var(--border);
            color: var(--muted);
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            cursor: pointer;
            font-family: var(--font);
            font-size: 0.7rem;
            transition: 0.3s;
        }
        
        .region-btn:hover, .region-btn.active { border-color: var(--accent); color: var(--accent); }
        
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.8rem; }
        
        .card {
            background: var(--card);
            padding: 1rem;
            border-radius: var(--radius);
            border: 1px solid var(--border);
            transition: 0.3s;
            text-decoration: none;
            color: var(--text);
            display: block;
        }
        
        .card:hover, .card:active { border-color: var(--accent); }
        
        .card h3 { color: #fff; font-size: 0.9rem; margin-bottom: 0.3rem; font-weight: 400; }
        .card .meta { color: var(--muted); font-size: 0.7rem; margin-bottom: 0.8rem; }
        
        .tags { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-bottom: 0.8rem; }
        
        .tag {
            background: rgba(255,255,255,0.03);
            color: var(--accent);
            padding: 0.2rem 0.5rem;
            border-radius: 12px;
            font-size: 0.65rem;
            border: 1px solid var(--border);
        }
        
        .btn {
            background: transparent;
            border: 1px solid var(--accent);
            color: var(--accent);
            padding: 0.5rem 1rem;
            font-family: var(--font);
            border-radius: 10px;
            cursor: pointer;
            text-decoration: none;
            font-size: 0.75rem;
            transition: 0.3s;
            display: inline-block;
            letter-spacing: 1px;
        }
        
        .btn:hover, .btn:active { background: rgba(0,255,255,0.05); box-shadow: var(--glow); }
        .btn.play { border-color: var(--accent2); color: var(--accent2); }
        
        .tv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        
        .tv-card {
            background: var(--card);
            border-radius: var(--radius);
            overflow: hidden;
            border: 1px solid var(--border);
            transition: 0.3s;
        }
        
        .tv-card:hover { border-color: var(--accent); }
        .tv-card iframe { width: 100%; height: 180px; border: none; background: #000; }
        .tv-info { padding: 1rem; }
        .tv-info h3 { color: var(--accent); font-size: 0.9rem; margin-bottom: 0.5rem; font-weight: 400; }
        
        .player-bar {
            position: fixed;
            bottom: 0; left: 0; right: 0;
            background: var(--bg);
            border-top: 1px solid var(--border);
            padding: 0.8rem 1rem;
            display: none;
            align-items: center;
            gap: 0.8rem;
            z-index: 1000;
            transition: 0.3s;
        }
        
        .player-bar.active { display: flex; }
        .player-bar.active.android-auto { padding: 1.2rem; gap: 1.2rem; }
        
        #nowPlaying {
            color: var(--accent);
            font-size: 0.75rem;
            min-width: 80px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .player-bar audio { flex: 1; height: 32px; border-radius: 6px; }
        
        .player-bar.android-auto audio { height: 48px; }
        
        .close-btn {
            background: transparent;
            border: 1px solid var(--border);
            color: var(--muted);
            padding: 0.4rem 0.7rem;
            border-radius: 8px;
            cursor: pointer;
            font-family: var(--font);
            font-size: 0.8rem;
            transition: 0.3s;
        }
        
        .close-btn:hover { border-color: var(--accent2); color: var(--accent2); }
        
        .empty { text-align: center; padding: 3rem; color: var(--muted); }
        
        .overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            z-index: 998;
            display: none;
        }
        
        .overlay.show { display: block; }
        
        @media (max-width: 600px) {
            .hero h1 { font-size: 1.8rem; }
            .grid, .tv-grid { grid-template-columns: 1fr; }
            .player-bar { flex-direction: column; padding: 0.6rem; }
            .player-bar audio { width: 100%; }
            .dial { padding: 1.5rem; }
            .dial-display { font-size: 2rem; }
        }
        
        @media (min-width: 768px) {
            .android-auto .grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
            .android-auto .btn { padding: 0.7rem 1.4rem; font-size: 0.9rem; }
            .android-auto .card { padding: 1.4rem; }
            .android-auto h3 { font-size: 1rem; }
        }
    </style>
</head>
<body class="theme-dark">
    <nav>
        <a href="/" class="logo">RADIO<span class="sep">//</span>CEDAR</a>
        <div class="nav-links">
            <a href="/radio">Radio</a>
            <a href="/tv">TV</a>
        </div>
        <div class="nav-actions">
            <button class="icon-btn" onclick="toggleAndroidAuto()" id="autoBtn" title="Android Auto mode">🚗</button>
        </div>
    </nav>
    
    ${content}
    
    <div class="overlay" id="overlay" onclick="closeThemeSelector()"></div>
    
    <div class="theme-selector" id="themeSelector">
        <button class="theme-dot cyan" onclick="setTheme('dark')" title="Dark Neon">🔵</button>
        <button class="theme-dot green" onclick="setTheme('cyber')" title="Cyber Cedar">🟢</button>
        <button class="theme-dot pink" onclick="setTheme('midnight')" title="Midnight Lebanon">🟣</button>
    </div>
    
    <button class="theme-toggle" onclick="toggleThemeSelector()" id="themeToggle">🎨</button>
    
    <div id="player" class="player-bar">
        <span id="nowPlaying">Select a station</span>
        <audio id="audio" controls></audio>
        <button class="close-btn" onclick="closePlayer()">✕</button>
    </div>
    
    <script>
        let current = null;
        let androidAuto = false;
        
        function playRadio(url, name) {
            const p = document.getElementById('player');
            const a = document.getElementById('audio');
            const n = document.getElementById('nowPlaying');
            
            if (current) { current.pause(); current.load(); }
            
            a.src = url;
            a.load();
            a.play().catch(() => alert('Station unavailable. Try another.'));
            
            n.textContent = name;
            p.classList.add('active');
            if (androidAuto) p.classList.add('android-auto');
            current = a;
            
            if (navigator.vibrate) navigator.vibrate(30);
            if ('wakeLock' in navigator) {
                a.addEventListener('play', async () => {
                    try { await navigator.wakeLock.request('screen'); } catch {}
                });
            }
        }
        
        function closePlayer() {
            const p = document.getElementById('player');
            const a = document.getElementById('audio');
            const n = document.getElementById('nowPlaying');
            a.pause(); a.src = '';
            p.classList.remove('active', 'android-auto');
            n.textContent = 'Select a station';
            current = null;
        }
        
        function toggleAndroidAuto() {
            androidAuto = !androidAuto;
            document.body.classList.toggle('android-auto', androidAuto);
            document.getElementById('autoBtn').classList.toggle('active', androidAuto);
            document.getElementById('autoBtn').textContent = androidAuto ? '📱' : '🚗';
            document.getElementById('autoBtn').style.color = androidAuto ? 'var(--accent)' : 'var(--muted)';
            document.getElementById('autoBtn').style.borderColor = androidAuto ? 'var(--accent)' : 'var(--border)';
            
            if (document.getElementById('player').classList.contains('active')) {
                document.getElementById('player').classList.toggle('android-auto', androidAuto);
            }
            
            if ('speechSynthesis' in window) {
                const msg = new SpeechSynthesisUtterance(androidAuto ? 'Android Auto mode. Drive safely.' : 'Mobile mode.');
                speechSynthesis.speak(msg);
            }
        }
        
        function toggleThemeSelector() {
            const sel = document.getElementById('themeSelector');
            const ov = document.getElementById('overlay');
            const isOpen = sel.classList.contains('open');
            sel.classList.toggle('open', !isOpen);
            ov.classList.toggle('show', !isOpen);
        }
        
        function closeThemeSelector() {
            document.getElementById('themeSelector').classList.remove('open');
            document.getElementById('overlay').classList.remove('show');
        }
        
        function setTheme(theme) {
            document.body.className = 'theme-' + theme;
            if (androidAuto) document.body.classList.add('android-auto');
            localStorage.setItem('radioCedarTheme', theme);
            closeThemeSelector();
            
            // Update theme toggle color
            const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim();
            document.getElementById('themeToggle').style.borderColor = accent;
            document.getElementById('themeToggle').style.color = accent;
        }
        
        // Load saved theme
        const savedTheme = localStorage.getItem('radioCedarTheme');
        if (savedTheme) {
            document.body.className = 'theme-' + savedTheme;
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && current) {
                e.preventDefault();
                const a = document.getElementById('audio');
                a.paused ? a.play() : a.pause();
            }
        });
        ${extraScript}
    </script>
</body>
</html>`;
}

// Routes
app.get('/', async (req, res) => {
    const stations = await getRadioStations();
    const featured = stations[Math.floor(Math.random() * Math.min(5, stations.length))];
    
    res.send(page('Radio Cedar', `
        <div class="hero">
            <h1>RADIO<span class="sep">//</span>CEDAR</h1>
            <p>Lebanon's voice, wherever you are</p>
            
            <div class="region-selector">
                ${Object.entries(REGIONS).map(([id, name]) => `
                    <button class="region-btn" onclick="selectRegion('${id}', this)">${name}</button>
                `).join('')}
            </div>
            
            <div class="dial">
                <div class="dial-display">📻</div>
                <div class="dial-frequency" id="freq">--.- FM</div>
                <div class="dial-station" id="dialName">Tuning the dial...</div>
                <div class="dial-controls">
                    <button class="dial-btn" onclick="tune(-1)">◀</button>
                    <button class="dial-btn play" onclick="playDial()">▶</button>
                    <button class="dial-btn" onclick="tune(1)">▶</button>
                </div>
            </div>
            
            ${featured ? `
            <div class="card" style="max-width:350px;margin:1.5rem auto;text-align:center">
                <h3>Featured</h3>
                <p style="margin:0.5rem 0">${featured.name}</p>
                <p class="meta">${featured.bitrate}kbps · ${featured.language}</p>
                <button class="btn play" onclick="playRadio('${featured.url}','${featured.name.replace(/'/g,"\\'")}')">▶ Play</button>
            </div>
            ` : ''}
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;max-width:350px;margin:1.5rem auto">
                <a href="/radio" class="card" style="text-align:center">
                    <div style="font-size:2rem">📻</div>
                    <h3>Radio</h3>
                    <p class="meta">${stations.length} stations</p>
                </a>
                <a href="/tv" class="card" style="text-align:center">
                    <div style="font-size:2rem">📺</div>
                    <h3>TV</h3>
                    <p class="meta">6 channels</p>
                </a>
            </div>
        </div>
    `, `
        const dialStations = ${JSON.stringify(stations.slice(0, 25).map(s => ({ name: s.name, url: s.url })))};
        let idx = 0;
        
        function tune(dir) {
            idx = (idx + dir + dialStations.length) % dialStations.length;
            document.getElementById('freq').textContent = (88 + Math.floor(Math.random()*20)) + '.' + Math.floor(Math.random()*9) + ' FM';
            document.getElementById('dialName').textContent = dialStations[idx].name;
        }
        
        function playDial() {
            playRadio(dialStations[idx].url, dialStations[idx].name);
        }
        
        function selectRegion(id, el) {
            document.querySelectorAll('.region-btn').forEach(b => b.classList.remove('active'));
            el.classList.add('active');
            const times = {
                beirut: 'Asia/Beirut', dubai: 'Asia/Dubai', paris: 'Europe/Paris',
                sydney: 'Australia/Sydney', montreal: 'America/Toronto', nyc: 'America/New_York',
                london: 'Europe/London', saopaulo: 'America/Sao_Paulo'
            };
            document.querySelector('.hero p').textContent = 
                REGIONS[id] + ' · ' + new Date().toLocaleTimeString('en-US', {timeZone: times[id], hour:'2-digit', minute:'2-digit'});
        }
        
        tune(0);
    `));
});

app.get('/radio', async (req, res) => {
    const stations = await getRadioStations();
    
    res.send(page('Radio — Radio Cedar', `
        <div class="container">
            <h1>Radio Stations</h1>
            <p style="color:var(--muted);margin-bottom:1.5rem">${stations.length} live from Lebanon</p>
            <div class="grid">
                ${stations.map(s => `
                <div class="card">
                    <h3>${s.name}</h3>
                    <p class="meta">${s.bitrate}kbps · ${s.codec} · ${s.language}</p>
                    <div class="tags">
                        <span class="tag">Live</span>
                        <span class="tag">⭐ ${s.votes}</span>
                    </div>
                    <button class="btn play" onclick="playRadio('${s.url}','${s.name.replace(/'/g,"\\'")}')">▶ Tune In</button>
                </div>
                `).join('')}
            </div>
        </div>
    `));
});

app.get('/tv', (req, res) => {
    res.send(page('TV — Radio Cedar', `
        <div class="container">
            <h1>TV Channels</h1>
            <p style="color:var(--muted);margin-bottom:1.5rem">Live from Lebanon</p>
            <div class="tv-grid">
                ${TV_CHANNELS.map(c => `
                <div class="tv-card">
                    <iframe src="https://www.youtube.com/embed/live_stream?channel=${c.id}" allow="autoplay;encrypted-media" allowfullscreen loading="lazy"></iframe>
                    <div class="tv-info">
                        <h3>${c.name}</h3>
                        <a href="https://youtube.com/${c.handle}/live" target="_blank" class="btn">Watch on YouTube</a>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    `));
});

app.listen(PORT, () => console.log(`🌲 Radio Cedar live on port ${PORT}`));

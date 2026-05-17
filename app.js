/**
 * 🌊 NeonWave Radio — Hear the world glow.
 * Single-file world-class neon radio explorer
 * Dependencies: Three.js (CDN), SunCalc.js (CDN)
 */

// ============================================
// DATA
// ============================================
const CURRENT_LOCATION = {
    id: '0ZvvhvF9',
    name: 'Tyre',
    country: 'Lebanon',
    countryCode: 'LB',
    coordinates: { lat: 33.2704, lng: 35.2037 },
    timezone: 'Asia/Beirut'
};

const STATIONS = [
    { id: 'station_1', name: 'Sawt Al Farah FM', frequency: '104.3', streamUrl: 'https://radio.garden/api/ara/content/listen/0ZvvhvF9/channel.mp3', mood: 'balanced', genre: 'Arabic Music' },
    { id: 'station_2', name: 'Kol Hagalil Haelion FM', frequency: '105.3', streamUrl: 'https://radio.garden/api/ara/content/listen/anotherId/channel.mp3', mood: 'calm', genre: 'Regional Talk' },
    { id: 'station_3', name: 'TeenBuzz Radio', frequency: 'Online', streamUrl: 'https://radio.garden/api/ara/content/listen/teenbuzzId/channel.mp3', mood: 'energetic', genre: 'Pop & Hits' },
    { id: 'station_4', name: 'Radio Liban Libre', frequency: '102.5', streamUrl: 'https://radio.garden/api/ara/content/listen/libanlibreId/channel.mp3', mood: 'balanced', genre: 'News & Talk' }
];

const PICKS = [
    { id: 'pick_1', name: 'Sawt Al Farah FM', frequency: '104.3', location: 'Tyre', streamUrl: 'https://radio.garden/api/ara/content/listen/0ZvvhvF9/channel.mp3', mood: 'balanced' },
    { id: 'pick_2', name: 'Kol Hagalil Haelion FM', frequency: '105.3', location: 'Nearby', streamUrl: 'https://radio.garden/api/ara/content/listen/anotherId/channel.mp3', mood: 'calm' },
    { id: 'pick_3', name: 'Radio Kol Rega', frequency: 'Online', location: 'Beit Keshet', streamUrl: 'https://radio.garden/api/ara/content/listen/kolregaId/channel.mp3', mood: 'calm' },
    { id: 'pick_4', name: 'TeenBuzz Radio', frequency: 'Online', location: 'Karmiel', streamUrl: 'https://radio.garden/api/ara/content/listen/teenbuzzId/channel.mp3', mood: 'energetic' },
    { id: 'pick_5', name: 'Kol Galim FM', frequency: '106', location: 'Kfar Galim', streamUrl: 'https://radio.garden/api/ara/content/listen/kolgalimId/channel.mp3', mood: 'balanced' },
    { id: 'pick_6', name: 'VDL 100.5 FM', frequency: '100.5', location: 'Beirut', streamUrl: 'https://radio.garden/api/ara/content/listen/vdlId/channel.mp3', mood: 'energetic' },
    { id: 'pick_7', name: 'Sawt Kel Lebnen FM', frequency: '93.3', location: 'Dbayeh', streamUrl: 'https://radio.garden/api/ara/content/listen/sawtkelId/channel.mp3', mood: 'balanced' },
    { id: 'pick_8', name: 'Radio Joie', frequency: 'Online', location: 'Byblos', streamUrl: 'https://radio.garden/api/ara/content/listen/joieId/channel.mp3', mood: 'calm' }
];

const NEARBY_CITIES = [
    { name: "Ma'alot-Tarshiha", distance: 29, coordinates: { lat: 33.0167, lng: 35.2667 } },
    { name: 'Nes Ammim', distance: 35, coordinates: { lat: 32.9667, lng: 35.1167 } },
    { name: 'Amir', distance: 40, coordinates: { lat: 33.1167, lng: 35.6167 } },
    { name: 'Karmiel', distance: 40, coordinates: { lat: 32.9167, lng: 35.3000 } },
    { name: 'Kawkaba', distance: 43, coordinates: { lat: 33.2333, lng: 35.5833 } }
];

// ============================================
// NEON GLOBE (Three.js)
// ============================================
class NeonGlobe {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.globeGroup = null;
        this.markers = [];
        this.isDragging = false;
        this.previousMouse = { x: 0, y: 0 };
        this.rotationSpeed = 0.001;
        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.camera.position.z = 2.5;
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.createGlobe();
        this.addMarkers();
        this.addParticles();
        this.setupEvents();
        this.animate();
        setTimeout(() => {
            const loading = document.querySelector('.globe-loading');
            if (loading) loading.classList.add('hidden');
        }, 800);
    }

    createGlobe() {
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x1A1A2E, wireframe: true, transparent: true, opacity: 0.3 });
        const solidMaterial = new THREE.MeshBasicMaterial({ color: 0x0A0A14, transparent: true, opacity: 0.8 });
        const innerGlobe = new THREE.Mesh(geometry, solidMaterial);
        const wireGlobe = new THREE.Mesh(geometry, wireframeMaterial);
        this.globeGroup = new THREE.Group();
        this.globeGroup.add(innerGlobe);
        this.globeGroup.add(wireGlobe);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x1A1A2E, transparent: true, opacity: 0.2 });
        const equatorGeometry = new THREE.TorusGeometry(1.01, 0.002, 16, 100);
        const equator = new THREE.Mesh(equatorGeometry, ringMaterial);
        this.globeGroup.add(equator);
        const meridianGeometry = new THREE.TorusGeometry(1.01, 0.002, 16, 100);
        const meridian = new THREE.Mesh(meridianGeometry, ringMaterial);
        meridian.rotation.y = Math.PI / 2;
        this.globeGroup.add(meridian);
        this.scene.add(this.globeGroup);
    }

    addMarkers() {
        const tyrePos = this.latLngToVector3(33.2704, 35.2037);
        this.addMarker(tyrePos, 0xFF00E5, true);
        NEARBY_CITIES.forEach(city => {
            const pos = this.latLngToVector3(city.coordinates.lat, city.coordinates.lng);
            this.addMarker(pos, 0x00F0FF, false);
        });
    }

    addMarker(position, color, isActive) {
        const geometry = new THREE.SphereGeometry(0.015, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.9 });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(position);
        const ringGeometry = new THREE.TorusGeometry(0.022, 0.003, 16, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.6 });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        marker.add(ring);
        marker.userData = { isActive, baseColor: color, ring };
        this.globeGroup.add(marker);
        this.markers.push(marker);
    }

    addParticles() {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 200;
        const positions = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 4;
            positions[i + 1] = (Math.random() - 0.5) * 4;
            positions[i + 2] = (Math.random() - 0.5) * 4;
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particlesMaterial = new THREE.PointsMaterial({ color: 0x00F0FF, size: 0.005, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);
    }

    latLngToVector3(lat, lng) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        return new THREE.Vector3(-Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta));
    }

    setupEvents() {
        this.container.addEventListener('mousedown', (e) => { this.isDragging = true; this.previousMouse = { x: e.clientX, y: e.clientY }; });
        this.container.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            this.globeGroup.rotation.y += (e.clientX - this.previousMouse.x) * 0.005;
            this.globeGroup.rotation.x += (e.clientY - this.previousMouse.y) * 0.005;
            this.previousMouse = { x: e.clientX, y: e.clientY };
        });
        this.container.addEventListener('mouseup', () => { this.isDragging = false; });
        this.container.addEventListener('mouseleave', () => { this.isDragging = false; });
        this.container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) { this.isDragging = true; this.previousMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
        });
        this.container.addEventListener('touchmove', (e) => {
            if (!this.isDragging || e.touches.length !== 1) return;
            this.globeGroup.rotation.y += (e.touches[0].clientX - this.previousMouse.x) * 0.005;
            this.globeGroup.rotation.x += (e.touches[0].clientY - this.previousMouse.y) * 0.005;
            this.previousMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        });
        this.container.addEventListener('touchend', () => { this.isDragging = false; });
        window.addEventListener('resize', () => {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (!this.isDragging) this.globeGroup.rotation.y += this.rotationSpeed;
        this.markers.forEach(marker => {
            if (marker.userData.isActive) {
                const scale = 1 + Math.sin(Date.now() * 0.005) * 0.3;
                marker.scale.setScalar(scale);
                marker.userData.ring.scale.setScalar(1 + Math.sin(Date.now() * 0.005 + Math.PI) * 0.2);
            }
        });
        if (this.particles) { this.particles.rotation.y += 0.0002; this.particles.rotation.x += 0.0001; }
        this.renderer.render(this.scene, this.camera);
    }

    flyTo(lat, lng) {
        const pos = this.latLngToVector3(lat, lng);
        const angleY = Math.atan2(pos.x, pos.z);
        const targetRotationY = -angleY;
        const startRotationY = this.globeGroup.rotation.y;
        const duration = 1000;
        const startTime = Date.now();
        const animateFly = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            this.globeGroup.rotation.y = startRotationY + (targetRotationY - startRotationY) * eased;
            if (progress < 1) requestAnimationFrame(animateFly);
        };
        animateFly();
    }
}

// ============================================
// AUDIO MANAGER
// ============================================
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.analyserNode = null;
        this.audioElement = null;
        this.currentStation = null;
        this.isPlaying = false;
        this.visualizerBars = [];
        this.animationId = null;
        this.init();
    }

    init() {
        const container = document.getElementById('visualizerBars');
        const barCount = 40;
        for (let i = 0; i < barCount; i++) {
            const bar = document.createElement('div');
            bar.className = 'visualizer-bar';
            bar.style.height = '3px';
            container.appendChild(bar);
            this.visualizerBars.push(bar);
        }
    }

    async play(station) {
        if (this.currentStation?.id === station.id && this.isPlaying) { this.stop(); return; }
        this.stop();
        try {
            if (!this.audioContext) this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioElement = new Audio();
            this.audioElement.crossOrigin = 'anonymous';
            const source = this.audioContext.createMediaElementSource(this.audioElement);
            this.analyserNode = this.audioContext.createAnalyser();
            this.analyserNode.fftSize = 128;
            source.connect(this.analyserNode);
            this.analyserNode.connect(this.audioContext.destination);
            this.audioElement.src = station.streamUrl;
            await this.audioElement.play();
            this.currentStation = station;
            this.isPlaying = true;
            this.updateNowPlaying(station);
            this.startVisualization();
        } catch (error) {
            console.warn('Audio playback failed, using simulation:', error);
            this.simulateVisualization();
            this.isPlaying = true;
            this.currentStation = station;
            this.updateNowPlaying(station);
        }
    }

    stop() {
        if (this.audioElement) { this.audioElement.pause(); this.audioElement.src = ''; this.audioElement = null; }
        if (this.analyserNode) { this.analyserNode.disconnect(); this.analyserNode = null; }
        this.isPlaying = false;
        this.currentStation = null;
        this.stopVisualization();
        this.resetVisualizerBars();
        this.clearNowPlaying();
    }

    startVisualization() {
        if (!this.analyserNode) { this.simulateVisualization(); return; }
        const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
        const update = () => {
            if (!this.isPlaying) return;
            this.analyserNode.getByteFrequencyData(dataArray);
            const step = Math.floor(dataArray.length / this.visualizerBars.length);
            this.visualizerBars.forEach((bar, i) => {
                const value = dataArray[i * step] || 0;
                const height = (value / 255) * 30 + 3;
                bar.style.height = `${height}px`;
                if (value > 128) bar.classList.add('active'); else bar.classList.remove('active');
            });
            this.animationId = requestAnimationFrame(update);
        };
        update();
    }

    simulateVisualization() {
        const update = () => {
            if (!this.isPlaying) return;
            this.visualizerBars.forEach(bar => {
                const height = Math.random() * 25 + 3;
                bar.style.height = `${height}px`;
                if (Math.random() > 0.6) bar.classList.add('active'); else bar.classList.remove('active');
            });
            this.animationId = requestAnimationFrame(update);
        };
        update();
    }

    stopVisualization() { if (this.animationId) { cancelAnimationFrame(this.animationId); this.animationId = null; } }
    resetVisualizerBars() { this.visualizerBars.forEach(bar => { bar.style.height = '3px'; bar.classList.remove('active'); }); }

    updateNowPlaying(station) {
        const dot = document.querySelector('.np-dot');
        const text = document.querySelector('.np-text');
        if (dot) dot.classList.add('playing');
        if (text) text.textContent = station.name;
    }

    clearNowPlaying() {
        const dot = document.querySelector('.np-dot');
        const text = document.querySelector('.np-text');
        if (dot) dot.classList.remove('playing');
        if (text) text.textContent = 'Select a station';
    }
}

// ============================================
// UI MANAGER
// ============================================
class UIManager {
    constructor(audioManager, globeInstance) {
        this.audioManager = audioManager;
        this.globe = globeInstance;
        this.currentMood = 'balanced';
        this.activeStationCard = null;
        this.init();
    }

    init() {
        this.renderStations();
        this.renderNearbyCities();
        this.setupMoodFilter();
        this.setupGoToLebanon();
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }

    renderStations() {
        const container = document.getElementById('stationsList');
        if (!container) return;
        container.innerHTML = '';
        const filteredPicks = this.currentMood === 'balanced' ? PICKS : PICKS.filter(s => s.mood === this.currentMood);
        filteredPicks.forEach(station => {
            const card = document.createElement('div');
            card.className = 'station-card';
            card.dataset.stationId = station.id;
            card.innerHTML = `
                <span class="station-play-indicator"></span>
                <span class="station-name">${station.name}</span>
                <span class="station-frequency">${station.frequency} FM</span>
            `;
            card.addEventListener('click', () => this.selectStation(station, card));
            container.appendChild(card);
        });
    }

    renderNearbyCities() {
        const container = document.getElementById('nearbyList');
        if (!container) return;
        container.innerHTML = '';
        NEARBY_CITIES.forEach(city => {
            const chip = document.createElement('div');
            chip.className = 'city-chip';
            chip.innerHTML = `<span>${city.name}</span><span class="distance">${city.distance} km</span>`;
            chip.addEventListener('click', () => {
                this.globe.flyTo(city.coordinates.lat, city.coordinates.lng);
                chip.style.borderColor = 'var(--magenta)';
                setTimeout(() => { chip.style.borderColor = 'var(--wireframe)'; }, 600);
            });
            container.appendChild(chip);
        });
    }

    selectStation(station, card) {
        if (this.activeStationCard) this.activeStationCard.classList.remove('playing');
        card.classList.add('playing');
        this.activeStationCard = card;
        this.audioManager.play(station);
    }

    setupMoodFilter() {
        const moodButtons = document.querySelectorAll('.mood-btn');
        moodButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                moodButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentMood = btn.dataset.mood;
                this.renderStations();
            });
        });
    }

    setupGoToLebanon() {
        const button = document.querySelector('.go-to-area');
        if (!button) return;
        button.addEventListener('click', () => {
            this.globe.flyTo(33.8547, 35.8623);
            button.style.background = 'rgba(255, 0, 229, 0.2)';
            setTimeout(() => { button.style.background = 'transparent'; }, 600);
        });
    }

    updateTime() {
        const now = new Date();
        const tyreTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Beirut' }));
        const hours = tyreTime.getHours().toString().padStart(2, '0');
        const minutes = tyreTime.getMinutes().toString().padStart(2, '0');
        const timeDisplay = document.querySelector('.time-display');
        if (timeDisplay) timeDisplay.textContent = `${hours}:${minutes}`;
    }
}

// ============================================
// APP INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const globe = new NeonGlobe('globeContainer');
    const audioManager = new AudioManager();
    const uiManager = new UIManager(audioManager, globe);
    window.neonWave = { globe, audioManager, uiManager };
    console.log('🌊 NeonWave Radio initialized — Hear the world glow.');
});

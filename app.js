/**
 * 🌊 NeonWave Radio — Hear the world glow.
 * Fixed version with proper Three.js r128 compatibility
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
// SAFE DOM HELPER
// ============================================
function safeGetElement(id) {
    const el = document.getElementById(id);
    if (!el) console.warn(`Element #${id} not found`);
    return el;
}

// ============================================
// NEON GLOBE (Three.js r128 compatible)
// ============================================
class NeonGlobe {
    constructor(containerId) {
        this.container = safeGetElement(containerId);
        if (!this.container) {
            console.error('Globe container not found');
            return;
        }
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.globeGroup = null;
        this.markers = [];
        this.particles = null;
        this.isDragging = false;
        this.previousMouse = { x: 0, y: 0 };
        this.rotationSpeed = 0.001;
        this.animationId = null;
        this.init();
    }

    init() {
        try {
            // Scene
            this.scene = new THREE.Scene();
            
            // Camera
            const aspect = this.container.clientWidth / (this.container.clientHeight || 1);
            this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
            this.camera.position.z = 2.5;
            
            // Renderer
            this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.domElement.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
            this.container.appendChild(this.renderer.domElement);
            
            // Build globe
            this.createGlobe();
            this.addMarkers();
            this.addParticles();
            this.setupEvents();
            this.animate();
            
            // Hide loading
            const loading = document.querySelector('.globe-loading');
            if (loading) setTimeout(() => loading.classList.add('hidden'), 600);
            
            console.log('🌍 Globe initialized');
        } catch (error) {
            console.error('Globe init error:', error);
            const loading = document.querySelector('.globe-loading');
            if (loading) {
                loading.innerHTML = '<p style="color:#FF00E5">Globe failed to load</p>';
            }
        }
    }

    createGlobe() {
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x1A1A2E,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        
        const solidMaterial = new THREE.MeshBasicMaterial({
            color: 0x0A0A14,
            transparent: true,
            opacity: 0.8
        });
        
        const innerGlobe = new THREE.Mesh(geometry, solidMaterial);
        const wireGlobe = new THREE.Mesh(geometry, wireframeMaterial);
        
        this.globeGroup = new THREE.Group();
        this.globeGroup.add(innerGlobe);
        this.globeGroup.add(wireGlobe);
        
        // Grid rings
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x1A1A2E,
            transparent: true,
            opacity: 0.2
        });
        
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
        if (!CURRENT_LOCATION.coordinates) return;
        const tyrePos = this.latLngToVector3(CURRENT_LOCATION.coordinates.lat, CURRENT_LOCATION.coordinates.lng);
        this.addMarker(tyrePos, 0xFF00E5, true);
        
        NEARBY_CITIES.forEach(city => {
            if (city.coordinates) {
                const pos = this.latLngToVector3(city.coordinates.lat, city.coordinates.lng);
                this.addMarker(pos, 0x00F0FF, false);
            }
        });
    }

    addMarker(position, color, isActive) {
        const geometry = new THREE.SphereGeometry(0.015, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9
        });
        
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(position);
        
        const ringGeometry = new THREE.TorusGeometry(0.022, 0.003, 16, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.6
        });
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
        
        const particlesMaterial = new THREE.PointsMaterial({
            color: 0x00F0FF,
            size: 0.005,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);
    }

    latLngToVector3(lat, lng) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        
        const x = -Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);
        
        return new THREE.Vector3(x, y, z);
    }

    setupEvents() {
        if (!this.container) return;
        
        this.container.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.previousMouse = { x: e.clientX, y: e.clientY };
        });
        
        this.container.addEventListener('mousemove', (e) => {
            if (!this.isDragging || !this.globeGroup) return;
            const deltaX = e.clientX - this.previousMouse.x;
            const deltaY = e.clientY - this.previousMouse.y;
            this.globeGroup.rotation.y += deltaX * 0.005;
            this.globeGroup.rotation.x += deltaY * 0.005;
            this.previousMouse = { x: e.clientX, y: e.clientY };
        });
        
        this.container.addEventListener('mouseup', () => { this.isDragging = false; });
        this.container.addEventListener('mouseleave', () => { this.isDragging = false; });
        
        this.container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.isDragging = true;
                this.previousMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        });
        
        this.container.addEventListener('touchmove', (e) => {
            if (!this.isDragging || e.touches.length !== 1 || !this.globeGroup) return;
            const deltaX = e.touches[0].clientX - this.previousMouse.x;
            const deltaY = e.touches[0].clientY - this.previousMouse.y;
            this.globeGroup.rotation.y += deltaX * 0.005;
            this.globeGroup.rotation.x += deltaY * 0.005;
            this.previousMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        });
        
        this.container.addEventListener('touchend', () => { this.isDragging = false; });
        
        window.addEventListener('resize', () => {
            if (!this.camera || !this.renderer || !this.container) return;
            this.camera.aspect = this.container.clientWidth / (this.container.clientHeight || 1);
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (!this.globeGroup || !this.renderer || !this.scene || !this.camera) return;
        
        if (!this.isDragging) {
            this.globeGroup.rotation.y += this.rotationSpeed;
        }
        
        // Pulse active markers
        const time = Date.now() * 0.005;
        this.markers.forEach(marker => {
            if (marker.userData && marker.userData.isActive) {
                const scale = 1 + Math.sin(time) * 0.3;
                marker.scale.setScalar(scale);
                if (marker.userData.ring) {
                    marker.userData.ring.scale.setScalar(1 + Math.sin(time + Math.PI) * 0.2);
                }
            }
        });
        
        // Rotate particles
        if (this.particles) {
            this.particles.rotation.y += 0.0002;
            this.particles.rotation.x += 0.0001;
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    flyTo(lat, lng) {
        if (!this.globeGroup) return;
        
        const pos = this.latLngToVector3(lat, lng);
        const angleY = Math.atan2(pos.x, pos.z);
        const targetRotationY = -angleY;
        const startRotationY = this.globeGroup.rotation.y;
        const duration = 1000;
        const startTime = Date.now();
        
        const animateFly = () => {
            if (!this.globeGroup) return;
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            this.globeGroup.rotation.y = startRotationY + (targetRotationY - startRotationY) * eased;
            if (progress < 1) {
                requestAnimationFrame(animateFly);
            }
        };
        
        animateFly();
    }

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
    }
}

// ============================================
// AUDIO MANAGER (Safe version)
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
        const container = safeGetElement('visualizerBars');
        if (!container) return;
        
        const barCount = 40;
        container.innerHTML = '';
        
        for (let i = 0; i < barCount; i++) {
            const bar = document.createElement('div');
            bar.className = 'visualizer-bar';
            bar.style.height = '3px';
            container.appendChild(bar);
            this.visualizerBars.push(bar);
        }
    }

    async play(station) {
        // Toggle if same station
        if (this.currentStation && this.currentStation.id === station.id && this.isPlaying) {
            this.stop();
            return;
        }
        
        this.stop();
        
        try {
            // Initialize AudioContext on user interaction
            if (!this.audioContext) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) throw new Error('Web Audio API not supported');
                this.audioContext = new AudioCtx();
            }
            
            // Resume if suspended (autoplay policy)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Create audio element
            this.audioElement = new Audio();
            this.audioElement.crossOrigin = 'anonymous';
            
            // Create analyser
            this.analyserNode = this.audioContext.createAnalyser();
            this.analyserNode.fftSize = 128;
            
            // Connect audio element to analyser
            const source = this.audioContext.createMediaElementSource(this.audioElement);
            source.connect(this.analyserNode);
            this.analyserNode.connect(this.audioContext.destination);
            
            // Set source and play
            this.audioElement.src = station.streamUrl;
            await this.audioElement.play();
            
            this.currentStation = station;
            this.isPlaying = true;
            this.updateNowPlaying(station);
            this.startRealVisualization();
            
        } catch (error) {
            console.warn('Audio playback unavailable, using simulation:', error.message);
            // Fallback to simulation
            this.audioElement = null;
            this.analyserNode = null;
            this.isPlaying = true;
            this.currentStation = station;
            this.updateNowPlaying(station);
            this.startSimulatedVisualization();
        }
    }

    stop() {
        // Stop and clean up audio element
        if (this.audioElement) {
            try {
                this.audioElement.pause();
                this.audioElement.src = '';
                this.audioElement.load();
            } catch (e) { /* ignore */ }
            this.audioElement = null;
        }
        
        // Disconnect analyser
        if (this.analyserNode) {
            try { this.analyserNode.disconnect(); } catch (e) { /* ignore */ }
            this.analyserNode = null;
        }
        
        this.isPlaying = false;
        this.currentStation = null;
        this.stopVisualization();
        this.resetBars();
        this.clearNowPlaying();
    }

    startRealVisualization() {
        if (!this.analyserNode) return;
        this.stopVisualization();
        
        const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
        const bars = this.visualizerBars;
        const step = Math.max(1, Math.floor(dataArray.length / bars.length));
        
        const update = () => {
            if (!this.isPlaying || !this.analyserNode) return;
            
            try {
                this.analyserNode.getByteFrequencyData(dataArray);
                
                bars.forEach((bar, i) => {
                    const value = dataArray[i * step] || 0;
                    const height = (value / 255) * 30 + 3;
                    bar.style.height = `${height}px`;
                    
                    if (value > 128) {
                        bar.classList.add('active');
                    } else {
                        bar.classList.remove('active');
                    }
                });
            } catch (e) {
                // Fallback to simulation on error
                this.startSimulatedVisualization();
                return;
            }
            
            this.animationId = requestAnimationFrame(update);
        };
        
        update();
    }

    startSimulatedVisualization() {
        this.stopVisualization();
        const bars = this.visualizerBars;
        
        const update = () => {
            if (!this.isPlaying) return;
            
            bars.forEach(bar => {
                const height = Math.random() * 25 + 3;
                bar.style.height = `${height}px`;
                
                if (Math.random() > 0.6) {
                    bar.classList.add('active');
                } else {
                    bar.classList.remove('active');
                }
            });
            
            this.animationId = requestAnimationFrame(update);
        };
        
        update();
    }

    stopVisualization() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resetBars() {
        this.visualizerBars.forEach(bar => {
            bar.style.height = '3px';
            bar.classList.remove('active');
        });
    }

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
        this.timeInterval = setInterval(() => this.updateTime(), 1000);
    }

    renderStations() {
        const container = safeGetElement('stationsList');
        if (!container) return;
        container.innerHTML = '';
        
        const filteredPicks = this.currentMood === 'balanced'
            ? PICKS
            : PICKS.filter(s => s.mood === this.currentMood);
        
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
        const container = safeGetElement('nearbyList');
        if (!container) return;
        container.innerHTML = '';
        
        NEARBY_CITIES.forEach(city => {
            const chip = document.createElement('div');
            chip.className = 'city-chip';
            chip.innerHTML = `<span>${city.name}</span><span class="distance">${city.distance} km</span>`;
            
            chip.addEventListener('click', () => {
                if (this.globe && city.coordinates) {
                    this.globe.flyTo(city.coordinates.lat, city.coordinates.lng);
                }
                chip.style.borderColor = 'var(--magenta)';
                setTimeout(() => {
                    chip.style.borderColor = '';
                }, 600);
            });
            
            container.appendChild(chip);
        });
    }

    selectStation(station, card) {
        if (this.activeStationCard) {
            this.activeStationCard.classList.remove('playing');
        }
        card.classList.add('playing');
        this.activeStationCard = card;
        
        if (this.audioManager) {
            this.audioManager.play(station);
        }
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
            if (this.globe) {
                this.globe.flyTo(33.8547, 35.8623);
            }
            button.style.background = 'rgba(255, 0, 229, 0.2)';
            setTimeout(() => {
                button.style.background = '';
            }, 600);
        });
    }

    updateTime() {
        try {
            const now = new Date();
            const tyreTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Beirut' }));
            const hours = tyreTime.getHours().toString().padStart(2, '0');
            const minutes = tyreTime.getMinutes().toString().padStart(2, '0');
            const timeDisplay = document.querySelector('.time-display');
            if (timeDisplay) timeDisplay.textContent = `${hours}:${minutes}`;
        } catch (e) {
            // Fallback to local time
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const timeDisplay = document.querySelector('.time-display');
            if (timeDisplay) timeDisplay.textContent = `${hours}:${minutes}`;
        }
    }
}

// ============================================
// APP INITIALIZATION (Safe)
// ============================================
function initApp() {
    console.log('🌊 Starting NeonWave Radio...');
    
    try {
        // Check if Three.js loaded
        if (typeof THREE === 'undefined') {
            throw new Error('Three.js not loaded. Check CDN connection.');
        }
        
        // Initialize components
        const globe = new NeonGlobe('globeContainer');
        const audioManager = new AudioManager();
        const uiManager = new UIManager(audioManager, globe);
        
        // Expose for debugging
        window.neonWave = { globe, audioManager, uiManager };
        
        console.log('✅ NeonWave Radio ready — Hear the world glow.');
        console.log('💡 Click a station card to start listening.');
        
    } catch (error) {
        console.error('❌ NeonWave init failed:', error.message);
        
        // Show error in UI
        const loading = document.querySelector('.globe-loading');
        if (loading) {
            loading.innerHTML = `
                <p style="color:#FF00E5;font-size:16px;">⚠️ Failed to load</p>
                <p style="color:#E0F0FF;font-size:12px;">${error.message}</p>
                <p style="color:#00F0FF;font-size:11px;">Check console for details</p>
            `;
        }
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

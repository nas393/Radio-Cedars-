/* Room sounds, all made here with Web Audio (no recordings to download):
   the wall clock, rain on the glass, the kettle on the sobia in winter, crickets
   at night, cicadas on summer afternoons, the generator during a power cut.
   Off until switched on; quieter whenever the radio or a tape is playing. */
(() => {
  'use strict';
  const S = window.Sawt;
  let ctx = null, master = null, on = false, layers = null, timer = null;

  function noiseBuffer(seconds = 2, pink = true) {
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (pink) { b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0526; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.18; }
      else d[i] = w * 0.5;
    }
    return buf;
  }
  function loop(buf) { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(); return s; }
  function gain(v, to = master) { const g = ctx.createGain(); g.gain.value = v; g.connect(to); return g; }

  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const pink = noiseBuffer(3, true), white = noiseBuffer(2, false);

    // rain: soft pink noise through a lowpass, plus a few drops
    const rain = gain(0);
    const rf = ctx.createBiquadFilter(); rf.type = 'lowpass'; rf.frequency.value = 1600; rf.connect(rain);
    loop(pink).connect(rf);

    // kettle simmer: band-passed noise breathing slowly
    const kettle = gain(0);
    const kf = ctx.createBiquadFilter(); kf.type = 'bandpass'; kf.frequency.value = 2400; kf.Q.value = 0.8; kf.connect(kettle);
    const kAmp = ctx.createGain(); kAmp.gain.value = 0.5; kAmp.connect(kf);
    loop(white).connect(kAmp);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.18; const lfoG = ctx.createGain(); lfoG.gain.value = 0.35;
    lfo.connect(lfoG); lfoG.connect(kAmp.gain); lfo.start();

    // cicadas: buzzy high noise, pulsing
    const cicada = gain(0);
    const cf = ctx.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 5200; cf.Q.value = 6; cf.connect(cicada);
    const cAmp = ctx.createGain(); cAmp.gain.value = 0.5; cAmp.connect(cf);
    loop(white).connect(cAmp);
    const clfo = ctx.createOscillator(); clfo.frequency.value = 38; const clfoG = ctx.createGain(); clfoG.gain.value = 0.5;
    clfo.connect(clfoG); clfoG.connect(cAmp.gain); clfo.start();

    // the generator: a low hum with a rattle
    const motor = gain(0);
    const m1 = ctx.createOscillator(); m1.type = 'sawtooth'; m1.frequency.value = 50;
    const mf = ctx.createBiquadFilter(); mf.type = 'lowpass'; mf.frequency.value = 220; m1.connect(mf); mf.connect(motor); m1.start();
    const rattle = ctx.createBiquadFilter(); rattle.type = 'bandpass'; rattle.frequency.value = 140; rattle.Q.value = 2; loop(white).connect(rattle);
    const rg = ctx.createGain(); rg.gain.value = 0.25; rattle.connect(rg); rg.connect(motor);

    // street / sea air in the day
    const air = gain(0);
    const af = ctx.createBiquadFilter(); af.type = 'lowpass'; af.frequency.value = 500; af.connect(air);
    loop(pink).connect(af);

    // the heater: a soft roar for a wood fire, a hum or a hiss for the others
    const fire = gain(0);
    const ff = ctx.createBiquadFilter(); ff.type = 'lowpass'; ff.frequency.value = 420; ff.connect(fire);
    loop(pink).connect(ff);
    const hum = gain(0);
    const h1 = ctx.createOscillator(); h1.type = 'sine'; h1.frequency.value = 100;
    const hf = ctx.createBiquadFilter(); hf.type = 'bandpass'; hf.frequency.value = 2800; hf.Q.value = 0.6;
    const hn = ctx.createGain(); hn.gain.value = 0.35; loop(white).connect(hf); hf.connect(hn); hn.connect(hum);
    const h1g = ctx.createGain(); h1g.gain.value = 0.25; h1.connect(h1g); h1g.connect(hum); h1.start();
    // summer: the ceiling fan or the AC
    const fan = gain(0);
    const fnf = ctx.createBiquadFilter(); fnf.type = 'lowpass'; fnf.frequency.value = 260; fnf.connect(fan);
    loop(pink).connect(fnf);

    layers = { rain, kettle, cicada, motor, air, fire, hum, fan, ticks: 0, crickets: 0, last: 0, tock: false };
  }

  function click(freq, len, vol) {
    const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = freq;
    const g = ctx.createGain(); const t = ctx.currentTime;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 4;
    o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + len + 0.02);
  }
  function chirp() {                       // one cricket chirp: three quick pulses
    const t0 = ctx.currentTime;
    for (let k = 0; k < 3; k++) {
      const o = ctx.createOscillator(); o.frequency.value = 4400 + Math.random() * 200;
      const g = ctx.createGain(); const t = t0 + k * 0.045;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.05, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.05);
    }
  }
  function drop() {
    const o = ctx.createOscillator(); o.type = 'sine';
    const t = ctx.currentTime, f = 900 + Math.random() * 1600;
    o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.05);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.03, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.08);
  }

  // thunder: a crack for a near strike, then a long low rumble that rolls away
  let brown = null;
  function thunder(delay = 1, power = 1) {
    if (!on || !ctx) return;
    if (!brown) {
      const len = ctx.sampleRate * 6; brown = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = brown.getChannelData(0); let last = 0;
      for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.2; }
    }
    const t0 = ctx.currentTime + delay;
    const out = ctx.createGain(); out.gain.value = 0; out.connect(master);
    if (power > 0.75) {                                    // close: the crack
      const s = ctx.createBufferSource(); s.buffer = brown;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 300;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.9 * power, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
      s.connect(hp); hp.connect(g); g.connect(master); s.start(t0, Math.random() * 2); s.stop(t0 + 0.6);
    }
    const r = ctx.createBufferSource(); r.buffer = brown; r.playbackRate.value = 0.6 + Math.random() * 0.2;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 140 + power * 160;
    r.connect(lp); lp.connect(out);
    const dur = 3.5 + Math.random() * 3;
    out.gain.setValueAtTime(0.0001, t0);
    out.gain.linearRampToValueAtTime(1.6 * power, t0 + 0.25);
    for (let k = 1; k < 7; k++) out.gain.linearRampToValueAtTime((0.5 + Math.random() * 0.9) * power * (1 - k / 8), t0 + 0.25 + k * dur / 8);
    out.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    r.start(t0, Math.random() * 2); r.stop(t0 + dur + 0.1);
  }
  document.addEventListener('sawt:thunder', e => { const d = e.detail || {}; thunder(d.delay, d.power); });

  // a crackle: a tiny dry burst of noise
  function crackle(vol = 0.08) {
    const s = ctx.createBufferSource(); s.buffer = layers.whiteBuf || (layers.whiteBuf = noiseBuffer(0.3, false));
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1800 + Math.random() * 2500;
    const g = ctx.createGain(); const t = ctx.currentTime + Math.random() * 0.9;
    g.gain.setValueAtTime(vol * (0.4 + Math.random()), t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.02 + Math.random() * 0.05);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 0.2); s.stop(t + 0.1);
  }
  // tapping the heater: a match strike, or a switch
  let tapCtx = null;
  document.addEventListener('sawt:heat-tap', e => {
    const d = e.detail || {};
    try {
      const c = ctx || (tapCtx = tapCtx || new (window.AudioContext || window.webkitAudioContext)());
      c.resume();
      const t = c.currentTime;
      if (d.kind === 'electric' || d.kind === 'radiator') {
        const o = c.createOscillator(); o.type = 'square'; o.frequency.value = 1800;
        const g = c.createGain(); g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
        o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.04);
      } else if (d.on) {
        const len = c.sampleRate * 0.6, b = c.createBuffer(1, len, c.sampleRate), x = b.getChannelData(0);
        for (let i = 0; i < len; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
        const s = c.createBufferSource(); s.buffer = b;
        const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 0.7;
        const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.5, t + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
        s.connect(f); f.connect(g); g.connect(c.destination); s.start(t);
        const s2 = c.createBufferSource(); s2.buffer = b; const f2 = c.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = 300;
        const g2 = c.createGain(); g2.gain.setValueAtTime(0.0001, t + 0.15); g2.gain.linearRampToValueAtTime(0.35, t + 0.4); g2.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
        s2.connect(f2); f2.connect(g2); g2.connect(c.destination); s2.start(t + 0.15);
      } else {
        const len = c.sampleRate * 0.5, b = c.createBuffer(1, len, c.sampleRate), x = b.getChannelData(0);
        for (let i = 0; i < len; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
        const g = c.createGain(); g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
        s.connect(f); f.connect(g); g.connect(c.destination); s.start(t);
      }
    } catch { /* no sound */ }
  });

  function busy() {                        // something else is playing: keep the room quiet under it
    const a = document.getElementById('audio');
    const radio = a && !a.paused;
    const tape = window.SawtScreen && window.SawtScreen.current();
    return radio || tape;
  }

  function tick() {
    if (!on || !ctx) return;
    const R = window.SawtRoom;
    const scene = R ? R.scene() : 'day';
    const rain = R ? R.rain() : 0;
    const motor = R ? R.motor() : 0;
    const t = ctx.currentTime;
    const set = (g, v) => g.gain.setTargetAtTime(v, t, 0.6);
    set(master, busy() ? 0.25 : 0.9);
    set(layers.rain, rain * 1.4);
    const mood = R && R.mood ? R.mood() : 'clear';
    const cold = mood === 'winter' || mood === 'grey';
    set(layers.kettle, scene !== 'day' && cold ? 0.05 : 0);
    set(layers.cicada, (R && R.summer && R.summer()) && scene !== 'night' ? 0.045 : 0);
    set(layers.motor, motor * 0.12);
    set(layers.air, scene === 'day' ? 0.08 : (scene === 'sunset' ? 0.05 : 0.02));
    const ht = R && R.heat ? R.heat() : { level: 0, kind: null };
    const fireLike = ht.kind === 'fire' || ht.kind === 'kerosene';
    set(layers.fire, fireLike ? ht.level * (ht.kind === 'fire' ? 0.22 : 0.08) : 0);
    set(layers.hum, !fireLike && ht.kind ? ht.level * (ht.kind === 'gas' ? 0.05 : 0.025) : 0);
    if (ht.kind === 'fire' && ht.level > 0.3) for (let k = 0; k < 4; k++) crackle(0.07 * ht.level);
    const hot = R && R.summer ? R.summer() : 0;
    set(layers.fan, hot * 0.07);
    // the clock: tick, tock
    layers.tock = !layers.tock;
    click(layers.tock ? 2600 : 2100, 0.03, 0.06);
    if (scene === 'night' && !cold && Math.random() < 0.55) setTimeout(chirp, Math.random() * 600);
    if (rain > 0.1) for (let k = 0; k < Math.round(rain * 3); k++) setTimeout(drop, Math.random() * 1000);
  }

  function setOn(v) {
    on = v;
    S.store.set('roomSounds', on);
    if (on) {
      if (!ctx) build();
      ctx.resume();
      master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.8);
      clearInterval(timer); timer = setInterval(tick, 1000); tick();
    } else if (ctx) {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      clearInterval(timer);
      setTimeout(() => { if (!on && ctx) ctx.suspend(); }, 1200);
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (on) ctx.resume();
  });

  window.SawtAmbience = { on: () => on, toggle: () => setOn(!on) };
  // A remembered "on" waits for the first tap (browsers need a gesture to start sound).
  if (S.store.get('roomSounds', false)) {
    const first = () => { document.removeEventListener('pointerdown', first); setOn(true); };
    document.addEventListener('pointerdown', first);
  }
})();

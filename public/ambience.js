/* Room sounds, all made here with Web Audio (no recordings to download):
   the wall clock, rain on the glass, the kettle on the sobia, crickets on a
   summer night, cicadas in the summer afternoon, the generator during a power cut.
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

    layers = { rain, kettle, cicada, motor, air, ticks: 0, crickets: 0, last: 0, tock: false };
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
    set(layers.rain, rain * 0.9);
    set(layers.kettle, (scene === 'night' || scene === 'winter') ? 0.05 : 0);
    set(layers.cicada, scene === 'summer' ? 0.035 : 0);
    set(layers.motor, motor * 0.12);
    set(layers.air, scene === 'day' ? 0.08 : (scene === 'summer' ? 0.05 : 0.02));
    // the clock: tick, tock
    layers.tock = !layers.tock;
    click(layers.tock ? 2600 : 2100, 0.03, 0.06);
    if (scene === 'night' && Math.random() < 0.55) setTimeout(chirp, Math.random() * 600);
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

/* A small voice recorder shared by the voice dedications and the family rooms. */
(() => {
  'use strict';
  const S = window.Sawt;
  function pickMime() {
    if (!window.MediaRecorder) return null;
    for (const m of ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm']) {
      try { if (MediaRecorder.isTypeSupported(m)) return m; } catch { /* old */ }
    }
    return '';
  }
  // start(onTick(seconds, level), max) -> Promise of a handle with stop() -> Promise<{ blob, mime, seconds }>
  async function start(onTick, max = 60) {
    const m = pickMime();
    if (m === null || !navigator.mediaDevices) throw Object.assign(new Error('norec'), { code: 'norec' });
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
    catch { throw Object.assign(new Error('nomic'), { code: 'nomic' }); }
    if (S.isOn && S.isOn()) S.setPower(false);
    if (window.SawtScreen && window.SawtScreen.current()) window.SawtScreen.close();
    const chunks = [];
    const rec = new MediaRecorder(stream, m ? { mimeType: m, audioBitsPerSecond: 32000 } : { audioBitsPerSecond: 32000 });
    const mime = rec.mimeType || m || 'audio/webm';
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    let analyser = null, ac = null;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); const src = ac.createMediaStreamSource(stream); analyser = ac.createAnalyser(); analyser.fftSize = 512; src.connect(analyser); } catch { analyser = null; }
    const t0 = Date.now();
    let done = null;
    const finished = new Promise(res => { done = res; });
    rec.onstop = () => {
      stream.getTracks().forEach(tr => tr.stop());
      if (ac) ac.close().catch(() => {});
      done({ blob: new Blob(chunks, { type: mime }), mime, seconds: (Date.now() - t0) / 1000 });
    };
    rec.start(250);
    const timer = setInterval(() => {
      const s = (Date.now() - t0) / 1000;
      let level = 0;
      if (analyser) { const a = new Uint8Array(analyser.fftSize); analyser.getByteTimeDomainData(a); let m2 = 0; for (const v of a) m2 = Math.max(m2, Math.abs(v - 128)); level = Math.min(1, m2 / 60); }
      if (onTick) onTick(s, level);
      if (s >= max) handle.stop();
    }, 100);
    const handle = { stop() { clearInterval(timer); if (rec.state !== 'inactive') rec.stop(); return finished; }, done: finished };
    return handle;
  }
  const toB64 = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = rej; r.readAsDataURL(b); });
  window.SawtRec = { start, toB64, supported: () => pickMime() !== null && !!navigator.mediaDevices };
})();

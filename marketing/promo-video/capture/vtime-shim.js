// Jam maya untuk rakaman bingkai demi bingkai (gaya timesnap): masa halaman hanya bergerak bila
// window.__advance(ms) dipanggil, jadi setiap bingkai 1080×2236 ditangkap tepat pada 1/30 s
// walaupun render perisian (SwiftShader) perlahan. Hanya bingkai utama (bukan iframe).
(() => {
  if (window !== window.top) return;
  const oST = window.setTimeout.bind(window);
  const ODate = Date;
  const base = ODate.now();
  let vt = 0, nextId = 1;
  const timers = new Map();
  let rafs = new Map();
  performance.now = () => vt;
  class VDate extends ODate {
    constructor(...a) { if (a.length === 0) super(base + vt); else super(...a); }
    static now() { return base + vt; }
  }
  VDate.parse = ODate.parse; VDate.UTC = ODate.UTC;
  window.Date = VDate;
  window.setTimeout = (fn, ms = 0, ...args) => { const id = nextId++; timers.set(id, { due: vt + Math.max(0, +ms || 0), fn, args, iv: 0 }); return id; };
  window.setInterval = (fn, ms = 0, ...args) => { const id = nextId++; const iv = Math.max(1, +ms || 0); timers.set(id, { due: vt + iv, fn, args, iv }); return id; };
  window.clearTimeout = window.clearInterval = id => { timers.delete(id); };
  window.requestAnimationFrame = fn => { const id = nextId++; rafs.set(id, fn); return id; };
  window.cancelAnimationFrame = id => { rafs.delete(id); };
  const flush = () => new Promise(r => oST(r, 0));

  // Animasi CSS / Web Animations: dijeda, kemudian currentTime dimajukan mengikut jam maya.
  const anims = new WeakMap();
  function syncAnims(dt) {
    for (const a of document.getAnimations()) {
      let st = anims.get(a);
      if (!st) { st = { run: a.playState === 'running' || a.pending }; anims.set(a, st); try { a.pause(); } catch (_) {} }
      if (!st.run) continue;
      try {
        const ct = (a.currentTime || 0) + dt * (a.playbackRate || 1);
        const end = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming().endTime : Infinity;
        if (Number.isFinite(end) && ct >= end) { st.run = false; a.currentTime = end; a.finish(); }
        else a.currentTime = ct;
      } catch (_) {}
    }
  }

  // Log bunyi (untuk campuran audio selepas rakaman)
  window.__sfx = [];
  const oPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    try { window.__sfx.push({ src: this.currentSrc || this.src, t: vt, vol: this.volume, rate: this.playbackRate }); } catch (_) {}
    return oPlay.call(this);
  };

  window.__vt = () => vt;
  window.__advance = async dt => {
    const target = vt + dt;
    for (let guard = 0; guard < 4000; guard++) {
      let best = null;
      for (const [id, t] of timers) if (t.due <= target && (!best || t.due < best[1].due)) best = [id, t];
      if (!best) break;
      const [id, t] = best;
      vt = Math.max(vt, t.due);
      if (t.iv) t.due = vt + t.iv; else timers.delete(id);
      try { typeof t.fn === 'function' ? t.fn(...t.args) : (0, eval)(String(t.fn)); } catch (e) { console.error(e); }
      await flush();
    }
    vt = target;
    syncAnims(dt);
    const cbs = [...rafs.values()]; rafs = new Map();
    for (const cb of cbs) { try { cb(vt); } catch (e) { console.error(e); } }
    await flush();
    return vt;
  };
})();

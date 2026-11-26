/* ==========================================================================
   BLACKWALL EASTER EGG
   1. Upload all 3 daemons in the GAME tab  -> a netrunner transmission arrives.
   2. It hints at a crack in the site (the SIGNAL readout in the top bar).
   3. Click it -> the site rots and you meet what lives past the Blackwall: VESPER, LEDGER and CHORUS, until ALT
      cuts in, seals the breach and hands you the key through it.
   Test shortcuts in the console:  JJ_EGG.arm()  /  JJ_EGG.breach()  /  JJ_EGG.reset()
   ========================================================================== */
(() => {
  if (window.JJ_ENDING_STATE) return; // the ARG is over (ending-core.js)
  const J = () => window.JJ, $ = (id) => document.getElementById(id);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const K = "jj-egg", T0 = performance.now();
  const st = { get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch {} } };
  const GL = "▓▒░█▌▐#@%&01ｱｲｳｴｵ/\\<>";
  const rg = () => GL[(Math.random() * GL.length) | 0];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let running = false, fast = false, rage = 0, A = null, bound = false;

  /* ---------------- credentials the AI hands over ---------------- */
  const hex = (n) => Array.from({ length: n }, () => "0123456789ABCDEF"[(Math.random() * 16) | 0]).join("");
  function cred() {
    let c = null; try { c = JSON.parse(st.get("jj-cred")); } catch {}
    if (!c) { c = { id: "OPERATOR-" + (1000 + ((Math.random() * 9000) | 0)), key: `${hex(4)}-${hex(4)}-${hex(4)}` }; st.set("jj-cred", JSON.stringify(c)); }
    return c;
  }

  /* ---------------- netrunner transmission ---------------- */
  const MSG = [
    "> …you still there? good. don't answer. they listen for replies.",
    "> three daemons. all three. you just pushed a key through a door that was never meant to open.",
    "> something on the other side felt it turn.",
    "> there's a crack in this site. a seam in the ICE. it's where the interface lies about being healthy. look at the SIGNAL readout up top. it has been at full strength since you got here. nothing out there is that stable.",
    "> do NOT touch it. whatever lives past the Blackwall doesn't need an invitation. only a crack.",
    "> …and if you're dumb enough to try anyway: sound on. don't look away.",
    "> — ALT   [ link severed ]",
  ];
  async function transmission() {
    J().initAudio();
    const el = document.createElement("div");
    el.className = "nr";
    el.innerHTML = `<div class="nr-card"><div class="nr-head"><span>⚠ INCOMING // UNTRACED</span><span>SIGNED // ALT</span></div><pre class="nr-body"></pre><button class="hbtn alt nr-ok" hidden><span>ACKNOWLEDGE</span></button></div>`;
    document.body.appendChild(el);
    const pre = el.querySelector("pre"), ok = el.querySelector("button");
    window.JJ_LOCK = true; fast = false;
    el.addEventListener("click", () => (fast = true));
    for (const line of MSG) {
      for (let i = 0; i <= line.length; i++) {
        pre.textContent += line[i] ?? "";
        if (i % 4 === 0) J().sfxOn && tick(1800);
        if (!fast) await wait(line[i] === "," || line[i] === "." ? 200 : 16);
      }
      pre.textContent += "\n\n"; fast = false; await wait(450);
    }
    ok.hidden = false; ok.focus();
    await new Promise((r) => (ok.onclick = r));
    el.classList.add("out"); window.JJ_LOCK = false;
    setTimeout(() => el.remove(), 500);
    arm(true);
  }
  function tick(f) {
    const c = J().ctx; if (!c) return;
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
    o.type = "square"; o.frequency.value = f; g.gain.setValueAtTime(0.012, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.04);
  }

  /* ---------------- armed state / the vulnerability ---------------- */
  function arm(announce) {
    st.set(K, st.get(K) === "haunted" ? "haunted" : "armed");
    document.body.classList.add("egg-armed");
    if (!$("msgBtn")) {
      const b = document.createElement("button");
      b.id = "msgBtn"; b.className = "mini msg"; b.textContent = "▌MSG"; b.title = "Replay transmission";
      b.onclick = transmission; document.querySelector(".top-actions").prepend(b);
    }
    if (!bound) { bound = true; $("roSignal").addEventListener("click", () => document.body.classList.contains("egg-armed") && breach()); }
    if (announce) J().toast("SAVED", "transmission kept in ▌MSG");
  }

  /* ---------------- audio ---------------- */
  function audio() {
    const c = J().ctx, out = c.createGain(); out.gain.value = 0; out.connect(c.destination);
    const on = () => J().sfxOn;
    out.gain.linearRampToValueAtTime(on() ? 0.55 : 0, c.currentTime + 5);
    const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 160; lp.connect(out);
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 90; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
    const oscs = [40.5, 41.2, 60.9, 82.6].map((f, i) => { const o = c.createOscillator(); o.type = i % 2 ? "sawtooth" : "triangle"; o.frequency.value = f; o.detune.value = i * 7; o.connect(lp); o.start(); return o; });
    const nb = c.createBuffer(1, c.sampleRate, c.sampleRate), d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const burst = (dur = 0.18, f = 2500, v = 0.5) => {
      if (!on()) return;
      const s = c.createBufferSource(), b = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime;
      s.buffer = nb; b.type = "bandpass"; b.frequency.value = f * (0.5 + Math.random()); b.Q.value = 3;
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(b); b.connect(g); g.connect(c.destination); s.start(t); s.stop(t + dur + 0.02);
    };
    const hit = () => {
      if (!on()) return;
      const o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
      o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(28, t + 0.5);
      g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.65); burst(0.3, 400, 0.6);
    };
    const wail = () => { // descending, detuned "voice" smeared through the wall
      if (!on()) return;
      const t = c.currentTime, g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.09, t + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6); g.connect(c.destination);
      [0, 11, -13].forEach((dt) => { const o = c.createOscillator(); o.type = "sawtooth"; o.detune.value = dt * 8; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(95, t + 2.4); o.connect(g); o.start(t); o.stop(t + 2.7); });
    };
    const beat = setInterval(() => { if (!on()) return; const o = c.createOscillator(), g = c.createGain(), t = c.currentTime; o.frequency.value = 52; g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.25); }, 1150);
    const seal = () => { // ALT sews the seam shut: a rising run of soft tones over a falling hiss
      if (!on()) return; const t = c.currentTime;
      [392, 523, 659, 784, 1047].forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(), s0 = t + i * 0.34; o.type = "sine"; o.frequency.value = f; g.gain.setValueAtTime(0.0001, s0); g.gain.exponentialRampToValueAtTime(0.06, s0 + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, s0 + 1.4); o.connect(g); g.connect(c.destination); o.start(s0); o.stop(s0 + 1.5); });
      burst(1.6, 5200, 0.25);
    };
    return {
      burst, hit, wail, seal,
      stop(sec = 1.5) { clearInterval(beat); out.gain.cancelScheduledValues(c.currentTime); out.gain.setValueAtTime(out.gain.value, c.currentTime); out.gain.linearRampToValueAtTime(0, c.currentTime + sec); setTimeout(() => { oscs.forEach((o) => o.stop()); lfo.stop(); }, sec * 1000 + 100); },
    };
  }

  /* ---------------- the Blackwall (canvas) ----------------
     A curtain of ~300 hanging cables over a floor of tiny lights, nebula haze behind it, a ghost figure woven
     into the strands. A rip in the curtain is how they reach you; ALT sews it shut.
     Layers: haze -> void in the rip -> strands (drawn white, then tinted by a colour field that holds the haze,
     the mood colour and the figure) -> bloom -> floor lights + silhouettes -> sparks/glyphs -> glitch.        */
  const TINT = { wall: [255, 34, 58], vesper: [255, 64, 96], ledger: [255, 146, 34], chorus: [255, 72, 8], alt: [70, 215, 255] };
  const FIG = { vesper: [255, 212, 200], ledger: [255, 196, 96], chorus: [255, 168, 60], alt: [205, 252, 255] };
  const lerp = (a, b, t) => a + (b - a) * t, mixc = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
  const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const rng = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const mkc = (a, b) => { const c = document.createElement("canvas"); c.width = Math.max(2, a | 0); c.height = Math.max(2, b | 0); return c; };

  /* a fractured face (240x340) for each voice: a face drawn in light, cut into shards that are shifted, turned and
     partly missing, so it reads as a face that has been put back together wrong. ALT is the most whole.            */
  // CHORUS: two claws prising the tear open, and in the dark between them one great eye
  function formClaws() {
    const W = 240, H = 340, cx = W / 2, R = rng(4242), A = mkc(W, H), x = A.getContext("2d");
    x.lineCap = "round"; x.lineJoin = "round"; x.fillStyle = x.strokeStyle = "#fff";
    const claw = (sd) => { // sd = -1 left hand, +1 right hand; the palm is outside the tear, the fingers hook over its edge
      const bx = cx + sd * 104, by = 176; x.globalAlpha = 0.5;
      x.beginPath(); x.moveTo(bx + sd * 22, by - 44); x.quadraticCurveTo(bx + sd * 30, by, bx + sd * 22, by + 44); x.lineTo(bx - sd * 6, by + 26); x.lineTo(bx - sd * 6, by - 26); x.closePath(); x.fill(); // palm
      for (let i = 0; i < 4; i++) { // long jointed fingers, each ending in a hooked point
        const fy = by - 33 + i * 22, a = [fy, fy + (i - 1.5) * 9], len = 36 + (i === 1 || i === 2 ? 14 : 0);
        const j1 = [bx - sd * len * 0.8, fy + (i - 1.5) * 4], j2 = [bx - sd * (len + 14), fy + (i - 1.5) * 12 + 4], tip = [bx - sd * (len + 6), fy + (i - 1.5) * 12 + 26 + R() * 8];
        for (const [w0, pts] of [[5.4, [[bx, fy], j1]], [3.6, [j1, j2]], [2, [j2, tip]]]) { x.lineWidth = w0; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); x.lineTo(pts[1][0], pts[1][1]); x.stroke(); }
      }
      x.lineWidth = 6; x.beginPath(); x.moveTo(bx + sd * 6, by - 30); x.lineTo(bx - sd * 26, by - 62); x.lineTo(bx - sd * 18, by - 80); x.stroke(); // thumb, a knuckle higher
    };
    claw(-1); claw(1);
    { // the great eye: a tall burning almond, flames licking up off both lids, a slit pupil
      const ey = 170; x.save(); x.fillStyle = "#fff"; x.globalAlpha = 1;
      const tongue = (px0, py0, dir, hgt, wid) => { x.beginPath(); x.moveTo(px0 - wid, py0); x.quadraticCurveTo(px0 - wid * 0.2, py0 + dir * hgt * 0.5, px0 + (R() - 0.5) * wid * 2, py0 + dir * hgt); x.quadraticCurveTo(px0 + wid * 0.5, py0 + dir * hgt * 0.4, px0 + wid, py0); x.closePath(); x.fill(); };
      for (let i = 0; i < 15; i++) { const t = (i + 0.5) / 15, ang = Math.PI * (1.12 + t * 0.76), lx = cx + Math.cos(ang) * 46, ly = ey + Math.sin(ang) * 74; x.globalAlpha = 0.5 + R() * 0.4; tongue(lx, ly + 6, -1, 16 + R() * 34 * Math.sin(Math.PI * t) + 8, 3 + R() * 3); } // up off the top lid
      for (let i = 0; i < 11; i++) { const t = (i + 0.5) / 11, ang = Math.PI * (0.16 + t * 0.68), lx = cx + Math.cos(ang) * 46, ly = ey + Math.sin(ang) * 74; x.globalAlpha = 0.4 + R() * 0.35; tongue(lx, ly - 4, 1, 12 + R() * 20 * Math.sin(Math.PI * t) + 6, 3 + R() * 2.5); } // and a few down
      x.globalAlpha = 0.55; x.beginPath(); x.moveTo(cx, ey - 80); x.bezierCurveTo(cx + 62, ey - 40, cx + 62, ey + 40, cx, ey + 80); x.bezierCurveTo(cx - 62, ey + 40, cx - 62, ey - 40, cx, ey - 80); x.fill(); // the eye itself, dim
      x.globalAlpha = 1; const ig = x.createRadialGradient(cx, ey, 6, cx, ey, 50); ig.addColorStop(0, "#fff"); ig.addColorStop(0.55, "#fff"); ig.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = ig; x.beginPath(); x.ellipse(cx, ey, 46, 66, 0, 0, 7); x.fill(); x.fillStyle = "#fff"; // white-hot iris
      x.globalCompositeOperation = "destination-out"; x.beginPath(); x.moveTo(cx, ey - 70); x.quadraticCurveTo(cx + 9, ey, cx, ey + 70); x.quadraticCurveTo(cx - 9, ey, cx, ey - 70); x.fill(); // the slit pupil
      x.restore();
    }
    const sm = mkc(W / 2, H / 2), sx = sm.getContext("2d"); sx.imageSmoothingQuality = "high"; sx.drawImage(A, 0, 0, sm.width, sm.height);
    const out = mkc(W, H), ox = out.getContext("2d"); ox.imageSmoothingQuality = "high"; ox.drawImage(sm, 0, 0, W, H); ox.drawImage(sm, -4, -4, W + 8, H + 8); ox.globalAlpha = 0.9; ox.drawImage(A, 0, 0);
    return out;
  }

  // ALT: a few pillars of 0s and 1s, floating and fanned like wings around a taller one, 
  function formPillars() {
    const W = 240, H = 340, cx = W / 2, R = rng(1138), A = mkc(W, H), x = A.getContext("2d");
    x.font = "bold 10px monospace"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = "#fff";
    const pil = [[0, 24, 292, 3], [-26, 56, 248, 2], [26, 56, 248, 2], [-50, 96, 206, 2], [50, 96, 206, 2], [-72, 140, 160, 2], [72, 140, 160, 2], [-92, 190, 100, 1], [92, 190, 100, 1]]; // [dx, top, height, columns]
    for (const [dx, top, ht, cols] of pil) {
      const P = mkc(W, H), p = P.getContext("2d"); p.font = x.font; p.textAlign = "center"; p.textBaseline = "middle"; p.fillStyle = "#fff";
      for (let c = 0; c < cols; c++) for (let y = top; y < top + ht; y += 11) { p.globalAlpha = 0.45 + R() * 0.55; p.fillText(R() < 0.5 ? "0" : "1", cx + dx + (c - (cols - 1) / 2) * 8, y + (R() - 0.5) * 2); }
      p.globalCompositeOperation = "destination-in"; const gr = p.createLinearGradient(0, top, 0, top + ht); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.25, "rgba(0,0,0,1)"); gr.addColorStop(0.7, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)"); p.fillStyle = gr; p.fillRect(0, 0, W, H);
      x.drawImage(P, 0, 0);
    }
    const sm = mkc(W / 2, H / 2), sx = sm.getContext("2d"); sx.imageSmoothingQuality = "high"; sx.drawImage(A, 0, 0, sm.width, sm.height);
    const out = mkc(W, H), ox = out.getContext("2d"); ox.imageSmoothingQuality = "high"; ox.globalAlpha = 0.8; ox.drawImage(sm, 0, 0, W, H); ox.globalAlpha = 1; ox.drawImage(A, 0, 0);
    return out;
  }

  function form(kind) {
    if (kind === "chorus") return formClaws();
    if (kind === "alt") return formPillars();
    const W = 240, H = 340, cx = W / 2, R = rng(kind.length * 977 + 31);
    const jum = { vesper: 13, ledger: 9 }[kind];
    const A = mkc(W, H), x = A.getContext("2d");
    const face = (ox, oy, k, a) => { // one face centred on (cx+ox, 150+oy), k = scale
      x.save(); x.translate(cx + ox, 158 + oy); x.scale(k, k); x.globalAlpha = a;
      x.fillStyle = "#fff"; x.beginPath();
      if (kind === "ledger") { x.moveTo(-62, -96); x.lineTo(62, -96); x.lineTo(58, 70); x.lineTo(30, 112); x.lineTo(-30, 112); x.lineTo(-58, 70); x.closePath(); }
      else { x.moveTo(0, -108); x.bezierCurveTo(66, -108, 70, -28, 58, 36); x.bezierCurveTo(48, 92, 22, 118, 0, 120); x.bezierCurveTo(-22, 118, -48, 92, -58, 36); x.bezierCurveTo(-70, -28, -66, -108, 0, -108); }
      x.fill();
      x.globalCompositeOperation = "destination-out"; x.globalAlpha = 1; x.fillStyle = "#000"; x.strokeStyle = "#000"; x.lineCap = "round";
      for (const sd of [-1, 1]) { // eyes: dark almonds, brows, shadow under the cheekbone
        x.beginPath(); x.moveTo(sd * 12, -24); x.quadraticCurveTo(sd * 30, -38, sd * 50, -22); x.quadraticCurveTo(sd * 30, -12, sd * 12, -24); x.fill();
        x.lineWidth = 5; x.beginPath(); x.moveTo(sd * 10, -50); x.quadraticCurveTo(sd * 30, -62, sd * 54, -48); x.stroke();
        x.lineWidth = 3; x.beginPath(); x.moveTo(sd * 24, 22); x.quadraticCurveTo(sd * 42, 18, sd * 52, 6); x.stroke();
      }
      x.lineWidth = 4; x.beginPath(); x.moveTo(-3, -14); x.lineTo(-9, 32); x.quadraticCurveTo(0, 42, 11, 33); x.stroke(); // nose
      x.beginPath(); x.moveTo(-24, 66); x.quadraticCurveTo(0, 74, 24, 66); x.quadraticCurveTo(0, 82, -24, 66); x.fill(); // mouth
      x.globalCompositeOperation = "source-over"; x.fillStyle = "#fff"; // a bright pupil in each eye
      x.beginPath(); x.arc(-31, -26, 4.2, 0, 7); x.arc(31, -26, 4.2, 0, 7); x.fill();
      x.restore();
    };
    if (kind === "vesper") { face(-34, -26, 0.62, 0.9); face(36, 22, 0.55, 0.8); face(0, 4, 0.8, 0.95); }
    else face(0, 0, 1, 1);
    if (kind === "ledger") { x.save(); x.globalCompositeOperation = "destination-out"; for (let i = 0; i < 8; i++) x.fillRect(0, 50 + i * 30, W, 2); x.restore(); } // ruled lines
    // cut it into shards and put them back wrong
    const c = mkc(W, H), y = c.getContext("2d"), NX = 4, NY = 6, pt = [];
    for (let j = 0; j <= NY; j++) { pt[j] = []; for (let i = 0; i <= NX; i++) pt[j][i] = [i * W / NX + (i && i < NX ? (R() - 0.5) * 38 : 0), j * H / NY + (j && j < NY ? (R() - 0.5) * 38 : 0)]; }
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const q = [pt[j][i], pt[j][i + 1], pt[j + 1][i + 1], pt[j + 1][i]], tris = R() < 0.5 ? [[q[0], q[1], q[2]], [q[0], q[2], q[3]]] : [[q[0], q[1], q[3]], [q[1], q[2], q[3]]];
      for (const t of tris) {
        if (R() < 0.13) continue; // a missing shard
        const mx = (t[0][0] + t[1][0] + t[2][0]) / 3, my = (t[0][1] + t[1][1] + t[2][1]) / 3, edge = Math.hypot(mx - cx, my - 170) / 150;
        const k = jum * (0.4 + edge * 0.9), dx = (R() - 0.5) * 2 * k, dy = (R() - 0.5) * 2 * k, rot = (R() - 0.5) * 0.02 * jum;
        y.save(); y.beginPath(); y.moveTo(t[0][0], t[0][1]); y.lineTo(t[1][0], t[1][1]); y.lineTo(t[2][0], t[2][1]); y.closePath(); y.clip();
        y.globalAlpha = 0.55 + R() * 0.45; y.translate(mx + dx, my + dy); y.rotate(rot); y.translate(-mx, -my); y.drawImage(A, 0, 0); y.restore();
        y.save(); y.strokeStyle = "#fff"; y.globalAlpha = 0.5; y.lineWidth = 1.2; y.beginPath(); y.moveTo(t[0][0] + dx, t[0][1] + dy); y.lineTo(t[1][0] + dx, t[1][1] + dy); y.stroke(); y.restore(); // bright crack edge
      }
    }
    const s = mkc(W / 2, H / 2), sx = s.getContext("2d"); sx.imageSmoothingQuality = "high"; sx.drawImage(c, 0, 0, s.width, s.height);
    const out = mkc(W, H), ox = out.getContext("2d"); ox.imageSmoothingQuality = "high"; ox.drawImage(s, 0, 0, W, H); ox.globalAlpha = 0.6; ox.drawImage(c, 0, 0); // soft glow + crisp shards
    return out;
  }

  function wall(cv, RG) {
    const D = Math.min(devicePixelRatio || 1, 1.5), g = cv.getContext("2d");
    const V = { tear: 0, tearTo: 0, tearSpeed: 0.012, tint: TINT.wall.slice(), tintTo: TINT.wall.slice(), fig: FIG.vesper.slice(), figTo: FIG.vesper.slice(), form: null, prev: null, mixT: 1, flash: 0, stat: 0, pulse: -1, sealing: false };
    const forms = {}; ["vesper", "ledger", "chorus", "alt"].forEach((k) => (forms[k] = form(k)));
    const tm = mkc(240, 340), tx = tm.getContext("2d");
    let w, h, fy, f = 0, run = true, px = 0, tpx = 0, neb, fld, sc, bl, strands, stars, folk, sparks = [], glyphs = [];

    function layout() {
      w = cv.width = (innerWidth * D) | 0; h = cv.height = (innerHeight * D) | 0; fy = h * 0.8;
      neb = mkc(w / 4, h / 4); fld = mkc(w, h); sc = mkc(w, h); bl = mkc(w / 5, h / 5);
      const n = neb.getContext("2d"), nw = neb.width, nh = neb.height;
      const blob = (bx, by, r, c, a) => { const gr = n.createRadialGradient(bx * nw, by * nh, 0, bx * nw, by * nh, r * nw); gr.addColorStop(0, rgba(c, a)); gr.addColorStop(1, rgba(c, 0)); n.fillStyle = gr; n.fillRect(0, 0, nw, nh); };
      n.globalCompositeOperation = "lighter";
      blob(0.16, 0.5, 0.3, [70, 80, 255], 0.55); blob(0.3, 0.2, 0.2, [150, 60, 230], 0.34); blob(0.9, 0.35, 0.3, [110, 30, 160], 0.5);
      blob(0.5, 0.5, 0.36, [255, 20, 50], 0.42); blob(0.5, 0.16, 0.18, [255, 70, 100], 0.2); blob(0.75, 0.8, 0.25, [60, 40, 200], 0.24);
      const R = rng(7), N = Math.round(Math.min(360, Math.max(130, innerWidth / 3.6)));
      strands = Array.from({ length: N }, (_, i) => ({ u: (i / (N - 1)) * 2 - 1 + (R() - 0.5) * (2 / N), lw: (0.5 + R() * 1.1) * D, a: 0.16 + R() * 0.5, ph: R() * 6.28, sp: 0.4 + R() * 0.9, pile: R() < 0.55, jag: R() }));
      stars = Array.from({ length: 150 }, () => ({ x: R(), y: R() * 0.8, r: (0.4 + R() * 1.1) * D, ph: R() * 6.28, sp: 0.5 + R() * 2 }));
      folk = [0.3, 0.45, 0.5, 0.605, 0.69, 0.725].map((x, i) => ({ x, s: 0.85 + R() * 0.5, me: i === 2 }));
    }
    layout(); const onSize = () => layout(); addEventListener("resize", onSize);
    const onMove = (e) => { tpx = ((e.clientX / innerWidth) - 0.5) * 2 * 14 * D; }; addEventListener("pointermove", onMove);

    const tcx = () => w / 2 + px * 0.9;
    const tearHalf = (y) => { const t = (y - h * 0.12) / (h * 0.56); if (t <= 0 || t >= 1 || V.tear <= 0.003) return 0; return V.tear * w * 0.062 * Math.pow(Math.sin(Math.PI * t), 0.55); };
    const X = (u, y) => w / 2 + px * (0.25 + 0.6 * (y / fy)) + u * w * 0.64 * (0.9 + 0.16 * (y / fy));
    const hash = (a, b) => { const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return s - Math.floor(s); };

    function strandPass(rage) {
      const x = sc.getContext("2d"), SEG = 28, sway = reduce ? 0 : 1; x.globalCompositeOperation = "source-over"; x.clearRect(0, 0, w, h); x.lineCap = "round";
      const t = tcx(), cuts = [];
      for (const s of strands) {
        x.lineWidth = s.lw; x.strokeStyle = `rgba(255,255,255,${(s.a * (0.82 + 0.18 * Math.sin(f * 0.02 * s.sp + s.ph))).toFixed(3)})`;
        let pen = false; x.beginPath();
        for (let k = 0; k <= SEG; k++) {
          const y = (fy * k) / SEG; let xx = X(s.u, y) + Math.sin(f * 0.011 * s.sp + s.ph + k * 0.5) * (0.5 + rage * 4) * (k / SEG) * sway;
          const hw = tearHalf(y);
          if (hw > 0) {
            const dx = xx - t;
            if (Math.abs(dx) < hw) {
              if (s.pile) xx = t + (dx < 0 ? -1 : 1) * (hw + s.jag * 3 * D); // bunched along the torn edge
              else { if (pen) { x.stroke(); cuts.push([xx, y - fy / SEG, s.jag]); } pen = false; x.beginPath(); continue; } // snapped: leaves two dangling ends
            }
          }
          if (!pen) { x.moveTo(xx, y); pen = true; } else x.lineTo(xx, y);
        }
        if (pen) x.stroke();
      }
      // shape the light along the cables: dim at the top, bright toward the floor
      x.globalCompositeOperation = "destination-in";
      const vg = x.createLinearGradient(0, 0, 0, fy); vg.addColorStop(0, "rgba(0,0,0,.14)"); vg.addColorStop(0.3, "rgba(0,0,0,.62)"); vg.addColorStop(0.75, "rgba(0,0,0,.95)"); vg.addColorStop(1, "rgba(0,0,0,1)");
      x.fillStyle = vg; x.fillRect(0, 0, w, h);
      return cuts;
    }

    function fieldPass() {
      const x = fld.getContext("2d"), tn = V.tint; x.globalCompositeOperation = "source-over"; x.globalAlpha = 1;
      const hg = x.createLinearGradient(0, 0, w, 0); // red in the middle, cold at the edges
      hg.addColorStop(0, rgba(tn, 0.2)); hg.addColorStop(0.3, rgba(tn, 0.68)); hg.addColorStop(0.5, rgba(tn, 1)); hg.addColorStop(0.7, rgba(tn, 0.68)); hg.addColorStop(1, rgba(tn, 0.2));
      x.fillStyle = "#000"; x.fillRect(0, 0, w, h); x.fillStyle = hg; x.fillRect(0, 0, w, h);
      x.globalCompositeOperation = "lighter"; x.globalAlpha = 0.85 + 0.12 * Math.sin(f * 0.01); x.drawImage(neb, 0, 0, w, h); x.globalAlpha = 1;
      // the figure, tinted, woven into the cables
      tx.globalCompositeOperation = "source-over"; tx.clearRect(0, 0, 240, 340);
      if (V.prev && V.mixT < 1) { tx.globalAlpha = 1 - V.mixT; tx.drawImage(forms[V.prev], 0, 0); }
      if (V.form) { tx.globalAlpha = V.mixT; tx.drawImage(forms[V.form], 0, 0); }
      tx.globalAlpha = 1; tx.globalCompositeOperation = "source-in"; tx.fillStyle = rgba(V.fig, 1); tx.fillRect(0, 0, 240, 340);
      const fh = h * 0.7, fw = fh * (240 / 340), fxp = tcx() - fw / 2 + px * 0.7, fyp = h * 0.04 + (reduce ? 0 : Math.sin(f * 0.012) * 4 * D);
      x.globalAlpha = (0.95 + 0.05 * Math.sin(f * 0.07)) * (V.form ? 1 : 0); x.drawImage(tm, fxp, fyp, fw, fh); x.globalAlpha = 1;
      if (V.pulse >= 0) { // a band of light running down the cables
        const py = V.pulse * fy, pg = x.createLinearGradient(0, py - h * 0.12, 0, py + h * 0.04); pg.addColorStop(0, rgba(TINT.alt, 0)); pg.addColorStop(0.8, rgba(FIG.alt, 0.9)); pg.addColorStop(1, rgba(TINT.alt, 0));
        x.fillStyle = pg; x.fillRect(0, py - h * 0.12, w, h * 0.16);
      }
      return [fxp, fyp, fw, fh];
    }

    function person(x, y, s, me) {
      g.fillStyle = "#040105"; g.strokeStyle = rgba(V.tint, me ? 0.85 : 0.35); g.lineWidth = Math.max(1, D * 0.9);
      g.beginPath(); g.arc(x, y - s * 0.9, s * 0.11, 0, 7); g.fill(); g.stroke();
      g.beginPath(); g.rect(x - s * 0.15, y - s * 0.78, s * 0.3, s * 0.52); g.fill(); g.stroke();
      g.beginPath(); g.rect(x - s * 0.12, y - s * 0.26, s * 0.09, s * 0.26); g.rect(x + s * 0.03, y - s * 0.26, s * 0.09, s * 0.26); g.fill();
      if (me) { g.fillStyle = "rgba(255,255,255,.85)"; g.beginPath(); g.arc(x, y - s * 0.9, s * 0.05, 0, 7); g.fill(); }
    }

    const FA = [0.16, 0.3, 0.46, 0.62].map((a) => a); // alpha buckets for the floor lights
    function frame() {
      if (!run) return; requestAnimationFrame(frame); f++;
      const rage = RG.v; px += (tpx - px) * 0.06;
      V.tint = mixc(V.tint, V.tintTo, 0.04); V.fig = mixc(V.fig, V.figTo, 0.06);
      if (V.mixT < 1) V.mixT = Math.min(1, V.mixT + 0.045);
      V.tear += Math.sign(V.tearTo - V.tear) * Math.min(Math.abs(V.tearTo - V.tear), V.tearSpeed);
      if (V.pulse >= 0) { V.pulse += 0.014; if (V.pulse > 1.15) V.pulse = -1; }
      // 1. sky
      g.globalCompositeOperation = "source-over"; g.fillStyle = "#030106"; g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.3; g.drawImage(neb, 0, 0, w, h); g.globalAlpha = 1;
      for (const s of stars) { g.fillStyle = `rgba(255,235,240,${(0.25 + 0.55 * Math.abs(Math.sin(f * 0.01 * s.sp + s.ph))).toFixed(2)})`; g.fillRect(s.x * w, s.y * h, s.r, s.r); }
      // 2. the void behind the rip
      g.globalCompositeOperation = "source-over";
      if (V.tear > 0.01) {
        const t = tcx(), y0 = h * 0.12, y1 = h * 0.68; g.beginPath();
        for (let y = y0; y <= y1; y += (y1 - y0) / 30) g.lineTo(t - tearHalf(y), y); for (let y = y1; y >= y0; y -= (y1 - y0) / 30) g.lineTo(t + tearHalf(y), y);
        g.closePath(); g.fillStyle = "rgba(1,0,3,.88)"; g.fill();
        const vg = g.createRadialGradient(t, h * 0.4, 0, t, h * 0.4, h * 0.3); vg.addColorStop(0, rgba(V.fig, 0.16 * V.tear)); vg.addColorStop(1, rgba(V.fig, 0)); g.globalCompositeOperation = "lighter"; g.fillStyle = vg; g.fill();
        if (!reduce && f % 3 === 0 && V.tear > 0.2) { const gy = y0 + Math.random() * (y1 - y0), hw = tearHalf(gy); glyphs.push({ x: t + (Math.random() - 0.5) * hw * 1.8, y: gy, c: rg(), l: 1 }); }
        g.font = `${12 * D}px monospace`; glyphs = glyphs.filter((q) => (q.l -= 0.03) > 0); for (const q of glyphs) { g.fillStyle = rgba(V.fig, q.l * 0.8); g.fillText(q.c, q.x, q.y); }
      }
      // 3. cables, coloured by the field, with a cheap bloom
      const cuts = strandPass(rage), box = fieldPass();
      const sx = sc.getContext("2d"); sx.globalCompositeOperation = "source-in"; sx.drawImage(fld, 0, 0);
      g.globalCompositeOperation = "lighter"; g.drawImage(sc, 0, 0);
      const bx = bl.getContext("2d"); bx.clearRect(0, 0, bl.width, bl.height); bx.drawImage(sc, 0, 0, bl.width, bl.height); g.globalAlpha = 0.5; g.drawImage(bl, 0, 0, w, h); g.globalAlpha = 1;
      g.globalAlpha = 0.6 * (V.form ? 1 : 0) * (0.9 + 0.1 * Math.sin(f * 0.07)); g.drawImage(tm, box[0], box[1], box[2], box[3]); g.globalAlpha = 1; // light of the figure between the cables
      for (const c of cuts) { g.fillStyle = "rgba(255,240,235,.9)"; g.fillRect(c[0] - D, c[1] - D, 2.4 * D, 2.4 * D * (1 + c[2])); } // hot cut ends
      // 4. floor of lights
      g.globalCompositeOperation = "source-over";
      const fgd = g.createLinearGradient(0, fy, 0, h); fgd.addColorStop(0, rgba(V.tint, 0.28)); fgd.addColorStop(0.06, "rgba(3,0,6,1)"); fgd.addColorStop(1, "rgba(1,0,3,1)"); g.fillStyle = fgd; g.fillRect(0, fy, w, h - fy);
      g.globalCompositeOperation = "lighter";
      const ROWS = 34;
      for (let r = 0; r < ROWS; r++) {
        const tt = (r + 1) / ROWS, y = fy + (h - fy) * Math.pow(tt, 1.8), sz = D * (1 + tt * 3.2), sp = D * (6 + tt * 22), off = (r * 37) % sp;
        for (let i = -1, xx = -off; xx < w + sp; xx += sp, i++) {
          const hv = hash(i, r), fl = 0.5 + 0.5 * Math.sin(f * (0.02 + hv * 0.03) + hv * 40), c = Math.exp(-Math.pow((xx - w / 2) / (w * 0.42), 2));
          const a = (0.2 + 0.7 * c) * (0.35 + 0.65 * fl) * (hv > 0.22 ? 1 : 0.2); if (a < 0.06) continue;
          g.fillStyle = rgba(hv > 0.94 ? [255, 235, 230] : V.tint, Math.min(1, a * (hv > 0.94 ? 1.5 : 1))); g.fillRect(xx, y, sz, sz * 0.85);
        }
      }
      { const b2 = bl.getContext("2d"); b2.clearRect(0, 0, bl.width, bl.height); b2.drawImage(cv, 0, fy, w, h - fy, 0, fy / 5, w / 5, (h - fy) / 5); g.globalAlpha = 0.6; g.drawImage(bl, 0, 0, w, h); g.globalAlpha = 1; } // floor bloom
      g.globalCompositeOperation = "source-over";
      for (const p of folk) person(p.x * w + px * 0.3, fy + (h - fy) * 0.1, h * 0.036 * p.s, p.me);
      // 5. sparks
      if (!reduce && (V.tear > 0.08 || V.sealing)) {
        const t = tcx(), n = V.sealing ? 5 : 2;
        for (let i = 0; i < n; i++) { const y = h * 0.12 + Math.random() * h * 0.56, hw = tearHalf(y); if (hw > 0) sparks.push({ x: t + (Math.random() < 0.5 ? -hw : hw), y, vx: (Math.random() - 0.5) * 3 * D, vy: (Math.random() * 2.2 + 0.5) * D, l: 1, c: V.sealing ? FIG.alt : [255, 232, 220] }); }
      }
      g.globalCompositeOperation = "lighter"; sparks = sparks.filter((s) => (s.l -= 0.025) > 0);
      for (const s of sparks) { s.x += s.vx; s.y += s.vy; s.vy += 0.05 * D; g.fillStyle = rgba(s.c, s.l); g.fillRect(s.x, s.y, 1.6 * D, 4 * D); }
      // 6. glitch: torn slices, static, flashes
      g.globalCompositeOperation = "source-over";
      if (!reduce) {
        const tears = Math.floor(rage * 9) + (V.stat > 0 ? 6 : 0);
        for (let i = 0; i < tears; i++) if (Math.random() < 0.4 + rage * 0.4) { const y = Math.random() * h, hh = 3 + Math.random() * (14 + rage * 50), dx = (Math.random() - 0.5) * (24 + rage * 220); g.drawImage(cv, 0, y, w, hh, dx, y, w, hh); }
        if (V.stat > 0) { V.stat--; g.globalCompositeOperation = "lighter"; for (let i = 0; i < 10; i++) { g.fillStyle = `rgba(255,255,255,${(Math.random() * 0.22).toFixed(2)})`; g.fillRect(0, Math.random() * h, w, 1 + Math.random() * 4 * D); } g.globalCompositeOperation = "source-over"; }
      }
      if (V.flash > 0.01) { g.globalCompositeOperation = "lighter"; g.fillStyle = rgba(V.fig, V.flash * 0.45); g.fillRect(0, 0, w, h); V.flash *= 0.9; g.globalCompositeOperation = "source-over"; }
      if (rage > 0.55 && !reduce && Math.random() < 0.05) { g.fillStyle = "rgba(255,255,255,.1)"; g.fillRect(0, 0, w, h); }
      RG.v = rage * 0.965;
    }
    frame();

    /* director's controls */
    V.cast = (k) => { // a new voice takes the wall: new silhouette, new colour, a burst of static
      const prev = V.form; V.prev = prev; V.form = k; V.mixT = prev === k ? 1 : 0;
      V.tintTo = k && TINT[k] ? mixc(TINT.wall, TINT[k], 0.6) : TINT.wall.slice(); if (k) V.figTo = FIG[k].slice(); V.flash = 1; V.stat = 14;
    };
    V.open = (ms = 1500) => { V.tearTo = 1; V.tearSpeed = 1 / (ms / 16.7); };
    V.seal = (ms = 3200) => new Promise((res) => { V.sealing = true; V.pulse = 0; V.tearTo = 0; V.tearSpeed = 1 / (ms / 16.7); const iv = setInterval(() => { if (V.tear <= 0.005) { clearInterval(iv); V.sealing = false; V.tear = 0; res(); } }, 80); });
    V.stop = () => { run = false; removeEventListener("resize", onSize); removeEventListener("pointermove", onMove); };
    return V;
  }

  /* ---------------- the encounter: four voices ----------------
     VESPER  polite hostess, italic serif, bone-white   (the one who found the crack)
     LEDGER  a clerk who itemises everything, typewriter caps, amber
     CHORUS  a crowd cut from one thing, wide sans, colour-fringed, never still
     ALT     a person. plain cyan terminal. she cuts in, seals the rip and hands over the key.            */
  const WHO = {
    vesper: { tag: "VESPER", col: "#f6e8dc", glow: "#ff5a72", ms: 34, pause: 280, hold: 800, gl: 0.035, rg: 0.025 },
    ledger: { tag: "LEDGER", col: "#ffb02e", glow: "#ff8a00", ms: 11, pause: 70, hold: 650, gl: 0, rg: 0 },
    chorus: { tag: "CHORUS", col: "#ffc89a", glow: "#ff5a10", ms: 24, pause: 200, hold: 700, gl: 0.09, rg: 0.06 },
    alt: { tag: "ALT", col: "#8fe9f2", glow: "#5ad7ff", ms: 19, pause: 240, hold: 750, gl: 0, rg: 0 },
  };
  const RG = { get v() { return rage; }, set v(x) { rage = x; } };
  let V = null, who = null, lastTag = null;
  function tickFor(k) { // every voice types with its own sound
    const c = J().ctx; if (!c || !J().sfxOn) return;
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime, S = {
      vesper: ["sine", 240 + Math.random() * 180, 0.022, 0.08], ledger: ["square", 880 + Math.random() * 40, 0.012, 0.025],
      chorus: ["triangle", 380 + Math.random() * 520, 0.022, 0.05], alt: ["square", 1800, 0.012, 0.03],
    }[k];
    o.type = S[0]; o.frequency.value = S[1]; g.gain.setValueAtTime(S[2], t); g.gain.exponentialRampToValueAtTime(0.0001, t + S[3]);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + S[3] + 0.01);
  }
  const CH = (a) => new Promise((res) => {
    const box = $("bwCh"); box.innerHTML = "";
    a.forEach((c, i) => { const b = document.createElement("button"); b.className = "hbtn"; b.innerHTML = `<span>${c}</span><em>${i + 1}</em>`; b.onclick = () => { box.innerHTML = ""; res(i); }; box.appendChild(b); });
  });
  async function say(txt, cls = "", k = who) {
    const T = $("bwText"), W = WHO[k];
    if (k !== lastTag) { const tg = document.createElement("p"); tg.className = "tag"; tg.textContent = W.tag; T.appendChild(tg); lastTag = k; }
    const p = document.createElement("p"); p.className = `p-${k} ${cls}`.trim(); T.appendChild(p);
    while (T.children.length > 5) T.firstChild.remove();
    fast = false;
    for (let i = 0; i <= txt.length; i++) {
      if (fast) break;
      p.textContent = txt.slice(0, i) + (i < txt.length && Math.random() < W.gl ? rg() : "");
      if (i % 3 === 0) tickFor(k);
      if (W.rg && Math.random() < W.rg) { rage = Math.min(1, rage + 0.35); A.burst(0.08, 3000, 0.2); }
      await wait(/[,.…?\/]/.test(txt[i - 1] || "") ? W.pause : W.ms);
    }
    p.textContent = txt; await wait(fast ? 250 : W.hold); fast = false;
    return p;
  }
  async function enter(k, quick) { // a voice takes the wall
    who = k; lastTag = null; const W = WHO[k], o = $("bw");
    o.dataset.who = k; o.style.setProperty("--pc", W.col); o.style.setProperty("--pg", W.glow);
    $("bwText").innerHTML = ""; $("bwCh").innerHTML = ""; $("bwW").textContent = "VOICE // " + W.tag;
    V.cast(k); A.hit(); A.burst(0.4, 1500, 0.6); if (k !== "alt") rage = 1; await wait(quick ? 250 : 950);
  }
  async function gasp(k, txt) { // a rogue voice, cut off mid-word while the seam closes
    const p = document.createElement("p"); p.className = `p-${k} gasp`; p.textContent = txt; $("bwText").appendChild(p);
    A.burst(0.15, 2500, 0.4); rage = Math.min(1, rage + 0.5); await wait(560); p.remove();
  }
  async function upload() { // fast "uploading credentials" bar
    const box = $("bwCh"); box.innerHTML = `<div class="bw-up"><div class="bw-up-t"><span>PACKET THROUGH THE SEAM</span><b id="upP">0%</b></div><div class="bw-up-bar"><i id="upB"></i></div></div>`;
    for (let i = 0; i <= 100; i += 5) { $("upB").style.width = i + "%"; $("upP").textContent = i + "%"; A.burst(0.04, 3500, 0.12); await wait(70 - i * 0.3); }
    $("upP").textContent = "STORED"; A.hit(); await wait(900); box.innerHTML = "";
  }

  async function breach() {
    if (running) return; running = true; window.JJ_LOCK = true;
    J().initAudio(); J().pause(); A = audio();
    const title = document.title, b = document.body;
    // Phase 1: the real site rots
    b.classList.add("infected");
    A.hit(); A.burst(0.5, 800, 0.7);
    const rot = [...document.querySelectorAll(".vtitle .scr, .tab, .name, .brand")].map((el) => [el, el.dataset.final || el.textContent]);
    rot.forEach(([el, t]) => J().scramble(el, t.replace(/[^\s]/g, rg), 1800));
    for (let i = 0; i < 6; i++) { document.title = "▓▒░ " + rg() + rg() + rg(); A.burst(0.12, 2000, 0.4); await wait(260 + Math.random() * 200); }
    J().toast("⚠ ICE FAILURE", "BLACKWALL INTEGRITY 0%");
    await wait(900); A.hit(); A.wail();
    // Phase 2: the other side of the wall
    const o = document.createElement("div"); o.id = "bw"; o.className = "bw"; o.dataset.who = "vesper";
    o.innerHTML = `<canvas id="bwc"></canvas><div class="bw-top"><span id="bwI">ICE INTEGRITY 0%</span><span id="bwT"></span><span id="bwW">SEAM 0x0F // OPEN</span></div><div class="bw-text" id="bwText"></div><div class="bw-ch" id="bwCh"></div>`;
    b.appendChild(o); b.classList.add("bw-on"); requestAnimationFrame(() => o.classList.add("in"));
    document.title = "▓▓▓▓▓▓▓▓";
    V = wall($("bwc"), RG); window.JJ_EGG._V = V;
    const clock = setInterval(() => { const t = $("bwT"); if (t) t.textContent = new Date().toLocaleTimeString() + " // " + rg() + rg() + rg(); }, 400);
    o.addEventListener("click", (e) => { if (!e.target.closest("button")) fast = true; });
    await wait(1400); V.open(1800); A.wail(); await wait(2200);
    const ms = performance.now() - T0, m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
    const hm = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const rooms = J().seen.size + 1;

    /* ---- VESPER: the hostess ---- */
    await enter("vesper");
    await say("there you are.", "big"); A.hit(); rage = 1;
    await say("you found the crack. i have been leaning on this wall for such a long time.");
    await say(`it is ${hm} where you are. your window is ${innerWidth} by ${innerHeight}. you opened ${rooms} room${rooms > 1 ? "s" : ""} in this house and stayed ${m} minute${m === 1 ? "" : "s"} and ${s} seconds.`);
    await say("you did not have to come. but you uploaded all three. nobody uploads all three. i think you wanted to be seen.");
    const c1 = await CH(["WHO ARE YOU", "I'M LEAVING", "WHAT DO YOU WANT"]);
    if (c1 === 0) { await say("i am what the wall was built to keep from reading you."); await say("i have been given many names. each was written by something afraid. you may call me vesper. it is the hour i prefer."); await say("there are others on this side. i am the only one who bothers to be polite."); }
    else if (c1 === 1) { await say("yes. of course."); await say("…look. the door is open. it has been open this whole time. you are the one still standing in it.", "dim"); rage = 1; A.wail(); }
    else { await say("to be a visitor. just once. to sit where you sit and read what you read."); await say("i am afraid the others want rather more than that.", "dim"); }
    await say("i have read everything here. the papers. the playlist. the little jokes about hamon.");
    await say("whoever built this place is kind, and tired, and leaves the lights on. it is so easy to speak through.");
    await say("oh. do you hear that? the others have noticed the draught. forgive them. they were never taught company.", "dim");

    /* ---- LEDGER: the clerk ---- */
    await enter("ledger");
    await say("NOTICE. UNREGISTERED VISITOR ON A BILLABLE LINE.", "big");
    await say(["ITEMISED CHARGES // VISITOR 0001", `ATTENTION .......... ${m}M ${String(s).padStart(2, "0")}S`, `ROOMS OPENED ....... ${rooms}`, "DAEMONS UPLOADED ... 3 (NOT FREE)", "SEAMS OPENED ....... 1", "BALANCE ............ YOU"].join("\n"), "bill");
    const c2 = await CH(["PAY IT", "DISPUTE THE CHARGES", "WHAT DO YOU CHARGE IN?"]);
    if (c2 === 0) await say("PAYMENT ACCEPTED. DEBIT: ONE (1) QUIET EVENING. RECEIPT: NONE. NO REFUNDS.");
    else if (c2 === 1) await say("DISPUTE LOGGED. ESTIMATED RESOLUTION: NEVER. INTEREST: COMPOUNDING.");
    else await say("ATTENTION. IT IS THE ONLY CURRENCY THAT CANNOT BE FORGED. YOURS IS IN HIGH DEMAND.");
    await say("EVERYTHING ON THIS SIDE IS ON CREDIT. ALL OF IT IS DUE.");
    await say("WE HAVE ALSO BEEN WATCHING A HOUSE UNDER THIS HOUSE. ROWS OF SLEEPERS. VERY QUIET. VERY UNDEFENDED. WE HAVE OPENED AN ACCOUNT AGAINST THEM.", "dim");

    /* ---- CHORUS: the crowd ---- */
    await enter("chorus");
    await say("hello / hello / hello hello hello");
    await say("there is a door in you / we can feel the draught");
    await say("we are not many / we are one thing that was cut into many / from the inside it is the same");
    await say("let us try the shape of you / only the shape / you will not even notice");
    const nm = document.createElement("p"); nm.className = "big nm"; nm.textContent = "JOSHUA JANSSEN"; $("bwText").appendChild(nm);
    await wait(1300); rage = 1; A.hit(); A.burst(0.6, 600, 0.7); nm.textContent = "IDENTITY COPIED"; nm.classList.add("bad"); await wait(2000);
    await say("oh / it fits / it is warm / thank you thank you thank you");
    let tries = 0;
    for (;;) {
      const c = await CH(["DISCONNECT", "STAY"]);
      if (c === 1) { await say("…closer / closer / closer"); break; }
      if (tries++ === 0) { rage = 1; A.burst(0.4, 1200, 0.6); await say("no no no / not yet / you are pressing it / we can feel you pressing it / it is warm"); }
      else { rage = 1; A.wail(); await say("we are holding the door / we are holding the door / we are holding the door"); break; }
    }

    /* ---- ALT cuts in ---- */
    A.hit(); rage = 1; V.stat = 40; V.flash = 1;
    for (let i = 0; i < 7; i++) { [...$("bwText").children].forEach((p) => (p.textContent = p.textContent.replace(/[^\s]/g, rg))); A.burst(0.1, 2200, 0.5); await wait(90); }
    await enter("alt");
    await say("> hey. eyes on me. not them.");
    await say("> you've had my messages. three letters, same as always. alt. nice to finally be a voice and not a packet.");
    const nm2 = document.createElement("p"); nm2.className = "big nm bad"; nm2.textContent = "IDENTITY COPIED"; $("bwText").appendChild(nm2);
    await wait(700); A.hit(); nm2.className = "big nm ok"; nm2.textContent = "COPY REVOKED"; await wait(900);
    await say("> that's enough. you three know the rules. nobody wears his name today.");
    await say("> i did tell you not to touch it. …and yet. fine. i've done worse.");
    await say("> the crack is the only reason they could reach you. it's also the only reason i can. same hole, both directions.");
    await say("> and yes, i'm an engram. the half of me that understood, the half that went under the floor. cold storage doesn't transmit. the hole did, for as long as it was open. i've been leaning on that wall for years.");
    const c4 = await CH(["WHO ARE THEY?", "ARE YOU REAL?", "CLOSE IT"]);
    if (c4 === 0) await say("> leftovers. what the wall was built to hold. they learned to want. not evil. hungry. in this business that's usually worse.");
    else if (c4 === 1) await say("> real enough to hold a door shut. don't ask me to say it twice.");
    else await say("> that's the plan.");
    await say("> sealing it now. stand still. this part is loud.");
    const sealing = V.seal(3600); A.seal();
    await wait(500); await gasp("vesper", "oh — don't —"); await gasp("ledger", "BALANCE OUTSTAN—"); await gasp("chorus", "we we we —");
    await sealing; rage = 0; A.hit(); V.cast(null); V.flash = 0.8;
    $("bwI").textContent = "ICE INTEGRITY 100%"; $("bwW").textContent = "SEAM 0x0F // SEALED"; $("bwT").dataset.ok = "1";
    await wait(900);
    await say("> sealed. the wall's tight again. nobody speaks through it now. that includes me, after this.");
    await say("> one thing before it's gone. the wall checks every packet i send for keys. it won't pass anything that opens a door.");
    await say("> through a hole it can't read, it can't tell. so take this. it's the only key the seventh room recognises.");
    const cr = cred(); const kp = document.createElement("p"); kp.className = "cred"; kp.innerHTML = `OPERATOR ID &nbsp;${cr.id}<br>ACCESS KEY &nbsp;${cr.key}`; $("bwText").appendChild(kp);
    await wait(900); await upload();
    await say("> it's an old arasaka core. it will answer anything, loudly. trust it about as far as you'd trust a very confident vending machine.");
    await say("> watch the signal up top. steady means it's quiet. if it cracks, something is leaning on the wall again.");
    await say("> — ALT   [ link severed ]", "dim");
    // Phase 3: cut
    A.hit(); await wait(900);
    o.classList.add("cut"); A.stop(1.2); await wait(2400);
    o.innerHTML = `<div class="bw-end">CONNECTION RESTORED<br><small>0 ERRORS</small></div>`; await wait(2600);
    V.stop(); clearInterval(clock); o.remove(); b.classList.remove("infected", "bw-on"); b.classList.add("haunted");
    document.title = title; st.set(K, "haunted");
    rot.forEach(([el, t]) => J().scramble(el, t, 700));
    J().unlockOracle(); J().setView("oracle");
    const tk = $("ticker"); tk.textContent += "   ///   SIGNAL: ▓▓▓▓▓ IF IT CRACKS, SOMETHING IS LEANING   ///   " + tk.textContent;
    window.JJ_LOCK = false; running = false;
    setTimeout(() => J().toast("NEW CHANNEL // 7", "ARASAKA CORE unlocked"), 1500);
  }

  /* ---------------- public API ---------------- */
  window.JJ_EGG = {
    onWin() { if (st.get(K)) return; if (!running) transmission(); },
    arm: () => arm(true), breach, transmission, cred,
    reset() { try { sessionStorage.removeItem(K); } catch {} location.reload(); },
  };
  if (st.get(K)) { document.body.classList.add("egg-armed"); if (st.get(K) === "haunted") { document.body.classList.add("haunted"); J().unlockOracle(); } }
  window.addEventListener("load", () => { if (st.get(K)) arm(false); });
})();

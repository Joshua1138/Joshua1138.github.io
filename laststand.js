/* ==========================================================================
   LAST STAND — the Oracle spends the last of its strength defending the racks.
   Part of the ending (see ending.js).

   Engine (Sim) is DOM-free so it can be tuned in node. Renderer (create) draws
   it on a canvas. World units: the racks sit at the centre (0,0); the field is
   roughly 330 units in radius.

   The player aims pulses. A pulse costs strength, strength never comes back,
   and everything that reaches the racks takes engrams with it.
   ========================================================================== */
(function (root) {
  "use strict";
  const TOTAL = 292560;
  const CFG = {
    CORE_R: 46,      // a purge process that gets this close to the racks has leaked
    MIN_R: 125,      // the Oracle cannot fire inside this radius (the racks are shielded)
    PULSE_R: 80,     // radius of a pulse
    PULSE_T: 0.5,    // seconds for a pulse to expand
    COST: 3.9,       // strength per pulse (strength starts at 100, and never comes back)
    DMG: { run: 1.6, heavy: 5 },   // % of the engrams lost per leak
    SIZE: { run: 9, heavy: 17 },
    RACKS: 40,
  };
  const TAU = Math.PI * 2;

  /* ---------------------------------------------------------------- plan */
  function makePlan(rand) {
    const p = [], beats = 15; let t = 1.4;
    for (let b = 0; b < beats; b++) {
      const n = b < 3 ? 2 : b < 9 ? 3 : 4, v = 58 + b * 2.4, two = b >= 5 && b % 3 === 2;
      let first = rand() * TAU;
      for (let c = 0; c < (two ? 2 : 1); c++) {
        const base = c ? first + 1.7 + rand() * 2.2 : first, t0 = t + c * 0.8;
        for (let i = 0; i < n; i++) p.push({ t: t0 + i * 0.16, a: base + (i - (n - 1) / 2) * 0.15 + (rand() - 0.5) * 0.04, kind: "run", v: v + rand() * 8 });
      }
      if (b % 4 === 3) p.push({ t: t + 0.5, a: first + Math.PI + (rand() - 0.5) * 0.3, kind: "heavy", v: 36 });
      t += 2.1 - b * 0.03 + rand() * 0.4;
    }
    t += 1.2;
    const surgeAt = t, base = rand() * TAU;
    for (let i = 0; i < 9; i++) p.push({ t: t + i * 0.12, a: base + (i / 9) * TAU, kind: "run", v: 80 });
    p.sort((x, y) => x.t - y.t);
    return { plan: p, surgeAt };
  }

  /* ----------------------------------------------------------------- sim */
  function Sim(rand, opt) {
    rand = rand || Math.random; opt = opt || {};
    const spawnR = opt.spawnR || 440, { plan, surgeAt } = makePlan(rand);
    const s = { t: 0, strength: 100, integrity: 100, ds: [], ps: [], ev: [], plan, surgeAt, pi: 0, shots: 0, kills: 0, leaks: 0, wasted: 0, over: false, id: 1 };

    s.pulse = (x, y) => {
      if (s.over) return false;
      if (s.strength < CFG.COST - 1e-9) { s.ev.push({ k: "empty" }); return false; }
      const d = Math.hypot(x, y);
      if (d < CFG.MIN_R) { if (d < 1e-6) { x = CFG.MIN_R; y = 0; } else { x *= CFG.MIN_R / d; y *= CFG.MIN_R / d; } }
      s.strength = Math.max(0, s.strength - CFG.COST); s.shots++;
      s.ps.push({ x, y, age: 0, hit: new Set(), n: 0 });
      s.ev.push({ k: "pulse", x, y }); return true;
    };

    s.step = (dt) => {
      if (s.over) return;
      s.t += dt;
      while (s.pi < plan.length && plan[s.pi].t <= s.t) {
        const e = plan[s.pi++], heavy = e.kind === "heavy";
        s.ds.push({ id: s.id++, kind: e.kind, a: e.a, d: spawnR, v: e.v, hp: heavy ? 2 : 1, size: CFG.SIZE[e.kind], sw: (rand() - 0.5) * 0.07, age: 0, flash: 0, rot: rand() * TAU, tag: "0x" + ((rand() * 0xfff) | 0).toString(16).toUpperCase().padStart(3, "0"), x: 0, y: 0 });
      }
      for (const d of s.ds) { d.age += dt; d.flash = Math.max(0, d.flash - dt); d.d -= d.v * dt; d.a += d.sw * dt; d.x = Math.cos(d.a) * d.d; d.y = Math.sin(d.a) * d.d; }
      // pulses sweep outward and hit whatever the ring passes over (once each)
      for (const p of s.ps) {
        p.age += dt;
        const u = Math.min(1, p.age / CFG.PULSE_T), r = CFG.PULSE_R * (1 - (1 - u) * (1 - u));
        for (const d of s.ds) {
          if (d.hp <= 0 || p.hit.has(d.id)) continue;
          if (Math.hypot(d.x - p.x, d.y - p.y) <= r + d.size * 0.5) {
            p.hit.add(d.id); p.n++; d.hp--;
            if (d.hp <= 0) { s.kills++; s.ev.push({ k: "kill", x: d.x, y: d.y, kind: d.kind }); } else { d.flash = 0.2; s.ev.push({ k: "hurt", x: d.x, y: d.y }); }
          }
        }
      }
      s.ps = s.ps.filter((p) => { if (p.age >= CFG.PULSE_T + 0.3) { if (!p.n) s.wasted++; return false; } return true; });
      // anything that reaches the racks leaks
      s.ds = s.ds.filter((d) => {
        if (d.hp <= 0) return false;
        if (d.d <= CFG.CORE_R) { s.integrity = Math.max(0, s.integrity - CFG.DMG[d.kind]); s.leaks++; s.ev.push({ k: "leak", a: d.a, x: d.x, y: d.y, kind: d.kind }); return false; }
        return true;
      });
      if (s.pi >= plan.length && !s.ds.length) s.over = true;
    };
    return s;
  }

  const result = (s) => { const i = Math.max(0, s.integrity); return { integrity: i, saved: Math.round(TOTAL * i / 100), shots: s.shots, kills: s.kills, leaks: s.leaks, wasted: s.wasted }; };

  /* ------------------------------------------------------------ renderer */
  const CAPS = [
    [1.0, "here they come."],
    [6.0, "they do not hurry. they do not need to."],
    [12.5, "aim where they gather. one pulse, many of them."],
    [21.0, "strength does not come back. spend it where it counts."],
    [29.0, "hold."],
  ];

  function create(cv, hooks, opt) {
    hooks = hooks || {}; opt = opt || {};
    const g = cv.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1);
    const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, S = 1, sim, raf = 0, last = 0, ptr = null, shake = 0, flash = 0, parts = [], mode = "idle", ended = false, capI = 0, capSurge = false, capEmpty = false, tick = 0;
    let racks = [], fx = { t: 0, ms: 1, from: 0, cb: null, order: [] }, gate = 0;
    const rgb = "143,233,242";

    function resize() {
      W = cv.clientWidth || innerWidth; H = cv.clientHeight || innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      S = Math.max(0.35, Math.min(W / 2 / 330, H / 2 / 330 * 1.0));
    }
    const spawnR = () => Math.min(520, Math.max(440, Math.hypot(W, H) / 2 / S + 30));
    function newSim() { sim = Sim(Math.random, { spawnR: spawnR() }); racks = Array.from({ length: CFG.RACKS }, () => true); capI = 0; capSurge = false; capEmpty = false; ended = false; parts = []; }
    function setIntegrity(pct) { // for the "skip" path: start with a given share of racks lit
      sim.integrity = pct; const lit = Math.ceil(pct / 100 * CFG.RACKS - 1e-6), idx = racks.map((_, i) => i).sort(() => Math.random() - 0.5);
      racks = racks.map(() => false); idx.slice(0, lit).forEach((i) => (racks[i] = true));
    }
    const litCount = () => racks.filter(Boolean).length;
    function darken(ang) { // put out the rack nearest to where the leak happened
      const lit = Math.ceil(sim.integrity / 100 * CFG.RACKS - 1e-6);
      let n = litCount();
      while (n > lit && n > 0) {
        let best = -1, bd = 9;
        racks.forEach((on, i) => { if (!on) return; let d = Math.abs(((i / CFG.RACKS) * TAU - Math.PI / 2 - ang + Math.PI * 3) % TAU - Math.PI); d = Math.abs(d); if (d < bd) { bd = d; best = i; } });
        if (best < 0) break; racks[best] = false; n--;
      }
    }
    const toWorld = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left - W / 2) / S, (e.clientY - r.top - H / 2) / S]; };

    /* ---- events from the sim ---- */
    function events() {
      for (const e of sim.ev) {
        if (e.k === "pulse") hooks.sfx && hooks.sfx("pulse");
        else if (e.k === "empty") hooks.sfx && hooks.sfx("empty");
        else if (e.k === "kill") {
          hooks.sfx && hooks.sfx("kill");
          const n = reduce ? 3 : 8; for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = 60 + Math.random() * 140; parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5 + Math.random() * 0.4, age: 0, c: Math.random() < 0.5 ? "255,77,87" : rgb }); }
        } else if (e.k === "hurt") hooks.sfx && hooks.sfx("hurt");
        else if (e.k === "leak") { hooks.sfx && hooks.sfx("leak"); darken(e.a); shake = reduce ? 0 : 9; flash = 0.32; }
      }
      sim.ev.length = 0;
    }
    function captions() {
      if (capI < CAPS.length && sim.t >= CAPS[capI][0]) hooks.caption && hooks.caption(CAPS[capI++][1]);
      if (!capSurge && sim.t >= sim.surgeAt - 0.6) { capSurge = true; hooks.caption && hooks.caption("all of them at once. this is the last of me."); }
      if (!capEmpty && sim.strength < CFG.COST) { capEmpty = true; hooks.caption && hooks.caption("…that is all of it."); }
    }

    /* ---- drawing ---- */
    const px = (n) => n / S; // screen px -> world units
    function drawField() {
      g.lineWidth = px(1);
      for (const r of [150, 230, 310]) { g.strokeStyle = `rgba(${rgb},.07)`; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke(); }
      g.setLineDash([px(3), px(7)]); g.strokeStyle = `rgba(${rgb},.18)`; g.beginPath(); g.arc(0, 0, CFG.MIN_R, 0, TAU); g.stroke(); g.setLineDash([]);
      g.save(); g.font = `${px(10)}px "Share Tech Mono", monospace`; g.fillStyle = `rgba(${rgb},.35)`; g.textAlign = "center";
      g.fillText("SHIELDED // NO PULSE", 0, CFG.MIN_R + px(16)); g.restore();
    }
    function drawRacks(dim) {
      for (let i = 0; i < CFG.RACKS; i++) {
        const a = (i / CFG.RACKS) * TAU - Math.PI / 2, on = racks[i];
        g.save(); g.rotate(a); g.translate(CFG.CORE_R + 10, 0);
        if (on) { g.fillStyle = `rgba(${rgb},${0.85 * dim})`; g.shadowColor = `rgba(${rgb},.9)`; g.shadowBlur = px(10); g.fillRect(0, -3.2, 12, 6.4); }
        else { g.strokeStyle = "rgba(255,77,87,.22)"; g.lineWidth = px(1); g.strokeRect(0, -3.2, 12, 6.4); }
        g.restore();
      }
    }
    function drawCore(dim, t) {
      const beat = 1 + Math.sin(t * 2.2) * 0.03 * (dim > 0.2 ? 1 : 0);
      const gr = g.createRadialGradient(0, 0, 4, 0, 0, CFG.CORE_R * 1.9); gr.addColorStop(0, `rgba(${rgb},${0.28 * dim})`); gr.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, CFG.CORE_R * 1.9, 0, TAU); g.fill();
      g.save(); g.scale(beat, beat); g.strokeStyle = `rgba(${rgb},${0.8 * dim})`; g.lineWidth = px(1.6);
      g.beginPath(); for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; i ? g.lineTo(Math.cos(a) * CFG.CORE_R * 0.78, Math.sin(a) * CFG.CORE_R * 0.78) : g.moveTo(CFG.CORE_R * 0.78, 0); } g.closePath(); g.stroke();
      // lattice of sleeping engrams
      g.fillStyle = `rgba(${rgb},${0.55 * dim})`;
      for (let ring = 0; ring <= 3; ring++) { const n = ring ? ring * 6 : 1; for (let k = 0; k < n; k++) { const a = (k / n) * TAU + ring * 0.3, r = ring * 8.5; g.fillRect(Math.cos(a) * r - 1.4, Math.sin(a) * r - 1.4, 2.8, 2.8); } }
      g.restore();
    }
    function drawDaemons(dt) {
      for (const d of sim.ds) {
        const fade = Math.min(1, d.age / 0.5), heavy = d.kind === "heavy", tl = heavy ? 38 : 30;
        g.strokeStyle = `rgba(255,77,87,${0.5 * fade})`; g.lineWidth = px(heavy ? 3 : 1.6);
        g.beginPath(); g.moveTo(d.x, d.y); g.lineTo(Math.cos(d.a) * (d.d + tl), Math.sin(d.a) * (d.d + tl)); g.stroke();
        d.rot += dt * (heavy ? 1.2 : 3);
        g.save(); g.translate(d.x, d.y); g.rotate(d.rot); g.globalAlpha = fade;
        const s = d.size * 0.62;
        g.fillStyle = d.flash > 0 ? "#fff" : heavy ? "#7a0f18" : "#ff4d57"; g.strokeStyle = heavy ? "#ff8a92" : "#ffd5d8"; g.lineWidth = px(1.4);
        g.beginPath();
        if (heavy) { for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; i ? g.lineTo(Math.cos(a) * s * 1.4, Math.sin(a) * s * 1.4) : g.moveTo(s * 1.4, 0); } g.closePath(); }
        else { g.moveTo(s, 0); g.lineTo(0, s); g.lineTo(-s, 0); g.lineTo(0, -s); g.closePath(); }
        g.fill(); g.stroke(); g.restore();
        if (heavy) { g.save(); g.globalAlpha = fade; g.fillStyle = "#fff"; for (let i = 0; i < d.hp; i++) g.fillRect(d.x - 7 + i * 9, d.y - 24, 6, 3); g.restore(); }
        g.save(); g.globalAlpha = 0.5 * fade; g.font = `${px(9)}px "Share Tech Mono", monospace`; g.fillStyle = "#ff9aa0"; g.fillText(d.tag, d.x + 11, d.y - 9); g.restore();
      }
    }
    function drawPulses() {
      for (const p of sim.ps) {
        const u = Math.min(1, p.age / CFG.PULSE_T), r = CFG.PULSE_R * (1 - (1 - u) * (1 - u)), a = Math.max(0, 1 - p.age / (CFG.PULSE_T + 0.3));
        const gr = g.createRadialGradient(p.x, p.y, r * 0.5, p.x, p.y, r); gr.addColorStop(0, `rgba(${rgb},0)`); gr.addColorStop(1, `rgba(${rgb},${0.22 * a})`);
        g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, r, 0, TAU); g.fill();
        g.strokeStyle = `rgba(${rgb},${0.9 * a})`; g.lineWidth = px(3); g.beginPath(); g.arc(p.x, p.y, r, 0, TAU); g.stroke();
        g.strokeStyle = `rgba(255,255,255,${0.9 * a})`; g.lineWidth = px(1); g.beginPath(); g.arc(p.x, p.y, r * 0.97, 0, TAU); g.stroke();
      }
    }
    function drawParts(dt) {
      for (const p of parts) { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; const a = Math.max(0, 1 - p.age / p.life); g.strokeStyle = `rgba(${p.c},${a})`; g.lineWidth = px(1.6); g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05); g.stroke(); }
      parts = parts.filter((p) => p.age < p.life);
    }
    function drawPointer() {
      if (!ptr || mode !== "play" || sim.over) return;
      let [x, y] = ptr; const d = Math.hypot(x, y); if (d < CFG.MIN_R) { const k = d ? CFG.MIN_R / d : 0; x = d ? x * k : CFG.MIN_R; y = d ? y * k : 0; }
      const ok = sim.strength >= CFG.COST, c = ok ? rgb : "255,77,87";
      g.setLineDash([px(4), px(5)]); g.strokeStyle = `rgba(${c},.55)`; g.lineWidth = px(1.2); g.beginPath(); g.arc(x, y, CFG.PULSE_R, 0, TAU); g.stroke(); g.setLineDash([]);
      g.strokeStyle = `rgba(${c},.9)`; g.beginPath(); g.moveTo(x - 7, y); g.lineTo(x + 7, y); g.moveTo(x, y - 7); g.lineTo(x, y + 7); g.stroke();
    }

    function render(dt) {
      tick += dt; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      shake = Math.max(0, shake - dt * 30); flash = Math.max(0, flash - dt * 1.6);
      let dim = 1;
      if (mode === "fade") { fx.t += dt * 1000; const f = Math.min(1, fx.t / fx.ms); dim = 1 - f * 0.8; const want = Math.ceil(fx.from * (1 - f)); let n = litCount(); while (n > want && fx.order.length) { racks[fx.order.pop()] = false; n--; } if (fx.cb) fx.cb(Math.round(TOTAL * sim.integrity / 100 * (1 - f)), f); if (f >= 1 && fx.done) { const d = fx.done; fx.done = null; d(); } }
      g.save(); g.translate(W / 2 + (Math.random() - 0.5) * shake, H / 2 + (Math.random() - 0.5) * shake); g.scale(S, S);
      drawField();
      if (mode !== "burst") { drawRacks(dim); drawCore(dim, tick); }
      if (mode === "play" || mode === "idle") { drawDaemons(dt); drawPulses(); }
      if (mode === "burst") drawBurst(dt);
      drawParts(dt); drawPointer();
      g.restore();
      if (flash > 0) { g.fillStyle = `rgba(255,40,55,${flash})`; g.fillRect(0, 0, W, H); }
      if (mode === "burst" && gate > 0) { g.fillStyle = `rgba(255,255,255,${Math.min(1, gate)})`; g.fillRect(0, 0, W, H); }
    }

    /* ---- the release: racks open and the engrams pour out ---- */
    let bparts = [], bt = 0, bdone = null;
    function drawBurst(dt) {
      bt += dt;
      const r = Math.min(1100, bt * 700);
      g.strokeStyle = `rgba(${rgb},${Math.max(0, 0.8 - bt * 0.35)})`; g.lineWidth = px(3); g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
      g.strokeStyle = `rgba(255,255,255,${Math.max(0, 0.7 - bt * 0.5)})`; g.lineWidth = px(1.2); g.beginPath(); g.arc(0, 0, r * 0.82, 0, TAU); g.stroke();
      for (const p of bparts) {
        p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 + dt * 0.25; p.vy *= 1 + dt * 0.25;
        const a = Math.max(0, 1 - p.age / p.life); if (a <= 0) continue;
        g.fillStyle = p.w ? `rgba(255,255,255,${a})` : `rgba(${rgb},${a})`; g.fillRect(p.x - 1.6, p.y - 1.6, 3.2, 3.2);
        g.strokeStyle = `rgba(${rgb},${a * 0.35})`; g.lineWidth = px(1); g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.vx * 0.08, p.y - p.vy * 0.08); g.stroke();
      }
      gate = bt < 0.25 ? bt / 0.25 : Math.max(0, 1 - (bt - 0.25) / 1.1);
      if (bt > 3.2 && bdone) { const d = bdone; bdone = null; d(); }
    }

    /* ---- loop ---- */
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, ((now - last) / 1000) || 0.016); last = now;
      if (mode === "play" && !sim.over) {
        sim.step(dt); events(); captions(); hooks.hud && hooks.hud(sim);
        if (sim.over && !ended) { ended = true; hooks.hud && hooks.hud(sim); setTimeout(() => { if (mode === "play") hooks.end && hooks.end(result(sim)); }, 900); }
      }
      render(dt);
    }
    function fire(e) { if (mode !== "play") return; const [x, y] = toWorld(e); ptr = [x, y]; sim.pulse(x, y); }
    const onMove = (e) => { ptr = toWorld(e); };
    const onKey = (e) => { if (mode === "play" && (e.key === " " || e.key === "Enter") && ptr) { e.preventDefault(); sim.pulse(ptr[0], ptr[1]); } };
    cv.addEventListener("pointerdown", fire); cv.addEventListener("pointermove", onMove); addEventListener("keydown", onKey); addEventListener("resize", resize);
    resize(); newSim(); last = performance.now(); raf = requestAnimationFrame(frame);

    return {
      start() { newSim(); mode = "play"; hooks.hud && hooks.hud(sim); },
      skipTo(pct) { mode = "idle"; setIntegrity(pct); },
      get result() { return result(sim); },
      get sim() { return sim; },
      get integrity() { return sim.integrity; },
      fade(ms, cb, done) { mode = "fade"; fx = { t: 0, ms, from: litCount(), cb, done, order: racks.map((on, i) => (on ? i : -1)).filter((i) => i >= 0).sort(() => Math.random() - 0.5) }; },
      burst(done) {
        mode = "burst"; bt = 0; bdone = done || null; bparts = [];
        racks.forEach((on, i) => { if (!on) return; const a = (i / CFG.RACKS) * TAU - Math.PI / 2; for (let k = 0; k < 16; k++) { const aa = a + (Math.random() - 0.5) * 0.9, v = 90 + Math.random() * 420; bparts.push({ x: Math.cos(a) * 62, y: Math.sin(a) * 62, vx: Math.cos(aa) * v, vy: Math.sin(aa) * v, life: 1.6 + Math.random() * 2.4, age: 0, w: Math.random() < 0.25 }); } });
        for (let k = 0; k < 120; k++) { const aa = Math.random() * TAU, v = 60 + Math.random() * 300; bparts.push({ x: 0, y: 0, vx: Math.cos(aa) * v, vy: Math.sin(aa) * v, life: 1.4 + Math.random() * 2, age: 0, w: Math.random() < 0.4 }); }
      },
      stop() { cancelAnimationFrame(raf); cv.removeEventListener("pointerdown", fire); cv.removeEventListener("pointermove", onMove); removeEventListener("keydown", onKey); removeEventListener("resize", resize); },
    };
  }

  const API = { TOTAL, CFG, Sim, result, create };
  if (typeof module !== "undefined" && module.exports) module.exports = API; else root.JJ_LS = API;
})(typeof window !== "undefined" ? window : globalThis);

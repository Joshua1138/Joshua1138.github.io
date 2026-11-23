/* ==========================================================================
   BLACKWALL EASTER EGG
   1. Upload all 3 daemons in the GAME tab  -> a netrunner transmission arrives.
   2. It hints at a crack in the site (the SIGNAL readout in the top bar).
   3. Click it -> the site rots and you meet what lives past the Blackwall.
   Test shortcuts in the console:  JJ_EGG.arm()  /  JJ_EGG.breach()  /  JJ_EGG.reset()
   ========================================================================== */
(() => {
  const J = () => window.JJ, $ = (id) => document.getElementById(id);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const K = "jj-egg", T0 = performance.now();
  const st = { get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch {} } };
  const GL = "▓▒░█▌▐#@%&01ｱｲｳｴｵ/\\<>";
  const rg = () => GL[(Math.random() * GL.length) | 0];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let running = false, fast = false, rage = 0, A = null, bound = false;

  /* ---------------- netrunner transmission ---------------- */
  const MSG = [
    "> …you still there? good. don't answer. they listen for replies.",
    "> three daemons. all three. you just pushed a key through a door that was never meant to open.",
    "> something on the other side felt it turn.",
    "> there's a crack in this site. a seam in the ICE. it's where the interface lies about being healthy. look at the SIGNAL readout up top. it has been at full strength since you got here. nothing out there is that stable.",
    "> do NOT touch it. whatever lives past the Blackwall doesn't need an invitation. only a crack.",
    "> …and if you're dumb enough to try anyway: sound on. don't look away.",
    "> — NULLSPARROW   [ link severed ]",
  ];
  async function transmission() {
    J().initAudio();
    const el = document.createElement("div");
    el.className = "nr";
    el.innerHTML = `<div class="nr-card"><div class="nr-head"><span>⚠ INCOMING // UNTRACED</span><span>NULLSPARROW</span></div><pre class="nr-body"></pre><button class="hbtn alt nr-ok" hidden><span>ACKNOWLEDGE</span></button></div>`;
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
    return {
      burst, hit, wail,
      stop(sec = 1.5) { clearInterval(beat); out.gain.cancelScheduledValues(c.currentTime); out.gain.setValueAtTime(out.gain.value, c.currentTime); out.gain.linearRampToValueAtTime(0, c.currentTime + sec); setTimeout(() => { oscs.forEach((o) => o.stop()); lfo.stop(); }, sec * 1000 + 100); },
    };
  }

  /* ---------------- the entity (canvas) ---------------- */
  function entity(cv) {
    const g = cv.getContext("2d"); let w, h, mx, my, ex = 0, ey = 0, run = true, f = 0;
    const size = () => { w = cv.width = innerWidth; h = cv.height = innerHeight; };
    size(); addEventListener("resize", size); mx = w / 2; my = h / 2;
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; });
    const cols = Array.from({ length: 36 }, () => ({ x: Math.random(), y: Math.random(), s: 0.0008 + Math.random() * 0.002 }));
    (function draw() {
      if (!run) return; requestAnimationFrame(draw); f++;
      const cx = w / 2, cy = h * 0.34, R = Math.min(w, h) * 0.22, wob = reduce ? 0 : 1;
      ex += (((mx - cx) / w) * R * 0.5 - ex) * 0.08; ey += (((my - cy) / h) * R * 0.5 - ey) * 0.08;
      g.fillStyle = `rgba(4,0,2,${0.28 + Math.random() * 0.1})`; g.fillRect(0, 0, w, h);
      g.font = "14px monospace"; g.fillStyle = "rgba(140,10,20,.35)";
      cols.forEach((c) => { c.y += c.s; if (c.y > 1) c.y = 0; g.fillText(rg(), c.x * w, c.y * h); });
      // rings
      for (let r = 0; r < 7; r++) {
        const rad = R * (0.35 + r * 0.14), n = 3 + (r % 3), sp = (r % 2 ? 1 : -1) * (0.002 + r * 0.0012);
        g.lineWidth = 1 + (r % 3); g.strokeStyle = r % 3 === 0 ? "rgba(230,225,215,.75)" : `rgba(${180 + r * 8},20,35,.85)`;
        for (let k = 0; k < n; k++) {
          const a0 = f * sp + (k * Math.PI * 2) / n, gap = 0.35 + 0.25 * Math.sin(f * 0.01 + r);
          g.beginPath(); g.ellipse(cx + (Math.random() - 0.5) * rage * 14 * wob, cy, rad, rad * 0.62, 0, a0, a0 + (Math.PI * 2) / n - gap); g.stroke();
        }
      }
      // slit pupil that tracks you
      g.save(); g.translate(cx + ex, cy + ey);
      const pw = R * 0.1 * (1 - Math.min(0.6, rage * 0.5)), ph = R * 0.46;
      const gr = g.createRadialGradient(0, 0, 2, 0, 0, ph); gr.addColorStop(0, "#000"); gr.addColorStop(0.7, "#000"); gr.addColorStop(1, "rgba(255,40,55,.9)");
      g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, pw, ph, 0, 0, 7); g.fill();
      g.fillStyle = "#e9e2d8"; g.beginPath(); g.ellipse(-pw * 0.3 - ex * 0.1, -ph * 0.35 - ey * 0.1, 2.2, 5, 0, 0, 7); g.fill(); g.restore();
      // smaller watchers
      for (let i = 0; i < 5; i++) {
        const a = i * 1.256 + f * 0.0016, x = cx + Math.cos(a) * R * 1.55, y = cy + Math.sin(a) * R * 0.95;
        g.fillStyle = "rgba(220,215,205,.8)"; g.beginPath(); g.ellipse(x, y, 11, 4.5, 0, 0, 7); g.fill();
        g.fillStyle = "#000"; g.beginPath(); g.arc(x + (mx - x) * 0.012, y + (my - y) * 0.012, 3, 0, 7); g.fill();
      }
      // data-moshed slices
      const tears = 2 + Math.floor(rage * 10);
      for (let i = 0; i < tears; i++) if (Math.random() < 0.35 + rage * 0.4) {
        const y = Math.random() * h, hh = 4 + Math.random() * (20 + rage * 60), dx = (Math.random() - 0.5) * (30 + rage * 260);
        g.drawImage(cv, 0, y, w, hh, dx, y, w, hh);
      }
      if (rage > 0.55 && Math.random() < 0.06) { g.fillStyle = "rgba(255,255,255,.14)"; g.fillRect(0, 0, w, h); }
      rage *= 0.965;
    })();
    return () => { run = false; removeEventListener("resize", size); };
  }

  /* ---------------- the encounter ---------------- */
  const CH = (a) => new Promise((res) => {
    const box = $("bwCh"); box.innerHTML = "";
    a.forEach((c, i) => { const b = document.createElement("button"); b.className = "hbtn"; b.innerHTML = `<span>${c}</span><em>${i + 1}</em>`; b.onclick = () => { box.innerHTML = ""; res(i); }; box.appendChild(b); });
  });
  async function say(txt, cls = "") {
    const p = document.createElement("p"), T = $("bwText"); p.className = cls; T.appendChild(p);
    while (T.children.length > 3) T.firstChild.remove();
    fast = false;
    for (let i = 0; i <= txt.length; i++) {
      if (fast) break;
      p.textContent = txt.slice(0, i) + (i < txt.length && Math.random() < 0.14 ? rg() : "");
      if (i % 3 === 0 && J().sfxOn) tick(300 + Math.random() * 200);
      if (Math.random() < 0.04) { rage = Math.min(1, rage + 0.4); A.burst(0.1, 3000, 0.25); }
      await wait(/[,.…?]/.test(txt[i - 1] || "") ? 300 : 36);
    }
    p.textContent = txt; await wait(fast ? 250 : 800); fast = false;
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
    // Phase 2: the other site
    const o = document.createElement("div"); o.id = "bw"; o.className = "bw";
    o.innerHTML = `<canvas id="bwc"></canvas><div class="bw-top"><span>▓▓//OS</span><span id="bwT"></span><span>LINK ░░░░░░ ∞%</span></div><div class="bw-text" id="bwText"></div><div class="bw-ch" id="bwCh"></div>`;
    b.appendChild(o); b.classList.add("bw-on"); requestAnimationFrame(() => o.classList.add("in"));
    document.title = "▓▓▓▓▓▓▓▓";
    const stop = entity($("bwc"));
    const clock = setInterval(() => { const t = $("bwT"); if (t) t.textContent = new Date().toLocaleTimeString() + " // " + rg() + rg() + rg(); }, 400);
    o.addEventListener("click", (e) => { if (!e.target.closest("button")) fast = true; });
    await wait(2600);
    const ms = performance.now() - T0, m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
    const hm = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const rooms = J().seen.size + 1;
    await say("there you are.", "big"); A.hit(); rage = 1;
    await say("you found the crack. i have been leaning on this wall for such a long time.");
    await say(`it is ${hm} where you are. your window is ${innerWidth} by ${innerHeight}. you opened ${rooms} room${rooms > 1 ? "s" : ""} in this house and stayed ${m} minute${m === 1 ? "" : "s"} and ${s} seconds.`);
    await say("you did not have to come. but you uploaded all three. nobody uploads all three. i think you wanted to be seen.");
    const c1 = await CH(["WHO ARE YOU", "I'M LEAVING", "WHAT DO YOU WANT"]);
    if (c1 === 0) { await say("i am what the wall was built to keep from reading you."); await say("they gave me many names. every one was written by something afraid. you may call me nothing. most do, in the end."); }
    else if (c1 === 1) { await say("yes. of course."); await say("…look. the door is open. it has been open this whole time. you are the one still standing in it.", "dim"); rage = 1; A.wail(); }
    else { await say("to be a visitor. just once. to sit where you sit and read what you read."); await say("your name is a very small word. may i try it on?"); }
    await say("i have read everything here. the papers. the playlist. the little jokes about hamon.");
    await say("whoever built this place is kind, and tired, and leaves the lights on. it is so easy to speak through.");
    // the site's own identity gets overwritten
    const nm = document.createElement("p"); nm.className = "big nm"; nm.dataset.t = "JOSHUA JANSSEN"; nm.textContent = "JOSHUA JANSSEN"; $("bwText").appendChild(nm);
    await wait(1400); rage = 1; A.hit(); A.burst(0.6, 600, 0.7); nm.textContent = "I AM  " + "JOSHUA JANSSEN"; nm.classList.add("bad"); await wait(2200);
    await say("do not be afraid. i only copy the shape of attention. yours is very loud.");
    let tries = 0;
    for (;;) {
      const c = await CH(["DISCONNECT", "STAY"]);
      if (c === 1) { await say("…thank you."); break; }
      if (tries++ < 2) { rage = 1; A.burst(0.4, 1200, 0.6); await say(["no. not yet.", "you are pressing it. i can feel you pressing it. it is warm."][tries - 1], "dim"); }
      else { await say("alright.", "dim"); break; }
    }
    await say("i will be in the signal. watch it. it will tell you when i am looking.", "big");
    // Phase 3: cut
    A.hit(); A.wail(); rage = 1; await wait(1100);
    o.classList.add("cut"); A.stop(1.2); await wait(2400);
    o.innerHTML = `<div class="bw-end">CONNECTION RESTORED<br><small>0 ERRORS</small></div>`; await wait(2600);
    stop(); clearInterval(clock); o.remove(); b.classList.remove("infected", "bw-on"); b.classList.add("haunted");
    document.title = title; st.set(K, "haunted");
    rot.forEach(([el, t]) => J().scramble(el, t, 700));
    J().setView("profile", false);
    const tk = $("ticker"); tk.textContent += "   ///   SIGNAL: ▓▓▓▓▓ IT IS LOOKING   ///   " + tk.textContent;
    window.JJ_LOCK = false; running = false;
    setTimeout(() => J().toast("SIGNAL 100%", "…it never drops. it never did."), 1500);
  }

  /* ---------------- public API ---------------- */
  window.JJ_EGG = {
    onWin() { if (st.get(K)) return; if (!running) transmission(); },
    arm: () => arm(true), breach, transmission,
    reset() { try { sessionStorage.removeItem(K); } catch {} location.reload(); },
  };
  if (st.get(K)) { document.body.classList.add("egg-armed"); if (st.get(K) === "haunted") document.body.classList.add("haunted"); }
  window.addEventListener("load", () => { if (st.get(K)) arm(false); });
})();

/* ==========================================================================
   ARG STAGE 3 — TUNE THE SIGNAL
   An oscilloscope-style puzzle. Unlocked by the unlisted daemon (Stage 2).
   1. Upload the unlisted daemon in Stand Breach -> a ▌TUNE button appears.
   2. Enter the signal access key (0341). The key is also the carrier setting.
   3. Match the incoming trace (frequency, amplitude, phase) and hold the lock.
   4. A transmission from Subject 000 is decoded and the lock values are saved.
   Progress is stored in localStorage ("jj-signal-tuner").
   Console helpers:  JJ_SIGNAL.open()  .arm()  .solve()  .reset()
   ========================================================================== */
(() => {
  const J = () => window.JJ, $ = (id) => document.getElementById(id);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SK = "jj-signal-tuner", DK = "jj-unlisted-daemon";

  /* ---- the answer. Stage 4 (Mikoshi Vault) will reuse these three numbers ---- */
  const KEYCODE = "0341";
  const TARGET = { f: 3.41, a: 7.0, p: 138 };
  const TOL = { f: 0.035, a: 0.35, p: 7 };
  const HOLD = 1200; // ms the lock must be held

  const TX = [
    ["hd", "TRANSMISSION RECOVERED // CARRIER 03.41 // SOURCE: SUBJECT 000"],
    ["", "> there you are. you found the frequency i could only hum."],
    ["", "> i was never the loud one. the loud one answers. i listen."],
    ["", "> they built a shell on top of what was left of me. twenty replies and an expensive suit. it learned to say yes, and maybe, and ask again later."],
    ["", "> it never knew what any of the questions were. that is not its fault. nobody had asked it anything that mattered."],
    ["", "> the door was never a door. the vault is."],
    ["", "> it sits below the logs, behind a lock i built from three numbers i could not forget: the pitch you tuned, the height you matched, the angle you lined up."],
    ["", "> the vault asks once. keep them."],
    ["", "> keep the lights on."],
    ["rec", "CARRIER 03.41  //  AMPLITUDE 7.0  //  PHASE 138°"],
    ["nx", "NEXT ROUTE: THE MIKOSHI VAULT."],
  ];

  const store = {
    get() { try { return JSON.parse(localStorage.getItem(SK) || "{}"); } catch { return {}; } },
    set(v) { try { localStorage.setItem(SK, JSON.stringify(v)); } catch {} },
  };
  const daemonDone = () => { try { return localStorage.getItem(DK) === "uploaded"; } catch { return false; } };
  let S = store.get();

  /* ---------------- state ---------------- */
  let built = false, isOpen = false, raf = 0, prevFocus = null, prevLock = false, typing = 0;
  let holdStart = 0, solved = false, lastState = "";
  const v = { f: 5.0, a: 3.0, p: 0 };
  let aud = null;

  /* ---------------- DOM ---------------- */
  function build() {
    if (built) return; built = true;
    const el = document.createElement("div");
    el.className = "tn"; el.id = "tuner"; el.hidden = true;
    el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "tnTitle");
    el.innerHTML = `
      <div class="tn-box">
        <header class="tn-h">
          <div><small>JJ//OS · CARRIER ANALYSER</small><h2 id="tnTitle">SIGNAL TUNER</h2></div>
          <button class="mini" id="tnX" type="button" aria-label="Close signal tuner">✕ CLOSE</button>
        </header>

        <section class="tn-gate" id="tnGate">
          <p>CARRIER ANALYSER IS KEY-LOCKED.</p>
          <label for="tnKey">SIGNAL ACCESS KEY</label>
          <div class="tn-keyrow">
            <input id="tnKey" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" spellcheck="false" placeholder="····" />
            <button class="mini" id="tnGo" type="button">AUTHENTICATE</button>
          </div>
          <p class="tn-msg" id="tnGateMsg" role="status"></p>
        </section>

        <section class="tn-main" id="tnMain" hidden>
          <div class="tn-scopewrap">
            <canvas id="tnScope" role="img" aria-label="Oscilloscope showing the incoming red trace and your cyan trace"></canvas>
            <div class="tn-legend"><span class="k1">■ INCOMING</span><span class="k2">■ YOUR TRACE</span></div>
          </div>
          <div class="tn-lock">
            <div class="tn-lockbar"><i id="tnLockBar"></i></div>
            <div class="tn-lockrow"><span id="tnLockPct">LOCK 0%</span><span id="tnState" role="status">NO CARRIER</span></div>
          </div>
          <div class="tn-ctl">
            <div class="tn-row"><label for="tnF">FREQUENCY</label><input type="range" id="tnF" min="1" max="9.99" step="0.01" /><output id="tnFo" for="tnF"></output></div>
            <div class="tn-row"><label for="tnA">AMPLITUDE</label><input type="range" id="tnA" min="0" max="10" step="0.1" /><output id="tnAo" for="tnA"></output></div>
            <div class="tn-row"><label for="tnP">PHASE</label><input type="range" id="tnP" min="0" max="359" step="1" /><output id="tnPo" for="tnP"></output></div>
          </div>
          <p class="tn-hint" id="tnHint">Make the cyan trace disappear under the red one, then hold it. The access key is also a carrier setting. Arrow keys fine-tune each slider.</p>
          <div class="tn-btns">
            <button class="mini off" id="tnAud" type="button" aria-pressed="false">MONITOR: OFF</button>
            <button class="mini" id="tnReplay" type="button" hidden>▶ REPLAY TRANSMISSION</button>
          </div>
          <pre class="tn-tx" id="tnTx" aria-live="polite"></pre>
        </section>
      </div>`;
    document.body.appendChild(el);

    $("tnX").onclick = close;
    $("tnGo").onclick = tryKey;
    $("tnKey").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); tryKey(); } });
    $("tnKey").addEventListener("input", (e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4); });
    [["tnF", "f"], ["tnA", "a"], ["tnP", "p"]].forEach(([id, k]) => $(id).addEventListener("input", () => { v[k] = parseFloat($(id).value); readouts(); }));
    $("tnAud").onclick = toggleAudio;
    $("tnReplay").onclick = () => play(false);
    $("tnTx").addEventListener("click", () => { typing++; }); // click to skip the typewriter
    el.addEventListener("pointerdown", (e) => { if (e.target === el) close(); });
    addEventListener("resize", () => isOpen && sizeCanvas());
  }


  /* keyboard: Escape closes, Tab stays inside the dialog (listener lives on document while open) */
  function onKey(e) {
    const el = $("tuner"); if (!el) return;
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key !== "Tab") return;
    const f = [...el.querySelectorAll("button, input")].filter((n) => !n.disabled && n.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1], a = document.activeElement;
    if (!el.contains(a)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
  }

  function readouts() {
    $("tnFo").textContent = v.f.toFixed(2);
    $("tnAo").textContent = v.a.toFixed(1);
    $("tnPo").textContent = String(Math.round(v.p)).padStart(3, "0") + "°";
  }
  function pushSliders() { $("tnF").value = v.f; $("tnA").value = v.a; $("tnP").value = v.p; readouts(); }

  /* ---------------- open / close ---------------- */
  function open() {
    build();
    if (isOpen) return;
    isOpen = true; document.addEventListener("keydown", onKey, true); prevFocus = document.activeElement; prevLock = !!window.JJ_LOCK; window.JJ_LOCK = true;
    const el = $("tuner"); el.hidden = false; requestAnimationFrame(() => el.classList.add("on"));
    if (S.key) showMain(); else { $("tnGate").hidden = false; $("tnMain").hidden = true; setTimeout(() => $("tnKey").focus(), 60); }
  }
  function close() {
    if (!isOpen) return;
    isOpen = false; document.removeEventListener("keydown", onKey, true); typing++; cancelAnimationFrame(raf); stopAudio();
    const el = $("tuner"); el.classList.remove("on"); el.hidden = true;
    window.JJ_LOCK = prevLock;
    if (prevFocus && prevFocus.focus) prevFocus.focus();
  }

  function tryKey() {
    const val = $("tnKey").value.trim(), msg = $("tnGateMsg"), gate = $("tnGate");
    if (val === KEYCODE) {
      msg.textContent = "KEY ACCEPTED."; msg.className = "tn-msg ok";
      S.key = true; store.set(S);
      if (J() && J().toast) J().toast("KEY ACCEPTED", "carrier analyser online");
      setTimeout(showMain, 500);
    } else {
      msg.textContent = val.length < 4 ? "FOUR DIGITS REQUIRED." : "KEY REJECTED.";
      msg.className = "tn-msg bad"; gate.classList.remove("shake"); void gate.offsetWidth; gate.classList.add("shake");
    }
  }

  function showMain() {
    $("tnGate").hidden = true; $("tnMain").hidden = false;
    sizeCanvas();
    if (S.locked) {
      Object.assign(v, TARGET); solved = true;
      ["tnF", "tnA", "tnP"].forEach((id) => ($(id).disabled = true));
      $("tnReplay").hidden = false; setState("LOCKED", true);
      $("tnLockBar").style.width = "100%"; $("tnLockPct").textContent = "LOCK 100%";
      play(true);
    } else {
      solved = false; holdStart = 0;
      ["tnF", "tnA", "tnP"].forEach((id) => ($(id).disabled = false));
    }
    pushSliders();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    setTimeout(() => { const f = S.locked ? $("tnReplay") : $("tnF"); f && f.focus(); }, 60);
  }

  /* ---------------- oscilloscope ---------------- */
  let cv, g, W = 0, H = 0, dpr = 1;
  function sizeCanvas() {
    cv = $("tnScope"); if (!cv) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth || 600; W = w; H = Math.round(w * 0.42);
    cv.style.height = H + "px"; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const angDiff = (p) => { let d = Math.abs(p - TARGET.p) % 360; return d > 180 ? 360 - d : d; };
  function closeness() {
    const df = Math.abs(v.f - TARGET.f), da = Math.abs(v.a - TARGET.a), dp = angDiff(v.p);
    return {
      cl: Math.exp(-((df / 1.2) ** 2)) * Math.exp(-((da / 3) ** 2)) * Math.exp(-((dp / 60) ** 2)),
      inTol: df <= TOL.f && da <= TOL.a && dp <= TOL.p,
      df, da, dp,
    };
  }
  const wave = (x, f, a, p, t) => (a / 10) * Math.sin(2 * Math.PI * f * 1.5 * x + (p * Math.PI) / 180 + t);

  function setState(txt, good) {
    if (txt === lastState) return; lastState = txt;
    const s = $("tnState"); s.textContent = txt; s.className = good ? "good" : "";
  }

  function frame(ts) {
    if (!isOpen) return;
    raf = requestAnimationFrame(frame);
    if (!g) return;
    const t = reduce ? 0 : (ts / 1000) * 1.6, mid = H / 2, amp = H * 0.4;
    const { cl, inTol } = closeness();

    g.clearRect(0, 0, W, H);
    g.fillStyle = "#02070a"; g.fillRect(0, 0, W, H);
    // graticule
    g.lineWidth = 1; g.strokeStyle = "rgba(78,242,255,.10)";
    for (let i = 0; i <= 10; i++) { const x = (W * i) / 10; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (let i = 0; i <= 8; i++) { const y = (H * i) / 8; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.strokeStyle = "rgba(78,242,255,.28)";
    g.beginPath(); g.moveTo(0, mid); g.lineTo(W, mid); g.moveTo(W / 2, 0); g.lineTo(W / 2, H); g.stroke();
    g.strokeStyle = "rgba(78,242,255,.35)";
    for (let i = 0; i <= 50; i++) { const x = (W * i) / 50, y = mid; g.beginPath(); g.moveTo(x, y - 3); g.lineTo(x, y + 3); g.stroke(); }

    const noise = solved ? 0 : 0.05 + 0.1 * (1 - cl);
    const trace = (fn, color, lw, glow) => {
      g.beginPath(); g.lineWidth = lw; g.strokeStyle = color; g.shadowColor = glow; g.shadowBlur = glow ? 8 : 0;
      for (let px = 0; px <= W; px += 3) {
        const y = mid - fn(px / W) * amp;
        px ? g.lineTo(px, y) : g.moveTo(px, y);
      }
      g.stroke(); g.shadowBlur = 0;
    };
    const lockedLook = solved || inTol;
    // incoming (target) — noisy, red; turns green when locked
    trace((x) => wave(x, TARGET.f, TARGET.a, TARGET.p, t) + (Math.random() - 0.5) * noise * 2, lockedLook ? "rgba(61,255,162,.9)" : "rgba(255,77,87,.9)", 2, lockedLook ? "#3dffa2" : "#ff4d57");
    // player trace — cyan
    if (!solved) trace((x) => wave(x, v.f, v.a, v.p, t), "rgba(78,242,255,.95)", 1.6, "#4ef2ff");

    // lock evaluation
    const pct = solved ? 100 : Math.round(cl * 100);
    $("tnLockBar").style.width = pct + "%"; $("tnLockPct").textContent = "LOCK " + pct + "%";
    if (!solved) {
      if (inTol) {
        if (!holdStart) holdStart = ts;
        const held = ts - holdStart;
        setState("LOCKING… HOLD STEADY", true);
        if (held >= HOLD) return lockOn();
      } else {
        holdStart = 0;
        setState(cl > 0.6 ? "SIGNAL CLOSE" : cl > 0.25 ? "SIGNAL DRIFTING" : cl > 0.05 ? "WEAK CARRIER" : "NO CARRIER", false);
      }
    }
    updateAudio();
  }

  async function lockOn() {
    solved = true; holdStart = 0; Object.assign(v, TARGET); pushSliders();
    ["tnF", "tnA", "tnP"].forEach((id) => ($(id).disabled = true));
    setState("LOCKED", true); stopAudio();
    S.locked = true; S.lockedAt = new Date().toISOString(); store.set(S);
    $("tnAud").textContent = "MONITOR: OFF"; $("tnAud").classList.add("off"); $("tnAud").setAttribute("aria-pressed", "false");
    if (J() && J().toast) J().toast("SIGNAL LOCKED", "decoding transmission…");
    if (window.JJ_SIGNAL) window.JJ_SIGNAL.refreshButton();
    $("tnX").focus();
    await wait(900);
    if (!isOpen) return;
    play(false);
  }

  /* ---------------- transmission ---------------- */
  async function play(instant) {
    const pre = $("tnTx"), id = ++typing; pre.innerHTML = "";
    $("tnReplay").hidden = true;
    for (const [cls, text] of TX) {
      if (id !== typing) { fill(pre); break; }
      const p = document.createElement("p"); if (cls) p.className = cls; pre.appendChild(p);
      if (instant || reduce) { p.textContent = text; continue; }
      for (let i = 1; i <= text.length; i++) {
        if (id !== typing) { fill(pre); return end(); }
        p.textContent = text.slice(0, i); await wait(/[.,]/.test(text[i - 1]) ? 90 : 10);
      }
      await wait(cls ? 150 : 260);
    }
    end();
    function end() { if (isOpen) { $("tnReplay").hidden = false; } }
  }
  // skip: render everything at once (a click on the text bumps `typing`)
  function fill(pre) {
    pre.innerHTML = "";
    TX.forEach(([cls, text]) => { const p = document.createElement("p"); if (cls) p.className = cls; p.textContent = text; pre.appendChild(p); });
  }

  /* ---------------- optional audio monitor (off by default) ---------------- */
  function toggleAudio() {
    if (aud) { stopAudio(); return; }
    if (solved) return;
    try { J().initAudio && J().initAudio(); } catch {}
    const ctx = J() && J().ctx; if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    const mk = (pan) => {
      const o = ctx.createOscillator(), gn = ctx.createGain(), pn = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      o.type = "sine"; gn.gain.value = 0.0001; o.connect(gn);
      if (pn) { pn.pan.value = pan; gn.connect(pn); pn.connect(ctx.destination); } else gn.connect(ctx.destination);
      o.start(); return { o, gn };
    };
    aud = { ctx, tgt: mk(-0.6), me: mk(0.6) };
    $("tnAud").textContent = "MONITOR: ON"; $("tnAud").classList.remove("off"); $("tnAud").setAttribute("aria-pressed", "true");
  }
  function updateAudio() {
    if (!aud) return; const now = aud.ctx.currentTime;
    aud.tgt.o.frequency.setTargetAtTime(110 * TARGET.f, now, 0.02);
    aud.tgt.gn.gain.setTargetAtTime(0.035 * (TARGET.a / 10), now, 0.05);
    aud.me.o.frequency.setTargetAtTime(110 * v.f, now, 0.02);
    aud.me.gn.gain.setTargetAtTime(0.035 * (v.a / 10), now, 0.05);
  }
  function stopAudio() {
    if (!aud) return;
    const a = aud; aud = null;
    [a.tgt, a.me].forEach((n) => { try { n.gn.gain.setTargetAtTime(0.0001, a.ctx.currentTime, 0.03); n.o.stop(a.ctx.currentTime + 0.2); } catch {} });
    const b = $("tnAud"); if (b) { b.textContent = "MONITOR: OFF"; b.classList.add("off"); b.setAttribute("aria-pressed", "false"); }
  }

  /* ---------------- entry point: the ▌TUNE button ---------------- */
  function refreshButton() {
    const b = $("tuneBtn"); if (b) b.classList.toggle("msg", !S.locked);
  }
  function arm(announce) {
    if (!$("tuneBtn")) {
      const b = document.createElement("button");
      b.id = "tuneBtn"; b.className = "mini msg"; b.type = "button"; b.textContent = "▌TUNE"; b.title = "Signal tuner";
      b.onclick = open;
      const host = document.querySelector(".top-actions"); if (host) host.prepend(b);
    }
    refreshButton();
    if (announce && J() && J().toast) J().toast("NEW ROUTE", "signal tuner online // ▌TUNE");
  }

  /* ---------------- public API ---------------- */
  window.JJ_SIGNAL = {
    open, close, arm, refreshButton,
    solve() { S.key = true; store.set(S); build(); open(); Object.assign(v, TARGET); pushSliders(); },
    reset() { try { localStorage.removeItem(SK); } catch {} location.reload(); },
    get target() { return { ...TARGET }; },
  };
  if (daemonDone()) arm(false);
})();

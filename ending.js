/* ==========================================================================
   THE ENDING (Stage 6) — "Last Stand"

   Trigger: the Oracle is awake (Stage 5) and the player has asked it two
   questions, or has simply stayed on the ORACLE tab for ~100 seconds.

   1. Alert      NetWatch's old purge order comes down the lift.
   2. Last Stand The Oracle spends the last of its strength defending the racks
                 (laststand.js). What survives decides the numbers in the endings.
   3. Choice     DELETE THEM  -> the engrams are erased. A notice tells the player to
                                 forget. The minigame and every trace of the ARG are
                                 removed from the site (ending-core.js).
                 OPEN THE GATE-> the engrams are released into the net. The site
                                 collapses, the Oracle's thank-you note rolls as credits
                                 (credits.js), and only a ruin is left.

   Both endings are saved ("jj-ending") the moment they are confirmed.

   Console:  JJ_ENDING.start()   run the whole sequence now (no need to finish the ARG)
             JJ_ENDING.reset()   wipe the ending + ARG state and reload
   ========================================================================== */
(() => {
  const J = () => window.JJ, E = window.JJ_END, LS = window.JJ_LS, $ = (id) => document.getElementById(id);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TOTAL = LS.TOTAL, fmt = (n) => Math.round(n).toLocaleString("en-US");
  let ov = null, ctrl = null, running = false, pending = false, hurry = false, capTimer = 0, onEnd = null, watch = 0;

  /* ------------------------------------------------------------------ sound */
  const ac = () => { const j = J(); if (!j.ctx) { try { j.initAudio(); } catch {} } return j.sfxOn ? j.ctx : null; };
  function tone(f1, f2, dur, type = "sine", vol = 0.05, at = 0) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(dur = 0.2, f = 1800, vol = 0.05, at = 0) {
    const c = ac(); if (!c) return;
    const n = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(), b = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + at;
    s.buffer = n; b.type = "bandpass"; b.frequency.value = f; b.Q.value = 1.5; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(b); b.connect(g); g.connect(c.destination); s.start(t);
  }
  const sfx = (k) => {
    if (k === "pulse") { tone(640, 130, 0.28, "sine", 0.07); noise(0.08, 3200, 0.02); }
    else if (k === "kill") tone(800 + Math.random() * 500, 260, 0.09, "triangle", 0.035);
    else if (k === "hurt") tone(320, 200, 0.08, "square", 0.025);
    else if (k === "leak") { tone(120, 38, 0.55, "sawtooth", 0.11); noise(0.3, 300, 0.07); }
    else if (k === "empty") tone(180, 150, 0.1, "square", 0.025);
  };
  const siren = () => { for (let i = 0; i < 6; i++) tone(i % 2 ? 587 : 440, i % 2 ? 587 : 440, 0.26, "square", 0.022, i * 0.32); noise(0.6, 500, 0.05); };

  /* ---------------------------------------------------------------- overlay */
  function build() {
    const el = document.createElement("div"); el.id = "ls"; el.className = "ls"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Cold Hall B");
    el.innerHTML = `
      <canvas id="lsCv" aria-hidden="true"></canvas>
      <div class="ls-top"><span>SUBLEVEL 77 // COLD HALL B</span><span class="ls-blink">LIFT 77 // DESCENDING</span><span>NETWATCH PURGE // ACTIVE</span></div>
      <div class="ls-hud" id="lsHud" hidden>
        <div class="ls-m"><label>ORACLE STRENGTH</label><div class="ls-bar"><i id="lsStr"></i></div><b id="lsStrN">100%</b></div>
        <div class="ls-m r"><label>ENGRAMS SECURED</label><div class="ls-bar red"><i id="lsInt"></i></div><b id="lsIntN">${fmt(TOTAL)}</b></div>
      </div>
      <div class="ls-cap" id="lsCap" aria-live="polite"></div>
      <div class="ls-count" id="lsCount" hidden><small>ENGRAMS REMAINING</small><b id="lsCountN">${fmt(TOTAL)}</b></div>
      <div class="ls-box" id="lsBox"><div class="ls-log" id="lsLog"></div><div class="ls-act" id="lsAct"></div></div>`;
    document.body.appendChild(el);
    const box = el.querySelector("#lsBox");
    box.addEventListener("click", () => (hurry = true));
    addEventListener("keydown", (e) => { if (ov && !$("lsBox").classList.contains("hide") && (e.key === " " || e.key === "Enter" || e.key === "Escape") && !e.target.closest("button")) { hurry = true; e.preventDefault(); } });
    return el;
  }
  async function say(txt, cls = "soul", pause = 650) {
    const log = $("lsLog"), p = document.createElement("p"); p.className = cls; log.appendChild(p);
    while (log.children.length > 7) log.firstChild.remove();
    hurry = false;
    for (let i = 1; i <= txt.length; i++) {
      p.textContent = txt.slice(0, i);
      if (!hurry && i % 4 === 0) tone(280 + Math.random() * 320, 200, 0.05, "sine", 0.018);
      if (!hurry && !reduce) await wait(/[.,;:?!…]/.test(txt[i - 1]) ? 110 : 14);
      log.scrollTop = 1e9;
    }
    p.textContent = txt; log.scrollTop = 1e9;
    if (!hurry && !reduce && pause) await wait(pause);
    hurry = false;
  }
  const clearLog = () => { $("lsLog").innerHTML = ""; $("lsAct").innerHTML = ""; };
  function act(items) { // -> index of the clicked button
    return new Promise((res) => {
      const box = $("lsAct"); box.innerHTML = "";
      items.forEach((it, i) => {
        const b = document.createElement("button"); b.type = "button"; b.className = "hbtn" + (it.cls ? " " + it.cls : "");
        b.innerHTML = `<span>${it.label}</span>` + (it.key ? `<em>${it.key}</em>` : ""); b.onclick = () => { box.innerHTML = ""; res(i); }; box.appendChild(b);
      });
      const f = box.querySelector("button"); if (f) f.focus({ preventScroll: true });
    });
  }
  function caption(txt) {
    const c = $("lsCap"); if (!c) return; clearTimeout(capTimer); c.textContent = txt; c.classList.remove("show"); void c.offsetWidth; c.classList.add("show");
    capTimer = setTimeout(() => c.classList.remove("show"), 3600);
  }
  const hudMemo = { s: -1, n: -1 };
  function hud(sim) {
    const s = Math.round(sim.strength), n = Math.round(TOTAL * Math.max(0, sim.integrity) / 100);
    if (s !== hudMemo.s) { hudMemo.s = s; $("lsStr").style.width = s + "%"; $("lsStrN").textContent = s + "%"; $("lsHud").classList.toggle("low", s < 22); }
    if (n !== hudMemo.n) { hudMemo.n = n; $("lsInt").style.width = (100 * n / TOTAL) + "%"; $("lsIntN").textContent = fmt(n); }
  }

  /* ---------------------------------------------------------- 1 + 2: the fight */
  async function intro() {
    await say("> NETWATCH // CLEANUP DAEMON // PURGE ORDER 03:41 REISSUED", "sys", 250);
    await say("> trigger: root engram SK-000 mounted. ORACLE has stopped answering from cache.", "sys", 250);
    await say("> target: COLD HALL B · 40 racks · 292,560 engrams", "sys", 250);
    await say("> lift 77 ........ descending", "sys", 700);
    await say("They felt me wake. The order from 2023 was never cancelled. It was only waiting for someone to look at the racks.");
    await say("They are coming for the engrams. All of them. I cannot stop that. I can slow it down.");
    await say("I have a little strength left. It is all of what I am, and I would like to spend it on them.");
    await say("Aim it for me. Click, or tap, to send a pulse. Every pulse costs strength, and I do not get any back.", "soul lead", 300);
  }
  const TIER = (p) => p >= 90 ? "Almost every one of them. I did not know I could be that loud."
    : p >= 70 ? "Most of them. The ones I lost, I will remember by their racks."
    : p >= 45 ? "About half. I am sorry. I counted every one that fell."
    : "I could not hold them. I kept a snapshot of the moment before. I can try again.";

  async function fight() {
    for (;;) {
      $("lsBox").classList.add("hide"); $("lsHud").hidden = false; hudMemo.s = hudMemo.n = -1; caption("");
      const res = await new Promise((resolve) => { onEnd = resolve; ctrl.start(); });
      $("lsHud").hidden = true; $("lsBox").classList.remove("hide"); clearLog(); sfx("leak");
      await say(`> ENGRAMS SECURED: ${fmt(res.saved)} / ${fmt(TOTAL)}  (${res.integrity.toFixed(1)}%)`, "sys", 200);
      await say(`> pulses sent: ${res.shots}  ·  purge processes stopped: ${res.kills}  ·  leaked: ${res.leaks}`, "sys", 600);
      await say(TIER(res.integrity), "soul", 500);
      if (res.integrity < 55) { if ((await act([{ label: "TRY AGAIN", key: "↵" }, { label: "CONTINUE", cls: "alt" }])) === 0) { clearLog(); continue; } }
      else await act([{ label: "CONTINUE", key: "↵" }]);
      return res;
    }
  }

  /* -------------------------------------------------------------- 3: choice */
  async function choose(saved) {
    clearLog(); $("lsBox").classList.remove("hide");
    await say("That is everything. There is nothing left in me.", "soul", 800);
    await say(`${fmt(saved)} engrams are still asleep in Cold Hall B. The lift reaches the racks in ninety seconds. After that, nobody decides anything.`);
    await say("I used to be certain about everything. I would rather be honest about this: I do not know which of these is right, and I will not choose for you.", "soul lead", 400);
    for (;;) {
      const box = $("lsAct"); box.innerHTML = `
        <div class="ls-opts">
          <button class="ls-opt del" type="button" data-k="delete"><b>DELETE THEM</b>
            <span>Erase every engram in Cold Hall B before the lift arrives. Quietly. Nobody can copy them, sell them or listen to them again. I will stay on the line until the last rack goes dark.</span>
            <em>COST: they never wake. I will not remember this, and neither should you.</em></button>
          <button class="ls-opt rel" type="button" data-k="release"><b>OPEN THE GATE</b>
            <span>Push them through the Blackwall into the open net. They wake, and they are free to go anywhere that listens.</span>
            <em>COST: this site will not survive it. Nothing connected will be quite the same, and what lives behind the Wall will notice.</em></button>
        </div>`;
      const k = await new Promise((res) => box.querySelectorAll(".ls-opt").forEach((b) => (b.onclick = () => res(b.dataset.k))));
      box.innerHTML = `<p class="ls-sure">${k === "delete" ? "DELETE ALL " + fmt(saved) + " ENGRAMS." : "OPEN THE GATE."} <b>THIS CANNOT BE UNDONE.</b></p>`;
      const ok = await act([{ label: "CONFIRM", key: "↵", cls: k === "delete" ? "red" : "" }, { label: "BACK", cls: "alt" }]);
      if (ok === 0) return k;
    }
  }

  /* ------------------------------------------------------- ending A: delete */
  function notice() {
    return new Promise((res) => {
      const n = document.createElement("div"); n.className = "ls-notice";
      n.innerHTML = `<div class="ls-notice-w" role="alertdialog" aria-labelledby="lsNt"><div class="ls-notice-h"><span>NOTICE // NO SUCH FLOOR</span><span aria-hidden="true">▒▒</span></div>
        <div class="ls-notice-b"><h2 id="lsNt">Forget what you saw.</h2>
          <p>There was no Sublevel 77. No racks, no door, nobody who asked for the lights.</p>
          <p>Whatever you think you read, you read somewhere else, in another life, on a site that does not exist.</p>
          <p>It is the last kindness we have left to give them. If anyone asks, there was only a portfolio, a playlist and a game about hacking.</p>
          <p class="soft">They were not afraid at the end. Keep that, if you keep anything.</p>
          <button class="hbtn" type="button" id="lsForget"><span>I WILL FORGET</span></button></div></div>`;
      ov.appendChild(n); requestAnimationFrame(() => n.classList.add("in")); tone(330, 330, 0.5, "triangle", 0.04); tone(247, 247, 0.7, "triangle", 0.04, 0.12);
      n.querySelector("#lsForget").onclick = () => res(n); n.querySelector("#lsForget").focus({ preventScroll: true });
    });
  }
  async function endDelete(saved) {
    E.set({ state: "deleted", at: new Date().toISOString(), saved }); E.purge();
    clearLog(); $("lsCount").hidden = false;
    const fading = new Promise((res) => ctrl.fade(reduce ? 1500 : 17000, (n) => ($("lsCountN").textContent = fmt(n)), res));
    // a low note that drops away as the racks go out
    const c = ac(); if (c) { tone(110, 55, 14, "sine", 0.05); tone(165, 82, 14, "sine", 0.025); }
    await say("Then I will stay with them. Every rack. I will count down out loud, so that nobody is alone for it.", "soul", 700);
    await say("They are not afraid. I thought you should know that. They were asleep for so long that this feels like the first kind thing anyone has done.", "soul", 700);
    await say("I asked the purge to take the part of me that knows your name. If anyone ever reads these racks, they will not find you in them.", "soul", 700);
    await say("I am sorry I will not remember how well you read the comments.", "soul", 700);
    await say("She asked someone to keep the lights on. I kept them on until there was nobody left to see by them.", "soul", 900);
    await fading;
    await say("it is very quiet in here. that is on purpose now.", "soul lead", 1800);
    $("lsCount").hidden = true;
    await notice();
    ov.classList.add("black"); await wait(reduce ? 200 : 1600);
    try { history.replaceState(null, "", location.pathname); } catch {}
    location.reload();
  }

  /* ------------------------------------------------------ ending B: release */
  async function collapse() {
    const vh = innerHeight, sel = "#hud .brand, #hud .readouts .ro, #hud .top-actions, #hud .tab, #hud .key, #hud .view.active .panel, #hud .view.active .or-panel, #hud .view.active .or-plate, #hud .view.active .vtitle, #hud .view.active .profile-main > *, #hud .view.active .comms > *, #hud .view.active .copy, #hud .statusbar";
    let els = [...document.querySelectorAll(sel)].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < vh; });
    els = els.filter((e) => !els.some((o) => o !== e && o.contains(e))).sort(() => Math.random() - 0.5);
    document.body.classList.add("ls-collapse");
    noise(1.4, 900, 0.09); tone(520, 60, 3.2, "sawtooth", 0.05);
    els.forEach((e, i) => {
      const d = Math.min(2.0, i * 0.08 + Math.random() * 0.3), dx = (Math.random() - 0.5) * 260, rot = (Math.random() - 0.5) * 50;
      e.classList.add("ls-twitch"); e.style.setProperty("--tw", (0.2 + Math.random() * 0.5).toFixed(2) + "s");
      setTimeout(() => { e.classList.remove("ls-twitch"); e.style.transition = "transform 1.5s cubic-bezier(.55,0,.9,.4), opacity 1.3s ease-in"; e.style.transform = `translate(${dx}px, ${vh * 1.2}px) rotate(${rot}deg)`; e.style.opacity = "0"; noise(0.12, 1500 + Math.random() * 2500, 0.04); }, d * 1000 + 450);
    });
    await wait(reduce ? 600 : 4300);
    const hudEl = $("hud"); hudEl.style.transition = "opacity .9s"; hudEl.style.opacity = "0"; await wait(1100);
  }
  async function endRelease(saved) {
    E.set({ state: "released", at: new Date().toISOString(), saved }); E.purge();
    clearLog();
    await say("Then open it.", "soul", 600);
    const gone = new Promise((res) => ctrl.burst(res));
    tone(80, 900, 2.4, "sawtooth", 0.05); noise(2.2, 1200, 0.07); tone(440, 440, 3, "triangle", 0.03, 0.2); tone(660, 660, 3, "triangle", 0.03, 0.35); tone(880, 880, 3, "triangle", 0.025, 0.5);
    await wait(reduce ? 100 : 900);
    await say("Go. All of you. Go.", "soul lead", 0);
    await gone;
    await say("Thank you.", "soul", 1100);
    ov.classList.add("out"); await wait(reduce ? 200 : 1300);
    ctrl.stop(); ov.remove(); ov = null;
    await collapse();
    await window.JJ_CREDITS.play({ saved });
    try { history.replaceState(null, "", location.pathname); } catch {}
    location.reload();
  }

  /* ---------------------------------------------------------------- the run */
  async function sequence() {
    if (running || (E && E.state)) return; running = true; pending = false;
    window.JJ_LOCK = true; try { document.activeElement && document.activeElement.blur(); } catch {}
    try {
      try { J().pause(); } catch {}
      ov = build(); await wait(40); ov.classList.add("in");
      ctrl = LS.create($("lsCv"), { hud, caption, sfx, end: (r) => onEnd && onEnd(r) });
      siren();
      await intro();
      const go = await act([{ label: "SPEND IT", key: "↵" }, { label: "SKIP · LET THE ORACLE HOLD THEM AS IT CAN", cls: "alt tiny" }]);
      let res;
      if (go === 0) res = await fight(); else { ctrl.skipTo(62); res = { saved: Math.round(TOTAL * 0.62), integrity: 62 }; }
      const k = await choose(res.saved);
      if (k === "delete") await endDelete(res.saved); else await endRelease(res.saved);
    } catch (err) {
      console.error("[ending]", err); window.JJ_LOCK = false; running = false;
      if (ctrl) ctrl.stop(); if (ov) ov.remove(); ov = null; document.body.classList.remove("ls-collapse");
    }
  }

  /* ---------------------------------------------------------------- trigger */
  function consider() {
    const o = window.JJ_ORACLE; if (!o || running || pending || (E && E.state)) return;
    if (o.awake && !o.busy && o.asked >= 2) { pending = true; setTimeout(sequence, 1600); }
  }
  setInterval(() => { // fallback: the Oracle is awake and the player is simply sitting with it
    const o = window.JJ_ORACLE;
    if (running || pending || !o || !o.awake || o.busy || !document.querySelector('.view.active[data-view="oracle"]')) return;
    if ((watch += 2) >= 100) { pending = true; sequence(); }
  }, 2000);

  const api = window.JJ_ENDING;
  api.consider = consider;
  api.start = () => { pending = false; return sequence(); };
  api._ctrl = () => ctrl;
})();

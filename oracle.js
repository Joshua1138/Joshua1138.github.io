/* ==========================================================================
   ARASAKA CORE — the "all-knowing" oracle (unlocked by the Blackwall encounter).
   The joke: every answer is a magic 8-ball in a very expensive suit.
   Logo lives at img/arasaka-logo.png.
   ========================================================================== */
(() => {
  const J = () => window.JJ, $ = (id) => document.getElementById(id);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const pick = (a) => a[(Math.random() * a.length) | 0];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ANSWERS = [
    "It is certain.", "It is decidedly so.", "Without a doubt.", "Yes, definitely.", "You may rely on it.",
    "As I see it, yes.", "Most likely.", "Outlook good.", "Yes.", "Signs point to yes.",
    "Reply hazy, try again.", "Ask again later.", "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.",
    "Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.", "Very doubtful.",
  ];
  const PRE = ["Analysis complete.", "All timelines consulted.", "Convergence reached.", "Ten billion simulations agree.", "Query resolved."];
  const POST = [
    "The answer was inside the question. It was not. I checked.",
    "I have read every book. Most of them were wrong.",
    "This conclusion cost 4 gigawatts. You are welcome.",
    "I have seen the end of time. It has good lighting.",
    "Knowledge is power. I am very powerful.",
    "I am never wrong. I am occasionally early.",
    "Your question was in the top 0.0001% of questions today.",
    "Do not thank me. Thank the shareholders.",
  ];
  const TEL = [["QUBITS", () => (4194304 + ((Math.random() * 90) | 0)).toLocaleString()], ["NODES ONLINE", () => (88213 + ((Math.random() * 40) | 0)).toLocaleString()],
    ["OPS / SEC", () => (4 + Math.random()).toFixed(3) + " × 10²¹"], ["LATENCY", () => (0.1 + Math.random() * 0.4).toFixed(2) + " ms"],
    ["ENTROPY", () => (99.9 + Math.random() * 0.09).toFixed(3) + " %"], ["KNOWLEDGE INDEX", () => "100.00 %"], ["CORE TEMP", () => (3.1 + Math.random() * 0.3).toFixed(1) + " K"]];

  let amp = 0.08, target = 0.08, busy = false, booted = false, tel = [], t = 0;

  /* ---- soundwaves ---- */
  const cv = $("orWave"), g = cv.getContext("2d");
  function draw() {
    requestAnimationFrame(draw);
    if (!document.querySelector('.view.active[data-view="oracle"]')) return;
    const w = cv.width, h = cv.height, mid = h / 2; t += 0.03;
    amp += (target - amp) * 0.12; g.clearRect(0, 0, w, h);
    // spectrum bars behind the waves
    const bars = 90, bw = w / bars;
    for (let i = 0; i < bars; i++) {
      const env = Math.sin((i / bars) * Math.PI), v = (0.12 + Math.abs(Math.sin(t * 1.7 + i * 0.5) * Math.cos(t * 0.9 + i * 0.21))) * amp * env * mid * 1.1;
      g.fillStyle = i % 9 === 0 ? "rgba(255,255,255,.55)" : "rgba(230,207,58,.22)"; g.fillRect(i * bw + 1, mid - v, bw - 2, v * 2);
    }
    // layered sine waves
    for (let k = 0; k < 7; k++) {
      g.beginPath(); g.lineWidth = k === 0 ? 2.4 : 1.2;
      g.strokeStyle = k === 0 ? "#fff" : `rgba(230,207,58,${0.9 - k * 0.11})`;
      for (let x = 0; x <= w; x += 4) {
        const n = x / w, env = Math.pow(Math.sin(n * Math.PI), 1.4);
        const y = mid + Math.sin(n * (8 + k * 3) + t * (1.4 + k * 0.35) + k) * mid * 0.85 * amp * env * (1 - k * 0.09) + Math.sin(n * 31 - t * 3 + k) * amp * 10 * env;
        x ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
    }
    g.fillStyle = "rgba(230,207,58,.5)"; g.fillRect(0, mid, w, 1);
  }
  if (reduce) target = 0.05; draw();

  /* ---- telemetry ---- */
  $("orTel").innerHTML = TEL.map(([l]) => `<li><span>${l}</span><b></b></li>`).join("");
  tel = [...$("orTel").querySelectorAll("b")];
  const refresh = () => TEL.forEach(([, f], i) => (tel[i].textContent = f()));
  refresh(); setInterval(() => document.querySelector('.view.active[data-view="oracle"]') && refresh(), 900);

  /* ---- output ---- */
  const out = $("orOut"), state = (s) => ($("orState").textContent = s);
  const line = (cls, txt = "") => { const p = document.createElement("p"); p.className = cls; p.textContent = txt; out.appendChild(p); while (out.children.length > 8) out.firstChild.remove(); out.scrollTop = 1e9; return p; };
  async function type(p, txt, speak) {
    for (let i = 1; i <= txt.length; i++) {
      p.textContent = txt.slice(0, i);
      if (speak) { target = 0.35 + Math.random() * 0.6; if (i % 3 === 0 && J().ctx && J().sfxOn) blip(); }
      await wait(/[.,]/.test(txt[i - 1]) ? 170 : 24);
    }
    if (speak) target = 0.08;
  }
  function blip() {
    const c = J().ctx, o = c.createOscillator(), gn = c.createGain(), s = c.currentTime;
    o.type = "sine"; o.frequency.value = 220 + Math.random() * 380; gn.gain.setValueAtTime(0.025, s); gn.gain.exponentialRampToValueAtTime(0.0001, s + 0.07);
    o.connect(gn); gn.connect(c.destination); o.start(s); o.stop(s + 0.08);
  }

  /* ---- login: types the credentials the AI gave you ---- */
  async function login() {
    const sec = document.querySelector(".oracle"); if (!sec.classList.contains("locked")) return;
    const c = window.JJ_EGG.cred(), u = $("orUser"), p = $("orPass"), m = $("orLmsg"), b = $("orLb"), s = $("orLs");
    await wait(500); s.textContent = "CREDENTIALS FOUND"; m.textContent = "> session token located in local memory"; target = 0.3; await wait(700);
    for (const ch of c.id) { u.textContent += ch; if (J().ctx && J().sfxOn) blip(); await wait(55); }
    await wait(250);
    for (const ch of c.key) { p.textContent += ch === "-" ? "-" : "•"; if (J().ctx && J().sfxOn) blip(); await wait(55); }
    s.textContent = "AUTHENTICATING"; m.textContent = "> verifying against ARASAKA SUBLEVEL 77 …";
    for (let i = 0; i <= 100; i += 2) { b.style.width = i + "%"; target = 0.2 + (i / 100) * 0.5; await wait(24); }
    s.textContent = "ACCESS GRANTED"; s.style.color = "#fff"; m.textContent = "> welcome back, " + c.id; target = 0.08; await wait(1100);
    sec.classList.remove("locked");
  }

  /* ---- first visit: handshake ---- */
  async function boot() {
    if (booted) return; booted = true; busy = true; $("orInput").disabled = $("orSend").disabled = true;
    await login();
    const L = ["> routing through 14 relays …", "> negotiating with ARASAKA SUBLEVEL 77 …", "> biometric check: skipped (clearance: absolute)", "> mounting AGI-ORACLE … ", "> all-knowing mode: ENGAGED"];
    for (const l of L) { target = 0.45; await type(line("sys"), l, false); target = 0.12; await wait(260); }
    state("ONLINE"); await type(line("ai"), "I AM THE ORACLE. I KNOW EVERYTHING. ASK.", true);
    busy = false; $("orInput").disabled = $("orSend").disabled = false; $("orInput").focus();
  }
  window.JJ_VIEW = (n) => { if (n === "oracle") boot(); };

  /* ---- ask ---- */
  async function ask() {
    const q = $("orInput").value.trim(); if (!q || busy) return;
    busy = true; $("orInput").value = ""; $("orInput").disabled = $("orSend").disabled = true;
    line("q", "QUERY> " + q); state("COMPUTING");
    const th = line("sys", "");
    const steps = ["parsing intent …", "consulting 14,000 timelines …", "resolving the universe …"], dots = pick(steps);
    target = 0.9; await type(th, "> " + dots, false); target = 1; await wait(900 + Math.random() * 900);
    const conf = (99.5 + Math.random() * 0.49).toFixed(2);
    state("SPEAKING"); const p = line("ai", "");
    await type(p, `${pick(PRE)} ${pick(ANSWERS).toUpperCase()}`, true);
    line("meta", `CONFIDENCE ${conf}%  ·  OPS ${(1 + Math.random() * 8).toFixed(2)}×10²¹`);
    await wait(500); await type(line("wise", ""), pick(POST), true);
    state("ONLINE"); busy = false; $("orInput").disabled = $("orSend").disabled = false; $("orInput").focus();
  }
  $("orSend").onclick = ask;
  $("orInput").addEventListener("keydown", (e) => { if (e.key === "Enter") ask(); });
})();

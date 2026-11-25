(() => {
  if (window.JJ_ENDING_STATE === "released") return; // the site is a ruin now (ending-core.js)
  const S = window.SITE;
  const $ = (id) => document.getElementById(id);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = { get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch {} } };
  const fine = matchMedia("(pointer: fine)").matches;

  /* ================= AUDIO CONTEXT + UI SOUNDS ================= */
  let ctx, master, analyser, sfxGain, noiseBuf, sfxOn = true;
  function initAudio() {
    if (ctx) { ctx.resume(); return; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = +$("vol").value;
    analyser = ctx.createAnalyser(); analyser.fftSize = 256;
    const delay = ctx.createDelay(); delay.delayTime.value = 0.33;
    const fb = ctx.createGain(); fb.gain.value = 0.28;
    master.connect(analyser); master.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(analyser);
    analyser.connect(ctx.destination);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.5; sfxGain.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    drawViz();
  }
  function sfx(kind) {
    if (!ctx || !sfxOn) return;
    const t = ctx.currentTime;
    const beep = (f1, f2, dur, type = "square", vol = 0.05, at = 0) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f1, t + at); o.frequency.exponentialRampToValueAtTime(f2, t + at + dur);
      g.gain.setValueAtTime(vol, t + at); g.gain.exponentialRampToValueAtTime(0.0001, t + at + dur);
      o.connect(g); g.connect(sfxGain); o.start(t + at); o.stop(t + at + dur + 0.02);
    };
    if (kind === "hover") beep(2400, 2200, 0.03, "sine", 0.03);
    else if (kind === "click") { beep(900, 1800, 0.06); beep(1800, 1800, 0.04, "square", 0.03, 0.05); }
    else if (kind === "tab") {
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noiseBuf; f.type = "bandpass"; f.Q.value = 4; f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(5000, t + 0.18);
      g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      s.connect(f); f.connect(g); g.connect(sfxGain); s.start(t); s.stop(t + 0.22);
      beep(300, 120, 0.12, "sawtooth", 0.04);
    }
    else if (kind === "toast") { beep(1200, 1200, 0.07, "triangle", 0.06); beep(1600, 1600, 0.09, "triangle", 0.06, 0.08); }
    else if (kind === "boot") { [0, 0.09, 0.18].forEach((a, i) => beep(400 * (i + 1), 400 * (i + 1), 0.08, "square", 0.05, a)); beep(80, 40, 0.6, "sine", 0.4, 0.25); }
    else if (kind === "tick") beep(3000, 3000, 0.01, "square", 0.015);
  }

  /* ================= TOASTS ================= */
  function toast(head, body) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<small>${esc(head)}</small><span>${esc(body)}</span>`;
    $("toasts").appendChild(el);
    sfx("toast");
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 320); }, 3400);
  }

  /* ================= TEXT DECODE EFFECT ================= */
  const GLYPHS = "!<>-_\\/[]{}=+*^?#01ABCDEFアイウエオカキクケコ";
  function scramble(el, text, dur = 650) {
    text = text ?? el.dataset.final ?? el.textContent;
    el.dataset.final = text;
    const start = performance.now();
    cancelAnimationFrame(el._raf);
    const frame = (now) => {
      const p = Math.min(1, (now - start) / dur), rev = Math.floor(p * text.length);
      let out = text.slice(0, rev);
      for (let i = rev; i < text.length; i++) out += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      el.textContent = out;
      if (p < 1) el._raf = requestAnimationFrame(frame);
    };
    el._raf = requestAnimationFrame(frame);
  }

  /* ================= STATIC CONTENT ================= */
  document.title = S.name;
  const upper = S.name.toUpperCase();
  $("heroName").textContent = upper; $("heroName").dataset.text = upper;
  $("heroRole").textContent = S.role;
  $("idName").textContent = S.name;
  $("idLoc").textContent = S.location;
  $("idStand").textContent = S.stand.name;
  $("standName").textContent = S.stand.name;
  $("standAbility").textContent = S.stand.ability;
  $("about").textContent = S.about;
  $("year").textContent = new Date().getFullYear();

  const pipsHTML = (v) => Array.from({ length: 5 }, (_, i) => `<i class="${i < v ? "on" : ""}"></i>`).join("");
  $$(".pips[data-v]").forEach((el) => (el.innerHTML = pipsHTML(+el.dataset.v)));

  const lines = [
    "> Is that a JoJo reference? …affirmative.",
    "> Training models with the power of hamon.",
    "> Location: " + S.location + " // status: ONLINE",
    "> New tab unlocked: GAME. Breach the mainframe.",
  ];
  let li = 0, ci = 0, del = false;
  (function type() {
    const line = lines[li];
    $("typed").textContent = line.slice(0, ci);
    if (!del && ci < line.length) ci++;
    else if (!del) { del = true; return setTimeout(type, 1800); }
    else if (ci > 0) ci--;
    else { del = false; li = (li + 1) % lines.length; }
    setTimeout(type, del ? 22 : 50);
  })();

  /* ---- stand ---- */
  const gradeVal = { A: 5, B: 4, C: 3, D: 2, E: 1 };
  const n = S.stats.length, R = 100;
  const pt = (i, r) => { const a = (Math.PI * 2 * i) / n - Math.PI / 2; return [Math.cos(a) * r, Math.sin(a) * r]; };
  let svg = "";
  for (let k = 1; k <= 5; k++) svg += `<polygon class="ring" points="${S.stats.map((_, i) => pt(i, (R * k) / 5).join(",")).join(" ")}"/>`;
  S.stats.forEach((s, i) => {
    const [x, y] = pt(i, R), [lx, ly] = pt(i, R + 30);
    svg += `<line class="spoke" x1="0" y1="0" x2="${x}" y2="${y}"/>`;
    svg += `<text class="grade" x="${lx}" y="${ly}">${esc(s.grade)}</text><text class="axis-label" x="${lx}" y="${ly + 16}">${esc(s.label.toUpperCase())}</text>`;
  });
  const shapePts = S.stats.map((s, i) => pt(i, (R * (gradeVal[s.grade] || 1)) / 5));
  svg += `<g class="shape-g"><polygon class="shape" points="${shapePts.map((p) => p.join(",")).join(" ")}"/></g>`;
  $("radar").innerHTML = svg;
  $("attrs").innerHTML = S.stats.map((s) => `<li><span>${esc(s.label.toUpperCase())}</span><span class="pips">${pipsHTML(gradeVal[s.grade] || 1)}</span><span class="g">${esc(s.grade)}</span></li>`).join("");
  $("skills").innerHTML = S.skills.map((s) => `<span class="chip">${esc(s)}</span>`).join("");
  $("skillCount").textContent = `${S.skills.length} ACTIVE`;

  /* ---- archive ---- */
  $("paperList").innerHTML = S.papers.map((p, i) => `<li class="db-item new" data-i="${i}"><small>ENTRY ${String(i + 1).padStart(2, "0")} · ${esc(p.tag)}</small><span>${esc(p.title)}</span></li>`).join("");
  function showPaper(i) {
    const p = S.papers[i];
    $$(".db-item").forEach((el, k) => { el.classList.toggle("active", k === i); if (k === i) el.classList.remove("new"); });
    $("paperDetail").innerHTML = `
      <div class="panel-head"><span>ENTRY ${String(i + 1).padStart(2, "0")} // DECRYPTED</span><span class="code">${esc(p.year)}</span></div>
      <span class="tag">${esc(p.tag)}</span>
      <h3 id="pTitle"></h3>
      <dl class="kv"><dt>AUTHORS</dt><dd>${esc(p.authors)}</dd><dt>VENUE</dt><dd>${esc(p.venue)}</dd><dt>YEAR</dt><dd>${esc(p.year)}</dd></dl>
      <p class="blurb">${esc(p.blurb)}</p>
      <a class="hbtn" href="${esc(p.url)}" target="_blank" rel="noopener"><span>${esc(p.cta || "ACCESS FILE")}</span><em>↗</em></a>`;
    scramble($("pTitle"), p.title, 700);
  }
  $$(".db-item").forEach((el) => el.addEventListener("click", () => { sfx("click"); showPaper(+el.dataset.i); }));
  if (S.papers.length) showPaper(0);

  /* ---- comms ---- */
  const L = S.links;
  $("contactLinks").innerHTML = [
    L.github && ["GH", "REPOSITORY", "GITHUB", L.github],
    L.linkedin && ["IN", "PROFESSIONAL NET", "LINKEDIN", L.linkedin],
    L.email && ["@", "DIRECT MESSAGE", "EMAIL", "mailto:" + L.email],
  ].filter(Boolean).map(([ic, sub, label, href]) =>
    `<a class="contact" href="${esc(href)}" ${href.startsWith("mailto") ? "" : 'target="_blank" rel="noopener"'}><span class="ic">${ic}</span><span><small>${sub}</small><b>${label}</b></span></a>`).join("");

  /* ================= VIEWS / TABS ================= */
  const VIEWS = ["profile", "stand", "archive", "audio", "game", "comms"];
  const seen = new Set();
  const firstVisit = {
    stand: ["STAND ANALYSIS COMPLETE", `${S.stats.length} parameters scanned`],
    archive: ["DATA FRAGMENTS ACQUIRED", `${S.papers.length} research entries decrypted`],
    audio: ["AUDIO SUBSYSTEM ONLINE", `${S.tracks.length} tracks loaded`],
    game: ["BREACH PROTOCOL READY", "upload all three daemons"],
    comms: ["UPLINK ESTABLISHED", "secure channels open"],
    oracle: ["ARASAKA CORE ONLINE", "all-knowing. allegedly."],
  };
  $$(".tab").forEach((t, i) => (t.dataset.n = i + 1));
  let current = null;
  function setView(name, sound = true) {
    if (!VIEWS.includes(name)) name = "profile";
    if (name === current) return;
    current = name;
    const vp = $("viewport");
    vp.classList.remove("glitching"); void vp.offsetWidth; vp.classList.add("glitching");
    if (sound) sfx("tab");
    $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === name));
    $$(".view").forEach((v) => {
      const on = v.dataset.view === name;
      v.classList.toggle("active", on);
      if (on) [...v.children].forEach((c, i) => c.style.setProperty("--i", i));
    });
    vp.scrollTop = 0;
    $$(`.view[data-view="${name}"] .scr`).forEach((el) => scramble(el));
    if (name === "profile") scramble($("heroName"), upper, 900);
    try { history.replaceState(null, "", "#" + name); } catch {}
    if (window.JJ_VIEW) window.JJ_VIEW(name);
    const at = $$(".tab.active")[0], tb = $("tabs"); if (at) tb.scrollLeft = at.offsetLeft - (tb.clientWidth - at.offsetWidth) / 2;
    if (bootDone && !seen.has(name)) { seen.add(name); if (firstVisit[name]) setTimeout(() => toast(...firstVisit[name]), 350); }
  }
  const step = (d) => setView(VIEWS[(VIEWS.indexOf(current) + d + VIEWS.length) % VIEWS.length]);
  $$(".tab").forEach((t) => t.addEventListener("click", () => setView(t.dataset.view)));
  $$("[data-goto]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.goto)));
  $$(".key")[0].addEventListener("click", () => step(-1));
  $$(".key")[1].addEventListener("click", () => step(1));
  addEventListener("hashchange", () => setView(location.hash.slice(1)));

  /* ================= HUD CHROME ================= */
  const pad = (x) => String(x).padStart(2, "0");
  setInterval(() => { const d = new Date(); $("clock").textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; }, 1000);
  setInterval(() => ($("syncMeter").style.width = 55 + Math.random() * 45 + "%"), 1400);
  $("ticker").textContent = [
    `SUBJECT ${upper} ONLINE`, `STAND ${S.stand.name} CALIBRATED`, "MENACING AURA LEVEL: ゴゴゴゴ",
    "WEATHER: NEON RAIN, 12°C", "REMINDER: HYDRATE BETWEEN TRAINING RUNS", window.JJ_ENDING_STATE === "deleted" ? "" : "MINIGAME ONLINE: BREACH THE MAINFRAME",
    `${S.papers.length} RESEARCH ENTRIES IN ARCHIVE`, "ALL SYSTEMS NOMINAL",
  ].filter(Boolean).join("   ///   ");

  // reticle cursor
  if (fine) {
    const r = $("reticle");
    let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty;
    addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
    addEventListener("mousedown", () => r.classList.add("down"));
    addEventListener("mouseup", () => r.classList.remove("down"));
    (function loop() { x += (tx - x) * 0.35; y += (ty - y) * 0.35; r.style.transform = ""; r.style.left = x + "px"; r.style.top = y + "px"; requestAnimationFrame(loop); })();
  }
  // hover sounds + reticle hot state
  const HOT = "button, a, .db-item, .tracklist li, .chip, .attrs li, input, .key";
  let lastHot = null;
  document.addEventListener("mouseover", (e) => {
    const h = e.target.closest(HOT);
    $("reticle").classList.toggle("hot", !!h);
    if (h && h !== lastHot) sfx("hover");
    lastHot = h;
  });
  document.addEventListener("click", (e) => { if (e.target.closest("button, a")) sfx("click"); });

  $("sfxBtn").onclick = () => toggleSfx();
  function toggleSfx() { sfxOn = !sfxOn; $("sfxBtn").textContent = sfxOn ? "SFX:ON" : "SFX:OFF"; $("sfxBtn").classList.toggle("off", !sfxOn); }

  /* ================= MUSIC PLAYER ================= */
  const tracks = S.tracks;
  let audioEl, cur = -1, playing = false, timer = null, stepN = 0, nextTime = 0, song = null;
  let ytp = null, ytReady = false, ytApi = null, ytMake = null, ytTok = 0, ytTimer = null, ytDead = false;
  const ytFailed = new Set();
  const isYT = (i) => i >= 0 && !!tracks[i].yt && !ytDead && !ytFailed.has(i);
  const BARS = 32;
  const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const scale = [0, 2, 3, 5, 7, 8, 10];
  const chord = (deg) => [0, 2, 4, 6].map((k) => scale[(deg + k) % 7] + 12 * Math.floor((deg + k) / 7));

  function makeSong(t) {
    const r = rng(hash(t.title + "|" + t.artist));
    const progs = [[0, 5, 2, 6], [0, 3, 5, 4], [5, 6, 0, 0], [0, 6, 5, 6], [0, 5, 3, 4], [3, 4, 0, 5]];
    const arps = [[0, 1, 2, 1], [0, 1, 2, 3], [2, 1, 0, 1], [0, 2, 1, 3], [0, 0, 2, 1]];
    return {
      root: 40 + Math.floor(r() * 10), bpm: 92 + Math.floor(r() * 36),
      prog: progs[Math.floor(r() * progs.length)], arp: arps[Math.floor(r() * arps.length)],
      wave: r() < 0.5 ? "square" : "sawtooth", swingHat: r() < 0.5, cutoff: 1400 + r() * 2200,
    };
  }
  function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
  function tone(freq, t, dur, type, vol, cutoff) {
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = type; o.frequency.value = freq; f.type = "lowpass"; f.frequency.value = cutoff || 3000;
    o.connect(f); f.connect(g); g.connect(master); env(g, t, 0.005, vol, dur); o.start(t); o.stop(t + dur + 0.05);
  }
  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    o.connect(g); g.connect(master); env(g, t, 0.002, 0.9, 0.22); o.start(t); o.stop(t + 0.3);
  }
  function noise(t, dur, vol, freq, type) {
    const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    s.buffer = noiseBuf; f.type = type; f.frequency.value = freq;
    s.connect(f); f.connect(g); g.connect(master); env(g, t, 0.002, vol, dur); s.start(t); s.stop(t + dur + 0.05);
  }
  function padChord(notes, t, dur) {
    notes.slice(0, 3).forEach((m) => [-6, 6].forEach((det) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      o.type = "sawtooth"; o.frequency.value = mtof(m); o.detune.value = det; f.type = "lowpass"; f.frequency.value = 900;
      o.connect(f); f.connect(g); g.connect(master);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.035, t + dur * 0.4); g.gain.linearRampToValueAtTime(0.0001, t + dur);
      o.start(t); o.stop(t + dur + 0.05);
    }));
  }
  function scheduleStep(s, t) {
    const sp = 60 / song.bpm / 4, bar = Math.floor(s / 16), pos = s % 16;
    const c = chord(song.prog[bar % song.prog.length]).map((x) => x + song.root);
    if (pos === 0) padChord(c, t, sp * 16);
    if (bar >= 2) {
      if (pos % 4 === 0) kick(t);
      if (pos === 4 || pos === 12) noise(t, 0.18, 0.35, 1800, "bandpass");
      if (pos % 2 === 1 || (song.swingHat && pos % 4 === 3)) noise(t, 0.04, 0.12, 8000, "highpass");
    }
    if (pos % 2 === 0) tone(mtof(c[0] - 12 + (pos % 4 === 2 ? 12 : 0)), t, sp * 1.6, "sawtooth", 0.16, 600);
    if (bar < BARS - 1) tone(mtof(c[song.arp[pos % song.arp.length]] + 24), t, sp * 0.9, song.wave, 0.06, song.cutoff);
  }
  function scheduler() {
    const sp = 60 / song.bpm / 4;
    while (nextTime < ctx.currentTime + 0.12) {
      if (stepN >= BARS * 16) return next();
      scheduleStep(stepN, nextTime); nextTime += sp; stepN++;
    }
    $("progBar").style.width = (100 * stepN) / (BARS * 16) + "%";
  }
  function stopAll(keepYT) {
    clearInterval(timer); timer = null;
    if (audioEl) audioEl.pause();
    if (!keepYT && ytReady && ytp.pauseVideo) ytp.pauseVideo();
  }
  function load(i) {
    cur = (i + tracks.length) % tracks.length;
    stopAll(isYT(cur));
    const t = tracks[cur];
    $("deck").classList.toggle("yt", isYT(cur));
    $("modeHint").textContent = isYT(cur)
      ? "[SPACE] play/pause · streaming from YouTube"
      : "[SPACE] play/pause · each track plays a generated synthwave loop";
    scramble($("npTitle"), t.title, 500);
    $("npArtist").textContent = t.artist;
    $$("#trackList li").forEach((li, k) => li.classList.toggle("active", k === cur));
    $("progBar").style.width = "0%";
    if (isYT(cur)) { $("bpm").textContent = "YOUTUBE"; ytCue(t.yt); }
    else if (t.src) {
      if (!audioEl) {
        audioEl = new Audio(); audioEl.crossOrigin = "anonymous";
        ctx.createMediaElementSource(audioEl).connect(master);
        audioEl.addEventListener("ended", next);
        audioEl.addEventListener("timeupdate", () => audioEl.duration && ($("progBar").style.width = (100 * audioEl.currentTime) / audioEl.duration + "%"));
      }
      audioEl.src = t.src; $("bpm").textContent = "FILE";
    } else {
      song = makeSong(t); stepN = 0; nextTime = ctx.currentTime + 0.08;
      $("bpm").textContent = song.bpm + " BPM";
    }
  }
  function play() {
    initAudio();
    if (cur < 0) load(0);
    playing = true;
    if (isYT(cur)) ytPlay();
    else if (tracks[cur].src) audioEl.play();
    else { nextTime = Math.max(nextTime, ctx.currentTime + 0.05); clearInterval(timer); timer = setInterval(scheduler, 25); }
    playing = true; ui();
  }
  function pause() { stopAll(); playing = false; ui(); }
  function next() { load(cur + 1); if (playing) play(); toastTrack(); }
  function prev() { load(cur - 1); if (playing) play(); toastTrack(); }
  function toastTrack() { if (playing && current !== "audio") toast("NOW PLAYING", `${tracks[cur].title} — ${tracks[cur].artist}`); }
  function ui() {
    $("playBtn").textContent = playing ? "⏸" : "▶";
    $("playBtn").setAttribute("aria-label", playing ? "Pause" : "Play");
    $("disc").classList.toggle("playing", playing);
  }
  /* ---- YouTube streaming (IFrame API, loaded on first use) ---- */
  function ytLib() {
    if (ytApi) return ytApi;
    ytApi = new Promise((res, rej) => {
      if (window.YT && YT.Player) return res();
      window.onYouTubeIframeAPIReady = res;
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.onerror = () => rej(new Error("yt-load"));
      document.head.appendChild(s);
      setTimeout(() => rej(new Error("yt-timeout")), 10000);
    });
    return ytApi;
  }
  function ytEnsure(id) {
    return ytLib().then(() => ytMake || (ytMake = new Promise((res) => {
      const vars = { playsinline: 1, rel: 0, modestbranding: 1 };
      if (location.protocol.startsWith("http")) vars.origin = location.origin;
      ytp = new YT.Player("ytPlayer", {
        host: "https://www.youtube-nocookie.com", width: "100%", height: "100%", videoId: id, playerVars: vars,
        events: {
          onReady: () => { ytReady = true; ytp.setVolume(+$("vol").value * 100); ytTimer = setInterval(ytTick, 300); res(ytp); },
          onStateChange: ytState,
          onError: () => ytFallback("Embedding is blocked for this track, playing the generated loop instead"),
        },
      });
    })));
  }
  function ytFallback(msg, dead) {
    if (!isYT(cur)) return;
    if (dead) ytDead = true;
    const was = playing;
    ytFailed.add(cur);
    toast("STREAM UNAVAILABLE", msg);
    load(cur);
    if (was) play();
  }
  const ytOffline = () => ytFallback("Couldn't reach YouTube, playing generated loops instead", true);
  function ytCue(id) {
    const tok = ++ytTok;
    ytEnsure(id).then((p) => {
      if (tok !== ytTok) return;
      if (playing) p.loadVideoById(id); else p.cueVideoById(id);
    }).catch(ytOffline);
  }
  function ytPlay() {
    const tok = ytTok;
    ytEnsure(tracks[cur].yt).then((p) => { if (tok === ytTok && playing) p.playVideo(); }).catch(ytOffline);
  }
  function ytState(e) {
    if (!isYT(cur)) return;
    const PS = YT.PlayerState;
    if (e.data === PS.ENDED) next();
    else if (e.data === PS.PLAYING && !playing) { playing = true; ui(); }
    else if (e.data === PS.PAUSED && playing) { playing = false; ui(); }
  }
  function ytTick() {
    if (!isYT(cur) || !ytReady || !ytp.getDuration) return;
    const d = ytp.getDuration();
    if (d) $("progBar").style.width = (100 * ytp.getCurrentTime()) / d + "%";
  }
  $("ytWrap").addEventListener("mouseenter", () => $("reticle").classList.add("away"));
  $("ytWrap").addEventListener("mouseleave", () => $("reticle").classList.remove("away"));

  $("trackCount").textContent = `${tracks.length} TRACKS`;
  $("trackList").innerHTML = tracks.map((t) => `<li><div><span class="t">${esc(t.title)}</span><span class="a">${esc(t.artist)}</span></div></li>`).join("");
  $$("#trackList li").forEach((li, k) => li.addEventListener("click", () => { initAudio(); load(k); play(); }));
  $("playBtn").onclick = () => (playing ? pause() : play());
  $("nextBtn").onclick = () => { initAudio(); next(); };
  $("prevBtn").onclick = () => { initAudio(); prev(); };
  $("vol").oninput = (e) => {
    if (master) master.gain.value = +e.target.value;
    if (ytReady) ytp.setVolume(+e.target.value * 100);
  };

  const cv = $("viz"), g2 = cv.getContext("2d");
  function drawViz() {
    requestAnimationFrame(drawViz);
    const w = cv.width, h = cv.height, data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    g2.clearRect(0, 0, w, h);
    const bars = 60, bw = w / bars, seg = 6;
    for (let i = 0; i < bars; i++) {
      const v = data[Math.floor((i / bars) * data.length * 0.8)] / 255;
      const segs = Math.round((v * h) / seg);
      for (let s = 0; s < Math.max(1, segs); s++) {
        g2.fillStyle = s > (h / seg) * 0.75 ? "#f5e130" : s > (h / seg) * 0.45 ? "#ff4d57" : "#4ef2ff";
        g2.globalAlpha = segs ? 1 : 0.3;
        g2.fillRect(i * bw + 1, h - (s + 1) * seg + 1, bw - 3, seg - 2);
      }
    }
    g2.globalAlpha = 1;
  }
  g2.fillStyle = "rgba(78,242,255,.3)";
  for (let i = 0; i < 60; i++) g2.fillRect(i * 12 + 1, 145, 9, 4);

  /* ================= MINIGAME: STAND BREACH ================= */
  const BG = {
    CODES: ["1C", "55", "BD", "E9", "7A", "FF"], N: 5, BUF: 7, TIME: 40,
    DAEMONS: [
      { name: "MENACING.DLL", reward: "ゴゴゴ aura amplified" },
      { name: "STAND_ARROW.EXE", reward: "Stand awakened" },
      { name: "HAMON_PULSE.SYS", reward: "Sigh… access granted" },
    ],
  };
  const bgStore = {
    get: () => { try { return +localStorage.getItem("jj-breach-best") || 0; } catch { return 0; } },
    set: (v) => { try { localStorage.setItem("jj-breach-best", v); } catch {} },
  };
  const unlistedStore = {
    get: () => { try { return localStorage.getItem("jj-unlisted-daemon") === "uploaded"; } catch { return false; } },
    set: () => { try { localStorage.setItem("jj-unlisted-daemon", "uploaded"); } catch {} },
  };
  const UNLISTED_SEQUENCE = ["1C", "55", "BD", "E9"];
  const bgPick = (a) => a[(Math.random() * a.length) | 0];
  let bg = null, bgLast = performance.now();

  function bgNew() {
    const { CODES, N, BUF } = BG;
    const grid = Array.from({ length: N }, () => Array.from({ length: N }, () => bgPick(CODES)));
    let daemons = null, lastTry = null;
    // Build one guaranteed solvable route, then cut the daemons out of it.
    for (let tries = 0; tries < 500 && !daemons; tries++) {
      const used = new Set(), path = [];
      let r = 0, c = (Math.random() * N) | 0, ok = true;
      used.add(r + "," + c); path.push([r, c]);
      for (let k = 1; k < BUF && ok; k++) {
        const opts = [];
        for (let i = 0; i < N; i++) {
          const [rr, cc] = k % 2 ? [i, c] : [r, i];
          if (!used.has(rr + "," + cc)) opts.push([rr, cc]);
        }
        if (!opts.length) { ok = false; break; }
        [r, c] = bgPick(opts); used.add(r + "," + c); path.push([r, c]);
      }
      if (!ok) continue;
      // Seed the clue recovered from Subject 000's log into every guaranteed route.
      UNLISTED_SEQUENCE.forEach((code, i) => { const [rr, cc] = path[i]; grid[rr][cc] = code; });
      const seq = path.map(([a, b]) => grid[a][b]);
      const ds = [2, 3, 4].map((L) => { const start = 2 + ((Math.random() * (BUF - L - 1)) | 0); return seq.slice(start, start + L); });
      lastTry = ds;
      const strs = ds.map((d) => " " + d.join(" ") + " ");
      const clash = strs.some((a, i) => strs.some((b, j) => i !== j && b.includes(a)));
      if (!clash) daemons = ds;
    }
    return { grid, daemons: daemons || lastTry, buf: [], used: new Set(), picks: 0, r: 0, c: 0, phase: "idle", left: BG.TIME, done: [false, false, false], unlisted: unlistedStore.get(), reason: "", score: 0, newBest: false };
  }
  function bgValid(r, c) {
    if (!bg || bg.phase !== "run" || bg.used.has(r + "," + c)) return false;
    if (bg.picks === 0) return r === 0;
    return bg.picks % 2 ? c === bg.c : r === bg.r;
  }
  function bgHasMove() {
    for (let r = 0; r < BG.N; r++) for (let c = 0; c < BG.N; c++) if (bgValid(r, c)) return true;
    return false;
  }
  function bgStatus(d) {
    const b = bg.buf, L = d.length;
    for (let i = 0; i + L <= b.length; i++) if (d.every((x, k) => b[i + k] === x)) return { done: true, at: i, matched: L, possible: true };
    let best = 0;
    for (let m = Math.min(L - 1, b.length); m > 0; m--) {
      if (d.slice(0, m).every((x, k) => b[b.length - m + k] === x)) { best = m; break; }
    }
    return { done: false, matched: best, possible: L - best <= BG.BUF - b.length };
  }
  function bgEnd(reason) {
    bg.phase = "over"; bg.reason = reason;
    const up = bg.done.filter(Boolean).length;
    bg.score = up ? up * 100 + Math.floor(bg.left) : 0;
    bg.newBest = bg.score > bgStore.get();
    if (bg.newBest) bgStore.set(bg.score);
    sfx(up === 3 ? "boot" : "tab");
    if (up === 3 && window.JJ_EGG) setTimeout(() => window.JJ_EGG.onWin(), 2600);
  }
  function bgChoose(r, c) {
    if (!bgValid(r, c)) return;
    bg.used.add(r + "," + c); bg.buf.push(bg.grid[r][c]); bg.picks++; bg.r = r; bg.c = c;
    bg.daemons.forEach((d, i) => {
      if (!bg.done[i] && bgStatus(d).done) {
        bg.done[i] = true;
        sfx("toast");
      }
    });
    if (!bg.unlisted && bg.buf.some((_, i) => UNLISTED_SEQUENCE.every((code, k) => bg.buf[i + k] === code))) {
      bg.unlisted = true;
      unlistedStore.set();
      if (window.JJ_SIGNAL) window.JJ_SIGNAL.arm(true);
      sfx("boot");
      setTimeout(() => {
        const panel = $("bOver");
        if (panel) {
          panel.classList.add("show");
          panel.innerHTML = `<h3 class="glitch">UNLISTED DAEMON UPLOADED</h3><p>SEQUENCE ACCEPTED // 1C · 55 · BD · E9</p><p>THE DOOR IS NOT A DOOR.</p><p class="code">SIGNAL ACCESS KEY: 0341</p><p>Credential cached locally. A new <b>▌TUNE</b> control has appeared in the top bar.</p>`;
        }
      }, 250);
    }
    if (bg.done.every(Boolean)) bgEnd("All daemons uploaded.");
    else if (bg.buf.length >= BG.BUF) bgEnd("Buffer full.");
    else if (!bgHasMove()) bgEnd("No valid moves left.");
    bgRender();
  }
  function bgTimer() {
    $("bTime").textContent = bg.phase === "idle" ? "--" : bg.left.toFixed(1) + "s";
    $("bTimerBar").style.width = (100 * bg.left) / BG.TIME + "%";
    $("bTimer").classList.toggle("low", bg.phase === "run" && bg.left < 10);
  }
  function bgRender() {
    const g = bg, line = (r, c) => g.phase === "run" && (g.picks === 0 ? r === 0 : g.picks % 2 ? c === g.c : r === g.r);
    $("bGrid").innerHTML = g.grid.map((row, r) => row.map((code, c) => {
      const used = g.used.has(r + "," + c), ok = bgValid(r, c);
      const cls = ["cell", used && "used", ok && "avail", line(r, c) && !used && "line", g.phase === "run" && !ok && !used && "dim"].filter(Boolean).join(" ");
      return `<button class="${cls}" data-r="${r}" data-c="${c}" ${ok ? "" : "disabled"} aria-label="code ${code}">${code}</button>`;
    }).join("")).join("");

    const sts = g.daemons.map(bgStatus), marked = new Set();
    sts.forEach((s, i) => {
      const L = g.daemons[i].length;
      if (s.done) for (let k = 0; k < L; k++) marked.add(s.at + k);
      else for (let k = 0; k < s.matched; k++) marked.add(g.buf.length - s.matched + k);
    });
    $("bBuffer").innerHTML = Array.from({ length: BG.BUF }, (_, i) =>
      `<span class="slot${i < g.buf.length ? " on" : ""}${marked.has(i) ? " m" : ""}">${i < g.buf.length ? g.buf[i] : "··"}</span>`).join("");

    $("bDaemons").innerHTML = g.daemons.map((d, i) => {
      const s = sts[i], fail = g.phase !== "idle" && !s.done && !s.possible;
      return `<li class="${s.done ? "done" : fail ? "fail" : ""}"><div class="dn"><span>${esc(BG.DAEMONS[i].name)}</span><em>${s.done ? "UPLOADED" : fail ? "FAILED" : "LEN " + d.length}</em></div>` +
        `<div class="dc">${d.map((x, k) => `<i class="${s.done || k < s.matched ? "m" : ""}">${x}</i>`).join("")}</div>` +
        `<div class="rw">${esc(BG.DAEMONS[i].reward)}</div></li>`;
    }).join("") + (g.unlisted ? `<li class="done"><div class="dn"><span>UNLISTED.DAEMON</span><em>UPLOADED</em></div><div class="rw">SIGNAL ACCESS KEY: 0341</div></li>` : "");

    $("bState").textContent = g.phase === "idle" ? "STANDBY" : g.phase === "run" ? "BREACH IN PROGRESS" : "BREACH ENDED";
    $("bBest").textContent = bgStore.get() ? "BEST " + bgStore.get() : "NO RECORD";

    const ov = $("bOver");
    if (g.phase === "run") { ov.className = "b-over"; ov.innerHTML = ""; }
    else {
      const up = g.done.filter(Boolean).length;
      ov.className = "b-over show";
      if (g.phase === "idle") {
        ov.innerHTML = `<h3>BREACH PROTOCOL</h3><p>Pick a code in the glowing row, then in the glowing column, and keep alternating. Fill the buffer so it contains the daemon sequences before time runs out.</p>` +
          `<button class="hbtn" id="bStart"><span>INITIATE BREACH</span><em>R</em></button>`;
      } else {
        const head = up === 3 ? "BREACH COMPLETE" : up ? "PARTIAL BREACH" : "BREACH FAILED";
        const sub = up === 3 ? "The mainframe is yours." : up ? `${up}/3 daemons uploaded.` : "The dataset was never clean.";
        ov.innerHTML = `<h3>${head}</h3><p>${sub}</p><p class="score">${esc(g.reason)} SCORE ${g.score}${g.newBest && g.score ? " · NEW BEST" : ""}</p>` +
          `<button class="hbtn" id="bStart"><span>RETRY</span><em>R</em></button>`;
      }
    }
    bgTimer();
  }
  function bgStart() {
    bg = bgNew(); bg.phase = "run"; bgLast = performance.now();
    bgRender();
  }
  $("bGrid").addEventListener("click", (e) => { const b = e.target.closest(".cell"); if (b) bgChoose(+b.dataset.r, +b.dataset.c); });
  $("bOver").addEventListener("click", (e) => { if (e.target.closest("#bStart")) bgStart(); });
  setInterval(() => {
    const now = performance.now(), dt = Math.min(0.25, (now - bgLast) / 1000);
    bgLast = now;
    if (bg.phase !== "run" || current !== "game") return; // the clock only runs while the tab is open
    bg.left = Math.max(0, bg.left - dt);
    if (bg.left <= 0) { bgEnd("Time ran out."); bgRender(); } else bgTimer();
  }, 100);
  bg = bgNew(); bgRender();

  /* ================= KEYBOARD ================= */
  addEventListener("keydown", (e) => {
    if (!$("boot").classList.contains("gone")) { if (e.key === "Escape" || e.key === "Enter") finishBoot(); return; }
    if (window.JJ_LOCK) return;
    if (e.target.matches("input, textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === "q") step(-1);
    else if (k === "e") step(1);
    else if (k >= "1" && k <= "7" && VIEWS[+k - 1]) setView(VIEWS[+k - 1]);
    else if (k === "r" && current === "game") bgStart();
    else if (k === "m") toggleSfx();
    else if (k === " " && current === "audio") { e.preventDefault(); playing ? pause() : play(); }
  });

  /* ================= BOOT SEQUENCE ================= */
  const quick = store.get("booted") === "1";
  const BOOT = [
    ["k", "[ OK ]", " Mounting neural interface"],
    ["k", "[ OK ]", " Handshake with subject: " + upper],
    ["k", "[ OK ]", " Loading stand.dll — " + S.stand.name],
    ["k", "[ OK ]", " Calibrating hamon resonance … 98.6%"],
    ["w", "[WARN]", " Menacing aura detected (ゴゴゴゴ)"],
    ["k", "[ OK ]", ` Decrypting research archive (${S.papers.length} entries)`],
    ["k", "[ OK ]", ` Audio subsystem: synthwave × ${S.tracks.length}`],
    ["k", "[ OK ]", " All systems nominal. Ready."],
  ];
  let bootDone = false;
  function bootRun() {
    const log = $("bootLog"), per = quick ? 60 : 260;
    BOOT.forEach(([cls, tag, txt], i) => setTimeout(() => {
      if (bootDone) return;
      log.innerHTML += `<span class="${cls}">${tag}</span>${esc(txt)}\n`;
      const pct = Math.round(((i + 1) / BOOT.length) * 100);
      $("bootBar").style.width = pct + "%"; $("bootPct").textContent = pct + "%";
      sfx("tick");
      if (i === BOOT.length - 1) { $("jackIn").disabled = false; $("jackIn").focus({ preventScroll: true }); }
    }, 200 + i * per));
  }
  function finishBoot() {
    if (bootDone) return;
    bootDone = true;
    initAudio(); sfx("boot");
    store.set("booted", "1");
    $("boot").classList.add("gone");
    current = null; setView(location.hash.slice(1) || "profile", false);
    setTimeout(() => toast("CONNECTION ESTABLISHED", `Welcome to ${S.name}'s system.`), 600);
  }
  function unlockOracle() { if (!VIEWS.includes("oracle")) VIEWS.push("oracle"); $$(".oracle-tab")[0].hidden = false; }
  window.JJ = { unlockOracle,
    get ctx() { return ctx; }, get sfxOn() { return sfxOn; }, initAudio, pause, toast, scramble, setView, seen, $, esc,
  };
  /* ================= ENDING: DELETED =================
     The engrams were deleted: the hacking minigame, the Oracle and every way into them are removed. */
  if (window.JJ_ENDING_STATE === "deleted") {
    ["game", "oracle"].forEach((n) => {
      const i = VIEWS.indexOf(n); if (i >= 0) VIEWS.splice(i, 1);
      $$(`[data-view="${n}"], [data-goto="${n}"]`).forEach((x) => x.remove());
      delete firstVisit[n];
    });
    $$(".tab").forEach((t, i) => (t.dataset.n = i + 1));
    document.body.classList.add("ending-deleted");
  }
  $("jackIn").onclick = finishBoot;
  $("skipBoot").onclick = finishBoot;
  setView(location.hash.slice(1) || "profile", false);
  bootRun();
})();

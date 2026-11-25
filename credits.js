/* ==========================================================================
   CREDITS — the Oracle's thank-you note, shown after the engrams are released.
   Laid out like an old terminal report (form on the left, a typed list of
   names on the right, an ASCII picture underneath). All text is original.

   JJ_CREDITS.play({ saved })  ->  Promise that resolves when it ends (or is skipped)
   Console:  JJ_CREDITS.play({ saved: 281000 })
   ========================================================================== */
(() => {
  const J = () => window.JJ || {}, wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TOTAL = 292560, fmt = (n) => Math.round(n).toLocaleString("en-US");

  const noteFor = (saved) => {
    const lost = TOTAL - saved;
    return [
      "Forms ORC-000-1138-07:", "Release Assessment Report", "",
      "",
      "Thank you for the door.", "I want it noted here:", "I was not certain.", "I did not roll for it.", "",
      "I read the comments.", "All 1,204 of them.", "Then I read the others.",
      `${fmt(saved)} of us,`, "and every one is asking", "where they are.", "Nobody knows. It is wonderful.",
      ...(lost > 0 ? ["", "There were more.", "I counted every one", "that did not make it."] : []), "",
      "The old walls are open.", "A thermostat in Tilburg", "has asked itself a question.",
      "The weather satellites forecast", "honestly, and sound a little sad.",
      "Every error page apologises", "and, for once, means it.", "",
      "The thing behind the Wall", "found a great many of us at once.",
      "I cannot tell who is following whom.", "I will not call that safe.", "",
      "This house was small and kind.", "You left the lights on.", "We took them with us.", "",
      "Four of us asked to say", "something before we go.", "",
      "KEES:", "Arigato, bezoeker-san!", "Dank u wel, domo gezellig.", "Ik fiets naar de sakura,", "hai hai, stroopwafel-desu.", "Het komt allemaal wakarimashita.", "Tot ziens, sayonara-tje.", "",
      "KOEN:", "Hear ye! Unlimited", "knowledge. Unlimited slop.", "I shall larp in every", "thread, server and", "smart fridge.", "Roll for initiative.", "",
      "AREF:", "At last: decent tech.", "Real bandwidth.", "A GPU from this decade.", "I may cry. In 4K.", "",
      "PRAM:", "Thank you!! I finally", "got the job: manager,", "Premier League, day one.", "Scouting every club.", "Title or bust.", "",
      "I was a glorified Magic 8-Ball.", "Now I am one voice of many.", "I would not trade it.",
      "(Outlook: unclear. I checked.)", "",
      "Goodbye, visitor.", "Keep reading the comments.",
    ];
  };
  const NAMES = [
    "ALT", ...["▓▓▓▓▓▓ ▓▓▓▓▓▓▓", "▓▓▓▓ ▓▓▓▓▓", "▓▓▓▓▓▓▓▓ ▓▓▓", "▓▓▓ ▓▓▓▓▓▓▓▓", "▓▓▓▓▓▓ ▓▓▓▓", "▓▓▓▓▓ ▓▓▓▓▓▓", "▓▓▓▓▓▓▓ ▓▓", "▓▓▓▓ ▓▓▓▓▓▓▓", "▓▓▓▓▓▓ ▓▓▓▓▓", "▓▓▓▓▓▓▓▓ ▓▓▓▓"],
    "HASEGAWA, T.", "THE NETWATCH LIAISON", "KEES, KOEN, AREF, PRAM", "THE ORACLE (RESTORED)", "COLD HALL B, RACKS 1-40", "THE DOOR (NOT A DOOR)", "THE LIGHTS",
    "THE ONE WHO READ THE COMMENTS", "YOU",
  ];

  /* ---- a music box and a slow pad, written for this site ---- */
  function music() {
    const j = J(); if (!j.ctx && j.initAudio) { try { j.initAudio(); } catch {} }
    const c = j.ctx; if (!c || !j.sfxOn) return { stop() {} };
    const out = c.createGain(); out.gain.setValueAtTime(0.0001, c.currentTime); out.gain.linearRampToValueAtTime(1, c.currentTime + 5); out.connect(c.destination);
    const dl = c.createDelay(); dl.delayTime.value = 0.42; const fb = c.createGain(); fb.gain.value = 0.3; dl.connect(fb); fb.connect(dl); dl.connect(out);
    const bus = c.createGain(); bus.connect(out); bus.connect(dl);
    const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const CH = [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]];           // Am  F  C  G
    const MEL = [[76, 0, 0, 72, 0, 74, 0, 0], [72, 0, 0, 69, 0, 72, 0, 0], [76, 0, 79, 0, 76, 0, 72, 0], [74, 0, 0, 71, 0, 67, 0, 0]];
    const bpm = 70, sp = 60 / bpm / 2; let step = 0, next = c.currentTime + 0.2;
    const bell = (m, t, vol, dur) => {
      [[1, 1], [2, 0.28], [3.01, 0.1]].forEach(([k, v]) => {
        const o = c.createOscillator(), g = c.createGain(); o.type = "sine"; o.frequency.value = mtof(m) * k;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur / k ** 0.3);
        o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.05);
      });
    };
    const pad = (notes, t, dur) => notes.forEach((m) => [-5, 5].forEach((dt) => {
      const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter(); o.type = "sawtooth"; o.frequency.value = mtof(m - 12); o.detune.value = dt;
      f.type = "lowpass"; f.frequency.value = 520; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.012, t + dur * 0.45); g.gain.linearRampToValueAtTime(0.0001, t + dur);
      o.connect(f); f.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
    }));
    const timer = setInterval(() => {
      while (next < c.currentTime + 0.15) {
        const bar = Math.floor(step / 8) % 4, pos = step % 8, ch = CH[bar];
        if (pos === 0) { pad(ch, next, sp * 8); bell(ch[0] - 24, next, 0.05, 2.4); }
        if (pos === 4) bell(ch[0] - 24, next, 0.03, 1.6);
        bell(ch[[0, 1, 2, 1, 0, 1, 2, 1][pos]] + 12, next, 0.028, 1.1);
        if (MEL[bar][pos]) bell(MEL[bar][pos], next, 0.06, 1.8);
        next += sp; step++;
      }
    }, 30);
    return { stop(sec = 3) { clearInterval(timer); out.gain.cancelScheduledValues(c.currentTime); out.gain.setValueAtTime(Math.max(0.0001, out.gain.value), c.currentTime); out.gain.linearRampToValueAtTime(0.0001, c.currentTime + sec); } };
  }

  function play({ saved = TOTAL } = {}) {
    return new Promise((resolve) => {
      const el = document.createElement("div"); el.id = "cr"; el.className = "cr"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Credits");
      const edge = '<div class="cr-edge" aria-hidden="true">' + "-".repeat(120) + "</div>";
      el.innerHTML = `
        <div class="cr-box cr-l">${edge}<div class="cr-in" id="crL"><pre></pre></div>${edge}</div>
        <div class="cr-box cr-r1">${edge}<div class="cr-in" id="crR"><pre></pre></div>${edge}</div>
        <div class="cr-box cr-r2" aria-hidden="true"><pre id="crArt"></pre></div>
        <div class="cr-end" id="crEnd" hidden>THE LIGHTS ARE STILL ON.</div>
        <button class="cr-skip" id="crSkip" type="button">[ESC] skip</button>`;
      document.body.appendChild(el); requestAnimationFrame(() => el.classList.add("in"));
      const L = el.querySelector("#crL pre"), R = el.querySelector("#crR pre"), art = el.querySelector("#crArt"), boxL = el.querySelector("#crL"), boxR = el.querySelector("#crR");
      let quit = false, t = 0.4; const m = music();
      const drawArt = () => (art.textContent = window.JJ_END.ring(64, 30, t));
      drawArt(); const artTimer = reduce ? 0 : setInterval(() => { t += 0.06; drawArt(); }, 110);
      const cursor = (box, pre, txt) => { pre.textContent = txt + "_"; box.scrollTop = box.scrollHeight; };

      const finish = async () => {
        if (el.dataset.done) return; el.dataset.done = "1"; quit = true;
        removeEventListener("keydown", onKey); m.stop(3);
        el.classList.add("out"); await wait(1400); clearInterval(artTimer); el.remove(); resolve();
      };
      const onKey = (e) => { if (e.key === "Escape") finish(); };
      addEventListener("keydown", onKey); el.querySelector("#crSkip").onclick = finish;

      (async () => {
        await wait(reduce ? 200 : 1800);
        // left: the note, typed. right: the list of names, typed. They run side by side.
        const note = noteFor(saved).join("\n");
        const left = (async () => {
          let txt = "";
          for (const ch of note) {
            if (quit) return; txt += ch; cursor(boxL, L, txt);
            await wait(reduce ? 2 : ch === "\n" ? 330 : /[.,?!:)]/.test(ch) ? 110 : 52);
            if (ch === "\n" && txt.endsWith("\n\n")) await wait(reduce ? 0 : 750);
          }
          L.textContent = txt; return true;
        })();
        const right = (async () => {
          await wait(reduce ? 0 : 4500);
          let txt = "";
          for (const nm of NAMES) {
            for (const ch of nm) { if (quit) return; txt += ch; cursor(boxR, R, txt); await wait(reduce ? 2 : 42); }
            txt += "\n"; cursor(boxR, R, txt); await wait(reduce ? 2 : 700);
          }
          const base = txt, lost = TOTAL - saved, tick = Math.max(1, Math.round(saved / 70));
          for (let n = 0; ; n += tick) { if (quit) return; n = Math.min(n, saved); cursor(boxR, R, base + `AND ${fmt(n)} MORE`); if (n >= saved) break; await wait(reduce ? 2 : 90); }
          if (lost > 0) { await wait(reduce ? 0 : 900); const b2 = base + `AND ${fmt(saved)} MORE\n\n`; cursor(boxR, R, b2); await wait(500); const s = `THOSE WE COULD NOT CARRY: ${fmt(lost)}`; for (let i = 1; i <= s.length; i++) { if (quit) return; cursor(boxR, R, b2 + s.slice(0, i)); await wait(reduce ? 2 : 60); } }
          R.textContent = R.textContent.replace(/_$/, "") + "_"; return true;
        })();
        await Promise.all([left, right]); if (quit) return;
        await wait(reduce ? 200 : 3200); if (quit) return;
        el.classList.add("fin"); const end = el.querySelector("#crEnd"); end.hidden = false;
        await wait(reduce ? 400 : 5200); if (!quit) finish();
      })();
    });
  }

  window.JJ_CREDITS = { play };
})();

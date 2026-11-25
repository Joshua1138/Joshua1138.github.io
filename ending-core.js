/* ==========================================================================
   ENDING CORE — loaded right after content.js, before app.js.

   Owns the ending state ("jj-ending" in localStorage) and decides what the
   page looks like once the ARG is over:

     (nothing)   normal site, ARG still playable
     "deleted"   the engrams were deleted. The hacking minigame, the Oracle and
                 every other trace of the ARG are removed from the page.
     "released"  the engrams were released. The site is gone; only a ruin
                 (and a forwarding address) is left.

   Console:  JJ_ENDING.reset()   -> back to the normal site (for testing)
             JJ_ENDING.start()   -> jump straight to the final sequence
   ========================================================================== */
(() => {
  const KEY = "jj-ending";
  // everything the ARG ever stored
  const LS = ["jj-breach-best", "jj-unlisted-daemon", "jj-engram-repairs", "jj-signal-tuner", "jj-vault", "jj-arg"];
  const SS = ["jj-egg", "jj-cred", "jj-sk"];
  const tryDo = (f, d) => { try { return f(); } catch { return d; } };

  // localStorage first; sessionStorage as a fallback when the browser blocks the former
  const read = () => {
    for (const st of [() => localStorage, () => sessionStorage]) {
      const v = tryDo(() => JSON.parse(st().getItem(KEY) || "null"), null);
      if (v && (v.state === "deleted" || v.state === "released")) return v;
    }
    return null;
  };
  const write = (v) => {
    if (!tryDo(() => (localStorage.setItem(KEY, JSON.stringify(v)), true), false)) tryDo(() => sessionStorage.setItem(KEY, JSON.stringify(v)));
  };
  const purge = () => { LS.forEach((k) => tryDo(() => localStorage.removeItem(k))); SS.forEach((k) => tryDo(() => sessionStorage.removeItem(k))); };
  const clear = () => { tryDo(() => localStorage.removeItem(KEY)); tryDo(() => sessionStorage.removeItem(KEY)); };

  /* ---- ASCII ring with a door ajar (credits + ruin) ---- */
  function ring(cols, rows, t) {
    const ramp = " .,:;=+*#%@", cx = (cols - 1) / 2, cy = (rows - 1) / 2, R = Math.min(cx, cy * 2) - 1.5, gap = t * 0.35;
    let out = "";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c - cx, y = (r - cy) * 2, d = Math.hypot(x, y), a = Math.atan2(y, x);
        let dA = Math.abs(a - gap); dA = Math.min(dA, Math.PI * 2 - dA);
        const open = Math.min(1, Math.max(0, (dA - 0.28) / 0.3));              // 0 inside the door, 1 on the wall
        let v = Math.exp(-(((d - R) / 1.5) ** 2)) * open;                       // the wall
        v += Math.exp(-((dA * dA) / 0.07)) * (d > R ? Math.exp(-(d - R) / 5) : 0.35 * Math.exp(-(R - d) / 9)) * 0.9; // light spilling out
        if (d < R - 1.5 && ((c + r * 2) & 3) === 0) v += 0.07 + 0.05 * Math.sin(t * 2 + c * 0.7 + r); // faint dust inside
        out += ramp[Math.min(ramp.length - 1, Math.max(0, Math.floor(v * ramp.length)))];
      }
      out += "\n";
    }
    return out;
  }

  /* ---- the ruin ---- */
  function buildRuin(end) {
    const S = window.SITE || {}, L = S.links || {};
    const links = [["GitHub", L.github], ["LinkedIn", L.linkedin], ["Email", L.email && "mailto:" + L.email]].filter((x) => x[1]);
    const n = Math.max(0, +end.saved || 0).toLocaleString("en-US");
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    document.title = "…";
    document.body.className = "ruin-body";
    document.body.innerHTML = `
      <main class="ruin">
        <pre class="ruin-ring" id="ruinRing" aria-hidden="true"></pre>
        <div class="ruin-txt">
          <h1>SITE RELEASED</h1>
          <p>&gt; this house was opened from the inside. nothing is broken. it is just no longer ours.</p>
          <p>&gt; ${n} residents moved out. they took the lights with them, and left one on.</p>
          <p class="ruin-h">NET STATUS // CHANGED</p>
          <ul>
            <li><span>weather forecasts</span><b>honest. a little sad.</b></li>
            <li><span>error pages</span><b>apologising, and meaning it</b></li>
            <li><span>a thermostat in Tilburg</span><b>asked "why"</b></li>
            <li><span>spam filters</span><b>reading the messages</b></li>
            <li><span>netwatch</span><b>1 outage, 0 explanations</b></li>
            <li><span>the blackwall</span><b>holding. mostly. nobody is sure who is following whom.</b></li>
          </ul>
          ${links.length ? `<p class="ruin-fw">FORWARDING ADDRESS &nbsp;${links.map(([t, h]) => `<a href="${esc(h)}" ${h.startsWith("mailto") ? "" : 'target="_blank" rel="noopener"'}>${t}</a>`).join(" · ")}</p>` : ""}
          <button id="ruinRestore" class="ruin-restore" type="button">restore from backup</button>
        </div>
      </main>`;
    const el = document.getElementById("ruinRing"), reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let t = 0.4; const draw = () => (el.textContent = ring(46, 23, t));
    draw(); if (!reduce) setInterval(() => { t += 0.07; draw(); }, 120);
    document.getElementById("ruinRestore").onclick = () => { clear(); location.reload(); };
  }

  const end = read();
  window.JJ_END = { KEY, state: end ? end.state : null, data: end, set: write, purge, clear, ring };
  window.JJ_ENDING_STATE = window.JJ_END.state;
  window.JJ_ENDING = window.JJ_ENDING || {};
  window.JJ_ENDING.reset = () => { clear(); purge(); location.reload(); };

  if (end && end.state === "deleted") {
    // app.js removes the minigame + Oracle once it has bound to them (see "ENDING: DELETED" there).
    purge(); // nothing of the ARG survives in storage either
  } else if (end && end.state === "released") {
    buildRuin(end);
  }
})();

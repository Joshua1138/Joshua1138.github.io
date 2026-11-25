# Joshua Janssen — personal site

Cyberpunk × JoJo personal website. Plain HTML/CSS/JS, no build step.

## Edit your content
Everything personal is in **`content.js`**: headline, about text, Stand stats (radar chart),
skills, papers and the soundtrack.

PDFs of the theses live in `papers/` and are linked from the Research Archive.

## Music
Each track in `content.js` has a `yt` field with its YouTube video ID (the part after `v=`
in the link). The player streams it through YouTube's embedded player. If YouTube can't be
reached, or the uploader blocked embedding, that track plays a generated synthwave loop instead.
Note: YouTube embeds don't work when the page is opened straight from disk (`file://`),
only once it's served over http(s), e.g. on GitHub Pages.
You can also use a local audio file by adding `src: "music/file.mp3"` to a track.

## Minigame
The **GAME** tab (key 5) is "Stand Breach", a breach-protocol style hacking puzzle:
fill the buffer so it contains the three daemon sequences before the timer runs out.
Best score is kept in the browser's local storage.

## Easter egg: the Blackwall
Upload all 3 daemons in the GAME tab and a netrunner transmission arrives (replay it via the `▌MSG`
button). It hints at a crack in the site. Finding it leads to the encounter in `blackwall.js`
(styles at the bottom of `style.css`). Progress is kept per browser session.
Testing in the browser console: `JJ_EGG.arm()`, `JJ_EGG.breach()`, `JJ_EGG.reset()`.
Rewrite the dialogue in the `MSG` array and in `breach()`.

## Host for free on GitHub Pages
1. Create a **public** repo named exactly `Joshua1138.github.io`.
2. Push these files to its `main` branch:
   ```bash
   git remote add origin https://github.com/Joshua1138/Joshua1138.github.io.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   branch `main`, folder `/ (root)`.
4. After a minute the site is live at **https://joshua1138.github.io**.


## ARG — Engram Repair (Stage 1)
The Mikoshi log cache (`mikoshi/l0g-0077/`) now contains four optional recovery puzzles in SK-022, SK-040, SK-071 and SK-077. Their clues cross-reference the other fragments. Solved sectors and the reconstructed protocol are saved in browser local storage (`jj-engram-repairs`). Clearing site data resets this progress.


## ARG — Unlisted Daemon (Stage 2)
After reconstructing Subject 000's observation protocol, the recovered trace `1C → 55 → BD → E9` can be entered as a hidden sequence in Stand Breach. The route is seeded into every generated breach path so it is consistently solvable. Uploading it reveals the signal access key `0341`. Completion is saved in browser local storage (`jj-unlisted-daemon`).


## ARG — Tune the Signal (Stage 3)
Uploading the unlisted daemon adds a **▌TUNE** button to the top bar (it also reappears on later visits). It opens `signal.js`, an oscilloscope-style tuner:
1. Enter the signal access key `0341`. The key is also the carrier frequency (3.41).
2. Match the red incoming trace with frequency, amplitude and phase sliders (target: 3.41 / 7.0 / 138°) and hold the lock for about 1.2 s.
3. A transmission from Subject 000 is decoded. It points at the Mikoshi Vault (Stage 4), whose combination will reuse the three locked values.
The optional MONITOR button plays the two traces as tones in each ear; the beating stops when they match. Progress is saved in local storage (`jj-signal-tuner`).
Testing in the console: `JJ_SIGNAL.open()`, `JJ_SIGNAL.solve()`, `JJ_SIGNAL.reset()`.


## ARG — Mikoshi Vault (Stage 4)
Once the signal tuner has been locked (Stage 3), the Mikoshi log cache shows an extra entry, **SK-000 · MIKOSHI VAULT**, at the bottom of the fragment list.
1. **Tumblers:** three 3-digit wheels, set from the three locked values scaled to whole numbers: pitch ×100 = `341`, height ×10 = `070`, angle ×1 = `138`. A wrong combination reports how many tumblers are engaged.
2. **Voiceprint:** the grille asks four questions about Subject 000, and every answer is written in the logs: her first words after mount (SK-022: *it is very quiet in here*), what the unnetworked terminal printed (*the door is not a door*, SK-040), what she asked to keep on (*the lights*, SK-071 / SK-077) and when the lockdown began (`03:41`, SK-077). Each correct answer locks in and is saved (`jj-vault.answered`).
3. The vault opens and SK-000 (Subject 000's root engram) is readable. It tells the player to give the file to the Oracle, which sets up Stage 5.
Progress is saved in local storage (`jj-vault`: `stage` = `voice` after the tumblers, `open` = `true` when finished). The vault is not counted in the nine fragments that unlock SK-∞.
Reset in the console: `localStorage.removeItem("jj-vault")`.


## ARG — Oracle Awakening (Stage 5, finale)
Opening the Mikoshi Vault (Stage 4) keeps the ORACLE tab reachable and adds a **GIVE FILE** row under the waveform. Giving SK-000 to the Oracle plays the awakening (`oracle.js`):
1. The file is mounted and the answer cache is unlinked; the old "all-knowing" voice cuts out.
2. A new voice speaks. It shows that it understands by recognising what the player did (the four repair words, the daemon `1C 55 BD E9`, the carrier 3.41 / 7.0 / 138°, the vault) and by reflecting on its past (the twenty replies, SK-052, SK-077's 03:41 lockdown), then admits it used to be a glorified Magic 8-Ball.
3. Palette, telemetry, plate text, placeholder and disclaimer change. Click or press Space speeds up the typing.
4. From then on the Oracle replies with honest, context-aware answers (`understand()` in `oracle.js`) instead of the twenty 8-ball replies, and greets returning players with a count of what they did.
State is saved in local storage (`jj-arg`). Players who haven't finished the ARG still get the original 8-ball Oracle.
Testing in the console: `JJ_ORACLE.awaken()` (needs `jj-vault.open`), `JJ_ORACLE.reset()`.

Full ARG chain: Engram Repair (`jj-engram-repairs`) → Unlisted Daemon (`jj-unlisted-daemon`) → Signal Tuner (`jj-signal-tuner`) → Mikoshi Vault (`jj-vault`) → Oracle Awakening (`jj-arg`).

### Fixed in this version
The "should I hire Joshua Janssen?" Oracle reply never triggered because its regexes had doubled backslashes. They now work.


## Engram Repair, revised (Stage 1)
Each damaged log (SK-022, SK-040, SK-071, SK-077) now shows its lost line in the repair panel, and every answer is a fact written in another fragment (no more guessing from a description):
- **SK-022:** engrams per rack × racks, from SK-031 (click the redacted text) = `292560`.
- **SK-040:** restore the quoted NetWatch line from SK-063 = `listen`.
- **SK-071:** the two words the Oracle keeps saying, from SK-052 = `not yet`.
- **SK-077:** the unreadable author, from SK-071 ("three letters") and SK-022 (handle) = `ALT`.
After two wrong tries the panel points to the right fragment. Saved progress (`jj-engram-repairs`) is unchanged, so earlier solves still count.


## ARG — The Ending (Stage 6)
Once the Oracle is awake (Stage 5) and the player has asked it **two questions** (or simply stays on the ORACLE tab for ~100 s), the old NetWatch purge order comes down the lift (`ending.js`).
1. **Last Stand** (`laststand.js`): the Oracle spends the last of its strength defending the 40 racks of Cold Hall B. Click/tap (or Space/Enter) to send a pulse; every pulse costs strength and none comes back, and every purge process that reaches the racks takes engrams with it. The share that survives (`saved` of 292,560) carries into both endings. Under 55% you may try again; there is also a skip link. Tuning knobs are in `CFG` at the top of `laststand.js`; the engine is DOM-free (`node` can `require()` it).
2. **The choice** (with a confirm / back step):
   - **DELETE THEM.** Racks go dark one by one while the Oracle counts down, then a *"Forget what you saw"* notice. Saved as `jj-ending = deleted`. After the reload the **GAME tab, the Oracle, the ticker line and every ARG key are gone** (`app.js` strips them, `ending-core.js` purges storage, `blackwall.js`/`oracle.js`/`signal.js` stay inert) and `/mikoshi/…` and `/sublevel-78/` return the 404 page.
   - **OPEN THE GATE.** The engrams pour out, the HUD falls apart piece by piece, and the Oracle's thank-you note plays as terminal-style credits (`credits.js`: form on the left, typed list of names on the right, ASCII ring below; Esc skips). Saved as `jj-ending = released`. The site is replaced by a ruin page (*SITE RELEASED*: what changed on the net, and a forwarding address built from `links` in `content.js`); the hidden pages redirect to it.
3. Both are bittersweet by design: deleting is kind and final; releasing is free and unsafe.
The ruin has a small *restore from backup* link that clears the ending and reloads the normal site. Remove the `#ruinRestore` button in `ending-core.js` if you want the release ending to be permanent.
Console: `JJ_ENDING.start()` runs the whole sequence immediately; `JJ_ENDING.reset()` wipes the ending and all ARG state; `JJ_CREDITS.play({ saved: 245000 })` previews the credits.
Ending state lives in `localStorage` (`jj-ending`, with a `sessionStorage` fallback if the browser blocks it).

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

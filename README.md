# Joshua Janssen — personal site

Cyberpunk × JoJo personal website. Plain HTML/CSS/JS, no build step.

## Edit your content
Everything personal is in **`content.js`**: headline, about text, Stand stats (radar chart),
skills, papers and the soundtrack. 

Easter egg: press **Z** (or the ZA WARUDO button) to stop time for 5 seconds.

## Music
The player never links to Spotify. Each track plays its own generated synthwave loop.
If you want a track to play a real audio file you're allowed to share, put it in `music/`
and add `src: "music/file.mp3"` to that track in `content.js`.

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

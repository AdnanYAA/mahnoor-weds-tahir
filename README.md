# Mahnoor & Tahir ? Baraat invitation

All files live together in the Invitation folder. No subfolders, dependencies or build step are required.

## Files

```text
Invitation/
  index.html
  style.css
  script.js
  README.md
  R.D. Burman - Hai Mubarak Aaj Ka Din Best Audio Song_Mithun Chakraborty_Hariharan.mp3
```

## Customize

Edit CONFIG at the top of script.js. The Baraat is 29 November 2026 at 11:00 AM Pakistan time, configured as 2026-11-29T11:00:00+05:00. The countdown and calendar share this timestamp. Keep the visible time in sync if editing. Calendar duration defaults to three hours.

The song sits beside index.html. CONFIG.songPath must match its exact filename, including capitalization. It starts at 21 seconds and fades to 0.5 volume. Music loads only after opening the invitation. The mute preference is remembered. Typing, Enter, click and door sounds are synthesized. Guest names are inserted as plain text and never sent to a server.

## Run locally

From the Invitation folder:

```powershell
python -m http.server 8000
```

Keep the terminal running and open http://localhost:8000. In a second PowerShell tab, you can run:

```powershell
Start-Process "http://localhost:8000"
```

Refresh an existing server tab with Ctrl+F5 after changes. Stop the server with Ctrl+C.

## Deploy free on Vercel

1. Upload all five files directly to the root of your GitHub repository. The MP3 must sit beside index.html; remove the old assets folder from the repository if present.
2. Import the repository in Vercel and set the project name to mahnoor-weds-tahir.
3. Select Other as the application preset, root directory ./, no build/install commands and output directory . if requested.
4. Deploy. The intended URL is https://mahnoor-weds-tahir.vercel.app, subject to availability.
5. With Git connected, commit these changes to trigger a deployment. If using Vercel Drop, upload the updated folder to your existing project. Local edits alone do not update Vercel.
6. Verify the live invitation and song on a phone before sharing.

## Performance and verification

Phones use a lightweight scene without canvas fireworks or continuous background movement. Backdrop blur is removed. Desktop fireworks run briefly on opening; animation and music pause in background tabs. Reduced-motion preferences disable heavy effects. The source audio is approximately 8.9 MB and has not been recompressed.

JavaScript syntax, song path, deferred loading and start-position logic have been checked. Actual device playback and layout at 360px, 768px and 1440px still need browser verification. Check keyboard focus, empty-name validation, long names, mute persistence, directions and calendar download too. Mobile playback can depend on device volume and browser policy.

# Bodo Calendar V10 — Fixed Package

This package fixes the current repository integration without removing the existing calendar data files.

## Fixed
- Bagurumba image path is `assets/1735633-bagrumba.jpg`
- Aronai image path is `assets/bodo-aronai.jpg`
- Bodo-first visual hierarchy
- Aronai green/red/gold/black/cream visual system
- Live feed with Supabase + local fallback
- Per-device dismiss
- Admin login + CRUD UI
- Admin research button
- PWA manifest + service worker + icon
- Correct Supabase Edge Function location
- Future app can reuse the same `live_messages` backend

## Keep these existing files from your repository
Do not delete:
- `js/app.js`
- `js/calendar-data.js`
- `js/events.js`
- `js/notes.js`
- `js/vip.js`
- `css/style.css`

The package contains replacement files for the paths shown here.

## Important
The GitHub connector in this chat is currently refusing repository write operations with HTTP 403 even though repository access can be read. Therefore this ZIP is the ready-to-upload fix; I have not claimed a GitHub commit was made.

## Supabase
Your browser config uses only the public publishable key. Never put a service-role key into frontend files.

For automatic research, deploy:
`supabase/functions/live-research/index.ts`

Then configure a server-side scheduler to invoke the Edge Function. The Admin page's **Run Research** button can invoke it manually after deployment.

## GitHub Pages
After uploading/replacing the files, commit them to `main`. GitHub Pages serves the static files from the configured publishing source.
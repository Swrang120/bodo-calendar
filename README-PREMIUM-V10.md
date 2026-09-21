# Bodo Calendar — Premium v10 Replacement Package

This package is a visual + functional replacement for the current Bodo Calendar front-end.

## Replace
- index.html
- css/style.css
- js/app.js
- js/live-system.js
- js/backend-config.js
- sw.js
- assets/1735633-bagrumba.jpg
- assets/bodo-aronai.jpg

## Keep from your existing repository
- js/calendar-data.js
- js/events.js
- js/notes.js
- js/vip.js
- your existing calendar data/event/history files

## Visual changes
- Full Bagurumba hero image
- Aronai textile hero strip
- Premium green/red/gold/black palette
- Large Bodo date hierarchy
- Premium cultural feature cards
- Glass/gradient cards
- Better mobile layout
- PWA service-worker registration
- Live Supabase feed integration

## Supabase
The public Supabase URL + public publishable key are already configured in js/backend-config.js.
Never put a service_role key in browser JavaScript.

The database schema must already exist. Admin authentication/RLS and the server-side live-research Edge Function remain required for global admin publishing and scheduled research.

## GitHub Pages
GitHub Pages can serve the front-end/PWA, but it cannot safely perform server-side scheduled research or protected admin database writes by itself. The Supabase backend handles those parts.


## v10.1 FINAL replacement

This package is prepared for the current GitHub repository layout. The Bagurumba image is available at `1735633-bagrumba.jpg` and the Aronai image at `bodo-aronai.jpg` in the repository root. The same images are also kept under `assets/` for compatibility.

### Replace
Upload/replace the package files and folders in the repository root. Make sure these files are included: `index.html`, `css/`, `js/`, `data/`, `admin.html`, `manifest.json`, `sw.js`, `1735633-bagrumba.jpg`, `bodo-aronai.jpg`, and `icon-192.png`, `icon-512.png`, `favicon.png`.

### Important
1. Keep `js/backend-config.js` with the public Supabase URL/key only.
2. Never put a Supabase service-role/secret key in browser files.
3. After GitHub commit, open the site in a private/incognito tab or clear the old service-worker cache once so the new v10.1 assets load.
4. The Admin/System page is `admin.html`; global live-message CRUD requires the Supabase RLS/admin setup from `supabase/schema.sql`.

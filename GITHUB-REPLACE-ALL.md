# Bodo Calendar — Complete Replacement v11

## Important
Do not upload only `index.html` and `admin.html`.
Upload/replace the **entire package structure** so the HTML, CSS, JS, images, PWA files and live system stay compatible.

### Required root files
- `index.html`
- `admin.html`
- `manifest.json`
- `sw.js`
- `1735633-bagrumba.jpg`
- `bodo-aronai.jpg`

### Required folders
- `css/style.css`
- `js/app.js`
- `js/calendar-data.js`
- `js/events.js`
- `js/notes.js`
- `js/vip.js`
- `js/live-system.js`
- `js/backend-config.js`
- `js/admin.js`
- `data/live-updates.json`
- `assets/*`
- `supabase/*`

### What this version fixes
- Premium Bagurumba hero image
- Premium Aronai textile strip and culture cards
- Correct image paths for GitHub Pages
- Bodo date is visually primary; Gregorian date is secondary
- Premium Aronai-inspired green/red/gold/black/cream UI
- Responsive mobile layout
- Shared Supabase live updates
- Per-device dismiss for live messages
- Admin message management
- PWA/service-worker setup
- App install button support

### Supabase
`js/backend-config.js` contains only the public Supabase URL and public publishable/anon key. Never place a service-role key in browser code.

The database schema is in `supabase/schema.sql`.

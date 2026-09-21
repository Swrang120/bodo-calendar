# Bodo Calendar v9 — Complete Fix

## Fixed
- Hero image is `assets/1735633-bagrumba.jpg`.
- Aronai textile is `assets/bodo-aronai.jpg`.
- Bodo date is visually primary; Gregorian date is smaller.
- Aronai colour system: green, red, gold, black and cream.
- Live news-style system with automatic refresh.
- User dismiss hides a message only on that device.
- Admin can publish, edit, hide and globally delete messages.
- Same Supabase feed can be consumed by the website and future app.
- PWA install button + service worker + PNG icons.
- Automatic research Edge Function is included; scheduling is a server-side step.

## Deploy
1. Copy the files into the repository preserving the folder structure.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Put the Supabase project URL and **public anon key only** in `js/backend-config.js`.
4. Create an Auth user for the administrator. Mark that user as an admin in a trusted Supabase/admin environment using `app_metadata.is_admin=true`. Never put a service-role key in browser code.
5. Deploy `supabase/functions/live-research/index.ts` as the `live-research` Edge Function. Configure its server-side secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`).
6. Configure a server-side scheduler (Supabase Cron/pg_cron or another trusted scheduler) to invoke the research function periodically. The included function also requires an admin JWT when invoked manually from the admin page.
7. Open `admin.html` to publish messages.

## Important
GitHub Pages alone cannot securely provide global admin writes or scheduled server-side research. The frontend therefore has a local JSON fallback, while Supabase provides the shared production feed.

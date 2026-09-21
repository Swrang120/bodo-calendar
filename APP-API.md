# Future App Feed

Use the same `public.live_messages` table. Public clients should read only rows where `active=true`, ordered by `created_at desc`.

Admin create/update/delete stays protected by Supabase Auth + RLS. The app should never receive or store the service-role key.

# Yahalloe's 3×3

## Jikan anime data

Public anime cards and detail pages load cover images and full synopses from [Jikan v4](https://docs.api.jikan.moe/), with no API key required. Existing local or Supabase content is shown while loading and remains the fallback if Jikan is unavailable or an image fails to load. Editor notes and CMS content are preserved.

Requests are shared between cards and detail pages, paced at one every 1.1 seconds, and successful responses are cached in the browser for 24 hours. Rate limits and server errors receive bounded retries. Only rendered entries request data; placeholders are skipped. Existing archive slugs map to MyAnimeList IDs in `src/lib/jikan.ts`; new CMS titles use exact title/alias matches. Add a slug-to-ID mapping there for ambiguous titles or specific seasons.

## Supabase content editor

The public site reads its content from Supabase when configured. Until then, it uses the existing local catalog as a fallback, so local development does not break.

1. Create a Supabase project.
2. Run [202609080001_content_cms.sql](supabase/migrations/202609080001_content_cms.sql) in its SQL Editor.
3. Copy `.env.example` to `.env.local`, then add the Project URL and publishable key from Supabase's Connect panel.
4. In Supabase Auth, create your administrator user. Then grant it access in the SQL Editor:

   ```sql
   insert into public.content_admins (user_id)
   select id from auth.users where email = 'your-email@example.com';
   ```

5. Restart the dev server and open `/admin`. The editor lets the admin update site copy and create, edit, publish, or delete anime entries. Image fields accept public URLs; the migration also provisions a public `anime-images` Storage bucket for future upload tooling.

Public visitors can read published content only. The browser never receives a service-role key; Supabase Auth plus RLS permit edits only for users listed in `content_admins`.

 vercel test

In `/admin`, click **New anime**, search a title under **Find anime with Jikan**, and select a series from the dropdown. Its title, cover URLs, synopsis, and a stable `mal-ID` slug fill automatically. Choose a collection, review the fields, and click **Save anime**. Searching and selecting only update the draft; missing API fields remain editable. Imported slugs keep public lookups tied to the selected season.

Editor search falls back to Kitsu when Jikan returns a server, network, or rate-limit error. The dropdown identifies fallback results. Kitsu-to-MyAnimeList mappings preserve the selected anime identity; unmapped entries use a `kitsu-ID` slug and keep their imported cover and synopsis. Search results fill only the draft until Save anime is clicked.

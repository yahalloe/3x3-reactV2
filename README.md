# Yahalloe's 3×3

## Editor navigation

The editor has Anime, Collections, Comments, Site copy, and Account tabs. Anime search shows cover-image suggestions while typing, with a Kitsu fallback when Jikan is unavailable. The image library filters existing shows without scrolling through the full editor.

Choose anime and collection positions with the 3×3 picker. Occupied positions are disabled; an anime can keep its own position. Anime saves recheck current database occupancy before writing. Empty positions remain visible on the desktop public grid, and older duplicate/out-of-range entries remain visible until repositioned.

Comments edits the existing per-show `editor_note`: one personal comment per show, with a composer, preview, and Ctrl/Cmd+Enter saving. Comments display on public anime pages, and metadata saves preserve them. No new database migration is required. Save notifications show progress, success, and errors.

Account lets the signed-in editor change their own password by verifying the current password and confirming a new password. Supabase's configured password rules still apply. Passwords are not stored in the app's content tables.

## Jikan anime data

Public cards load the saved API image URL directly from Supabase. They do not call Jikan or Kitsu, compare image dimensions, or preload competing candidates. The browser loads one cover at a time, prioritizes the first card, and lazy-loads lower rows. A fixed-size placeholder lasts only until that image loads, with sequential fallback on image errors. Detail artwork also loads directly; its optional Jikan synopsis lookup never blocks the image.

### Artwork selection and framing

Apply `supabase/migrations/202609100002_artwork_selection.sql` before deploying this editor version. It adds `artwork_locked`, `focal_x`, and `focal_y` without replacing existing content or changing RLS.

In `/admin`, select an anime, then **Browse API artwork** under **Artwork & framing**. The picker combines Jikan's `/anime/{id}/pictures` gallery with Kitsu's original posters and banners. Kitsu results must match the anime's MAL ID or explicit Kitsu ID; title similarity alone is not enough. A failed provider does not discard successful results from the other provider.

Choose an image, inspect the square card and full detail previews, and use the horizontal/vertical buttons or click the crop to change positioning. **Save anime** persists the image URLs, lock, and 0–100 crop positions in Supabase. Public pages always respect the saved selection; the lock also protects it from catalog artwork refresh scripts. Dimensions are informational, not an aesthetic quality rating.

`scripts/prepare-api-artwork.mjs` is a read-only maintenance tool that matches existing local artwork by MAL ID to Kitsu originals and prints conditional SQL for review. It never writes to Supabase. The reviewed `202609110001_api_posters.sql` migration upgrades the initial uncurated catalog. AniList's live API reported temporary suspension during verification on September 11, 2026, so it is not a runtime dependency.

The picker uses keyless APIs. [Fanart.tv](https://fanart.tv/api-docs/api-v3/) offers dedicated artwork and textless variants, but requires API credentials and external title IDs; it is not enabled. Do not put secret provider credentials in `VITE_*` environment variables. An eventual integration should keep those credentials in a server-side proxy.

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

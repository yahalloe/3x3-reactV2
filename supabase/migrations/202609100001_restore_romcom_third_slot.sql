-- Run once in the Supabase SQL Editor. Safe to rerun.
-- Restore the original third Romcom pick without resetting the edited catalog.
begin;

do $$
declare
  romcom_id uuid;
  existing_anime public.anime%rowtype;
begin
  -- Prevent a concurrent editor save from taking the slot during this repair.
  lock table public.anime in share row exclusive mode;
  select id into romcom_id from public.collections where slug = 'romcom';
  if romcom_id is null then
    raise exception 'Romcom collection is missing; no changes made.';
  end if;

  select * into existing_anime from public.anime where slug = 'the-dangers-in-my-heart';
  if existing_anime.id is not null and existing_anime.collection_id <> romcom_id then
    raise exception 'The Dangers in My Heart is in another collection; review its placement before restoring.';
  end if;

  if exists (
    select 1 from public.anime
    where collection_id = romcom_id and sort_order = 2
      and slug <> 'the-dangers-in-my-heart'
  ) then
    raise exception 'Romcom slot 3 is occupied; no titles were overwritten.';
  end if;

  if existing_anime.id is not null then
    -- Keep any edited images, synopsis, comments, and streaming links.
    update public.anime set sort_order = 2, is_published = true
    where id = existing_anime.id;
  else
    insert into public.anime (
      collection_id, slug, title, card_image_url, detail_image_url,
      synopsis, streaming_providers, sort_order, is_published
    ) values (
      romcom_id, 'the-dangers-in-my-heart', 'The Dangers in My Heart',
      '/anime/boku-no-kokoro-no-yabai-6.jpg', '/anime/boku-no-kokoro-no-yabai-6.jpg',
      'A high school student with a dark secret navigates the challenges of adolescence and romance.',
      array['netflix']::text[], 2, true
    );
  end if;
end $$;

commit;

-- Verify the restored entry is published in the third slot (zero-based order 2).
select a.slug, a.title, a.sort_order, a.is_published
from public.anime a join public.collections c on c.id = a.collection_id
where c.slug = 'romcom' and a.sort_order = 2;

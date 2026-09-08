-- Run this migration in the Supabase SQL editor or with the Supabase CLI.
-- After creating your first Auth user, follow the README to grant that user admin access.

create extension if not exists pgcrypto;

create table public.content_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_content_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.content_admins where user_id = (select auth.uid())
  );
$$;

create table public.site_settings (
  id boolean primary key default true check (id),
  home_title text not null,
  archive_label text not null,
  about_title text not null,
  about_body text not null,
  footer_text text not null,
  updated_at timestamptz not null default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  eyebrow text not null default 'Genre collection',
  description text not null default '',
  cover_image_url text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.anime (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  card_image_url text not null,
  detail_image_url text not null,
  synopsis text not null default '',
  editor_note text not null default '',
  streaming_providers text[] not null default '{}'
    check (streaming_providers <@ array['netflix', 'crunchyroll']::text[]),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index anime_collection_sort_index on public.anime(collection_id, sort_order);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();
create trigger set_collections_updated_at before update on public.collections
  for each row execute function public.set_updated_at();
create trigger set_anime_updated_at before update on public.anime
  for each row execute function public.set_updated_at();

alter table public.content_admins enable row level security;
alter table public.site_settings enable row level security;
alter table public.collections enable row level security;
alter table public.anime enable row level security;

revoke all on public.content_admins, public.site_settings, public.collections, public.anime from anon, authenticated;
grant select on public.site_settings, public.collections, public.anime to anon, authenticated;
grant insert, update, delete on public.site_settings, public.collections, public.anime to authenticated;

create policy "Admins can see their own grant" on public.content_admins
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Public can read published settings" on public.site_settings
  for select to anon, authenticated using (true);
create policy "Public can read published collections" on public.collections
  for select to anon, authenticated using (is_published or public.is_content_admin());
create policy "Public can read published anime" on public.anime
  for select to anon, authenticated using (is_published or public.is_content_admin());
create policy "Admins can manage settings" on public.site_settings
  for all to authenticated using (public.is_content_admin()) with check (public.is_content_admin());
create policy "Admins can manage collections" on public.collections
  for all to authenticated using (public.is_content_admin()) with check (public.is_content_admin());
create policy "Admins can manage anime" on public.anime
  for all to authenticated using (public.is_content_admin()) with check (public.is_content_admin());

insert into storage.buckets (id, name, public)
values ('anime-images', 'anime-images', true)
on conflict (id) do update set public = true;

create policy "Public can view anime images" on storage.objects
  for select to public using (bucket_id = 'anime-images');
create policy "Admins can upload anime images" on storage.objects
  for insert to authenticated with check (bucket_id = 'anime-images' and public.is_content_admin());
create policy "Admins can update anime images" on storage.objects
  for update to authenticated using (bucket_id = 'anime-images' and public.is_content_admin()) with check (bucket_id = 'anime-images' and public.is_content_admin());
create policy "Admins can delete anime images" on storage.objects
  for delete to authenticated using (bucket_id = 'anime-images' and public.is_content_admin());

insert into public.site_settings (id, home_title, archive_label, about_title, about_body, footer_text)
values (
  true,
  'YAHALLO''S 3X3',
  'A personal anime archive · est. 2023',
  'About me',
  'Hello, I am Yahallo. I am a huge anime fan and I have been watching anime for around 5 years now. I have watched over 400 or so anime series and movies. I created this site to share my top nine favorite anime series of all time. I hope you enjoy my selections and find some new favorites to watch!',
  '© 2023–2026 · Made for the stories worth revisiting.'
) on conflict (id) do nothing;

insert into public.collections (slug, title, eyebrow, description, cover_image_url, sort_order) values
  ('favorites', 'All-time favorites', 'The essential nine', 'Nine shows I keep returning to—for their stories, their worlds, and the feelings they leave behind.', '/anime/hyouka.jpg', 0),
  ('romcom', 'The romcom shelf', 'Genre collection', 'Peak shows from a peak watching era—funny, tender, and worth another episode.', '/anime/oregairu.jpg', 1),
  ('drama', 'The drama shelf', 'Genre collection', 'Stories with the emotional range to stay with you long after the credits roll.', '/anime/kayo.jpg', 2),
  ('music', 'The music shelf', 'Genre collection', 'Shows where the soundtrack, performance, and feeling are all part of the story.', '/anime/rere.jpg', 3)
on conflict (slug) do nothing;

insert into public.anime (collection_id, slug, title, card_image_url, detail_image_url, synopsis, editor_note, streaming_providers, sort_order)
select c.id, v.slug, v.title, v.card_image_url, v.detail_image_url, v.synopsis, v.editor_note, v.streaming_providers, v.sort_order
from public.collections c
join (values
  ('favorites','hyouka','Hyouka','/anime/hyouka.jpg','/anime/hyouka.jpg','A slice-of-life mystery series following Oreki and Chitanda as they solve everyday enigmas in their high school.','We can say that Hyouka is a masterpiece. Not only the animation is impeccable for its time, the mysteries it presents, foreshadowing and the characters are top notch.',array[]::text[],0),
  ('favorites','edgerunner','Cyberpunk: Edgerunners','/anime/edgerunner.gif','/anime/edgerunner.gif','In the neon-lit streets of Night City, a young man tries to survive as a mercenary known as an edgerunner.','It''s the best show of 2022. Hands down.',array['netflix'],1),
  ('favorites','frieren','Frieren: Beyond Journey''s End','/anime/frierenTrio.jpg','/anime/fern.png','An elf mage reflects on the meaning of life and time as she journeys after her hero’s party has disbanded.','Ah yes, the pout queen herself. Her relationship with Stark is just chef''s kiss.',array['netflix','crunchyroll'],2),
  ('favorites','monogatari','Monogatari Series','/anime/monogatari.jpg','/anime/monogatari.jpg','A supernatural dialogue-driven story exploring relationships, trauma, and identity through surreal encounters.','',array[]::text[],3),
  ('favorites','suzumiya','The Melancholy of Haruhi Suzumiya','/anime/suzumiya.jpg','/anime/suzumiya.jpg','A high school student unknowingly befriends a godlike girl who can alter reality, leading to endless strange events.','',array[]::text[],4),
  ('favorites','made-in-abyss','Made in Abyss','/anime/madeInAbyss1.jpg','/anime/made in abyss.jpg','A young girl descends into the mysterious Abyss in search of her mother, uncovering both beauty and horror.','',array['netflix'],5),
  ('favorites','hunter-x-hunter','Hunter x Hunter','/anime/hunterhunter.avif','/anime/hunterhunter.avif','A boy embarks on a dangerous journey to become a Hunter and find his missing father.','',array[]::text[],6),
  ('favorites','bunny-girl-senpai','Rascal Does Not Dream of Bunny Girl Senpai','/anime/bunnyGirl.jpg','/anime/bunnyGirl.jpg','A high schooler encounters strange adolescent syndrome phenomena tied to emotional struggles.','',array[]::text[],7),
  ('favorites','86-eighty-six','86: Eighty-Six','/anime/86-eighty-six-lena-shin-4k--78.0_d.jpg','/anime/86-eighty-six-lena-shin-4k--78.0_d.jpg','A sci-fi war drama exploring discrimination and loss through the eyes of unmanned drone pilots.','',array['netflix'],8),
  ('romcom','oregairu','My Teen Romantic Comedy SNAFU','/anime/oregairu.jpg','/anime/oregairu.jpg','A high school student navigates the complexities of friendship and romance while forming a service club.','',array[]::text[],0),
  ('romcom','chuunibyou','Chuunibyou Demo Koi ga Shitai!','/anime/chuunibyou.jpeg','/anime/chuunibyou.jpeg','A high school student with a vivid imagination struggles to cope with reality while navigating love and friendship.','',array[]::text[],1),
  ('romcom','the-dangers-in-my-heart','The Dangers in My Heart','/anime/boku-no-kokoro-no-yabai-6.jpg','/anime/boku-no-kokoro-no-yabai-6.jpg','A high school student with a dark secret navigates the challenges of adolescence and romance.','',array['netflix'],2),
  ('romcom','saekano','Saekano: How to Raise a Boring Girlfriend','/anime/saekano7.jpg','/anime/saekano7.jpg','A high school student forms a doujin circle to create a visual novel, leading to unexpected romantic entanglements.','',array[]::text[],3),
  ('romcom','tamako-love-story','Tamako Love Story','/anime/tamako.jpg','/anime/tamako.jpg','A heartwarming story about a girl and her childhood friend navigating love and friendship.','',array[]::text[],4),
  ('romcom','nisekoi','Nisekoi','/anime/nisekoi.webp','/anime/nisekoi.webp','A romantic comedy about a high school student who becomes entangled in a love triangle with two girls.','',array[]::text[],5),
  ('romcom','kaguya-sama','Kaguya-sama: Love Is War','/anime/kaguya-sama-love-is-war-shinomiya-cat-ears.jpg','/anime/kaguya-sama-love-is-war-shinomiya-cat-ears.jpg','Two high school geniuses engage in a battle of wits to make the other confess their love first.','',array[]::text[],6),
  ('romcom','golden-time','Golden Time','/anime/golden time.jpg','/anime/golden time.jpg','A college student with amnesia navigates new relationships and personal growth in Tokyo.','',array[]::text[],7),
  ('romcom','makeine','Makeine: Too Many Losing Heroines','/anime/makeine.webp','/anime/makeine.webp','A high school student finds himself surrounded by multiple losing heroines, each with their own unique struggles and stories.','',array[]::text[],8),
  ('drama','erased','Erased','/anime/kayo.jpg','/anime/kayo.jpg','A struggling manga artist is sent back in time to his childhood, where he has one chance to prevent a series of tragedies.','A tense, heartfelt mystery that knows exactly when to slow down and let its characters breathe.',array[]::text[],0),
  ('drama','the-apothecary-diaries','The Apothecary Diaries','/anime/maomao.jpg','/anime/maomao.jpg','An observant apothecary finds herself drawn into palace intrigues, medical mysteries, and the politics of an imperial court.','Maomao''s curiosity and sharp wit make every case a pleasure to follow.',array['netflix'],1),
  ('drama','sakurasou','Sakura Sou no Pet na Kanojo','/anime/sakura-sou.webp','/anime/sakura-sou.webp','A kind-hearted student moves into a dorm full of brilliant misfits and learns what ambition, friendship, and growing up really cost.','Warm, chaotic, and unexpectedly sincere—the kind of coming-of-age show that is easy to revisit.',array[]::text[],2),
  ('music','re-creators','Re:Creators','/anime/rere.jpg','/anime/rere.jpg','Fictional characters arrive in the real world and force their creators to confront the consequences of the stories they made.','An inventive celebration of anime, its genres, and the people who create it.',array[]::text[],0),
  ('music','dunno','Dunno','/anime/question.webp','/anime/question.webp','A small placeholder for future music-focused picks in the collection.','',array[]::text[],1)
) as v(collection_slug, slug, title, card_image_url, detail_image_url, synopsis, editor_note, streaming_providers, sort_order)
on c.slug = v.collection_slug
on conflict (slug) do nothing;

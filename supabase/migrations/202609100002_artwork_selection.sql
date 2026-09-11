-- Preserve existing selections; curation is opt-in for existing anime.
alter table public.anime
  add column if not exists artwork_locked boolean not null default false,
  add column if not exists focal_x integer not null default 50 check (focal_x between 0 and 100),
  add column if not exists focal_y integer not null default 50 check (focal_y between 0 and 100);

-- Verified by MAL-ID mappings and successful image responses from Kitsu.
-- Only replace uncurated local card artwork; never overwrite a chosen API image.
with posters(slug, path) as (values
  ('bunny-girl-senpai', 'poster_images/41056/original.jpg'),
  ('hunter-x-hunter', 'poster_images/6448/original.png'),
  ('made-in-abyss', 'poster_images/13273/original.jpg'),
  ('suzumiya', 'poster_images/751/original.jpg'),
  ('frieren', '46474/poster_image/99d7df09d8cb9360b1e02825372ce612.jpg'),
  ('edgerunner', '43248/poster_image/15bde2e7e34cfe1df761535a69faffb8.png'),
  ('hyouka', 'poster_images/6686/original.jpg'),
  ('makeine', '48312/poster_image/5396666df6c647e6bf250611d9532037.jpg'),
  ('golden-time', 'poster_images/7708/original.jpg'),
  ('kaguya-sama', 'poster_images/41373/original.jpg'),
  ('nisekoi', 'poster_images/7821/original.jpg'),
  ('tamako-love-story', 'poster_images/8135/original.png'),
  ('saekano', 'poster_images/8406/original.jpg'),
  ('chuunibyou', 'poster_images/7160/original.jpg'),
  ('oregairu', 'poster_images/7169/original.jpg'),
  ('sakurasou', 'poster_images/7023/original.jpg'),
  ('the-apothecary-diaries', '47083/poster_image/1e25d26e74707ada861514620f630da8.jpg'),
  ('erased', 'poster_images/11110/original.png'),
  ('re-creators', 'poster_images/13055/original.jpg'),
  ('86-eighty-six', 'poster_images/43066/original.jpg'),
  ('the-dangers-in-my-heart', '46299/poster_image/9f28279bf2d588e7be468cb835f70af6.jpg')
)
update public.anime a set
  card_image_url = 'https://media.kitsu.app/anime/' || p.path,
  detail_image_url = case when a.detail_image_url like '/anime/%' then 'https://media.kitsu.app/anime/' || p.path else a.detail_image_url end
from posters p where a.slug = p.slug and not a.artwork_locked and a.card_image_url like '/anime/%'
returning a.slug, a.card_image_url;

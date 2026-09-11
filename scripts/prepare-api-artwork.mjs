// Read-only: prints reviewed, conditional SQL; never writes to the database.
// Run with Node 24 from the project directory after configuring .env.local.
import { readFileSync } from 'node:fs';
import { knownMalId } from '../src/lib/jikan.ts';
import { searchKitsuAnime } from '../src/lib/kitsu.ts';
const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((line) => /^[A-Z_]+=/.test(line)).map((line) => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const response = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/anime?select=slug,title,card_image_url,detail_image_url,artwork_locked`, { headers: { apikey: env.VITE_SUPABASE_PUBLISHABLE_KEY } });
if (!response.ok) throw new Error(`Catalog read failed: ${response.status}`);
const rows = await response.json();
const quote = (value) => `'${value.replaceAll("'", "''")}'`;
console.log('-- Upgrade uncurated local artwork to verified Kitsu original posters.\nbegin;');
for (const row of rows) {
  if (row.artwork_locked || !row.card_image_url.startsWith('/anime/')) continue;
  const malId = knownMalId(row.slug);
  if (!malId) continue;
  try {
    const matches = await searchKitsuAnime(row.title, AbortSignal.timeout(12000));
    const match = matches.find((entry) => entry.malId === malId);
    if (!match?.imageUrl || !match.imageUrl.startsWith('https://media.kitsu.app/')) continue;
    const image = await fetch(match.imageUrl, { method: 'HEAD', signal: AbortSignal.timeout(10000) });
    if (!image.ok || !image.headers.get('content-type')?.startsWith('image/')) continue;
    console.log(`update public.anime set card_image_url = ${quote(match.imageUrl)}, detail_image_url = ${quote(match.imageUrl)} where slug = ${quote(row.slug)} and not artwork_locked and card_image_url = ${quote(row.card_image_url)} and detail_image_url = ${quote(row.detail_image_url)};`);
  } catch { console.error(`Skipped unavailable artwork: ${row.slug}`); }
}
console.log('commit;');

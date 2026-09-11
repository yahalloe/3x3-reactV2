import { getJikanAnime, getJikanPictures, knownMalId } from "./jikan.ts";
import { searchKitsuAnime } from "./kitsu.ts";

export interface ArtworkChoice { url: string; label: string }
export async function artworkGallery(slug: string, title: string, signal: AbortSignal) {
  const results = await Promise.allSettled([
    getJikanPictures(slug, title, signal).then((urls) => urls.map((url) => ({ url, label: "MyAnimeList · poster" }))),
    (async () => {
      const [malId, matches] = await Promise.all([knownMalId(slug) ?? (slug.startsWith("kitsu-") ? undefined : getJikanAnime(slug, title).then((anime) => anime?.malId)), searchKitsuAnime(title, signal)]);
      signal.throwIfAborted();
      // Never silently substitute a similarly titled sequel or remake.
      const match = matches.find((entry) => slug === `kitsu-${entry.kitsuId}` || (malId && entry.malId === malId));
      return match ? [
        { url: match.imageUrl, label: "Kitsu · original poster" },
        { url: match.coverImageUrl, label: "Kitsu · banner" },
      ].filter((item): item is ArtworkChoice => Boolean(item.url)) : [];
    })(),
  ]);
  signal.throwIfAborted();
  const images = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  return { images: [...new Map(images.map((image) => [image.url, image])).values()], partial: results.some((result) => result.status === "rejected") };
}

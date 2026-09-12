import type { Anime, Collection, SiteSettings } from "../content/ContentProvider";
export type ContentSnapshot = { anime: Anime[]; collections: Collection[]; settings: SiteSettings };
export const CONTENT_CACHE_KEY = "archive:published:v1";
export function parseSnapshot(raw: string | null): ContentSnapshot | null {
  try {
    const value = JSON.parse(raw ?? "null");
    if (!value || !Array.isArray(value.anime) || !Array.isArray(value.collections) || !value.settings) return null;
    const strings = (item: Record<string, unknown>, keys: string[]) => item && keys.every((key) => typeof item[key] === "string");
    if (!value.anime.every((item: Anime) => strings(item as unknown as Record<string, unknown>, ["id", "slug", "title", "collectionId", "collectionSlug", "synopsis", "cardImageUrl", "detailImageUrl", "editorNote"]) && item.isPublished === true && Number.isInteger(item.sortOrder) && Array.isArray(item.streamingProviders) && item.streamingProviders.every(provider => provider === "netflix" || provider === "crunchyroll"))) return null;
    if (!value.collections.every((item: Collection) => strings(item as unknown as Record<string, unknown>, ["id", "slug", "title", "description", "eyebrow", "coverImageUrl"]) && item.isPublished === true)) return null;
    if (!strings(value.settings, ["homeTitle", "archiveLabel", "aboutTitle", "aboutBody", "footerText"])) return null;
    return value;
  } catch { return null; }
}
export function readSnapshot() {
  try { return parseSnapshot(localStorage.getItem(CONTENT_CACHE_KEY)); } catch { return null; }
}
export function saveSnapshot(snapshot: ContentSnapshot) {
  const collections = snapshot.collections.filter((item) => item.isPublished);
  const ids = new Set(collections.map((item) => item.id));
  const anime = snapshot.anime.filter((item) => item.isPublished && ids.has(item.collectionId));
  try { localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify({ ...snapshot, collections, anime })); } catch { /* Storage is optional. */ }
}

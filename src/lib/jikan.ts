import { searchKitsuAnime } from "./kitsu.ts";

const API_URL = "https://api.jikan.moe/v4";
const CACHE_TTL = 24 * 60 * 60 * 1000;
const REQUEST_INTERVAL = 1100;

// Pin the archive's entries to the intended series rather than a title-search sequel.
const catalogIds: Record<string, number> = {
  hyouka: 12189, edgerunner: 42310, frieren: 52991, monogatari: 5081,
  suzumiya: 849, madeInAbyss1: 34599, hunter: 11061, bunnyGirl: 37450,
  "86": 41457, oregairu: 14813, chuunibyou: 14741, bokuyaba: 52578,
  saekano: 23277, tamako: 21647, nisekoi: 18897, kaguyasama: 37999,
  goldenTime: 17895, makeine: 57524, erased: 31043, maomao: 54492,
  sakuraSou: 13759, rere: 34561,
  "made-in-abyss": 34599, "hunter-x-hunter": 11061, "bunny-girl-senpai": 37450,
  "86-eighty-six": 41457, "the-dangers-in-my-heart": 52578,
  "tamako-love-story": 21647, "kaguya-sama": 37999, "golden-time": 17895,
  "the-apothecary-diaries": 54492, sakurasou: 13759, "re-creators": 34561,
};

export interface JikanAnime {
  malId: number;
  imageUrl: string | null;
  synopsis: string | null;
}

interface ApiAnime {
  mal_id: number;
  title?: string;
  title_english?: string | null;
  type?: string | null;
  year?: number | null;
  titles?: { title: string }[];
  synopsis?: string | null;
  images?: {
    webp?: { large_image_url?: string; image_url?: string };
    jpg?: { large_image_url?: string; image_url?: string };
  };
}

type CacheEntry = { expires: number; data: JikanAnime | null };
const cache = new Map<string, CacheEntry>();
const pending = new Map<string, Promise<JikanAnime | null>>();
let queue: Promise<unknown> = Promise.resolve();
let nextRequestAt = 0;
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function readCache(key: string): CacheEntry | undefined {
  let entry = cache.get(key);
  if (!entry) {
    try {
      const stored = JSON.parse(localStorage.getItem(`jikan:v1:${key}`) ?? "null");
      if (stored && typeof stored.expires === "number" && stored.data &&
        typeof stored.data.malId === "number" &&
        (stored.data.imageUrl === null || typeof stored.data.imageUrl === "string") &&
        (stored.data.synopsis === null || typeof stored.data.synopsis === "string")) {
        entry = stored as CacheEntry;
      }
    } catch { /* Storage may be blocked or contain old data. */ }
  }
  if (entry && entry.expires > Date.now()) return entry;
  return undefined;
}

async function request(path: string, signal?: AbortSignal, attempts = 3): Promise<unknown> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    // Pace request starts, not entire responses: slow cover requests must not
    // hold the editor hostage through their timeouts and retry loops.
    const slot = queue.then(async () => {
      signal?.throwIfAborted();
      await delay(Math.max(0, nextRequestAt - Date.now()));
      signal?.throwIfAborted();
      nextRequestAt = Date.now() + REQUEST_INTERVAL;
    });
    queue = slot.catch(() => undefined);
    await slot;
    const controller = new AbortController();
    const cancel = () => controller.abort();
    signal?.addEventListener("abort", cancel, { once: true });
    const timeout = setTimeout(cancel, 10000);
    try {
      signal?.throwIfAborted();
      const response = await fetch(`${API_URL}${path}`, { signal: controller.signal });
      if (response.ok) return await response.json();
      if ((response.status === 429 || response.status >= 500) && attempt < attempts - 1) {
        const retryAfter = Number(response.headers.get("Retry-After"));
        const backoff = Math.max(2000 * (attempt + 1), Math.min(retryAfter || 0, 30) * 1000);
        if (response.status === 429) nextRequestAt = Math.max(nextRequestAt, Date.now() + backoff);
        await delay(backoff);
        continue;
      }
      throw new Error(`Jikan request failed (${response.status})`);
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", cancel);
    }
  }
}

const normalizeTitle = (title: string) => title.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export interface JikanSearchResult extends Omit<JikanAnime, "malId"> {
  malId: number | null;
  source?: "kitsu";
  kitsuId?: string;
  title: string;
  type: string | null;
  year: number | null;
}

export function animeImportFields(entry: JikanSearchResult) {
  return {
    slug: entry.malId ? `mal-${entry.malId}` : `kitsu-${entry.kitsuId}`,
    title: entry.title,
    cardImageUrl: entry.imageUrl ?? "",
    detailImageUrl: entry.imageUrl ?? "",
    synopsis: entry.synopsis ?? "",
  };
}

const searchCache = new Map<string, { expires: number; data: JikanSearchResult[] }>();

export async function searchJikanAnime(query: string, signal?: AbortSignal): Promise<JikanSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  signal?.throwIfAborted();
  const key = trimmed.toLowerCase();
  const cached = searchCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.data;
  // Default pagination also reuses Jikan's commonly cached search URLs.
  let response: { data?: ApiAnime[] };
  try {
    // An editor search has a fallback, so don't repeat a failing upstream call.
    response = await request(`/anime?q=${encodeURIComponent(trimmed)}`, signal, 1) as { data?: ApiAnime[] };
  } catch (error) {
    signal?.throwIfAborted();
    if (error instanceof Error && /\(4\d\d\)/.test(error.message) && !error.message.includes("429")) throw error;
    try {
      const data = await searchKitsuAnime(trimmed, signal);
      searchCache.set(key, { expires: Date.now() + 5 * 60 * 1000, data });
      return data;
    } catch {
      signal?.throwIfAborted();
      throw new Error("Both Jikan and the Kitsu fallback are unavailable. Please retry shortly.");
    }
  }
  signal?.throwIfAborted();
  if (!Array.isArray(response.data)) throw new Error("Jikan returned an invalid search response.");
  const seen = new Set<number>();
  const results = response.data.filter((entry) => {
    if (!Number.isInteger(entry.mal_id) || !entry.title || seen.has(entry.mal_id)) return false;
    seen.add(entry.mal_id);
    return true;
  }).map((entry) => ({
    malId: entry.mal_id,
    title: entry.title_english || entry.title!,
    type: entry.type ?? null,
    year: entry.year ?? null,
    imageUrl: entry.images?.webp?.large_image_url || entry.images?.jpg?.large_image_url ||
      entry.images?.webp?.image_url || entry.images?.jpg?.image_url || null,
    synopsis: entry.synopsis?.trim() || null,
  }));
  searchCache.set(key, { expires: Date.now() + 5 * 60 * 1000, data: results });
  return results;
}

export function getJikanAnime(slug: string, title: string): Promise<JikanAnime | null> {
  if (slug === "dunno" || slug.startsWith("kitsu-") || !title.trim()) return Promise.resolve(null);
  const importedId = /^mal-([1-9]\d*)$/.exec(slug);
  const malId = importedId ? Number(importedId[1]) : catalogIds[slug];
  const key = malId ? `anime:${malId}` : `title:${normalizeTitle(title)}`;
  const cached = readCache(key);
  if (cached) return Promise.resolve(cached.data);
  const existing = pending.get(key);
  if (existing) return existing;

  const task = (async () => {
    try {
      let anime: ApiAnime | undefined;
      if (malId) {
        const result = await request(`/anime/${malId}`) as { data?: ApiAnime };
        anime = result.data;
      } else {
        const result = await request(`/anime?q=${encodeURIComponent(title)}`) as { data?: ApiAnime[] };
        // New CMS entries require an exact title/alias match to avoid wrong shows.
        anime = result.data?.find((item) => [item.title, item.title_english, ...(item.titles ?? []).map((alias) => alias.title)]
          .some((alias) => alias && normalizeTitle(alias) === normalizeTitle(title)));
      }
      const data: JikanAnime | null = anime && Number.isInteger(anime.mal_id) ? {
        malId: anime.mal_id,
        imageUrl: anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url ||
          anime.images?.webp?.image_url || anime.images?.jpg?.image_url || null,
        synopsis: anime.synopsis?.trim() || null,
      } : null;
      const entry = { expires: Date.now() + CACHE_TTL, data };
      cache.set(key, entry);
      if (data) {
        try { localStorage.setItem(`jikan:v1:${key}`, JSON.stringify(entry)); }
        catch { /* In-memory caching still works when storage is unavailable. */ }
      }
      return data;
    } catch {
      // Briefly cache failures to avoid flooding an unavailable service on navigation.
      cache.set(key, { expires: Date.now() + 60000, data: null });
      return null;
    } finally {
      pending.delete(key);
    }
  })();
  pending.set(key, task);
  return task;
}

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { animeList, dramaList, musicList, romcomList } from "../components/animeData";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { readSnapshot, saveSnapshot } from "../lib/contentCache";
import { canonicalSlug } from "../lib/publicNavigation";

export type StreamingProvider = "netflix" | "crunchyroll";

export interface Collection {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  coverImageUrl: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface Anime {
  artworkLocked?: boolean;
  focalX?: number;
  focalY?: number;
  id: string;
  collectionId: string;
  collectionSlug: string;
  slug: string;
  title: string;
  cardImageUrl: string;
  detailImageUrl: string;
  synopsis: string;
  editorNote: ReactNode;
  streamingProviders: StreamingProvider[];
  sortOrder: number;
  isPublished: boolean;
}

export interface SiteSettings {
  homeTitle: string;
  archiveLabel: string;
  aboutTitle: string;
  aboutBody: string;
  footerText: string;
}

const fallbackSettings: SiteSettings = {
  homeTitle: "YAHALLO'S 3X3",
  archiveLabel: "A personal anime archive · est. 2023",
  aboutTitle: "About me",
  aboutBody: "Hello, I am Yahallo. I am a huge anime fan and I have been watching anime for around 5 years now. I have watched over 400 or so anime series and movies. I created this site to share my top nine favorite anime series of all time. I hope you enjoy my selections and find some new favorites to watch!",
  footerText: "© 2023–2026 · Made for the stories worth revisiting.",
};

const fallbackCollections: Collection[] = [
  { id: "favorites", slug: "favorites", title: "All-time favorites", eyebrow: "The essential nine", description: "Nine shows I keep returning to—for their stories, their worlds, and the feelings they leave behind.", coverImageUrl: "/anime/hyouka.jpg", sortOrder: 0, isPublished: true },
  { id: "romcom", slug: "romcom", title: "The romcom shelf", eyebrow: "Genre collection", description: "Peak shows from a peak watching era—funny, tender, and worth another episode.", coverImageUrl: "/anime/oregairu.jpg", sortOrder: 1, isPublished: true },
  { id: "drama", slug: "drama", title: "The drama shelf", eyebrow: "Genre collection", description: "Stories with the emotional range to stay with you long after the credits roll.", coverImageUrl: "/anime/kayo.jpg", sortOrder: 2, isPublished: true },
  { id: "music", slug: "music", title: "The music shelf", eyebrow: "Genre collection", description: "Shows where the soundtrack, performance, and feeling are all part of the story.", coverImageUrl: "/anime/rere.jpg", sortOrder: 3, isPublished: true },
];

const sourceLists = [["favorites", animeList], ["romcom", romcomList], ["drama", dramaList], ["music", musicList]] as const;

const fallbackAnime: Anime[] = sourceLists.flatMap(([collectionSlug, list]) =>
  list.map((item, sortOrder) => ({
    id: item.id, collectionId: collectionSlug, collectionSlug, slug: canonicalSlug(item.id), title: item.title,
    cardImageUrl: item.image, detailImageUrl: item.image1, synopsis: item.description, editorNote: item.reason,
    streamingProviders: "streaming" in item ? item.streaming ?? [] : [], sortOrder, isPublished: true,
  })),
);

export const getLocalArtwork = (slug: string) => fallbackAnime.find((entry) => entry.slug === canonicalSlug(slug))?.cardImageUrl;

type ContentContextValue = {
  settings: SiteSettings;
  collections: Collection[];
  anime: Anime[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getCollection: (slug: string) => Collection | undefined;
  getAnime: (slug: string) => Anime | undefined;
  getAnimeForCollection: (slug: string) => Anime[];
};

const ContentContext = createContext<ContentContextValue | null>(null);

const mapCollection = (row: Record<string, unknown>): Collection => ({
  id: String(row.id), slug: String(row.slug), title: String(row.title), eyebrow: String(row.eyebrow),
  description: String(row.description), coverImageUrl: String(row.cover_image_url), sortOrder: Number(row.sort_order), isPublished: Boolean(row.is_published),
});

const mapAnime = (row: Record<string, unknown>, collectionSlug: string): Anime => ({
  artworkLocked: row.artwork_locked === true, focalX: Number(row.focal_x ?? 50), focalY: Number(row.focal_y ?? 50),
  id: String(row.id), collectionId: String(row.collection_id), collectionSlug, slug: String(row.slug), title: String(row.title),
  cardImageUrl: String(row.card_image_url ?? ""), detailImageUrl: String(row.detail_image_url ?? ""), synopsis: String(row.synopsis ?? ""),
  editorNote: String(row.editor_note), streamingProviders: (row.streaming_providers as StreamingProvider[] | null) ?? [],
  sortOrder: Number(row.sort_order), isPublished: Boolean(row.is_published),
});

export function ContentProvider({ children }: { children: ReactNode }) {
  const [snapshot] = useState(readSnapshot);
  const requestId = useRef(0);
  const hasRemote = useRef(false);
  const [settings, setSettings] = useState(snapshot?.settings ?? fallbackSettings);
  const [collections, setCollections] = useState(snapshot?.collections ?? fallbackCollections);
  // Do not flash the old bundled artwork before the saved catalog arrives.
  const [anime, setAnime] = useState<Anime[]>(isSupabaseConfigured ? snapshot?.anime ?? [] : fallbackAnime);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    const current = ++requestId.current;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
    const [settingsResult, collectionsResult, animeResult] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", true).abortSignal(controller.signal).maybeSingle(),
      supabase.from("collections").select("*").order("sort_order").abortSignal(controller.signal),
      supabase.from("anime").select("*").order("sort_order").abortSignal(controller.signal),
    ]);
    if (current !== requestId.current) return;
    const firstError = settingsResult.error ?? collectionsResult.error ?? animeResult.error;
    if (firstError) throw new Error(firstError.message);

    const nextCollections = (collectionsResult.data ?? []).map((row) => mapCollection(row));
    setCollections(nextCollections);
    let nextSettings = fallbackSettings;
    if (settingsResult.data) {
      const row = settingsResult.data;
      nextSettings = { homeTitle: row.home_title, archiveLabel: row.archive_label, aboutTitle: row.about_title, aboutBody: row.about_body, footerText: row.footer_text };
    }
    setSettings(nextSettings);
      const slugsByCollectionId = new Map(nextCollections.map((collection) => [collection.id, collection.slug]));
      const nextAnime = (animeResult.data ?? []).map((row) => mapAnime(row, slugsByCollectionId.get(row.collection_id) ?? ""));
      setAnime(nextAnime);
      saveSnapshot({ settings: nextSettings, anime: nextAnime, collections: nextCollections });
    setError(null);
    hasRemote.current = true;
    } catch (cause) {
      if (current !== requestId.current) return;
      setError(cause instanceof Error ? cause.message : "Content service unavailable");
      if (!hasRemote.current) {
        setAnime(snapshot?.anime ?? fallbackAnime);
        setCollections(snapshot?.collections ?? fallbackCollections);
        if (snapshot) setSettings(snapshot.settings);
      }
    } finally { clearTimeout(timeout); if (current === requestId.current) setLoading(false); }
  }, [snapshot]);

  useEffect(() => { void refresh(); }, [refresh]);

  const value = useMemo<ContentContextValue>(() => ({
    settings, collections, anime, loading, error, refresh,
    getCollection: (slug) => collections.find((collection) => collection.slug === slug && collection.isPublished),
    getAnime: (slug) => anime.find((entry) => entry.slug === canonicalSlug(slug) && entry.isPublished && collections.some((collection) => collection.id === entry.collectionId && collection.isPublished)),
    getAnimeForCollection: (slug) => anime.filter((entry) => entry.collectionSlug === slug && entry.isPublished).sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)),
  }), [settings, collections, anime, loading, error, refresh]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) throw new Error("useContent must be used within ContentProvider");
  return context;
}

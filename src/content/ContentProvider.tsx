import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { animeList, dramaList, musicList, romcomList } from "../components/animeData";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

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
    id: item.id, collectionId: collectionSlug, collectionSlug, slug: item.id, title: item.title,
    cardImageUrl: item.image, detailImageUrl: item.image1, synopsis: item.description, editorNote: item.reason,
    streamingProviders: "streaming" in item ? item.streaming ?? [] : [], sortOrder, isPublished: true,
  })),
);

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
  id: String(row.id), collectionId: String(row.collection_id), collectionSlug, slug: String(row.slug), title: String(row.title),
  cardImageUrl: String(row.card_image_url), detailImageUrl: String(row.detail_image_url), synopsis: String(row.synopsis),
  editorNote: String(row.editor_note), streamingProviders: (row.streaming_providers as StreamingProvider[] | null) ?? [],
  sortOrder: Number(row.sort_order), isPublished: Boolean(row.is_published),
});

export function ContentProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(fallbackSettings);
  const [collections, setCollections] = useState(fallbackCollections);
  const [anime, setAnime] = useState(fallbackAnime);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    const [settingsResult, collectionsResult, animeResult] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", true).maybeSingle(),
      supabase.from("collections").select("*").order("sort_order"),
      supabase.from("anime").select("*").order("sort_order"),
    ]);
    const firstError = settingsResult.error ?? collectionsResult.error ?? animeResult.error;
    if (firstError) { setError(firstError.message); setLoading(false); return; }

    const nextCollections = (collectionsResult.data ?? []).map((row) => mapCollection(row));
    if (nextCollections.length) setCollections(nextCollections);
    if (settingsResult.data) {
      const row = settingsResult.data;
      setSettings({ homeTitle: row.home_title, archiveLabel: row.archive_label, aboutTitle: row.about_title, aboutBody: row.about_body, footerText: row.footer_text });
    }
    if (animeResult.data?.length) {
      const slugsByCollectionId = new Map(nextCollections.map((collection) => [collection.id, collection.slug]));
      setAnime(animeResult.data.map((row) => mapAnime(row, slugsByCollectionId.get(row.collection_id) ?? "favorites")));
    }
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const value = useMemo<ContentContextValue>(() => ({
    settings, collections, anime, loading, error, refresh,
    getCollection: (slug) => collections.find((collection) => collection.slug === slug),
    getAnime: (slug) => anime.find((entry) => entry.slug === slug),
    getAnimeForCollection: (slug) => anime.filter((entry) => entry.collectionSlug === slug).sort((a, b) => a.sortOrder - b.sortOrder),
  }), [settings, collections, anime, loading, error, refresh]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) throw new Error("useContent must be used within ContentProvider");
  return context;
}

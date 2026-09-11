import { SavedArtwork } from "./SavedArtwork";

/** Keep the full artwork visible, including landscape images saved by the editor. */
export function AnimeArtwork({ sources, title }: { sources: (string | null | undefined)[]; title: string }) {
  return <div className="relative mx-auto w-full max-w-md self-start overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/30 lg:sticky lg:top-6">
    <SavedArtwork sources={sources} title={title} fit="contain" priority className="aspect-[3/4] max-h-[65svh] sm:max-h-[75svh]" />
  </div>;
}

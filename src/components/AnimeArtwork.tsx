import { SavedArtwork } from "./SavedArtwork";

/** Fill the detail frame without letterboxing, using the editor's saved crop. */
export function AnimeArtwork({ sources, title, focalX, focalY }: { sources: (string | null | undefined)[]; title: string; focalX?: number; focalY?: number }) {
  return <div className="relative mx-auto w-full max-w-md self-start overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl shadow-black/30 lg:sticky lg:top-24">
    <SavedArtwork sources={sources} title={title} fit="cover" focalX={focalX} focalY={focalY} priority className="w-full aspect-[3/4] max-h-[65svh] sm:max-h-[75svh]" />
  </div>;
}

import { useState } from "react";
import { useArtworkSource } from "../lib/useArtworkSource";
import { ArtworkPlaceholder } from "./ArtworkPlaceholder";

/** Keep the full artwork visible, including landscape images saved by the editor. */
export function AnimeArtwork({ sources, title, ready = true, apiUrl }: { sources: (string | null | undefined)[]; title: string; ready?: boolean; apiUrl?: string | null }) {
  const [failed, setFailed] = useState<string[]>([]);
  const { source, loading } = useArtworkSource(sources.filter((url) => url && !failed.includes(url)), "contain", ready, apiUrl);
  return <div className="relative mx-auto w-full max-w-md self-start overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/30 lg:sticky lg:top-6">
    {source ? <>
      <img src={source} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl" />
      <img src={source} alt={title} decoding="async" onError={() => setFailed((previous) => [...previous, source])}
        className="relative block aspect-[3/4] max-h-[65svh] w-full object-contain sm:max-h-[75svh]" />
    </> : <ArtworkPlaceholder loading={loading} className="aspect-[3/4] max-h-[65svh] sm:max-h-[75svh]" />}
  </div>;
}

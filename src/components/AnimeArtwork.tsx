import { useState } from "react";

/** Keep the full artwork visible, including landscape images saved by the editor. */
export function AnimeArtwork({ sources, title }: { sources: (string | null | undefined)[]; title: string }) {
  const [failed, setFailed] = useState<string[]>([]);
  const source = sources.find((url): url is string => Boolean(url) && !failed.includes(url!));
  return <div className="relative mx-auto w-full max-w-md self-start overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/30 lg:sticky lg:top-6">
    {source ? <>
      <img src={source} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl" />
      <img src={source} alt={title} onError={() => setFailed((previous) => [...previous, source])}
        className="relative block aspect-[3/4] max-h-[65svh] w-full object-contain sm:max-h-[75svh]" />
    </> : <div className="grid aspect-[3/4] place-items-center p-8 text-center text-zinc-400">Artwork unavailable for {title}</div>}
  </div>;
}

import { useState } from "react";
import { Link } from "react-router-dom";
import type { Anime } from "../content/ContentProvider";
import { useJikanAnime } from "../lib/useJikanAnime";
import { boardPositions } from "../lib/adminModel";
import { useArtworkSource } from "../lib/useArtworkSource";

interface MainContainerProps {
  list: Anime[];
}

export function MainContainer({ list }: MainContainerProps) {
  const { slots, overflow } = boardPositions(list);
  const [layout, setLayout] = useState("expanded");
  const condensed = layout === "condensed";
  return (
    <div className="w-full">
      <div className="mb-5 sm:hidden">
        <div role="group" aria-label="Grid view" className="relative isolate grid grid-cols-2 rounded-2xl border border-white/10 bg-zinc-950/60 p-1.5 shadow-lg shadow-black/10">
          <span aria-hidden="true" className={`pointer-events-none absolute inset-y-1.5 left-1.5 -z-10 w-[calc(50%-0.375rem)] rounded-xl bg-cyan-300 shadow-[0_2px_12px_rgba(34,211,238,0.15)] transition-transform duration-200 ease-out motion-reduce:transition-none ${condensed ? "translate-x-full" : "translate-x-0"}`} />
          {(["expanded", "condensed"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={layout === mode}
              onClick={() => setLayout(mode)}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-100 ${layout === mode ? "text-zinc-950" : "text-zinc-400 hover:text-white"}`}
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                {mode === "expanded" ? <><rect x="4" y="3" width="16" height="7" rx="2" /><rect x="4" y="14" width="16" height="7" rx="2" /></> : (
                  Array.from({ length: 9 }, (_, index) => <rect key={index} x={3 + (index % 3) * 7} y={3 + Math.floor(index / 3) * 7} width="4" height="4" rx="0.8" />)
                )}
              </svg>
              {mode === "expanded" ? "Expanded" : "Condensed"}
            </button>
          ))}
        </div>
      </div>
      <div className={`grid gap-2 sm:grid-cols-3 sm:gap-4 ${condensed ? "grid-cols-3" : "grid-cols-1"}`}>
        {slots.map((anime, index) => {
          return anime ? <AnimeCard key={`${anime.id}:${index}`} anime={anime} condensed={condensed} index={index} /> : <div key={`empty-${index}`} className={`${condensed ? "grid" : "hidden"} aspect-square place-items-center rounded-xl p-2 text-center sm:rounded-2xl border border-dashed border-white/10 bg-white/[0.02] text-xs text-zinc-600 sm:grid`} aria-label={`Empty position ${index + 1}`}>To be discovered</div>;
        })}
        {overflow.map((anime, index) => <AnimeCard key={`${anime.id}:overflow:${index}`} anime={anime} condensed={condensed} index={slots.length + index} />)}
      </div>
    </div>
  );
}

function AnimeCard({ anime, index, condensed }: { anime: Anime; index: number; condensed: boolean }) {
  const jikan = useJikanAnime(anime.slug, anime.title);
  const artwork = useArtworkSource([anime.cardImageUrl, jikan?.imageUrl]);
  return (
          <Link to={`/anime/${anime.slug}`} className="group relative block overflow-hidden rounded-2xl bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-900">
            <img
              title={anime.title}
              src={artwork ?? "/anime/question.webp"}
              decoding="async"
              onError={(event) => {
                if (event.currentTarget.getAttribute("src") !== anime.cardImageUrl) event.currentTarget.src = anime.cardImageUrl;
              }}
              alt={anime.title}
              loading={index > 2 ? "lazy" : "eager"}
              className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105 group-focus-visible:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/10 to-transparent opacity-80 transition group-hover:opacity-100" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-1 p-2 sm:gap-3 sm:p-4">
              <h2 className={`line-clamp-2 min-w-0 leading-tight font-bold sm:max-w-[80%] tracking-tight text-white sm:text-lg ${condensed ? "text-[10px]" : "p-2 text-lg"}`}>{anime.title}</h2>
              <span className="hidden font-mono text-xs text-cyan-300 sm:block">{String(index + 1).padStart(2, "0")}</span>
            </div>
          </Link>
  );
}

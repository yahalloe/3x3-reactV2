import { useState } from "react";
import { Link } from "react-router-dom";
import { getLocalArtwork, useContent, type Anime } from "../content/ContentProvider";
import { boardPositions } from "../lib/adminModel";
import { SavedArtwork } from "./SavedArtwork";
import { ArtworkPlaceholder } from "./ArtworkPlaceholder";

interface MainContainerProps {
  list: Anime[];
}

export function MainContainer({ list }: MainContainerProps) {
  const { loading } = useContent();
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
          return anime ? <AnimeCard key={`${anime.id}:${index}`} anime={anime} condensed={condensed} index={index} /> : loading ? <ArtworkPlaceholder key={`loading-${index}`} loading className="aspect-square rounded-2xl" /> : <div key={`empty-${index}`} className={`${condensed ? "grid" : "hidden"} aspect-square place-items-center rounded-xl p-2 text-center sm:rounded-2xl border border-dashed border-white/10 bg-white/[0.02] text-xs text-zinc-400 sm:grid`} aria-label={`Empty position ${index + 1}`}>To be discovered</div>;
        })}
        {overflow.map((anime, index) => <AnimeCard key={`${anime.id}:overflow:${index}`} anime={anime} condensed={condensed} index={slots.length + index} />)}
      </div>
    </div>
  );
}

function AnimeCard({ anime, index, condensed }: { anime: Anime; index: number; condensed: boolean }) {
  return (
          <Link to={`/anime/${anime.slug}`} className="anime-card group" aria-label={`Explore ${anime.title}`}>
            <SavedArtwork sources={[anime.cardImageUrl, anime.detailImageUrl, getLocalArtwork(anime.slug)]} title={`Artwork for ${anime.title}`} focalX={anime.focalX} focalY={anime.focalY} priority={index === 0} lazy={index > 2} />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
            <div className={`absolute inset-x-0 bottom-0 flex items-end justify-between gap-1 sm:gap-3 sm:p-4 ${condensed ? "p-1.5" : "p-3"}`}>
              <h2 className={`line-clamp-2 min-w-0 leading-tight font-bold sm:max-w-[80%] tracking-tight text-white sm:text-lg ${condensed ? "text-xs" : "text-lg"}`}>{anime.title}</h2>
              <span aria-hidden="true" className="shrink-0 text-sm text-cyan-200">↗</span>
            </div>
          </Link>
  );
}

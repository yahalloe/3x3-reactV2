import { useState } from "react";
import { Link } from "react-router-dom";
import type { Anime } from "../content/ContentProvider";
import { useJikanAnime } from "../lib/useJikanAnime";
import { boardPositions } from "../lib/adminModel";

interface MainContainerProps {
  list: Anime[];
}

export function MainContainer({ list }: MainContainerProps) {
  const { slots, overflow } = boardPositions(list);
  const [layout, setLayout] = useState("expanded");
  const condensed = layout === "condensed";
  return (
    <div className="w-full">
      <label className="mb-4 flex items-center justify-end gap-3 text-sm text-zinc-400 sm:hidden">View<select aria-label="Mobile grid view" value={layout} onChange={(event) => setLayout(event.target.value)} className="rounded-lg border border-white/15 bg-zinc-900 px-3 py-2 text-base text-white"><option value="expanded">Expanded</option><option value="condensed">Condensed</option></select></label>
      <div className={`grid gap-2 sm:grid-cols-3 sm:gap-4 ${condensed ? "grid-cols-3" : "grid-cols-1"}`}>
        {slots.map((anime, index) => {
          return anime ? <AnimeCard key={`${anime.id}:${index}`} anime={anime} condensed={condensed} index={index} /> : <div key={`empty-${index}`} className={`${condensed ? "grid" : "hidden"} aspect-square place-items-center rounded-xl p-2 text-center sm:rounded-2xl border border-dashed border-white/10 bg-white/[0.02] text-xs text-zinc-600 sm:grid`} aria-label={`Empty position ${index + 1}`}>To be discovered</div>;
        })}
        {overflow.map((anime, index) => <AnimeCard key={`${anime.id}:overflow:${index}`} anime={anime} condensed={condensed} index={anime.sortOrder} />)}
      </div>
    </div>
  );
}

function AnimeCard({ anime, index, condensed }: { anime: Anime; index: number; condensed: boolean }) {
  const jikan = useJikanAnime(anime.slug, anime.title);
  return (
          <Link to={`/anime/${anime.slug}`} className="group relative block overflow-hidden rounded-2xl bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-900">
            <img
              title={anime.title}
              src={jikan?.imageUrl ?? anime.cardImageUrl}
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
              <span className="hidden font-mono text-xs text-cyan-300 sm:block">0{index + 1}</span>
            </div>
          </Link>
  );
}

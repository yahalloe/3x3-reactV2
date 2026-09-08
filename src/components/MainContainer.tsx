import { Link } from "react-router-dom";
import type { Anime } from "../content/ContentProvider";
import { useJikanAnime } from "../lib/useJikanAnime";

interface MainContainerProps {
  list: Anime[];
}

export function MainContainer({ list }: MainContainerProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
        {list.map((anime, index) => <AnimeCard key={`${anime.id}:${index}`} anime={anime} index={index} />)}
      </div>
    </div>
  );
}

function AnimeCard({ anime, index }: { anime: Anime; index: number }) {
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
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
              <h2 className="max-w-[80%] text-base font-bold tracking-tight text-white sm:text-lg">{anime.title}</h2>
              <span className="font-mono text-xs text-cyan-300">0{index + 1}</span>
            </div>
          </Link>
  );
}

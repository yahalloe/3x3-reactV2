import { Link } from "react-router-dom";

interface MainContainerProps {
  list: {
    id: string;
    title: string;
    image: string;
    image1: string;
  }[];
}

export function MainContainer({ list }: MainContainerProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
        {list.map((anime, index) => (
          <Link key={anime.id} to={`/anime/${anime.id}`} className="group relative block overflow-hidden rounded-2xl bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-900">
            <img
              title={anime.title}
              src={anime.image}
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
        ))}
      </div>
    </div>
  );
}

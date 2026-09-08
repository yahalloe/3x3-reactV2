import { Link } from "react-router-dom";
import { useState } from "react";
import { others, listsById, type ListId } from "./animeData";
import { prefetchImages } from "../components/utils/prefetchImages";

const handlePrefetch = (id: ListId) => {
  const list = listsById[id];
  if (list) {
    const urls = list.map((item) => item.image);
    prefetchImages(urls);
  }
};

export function Others() {
  const [hasStartedPrefetch, setHasStartedPrefetch] = useState(false);

  const handleFirstInteraction = () => {
    if (!hasStartedPrefetch) {
      // Prefetch everything once user shows ANY interest
      others.forEach((anime) => handlePrefetch(anime.id));
      setHasStartedPrefetch(true);
    }
  };

  return (
    <section className="border-y border-white/8 bg-zinc-950">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-8">
          <p className="section-label mb-3">More shelves</p>
          <h2 className="text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">Other 3×3s</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {others.map((anime) => (
          <div
            key={anime.id}
            className="group"
            onMouseEnter={handleFirstInteraction}
            onTouchStart={handleFirstInteraction} 
          >
            <Link to={`/${anime.id}`} className="relative block overflow-hidden rounded-2xl bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
              <img
                src={anime.image}
                alt={anime.title}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 to-transparent" />
              <span className="absolute bottom-4 left-4 text-xl font-bold text-white">{anime.title}</span>
            </Link>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}

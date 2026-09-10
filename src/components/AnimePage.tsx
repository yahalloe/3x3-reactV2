// AnimePage.jsx
import { useParams } from "react-router-dom";
import { Header } from "./Header";
import { BackButton } from "./BackButton";
import { Footer } from "./Footer";
import { NotFound } from "../pages/NotFound";
import { useContent } from "../content/ContentProvider";
import { useJikanAnime } from "../lib/useJikanAnime";
import { AnimeArtwork } from "./AnimeArtwork";

export function AnimePage() {
  const { id } = useParams();
  const { getAnime } = useContent();
  const anime = getAnime(id ?? "");
  const jikan = useJikanAnime(anime?.slug ?? "", anime?.title ?? "");

  if (!anime) return <NotFound />;

  return (
    <>
      <Header title={anime.title} />
      <main className="page-surface min-h-[60vh]">
        <article className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:gap-14">
          <AnimeArtwork key={anime.id} title={anime.title} sources={[jikan?.imageUrl, anime.detailImageUrl, anime.cardImageUrl]} />
          <div className="flex flex-col justify-center">
            <p className="section-label mb-5">Archive entry</p>
            <div className="border-l-2 border-cyan-400 pl-5">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">Synopsis</p>
              <p className="mt-3 whitespace-pre-line text-lg leading-8 text-zinc-200 sm:text-xl">{jikan?.synopsis ?? anime.synopsis}</p>
              {jikan?.synopsis && <a className="mt-3 inline-block text-xs text-cyan-300 hover:underline" href={`https://myanimelist.net/anime/${jikan.malId}`} target="_blank" rel="noreferrer">Synopsis from MyAnimeList via Jikan ↗</a>}
            </div>
            {anime.editorNote && <p className="mt-9 whitespace-pre-wrap break-words text-base leading-8 text-zinc-300">{anime.editorNote}</p>}
            <section className="mt-9 border-t border-white/10 pt-7">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-cyan-300">Watch now</p>
              {anime.streamingProviders.length ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {anime.streamingProviders.map((provider) => {
                    const label = provider === "netflix" ? "Netflix" : "Crunchyroll";
                    const searchUrl = provider === "netflix"
                      ? `https://www.netflix.com/search?q=${encodeURIComponent(anime.title)}`
                      : `https://www.crunchyroll.com/search?q=${encodeURIComponent(anime.title)}`;
                    const providerIcon = provider === "netflix"
                      ? "https://cdnjs.cloudflare.com/ajax/libs/simple-icons/15.15.0/netflix.svg"
                      : "https://cdnjs.cloudflare.com/ajax/libs/simple-icons/15.15.0/crunchyroll.svg";
                    const providerStyles = provider === "netflix"
                      ? "border-[#e50914] bg-[#e50914] hover:bg-[#f6121d]"
                      : "border-[#f47521] bg-[#f47521] hover:bg-[#ff8e45]";

                    return (
                      <a
                        key={provider}
                        href={searchUrl}
                        target="_blank"
                        rel="noreferrer"
                        title={`Watch ${anime.title} on ${label}`}
                        aria-label={`Watch ${anime.title} on ${label}`}
                        className={`grid h-12 w-12 place-items-center rounded-full border p-1.5 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-900 ${providerStyles}`}
                      >
                        <img src={providerIcon} alt="" aria-hidden="true" referrerPolicy="no-referrer" className="h-full w-full object-contain brightness-0 invert" />
                      </a>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-zinc-500">No Netflix or Crunchyroll link is currently listed for this title in the Philippines.</p>
              )}
            </section>
          </div>
        </article>
        <div className="mx-auto flex max-w-6xl px-5 pb-12 sm:px-8 sm:pb-16">
          <BackButton />
        </div>
      </main>
      <Footer />
    </>
  );
}

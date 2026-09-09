// AnimePage.jsx
import { useParams } from "react-router-dom";
import { Header } from "./Header";
import { BackButton } from "./BackButton";
import { Footer } from "./Footer";
import { NotFound } from "../pages/NotFound";
import { useContent } from "../content/ContentProvider";
import { useJikanAnime } from "../lib/useJikanAnime";

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
          <div className="relative overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl shadow-black/30">
            <img
              src={jikan?.imageUrl ?? anime.detailImageUrl}
              onError={(event) => {
                if (event.currentTarget.getAttribute("src") !== anime.detailImageUrl) event.currentTarget.src = anime.detailImageUrl;
              }}
              alt={anime.title}
              title={anime.title}
              className="max-h-[70vh] w-full object-contain"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="section-label mb-5">Archive entry</p>
            <div className="border-l-2 border-cyan-400 pl-5">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">Synopsis</p>
              <p className="mt-3 whitespace-pre-line text-lg leading-8 text-zinc-200 sm:text-xl">{jikan?.synopsis ?? anime.synopsis}</p>
              {jikan?.synopsis && <a className="mt-3 inline-block text-xs text-cyan-300 hover:underline" href={`https://myanimelist.net/anime/${jikan.malId}`} target="_blank" rel="noreferrer">Synopsis from MyAnimeList via Jikan ↗</a>}
            </div>
            {anime.editorNote && <section className="mt-9 rounded-2xl border border-white/10 bg-zinc-950/40 p-5"><div className="mb-3 flex items-center gap-3"><span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full bg-cyan-300/15 text-sm font-bold text-cyan-300">Y</span><div><p className="text-sm font-bold text-zinc-200">Yahallo</p><p className="text-xs text-cyan-300">My take on this show</p></div></div><div className="whitespace-pre-wrap break-words border-l border-white/10 pl-4 text-base leading-7 text-zinc-400">{anime.editorNote}</div></section>}
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

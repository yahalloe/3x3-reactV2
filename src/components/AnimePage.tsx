// AnimePage.jsx
import { Link, useParams } from "react-router-dom";
import { Header } from "./Header";
import { BackButton } from "./BackButton";
import { Footer } from "./Footer";
import { NotFound } from "../pages/NotFound";
import { getLocalArtwork, useContent } from "../content/ContentProvider";
import { collectionPath } from "../lib/publicNavigation";
import { PageSkeleton } from "./PageSkeleton";
import { AnimeArtwork } from "./AnimeArtwork";
import { Synopsis } from "./Synopsis";
import { OpinionText } from "./OpinionText";

export function AnimePage() {
  const { id } = useParams();
  const { getAnime, getCollection, getAnimeForCollection, loading } = useContent();
  const anime = getAnime(id ?? "");

  if (!anime && loading) return <PageSkeleton />;
  if (!anime) return <NotFound />;
  const collection = getCollection(anime.collectionSlug);
  const list = getAnimeForCollection(anime.collectionSlug);
  const position = list.findIndex((entry) => entry.id === anime.id);
  const previous = list[position - 1], next = list[position + 1];
  const parent = collectionPath(anime.collectionSlug);

  return (
    <>
      <Header title={anime.title} />
      <main className="page-surface min-h-[60vh]">
        <nav aria-label="Breadcrumb" className="page-shell breadcrumbs pt-6"><Link to="/">Archive</Link>{parent !== "/" && <><span aria-hidden="true">/</span><Link to={parent}>{collection?.title ?? "Collection"}</Link></>}<span aria-hidden="true">/</span><span aria-current="page">{anime.title}</span></nav>
        <article className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:gap-14">
          <AnimeArtwork key={anime.id} title={anime.title} sources={[anime.detailImageUrl, anime.cardImageUrl, getLocalArtwork(anime.slug)]} />
          <div className="flex flex-col justify-center">
            <p className="section-label mb-5">Archive entry</p>
            <div className="border-l-2 border-cyan-400 pl-5">
              <p className="section-label !text-zinc-300">Synopsis</p>
              <Synopsis key={anime.id} text={anime.synopsis || "A synopsis has not been added yet. Explore the collection for more recommendations."} />
            </div>
            {anime.editorNote && <section className="reading-copy mt-9 text-base leading-8 text-zinc-300"><h2 className="mb-3 text-xl font-bold text-zinc-100">Why it stayed with me</h2>{typeof anime.editorNote === "string" ? <OpinionText text={anime.editorNote} /> : anime.editorNote}</section>}
            <section className="mt-9 border-t border-white/10 pt-7">
              <p className="section-label">Watch now</p>
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
                        className={`grid h-12 w-12 place-items-center rounded-lg border p-1.5 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-900 ${providerStyles}`}
                      >
                        <img src={providerIcon} alt="" aria-hidden="true" referrerPolicy="no-referrer" className="h-full w-full object-contain brightness-0 invert" />
                      </a>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-zinc-300">No streaming link is listed yet. Availability may vary by region.</p>
              )}
            </section>
          </div>
        </article>
        <div className="page-shell pb-12">
          <BackButton to={parent} label={`Back to ${parent === "/" ? "Archive" : collection?.title ?? "collection"}`} />
          <nav aria-label="More anime in this collection" className="adjacent-anime mt-6">{previous ? <Link to={`/anime/${previous.slug}`}><span>← Previous anime</span><strong>{previous.title}</strong></Link> : <div><span>Start of this collection</span></div>}{next ? <Link to={`/anime/${next.slug}`}><span>Next anime →</span><strong>{next.title}</strong></Link> : <div><span>End of this collection</span><Link to={parent} className="text-link">Explore the collection</Link></div>}</nav>
        </div>
      </main>
      <Footer />
    </>
  );
}

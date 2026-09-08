import { useParams } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { MainContainer } from "../components/MainContainer";
import { NotFound } from "./NotFound";
import { useContent } from "../content/ContentProvider";

export function CollectionPage() {
  const { slug } = useParams();
  const { getCollection, getAnimeForCollection } = useContent();
  const collection = getCollection(slug ?? "");
  if (!collection) return <NotFound />;

  return (
    <div>
      <Header title={collection.title} />
      <main className="page-surface">
        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="section-label mb-3">{collection.eyebrow}</p><h2 className="text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">{collection.title}</h2></div>
            <p className="max-w-sm text-sm leading-6 text-zinc-400 sm:text-right">{collection.description}</p>
          </div>
          <MainContainer list={getAnimeForCollection(collection.slug)} />
        </section>
      </main>
      <Footer />
    </div>
  );
}

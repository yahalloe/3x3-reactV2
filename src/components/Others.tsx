import { Link } from "react-router-dom";
import { useContent } from "../content/ContentProvider";
import { SavedArtwork } from "./SavedArtwork";
import { collectionPath } from "../lib/publicNavigation";

export function Others({ standalone = false }: { standalone?: boolean }) {
  const { collections } = useContent();
  const otherCollections = collections.filter((collection) => collection.slug !== "favorites" && collection.isPublished);

  return (
    <section className="border-y border-white/15 bg-zinc-950" aria-label="Other Collections">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        {!standalone && <div className="mb-8">
          <p className="section-label mb-3">More shelves</p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Other Collections</h2>
        </div>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {otherCollections.map((collection) => (
          <div
            key={collection.id}
            className="group"
          >
            <Link to={collectionPath(collection.slug)} className="collection-card">
              <SavedArtwork sources={[collection.coverImageUrl]} title={`Cover artwork for ${collection.title}`} lazy className="aspect-[4/3]" />
              <div className="p-4"><h2 className="text-xl font-bold text-white">{collection.title}</h2><p className="mt-2 text-sm leading-6 text-zinc-300">{collection.description}</p><span className="mt-4 inline-block text-sm font-semibold text-cyan-200">Explore collection <span aria-hidden="true">→</span></span></div>
            </Link>
          </div>
        ))}
        </div>
        {!otherCollections.length && <p className="text-zinc-300">No additional collections are published yet. <Link to="/" className="text-link">Explore the Archive</Link></p>}
      </div>
    </section>
  );
}

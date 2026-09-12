import { Link, useParams } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { MainContainer } from "../components/MainContainer";
import { NotFound } from "./NotFound";
import { PageSkeleton } from "../components/PageSkeleton";
import { BackButton } from "../components/BackButton";
import { useContent } from "../content/ContentProvider";

export function CollectionPage({ collectionSlug }: { collectionSlug?: string }) {
  const { slug } = useParams();
  const { getCollection, getAnimeForCollection, loading } = useContent();
  const collection = getCollection(collectionSlug ?? slug ?? "");
  if (!collection && loading) return <PageSkeleton />;
  if (!collection) return <NotFound />;
  const list = getAnimeForCollection(collection.slug);
  return <><Header title={collection.title} description={collection.description} />
    <main className="page-surface"><section className="page-shell py-8 sm:py-12" aria-label={`${collection.title} anime`}>
      <nav aria-label="Breadcrumb" className="breadcrumbs"><Link to="/">Archive</Link><span aria-hidden="true">/</span><Link to="/collections">Collections</Link><span aria-hidden="true">/</span><span aria-current="page">{collection.title}</span></nav>
      <p className="mb-6 text-sm text-zinc-300">{loading ? "Loading collection…" : `${list.length} ${list.length === 1 ? "show" : "shows"} · Select a card to explore`}</p>
      <MainContainer list={list} /><div className="mt-8"><BackButton /></div>
    </section></main><Footer /></>;
}

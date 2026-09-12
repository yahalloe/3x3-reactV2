import { Link } from "react-router-dom";
import { useEffect } from "react";

export function NotFound() {
  useEffect(() => { document.title = "Page not found · Yahalloe’s Anime Archive"; }, []);
  return (
    <main className="page-surface flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <p className="section-label mb-4">Page not found · 404</p>
      <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">Let’s find your next show.</h1>
      <p className="mt-5 max-w-md text-lg leading-7 text-zinc-400">That page is not in this collection. The grid is a good place to start again.</p>
      <Link to="/" className="mt-8 rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-900">
        Return to Archive
      </Link>
      <nav aria-label="Page recovery" className="mt-5 flex flex-wrap justify-center gap-4"><Link to="/romcom" className="text-link">Romcom</Link><Link to="/drama" className="text-link">Drama</Link><Link to="/collections" className="text-link">Other Collections</Link></nav>
    </main>
  );
}

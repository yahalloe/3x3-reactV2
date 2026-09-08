import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <main className="page-surface flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <p className="section-label mb-4">404 · archive missing</p>
      <h1 className="text-6xl font-extrabold tracking-[-0.07em] text-white sm:text-8xl">Lost?</h1>
      <p className="mt-5 max-w-md text-lg leading-7 text-zinc-400">That page is not in this collection. The grid is a good place to start again.</p>
      <Link to="/" className="mt-8 rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-900">
        Back to the grid
      </Link>
    </main>
  );
}

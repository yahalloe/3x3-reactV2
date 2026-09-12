import { Link } from "react-router-dom";
import { useContent } from "../content/ContentProvider";

export function Footer() {
  const { settings } = useContent();
  return (
    <footer className="bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="font-bold text-xs tracking-[0.18em] text-cyan-300">
            YAHALLOE'S 3×3
          </p>
          <p className="mt-2 text-xs text-zinc-400">
            {settings.footerText}
          </p>
        </div>
        <nav
          className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-400"
          aria-label="Footer navigation"
        >
          <Link to="/about" className="text-link hover:text-white">
            About
          </Link>
          <a
            href="https://github.com/yahalloe/3x3-reactV2"
            target="_blank"
            rel="noreferrer"
            className="text-link hover:text-white"
          >
            Source
          </a>
          <a
            href="https://myanimelist.net/profile/yahalloe"
            target="_blank"
            rel="noreferrer"
            className="text-link hover:text-white"
          >
            MAL
          </a>
          <a
            href="https://picker.yahallo.me"
            target="_blank"
            rel="noreferrer"
            className="text-link hover:text-white"
          >
            Anime picker
          </a>
        </nav>
      </div>
    </footer>
  );
}

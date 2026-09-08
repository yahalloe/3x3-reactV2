import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useContent } from "../content/ContentProvider";

interface FallbackLinkProps {
  primaryUrl: string;
  fallbackUrl: string;
  timeoutMs?: number;
  className?: string;
  children: React.ReactNode;
}

export const FallbackLink: React.FC<FallbackLinkProps> = ({
  primaryUrl,
  fallbackUrl,
  timeoutMs = 2500, // adjust timeout threshold as needed
  className,
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // mode: 'no-cors' lets you check basic network reachability across different domains
      await fetch(primaryUrl, {
        method: "HEAD",
        mode: "no-cors",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      window.open(primaryUrl, "_blank", "noreferrer");
    } catch {
      // Primary link timed out or network error (DNS failure, server down, etc.)
      clearTimeout(timeoutId);
      window.open(fallbackUrl, "_blank", "noreferrer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <a
      href={primaryUrl}
      onClick={handleClick}
      target="_blank"
      rel="noreferrer"
      className={`${className ?? ""} ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
    >
      {children}
    </a>
  );
};

export function Footer() {
  const { settings } = useContent();
  return (
    <footer className="bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="font-mono text-xs tracking-[0.18em] text-cyan-300">
            YAHALLOE'S 3×3
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            {settings.footerText}
          </p>
        </div>
        <nav
          className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-400"
          aria-label="Footer navigation"
        >
          <Link to="/about" className="transition hover:text-white">
            About
          </Link>
          <a
            href="https://github.com/yahalloe/3x3-react"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-white"
          >
            Source
          </a>
          <a
            href="https://myanimelist.net/profile/yahalloe"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-white"
          >
            MAL
          </a>
          <FallbackLink
            primaryUrl="https://picker.yahallo.me"
            fallbackUrl="https://anime-picker-ten.vercel.app"
            timeoutMs={3000}
            className="transition hover:text-white"
          >
            Anime picker
          </FallbackLink>
        </nav>
      </div>
    </footer>
  );
}

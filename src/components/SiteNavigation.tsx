import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useContent } from "../content/ContentProvider";
import { collectionPath } from "../lib/publicNavigation";

export function SiteNavigation() {
  const { pathname } = useLocation();
  const { collections, getAnime } = useContent();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  if (pathname.startsWith("/admin")) return null;
  const animeCollection = pathname.startsWith("/anime/") ? getAnime(pathname.split("/")[2])?.collectionSlug : undefined;
  const shelves = collections.filter(item => item.isPublished).sort((a, b) => a.sortOrder - b.sortOrder);
  return <div className="site-navigation">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <div className="site-navigation-inner">
      <Link to="/" aria-label="Yahalloe’s anime archive home" className="site-brand"><span aria-hidden="true">▦</span><span>Yahalloe</span></Link>
      <nav aria-label="Main navigation" className="site-nav-links">
        <div ref={root} className="collection-disclosure" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }} onKeyDown={event => { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } }}>
          <button ref={trigger} type="button" className="site-nav-link" aria-expanded={open} aria-controls={panelId} data-active={pathname !== "/about" || undefined} onClick={() => setOpen(!open)}>3×3’s <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.5" /></svg></button>
          <div id={panelId} hidden={!open} className="collection-dropdown">
            <p className="section-label">Browse the 3×3’s</p>
            {shelves.map(item => <Link key={item.id} to={collectionPath(item.slug)} aria-current={pathname === collectionPath(item.slug) || pathname === `/collection/${item.slug}` || animeCollection === item.slug ? "page" : undefined} onClick={() => setOpen(false)}>{item.title}<span aria-hidden="true">↗</span></Link>)}
            <Link to="/collections" className="all-collections-link" onClick={() => setOpen(false)}>All collections<span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <Link to="/about" aria-current={pathname === "/about" ? "page" : undefined} className="site-nav-link">About</Link>
      </nav>
    </div>
  </div>;
}

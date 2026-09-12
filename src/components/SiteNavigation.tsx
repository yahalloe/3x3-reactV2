import { Link, useLocation } from "react-router-dom";
import { useContent } from "../content/ContentProvider";
import { activeSection } from "../lib/publicNavigation";

export function SiteNavigation() {
  const { pathname } = useLocation();
  const { getAnime } = useContent();
  if (pathname.startsWith("/admin")) return null;
  const section = activeSection(pathname, pathname.startsWith("/anime/") ? getAnime(pathname.split("/")[2])?.collectionSlug : undefined);
  return <div className="site-navigation">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <div className="site-navigation-inner">
      <Link to="/" aria-label="Yahalloe’s anime archive home" className="site-brand"><span aria-hidden="true">▦</span><span>Yahalloe’s 3×3</span></Link>
      <nav aria-label="Main navigation" className="site-nav-links">{[["archive", "/", "Archive"], ["romcom", "/romcom", "Romcom"], ["drama", "/drama", "Drama"], ["collections", "/collections", "Other Collections"], ["about", "/about", "About"]].map(([key, to, label]) => <Link key={key} to={to} aria-current={section === key ? "page" : undefined} className="site-nav-link">{label}</Link>)}</nav>
    </div>
  </div>;
}

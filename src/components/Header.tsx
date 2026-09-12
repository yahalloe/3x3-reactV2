import { useLocation } from "react-router-dom";
import { useEffect } from "react";
export function Header({ title, description }: { title: string; description?: string }) {
  const { pathname } = useLocation();
  const home = pathname === "/";
  const detail = pathname.startsWith("/anime/");
  useEffect(() => { document.title = `${title} · Yahalloe’s Anime Archive`; }, [title]);
  return <header className={`page-heading ${home ? "page-heading-home" : ""}`}><div className="page-shell">
    <p className="section-label">{home ? "A personal anime archive" : detail ? "Anime · notes & recommendations" : pathname === "/about" ? "Behind the archive" : "Explore the archive"}</p>
    <h1 className={detail ? "detail-title" : ""}>{title}</h1>
    {(description || home) && <p className="page-description">{description || "Nine favorites at a time. Explore the anime I love, read why they stayed with me, and find your next show."}</p>}
  </div></header>;
}

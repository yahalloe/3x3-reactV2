import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();
  const previous = useRef(pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (previous.current !== pathname) document.getElementById("main-content")?.focus({ preventScroll: true });
    previous.current = pathname;
  }, [pathname]); // runs every time the route changes

  return null;
}

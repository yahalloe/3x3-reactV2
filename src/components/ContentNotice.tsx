import { useLocation } from "react-router-dom";
import { useContent } from "../content/ContentProvider";
export function ContentNotice() {
  const { error, refresh, loading } = useContent();
  const { pathname } = useLocation();
  if (!error || pathname.startsWith("/admin")) return null;
  return <div className="content-notice" role="status"><p>Live updates are unavailable. You can still browse the saved archive; some recent changes may be missing.</p><button type="button" disabled={loading} onClick={() => void refresh()} className="text-link">{loading ? "Retrying…" : "Retry connection"}</button></div>;
}

export function ArtworkPlaceholder({ loading, className = "aspect-square" }: { loading: boolean; className?: string }) {
  return <div role="status" aria-label={loading ? "Loading artwork" : "Artwork unavailable"} className={`grid place-items-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 ${className}`}>
    <div className={`flex flex-col items-center gap-3 text-zinc-300 ${loading ? "motion-safe:animate-pulse" : ""}`}>
      <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="8" cy="8" r="1.5" /><path d="m3 17 6-6 4 4 3-3 5 5" /></svg>
      <span className="text-[10px] uppercase tracking-widest">{loading ? "Loading artwork" : "Artwork unavailable"}</span>
    </div>
  </div>;
}

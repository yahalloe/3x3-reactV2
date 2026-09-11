import { useEffect, useState } from "react";
import { artworkGallery, type ArtworkChoice } from "../../lib/artworkGallery";

export interface ArtworkDraft { cardImageUrl: string; detailImageUrl: string; artworkLocked?: boolean; focalX?: number; focalY?: number }
export function ArtworkPicker({ slug, title, value, onChange }: { slug: string; title: string; value: ArtworkDraft; onChange: (patch: Partial<ArtworkDraft>) => void }) {
  const [images, setImages] = useState<ArtworkChoice[]>([]);
  const [status, setStatus] = useState("idle");
  const [attempt, setAttempt] = useState(0);
  const [dimensions, setDimensions] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!attempt || !slug || !title) return;
    const controller = new AbortController();
    void artworkGallery(slug, title, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setImages(result.images);
      setStatus(result.partial ? "partial" : "ready");
    }).catch(() => { if (!controller.signal.aborted) setStatus("error"); });
    return () => controller.abort();
  }, [slug, title, attempt]);
  const x = value.focalX ?? 50, y = value.focalY ?? 50;
  return <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold text-cyan-200">Artwork & framing</h3><p className="mt-1 text-xs text-zinc-400">Choose the composition, not just the biggest file.</p></div><button type="button" className="editor-secondary-button" disabled={!slug || !title || status === "loading"} onClick={() => { setStatus("loading"); setImages([]); setAttempt((n) => n + 1); }}> {status === "loading" ? "Finding artwork…" : "Browse API artwork"}</button></div>
    <p role="status" className="mt-3 text-xs text-zinc-400">{status === "loading" ? "Loading matched posters and banners…" : status === "error" ? "Artwork services are unavailable. Retry browsing; your current selection is unchanged." : status === "partial" ? "One provider is unavailable. Showing results from the other provider." : status === "ready" && !images.length ? "No verified artwork matches. Your existing artwork is still available." : "Preview each image below, then save the anime to publish your selection."}</p>
    {!!images.length && <div className="mt-3 grid max-h-96 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">{images.map((image) => <button key={image.url} type="button" aria-pressed={value.cardImageUrl === image.url && Boolean(value.artworkLocked)} className={`overflow-hidden rounded-xl border text-left ${value.cardImageUrl === image.url ? "border-cyan-300" : "border-white/10"}`} onClick={() => onChange({ cardImageUrl: image.url, detailImageUrl: image.url, artworkLocked: true, focalX: 50, focalY: 50 })}>
      <img src={image.url} alt={image.label} loading="lazy" className="aspect-[3/4] w-full bg-zinc-900 object-contain" onLoad={(event) => { const imageElement = event.currentTarget; setDimensions((previous) => ({ ...previous, [image.url]: `${imageElement.naturalWidth} × ${imageElement.naturalHeight}` })); }} onError={() => setDimensions((previous) => ({ ...previous, [image.url]: "Unavailable" }))} />
      <span className="block p-2 text-[11px] text-zinc-400">{image.label}<br />{dimensions[image.url] ?? "Loading…"}</span>
    </button>)}</div>}
    {value.cardImageUrl && <div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="mb-2 text-xs text-zinc-400">Card crop · click to position, or use the controls</p><button type="button" aria-label="Position artwork focus" className="relative block aspect-square w-full overflow-hidden rounded-xl border border-white/10" onClick={(event) => { const rect = event.currentTarget.getBoundingClientRect(); if (event.detail) onChange({ focalX: Math.round((event.clientX - rect.left) / rect.width * 100), focalY: Math.round((event.clientY - rect.top) / rect.height * 100), artworkLocked: true }); }}>
      <img src={value.cardImageUrl} alt={`${title} card crop preview`} className="h-full w-full object-cover" style={{ objectPosition: `${x}% ${y}%` }} /><span aria-hidden="true" className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-200 bg-black/30" style={{ left: `${x}%`, top: `${y}%` }} />
    </button></div><div><p className="mb-2 text-xs text-zinc-400">Detail view · full artwork</p><img src={value.detailImageUrl || value.cardImageUrl} alt={`${title} detail preview`} className="aspect-[3/4] max-h-56 w-full rounded-xl bg-zinc-900 object-contain" />
      {([['Horizontal', 'focalX', x], ['Vertical', 'focalY', y]] as const).map(([label, field, current]) => <div key={field} className="mt-3 flex items-center justify-between gap-2 text-xs"><span>{label} · {current}%</span><div className="flex gap-2"><button type="button" aria-label={`Decrease ${label.toLowerCase()} position`} className="editor-secondary-button" onClick={() => onChange({ [field]: Math.max(0, current - 5), artworkLocked: true })}>−</button><button type="button" aria-label={`Increase ${label.toLowerCase()} position`} className="editor-secondary-button" onClick={() => onChange({ [field]: Math.min(100, current + 5), artworkLocked: true })}>+</button></div></div>)}
    </div></div>}
    <div className="mt-4 flex flex-wrap gap-2"><button type="button" className="editor-secondary-button" aria-pressed={Boolean(value.artworkLocked)} onClick={() => onChange({ artworkLocked: !value.artworkLocked })}>{value.artworkLocked ? "Protected selection" : "Allow catalog refresh"}</button><button type="button" className="editor-text-button" onClick={() => onChange({ focalX: 50, focalY: 50 })}>Center crop</button></div>
  </section>;
}

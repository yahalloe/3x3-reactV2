import { useEffect, useId, useState, type ReactNode } from "react";
import type { Anime } from "../../content/ContentProvider";
import { positionIsAvailable } from "../../lib/adminModel";

export function Cover({ src, title, className = "" }: { src?: string | null; title: string; className?: string }) {
  return <img src={src || "/anime/question.webp"} alt={title} className={`bg-zinc-800 object-cover ${className}`} onError={(event) => {
    if (event.currentTarget.getAttribute("src") !== "/anime/question.webp") event.currentTarget.src = "/anime/question.webp";
  }} />;
}

export function Field({ label, value, onChange, type = "text", required = true, autoComplete }: {
  label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; autoComplete?: string;
}) {
  return <label className="editor-label">{label}<input className="admin-input mt-1.5" type={type} value={value} required={required} autoComplete={autoComplete} onChange={(event) => onChange(event.target.value)} /></label>;
}

export function TextArea({ label, value, onChange, rows = 5 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return <label className="editor-label">{label}<textarea className="admin-input mt-1.5 resize-y" rows={rows} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

export function SectionTitle({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="mb-5"><h2 className="text-xl font-bold text-white">{title}</h2>{children && <p className="mt-1.5 text-sm leading-6 text-zinc-400">{children}</p>}</div>;
}

export function AnimeLibrary({ anime, selectedId, onSelect, onNew }: { anime: Anime[]; selectedId: string; onSelect: (entry: Anime) => void; onNew?: () => void }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const matches = anime.filter((entry) => entry.title.toLowerCase().includes(query.toLowerCase()));
  return <aside className="admin-panel min-w-0 self-start p-3!">
    <div className="mb-3 flex items-center justify-between px-1"><h2 className="text-sm!">Your shows <span className="ml-1 font-normal text-zinc-500">{anime.length}</span></h2>{onNew && <button type="button" className="editor-text-button" onClick={onNew}>+ Add anime</button>}</div>
    <label className="sr-only" htmlFor={id}>Filter your shows</label><input id={id} className="admin-input mb-3 text-sm" type="search" value={query} placeholder="Filter your shows…" onChange={(event) => setQuery(event.target.value)} />
    <div className="flex gap-2 overflow-x-auto pb-2 lg:grid lg:max-h-[calc(100dvh-19rem)] lg:overflow-y-auto lg:pr-1">
      {matches.map((entry, index) => <button type="button" key={`${entry.id}:${index}`} aria-pressed={selectedId === entry.id} onClick={() => onSelect(entry)} className={`flex w-56 shrink-0 items-center gap-3 rounded-xl p-2 text-left transition lg:w-auto ${selectedId === entry.id ? "bg-cyan-300/10 ring-1 ring-inset ring-cyan-300/40" : "hover:bg-white/5"}`}>
        <Cover src={entry.cardImageUrl} title="" className="h-14 w-10 shrink-0 rounded-md" /><span className="min-w-0"><span className="line-clamp-2 text-sm font-semibold">{entry.title}</span><span className="mt-1 block text-[11px] capitalize text-zinc-500">{entry.collectionSlug} · {entry.isPublished ? "Published" : "Draft"}</span></span>
      </button>)}
      {!matches.length && <p className="px-2 py-5 text-sm text-zinc-500">No shows match your search.</p>}
    </div>
  </aside>;
}

const locations = ["Top left", "Top center", "Top right", "Middle left", "Center", "Middle right", "Bottom left", "Bottom center", "Bottom right"];

export function PositionPicker({ items, currentId, value, onChange }: {
  items: { id: string; sortOrder: number; title: string; image: string }[];
  currentId: string; value: number; onChange: (position: number) => void;
}) {
  return <fieldset><legend className="editor-label mb-3">Choose a place in the 3×3</legend>
    <div className="grid max-w-[300px] grid-cols-3 gap-2" aria-label="3 by 3 position picker">
      {locations.map((location, index) => {
        const occupant = items.find((item) => item.sortOrder === index && item.id !== currentId);
        const available = positionIsAvailable(items, index, currentId);
        return <button type="button" key={location} disabled={!available} aria-pressed={value === index} aria-label={`${location}${occupant ? `, occupied by ${occupant.title}` : value === index ? ", selected" : ", available"}`}
          title={occupant ? `Occupied: ${occupant.title}` : location} onClick={() => onChange(index)}
          className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${value === index && available ? "border-cyan-300 bg-cyan-300/15 ring-2 ring-cyan-300/20" : "border-white/10 bg-zinc-900 enabled:hover:border-cyan-300/70"}`}>
          {occupant ? <><Cover src={occupant.image} title="" className="absolute inset-0 h-full w-full opacity-35" /><span className="absolute inset-x-1 bottom-1 line-clamp-2 text-[10px] leading-3 text-zinc-200">{occupant.title}</span><span aria-hidden="true" className="relative text-xl">▣</span></>
            : <span className={value === index ? "text-2xl text-cyan-300" : "text-xl text-zinc-600"} aria-hidden="true">{value === index ? "✓" : "+"}</span>}
        </button>;
      })}
    </div><p className="mt-3 text-xs leading-5 text-zinc-400">{value >= 0 ? `Selected: ${locations[value] ?? "choose a valid place"}.` : "This collection is full. Choose another collection or move an existing show."} Occupied places are locked.</p>
  </fieldset>;
}

export interface SaveNotice { kind: "saving" | "success" | "error"; message: string }
export function SaveToast({ notice, onDismiss }: { notice: SaveNotice | null; onDismiss: () => void }) {
  useEffect(() => {
    if (notice?.kind !== "success") return;
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [notice, onDismiss]);
  if (!notice) return null;
  return <div className={`fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2.5rem)] items-start gap-3 rounded-2xl border p-4 shadow-2xl sm:w-96 ${notice.kind === "error" ? "border-red-400/50 bg-red-950" : "border-cyan-300/30 bg-zinc-900"}`} role={notice.kind === "error" ? "alert" : "status"} aria-live="polite">
    {notice.kind === "saving" ? <span aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" /> : <span aria-hidden="true" className={notice.kind === "success" ? "text-cyan-300" : "text-red-300"}>{notice.kind === "success" ? "✓" : "!"}</span>}
    <p className="flex-1 text-sm leading-6">{notice.message}</p>{notice.kind !== "saving" && <button type="button" aria-label="Dismiss notification" onClick={onDismiss} className="px-1 text-zinc-400 hover:text-white">×</button>}
  </div>;
}

import { useEffect, useId, useRef, useState } from "react";
import { animeImportFields, searchJikanAnime, type JikanSearchResult } from "../lib/jikan";
import { Cover } from "./admin/EditorControls";

export function JikanAnimePicker({ onSelect }: { onSelect: (anime: JikanSearchResult) => void }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JikanSearchResult[]>([]);
  const [selected, setSelected] = useState<JikanSearchResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState("");
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  const input = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void searchJikanAnime(query, controller.signal).then((items) => {
        if (controller.signal.aborted) return;
        // Deduplicate by import identity, including aliases returned by providers.
        const unique = new Map(items.map((entry) => [animeImportFields(entry).slug, entry]));
        setResults([...unique.values()]); setStatus("ready");
      }).catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error && cause.name === "AbortError" ? "Search took too long. Please retry." : cause instanceof Error ? cause.message : "Search is unavailable. Please retry.");
        setStatus("error");
      });
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, retry]);

  const search = (value: string) => {
    setQuery(value); setSelected(null); setResults([]); setError("");
    setStatus(value.trim().length >= 2 ? "loading" : "idle");
  };
  const choose = (entry: JikanSearchResult) => { setSelected(entry); onSelect(entry); input.current?.focus(); };

  return <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-4">
    <label htmlFor={`${id}-search`} className="text-sm font-semibold text-cyan-200">Search & add anime</label>
    <div className="relative mt-2"><span aria-hidden="true" className="pointer-events-none absolute left-3 top-2.5 text-zinc-500">⌕</span><input ref={input} id={`${id}-search`} type="search" className="admin-input pl-9!" placeholder="Start typing an anime title…" autoComplete="off" value={query} aria-describedby={`${id}-status`} aria-controls={`${id}-suggestions`} onChange={(event) => search(event.target.value)} onKeyDown={(event) => {
      if (event.key === "ArrowDown" && !selected && results.length) { event.preventDefault(); options.current[0]?.focus(); }
      if (event.key === "Enter") { event.preventDefault(); if (!selected && status === "ready" && results[0]) choose(results[0]); }
      if (event.key === "Escape") { setSelected(null); input.current?.blur(); }
    }} /></div>
    <p id={`${id}-status`} role="status" className="mt-2 text-xs leading-5 text-zinc-400">
      {selected ? `Selected ${selected.title}. Images and synopsis have been filled in.` : status === "idle" ? "Type at least 2 characters. Suggestions appear as you type." : status === "loading" ? "Finding recommendations…" : status === "ready" ? results.length ? `${results.length} suggested matches. Pick a cover to add it.` : "No matches found. Try another title." : error}
    </p>
    {status === "idle" && <div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-xs text-zinc-500">Try</span>{["Your Name", "Frieren", "Hyouka"].map((title) => <button type="button" key={title} onClick={() => search(title)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:border-cyan-300/50 hover:text-cyan-200">{title}</button>)}</div>}
    {status === "loading" && <div className="mt-4 flex animate-pulse items-center gap-3 rounded-xl bg-white/5 p-3" aria-hidden="true"><div className="h-16 w-11 rounded bg-white/10" /><div className="grid flex-1 gap-3"><div className="h-3 w-3/4 rounded bg-white/10" /><div className="h-2 w-1/2 rounded bg-white/5" /></div></div>}
    {status === "error" && <button type="button" className="editor-text-button mt-2" onClick={() => { setStatus("loading"); setRetry((value) => value + 1); }}>Retry search</button>}
    {status === "ready" && !selected && results.some((entry) => entry.source === "kitsu") && <p className="mt-2 text-[11px] text-zinc-500">Using Kitsu while Jikan search is unavailable.</p>}
    <ul id={`${id}-suggestions`} aria-label="Anime suggestions" className="mt-3 grid max-h-80 gap-2 overflow-y-auto overscroll-contain">
      {!selected && status === "ready" && results.map((entry, index) => <li key={animeImportFields(entry).slug}>
        <button ref={(element) => { options.current[index] = element; }} type="button" aria-label={`Select ${entry.title}, ${entry.type ?? "anime"}${entry.year ? `, ${entry.year}` : ""}`} className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-zinc-950/50 p-2.5 text-left transition hover:border-cyan-300/50 hover:bg-cyan-300/5 focus-visible:outline-2 focus-visible:outline-cyan-300" onClick={() => choose(entry)} onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); options.current[(index + 1) % results.length]?.focus(); }
          if (event.key === "ArrowUp") { event.preventDefault(); if (!index) input.current?.focus(); else options.current[index - 1]?.focus(); }
          if (event.key === "Escape") input.current?.focus();
        }}>
          <Cover src={entry.imageUrl} title="" className="h-20 w-14 shrink-0 rounded-lg" /><span className="min-w-0 flex-1"><span className="line-clamp-2 text-sm font-bold text-white">{entry.title}</span><span className="mt-1 block text-xs uppercase text-cyan-200/70">{entry.type ?? "Anime"}{entry.year ? ` · ${entry.year}` : ""}</span><span className="mt-1.5 line-clamp-2 text-xs leading-5 text-zinc-500">{entry.synopsis ?? "Select this anime to fill the available details."}</span></span><span aria-hidden="true" className="mr-1 text-xl text-cyan-300">+</span>
        </button>
      </li>)}
    </ul>
    {selected && <div className="mt-3 flex items-center gap-3 rounded-xl bg-cyan-300/10 p-3"><Cover src={selected.imageUrl} title="" className="h-20 w-14 rounded-lg" /><div className="min-w-0 flex-1"><p className="text-sm font-bold">{selected.title}</p><p className="mt-1 text-xs text-cyan-200">✓ Added to your draft</p>{(!selected.imageUrl || !selected.synopsis) && <p className="mt-1 text-xs text-zinc-400">Some details are missing. You can fill them in below.</p>}</div><button type="button" className="editor-text-button" onClick={() => { setSelected(null); input.current?.focus(); }}>Change</button></div>}
  </div>;
}

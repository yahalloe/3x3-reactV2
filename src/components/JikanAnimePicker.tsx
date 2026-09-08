import { useEffect, useId, useState } from "react";
import { animeImportFields, searchJikanAnime, type JikanSearchResult } from "../lib/jikan";

export function JikanAnimePicker({ onSelect }: { onSelect: (anime: JikanSearchResult) => void }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JikanSearchResult[]>([]);
  const [selected, setSelected] = useState<JikanSearchResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (query.trim().length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void searchJikanAnime(query, controller.signal).then((items) => {
        if (controller.signal.aborted) return;
        setResults(items);
        setStatus("ready");
      }).catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        const detail = cause instanceof Error ? cause.message : "Unknown error";
        setError(detail.includes("504") || detail.includes("502") || detail.includes("503")
          ? "Jikan could not reach MyAnimeList. Try another title or retry shortly."
          : detail.includes("429")
            ? "Jikan's request limit was reached. Wait a moment, then retry."
            : cause instanceof Error && cause.name === "AbortError"
              ? "Jikan took too long to respond. Please retry."
              : `Anime search failed: ${detail}. Please retry.`);
        setStatus("error");
      });
    }, 450);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, retry]);

  return (
    <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-4">
      <label htmlFor={`${id}-search`} className="text-sm font-medium text-cyan-200">Find anime</label>
      <input
        id={`${id}-search`}
        type="search"
        className="admin-input mt-2 w-full"
        placeholder="Search an anime title…"
        autoComplete="off"
        value={query}
        aria-describedby={`${id}-status`}
        onChange={(event) => {
          setQuery(event.target.value);
          setResults([]);
          setSelected(null);
          setStatus(event.target.value.trim().length >= 2 ? "loading" : "idle");
        }}
        onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault(); }}
      />
      <p id={`${id}-status`} role="status" className="mt-2 text-xs text-zinc-400">
        {status === "idle" && "Type at least 2 characters, then choose a result to fill the form."}
        {status === "loading" && "Searching anime…"}
        {status === "ready" && (results.length ? `${results.length} results. Choose the series or season you want.` : "No anime found. Try another title.")}
        {status === "error" && error}
      </p>
      {status === "ready" && results.some((entry) => entry.source === "kitsu") && <p className="mt-2 text-xs text-cyan-200">Jikan search is unavailable. Showing results from Kitsu.</p>}
      {status === "error" && <button type="button" className="mt-2 text-sm text-cyan-300 hover:underline" onClick={() => { setStatus("loading"); setRetry((value) => value + 1); }}>Retry search</button>}
      {status === "ready" && results.length > 0 && (
        <label className="mt-4 block text-sm text-zinc-300">
          Select anime
          <select className="admin-input mt-1 w-full" value={selected ? animeImportFields(selected).slug : ""} onChange={(event) => {
            const anime = results.find((entry) => animeImportFields(entry).slug === event.target.value);
            if (!anime) return;
            setSelected(anime);
            onSelect(anime);
          }}>
            <option value="" disabled>Choose an anime…</option>
            {results.map((entry) => <option key={animeImportFields(entry).slug} value={animeImportFields(entry).slug}>{entry.title} · {entry.type ?? "Anime"}{entry.year ? ` · ${entry.year}` : ""}</option>)}
          </select>
        </label>
      )}
      {selected && <p role="status" className="mt-3 text-xs text-cyan-200">
        Filled in {selected.title}. Review the fields below, then save.
        {!selected.imageUrl && " No cover image was provided; add an image URL below."}
        {!selected.synopsis && " No synopsis was provided; you can write one below."}
      </p>}
    </div>
  );
}

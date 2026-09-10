import { FormattingToolbar } from "./FormattingToolbar";
import { useRef, useState } from "react";
import { OpinionText } from "../OpinionText";
import { type Anime, useContent } from "../../content/ContentProvider";
import { supabase } from "../../lib/supabase";
import { AnimeLibrary, Cover, SectionTitle } from "./EditorControls";

export function EditorialComments({ busy, runAction }: { busy: boolean; runAction: (saving: string, success: string, action: () => Promise<void>) => Promise<void> }) {
  const { anime, refresh } = useContent();
  const [selectedId, setSelectedId] = useState(anime[0]?.id ?? "");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const textarea = useRef<HTMLTextAreaElement>(null);
  const selected = anime.find((entry) => entry.id === selectedId) ?? anime[0];
  const commentId = selected?.id ?? "";
  const saved = typeof selected?.editorNote === "string" ? selected.editorNote : "";
  const draft = drafts[commentId] ?? saved;
  const format = (marker: string, block = false) => {
    const field = textarea.current;
    if (!field) return;
    const start = block ? draft.lastIndexOf("\n", field.selectionStart - 1) + 1 : field.selectionStart;
    const end = field.selectionEnd;
    const selected = draft.slice(start, end) || "text";
    const replacement = block ? selected.split("\n").map((line) => marker + line).join("\n") : marker + selected + marker;
    setDrafts((current) => ({ ...current, [commentId]: draft.slice(0, start) + replacement + draft.slice(end) }));
    requestAnimationFrame(() => { field.focus(); field.setSelectionRange(start + marker.length, start + replacement.length - (block ? 0 : marker.length)); });
  };
  const choose = (entry: Anime) => { setSelectedId(entry.id); };
  const save = () => {
    if (!selected) return;
    void runAction("Saving your comment…", "Comment saved to this show.", async () => {
      if (!supabase) throw new Error("The content service is not configured.");
      const result = await supabase.from("anime").update({ editor_note: draft.trim() }).eq("id", selected.id).select("id").single();
      if (result.error) throw result.error;
      await refresh();
      setDrafts((current) => ({ ...current, [selected.id]: draft.trim() }));
    });
  };
  return <div className="editor-columns"><AnimeLibrary anime={anime} selectedId={commentId} onSelect={choose} />
    <section className="admin-panel min-w-0"><SectionTitle title="Your comments">Your personal take on each show, displayed on its public anime page.</SectionTitle>
      {selected ? <>
        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-5"><Cover src={selected.cardImageUrl} title="" className="h-16 w-12 rounded-lg" /><div><p className="text-xs uppercase tracking-wider text-cyan-300">Commenting on</p><h3 className="mt-1 text-lg font-bold">{selected.title}</h3></div></div>
        {saved && <article className="mb-6 flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cyan-300/15 text-sm font-bold text-cyan-300" aria-hidden="true">Y</span><div className="min-w-0 flex-1 border-l border-white/10 pl-4"><p className="text-xs"><strong>Yahallo</strong><span className="ml-2 rounded bg-cyan-300/10 px-1.5 py-0.5 text-cyan-300">Author</span><span className="ml-2 text-zinc-500">Published comment</span></p><div className="mt-3 text-sm leading-7 text-zinc-300"><OpinionText text={saved} /></div><button type="button" onClick={() => { textarea.current?.focus(); }} className="editor-text-button mt-3">✎ Edit comment</button></div></article>}
        <form onSubmit={(event) => { event.preventDefault(); save(); }}>
          <div className="overflow-hidden rounded-2xl border border-white/15 bg-zinc-900/50">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><label htmlFor="comment-draft" className="text-sm font-semibold">{saved ? "Edit your comment" : "Add your take"}</label></div>
            <FormattingToolbar onFormat={format} />
            <textarea ref={textarea} id="comment-draft" aria-label="Your comment" className="min-h-48 w-full resize-y bg-transparent p-4 text-sm leading-7 outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-300/30" placeholder="What stayed with you about this show?" value={draft} onChange={(event) => setDrafts((current) => ({ ...current, [commentId]: event.target.value }))} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); if (!busy) save(); } }} />
            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3"><span className="text-xs text-zinc-500">{draft.length} characters · Ctrl / ⌘ + Enter to save</span><button className="admin-button" disabled={busy || draft.trim() === saved}>{busy ? "Saving…" : saved ? "Save comment" : "Post comment"}</button></div>
          </div>
        </form>
      </> : <p className="text-sm text-zinc-400">Save an anime first, then select it to write a comment.</p>}
    </section>
  </div>;
}

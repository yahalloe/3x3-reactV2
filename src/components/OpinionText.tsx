import type { ReactNode } from "react";

function inline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{inline(part.slice(2, -2))}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith("~~") && part.endsWith("~~")) return <s key={index}>{inline(part.slice(2, -2))}</s>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index} className="rounded bg-white/10 px-1">{part.slice(1, -1)}</code>;
    return part;
  });
}

// Render only supported formatting as React nodes; saved HTML remains inert text.
export function OpinionText({ text }: { text: string }) {
  return <div className="whitespace-pre-wrap break-words">{text.split("\n").map((line, index) =>
    line.startsWith("> ") ? <blockquote key={index} className="my-2 border-l-2 border-cyan-300/50 pl-4 text-zinc-400">{inline(line.slice(2))}</blockquote>
      : line.startsWith("- ") ? <div key={index} className="flex gap-2"><span aria-hidden="true">•</span><span>{inline(line.slice(2))}</span></div>
        : <div key={index} className="min-h-[1lh]">{inline(line)}</div>)}</div>;
}

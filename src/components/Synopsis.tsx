import { useId, useState } from "react";

export function Synopsis({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return <><p id={id} className={`mt-3 whitespace-pre-line text-lg leading-8 text-zinc-200 sm:text-xl ${expanded ? "" : "line-clamp-2"}`}>{text}</p>
    <button type="button" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(!expanded)} className="mt-3 text-sm font-semibold text-cyan-300 hover:underline">{expanded ? "Show less" : "Click more"}</button></>;
}

import { useId, useState } from "react";

export function Synopsis({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const long = text.length > 450;
  return <><p id={id} className={`reading-copy mt-3 whitespace-pre-line text-base leading-8 text-zinc-200 ${expanded || !long ? "" : "line-clamp-6"}`}>{text}</p>
    {long && <button type="button" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(!expanded)} className="text-link mt-3">{expanded ? "Show less" : "Read full synopsis"}</button>}</>;
}

import { useId } from "react";

const actions = [
  { label: "Bold", marker: "**", icon: <path d="M7 4h6a4 4 0 0 1 0 8H7m0 0h7a4 4 0 0 1 0 8H7V4" /> },
  { label: "Italic", marker: "*", icon: <path d="M11 4h9M4 20h9M16 4 8 20" /> },
  { label: "Strikethrough", marker: "~~", icon: <path d="M17 6c-1-3-10-3-10 1 0 2 3 3 5 3m-6 7c1 4 12 4 12-1 0-2-3-3-5-3M3 12h18" /> },
  { label: "Code", marker: "`", icon: <path d="m7 7-5 5 5 5m10-10 5 5-5 5M14 4l-4 16" /> },
  { label: "Quote", marker: "> ", icon: <path d="M4 5h6v7H4V5Zm0 7c0 5 2 7 6 7M14 5h6v7h-6V5Zm0 7c0 5 2 7 6 7" /> },
  { label: "Bullet list", marker: "- ", icon: <><path d="M9 6h12M9 12h12M9 18h12" /><circle cx="3" cy="6" r="1" /><circle cx="3" cy="12" r="1" /><circle cx="3" cy="18" r="1" /></> },
];

export function FormattingToolbar({ onFormat }: { onFormat: (marker: string, block: boolean) => void }) {
  const id = useId();
  return <div role="toolbar" aria-label="Text formatting" className="flex flex-wrap gap-1 border-b border-white/10 p-2">
    {actions.map(({ label, marker, icon }, index) => <div key={label} className="group relative">
      <button type="button" aria-label={label} aria-describedby={`${id}-${index}`} onMouseDown={(event) => event.preventDefault()} onClick={() => onFormat(marker, marker.endsWith(" "))}
        className="grid h-10 w-10 place-items-center rounded-full text-zinc-300 transition hover:bg-white/10 hover:text-cyan-300 focus-visible:outline-2 focus-visible:outline-cyan-300">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">{icon}</svg>
      </button>
      <span id={`${id}-${index}`} role="tooltip" className="pointer-events-none absolute left-1/2 bottom-full z-30 mb-2 invisible opacity-0 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/15 bg-zinc-950 px-2.5 py-1.5 text-xs text-white shadow-lg translate-y-1 transition-[opacity,translate,visibility] duration-150 ease-out delay-0 motion-reduce:transition-none motion-reduce:translate-y-0 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-hover:delay-[400ms] group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:delay-[400ms]">
        <span aria-hidden="true" className="absolute left-1/2 bottom-0 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45 border-r border-b border-white/15 bg-zinc-950" />
        <span className="relative">{label}</span>
      </span>
    </div>)}
  </div>;
}

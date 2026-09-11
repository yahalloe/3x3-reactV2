import { useState } from "react";
import { ArtworkPlaceholder } from "./ArtworkPlaceholder";

type Props = { sources: (string | null | undefined)[]; title: string; fit?: "cover" | "contain"; focalX?: number; focalY?: number; priority?: boolean; lazy?: boolean; className?: string };
/** One browser image request, not a provider lookup or a resolution contest. */
export function SavedArtwork(props: Props) {
  const sources = [...new Set(props.sources.filter((url): url is string => Boolean(url)))];
  return <ArtworkImage key={JSON.stringify(sources)} {...props} sources={sources} />;
}
function ArtworkImage({ sources, title, fit = "cover", focalX = 50, focalY = 50, priority = false, lazy = false, className = "aspect-square" }: Props) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<string>();
  const source = sources[index] || undefined;
  return <div className={`relative overflow-hidden bg-zinc-900 ${className}`}>
    {loaded !== source || !source ? <div className="absolute inset-0"><ArtworkPlaceholder loading={Boolean(source)} className="h-full w-full" /></div> : null}
    {source && <img src={source} alt={title} decoding="async" loading={lazy ? "lazy" : "eager"} fetchPriority={priority ? "high" : "auto"}
      onLoad={() => setLoaded(source)} onError={() => setIndex((current) => current + 1)}
      style={{ objectPosition: `${focalX}% ${focalY}%` }}
      className={`absolute inset-0 h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"} ${loaded === source ? "opacity-100" : "opacity-0"}`} />}
  </div>;
}

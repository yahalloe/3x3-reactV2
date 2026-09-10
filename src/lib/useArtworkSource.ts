import { useEffect, useState } from "react";
import { sharpestArtwork, type ArtworkSize } from "./artworkQuality";

// Share measurements across cards/detail pages; use the browser's image cache.
const measurements = new Map<string, Promise<ArtworkSize | null>>();
function measure(url: string) {
  const cached = measurements.get(url);
  if (cached) return cached;
  const pending = new Promise<ArtworkSize | null>((resolve) => {
    const image = new Image();
    const finish = (result: ArtworkSize | null) => {
      clearTimeout(timeout);
      image.onload = image.onerror = null;
      if (!result) measurements.delete(url);
      resolve(result);
    };
    const timeout = setTimeout(() => finish(null), 15000);
    image.onload = () => finish({ url, width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => finish(null);
    image.src = url;
  });
  measurements.set(url, pending);
  return pending;
}

export function useArtworkSource(sources: (string | null | undefined)[], fit: "cover" | "contain" = "cover") {
  const key = JSON.stringify([...new Set(sources.filter((url): url is string => Boolean(url)))]);
  const [result, setResult] = useState<{ key: string; fit: string; url?: string }>();
  useEffect(() => {
    let active = true;
    const urls: string[] = JSON.parse(key);
    const loaded = new Map<string, ArtworkSize>();
    let remaining = urls.length;
    for (const url of urls) {
      void measure(url).then((size) => {
        if (!active) return;
        remaining--;
        if (size) loaded.set(url, size);
        // Original ordering wins equal-resolution ties, preserving editorial choices.
        const images = urls.flatMap((candidate) => loaded.has(candidate) ? [loaded.get(candidate)!] : []);
        if (images.length || !remaining) setResult({ key, fit, url: sharpestArtwork(images, fit) });
      });
    }
    return () => { active = false; };
  }, [key, fit]);
  return result?.key === key && result.fit === fit ? result.url : (JSON.parse(key) as string[])[0];
}

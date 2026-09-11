import { useEffect, useState } from "react";
import { preferredArtwork, type ArtworkSize } from "./artworkQuality";

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
    image.onload = () => {
      void image.decode().then(
        () => finish({ url, width: image.naturalWidth, height: image.naturalHeight }),
        () => finish(null),
      );
    };
    image.onerror = () => finish(null);
    image.src = url;
  });
  measurements.set(url, pending);
  return pending;
}

export function useArtworkSource(sources: (string | null | undefined)[], fit: "cover" | "contain" = "cover", ready = true, apiUrl?: string | null, locked = false) {
  const key = JSON.stringify([...new Set(sources.filter((url): url is string => Boolean(url)))]);
  const selectionKey = JSON.stringify([key, fit, apiUrl, locked]);
  const [result, setResult] = useState<{ key: string; url?: string }>();
  useEffect(() => {
    if (!ready) return;
    let active = true;
    const urls: string[] = JSON.parse(key);
    // Commit once, only after every candidate is loaded/decoded or has failed.
    // A placeholder remains visible throughout API lookup and selection.
    void Promise.all(urls.map(measure)).then((sizes) => {
      if (active) setResult({ key: selectionKey, url: locked ? sizes.find((size) => size !== null)?.url : preferredArtwork(sizes.filter((size): size is ArtworkSize => size !== null), apiUrl, fit) });
    });
    return () => { active = false; };
  }, [key, fit, ready, apiUrl, selectionKey, locked]);
  const loading = !ready || result?.key !== selectionKey;
  return { source: loading ? undefined : result?.url, loading };
}

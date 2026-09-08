// components/utils/prefetchImages.ts
const prefetched = new Set<string>();

export function prefetchImages(urls: string[]) {
  urls.forEach((url) => {
    if (!prefetched.has(url)) {
      const img = new Image();
      img.src = url;
      prefetched.add(url);
    }
  });
}
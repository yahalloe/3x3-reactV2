export interface ArtworkSize { url: string; width: number; height: number }

/** Pixels available after a square card crop or inside a 3:4 detail frame. */
export function sharpestArtwork(images: ArtworkSize[], fit: "cover" | "contain" = "cover") {
  const density = (image: ArtworkSize) => fit === "cover"
    ? Math.min(image.width, image.height)
    : Math.max(image.width / 3, image.height / 4);
  return images.filter((image) => image.width > 0 && image.height > 0)
    .reduce<ArtworkSize | undefined>((best, image) =>
      !best || density(image) > density(best) ? image : best, undefined)?.url;
}

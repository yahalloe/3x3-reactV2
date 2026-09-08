import type { JikanSearchResult } from "./jikan";

interface KitsuEntry {
  id: string;
  attributes?: {
    canonicalTitle?: string;
    titles?: { en?: string; en_jp?: string };
    synopsis?: string | null;
    subtype?: string;
    startDate?: string | null;
    posterImage?: { original?: string; large?: string; medium?: string } | null;
  };
  relationships?: { mappings?: { data?: { type: string; id: string }[] } };
}

export async function searchKitsuAnime(
  query: string,
  signal?: AbortSignal,
): Promise<JikanSearchResult[]> {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.throwIfAborted();
  signal?.addEventListener("abort", cancel, { once: true });
  const timeout = setTimeout(cancel, 15000);
  try {
    const params = new URLSearchParams({
      "filter[text]": query,
      "page[limit]": "10",
      include: "mappings",
      "fields[anime]":
        "titles,canonicalTitle,synopsis,posterImage,subtype,startDate,mappings",
      "fields[mappings]": "externalSite,externalId",
    });
    const response = await fetch(`https://kitsu.app/api/edge/anime?${params}`, {
      signal: controller.signal,
    });
    if (!response.ok)
      throw new Error(`Kitsu search failed (${response.status})`);
    const body = (await response.json()) as {
      data?: KitsuEntry[];
      included?: {
        id: string;
        type: string;
        attributes?: { externalSite?: string; externalId?: string };
      }[];
    };
    signal?.throwIfAborted();
    if (!Array.isArray(body.data))
      throw new Error("Invalid Kitsu search response");
    const mappings = new Map(
      (body.included ?? [])
        .filter(
          (item) =>
            item.type === "mappings" &&
            item.attributes?.externalSite === "myanimelist/anime",
        )
        .map((item) => [item.id, Number(item.attributes?.externalId)]),
    );
    return body.data
      .filter(
        (entry) => /^\d+$/.test(entry.id) && entry.attributes?.canonicalTitle,
      )
      .map((entry) => {
        const attributes = entry.attributes!;
        const mappedId = entry.relationships?.mappings?.data
          ?.map((mapping) => mappings.get(mapping.id))
          .find(
            (value) =>
              value !== undefined && Number.isSafeInteger(value) && value > 0,
          );
        const year = Number(attributes.startDate?.slice(0, 4));
        return {
          malId: mappedId ?? null,
          source: "kitsu",
          kitsuId: entry.id,
          title: attributes.titles?.en || attributes.canonicalTitle!,
          type: attributes.subtype ?? null,
          year: Number.isInteger(year) && year > 0 ? year : null,
          imageUrl:
            attributes.posterImage?.original ||
            attributes.posterImage?.large ||
            attributes.posterImage?.medium ||
            null,
          synopsis: attributes.synopsis?.trim() || null,
        };
      });
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", cancel);
  }
}

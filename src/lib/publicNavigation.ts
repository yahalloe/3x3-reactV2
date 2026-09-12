export function collectionPath(slug: string) {
  return slug === "favorites" ? "/" : ["romcom", "drama", "music"].includes(slug) ? `/${slug}` : `/collection/${slug}`;
}
export function activeSection(path: string, collection?: string) {
  if (path === "/about") return "about";
  const slug = collection || (path.startsWith("/collection/") ? path.split("/")[2] : path.slice(1));
  if (slug === "romcom" || slug === "drama") return slug;
  if (path === "/" || slug === "favorites") return "archive";
  return collection || path === "/collections" || path === "/music" || path.startsWith("/collection/") ? "collections" : undefined;
}
export const canonicalSlug = (slug: string) => ({ madeInAbyss1: "made-in-abyss", hunter: "hunter-x-hunter", bunnyGirl: "bunny-girl-senpai", "86": "86-eighty-six", bokuyaba: "the-dangers-in-my-heart", tamako: "tamako-love-story", kaguyasama: "kaguya-sama", goldenTime: "golden-time", maomao: "the-apothecary-diaries", sakuraSou: "sakurasou", rere: "re-creators" } as Record<string, string>)[slug] ?? slug;

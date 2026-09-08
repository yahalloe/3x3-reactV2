import { useEffect, useState } from "react";
import { getJikanAnime, type JikanAnime } from "./jikan";

export function useJikanAnime(slug: string, title: string) {
  const [result, setResult] = useState<{ key: string; data: JikanAnime | null } | null>(null);
  const key = JSON.stringify([slug, title]);

  useEffect(() => {
    let active = true;
    void getJikanAnime(slug, title).then((data) => {
      if (active) setResult({ key, data });
    });
    return () => { active = false; };
  }, [slug, title, key]);

  return result?.key === key ? result.data : null;
}

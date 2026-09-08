import { BackButton } from "./BackButton";
import { MainContainer } from "./MainContainer";
import { musicList } from "./animeData";

export function MusicBody() {
  return (
    <section className="page-surface">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-9 flex flex-col gap-4 sm:mb-11 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="section-label mb-3">Genre collection</p><h2 className="text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">The music shelf</h2></div>
          <p className="max-w-sm text-sm leading-6 text-zinc-400 sm:text-right">Shows where the soundtrack, performance, and feeling are all part of the story.</p>
        </div>
        <MainContainer list={musicList}/>
        <div className="pt-10"><BackButton /></div>
      </div>
    </section>
  );
}

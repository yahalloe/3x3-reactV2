import { animeList } from "./animeData";
import { MainContainer } from "./MainContainer";

export function Body() {
  return (
    <section className="page-surface">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-9 flex flex-col gap-4 sm:mb-11 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-label mb-3">The essential nine</p>
            <h2 className="text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">All-time favorites</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-zinc-400 sm:text-right">Nine shows I keep returning to—for their stories, their worlds, and the feelings they leave behind.</p>
        </div>
        <MainContainer list={animeList}/>
      </div>
    </section>
  )
}

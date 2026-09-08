import { BackButton } from "../components/BackButton";

export function AboutmeBody() {
  return (
    <main className="page-surface min-h-[65vh]">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="section-label mb-5">Behind the list</p>
        <div className="border-l-2 border-cyan-400 pl-5 text-lg leading-8 text-zinc-300 sm:text-xl sm:leading-9">
          <p>
            Hello, I am Yahallo. I am a huge anime fan and I have been watching
            anime for around 5 years now. I have watched over 400 or so anime
            series and movies. I have a deep love for the art and storytelling of
            anime. I created this site to share my top nine favorite anime series
            of all time. I hope you enjoy my selections and find some new
            favorites to watch!
          </p>
          <p className="pt-6">I was such a weeb that I even studied Japanese.</p>
          <p className="pt-6">I also made an open-source anime picker that lets you find something to rewatch from your own list. If you're interested, check it out <a href="https://animepicker.yahallo.tech" target="_blank" rel="noreferrer" className="font-bold text-cyan-300 transition hover:text-cyan-200">here</a>.</p>
          <p className="pt-6">
            Feel free to reach out to me on{" "}
            <a className="font-bold text-cyan-300 transition hover:text-cyan-200" href="https://github.com/yahalloe" target="_blank" rel="noopener noreferrer">Github.</a>
          </p>
        </div>
        <div className="pt-10">
          <BackButton />
        </div>
      </div>
    </main>
  );
}

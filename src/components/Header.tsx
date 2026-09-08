import { Link, NavLink } from "react-router-dom";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="border-b border-white/10 bg-zinc-950">
      <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="group inline-flex items-center gap-3" aria-label="Go to home">
            <span className="grid grid-cols-3 gap-0.5 rounded-md bg-cyan-400 p-1 shadow-[0_0_28px_rgba(34,211,238,0.2)]">
              {Array.from({ length: 9 }).map((_, index) => <span key={index} className="h-1.5 w-1.5 rounded-[1px] bg-zinc-950" />)}
            </span>
            <span className="font-mono text-xs font-medium tracking-[0.18em] text-zinc-300 transition group-hover:text-white">YAHALLOE</span>
          </Link>
          <nav className="flex items-center gap-1 text-xs font-semibold text-zinc-400 sm:gap-2 sm:text-sm" aria-label="Primary navigation">
            {[["/", "Home"], ["/romcom", "Romcom"], ["/drama", "Drama"], ["/about", "About"]].map(([to, label]) => (
              <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `rounded-full px-2.5 py-2 transition sm:px-3 ${isActive ? "bg-white text-zinc-950" : "hover:bg-white/10 hover:text-white"}`}>{label}</NavLink>
            ))}
          </nav>
        </div>
        <div className="pt-14 pb-7 sm:pt-20 sm:pb-10">
          <p className="section-label mb-4">A personal anime archive · est. 2023</p>
          <h1 className="max-w-4xl text-5xl font-extrabold tracking-[-0.065em] text-zinc-100 sm:text-7xl md:text-8xl">{title}</h1>
          <div className="mt-7 h-px w-full bg-gradient-to-r from-cyan-400 via-cyan-400/25 to-transparent" />
        </div>
      </div>
    </header>
  );
}

import { useNavigate } from "react-router-dom";

export function BackButton() {
  const navigate = useNavigate();

  return (
    <div className="flex items-end">
      <button
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="group relative cursor-pointer gap-1.5 rounded-full border border-white/10 bg-zinc-900 px-3 py-3 text-zinc-300 transition-colors duration-200 hover:border-cyan-300 hover:bg-cyan-300 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 lg:px-4 lg:py-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-arrow-left"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>

        {/* Tooltip */}
        <span
          className="
            absolute left-full ml-3 top-1/2 -translate-y-1/2
            bg-zinc-950 text-zinc-200 text-sm px-2 py-1 rounded
            opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100
            whitespace-nowrap
            before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2
            before:border-4 before:border-transparent before:border-r-zinc-950
          "
        >
          go back
        </span>
      </button>
    </div>
  );
}

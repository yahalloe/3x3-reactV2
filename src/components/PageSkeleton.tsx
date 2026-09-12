export function PageSkeleton() {
  return <div className="page-shell py-10" role="status" aria-label="Loading page"><div aria-hidden="true" className="skeleton h-7 w-32" /><div aria-hidden="true" className="skeleton mt-5 h-12 w-3/4" /><div className="mt-8 grid gap-6 sm:grid-cols-2"><div aria-hidden="true" className="skeleton aspect-[3/4] max-h-96" /><div aria-hidden="true" className="grid content-start gap-4">{[1,2,3,4,5].map((i) => <div key={i} className="skeleton h-5" />)}</div></div></div>;
}

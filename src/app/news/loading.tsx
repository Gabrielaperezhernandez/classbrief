// Shown while /news gathers stories from all the newspapers.
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">My news</h1>
      <p className="mt-3 text-slate-700" role="status">
        Gathering today&apos;s stories from the newspapers…
      </p>
    </div>
  );
}

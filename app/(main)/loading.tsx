export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black pt-24 pb-16 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-zinc-800 rounded-2xl w-1/3 mb-6"></div>
        <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded-lg w-1/2 mb-10"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-zinc-800 rounded-3xl"></div>
          <div className="h-64 bg-slate-200 dark:bg-zinc-800 rounded-3xl"></div>
          <div className="h-64 bg-slate-200 dark:bg-zinc-800 rounded-3xl"></div>
        </div>
      </div>
    </div>
  );
}

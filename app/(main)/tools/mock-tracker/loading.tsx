export default function MockTrackerLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black pt-24 pb-16 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 animate-pulse">
        <div className="h-12 bg-slate-200 dark:bg-zinc-800 rounded-2xl w-2/5 mb-4"></div>
        <div className="h-5 bg-slate-200 dark:bg-zinc-800 rounded-lg w-1/2 mb-8"></div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="h-24 bg-slate-200 dark:bg-zinc-800 rounded-2xl"></div>
          <div className="h-24 bg-slate-200 dark:bg-zinc-800 rounded-2xl"></div>
          <div className="h-24 bg-slate-200 dark:bg-zinc-800 rounded-2xl"></div>
          <div className="h-24 bg-slate-200 dark:bg-zinc-800 rounded-2xl"></div>
        </div>

        {/* Tracker Panel */}
        <div className="h-96 bg-slate-200 dark:bg-zinc-800 rounded-3xl"></div>
      </div>
    </div>
  );
}

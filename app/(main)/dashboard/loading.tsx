export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-black pt-[100px] pb-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
        {/* Header */}
        <div className="h-32 bg-slate-200 dark:bg-zinc-800 rounded-[2rem] mb-8"></div>
        
        {/* Subject Pills */}
        <div className="flex gap-4 mb-8">
          <div className="h-12 w-32 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
          <div className="h-12 w-36 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
          <div className="h-12 w-32 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
          <div className="h-12 w-36 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="h-36 bg-slate-200 dark:bg-zinc-800 rounded-2xl"></div>
          <div className="h-36 bg-slate-200 dark:bg-zinc-800 rounded-2xl"></div>
          <div className="h-36 bg-slate-200 dark:bg-zinc-800 rounded-2xl"></div>
        </div>

        {/* History Table */}
        <div className="h-72 bg-slate-200 dark:bg-zinc-800 rounded-3xl"></div>
      </div>
    </div>
  );
}

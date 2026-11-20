export default function TypingLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black pt-24 pb-16 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 animate-pulse">
        <div className="h-12 bg-slate-200 dark:bg-zinc-800 rounded-2xl w-2/5 mb-4"></div>
        <div className="h-5 bg-slate-200 dark:bg-zinc-800 rounded-lg w-1/3 mb-8"></div>
        
        {/* Selector pills */}
        <div className="flex gap-3 mb-8 overflow-hidden">
          <div className="h-10 w-28 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
          <div className="h-10 w-32 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
          <div className="h-10 w-28 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
        </div>

        {/* Typing card */}
        <div className="h-96 bg-slate-200 dark:bg-zinc-800 rounded-3xl border-2 border-slate-300 dark:border-zinc-800"></div>
      </div>
    </div>
  );
}

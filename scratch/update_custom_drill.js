const fs = require('fs');

let c = fs.readFileSync('app/(main)/typing/custom/page.tsx', 'utf8');

c = c.replace('bg-slate-50 pt-[120px]', 'bg-slate-50 dark:bg-black pt-[120px] transition-colors');
c = c.replace('bg-slate-50 pt-[120px] px-4', 'bg-slate-50 dark:bg-black pt-[120px] px-4 transition-colors');
c = c.replace('bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md', 'bg-white dark:bg-zinc-950 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-zinc-800 text-center max-w-md');
c = c.replace('text-2xl font-black text-slate-800 mb-2', 'text-2xl font-black text-slate-800 dark:text-white mb-2');
c = c.replace('text-slate-500 mb-8 font-medium', 'text-slate-500 dark:text-zinc-400 mb-8 font-medium');

c = c.replace('min-h-screen bg-slate-50 font-sans pt-[120px] pb-16', 'min-h-screen bg-slate-50 dark:bg-black font-sans pt-[120px] pb-16 transition-colors duration-200');
c = c.replace('text-slate-500 hover:text-slate-800 font-bold mb-6 transition-colors', 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white font-bold mb-6 transition-colors');
c = c.replace('text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight', 'text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight');
c = c.replace('text-slate-600 font-medium text-lg ml-[68px]', 'text-slate-600 dark:text-zinc-300 font-medium text-lg ml-[68px]');
c = c.replace('bg-white border border-rose-100 rounded-[2rem] p-8 md:p-12 shadow-sm text-center relative overflow-hidden', 'bg-white dark:bg-zinc-950 border border-rose-100 dark:border-zinc-800 rounded-[2rem] p-8 md:p-12 shadow-sm text-center relative overflow-hidden');
c = c.replace('text-xl font-bold text-slate-800 mb-6 relative z-10', 'text-xl font-bold text-slate-800 dark:text-white mb-6 relative z-10');
c = c.replace('bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 mb-10 text-left max-h-72 overflow-y-auto relative z-10 custom-scrollbar', 'bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 mb-10 text-left max-h-72 overflow-y-auto relative z-10 custom-scrollbar');
c = c.replace('text-slate-700 text-lg leading-relaxed font-medium', 'text-slate-700 dark:text-zinc-200 text-lg leading-relaxed font-medium');

fs.writeFileSync('app/(main)/typing/custom/page.tsx', c, 'utf8');
console.log('Custom drill page successfully updated!');

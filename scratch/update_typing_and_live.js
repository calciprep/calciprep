const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  let count = 0;
  for (const { from, to } of replacements) {
    if (typeof from === 'string') {
      if (content.includes(from)) {
        const parts = content.split(from);
        count += parts.length - 1;
        content = parts.join(to);
      }
    } else if (from instanceof RegExp) {
      const match = content.match(from);
      if (match) {
        content = content.replace(from, to);
        count += match.length;
      }
    }
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${filePath}: ${count} replacements.`);
}

// 1. app/(main)/typing/[examId]/page.tsx
replaceInFile('app/(main)/typing/[examId]/page.tsx', [
  // TABS
  { 
    from: "inactiveClass: 'bg-white text-gray-600 border-gray-200 hover:bg-indigo-50'",
    to: "inactiveClass: 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-800 hover:bg-indigo-50 dark:hover:bg-zinc-800'"
  },
  {
    from: "badgeInactive: 'bg-gray-100 text-gray-500'",
    to: "badgeInactive: 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'"
  },
  {
    from: "activeClass: 'bg-amber-50 text-amber-700 border-amber-300'",
    to: "activeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'"
  },
  {
    from: "activeClass: 'bg-[#e6fbf0] text-[#006838] border-[#a3e8c3]'",
    to: "activeClass: 'bg-[#e6fbf0] dark:bg-emerald-950/50 text-[#006838] dark:text-emerald-300 border-[#a3e8c3] dark:border-emerald-800'"
  },
  {
    from: "activeClass: 'bg-[#f0f3ff] text-[#343a9a] border-[#c2d1ff]'",
    to: "activeClass: 'bg-[#f0f3ff] dark:bg-indigo-950/50 text-[#343a9a] dark:text-indigo-300 border-[#c2d1ff] dark:border-indigo-800'"
  },
  {
    from: "activeClass: 'bg-[#fff0f0] text-[#a51a1a] border-[#ffc2c2]'",
    to: "activeClass: 'bg-[#fff0f0] dark:bg-rose-950/50 text-[#a51a1a] dark:text-rose-300 border-[#ffc2c2] dark:border-rose-800'"
  },
  // Container
  {
    from: '<div className="min-h-screen bg-white relative">',
    to: '<div className="min-h-screen bg-white dark:bg-black transition-colors duration-200 relative">'
  },
  // Description text
  {
    from: 'className="text-lg text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed"',
    to: 'className="text-lg text-gray-600 dark:text-zinc-300 max-w-3xl mx-auto font-medium leading-relaxed"'
  },
  // Rules Box
  {
    from: 'relative bg-[#f8f9fa] border border-gray-200 rounded-xl p-6 md:p-8 text-center shadow-sm mb-16 max-w-5xl mx-auto',
    to: 'relative bg-[#f8f9fa] dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 md:p-8 text-center shadow-sm mb-16 max-w-5xl mx-auto'
  },
  // Back to exams button
  {
    from: 'bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold transition-all shadow-sm text-xs md:text-sm z-10',
    to: 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-indigo-700 dark:hover:text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold transition-all shadow-sm text-xs md:text-sm z-10'
  },
  // Rules paragraph
  {
    from: 'className="text-sm md:text-base text-gray-600 leading-relaxed text-justify md:text-center mt-4"',
    to: 'className="text-sm md:text-base text-gray-600 dark:text-zinc-300 leading-relaxed text-justify md:text-center mt-4"'
  },
  // Library count pill
  {
    from: 'flex items-center gap-2 text-slate-600 bg-slate-50 px-5 py-2 rounded-full border border-slate-200 shadow-sm transition-all hover:bg-slate-100',
    to: 'flex items-center gap-2 text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-900 px-5 py-2 rounded-full border border-slate-200 dark:border-zinc-800 shadow-sm transition-all hover:bg-slate-100 dark:hover:bg-zinc-800'
  },
  // Toolbar container
  {
    from: 'className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-8 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between"',
    to: 'className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 mb-8 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between"'
  },
  // Search input
  {
    from: 'className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5b58f5] focus:border-[#5b58f5] font-medium transition-all shadow-sm"',
    to: 'className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-zinc-800 rounded-xl leading-5 bg-white dark:bg-black placeholder-gray-400 dark:placeholder-zinc-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5b58f5] focus:border-[#5b58f5] font-medium transition-all shadow-sm"'
  },
  // Cards
  {
    from: "${isCompleted ? 'bg-green-50/50 border-green-200' : 'bg-white border-gray-200'}",
    to: "${isCompleted ? 'bg-green-50/50 dark:bg-emerald-950/20 border-green-200 dark:border-emerald-800/50' : 'bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800'}"
  },
  {
    from: 'className="text-xl font-black text-gray-900 mb-2 line-clamp-1"',
    to: 'className="text-xl font-black text-gray-900 dark:text-white mb-2 line-clamp-1"'
  },
  {
    from: "${isCompleted ? 'text-gray-600' : 'text-gray-500'}",
    to: "${isCompleted ? 'text-gray-600 dark:text-zinc-300' : 'text-gray-500 dark:text-zinc-400'}"
  },
  {
    from: "${isCompleted ? 'bg-green-100/50 border-green-100' : 'bg-gray-50 border-gray-100'}",
    to: "${isCompleted ? 'bg-green-100/50 dark:bg-emerald-950/40 border-green-100 dark:border-emerald-900/40' : 'bg-gray-50 dark:bg-black border-gray-100 dark:border-zinc-800'}"
  },
  // Export modal
  {
    from: '<div className="bg-white text-slate-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">',
    to: '<div className="bg-white dark:bg-zinc-950 text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">'
  },
  {
    from: '<div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">',
    to: '<div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-black">'
  },
  {
    from: '<h2 className="text-lg font-black tracking-tight text-slate-800">',
    to: '<h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-white">'
  },
  {
    from: '<label className="text-sm font-bold text-slate-700">Select Difficulty Level</label>',
    to: '<label className="text-sm font-bold text-slate-700 dark:text-zinc-300">Select Difficulty Level</label>'
  },
  {
    from: ": 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'",
    to: ": 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'"
  },
  {
    from: '<div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">',
    to: '<div className="p-5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-black flex gap-3">'
  },
  {
    from: 'className="flex-1 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg font-bold hover:bg-slate-50 transition-colors"',
    to: 'className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 px-4 py-2.5 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"'
  }
]);

// 2. app/(main)/live-tests/typing/page.tsx
replaceInFile('app/(main)/live-tests/typing/page.tsx', [
  {
    from: '<div className="min-h-screen bg-slate-50 font-sans pt-[80px] pb-20">',
    to: '<div className="min-h-screen bg-slate-50 dark:bg-black font-sans pt-[80px] pb-20 transition-colors duration-200">'
  },
  {
    from: 'text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors',
    to: 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white font-bold mb-8 transition-colors'
  },
  {
    from: 'text-slate-900 uppercase tracking-tight',
    to: 'text-slate-900 dark:text-white uppercase tracking-tight'
  },
  {
    from: 'text-slate-600 font-medium',
    to: 'text-slate-600 dark:text-zinc-300 font-medium'
  },
  {
    from: 'bg-white rounded-3xl p-12 border border-slate-200 text-center shadow-sm',
    to: 'bg-white dark:bg-zinc-950 rounded-3xl p-12 border border-slate-200 dark:border-zinc-800 text-center shadow-sm'
  },
  {
    from: 'bg-slate-100 text-slate-400 rounded-full',
    to: 'bg-slate-100 dark:bg-zinc-900 text-slate-400 rounded-full'
  },
  {
    from: 'text-2xl font-black text-slate-900 mb-2',
    to: 'text-2xl font-black text-slate-900 dark:text-white mb-2'
  },
  {
    from: 'text-slate-500 max-w-md',
    to: 'text-slate-500 dark:text-zinc-400 max-w-md'
  },
  {
    from: 'bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300',
    to: 'bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300'
  },
  {
    from: 'text-xl font-black text-slate-900',
    to: 'text-xl font-black text-slate-900 dark:text-white'
  }
]);

// 3. Live test landing pages: delhi_police_hcm, ssc_cgl, ssc_chsl
['delhi_police_hcm', 'ssc_cgl', 'ssc_chsl'].forEach(exam => {
  const p = `app/(main)/live-tests/typing/${exam}/page.tsx`;
  replaceInFile(p, [
    {
      from: '<div className="min-h-screen bg-slate-50 flex items-center justify-center">',
      to: '<div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">'
    },
    {
      from: '<div className="min-h-screen bg-slate-50 font-sans pt-[100px] pb-20">',
      to: '<div className="min-h-screen bg-slate-50 dark:bg-black font-sans pt-[100px] pb-20 transition-colors duration-200">'
    },
    {
      from: 'text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors',
      to: 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white font-bold mb-8 transition-colors'
    },
    {
      from: 'bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden',
      to: 'bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden'
    },
    {
      from: 'bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider',
      to: 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider'
    },
    {
      from: 'text-3xl md:text-5xl font-black text-slate-900 mb-4',
      to: 'text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4'
    },
    {
      from: 'text-lg text-slate-600 font-medium mb-10 max-w-2xl',
      to: 'text-lg text-slate-600 dark:text-zinc-300 font-medium mb-10 max-w-2xl'
    },
    {
      from: 'text-lg text-slate-600 font-medium max-w-lg mx-auto mb-8',
      to: 'text-lg text-slate-600 dark:text-zinc-300 font-medium max-w-lg mx-auto mb-8'
    },
    {
      from: 'bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6',
      to: 'bg-slate-100 dark:bg-zinc-900 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6'
    },
    {
      from: 'border-t border-slate-100 pt-8',
      to: 'border-t border-slate-100 dark:border-zinc-800 pt-8'
    },
    {
      from: 'bg-slate-50 rounded-2xl p-6 border border-slate-100',
      to: 'bg-slate-50 dark:bg-black rounded-2xl p-6 border border-slate-100 dark:border-zinc-800'
    },
    {
      from: 'text-sm font-bold text-slate-500 uppercase tracking-wider',
      to: 'text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider'
    },
    {
      from: 'text-2xl font-black text-slate-800 mt-1',
      to: 'text-2xl font-black text-slate-800 dark:text-white mt-1'
    }
  ]);
});

// 4. Leaderboard pages
['delhi_police_hcm', 'ssc_cgl', 'ssc_chsl'].forEach(exam => {
  const lb = `app/(main)/live-tests/typing/${exam}/leaderboard/page.tsx`;
  replaceInFile(lb, [
    {
      from: '<div className="min-h-screen bg-slate-50 font-sans pt-[100px] pb-20">',
      to: '<div className="min-h-screen bg-slate-50 dark:bg-black font-sans pt-[100px] pb-20 transition-colors duration-200">'
    },
    {
      from: 'text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors',
      to: 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white font-bold mb-8 transition-colors'
    },
    {
      from: 'text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight mb-3',
      to: 'text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3'
    },
    {
      from: 'text-slate-600 font-medium',
      to: 'text-slate-600 dark:text-zinc-300 font-medium'
    },
    {
      from: 'bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden',
      to: 'bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-[2rem] shadow-sm overflow-hidden'
    },
    {
      from: 'className="divide-y divide-slate-100 font-medium">',
      to: 'className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">'
    },
    {
      from: 'className={`transition-colors ${isCurrentUser ? "bg-indigo-50/70" : "hover:bg-slate-50/80"}`}',
      to: 'className={`transition-colors ${isCurrentUser ? "bg-indigo-50/70 dark:bg-indigo-950/40" : "hover:bg-slate-50/80 dark:hover:bg-zinc-900/60"}`}'
    },
    {
      from: 'text-slate-900 font-bold',
      to: 'text-slate-900 dark:text-white font-bold'
    },
    {
      from: 'text-slate-500',
      to: 'text-slate-500 dark:text-zinc-400'
    }
  ]);
});

console.log('Typing and live tests updates finished!');

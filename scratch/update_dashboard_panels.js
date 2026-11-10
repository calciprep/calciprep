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
    }
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${filePath}: ${count} replacements.`);
}

// 1. app/(main)/dashboard/page.tsx
replaceInFile('app/(main)/dashboard/page.tsx', [
  {
    from: 'bg-white dark:bg-zinc-950 border-[3px] border-black dark:border-zinc-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.6)] p-8 rounded-[2rem]',
    to: 'bg-white dark:bg-black border-[3px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.7)] p-8 rounded-[2rem]'
  },
  {
    from: 'border-[3px] border-black dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.6)]',
    to: 'border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.7)]'
  },
  {
    from: "${activeSubject === 'typing' ? 'bg-[#D4FF2A] text-black' : 'bg-white dark:bg-zinc-950 text-black dark:text-white'}",
    to: "${activeSubject === 'typing' ? 'bg-[#D4FF2A] text-black' : 'bg-white dark:bg-black text-black dark:text-white'}"
  },
  {
    from: "${activeSubject === 'maths' ? 'bg-[#D4FF2A] text-black' : 'bg-white dark:bg-zinc-950 text-black dark:text-white'}",
    to: "${activeSubject === 'maths' ? 'bg-[#D4FF2A] text-black' : 'bg-white dark:bg-black text-black dark:text-white'}"
  },
  {
    from: "${activeSubject === 'english' ? 'bg-[#D4FF2A] text-black' : 'bg-white dark:bg-zinc-950 text-black dark:text-white'}",
    to: "${activeSubject === 'english' ? 'bg-[#D4FF2A] text-black' : 'bg-white dark:bg-black text-black dark:text-white'}"
  },
  {
    from: 'bg-white dark:bg-zinc-950 border-[3px] border-black dark:border-zinc-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    to: 'bg-white dark:bg-black border-[3px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.7)]'
  }
]);

// 2. components/features/dashboard/TypingDashboard.tsx
replaceInFile('components/features/dashboard/TypingDashboard.tsx', [
  // Exam tabs
  {
    from: "border-[3px] border-black transition-all duration-200 whitespace-nowrap hover:-translate-y-1\n              ${activeExamTab === examTab ? 'bg-[#D4FF2A] text-black' : 'bg-white text-black'}",
    to: "border-[3px] border-black dark:border-white transition-all duration-200 whitespace-nowrap hover:-translate-y-1\n              ${activeExamTab === examTab ? 'bg-[#D4FF2A] text-black' : 'bg-white dark:bg-black text-black dark:text-white'}"
  },
  // Colored stats cards (keep colored, borders white)
  {
    from: 'bg-[#AEE8F5] border-[3px] border-black rounded-[2rem]',
    to: 'bg-[#AEE8F5] border-[3px] border-black dark:border-white rounded-[2rem]'
  },
  {
    from: 'bg-[#C4F2B0] border-[3px] border-black rounded-[2rem]',
    to: 'bg-[#C4F2B0] border-[3px] border-black dark:border-white rounded-[2rem]'
  },
  {
    from: 'absolute top-6 right-6 bg-white border-2 border-black text-black',
    to: 'absolute top-6 right-6 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white text-black dark:text-white'
  },
  // Dynamic gauge card (was white)
  {
    from: '<div className="bg-white border-[3px] border-black rounded-[2rem] p-8 flex flex-col items-center justify-center relative">',
    to: '<div className="bg-white dark:bg-black border-[3px] border-black dark:border-white rounded-[2rem] p-8 flex flex-col items-center justify-center relative">'
  },
  {
    from: 'Avg {activeConfig.primaryLabel}</span>',
    to: 'Avg {activeConfig.primaryLabel}</span>'
  },
  {
    from: 'text-sm font-black tracking-wider text-black uppercase absolute top-6 left-8',
    to: 'text-sm font-black tracking-wider text-black dark:text-white uppercase absolute top-6 left-8'
  },
  {
    from: 'stroke="#e2e8f0" strokeWidth="10"',
    to: 'className="stroke-[#e2e8f0] dark:stroke-zinc-800" strokeWidth="10"'
  },
  {
    from: 'stroke="#000" strokeWidth="10" strokeLinecap="round"',
    to: 'className="stroke-[#000] dark:stroke-white transition-all duration-1000 ease-out" strokeWidth="10" strokeLinecap="round"'
  },
  {
    from: 'text-4xl font-black text-black leading-none',
    to: 'text-4xl font-black text-black dark:text-white leading-none'
  },
  {
    from: 'text-xs font-black text-black mt-1 uppercase',
    to: 'text-xs font-black text-black dark:text-white mt-1 uppercase'
  },
  // Weakness banner
  {
    from: 'bg-[#FF8787] border-[3px] border-black rounded-[2rem]',
    to: 'bg-[#FF8787] border-[3px] border-black dark:border-white rounded-[2rem]'
  },
  {
    from: 'bg-white p-2 rounded-full border-2 border-black',
    to: 'bg-white dark:bg-zinc-900 p-2 rounded-full border-2 border-black dark:border-white'
  },
  {
    from: 'bg-white border-[2px] border-black text-black px-4 py-1.5 rounded-full text-sm font-black',
    to: 'bg-white dark:bg-zinc-900 border-[2px] border-black dark:border-white text-black dark:text-white px-4 py-1.5 rounded-full text-sm font-black'
  },
  {
    from: 'bg-[#D4FF2A] border-[3px] border-black text-black px-8 py-4 rounded-full font-black text-lg',
    to: 'bg-[#D4FF2A] border-[3px] border-black dark:border-white text-black px-8 py-4 rounded-full font-black text-lg'
  },
  // Charts
  {
    from: '<div className="bg-white border-[3px] border-black rounded-[2rem] p-8">',
    to: '<div className="bg-white dark:bg-black border-[3px] border-black dark:border-white rounded-[2rem] p-8">'
  },
  {
    from: 'text-xl font-black text-black flex items-center gap-2 font-serif',
    to: 'text-xl font-black text-black dark:text-white flex items-center gap-2 font-serif'
  },
  {
    from: 'bg-[#C4F2B0] border-2 border-black',
    to: 'bg-[#C4F2B0] border-2 border-black dark:border-white'
  },
  // Filters bar
  {
    from: '<div className="bg-white p-6 rounded-[2rem] border-[3px] border-black flex flex-wrap lg:flex-nowrap items-end gap-5">',
    to: '<div className="bg-white dark:bg-black p-6 rounded-[2rem] border-[3px] border-black dark:border-white flex flex-wrap lg:flex-nowrap items-end gap-5">'
  },
  {
    from: 'text-sm font-black text-black flex items-center gap-2',
    to: 'text-sm font-black text-black dark:text-white flex items-center gap-2'
  },
  {
    from: 'border-[2.5px] border-black rounded-xl p-3 text-sm font-bold outline-none focus:-translate-y-1 transition-all bg-white cursor-pointer',
    to: 'border-[2.5px] border-black dark:border-white rounded-xl p-3 text-sm font-bold outline-none focus:-translate-y-1 transition-all bg-white dark:bg-zinc-900 text-black dark:text-white cursor-pointer'
  },
  {
    from: 'w-full border-[2.5px] border-black rounded-xl p-3 pl-10 text-sm font-bold outline-none focus:-translate-y-1 transition-all',
    to: 'w-full border-[2.5px] border-black dark:border-white rounded-xl p-3 pl-10 text-sm font-bold outline-none focus:-translate-y-1 transition-all bg-white dark:bg-zinc-900 text-black dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500'
  },
  {
    from: 'absolute left-3 top-3 text-black',
    to: 'absolute left-3 top-3 text-black dark:text-white'
  },
  {
    from: 'bg-white border-[3px] border-black hover:bg-slate-100 text-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-black hover:-translate-y-1 transition-all flex-1 lg:flex-none whitespace-nowrap',
    to: 'bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white hover:bg-slate-100 dark:hover:bg-zinc-800 text-black dark:text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-black hover:-translate-y-1 transition-all flex-1 lg:flex-none whitespace-nowrap'
  },
  // Table
  {
    from: '<div className="bg-white border-[3px] border-black rounded-[2rem] overflow-hidden">',
    to: '<div className="bg-white dark:bg-black border-[3px] border-black dark:border-white rounded-[2rem] overflow-hidden">'
  },
  {
    from: 'className="border-b-[2.5px] border-black bg-slate-50">',
    to: 'className="border-b-[2.5px] border-black dark:border-white bg-slate-50 dark:bg-zinc-900">'
  },
  {
    from: 'text-xs font-black text-black uppercase tracking-wider',
    to: 'text-xs font-black text-black dark:text-white uppercase tracking-wider'
  },
  {
    from: 'className="border-b border-slate-200 hover:bg-slate-50 transition-colors font-medium">',
    to: 'className="border-b border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-colors font-medium text-black dark:text-white">'
  },
  {
    from: 'text-sm font-black text-slate-900',
    to: 'text-sm font-black text-slate-900 dark:text-white'
  },
  {
    from: 'text-xs font-bold text-slate-500',
    to: 'text-xs font-bold text-slate-500 dark:text-zinc-400'
  }
]);

// 3. components/features/dashboard/MathsDashboard.tsx
replaceInFile('components/features/dashboard/MathsDashboard.tsx', [
  {
    from: 'bg-[#AEE8F5] border-[3px] border-black rounded-[2rem]',
    to: 'bg-[#AEE8F5] border-[3px] border-black dark:border-white rounded-[2rem]'
  },
  {
    from: 'bg-[#C4F2B0] border-[3px] border-black rounded-[2rem]',
    to: 'bg-[#C4F2B0] border-[3px] border-black dark:border-white rounded-[2rem]'
  },
  {
    from: 'bg-[#FF8787] border-[3px] border-black rounded-[2rem]',
    to: 'bg-[#FF8787] border-[3px] border-black dark:border-white rounded-[2rem]'
  },
  {
    from: 'absolute top-6 right-6 bg-white border-2 border-black text-black',
    to: 'absolute top-6 right-6 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white text-black dark:text-white'
  },
  {
    from: '<div className="bg-white p-6 rounded-[2rem] border-[3px] border-black flex flex-wrap lg:flex-nowrap items-end gap-5">',
    to: '<div className="bg-white dark:bg-black p-6 rounded-[2rem] border-[3px] border-black dark:border-white flex flex-wrap lg:flex-nowrap items-end gap-5">'
  },
  {
    from: 'text-sm font-black text-black flex items-center gap-2',
    to: 'text-sm font-black text-black dark:text-white flex items-center gap-2'
  },
  {
    from: 'border-[2.5px] border-black rounded-xl p-3 text-sm font-bold outline-none focus:-translate-y-1 transition-all bg-white cursor-pointer',
    to: 'border-[2.5px] border-black dark:border-white rounded-xl p-3 text-sm font-bold outline-none focus:-translate-y-1 transition-all bg-white dark:bg-zinc-900 text-black dark:text-white cursor-pointer'
  },
  {
    from: 'w-full border-[2.5px] border-black rounded-xl p-3 pl-10 text-sm font-bold outline-none focus:-translate-y-1 transition-all',
    to: 'w-full border-[2.5px] border-black dark:border-white rounded-xl p-3 pl-10 text-sm font-bold outline-none focus:-translate-y-1 transition-all bg-white dark:bg-zinc-900 text-black dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500'
  },
  {
    from: 'absolute left-3 top-3 text-black',
    to: 'absolute left-3 top-3 text-black dark:text-white'
  },
  {
    from: 'bg-white border-[3px] border-black hover:bg-slate-100 text-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-black hover:-translate-y-1 transition-all flex-1 lg:flex-none whitespace-nowrap',
    to: 'bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white hover:bg-slate-100 dark:hover:bg-zinc-800 text-black dark:text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-black hover:-translate-y-1 transition-all flex-1 lg:flex-none whitespace-nowrap'
  },
  {
    from: '<div className="bg-white border-[3px] border-black rounded-[2rem] overflow-hidden">',
    to: '<div className="bg-white dark:bg-black border-[3px] border-black dark:border-white rounded-[2rem] overflow-hidden">'
  },
  {
    from: 'className="border-b-[2.5px] border-black bg-slate-50">',
    to: 'className="border-b-[2.5px] border-black dark:border-white bg-slate-50 dark:bg-zinc-900">'
  },
  {
    from: 'text-xs font-black text-black uppercase tracking-wider',
    to: 'text-xs font-black text-black dark:text-white uppercase tracking-wider'
  },
  {
    from: 'className="border-b border-slate-200 hover:bg-slate-50 transition-colors font-medium">',
    to: 'className="border-b border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-colors font-medium text-black dark:text-white">'
  },
  {
    from: 'text-sm font-black text-slate-900',
    to: 'text-sm font-black text-slate-900 dark:text-white'
  },
  {
    from: 'text-xs font-bold text-slate-500',
    to: 'text-xs font-bold text-slate-500 dark:text-zinc-400'
  }
]);

// 4. components/features/dashboard/EnglishDashboard.tsx
replaceInFile('components/features/dashboard/EnglishDashboard.tsx', [
  {
    from: 'bg-[#AEE8F5] border-[3px] border-black rounded-[2rem]',
    to: 'bg-[#AEE8F5] border-[3px] border-black dark:border-white rounded-[2rem]'
  },
  {
    from: 'bg-[#C4F2B0] border-[3px] border-black rounded-[2rem]',
    to: 'bg-[#C4F2B0] border-[3px] border-black dark:border-white rounded-[2rem]'
  },
  {
    from: 'bg-[#FF8787] border-[3px] border-black rounded-[2rem]',
    to: 'bg-[#FF8787] border-[3px] border-black dark:border-white rounded-[2rem]'
  },
  {
    from: 'absolute top-6 right-6 bg-white border-2 border-black text-black',
    to: 'absolute top-6 right-6 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white text-black dark:text-white'
  },
  {
    from: '<div className="bg-white p-6 rounded-[2rem] border-[3px] border-black flex flex-wrap lg:flex-nowrap items-end gap-5">',
    to: '<div className="bg-white dark:bg-black p-6 rounded-[2rem] border-[3px] border-black dark:border-white flex flex-wrap lg:flex-nowrap items-end gap-5">'
  },
  {
    from: 'text-sm font-black text-black flex items-center gap-2',
    to: 'text-sm font-black text-black dark:text-white flex items-center gap-2'
  },
  {
    from: 'border-[2.5px] border-black rounded-xl p-3 text-sm font-bold outline-none focus:-translate-y-1 transition-all bg-white cursor-pointer',
    to: 'border-[2.5px] border-black dark:border-white rounded-xl p-3 text-sm font-bold outline-none focus:-translate-y-1 transition-all bg-white dark:bg-zinc-900 text-black dark:text-white cursor-pointer'
  },
  {
    from: 'w-full border-[2.5px] border-black rounded-xl p-3 pl-10 text-sm font-bold outline-none focus:-translate-y-1 transition-all',
    to: 'w-full border-[2.5px] border-black dark:border-white rounded-xl p-3 pl-10 text-sm font-bold outline-none focus:-translate-y-1 transition-all bg-white dark:bg-zinc-900 text-black dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500'
  },
  {
    from: 'absolute left-3 top-3 text-black',
    to: 'absolute left-3 top-3 text-black dark:text-white'
  },
  {
    from: 'bg-white border-[3px] border-black hover:bg-slate-100 text-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-black hover:-translate-y-1 transition-all flex-1 lg:flex-none whitespace-nowrap',
    to: 'bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white hover:bg-slate-100 dark:hover:bg-zinc-800 text-black dark:text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-black hover:-translate-y-1 transition-all flex-1 lg:flex-none whitespace-nowrap'
  },
  {
    from: '<div className="bg-white border-[3px] border-black rounded-[2rem] overflow-hidden">',
    to: '<div className="bg-white dark:bg-black border-[3px] border-black dark:border-white rounded-[2rem] overflow-hidden">'
  },
  {
    from: 'className="border-b-[2.5px] border-black bg-slate-50">',
    to: 'className="border-b-[2.5px] border-black dark:border-white bg-slate-50 dark:bg-zinc-900">'
  },
  {
    from: 'text-xs font-black text-black uppercase tracking-wider',
    to: 'text-xs font-black text-black dark:text-white uppercase tracking-wider'
  },
  {
    from: 'className="border-b border-slate-200 hover:bg-slate-50 transition-colors font-medium">',
    to: 'className="border-b border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-colors font-medium text-black dark:text-white">'
  },
  {
    from: 'text-sm font-black text-slate-900',
    to: 'text-sm font-black text-slate-900 dark:text-white'
  },
  {
    from: 'text-xs font-bold text-slate-500',
    to: 'text-xs font-bold text-slate-500 dark:text-zinc-400'
  }
]);

console.log('Dashboard panels and borders updated successfully!');

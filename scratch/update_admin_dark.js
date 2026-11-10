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

// 1. app/(main)/admin/page.tsx
replaceInFile('app/(main)/admin/page.tsx', [
  {
    from: '<div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">',
    to: '<div className="min-h-screen bg-[#F3F4F6] dark:bg-black flex items-center justify-center">'
  },
  {
    from: '<div className="min-h-screen bg-[#F3F4F6] pt-[100px] pb-20 px-4 sm:px-6 lg:px-8 font-sans">',
    to: '<div className="min-h-screen bg-[#F3F4F6] dark:bg-black pt-[100px] pb-20 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">'
  },
  {
    from: 'text-sm text-slate-500 font-medium mt-1',
    to: 'text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1'
  },
  {
    from: 'bg-amber-100 p-2 rounded-2xl shadow-sm border border-amber-200',
    to: 'bg-amber-100 dark:bg-zinc-900 p-2 rounded-2xl shadow-sm border border-amber-200 dark:border-zinc-800'
  },
  {
    from: "text-amber-800 hover:bg-amber-200/60",
    to: "text-amber-800 dark:text-zinc-300 hover:bg-amber-200/60 dark:hover:bg-zinc-800"
  }
]);

// 2. app/(main)/admin/tabs/OverviewTab.tsx
replaceInFile('app/(main)/admin/tabs/OverviewTab.tsx', [
  {
    from: 'bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200',
    to: 'bg-white dark:bg-zinc-950 rounded-[1.5rem] p-6 shadow-sm border border-slate-200 dark:border-zinc-800'
  },
  {
    from: 'text-slate-900 uppercase tracking-wider',
    to: 'text-slate-900 dark:text-white uppercase tracking-wider'
  },
  {
    from: 'text-slate-900',
    to: 'text-slate-900 dark:text-white'
  },
  {
    from: 'border-slate-100',
    to: 'border-slate-100 dark:border-zinc-800'
  },
  {
    from: 'bg-slate-50',
    to: 'bg-slate-50 dark:bg-black'
  },
  {
    from: 'bg-white p-6 rounded-[1.5rem]',
    to: 'bg-white dark:bg-zinc-950 p-6 rounded-[1.5rem]'
  },
  {
    from: 'border-slate-200',
    to: 'border-slate-200 dark:border-zinc-800'
  }
]);

// 3. app/(main)/admin/tabs/UsersTab.tsx
replaceInFile('app/(main)/admin/tabs/UsersTab.tsx', [
  {
    from: 'text-2xl font-black text-slate-900',
    to: 'text-2xl font-black text-slate-900 dark:text-white'
  },
  {
    from: 'text-sm text-slate-500 font-medium mt-1',
    to: 'text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1'
  },
  {
    from: 'bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800',
    to: 'bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-slate-800 dark:text-white'
  },
  {
    from: 'border border-slate-200 rounded-2xl shadow-sm',
    to: 'border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm'
  },
  {
    from: 'divide-y divide-slate-100 bg-white',
    to: 'divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950'
  },
  {
    from: 'hover:bg-slate-50/80 transition-colors group',
    to: 'hover:bg-slate-50/80 dark:hover:bg-zinc-900/60 transition-colors group'
  },
  {
    from: 'text-slate-900',
    to: 'text-slate-900 dark:text-white'
  },
  {
    from: 'text-slate-500',
    to: 'text-slate-500 dark:text-zinc-400'
  }
]);

// 4. app/(main)/admin/tabs/LeaderboardsTab.tsx
replaceInFile('app/(main)/admin/tabs/LeaderboardsTab.tsx', [
  {
    from: 'text-2xl font-black text-slate-900',
    to: 'text-2xl font-black text-slate-900 dark:text-white'
  },
  {
    from: 'bg-white border border-slate-200',
    to: 'bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800'
  },
  {
    from: 'divide-y divide-slate-100 bg-white',
    to: 'divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950'
  },
  {
    from: 'hover:bg-slate-50/80',
    to: 'hover:bg-slate-50/80 dark:hover:bg-zinc-900/60'
  },
  {
    from: 'text-slate-900',
    to: 'text-slate-900 dark:text-white'
  },
  {
    from: 'text-slate-500',
    to: 'text-slate-500 dark:text-zinc-400'
  }
]);

// 5. app/(main)/admin/tabs/InboxTab.tsx
replaceInFile('app/(main)/admin/tabs/InboxTab.tsx', [
  {
    from: 'text-2xl font-black text-slate-900',
    to: 'text-2xl font-black text-slate-900 dark:text-white'
  },
  {
    from: 'bg-white border border-slate-200',
    to: 'bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800'
  },
  {
    from: 'bg-slate-50 border border-slate-200',
    to: 'bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800'
  },
  {
    from: 'text-slate-900',
    to: 'text-slate-900 dark:text-white'
  },
  {
    from: 'text-slate-800',
    to: 'text-slate-800 dark:text-zinc-200'
  },
  {
    from: 'text-slate-500',
    to: 'text-slate-500 dark:text-zinc-400'
  }
]);

// 6. app/(main)/admin/tabs/CMSTab.tsx
replaceInFile('app/(main)/admin/tabs/CMSTab.tsx', [
  {
    from: 'text-2xl font-black text-slate-900',
    to: 'text-2xl font-black text-slate-900 dark:text-white'
  },
  {
    from: 'bg-white border border-slate-200',
    to: 'bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800'
  },
  {
    from: 'bg-slate-50 border border-slate-200',
    to: 'bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800'
  },
  {
    from: 'divide-y divide-slate-100 bg-white',
    to: 'divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950'
  },
  {
    from: 'hover:bg-slate-50/80',
    to: 'hover:bg-slate-50/80 dark:hover:bg-zinc-900/60'
  },
  {
    from: 'text-slate-900',
    to: 'text-slate-900 dark:text-white'
  },
  {
    from: 'text-slate-800',
    to: 'text-slate-800 dark:text-zinc-200'
  },
  {
    from: 'text-slate-500',
    to: 'text-slate-500 dark:text-zinc-400'
  }
]);

// 7. app/(main)/admin/tabs/CalendarTab.tsx
replaceInFile('app/(main)/admin/tabs/CalendarTab.tsx', [
  {
    from: 'text-2xl font-black text-slate-900',
    to: 'text-2xl font-black text-slate-900 dark:text-white'
  },
  {
    from: 'bg-white border border-slate-200',
    to: 'bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800'
  },
  {
    from: 'bg-slate-50 border border-slate-200',
    to: 'bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800'
  },
  {
    from: 'divide-y divide-slate-100 bg-white',
    to: 'divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950'
  },
  {
    from: 'text-slate-900',
    to: 'text-slate-900 dark:text-white'
  },
  {
    from: 'text-slate-800',
    to: 'text-slate-800 dark:text-zinc-200'
  },
  {
    from: 'text-slate-500',
    to: 'text-slate-500 dark:text-zinc-400'
  }
]);

// 8. app/(main)/admin/user/[userId]/page.tsx
replaceInFile('app/(main)/admin/user/[userId]/page.tsx', [
  {
    from: '<div className="min-h-screen bg-[#F3F4F6] pt-[100px] pb-20 px-4 sm:px-6 lg:px-8 font-sans">',
    to: '<div className="min-h-screen bg-[#F3F4F6] dark:bg-black pt-[100px] pb-20 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">'
  },
  {
    from: 'bg-white border border-slate-200',
    to: 'bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800'
  },
  {
    from: 'text-slate-900',
    to: 'text-slate-900 dark:text-white'
  },
  {
    from: 'text-slate-800',
    to: 'text-slate-800 dark:text-zinc-200'
  },
  {
    from: 'text-slate-500',
    to: 'text-slate-500 dark:text-zinc-400'
  },
  {
    from: 'bg-slate-50',
    to: 'bg-slate-50 dark:bg-black'
  }
]);

console.log('Admin command center dark mode updates finished!');

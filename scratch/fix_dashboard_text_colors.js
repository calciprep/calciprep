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

// 1. TypingDashboard.tsx
// Add import { useTheme } from '@/contexts/ThemeContext';
let typingContent = fs.readFileSync('components/features/dashboard/TypingDashboard.tsx', 'utf8');
if (!typingContent.includes('useTheme')) {
  typingContent = typingContent.replace(
    "import { HistoryEntry } from '@/services/userService';",
    "import { HistoryEntry } from '@/services/userService';\nimport { useTheme } from '@/contexts/ThemeContext';"
  );
  // Add const { isDark } = useTheme(); at start of TypingDashboard component
  typingContent = typingContent.replace(
    "export default function TypingDashboard({ history, onDelete }: TypingDashboardProps) {\n  const router = useRouter();",
    "export default function TypingDashboard({ history, onDelete }: TypingDashboardProps) {\n  const router = useRouter();\n  const { isDark } = useTheme();"
  );
  fs.writeFileSync('components/features/dashboard/TypingDashboard.tsx', typingContent, 'utf8');
}

replaceInFile('components/features/dashboard/TypingDashboard.tsx', [
  // Chart axes
  {
    from: "tick={{fontSize: 12, fill: '#000', fontWeight: 'bold'}}",
    to: "tick={{fontSize: 12, fill: isDark ? '#ffffff' : '#000000', fontWeight: 'bold'}}"
  },
  {
    from: 'stroke="#e2e8f0"',
    to: 'stroke={isDark ? "#27272a" : "#e2e8f0"}'
  },
  {
    from: "label={{ position: 'top', value: `Avg: ${chartAvgPrimary}`, fill: '#000', fontSize: 12, fontWeight: 'bold' }}",
    to: "label={{ position: 'top', value: `Avg: ${chartAvgPrimary}`, fill: isDark ? '#ffffff' : '#000000', fontSize: 12, fontWeight: 'bold' }}"
  },
  {
    from: "label={{ position: 'top', value: `Avg: ${chartAvgSecondary}`, fill: '#000', fontSize: 12, fontWeight: 'bold' }}",
    to: "label={{ position: 'top', value: `Avg: ${chartAvgSecondary}`, fill: isDark ? '#ffffff' : '#000000', fontSize: 12, fontWeight: 'bold' }}"
  },
  {
    from: 'stroke="#000" strokeWidth={4} fill="#D4FF2A"',
    to: 'stroke={isDark ? "#ffffff" : "#000000"} strokeWidth={4} fill="#D4FF2A"'
  },
  {
    from: 'stroke="#000" strokeWidth={3} radius={[4, 4, 0, 0]}',
    to: 'stroke={isDark ? "#ffffff" : "#000000"} strokeWidth={3} radius={[4, 4, 0, 0]}'
  },
  // Table rows and cell text colors
  {
    from: '<tr key={row.id} className="border-b-[2px] border-slate-200 hover:bg-slate-50 transition-colors">',
    to: '<tr key={row.id} className="border-b-[2px] border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">'
  },
  {
    from: '<td className="px-6 py-5 font-black text-black">{index + 1}</td>',
    to: '<td className="px-6 py-5 font-black text-black dark:text-white">{index + 1}</td>'
  },
  {
    from: '<td className="px-6 py-5 text-sm font-black text-black">{row.passage}</td>',
    to: '<td className="px-6 py-5 text-sm font-black text-black dark:text-white">{row.passage}</td>'
  },
  {
    from: '<td className="px-6 py-5 text-sm font-black text-black">{row.accuracy}%</td>',
    to: '<td className="px-6 py-5 text-sm font-black text-black dark:text-white">{row.accuracy}%</td>'
  },
  {
    from: '<td className="px-6 py-5 text-sm text-black"><div className="font-bold">{row.date}</div><div className="font-medium text-slate-500 mt-0.5">{row.time}</div></td>',
    to: '<td className="px-6 py-5 text-sm text-black dark:text-white"><div className="font-bold">{row.date}</div><div className="font-medium text-slate-500 dark:text-zinc-400 mt-0.5">{row.time}</div></td>'
  },
  {
    from: 'className="inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-xs font-black text-white hover:bg-slate-800 transition-colors"',
    to: 'className="inline-flex items-center gap-1.5 rounded-full bg-black dark:bg-white border-2 border-black dark:border-white px-4 py-2 text-xs font-black text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"'
  },
  {
    from: 'className="inline-flex items-center gap-1.5 rounded-full bg-white border-2 border-black text-black px-4 py-2 text-xs font-black hover:bg-[#FF8787] transition-colors"',
    to: 'className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white px-4 py-2 text-xs font-black hover:bg-[#FF8787] dark:hover:bg-[#FF8787] dark:hover:text-black transition-colors"'
  },
  {
    from: '<tr><td colSpan={7} className="px-6 py-12 text-center text-black font-black text-lg">No records found for this exam.</td></tr>',
    to: '<tr><td colSpan={7} className="px-6 py-12 text-center text-black dark:text-white font-black text-lg">No records found for this exam.</td></tr>'
  },
  // Modal details
  {
    from: 'bg-[#FDFBF7] border-[4px] border-black rounded-[2rem]',
    to: 'bg-[#FDFBF7] dark:bg-zinc-950 border-[4px] border-black dark:border-white rounded-[2rem]'
  },
  {
    from: 'border-b-[3px] border-black bg-white shrink-0 z-10',
    to: 'border-b-[3px] border-black dark:border-white bg-white dark:bg-black shrink-0 z-10'
  },
  {
    from: 'text-2xl font-black text-black font-serif',
    to: 'text-2xl font-black text-black dark:text-white font-serif'
  },
  {
    from: 'bg-white border-[3px] border-black hover:bg-[#FF8787] text-black px-6 py-2.5 rounded-full',
    to: 'bg-white dark:bg-black border-[3px] border-black dark:border-white hover:bg-[#FF8787] dark:hover:bg-[#FF8787] text-black dark:text-white dark:hover:text-black px-6 py-2.5 rounded-full'
  }
]);

// 2. MathsDashboard.tsx
replaceInFile('components/features/dashboard/MathsDashboard.tsx', [
  {
    from: '<tr key={row.id} className="border-b-[2px] border-slate-200 hover:bg-slate-50 transition-colors">',
    to: '<tr key={row.id} className="border-b-[2px] border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">'
  },
  {
    from: '<td className="px-6 py-5 font-black text-black">{index + 1}</td>',
    to: '<td className="px-6 py-5 font-black text-black dark:text-white">{index + 1}</td>'
  },
  {
    from: '<td className="px-6 py-5 font-black text-black">{row.exam}</td>',
    to: '<td className="px-6 py-5 font-black text-black dark:text-white">{row.exam}</td>'
  },
  {
    from: '<td className="px-6 py-5 text-sm font-black text-black">{row.passage}</td>',
    to: '<td className="px-6 py-5 text-sm font-black text-black dark:text-white">{row.passage}</td>'
  },
  {
    from: '<td className="px-6 py-5 text-sm font-black text-black">{row.accuracy}%</td>',
    to: '<td className="px-6 py-5 text-sm font-black text-black dark:text-white">{row.accuracy}%</td>'
  },
  {
    from: '<td className="px-6 py-5 text-sm text-black"><div className="font-bold">{row.date}</div><div className="font-medium text-slate-500 mt-0.5">{row.time}</div></td>',
    to: '<td className="px-6 py-5 text-sm text-black dark:text-white"><div className="font-bold">{row.date}</div><div className="font-medium text-slate-500 dark:text-zinc-400 mt-0.5">{row.time}</div></td>'
  },
  {
    from: 'className="inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-xs font-black text-white hover:bg-slate-800 transition-colors"',
    to: 'className="inline-flex items-center gap-1.5 rounded-full bg-black dark:bg-white border-2 border-black dark:border-white px-4 py-2 text-xs font-black text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"'
  },
  {
    from: 'className="inline-flex items-center gap-1.5 rounded-full bg-white border-2 border-black text-black px-4 py-2 text-xs font-black hover:bg-[#FF8787] transition-colors"',
    to: 'className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white px-4 py-2 text-xs font-black hover:bg-[#FF8787] dark:hover:bg-[#FF8787] dark:hover:text-black transition-colors"'
  },
  {
    from: '<tr><td colSpan={8} className="px-6 py-12 text-center text-black font-black text-lg">No mathematics records found matching your filters.</td></tr>',
    to: '<tr><td colSpan={8} className="px-6 py-12 text-center text-black dark:text-white font-black text-lg">No mathematics records found matching your filters.</td></tr>'
  },
  // Modal details
  {
    from: 'rounded-[2rem] bg-[#FDFBF7] border-[4px] border-black p-8',
    to: 'rounded-[2rem] bg-[#FDFBF7] dark:bg-zinc-950 border-[4px] border-black dark:border-white p-8'
  },
  {
    from: 'border-b-[3px] border-black pb-4',
    to: 'border-b-[3px] border-black dark:border-white pb-4'
  },
  {
    from: 'text-3xl font-black text-black font-serif',
    to: 'text-3xl font-black text-black dark:text-white font-serif'
  },
  {
    from: 'rounded-full bg-white border-[3px] border-black p-3 text-black hover:-translate-y-1',
    to: 'rounded-full bg-white dark:bg-black border-[3px] border-black dark:border-white p-3 text-black dark:text-white hover:-translate-y-1'
  },
  {
    from: 'rounded-[1.5rem] bg-white border-[3px] border-black p-6',
    to: 'rounded-[1.5rem] bg-white dark:bg-black border-[3px] border-black dark:border-white p-6'
  },
  {
    from: 'rounded-[1.5rem] bg-white p-6 border-[3px] border-black',
    to: 'rounded-[1.5rem] bg-white dark:bg-black p-6 border-[3px] border-black dark:border-white'
  },
  {
    from: 'text-xl font-black text-black',
    to: 'text-xl font-black text-black dark:text-white'
  }
]);

// 3. EnglishDashboard.tsx
replaceInFile('components/features/dashboard/EnglishDashboard.tsx', [
  {
    from: '<tr key={row.id} className="border-b-[2px] border-slate-200 hover:bg-slate-50 transition-colors">',
    to: '<tr key={row.id} className="border-b-[2px] border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">'
  },
  {
    from: '<td className="px-6 py-5 font-black text-black">{index + 1}</td>',
    to: '<td className="px-6 py-5 font-black text-black dark:text-white">{index + 1}</td>'
  },
  {
    from: '<td className="px-6 py-5 font-black text-black">{row.exam}</td>',
    to: '<td className="px-6 py-5 font-black text-black dark:text-white">{row.exam}</td>'
  },
  {
    from: '<td className="px-6 py-5 text-sm font-black text-black">{row.passage}</td>',
    to: '<td className="px-6 py-5 text-sm font-black text-black dark:text-white">{row.passage}</td>'
  },
  {
    from: '<td className="px-6 py-5 text-sm font-black text-black">{row.accuracy}%</td>',
    to: '<td className="px-6 py-5 text-sm font-black text-black dark:text-white">{row.accuracy}%</td>'
  },
  {
    from: '<td className="px-6 py-5 text-sm text-black"><div className="font-bold">{row.date}</div><div className="font-medium text-slate-500 mt-0.5">{row.time}</div></td>',
    to: '<td className="px-6 py-5 text-sm text-black dark:text-white"><div className="font-bold">{row.date}</div><div className="font-medium text-slate-500 dark:text-zinc-400 mt-0.5">{row.time}</div></td>'
  },
  {
    from: 'className="inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-xs font-black text-white hover:bg-slate-800 transition-colors"',
    to: 'className="inline-flex items-center gap-1.5 rounded-full bg-black dark:bg-white border-2 border-black dark:border-white px-4 py-2 text-xs font-black text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"'
  },
  {
    from: 'className="inline-flex items-center gap-1.5 rounded-full bg-white border-2 border-black text-black px-4 py-2 text-xs font-black hover:bg-[#FF8787] transition-colors"',
    to: 'className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white px-4 py-2 text-xs font-black hover:bg-[#FF8787] dark:hover:bg-[#FF8787] dark:hover:text-black transition-colors"'
  },
  {
    from: '<td colSpan={8} className="px-6 py-12 text-center text-black font-black text-lg">',
    to: '<td colSpan={8} className="px-6 py-12 text-center text-black dark:text-white font-black text-lg">'
  },
  // Modal details
  {
    from: 'rounded-[2rem] bg-[#FDFBF7] border-[4px] border-black p-8',
    to: 'rounded-[2rem] bg-[#FDFBF7] dark:bg-zinc-950 border-[4px] border-black dark:border-white p-8'
  },
  {
    from: 'border-b-[3px] border-black pb-4',
    to: 'border-b-[3px] border-black dark:border-white pb-4'
  },
  {
    from: 'text-3xl font-black text-black font-serif',
    to: 'text-3xl font-black text-black dark:text-white font-serif'
  },
  {
    from: 'rounded-full bg-white border-[3px] border-black p-3 text-black hover:-translate-y-1',
    to: 'rounded-full bg-white dark:bg-black border-[3px] border-black dark:border-white p-3 text-black dark:text-white hover:-translate-y-1'
  },
  {
    from: 'rounded-[1.5rem] bg-white border-[3px] border-black p-6',
    to: 'rounded-[1.5rem] bg-white dark:bg-black border-[3px] border-black dark:border-white p-6'
  },
  {
    from: 'rounded-[1.5rem] bg-white p-6 border-[3px] border-black',
    to: 'rounded-[1.5rem] bg-white dark:bg-black p-6 border-[3px] border-black dark:border-white'
  },
  {
    from: 'text-xl font-black text-black',
    to: 'text-xl font-black text-black dark:text-white'
  }
]);

console.log('Fixed dashboard text colors successfully!');

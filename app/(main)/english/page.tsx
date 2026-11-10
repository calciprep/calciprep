import Link from 'next/link';
import Image from 'next/image';
import { BookMarked, GitCompare, Replace, Quote, FileQuestion, ArrowRight } from 'lucide-react';
import AdSenseBlock from '@/components/common/AdSenseBlock';
import englishIllustration from '@/public/media/english-card-illustration.svg';

export default function EnglishPage() {
  const categories = [
    { name: 'Synonyms', icon: BookMarked, color: 'purple', to: '/english/quiz-list?category=Synonyms', description: 'Find words with similar meanings.' },
    { name: 'Antonyms', icon: GitCompare, color: 'amber', to: '/english/quiz-list?category=Antonyms', description: 'Find words with opposite meanings.' },
    { name: 'One Word Substitution', icon: Replace, color: 'rose', to: '/english/quiz-list?category=One Word Substitution', description: 'Replace a phrase with a single word.' },
    { name: 'Idioms and Phrases', icon: Quote, color: 'sky', to: '/english/quiz-list?category=Idioms and Phrases', description: 'Understand common idioms.' },
    { name: 'SSC PYQs', icon: FileQuestion, color: 'green', to: '/english/quiz-list?category=SSC PYQs', description: 'Practice previous year questions.' },
  ];

  const colorClasses: { [key: string]: { bg: string; text: string } } = {
    purple: { bg: 'bg-[#E6E6FA] dark:bg-[#2d224d]', text: 'text-purple-600 dark:text-purple-300' },
    amber: { bg: 'bg-[#FEF3C7] dark:bg-[#453011]', text: 'text-amber-600 dark:text-amber-300' },
    rose: { bg: 'bg-[#FFE4E6] dark:bg-[#4c1d24]', text: 'text-rose-600 dark:text-rose-300' },
    sky: { bg: 'bg-[#E0F2FE] dark:bg-[#0c3547]', text: 'text-sky-600 dark:text-sky-300' },
    green: { bg: 'bg-[#DCFCE7] dark:bg-[#143e26]', text: 'text-emerald-600 dark:text-emerald-300' },
  };

  return (
    <main className="container mx-auto px-6 pt-28 pb-12 transition-colors duration-200">
      <div className="rounded-[2rem] bg-gradient-to-r from-blue-600 to-sky-600 p-8 md:p-12 border-[3px] border-black dark:border-zinc-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(38,38,38,1)]">
        <div className="grid md:grid-cols-2 items-center gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-white font-serif tracking-tight">English Practice Arena</h1>
            <p className="text-blue-100 mt-4 text-lg font-sans font-medium">Strengthen your vocabulary and grammar. Choose a category to begin.</p>
          </div>
          <div className="hidden md:flex justify-center items-center">
            <Image src={englishIllustration} alt="English Mastery Illustration" className="h-56 w-auto drop-shadow-md" priority />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mt-12">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const { bg, text } = colorClasses[cat.color];
          return (
            <Link
              href={cat.to}
              key={cat.name}
              className={`flex flex-col border-[3px] border-black dark:border-zinc-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(38,38,38,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(38,38,38,1)] hover:-translate-y-2 transition-all duration-300 rounded-[2rem] overflow-hidden ${bg}`}
            >
              <div className="p-8 text-center flex flex-col flex-grow">
                <div className="flex-shrink-0">
                  <div className={`bg-white dark:bg-black border-[3px] border-black dark:border-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${text} w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto`}>
                    <Icon size={30} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-2xl font-black mb-2 text-slate-900 dark:text-white font-serif tracking-wide">{cat.name}</h2>
                  <p className="text-slate-800 dark:text-zinc-300 font-sans text-sm font-semibold">{cat.description}</p>
                </div>
              </div>
              <div className="p-5 bg-white dark:bg-black border-t-[3px] border-black dark:border-zinc-800 flex justify-between items-center mt-auto">
                <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm font-serif">Explore</span>
                <ArrowRight className="text-slate-900 dark:text-white" strokeWidth={2.5} size={20} />
              </div>
            </Link>
          );
        })}

        <div className="flex items-center justify-center p-4 rounded-[2rem] border-[3px] border-dashed border-slate-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950">
           <AdSenseBlock
              adSlot="8028804221"
              adFormat="fluid"
              adLayoutKey="-eb-4+3g-70+1q"
            />
        </div>
      </div>
    </main>
  );
}

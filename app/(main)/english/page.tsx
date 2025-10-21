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
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
    sky: { bg: 'bg-sky-100', text: 'text-sky-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
  };

  return (
    <main className="container mx-auto px-6 pt-28 pb-12">
      <style>{`
        .category-card {
          border: 1px solid #F3F4F6;
          border-radius: 1.5rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
        }
      `}</style>
      <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-sky-600 p-8 md:p-12">
        <div className="grid md:grid-cols-2 items-center gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white">English Practice Arena</h1>
            <p className="text-blue-100 mt-4 text-lg font-sans">Strengthen your vocabulary and grammar. Choose a category to begin.</p>
          </div>
          <div className="hidden md:flex justify-center items-center">
            <Image src={englishIllustration} alt="English Mastery Illustration" className="h-56 w-auto" priority />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mt-12">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const { bg, text } = colorClasses[cat.color];
          return (
            <Link href={cat.to} key={cat.name} className={`category-card ${bg}`}>
              <div className="p-8 text-center flex flex-col flex-grow">
                <div className="flex-shrink-0">
                  <div className={`bg-white/60 ${text} w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto`}>
                    <Icon size={32} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-gray-900">{cat.name}</h2>
                  <p className="text-gray-600 font-sans text-sm">{cat.description}</p>
                </div>
              </div>
              <div className="p-5 bg-white flex justify-between items-center mt-auto">
                <span className="font-semibold text-gray-800">Explore</span>
                <ArrowRight className="text-gray-400" />
              </div>
            </Link>
          );
        })}

        <div className="category-card bg-gray-50 flex items-center justify-center p-4 rounded-3xl">
           <AdSenseBlock
              adSlot="8028804221"
              adFormat="fluid"
              adLayoutKey="-eb-4+3g-70+1q"
            />
        </div>
      </div>
    </main>
  );
};

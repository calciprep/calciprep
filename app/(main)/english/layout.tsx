import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'English PYQ Vocabulary Quizzes & Practice | Calciprep',
  description: 'Master English vocabulary and grammar for SSC CGL, CHSL, and CPO. Practice topic-wise quizzes covering One Word Substitutions, Idioms & Phrases, Synonyms, and Antonyms based on past year papers.',
  keywords: [
    'ssc english pyq quiz',
    'blackbook english vocabulary practice',
    'one word substitution quiz online',
    'idioms and phrases test ssc',
    'english vocab mock test ssc cgl chsl'
  ],
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
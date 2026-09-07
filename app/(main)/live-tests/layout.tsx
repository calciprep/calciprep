import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Typing Tests & All India Leaderboard | Calciprep',
  description: 'Compete in real-time live typing tests for SSC CGL, CHSL, and Delhi Police exams. Check your All India Rank on the live leaderboard and track your speed and accuracy.',
  keywords: [
    'live typing test online',
    'ssc cgl live typing leaderboard',
    'delhi police typing test live',
    'all india rank typing test',
    'real time typing competition',
    'online typing test govt exams',
    'ssc cgl typing tests',
    'ssc cgl pyq typing tests',
    'ssc chsl pyq typing tests practice',
    'live delhi police hcm typing tests',
    'delhi police hcm pyq typing tests',
    'live dp hcm typing tests',
    'dp hcm pyq typing tests',
    'tcs pattern typing test',
    'ediquity pattern typing test',
    'typing speed tests for competitive exams',
  ],
};

export default function LiveTestsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
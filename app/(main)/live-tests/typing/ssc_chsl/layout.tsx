import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SSC CHSL Live Typing Test & Leaderboard | Calciprep',
  description: 'Compete in the live SSC CHSL typing skill test. Get your All India Rank, exact Error Percentage, and Net WPM calculated strictly on the official TCS/NTA pattern.',
};

export default function ChslLiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SSC CGL Live Typing Test & Leaderboard | Calciprep',
  description: 'Take the live SSC CGL typing test and check your All India Rank. Features exact TCS pattern interface with live error percentage calculation.',
};

export default function CGLLiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Delhi Police HCM Live Typing Test & Leaderboard | Calciprep',
  description: 'Take the live Delhi Police Head Constable (Ministerial) typing test and check your All India Rank. Features the strict official evaluation pattern (Gross WPM - Total Errors).',
};

export default function DpHcmLiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
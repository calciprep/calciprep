import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Online Typing Test Simulator for Govt Exams | Calciprep',
  description: 'Practice online typing tests modeled after official TCS and NTA interfaces. Accurate evaluation for SSC CGL, SSC CHSL, Delhi Police HCM, and RRB typing skill tests with instant error percentage and Net WPM analytics.',
  keywords: [
    'online typing test govt exams',
    'ssc cgl typing tests',
    'ssc cgl pyq typing tests',
    'ssc chsl pyq typing tests practice',
    'delhi police hcm typing tests',
    'delhi police hcm pyq typing tests',
    'dp hcm typing tests',
    'dp hcm pyq typing tests',
    'tcs pattern typing test',
    'ediquity pattern typing test',
    'typing speed tests for competitive exams',
  ],
};

export default function TypingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
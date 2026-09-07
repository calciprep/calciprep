import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Speed Maths & Mental Calculation Drills | Calciprep',
  description: 'Boost your calculation speed for SSC CGL, Banking, and Railway exams. Practice automated mental arithmetic drills, multiplication tables, squares, cubes, and speed math games.',
  keywords: [
    'speed maths calculation practice',
    'mental math drills online',
    'ssc maths calculation tricks',
    'fast calculation practice for competitive exams',
    'math speed test rrb ntpc banking'
  ],
};

export default function MathsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
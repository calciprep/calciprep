import { Suspense } from 'react';
import MathsQuizInterface from '@/components/features/maths/MathsQuizInterface';

// The page component now uses Suspense to handle loading of search parameters.
export default function MathsGamePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><p>Loading Challenge...</p></div>}>
      <MathsQuizInterface />
    </Suspense>
  );
}

import { getTypingParagraphs } from '@/services/dataService';
import TypingTestClient from '@/components/features/typing/TypingTestClient';
import { Suspense } from 'react';

export default async function TypingTestPage() {
  // Fetch the SSC test paragraphs from the data file.
  const rawData = await getTypingParagraphs();

  // FIX: The data is now passed directly. The client component will handle the structure.
  // This ensures that if the data fetching returns null, it is handled gracefully.
  const typingTests = rawData || null;

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <Suspense fallback={
        <div className="flex justify-center items-center h-screen">
          <p className="text-xl text-gray-600">Loading Typing Test...</p>
        </div>
      }>
        <TypingTestClient typingTests={typingTests} />
      </Suspense>
    </main>
  );
}

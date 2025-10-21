import { getLearnKeysExercises, getPracticeWords, getTypeParagraphs } from '@/services/dataService';
import LearnTypingClient from '@/components/features/typing/LearnTypingClient';
import { Suspense } from 'react';

export default async function LearnTypingPage() {
  // Fetch all necessary data on the server
  const learnKeysExercises = await getLearnKeysExercises();
  const practiceWords = await getPracticeWords();
  const typeParagraphs = await getTypeParagraphs();

  return (
    <main className="min-h-screen bg-gray-50">
        <Suspense fallback={
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-gray-600">Loading Typing Practice...</p>
            </div>
        }>
        <LearnTypingClient
            learnKeysExercises={learnKeysExercises}
            practiceWords={practiceWords}
            typeParagraphs={typeParagraphs}
        />
        </Suspense>
    </main>
  );
}


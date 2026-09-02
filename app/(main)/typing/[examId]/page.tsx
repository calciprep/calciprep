'use client';

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
// Added Download to the lucide-react imports
import { Info, FileText, Play, ArrowLeft, Download } from 'lucide-react';
import { exams } from '@/lib/typing';
import { Passage } from '@/lib/typing/types';


export default function PassageSelectionPage() {
  const params = useParams();
  const router = useRouter();

  const examId = params.examId as string;
  const examData = exams[examId];

  // Group passages by difficulty
  const groupedPassages = useMemo(() => {
    if (!examData) return {};

    const groups: Record<string, Passage[]> = {
      Easy: [],
      Medium: [],
      Hard: [],
    };

    examData.passages.forEach((p) => {
      const diff = p.difficulty || 'Easy';

      if (groups[diff]) {
        groups[diff].push(p);
      }
    });

    return groups;
  }, [examData]);

  /* STREAMING_CHUNK: Checking if exam exists... */
  if (!examData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Exam not found.
        </h1>

        <button
          onClick={() => router.push('/typing')}
          className="text-blue-500 underline hover:text-blue-700"
        >
          Return to Exams
        </button>
      </div>
    );
  }

  /* STREAMING_CHUNK: Rendering the Passage Selection UI... */
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Back Button */}
        <button
          onClick={() => router.push('/typing')}
          className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Exams
        </button>

        {/* Top Description Section */}
        <div className="flex flex-col items-center text-center mb-12">
          {examData.rules.logo && (
            <div className="h-24 w-24 relative mb-4">
              <Image
                src={examData.rules.logo}
                alt={examData.rules.name}
                fill
                className="object-contain"
              />
            </div>
          )}

          <h1 className="text-4xl font-bold text-[#6466f1] mb-6">
            {examData.rules.name}
          </h1>

          <p className="text-gray-600 max-w-3xl leading-relaxed text-lg">
            Practice for the {examData.rules.name} through our Computer Based
            Examination (CBE) interface. Improve your accuracy and speed before
            the final exam.
          </p>
        </div>

        {/* Rules Box */}
        <div className="bg-[#f8f9fa] border border-gray-200 rounded-lg p-6 mb-16 shadow-sm">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="flex items-center text-[#1a73e8] font-bold gap-1.5 text-lg">
              <Info size={20} />
              Typing Rules
            </span>

            <span className="flex items-center text-red-500 font-medium gap-1.5 border border-red-200 bg-red-50 px-3 py-1 rounded cursor-pointer text-sm">
              <FileText size={16} />
              Official PDF
            </span>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed text-justify">
            {examData.rules.description}
          </p>
        </div>

        {/* Passages Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#10b981]">Passages</h2>

          <div className="w-12 h-1 bg-[#1a73e8] mx-auto mt-4 rounded-full" />
        </div>

        {/* Difficulty Tables */}
{(Object.keys(groupedPassages) as Array<'Easy' | 'Medium' | 'Hard'>).map(
  (difficulty) => {
    const passages = groupedPassages[difficulty];

    if (passages.length === 0) return null;

    return (
      <div key={difficulty} className="mb-12">
        <h3 className="flex items-center text-[#10b981] font-semibold text-lg mb-4 gap-2">
          <span>
            {difficulty === 'Easy'
              ? '🙂'
              : difficulty === 'Medium'
                ? '😐'
                : '🔥'}
          </span>
          {difficulty} Level
        </h3>

        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e6f4ea] text-gray-700 text-sm border-b border-gray-200">
                <th className="py-3 px-4 font-semibold w-16">#</th>
                <th className="py-3 px-4 font-semibold">
                  Passage Name
                </th>

                {/* Added PDF Column Header */}
                <th className="py-3 px-4 font-semibold w-24 text-center">
                  PDF
                </th>

                <th className="py-3 px-4 font-semibold w-32 text-center">
                  Timing (Min)
                </th>

                <th className="py-3 px-4 font-semibold w-32 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {passages.map((passage, idx) => (
                <tr
                  key={passage.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4 text-gray-800 font-medium">
                    {idx + 1}
                  </td>

                  <td className="py-4 px-4 text-gray-700">
                    {passage.title}
                  </td>

                  {/* Added PDF Download Button Logic */}
                  <td className="py-4 px-4 text-center">
                    {passage.pdfUrl ? (
                      <a
                        href={passage.pdfUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                        title="Download Passage PDF"
                      >
                        <Download size={18} />
                      </a>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-gray-700 text-center">
                    {examData.rules.duration / 60}
                  </td>

                  <td className="py-4 px-4 text-center">
                    <Link
                      href={`/typing/${examData.rules.id}/${passage.id}`}
                      className="inline-flex items-center justify-center gap-1.5 bg-[#10b981] hover:bg-[#0d9668] text-white px-4 py-1.5 rounded-full font-medium transition-colors text-sm"
                    >
                      <Play size={14} fill="currentColor" />
                      Start
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
)}

</div>
</div>

  );
}
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Keyboard } from 'lucide-react';
import { getExamList } from '@/lib/typing';

export default function TypingExamSelectionPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const examList = getExamList();

  // Filter exams based on search input
  const filteredExams = examList.filter((exam) =>
    exam.rules.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* STREAMING_CHUNK: Rendering the Exam Selection UI... */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-[2.5rem] font-bold text-[#6466f1] mb-2 tracking-tight">
            All Typing Exams
          </h1>

          <p className="text-gray-500 text-lg">
            Practice and improve your typing skills with these exams
          </p>

          <div className="w-16 h-[3px] bg-[#1a73e8] mx-auto mt-6 rounded-full" />
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>

          <input
            type="text"
            className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] shadow-sm transition-all"
            placeholder="Search exams (e.g. SSC, NTPC, JSA...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Exam Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredExams.map((exam) => (
            <div
              key={exam.rules.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-lg transition-shadow duration-300 p-8 flex flex-col items-center text-center h-full"
            >
              <div className="h-20 w-20 relative mb-6 flex items-center justify-center">
                {exam.rules.logo ? (
                  <Image
                    src={exam.rules.logo}
                    alt={exam.rules.name}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                    {exam.rules.name.charAt(0)}
                  </div>
                )}
              </div>

              <h3 className="font-bold text-gray-800 text-lg mb-6 flex-1">
                {exam.rules.name}
              </h3>

              <Link
                href={`/typing/${exam.rules.id}`}
                className="w-full bg-[#1a73e8] hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-full inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Keyboard size={18} />
                Practice Now
              </Link>
            </div>
          ))}

          {filteredExams.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No exams found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
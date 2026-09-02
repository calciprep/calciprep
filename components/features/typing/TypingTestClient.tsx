"use client";

import React from 'react';
import TypingInterface from './TypingInterface';
import { TypingMode } from '@/lib/typing-types';

interface TypingTestClientProps {
  // The prop now expects an array of objects with a passage property.
  typingTests: { passage: string }[] | null;
}

const TypingTestClient: React.FC<TypingTestClientProps> = ({ typingTests }) => {
  // FIX: Extract the 'passage' string from each test object to match
  // the data structure expected by the TypingInterface's 'type-paragraphs' mode.
  const passages = typingTests ? typingTests.map(test => test.passage) : [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-gray-800">
        SSC Typing Tests
      </h1>
      
      {/* We reuse the existing TypingInterface component, 
        passing the transformed passages array and specifying the correct mode.
      */}
      <TypingInterface exercises={passages} mode={'type-paragraphs' as TypingMode} />
    </div>
  );
};

export default TypingTestClient;

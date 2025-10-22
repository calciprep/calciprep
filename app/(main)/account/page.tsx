"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

// This is the new page component that was missing or empty.
// Adding this 'export default' makes it a valid module and fixes the build error.
export default function AccountPage() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <main className="container mx-auto px-6 pt-28 pb-12 font-sans text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You must be logged in to view this page.
          </p>
          <Link 
            href="/" 
            className="inline-block bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition"
          >
            Go to Homepage
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-6 pt-28 pb-12 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">My Account</h1>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Full Name</label>
            <p className="text-lg font-semibold text-gray-800">
              {currentUser.displayName || 'Not set'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email Address</label>
            <p className="text-lg font-semibold text-gray-800">
              {currentUser.email}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email Verified</label>
            <p className={`text-lg font-semibold ${currentUser.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
              {currentUser.emailVerified ? 'Yes' : 'No'}
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}

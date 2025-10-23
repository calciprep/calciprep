"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AuthActionPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const mode = searchParams.get('mode');
        const actionCode = searchParams.get('oobCode');

        if (!mode || !actionCode) {
            setMessage('Invalid verification link. Please try again.');
            setStatus('error');
            return;
        }

        const handleAction = async () => {
            try {
                // Ensure Firebase Auth is available
                if (!auth) {
                    console.error('Firebase Auth not initialized.');
                    setMessage('Unable to verify link right now. Please try again later.');
                    setStatus('error');
                    return;
                }
                switch (mode) {
                    case 'verifyEmail':
                        // First, check if the code is valid to provide a better error message if it's expired.
                        await checkActionCode(auth, actionCode);
                        // If valid, apply the code to verify the user's email.
                        await applyActionCode(auth, actionCode);
                        setMessage('Your email has been successfully verified! You can now sign in.');
                        setStatus('success');
                        // Redirect to the account page after a short delay
                        setTimeout(() => router.push('/account'), 3000);
                        break;
                    
                    case 'resetPassword':
                        // Handle password reset logic here if you add it in the future
                        // For now, we'll just indicate it's not implemented.
                        setMessage('Password reset functionality is not yet implemented.');
                        setStatus('error');
                        break;
                        
                    default:
                        setMessage('Unsupported action. Please check the link.');
                        setStatus('error');
                }
           // Use Error or unknown type for caught errors
            } catch (error: unknown) { // Changed 'any' to 'unknown'
                console.error("Firebase Auth Action Error:", error);
                // Check if error is an object with a 'code' property before accessing it
                if (typeof error === 'object' && error !== null && 'code' in error) {
                    const firebaseError = error as { code: string }; // Type assertion
                    if (firebaseError.code === 'auth/expired-action-code') {
                        // Fix: Escape apostrophe
                        setMessage('This verification link has expired. Please request a new one.');
                    } else if (firebaseError.code === 'auth/invalid-action-code') {
                         // Fix: Escape apostrophe
                        setMessage('This verification link is invalid. It may have already been used.');
                    } else {
                        setMessage('An unexpected error occurred. Please try again.');
                    }
                } else {
                     setMessage('An unexpected error occurred. Please try again.');
                }
                setStatus('error');
            }
        };
        handleAction();
    }, [searchParams, router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="mx-auto h-12 w-12 text-indigo-600 animate-spin mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800">Processing...</h1>
                        <p className="text-gray-600 mt-2">{message}</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800">Success!</h1>
                        <p className="text-gray-600 mt-2">{message}</p>
                         <p className="text-sm text-gray-500 mt-4">Redirecting you shortly...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800">Error</h1>
                        <p className="text-gray-600 mt-2">{message}</p>
                        <Link href="/" className="mt-6 inline-block bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition">
                            Back to Homepage
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

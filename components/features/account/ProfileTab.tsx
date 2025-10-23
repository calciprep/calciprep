"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { User as UserIcon, Mail, CheckCircle, AlertCircle, Phone, Edit3, Loader2 } from 'lucide-react'; // Added Loader2

// Define props for the component, including the function to open the modal
interface ProfileTabProps {
    onOpenUpdateModal: () => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ onOpenUpdateModal }) => {
    // Added resendVerificationEmail and showNotification
    const { currentUser, userData, resendVerificationEmail, showNotification } = useAuth();
    const [isResending, setIsResending] = useState(false); // State for resend button loading

    if (!currentUser) return null; // Should not happen if AccountClient logic is correct

    // Use userData from context for username and phone
    const displayName = currentUser.displayName || userData?.name || 'N/A';
    const username = userData?.username || 'N/A';
    const phoneNumber = userData?.phoneNumber || 'Not Added';
    const profilePic = currentUser.photoURL || '/media/default-avatar.png'; // Fallback avatar

    const handleResendVerification = async () => {
        if (!currentUser) return; // Guard clause
        setIsResending(true);
        try {
            await resendVerificationEmail(currentUser);
            showNotification("Verification email sent! Check your inbox.", "success");
        } catch (error) {
            console.error("Error resending verification email:", error);
             // Error notification is handled by safeServiceCall in context
        } finally {
            setIsResending(false);
        }
    };


    return (
        // Removed max-w-xl and mx-auto to allow left alignment
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-200">
                <Image
                    src={profilePic}
                    alt="Profile Picture"
                    width={96}
                    height={96}
                    className="rounded-full border-4 border-white shadow-md object-cover flex-shrink-0"
                    onError={(e) => { e.currentTarget.src = '/media/default-avatar.png'; }}
                />
                <div className="text-center sm:text-left flex-grow">
                    <h2 className="text-2xl font-bold text-gray-800">{displayName}</h2>
                    <p className="text-gray-500">@{username}</p>
                </div>
                 {/* Button is moved below */}
            </div>

            {/* Profile Details */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail size={20} className="text-gray-400 flex-shrink-0" />
                    <div>
                        <p className="text-xs font-medium text-gray-500">Email Address</p>
                        <p className="text-sm font-semibold text-gray-800 break-all">{currentUser.email}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    {currentUser.emailVerified ? (
                        <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                        <p className="text-xs font-medium text-gray-500">Email Verification</p>
                        <p className={`text-sm font-semibold ${currentUser.emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                            {currentUser.emailVerified ? 'Verified' : 'Not Verified'}
                        </p>
                        {!currentUser.emailVerified && (
                             <button
                                onClick={handleResendVerification}
                                disabled={isResending} // Disable while sending
                                className="mt-1 text-xs text-indigo-600 hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                {isResending ? (
                                    <>
                                        <Loader2 size={12} className="animate-spin" /> Sending...
                                    </>
                                ) : (
                                    'Resend Verification Email'
                                )}
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone size={20} className="text-gray-400 flex-shrink-0" />
                    <div>
                        <p className="text-xs font-medium text-gray-500">Phone Number</p>
                        <p className="text-sm font-semibold text-gray-800">{phoneNumber}</p>
                    </div>
                </div>
                {/* Add more fields here as needed */}
            </div>

             {/* Moved Update Profile Button Here */}
             <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
                 <button
                    onClick={onOpenUpdateModal}
                    // Mimic Security Tab Button Style
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2"
                >
                    Update Profile
                </button>
            </div>
        </div>
    );
};

export default ProfileTab;


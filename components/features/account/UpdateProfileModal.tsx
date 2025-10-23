"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, X, User, AtSign, Phone } from 'lucide-react';
import { mapAuthError } from '@/lib/authTypes';

interface UpdateProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ProfileFormInputs {
    name: string;
    username: string;
    phoneNumber?: string; // Optional
}

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({ isOpen, onClose }) => {
    // Correctly get checkUsernameAvailability from useAuth
    const { currentUser, userData, updateUserProfile, fetchUserData, checkUsernameAvailability, showNotification, firebaseReady } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    // Combined state for check status and result message
    const [usernameStatus, setUsernameStatus] = useState<{
        status: 'idle' | 'checking' | 'available' | 'unavailable' | 'error';
        message: string | null;
    }>({ status: 'idle', message: null });
    const [checkedUsername, setCheckedUsername] = useState<string>(''); // Store the username that was last checked

    // Destructure getValues from useForm
    const { register, handleSubmit, reset, watch, formState: { errors, isDirty, dirtyFields }, getValues, setError, clearErrors } = useForm<ProfileFormInputs>({
        defaultValues: {
            name: '',
            username: '',
            phoneNumber: ''
        },
        mode: 'onChange' // Ensure isDirty updates on change
    });

    const watchedUsername = watch('username');
    // Ref to hold the latest getValues function for use in async/cleanup
    const getValuesRef = useRef(getValues);
    useEffect(() => {
        getValuesRef.current = getValues;
    }, [getValues]);


    // Effect to reset form when modal opens or user/userData changes
    useEffect(() => {
        if (isOpen && currentUser && userData) {
            const initialUsername = userData.username || '';
            reset({
                name: currentUser.displayName || userData.name || '',
                username: initialUsername,
                phoneNumber: userData.phoneNumber || ''
            });
            setUsernameStatus({ status: 'idle', message: null }); // Reset username availability check
            setCheckedUsername(initialUsername); // Initialize checkedUsername with the current username
            clearErrors("username"); // Clear any previous username errors
        }
         // Reset loading state if modal is closed externally
         if (!isOpen) {
             setIsLoading(false);
         }
    }, [isOpen, currentUser, userData, reset, clearErrors]);

    // Effect for debounced username check
    useEffect(() => {
        const initialUsername = userData?.username || '';
        // Only run check if the username field is actually dirty AND different from the initial username
        if (!dirtyFields.username || !watchedUsername || watchedUsername === initialUsername) {
            setUsernameStatus({ status: 'idle', message: null }); // No check needed if same as original or empty/too short
            clearErrors("username"); // Clear errors if username reverts to original or becomes invalid for checking
            return;
        }

        if (watchedUsername.length < 3) {
            setError("username", { type: "minLength", message: "Min 3 characters" });
            setUsernameStatus({ status: 'idle', message: null }); // Reset status if it becomes too short
            return; // Don't check if too short
        } else {
            clearErrors("username"); // Clear length error if it becomes valid
        }

        // Debounce mechanism
        setUsernameStatus({ status: 'checking', message: 'Checking availability...' });
        const handler = setTimeout(async () => {
            const currentUsernameValue = getValuesRef.current().username;

            // Ensure the value hasn't changed again since timeout started OR reverted to original
            if (currentUsernameValue !== watchedUsername || currentUsernameValue === initialUsername) {
                 if(currentUsernameValue === initialUsername) setUsernameStatus({ status: 'idle', message: null });
                 return;
            }

            try {
                console.log(`Checking username availability for: ${currentUsernameValue}`);
                if (!firebaseReady) {
                    console.warn('Firebase not ready for username check');
                    setUsernameStatus({ status: 'error', message: 'Service not ready' });
                    setError('username', { type: 'manual', message: 'Service not ready' });
                    return;
                }
                const isAvailable = await checkUsernameAvailability(currentUsernameValue);
                // Update status only if the checked username matches the current input
                if (currentUsernameValue === getValuesRef.current().username) { // Re-check against latest value
                   setCheckedUsername(currentUsernameValue); // Record the username that was checked
                   if (isAvailable) {
                       setUsernameStatus({ status: 'available', message: 'Username available!' });
                       clearErrors("username"); // Clear error if it becomes available
                   } else {
                       setUsernameStatus({ status: 'unavailable', message: 'Username not available.' });
                       setError("username", { type: "manual", message: "Username not available" });
                   }
                }
                 console.log(`Username "${currentUsernameValue}" available: ${isAvailable}`);
          } catch (error) {
                 console.error("Username check failed:", error);
                      if (currentUsernameValue === getValuesRef.current().username) { // Re-check against latest value
                    setCheckedUsername(currentUsernameValue); // Still record what was checked
                    setUsernameStatus({ status: 'error', message: 'Error checking username.' });
                    setError("username", { type: "manual", message: "Error checking username" });
                 }
            }
        }, 500); // Check 500ms after user stops typing

        return () => {
            clearTimeout(handler);
        };
    // Added initialUsername to dependencies
    }, [watchedUsername, checkUsernameAvailability, userData?.username, clearErrors, dirtyFields.username, setError, firebaseReady]);


    const onSubmit: SubmitHandler<ProfileFormInputs> = async (data) => {
        if (!currentUser || !firebaseReady) {
            showNotification("Not logged in or Firebase not ready.", "error");
            return;
        }

        const updates: Partial<ProfileFormInputs> = {};
        // FIX: Removed unused 'usernameChanged' variable
        // let usernameChanged = false;

        if (dirtyFields.name) updates.name = data.name;
        if (dirtyFields.username) {
            // FIX: Removed assignment to unused 'usernameChanged'
            // usernameChanged = true;
            // Strict check: Only proceed if the *last checked username* matches the *current value* AND its status is 'available'
            if (usernameStatus.status !== 'available' || watchedUsername !== checkedUsername) {
                 showNotification("Please choose an available username and wait for the check to complete.", "error");
                 return; // Prevent submission
            }
             updates.username = data.username;
        }
        // Always include phone number if the field was touched/changed, even if cleared
        if (dirtyFields.phoneNumber) {
             updates.phoneNumber = data.phoneNumber || ''; // Send empty string to clear, service handles null conversion
        }

        // If no fields were marked dirty by react-hook-form
        if (!isDirty || Object.keys(updates).length === 0) {
            showNotification("No changes detected to save.", "success");
            onClose();
            return;
        }

        setIsLoading(true);
        // Safety fallback: ensure loading doesn't spin forever
        const safetyTimer = setTimeout(() => {
            if (isLoading) {
                console.error('Profile update taking too long, clearing loading state.');
                setIsLoading(false);
                showNotification('Update taking too long. Please try again.', 'error');
            }
        }, 20000);
        console.log("Submitting profile update with:", updates);

        try {
            await updateUserProfile(currentUser, updates as { name?: string; username?: string; phoneNumber?: string });
            showNotification("Profile updated successfully!", "success");
            await fetchUserData(); // Refresh user data in context
            onClose();
        } catch (error: unknown) {
            console.error("Profile update failed:", error);
            const errorMsg = mapAuthError(error);
            showNotification(errorMsg, "error");
             // If the error was specifically about the username during the transaction
             if (errorMsg.toLowerCase().includes("username")) {
                 setUsernameStatus({ status: 'unavailable', message: 'Username already taken.' });
                 setError("username", { type: "manual", message: "Username already taken" });
             }
        } finally {
            clearTimeout(safetyTimer);
            setIsLoading(false);
            console.log("Finished profile update attempt.");
        }
    };

     // Helper to display username status message and color
    const getUsernameStatusDisplay = () => {
        // Don't show status if the username field isn't dirty or matches original
        if (!dirtyFields.username || watchedUsername === userData?.username || !watchedUsername || watchedUsername.length < 3) {
            return { message: "\u00A0", colorClass: "text-gray-500" }; // Use non-breaking space for height
        }

        // Show message only if it corresponds to the currently watched username
        if (watchedUsername === checkedUsername || usernameStatus.status === 'checking') {
             switch (usernameStatus.status) {
                case 'checking':
                    return { message: usernameStatus.message, colorClass: "text-gray-500" };
                case 'available':
                    return { message: usernameStatus.message, colorClass: "text-green-600" };
                case 'unavailable':
                case 'error':
                    return { message: usernameStatus.message, colorClass: "text-red-600" };
                case 'idle':
                default:
                    return { message: "\u00A0", colorClass: "text-gray-500" }; // Placeholder
            }
        }
        // If check is stale (watchedUsername !== checkedUsername), show checking again
        return { message: "Checking availability...", colorClass: "text-gray-500" };
    };
    const usernameStatusDisplay = getUsernameStatusDisplay();


    if (!isOpen) return null;

     // Determine if save should be disabled
     const isSaveDisabled = isLoading
         || !isDirty // No changes made *at all*
         || !firebaseReady // Firebase not ready
         // OR Username specifically is dirty AND the check status is NOT 'available' for the *current* username
         || (dirtyFields.username && (usernameStatus.status !== 'available' || watchedUsername !== checkedUsername));


    return (
        <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-gray-800 p-6 border-b border-gray-200">
                    Edit Profile
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    {/* Full Name */}
                    <div>
                        <label htmlFor="profileName" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <User size={18} />
                            </span>
                             <input
                                id="profileName"
                                {...register('name', { required: 'Name is required' })}
                                type="text"
                                placeholder="Your full name"
                                className={`w-full p-3 pl-10 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    {/* Username */}
                    <div>
                        <label htmlFor="profileUsername" className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                         <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <AtSign size={18} />
                            </span>
                            <input
                                id="profileUsername"
                                {...register('username', {
                                    required: 'Username is required',
                                    minLength: { value: 3, message: 'Min 3 characters' },
                                    pattern: { value: /^[a-z0-9_]+$/i, message: 'Only letters, numbers, _ allowed' }
                                })}
                                type="text"
                                placeholder="Choose a unique username"
                                className={`w-full p-3 pl-10 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                                maxLength={20}
                                aria-describedby="username-status" // Link input to status message
                            />
                        </div>
                         <div id="username-status" className="mt-1 min-h-[1rem]"> {/* Ensure status area has height */}
                            <p className={`text-xs h-4 ${usernameStatusDisplay.colorClass}`}>
                                {usernameStatusDisplay.message}
                            </p>
                         </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label htmlFor="profilePhone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number (Optional)
                        </label>
                         <div className="relative">
                             <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <Phone size={18} />
                            </span>
                            <input
                                id="profilePhone"
                                {...register('phoneNumber', {
                                    pattern: { value: /^[+]?[0-9\s-()]*$/, message: 'Invalid phone number format' }
                                })}
                                type="tel"
                                placeholder="Enter your phone number"
                                className={`w-full p-3 pl-10 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                            />
                        </div>
                        {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaveDisabled} // Use combined disabled state
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateProfileModal;

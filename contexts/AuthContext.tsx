"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback, useRef } from 'react';
import { User } from 'firebase/auth';
import { appInitialized, } from '@/lib/firebase'; 
import {
      signUp as fbSignUp,
    signIn as fbSignIn,
    logout as fbLogout,
    resetPassword as fbResetPassword,
    subscribeToAuthChanges,
    signInWithGoogle as fbSignInWithGoogle,
    resendVerificationEmail as fbResendVerificationEmail,
    createVerifiedUserData,
    updateUserProfile as fbUpdateUserProfile,
    updateUserPassword as fbUpdateUserPassword,
    getUserData as fbGetUserData,
    checkUsernameAvailability as fbCheckUsernameAvailability
} from '../services/authService'; // Changed to relative
import { mapAuthError } from '../lib/authTypes'; // Changed to relative
import { DocumentData } from 'firebase/firestore'; // Import DocumentData

// Define type for additional user data from Firestore
interface UserData {
    username?: string;
    phoneNumber?: string | null;
    name?: string;
    photoURL?: string | null;
    createdAt?: unknown; // Could be Timestamp or ServerTimestampFieldValue
    // Add other fields as needed
}

// Update context type - Ensure function signatures match the implementation
interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  authLoading: boolean; // Renamed for clarity
  userDataLoading: boolean; // Added specific loading state for user data
  firebaseReady: boolean;
  isModalOpen: boolean;
  isLoginMode: boolean;
  notification: { message: string; type: string; visible: boolean };
  openModal: (loginMode?: boolean) => void;
  closeModal: () => void;
  setLoginMode: (isLogin: boolean) => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  hideNotification: () => void;
  // Use specific types matching fbSignUp etc.
  signup: typeof fbSignUp;
  login: typeof fbSignIn;
  logout: typeof fbLogout;
  resetPassword: typeof fbResetPassword;
  signInWithGoogle: typeof fbSignInWithGoogle;
  resendVerificationEmail: typeof fbResendVerificationEmail;
  createVerifiedUserData: typeof createVerifiedUserData;
  updateUserProfile: typeof fbUpdateUserProfile;
  updateUserPassword: typeof fbUpdateUserPassword;
  fetchUserData: () => Promise<void>; // This one is defined locally
  checkUsernameAvailability: typeof fbCheckUsernameAvailability;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // Tracks initial auth state check
  const [userDataLoading, setUserDataLoading] = useState(false); // Tracks Firestore data fetch
  const [firebaseReady, setFirebaseReady] = useState(appInitialized);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoginMode, setLoginMode] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });
  const notificationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Modal and Notification Handlers --- (Keep useCallback)
  const openModal = useCallback((loginMode = false) => {
    setLoginMode(loginMode);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, visible: false }));
  }, []);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (notificationTimer.current) {
        clearTimeout(notificationTimer.current);
    }
    setNotification({ message, type, visible: true });
    notificationTimer.current = setTimeout(() => {
        hideNotification();
    }, 5000);
  }, [hideNotification]);

  // --- Firebase Readiness Check ---
  useEffect(() => {
    setFirebaseReady(appInitialized);
    if (!appInitialized) {
        setAuthLoading(false); // Ensure loading stops if Firebase isn't ready
        showNotification("Firebase failed to initialize.", "error");
        console.error("Auth Context: Firebase not ready on mount.");
    }
    return () => {
        if (notificationTimer.current) {
            clearTimeout(notificationTimer.current);
        }
    }
  }, [showNotification]); // Keep dependency

  // --- User Data Fetching ---
  const fetchUserData = useCallback(async () => {
    // Check user first, then readiness
    if (!currentUser) {
        console.log("Auth Context: Skipping fetchUserData - No current user.");
        setUserData(null);
        setUserDataLoading(false); // Ensure loading stops if no user
        return;
    }
    if (!firebaseReady) {
        console.log("Auth Context: Skipping fetchUserData - Firebase not ready.");
        setUserData(null);
        setUserDataLoading(false); // Ensure loading stops if not ready
        return;
    }

    console.log("Auth Context: Starting to fetch user data for", currentUser.uid);
    setUserDataLoading(true); // Start loading user data
    try {
      const data: DocumentData | null = await fbGetUserData(currentUser.uid);
      console.log("Auth Context: Fetched user data:", data);
      setUserData(data ? data as UserData : null);
    } catch (error) {
      console.error("Auth Context: Error fetching user data:", error);
       // Check if the error is network related before showing notification
       // Simple check for offline or network error messages
       const errorString = mapAuthError(error).toLowerCase();
       if (!errorString.includes('offline') && !errorString.includes('network')) {
            showNotification("Could not load profile details.", "error");
       }
      setUserData(null);
    } finally {
        console.log("Auth Context: Finished fetching user data for", currentUser.uid);
        setUserDataLoading(false); // ALWAYS stop loading user data
    }
  }, [currentUser, firebaseReady, showNotification]);


  // --- Auth State Subscription ---
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (firebaseReady) {
        console.log("Auth Context: Firebase ready, subscribing to auth changes.");
        unsubscribe = subscribeToAuthChanges(async (user) => {
            console.log("Auth Context: Auth state received. User:", user ? user.uid : null);
            const userChanged = currentUser?.uid !== user?.uid;
            setCurrentUser(user);

            // Fetch data ONLY if the user object itself has changed (login/logout/token refresh with new UID)
            if (user && userChanged) {
                 console.log("Auth Context: User changed, fetching user data...");
                 await fetchUserData(); // Fetch data if user logs in or changes
            } else if (!user && currentUser) { // Only clear if there WAS a user before
                console.log("Auth Context: User logged out, clearing user data.");
                setUserData(null); // Clear data on logout
            }
             // Set authLoading to false ONLY after the first check completes
            setAuthLoading(false);
        });
    } else {
        console.log("Auth Context: Firebase not ready, cannot subscribe.");
        setCurrentUser(null);
        setUserData(null);
        setAuthLoading(false); // Set loading false if Firebase isn't ready
    }

    return () => {
      if (unsubscribe) {
        console.log("Auth Context: Unsubscribing from auth changes.");
        unsubscribe();
      }
    };
  // Ensure fetchUserData is stable or included if its dependencies might change currentUser
  }, [firebaseReady, fetchUserData, currentUser]); // currentUser?.uid might cause unnecessary refetches if token refreshes


  // --- Modal Body Class ---
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('auth-modal-open');
    } else {
      document.body.classList.remove('auth-modal-open');
    }
    return () => {
      document.body.classList.remove('auth-modal-open');
    };
  }, [isModalOpen]);

  // --- Context Value ---
  // FIX: Reverted 'args' type to 'unknown[]' but used 'as any[]' when spreading to satisfy TS/ESLint
  const safeServiceCall = <T extends (...args: any[]) => Promise<any>>(serviceFn: T | undefined, serviceNameForError: string): (...args: Parameters<T>) => ReturnType<T> => {
    // If service isn't provided, return a function that immediately rejects with a helpful error
    if (!serviceFn) {
      return (((..._args: Parameters<T>) => {
        const errorMsg = `${serviceNameForError} service not ready. Please try again.`;
        showNotification(errorMsg, 'error');
        return Promise.reject(new Error(errorMsg));
      }) as unknown) as (...args: Parameters<T>) => ReturnType<T>;
    }

    // Otherwise return a wrapper that preserves parameter and return types of the original function
    return (async (...args: Parameters<T>): Promise<any> => {
      if (!firebaseReady) {
        console.error(`Attempted to call ${serviceNameForError} before ready.`);
        const errorMsg = `${serviceNameForError} service not ready. Please try again.`;
        showNotification(errorMsg, 'error');
        throw new Error(errorMsg);
      }
      try {
        // Call the original function and return its result
        return await serviceFn(...(args as any[]));
      } catch (error) {
        console.error(`Error in ${serviceNameForError}:`, error);
        showNotification(mapAuthError(error), 'error');
        throw error;
      }
    }) as (...args: Parameters<T>) => ReturnType<T>;
  };


  const value: AuthContextType = {
    currentUser,
    userData,
    authLoading,
    userDataLoading,
    firebaseReady,
    isModalOpen,
    isLoginMode,
    notification,
    openModal,
    closeModal,
    setLoginMode,
    showNotification,
    hideNotification,
    // Wrap the imported functions safely
    signup: safeServiceCall(fbSignUp, 'Signup'),
    login: safeServiceCall(fbSignIn, 'Login'),
    logout: safeServiceCall(fbLogout, 'Logout'),
    resetPassword: safeServiceCall(fbResetPassword, 'Password Reset'),
    signInWithGoogle: safeServiceCall(fbSignInWithGoogle, 'Google Sign-In'),
    resendVerificationEmail: safeServiceCall(fbResendVerificationEmail, 'Resend Verification'),
    createVerifiedUserData: safeServiceCall(createVerifiedUserData, 'Create User Data'),
    updateUserProfile: safeServiceCall(fbUpdateUserProfile, 'Update Profile'),
    updateUserPassword: safeServiceCall(fbUpdateUserPassword, 'Update Password'),
    // fetchUserData is defined in this hook, wrap it too for consistency
    fetchUserData: safeServiceCall(fetchUserData, 'Fetch User Data'),
    checkUsernameAvailability: safeServiceCall(fbCheckUsernameAvailability, 'Check Username'),
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Render children only after initial auth check is done */}
      {!authLoading ? children : null /* Optionally show a loader here */}
    </AuthContext.Provider>
  );
};
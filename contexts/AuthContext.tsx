"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback, useRef } from 'react';
import { User, UserCredential } from 'firebase/auth';
import { appInitialized, db } from '@/lib/firebase'; // Import db and appInitialized
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
} from '@/services/authService';
import { mapAuthError } from '@/lib/authTypes';

// Define type for additional user data from Firestore
interface UserData {
    username?: string;
    phoneNumber?: string | null;
    name?: string;
    photoURL?: string | null;
    createdAt?: any;
    // Add other fields as needed
}

// Update context type
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
  signup: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<UserCredential>;
  resendVerificationEmail: (user: User) => Promise<void>;
  createVerifiedUserData: (user: User, name: string, username: string) => Promise<void>;
  updateUserProfile: (user: User, updates: { name?: string; username?: string; phoneNumber?: string }) => Promise<void>;
  updateUserPassword: (currentPassword?: string, newPassword?: string) => Promise<void>;
  fetchUserData: () => Promise<void>; // Kept return type as Promise<void>
  checkUsernameAvailability: (username: string) => Promise<boolean>;
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
  const notificationTimer = useRef<NodeJS.Timeout | undefined>(undefined);

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
    if (!firebaseReady || !db) { // Added db check
        console.log("Auth Context: Skipping fetchUserData - Firebase not ready.");
        setUserData(null);
        setUserDataLoading(false); // Ensure loading stops if not ready
        return;
    }

    console.log("Auth Context: Starting to fetch user data for", currentUser.uid);
    setUserDataLoading(true); // Start loading user data
    try {
      const data = await fbGetUserData(currentUser.uid);
      console.log("Auth Context: Fetched user data:", data);
      setUserData(data ? data as UserData : null);
    } catch (error) {
      console.error("Auth Context: Error fetching user data:", error);
       if (!mapAuthError(error).includes('offline')) {
            showNotification("Could not load profile details.", "error");
       }
      setUserData(null);
    } finally {
        console.log("Auth Context: Finished fetching user data for", currentUser.uid);
        setUserDataLoading(false); // ALWAYS stop loading user data
    }
  // Added db to dependencies
  }, [currentUser, firebaseReady, showNotification, db]);


  // --- Auth State Subscription ---
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (firebaseReady) {
        console.log("Auth Context: Firebase ready, subscribing to auth changes.");
        // Keep authLoading true until the *first* auth state is received
        // setAuthLoading(true); // Already true initially
        unsubscribe = subscribeToAuthChanges(async (user) => {
            console.log("Auth Context: Auth state received. User:", user ? user.uid : null);
            const userChanged = currentUser?.uid !== user?.uid;
            setCurrentUser(user);

            if (user && userChanged) {
                 await fetchUserData(); // Fetch data if user logs in or changes
            } else if (!user) {
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
  // Adjusted dependency array - fetchUserData is called internally
  }, [firebaseReady, fetchUserData, currentUser?.uid]); // Re-added currentUser?.uid


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
  // safeServiceCall wrapper remains the same as previous correct version
  const safeServiceCall = <T extends (...args: any[]) => Promise<any>>(
        serviceFn: T | undefined,
        serviceNameForError: string
    ): T => {
        return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
            if (!firebaseReady || !serviceFn) {
                console.error(`Attempted to call ${serviceNameForError} before ready.`);
                showNotification(`${serviceNameForError} not ready. Please try again.`, "error");
                throw new Error(`${serviceNameForError} not ready.`);
            }
            try {
                return await serviceFn(...args);
            } catch (error) {
                console.error(`Error in ${serviceNameForError}:`, error);
                showNotification(mapAuthError(error), "error");
                throw error;
            }
        }) as T;
    };


  const value: AuthContextType = {
    currentUser,
    userData,
    authLoading, // Use separate state
    userDataLoading, // Use separate state
    firebaseReady,
    isModalOpen,
    isLoginMode,
    notification,
    openModal,
    closeModal,
    setLoginMode,
    showNotification,
    hideNotification,
    // Wrapped functions remain the same
    signup: safeServiceCall(fbSignUp, 'Signup'),
    login: safeServiceCall(fbSignIn, 'Login'),
    logout: safeServiceCall(fbLogout, 'Logout'),
    resetPassword: safeServiceCall(fbResetPassword, 'Password Reset'),
    signInWithGoogle: safeServiceCall(fbSignInWithGoogle, 'Google Sign-In'),
    resendVerificationEmail: safeServiceCall(fbResendVerificationEmail, 'Resend Verification'),
    createVerifiedUserData: safeServiceCall(createVerifiedUserData, 'Create User Data'),
    updateUserProfile: safeServiceCall(fbUpdateUserProfile, 'Update Profile'),
    updateUserPassword: safeServiceCall(fbUpdateUserPassword, 'Update Password'),
    fetchUserData: safeServiceCall(fetchUserData, 'Fetch User Data'),
    checkUsernameAvailability: safeServiceCall(fbCheckUsernameAvailability, 'Check Username'),
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Render children only after initial auth check is done */}
      {!authLoading && children}
    </AuthContext.Provider>
  );
};


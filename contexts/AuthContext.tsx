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
} from '../services/authService'; 
import { mapAuthError } from '../lib/authTypes'; 
import { DocumentData } from 'firebase/firestore'; 

interface UserData {
    username?: string;
    phoneNumber?: string | null;
    name?: string;
    photoURL?: string | null;
    createdAt?: unknown; 
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  authLoading: boolean; 
  userDataLoading: boolean; 
  firebaseReady: boolean;
  isModalOpen: boolean;
  isLoginMode: boolean;
  notification: { message: string; type: string; visible: boolean };
  openModal: (loginMode?: boolean) => void;
  closeModal: () => void;
  setLoginMode: (isLogin: boolean) => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  hideNotification: () => void;
  signup: typeof fbSignUp;
  login: typeof fbSignIn;
  logout: typeof fbLogout;
  resetPassword: typeof fbResetPassword;
  signInWithGoogle: typeof fbSignInWithGoogle;
  resendVerificationEmail: typeof fbResendVerificationEmail;
  createVerifiedUserData: typeof createVerifiedUserData;
  updateUserProfile: typeof fbUpdateUserProfile;
  updateUserPassword: typeof fbUpdateUserPassword;
  // FIXED: Allowed passing the fresh user directly to avoid stale state bugs
  fetchUserData: (userToFetch?: User | null) => Promise<void>; 
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
  const [authLoading, setAuthLoading] = useState(true); 
  const [userDataLoading, setUserDataLoading] = useState(false); 
  const [firebaseReady, setFirebaseReady] = useState(appInitialized);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoginMode, setLoginMode] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });
  const notificationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    setFirebaseReady(appInitialized);
    if (!appInitialized) {
        setAuthLoading(false); 
        showNotification("Firebase failed to initialize.", "error");
        console.error("Auth Context: Firebase not ready on mount.");
    }
    return () => {
        if (notificationTimer.current) {
            clearTimeout(notificationTimer.current);
        }
    }
  }, [showNotification]); 

  // FIXED: Now accepts the fresh user from the Auth Listener
  const fetchUserData = useCallback(async (userToFetch?: User | null) => {
    const activeUser = userToFetch !== undefined ? userToFetch : currentUser;

    if (!activeUser) {
        setUserData(null);
        setUserDataLoading(false);
        return;
    }
    if (!firebaseReady) {
        setUserData(null);
        setUserDataLoading(false); 
        return;
    }

    setUserDataLoading(true); 
    try {
      let data: DocumentData | null = await fbGetUserData(activeUser.uid);
      
      // =========================================================================
      // THE SAFETY NET FIX: If the user is authenticated but missing from Firestore 
      // (Google Sign-In or interrupted verification), auto-create them right now!
      // =========================================================================
      if (!data) {
          console.log("Auth Context: User doc missing in Firestore. Auto-creating...");
          const name = activeUser.displayName || 'Student';
          const username = activeUser.email?.split('@')[0] || `user${activeUser.uid.substring(0, 5)}`;
          
          try {
              await createVerifiedUserData(activeUser, name, username.toLowerCase());
              data = await fbGetUserData(activeUser.uid); // Fetch the newly created profile
          } catch (createErr) {
              console.error("Failed to auto-create missing user document:", createErr);
          }
      }

      setUserData(data ? data as UserData : null);
    } catch (error) {
      console.error("Auth Context: Error fetching user data:", error);
       const errorString = mapAuthError(error).toLowerCase();
       if (!errorString.includes('offline') && !errorString.includes('network')) {
            showNotification("Could not load profile details.", "error");
       }
      setUserData(null);
    } finally {
        setUserDataLoading(false); 
    }
  }, [currentUser, firebaseReady, showNotification]);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (firebaseReady) {
        unsubscribe = subscribeToAuthChanges(async (user) => {
            const userChanged = currentUser?.uid !== user?.uid;
            setCurrentUser(user);

            if (user && userChanged) {
                 // FIXED: Pass the fresh user immediately to prevent stale state drops
                 await fetchUserData(user); 
            } else if (!user && currentUser) { 
                setUserData(null); 
            }
            setAuthLoading(false);
        });
    } else {
        setCurrentUser(null);
        setUserData(null);
        setAuthLoading(false); 
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [firebaseReady, fetchUserData, currentUser]); 


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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safeServiceCall = <T extends (...args: any[]) => Promise<any>>(serviceFn: T | undefined, serviceNameForError: string): (...args: Parameters<T>) => ReturnType<T> => {
    if (!serviceFn) {
      return (((..._args: Parameters<T>) => {
        const errorMsg = `${serviceNameForError} service not ready. Please try again.`;
        showNotification(errorMsg, 'error');
        return Promise.reject(new Error(errorMsg));
      }) as unknown) as (...args: Parameters<T>) => ReturnType<T>;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (async (...args: Parameters<T>): Promise<any> => {
      if (!firebaseReady) {
        const errorMsg = `${serviceNameForError} service not ready. Please try again.`;
        showNotification(errorMsg, 'error');
        throw new Error(errorMsg);
      }
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      {!authLoading ? children : null}
    </AuthContext.Provider>
  );
};
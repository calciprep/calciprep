"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import {
    signUp,
    signIn,
    logout,
    resetPassword,
    subscribeToAuthChanges,
    signInWithGoogle,
    resendVerificationEmail,
    createUserDataIfNeeded
} from '@/services/authService';
import { mapAuthError } from '@/lib/authTypes'; // *** FIX: Import mapAuthError ***

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isModalOpen: boolean;
  isLoginMode: boolean;
  notification: { message: string; type: string; visible: boolean };
  openModal: (loginMode?: boolean) => void;
  closeModal: () => void;
  setLoginMode: (isLogin: boolean) => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  hideNotification: () => void;
  signup: typeof signUp;
  login: typeof signIn;
  logout: typeof logout;
  resetPassword: typeof resetPassword;
  signInWithGoogle: typeof signInWithGoogle;
  resendVerificationEmail: typeof resendVerificationEmail;
  ensureUserData: (user: User, name?: string | null, username?: string | null) => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoginMode, setLoginMode] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });
  const notificationTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const initialUserDataCheckDone = useRef(false);


  const openModal = (loginMode = false) => {
    setLoginMode(loginMode);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    if (notificationTimer.current) {
        clearTimeout(notificationTimer.current);
    }
    setNotification({ message, type, visible: true });
    notificationTimer.current = setTimeout(() => {
        hideNotification();
    }, 5000);
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

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

  useEffect(() => {
    if (!auth || !db) {
        console.error("Firebase not fully initialized!");
        setLoading(false);
        return;
    }

    console.log("Setting up Firebase Auth listener...");
    const unsubscribe = subscribeToAuthChanges(user => {
      console.log("Auth state changed:", user ? `User UID: ${user.uid}` : "No user");
      setCurrentUser(user);
      setLoading(false);
      initialUserDataCheckDone.current = false;
    });

    return () => {
        console.log("Cleaning up Firebase Auth listener...");
        unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (currentUser && !initialUserDataCheckDone.current) {
        console.log(`User ${currentUser.uid} detected, ensuring user data...`);
        initialUserDataCheckDone.current = true;

        const ensureData = async () => {
            try {
                await createUserDataIfNeeded(currentUser, currentUser.displayName, null);
                console.log(`User data check/creation successful for ${currentUser.uid}`);
            } catch (error) {
                console.error(`Failed to ensure user data for ${currentUser.uid}:`, error);
            }
        };

        const timerId = setTimeout(() => {
            ensureData();
        }, 1500);

        return () => clearTimeout(timerId);
    } else if (!currentUser) {
        initialUserDataCheckDone.current = false;
    }
  }, [currentUser]);

   const ensureUserData = async (user: User, name?: string | null, username?: string | null) => {
        try {
            await createUserDataIfNeeded(user, name, username);
        } catch (error) {
            console.error("Manual ensureUserData call failed:", error);
            // *** FIX: Now mapAuthError is available ***
            showNotification(mapAuthError(error), "error");
        }
   };

  const value: AuthContextType = {
    currentUser,
    loading,
    isModalOpen,
    isLoginMode,
    notification,
    openModal,
    closeModal,
    setLoginMode,
    showNotification,
    hideNotification,
    signup: signUp,
    login: signIn,
    logout,
    resetPassword,
    signInWithGoogle,
    resendVerificationEmail,
    ensureUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};


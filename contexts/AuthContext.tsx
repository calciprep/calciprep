"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { 
    signUp, 
    signIn, 
    logout, 
    resetPassword, 
    subscribeToAuthChanges,
    signInWithGoogle,
    resendVerificationEmail,
    createVerifiedUserData
} from '@/services/authService';

// Define the shape of the context data
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
  createVerifiedUserData: typeof createVerifiedUserData;
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
  const notificationTimer = React.useRef<NodeJS.Timeout | undefined>(undefined);


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
    const unsubscribe = subscribeToAuthChanges(user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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
    createVerifiedUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

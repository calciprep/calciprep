import React, { createContext, useState, useContext, useEffect } from 'react';
import { signUp, signIn, logout, resetPassword, subscribeToAuthChanges } from '../../../services/authService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoginMode, setLoginMode] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const openModal = (loginMode = false) => {
    setLoginMode(loginMode);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 4000);
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    isModalOpen,
    isLoginMode,
    notification,
    openModal,
    closeModal,
    setLoginMode,
    showNotification,
    signup: signUp,
    login: signIn,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};


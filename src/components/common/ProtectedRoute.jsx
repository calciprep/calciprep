import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

/**
 * A component that renders its children only if a user is authenticated.
 * If the user is not authenticated, it redirects them to the home page.
 * It also handles the initial loading state of authentication.
 */
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // While Firebase is checking the user's login status, show a loading message.
  // This prevents the page from flashing or redirecting incorrectly on first load.
  if (loading) {
    return (
      <div className="flex justify-center items-center pt-48">
        <div className="text-lg font-semibold text-gray-700">Loading Account...</div>
      </div>
    );
  }

  // If loading is finished and there is no user, redirect to the home page.
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // If loading is finished and a user exists, show the protected content (the page).
  return children;
};

export default ProtectedRoute;

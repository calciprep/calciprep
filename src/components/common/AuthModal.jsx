import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { CheckCircle, XCircle } from 'lucide-react';

const AuthModal = () => {
  const { 
    isModalOpen, 
    closeModal, 
    isLoginMode, 
    setLoginMode,
    signup,
    login,
    resetPassword,
    showNotification
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Password strength state
  const [strength, setStrength] = useState({
    hasUpperCase: false,
    hasNumberOrSymbol: false,
    isLongEnough: false,
  });

  useEffect(() => {
    if (!isLoginMode && !isResetMode) {
      setStrength({
        hasUpperCase: /[A-Z]/.test(password),
        hasNumberOrSymbol: /[0-9!@#$%^&*()]/.test(password),
        isLongEnough: password.length >= 8,
      });
    }
  }, [password, isLoginMode, isResetMode]);

  const mapAuthError = (error) => {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'No account found with this email/password. Please check your credentials or sign up.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in.';
      case 'auth/weak-password':
        return 'Password should be at least 8 characters long.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isResetMode) {
        await resetPassword(email);
        showNotification('Password reset link sent! Check your inbox.');
        setIsResetMode(false);
        setLoginMode(true);
      } else if (isLoginMode) {
        await login(email, password);
        showNotification('Signed in successfully!');
        closeModal();
      } else {
        await signup(email, password);
        showNotification('Account created successfully!');
        closeModal();
      }
    } catch (error) {
      showNotification(mapAuthError(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    closeModal();
    // Reset state after a short delay to allow for closing animation
    setTimeout(() => {
        setIsResetMode(false);
        setEmail('');
        setPassword('');
    }, 300);
  }
  
  const handleTabClick = (loginMode) => {
      setLoginMode(loginMode);
      setIsResetMode(false);
  }

  const handleForgotPassword = (e) => {
      e.preventDefault();
      setIsResetMode(true);
  }

  if (!isModalOpen) {
    return null;
  }
  
  const PasswordCriterion = ({ text, isMet }) => (
    <li className={`flex items-center transition-colors ${isMet ? 'text-green-600' : 'text-gray-500'}`}>
      {isMet ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
      <span>{text}</span>
    </li>
  );

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 font-sans animate-fade-in"
        onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl grid lg:grid-cols-[400px_1fr] relative max-h-[90vh]"
        onClick={e => e.stopPropagation()}
    >
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 z-20 text-3xl leading-none">&times;</button>
        
        <div className="hidden lg:block bg-gray-100 rounded-l-2xl">
          <img src="/media/Registration-left-panel.svg" alt="CalciPrep Welcome" className="w-full h-full object-cover rounded-l-2xl" />
        </div>
  
        <div className="p-8 sm:p-12 flex flex-col justify-center overflow-y-auto">
          <div className="w-full max-w-md mx-auto">
            <img src="/media/New-logo.svg" alt="CalciPrep Logo" className="h-8 mb-6" />
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Abril Fatface', cursive" }}>
              {isResetMode ? 'Reset your password' : isLoginMode ? 'Welcome back!' : 'Create your account'}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {isResetMode ? "We'll send a recovery link to your email." : isLoginMode ? 'Sign in to continue your progress.' : "Let's get started on your journey."}
            </p>
            
            {!isResetMode && (
                <div className="flex border-b mb-6">
                    <button onClick={() => handleTabClick(false)} className={`flex-1 pb-2 font-semibold text-sm border-b-2 ${!isLoginMode ? 'border-purple-600 text-purple-600' : 'text-gray-500 border-transparent'}`}>Sign Up</button>
                    <button onClick={() => handleTabClick(true)} className={`flex-1 pb-2 font-semibold text-sm border-b-2 ${isLoginMode ? 'border-purple-600 text-purple-600' : 'text-gray-500 border-transparent'}`}>Sign In</button>
                </div>
            )}
  
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Id</label>
                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" />
              </div>

              {!isResetMode && (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    {isLoginMode && <a href="#" onClick={handleForgotPassword} className="text-sm text-purple-600 hover:underline">Forgot Password?</a>}
                    </div>
                    <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" placeholder="Enter Password" className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" />
                </div>
              )}
              
              {!isLoginMode && !isResetMode && (
                <div className="text-sm text-gray-600 space-y-2 mb-6">
                  <ul className="text-xs space-y-1.5">
                    <PasswordCriterion text="Mix of Capital and small letters" isMet={strength.hasUpperCase} />
                    <PasswordCriterion text="At least 8 characters" isMet={strength.isLongEnough} />
                    <PasswordCriterion text="Contains a number or symbol" isMet={strength.hasNumberOrSymbol} />
                  </ul>
                </div>
              )}
  
              <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white rounded-md py-3 text-base font-semibold shadow-sm hover:bg-purple-700 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed">
                {loading ? 'Processing...' : isResetMode ? 'Send Recovery Link' : isLoginMode ? 'Sign In' : 'Create Account'}
              </button>

              {isResetMode && (
                <div className="text-center mt-4">
                    <a href="#" onClick={() => setIsResetMode(false)} className="text-sm text-purple-600 hover:underline">Back to Sign In</a>
                </div>
              )}
            </form>

            {!isLoginMode && !isResetMode && (
              <p className="text-center text-xs text-gray-500 mt-6">
                By signing up, you agree to our <a href="#" className="underline">Terms of Use & Privacy Policy</a>.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;


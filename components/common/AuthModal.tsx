"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Inputs, strength, mapAuthError } from '@/lib/authTypes';
import { Loader2, Eye, EyeOff, X, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const AuthModal = () => {
    const { 
        isModalOpen, closeModal, isLoginMode, setLoginMode, 
        signup, login, showNotification, signInWithGoogle,
        resendVerificationEmail, createVerifiedUserData, resetPassword
    } = useAuth();
    
    const { register, handleSubmit, watch, formState: { errors }, reset, getValues } = useForm<Inputs>();

    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<strength>({ hasUpperCase: false, hasNumberOrSymbol: false, isLongEnough: false });
    const [showPassword, setShowPassword] = useState(false);

    const [authStep, setAuthStep] = useState<'form' | 'verifyEmail' | 'verifiedSuccess' | 'forgotPassword'>('form');
    const [verifyingUser, setVerifyingUser] = useState<any>(null);
    const verificationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const passwordValue = watch('password', '');

    useEffect(() => {
        if (isModalOpen) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isModalOpen]);
    
    useEffect(() => {
        if (passwordValue !== undefined) {
            setPasswordStrength({
                hasUpperCase: /[A-Z]/.test(passwordValue),
                hasNumberOrSymbol: /[0-9!@#$%^&*]/.test(passwordValue),
                isLongEnough: passwordValue.length >= 8,
            });
        }
    }, [passwordValue]);

    const handleModeToggle = (mode: 'login' | 'signup') => {
        setLoginMode(mode === 'login');
        reset();
        setIsUsernameAvailable(null);
        setShowPassword(false);
        setAuthStep('form');
    };
    
    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setLoading(true);
        try {
            if (isLoginMode) {
                await login(data.email, data.password);
                showNotification('Signed in successfully!');
                handleClose();
            } else {
                const userCredential = await signup(data.email, data.password);
                setVerifyingUser(userCredential.user);
                setAuthStep('verifyEmail');
            }
        } catch (error: any) {
            showNotification(mapAuthError(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setSocialLoading(true);
        try {
            await signInWithGoogle();
            showNotification('Signed in successfully!');
            handleClose();
        } catch (error: any) {
            showNotification(mapAuthError(error), 'error');
        } finally {
            setSocialLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        const email = getValues("email");
        if (!email) {
            showNotification("Please enter your email address first.", "error");
            return;
        }
        setLoading(true);
        try {
            await resetPassword(email);
            showNotification("Password reset link sent! Please check your email.");
            setAuthStep('form');
        } catch (error: any) {
            showNotification(mapAuthError(error), "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authStep === 'verifyEmail' && verifyingUser) {
            verificationIntervalRef.current = setInterval(async () => {
                await verifyingUser.reload();
                if (verifyingUser.emailVerified) {
                    clearInterval(verificationIntervalRef.current!);
                    const { name, username } = getValues();
                    if (name && username) {
                      await createVerifiedUserData(verifyingUser, name, username);
                    }
                    setAuthStep('verifiedSuccess');
                }
            }, 3000);
        }

        return () => {
            if (verificationIntervalRef.current) {
                clearInterval(verificationIntervalRef.current);
            }
        };
    }, [authStep, verifyingUser, createVerifiedUserData, getValues]);

    const handleResendEmail = async () => {
        if (verifyingUser) {
            try {
                await resendVerificationEmail(verifyingUser);
                showNotification('Verification email sent again.');
            } catch (error: any) {
                showNotification(mapAuthError(error), 'error');
            }
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            closeModal();
            reset();
            setIsUsernameAvailable(null);
            setShowPassword(false);
            setAuthStep('form');
            setVerifyingUser(null);
            if (verificationIntervalRef.current) {
                clearInterval(verificationIntervalRef.current);
            }
        }, 300);
    }
    
    if (!isModalOpen) return null;

    const StrengthIndicator = ({ met, text }: { met: boolean; text: string }) => (
      <div className={`strength-indicator ${met ? 'met' : ''}`}>{text}</div>
    );

    const renderFormContent = () => (
      <form id="form" onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className={`signup-fields-wrapper ${!isLoginMode ? 'open' : ''}`}>
              <input {...register('name', { required: !isLoginMode && 'Name is required' })} type="text" placeholder="Full Name" className="auth-input" />
              <input {...register('username', { required: !isLoginMode && 'Username is required', minLength: { value: 3, message: 'Min 3 characters' } })} type="text" placeholder="Username" className="auth-input" />
          </div>
          <input {...register('email', { required: 'Email is required' })} type="email" placeholder="Email Address" className="auth-input" />
          
          {isLoginMode && (
             <div className="password-wrapper">
                <input {...register('password', { required: 'Password is required' })} type={showPassword ? 'text' : 'password'} placeholder="Password" className="auth-input" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
          )}

          {!isLoginMode && (
            <>
                <div className="password-wrapper">
                    <input {...register('password', { required: 'Password is required' })} type={showPassword ? 'text' : 'password'} placeholder="Password" className="auth-input" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <div className="password-strength-container">
                    <StrengthIndicator met={passwordStrength.isLongEnough} text="8+ characters" />
                    <StrengthIndicator met={passwordStrength.hasUpperCase} text="1 uppercase" />
                    <StrengthIndicator met={passwordStrength.hasNumberOrSymbol} text="1 number/symbol" />
                </div>
            </>
          )}

          {isLoginMode && (
            <button type="button" onClick={() => setAuthStep('forgotPassword')} className="forgot-password-btn">
                Forgot password?
            </button>
          )}

          <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? <Loader2 className="animate-spin" /> : (isLoginMode ? 'Sign In' : 'Create Account')}
          </button>
      </form>
    );

    const renderForgotPasswordContent = () => (
        <div className="text-center p-4">
            <Mail className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Reset Your Password</h3>
            <p className="text-gray-600 mb-6">Enter your email and we'll send you a link to get back into your account.</p>
            <div className="w-full mb-4">
                <input {...register('email', { required: 'Email is required' })} type="email" placeholder="Email Address" className="auth-input w-full" />
            </div>
            <button onClick={handleForgotPassword} disabled={loading} className="auth-submit-btn w-full">
                {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
            </button>
        </div>
    );

    const renderVerificationContent = () => (
        <div className="text-center p-4">
            <Mail className="mx-auto h-16 w-16 text-indigo-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h3>
            <p className="text-gray-600 mb-6">
                We've sent a verification link to <strong>{verifyingUser?.email}</strong>. Please check your inbox and click the link to activate your account.
            </p>
            <p className="text-sm text-gray-500 mb-6">This window will update automatically once you're verified.</p>
            <button onClick={handleResendEmail} className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
                Didn't receive an email? Resend
            </button>
        </div>
    );

    const renderSuccessContent = () => (
        <div className="text-center p-4">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h3>
            <p className="text-gray-600 mb-6">
                Your account is now active. Welcome to CalciPrep!
            </p>
            <Link 
                href="/account"
                onClick={handleClose} 
                className="inline-block bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition"
            >
                Go to My Account
            </Link>
        </div>
    );

    const renderContent = () => {
        switch(authStep) {
            case 'verifyEmail': return renderVerificationContent();
            case 'verifiedSuccess': return renderSuccessContent();
            case 'forgotPassword': return renderForgotPasswordContent();
            case 'form':
            default:
                return (
                    <>
                        <h2 className="form-title">{isLoginMode ? 'Welcome Back!' : 'Create Your Account'}</h2>
                        <p className="form-subtitle">
                            {isLoginMode ? "Don't have an account?" : "Already have an account?"}
                            <button onClick={() => handleModeToggle(isLoginMode ? 'signup' : 'login')} className="form-toggle-btn">
                                {isLoginMode ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                        <button onClick={handleGoogleSignIn} disabled={socialLoading} className="social-btn">
                            {socialLoading ? <Loader2 className="animate-spin" /> : (
                                <>
                                    <svg role="img" viewBox="0 0 24 24" className="google-icon">
                                        <path fill="#4285F4" d="M22.56,12.25C22.56,11.45 22.49,10.66 22.34,9.89H12.29V14.4H18.1C17.82,16.03 16.9,17.39 15.58,18.32V21.11H19.5C21.46,19.34 22.56,16.08 22.56,12.25Z" />
                                        <path fill="#34A853" d="M12.29,23C15.2,23 17.65,22.03 19.5,20.55L15.58,17.77C14.59,18.44 13.51,18.81 12.29,18.81C9.69,18.81 7.47,17.07 6.64,14.7L2.5,14.7V17.58C4.33,20.89 7.99,23 12.29,23Z" />
                                        <path fill="#FBBC05" d="M6.64,13.84C6.44,13.23 6.32,12.58 6.32,11.9C6.32,11.22 6.44,10.57 6.64,9.96V7.17L2.5,7.17C1.72,8.69 1.25,10.26 1.25,11.9C1.25,13.54 1.72,15.11 2.5,16.63L6.64,13.84Z" />
                                        <path fill="#EA4335" d="M12.29,5.05C13.68,5.05 14.9,5.54 15.89,6.48L19.58,2.92C17.65,1.14 15.2,0.15 12.29,0.15C7.99,0.15 4.33,2.95 2.5,6.26L6.64,9.04C7.47,6.77 9.69,5.05 12.29,5.05Z" />
                                    </svg>
                                    Sign in with Google
                                </>
                            )}
                        </button>

                        <div className="divider">OR</div>
                        
                        {renderFormContent()}
                    </>
                );
        }
    }

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`auth-modal-container transform-gpu transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} ${isLoginMode ? 'mode-login' : 'mode-signup'}`}>
                
                {authStep === 'form' && (
                    <button onClick={handleClose} className="close-button">
                        <X size={24} />
                    </button>
                )}
                 {authStep === 'forgotPassword' && (
                     <button onClick={() => setAuthStep('form')} className="close-button back-button">
                        &larr; Back to login
                    </button>
                )}

                <div className="illustration-wrapper">
                    <Image src="/media/authentication.svg" alt="Authentication Illustration" width={400} height={400} className="illustration-svg" priority />
                </div>

                <div className="form-content">
                    <div className="form-inner-content">
                        {renderContent()}
                        
                        {authStep === 'form' && (
                             <div className="legal-links">
                                By continuing, you agree to CalciPrep's <br />
                                <Link href="/terms-conditions" onClick={handleClose}>Terms of Service</Link> & <Link href="/privacy-policy" onClick={handleClose}>Privacy Policy</Link>.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;


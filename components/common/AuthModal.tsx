"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Inputs, strength, mapAuthError } from '@/lib/authTypes';
import { Loader2, Eye, EyeOff, X, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { User as FirebaseUser } from 'firebase/auth';
import { AnimatePresence, motion } from 'framer-motion';


const AuthModal = () => {
    const {
        isModalOpen, closeModal, isLoginMode, setLoginMode,
        signup, login, showNotification, signInWithGoogle,
        resendVerificationEmail, ensureUserData, resetPassword
    } = useAuth();

    const { register, handleSubmit, watch,  reset, getValues } = useForm<Inputs>();

    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<strength>({ hasUpperCase: false, hasNumberOrSymbol: false, isLongEnough: false });
    const [showPassword, setShowPassword] = useState(false);

    const [authStep, setAuthStep] = useState<'form' | 'verifyEmail' | 'verifiedSuccess' | 'forgotPassword'>('form');
    const [verifyingUser, setVerifyingUser] = useState<FirebaseUser | null>(null);
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
        setShowPassword(false);
        setAuthStep('form');
        setLoading(false);
        setSocialLoading(false);
        setVerifyingUser(null);
        if (verificationIntervalRef.current) {
            clearInterval(verificationIntervalRef.current);
            verificationIntervalRef.current = null;
        }
    };

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setLoading(true);
        try {
            if (isLoginMode) {
                await login(data.email, data.password);
                showNotification("Signed in successfully!");
                handleClose();
            } else {
                const userCredential = await signup(data.email, data.password);
                setVerifyingUser(userCredential.user);
                setAuthStep('verifyEmail');
            }
        } catch (error: unknown) {
            showNotification(mapAuthError(error), 'error');
            setLoading(false); // Make sure loading stops on error
        }
        // setLoading(false); // Removed duplicate setLoading(false)
    };

    const handleGoogleSignIn = async () => {
        setSocialLoading(true);
        try {
            await signInWithGoogle();
            showNotification("Signed in successfully!");
            handleClose();
        } catch (error: unknown) {
            showNotification(mapAuthError(error), 'error');
            if (mapAuthError(error).includes('offline')) {
                 showNotification("Login succeeded, but profile sync failed (offline). Please check connection.", 'error');
            }
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
            setAuthStep('form'); // Go back to login form after sending link
        } catch (error: unknown) {
            showNotification(mapAuthError(error), "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (verificationIntervalRef.current) {
            clearInterval(verificationIntervalRef.current);
            verificationIntervalRef.current = null;
            console.log("Cleared previous verification interval");
        }

        if (authStep === 'verifyEmail' && verifyingUser) {
            setLoading(false);

            console.log(`Starting verification check interval for ${verifyingUser.uid}`);
            verificationIntervalRef.current = setInterval(async () => {
                if (!verifyingUser) {
                     if (verificationIntervalRef.current) clearInterval(verificationIntervalRef.current);
                     return;
                }

                try {
                    await verifyingUser.reload();
                    console.log("Checked verification status:", verifyingUser.emailVerified);

                    if (verifyingUser.emailVerified) {
                        console.log(`User ${verifyingUser.uid} is now verified.`);
                        if (verificationIntervalRef.current) {
                            clearInterval(verificationIntervalRef.current);
                            verificationIntervalRef.current = null;
                            console.log("Cleared verification interval after success.");
                        }

                        try {
                            const { name, username } = getValues();
                            await ensureUserData(verifyingUser, name, username);
                            console.log(`Ensured user data for verified user ${verifyingUser.uid}`);
                        } catch (userDataError) {
                            console.error("Error ensuring user data after verification:", userDataError);
                        }

                        setAuthStep('verifiedSuccess');
                    }
                } catch (reloadError) {
                    console.error("Error reloading user:", reloadError);
                }
            }, 3000);
        }

        return () => {
            if (verificationIntervalRef.current) {
                clearInterval(verificationIntervalRef.current);
                verificationIntervalRef.current = null;
                console.log("Cleared verification interval on effect cleanup");
            }
        };
    }, [authStep, verifyingUser, getValues, ensureUserData]);


     const handleResendEmail = async () => {
        if (verifyingUser) {
            try {
                await resendVerificationEmail(verifyingUser);
                showNotification('Verification email sent again.');
            } catch (error: unknown) {
                showNotification(mapAuthError(error), 'error');
            }
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            closeModal();
            reset();
            setShowPassword(false);
            setAuthStep('form');
            setLoading(false);
            setSocialLoading(false);
            setVerifyingUser(null);
            if (verificationIntervalRef.current) {
                clearInterval(verificationIntervalRef.current);
                verificationIntervalRef.current = null;
                console.log("Cleared verification interval on handleClose");
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
              <input {...register('name', { required: !isLoginMode ? 'Name is required' : false })} type="text" placeholder="Full Name" className="auth-input" />
              <input {...register('username', { required: !isLoginMode ? 'Username is required' : false, minLength: !isLoginMode ? { value: 3, message: 'Min 3 characters' } : undefined })} type="text" placeholder="Username" className="auth-input" />
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
        <div className="text-center p-4 flex flex-col items-center justify-center h-full">
            <Mail className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Reset Your Password</h3>
            <p className="text-gray-600 mb-6">Enter your email and we&apos;ll send you a link to get back into your account.</p>
            <div className="w-full mb-4">
                <input {...register('email', { required: 'Email is required' })} type="email" placeholder="Email Address" className="auth-input w-full" />
            </div>
            <button onClick={handleForgotPassword} disabled={loading} className="auth-submit-btn w-full">
                {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
            </button>
            <button onClick={() => setAuthStep('form')} className="mt-4 text-sm text-gray-600 hover:text-gray-800 font-semibold">
                Back to login
            </button>
        </div>
    );

    // --- Updated Verification Content Layout ---
    const renderVerificationContent = () => (
         <div className="text-center p-4 flex flex-col items-center justify-center h-full">
            <Mail className="mx-auto h-16 w-16 text-indigo-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h3>
            <p className="text-gray-600 mb-6 max-w-sm">
                We&apos;ve sent a verification link to <strong className="break-words">{verifyingUser?.email}</strong>. Please check your inbox and click the link to activate your account.
            </p>
            <p className="text-sm text-gray-500 mb-6">
                This window will update automatically once you&apos;re verified. (You may need to check your spam folder)
            </p>
            <div className="flex justify-center items-center my-4">
                <Loader2 className="animate-spin text-indigo-500" size={24}/>
                <span className="ml-2 text-gray-500">Waiting for verification...</span>
            </div>
            <button onClick={handleResendEmail} className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
                Didn&apos;t receive an email? Resend
            </button>
             <button onClick={() => handleModeToggle('signup')} className="mt-4 text-sm text-gray-600 hover:text-gray-800 font-semibold block mx-auto">
                Go Back
            </button>
        </div>
    );
     // --- End Updated Verification Content ---

     const renderSuccessContent = () => (
        <div className="text-center p-4 flex flex-col items-center justify-center h-full">
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

    const renderMainFormArea = () => (
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

             <div className="legal-links">
                By continuing, you agree to CalciPrep&apos;s <br />
                <Link href="/terms-conditions" onClick={handleClose}>Terms of Service</Link> & <Link href="/privacy-policy" onClick={handleClose}>Privacy Policy</Link>.
            </div>
        </>
    );

    const renderContentForStep = () => {
        switch(authStep) {
            case 'verifyEmail': return renderVerificationContent();
            case 'verifiedSuccess': return renderSuccessContent();
            case 'forgotPassword': return renderForgotPasswordContent();
            case 'form':
            default: return renderMainFormArea();
        }
    }

    // Determine if the illustration should be shown based on the current step
    const showIllustration = authStep === 'form'; // Only show for the main form step

    return (
        // Added pointer-events-none when not visible
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
             {/* Use authStep in key to force remount/animation */}
            <div key={authStep} className={`auth-modal-container transform-gpu transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} ${isLoginMode ? 'mode-login' : 'mode-signup'}`}>

                {/* Close/Back Buttons */}
                {authStep === 'form' && (
                    <button onClick={handleClose} className="close-button">
                        <X size={24} />
                    </button>
                )}
                 {(authStep === 'forgotPassword' || authStep === 'verifyEmail') && (
                     <button onClick={() => setAuthStep('form')} className="close-button back-button">
                        &larr; Back
                    </button>
                )}


                {/* Illustration Area (conditionally rendered) */}
                {showIllustration && (
                    <div className="illustration-wrapper">
                        <Image src="/media/authentication.svg" alt="Authentication Illustration" width={400} height={400} className="illustration-svg" priority />
                    </div>
                )}


                {/* Form/Content Area */}
                {/* Adjust grid template when illustration is hidden */}
                 <div className={`form-content ${!showIllustration ? 'col-span-full centered-content' : ''}`}>
                    <AnimatePresence mode="wait">
                         <motion.div
                            key={authStep} // Use authStep as key for animation
                            initial={{ opacity: 0, x: showIllustration ? 50 : 0 }} // Animate from right only if illustration is shown
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: showIllustration ? -50 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="form-inner-content" // Ensure content is centered vertically too if needed
                         >
                            {renderContentForStep()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;


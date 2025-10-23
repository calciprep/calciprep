"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Inputs, strength, mapAuthError } from '@/lib/authTypes';
import { Loader2, Eye, EyeOff, X, Mail, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { User as FirebaseUser } from 'firebase/auth';

const AuthModal = () => {
    const {
        isModalOpen, closeModal, isLoginMode, setLoginMode,
        signup, login, showNotification, signInWithGoogle,
        resendVerificationEmail, // Use the correct name from context
        createVerifiedUserData, resetPassword,
        firebaseReady
    } = useAuth();

    const { register, handleSubmit, watch,  reset, getValues, formState: { errors } } = useForm<Inputs>();

    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<strength>({ hasUpperCase: false, hasNumberOrSymbol: false, isLongEnough: false });
    const [showPassword, setShowPassword] = useState(false);

    const [authStep, setAuthStep] = useState<'form' | 'verifyEmail' | 'verifiedSuccess' | 'forgotPassword'>('form');
    const [verifyingUser, setVerifyingUser] = useState<FirebaseUser | null>(null);
    const verificationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const passwordValue = watch('password', '');

    // --- Effects ---
    useEffect(() => {
        setIsVisible(isModalOpen); // Sync visibility state with context
    }, [isModalOpen]);

    useEffect(() => {
        if (!isLoginMode && passwordValue !== undefined) {
            setPasswordStrength({
                hasUpperCase: /[A-Z]/.test(passwordValue),
                hasNumberOrSymbol: /[0-9!@#$%^&*]/.test(passwordValue),
                isLongEnough: passwordValue.length >= 8,
            });
        } else if (isLoginMode) {
             setPasswordStrength({ hasUpperCase: false, hasNumberOrSymbol: false, isLongEnough: false });
        }
    }, [passwordValue, isLoginMode]);

    useEffect(() => {
        return () => {
            if (verificationIntervalRef.current) {
                clearInterval(verificationIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (authStep === 'verifyEmail' && verifyingUser) {
            verificationIntervalRef.current = setInterval(async () => {
                if (!verifyingUser) return;
                try {
                    await verifyingUser.reload();
                    if (verifyingUser.emailVerified) {
                        console.log("Email verified, clearing interval and updating user data.");
                        if (verificationIntervalRef.current) clearInterval(verificationIntervalRef.current);
                        const { name = 'New User', username = verifyingUser.email?.split('@')[0] || `user${verifyingUser.uid.substring(0, 5)}` } = getValues();
                        try {
                            await createVerifiedUserData(verifyingUser, name, username.toLowerCase());
                        } catch (createError) {
                            console.error("Error creating/updating user data post-verification:", createError);
                        }
                        setAuthStep('verifiedSuccess');
                    }
                } catch (reloadError) {
                    console.error("Error reloading user:", reloadError);
                }
            }, 3000);
        } else if (verificationIntervalRef.current) {
             console.log("Clearing verification interval.");
             clearInterval(verificationIntervalRef.current);
             verificationIntervalRef.current = null;
        }

        return () => {
            if (verificationIntervalRef.current) {
                console.log("Cleaning up verification interval.");
                clearInterval(verificationIntervalRef.current);
                 verificationIntervalRef.current = null;
            }
        };
    }, [authStep, verifyingUser, createVerifiedUserData, getValues]);


    // --- Handlers ---
    const handleModeToggle = (mode: 'login' | 'signup') => {
        setLoginMode(mode === 'login');
        reset();
        setShowPassword(false);
        setAuthStep('form');
        setLoading(false);
        setSocialLoading(false);
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            closeModal();
            reset();
            setShowPassword(false);
            setAuthStep('form');
            setVerifyingUser(null);
            setLoading(false);
            setSocialLoading(false);
            if (verificationIntervalRef.current) {
                clearInterval(verificationIntervalRef.current);
                verificationIntervalRef.current = null;
            }
        }, 300);
    }

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        if (!firebaseReady) {
            showNotification("Authentication service is not ready. Please try again later.", "error");
            return;
        }
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
                 // Keep loading true while moving to verification step
            }
        } catch (error: unknown) {
            console.error("Auth Submit Error:", error);
            showNotification(mapAuthError(error), 'error');
            setLoading(false); // Stop loading on error
        } finally {
            // Only stop loading if staying on the form step (e.g., login success handled above)
             if (authStep !== 'verifyEmail' && !isLoginMode) { // Check !isLoginMode too
                 setLoading(false);
             }
        }
    };

    const handleGoogleSignIn = async () => {
        if (!firebaseReady) {
            showNotification("Authentication service is not ready. Please try again later.", "error");
            return;
        }
        setSocialLoading(true);
        try {
            await signInWithGoogle();
            showNotification("Signed in successfully!");
            handleClose(); // Close modal immediately on success
        } catch (error: unknown) {
            console.error("Google Sign In Error:", error);
            showNotification(mapAuthError(error), 'error');
            setSocialLoading(false); // Stop loading only on error
        }
        // No finally block needed, success closes modal & resets state
    };

    const handleForgotPassword = async () => {
         if (!firebaseReady) {
            showNotification("Authentication service is not ready. Please try again later.", "error");
            return;
        }
        const email = getValues("email");
        if (!email) {
            // Maybe set focus to email field here
            showNotification("Please enter your email address first.", "error");
            return;
        }
        setLoading(true);
        try {
            await resetPassword(email);
            showNotification("Password reset link sent! Please check your email.");
            setAuthStep('form');
        } catch (error: unknown) {
            console.error("Forgot Password Error:", error);
            showNotification(mapAuthError(error), "error");
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        if (verifyingUser && firebaseReady) {
            try {
                // *** THE FIX IS HERE ***
                await resendVerificationEmail(verifyingUser); // Use the correct function name from context
                showNotification('Verification email sent again.');
            } catch (error: unknown) {
                console.error("Resend Verification Error:", error);
                showNotification(mapAuthError(error), 'error');
            }
        } else if (!firebaseReady) {
             showNotification("Authentication service is not ready. Please try again later.", "error");
        } else {
             showNotification("Could not resend email. User data missing.", "error"); // Added fallback
        }
    };

    // --- Render Logic ---
    // (StrengthIndicator, renderFormContent, renderForgotPasswordContent, renderVerificationContent, renderSuccessContent, renderContent)
    // ... No changes needed in the render logic itself for these fixes ...
    // ... Just ensure all buttons correctly use `disabled={loading || socialLoading || !firebaseReady}` where appropriate ...
     const StrengthIndicator = ({ met, text }: { met: boolean; text: string }) => (
      <div className={`strength-indicator ${met ? 'met' : ''}`}>{text}</div>
    );

    const renderFormContent = () => (
      <form id="auth-form" onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {/* Sign Up Fields */}
          <div className={`signup-fields-wrapper ${!isLoginMode ? 'open' : ''}`}>
              <input
                {...register('name', { required: !isLoginMode && 'Name is required' })}
                type="text"
                placeholder="Full Name"
                className="auth-input"
                disabled={loading || socialLoading}
              />
               {errors.name && !isLoginMode && <p className="text-red-500 text-xs -mt-3">{errors.name.message}</p>}

              <input
                {...register('username', {
                    required: !isLoginMode && 'Username is required',
                    minLength: !isLoginMode ? { value: 3, message: 'Min 3 characters' } : undefined,
                    pattern: !isLoginMode ? { value: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers, _ allowed' } : undefined,
                 })}
                type="text"
                placeholder="Username"
                className="auth-input lowercase"
                disabled={loading || socialLoading}
                onChange={(e) => { e.target.value = e.target.value.toLowerCase(); }}
             />
              {errors.username && !isLoginMode && <p className="text-red-500 text-xs -mt-3">{errors.username.message}</p>}
          </div>

          {/* Email Field */}
          <input
            {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
             })}
            type="email"
            placeholder="Email Address"
            className="auth-input"
            disabled={loading || socialLoading}
         />
         {errors.email && <p className="text-red-500 text-xs -mt-3">{errors.email.message}</p>}

          {/* Password Field (Common) */}
          <div className="password-wrapper">
              <input
                {...register('password', {
                    required: 'Password is required',
                    minLength: !isLoginMode ? { value: 8, message: 'Password must be at least 8 characters' } : undefined
                 })}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="auth-input"
                disabled={loading || socialLoading}
             />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle" disabled={loading || socialLoading}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs -mt-3">{errors.password.message}</p>}


          {/* Password Strength (Sign Up Only) */}
          {!isLoginMode && (
              <div className="password-strength-container">
                  <StrengthIndicator met={passwordStrength.isLongEnough} text="8+ characters" />
                  <StrengthIndicator met={passwordStrength.hasUpperCase} text="1 uppercase" />
                  <StrengthIndicator met={passwordStrength.hasNumberOrSymbol} text="1 number/symbol" />
              </div>
          )}

          {/* Forgot Password Button (Login Only) */}
          {isLoginMode && (
            <button type="button" onClick={() => setAuthStep('forgotPassword')} className="forgot-password-btn" disabled={loading || socialLoading}>
                Forgot password?
            </button>
          )}

          {/* Submit Button */}
          <button type="submit" disabled={loading || socialLoading || !firebaseReady} className="auth-submit-btn">
              {loading ? <Loader2 className="animate-spin" /> : (isLoginMode ? 'Sign In' : 'Create Account')}
          </button>
      </form>
    );

      const renderForgotPasswordContent = () => (
        <div className="text-center p-4">
            <Mail className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Reset Your Password</h3>
            <p className="text-gray-600 mb-6">Enter your email and we&apos;ll send you a link to get back into your account.</p>
            <div className="w-full mb-4">
                <input
                    {...register('email', { required: 'Email is required' })}
                    type="email"
                    placeholder="Email Address"
                    className="auth-input w-full"
                    disabled={loading} // Disable while loading
                />
                 {errors.email && <p className="text-red-500 text-xs mt-1 text-left">{errors.email.message}</p>}
            </div>
             {/* Use handleSubmit here as well if you want RHF validation */}
            <button onClick={handleSubmit(handleForgotPassword)} disabled={loading || !firebaseReady} className="auth-submit-btn w-full">
                {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
            </button>
        </div>
    );

    const renderVerificationContent = () => (
        <div className="text-center p-4">
            <Mail className="mx-auto h-16 w-16 text-indigo-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h3>
            <p className="text-gray-600 mb-6">
                We&apos;ve sent a verification link to <strong>{verifyingUser?.email}</strong>. Please check your inbox (and spam folder!) and click the link to activate your account.
            </p>
            <p className="text-sm text-gray-500 mb-6">
                 This window will update automatically once you&apos;re verified. Closing this window won&apos;t cancel the process.
            </p>
            <button onClick={handleResendEmail} className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading || !firebaseReady}>
                 Didn&apos;t receive an email? Resend
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
            <button
                onClick={handleClose}
                className="inline-block bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition"
            >
                Continue
            </button>
        </div>
    );


    const renderContent = () => {
        // ... switch statement remains the same
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
                            <button onClick={() => handleModeToggle(isLoginMode ? 'signup' : 'login')} className="form-toggle-btn" disabled={loading || socialLoading}>
                                {isLoginMode ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                        <button onClick={handleGoogleSignIn} disabled={socialLoading || loading || !firebaseReady} className="social-btn">
                            {socialLoading ? <Loader2 className="animate-spin" /> : (
                                <>
                                    {/* Google SVG */}
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
        // Modal structure remains the same
         <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
             <div className={`auth-modal-container transform-gpu transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} ${isLoginMode ? 'mode-login' : 'mode-signup'}`}>

                {/* Close/Back Buttons */}
                {authStep === 'form' && (
                    <button onClick={handleClose} className="close-button" aria-label="Close modal">
                        <X size={24} />
                    </button>
                )}
                 {authStep === 'forgotPassword' && (
                     <button onClick={() => setAuthStep('form')} className="close-button back-button" aria-label="Back to login">
                        &larr; Back
                    </button>
                )}

                {/* Illustration Column */}
                <div className="illustration-wrapper">
                    <Image src="/media/authentication.svg" alt="Authentication Illustration" width={400} height={400} className="illustration-svg" priority />
                </div>

                {/* Form/Content Column */}
                <div className="form-content">
                    <div className="form-inner-content">
                        {renderContent()}

                        {authStep === 'form' && (
                             <div className="legal-links">
                            By continuing, you agree to CalciPrep&apos;s <br />
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


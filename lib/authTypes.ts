// lib/authTypes.ts
import { AuthError } from 'firebase/auth'; // Import AuthError type

// Defines the shape of our form fields for react-hook-form
export type Inputs = {
  name?: string;
  username?: string;
  email: string;
  password: string; // Use string type
};

// Defines the structure for our password strength checker
export type strength = {
  hasUpperCase: boolean;
  hasNumberOrSymbol: boolean;
  isLongEnough: boolean;
};

// A centralized function to map Firebase error codes to user-friendly messages
// Update error type to accept AuthError or generic Error
export const mapAuthError = (error: AuthError | Error | unknown): string => {
    // Type guard to check if it's an AuthError with a code property
    if (typeof error === 'object' && error !== null && 'code' in error) {
        const authError = error as AuthError; // Type assertion
        switch (authError.code) {
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-not-found':
        case 'auth/invalid-credential': // Combined common message
            return 'No account found with this email/password. Please check your credentials or sign up.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists. Please sign in.';
        case 'auth/weak-password':
            // Use &apos; for apostrophe
            return 'Password should be at least 8 characters long.';
         case 'auth/network-request-failed':
             return 'Network error. Please check your connection and try again.';
         case 'auth/too-many-requests':
             return 'Too many attempts. Please try again later.';
        // Add more specific Firebase Auth error codes as needed
        default:
            console.error("Authentication Error Code:", authError.code, authError.message);
            // Provide a slightly more informative generic message
            return `An error occurred (${authError.code}). Please try again.`;
        }
    } else if (error instanceof Error) {
        // Handle generic errors
        console.error("Generic Authentication Error:", error.message);
        return `An error occurred: ${error.message}. Please try again.`;
    } else {
         // Handle unknown error types
         console.error("Unknown Authentication Error:", error);
         return 'An unexpected error occurred. Please try again.';
    }
};


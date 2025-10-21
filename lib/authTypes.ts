// lib/authTypes.ts

// Defines the shape of our form fields for react-hook-form
export type Inputs = {
  name?: string;
  username?: string;
  email: string;
  password: any; // Using 'any' for now to match original, can be stricter if needed
};

// Defines the structure for our password strength checker
export type strength = {
  hasUpperCase: boolean;
  hasNumberOrSymbol: boolean;
  isLongEnough: boolean;
};

// A centralized function to map Firebase error codes to user-friendly messages
export const mapAuthError = (error: any) => {
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
        console.error("Authentication Error:", error);
        return 'An error occurred. Please try again.';
    }
};


import { auth, db } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  User,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// --- ACTION URL CONFIGURATION FOR EMAIL LINKS ---
const actionCodeSettings = {
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};


// --- SIGN UP & VERIFICATION ---
export const signUp = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  // Send verification email
  await sendEmailVerification(user, actionCodeSettings);
  return userCredential;
};

// --- CREATE USER DATA IN FIRESTORE (POST-VERIFICATION) ---
export const createVerifiedUserData = async (user: User, name: string, username: string) => {
    const userDocRef = doc(db, "users", user.uid);
    const usernameDocRef = doc(db, "usernames", username.toLowerCase());

    // Check if user data already exists (for social sign-ups)
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
            uid: user.uid,
            name,
            username,
            email: user.email,
            createdAt: serverTimestamp(),
        });
        await setDoc(usernameDocRef, { uid: user.uid });

        // Update auth profile
        if (user.displayName !== name) {
            await updateProfile(user, { displayName: name });
        }
    }
};


// --- STANDARD SIGN IN ---
export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// --- GOOGLE SIGN IN ---
export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Create user data if it's a new user
    const name = user.displayName || 'New User';
    const username = user.email?.split('@')[0] || `user${user.uid.substring(0, 5)}`; // Fallback username
    await createVerifiedUserData(user, name, username);

    return result;
};


// --- PASSWORD RESET ---
export const resetPassword = (email: string) => {
  return sendPasswordResetEmail(auth, email, actionCodeSettings);
};


// --- OTHER AUTH FUNCTIONS ---
export const logout = () => {
  return signOut(auth);
};

export const resendVerificationEmail = async (user: User) => {
    await sendEmailVerification(user, actionCodeSettings);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    if (!username || username.length < 3) return false;
    const usernameDocRef = doc(db, "usernames", username.toLowerCase());
    const docSnap = await getDoc(usernameDocRef);
    return !docSnap.exists();
};


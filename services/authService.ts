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
  signInWithPopup,
  // No longer needed here: applyActionCode, checkActionCode
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// --- ACTION URL CONFIGURATION FOR EMAIL LINKS ---
const actionCodeSettings = {
  // Use environment variable or default for flexibility
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000/auth/action', // Point to your action handler page
};


// --- SIGN UP & VERIFICATION ---
export const signUp = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  // Send verification email
  await sendEmailVerification(user, actionCodeSettings);
  return userCredential;
};

// --- CREATE USER DATA IN FIRESTORE (Called from context now) ---
export const createUserDataIfNeeded = async (user: User, name?: string | null, username?: string | null) => {
    // Generate fallbacks if name/username aren't provided (e.g., from Google Sign In)
    const finalName = name || user.displayName || 'New User';
    // Ensure username is valid, lowercase, and unique or generate fallback
    let finalUsername = username?.toLowerCase() || user.email?.split('@')[0] || `user${user.uid.substring(0, 6)}`;
    finalUsername = finalUsername.replace(/[^a-z0-9]/gi, '').substring(0, 15); // Basic sanitization

    const userDocRef = doc(db, "users", user.uid);
    const usernameDocRef = doc(db, "usernames", finalUsername);

    try {
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            console.log(`User doc for ${user.uid} doesn't exist, creating...`);
            // Check if username is taken ONLY if creating a new user
            const usernameSnap = await getDoc(usernameDocRef);
            if (usernameSnap.exists()) {
                // Handle username conflict - maybe append random chars or throw error
                console.warn(`Username ${finalUsername} already taken. Generating fallback.`);
                finalUsername = `user${user.uid.substring(0, 6)}`;
                 // Re-check the fallback, though collisions are less likely
                 const fallbackUsernameDocRef = doc(db, "usernames", finalUsername);
                 const fallbackSnap = await getDoc(fallbackUsernameDocRef);
                 if (fallbackSnap.exists()) {
                     // Extremely unlikely, but handle potential infinite loop or error
                     console.error("Fallback username conflict. Aborting user data creation.");
                     throw new Error("Username conflict even with fallback.");
                 }
                 // Update ref if fallback was generated
                 const newUsernameDocRef = doc(db, "usernames", finalUsername);
                 await setDoc(newUsernameDocRef, { uid: user.uid });
            } else {
                 await setDoc(usernameDocRef, { uid: user.uid }); // Claim the original username
            }


            await setDoc(userDocRef, {
                uid: user.uid,
                name: finalName,
                username: finalUsername, // Use the potentially modified username
                email: user.email,
                createdAt: serverTimestamp(),
                photoURL: user.photoURL // Store photo URL if available
            });
            console.log(`Created user doc and username doc for ${user.uid}`);

            // Update auth profile if display name is different or missing
            if (user.displayName !== finalName || user.photoURL !== user.photoURL) {
                 await updateProfile(user, { displayName: finalName, photoURL: user.photoURL });
                 console.log(`Updated auth profile for ${user.uid}`);
            }

        } else {
            console.log(`User doc for ${user.uid} already exists.`);
            // Optionally update existing data if needed (e.g., photoURL if changed)
            // await updateDoc(userDocRef, { photoURL: user.photoURL });
        }
    } catch (error) {
        console.error("Error in createUserDataIfNeeded:", error);
        // Re-throw or handle as needed - maybe notify user
        throw error; // Re-throw to indicate failure
    }
};


// --- STANDARD SIGN IN ---
export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// --- GOOGLE SIGN IN (Simplified) ---
export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // No longer calls createVerifiedUserData immediately
    const result = await signInWithPopup(auth, provider);
    return result; // Return the full result
};


// --- PASSWORD RESET ---
export const resetPassword = (email: string) => {
  // Use the actionCodeSettings defined above
  return sendPasswordResetEmail(auth, email, actionCodeSettings);
};


// --- OTHER AUTH FUNCTIONS ---
export const logout = () => {
  return signOut(auth);
};

export const resendVerificationEmail = async (user: User) => {
    // Use the actionCodeSettings defined above
    await sendEmailVerification(user, actionCodeSettings);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Keep checkUsernameAvailability if needed elsewhere, but it's part of createUserDataIfNeeded now
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    if (!username || username.length < 3) return false;
    const usernameDocRef = doc(db, "usernames", username.toLowerCase());
    const docSnap = await getDoc(usernameDocRef);
    return !docSnap.exists();
};

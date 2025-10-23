// Use the @ alias for imports
import { auth, db, appInitialized } from '@/lib/firebase';
// FIX: Add UserCredential to the import statement
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
  updatePassword as fbUpdatePassword, // Renamed for clarity
  reauthenticateWithCredential,       // Needed for password update
  EmailAuthProvider,
  UserCredential // Added here
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, runTransaction, DocumentData } from 'firebase/firestore'; // Removed unused imports

// --- ACTION URL CONFIGURATION FOR EMAIL LINKS ---
const actionCodeSettings = {
  url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/action`,
};

// --- Helper to ensure services are ready ---
const ensureFirebaseReady = () => {
    if (!appInitialized || !auth || !db) {
        console.error("Firebase services not ready.");
        throw new Error("Firebase services not ready. Please try again later.");
    }
};

// --- SIGN UP & VERIFICATION ---
// FIX: Added return type annotation
export const signUp = async (email: string, password: string): Promise<UserCredential> => {
  ensureFirebaseReady(); // Check before operation
  const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
  const user = userCredential.user;
  // Send verification email
  await sendEmailVerification(user, actionCodeSettings);
  console.log("Verification email sent to:", user.email);
  return userCredential;
};

// --- CREATE/UPDATE USER DATA IN FIRESTORE ---
export const createVerifiedUserData = async (user: User, name: string | null | undefined, username: string | null | undefined): Promise<void> => {
    ensureFirebaseReady(); // Check before operation
    console.log(`Ensuring user data for ${user.uid} with name: ${name}, username: ${username}`);

    const finalName = name || user.displayName || 'New User';
    let finalUsername = username?.toLowerCase() || user.email?.split('@')[0] || `user${user.uid.substring(0, 6)}`;
    finalUsername = finalUsername.replace(/[^a-z0-9_]/gi, '').substring(0, 20);

    const userDocRef = doc(db!, "users", user.uid);
    const usernameToCheckRef = doc(db!, "usernames", finalUsername);

    try {
        await runTransaction(db!, async (transaction) => {
            const userDocSnap = await transaction.get(userDocRef);
            const existingUsername: string | null = userDocSnap.exists() ? userDocSnap.data()?.username || null : null;


            if (userDocSnap.exists()) {
                console.log(`User doc for ${user.uid} already exists during initial check.`);
                if (existingUsername === finalUsername) {
                    console.log("Username hasn't changed during initial check.");
                    const currentData = userDocSnap.data();
                    const updatesNeeded: Record<string, unknown> = {};
                    if ((!currentData?.name || currentData.name !== finalName)) updatesNeeded.name = finalName;
                    if (currentData?.photoURL !== (user.photoURL || null)) updatesNeeded.photoURL = user.photoURL || null;
                    if (!currentData?.hasOwnProperty('phoneNumber')) updatesNeeded.phoneNumber = null;

                    if (Object.keys(updatesNeeded).length > 0) {
                        transaction.update(userDocRef, updatesNeeded);
                        console.log(`Transaction: Updating existing user doc fields for ${user.uid}`);
                    }
                    return;
                }
            }

            console.log(`Transaction: Checking username availability for: ${finalUsername}`);
            const usernameSnap = await transaction.get(usernameToCheckRef);

            if (usernameSnap.exists() && usernameSnap.data()?.uid !== user.uid) {
                console.warn(`Username ${finalUsername} already taken by ${usernameSnap.data()?.uid}.`);
                 finalUsername = `user${user.uid.substring(0, 6)}`;
                 console.log(`Using fallback username: ${finalUsername}`);
                 const fallbackRef = doc(db!, "usernames", finalUsername);
                 const fallbackSnap = await transaction.get(fallbackRef);
                 if (fallbackSnap.exists()) {
                     throw new Error("Fallback username also taken.");
                 }
                 transaction.set(fallbackRef, { uid: user.uid });
            } else if (!usernameSnap.exists()) {
                 transaction.set(usernameToCheckRef, { uid: user.uid });
                 console.log(`Transaction: Setting new username doc: ${finalUsername}`);
            }


            // --- Perform user doc updates ---
            const userData = {
                uid: user.uid,
                name: finalName,
                username: finalUsername,
                email: user.email,
                photoURL: user.photoURL || null,
                phoneNumber: userDocSnap.exists() ? userDocSnap.data()?.phoneNumber || null : null,
                createdAt: userDocSnap.exists() ? userDocSnap.data()?.createdAt : serverTimestamp()
            };

            if (userDocSnap.exists()) {
                transaction.update(userDocRef, userData);
                 console.log(`Transaction: Updating user doc for ${user.uid}`);
            } else {
                transaction.set(userDocRef, userData);
                 console.log(`Transaction: Creating user doc for ${user.uid}`);
            }

            if (existingUsername && existingUsername !== finalUsername) {
                const oldUsernameRef = doc(db!, "usernames", existingUsername);
                transaction.delete(oldUsernameRef);
                 console.log(`Transaction: Deleting old username doc: ${existingUsername}`);
            }

        }); // End Transaction

        console.log(`Successfully completed user data transaction for ${user.uid}`);

        if (user.displayName !== finalName) {
            await updateProfile(user, { displayName: finalName });
            console.log(`Updated auth profile display name for ${user.uid}`);
        }
        if (user.photoURL !== (user.photoURL || null)) {
             await updateProfile(user, { photoURL: user.photoURL || null });
             console.log(`Updated auth profile photo URL for ${user.uid}`);
        }

    } catch (error) {
        console.error("Error in createVerifiedUserData transaction:", error);
        throw error;
    }
};


// --- STANDARD SIGN IN ---
// FIX: Added return type annotation
export const signIn = (email: string, password: string): Promise<UserCredential> => {
  ensureFirebaseReady(); // Check before operation
  return signInWithEmailAndPassword(auth!, email, password);
};

// --- GOOGLE SIGN IN ---
// FIX: Added return type annotation
export const signInWithGoogle = async (): Promise<UserCredential> => {
    ensureFirebaseReady(); // Check before operation
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth!, provider);
    console.log("Google Sign-In successful for:", result.user.uid);
    return result;
};


// --- PASSWORD RESET ---
export const resetPassword = (email: string): Promise<void> => {
  ensureFirebaseReady(); // Check before operation
  return sendPasswordResetEmail(auth!, email, actionCodeSettings);
};

// --- SIGN OUT ---
export const logout = (): Promise<void> => {
    if (!appInitialized || !auth) {
         console.warn("Attempted logout but Firebase Auth not ready.");
         return Promise.resolve();
    }
    return signOut(auth);
};

// --- RESEND VERIFICATION EMAIL ---
export const resendVerificationEmail = async (user: User): Promise<void> => {
    ensureFirebaseReady(); // Check before operation
    await sendEmailVerification(user, actionCodeSettings);
    console.log("Re-sent verification email to:", user.email);
};

// --- AUTH STATE LISTENER ---
export const subscribeToAuthChanges = (callback: (user: User | null) => void): (() => void) => {
   if (!appInitialized || !auth) {
        console.warn("Attempted to subscribe to auth changes but Firebase Auth not ready.");
        callback(null);
        return () => {};
    }
    return onAuthStateChanged(auth, callback);
};

// --- GET USER DATA FROM FIRESTORE ---
export const getUserData = async (uid: string): Promise<DocumentData | null> => {
    ensureFirebaseReady();
    const userDocRef = doc(db!, "users", uid);
    console.log(`Fetching user data from Firestore for UID: ${uid}`);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        console.log(`User data found for ${uid}`);
        return docSnap.data();
    } else {
        console.log("No user data found in Firestore for UID:", uid);
        return null;
    }
};


// --- UPDATE USER PROFILE (Firestore & Auth) ---
export const updateUserProfile = async (user: User, updates: { name?: string; username?: string; phoneNumber?: string }): Promise<void> => {
    ensureFirebaseReady();
    console.log(`Updating profile for ${user.uid} with:`, updates);

    const userDocRef = doc(db!, "users", user.uid);

    try {
        await runTransaction(db!, async (transaction) => {
            const userDocSnap = await transaction.get(userDocRef);
            if (!userDocSnap.exists()) {
                throw new Error("User document does not exist.");
            }

            const currentData = userDocSnap.data();
            const firestoreUpdates: Record<string, unknown> = {};
            let newUsername: string | undefined = undefined;
            const oldUsername: string | null = currentData?.username || null;

            if (updates.name !== undefined && updates.name !== currentData?.name) {
                firestoreUpdates.name = updates.name;
            }
            if (updates.phoneNumber !== undefined && updates.phoneNumber !== currentData?.phoneNumber) {
                firestoreUpdates.phoneNumber = updates.phoneNumber || null;
            }
            if (updates.username !== undefined) {
                newUsername = updates.username.toLowerCase().replace(/[^a-z0-9_]/gi, '').substring(0, 20);
                if (newUsername !== oldUsername) {
                    firestoreUpdates.username = newUsername;

                    const newUsernameRef = doc(db!, "usernames", newUsername);
                    const newUsernameSnap = await transaction.get(newUsernameRef);
                    if (newUsernameSnap.exists()) {
                        throw new Error(`Username "@${newUsername}" is already taken.`);
                    }
                    transaction.set(newUsernameRef, { uid: user.uid });
                     console.log(`Transaction: Planning to set new username doc: ${newUsername}`);
                    if (oldUsername) {
                        const oldUsernameRef = doc(db!, "usernames", oldUsername);
                        transaction.delete(oldUsernameRef);
                         console.log(`Transaction: Planning to delete old username doc: ${oldUsername}`);
                    }
                } else {
                     console.log("Username hasn't changed.");
                }
            }

            if (Object.keys(firestoreUpdates).length > 0) {
                 console.log(`Transaction: Planning to update user doc for ${user.uid} with`, firestoreUpdates);
                transaction.update(userDocRef, firestoreUpdates);
            } else {
                 console.log("No Firestore user document updates needed.");
            }
        }); // End Transaction

        console.log(`Transaction successful for profile update ${user.uid}`);

        if (updates.name !== undefined && updates.name !== user.displayName) {
            await updateProfile(user, { displayName: updates.name });
            console.log(`Auth profile display name updated for ${user.uid}`);
        }

    } catch (error) {
        console.error("Error during profile update transaction:", error);
        throw error;
    }
};


// --- UPDATE USER PASSWORD ---
export const updateUserPassword = async (currentPassword?: string, newPassword?: string): Promise<void> => {
    ensureFirebaseReady();
    const user = auth!.currentUser;
    if (!user) throw new Error("No user logged in.");
    if (!user.email) throw new Error("User email is not available for re-authentication.");
    if (!currentPassword || !newPassword) throw new Error("Current and new passwords are required.");

    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
    try {
        console.log(`Attempting to re-authenticate ${user.uid}`);
        await reauthenticateWithCredential(user, credential);
        console.log(`Re-authentication successful for ${user.uid}. Updating password...`);
        await fbUpdatePassword(user, newPassword);
        console.log(`Password updated successfully for ${user.uid}`);
    } catch (error) {
        console.error("Error updating password (re-auth or update failed):", error);
        throw error;
    }
};


// --- CHECK USERNAME AVAILABILITY ---
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
     try {
         ensureFirebaseReady();
         if (!username || username.length < 3) return false;
         const normalizedUsername = username.toLowerCase();
         const usernameDocRef = doc(db!, "usernames", normalizedUsername);
         const docSnap = await getDoc(usernameDocRef);
         console.log(`Username "${normalizedUsername}" exists: ${docSnap.exists()}`);
         return !docSnap.exists();
     } catch (error) {
          console.error("Error checking username availability:", error);
          return false;
     }
};


import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration using environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// --- Declare variables, allowing 'app' to be potentially undefined initially ---
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let appInitialized = false;

try {
    // --- Initialize Firebase App ---
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully.");
    } else {
        app = getApp();
        console.log("Firebase app already exists.");
    }

    // --- Initialize services *only if* app was successfully assigned ---
    if (app) {
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        appInitialized = true;
    } else {
        // This case should ideally not happen if getApp/initializeApp works,
        // but it covers edge cases.
        console.error("Firebase app object could not be obtained.");
        appInitialized = false;
    }

} catch (error) {
    console.error("Firebase initialization error:", error);
    // Ensure appInitialized is false if any error occurs
    appInitialized = false;
    // Services (auth, db, storage) will remain undefined
}

// --- Export Firebase services and initialization status ---
// Consumers should check appInitialized before using these services.
export { app, auth, db, storage, appInitialized };

// --- Default export ---
// This should now be valid as 'app' is declared in the outer scope,
// even if its value might be 'undefined' after the try/catch.
export default app;


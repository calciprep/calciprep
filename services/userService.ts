import { auth, db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  name?: string | null;
  bio?: string;
  phoneNumber?: string;
  createdAt: number;
}

export type HistoryCollection = "typing_history" | "maths_history" | "english_history";

export interface HistoryEntry {
  id: string;
  createdAt: number;
  date: string;
  time: string;
  category: string;
  name: string;
  accuracy?: number;
  netWpm?: number;
  grossWpm?: number;
  score?: number;
  
  // Typing Specifics
  keyStrokesByCandidate?: number;
  fullMistakes?: number;
  totalErrors?: number;
  errorPercentage?: number;
  backspacePresses?: number;
  timeTakenInSeconds?: number;
  originalText?: string;
  typedText?: string;

  // --- NEW: English/Maths Specifics for Dashboards ---
  totalQuestions?: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  skippedAnswers?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  questionsState?: any[]; // Stores the array of questions with the user's answers
}

type HistoryPayload = Omit<HistoryEntry, "id" | "createdAt" | "date" | "time"> &
  Partial<Pick<HistoryEntry, "createdAt" | "date" | "time">>;

function assertDb() {
  if (!db) throw new Error("Firestore is not initialized.");
  return db;
}

function stripUndefined<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );
}

function formatNow() {
  const now = new Date();
  return {
    createdAt: now.getTime(),
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
  };
}

export const UserService = {
  getCurrentUid(): string | null {
    return auth?.currentUser?.uid ?? null;
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const firestore = assertDb();
    const userSnap = await getDoc(doc(firestore, "users", uid));

    if (!userSnap.exists()) {
      return null;
    }

    const data = userSnap.data();
    return {
      uid,
      email: data.email ?? null,
      displayName: data.displayName ?? data.name ?? null,
      name: data.name ?? data.displayName ?? null,
      bio: data.bio,
      phoneNumber: data.phoneNumber,
      createdAt: data.createdAt ?? Date.now(),
    };
  },

  async createUserProfile(uid: string, data: Partial<UserProfile>) {
    const firestore = assertDb();
    await setDoc(
      doc(firestore, "users", uid),
      stripUndefined({
        uid,
        ...data,
        createdAt: Date.now(),
      }),
      { merge: true }
    );
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>) {
    const firestore = assertDb();
    const userRef = doc(firestore, "users", uid);
    const updates = stripUndefined({
      displayName: data.displayName,
      name: data.displayName ?? data.name,
      bio: data.bio,
      phoneNumber: data.phoneNumber,
    });

    if (Object.keys(updates).length === 0) return;

    const snap = await getDoc(userRef);
    if (snap.exists()) {
      await updateDoc(userRef, updates);
    } else {
      await setDoc(userRef, { uid, ...updates, createdAt: Date.now() }, { merge: true });
    }
  },

  async addHistory(uid: string, collectionName: HistoryCollection, entry: HistoryPayload) {
    const firestore = assertDb();
    const stamp = formatNow();
    await addDoc(
      collection(firestore, "users", uid, collectionName),
      stripUndefined({
        ...stamp,
        ...entry,
      })
    );
  },

  async getHistory(uid: string, collectionName: HistoryCollection): Promise<HistoryEntry[]> {
    const firestore = assertDb();
    const historyRef = collection(firestore, "users", uid, collectionName);

    try {
      const historyQuery = query(historyRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(historyQuery);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<HistoryEntry, "id">),
      }));
    } catch (error) {
      console.error(`Error querying ${collectionName}, falling back to unordered fetch:`, error);
      const snapshot = await getDocs(historyRef);
      return snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<HistoryEntry, "id">),
        }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
  },

  async deleteHistory(uid: string, collectionName: HistoryCollection, docId: string) {
    const firestore = assertDb();
    await deleteDoc(doc(firestore, "users", uid, collectionName, docId));
  },
};
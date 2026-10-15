import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { MockTestRecord, UserMockGoal } from "@/lib/mockTrackerTypes";

const LOCAL_STORAGE_MOCKS_KEY = "calciprep_mock_records_v2";
const LOCAL_STORAGE_GOAL_KEY = "calciprep_mock_goal_v2";

// --- LOCAL STORAGE HELPERS (FOR GUEST USERS) ---
export function getLocalMocks(): MockTestRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MOCKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalMocks(mocks: MockTestRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_MOCKS_KEY, JSON.stringify(mocks));
}

export function getLocalGoal(): UserMockGoal {
  if (typeof window === "undefined") {
    return { targetExam: "SSC CPO", targetScore: 150, targetPercentile: 90 };
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_GOAL_KEY);
    return raw
      ? JSON.parse(raw)
      : { targetExam: "SSC CPO", targetScore: 150, targetPercentile: 90 };
  } catch {
    return { targetExam: "SSC CPO", targetScore: 150, targetPercentile: 90 };
  }
}

export function saveLocalGoal(goal: UserMockGoal): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_GOAL_KEY, JSON.stringify(goal));
}

// --- FIREBASE FIRESTORE HELPERS (FOR LOGGED-IN USERS) ---
export async function fetchUserMocksFromCloud(
  userId: string
): Promise<MockTestRecord[]> {
  if (!db) return getLocalMocks();

  try {
    const mocksRef = collection(db, "users", userId, "mockTests");
    const q = query(mocksRef, orderBy("date", "asc"));
    const snapshot = await getDocs(q);

    const cloudMocks: MockTestRecord[] = [];
    snapshot.forEach((docSnap) => {
      cloudMocks.push(docSnap.data() as MockTestRecord);
    });

    // Automatically migrate guest mocks to cloud on first login
    const localMocks = getLocalMocks();
    if (localMocks.length > 0 && cloudMocks.length === 0) {
      for (const item of localMocks) {
        await saveMockToCloud(userId, item);
      }
      return localMocks;
    }

    return cloudMocks;
  } catch (error) {
    console.error("Error fetching mocks from Firestore:", error);
    return getLocalMocks();
  }
}

export async function saveMockToCloud(
  userId: string,
  mock: MockTestRecord
): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, "users", userId, "mockTests", mock.id);
    await setDoc(docRef, { ...mock, userId }, { merge: true });
  } catch (error) {
    console.error("Error saving mock to Firestore:", error);
  }
}

export async function deleteMockFromCloud(
  userId: string,
  mockId: string
): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, "users", userId, "mockTests", mockId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting mock from Firestore:", error);
  }
}

export async function saveUserGoalToCloud(
  userId: string,
  goal: UserMockGoal
): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, "users", userId, "settings", "mockTrackerGoal");
    await setDoc(docRef, goal, { merge: true });
  } catch (error) {
    console.error("Error saving mock goal to Firestore:", error);
  }
}

export async function fetchUserGoalFromCloud(
  userId: string
): Promise<UserMockGoal> {
  if (!db) return getLocalGoal();
  try {
    const docRef = doc(db, "users", userId, "settings", "mockTrackerGoal");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserMockGoal;
    }
    return getLocalGoal();
  } catch {
    return getLocalGoal();
  }
}
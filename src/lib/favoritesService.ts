/* ───────────────────────────── common imports ───────────────────────────── */
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '@/firebase';               // client‑side Firestore
import type { SavedMealPlan, MealFilters } from '@/types';
import { getAuth } from 'firebase/auth';

/* ───────────────────────────── browser helpers ──────────────────────────── */
const SAVED_MEALS_KEY = 'mealFinder_savedIndividualMeals';
const SAVED_PLANS_KEY = 'mealFinder_savedPlans';

const isBrowser = typeof window !== 'undefined';

const getCurrentUser = () => {
  if (!isBrowser) return null;
  const auth = getAuth();
  return auth.currentUser;
};

const getUserRef = () => {
  const user = getCurrentUser();
  return user ? doc(db, 'users', user.uid) : null;
};

const generatePlanId = (mealIds: string[]) => [...mealIds].sort().join(',');

/* ──────────────────────────── INDIVIDUAL MEALS ─────────────────────────── */
export const getSavedIndividualMealIds = async (): Promise<string[]> => {
  if (!isBrowser) return [];

  const user = getCurrentUser();
  if (user) {
    try {
      const userRef = getUserRef();
      if (!userRef) return [];
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return Array.isArray(data.savedIndividualMealIds)
          ? data.savedIndividualMealIds
          : [];
      }
    } catch (err) {
      console.error('Error getting saved meals from Firestore:', err);
    }
    return [];
  }

  /* localStorage fallback */
  try {
    const v = localStorage.getItem(SAVED_MEALS_KEY);
    return v ? JSON.parse(v) : [];
  } catch (err) {
    console.error('Error parsing local saved meals:', err);
    return [];
  }
};

export const saveIndividualMeal = async (mealId: string) => {
  if (!isBrowser) return;

  const user = getCurrentUser();
  if (user) {
    const userRef = getUserRef();
    if (!userRef) return;
    await setDoc(
      userRef,
      { savedIndividualMealIds: arrayUnion(mealId) },
      { merge: true },
    );
    return;
  }

  const ids = await getSavedIndividualMealIds();
  if (!ids.includes(mealId)) {
    ids.push(mealId);
    localStorage.setItem(SAVED_MEALS_KEY, JSON.stringify(ids));
  }
};

export const removeIndividualMeal = async (mealId: string) => {
  if (!isBrowser) return;

  const user = getCurrentUser();
  if (user) {
    const userRef = getUserRef();
    if (!userRef) return;
    await updateDoc(userRef, {
      savedIndividualMealIds: arrayRemove(mealId),
    });
    return;
  }

  const ids = (await getSavedIndividualMealIds()).filter((id) => id !== mealId);
  localStorage.setItem(SAVED_MEALS_KEY, JSON.stringify(ids));
};

export const isIndividualMealSaved = async (mealId: string) =>
  (await getSavedIndividualMealIds()).includes(mealId);

/* ───────────────────────────────── MEAL PLANS ───────────────────────────── */
export const getSavedMealPlans = async (): Promise<SavedMealPlan[]> => {
  if (!isBrowser) return [];

  const user = getCurrentUser();
  if (user) {
    try {
      const userRef = getUserRef();
      if (!userRef) return [];
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return Array.isArray(data.savedMealPlans) ? data.savedMealPlans : [];
      }
    } catch (err) {
      console.error('Error getting meal plans from Firestore:', err);
    }
    return [];
  }

  const json = localStorage.getItem(SAVED_PLANS_KEY);
  return json ? JSON.parse(json) : [];
};

export const saveMealPlan = async (
  mealIds: string[],
  filters: MealFilters,
): Promise<SavedMealPlan | null> => {
  if (!isBrowser) return null;

  const newPlan: SavedMealPlan = {
    id: generatePlanId(mealIds),
    mealIds,
    filters,
    savedAt: new Date().toISOString(),
  };

  const user = getCurrentUser();
  if (user) {
    const userRef = getUserRef();
    if (!userRef) return null;

    const docSnap = await getDoc(userRef);
    const currentPlans: SavedMealPlan[] =
      docSnap.exists() && Array.isArray(docSnap.data().savedMealPlans)
        ? docSnap.data().savedMealPlans
        : [];

    if (!currentPlans.some((p) => p.id === newPlan.id)) {
      await setDoc(
        userRef,
        { savedMealPlans: arrayUnion(newPlan) },
        { merge: true },
      );
    }
    return newPlan;
  }

  /* localStorage fallback */
  const plans = await getSavedMealPlans();
  if (!plans.some((p) => p.id === newPlan.id)) {
    plans.push(newPlan);
    localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(plans));
  }
  return newPlan;
};

export const removeMealPlan = async (planId: string) => {
  if (!isBrowser) return;

  const user = getCurrentUser();
  if (user) {
    const userRef = getUserRef();
    if (!userRef) return;
    const docSnap = await getDoc(userRef);
    const current: SavedMealPlan[] =
      docSnap.exists() ? docSnap.data().savedMealPlans || [] : [];
    await updateDoc(userRef, {
      savedMealPlans: current.filter((p) => p.id !== planId),
    });
    return;
  }

  const plans = (await getSavedMealPlans()).filter((p) => p.id !== planId);
  localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(plans));
};

export const isMealPlanSaved = async (mealIds: string[]) =>
  (await getSavedMealPlans()).some((p) => p.id === generatePlanId(mealIds));

/* ───────────────────────────── SERVER‑ONLY HELPERS ────────────────────────
   These load Firebase Admin **lazily** to stay out of the browser bundle.
   ------------------------------------------------------------------------- */

const getAdminDb = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Firebase Admin helpers should never run in the browser');
  }
  // Lazy‑require to avoid pulling admin SDK into client bundles
  // Adjust the path if your admin initialisation lives elsewhere
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { db: adminDb } = require('@/firebase');
  return adminDb as any //FirebaseFirestore.Firestore;
};

export async function getSavedMealPlansServer(
  uid: string,
): Promise<SavedMealPlan[]> {
  const adminDb = getAdminDb();
  const snapshot = await adminDb
    .collection('users')
    .doc(uid)
    .get();

  if (!snapshot.exists) return [];

  const data = snapshot.data() as { savedMealPlans?: SavedMealPlan[] };
  return Array.isArray(data.savedMealPlans) ? data.savedMealPlans : [];
}

export async function getSavedIndividualMealIdsServer(
  uid: string,
): Promise<string[]> {
  const adminDb = getAdminDb();
  const snapshot = await adminDb.collection('users').doc(uid).get();

  if (!snapshot.exists) return [];

  const data = snapshot.data() as { savedIndividualMealIds?: string[] };
  return Array.isArray(data.savedIndividualMealIds)
    ? data.savedIndividualMealIds
    : [];
}

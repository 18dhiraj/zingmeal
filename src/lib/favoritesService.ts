import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/firebase';
import type { SavedMealPlan, MealFilters } from '@/types';
import { getAuth } from 'firebase/auth';

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

// --- Helper: Plan ID Generator ---
const generatePlanId = (mealIds: string[]): string => {
  return [...mealIds].sort().join(',');
};

// --- Individual Meals ---

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
        return Array.isArray(data.savedIndividualMealIds) ? data.savedIndividualMealIds : [];
      }
    } catch (error) {
      console.error('Error getting saved meals from Firestore:', error);
    }
    return [];
  }

  try {
    const mealIdsJson = localStorage.getItem(SAVED_MEALS_KEY);
    return mealIdsJson ? JSON.parse(mealIdsJson) : [];
  } catch (err) {
    console.error('Error parsing local saved meals:', err);
    return [];
  }
};

export const saveIndividualMeal = async (mealId: string): Promise<void> => {
  if (!isBrowser) return;

  const user = getCurrentUser();
  if (user) {
    const userRef = getUserRef();
    if (!userRef) return;
    try {
      await setDoc(
        userRef,
        { savedIndividualMealIds: arrayUnion(mealId) },
        { merge: true }
      );
    } catch (err) {
      console.error('Error saving meal to Firestore:', err);
    }
    return;
  }

  const ids = await getSavedIndividualMealIds();
  if (!ids.includes(mealId)) {
    ids.push(mealId);
    localStorage.setItem(SAVED_MEALS_KEY, JSON.stringify(ids));
  }
};

export const removeIndividualMeal = async (mealId: string): Promise<void> => {
  if (!isBrowser) return;

  const user = getCurrentUser();
  if (user) {
    const userRef = getUserRef();
    if (!userRef) return;
    try {
      await updateDoc(userRef, {
        savedIndividualMealIds: arrayRemove(mealId),
      });
    } catch (err) {
      console.error('Error removing meal from Firestore:', err);
    }
    return;
  }

  let ids = await getSavedIndividualMealIds();
  ids = ids.filter(id => id !== mealId);
  localStorage.setItem(SAVED_MEALS_KEY, JSON.stringify(ids));
};

export const isIndividualMealSaved = async (mealId: string): Promise<boolean> => {
  const savedIds = await getSavedIndividualMealIds();
  return savedIds.includes(mealId);
};

// --- Meal Plans ---

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

  const plansJson = localStorage.getItem(SAVED_PLANS_KEY);
  return plansJson ? JSON.parse(plansJson) : [];
};

export const saveMealPlan = async (mealIds: string[], filters: MealFilters): Promise<SavedMealPlan | null> => {
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

    try {
      const docSnap = await getDoc(userRef);
      const currentPlans = docSnap.exists() && Array.isArray(docSnap.data().savedMealPlans)
        ? docSnap.data().savedMealPlans
        : [];

      const alreadyExists = currentPlans.some((p: SavedMealPlan) => p.id === newPlan.id);
      if (!alreadyExists) {
        await setDoc(userRef, { savedMealPlans: arrayUnion(newPlan) }, { merge: true });
      }
      return newPlan;
    } catch (err) {
      console.error('Error saving meal plan to Firestore:', err);
      return null;
    }
  }

  const plans = await getSavedMealPlans();
  if (plans.some(p => p.id === newPlan.id)) return newPlan;

  plans.push(newPlan);
  localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(plans));
  return newPlan;
};

export const removeMealPlan = async (planId: string): Promise<void> => {
  if (!isBrowser) return;

  const user = getCurrentUser();
  if (user) {
    const userRef = getUserRef();
    if (!userRef) return;
    try {
      const docSnap = await getDoc(userRef);
      const currentPlans: SavedMealPlan[] = docSnap.exists() ? docSnap.data().savedMealPlans || [] : [];
      const updatedPlans = currentPlans.filter((p) => p.id !== planId);
      await updateDoc(userRef, { savedMealPlans: updatedPlans });
    } catch (err) {
      console.error('Error removing plan from Firestore:', err);
    }
    return;
  }

  let plans = await getSavedMealPlans();
  plans = plans.filter(p => p.id !== planId);
  localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(plans));
};

export const isMealPlanSaved = async (mealIds: string[]): Promise<boolean> => {
  const plans = await getSavedMealPlans();
  const id = generatePlanId(mealIds);
  return plans.some(p => p.id === id);
};

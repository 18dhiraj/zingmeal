import type { Meal, MealFilters } from '@/types';
import { collection, getDocs, limit, query, orderBy, where, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { db } from "../firebase"; // Make sure your Firestore instance is initialized here

const satisfiesFilters = (meal: Meal, filters: MealFilters): boolean => {
  if (meal.price < filters.minPrice || meal.price > filters.maxPrice) {
    return false;
  }
  if (filters.dietaryPreferences.length > 0) {
    const mealTagsSet = new Set(meal.dietaryTags);
    for (const pref of filters.dietaryPreferences) {
      if (!mealTagsSet.has(pref)) {
        return false;
      }
    }
  }
  return true;
};

export const fetchNewMeals = async (): Promise<Meal[]> => {
  const mealsRef = collection(db, 'meals');
  const q = query(
    mealsRef,
    where('status', '==', 1),
    orderBy('createdAt', 'desc'),
    limit(6)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meal));
};

const getAllMeals = async (): Promise<Meal[]> => {
  const querySnapshot = await getDocs(collection(db, "meals"));
  const meals: Meal[] = [];

  querySnapshot.forEach(doc => {
    const data = doc.data();

    if (data.status === 1) {
      const { id: _ignored, ...rest } = data;
      meals.push({ id: doc.id, ...rest } as Meal);
    }
  });

  return meals;
};

export const saveWeeklyPlan = async (mealPlan: Record<string, Record<string, string>>) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not logged in");

  const userRef = doc(db, "users", user.uid, "weeklyPlans", "current");

  await setDoc(userRef, {
    createdAt: new Date(),
    plan: mealPlan,
  });

  return true;
};

export async function getMeals(): Promise<Meal[]> {
  try {
    const q = query(collection(db, "meals"), where("status", "==", 1));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Meal[];
  } catch (error) {
    console.error("Error fetching meals:", error);
    return [];
  }
}

export const getWeeklyPlan = async (): Promise<Record<string, Record<string, string>> | null> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not logged in");

  const planRef = doc(db, "users", user.uid, "weeklyPlans", "current");
  const planSnap = await getDoc(planRef);

  if (planSnap.exists()) {
    return planSnap.data().plan || null;
  } else {
    return null;
  }
};

export const fetchMeals = async (filters: MealFilters): Promise<Meal[] | null> => {
  const allMeals = await getAllMeals();
  let availableMeals = allMeals.filter(meal => satisfiesFilters(meal, filters));

  if (availableMeals.length === 0) {
    return null;
  }

  availableMeals.sort(() => 0.5 - Math.random());

  const selectedMeals: Meal[] = [];
  const usedMealIds = new Set<string>();

  for (const meal of availableMeals) {
    if (selectedMeals.length >= filters.mealsPerDay) break;
    if (!usedMealIds.has(meal.id)) {
      selectedMeals.push(meal);
      usedMealIds.add(meal.id);
    }
  }

  return selectedMeals.length > 0 ? selectedMeals : null;
};

export const fetchNextMeal = async (
  filters: MealFilters,
  currentMealId?: string,
  excludeMealIds: string[] = []
): Promise<Meal | null> => {
  const allMeals = await getAllMeals();
  let potentialMeals = allMeals.filter(meal => satisfiesFilters(meal, filters));

  const allExcludedIds = new Set(excludeMealIds);
  if (currentMealId) {
    allExcludedIds.add(currentMealId);
  }

  potentialMeals = potentialMeals.filter(meal => !allExcludedIds.has(meal.id));
  potentialMeals.sort(() => 0.5 - Math.random());

  return potentialMeals.length > 0 ? potentialMeals[0] : null;
};

export const fetchMealById = async (id: string): Promise<Meal | null> => {
  const allMeals = await getAllMeals();
  return allMeals.find(m => m.id === id) || null;
};

export const fetchMealsByIds = async (ids: string[]): Promise<Meal[]> => {
  const allMeals = await getAllMeals();
  const mealMap = new Map<string, Meal>();
  allMeals.forEach(m => mealMap.set(m.id, m));

  return ids.map(id => mealMap.get(id)).filter((m): m is Meal => !!m);
};

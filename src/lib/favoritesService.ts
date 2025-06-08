
import type { SavedMealPlan, MealFilters } from '@/types';

const SAVED_PLANS_KEY = 'mealFinder_savedPlans';
const SAVED_MEALS_KEY = 'mealFinder_savedIndividualMeals';

// --- Meal Plan Favorites ---

export const getSavedMealPlans = (): SavedMealPlan[] => {
  if (typeof window === 'undefined') return [];
  const plansJson = localStorage.getItem(SAVED_PLANS_KEY);
  return plansJson ? JSON.parse(plansJson) : [];
};

const generatePlanId = (mealIds: string[]): string => {
  return [...mealIds].sort().join(',');
};

export const saveMealPlan = (mealIds: string[], filters: MealFilters): SavedMealPlan | null => {
  if (typeof window === 'undefined') return null;
  const plans = getSavedMealPlans();
  const id = generatePlanId(mealIds);

  if (plans.some(p => p.id === id)) {
    // Plan already saved, maybe update timestamp or do nothing
    return plans.find(p => p.id === id) || null;
  }

  const newPlan: SavedMealPlan = {
    id,
    mealIds,
    filters,
    savedAt: new Date().toISOString(),
  };
  plans.push(newPlan);
  localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(plans));
  return newPlan;
};

export const removeMealPlan = (planId: string): void => {
  if (typeof window === 'undefined') return;
  let plans = getSavedMealPlans();
  plans = plans.filter(p => p.id !== planId);
  localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(plans));
};

export const isMealPlanSaved = (mealIds: string[]): boolean => {
  if (typeof window === 'undefined') return false;
  const plans = getSavedMealPlans();
  const id = generatePlanId(mealIds);
  return plans.some(p => p.id === id);
};


// --- Individual Meal Favorites ---

export const getSavedIndividualMealIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  const mealIdsJson = localStorage.getItem(SAVED_MEALS_KEY);
  return mealIdsJson ? JSON.parse(mealIdsJson) : [];
};

export const saveIndividualMeal = (mealId: string): void => {
  if (typeof window === 'undefined') return;
  const mealIds = getSavedIndividualMealIds();
  if (!mealIds.includes(mealId)) {
    mealIds.push(mealId);
    localStorage.setItem(SAVED_MEALS_KEY, JSON.stringify(mealIds));
  }
};

export const removeIndividualMeal = (mealId: string): void => {
  if (typeof window === 'undefined') return;
  let mealIds = getSavedIndividualMealIds();
  mealIds = mealIds.filter(id => id !== mealId);
  localStorage.setItem(SAVED_MEALS_KEY, JSON.stringify(mealIds));
};

export const isIndividualMealSaved = (mealId: string): boolean => {
  if (typeof window === 'undefined') return false;
  const mealIds = getSavedIndividualMealIds();
  return mealIds.includes(mealId);
};

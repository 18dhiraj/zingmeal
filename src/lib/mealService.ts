
import type { Meal, MealFilters } from '@/types';
import { sampleMeals } from './mockData';

// Simulate API delay
const DUMMY_API_DELAY = 700; 

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

export const fetchMeals = async (filters: MealFilters): Promise<Meal[] | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { mealsPerDay } = filters;
      let availableMeals = sampleMeals.filter(meal => satisfiesFilters(meal, filters));

      if (availableMeals.length === 0) {
        resolve(null);
        return;
      }
      
      availableMeals.sort(() => 0.5 - Math.random()); // Shuffle for variety
      
      const selectedMeals: Meal[] = [];
      const usedMealIds = new Set<string>();

      for (const meal of availableMeals) {
        if (selectedMeals.length >= mealsPerDay) {
          break;
        }
        if (!usedMealIds.has(meal.id)) {
          selectedMeals.push(meal);
          usedMealIds.add(meal.id);
        }
      }
      
      resolve(selectedMeals.length > 0 ? selectedMeals : null);
    }, DUMMY_API_DELAY);
  });
};

export const fetchNextMeal = async (
  filters: MealFilters, 
  currentMealId?: string, 
  excludeMealIds: string[] = []
): Promise<Meal | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let potentialMeals = sampleMeals.filter(meal => satisfiesFilters(meal, filters));
      
      const allExcludedIds = new Set(excludeMealIds);
      if (currentMealId) {
        allExcludedIds.add(currentMealId);
      }
      
      potentialMeals = potentialMeals.filter(meal => !allExcludedIds.has(meal.id));
      
      potentialMeals.sort(() => 0.5 - Math.random()); // Shuffle

      if (potentialMeals.length > 0) {
        resolve(potentialMeals[0]);
      } else {
        resolve(null);
      }
    }, DUMMY_API_DELAY / 2);
  });
};


export const fetchMealById = async (id: string): Promise<Meal | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const meal = sampleMeals.find(m => m.id === id);
      resolve(meal || null);
    }, DUMMY_API_DELAY / 3); 
  });
};

export const fetchMealsByIds = async (ids: string[]): Promise<Meal[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mealsMap = new Map<string, Meal>();
      sampleMeals.forEach(m => mealsMap.set(m.id, m));
      
      const resultMeals: Meal[] = [];
      ids.forEach(id => {
        const meal = mealsMap.get(id);
        if (meal) {
          resultMeals.push(meal);
        }
      });
      resolve(resultMeals);
    }, DUMMY_API_DELAY / 2);
  });
};

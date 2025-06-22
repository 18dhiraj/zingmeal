
export type DietaryPreferenceValue = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'nut-free';

export interface DietaryPreference {
  id: DietaryPreferenceValue;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imagePath?: string;
  dietaryTags: string[];
  calories: number;
  prepTime: string;
  ingredients: string[];
  steps: string[];
  status: number; // <-- Add this if it's missing
  createdAt?: any;
  updatedAt?: any;
  html: String;
}


export interface MealFilters {
  minPrice: number;
  maxPrice: number;
  dietaryPreferences: DietaryPreferenceValue[];
  mealsPerDay: number;
}

export interface SavedMealPlan {
  id: string; // Unique ID for the saved plan, e.g., concatenated sorted meal IDs
  mealIds: string[];
  filters: MealFilters;
  savedAt: string; // ISO date string
  name?: string; // Optional user-defined name for the plan
}


export type DietaryPreferenceValue = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'nut-free';

export type Currency = 'INR' | 'USD' | 'EUR';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  region: string;
}

export interface DietaryPreference {
  id: DietaryPreferenceValue;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number; // Keeping for backward compatibility
  pricing: Record<Currency, number>;
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
  popularity?: number; // Number of unique visits
  lastVisitedAt?: any; // Timestamp of last visit
  totalViews?: number; // Total number of views (including repeated)
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

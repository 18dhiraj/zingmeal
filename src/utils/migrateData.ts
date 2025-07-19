import { Meal } from '@/types';

/**
 * Helper function to migrate existing meal data to the new pricing structure
 * This can be run once to update your existing meals in the database
 */
export const migrateMealToPricing = (meal: Meal): Meal => {
  // If meal already has regional pricing, return as is
  if (meal.pricing) {
    return meal;
  }

  // Create pricing object based on the existing price field
  const pricing = {
    INR: meal.price,
    USD: Math.round(meal.price * 0.012 * 100) / 100, // Example conversion rate: 1 INR = 0.012 USD
    EUR: Math.round(meal.price * 0.011 * 100) / 100, // Example conversion rate: 1 INR = 0.011 EUR
  };

  return {
    ...meal,
    pricing,
  };
};

/**
 * Sample pricing data for common meal price ranges
 * You can use this as a reference for setting regional prices
 */
export const SAMPLE_REGIONAL_PRICING = {
  // Budget meals
  budget: {
    INR: 150,
    USD: 5.99,
    EUR: 4.99,
  },
  // Regular meals
  regular: {
    INR: 250,
    USD: 9.99,
    EUR: 8.99,
  },
  // Premium meals
  premium: {
    INR: 400,
    USD: 15.99,
    EUR: 13.99,
  },
};

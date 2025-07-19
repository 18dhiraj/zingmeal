import { Meal, Currency } from '@/types';

export const getMealPrice = (
  meal: Meal,
  currency: Currency,
  convertPrice: (price: number, from: Currency, to: Currency) => number
): number => {
  // If meal has regional pricing, use it
  if (meal.pricing) {
    if (currency in meal.pricing) {
      return meal.pricing[currency as keyof typeof meal.pricing] as number;
    }
    // If the selected currency is not available, convert from INR
    if (meal.pricing.INR) {
      return convertPrice(meal.pricing.INR, 'INR', currency);
    }
  }

  // Fallback to old price field and convert
  return convertPrice(meal.price, 'INR', currency);
};

export const hasPriceForCurrency = (meal: Meal, currency: Currency): boolean => {
  if (!meal.pricing) return false;
  
  switch (currency) {
    case 'USD':
      return meal.pricing.USD !== undefined;
    case 'EUR':
      return meal.pricing.EUR !== undefined;
    case 'INR':
      return meal.pricing.INR !== undefined;
    default:
      return false;
  }
};

import MealPlanClient from './MealPlanClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Custom Meal Plan | ZingMeal',
  description: 'Create a personalized meal plan based on your preferences, dietary needs, and budget. Swap meals easily and get tailored suggestions with ZingMeal.',
  openGraph: {
    title: 'Generate Your Custom Meal Plan | ZingMeal',
    description: 'Personalize your weekly meal plan and discover healthy, affordable options tailored to your goals.',
    url: 'https://yourdomain.com/meal-plan',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Custom Meal Plan Generator',
    description: 'Build your meal plan with ZingMeal based on your preferences and nutrition goals.',
  },
};

export default function MealPlanPage() {
  return <MealPlanClient />;
}

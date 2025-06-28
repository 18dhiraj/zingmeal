import { getMeals } from '@/lib/mealService';
import WeeklyPlanClient from './WeeklyPlanClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Weekly Meal Planner | ZingMeal',
  description: 'Plan your weekly meals effortlessly with ZingMeal. Customize your breakfast, lunch, and dinner for each day with healthy and budget-friendly options.',
};

export default async function WeeklyPlanPage() {
  const allMeals = await getMeals();

  return <WeeklyPlanClient allMeals={allMeals} />;
}

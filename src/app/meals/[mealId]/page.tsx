import MealPageClient from './MealPageClient';
import { fetchMealById, fetchMealByslug } from '@/lib/mealService';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { mealId: string };
};

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { mealId } = await params;
  // const meal = await fetchMealById(mealId);
  const meal = await fetchMealByslug(mealId);

  if (!meal) {
    return {
      title: 'Meal Not Found | ZingMeal',
      description: 'Sorry, we couldn’t find the meal you were looking for.',
    };
  }

  return {
    title: `${meal.name} | ZingMeal`,
    description: meal.description || `Discover delicious details for ${meal.name} on ZingMeal.`,
    openGraph: {
      title: `${meal.name} | ZingMeal`,
      description: meal.description || '',
      images: meal.imageUrl ? [{ url: meal.imageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${meal.name} | ZingMeal`,
      description: meal.description || '',
      images: meal.imageUrl ? [meal.imageUrl] : [],
    },
  };
}

export default function MealPage() {
  return <MealPageClient />;
}

// app/meals/[mealId]/details/page.tsx
import MealDetailsClient from './MealDetailsClient';
import { fetchMealById } from '@/lib/mealService';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { mealId: string };
};

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { mealId } = await params;
  const meal = await fetchMealById(mealId);

  if (!meal) {
    return {
      title: 'Meal Details Not Found | ZingMeal',
      description: 'Sorry, no detailed information was found for this meal.',
    };
  }

  return {
    title: `Details for ${meal.name} | ZingMeal`,
    description:
      meal.description ||
      `View detailed recipe, ingredients, and preparation steps for ${meal.name}.`,
    openGraph: {
      title: `Details for ${meal.name} | ZingMeal`,
      description: meal.description || '',
      images: meal.imageUrl ? [{ url: meal.imageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Details for ${meal.name} | ZingMeal`,
      description: meal.description || '',
      images: meal.imageUrl ? [meal.imageUrl] : [],
    },
  };
}

export default function MealDetailsPage() {
  return <MealDetailsClient />;
}

import { cookies } from 'next/headers';
import {
  getSavedMealPlansServer,
  getSavedIndividualMealIdsServer,
} from '@/lib/favoritesService';
import { fetchMealsByIds } from '@/lib/mealService';
import FavoritesClient from './FavoritesClient';
import LoginInfoTip from '@/components/LoginInfo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Favorite Meals & Plans | ZingMeal',
  description: 'View and manage your saved meal plans and individual meals. Come back to your favorites anytime and build your perfect meal strategy.',
};

export const dynamic = 'force-dynamic';

export default async function FavoritesPage() {
  const uid = (await cookies()).get('firebaseUid')?.value ?? null;

  if (!uid) {
    return (
      <FavoritesClient
        savedPlans={[]}
        savedPlanMeals={{}}
        savedIndividualMeals={[]}
        isGuest
      />
    );
  }

  const savedPlans = await getSavedMealPlansServer(uid);
  const savedIndividualIds = await getSavedIndividualMealIdsServer(uid);

  const savedPlanMeals: Record<string, Awaited<ReturnType<typeof fetchMealsByIds>>> = {};
  for (const plan of savedPlans) {
    savedPlanMeals[plan.id] =
      plan.mealIds.length ? await fetchMealsByIds(plan.mealIds) : [];
  }

  const savedIndividualMeals =
    savedIndividualIds.length ? await fetchMealsByIds(savedIndividualIds) : [];

  return (
    <FavoritesClient
      savedPlans={savedPlans}
      savedPlanMeals={savedPlanMeals}
      savedIndividualMeals={savedIndividualMeals}
      isGuest={false}
    />
  );
}

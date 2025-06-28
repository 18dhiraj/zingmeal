'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  removeMealPlan as removeSavedPlanService,
  removeIndividualMeal as removeSavedIndividualMealService,
  getSavedMealPlans,
  getSavedIndividualMealIds,
} from '@/lib/favoritesService';
import { fetchMealsByIds } from '@/lib/mealService';
import type { SavedMealPlan, Meal } from '@/types';
import { useToast } from '@/hooks/use-toast';
import FavoritePageMarkup from './FavoritePageMarkup';

type Props = {
  savedPlans: SavedMealPlan[];
  savedPlanMeals: Record<string, Meal[]>;
  savedIndividualMeals: Meal[];
  isGuest: boolean;
};

export default function FavoritesClient({
  savedPlans: serverPlans,
  savedPlanMeals: serverPlanMeals,
  savedIndividualMeals: serverIndMeals,
  isGuest,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [savedPlans,           setSavedPlans]           = useState(serverPlans);
  const [detailedPlanMeals,    setDetailedPlanMeals]    = useState(serverPlanMeals);
  const [savedIndividualMeals, setSavedIndividualMeals] = useState(serverIndMeals);

  useEffect(() => {
    if (!isGuest) return;

    (async () => {
      const plans = await getSavedMealPlans();
      setSavedPlans(plans);

      const planMeals: Record<string, Meal[]> = {};
      for (const p of plans) {
        planMeals[p.id] = p.mealIds.length
          ? await fetchMealsByIds(p.mealIds)
          : [];
      }
      setDetailedPlanMeals(planMeals);

      const ids   = await getSavedIndividualMealIds();
      const meals = ids.length ? await fetchMealsByIds(ids) : [];
      setSavedIndividualMeals(meals);
    })();
  }, [isGuest]);

  const handleRemovePlan = async (planId: string) => {
    await removeSavedPlanService(planId);
    setSavedPlans(plans => plans.filter(p => p.id !== planId));
    toast({ title: 'Plan Removed', description: 'The meal plan has been removed.' });
  };

  const handleRemoveIndividualMeal = async (mealId: string) => {
    await removeSavedIndividualMealService(mealId);
    setSavedIndividualMeals(meals => meals.filter(m => m.id !== mealId));
    toast({ title: 'Meal Removed', description: 'The meal has been removed.' });
  };

  return (
    <FavoritePageMarkup
      savedPlans={savedPlans}
      detailedPlanMeals={detailedPlanMeals}
      savedIndividualMeals={savedIndividualMeals}
      onRemovePlan={handleRemovePlan}
      onRemoveIndividualMeal={handleRemoveIndividualMeal}
    />
  );
}

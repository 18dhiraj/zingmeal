'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MealFinderForm } from './MealFinderForm';
import type { MealFilters } from '@/types';
import { fetchMeals } from '@/lib/mealService';
import { useToast } from "@/hooks/use-toast";

export default function MealFinderClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (data: MealFilters) => {
    setIsSubmitting(true);
    try {
      const mealsArray = await fetchMeals(data);

      if ( mealsArray && mealsArray?.length > 0) {
        const mealIds = mealsArray.map(m => m.id).join(',');
        const queryParams = new URLSearchParams({
          minPrice: data.minPrice.toString(),
          maxPrice: data.maxPrice.toString(),
          dietaryPreferences: data.dietaryPreferences.join(','),
          mealsPerDay: data.mealsPerDay.toString(),
          mealIds,
        });
        router.push(`/meal-plan?${queryParams.toString()}`);
      } else {
        toast({
          title: "No Meals Found",
          description: "Try adjusting your filters for more options.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to fetch meals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MealFinderForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
  );
}

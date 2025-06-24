
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MealFinderForm } from '../../components/MealFinderForm';
import type { MealFilters } from '@/types';
import { fetchMeals } from '@/lib/mealService';
import { ChefHat } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (data: MealFilters) => {
    setIsSubmitting(true);

    try {
      const mealsArray = await fetchMeals(data);
      if (mealsArray && mealsArray.length > 0) {
        const mealIds = mealsArray.map(m => m.id).join(',');
        const queryParams = new URLSearchParams({
          minPrice: data.minPrice.toString(),
          maxPrice: data.maxPrice.toString(),
          dietaryPreferences: data.dietaryPreferences.join(','),
          mealsPerDay: data.mealsPerDay.toString(),
          mealIds: mealIds,
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
    <>
      <div className="fixed inset-0 -z-10">
        <Image
          src={require('../../assets/images/bg.jpg')}
          alt="Delicious food background"
          layout="fill"
          objectFit="cover"
          className="filter blur-sm brightness-50"
          data-ai-hint="food restaurant"
          priority
        />
      </div>
      <main className="flex-grow container mx-auto px-2 py-2 flex flex-col items-center justify-center gap-4 min-h-[70vh] relative z-0">
        {/* <header className="text-center space-y-2 bg-black/30 p-4 rounded-lg shadow-xl">
          <h1 className="text-4xl font-headline font-bold text-white flex items-center justify-center gap-2">
            <ChefHat className="w-10 h-10 text-accent" />
            <span className="text-primary-foreground">ZingMeal</span>
          </h1>
          <p className="text-lg text-primary-foreground/90">
            Discover your next favorite meal plan with a few simple clicks!
          </p>
        </header> */}

        <section className="w-full max-w-2xl bg-background/90 p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm">
          <MealFinderForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
        </section>

        {/* {!isSubmitting && (
          <div className="text-center text-primary-foreground/80 p-4 mt-4">
            <ChefHat className="w-14 h-14 mx-auto mb-3 text-accent/50" />
            <p className="text-base">Fill out the form above to discover delicious meal plans!</p>
          </div>
        )} */}
      </main>

    </>
  );
}


"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MealFinderForm } from '@/components/MealFinderForm';
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
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center gap-10 min-h-screen relative z-0">
        <header className="text-center space-y-3 bg-black/30 p-6 rounded-lg shadow-xl">
          <h1 className="text-5xl font-headline font-bold text-white flex items-center justify-center gap-3">
            <ChefHat className="w-12 h-12 text-accent" />
            <span className="text-primary-foreground">ZingMeal</span>
          </h1>
          <p className="text-xl text-primary-foreground/90">
            Discover your next favorite meal plan with a few simple clicks!
          </p>
        </header>

        <section className="w-full max-w-2xl bg-background/90 p-6 sm:p-8 rounded-xl shadow-2xl backdrop-blur-sm">
          <MealFinderForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
        </section>
        
        {!isSubmitting && (
          <div className="text-center text-primary-foreground/80 p-6 mt-6">
            <ChefHat className="w-16 h-16 mx-auto mb-4 text-accent/50" />
            <p className="text-lg">Fill out the form above to discover delicious meal plans!</p>
          </div>
        )}
      </main>
    </>
  );
}

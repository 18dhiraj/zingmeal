
"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MealCard } from '@/components/MealCard';
import type { Meal, MealFilters, DietaryPreferenceValue, SavedMealPlan } from '@/types';
import { fetchMealsByIds, fetchNextMeal } from '@/lib/mealService'; 
import { saveMealPlan, removeMealPlan, isMealPlanSaved } from '@/lib/favoritesService';
import { AlertTriangle, ChefHat, SearchX, Loader2, ArrowLeft, Utensils, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const getMealLabel = (index: number, totalMeals: number): string => {
  if (totalMeals === 1) return "Your Meal Suggestion";
  if (totalMeals === 2) {
    return index === 0 ? "Morning Meal" : "Afternoon/Evening Meal";
  }
  if (totalMeals === 3) {
    if (index === 0) return "Breakfast";
    if (index === 1) return "Lunch";
    return "Dinner";
  }
  return `Meal ${index + 1}`;
};

function MealPlanDisplayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [filters, setFilters] = useState<MealFilters | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swappingMealIndex, setSwappingMealIndex] = useState<number | null>(null);
  const [isCurrentPlanSaved, setIsCurrentPlanSaved] = useState(false);

  useEffect(() => {
    const mealIdsParam = searchParams.get('mealIds');
    const minPrice = parseInt(searchParams.get('minPrice') || '5', 10);
    const maxPrice = parseInt(searchParams.get('maxPrice') || '50', 10);
    const dietaryPreferencesParam = searchParams.get('dietaryPreferences');
    const dietaryPreferences = dietaryPreferencesParam ? dietaryPreferencesParam.split(',') as DietaryPreferenceValue[] : [];
    const mealsPerDay = parseInt(searchParams.get('mealsPerDay') || '1', 10);
    
    const parsedFilters: MealFilters = { minPrice, maxPrice, dietaryPreferences, mealsPerDay };
    setFilters(parsedFilters);

    if (mealIdsParam) {
      const mealIdArray = mealIdsParam.split(',');
      setIsCurrentPlanSaved(isMealPlanSaved(mealIdArray));

      const currentMealStateIds = meals.map(m => m.id).join(',');
      if (meals.length === 0 || mealIdsParam !== currentMealStateIds) {
        setIsLoading(true);
        setError(null);
        fetchMealsByIds(mealIdArray)
          .then(fetchedMeals => {
            if (fetchedMeals && fetchedMeals.length > 0 && fetchedMeals.length === mealIdArray.length) {
              const orderedMeals = mealIdArray.map(id => fetchedMeals.find(m => m.id === id)).filter(m => m !== undefined) as Meal[];
              setMeals(orderedMeals);
            } else {
              setError('Could not find all selected meals for your plan. Some may be missing.');
              toast({ title: "Error", description: "Selected meals not found or incomplete.", variant: "destructive" });
              setMeals([]);
            }
          })
          .catch(err => {
            console.error(err);
            setError('Failed to fetch meal plan details.');
            toast({ title: "Error", description: "Failed to load meal plan.", variant: "destructive" });
            setMeals([]);
          })
          .finally(() => setIsLoading(false));
      } else {
         if (isLoading) setIsLoading(false);
      }
    } else {
      setError('Meal IDs are missing from the plan.');
      setIsLoading(false);
      setMeals([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, toast]); 

  const handleSwapMealInPlan = useCallback(async (mealIdToSwap: string, mealIndexInPlan?: number) => {
    if (filters === null || mealIndexInPlan === undefined) {
        toast({ title: "Cannot Swap", description: "Filter data is missing or meal index is not defined.", variant: "destructive"});
        return;
    }

    setSwappingMealIndex(mealIndexInPlan);
    try {
      const excludedIdsForSwap = meals.map(m=>m.id).filter(id => id !== mealIdToSwap);
      const nextMeal = await fetchNextMeal(filters, mealIdToSwap, excludedIdsForSwap);
      
      if (nextMeal) {
        const newMealsArray = [...meals];
        newMealsArray[mealIndexInPlan] = nextMeal;
        setMeals(newMealsArray); // Optimistically update UI

        const newMealIds = newMealsArray.map(m => m.id).join(',');
        setIsCurrentPlanSaved(isMealPlanSaved(newMealsArray.map(m => m.id))); // Check if new combination is saved

        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        currentParams.set('mealIds', newMealIds);
        router.replace(`${window.location.pathname}?${currentParams.toString()}`, { scroll: false });

      } else {
        toast({
          title: "No Other Meals",
          description: "No other meals match your filters for this slot.",
          variant: "default",
        });
      }
    } catch (err) {
      console.error("Error swapping meal in plan:", err);
      toast({ title: "Swap Error", description: "Could not swap the meal. Please try again.", variant: "destructive"});
    } finally {
      setSwappingMealIndex(null);
    }
  }, [filters, meals, router, searchParams, toast]);

  const handleToggleSavePlan = () => {
    if (!filters || meals.length === 0) {
      toast({ title: "Cannot Save", description: "No meals in the current plan to save.", variant: "destructive" });
      return;
    }
    const mealIdArray = meals.map(m => m.id);
    if (isCurrentPlanSaved) {
      const planId = [...mealIdArray].sort().join(',');
      removeMealPlan(planId);
      setIsCurrentPlanSaved(false);
      toast({ title: "Plan Unsaved", description: "This meal plan has been removed from your favorites." });
    } else {
      saveMealPlan(mealIdArray, filters);
      setIsCurrentPlanSaved(true);
      toast({ title: "Plan Saved!", description: "This meal plan has been added to your favorites." });
    }
  };

  if (isLoading) {
    const mealsPerDay = parseInt(searchParams.get('mealsPerDay') || '1', 10);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {Array.from({ length: mealsPerDay }).map((_, index) => (
                <Card key={index} className="w-full">
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2 mb-2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-48 w-full rounded-lg" />
                        <Skeleton className="h-8 w-3/4 mt-4" />
                        <Skeleton className="h-6 w-1/2 mt-2" />
                        <Skeleton className="h-10 w-full mt-6" />
                        <Skeleton className="h-10 w-full mt-2" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-6 bg-destructive/10 rounded-lg shadow-md max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <p className="text-xl font-semibold mb-2">Oops! Something went wrong.</p>
        <p className="text-sm mb-4">{error}</p>
        <Link href="/" passHref>
            <Button variant="destructive">Try New Search</Button>
        </Link>
      </div>
    );
  }

  if (meals.length === 0) {
     return (
      <div className="text-center text-muted-foreground p-6 bg-card rounded-lg shadow-md max-w-md mx-auto">
        <SearchX className="w-16 h-16 mx-auto mb-4 text-primary" />
        <p className="text-xl font-semibold mb-2">No Meals in Plan</p>
        <p className="text-sm">We couldn't construct your meal plan with the given criteria.</p>
        <Link href="/" passHref>
            <Button variant="outline" className="mt-4">Go to Search</Button>
        </Link>
      </div>
    );
  }
  
  const handleFindAnotherPlan = () => {
    router.push('/'); 
  };

  return (
    <div className="flex flex-col items-center w-full space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 w-full">
        {meals.map((meal, index) => (
          <Card key={meal.id + '-' + index} className="w-full shadow-lg overflow-hidden flex flex-col animate-meal-swap-in bg-card">
             <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary flex items-center gap-2">
                  <Utensils className="w-6 h-6"/> 
                  {getMealLabel(index, meals.length)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-grow flex">
               <MealCard 
                  meal={meal} 
                  showSwapButton={true}
                  onSwapMeal={handleSwapMealInPlan}
                  mealIndexInPlan={index}
                  isSwappingThisCard={swappingMealIndex === index}
                  animationClass=" " 
              />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button onClick={handleFindAnotherPlan} variant="outline" size="lg">
          <ChefHat className="mr-2 h-5 w-5" />
          Find Another Meal Plan
        </Button>
        <Button onClick={handleToggleSavePlan} variant={isCurrentPlanSaved ? "secondary" : "default"} size="lg">
          {isCurrentPlanSaved ? <BookmarkCheck className="mr-2 h-5 w-5" /> : <Bookmark className="mr-2 h-5 w-5" />}
          {isCurrentPlanSaved ? 'Plan Saved' : 'Save This Plan'}
        </Button>
      </div>
    </div>
  );
}

export default function MealPlanPageContainer() {
  const router = useRouter();
  return (
    <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-start gap-8 min-h-screen">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between mt-4 md:mt-8 px-2 sm:px-4">
            <div className="flex-shrink-0">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/')}
                    className="text-muted-foreground hover:text-primary p-1 sm:p-2"
                    aria-label="Go back to search"
                >
                    <ArrowLeft className="h-5 w-5 sm:mr-1" />
                    <span className="hidden sm:inline">New Search</span>
                </Button>
            </div>

            <div className="flex-1 text-center min-w-0 px-1 sm:px-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold text-primary flex items-center justify-center gap-2 sm:gap-3">
                    <ChefHat className="w-7 h-7 sm:w-8 md:w-10 md:h-10" />
                    Your Custom Meal Plan
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground mt-1 sm:mt-2 truncate">
                    Tailored suggestions. Swap or explore details!
                </p>
            </div>
            
            <div className="flex-shrink-0 invisible"> {/* Spacer for centering balance */}
                 <Button
                    variant="ghost"
                    className="p-1 sm:p-2"
                    aria-hidden="true"
                 >
                    <ArrowLeft className="h-5 w-5 sm:mr-1" />
                    <span className="hidden sm:inline">New Search</span>
                </Button>
            </div>
        </div>
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full mt-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground text-lg">Crafting your delicious meal plan...</p>
            </div>
        }>
            <MealPlanDisplayContent />
        </Suspense>
    </main>
  );
}

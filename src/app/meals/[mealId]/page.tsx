
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { MealCard } from '@/components/MealCard';
import type { Meal, MealFilters, DietaryPreferenceValue } from '@/types';
import { fetchMealById, fetchNextMeal } from '@/lib/mealService';
import { AlertTriangle, ChefHat, SearchX, Loader2, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

function MealDisplayPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const mealId = params.mealId as string;

  const [currentMeal, setCurrentMeal] = useState<Meal | null>(null);
  const [filters, setFilters] = useState<MealFilters | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noResultsOnSwap, setNoResultsOnSwap] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    const minPrice = parseInt(searchParams.get('minPrice') || '5', 10);
    const maxPrice = parseInt(searchParams.get('maxPrice') || '50', 10);
    const dietaryPreferencesParam = searchParams.get('dietaryPreferences');
    const dietaryPreferences = dietaryPreferencesParam ? dietaryPreferencesParam.split(',') as DietaryPreferenceValue[] : [];
    const mealsPerDay = parseInt(searchParams.get('mealsPerDay') || '1', 10);
    
    const parsedFilters: MealFilters = { minPrice, maxPrice, dietaryPreferences, mealsPerDay };
    setFilters(parsedFilters);

    if (mealId) {
      setIsLoading(true);
      setError(null);
      setCurrentMeal(null); 
      setAnimationClass(''); 
      fetchMealById(mealId)
        .then(meal => {
          if (meal) {
            triggerAnimation(() => setCurrentMeal(meal), true); 
          } else {
            setError(`Meal with ID ${mealId} not found.`);
            toast({ title: "Error", description: `Meal not found.`, variant: "destructive" });
          }
        })
        .catch(err => {
          console.error(err);
          setError('Failed to fetch meal details.');
          toast({ title: "Error", description: "Failed to load meal.", variant: "destructive" });
        })
        .finally(() => setIsLoading(false));
    } else {
        setError('Meal ID is missing.');
        setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mealId, searchParams, toast]); 

  const handleSwapMealOnSinglePage = async () => {
    if (!filters || !currentMeal) return;
    setIsSwapping(true);
    setError(null);
    setNoResultsOnSwap(false);

    try {
      const existingMealIdsParam = searchParams.get('mealIds');
      const existingMealIds = existingMealIdsParam ? existingMealIdsParam.split(',') : [];
      
      const nextMeal = await fetchNextMeal(filters, currentMeal.id, existingMealIds);
      if (nextMeal) {
        const queryParams = new URLSearchParams();
        if (filters.minPrice) queryParams.set('minPrice', filters.minPrice.toString());
        if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice.toString());
        if (filters.dietaryPreferences.length > 0) queryParams.set('dietaryPreferences', filters.dietaryPreferences.join(','));
        if (filters.mealsPerDay) queryParams.set('mealsPerDay', filters.mealsPerDay.toString());
        // Preserve mealIds if came from a plan context for consistent "exclude list"
        if (existingMealIdsParam) queryParams.set('mealIds', existingMealIdsParam);

        triggerAnimation(() => {
             router.push(`/meals/${nextMeal.id}?${queryParams.toString()}`);
        });
      } else {
        setNoResultsOnSwap(true);
        toast({
          title: "No More Meals",
          description: "No other meals match your current filters.",
          variant: "default",
        });
      }
    } catch (err) {
      setError('Failed to swap meal. Please try again.');
      toast({
        title: "Error",
        description: "Failed to swap meal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSwapping(false);
    }
  };
  
  const triggerAnimation = (updateStateCallback: () => void, isInitialLoad = false) => {
    if (!isInitialLoad && currentMeal) { 
      setAnimationClass('animate-meal-swap-out');
      setTimeout(() => {
        updateStateCallback(); 
      }, 300); 
    } else {
      updateStateCallback();
      setAnimationClass('animate-meal-swap-in'); 
    }
  };
  
  useEffect(() => {
    if (currentMeal) { 
        setAnimationClass('animate-meal-swap-in');
    }
  }, [currentMeal?.id]); 

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-md">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-8 w-3/4 mt-4" />
        <Skeleton className="h-6 w-1/2 mt-2" />
        <Skeleton className="h-10 w-full mt-6" />
        <Skeleton className="h-10 w-full mt-2" />
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

  if (!currentMeal) {
     return (
      <div className="text-center text-muted-foreground p-6 bg-card rounded-lg shadow-md max-w-md mx-auto">
        <SearchX className="w-16 h-16 mx-auto mb-4 text-primary" />
        <p className="text-xl font-semibold mb-2">Meal Not Found</p>
        <p className="text-sm">The meal you are looking for could not be found.</p>
        <Link href="/" passHref>
            <Button variant="outline" className="mt-4">Go to Search</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
       <MealCard 
          meal={currentMeal} 
          onSwapMeal={handleSwapMealOnSinglePage} 
          isSwapping={isSwapping} 
          animationClass={animationClass}
          showSwapButton={true}
        />
        {noResultsOnSwap && (
            <div className="mt-6 text-center p-4 bg-card border rounded-lg shadow-sm">
                <p className="text-muted-foreground">
                    No other meals match your current filters.
                </p>
                <Link href="/" passHref>
                    <Button variant="link" className="text-primary mt-2">
                        Try a new search?
                    </Button>
                </Link>
            </div>
        )}
    </div>
  );
}


export default function MealPageContainer() {
  const router = useRouter();

  return (
    <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-start gap-8 min-h-screen">
        <div className="w-full max-w-xl text-center relative mt-4 md:mt-8">
             <Button 
                variant="ghost" 
                onClick={() => router.back()} 
                className="absolute left-0 top-0 sm:top-1/2 sm:-translate-y-1/2 text-muted-foreground hover:text-primary"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 mr-1" /> Back
            </Button>
            <h1 className="text-4xl font-headline font-bold text-primary flex items-center justify-center gap-3">
                <ChefHat className="w-10 h-10" />
                Meal Suggestion
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
                Here's a meal tailored for you! Not feeling it? Swap it or check out the details.
            </p>
        </div>
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-md mt-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground text-lg">Loading your delicious meal...</p>
            </div>
        }>
            <MealDisplayPageContent />
        </Suspense>
    </main>
  );
}

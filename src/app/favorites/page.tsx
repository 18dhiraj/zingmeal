
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSavedMealPlans, removeMealPlan as removeSavedPlanService, getSavedIndividualMealIds, removeIndividualMeal as removeSavedIndividualMealService } from '@/lib/favoritesService';
import { fetchMealsByIds } from '@/lib/mealService';
import type { SavedMealPlan, Meal, MealFilters } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookmarkX, Trash2, Eye, Utensils, CalendarDays, Filter, Heart, PlusCircle, ChefHat, ListChecks, Loader2, Bookmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MealCard } from '@/components/MealCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const formatFiltersForDisplay = (filters: MealFilters): React.ReactNode => {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Badge variant="secondary" className="text-xs py-1 px-2">
        <Utensils className="w-3 h-3 mr-1" /> {filters.mealsPerDay} meal(s)/day
      </Badge>
      <Badge variant="secondary" className="text-xs py-1 px-2">
        ${filters.minPrice} - ${filters.maxPrice}
      </Badge>
      {filters.dietaryPreferences.length > 0 && (
        <Badge variant="secondary" className="text-xs py-1 px-2 capitalize">
          <ListChecks className="w-3 h-3 mr-1" /> {filters.dietaryPreferences.join(', ').replace(/-/g, ' ')}
        </Badge>
      )}
    </div>
  );
};

interface SavedPlanItemProps {
  plan: SavedMealPlan;
  meals: Meal[];
  onRemove: (planId: string) => void;
  isLoadingMeals: boolean;
}

const SavedPlanItem: React.FC<SavedPlanItemProps> = ({ plan, meals, onRemove, isLoadingMeals }) => {
  const router = useRouter();

  const viewPlan = () => {
    const queryParams = new URLSearchParams({
      mealIds: plan.mealIds.join(','),
      minPrice: plan.filters.minPrice.toString(),
      maxPrice: plan.filters.maxPrice.toString(),
      dietaryPreferences: plan.filters.dietaryPreferences.join(','),
      mealsPerDay: plan.filters.mealsPerDay.toString(),
    });
    router.push(`/meal-plan?${queryParams.toString()}`);
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow bg-card flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-headline text-primary mb-1">
            {plan.name || `Meal Plan`}
            </CardTitle>
            <span className="text-xs font-normal text-muted-foreground flex items-center gap-1 whitespace-nowrap pt-1">
                <CalendarDays className="w-3.5 h-3.5" />
                {new Date(plan.savedAt).toLocaleDateString()}
            </span>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          {formatFiltersForDisplay(plan.filters)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        <h4 className="font-medium text-foreground text-sm">Meals in this plan:</h4>
        {isLoadingMeals ? (
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        ) : meals.length > 0 ? (
          <ul className="list-disc list-inside pl-2 space-y-1 text-sm text-muted-foreground">
            {meals.map(meal => <li key={meal.id}>{meal.name}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground italic">Meal details could not be loaded for this plan.</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-auto">
        <Button variant="outline" size="sm" onClick={viewPlan} disabled={isLoadingMeals || meals.length === 0}>
          <Eye className="mr-1.5 h-4 w-4" /> View Plan
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onRemove(plan.id)} disabled={isLoadingMeals}>
          <Trash2 className="mr-1.5 h-4 w-4" /> Remove
        </Button>
      </CardFooter>
    </Card>
  );
};


export default function FavoritesPage() {
  const [savedPlans, setSavedPlans] = useState<SavedMealPlan[]>([]);
  const [detailedPlanMeals, setDetailedPlanMeals] = useState<Record<string, Meal[]>>({});
  const [savedIndividualMeals, setSavedIndividualMeals] = useState<Meal[]>([]);
  
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isLoadingIndividualMeals, setIsLoadingIndividualMeals] = useState(true);
  const [isLoadingPlanDetails, setIsLoadingPlanDetails] = useState<Record<string, boolean>>({});


  const { toast } = useToast();

  const loadSavedPlans = useCallback(async () => {
    setIsLoadingPlans(true);
    const plansFromStorage = getSavedMealPlans();
    setSavedPlans(plansFromStorage);

    if (plansFromStorage.length > 0) {
      plansFromStorage.forEach(async (plan) => {
        setIsLoadingPlanDetails(prev => ({ ...prev, [plan.id]: true }));
        try {
          if (plan.mealIds.length > 0) {
            const fetchedMeals = await fetchMealsByIds(plan.mealIds);
            setDetailedPlanMeals(prev => ({ ...prev, [plan.id]: fetchedMeals }));
          } else {
            setDetailedPlanMeals(prev => ({ ...prev, [plan.id]: [] }));
          }
        } catch (error) {
          console.error(`Failed to fetch meal details for plan ${plan.id}:`, error);
          toast({ title: "Error", description: `Could not load details for plan ${plan.name || plan.id.substring(0,8)}.`, variant: "destructive" });
          setDetailedPlanMeals(prev => ({ ...prev, [plan.id]: [] }));
        } finally {
          setIsLoadingPlanDetails(prev => ({ ...prev, [plan.id]: false }));
        }
      });
    }
    setIsLoadingPlans(false);
  }, [toast]);

  const loadSavedIndividualMeals = useCallback(async () => {
    setIsLoadingIndividualMeals(true);
    const mealIds = getSavedIndividualMealIds();
    if (mealIds.length > 0) {
      try {
        const meals = await fetchMealsByIds(mealIds);
        setSavedIndividualMeals(meals);
      } catch (error) {
        console.error("Failed to fetch individual saved meals:", error);
        toast({ title: "Error", description: "Could not load details for saved individual meals.", variant: "destructive" });
        setSavedIndividualMeals([]);
      }
    } else {
      setSavedIndividualMeals([]);
    }
    setIsLoadingIndividualMeals(false);
  }, [toast]);

  useEffect(() => {
    loadSavedPlans();
    loadSavedIndividualMeals();
  }, [loadSavedPlans, loadSavedIndividualMeals]);

  const handleRemovePlan = (planId: string) => {
    removeSavedPlanService(planId);
    loadSavedPlans(); 
    toast({ title: "Plan Removed", description: "The meal plan has been removed from your favorites." });
  };

  const handleRemoveIndividualMeal = (mealId: string) => {
    removeSavedIndividualMealService(mealId);
    loadSavedIndividualMeals(); 
    toast({ title: "Meal Removed", description: "The meal has been removed from your favorites." });
  };
  
  const overallLoading = isLoadingPlans || isLoadingIndividualMeals || Object.values(isLoadingPlanDetails).some(s => s);

  return (
    <main className="flex-grow container mx-auto px-4 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary flex items-center justify-center gap-3">
          <Bookmark className="w-8 h-8 sm:w-10 sm:h-10" />
          Your Favorites
        </h1>
        <p className="text-md sm:text-lg text-muted-foreground mt-2">
          Revisit your saved meal plans and individual dishes.
        </p>
      </div>

      {(isLoadingPlans || isLoadingIndividualMeals) && Object.keys(isLoadingPlanDetails).length === 0 && (
         <div className="space-y-10 mt-10">
            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center gap-2"><Utensils className="w-6 h-6" /> Saved Meal Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1,2].map(i => (
                  <Card key={`plan-skeleton-${i}`}>
                    <CardHeader> <Skeleton className="h-6 w-3/4" /> <Skeleton className="h-4 w-1/2 mt-2" /> </CardHeader>
                    <CardContent className="space-y-2"> <Skeleton className="h-4 w-full" /> <Skeleton className="h-4 w-5/6" /> </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-4 border-t"> <Skeleton className="h-9 w-24" /> <Skeleton className="h-9 w-24" /> </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
            <Separator className="my-10" />
            <div>
               <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center gap-2"><Heart className="w-6 h-6" /> Saved Individual Meals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                   <Card key={`meal-skeleton-${i}`} className="w-full">
                    <CardHeader className="p-0"><Skeleton className="h-48 w-full rounded-t-lg" /></CardHeader>
                    <CardContent className="p-4"><Skeleton className="h-7 w-3/4 mt-2" /><Skeleton className="h-5 w-1/2 mt-2" /></CardContent>
                    <CardFooter className="p-4 border-t"><Skeleton className="h-10 w-full" /></CardFooter>
                  </Card>
                ))}
              </div>
            </div>
         </div>
      )}

      {!overallLoading && savedPlans.length === 0 && savedIndividualMeals.length === 0 && (
        <div className="text-center text-muted-foreground py-16 mt-8">
          <BookmarkX className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 text-primary/30" />
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">No Favorites Yet!</h2>
          <p className="mb-6 text-sm sm:text-base">Start exploring and save meal plans or individual meals to see them here.</p>
          <Link href="/" passHref>
            <Button size="lg">
              <ChefHat className="mr-2 h-5 w-5" /> Find New Meals
            </Button>
          </Link>
        </div>
      )}
      
      {!isLoadingPlans && savedPlans.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-headline font-semibold text-primary mb-6 flex items-center gap-2">
            <Utensils className="w-7 h-7 sm:w-8 sm:h-8" /> Saved Meal Plans
          </h2>
          {savedPlans.length === 0 && !isLoadingPlans && (
            <p className="text-muted-foreground">You haven't saved any meal plans yet.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedPlans.map((plan) => (
              <SavedPlanItem 
                key={plan.id} 
                plan={plan} 
                meals={detailedPlanMeals[plan.id] || []} 
                onRemove={handleRemovePlan}
                isLoadingMeals={isLoadingPlanDetails[plan.id] === undefined ? true : isLoadingPlanDetails[plan.id]}
              />
            ))}
          </div>
        </section>
      )}

      {!isLoadingPlans && !isLoadingIndividualMeals && savedPlans.length > 0 && savedIndividualMeals.length > 0 && <Separator className="my-12" />}

      {!isLoadingIndividualMeals && savedIndividualMeals.length > 0 && (
        <section>
          <h2 className="text-2xl sm:text-3xl font-headline font-semibold text-primary mb-6 flex items-center gap-2">
            <Heart className="w-7 h-7 sm:w-8 sm:h-8" /> Saved Individual Meals
          </h2>
           {savedIndividualMeals.length === 0 && !isLoadingIndividualMeals && (
            <p className="text-muted-foreground">You haven't saved any individual meals yet.</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedIndividualMeals.map(meal => (
              <div key={meal.id} className="flex flex-col h-full">
                <MealCard meal={meal} showSwapButton={false} animationClass=" "/>
                <Button 
                  variant="destructive" 
                  onClick={() => handleRemoveIndividualMeal(meal.id)} 
                  className="mt-2 w-full"
                  aria-label={`Remove ${meal.name} from favorites`}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

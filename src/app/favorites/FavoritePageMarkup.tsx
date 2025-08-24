"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    BookmarkX,
    Trash2,
    Eye,
    Utensils,
    CalendarDays,
    Heart,
    ChefHat,
    ListChecks,
    Bookmark,
} from "lucide-react";
import { MealCard } from "@/components/MealCard";
import type { SavedMealPlan, Meal, MealFilters } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";
import Image from 'next/image'

type Props = {
    savedPlans: SavedMealPlan[];
    detailedPlanMeals: Record<string, Meal[]>;
    savedIndividualMeals: Meal[];
    onRemovePlan: (planId: string) => void;
    onRemoveIndividualMeal: (mealId: string) => void;
};

// Component to display filters with currency awareness
const FilterDisplay = ({ filters }: { filters: MealFilters }) => {
    const { formatPrice, selectedCurrency } = useCurrency();

    return (
        <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="secondary" className="text-xs py-1 px-2">
                <Utensils className="w-3 h-3 mr-1" /> {filters.mealsPerDay} meal(s)/day
            </Badge>
            <Badge variant="secondary" className="text-xs py-1 px-2">
                {formatPrice(filters.minPrice, selectedCurrency)} - {formatPrice(filters.maxPrice, selectedCurrency)}
            </Badge>
            {filters.dietaryPreferences.length > 0 && (
                <Badge variant="secondary" className="text-xs py-1 px-2 capitalize">
                    <ListChecks className="w-3 h-3 mr-1" />
                    {filters.dietaryPreferences.join(", ").replace(/-/g, " ")}
                </Badge>
            )}
        </div>
    );
};

export default function FavoritePageMarkup({
    savedPlans,
    detailedPlanMeals,
    savedIndividualMeals,
    onRemovePlan,
    onRemoveIndividualMeal,
}: Props) {
    const isEmpty = savedPlans.length === 0 && savedIndividualMeals.length === 0;


    return (
        <main className="flex-grow container mx-auto px-4 py-8">
            <div className="flex flex-col items-center w-full space-y-8">
                <div className="text-center w-full">
                    <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary flex items-center justify-center gap-3">
                        <Bookmark className="w-8 h-8 sm:w-10 sm:h-10" />
                        Your Favorites
                    </h1>
                    <p className="text-md sm:text-lg text-muted-foreground mt-2">
                        Revisit your saved meal plans and individual dishes.
                    </p>
                </div>
            </div>

            {isEmpty && (
                <div className="text-center text-muted-foreground py-16 mt-8">
                    <BookmarkX className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 text-primary/30" />
                    <h2 className="text-xl sm:text-2xl font-semibold mb-2">No Favorites Yet!</h2>
                    <p className="mb-6 text-sm sm:text-base">
                        Start exploring and save meal plans or individual meals to see them here.
                    </p>
                    <Link href="/" passHref>
                        <Button size="lg">
                            {/* <ChefHat className="mr-2 h-5 w-5" />  */}
                            <Image
                                src={require('@/assets/logo/logo.png')}
                                alt='zingmeal-logo'
                                className='w-8 h-8'
                            />
                            Find New Meals
                        </Button>
                    </Link>
                </div>
            )}

            {savedPlans.length > 0 && (
                <section className="mb-12">
                    <h2 className="text-2xl sm:text-3xl font-headline font-semibold text-primary mb-6 flex items-center gap-2">
                        <Utensils className="w-7 h-7 sm:w-8 sm:h-8" /> Saved Meal Plans
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {savedPlans.map((plan) => {
                            const meals = detailedPlanMeals[plan.id] || [];
                            return (
                                <Card key={plan.id} className="shadow-md hover:shadow-lg transition-shadow bg-card flex flex-col">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-xl font-headline text-primary mb-1">
                                                {plan.name || "Meal Plan"}
                                            </CardTitle>
                                            <span className="text-xs font-normal text-muted-foreground flex items-center gap-1 whitespace-nowrap pt-1">
                                                <CalendarDays className="w-3.5 h-3.5" />
                                                {new Date(plan.savedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <CardDescription className="text-sm text-muted-foreground">
                                            <FilterDisplay filters={plan.filters} />
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3 flex-grow">
                                        <h4 className="font-medium text-foreground text-sm">Meals in this plan:</h4>
                                        {meals.length > 0 ? (
                                            <ul className="list-disc list-inside pl-2 space-y-1 text-sm text-muted-foreground">
                                                {meals.map((meal) => (
                                                    <li key={meal.id}>{meal.name}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">
                                                Meal details could not be loaded for this plan.
                                            </p>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const queryParams = new URLSearchParams({
                                                    mealIds: plan.mealIds.join(","),
                                                    minPrice: plan.filters.minPrice.toString(),
                                                    maxPrice: plan.filters.maxPrice.toString(),
                                                    dietaryPreferences: plan.filters.dietaryPreferences.join(","),
                                                    mealsPerDay: plan.filters.mealsPerDay.toString(),
                                                });
                                                window.location.href = `/meal-plan?${queryParams.toString()}`;
                                            }}
                                            disabled={meals.length === 0}
                                        >
                                            <Eye className="mr-1.5 h-4 w-4" /> View Plan
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => onRemovePlan(plan.id)}
                                        >
                                            <Trash2 className="mr-1.5 h-4 w-4" /> Remove
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </section>
            )}

            {savedIndividualMeals.length > 0 && (
                <>
                    <Separator className="my-12" />
                    <section>
                        <h2 className="text-2xl sm:text-3xl font-headline font-semibold text-primary mb-6 flex items-center gap-2">
                            <Heart className="w-7 h-7 sm:w-8 sm:h-8" /> Saved Individual Meals
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedIndividualMeals.map((meal) => (
                                <div key={meal.id} className="flex flex-col h-full">
                                    <MealCard
                                        meal={meal}
                                        showSwapButton={false}
                                        animationClass=" "
                                    />
                                    <Button
                                        variant="destructive"
                                        onClick={() => onRemoveIndividualMeal(meal.id)}
                                        className="mt-2 w-full"
                                        aria-label={`Remove ${meal.name} from favorites`}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Remove
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}

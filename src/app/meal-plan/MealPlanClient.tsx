'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    AlertTriangle,
    ChefHat,
    SearchX,
    Loader2,
    ArrowLeft,
    Utensils,
    Bookmark,
    BookmarkCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MealCard } from '@/components/MealCard';
import {
    fetchMealsByIds,
    fetchNextMeal,
} from '@/lib/mealService';
import {
    saveMealPlan,
    removeMealPlan,
    isMealPlanSaved,
} from '@/lib/favoritesService';
import type {
    Meal,
    MealFilters,
    DietaryPreferenceValue,
} from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import LoginInfoTip from '@/components/LoginInfo';
import Image from 'next/image'

const getMealLabel = (index: number, total: number) => {
    if (total === 1) return 'Your Meal Suggestion';
    if (total === 2) return index === 0 ? 'Morning Meal' : 'Afternoon/Evening Meal';
    if (total === 3)
        return ['Breakfast', 'Lunch', 'Dinner'][index] || `Meal ${index + 1}`;
    return `Meal ${index + 1}`;
};

function MealPlanDisplay() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [meals, setMeals] = useState<Meal[]>([]);
    const [filters, setFilters] = useState<MealFilters | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [swapIdx, setSwapIdx] = useState<number | null>(null);
    const [planSaved, setPlanSaved] = useState(false);

    useEffect(() => {
        const idsParam = searchParams.get('mealIds');
        const minPrice = Number(searchParams.get('minPrice') ?? 5);
        const maxPrice = Number(searchParams.get('maxPrice') ?? 50);
        const prefs = (searchParams.get('dietaryPreferences') ?? '')
            .split(',')
            .filter(Boolean) as DietaryPreferenceValue[];
        const perDay = Number(searchParams.get('mealsPerDay') ?? 1);
        const flt: MealFilters = { minPrice, maxPrice, dietaryPreferences: prefs, mealsPerDay: perDay };
        setFilters(flt);

        const load = async () => {
            if (!idsParam) {
                setError('Meal IDs are missing from the URL.');
                setLoading(false);
                return;
            }

            const ids = idsParam.split(',');
            try {
                setLoading(true);
                setPlanSaved(await isMealPlanSaved(ids));

                const fetched = await fetchMealsByIds(ids);
                if (fetched.length !== ids.length) {
                    setError('Could not find all selected meals.');
                    toast({
                        title: 'Error',
                        description: 'Selected meals not found or incomplete.',
                        variant: 'destructive',
                    });
                } else {
                    setMeals(ids.map((id) => fetched.find((m) => m.id === id)!) as Meal[]);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to fetch meal plan details.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [searchParams, toast]);

    const swapMeal = useCallback(
        async (idToSwap: string, idx?: number) => {
            if (!filters || idx === undefined) return;

            setSwapIdx(idx);
            try {
                const exclude = meals.map((m) => m.id).filter((id) => id !== idToSwap);
                const next = await fetchNextMeal(filters, idToSwap, exclude);

                if (!next) {
                    toast({ title: 'No Other Meals', description: 'No other meals match your filters for this slot.' });
                    return;
                }

                const nextMeals = [...meals];
                nextMeals[idx] = next;
                setMeals(nextMeals);
                const newIds = nextMeals.map((m) => m.id);

                // update URL (no full refresh)
                const p = new URLSearchParams(Array.from(searchParams.entries()));
                p.set('mealIds', newIds.join(','));
                router.replace(`${location.pathname}?${p.toString()}`, { scroll: false });

                setPlanSaved(await isMealPlanSaved(newIds));
            } catch (err) {
                console.error(err);
                toast({ title: 'Swap Error', description: 'Could not swap the meal.', variant: "destructive" });
            } finally {
                setSwapIdx(null);
            }
        },
        [filters, meals, router, searchParams, toast],
    );

    const toggleSavePlan = async () => {
        if (!filters || meals.length === 0) return;
        const ids = meals.map((m) => m.id);

        if (planSaved) {
            await removeMealPlan(ids.sort().join(','));
            toast({ title: 'Plan Unsaved', description: 'Removed from favorites.' });
            setPlanSaved(false);
        } else {
            await saveMealPlan(ids, filters);
            toast({ title: 'Plan Saved!', description: 'Added to favorites.' });
            setPlanSaved(true);
        }
    };

    if (loading) {
        const n = Number(searchParams.get('mealsPerDay') ?? 1);
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                {Array.from({ length: n }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                        <CardContent>
                            <Skeleton className="h-48 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-destructive p-6 bg-destructive/10 rounded-lg">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                <p className="text-xl font-semibold mb-2">{error}</p>
                <Link href="/" passHref>
                    <Button variant="destructive">Try New Search</Button>
                </Link>
            </div>
        );
    }

    if (meals.length === 0) {
        return (
            <div className="text-center p-6 bg-card rounded-lg shadow">
                <SearchX className="w-16 h-16 mx-auto mb-4 text-primary" />
                <p className="text-xl font-semibold mb-2">No Meals in Plan</p>
                <Link href="/" passHref>
                    <Button variant="outline">Go to Search</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full space-y-8">
            <LoginInfoTip />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {meals.map((meal, idx) => (
                    <Card key={meal.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <Utensils className="w-5 h-5" />
                                {getMealLabel(idx, meals.length)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-grow">
                            <MealCard
                                meal={meal}
                                showSwapButton
                                onSwapMeal={swapMeal}
                                mealIndexInPlan={idx}
                                isSwappingThisCard={swapIdx === idx}
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => router.push('/')} variant="outline" size="lg">
                    {/* <ChefHat className="mr-2 h-5 w-5" /> */}
                    <Image
                        src={'https://wjj0gm4hotsxgybm.public.blob.vercel-storage.com/public/logo-black.png'}
                        width={150}
                        height={30}
                        alt='zingmeal-logo'
                        className='w-10 h-10'
                    />
                    Find Another Meal Plan
                </Button>

                <Button onClick={toggleSavePlan} size="lg" variant={planSaved ? 'secondary' : 'default'}>
                    {planSaved ? <BookmarkCheck className="mr-2 h-5 w-5" /> : <Bookmark className="mr-2 h-5 w-5" />}
                    {planSaved ? 'Plan Saved' : 'Save This Plan'}
                </Button>
            </div>
        </div>
    );
}

export default function MealPlanClient() {
    const router = useRouter();

    return (
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
            <div className="w-full max-w-6xl flex items-center justify-between mb-8">
                <Button variant="ghost" onClick={() => router.push('/')}>
                    <ArrowLeft className="w-5 h-5 mr-1" /> New Search
                </Button>
                <h1 className="text-2xl sm:text-3xl font-headline font-bold text-primary flex items-center gap-2">
                    {/* <ChefHat className="w-7 h-7" /> */}
                    <Image
                        src={require('@/assets/logo/logo-primary.png')}
                        alt='zingmeal-logo'
                        className='w-12 h-12'
                    />
                    Your Custom Meal Plan
                </h1>
                <span className="w-24" />
            </div>

            <Suspense
                fallback={
                    <div className="flex flex-col items-center justify-center min-h-[200px]">
                        <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
                        <p className="text-muted-foreground">Crafting your delicious meal plan…</p>
                    </div>
                }
            >
                <MealPlanDisplay />
            </Suspense>
        </main>
    );
}

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MealCard } from '@/components/MealCard';
import {
    fetchMealById,
    fetchNextMeal,
} from '@/lib/mealService';
import {
    AlertTriangle,
    ChefHat,
    SearchX,
    Loader2,
    ArrowLeft,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type {
    Meal,
    MealFilters,
    DietaryPreferenceValue,
} from '@/types';
import { popularityService } from '@/lib/popularityService';
import Image from 'next/image'

const parseFilters = (sp: URLSearchParams): MealFilters => ({
    minPrice: Number(sp.get('minPrice') ?? 5),
    maxPrice: Number(sp.get('maxPrice') ?? 50),
    dietaryPreferences: (sp.get('dietaryPreferences') ?? '')
        .split(',')
        .filter(Boolean) as DietaryPreferenceValue[],
    mealsPerDay: Number(sp.get('mealsPerDay') ?? 1),
});

function MealDisplay() {
    const router = useRouter();
    const { mealId } = useParams<{ mealId: string }>();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [meal, setMeal] = useState<Meal | null>(null);
    const [filters, setFilters] = useState<MealFilters | null>(null);
    const [loading, setLoading] = useState(true);
    const [swapping, setSwapping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [noMore, setNoMore] = useState(false);
    const [anim, setAnim] = useState('');

    useEffect(() => {
        if (!mealId) {
            setError('Meal ID missing');
            setLoading(false);
            return;
        }

        setFilters(parseFilters(searchParams));
        setLoading(true);
        setError(null);

        fetchMealById(mealId)
            .then((m) => {
                if (!m) throw new Error('not‑found');
                setAnim('animate-meal-swap-in');
                setMeal(m);
                // Start popularity tracking for meal page view
                popularityService.startMealVisit(mealId, m.name);
            })
            .catch(() => {
                setError(`Meal with ID ${mealId} not found.`);
            })
            .finally(() => setLoading(false));
    }, [mealId, searchParams]);

    // Cleanup popularity tracking on unmount or mealId change
    useEffect(() => {
        return () => {
            if (mealId) {
                popularityService.stopMealVisit(mealId);
            }
        };
    }, [mealId]);

    const swapMeal = async () => {
        if (!filters || !meal) return;
        setSwapping(true);
        setNoMore(false);

        try {
            const exclude = (searchParams.get('mealIds') ?? '').split(',');
            const next = await fetchNextMeal(filters, meal.id, exclude);

            if (!next) {
                setNoMore(true);
                toast({
                    title: 'No More Meals',
                    description: 'No other meals match your current filters.',
                });
                return;
            }

            const qp = new URLSearchParams(searchParams.toString());
            qp.set('mealIds', exclude.join(','));       // keep original exclude list
            setAnim('animate-meal-swap-out');

            setTimeout(() => {
                router.push(`/meals/${next.id}?${qp.toString()}`);
            }, 300);
        } catch {
            toast({
                title: 'Swap Error',
                description: 'Could not swap meal.',
                variant: 'destructive',
            });
        } finally {
            setSwapping(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center w-full max-w-md">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-8 w-3/4 mt-4" />
                <Skeleton className="h-6 w-1/2 mt-2" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-6 bg-destructive/10 rounded-lg max-w-md">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                <p className="font-semibold mb-2">{error}</p>
                <Link href="/" passHref>
                    <Button variant="destructive">Try New Search</Button>
                </Link>
            </div>
        );
    }

    if (!meal) {
        return (
            <div className="text-center p-6 bg-card rounded-lg max-w-md">
                <SearchX className="w-16 h-16 mx-auto mb-4 text-primary" />
                <p className="font-semibold mb-2">Meal Not Found</p>
                <Link href="/" passHref>
                    <Button variant="outline">Go to Search</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full">
            <MealCard
                meal={meal}
                onSwapMeal={swapMeal}
                isSwapping={swapping}
                animationClass={anim}
                showSwapButton
            />

            {noMore && (
                <div className="mt-6 text-center p-4 bg-card border rounded-lg">
                    <p className="text-muted-foreground">
                        No other meals match your current filters.
                    </p>
                    <Link href="/" passHref>
                        <Button variant="link" className="mt-2">
                            Try a new search?
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}

/* ───────── shell component ───────── */
export default function MealPageClient() {
    const router = useRouter();

    return (
        <main className="container mx-auto px-4 py-8 flex flex-col items-center">
            {/* header */}
            <div className="w-full max-w-xl text-center relative mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="absolute left-0 top-0 text-muted-foreground hover:text-primary"
                >
                    <ArrowLeft className="h-5 w-5 mr-1" /> Back
                </Button>
                <h1 className="text-4xl font-headline font-bold text-primary flex items-center justify-center gap-3">
                    {/* <ChefHat className="w-10 h-10" /> */}
                    <Image
                        src={require('@/assets/logo/logo.png')}
                        alt='zingmeal-logo'
                        className='w-8 h-8'
                    />
                    Meal Suggestion
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Here’s a meal tailored for you!  Not feeling it? Swap it or view details.
                </p>
            </div>

            {/* content */}
            <Suspense
                fallback={
                    <div className="flex flex-col items-center min-h-[200px]">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Loading your delicious meal…</p>
                    </div>
                }
            >
                <MealDisplay />
            </Suspense>
        </main>
    );
}

"use client";

import React, { useEffect, useState } from "react";
import { Meal } from "@/types"; // Update path based on your project
import { fetchNewMeals } from "../../lib/mealService"; // Replace with your actual fetch function
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const PopularMeals = () => {
    const [popularMeals, setPopularMeals] = useState<Meal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const loadPopularMeals = async () => {
            try {
                const meals = await fetchNewMeals();
                setPopularMeals(meals);
            } catch (error) {
                console.error("Failed to load popular meals:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPopularMeals();
    }, []);

    return (
        <section className="container mx-auto px-4 py-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading
                    ? Array.from({ length: 3 }).map((_, idx) => (
                        <Card
                            key={`skeleton-${idx}`}
                            className="animate-pulse rounded-2xl overflow-hidden border border-border bg-card shadow-md"
                        >
                            <Skeleton className="h-52 w-full" />
                            <CardContent className="p-5 space-y-3">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardContent>
                        </Card>
                    ))
                    : popularMeals.map((meal) => (
                        <Card
                            key={meal.id}
                            onClick={() => router.push(`/meals/${meal.id}/details`)}
                            className="rounded-2xl overflow-hidden border border-border bg-white dark:bg-muted/30 shadow-sm hover:shadow-lg transition-all cursor-pointer"
                        >
                            {/* Image with price badge */}
                            <div className="relative h-52 w-full">
                                <Image
                                    src={meal.imageUrl}
                                    alt={meal.name}
                                    fill
                                    className="object-cover"
                                />
                                <div className="relative h-52 w-full overflow-hidden rounded-t-2xl">
                                    <Image
                                        src={meal.imageUrl}
                                        alt={meal.name}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent to-50% z-10" />
                                    <div className="absolute top-3 right-3 z-20 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                                        ₹{meal.price}
                                    </div>
                                    {meal.dietaryTags?.length > 0 && (
                                        <div className="absolute top-3 left-3 z-20 bg-white/90 text-xs text-foreground font-medium px-2 py-1 rounded-full shadow-sm">
                                            {meal.dietaryTags[0].replace(/-/g, " ")}
                                        </div>
                                    )}

                                    <div className="absolute bottom-3 left-3 z-20">
                                        <h4 className="text-white font-semibold text-sm drop-shadow-md line-clamp-1">
                                            {meal.name}
                                        </h4>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 space-y-2">
                                <p className="text-sm text-muted-foreground line-clamp-2">{meal.description}</p>
                                <div className="flex items-center justify-between text-xs mt-3">
                                    <span className="text-muted-foreground">{meal.calories} kcal</span>
                                    <div className="flex gap-1 flex-wrap justify-end">
                                        {meal.dietaryTags?.slice(0, 2).map((tag) => (
                                            <span
                                                key={tag}
                                                className="bg-accent text-foreground/80 px-2 py-0.5 rounded-full text-[10px] capitalize"
                                            >
                                                {tag.replace(/-/g, " ")}
                                            </span>
                                        ))}
                                        {meal.dietaryTags?.length > 2 && (
                                            <span className="text-muted-foreground text-[10px]">+{meal.dietaryTags.length - 2}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
            </div>
        </section>

    );
};

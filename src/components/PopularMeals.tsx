"use client";

import React, { useEffect, useState } from "react";
import { Meal } from "@/types"; // Update path based on your project
import { fetchNewMeals } from "../lib/mealService"; // Replace with your actual fetch function
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
                const meals = await fetchNewMeals(); // You can limit to top 6 in your service
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
        <section className="container mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold text-center mb-10 text-primary">
                Popular Meals
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading
                    ? Array.from({ length: 3 }).map((_, idx) => (
                        <Card key={`skeleton-${idx}`} className="animate-pulse">
                            <Skeleton className="h-48 w-full rounded-t-lg" />
                            <CardContent className="p-4 space-y-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardContent>
                        </Card>
                    ))
                    : popularMeals.map((meal) => (
                        <Card key={meal.id} onClick={() => router.push(`/meals/${meal.id}/details`)} className="hover:shadow-lg transition-shadow">
                            <div className="relative h-48 w-full">
                                <Image
                                    src={meal.imageUrl}
                                    alt={meal.name}
                                    fill
                                    className="object-cover rounded-t-lg"
                                />
                            </div>
                            <CardHeader>
                                <CardTitle className="text-xl text-primary truncate">{meal.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm line-clamp-3">
                                    {meal.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
            </div>
        </section>
    );
};

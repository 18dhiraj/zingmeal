// app/page.tsx
"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";
import Image from "next/image";
import { PopularMeals } from '../components/PopularMeals'

export default function HomePage() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const scrollToMeals = () => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <main className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative h-screen w-full">
                <Image
                    src="/images/hero-meal.jpg"
                    alt="Delicious meals"
                    fill
                    priority
                    className="object-cover z-0 -scale-x-100"
                />

                <div className="absolute inset-0 bg-black/20 z-10" />
                <div className="absolute inset-0 flex items-center justify-end z-20 px-8 sm:px-12">
                    <div className="bg-white/90 backdrop-blur-md p-8 rounded-xl max-w-sm text-center shadow-lg space-y-4">
                        <ChefHat className="w-10 h-10 text-primary mx-auto" />
                        <h1 className="text-2xl font-bold text-primary">Find Your Perfect Meal</h1>
                        <Button
                            onClick={() => router.push("/meal-finder")}
                            size="lg"
                            className="w-full text-lg"
                        >
                            Explore Meals
                        </Button>
                        <button
                            onClick={scrollToMeals}
                            className="text-sm text-muted-foreground underline hover:text-primary"
                        >
                            See Popular Meals ↓
                        </button>
                    </div>
                </div>
            </section>

            {/* Popular Meals Section */}
            <section ref={scrollRef} className="bg-background py-16 px-4 sm:px-8">
                <div className="max-w-6xl mx-auto text-center mb-10">
                    <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Popular Meals</h2>
                    <p className="text-muted-foreground">Loved by users and highly rated</p>
                </div>
                <PopularMeals />
            </section>
        </main>
    );
}

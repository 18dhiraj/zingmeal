// app/page.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChefHat, Bookmark, LogOut } from "lucide-react";
import Image from "next/image";
import { PopularMeals } from '../components/PopularMeals';
import { auth } from "@/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import Link from "next/link";

export default function HomePage() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    const scrollToMeals = () => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
    };

    return (
        <main className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/10 backdrop-blur-[1px] text-white px-6 sm:px-12 py-3 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <ChefHat className="w-6 h-6 text-white" />
                    <span className="text-xl font-semibold tracking-wide">ZingMeal</span>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/favorites")}
                        className="text-white hover:bg-white/40 border border-white/30"
                    >
                        <Bookmark className="h-4 w-4 mr-1" />
                        Favorites
                    </Button>

                    {user ? (
                        <>
                            <span className="text-sm text-white">{user.displayName || user.email}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="text-white hover:bg-white/40 "
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/login")}
                            className="text-white hover:bg-white/40 border border-white/30"
                        >
                            Login
                        </Button>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative h-screen w-full -mt-[60px]">
                <Image
                    src="/images/hero-meal1.jpg"
                    alt="Delicious meals"
                    fill
                    priority
                    className="object-cover z-0"
                />
                <div className="absolute inset-0 bg-black/20 z-10" />
                <div className="absolute inset-0 flex items-center justify-end z-20 px-6 sm:px-24">
                    <div className="bg-black/20 backdrop-blur-[1px] border border-white/20 p-8 rounded-2xl max-w-md w-full text-left shadow-xl space-y-6">
                        <div className="flex items-center gap-3">
                            <ChefHat className="w-8 h-8 text-white" />
                            <h1 className="text-3xl font-semibold text-white">Find Your Perfect Meal</h1>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed">
                            Discover meals tailored to your taste. Filter by diet, budget, and more. Save plans, copy ingredients, and download PDFs for easy shopping.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push("/meal-finder")}
                                className="w-full text-base font-semibold text-white bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:via-red-600 hover:to-yellow-600 transition duration-200 rounded-full py-3 shadow-lg"
                            >
                                🍽️ Discover Meals for You
                            </button>

                            <button
                                onClick={scrollToMeals}
                                className="block w-full text-center text-sm text-white/80 hover:text-white transition"
                            >
                                ↓ See Newest Meals
                            </button>
                        </div>
                    </div>
                </div>

            </section>

            {/* Popular Meals Section */}
            <section ref={scrollRef} className="bg-background py-16 px-4 sm:px-8">
                <div className="max-w-6xl mx-auto text-center mb-10">
                    <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Newest Meals</h2>
                    <p className="text-muted-foreground">Loved by users and highly rated</p>
                </div>
                <PopularMeals />
            </section>
            <section className="bg-muted py-20 px-4 sm:px-8">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">Why ZingMeal?</h2>
                        <p className="text-muted-foreground mb-6">
                            ZingMeal makes your meal planning smarter and easier. Whether you’re eating healthy,
                            managing a diet, or just love discovering new meals — we’ve got you covered.
                        </p>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">✓</span>
                                <span><strong>Copy Ingredients:</strong> Copy full ingredient lists in one click.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">✓</span>
                                <span><strong>Download PDF:</strong> Export your meal plan or recipe as a printable PDF.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">✓</span>
                                <span><strong>Save Meals & Plans:</strong> Keep your favorites synced across devices.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden shadow-lg">
                        <Image
                            src="/images/hero-meal.jpg" // Add a modern visual here
                            alt="Meal planning made easy"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30" />
                        <div className="absolute bottom-4 left-4 text-white">
                            <h3 className="text-xl font-bold">Smart Meal Planning</h3>
                            <p className="text-sm">Take control of your nutrition, your way.</p>
                        </div>
                    </div>
                </div>
            </section>
            {/* Footer */}
            <footer className="bg-card border-t mt-10">
                <div className="max-w-6xl mx-auto px-4 py-10 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-6 text-muted-foreground text-sm">
                    <div className="text-center sm:text-left">
                        <p>© {new Date().getFullYear()} ZingMeal. All rights reserved.</p>
                    </div>
                    <div className="flex gap-6">
                        <Link href="/about" className="hover:text-primary transition-colors">
                            About
                        </Link>
                        {/* <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a> */}
                        <a
                            href="mailto:officialdhiraj00@gmail.com"
                            className="hover:text-primary transition-colors"
                        >
                            Contact
                        </a>

                    </div>
                </div>
            </footer>

        </main>
    );
}

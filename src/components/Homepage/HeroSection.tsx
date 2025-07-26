'use client';

import React from "react";
import { ChefHat } from 'lucide-react';
import { useRouter } from "next/navigation";

const HeroSection = () => {

    const router = useRouter();

    return (
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
                <a href="#popular-meals-section"
                    className="block w-full text-center text-sm text-white/80 hover:text-white transition"
                >↓ See Popular Meals</a>
            </div>
        </div>
    )
}

export default HeroSection
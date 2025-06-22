import { ChefHat, UtensilsCrossed, BookCopy, Download } from "lucide-react";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us - ZingMeal",
    description: "Learn more about ZingMeal and our mission to make meal planning simple and delightful.",
};

export default function AboutPage() {
    return (
        <main className="min-h-screen py-20 px-4 sm:px-8 bg-background text-foreground">
            <div className="max-w-5xl mx-auto text-center mb-12">
                <h1 className="text-4xl font-bold text-primary mb-4">About ZingMeal</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    At ZingMeal, we believe food should be exciting, simple to plan, and fit your lifestyle.
                    We're here to help you discover, organize, and enjoy your meals like never before.
                </p>
            </div>

            <section className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto mb-20">
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-primary">Our Mission</h2>
                    <p className="text-muted-foreground">
                        ZingMeal is built for food lovers, busy professionals, and anyone looking to eat better
                        without the headache of planning. Whether you're exploring new recipes or managing a
                        specific diet, we give you the tools to customize and save meals that work for you.
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3">
                            <UtensilsCrossed className="text-primary w-5 h-5" />
                            Discover personalized meal recommendations.
                        </li>
                        <li className="flex items-center gap-3">
                            <BookCopy className="text-primary w-5 h-5" />
                            Copy full ingredients easily for shopping.
                        </li>
                        <li className="flex items-center gap-3">
                            <Download className="text-primary w-5 h-5" />
                            Download meal plans as PDFs.
                        </li>
                    </ul>
                </div>

                <div className="relative h-72 sm:h-96 w-full rounded-lg overflow-hidden shadow-lg">
                    <Image
                        src="/images/hero-meal.jpg" // Replace with an actual image
                        alt="Meal Planning"
                        fill
                        className="object-cover"
                    />
                </div>
            </section>

            <section className="max-w-4xl mx-auto text-center">
                <h2 className="text-2xl font-semibold text-primary mb-4">Built With Care</h2>
                <p className="text-muted-foreground">
                    We’re constantly improving and listening to your feedback. ZingMeal is built with the
                    latest tech to provide a smooth, secure, and enjoyable experience across devices.
                </p>
            </section>
        </main>
    );
}

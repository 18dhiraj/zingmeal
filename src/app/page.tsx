import Image from "next/image";
import { PopularMeals } from '../components/Homepage/PopularMeals';
import Link from "next/link";
import HomeHeader from "@/components/Homepage/HomeHeader";
import HeroSection from "@/components/Homepage/HeroSection";
import { Button } from "@/components/ui/button";

export default function HomePage() {

    return (
        <main className="flex flex-col min-h-screen">
            <HomeHeader />
            <section className="relative h-screen w-full -mt-[60px]">
                <Image
                    src="/images/hero-meal1.jpg"
                    alt="Delicious meals"
                    fill
                    priority
                    className="object-cover z-0"
                />
                <div className="absolute inset-0 bg-black/20 z-10" />
                <div className="absolute inset-0 flex items-center justify-end z-20 px-6 sm:px-48">
                    <HeroSection />
                </div>
            </section>

            <section id="popular-meals-section" className="bg-background py-16 px-4 sm:px-8">
                <div className="max-w-6xl mx-auto text-center mb-10">
                    <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Popular Meals</h2>
                    <p className="text-muted-foreground">Loved by users and highly rated</p>
                </div>
                <PopularMeals />
                <div className="max-w-6xl mx-auto text-center mt-8">
                    <Link href="/explore">
                        <Button className="bg-primary text-white hover:bg-primary/90 px-8 py-2 rounded-lg text-lg font-semibold transition-all">
                            Explore More
                        </Button>
                    </Link>
                </div>
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
                                <span className="bg-primary text-white rounded-full w-6 h-6 min-w-6 min-h-6 flex items-center justify-center text-sm font-bold">✓</span>
                                <span><strong>Copy Ingredients:</strong> Copy full ingredient lists in one click.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="bg-primary text-white rounded-full w-6 h-6 min-w-6 min-h-6 flex items-center justify-center text-sm font-bold">✓</span>
                                <span><strong>Download PDF:</strong> Export your meal plan or recipe as a printable PDF.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="bg-primary text-white rounded-full w-6 h-6 min-w-6 min-h-6 flex items-center justify-center text-sm font-bold">✓</span>
                                <span><strong>Multi-Currency Support:</strong> View prices in INR, USD, or EUR with real-time conversion.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="bg-primary text-white rounded-full w-6 h-6 min-w-6 min-h-6 flex items-center justify-center text-sm font-bold">✓</span>
                                <span><strong>Save Meals & Plans:</strong> Keep your favorites synced across devices.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden shadow-lg">
                        <Image
                            src="/images/hero-meal.jpg"
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
            <footer className="bg-card border-t">
                <div className="max-w-6xl mx-auto px-4 py-10 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-6 text-muted-foreground text-sm">
                    <div className="text-center sm:text-left">
                        <p>© {new Date().getFullYear()} ZingMeal. All rights reserved.</p>
                    </div>
                    <div className="flex gap-6">
                        <Link href="/about" className="hover:text-primary transition-colors">
                            About
                        </Link>
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

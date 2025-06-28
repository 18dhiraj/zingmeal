import Image from "next/image";
import MealFinderWrapper from "@/components/MealFinderWrapper";
import type { Metadata } from "next";
import bgImage from "@/assets/images/bg.jpg";

export const metadata: Metadata = {
  title: 'ZingMeal | Discover Your Perfect Meal Plan',
  description: 'Explore and generate customized meal plans based on your preferences, budget, and dietary needs. Powered by ZingMeal.',
  openGraph: {
    title: 'ZingMeal | Discover Your Perfect Meal Plan',
    description: 'Find and personalize meals that match your diet, price range, and lifestyle with ZingMeal.',
    url: 'https://yourdomain.com/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZingMeal - Smart Meal Planning',
    description: 'Get tailored meal suggestions instantly. Affordable, delicious, and healthy.',
  },
};

export default function HomePage() {
  return (
    <>
      <div className="fixed inset-0 -z-10">
        <Image
          src={bgImage}
          alt="Delicious food background"
          layout="fill"
          objectFit="cover"
          className="filter blur-sm brightness-50"
          priority
        />
      </div>

      <main className="flex-grow container mx-auto px-2 py-2 flex flex-col items-center justify-center gap-4 min-h-[70vh] relative z-0">
        <section className="w-full max-w-2xl bg-background/90 p-4 sm:p-6 rounded-xl shadow-2xl backdrop-blur-sm">
          <MealFinderWrapper />
        </section>
      </main>
    </>
  );
}

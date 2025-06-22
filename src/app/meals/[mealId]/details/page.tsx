"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Meal } from '@/types';
import { fetchMealById } from '@/lib/mealService';
import { saveIndividualMeal, removeIndividualMeal, isIndividualMealSaved } from '@/lib/favoritesService';
import { AlertTriangle, ChefHat, Loader2, ArrowLeft, Tag, Clock, Flame, IndianRupee, ListChecks, Info, Leaf, Vegan, WheatOff, MilkOff, Ban, ListOrdered, Utensils, Heart, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import LoginInfoTip from '@/components/LoginInfo';

const dietaryIconsMap: { [key: string]: React.ElementType } = {
  vegetarian: Leaf,
  vegan: Vegan,
  'gluten-free': WheatOff,
  'dairy-free': MilkOff,
  'nut-free': Ban,
};

function MealDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const mealId = params.mealId as string;

  const [meal, setMeal] = useState<Meal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!mealId) {
      setError('Meal ID is missing.');
      setIsLoading(false);
      return;
    }

    const loadMeal = async () => {
      try {
        setIsLoading(true);
        const data = await fetchMealById(mealId);
        if (data) {
          setMeal(data);
          const saved = await isIndividualMealSaved(mealId);
          setIsSaved(saved);
        } else {
          setError(`Meal with ID ${mealId} not found.`);
          toast({ title: "Error", description: "Meal not found.", variant: "destructive" });
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch meal details.');
        toast({ title: "Error", description: "Failed to load meal details.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    loadMeal();
  }, [mealId, toast]);

  const handleToggleSaveMeal = async () => {
    if (!meal) return;
    if (isSaved) {
      await removeIndividualMeal(meal.id);
      setIsSaved(false);
      toast({ title: "Meal Unsaved", description: `${meal.name} removed from your favorites.` });
    } else {
      await saveIndividualMeal(meal.id);
      setIsSaved(true);
      toast({ title: "Meal Saved!", description: `${meal.name} added to your favorites.` });
    }
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: meal?.name || "ZingMeal",
      text: meal?.description || "Check out this meal on ZingMeal!",
      url: shareUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch { }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link Copied!", description: "Meal link copied to clipboard." });
      } catch {
        toast({ title: "Error", description: "Could not copy link.", variant: "destructive" });
      }
    }
  };

  const handleCopyIngredients = async () => {
    if (!meal?.ingredients) return;
    const text = meal.ingredients.map(ing => `- ${ing}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "Ingredients copied to clipboard." });
    } catch {
      toast({ title: "Error", description: "Could not copy ingredients.", variant: "destructive" });
    }
  };

  const handleDownloadPDF = () => {
    if (!meal) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(meal.name, 10, 15);
    doc.setFontSize(14);
    doc.text("Ingredients:", 10, 30);
    doc.setFontSize(12);
    meal.ingredients?.forEach((ing, idx) => {
      doc.text(`- ${ing}`, 12, 40 + idx * 8);
    });
    let y = 40 + (meal.ingredients?.length || 0) * 8 + 10;
    doc.setFontSize(14);
    doc.text("Steps:", 10, y);
    doc.setFontSize(12);
    meal.steps?.forEach((step, idx) => {
      doc.text(`${idx + 1}. ${step}`, 12, y + 10 + idx * 8);
    });
    doc.save(`${meal.name}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-4xl">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="text-xl text-muted-foreground">Fetching yummy details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-6 bg-destructive/10 rounded-lg shadow-md max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <p className="text-xl font-semibold mb-2">Error Loading Meal</p>
        <p className="text-sm mb-4">{error}</p>
        <Button onClick={() => router.back()} variant="outline">Go Back</Button>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="text-center text-muted-foreground p-6 bg-card rounded-lg shadow-md max-w-md mx-auto">
        <ChefHat className="w-16 h-16 mx-auto mb-4 text-primary" />
        <p className="text-xl font-semibold mb-2">Meal Not Found</p>
        <p className="text-sm">We couldn't find the details for this meal.</p>
        <Button onClick={() => router.back()} variant="outline" className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl shadow-lg animate-meal-swap-in bg-card">
      <CardHeader className="relative">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="absolute top-4 left-4 text-muted-foreground hover:text-primary z-10">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <Button variant={isSaved ? "default" : "outline"} size="icon" onClick={handleToggleSaveMeal} className="absolute top-4 right-4 z-10">
          <Heart className={`h-5 w-5 ${isSaved ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
        </Button>
        <Button variant="outline" size="icon" onClick={handleShare} className="absolute top-4 right-16 z-10">
          <Share2 className="h-5 w-5" />
        </Button>
        <div className="pt-8 text-center">
          <CardTitle className="text-4xl font-headline text-primary">{meal.name}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="relative w-full h-80 md:h-96 rounded-lg overflow-hidden shadow-md">
          <Image src={meal.imageUrl} alt={meal.name} layout="fill" objectFit="cover" priority />
        </div>

        <CardDescription className="text-lg text-foreground text-center leading-relaxed p-4 bg-muted/20 rounded-md border">
          {meal.description}
        </CardDescription>

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm border">
            <IndianRupee className="w-7 h-7 text-accent mb-1.5" />
            <span className="text-2xl font-semibold text-foreground">₹{meal.price.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Price</span>
          </div>
          {meal.calories && (
            <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm border">
              <Flame className="w-7 h-7 text-accent mb-1.5" />
              <span className="text-2xl font-semibold text-foreground">{meal.calories} kcal</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Calories</span>
            </div>
          )}
          {meal.prepTime && (
            <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm border">
              <Clock className="w-7 h-7 text-accent mb-1.5" />
              <span className="text-2xl font-semibold text-foreground">{meal.prepTime}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Prep Time</span>
            </div>
          )}
        </div>

        {meal.dietaryTags?.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
                <ListChecks className="w-6 h-6" /> Dietary Information
              </h3>
              <div className="flex flex-wrap gap-3">
                {meal.dietaryTags.map((tag) => {
                  const IconComponent = dietaryIconsMap[tag] || Tag;
                  return (
                    <Badge key={tag} variant="secondary" className="text-base py-2 px-4 shadow-sm flex items-center gap-2 border border-border">
                      <IconComponent className="w-5 h-5" />
                      <span className="capitalize">{tag.replace('-', ' ')}</span>
                    </Badge>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <Separator />
        <div>
          <div className='flex justify-between items-center'>
            <h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
              <Utensils className="w-6 h-6" /> Ingredients
            </h3>
            <div className="flex gap-2 mb-2">
              <Button variant="outline" size="sm" onClick={handleCopyIngredients}>
                Copy Ingredients
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                Download PDF
              </Button>
            </div>
          </div>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
            {meal.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>

        <Separator />
        <div>
          <h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
            <ListOrdered className="w-6 h-6" /> Preparation Steps
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground pl-2">
            {meal.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        {meal.html && (
          <>
            <Separator />
            <div>
              <h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
                <Info className="w-6 h-6" /> Extra Details
              </h3>
              <div
                className="prose prose-sm max-w-none text-muted-foreground rounded-md border p-4 bg-muted/20"
                dangerouslySetInnerHTML={{ __html: meal.html }}
              />
            </div>
          </>
        )}

        <Separator />
        <div>
          <h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
            <Info className="w-6 h-6" /> Additional Notes
          </h3>
          <p className="text-muted-foreground">
            This meal is prepared with the freshest ingredients. For specific allergen information not covered by the tags, please contact us.
            Enjoy your delicious {meal.name}!
          </p>
        </div>

        <Link href="/" passHref className="block w-full">
          <Button variant="outline" className="w-full mt-6 text-lg py-6">
            <ChefHat className="mr-2 h-5 w-5" /> Find Another Meal Plan
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function MealDetailsPageContainer() {
  return (
    <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center gap-8 min-h-screen">
      <LoginInfoTip />
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-4xl">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
          <p className="text-xl text-muted-foreground">Fetching yummy details...</p>
        </div>
      }>
        <MealDetailsContent />
      </Suspense>
    </main>
  );
}

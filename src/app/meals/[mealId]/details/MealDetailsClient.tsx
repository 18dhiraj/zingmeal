'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle, ChefHat, Loader2, ArrowLeft, Tag, Clock, Flame, IndianRupee, ListChecks, Info, Leaf, Vegan, WheatOff, MilkOff, Ban, ListOrdered, Utensils, Heart, Share2, Copy, FileDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { saveIndividualMeal, removeIndividualMeal, isIndividualMealSaved } from '@/lib/favoritesService';
import { fetchMealById } from '@/lib/mealService';
import type { Meal } from '@/types';
import jsPDF from 'jspdf';
import LoginInfoTip from '@/components/LoginInfo';

const dietaryIconsMap = {
  vegetarian: Leaf,
  vegan: Vegan,
  'gluten-free': WheatOff,
  'dairy-free': MilkOff,
  'nut-free': Ban,
} as const;

function MealDetailsContent() {
  const { mealId } = useParams<{ mealId: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!mealId) {
      setError('Meal ID missing.');
      setLoad(false);
      return;
    }

    (async () => {
      try {
        setLoad(true);
        const m = await fetchMealById(mealId);
        if (!m) {
          setError(`Meal with ID ${mealId} not found.`);
          return;
        }
        setMeal(m);
        setSaved(await isIndividualMealSaved(mealId));
      } catch {
        setError('Failed to load meal.');
      } finally {
        setLoad(false);
      }
    })();
  }, [mealId]);

  const toggleSave = async () => {
    if (!meal) return;
    if (saved) {
      await removeIndividualMeal(meal.id);
      setSaved(false);
      toast({ title: 'Meal Unsaved', description: `${meal.name} removed.` });
    } else {
      await saveIndividualMeal(meal.id);
      setSaved(true);
      toast({ title: 'Meal Saved!', description: `${meal.name} added.` });
    }
  };

  const share = async () => {
    const url = location.href;
    if (navigator.share) {
      try { await navigator.share({ title: meal?.name, url }); } catch { }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: 'Link Copied!' });
      } catch {
        toast({ title: 'Error', description: 'Could not copy link.', variant: 'destructive' });
      }
    }
  };

  const copyIngredients = async () => {
    if (!meal?.ingredients) return;
    try {
      await navigator.clipboard.writeText(meal.ingredients.map(i => `- ${i}`).join('\n'));
      toast({ title: 'Copied!', description: 'Ingredients copied.' });
    } catch {
      toast({ title: 'Error', description: 'Could not copy.', variant: 'destructive' });
    }
  };

  const downloadPDF = () => {
    if (!meal) return;
    const doc = new jsPDF();
    doc.setFontSize(18).text(meal.name, 10, 15);
    doc.setFontSize(14).text('Ingredients:', 10, 30);
    doc.setFontSize(12);
    meal.ingredients?.forEach((ing, i) => doc.text(`- ${ing}`, 12, 40 + i * 8));
    let y = 40 + (meal.ingredients?.length ?? 0) * 8 + 10;
    doc.setFontSize(14).text('Steps:', 10, y);
    doc.setFontSize(12);
    meal.steps?.forEach((s, i) => doc.text(`${i + 1}. ${s}`, 12, y + 10 + i * 8));
    doc.save(`${meal.name}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center min-h-[300px]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="text-muted-foreground">Fetching yummy details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-destructive/10 rounded-lg">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <p className="mb-2 font-semibold">{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (!meal) return null;

  return (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardHeader className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="absolute left-4 top-4"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        <div className="absolute right-4 top-4 flex gap-2">
          <Button variant="outline" size="icon" onClick={share}>
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant={saved ? 'default' : 'outline'} size="icon" onClick={toggleSave}>
            <Heart className={`h-5 w-5 ${saved ? 'fill-destructive text-destructive' : ''}`} />
          </Button>
        </div>

        <CardTitle className="text-4xl text-center mt-6">{meal.name}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="relative w-full h-80 md:h-96 rounded-lg overflow-hidden">
          <Image src={meal.imageUrl} alt={meal.name} fill style={{ objectFit: 'cover' }}
          />
        </div>

        <CardDescription className="text-lg text-center p-4 bg-muted/20 rounded-md">
          {meal.description}
        </CardDescription>

        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <Stat icon={IndianRupee} value={`₹${meal.price.toFixed(2)}`} label="Price" />
          {meal.calories && <Stat icon={Flame} value={`${meal.calories} kcal`} label="Calories" />}
          {meal.prepTime && <Stat icon={Clock} value={meal.prepTime} label="Prep Time" />}
        </div>

        {meal.dietaryTags?.length ? (
          <>
            <Separator />
            <SectionTitle icon={ListChecks} title="Dietary Information" />
            <div className="flex flex-wrap gap-3">
              {meal.dietaryTags.map((t) => {
                const Icon = dietaryIconsMap[t as keyof typeof dietaryIconsMap] ?? Tag;
                return (
                  <Badge key={t} variant="secondary" className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {t.replace('-', ' ')}
                  </Badge>
                );
              })}
            </div>
          </>
        ) : null}

        <Separator />
        <SectionTitle icon={Utensils} title="Ingredients">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyIngredients}>
              <Copy className="h-4 w-4" /> Copy
            </Button>
            <Button variant="outline" size="sm" onClick={downloadPDF}>
              <FileDown className="h-4 w-4" /> PDF
            </Button>
          </div>
        </SectionTitle>
        <ul className="list-disc ml-4 space-y-1 text-muted-foreground">
          {meal.ingredients.map((i) => <li key={i}>{i}</li>)}
        </ul>

        <Separator />
        <SectionTitle icon={ListOrdered} title="Preparation Steps" />
        <ol className="list-decimal ml-4 space-y-2 text-muted-foreground">
          {meal.steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>

        {meal.html && (
          <>
            <Separator />
            <SectionTitle icon={Info} title="Extra Details" />
            <div
              className="prose prose-sm max-w-none bg-muted/20 p-4 rounded-md"
              dangerouslySetInnerHTML={{ __html: typeof meal.html === 'string' ? meal.html : String(meal.html) }}
            />
          </>
        )}

        <Separator />
        <SectionTitle icon={Info} title="Additional Notes" />
        <p className="text-muted-foreground">
          This meal is prepared with the freshest ingredients. For allergen info not
          covered by the tags, please contact us. Enjoy your {meal.name}!
        </p>

        <Link href="/" passHref className="block w-full">
          <Button variant="outline" className="w-full mt-6">
            <ChefHat className="mr-2 h-5 w-5" /> Find Another Meal Plan
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

const Stat = ({ icon: Icon, value, label }: { icon: any; value: string; label: string }) => (
  <div className="flex flex-col items-center p-4 border rounded-lg">
    <Icon className="w-7 h-7 text-accent mb-1" />
    <span className="text-2xl font-semibold">{value}</span>
    <span className="text-xs uppercase text-muted-foreground">{label}</span>
  </div>
);

const SectionTitle = ({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between mb-3 flex-wrap gap-y-2">
    <h3 className="text-xl font-semibold flex items-center gap-2">
      <Icon className="w-6 h-6" /> {title}
    </h3>
    {children}
  </div>
);

export default function MealDetailsClient() {
  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center">
      <LoginInfoTip />
      <Suspense
        fallback={
          <div className="flex flex-col items-center min-h-[300px]">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
            <p className="text-muted-foreground">Fetching yummy details…</p>
          </div>
        }
      >
        <MealDetailsContent />
      </Suspense>
    </main>
  );
}

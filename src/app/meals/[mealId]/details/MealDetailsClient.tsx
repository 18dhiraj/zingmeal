'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle, ChefHat, Loader2, ArrowLeft, Tag, Clock, Flame, IndianRupee, DollarSign, Euro, ListChecks, Info, Leaf, Vegan, WheatOff, MilkOff, Ban, ListOrdered, Utensils, Heart, Share2, Copy, FileDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { saveIndividualMeal, removeIndividualMeal, isIndividualMealSaved } from '@/lib/favoritesService';
import { fetchMealById, fetchMealByslug } from '@/lib/mealService';
import { getMealPrice } from '@/utils/priceUtils';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { Meal } from '@/types';
import jsPDF from 'jspdf';
import LoginInfoTip from '@/components/LoginInfo';
import { trackMealView, trackMealFavorite, trackMealShare, trackMealIngredientsCopy, trackMealPDFDownload } from '@/lib/analytics';
import { popularityService } from '@/lib/popularityService';

const dietaryIconsMap = {
  'vegetarian': Leaf,
  'vegan': Vegan,
  'gluten-free': WheatOff,
  'dairy-free': MilkOff,
  'nut-free': Ban,
} as const;

function MealDetailsContent() {
  const { mealId } = useParams<{ mealId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { selectedCurrency, getCurrencyInfo, formatPrice, convertPrice } = useCurrency();
  const currencyInfo = getCurrencyInfo(selectedCurrency);

  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Get appropriate currency icon based on selected currency
  const getCurrencyIcon = () => {
    switch (selectedCurrency) {
      case 'USD':
        return DollarSign;
      case 'EUR':
        return Euro;
      case 'INR':
      default:
        return IndianRupee;
    }
  };

  // Get meal price in selected currency
  const getMealPriceInCurrency = (meal: Meal) => {
    return getMealPrice(meal, selectedCurrency, convertPrice);
  };

  useEffect(() => {
    if (!mealId) {
      setError('Meal ID missing.');
      setLoad(false);
      return;
    }

    (async () => {
      try {
        setLoad(true);
        const m = await fetchMealByslug(mealId);
        if (!m) {
          setError(`Meal with ID ${mealId} not found.`);
          return;
        }
        setMeal(m);
        setSaved(await isIndividualMealSaved(mealId));
        // Track meal view for analytics
        trackMealView(mealId, m.name);
        // Start popularity tracking
        popularityService.startMealVisit(mealId, m.name);
      } catch {
        setError('Failed to load meal.');
      } finally {
        setLoad(false);
      }
    })();
  }, [mealId]);

  // Cleanup popularity tracking on unmount or mealId change
  useEffect(() => {
    return () => {
      if (mealId) {
        popularityService.stopMealVisit(mealId);
      }
    };
  }, [mealId]);

  const toggleSave = async () => {
    if (!meal) return;
    if (saved) {
      await removeIndividualMeal(meal.id);
      setSaved(false);
      toast({ title: 'Meal Unsaved', description: `${meal.name} removed.` });
      // Track favorite removal
      trackMealFavorite(meal.id, meal.name, 'remove');
    } else {
      await saveIndividualMeal(meal.id);
      setSaved(true);
      toast({ title: 'Meal Saved!', description: `${meal.name} added.` });
      // Track favorite addition
      trackMealFavorite(meal.id, meal.name, 'add');
    }
  };

  const share = async () => {
    if (!meal) return;
    const url = location.href;
    // Track share event
    trackMealShare(meal.id, meal.name);

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
      // Track ingredients copy
      trackMealIngredientsCopy(meal.id, meal.name);
    } catch {
      toast({ title: 'Error', description: 'Could not copy.', variant: 'destructive' });
    }
  };

  const downloadPDF = () => {
    if (!meal) return;

    trackMealPDFDownload(meal.id, meal.name);

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // === TITLE ("ZINGMEAL") at the top, large and bold ===
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.setTextColor(40, 40, 40); // strong dark gray/black
    let title = 'ZINGMEAL';
    let titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 40);

    // === Subheader ("zingmeal.com") directly below, smaller, lighter ===
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(120, 120, 120); // lighter gray
    let subheader = 'zingmeal.com';
    let subheaderWidth = doc.getTextWidth(subheader);
    doc.text(subheader, (pageWidth - subheaderWidth) / 2, 60);

    // === Draw repeating "ZingMeal" watermark all over the page ===
    const watermarkText = 'ZingMeal';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(230, 230, 230); // very light gray for watermark
    const angle = 45;
    const stepX = 150; // horizontal spacing between watermarks
    const stepY = 140; // vertical spacing between watermarks
    for (let x = -pageHeight; x < pageWidth + pageHeight; x += stepX) {
      for (let y = 0; y < pageHeight + pageWidth; y += stepY) {
        doc.text(watermarkText, x, y, { angle });
      }
    }

    // === Reset text settings for actual content; start layout slightly lower after headings ===
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(meal.name, 40, 95); // Adjusted down so it doesn't overlap headers

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Ingredients:', 40, 120);

    let y = 140;
    const lineHeight = 18;
    meal.ingredients?.forEach((ing) => {
      if (y > pageHeight - 80) {
        doc.addPage();
        // Add title/subheader on each new page for branding/consistency
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(32);
        doc.setTextColor(40, 40, 40);
        doc.text(title, (pageWidth - titleWidth) / 2, 40);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
        doc.setTextColor(120, 120, 120);
        doc.text(subheader, (pageWidth - subheaderWidth) / 2, 60);

        // Watermark all over new page as before
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(230, 230, 230);
        for (let x = -pageHeight; x < pageWidth + pageHeight; x += stepX) {
          for (let yw = 0; yw < pageHeight + pageWidth; yw += stepY) {
            doc.text(watermarkText, x, yw, { angle });
          }
        }
        y = 90;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
      }
      doc.text(`- ${ing}`, 50, y);
      y += lineHeight;
    });

    if (y > pageHeight - 80) {
      doc.addPage();
      // Add headers and watermark on new page
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(32);
      doc.setTextColor(40, 40, 40);
      doc.text(title, (pageWidth - titleWidth) / 2, 40);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(16);
      doc.setTextColor(120, 120, 120);
      doc.text(subheader, (pageWidth - subheaderWidth) / 2, 60);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(230, 230, 230);
      for (let x = -pageHeight; x < pageWidth + pageHeight; x += stepX) {
        for (let yw = 0; yw < pageHeight + pageWidth; yw += stepY) {
          doc.text(watermarkText, x, yw, { angle });
        }
      }
      y = 90;
    }
    y += 10;
    doc.setFontSize(14);
    doc.text('Steps:', 40, y);
    y += lineHeight;

    meal.steps?.forEach((step, i) => {
      if (y > pageHeight - 80) {
        doc.addPage();
        // Title/subheader/watermark for new page
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(32);
        doc.setTextColor(40, 40, 40);
        doc.text(title, (pageWidth - titleWidth) / 2, 40);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
        doc.setTextColor(120, 120, 120);
        doc.text(subheader, (pageWidth - subheaderWidth) / 2, 60);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(230, 230, 230);
        for (let x = -pageHeight; x < pageWidth + pageHeight; x += stepX) {
          for (let yw = 0; yw < pageHeight + pageWidth; yw += stepY) {
            doc.text(watermarkText, x, yw, { angle });
          }
        }

        y = 90;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
      }
      doc.setFontSize(12);
      doc.text(`${i + 1}. ${step}`, 50, y);
      y += lineHeight;
    });

    // Save PDF
    doc.save(`${meal.name.replace(/\s+/g, '_')}_ZingMeal.pdf`);
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
      <CardHeader className="space-y-4">
        {/* Header with navigation and actions */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>

          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="icon" onClick={share}>
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant={saved ? 'default' : 'outline'} size="icon" onClick={toggleSave}>
              <Heart className={`h-5 w-5 ${saved ? 'fill-destructive text-destructive' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Meal title with proper spacing */}
        <CardTitle className="text-2xl sm:text-3xl md:text-4xl text-center px-4 break-words">{meal.name}</CardTitle>
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
          <Stat
            icon={getCurrencyIcon()}
            value={formatPrice(getMealPriceInCurrency(meal), selectedCurrency)}
            label="Price"
          />
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

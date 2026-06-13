'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Download, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  saveWeeklyPlan,
  getWeeklyPlan,
} from '@/lib/mealService';
import { Meal } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getMealPrice } from '@/utils/priceUtils';
import { SearchableCombobox } from '@/components/ui/searchable-combobox';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealsPerDay = ['Breakfast', 'Lunch', 'Dinner'];

const makeEmptyPlan = () =>
  Object.fromEntries(
    daysOfWeek.map(day => [
      day,
      Object.fromEntries(mealsPerDay.map(m => [m, '']))
    ])
  );

const dietaryTagsEnv = process.env.NEXT_PUBLIC_DIETARY_TAGS || '';
const AVAILABLE_TAGS = dietaryTagsEnv.split(',').map(t => t.trim()).filter(Boolean);

type Props = { allMeals: Meal[] };

export default function WeeklyPlanClient({ allMeals }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const { selectedCurrency, getCurrencyInfo, convertPrice } = useCurrency();
  const currencyInfo = getCurrencyInfo(selectedCurrency);

  const [mealPlan, setMealPlan] = useState(makeEmptyPlan);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minCalories, setMinCalories] = useState('');
  const [maxCalories, setMaxCalories] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const mealsMap = allMeals.reduce<Record<string, Meal>>(
    (acc, m) => ((acc[m.id] = m), acc), {}
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) {
        router.push('/login');
        return;
      }
      try {
        const plan = await getWeeklyPlan();
        if (plan) setMealPlan(plan);
      } catch (err) {
        console.error(err);
      }
    });
    return unsub;
  }, [router]);

  const filterMealList = useCallback(
    (currentId: string) => {
      const toNum = (v: string) => {
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : undefined;
      };
      const minP = toNum(minPrice);
      const maxP = toNum(maxPrice);
      const minC = toNum(minCalories);
      const maxC = toNum(maxCalories);

      const filtered = allMeals.filter(meal => {
        const mealPriceInCurrency = getMealPrice(meal, selectedCurrency, convertPrice);
        if (minP !== undefined && mealPriceInCurrency < minP) return false;
        if (maxP !== undefined && mealPriceInCurrency > maxP) return false;
        if (minC !== undefined && meal.calories < minC) return false;
        if (maxC !== undefined && meal.calories > maxC) return false;
        if (selectedTags.length &&
          !selectedTags.every(t => meal.dietaryTags?.includes(t)))
          return false;
        return true;
      });

      if (currentId && !filtered.some(m => m.id === currentId)) {
        const chosen = allMeals.find(m => m.id === currentId);
        if (chosen) return [chosen, ...filtered];
      }
      return filtered;
    },
    [allMeals, minPrice, maxPrice, minCalories, maxCalories, selectedTags, selectedCurrency, convertPrice]
  );

  const exportMealPlanToPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // --- Add Title ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.setTextColor(40, 40, 40); // Dark gray
    const title = 'ZINGMEAL';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 40);

    // --- Add Subheader ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(120, 120, 120); // Light gray
    const subheader = window.location.hostname;
    const subheaderWidth = doc.getTextWidth(subheader);
    doc.text(subheader, (pageWidth - subheaderWidth) / 2, 60);

    // --- Draw repeating watermark "ZingMeal" in background ---
    const watermarkText = 'ZingMeal';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(230, 230, 230); // very light gray
    const angle = 45;
    const stepX = 150; // horizontal spacing between watermarks
    const stepY = 140; // vertical spacing between watermarks

    // Place watermark all over the page
    for (let x = -pageHeight; x < pageWidth + pageHeight; x += stepX) {
      for (let y = 0; y < pageHeight + pageWidth; y += stepY) {
        doc.text(watermarkText, x, y, { angle });
      }
    }

    // --- Prepare your table headers and rows as before ---
    const headers = ['Day', ...mealsPerDay];
    const rows = daysOfWeek.map(day => {
      const row: any[] = [day];
      mealsPerDay.forEach(type => {
        const id = mealPlan[day][type];
        const meal = mealsMap[id];
        row.push(
          meal?.name
            ? { content: meal.name, link: `${window.location.origin}/meals/${meal?.slug || meal.id}/details` }
            : 'Not Assigned'
        );
      });
      return row;
    });

    // --- Draw the table starting lower to avoid overlapping title and watermark top area ---
    autoTable(doc, {
      startY: 80, // shift down to show title and subheader clearly
      head: [headers],
      body: rows,
      didDrawCell: d => {
        const cell: any = d.cell.raw;
        if (typeof cell === 'object' && typeof cell.link === 'string') {
          doc.setTextColor(0, 0, 255);
          doc.textWithLink(
            cell.content,
            d.cell.x + 4.8,
            d.cell.y + d.cell.height / 2 + 2.8,
            { url: cell.link }
          );
          doc.setTextColor(0, 0, 0); // reset text color
        }
      },
    });

    // --- Save the PDF ---
    doc.save('meal-plan.pdf');
  };


  return (
    <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Weekly Meal Plan
        </h1>

        <div className="flex gap-2">
          <Button onClick={exportMealPlanToPDF} size="sm" variant="outline">
            <Download className="w-4 h-4 mr-1" />
            Export PDF
          </Button>

          <Button
            size="sm"
            variant="default"
            onClick={async () => {
              try {
                await saveWeeklyPlan(mealPlan);
                toast({ title: 'Success', description: 'Plan saved!' });
              } catch (_) {
                toast({
                  title: 'Error',
                  description: 'Failed to save plan. Make sure you\'re logged in.',
                  variant: 'destructive',
                });
              }
            }}>
            Save Plan
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setMealPlan(makeEmptyPlan());
              toast({ title: 'Cleared', description: 'Weekly plan has been reset.' });
            }}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      <section className="bg-white dark:bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
        <h2 className="text-base font-medium text-primary">Filter Meals</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <Input type="number" placeholder={`Min ${currencyInfo.symbol}`} value={minPrice} onChange={e => setMinPrice(e.target.value)} />
          <Input type="number" placeholder={`Max ${currencyInfo.symbol}`} value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          <Input type="number" placeholder="Min Cal" value={minCalories} onChange={e => setMinCalories(e.target.value)} />
          <Input type="number" placeholder="Max Cal" value={maxCalories} onChange={e => setMaxCalories(e.target.value)} />
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          {AVAILABLE_TAGS.map(tag => (
            <label key={tag} className="flex items-center gap-2 px-2 py-1 bg-muted rounded-full cursor-pointer">
              <Checkbox
                checked={selectedTags.includes(tag)}
                onCheckedChange={() =>
                  setSelectedTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag])
                } />
              <span className="capitalize">{tag.replace(/-/g, ' ')}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="overflow-x-auto border border-border rounded-md">
        <table className="min-w-full text-sm bg-white dark:bg-background table-fixed">
          <colgroup>
            <col className="w-32" />
            <col className="w-56" />
            <col className="w-56" />
            <col className="w-56" />
          </colgroup>
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-3 text-left font-semibold">Day</th>
              {mealsPerDay.map(m => (
                <th key={m} className="p-3 text-left font-semibold">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {daysOfWeek.map(day => (
              <tr key={day} className="even:bg-muted/30">
                <td className="p-3 font-medium text-primary">{day}</td>
                {mealsPerDay.map(type => (
                  <td key={type} className="p-2">
                    <SearchableCombobox
                      options={filterMealList(mealPlan[day][type]).map(meal => ({ id: meal.id, name: meal.name }))}
                      selected={mealPlan[day][type]}
                      onSelect={id => setMealPlan(p => ({
                        ...p,
                        [day]: { ...p[day], [type]: id },
                      }))}
                      placeholder="Select meal"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

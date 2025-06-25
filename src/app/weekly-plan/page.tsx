"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Download, RotateCcw } from "lucide-react";   // ⬅ added RotateCcw
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { getMeals, saveWeeklyPlan, getWeeklyPlan } from "../../lib/mealService";
import { Meal } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ───────────────────────────────── helpers ──────────────────────────────── */

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const mealsPerDay = ["Breakfast", "Lunch", "Dinner"];

const makeEmptyPlan = () =>
  Object.fromEntries(
    daysOfWeek.map((day) => [
      day,
      Object.fromEntries(mealsPerDay.map((m) => [m, ""])),
    ])
  );

/* If you ever need tag-normalisation again
const normalize = (str: string) => str.trim().toLowerCase().replace(/\s+/g, '-');
*/

const dietaryTagsEnv = process.env.NEXT_PUBLIC_DIETARY_TAGS || "";
const AVAILABLE_TAGS = dietaryTagsEnv.split(",").map((t) => t.trim()).filter(Boolean);

/* ─────────────────────────── component ─────────────────────────────────── */

export default function WeeklyPlanPage() {
  const [mealPlan, setMealPlan] = useState<Record<string, Record<string, string>>>(makeEmptyPlan);

  const { toast } = useToast();
  const router = useRouter();

  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minCalories, setMinCalories] = useState("");
  const [maxCalories, setMaxCalories] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  /* ─────── auth + initial fetch ─────── */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const meals = await getMeals();
        setAllMeals(meals);

        const plan = await getWeeklyPlan(user.uid);
        if (plan) setMealPlan(plan);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    });
    return () => unsubscribe();
  }, []);

  /* ─────── filter logic (per dropdown) ─────── */
  const filterMealList = (mealIdAlreadyChosen: string) => {
    const toNum = (v: string) => {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : undefined;
    };
    const minP = toNum(minPrice);
    const maxP = toNum(maxPrice);
    const minC = toNum(minCalories);
    const maxC = toNum(maxCalories);

    const filtered = allMeals.filter((meal) => {
      if (minP !== undefined && meal.price < minP) return false;
      if (maxP !== undefined && meal.price > maxP) return false;
      if (minC !== undefined && meal.calories < minC) return false;
      if (maxC !== undefined && meal.calories > maxC) return false;
      if (
        selectedTags.length &&
        !selectedTags.every((tag) => meal.dietaryTags?.includes(tag))
      )
        return false;
      return true;
    });

    /* keep the one already selected in THIS cell, even if it fails filters */
    if (
      mealIdAlreadyChosen &&
      !filtered.some((m) => m.id === mealIdAlreadyChosen)
    ) {
      const chosen = allMeals.find((m) => m.id === mealIdAlreadyChosen);
      if (chosen) return [chosen, ...filtered];
    }
    return filtered;
  };

  /* ─────── handlers ─────── */
  const handleTagChange = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const updateMeal = (day: string, type: string, mealId: string) =>
    setMealPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], [type]: mealId },
    }));

  const mealsMap = allMeals.reduce((acc, m) => ((acc[m.id] = m), acc), {} as Record<string, Meal>);

  /* ─────── export helper ─────── */
  const exportMealPlanToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16).text("Weekly Meal Plan", 14, 20);

    const headers = ["Day", "Breakfast", "Lunch", "Dinner"];
    const rows = daysOfWeek.map((day) => {
      const row: any[] = [day];
      mealsPerDay.forEach((type) => {
        const mId = mealPlan[day][type];
        const meal = mealsMap[mId];
        row.push(
          meal?.name
            ? { content: meal.name, link: `https://zingmeal.com/meals/${meal.id}/details` }
            : "Not Assigned"
        );
      });
      return row;
    });

    autoTable(doc, {
      startY: 30,
      head: [headers],
      body: rows,
      didDrawCell: (d) => {
        const cell = d.cell.raw;
        if (typeof cell === "object" && cell.link) {
          doc.setTextColor(0, 0, 255);
          doc.textWithLink(cell.content, d.cell.x + 1.8, d.cell.y + d.cell.height / 2 + 0.9, {
            url: cell.link,
          });
          doc.setTextColor(0, 0, 0);
        }
      },
    });
    doc.save("meal-plan.pdf");
  };

  /* ─────────────────────────── UI ────────────────────────────────── */
  return (
    <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
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
                toast({ title: "Success", description: "Plan saved!" });
              } catch (err) {
                console.error(err);
                toast({
                  title: "Error",
                  description: "Failed to save plan. Make sure you're logged in.",
                  variant: "destructive",
                });
              }
            }}
          >
            Save Plan
          </Button>

          {/* RESET BUTTON */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setMealPlan(makeEmptyPlan());
              toast({ title: "Cleared", description: "Weekly plan has been reset." });
            }}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Filters */}
      <section className="bg-white dark:bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
        <h2 className="text-base font-medium text-primary">Filter Meals</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <Input type="number" placeholder="Min ₹" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          <Input type="number" placeholder="Max ₹" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          <Input type="number" placeholder="Min Cal" value={minCalories} onChange={(e) => setMinCalories(e.target.value)} />
          <Input type="number" placeholder="Max Cal" value={maxCalories} onChange={(e) => setMaxCalories(e.target.value)} />
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          {AVAILABLE_TAGS.map((tag) => (
            <label key={tag} className="flex items-center gap-2 px-2 py-1 bg-muted rounded-full cursor-pointer">
              <Checkbox checked={selectedTags.includes(tag)} onCheckedChange={() => handleTagChange(tag)} />
              <span className="capitalize">{tag.replace(/-/g, " ")}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-md">
        <table className="min-w-full text-sm bg-white dark:bg-background">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-3 text-left font-semibold">Day</th>
              {mealsPerDay.map((m) => (
                <th key={m} className="p-3 text-left font-semibold">{m}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {daysOfWeek.map((day) => (
              <tr key={day} className="even:bg-muted/30">
                <td className="p-3 font-medium text-primary">{day}</td>

                {mealsPerDay.map((mealType) => (
                  <td key={mealType} className="p-2">
                    <select
                      value={mealPlan[day][mealType]}
                      onChange={(e) => updateMeal(day, mealType, e.target.value)}
                      className="w-full px-2 py-1 rounded-md border border-border bg-background text-sm"
                    >
                      <option value="">Select meal</option>
                      {filterMealList(mealPlan[day][mealType]).map((meal) => (
                        <option key={meal.id} value={meal.id}>
                          {meal.name}
                        </option>
                      ))}
                    </select>
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

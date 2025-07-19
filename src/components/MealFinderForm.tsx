"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import type { DietaryPreference, MealFilters } from '@/types';
import { Utensils, IndianRupee, DollarSign, Euro, Beef } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackMealPlanGeneration } from '@/lib/analytics';
import { useCurrency } from '@/contexts/CurrencyContext';

const normalize = (str: string) => str.trim().toLowerCase().replace(/\s+/g, '-');

const dietaryTagsEnv = process.env.NEXT_PUBLIC_DIETARY_TAGS || '';
const dietaryTagsFromEnv = dietaryTagsEnv
  .split(',')
  .map(tag => tag.trim())
  .filter(Boolean);

// Ensure 'normalize(label)' returns a value compatible with 'DietaryPreferenceValue'
const dietaryOptions: DietaryPreference[] = dietaryTagsFromEnv.map(label => ({
  id: normalize(label) as DietaryPreference['id'],
  label,
}));

const mealsPerDayOptions = [
  { value: "1", label: "1 Meal" },
  { value: "2", label: "2 Meals" },
  { value: "3", label: "3 Meals" },
  { value: "4", label: "4 Meals" },
  { value: "5", label: "5 Meals" },
];

// Create dynamic schema based on currency
const createFormSchema = (minValue: number, maxValue: number, currencySymbol: string) => {
  return z.object({
    priceRange: z
      .array(z.number())
      .length(2)
      .default([minValue, maxValue])
      .refine(
        (data) => data[0] >= minValue && data[1] <= maxValue,
        {
          message: `Price must be between ${currencySymbol}${minValue} and ${currencySymbol}${maxValue}.`,
        }
      )
      .refine(
        (data) => data[0] <= data[1],
        {
          message: "Min price cannot be greater than max price.",
          path: ["priceRange"],
        }
      ),
    dietaryPreferences: z.array(z.string()).default([]),
    mealsPerDay: z.coerce.number().min(1).max(5).default(1),
  });
};

// We'll define the type after we create the schema instance

interface MealFinderFormProps {
  onSubmit: (data: MealFilters) => void;
  isSubmitting: boolean;
}

export function MealFinderForm({ onSubmit, isSubmitting }: MealFinderFormProps) {
  const { selectedCurrency, getCurrencyInfo, formatPrice, convertPrice } = useCurrency();
  const currencyInfo = getCurrencyInfo(selectedCurrency);

  // Get appropriate icon based on currency
  const CurrencyIcon = selectedCurrency === 'USD' ? DollarSign :
    selectedCurrency === 'EUR' ? Euro : IndianRupee;

  // Convert INR base values to selected currency
  const getConvertedValue = (inrValue: number) => {
    if (selectedCurrency === 'INR') {
      return Math.round(inrValue);
    }
    return Math.round(convertPrice(inrValue, 'INR', selectedCurrency));
  };

  // Define currency-aware min/max values
  const minValue = getConvertedValue(50);
  const maxValue = getConvertedValue(2000);
  const defaultMaxValue = getConvertedValue(1000);

  // Create the form schema with current currency values
  const formSchema = createFormSchema(minValue, maxValue, currencyInfo.symbol);
  type MealFinderFormValues = z.infer<typeof formSchema>;

  const form = useForm<MealFinderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priceRange: [minValue, defaultMaxValue],
      dietaryPreferences: [],
      mealsPerDay: 1,
    },
  });

  const handleSubmit = (values: MealFinderFormValues) => {
    // Convert prices back to INR for backend processing
    const minPriceInINR = selectedCurrency === 'INR' ? 
      values.priceRange[0] : 
      Math.round(convertPrice(values.priceRange[0], selectedCurrency, 'INR'));
    
    const maxPriceInINR = selectedCurrency === 'INR' ? 
      values.priceRange[1] : 
      Math.round(convertPrice(values.priceRange[1], selectedCurrency, 'INR'));

    const mealFiltersSubmit: MealFilters = {
      minPrice: minPriceInINR,
      maxPrice: maxPriceInINR,
      dietaryPreferences: values.dietaryPreferences as MealFilters['dietaryPreferences'],
      mealsPerDay: values.mealsPerDay,
    };

    // Track meal plan generation
    trackMealPlanGeneration(
      `${values.mealsPerDay} meals - ${formatPrice(values.priceRange[0], selectedCurrency)}-${formatPrice(values.priceRange[1], selectedCurrency)} - ${values.dietaryPreferences.join(', ') || 'No preferences'} - ${selectedCurrency}`
    );

    onSubmit(mealFiltersSubmit);
  };

  return (
    <>
      <h2 className="text-2xl font-headline text-center flex items-center justify-center gap-2 mb-4 text-primary">
        <Utensils className="w-8 h-8" />
        Find Your Perfect Meal Plan
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">

          <FormField
            control={form.control}
            name="priceRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-medium">Price Range</FormLabel>
                <div className="flex items-center space-x-4">
                  <CurrencyIcon className="h-5 w-5 text-muted-foreground" />
                  <FormControl>
                    <Slider
                      min={minValue}
                      max={maxValue}
                      step={1}
                      value={field.value}
                      onValueChange={field.onChange}
                      className="w-full"
                      aria-label="Price range slider"
                    />
                  </FormControl>
                  <span className="text-sm font-semibold text-primary w-52 text-right">
                    {formatPrice(field.value[0], selectedCurrency)} - {formatPrice(field.value[1], selectedCurrency)}
                  </span>
                </div>
                <FormDescription>Set the minimum and maximum price per meal.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel className="text-lg font-medium">Dietary Preferences</FormLabel>
            <FormDescription>Select any dietary needs or preferences.</FormDescription>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {dietaryOptions.map((option) => (
                <FormField
                  key={option.id}
                  control={form.control}
                  name="dietaryPreferences"
                  render={({ field }) => {
                    return (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 bg-muted/30 rounded-md border border-input hover:bg-muted/50 transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option.label)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, option.label])
                                : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== option.label
                                  )
                                );
                            }}
                            aria-label={option.label}
                          />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2 cursor-pointer text-sm">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>

          <FormField
            control={form.control}
            name="mealsPerDay"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-lg font-medium">Meals Per Day</FormLabel>
                <FormDescription>How many meals are you planning for?</FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                    defaultValue={String(field.value)}
                    value={String(field.value)}
                    className="flex flex-wrap gap-3"
                  >
                    {mealsPerDayOptions.map((option) => (
                      <FormItem key={option.value} className="flex items-center space-x-0 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={option.value} id={`mealsPerDay-${option.value}`} className="sr-only peer" />
                        </FormControl>
                        <FormLabel
                          htmlFor={`mealsPerDay-${option.value}`}
                          className={cn(
                            "flex items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground cursor-pointer transition-colors shadow-sm min-w-[80px]",
                            "text-sm font-medium"
                          )}
                        >
                          <Beef className="w-5 h-5" />
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6" disabled={isSubmitting}>
            {isSubmitting ? 'Finding...' : 'Find Meal Plan'}
          </Button>
        </form>
      </Form>
    </>
  );
}
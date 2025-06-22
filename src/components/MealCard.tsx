
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Meal } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Vegan, WheatOff, MilkOff, Ban, Clock, Flame, IndianRupee , Eye, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MealCardProps {
  meal: Meal;
  onSwapMeal?: (mealIdToSwap: string, mealIndexInPlan?: number) => void;
  mealIndexInPlan?: number; 
  isSwapping?: boolean; // General swapping state, e.g., for single meal page
  isSwappingThisCard?: boolean; // Specific to this card in a list
  animationClass?: string;
  showSwapButton?: boolean;
  navigateToMealPageOnSwap?: boolean; // If true, swap action navigates to /meals/[id]
}

const dietaryIconsMap = {
  'vegetarian': Leaf,
  'vegan': Vegan,
  'gluten-free': WheatOff,
  'dairy-free': MilkOff,
  'nut-free': Ban,
};

export function MealCard({ 
  meal, 
  onSwapMeal, 
  mealIndexInPlan,
  isSwapping,
  isSwappingThisCard,
  animationClass, 
  showSwapButton = true,
}: MealCardProps) {
  
  const handleSwapClick = () => {
    if (onSwapMeal) {
      onSwapMeal(meal.id, mealIndexInPlan);
    }
  };

  const currentIsSwapping = isSwappingThisCard || isSwapping;

  return (
    <Card className={cn("w-full shadow-xl overflow-hidden flex flex-col", animationClass)}>
      <CardHeader className="p-0">
        <div className="relative w-full h-64">
          <Image
            src={meal.imageUrl}
            alt={meal.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={`${meal.name.toLowerCase().split(' ').slice(0,2).join(' ')} food`}
          />
           {currentIsSwapping && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4 flex-grow">
        <CardTitle className="text-3xl font-headline text-primary">{meal.name}</CardTitle>
        <CardDescription className="text-base text-muted-foreground line-clamp-3">{meal.description}</CardDescription>
        
        <div className="flex flex-wrap gap-2">
          {meal.dietaryTags.map((tag ) => {
            // const IconComponent : any|  = dietaryIconsMap[tag];
            return (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1.5 py-1 px-2.5">
                {/* {IconComponent && <IconComponent className="w-4 h-4" />} */}
                <span className="capitalize">{tag.replace('-', ' ')}</span>
              </Badge>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-sm">
          <div className="flex items-center gap-2">
            <IndianRupee  className="w-5 h-5 text-accent" />
            <span className="font-medium">₹{meal.price.toFixed(2)}</span>
          </div>
          {meal.calories && (
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-accent" />
              <span className="font-medium">{meal.calories} kcal</span>
            </div>
          )}
          {meal.prepTime && (
             <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              <span className="font-medium">{meal.prepTime}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-0 p-6 mt-auto">
        <Link href={`/meals/${meal.id}/details`} passHref className="w-full">
          <Button variant="outline" className="w-full">
            <Eye className="mr-2 h-4 w-4" />
            See More Details
          </Button>
        </Link>
        {showSwapButton && onSwapMeal && (
          <Button 
            onClick={handleSwapClick} 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3" 
            disabled={currentIsSwapping}
          >
            {currentIsSwapping ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-5 w-5" />
            )}
            {currentIsSwapping ? 'Swapping...' : 'Swap Meal'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

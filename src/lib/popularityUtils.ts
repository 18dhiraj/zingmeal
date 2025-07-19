import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import type { Meal } from '@/types';

/**
 * Get meals sorted by popularity
 * @param limitCount - Number of meals to return
 * @returns Promise<Meal[]> - Array of meals sorted by popularity
 */
export async function getMealsByPopularity(limitCount: number = 10): Promise<Meal[]> {
  try {
    const mealsRef = collection(db, 'meals');
    const q = query(
      mealsRef,
      where('status', '==', 1),
      orderBy('popularity', 'desc'),
      orderBy('totalViews', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const meals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Meal[];

    console.log(`📊 Retrieved ${meals.length} meals sorted by popularity:`);
    meals.forEach((meal, index) => {
      console.log(`${index + 1}. ${meal.name} - Popularity: ${meal.popularity || 0}, Total Views: ${meal.totalViews || 0}`);
    });

    return meals;
  } catch (error) {
    console.error('Error fetching meals by popularity:', error);
    return [];
  }
}

/**
 * Get popularity statistics for all meals
 * @returns Promise<object> - Statistics object
 */
export async function getPopularityStats(): Promise<{
  totalMeals: number;
  mealsWithViews: number;
  totalViews: number;
  averagePopularity: number;
  topMeal?: { name: string; popularity: number; totalViews: number };
}> {
  try {
    const mealsRef = collection(db, 'meals');
    const q = query(
      mealsRef,
      where('status', '==', 1)
    );

    const snapshot = await getDocs(q);
    const meals = snapshot.docs.map(doc => doc.data()) as Meal[];

    const totalMeals = meals.length;
    const mealsWithViews = meals.filter(meal => (meal.popularity || 0) > 0).length;
    const totalViews = meals.reduce((sum, meal) => sum + (meal.totalViews || 0), 0);
    const totalPopularity = meals.reduce((sum, meal) => sum + (meal.popularity || 0), 0);
    const averagePopularity = totalMeals > 0 ? totalPopularity / totalMeals : 0;

    const topMeal = meals.reduce((top, meal) => {
      const mealPopularity = meal.popularity || 0;
      if (!top || mealPopularity > (top.popularity || 0)) {
        return { 
          name: meal.name, 
          popularity: mealPopularity, 
          totalViews: meal.totalViews || 0 
        };
      }
      return top;
    }, null as { name: string; popularity: number; totalViews: number } | null);

    const stats = {
      totalMeals,
      mealsWithViews,
      totalViews,
      averagePopularity: Math.round(averagePopularity * 100) / 100,
      topMeal: topMeal || undefined
    };

    console.log('📈 Popularity Statistics:');
    console.log(`Total Meals: ${stats.totalMeals}`);
    console.log(`Meals with Views: ${stats.mealsWithViews}`);
    console.log(`Total Views: ${stats.totalViews}`);
    console.log(`Average Popularity: ${stats.averagePopularity}`);
    if (stats.topMeal) {
      console.log(`Top Meal: ${stats.topMeal.name} (${stats.topMeal.popularity} popularity, ${stats.topMeal.totalViews} views)`);
    }

    return stats;
  } catch (error) {
    console.error('Error fetching popularity stats:', error);
    return {
      totalMeals: 0,
      mealsWithViews: 0,
      totalViews: 0,
      averagePopularity: 0
    };
  }
}

/**
 * Debug function to check popularity tracking
 * Can be called from browser console for testing
 */
export function debugPopularityTracking() {
  console.log('🔧 Popularity Tracking Debug Info:');
  console.log('To test popularity tracking:');
  console.log('1. Visit a meal details page');
  console.log('2. Stay on the page for at least 3 seconds');
  console.log('3. Check browser console for tracking logs');
  console.log('4. Use getMealsByPopularity() to see updated rankings');
  
  // Make functions available in global scope for testing
  (window as any).getMealsByPopularity = getMealsByPopularity;
  (window as any).getPopularityStats = getPopularityStats;
  
  console.log('📊 Functions available: getMealsByPopularity(), getPopularityStats()');
}

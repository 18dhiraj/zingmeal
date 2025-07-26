'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Meal } from '@/types';
import { getMeals } from '@/lib/mealService';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, X } from 'lucide-react';
import Image from 'next/image';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getMealPrice } from '@/utils/priceUtils';

interface FilterState {
  searchQuery: string;
  priceRange: { min: number; max: number };
  dietaryTags: string[];
  sortBy: 'newest' | 'popularity' | 'price-low' | 'price-high' | 'calories-low' | 'calories-high';
}

const ITEMS_PER_PAGE = 12;

const ExploreClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedCurrency, formatPrice, convertPrice } = useCurrency();
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [displayedMeals, setDisplayedMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    priceRange: { min: 0, max: 1000 }, // Will be updated based on currency
    dietaryTags: [],
    sortBy: 'newest'
  });

  // Update price range when currency changes
  useEffect(() => {
    const convertedMin = Math.round(convertPrice(0, 'INR', selectedCurrency));
    const convertedMax = Math.round(convertPrice(1000, 'INR', selectedCurrency));

    setFilters(prev => ({
      ...prev,
      priceRange: { min: convertedMin, max: convertedMax }
    }));
  }, [selectedCurrency, convertPrice]);

  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Focus input if coming from search icon
  useEffect(() => {
    const shouldFocus = searchParams.get('focus') === 'true';
    if (shouldFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchParams]);

  // Load all meals on mount
  useEffect(() => {
    const loadMeals = async () => {
      try {
        setLoading(true);
        const meals = await getMeals();

        // Remove duplicates based on meal ID
        const uniqueMeals = meals.filter((meal, index, self) =>
          index === self.findIndex(m => m.id === meal.id)
        );

        setAllMeals(uniqueMeals);

        // Extract unique dietary tags
        const tags = new Set<string>();
        uniqueMeals.forEach(meal => {
          meal.dietaryTags.forEach(tag => tags.add(tag));
        });
        setAvailableTags(Array.from(tags));

        // Set initial filtered meals
        setFilteredMeals(uniqueMeals);
        setDisplayedMeals(uniqueMeals.slice(0, ITEMS_PER_PAGE));
        setHasMore(uniqueMeals.length > ITEMS_PER_PAGE);
      } catch (error) {
        console.error('Error loading meals:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMeals();
  }, []);

  // Apply filters whenever filters change
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...allMeals];

      // Search filter
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(meal =>
          meal.name.toLowerCase().includes(query) ||
          meal.description.toLowerCase().includes(query) ||
          meal.ingredients.some(ingredient => ingredient.toLowerCase().includes(query))
        );
      }

      // Price filter (convert to selected currency for filtering)
      filtered = filtered.filter(meal => {
        const priceInCurrency = getMealPrice(meal, selectedCurrency, convertPrice);
        return priceInCurrency >= filters.priceRange.min && priceInCurrency <= filters.priceRange.max;
      });

      // Dietary tags filter
      if (filters.dietaryTags.length > 0) {
        filtered = filtered.filter(meal =>
          filters.dietaryTags.every(tag => meal.dietaryTags.includes(tag))
        );
      }

      // Sort
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'newest':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          case 'popularity':
            const popularityA = a.popularity || 0;
            const popularityB = b.popularity || 0;
            return popularityB - popularityA; // Higher popularity first
          case 'price-low':
            const priceA = getMealPrice(a, selectedCurrency, convertPrice);
            const priceB = getMealPrice(b, selectedCurrency, convertPrice);
            return priceA - priceB;
          case 'price-high':
            const priceAHigh = getMealPrice(a, selectedCurrency, convertPrice);
            const priceBHigh = getMealPrice(b, selectedCurrency, convertPrice);
            return priceBHigh - priceAHigh;
          case 'calories-low':
            return a.calories - b.calories;
          case 'calories-high':
            return b.calories - a.calories;
          default:
            return 0;
        }
      });

      // Remove duplicates based on meal ID
      const uniqueFiltered = filtered.filter((meal, index, self) =>
        index === self.findIndex(m => m.id === meal.id)
      );

      setFilteredMeals(uniqueFiltered);
      setDisplayedMeals(uniqueFiltered.slice(0, ITEMS_PER_PAGE));
      setCurrentPage(1);
      setHasMore(uniqueFiltered.length > ITEMS_PER_PAGE);
    };

    applyFilters();
  }, [filters, allMeals]);

  // Load more meals (infinite scroll)
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const newMeals = filteredMeals.slice(startIndex, endIndex);

    if (newMeals.length > 0) {
      setDisplayedMeals(prev => {
        // Create a Set of existing meal IDs to prevent duplicates
        const existingIds = new Set(prev.map(meal => meal.id));
        const uniqueNewMeals = newMeals.filter(meal => !existingIds.has(meal.id));
        return [...prev, ...uniqueNewMeals];
      });
      setCurrentPage(nextPage);
      setHasMore(endIndex < filteredMeals.length);
    } else {
      setHasMore(false);
    }

    setLoadingMore(false);
  }, [filteredMeals, currentPage, loadingMore, hasMore]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter(t => t !== tag)
        : [...prev.dietaryTags, tag]
    }));
  };

  const clearFilters = () => {
    const convertedMin = Math.round(convertPrice(0, 'INR', selectedCurrency));
    const convertedMax = Math.round(convertPrice(1000, 'INR', selectedCurrency));

    setFilters({
      searchQuery: '',
      priceRange: { min: convertedMin, max: convertedMax },
      dietaryTags: [],
      sortBy: 'newest'
    });
  };

  const handleMealClick = (meal: Meal) => {
    if (meal.slug) {
      router.push(`/meals/${meal.slug}/details`);

    } else {
      router.push(`/meals/${meal.id}/details`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={`skeleton-${i}`} className="animate-pulse">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                ref={searchInputRef}
                placeholder="Search meals, ingredients, or descriptions..."
                value={filters.searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 text-lg"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {(filters.dietaryTags.length > 0 || filters.searchQuery) && (
                  <Badge variant="secondary" className="ml-1">
                    {filters.dietaryTags.length + (filters.searchQuery ? 1 : 0)}
                  </Badge>
                )}
              </Button>

              {(filters.dietaryTags.length > 0 || filters.searchQuery) && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-6 bg-muted rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="popularity">Most Popular</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="calories-low">Calories: Low to High</SelectItem>
                      <SelectItem value="calories-high">Calories: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">Price Range</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange.min}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, min: Number(e.target.value) || 0 }
                      }))}
                      className="w-20"
                    />
                    <span className="self-center">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange.max}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, max: Number(e.target.value) || 1000 }
                      }))}
                      className="w-20"
                    />
                  </div>
                </div>

                {/* Dietary Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">Dietary Preferences</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableTags.map(tag => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={tag}
                          checked={filters.dietaryTags.includes(tag)}
                          onCheckedChange={() => handleTagToggle(tag)}
                        />
                        <label
                          htmlFor={tag}
                          className="text-sm capitalize cursor-pointer"
                        >
                          {tag.replace(/-/g, ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        {/* <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {displayedMeals.length} of {filteredMeals.length} meals
          </p>
        </div> */}

        {/* Meals Grid */}
        {displayedMeals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedMeals.map((meal) => (
              <Card
                key={meal.id}
                className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                onClick={() => handleMealClick(meal)}
              >
                <div className="relative h-48">
                  <Image
                    src={meal.imageUrl}
                    alt={meal.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-sm font-semibold">
                    {formatPrice(getMealPrice(meal, selectedCurrency, convertPrice), selectedCurrency)}
                  </div>
                  {meal.dietaryTags.length > 0 && (
                    <div className="absolute top-2 left-2 bg-white/90 text-xs px-2 py-1 rounded">
                      {meal.dietaryTags[0].replace(/-/g, ' ')}
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{meal.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{meal.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{meal.calories} kcal</span>
                    <span className="text-muted-foreground">{meal.prepTime}</span>
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {meal.dietaryTags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                    {meal.dietaryTags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{meal.dietaryTags.length - 2}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No meals found matching your criteria.</p>
            <Button onClick={clearFilters} className="mt-4">
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Load More Loading */}
        {loadingMore && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={`loading-more-${i}`} className="animate-pulse">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* End of Results */}
        {!hasMore && filteredMeals.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You've reached the end of the results!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreClient;

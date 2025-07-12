'use client'

import React, { Suspense } from 'react';
import ExploreClient from './ExploreClient';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function ExplorePageFallback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={`explore-skeleton-${i}`} className="animate-pulse">
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

const ExplorePage = () => {
  return (
    <Suspense fallback={<ExplorePageFallback />}>
      <ExploreClient />
    </Suspense>
  );
};

export default ExplorePage;

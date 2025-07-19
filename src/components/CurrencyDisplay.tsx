"use client";

import React from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from './ui/button';
import Link from 'next/link';

export const CurrencyDisplay: React.FC = () => {
  const { selectedCurrency, getCurrencyInfo } = useCurrency();
  const currencyInfo = getCurrencyInfo(selectedCurrency);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              {currencyInfo.symbol} {currencyInfo.code}
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Change currency from settings</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
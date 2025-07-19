"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Currency } from '@/types';

const CURRENCIES: Currency[] = ['INR', 'USD', 'EUR'];

export const CurrencySelector: React.FC = () => {
  const { selectedCurrency, setCurrency, getCurrencyInfo } = useCurrency();

  const handleCurrencyChange = (currency: Currency) => {
    setCurrency(currency);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Currency:</span>
      <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((currency) => {
            const info = getCurrencyInfo(currency);
            return (
              <SelectItem key={currency} value={currency}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{info.symbol}</span>
                  <span>{info.code}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

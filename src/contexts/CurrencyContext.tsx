"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Currency, CurrencyInfo } from '@/types';

interface CurrencyContextType {
  selectedCurrency: Currency;
  setCurrency: (currency: Currency) => void;
  getCurrencyInfo: (currency: Currency) => CurrencyInfo;
  formatPrice: (price: number, currency: Currency) => string;
  convertPrice: (price: number, from: Currency, to: Currency) => number;
}

const CURRENCY_INFO: Record<Currency, CurrencyInfo> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    region: 'India'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    region: 'United States'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    region: 'Europe'
  }
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('INR');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

  // Load saved currency preference on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency') as Currency;
    if (savedCurrency && Object.keys(CURRENCY_INFO).includes(savedCurrency)) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch('https://api.frankfurter.app/latest?from=INR');
        const data = await response.json();
        setExchangeRates(data.rates);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      }
    };

    fetchExchangeRates();
  }, []);

  const setCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
    localStorage.setItem('selectedCurrency', currency);
  };

  const getCurrencyInfo = (currency: Currency): CurrencyInfo => {
    return CURRENCY_INFO[currency];
  };

  const formatPrice = (price: number, currency: Currency): string => {
    const info = getCurrencyInfo(currency);
    return `${info.symbol}${price.toFixed(2)}`;
  };

  const convertPrice = (price: number, from: Currency, to: Currency): number => {
    if (from === to) {
      return price;
    }
    const rate = exchangeRates[to];
    if (rate) {
      return price * rate;
    }
    // Fallback if rate is not available
    return price;
  };

  return (
    <CurrencyContext.Provider value={{
      selectedCurrency,
      setCurrency,
      getCurrencyInfo,
      formatPrice,
      convertPrice
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

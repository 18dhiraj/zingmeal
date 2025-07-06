// Google Analytics utility functions

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;
export const GA_DEBUG = process.env.NEXT_PUBLIC_GA_DEBUG === 'true';

// Debug logging function
const debugLog = (message: string, data?: any) => {
  if (GA_DEBUG) {
    console.log(`🎯 [GA4 Debug] ${message}`, data || '');
  }
};

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID!, {
      page_path: url,
    });
    debugLog(`Page view tracked: ${url}`);
  }
};

// Track custom events
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
    debugLog(`Event tracked: ${action}`, {
      category,
      label,
      value
    });
  }
};

// Predefined events for the meal app
export const trackMealSearch = (searchTerm: string) => {
  event({
    action: 'search_meal',
    category: 'Search',
    label: searchTerm,
  });
};

export const trackMealFavorite = (mealId: string, mealName: string, action: 'add' | 'remove') => {
  event({
    action: `${action}_favorite`,
    category: 'Favorite',
    label: `${mealName} (ID: ${mealId})`,
  });
};

export const trackMealPlanGeneration = (planType: string) => {
  event({
    action: 'generate_meal_plan',
    category: 'Meal Plan',
    label: planType,
  });
};

export const trackUserLogin = (method: string) => {
  event({
    action: 'login',
    category: 'User',
    label: method,
  });
};

export const trackUserLogout = () => {
  event({
    action: 'logout',
    category: 'User',
  });
};

// Essential meal tracking functions
export const trackMealView = (mealId: string, mealName: string) => {
  event({
    action: 'view_meal',
    category: 'Meal',
    label: `${mealName} (ID: ${mealId})`,
  });
};

export const trackMealShare = (mealId: string, mealName: string) => {
  event({
    action: 'meal_share',
    category: 'Social',
    label: `${mealName} (ID: ${mealId})`,
  });
};

export const trackMealIngredientsCopy = (mealId: string, mealName: string) => {
  event({
    action: 'copy_ingredients',
    category: 'Meal',
    label: `${mealName} (ID: ${mealId})`,
  });
};

export const trackMealPDFDownload = (mealId: string, mealName: string) => {
  event({
    action: 'download_pdf',
    category: 'Meal',
    label: `${mealName} (ID: ${mealId})`,
  });
};

// Authentication events
export const trackLoginAttempt = (method: string) => {
  event({
    action: 'login_attempt',
    category: 'Authentication',
    label: method,
  });
};

export const trackLoginSuccess = (method: string, isNewUser: boolean) => {
  event({
    action: 'login_success',
    category: 'Authentication',
    label: `${method} - ${isNewUser ? 'new_user' : 'returning_user'}`,
  });
};

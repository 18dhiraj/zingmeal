# Google Analytics Setup with Debug Mode

## Quick Setup

### 1. Environment Configuration

Copy the example environment file:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set your values:
```bash
# Your Google Analytics 4 Measurement ID
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Debug mode - set to 'true' for development, 'false' for production
NEXT_PUBLIC_GA_DEBUG=true
```

### 2. Debug Mode Usage

#### Development (Debug ON)
```bash
NEXT_PUBLIC_GA_DEBUG=true
```
**What you'll see:**
- 🎯 Console logs for all analytics events
- Detailed debug information
- Component initialization logs
- Warning messages if GA ID is not set

#### Production (Debug OFF)
```bash
NEXT_PUBLIC_GA_DEBUG=false
```
**What happens:**
- No console logs (clean production console)
- Analytics still works normally
- No debug overhead

### 3. Optional Debug Status Indicator

For development, you can add a visual debug indicator to your app:

```tsx
// Add to your layout or main component during development
import AnalyticsDebugStatus from '@/components/AnalyticsDebugStatus';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <AnalyticsDebugStatus /> {/* Remove this for production */}
    </>
  );
}
```

## Debug Console Examples

### When GA4 is working correctly:
```
🎯 [GA4 Debug] GoogleAnalytics component initialized {GA_TRACKING_ID: "G-ABC...", GA_DEBUG: true, environment: "development"}
🎯 [GA4 Debug] Page view tracked: /
🎯 [GA4 Debug] Event tracked: view_meal {category: "Meal", label: "Pasta Carbonara (ID: meal-123)", value: undefined}
```

### When GA4 ID is missing:
```
🎯 [GA4 Debug] GA_TRACKING_ID is not set. Add NEXT_PUBLIC_GA_ID to your .env.local file.
🎯 [GA4 Debug] GA_TRACKING_ID not found - Analytics disabled
```

## Environment Variable Summary

| Variable | Purpose | Development | Production |
|----------|---------|-------------|------------|
| `NEXT_PUBLIC_GA_ID` | Your GA4 Measurement ID | `G-XXXXXXXXXX` | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_GA_DEBUG` | Debug mode toggle | `true` | `false` |

## Available Analytics Functions

All functions include debug logging when `NEXT_PUBLIC_GA_DEBUG=true`:

```typescript
// Basic tracking
trackMealView(mealId, mealName)
trackMealSearch(searchTerm)
trackMealFavorite(mealId, mealName, 'add'|'remove')
trackMealPlanGeneration(planType)

// Authentication
trackUserLogin(method)
trackUserLogout()
trackLoginAttempt(method)
trackLoginSuccess(method, isNewUser)

// Meal interactions
trackMealShare(mealId, mealName)
trackMealIngredientsCopy(mealId, mealName)
trackMealPDFDownload(mealId, mealName)

// Page views (automatic)
pageview(url)
```

## Best Practices

### Development
1. Always set `NEXT_PUBLIC_GA_DEBUG=true`
2. Check console for debug messages
3. Verify events are being sent
4. Use the debug status indicator

### Production
1. Set `NEXT_PUBLIC_GA_DEBUG=false`
2. Remove any debug status components
3. Test that analytics still works without console logs
4. Monitor GA4 Real-time reports

### CI/CD
```bash
# In your production build
NEXT_PUBLIC_GA_DEBUG=false npm run build
```

## Troubleshooting

### No events showing in GA4
1. Check if `NEXT_PUBLIC_GA_ID` is set correctly
2. Verify GA4 property is set up properly
3. Check Real-time reports (events appear within 1-2 minutes)
4. Look for debug messages in console

### Too much console output
1. Set `NEXT_PUBLIC_GA_DEBUG=false`
2. Restart development server

### Debug not working
1. Restart development server after changing `.env.local`
2. Check if `.env.local` file exists
3. Verify variable names are exact (case-sensitive)

## Quick Test

1. Set up your environment variables
2. Restart your dev server
3. Open browser console
4. Navigate to any page
5. You should see debug messages like:
   ```
   🎯 [GA4 Debug] GoogleAnalytics component initialized
   🎯 [GA4 Debug] Page view tracked: /
   ```

## Optional: Add Visual Debug Indicator

Add this to your main layout during development:

```tsx
// src/app/layout.tsx
import AnalyticsDebugStatus from '@/components/AnalyticsDebugStatus';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        {/* Only shows when GA_DEBUG=true */}
        <AnalyticsDebugStatus />
      </body>
    </html>
  );
}
```

This will show a small indicator in the bottom-right corner showing "🎯 GA4 Debug: ON/OFF".

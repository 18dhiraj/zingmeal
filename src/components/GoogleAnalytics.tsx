'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pageview, GA_TRACKING_ID, GA_DEBUG } from '@/lib/analytics';

// Component that handles page view tracking
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (GA_TRACKING_ID) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      pageview(url);
    } else if (GA_DEBUG) {
      console.log('🎯 [GA4 Debug] GA_TRACKING_ID not found - Analytics disabled');
    }
  }, [pathname, searchParams]);

  return null;
}

// Main GoogleAnalytics component
export default function GoogleAnalytics() {
  // Show debug info when in debug mode
  useEffect(() => {
    if (GA_DEBUG) {
      console.log('🎯 [GA4 Debug] GoogleAnalytics component initialized', {
        GA_TRACKING_ID: GA_TRACKING_ID ? `${GA_TRACKING_ID.substring(0, 5)}...` : 'Not set',
        GA_DEBUG,
        environment: process.env.NODE_ENV
      });
    }
  }, []);

  if (!GA_TRACKING_ID) {
    if (GA_DEBUG) {
      console.warn('🎯 [GA4 Debug] GA_TRACKING_ID is not set. Add NEXT_PUBLIC_GA_ID to your .env.local file.');
    }
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}

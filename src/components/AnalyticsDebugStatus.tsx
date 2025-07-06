'use client';

import { GA_TRACKING_ID, GA_DEBUG } from '@/lib/analytics';

/**
 * Optional component to show analytics debug status
 * Only add this to your app during development if you want to see the status
 */
export default function AnalyticsDebugStatus() {
  // Only show in debug mode
  if (!GA_DEBUG) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        backgroundColor: '#000',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        border: '1px solid #333'
      }}
    >
      🎯 GA4 Debug: {GA_TRACKING_ID ? 'ON' : 'OFF'}
    </div>
  );
}

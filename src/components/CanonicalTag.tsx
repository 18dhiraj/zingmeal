'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CanonicalTag() {
  const pathname = usePathname();
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  if (!baseUrl) return null;

  const canonicalUrl = `${baseUrl}${pathname === '/' ? '' : pathname}`;

  return <link rel="canonical" href={canonicalUrl} />;
}

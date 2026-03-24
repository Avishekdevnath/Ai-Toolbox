'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (lastTracked.current === pathname) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      lastTracked.current = pathname;
      fetch('/api/analytics/visit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          path: pathname,
          referrer: document.referrer || null,
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {}); // fire-and-forget
    }, 1000); // 1000ms debounce = max 1 event/sec as per spec

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [pathname]);

  return <>{children}</>;
}

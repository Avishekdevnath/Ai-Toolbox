import { useCallback } from 'react';

interface AnalyticsEvent {
  userId?: string;
  toolSlug: string;
  toolName: string;
  eventType: 'view' | 'generate' | 'download' | 'share';
  source?: string;
  category?: string;
  metadata?: Record<string, any>;
}

interface UseToolAnalyticsProps {
  userId?: string;
  toolSlug: string;
  toolName: string;
}

export const useToolAnalytics = ({ userId, toolSlug, toolName }: UseToolAnalyticsProps) => {
  const trackEvent = useCallback(async (event: Omit<AnalyticsEvent, 'userId' | 'toolSlug' | 'toolName'>) => {
    try {
      const analyticsEvent: AnalyticsEvent = {
        userId,
        toolSlug,
        toolName,
        ...event
      };

      // Send analytics event to server
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsEvent),
      });
    } catch (error) {
      // Silently fail in development or log to console
      console.warn('Analytics tracking failed:', error);
    }
  }, [userId, toolSlug, toolName]);

  const trackView = useCallback((options?: { source?: string; category?: string }) => {
    return trackEvent({
      eventType: 'view',
      source: options?.source,
      category: options?.category,
    });
  }, [trackEvent]);

  const trackGenerate = useCallback((options?: { source?: string; category?: string; metadata?: Record<string, any> }) => {
    return trackEvent({
      eventType: 'generate',
      source: options?.source,
      category: options?.category,
      metadata: options?.metadata,
    });
  }, [trackEvent]);

  const trackDownload = useCallback((options?: { source?: string; category?: string; metadata?: Record<string, any> }) => {
    return trackEvent({
      eventType: 'download',
      source: options?.source,
      category: options?.category,
      metadata: options?.metadata,
    });
  }, [trackEvent]);

  const trackShare = useCallback((options?: { source?: string; category?: string; platform?: string }) => {
    return trackEvent({
      eventType: 'share',
      source: options?.source,
      category: options?.category,
      metadata: { platform: options?.platform },
    });
  }, [trackEvent]);

  return {
    trackView,
    trackGenerate,
    trackDownload,
    trackShare,
    trackEvent,
  };
}; 
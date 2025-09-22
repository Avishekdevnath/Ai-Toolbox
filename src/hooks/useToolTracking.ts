import { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';

export const useToolTracking = (toolSlug: string, toolName: string, usageType: 'view' | 'generate' | 'download' | 'share' = 'view') => {
  const { user } = useAuth();

  useEffect(() => {
    // Track tool view/usage
    const trackUsage = async () => {
      try {
        await fetch(`/api/tools/${toolSlug}/track-usage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            usageType,
            userId: user?.id
          })
        });
      } catch (error) {
        console.error('Failed to track tool usage:', error);
      }
    };

    trackUsage();
  }, [toolSlug, toolName, usageType, user?.id]);
};

export default useToolTracking;

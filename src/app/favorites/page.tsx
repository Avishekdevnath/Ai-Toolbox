'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function FavoritesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const userToken = localStorage.getItem('userToken');
      const adminToken = localStorage.getItem('adminToken');
      
      if (!userToken && !adminToken) {
        router.push('/sign-in');
        return;
      }
      
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading favorites..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Favorites</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your favorite tools and bookmarks.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Favorite Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No favorite tools yet.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Search, Filter, Star, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface FavoriteTool {
  _id: string;
  toolId: string;
  toolSlug: string;
  toolName: string;
  toolDescription: string;
  toolCategory: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json();
        setIsSignedIn(!!data.authenticated);
        if (data.authenticated) {
          fetchFavorites();
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    })();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/user/favorites');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      } else {
        setError('Failed to load favorites');
      }
    } catch (err) {
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (toolId: string) => {
    try {
      const response = await fetch(`/api/user/favorites?toolId=${toolId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setFavorites(favorites.filter(fav => fav.toolId !== toolId));
      }
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  const filteredFavorites = favorites.filter(favorite => {
    const matchesSearch = favorite.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         favorite.toolDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || favorite.toolCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(favorites.map(fav => fav.toolCategory)))];

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Sign in to view your favorites
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Create an account or sign in to save and manage your favorite tools.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/sign-in">
                <Button>Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="outline">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Favorites
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your saved tools and utilities
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading favorites...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={fetchFavorites} className="mt-4">Retry</Button>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {favorites.length === 0 ? 'No favorites yet' : 'No favorites match your search'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {favorites.length === 0 
                ? 'Start exploring tools and add them to your favorites!' 
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {favorites.length === 0 && (
              <Link href="/ai-tools">
                <Button>Explore AI Tools</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((favorite) => (
              <Card key={favorite._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        {favorite.toolName}
                      </CardTitle>
                      <Badge variant="secondary" className="mt-2">
                        {favorite.toolCategory}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFavorite(favorite.toolId)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {favorite.toolDescription}
                  </p>
                  
                  {favorite.notes && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Notes:</strong> {favorite.notes}
                      </p>
                    </div>
                  )}

                  {favorite.tags && favorite.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {favorite.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Added {new Date(favorite.createdAt).toLocaleDateString()}
                    </span>
                    <Link href={`/tools/${favorite.toolSlug}`}>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open Tool
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
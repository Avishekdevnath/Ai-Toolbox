'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, Trash2, ExternalLink, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface SearchHistoryItem {
  _id: string;
  query: string;
  category?: string;
  timestamp: string;
  resultCount?: number;
}

export default function SearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json();
        setIsSignedIn(!!data.authenticated);
        if (data.authenticated) {
          fetchSearchHistory();
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    })();
  }, []);

  const fetchSearchHistory = async () => {
    try {
      const response = await fetch('/api/user/search-history');
      if (response.ok) {
        const data = await response.json();
        setSearchHistory(data.history || []);
      } else {
        setError('Failed to load search history');
      }
    } catch (err) {
      setError('Failed to load search history');
    } finally {
      setLoading(false);
    }
  };

  const clearSearchHistory = async () => {
    try {
      const response = await fetch('/api/user/search-history', {
        method: 'DELETE',
      });
      
    if (response.ok) {
        setSearchHistory([]);
      }
    } catch (err) {
      console.error('Failed to clear search history:', err);
    }
  };

  const removeSearchItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/user/search-history/${itemId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSearchHistory(searchHistory.filter(item => item._id !== itemId));
      }
    } catch (err) {
      console.error('Failed to remove search item:', err);
    }
  };

  const filteredHistory = searchHistory.filter(item => {
    return selectedCategory === 'all' || item.category === selectedCategory;
  });

  const categories = ['all', ...Array.from(new Set(searchHistory.map(item => item.category).filter(Boolean)))];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Sign in to view your search history
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Create an account or sign in to track and manage your search history.
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
            Search History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your recent searches and discoveries
          </p>
        </div>

        {/* Filter and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
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

          {searchHistory.length > 0 && (
            <Button
              variant="outline"
              onClick={clearSearchHistory}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading search history...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={fetchSearchHistory} className="mt-4">Retry</Button>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchHistory.length === 0 ? 'No search history yet' : 'No searches match your filter'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchHistory.length === 0 
                ? 'Start searching for tools and your history will appear here!' 
                : 'Try adjusting your filter criteria.'}
            </p>
            {searchHistory.length === 0 && (
              <Link href="/ai-tools">
                <Button>Explore AI Tools</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <Card key={item._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <Search className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {item.query}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimestamp(item.timestamp)}
                          </span>
                          {item.category && (
                            <Badge variant="secondary" className="text-xs">
                              {item.category}
                            </Badge>
                          )}
                          {item.resultCount && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {item.resultCount} results
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.location.href = `/ai-tools?search=${encodeURIComponent(item.query)}`;
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Search Again
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeSearchItem(item._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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
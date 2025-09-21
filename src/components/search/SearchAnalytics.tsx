'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Search, Clock, BarChart3, Users, Target } from 'lucide-react';

interface SearchAnalyticsData {
  totalSearches: number;
  uniqueSearches: number;
  popularQueries: Array<{ query: string; count: number }>;
  searchTrends: Array<{ date: string; count: number }>;
  topCategories: Array<{ category: string; count: number }>;
  searchSuccessRate: number;
  averageSearchTime: number;
}

interface SearchAnalyticsProps {
  className?: string;
}

const SearchAnalytics: React.FC<SearchAnalyticsProps> = ({ className = "" }) => {
  const [analytics, setAnalytics] = useState<SearchAnalyticsData>({
    totalSearches: 0,
    uniqueSearches: 0,
    popularQueries: [],
    searchTrends: [],
    topCategories: [],
    searchSuccessRate: 0,
    averageSearchTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSearchAnalytics();
  }, []);

  const fetchSearchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/search');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch search analytics:', error);
      // Use mock data as fallback
      setAnalytics({
        totalSearches: 1247,
        uniqueSearches: 892,
        popularQueries: [
          { query: 'AI tools', count: 156 },
          { query: 'Finance', count: 134 },
          { query: 'Career', count: 98 },
          { query: 'Health', count: 87 },
          { query: 'Productivity', count: 76 }
        ],
        searchTrends: [
          { date: '2024-01-01', count: 45 },
          { date: '2024-01-02', count: 52 },
          { date: '2024-01-03', count: 48 },
          { date: '2024-01-04', count: 61 },
          { date: '2024-01-05', count: 58 }
        ],
        topCategories: [
          { category: 'Business', count: 234 },
          { category: 'Finance', count: 198 },
          { category: 'Career', count: 167 },
          { category: 'Health', count: 145 },
          { category: 'Utility', count: 123 }
        ],
        searchSuccessRate: 87.5,
        averageSearchTime: 2.3
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
          Search Analytics
        </h3>
        <button
          onClick={fetchSearchAnalytics}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <Search className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Searches</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {analytics.totalSearches.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Unique Searches</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {analytics.uniqueSearches.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Success Rate</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {analytics.searchSuccessRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Avg Time</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {analytics.averageSearchTime}s
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Queries */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
          Popular Search Queries
        </h4>
        <div className="space-y-2">
          {analytics.popularQueries.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.query}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Categories */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
          Most Searched Categories
        </h4>
        <div className="space-y-2">
          {analytics.topCategories.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.category}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search Trends Chart */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
          Search Trends (Last 5 Days)
        </h4>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-end justify-between h-32">
            {analytics.searchTrends.map((item, index) => {
              const maxCount = Math.max(...analytics.searchTrends.map(t => t.count));
              const height = (item.count / maxCount) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-8 bg-blue-600 rounded-t transition-all duration-300 hover:bg-blue-700"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAnalytics; 
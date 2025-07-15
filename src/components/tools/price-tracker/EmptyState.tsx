'use client';

import { TrendingUp, Search, Sparkles, Target } from 'lucide-react';

interface EmptyStateProps {
  loading: boolean;
}

export default function EmptyState({ loading }: EmptyStateProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Searching for the best prices...
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          We're checking 20+ retailers to find you the best deals
        </p>
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
      
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Find the Best Deals
      </h3>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
        Track prices across 20+ retailers and get notified when prices drop. 
        Save money on your favorite products with our AI-powered price tracker.
      </p>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Price Tracking</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Monitor price changes over time with detailed history charts
          </p>
        </div>
        
        <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Best Deals</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Compare prices across major retailers to find the lowest price
          </p>
        </div>
        
        <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Alerts</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get notified when prices drop to your target price
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">How it works:</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
            <span className="text-gray-600 dark:text-gray-400">Enter product name or paste a URL</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-gray-600 dark:text-gray-400">We search 20+ retailers instantly</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-gray-600 dark:text-gray-400">Compare prices and find the best deal</span>
          </div>
        </div>
      </div>
    </div>
  );
} 
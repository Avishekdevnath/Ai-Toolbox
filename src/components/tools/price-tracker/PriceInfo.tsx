'use client';

import { ProductData, formatPrice, findBestPrice } from '@/utils/priceTrackerUtils';
import { TrendingUp, TrendingDown, Minus, DollarSign, ShoppingCart } from 'lucide-react';

interface PriceInfoProps {
  product: ProductData;
}

export default function PriceInfo({ product }: PriceInfoProps) {
  const bestPrice = findBestPrice(product.sources);
  const avgPrice = product.sources.length > 0 
    ? product.sources.reduce((sum, s) => sum + s.price, 0) / product.sources.length 
    : product.price;
  
  const priceDiff = product.price - avgPrice;
  const priceTrend = priceDiff > 0 ? 'above' : priceDiff < 0 ? 'below' : 'at';
  const savings = bestPrice ? product.price - bestPrice.price : 0;

  // Calculate price trend from history
  const priceHistory = product.priceHistory.map(p => parseFloat(p));
  const recentPrices = priceHistory.slice(-7);
  const olderPrices = priceHistory.slice(0, -7);
  const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
  const olderAvg = olderPrices.length > 0 ? olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length : recentAvg;
  const trend = recentAvg - olderAvg;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Price Information</h3>
      </div>

      {/* Current Price */}
      <div className="mb-6">
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {formatPrice(product.price)}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          {trend > 0 ? (
            <TrendingUp className="w-4 h-4 text-red-500" />
          ) : trend < 0 ? (
            <TrendingDown className="w-4 h-4 text-green-500" />
          ) : (
            <Minus className="w-4 h-4 text-gray-500" />
          )}
          <span>
            {trend > 0 ? 'Price increased' : trend < 0 ? 'Price decreased' : 'Price stable'} 
            {Math.abs(trend) > 0 && ` by ${formatPrice(Math.abs(trend))}`} in the last week
          </span>
        </div>
      </div>

      {/* Price Comparison */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">Average Price</span>
          <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(avgPrice)}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">Best Deal</span>
          <div className="text-right">
            <div className="font-semibold text-green-600 dark:text-green-400">
              {bestPrice ? formatPrice(bestPrice.price) : 'N/A'}
            </div>
            {bestPrice && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                at {bestPrice.name}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">Price Range</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatPrice(Math.min(...product.sources.map(s => s.price)))} - {formatPrice(Math.max(...product.sources.map(s => s.price)))}
          </span>
        </div>
      </div>

      {/* Savings Opportunity */}
      {savings > 0 && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-800 dark:text-green-200">Save Money!</span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            You could save up to <span className="font-bold">{formatPrice(savings)}</span> by choosing the best deal.
          </p>
        </div>
      )}

      {/* Price Position */}
      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Price vs Average</div>
        <div className={`text-lg font-bold ${
          priceDiff > 0 ? 'text-red-600 dark:text-red-400' : 
          priceDiff < 0 ? 'text-green-600 dark:text-green-400' : 
          'text-gray-600 dark:text-gray-400'
        }`}>
          {priceDiff > 0 ? '+' : ''}{formatPrice(priceDiff)} ({priceTrend} average)
        </div>
      </div>

      {/* Sources Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Sources checked</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {product.sources.length} retailers
          </span>
        </div>
      </div>
    </div>
  );
} 
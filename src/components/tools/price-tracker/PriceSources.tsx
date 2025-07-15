'use client';

import { useState } from 'react';
import { ProductData, formatPrice, formatLastChecked, findBestPrice } from '@/utils/priceTrackerUtils';

interface PriceSourcesProps {
  product: ProductData;
}

export default function PriceSources({ product }: PriceSourcesProps) {
  const [showAll, setShowAll] = useState(false);
  
  if (product.sources.length === 0) return null;

  const bestPrice = findBestPrice(product.sources);
  const savings = bestPrice ? product.price - bestPrice.price : 0;
  
  // Show top 6 sources initially, then all if expanded
  const displayedSources = showAll ? product.sources : product.sources.slice(0, 6);
  const hasMoreSources = product.sources.length > 6;

  return (
    <div className="p-8 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-xl font-bold text-gray-900 dark:text-white">Price Comparison</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Found {product.sources.length} sources • Sorted by price
          </p>
        </div>
        {bestPrice && savings > 0 && (
          <div className="text-base font-semibold text-green-600 dark:text-green-400">
            💰 Save up to {formatPrice(savings)} at {bestPrice.name}
          </div>
        )}
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {displayedSources.map((source, index) => {
          const isBestPrice = bestPrice?.name === source.name;
          const priceDiff = source.price - product.price;
          const isCheaper = priceDiff < 0;
          
          return (
            <div 
              key={index} 
              className={`relative rounded-xl p-4 transition-all duration-200 ${
                isBestPrice 
                  ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700' 
                  : 'bg-gray-50 dark:bg-gray-700'
              }`}
            >
              {isBestPrice && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  Best Deal
                </div>
              )}
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold text-gray-900 dark:text-white truncate">{source.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {formatLastChecked(source.lastChecked)}
                </span>
              </div>
              
              <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
                {formatPrice(source.price)}
              </div>
              
              {priceDiff !== 0 && (
                <div className={`text-sm mb-2 font-medium ${
                  isCheaper 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {isCheaper ? '↓' : '↑'} {formatPrice(Math.abs(priceDiff))} 
                  {isCheaper ? ' cheaper' : ' more expensive'}
                </div>
              )}
              
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm hover:underline transition-colors font-medium ${
                  isBestPrice 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                Go to {source.name} →
              </a>
            </div>
          );
        })}
      </div>

      {hasMoreSources && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            {showAll ? `Show Top 6` : `Show All ${product.sources.length} Sources`}
          </button>
        </div>
      )}

      {/* Price Analysis Summary */}
      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <h5 className="font-bold text-blue-900 dark:text-blue-100 mb-4 text-lg">Price Analysis</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400 font-medium">Price Range: </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {formatPrice(Math.min(...product.sources.map(s => s.price)))} - {formatPrice(Math.max(...product.sources.map(s => s.price)))}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400 font-medium">Average: </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {formatPrice(product.sources.reduce((sum, s) => sum + s.price, 0) / product.sources.length)}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400 font-medium">Best Deal: </span>
            <span className="font-bold text-green-600 dark:text-green-400">
              {bestPrice ? `${bestPrice.name} (${formatPrice(bestPrice.price)})` : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400 font-medium">Potential Savings: </span>
            <span className="font-bold text-green-600 dark:text-green-400">
              {savings > 0 ? formatPrice(savings) : 'None'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 
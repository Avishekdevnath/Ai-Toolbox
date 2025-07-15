'use client';

import { useState } from 'react';
import { 
  ProductData, 
  formatPrice, 
  getPriceChangeFromHistory, 
  getTrendEmoji, 
  getTrendColorClasses,
  TimeRange,
  TIME_RANGE_OPTIONS,
  generateDateLabels,
  formatDateLabel,
  getTimeRangeLabel,
  generateOptimizedDateLabels
} from '@/utils/priceTrackerUtils';

interface PriceHistoryProps {
  product: ProductData;
  onTimeRangeChange?: (timeRange: TimeRange) => void;
}

export default function PriceHistory({ product, onTimeRangeChange }: PriceHistoryProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(7);

  if (product.priceHistory.length === 0) return null;

  const change = getPriceChangeFromHistory(product.priceHistory);
  const prices = product.priceHistory.map(p => parseFloat(p)).filter(p => !isNaN(p));
  
  // Safety check for valid prices
  if (prices.length === 0) {
    return (
      <div className="p-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-600 dark:text-gray-400">
          No price history data available
        </div>
      </div>
    );
  }
  
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

  // Generate dates for the selected time range
  const allDates = generateDateLabels(selectedTimeRange);
  
  // Generate optimized date labels for chart display
  const { dates: displayDates, labels: dateLabels } = generateOptimizedDateLabels(allDates, selectedTimeRange);

  // Calculate SVG dimensions and scaling
  const width = 600;
  const height = 200;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  // Generate points for the curve
  const points = prices.map((price, index) => {
    const x = padding + (index / (prices.length - 1)) * chartWidth;
    const normalizedPrice = maxPrice === minPrice ? 0.5 : (price - minPrice) / (maxPrice - minPrice);
    const y = height - padding - normalizedPrice * chartHeight;
    return { x, y, price, date: allDates[index] || new Date() };
  });

  // Create smooth curve path
  const createCurvePath = (points: typeof points) => {
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      if (next) {
        // Calculate control points for smooth curve
        const cp1x = prev.x + (curr.x - prev.x) * 0.5;
        const cp1y = prev.y;
        const cp2x = curr.x - (next.x - curr.x) * 0.5;
        const cp2y = curr.y;
        
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
      } else {
        path += ` L ${curr.x} ${curr.y}`;
      }
    }
    
    return path;
  };

  // Create area fill path
  const createAreaPath = (points: typeof points) => {
    if (points.length < 2) return '';
    
    const curvePath = createCurvePath(points);
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    
    return `${curvePath} L ${lastPoint.x} ${height - padding} L ${firstPoint.x} ${height - padding} Z`;
  };

  const handleTimeRangeChange = (timeRange: TimeRange) => {
    setSelectedTimeRange(timeRange);
    onTimeRangeChange?.(timeRange);
  };

  return (
    <div className="p-8 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white">
          Price History ({getTimeRangeLabel(selectedTimeRange)})
        </h4>
        {change && (
          <div className={`text-lg font-semibold ${getTrendColorClasses(change.trend)}`}>
            {getTrendEmoji(change.trend)} {change.percentage.toFixed(1)}% ({change.trend === 'up' ? '+' : change.trend === 'down' ? '-' : ''}{formatPrice(change.change)})
          </div>
        )}
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {TIME_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleTimeRangeChange(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeRange === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <svg width={width} height={height} className="w-full h-auto">
          {/* Grid lines */}
          <defs>
            <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Area fill */}
          <path
            d={createAreaPath(points)}
            fill="url(#priceGradient)"
            opacity="0.6"
          />
          
          {/* Main curve */}
          <path
            d={createCurvePath(points)}
            stroke="#10B981"
            strokeWidth="3"
            fill="none"
            filter="url(#glow)"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#10B981"
                className="hover:r-6 transition-all duration-200 cursor-pointer"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill="transparent"
                className="hover:fill-green-100 hover:dark:fill-green-900/20 transition-all duration-200"
              />
            </g>
          ))}
        </svg>

        {/* Price labels on the left */}
        <div className="absolute left-2 top-6 bottom-6 flex flex-col justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
          <span>{formatPrice(maxPrice)}</span>
          <span>{formatPrice((maxPrice + minPrice) / 2)}</span>
          <span>{formatPrice(minPrice)}</span>
        </div>

        {/* Time labels at the bottom */}
        <div className="absolute left-10 right-6 bottom-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
          {dateLabels.map((label, index) => (
            <span key={index} className="text-xs">
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Price Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lowest Price</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatPrice(minPrice)}</div>
        </div>
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Highest Price</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(maxPrice)}</div>
        </div>
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Price</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatPrice(avgPrice)}</div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-base text-gray-900 dark:text-white">
          <span className="font-semibold">Price Trend: </span>
          {change ? (
            <span className={getTrendColorClasses(change.trend)}>
              {getTrendEmoji(change.trend)} Trending {change.trend === 'up' ? 'Upward' : change.trend === 'down' ? 'Downward' : 'Stable'}
            </span>
          ) : (
            <span className="text-gray-600 dark:text-gray-400">No trend data available</span>
          )}
        </div>
        {change && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Changed by {change.percentage.toFixed(1)}% in the last day
          </div>
        )}
      </div>
    </div>
  );
} 
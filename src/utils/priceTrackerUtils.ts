export interface PriceSource {
  name: string;
  url: string;
  price: number;
  currency: string;
  lastChecked: string;
}

export interface ProductData {
  title: string;
  price: number;
  currency: string;
  image: string;
  url: string;
  sources: PriceSource[];
  priceHistory: string[];
  lastChecked: string;
  availability: string;
  rating?: number;
  reviews?: number;
  description?: string;
  brand?: string;
  category?: string;
  specifications?: string[];
}

export interface PriceChange {
  change: number;
  percentage: number;
  trend: 'up' | 'down' | 'neutral';
}

export type TimeRange = 7 | 15 | 30 | 180 | 365;

export const TIME_RANGE_OPTIONS = [
  { value: 7, label: '7 Days' },
  { value: 15, label: '15 Days' },
  { value: 30, label: '1 Month' },
  { value: 180, label: '6 Months' },
  { value: 365, label: '1 Year' }
] as const;

/**
 * Format price with proper currency formatting
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price);
}

/**
 * Calculate price change between two prices
 */
export function calculatePriceChange(currentPrice: number, previousPrice: number): PriceChange {
  const change = currentPrice - previousPrice;
  const percentage = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;
  
  return {
    change: Math.abs(change),
    percentage: Math.abs(percentage),
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
  };
}

/**
 * Get price change from price history array
 */
export function getPriceChangeFromHistory(history: string[]): PriceChange | null {
  if (history.length < 2) return null;
  
  const current = parseFloat(history[history.length - 1]);
  const previous = parseFloat(history[history.length - 2]);
  
  // Check for valid numbers
  if (isNaN(current) || isNaN(previous)) return null;
  
  return calculatePriceChange(current, previous);
}

/**
 * Generate dates for a given time range
 */
export function generateDateLabels(days: number): Date[] {
  const dates = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dates.push(date);
  }
  
  return dates;
}

/**
 * Format date label based on time range
 */
export function formatDateLabel(date: Date, timeRange: TimeRange): string {
  if (timeRange <= 7) {
    // For short periods, show day of week
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else if (timeRange <= 30) {
    // For medium periods, show month and day
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (timeRange <= 180) {
    // For longer periods, show month
    return date.toLocaleDateString('en-US', { month: 'short' });
  } else {
    // For very long periods, show month and year
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
}

/**
 * Generate optimized date labels for chart display
 */
export function generateOptimizedDateLabels(dates: Date[], timeRange: TimeRange): { dates: Date[], labels: string[] } {
  if (timeRange <= 7) {
    // For 7 days, show all dates
    return {
      dates,
      labels: dates.map(date => formatDateLabel(date, timeRange))
    };
  } else if (timeRange <= 30) {
    // For 30 days, show every 3rd date
    const step = Math.max(1, Math.floor(dates.length / 10));
    const filteredDates = dates.filter((_, index) => index % step === 0 || index === dates.length - 1);
    return {
      dates: filteredDates,
      labels: filteredDates.map(date => formatDateLabel(date, timeRange))
    };
  } else if (timeRange <= 180) {
    // For 6 months, show monthly labels
    const monthlyDates = dates.filter((date, index) => {
      if (index === 0 || index === dates.length - 1) return true;
      const prevDate = dates[index - 1];
      return date.getMonth() !== prevDate.getMonth();
    });
    return {
      dates: monthlyDates,
      labels: monthlyDates.map(date => formatDateLabel(date, timeRange))
    };
  } else {
    // For 1 year, show quarterly labels
    const quarterlyDates = dates.filter((date, index) => {
      if (index === 0 || index === dates.length - 1) return true;
      const prevDate = dates[index - 1];
      const currentQuarter = Math.floor(date.getMonth() / 3);
      const prevQuarter = Math.floor(prevDate.getMonth() / 3);
      return currentQuarter !== prevQuarter;
    });
    return {
      dates: quarterlyDates,
      labels: quarterlyDates.map(date => formatDateLabel(date, timeRange))
    };
  }
}

/**
 * Get time range label
 */
export function getTimeRangeLabel(timeRange: TimeRange): string {
  switch (timeRange) {
    case 7: return 'Last 7 Days';
    case 15: return 'Last 15 Days';
    case 30: return 'Last 30 Days';
    case 180: return 'Last 6 Months';
    case 365: return 'Last Year';
    default: return 'Last 7 Days';
  }
}

/**
 * Generate realistic price history based on a base price
 */
export function generatePriceHistory(basePrice: number, days: number = 7): string[] {
  const history = [];
  for (let i = 0; i < days; i++) {
    // Add some realistic variation (±5% with some trend)
    const trend = Math.sin(i * 0.5) * 0.02; // Small trend component
    const random = (Math.random() - 0.5) * 0.06; // Random variation
    const variation = trend + random;
    const price = basePrice * (1 + variation);
    history.push(price.toFixed(2));
  }
  return history;
}

/**
 * Find the best price from multiple sources
 */
export function findBestPrice(sources: PriceSource[]): PriceSource | null {
  if (sources.length === 0) return null;
  
  return sources.reduce((best, current) => 
    current.price < best.price ? current : best
  );
}

/**
 * Calculate average price from multiple sources
 */
export function calculateAveragePrice(sources: PriceSource[]): number {
  if (sources.length === 0) return 0;
  
  const total = sources.reduce((sum, source) => sum + source.price, 0);
  return Math.round((total / sources.length) * 100) / 100;
}

/**
 * Validate product input
 */
export function validateProductInput(input: string): { isValid: boolean; error?: string } {
  if (!input || input.trim().length === 0) {
    return { isValid: false, error: 'Product name or URL is required' };
  }
  
  if (input.trim().length < 2) {
    return { isValid: false, error: 'Product name must be at least 2 characters' };
  }
  
  return { isValid: true };
}

/**
 * Extract domain from URL for source identification
 */
export function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain.split('.')[0]; // Get first part of domain
  } catch {
    return 'unknown';
  }
}

/**
 * Format relative time for last checked
 */
export function formatLastChecked(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
  return `${Math.floor(diffInMinutes / 1440)} days ago`;
}

/**
 * Get price trend emoji
 */
export function getTrendEmoji(trend: 'up' | 'down' | 'neutral'): string {
  switch (trend) {
    case 'up': return '↗';
    case 'down': return '↘';
    default: return '→';
  }
}

/**
 * Get price trend color classes
 */
export function getTrendColorClasses(trend: 'up' | 'down' | 'neutral'): string {
  switch (trend) {
    case 'up': return 'text-red-600 dark:text-red-400';
    case 'down': return 'text-green-600 dark:text-green-400';
    default: return 'text-gray-600 dark:text-gray-400';
  }
} 
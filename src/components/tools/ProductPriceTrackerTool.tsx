'use client';

import { useState } from 'react';
import { ProductData, validateProductInput, TimeRange } from '@/utils/priceTrackerUtils';

// Import modular components
import PriceSearchForm from './price-tracker/PriceSearchForm';
import ProductHeader from './price-tracker/ProductHeader';
import PriceInfo from './price-tracker/PriceInfo';
import PriceAlert from './price-tracker/PriceAlert';
import PriceSources from './price-tracker/PriceSources';
import PriceHistory from './price-tracker/PriceHistory';
import ProductActions from './price-tracker/ProductActions';
import RecentlyTracked from './price-tracker/RecentlyTracked';
import EmptyState from './price-tracker/EmptyState';

export default function ProductPriceTrackerTool() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductData | null>(null);
  const [error, setError] = useState('');
  const [trackedProducts, setTrackedProducts] = useState<ProductData[]>([]);
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>(7);

  const handleSearch = async (input: string, timeRange: TimeRange = 7) => {
    const validation = validateProductInput(input);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid input');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);
    setCurrentTimeRange(timeRange);
    
    try {
      const res = await fetch('/api/price-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, timeRange })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        // Add to tracked products if not already there
        if (!trackedProducts.find(p => p.title === data.title)) {
          setTrackedProducts(prev => [data, ...prev.slice(0, 4)]); // Keep last 5
        }
      }
    } catch (e) {
      setError('Failed to fetch product information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = async (timeRange: TimeRange) => {
    if (!result) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/price-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: result.title, timeRange })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        setCurrentTimeRange(timeRange);
      }
    } catch (e) {
      setError('Failed to update price history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetAlert = (price: number, type: 'below' | 'above') => {
    // In a real app, this would save to a database
    console.log(`Alert set for ${type} ${price}`);
  };

  const handleSelectProduct = (product: ProductData) => {
    setResult(product);
    setCurrentTimeRange(7); // Reset to default time range
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Form */}
      <PriceSearchForm 
        onSearch={(input) => handleSearch(input, currentTimeRange)}
        loading={loading}
        error={error}
      />

      {/* Results Section */}
      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <ProductHeader product={result} />
          
          {/* Price Information */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <PriceInfo product={result} />
              <PriceAlert onSetAlert={handleSetAlert} currentPrice={result.price} />
            </div>
          </div>

          <PriceSources product={result} />
          <PriceHistory 
            product={result} 
            onTimeRangeChange={handleTimeRangeChange}
          />
          <ProductActions product={result} />
        </div>
      )}

      {/* Recently Tracked Products */}
      <RecentlyTracked 
        products={trackedProducts} 
        onSelectProduct={handleSelectProduct}
      />

      {/* Empty State */}
      <EmptyState loading={loading} />
    </div>
  );
} 
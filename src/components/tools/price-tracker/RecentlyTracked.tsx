'use client';

import { ProductData, formatPrice } from '@/utils/priceTrackerUtils';

interface RecentlyTrackedProps {
  products: ProductData[];
  onSelectProduct?: (product: ProductData) => void;
}

export default function RecentlyTracked({ products, onSelectProduct }: RecentlyTrackedProps) {
  if (products.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Recently Tracked Products
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.slice(0, 6).map((product, index) => (
          <div 
            key={index} 
            className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-colors ${
              onSelectProduct ? 'hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer' : ''
            }`}
            onClick={() => onSelectProduct?.(product)}
          >
            <div className="flex items-center gap-4">
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-16 h-16 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/64x64?text=Product';
                }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate mb-2">
                  {product.title}
                </h4>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatPrice(product.price)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
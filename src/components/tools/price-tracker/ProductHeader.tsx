'use client';

import { ProductData } from '@/utils/priceTrackerUtils';
import { Star, Tag, Package, Info } from 'lucide-react';

interface ProductHeaderProps {
  product: ProductData;
}

export default function ProductHeader({ product }: ProductHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              src={product.image}
              alt={product.title}
              className="w-48 h-48 object-cover rounded-xl shadow-lg border-4 border-white dark:border-gray-700"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop';
              }}
            />
            {product.rating && (
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Information */}
        <div className="flex-1 space-y-6">
          {/* Title and Basic Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {product.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {product.brand && (
                <div className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  <span className="font-medium">{product.brand}</span>
                </div>
              )}
              {product.category && (
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span>{product.category}</span>
                </div>
              )}
              {product.reviews && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>{product.reviews.toLocaleString()} reviews</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Features</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {product.specifications.slice(0, 6).map((spec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability and Last Updated */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              product.availability === 'In Stock' 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                product.availability === 'In Stock' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {product.availability}
            </div>
            <span className="text-gray-500 dark:text-gray-400">
              Last updated: {new Date(product.lastChecked).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 
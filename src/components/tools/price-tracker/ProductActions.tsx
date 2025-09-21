'use client';

import { ProductData, formatPrice } from '@/utils/priceTrackerUtils';

interface ProductActionsProps {
  product: ProductData;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const handleViewProduct = () => {
    // Find the best price source or use the first available
    const bestSource = product.sources.find(s => s.price === Math.min(...product.sources.map(s => s.price))) || product.sources[0];
    if (bestSource?.url) {
      window.open(bestSource.url, '_blank');
    }
  };

  const handleCopyInfo = async () => {
    const info = `
Product: ${product.title}
Current Price: ${formatPrice(product.price)}
Best Deal: ${product.sources.length > 0 ? `${product.sources.find(s => s.price === Math.min(...product.sources.map(s => s.price)))?.name} - ${formatPrice(Math.min(...product.sources.map(s => s.price)))}` : 'N/A'}
Last Updated: ${new Date(product.lastChecked).toLocaleString()}
    `.trim();

    try {
      await navigator.clipboard.writeText(info);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="p-8 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleViewProduct}
          className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-semibold text-base"
        >
          View Product
        </button>
        <button
          onClick={handleCopyInfo}
          className="flex-1 px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-semibold text-base"
        >
          Copy Info
        </button>
      </div>
    </div>
  );
} 
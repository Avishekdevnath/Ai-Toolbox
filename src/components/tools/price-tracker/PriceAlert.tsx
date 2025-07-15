'use client';

import { useState } from 'react';
import { formatPrice } from '@/utils/priceTrackerUtils';

interface PriceAlertProps {
  onSetAlert: (price: number, type: 'below' | 'above') => void;
  currentPrice?: number;
}

export default function PriceAlert({ onSetAlert, currentPrice }: PriceAlertProps) {
  const [alertPrice, setAlertPrice] = useState('');
  const [alertType, setAlertType] = useState<'below' | 'above'>('below');
  const [alertSet, setAlertSet] = useState(false);
  const [email, setEmail] = useState('');

  const handleSetAlert = () => {
    if (!alertPrice) return;
    const price = parseFloat(alertPrice);
    if (isNaN(price) || price <= 0) return;
    
    onSetAlert(price, alertType);
    setAlertSet(true);
    setTimeout(() => setAlertSet(false), 3000);
  };

  const getAlertDescription = () => {
    if (!currentPrice || !alertPrice) return '';
    const price = parseFloat(alertPrice);
    const diff = currentPrice - price;
    
    if (alertType === 'below') {
      if (diff > 0) {
        return `Price needs to drop by ${formatPrice(diff)} to trigger alert`;
      } else {
        return `Price is already below your target!`;
      }
    } else {
      if (diff < 0) {
        return `Price needs to rise by ${formatPrice(Math.abs(diff))} to trigger alert`;
      } else {
        return `Price is already above your target!`;
      }
    }
  };

  return (
    <div className="text-center">
      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Set Price Alert</h4>
      
      {/* Alert Type Selection */}
      <div className="flex gap-3 justify-center mb-4">
        <button
          onClick={() => setAlertType('below')}
          className={`px-4 py-2 rounded-lg text-base font-semibold transition-colors ${
            alertType === 'below'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}
        >
          Below Price
        </button>
        <button
          onClick={() => setAlertType('above')}
          className={`px-4 py-2 rounded-lg text-base font-semibold transition-colors ${
            alertType === 'above'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}
        >
          Above Price
        </button>
      </div>

      {/* Current Price Display */}
      {currentPrice && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Price</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatPrice(currentPrice)}
          </div>
        </div>
      )}

      {/* Alert Input */}
      <div className="flex gap-3 justify-center mb-4">
        <input
          type="number"
          value={alertPrice}
          onChange={e => setAlertPrice(e.target.value)}
          placeholder={`Target price ${alertType === 'below' ? 'below' : 'above'}`}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-48 text-base"
          min="0"
          step="0.01"
        />
        <button
          onClick={handleSetAlert}
          disabled={!alertPrice}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-base font-semibold"
        >
          Set Alert
        </button>
      </div>

      {/* Alert Description */}
      {alertPrice && currentPrice && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-base text-blue-700 dark:text-blue-300">
            {getAlertDescription()}
          </div>
        </div>
      )}

      {/* Email Notification (Optional) */}
      <div className="mb-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email for notifications (optional)"
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full text-base"
        />
      </div>

      {/* Success Message */}
      {alertSet && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <div className="text-green-600 dark:text-green-400 text-base font-semibold">
            ✅ Alert set for {alertType === 'below' ? 'below' : 'above'} {formatPrice(parseFloat(alertPrice))}!
          </div>
          <div className="text-sm text-green-600 dark:text-green-400 mt-2">
            You'll be notified when the price {alertType === 'below' ? 'drops below' : 'rises above'} your target.
          </div>
        </div>
      )}

      {/* Alert Tips */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <div className="text-sm text-yellow-700 dark:text-yellow-300">
          <div className="font-bold mb-2 text-base">💡 Price Alert Tips:</div>
          <ul className="space-y-2 text-left">
            <li>• Set alerts for 10-15% below current price for best deals</li>
            <li>• Monitor price history to understand typical fluctuations</li>
            <li>• Consider seasonal sales and holiday discounts</li>
            <li>• Check multiple retailers for price variations</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 
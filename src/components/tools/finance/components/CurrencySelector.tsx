import React from 'react';
import { useFinance, currencies } from '../context/FinanceContext';

export function CurrencySelector() {
  const { selectedCurrency, setSelectedCurrency } = useFinance();

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="currency" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Currency
      </label>
      <select
        id="currency"
        value={selectedCurrency.code}
        onChange={(e) => {
          const currency = currencies.find(c => c.code === e.target.value);
          if (currency) setSelectedCurrency(currency);
        }}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} - {currency.name} ({currency.symbol})
          </option>
        ))}
      </select>
    </div>
  );
} 
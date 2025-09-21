'use client';

import { useState, useEffect } from 'react';
import { getCategories, getUnitsForCategory, convertValue, formatResult, UnitCategory } from '@/utils/unitUtils';
import UnitCategorySelector from './unit/UnitCategorySelector';
import UnitInput from './unit/UnitInput';
import UnitResult from './unit/UnitResult';

export default function UnitConverterTool() {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('foot');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const units = getUnitsForCategory(category);
    setFromUnit(units[0].key);
    setToUnit(units[1]?.key || units[0].key);
    setInputValue('');
    setResult('');
    setError('');
  }, [category]);

  useEffect(() => {
    if (inputValue) {
      const value = parseFloat(inputValue);
      if (!isNaN(value)) {
        setIsLoading(true);
        setError('');
        
        convertValue(category, value, fromUnit, toUnit)
          .then(res => {
            if (!isNaN(res)) {
              const formattedResult = formatResult(res, category, toUnit);
              setResult(formattedResult);
              // After unit conversion is displayed
              fetch('/api/tools/unit-converter/track-usage', { method: 'POST' });
            } else {
              setResult('');
              setError('Invalid conversion');
            }
          })
          .catch(err => {
            console.error('Conversion error:', err);
            setResult('');
            setError(err.message || 'Conversion failed');
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setResult('');
        setError('');
      }
    } else {
      setResult('');
      setError('');
    }
  }, [inputValue, fromUnit, toUnit, category]);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (result && inputValue) {
      setInputValue(result.split(' ')[0]); // Extract just the number
    }
  };

  const units = getUnitsForCategory(category);
  const categories = getCategories();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <UnitCategorySelector category={category} categories={categories} onChange={setCategory} />
      <UnitInput
        inputValue={inputValue}
        fromUnit={fromUnit}
        toUnit={toUnit}
        units={units}
        onInputChange={setInputValue}
        onFromUnitChange={setFromUnit}
        onToUnitChange={setToUnit}
        onSwap={handleSwap}
      />
      <div className="flex justify-center">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md p-6 mt-6 text-center">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Converting...</span>
            </div>
          )}
          
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm mb-2">
              {error}
            </div>
          )}
          
          {inputValue && result && !isLoading && !error && (
            <div className="flex flex-col items-center gap-2">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                {inputValue} {units.find(u => u.key === fromUnit)?.name} = {result}
              </div>
              <button
                onClick={() => {
                  const eq = `${inputValue} ${units.find(u => u.key === fromUnit)?.name} = ${result}`;
                  navigator.clipboard.writeText(eq);
                }}
                className="px-3 py-1 rounded bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors text-sm font-medium"
                title="Copy equation"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
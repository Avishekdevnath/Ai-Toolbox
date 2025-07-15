import React from 'react';
import { useFinance } from '../context/FinanceContext';

export function LoadingOverlay() {
  const { isLoading, progress } = useFinance();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Processing Your Request
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Please wait while we analyze your financial data
            </p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {progress}% Complete
          </p>
        </div>
      </div>
    </div>
  );
} 
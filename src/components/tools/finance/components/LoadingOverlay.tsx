import React from 'react';
import { useFinance } from '../context/FinanceContext';
import Modal from '@/components/ui/modal';

export function LoadingOverlay() {
  const { isLoading, progress } = useFinance();

  if (!isLoading) return null;

  return (
    <Modal
      isOpen={isLoading}
      onClose={() => {}}
      title="Processing Your Request"
      description="Please wait while we analyze your financial data"
    >
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {progress}% Complete
      </p>
    </Modal>
  );
} 
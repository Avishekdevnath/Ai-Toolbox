import { BaseModuleProps } from '../types';

interface BaseModuleLayoutProps extends BaseModuleProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function BaseModuleLayout({
  title,
  description,
  children,
  onBack
}: BaseModuleLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
        >
          ← Back to Hub
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {children}
      </div>

      {/* Disclaimer */}
      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">
        <p>
          This tool provides educational guidance and should not replace professional financial advice.
          Always consult with a qualified financial advisor for personalized recommendations.
        </p>
      </div>
    </div>
  );
} 
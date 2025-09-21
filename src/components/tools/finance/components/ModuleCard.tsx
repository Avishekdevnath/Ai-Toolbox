import { ModuleCardProps } from '../types';

export function ModuleCard({
  title,
  description,
  complexity,
  duration,
  features,
  status,
  onClick
}: ModuleCardProps) {
  const statusColors = {
    'Available': 'bg-green-100 text-green-800',
    'Coming Soon': 'bg-yellow-100 text-yellow-800',
    'Beta': 'bg-blue-100 text-blue-800'
  };

  const complexityColors = {
    'Basic': 'text-green-600',
    'Intermediate': 'text-yellow-600',
    'Advanced': 'text-red-600'
  };

  return (
    <div 
      onClick={onClick}
      className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
      
      <div className="flex items-center gap-4 mb-4">
        <span className={`text-sm font-medium ${complexityColors[complexity]}`}>
          {complexity}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {duration}
        </span>
      </div>

      <div className="space-y-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </div>
        ))}
      </div>
    </div>
  );
} 
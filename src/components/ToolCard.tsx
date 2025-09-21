import React from 'react';
import Link from 'next/link';
import FavoriteButton from '@/components/interactions/FavoriteButton';

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  features: string[];
  colorClass?: string;
  userId?: string;
  status?: string;
}

const ToolCard: React.FC<ToolCardProps> = ({ 
  id, 
  name, 
  description, 
  icon, 
  href, 
  features, 
  colorClass = 'blue',
  userId,
  status
}) => {
  const badgeClass =
    colorClass === 'green'
      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
      : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200';

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow p-6 flex flex-col items-center group border border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500">
      {/* Status Badge */}
      {status && (
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 text-xs font-medium rounded-full">
            {status}
          </span>
        </div>
      )}

      {/* Favorite Button */}
      <div className="absolute top-3 right-3 z-10">
        <FavoriteButton
          toolSlug={id}
          toolName={name}
          category={colorClass === 'green' ? 'utilities' : 'ai_tools'}
          userId={userId}
          size="sm"
        />
      </div>

      <Link
        href={href}
        className="flex flex-col items-center w-full"
      >
        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 text-center">{name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">{description}</p>
        <div className="flex flex-wrap gap-2 justify-center mt-auto">
          {features.map((feature, idx) => (
            <span key={idx} className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${badgeClass}`}>{feature}</span>
          ))}
        </div>
      </Link>
    </div>
  );
};

export default ToolCard; 
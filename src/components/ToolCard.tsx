import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
      ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-700 dark:text-green-200'
      : 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-700 dark:text-blue-200';

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 flex flex-col h-80 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-500"
    >
      {/* Status Badge */}
      {status && (
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 text-orange-700 dark:text-orange-200 text-xs font-medium rounded-full shadow-sm">
            {status}
          </span>
        </div>
      )}

      {/* Favorite Button */}
      <div className="absolute top-4 right-4 z-10">
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
        prefetch={false}
        className="flex flex-col h-full"
      >
        <motion.div 
          className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0 flex justify-center"
          whileHover={{ rotate: 5 }}
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0">
          {name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-4 leading-relaxed flex-grow">
          {description}
        </p>
        <div className="flex flex-wrap gap-2 justify-center mt-auto flex-shrink-0">
          {features.slice(0, 3).map((feature, idx) => (
            <motion.span 
              key={idx} 
              whileHover={{ scale: 1.05 }}
              className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${badgeClass}`}
            >
              {feature}
            </motion.span>
          ))}
          {features.length > 3 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              +{features.length - 3} more
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ToolCard; 
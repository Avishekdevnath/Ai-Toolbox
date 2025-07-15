import React from 'react';
import { UnitCategory } from '@/utils/unitUtils';

const categoryIcons: Record<UnitCategory, string> = {
  length: '📏',
  weight: '⚖️',
  temperature: '🌡️',
  volume: '🧪',
  area: '📐',
  speed: '🚗',
};

interface Props {
  category: UnitCategory;
  categories: UnitCategory[];
  onChange: (cat: UnitCategory) => void;
}

const UnitCategorySelector: React.FC<Props> = ({ category, categories, onChange }) => (
  <div className="flex flex-wrap gap-2 mb-4">
    {categories.map(cat => (
      <button
        key={cat}
        onClick={() => onChange(cat)}
        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm
          ${category === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-800'}`}
      >
        <span className="mr-2 text-lg">{categoryIcons[cat]}</span>
        {cat.charAt(0).toUpperCase() + cat.slice(1)}
      </button>
    ))}
  </div>
);

export default UnitCategorySelector; 
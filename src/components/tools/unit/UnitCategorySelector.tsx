import React from 'react';
import { UnitCategory } from '@/utils/unitUtils';

const categoryIcons: Record<UnitCategory, string> = {
  length: 'L',
  weight: 'W',
  temperature: 'T',
  volume: 'V',
  area: 'A',
  speed: 'S',
  currency: '$',
};

interface Props {
  category: UnitCategory;
  categories: UnitCategory[];
  onChange: (cat: UnitCategory) => void;
}

const UnitCategorySelector: React.FC<Props> = ({ category, categories, onChange }) => (
  <div className="mb-4 flex flex-wrap gap-2">
    {categories.map((cat) => (
      <button
        key={cat}
        onClick={() => onChange(cat)}
        className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-colors ${
          category === cat
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-blue-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-blue-800'
        }`}
      >
        <span className="mr-2 text-lg">{categoryIcons[cat]}</span>
        {cat.charAt(0).toUpperCase() + cat.slice(1)}
      </button>
    ))}
  </div>
);

export default UnitCategorySelector;

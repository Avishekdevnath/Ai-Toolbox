import React from 'react';
import { Unit } from '@/utils/unitUtils';

interface Props {
  inputValue: string;
  fromUnit: string;
  toUnit: string;
  units: Unit[];
  onInputChange: (val: string) => void;
  onFromUnitChange: (unit: string) => void;
  onToUnitChange: (unit: string) => void;
  onSwap: () => void;
}

const UnitInput: React.FC<Props> = ({ inputValue, fromUnit, toUnit, units, onInputChange, onFromUnitChange, onToUnitChange, onSwap }) => (
  <div className="flex items-end gap-2 mb-4">
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Value</label>
      <input
        type="number"
        value={inputValue}
        onChange={e => onInputChange(e.target.value)}
        placeholder="Enter value"
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From</label>
      <select
        value={fromUnit}
        onChange={e => onFromUnitChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      >
        {units.map(u => (
          <option key={u.key} value={u.key}>{u.name}</option>
        ))}
      </select>
    </div>
    <button
      onClick={onSwap}
      className="mb-4 px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 hover:bg-blue-200 dark:hover:bg-blue-700 text-gray-700 dark:text-gray-200 transition-colors"
      title="Swap units"
    >
      ⇄
    </button>
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
      <select
        value={toUnit}
        onChange={e => onToUnitChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      >
        {units.map(u => (
          <option key={u.key} value={u.key}>{u.name}</option>
        ))}
      </select>
    </div>
  </div>
);

export default UnitInput; 
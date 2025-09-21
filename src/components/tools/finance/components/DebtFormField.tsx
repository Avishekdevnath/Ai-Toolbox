import React from 'react';

interface DebtFormFieldProps {
  label: string;
  name: string;
  type: 'text' | 'number' | 'select';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  currency?: string;
  options?: Array<{ value: string; label: string }>;
}

export function DebtFormField({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  min,
  max,
  currency,
  options = []
}: DebtFormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">{placeholder || 'Select an option'}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative">
          {currency && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400 text-sm">{currency}</span>
            </div>
          )}
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            min={min}
            max={max}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
              currency ? 'pl-12' : ''
            }`}
          />
        </div>
      )}
    </div>
  );
} 
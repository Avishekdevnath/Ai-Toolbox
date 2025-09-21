import { memo } from 'react';
import { MemoizedInput } from './MemoizedInput';

interface FormInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  step?: string;
  required?: boolean;
}

export const FormInput = memo(function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  step,
  required = false,
}: FormInputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <MemoizedInput
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
      />
    </div>
  );
}); 
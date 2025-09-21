interface RetirementFormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  currency?: string;
  options?: { value: string; label: string }[];
}

export function RetirementFormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  min,
  max,
  currency,
  options
}: RetirementFormFieldProps) {
  const displayLabel = currency ? `${label} (${currency})` : label;

  if (type === 'select' && options) {
    return (
      <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {displayLabel} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          required={required}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {displayLabel} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        required={required}
      />
    </div>
  );
} 
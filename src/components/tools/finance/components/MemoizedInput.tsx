import { memo, useCallback } from 'react';

interface MemoizedInputProps {
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  step?: string;
}

export const MemoizedInput = memo(function MemoizedInput({
  type = 'text',
  value,
  onChange,
  placeholder = '',
  className = '',
  step,
}: MemoizedInputProps) {
  // Use useCallback to memoize the onChange handler
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  // Convert value to string for controlled input
  const inputValue = value?.toString() || '';

  return (
    <input
      type={type}
      value={inputValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      step={step}
    />
  );
}); 
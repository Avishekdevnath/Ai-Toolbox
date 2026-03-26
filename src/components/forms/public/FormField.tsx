"use client";
import { FormField as IFormField } from '@/types/forms';

interface Props {
  field: IFormField;
  value: string | string[];
  error?: string;
  onChange: (value: string | string[]) => void;
  onBlur?: () => void;
}

export default function FormField({ field, value, error, onChange, onBlur }: Props) {
  const inputClass = `w-full rounded-xl border px-4 py-3 text-[14px] text-slate-700 focus:outline-none focus:ring-2 transition-colors ${
    error ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-200 focus:border-blue-400'
  }`;

  if (field.type === 'section') {
    return (
      <div className="pt-6 pb-2">
        <h3 className="text-base font-semibold text-slate-700">{field.label}</h3>
        <hr className="mt-2 border-slate-200" />
      </div>
    );
  }

  const renderInput = () => {
    if (field.type === 'long_text') {
      const text = (value as string) || '';
      const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
      const limit = field.wordLimit;
      const atLimit = !!limit && wordCount >= limit;

      const handleLongTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        if (!limit) { onChange(newVal); return; }
        const wc = newVal.trim() === '' ? 0 : newVal.trim().split(/\s+/).length;
        if (wc <= limit) onChange(newVal);
      };

      return (
        <div className="relative">
          <textarea
            value={text}
            onChange={handleLongTextChange}
            onBlur={onBlur}
            placeholder={field.placeholder}
            rows={4}
            className={`${inputClass} resize-none`}
          />
          {limit && (
            <p className={`text-right text-[11px] mt-1 ${atLimit ? 'text-red-400 font-medium' : 'text-slate-400'}`}>
              {wordCount}/{limit} words
            </p>
          )}
        </div>
      );
    }
    if (field.type === 'dropdown') {
      return (
        <select value={value as string} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} className={inputClass}>
          <option value="">Select an option</option>
          {field.options.map((o, i) => <option key={i} value={o}>{o}</option>)}
        </select>
      );
    }
    if (field.type === 'radio') {
      return (
        <div className="space-y-2 mt-1">
          {field.options.map((o, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${value === o ? 'border-blue-600 bg-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}>
                {value === o && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className="text-[14px] text-slate-700">{o}</span>
              <input type="radio" className="sr-only" value={o} checked={value === o} onChange={() => onChange(o)} />
            </label>
          ))}
        </div>
      );
    }
    if (field.type === 'checkbox') {
      const checked = (value as string[]) || [];
      return (
        <div className="space-y-2 mt-1">
          {field.options.map((o, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${checked.includes(o) ? 'border-blue-600 bg-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}>
                {checked.includes(o) && (
                  <svg width="10" height="8" viewBox="0 0 10 8">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <span className="text-[14px] text-slate-700">{o}</span>
              <input
                type="checkbox"
                className="sr-only"
                checked={checked.includes(o)}
                onChange={() => onChange(checked.includes(o) ? checked.filter(c => c !== o) : [...checked, o])}
              />
            </label>
          ))}
        </div>
      );
    }
    return (
      <input
        type={
          field.type === 'email' ? 'email'
            : field.type === 'number' ? 'number'
            : field.type === 'date' ? 'date'
            : field.type === 'time' ? 'time'
            : 'text'
        }
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={field.placeholder}
        className={inputClass}
      />
    );
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[14px] font-medium text-slate-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {field.helpText && <p className="text-[12px] text-slate-400">{field.helpText}</p>}
      {renderInput()}
      {error && <p className="text-[12px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

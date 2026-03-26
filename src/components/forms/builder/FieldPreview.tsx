import { FormField } from '@/types/forms';

export default function FieldPreview({ field }: { field: FormField }) {
  const base = "mt-1 w-full rounded-md border border-slate-200 bg-slate-50 text-[13px] text-slate-400 pointer-events-none";

  if (field.type === 'section') {
    return <hr className="mt-2 border-slate-200" />;
  }
  if (field.type === 'long_text') {
    return <textarea disabled placeholder={field.placeholder || 'Long answer text'} rows={3} className={`${base} px-3 py-2 resize-none`} />;
  }
  if (field.type === 'dropdown') {
    return (
      <select disabled className={`${base} px-3 py-2`}>
        <option>{field.placeholder || 'Select an option'}</option>
        {field.options.map((o, i) => <option key={i}>{o}</option>)}
      </select>
    );
  }
  if (field.type === 'radio') {
    return (
      <div className="mt-1 space-y-1.5">
        {(field.options.length ? field.options : ['Option 1']).map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
            <span className="text-[13px] text-slate-400">{o}</span>
          </div>
        ))}
      </div>
    );
  }
  if (field.type === 'checkbox') {
    return (
      <div className="mt-1 space-y-1.5">
        {(field.options.length ? field.options : ['Option 1']).map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-slate-300 shrink-0" />
            <span className="text-[13px] text-slate-400">{o}</span>
          </div>
        ))}
      </div>
    );
  }
  if (field.type === 'date') {
    return <input disabled type="date" className={`${base} px-3 py-2`} />;
  }
  if (field.type === 'time') {
    return <input disabled type="time" className={`${base} px-3 py-2`} />;
  }
  return (
    <input
      disabled
      type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
      placeholder={field.placeholder || 'Short answer'}
      className={`${base} px-3 py-2`}
    />
  );
}

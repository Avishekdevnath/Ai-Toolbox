"use client";
import { Type, AlignLeft, Hash, Mail, Calendar, Clock, ChevronDown, Circle, CheckSquare, Minus } from 'lucide-react';
import { FormField } from '@/types/forms';

const TYPE_ICONS: Record<string, React.ElementType> = {
  short_text: Type, long_text: AlignLeft, number: Hash, email: Mail,
  date: Calendar, time: Clock, dropdown: ChevronDown,
  radio: Circle, checkbox: CheckSquare, section: Minus,
};

interface FieldNavigatorProps {
  fields: FormField[];
  activeFieldId: string | null;
  onSelectField: (fieldId: string) => void;
}

export default function FieldNavigator({ fields, activeFieldId, onSelectField }: FieldNavigatorProps) {
  if (fields.length === 0) {
    return (
      <div className="p-4 text-center text-[13px] text-slate-400 mt-8">
        No fields yet. Add fields using the Add tab.
      </div>
    );
  }

  return (
    <div className="p-2 space-y-0.5">
      {fields.map((field, idx) => {
        const Icon = TYPE_ICONS[field.type] ?? Type;
        const isActive = field.id === activeFieldId;
        return (
          <button
            key={field.id}
            onClick={() => onSelectField(field.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-left transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-[11px] text-slate-400 w-4 shrink-0 tabular-nums">{idx + 1}</span>
            <Icon size={13} className="shrink-0" />
            <span className="truncate">{field.label || `(${field.type.replace('_', ' ')})`}</span>
          </button>
        );
      })}
    </div>
  );
}

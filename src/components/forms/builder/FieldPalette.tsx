"use client";
import {
  Type, AlignLeft, Hash, Mail, Calendar, Clock,
  ChevronDown, Circle, CheckSquare, Minus
} from 'lucide-react';
import { FormField } from '@/types/forms';

type FieldType = FormField['type'];

interface FieldTypeOption {
  type: FieldType;
  label: string;
  icon: React.ElementType;
}

const GROUPS: { label: string; items: FieldTypeOption[] }[] = [
  {
    label: 'Basic',
    items: [
      { type: 'short_text', label: 'Short Text', icon: Type },
      { type: 'long_text', label: 'Paragraph', icon: AlignLeft },
      { type: 'number', label: 'Number', icon: Hash },
      { type: 'email', label: 'Email', icon: Mail },
    ],
  },
  {
    label: 'Choice',
    items: [
      { type: 'dropdown', label: 'Dropdown', icon: ChevronDown },
      { type: 'radio', label: 'Multiple Choice', icon: Circle },
      { type: 'checkbox', label: 'Checkboxes', icon: CheckSquare },
    ],
  },
  {
    label: 'Date & Time',
    items: [
      { type: 'date', label: 'Date', icon: Calendar },
      { type: 'time', label: 'Time', icon: Clock },
    ],
  },
  {
    label: 'Layout',
    items: [
      { type: 'section', label: 'Section Break', icon: Minus },
    ],
  },
];

interface FieldPaletteProps {
  onAddField: (type: FieldType) => void;
}

export default function FieldPalette({ onAddField }: FieldPaletteProps) {
  return (
    <div className="p-3 space-y-4">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => onAddField(type)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
              >
                <Icon size={14} className="shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

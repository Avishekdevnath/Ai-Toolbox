'use client';

import { Button } from '@/components/ui/button';

const FIELD_TYPES = [
  { type: 'short_text', label: 'Short Text' },
  { type: 'long_text', label: 'Long Text' },
  { type: 'email', label: 'Email' },
  { type: 'number', label: 'Number' },
  { type: 'date', label: 'Date' },
  { type: 'time', label: 'Time' },
  { type: 'dropdown', label: 'Dropdown' },
  { type: 'radio', label: 'Single Choice' },
  { type: 'checkbox', label: 'Multi Choice' },
];

export default function FormFieldPalette({ onAdd }: { onAdd: (type: string) => void }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Add Fields</div>
      <div className="grid grid-cols-2 gap-2">
        {FIELD_TYPES.map((ft) => (
          <Button key={ft.type} variant="outline" size="sm" onClick={() => onAdd(ft.type)}>
            {ft.label}
          </Button>
        ))}
      </div>
    </div>
  );
}



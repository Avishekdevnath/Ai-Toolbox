'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export interface CanvasField {
  id: string;
  questionCode?: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
  multiple?: boolean;
  placeholder?: string;
  helpText?: string;
}

const FIELD_TYPES: Array<{ value: string; label: string }> = [
  { value: 'short_text', label: 'Text Input' },
  { value: 'long_text', label: 'Paragraph' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'dropdown', label: 'Single Select' },
  { value: 'radio', label: 'Radio Group' },
  { value: 'checkbox', label: 'Multi Select' },
];

export default function FormCanvas({
  fields,
  onChange,
  onRemove,
  onEditAdvanced
}: {
  fields: CanvasField[];
  onChange: (next: CanvasField[]) => void;
  onRemove: (id: string) => void;
  onEditAdvanced?: (id: string) => void;
}) {
  const [extrasOpen, setExtrasOpen] = useState<Record<string, { description: boolean; placeholder: boolean; image: boolean }>>({});

  const update = (id: string, patch: Partial<CanvasField>) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const addOption = (id: string) => {
    const f = fields.find((x) => x.id === id);
    if (!f) return;
    const opts = [...(f.options || []), `Option ${((f.options || []).length + 1)}`];
    update(id, { options: opts });
  };

  const removeOption = (id: string, index: number) => {
    const f = fields.find((x) => x.id === id);
    if (!f || !f.options) return;
    const opts = f.options.filter((_, i) => i !== index);
    update(id, { options: opts });
  };

  const moveOption = (id: string, index: number, direction: 'up' | 'down') => {
    const f = fields.find((x) => x.id === id);
    if (!f || !f.options) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= f.options.length) return;
    const opts = [...f.options];
    [opts[index], opts[newIndex]] = [opts[newIndex], opts[index]];
    update(id, { options: opts });
  };

  const moveField = (id: string, direction: 'up' | 'down') => {
    const idx = fields.findIndex((f) => f.id === id);
    if (idx < 0) return;
    const newIndex = direction === 'up' ? idx - 1 : idx + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const next = [...fields];
    [next[idx], next[newIndex]] = [next[newIndex], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {fields.map((f, index) => (
        <div key={f.id} className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm font-medium text-gray-700">Question {index + 1}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => moveField(f.id, 'up')} disabled={index === 0}>↑</Button>
              <Button variant="outline" size="sm" onClick={() => moveField(f.id, 'down')} disabled={index === fields.length - 1}>↓</Button>
              {onEditAdvanced && (
                <Button variant="outline" size="sm" onClick={() => onEditAdvanced(f.id)}>Edit Advanced</Button>
              )}
              <Button variant="outline" size="sm" onClick={() => onRemove(f.id)}>Remove</Button>
            </div>
          </div>

          {/* Main row: prominent label on left, compact type on right */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Label</label>
              <Input value={f.label} onChange={(e) => update(f.id, { label: e.target.value })} placeholder="Enter question text" />
            </div>
            <div className="w-48">
              <label className="block text-xs font-medium text-gray-600 mb-1 text-right">Field Type</label>
              <select
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                value={f.type}
                onChange={(e) => {
                  const nextType = e.target.value;
                  const patch: Partial<CanvasField> = { type: nextType };
                  if (['dropdown', 'radio', 'checkbox'].includes(nextType)) {
                    patch.options = f.options && f.options.length > 0 ? f.options : ['Option 1'];
                    if (nextType !== 'dropdown') patch.multiple = false;
                  } else {
                    patch.options = undefined;
                    patch.multiple = false;
                  }
                  update(f.id, patch);
                }}
                required
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Code is intentionally hidden from the UI. It is handled by backend/model. */}

          {/* Optional controls toggles */}
          <div className="text-xs text-blue-600 flex items-center gap-4 mb-2">
            <button type="button" className="hover:underline" onClick={() => setExtrasOpen((prev) => ({ ...prev, [f.id]: { description: !(prev[f.id]?.description), placeholder: !!prev[f.id]?.placeholder, image: !!prev[f.id]?.image } }))}>{(extrasOpen[f.id]?.description || !!f.helpText) ? 'Hide description' : 'Add description'}</button>
            {['short_text','long_text','email','number','date','time'].includes(f.type) && (
              <button type="button" className="hover:underline" onClick={() => setExtrasOpen((prev) => ({ ...prev, [f.id]: { description: !!prev[f.id]?.description, placeholder: !(prev[f.id]?.placeholder), image: !!prev[f.id]?.image } }))}>{(extrasOpen[f.id]?.placeholder || !!f.placeholder) ? 'Hide placeholder' : 'Add placeholder'}</button>
            )}
            <button type="button" className="hover:underline" onClick={() => setExtrasOpen((prev) => ({ ...prev, [f.id]: { description: !!prev[f.id]?.description, placeholder: !!prev[f.id]?.placeholder, image: !(prev[f.id]?.image) } }))}>{(extrasOpen[f.id]?.image || !!f.imageUrl) ? 'Hide image' : 'Add image'}</button>
          </div>

          {(extrasOpen[f.id]?.description || !!f.helpText) && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <Input value={f.helpText || ''} onChange={(e) => update(f.id, { helpText: e.target.value })} placeholder="Helper text for respondents" />
            </div>
          )}

          {(extrasOpen[f.id]?.placeholder || !!f.placeholder) && ['short_text','long_text','email','number','date','time'].includes(f.type) && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder (optional)</label>
              <Input value={f.placeholder || ''} onChange={(e) => update(f.id, { placeholder: e.target.value })} placeholder="e.g., Type your answer here..." />
            </div>
          )}

          {(extrasOpen[f.id]?.image || !!f.imageUrl) && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
              <Input value={f.imageUrl || ''} onChange={(e) => update(f.id, { imageUrl: e.target.value })} placeholder="https://..." />
              {f.imageUrl ? (
                <div className="mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.imageUrl} alt="Field image" className="max-h-40 rounded border" />
                </div>
              ) : null}
            </div>
          )}

          <div className="mt-3 flex items-center gap-4">
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={!!f.required} onChange={(e) => update(f.id, { required: e.target.checked })} /> Required
            </label>
            {f.type === 'dropdown' && (
              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={!!f.multiple} onChange={(e) => update(f.id, { multiple: e.target.checked })} /> Allow multiple
              </label>
            )}
          </div>

          {['dropdown', 'radio', 'checkbox'].includes(f.type) && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Options</div>
              <div className="space-y-2">
                {(f.options || []).map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={o} onChange={(e) => {
                      const opts = [...(f.options || [])];
                      opts[i] = e.target.value;
                      update(f.id, { options: opts });
                    }} />
                    <Button variant="outline" size="sm" onClick={() => moveOption(f.id, i, 'up')} disabled={i === 0}>↑</Button>
                    <Button variant="outline" size="sm" onClick={() => moveOption(f.id, i, 'down')} disabled={i === (f.options?.length || 0) - 1}>↓</Button>
                    <Button variant="outline" size="sm" onClick={() => removeOption(f.id, i)}>×</Button>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={() => addOption(f.id)}>Add option</Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}



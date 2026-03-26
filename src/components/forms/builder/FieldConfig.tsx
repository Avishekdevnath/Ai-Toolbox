"use client";
import { Plus, Trash2 } from 'lucide-react';
import { FormField, FormType } from '@/types/forms';

interface FieldConfigProps {
  field: FormField | null;
  formType: FormType;
  onUpdateField: (id: string, updates: Partial<FormField>) => void;
}

export default function FieldConfig({ field, formType, onUpdateField }: FieldConfigProps) {
  if (!field) {
    return (
      <div className="flex items-center justify-center h-48 text-[13px] text-slate-400 text-center px-6">
        Select a field in the canvas to configure it
      </div>
    );
  }

  const isChoice = ['dropdown', 'radio', 'checkbox'].includes(field.type);
  const isQuiz = formType === 'quiz';
  const isSection = field.type === 'section';

  const update = (updates: Partial<FormField>) => onUpdateField(field.id, updates);

  return (
    <div className="p-4 space-y-4">
      {/* Label */}
      {!isSection && (
        <div>
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Label</label>
          <input
            value={field.label}
            onChange={(e) => update({ label: e.target.value })}
            placeholder="Field label"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      )}

      {/* Section label */}
      {isSection && (
        <div>
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Section Title</label>
          <input
            value={field.label}
            onChange={(e) => update({ label: e.target.value })}
            placeholder="Section title"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      )}

      {/* Placeholder */}
      {!isSection && !isChoice && field.type !== 'date' && field.type !== 'time' && (
        <div>
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Placeholder</label>
          <input
            value={field.placeholder}
            onChange={(e) => update({ placeholder: e.target.value })}
            placeholder="Placeholder text"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      )}

      {/* Help text */}
      {!isSection && (
        <div>
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Help Text</label>
          <input
            value={field.helpText}
            onChange={(e) => update({ helpText: e.target.value })}
            placeholder="Optional helper text"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      )}

      {/* Required toggle */}
      {!isSection && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-slate-700">Required</p>
            <p className="text-[11px] text-slate-400">Respondents must answer this</p>
          </div>
          <button
            onClick={() => update({ required: !field.required })}
            className={`relative w-10 h-5 rounded-full transition-colors ${field.required ? 'bg-blue-600' : 'bg-slate-200'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${field.required ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      )}

      {/* Options editor (choice fields) */}
      {isChoice && (
        <div>
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Options</label>
          <div className="mt-2 space-y-1.5">
            {field.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  value={opt}
                  onChange={(e) => {
                    const opts = [...field.options];
                    opts[idx] = e.target.value;
                    update({ options: opts });
                  }}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  onClick={() => update({ options: field.options.filter((_, i) => i !== idx) })}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button
              onClick={() => update({ options: [...field.options, `Option ${field.options.length + 1}`] })}
              className="flex items-center gap-1.5 text-[13px] text-blue-600 hover:text-blue-700 mt-1"
            >
              <Plus size={13} /> Add option
            </button>
          </div>
        </div>
      )}

      {/* Quiz config */}
      {isQuiz && !isSection && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Quiz Settings</p>
          <div>
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Points</label>
            <input
              type="number"
              min={0}
              value={field.quiz.points}
              onChange={(e) => update({ quiz: { ...field.quiz, points: Number(e.target.value) } })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          {isChoice && (
            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Correct Answer(s)</label>
              <div className="mt-1 space-y-1">
                {field.options.map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-[13px] text-slate-600 cursor-pointer">
                    <input
                      type={field.type === 'checkbox' ? 'checkbox' : 'radio'}
                      checked={field.quiz.correctOptions.includes(opt)}
                      onChange={() => {
                        const current = field.quiz.correctOptions;
                        const next = field.type === 'checkbox'
                          ? current.includes(opt) ? current.filter(o => o !== opt) : [...current, opt]
                          : [opt];
                        update({ quiz: { ...field.quiz, correctOptions: next } });
                      }}
                      className="rounded"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Explanation</label>
            <textarea
              value={field.quiz.explanation}
              onChange={(e) => update({ quiz: { ...field.quiz, explanation: e.target.value } })}
              placeholder="Shown after submission"
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}

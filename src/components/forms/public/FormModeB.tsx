"use client";
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { FormSchema } from '@/types/forms';
import FormFieldComponent from './FormField';

export interface QuizResult {
  score: number;
  maxScore: number;
  breakdown: { label: string; correct: boolean; explanation?: string }[];
}

interface FormModeBProps {
  schema: FormSchema;
  identityData: Record<string, string>;
  onSubmitSuccess: (responseId: string, quizResult?: QuizResult) => void;
}

export default function FormModeB({ schema, identityData, onSubmitSuccess }: FormModeBProps) {
  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const requiredFields = schema.fields.filter(f => f.required && f.type !== 'section');
  const filledRequired = requiredFields.filter(f => {
    const v = values[f.id];
    return Array.isArray(v) ? v.length > 0 : !!v;
  });
  const progress = requiredFields.length === 0 ? 100 : Math.round((filledRequired.length / requiredFields.length) * 100);

  const validateField = (fieldId: string, value: string | string[]): string => {
    const field = schema.fields.find(f => f.id === fieldId);
    if (!field || !field.required || field.type === 'section') return '';
    if (Array.isArray(value)) return value.length === 0 ? 'This field is required' : '';
    return !value ? 'This field is required' : '';
  };

  const handleBlur = (fieldId: string) => {
    const error = validateField(fieldId, values[fieldId] ?? '');
    setErrors(prev => ({ ...prev, [fieldId]: error }));
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    schema.fields.forEach(f => {
      const error = validateField(f.id, values[f.id] ?? '');
      if (error) newErrors[f.id] = error;
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/forms/${schema._id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.entries(values).map(([fieldId, value]) => ({ fieldId, value })),
          responder: identityData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSubmitSuccess(data.responseId ?? '', data.quizResult ?? undefined);
      } else {
        setSubmitError('Submission failed. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 h-1 bg-slate-100">
        <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-[640px] mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-800">{schema.title}</h1>
          {schema.description && (
            <p className="mt-2 text-[14px] text-slate-500 leading-relaxed whitespace-pre-wrap">
              {schema.description}
            </p>
          )}
        </div>

        <div className="space-y-6">
          {schema.fields.map(field => (
            <FormFieldComponent
              key={field.id}
              field={field}
              value={values[field.id] ?? (field.type === 'checkbox' ? [] : '')}
              error={errors[field.id]}
              onChange={(v) => setValues(prev => ({ ...prev, [field.id]: v }))}
              onBlur={() => handleBlur(field.id)}
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-8 w-full sm:w-auto sm:px-8 h-12 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Submit
        </button>
        {submitError && <p className="mt-2 text-[13px] text-red-500 text-center">{submitError}</p>}
      </div>
    </div>
  );
}

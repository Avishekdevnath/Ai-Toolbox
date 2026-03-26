"use client";
import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { FormSchema, FormField } from '@/types/forms';
import FormFieldComponent from './FormField';
import { QuizResult } from './FormModeB';

interface FormModeCProps {
  schema: FormSchema;
  identityData: Record<string, string>;
  onSubmitSuccess: (responseId: string, quizResult?: QuizResult) => void;
}

function splitIntoSections(fields: FormField[]): FormField[][] {
  const sections: FormField[][] = [[]];
  for (const field of fields) {
    if (field.type === 'section') {
      sections.push([field]);
    } else {
      sections[sections.length - 1].push(field);
    }
  }
  return sections.filter(s => s.length > 0);
}

export default function FormModeC({ schema, identityData, onSubmitSuccess }: FormModeCProps) {
  const sections = useMemo(() => splitIntoSections(schema.fields), [schema.fields]);
  const [currentSection, setCurrentSection] = useState(0);
  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const isLast = currentSection === sections.length - 1;

  const validateSection = (): boolean => {
    const section = sections[currentSection];
    const newErrors: Record<string, string> = {};
    section.forEach(f => {
      if (!f.required || f.type === 'section') return;
      const v = values[f.id];
      if (Array.isArray(v) ? v.length === 0 : !v) {
        newErrors[f.id] = 'This field is required';
      }
    });
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateSection()) return;
    setDirection(1);
    setCurrentSection(s => s + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentSection(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!validateSection()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/forms/${schema._id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: values, identity: identityData }),
      });
      const data = await res.json();
      if (data.success) onSubmitSuccess(data.responseId ?? '', data.quizResult ?? undefined);
    } catch {
      // leave for retry
    } finally {
      setSubmitting(false);
    }
  };

  const section = sections[currentSection];

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 h-1 bg-slate-100">
        <div className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }} />
      </div>

      <div className="max-w-[640px] mx-auto px-4 py-10">
        <div className="mb-2">
          <h1 className="text-2xl font-semibold text-slate-800">{schema.title}</h1>
          {schema.description && (
            <p className="mt-2 text-[14px] text-slate-500 leading-relaxed whitespace-pre-wrap">
              {schema.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 mb-8">
          <span className="text-[13px] text-slate-500">Step {currentSection + 1} of {sections.length}</span>
          <div className="flex gap-1 ml-2">
            {sections.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentSection ? 'w-6 bg-blue-600' : i < currentSection ? 'w-3 bg-blue-300' : 'w-3 bg-slate-200'}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSection}
            custom={direction}
            initial={{ opacity: 0, x: direction * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {section.map(field => (
              <FormFieldComponent
                key={field.id}
                field={field}
                value={values[field.id] ?? (field.type === 'checkbox' ? [] : '')}
                error={errors[field.id]}
                onChange={(v) => setValues(prev => ({ ...prev, [field.id]: v }))}
                onBlur={() => {
                  if (field.required && field.type !== 'section') {
                    const v = values[field.id];
                    const error = (Array.isArray(v) ? v.length === 0 : !v) ? 'This field is required' : '';
                    setErrors(prev => ({ ...prev, [field.id]: error }));
                  }
                }}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentSection === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} /> Back
          </button>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-colors"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              Submit
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

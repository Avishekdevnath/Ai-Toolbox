'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { FormSchema } from '@/types/forms';

interface IdentityGateProps {
  schema: FormSchema;
  onComplete: (data: Record<string, string>) => void;
}

export default function IdentityGate({ schema, onComplete }: IdentityGateProps) {
  const [identity, setIdentity] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const { requireName, requireEmail, requireStudentId } = schema.settings.identitySchema;

  const handleSubmit = () => {
    const missing: string[] = [];
    if (requireName && !identity.name?.trim()) missing.push('name');
    if (requireEmail && !identity.email?.trim()) missing.push('email');
    if (requireStudentId && !identity.studentId?.trim()) missing.push('studentId');
    if (missing.length > 0) {
      setErrors(missing);
      return;
    }
    setSubmitting(true);
    onComplete(identity);
  };

  const inputClass = (field: string) =>
    `w-full rounded-xl border px-4 py-3 text-[14px] text-slate-700 focus:outline-none focus:ring-2 transition-colors ${
      errors.includes(field)
        ? 'border-red-400 focus:ring-red-200'
        : 'border-slate-200 focus:ring-blue-200 focus:border-blue-400'
    }`;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-1">Form</p>
        <h1 className="text-xl font-semibold text-slate-800 mb-1">{schema.title}</h1>
        {schema.description && <p className="text-[13px] text-slate-500 mb-6">{schema.description}</p>}
        <hr className="border-slate-100 mb-6" />

        <div className="space-y-4">
          {requireName && (
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={identity.name ?? ''}
                onChange={(e) => setIdentity(p => ({ ...p, name: e.target.value }))}
                placeholder="Your full name"
                className={inputClass('name')}
              />
              {errors.includes('name') && <p className="mt-1 text-[12px] text-red-500">Full name is required</p>}
            </div>
          )}
          {requireEmail && (
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={identity.email ?? ''}
                onChange={(e) => setIdentity(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                className={inputClass('email')}
              />
              {errors.includes('email') && <p className="mt-1 text-[12px] text-red-500">Email address is required</p>}
            </div>
          )}
          {requireStudentId && (
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1">
                Student ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={identity.studentId ?? ''}
                onChange={(e) => setIdentity(p => ({ ...p, studentId: e.target.value }))}
                placeholder="Your student ID"
                className={inputClass('studentId')}
              />
              {errors.includes('studentId') && <p className="mt-1 text-[12px] text-red-500">Student ID is required</p>}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-6 w-full h-11 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
          Start Form →
        </button>

        <p className="mt-3 text-center text-[11px] text-slate-400">
          Your info is only shared with the form owner
        </p>
      </div>
    </div>
  );
}

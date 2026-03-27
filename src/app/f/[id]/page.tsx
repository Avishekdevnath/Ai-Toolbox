"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import PublicFormShell from '@/components/forms/public/PublicFormShell';
import { FormSchema } from '@/types/forms';

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schema, setSchema] = useState<FormSchema | null>(null);

  useEffect(() => {
    fetch(`/api/forms/${formId}/schema`)
      .then(res => {
        if (!res.ok) throw new Error(
          res.status === 404
            ? "This form doesn't exist or has been removed."
            : "This form is not currently available."
        );
        return res.json();
      })
      .then(data => {
        if (data.success && data.data) {
          setSchema({ ...data.data, _id: data.data._id || data.data.id, settings: { displayMode: 'all', ...data.data.settings } });
        } else {
          setError(data.error || "Failed to load form");
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [formId]);

  useEffect(() => {
    if (schema) document.title = schema.title;
  }, [schema]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
    </div>
  );

  if (error || !schema) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
        <h2 className="font-semibold text-slate-800 mb-1">Form unavailable</h2>
        <p className="text-[14px] text-slate-500">{error}</p>
      </div>
    </div>
  );

  return <PublicFormShell schema={schema} />;
}

"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import PublicFormRenderer from '@/components/forms/PublicFormRenderer';

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formSchema, setFormSchema] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFormSchema = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/forms/${formId}/schema`, { cache: 'no-store' });
        
        if (!res.ok) {
          if (res.status === 404) {
            setError("This form doesn't exist or has been removed.");
          } else if (res.status === 403) {
            setError("This form is not currently available.");
          } else {
            setError("An error occurred while loading this form.");
          }
          return;
        }
        
        const data = await res.json();
        if (data.success && data.data) {
          setFormSchema(data.data);
        } else {
          setError(data.error || "Failed to load form");
        }
      } catch (err) {
        console.error("Error fetching form schema:", err);
        setError("An error occurred while loading this form.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchFormSchema();
  }, [formId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-black dark:text-white" />
          <p className="text-gray-700 dark:text-gray-300">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
          <button
            className="mt-6 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md"
            onClick={() => router.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <PublicFormRenderer schema={{ ...formSchema }} />;
}
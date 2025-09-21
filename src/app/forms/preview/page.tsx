"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import FormRenderer from '@/components/forms/FormRenderer';

export default function FormPreview() {
  const router = useRouter();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Get the form data from localStorage
      const storedData = localStorage.getItem('form_preview_data');
      if (!storedData) {
        setError('No form data found for preview');
        setLoading(false);
        return;
      }

      // Parse the stored form data
      const parsedData = JSON.parse(storedData);
      setFormData(parsedData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading form preview data:', err);
      setError('Failed to load form preview data');
      setLoading(false);
    }
  }, []);

  // Handle going back to editor
  const handleBack = () => {
    window.close(); // Close preview tab
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            className="mt-6 px-4 py-2 bg-black text-white rounded-md"
            onClick={handleBack}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview header */}
      <header className="bg-black text-white shadow-sm py-3 px-4 mb-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={handleBack}
                className="p-1.5 hover:bg-gray-800 rounded-full mr-2"
                type="button"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-lg font-medium">Form Preview</h1>
                <p className="text-xs text-gray-300">This is a preview of how your form will appear to users</p>
              </div>
            </div>
            <div className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
              PREVIEW MODE
            </div>
          </div>
        </div>
      </header>

      {/* Form Preview */}
      <div className="container mx-auto pb-16 px-4">
        {formData && (
          <FormRenderer 
            formSchema={{
              id: "preview",
              title: formData.title,
              description: formData.description,
              type: formData.type,
              fields: formData.fields,
              settings: formData.settings
            }}
            formId="preview"
          />
        )}
      </div>
    </div>
  );
}

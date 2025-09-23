'use client';

import { X, User } from 'lucide-react';

interface FormField {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
}

interface FormResponse {
  _id: string;
  formId: string;
  data: Record<string, any>;
  createdAt: string;
  identity?: {
    name?: string;
    email?: string;
    studentId?: string;
  };
  submittedAt?: string;
  startedAt?: string;
  durationMs?: number;
  responder?: any;
}

interface ViewResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: FormResponse | null;
  formFields: FormField[];
}

export default function ViewResponseModal({ 
  isOpen, 
  onClose, 
  response, 
  formFields 
}: ViewResponseModalProps) {
  if (!isOpen || !response) return null;

  const formatValue = (value: any, fieldType: string) => {
    if (value === null || value === undefined || value === '') {
      return 'No response';
    }
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    if (fieldType === 'date') {
      return new Date(value).toLocaleDateString();
    }
    
    if (fieldType === 'datetime') {
      return new Date(value).toLocaleString();
    }
    
    return String(value);
  };

  const getFieldLabel = (fieldId: string) => {
    const field = formFields.find(f => f.id === fieldId);
    return field?.label || fieldId;
  };

  const getFieldType = (fieldId: string) => {
    const field = formFields.find(f => f.id === fieldId);
    return field?.type || 'text';
  };


  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-100 rounded-md">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Response Details</h2>
              <p className="text-xs text-gray-500">
                Submitted on {new Date(response.submittedAt || response.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Identity Information */}
            {response.identity && (response.identity.name || response.identity.email) && (
              <div className="bg-gray-50 rounded-md p-3">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-1.5 text-gray-600" />
                  Respondent Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {response.identity.name && (
                    <div className="flex">
                      <div className="w-20 text-xs font-medium text-gray-600">Name:</div>
                      <div className="text-xs text-gray-900">{response.identity.name}</div>
                    </div>
                  )}
                  {response.identity.email && (
                    <div className="flex">
                      <div className="w-20 text-xs font-medium text-gray-600">Email:</div>
                      <div className="text-xs text-gray-900">{response.identity.email}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Responses */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Form Responses</h3>
              <div className="space-y-2">
                {Object.entries(response.data).map(([fieldId, value]) => (
                  <div key={fieldId} className="border border-gray-200 rounded-md p-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="md:col-span-1">
                        <div className="text-xs font-medium text-gray-600 mb-1">
                          {getFieldLabel(fieldId)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getFieldType(fieldId).replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-xs text-gray-900 whitespace-pre-wrap">
                          {formatValue(value, getFieldType(fieldId))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 p-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

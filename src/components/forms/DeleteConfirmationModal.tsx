'use client';

import { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

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

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  response: FormResponse | null;
  isDeleting?: boolean;
}

export default function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  response,
  isDeleting = false
}: DeleteConfirmationModalProps) {
  if (!isOpen || !response) return null;

  const getResponseIdentifier = () => {
    if (response.identity?.name) {
      return response.identity.name;
    }
    if (response.identity?.email) {
      return response.identity.email;
    }
    return `Response ${response._id.slice(-8)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-red-100 rounded-md">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Delete Response</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <Trash2 className="w-4 h-4 text-red-500 mt-0.5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-700">
                  Are you sure you want to delete the response from{' '}
                  <span className="font-medium text-gray-900">
                    {getResponseIdentifier()}
                  </span>?
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  This action cannot be undone. All response data will be permanently removed.
                </p>
              </div>
            </div>

            {/* Response Details */}
            <div className="bg-gray-50 rounded-md p-2">
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Submitted:</span>
                  <span>{new Date(response.submittedAt || response.createdAt).toLocaleString()}</span>
                </div>
                {response.identity?.name && (
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span className="truncate ml-2">{response.identity.name}</span>
                  </div>
                )}
                {response.identity?.email && (
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="truncate ml-2">{response.identity.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 p-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            {isDeleting ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3 h-3" />
                <span>Delete Response</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

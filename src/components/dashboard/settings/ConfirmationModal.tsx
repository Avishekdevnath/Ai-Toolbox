'use client';

import React from 'react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}: ConfirmationModalProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-6 h-6 text-red-600" />,
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          border: 'border-red-200',
          bg: 'bg-red-50'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          border: 'border-yellow-200',
          bg: 'bg-yellow-50'
        };
      case 'info':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-blue-600" />,
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
          border: 'border-blue-200',
          bg: 'bg-blue-50'
        };
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          border: 'border-red-200',
          bg: 'bg-red-50'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      showCloseButton={true}
      closeOnOverlayClick={!isLoading}
    >
      <div className="space-y-4">
        {/* Warning Icon and Message */}
        <div className={`flex items-start gap-3 p-4 rounded-lg border ${styles.border} ${styles.bg}`}>
          <div className="flex-shrink-0 mt-0.5">
            {styles.icon}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            className={styles.confirmButton}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
} 
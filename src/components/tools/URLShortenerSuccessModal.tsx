'use client';

import { useEffect } from 'react';
import { generateQRCodeUrl, copyToClipboard, shareUrl } from '@/lib/urlShortenerClient';
import type { DisplayUrl } from './types';

interface URLShortenerSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: DisplayUrl | null;
  onCopySuccess: () => void;
  onCopyError: (message: string) => void;
  onShareSuccess: () => void;
}

export default function URLShortenerSuccessModal({
  isOpen,
  onClose,
  url,
  onCopySuccess,
  onCopyError,
  onShareSuccess
}: URLShortenerSuccessModalProps) {
  if (!isOpen || !url) return null;

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus trap: prevent focus from leaving modal
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (firstElement) firstElement.focus();
      
      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleTabKey);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    const success = await copyToClipboard(url.shortenedUrl);
    if (success) {
      onCopySuccess();
    } else {
      onCopyError('Failed to copy URL');
    }
  };

  const handleShare = async () => {
    const success = await shareUrl(url.shortenedUrl, 'Check out this shortened link');
    if (success) {
      onShareSuccess();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <span className="text-green-600 dark:text-green-400 text-xl">✅</span>
          </div>
          <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            URL Shortened Successfully!
          </h3>
          <p id="modal-description" className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Your shortened URL is ready to use
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="space-y-4">
          {/* Original URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Original URL
            </label>
            <div className="text-sm text-gray-600 dark:text-gray-400 break-all bg-gray-50 dark:bg-gray-700 p-2 rounded">
              {url.originalUrl}
            </div>
          </div>

          {/* Shortened URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Shortened URL
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={url.shortenedUrl}
                readOnly
                className="flex-1 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center">
            <img
              src={generateQRCodeUrl(url.shortenedUrl, 150)}
              alt="QR Code"
              className="mx-auto border border-gray-200 dark:border-gray-600 rounded"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Scan to open on mobile
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleShare}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
            >
              Share
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
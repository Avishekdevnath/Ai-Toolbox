'use client';

import { useState } from 'react';
import { DisplayUrl } from './URLShortenerTool';
import { copyToClipboard, shareUrl, generateQRCodeUrl } from '@/lib/urlShortenerService';

interface URLSuccessModalProps {
  recentUrl: DisplayUrl | null;
  onClose: () => void;
  onCopy: (text: string) => void;
  onShare: (url: string) => void;
  onDelete: (urlId: string) => void;
  isAuthenticated?: boolean;
}

export default function URLSuccessModal({ 
  recentUrl, 
  onClose, 
  onCopy, 
  onShare, 
  onDelete,
  isAuthenticated = false
}: URLSuccessModalProps) {
  if (!recentUrl) return null;

  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      onCopy(text);
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async (url: string) => {
    const success = await shareUrl(url, 'Check out this shortened link');
    if (success) {
      onShare(url);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this URL?')) {
      onDelete(recentUrl._id!);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  URL Created!
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ready to share
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          {/* Shortened URL */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
              Your Shortened URL
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={recentUrl.shortenedUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md text-blue-600 dark:text-blue-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleCopy(recentUrl.shortenedUrl)}
                className={`px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium flex items-center space-x-2 ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                title={copied ? "Copied!" : "Copy to clipboard"}
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Original URL */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
              Original URL
            </label>
            <div className="text-sm text-gray-600 dark:text-gray-400 break-all bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
              {recentUrl.originalUrl}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => window.open(recentUrl.shortenedUrl, '_blank')}
              className="flex items-center justify-center space-x-2 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>Visit</span>
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center justify-center space-x-2 py-2 px-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span>QR Code</span>
            </button>
          </div>

          {/* QR Code */}
          {showQR && (
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <img
                src={generateQRCodeUrl(recentUrl.shortenedUrl)}
                alt="QR Code"
                className="mx-auto max-w-[150px] h-auto"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Scan to visit
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleCopy(recentUrl.shortenedUrl)}
                className={`p-1 transition-colors ${
                  copied 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title={copied ? "Copied!" : "Copy again"}
              >
                {copied ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleDelete}
                className="text-red-400 hover:text-red-600 dark:hover:text-red-300 p-1"
                title="Delete URL"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(recentUrl.createdAt).toLocaleString()}
            </div>
          </div>

          {/* Pro Tip for non-authenticated users */}
          {!isAuthenticated && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                💡 <strong>Pro Tip:</strong> Bookmark this page to manage all your URLs
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

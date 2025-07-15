'use client';

import { useState, useEffect } from 'react';
import { 
  createShortenedUrl, 
  getShortenedUrls, 
  deleteShortenedUrl, 
  copyToClipboard,
  shareUrl,
  generateQRCodeUrl
} from '@/lib/urlShortenerService';
import { ShortenedUrl } from '@/lib/urlShortenerUtils';

interface DisplayUrl extends ShortenedUrl {
  shortenedUrl: string;
  isExpired?: boolean;
}

export default function URLShortenerTool() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(undefined);
  const [shortenedUrls, setShortenedUrls] = useState<DisplayUrl[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUrls, setIsLoadingUrls] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showQR, setShowQR] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('http://localhost:3000');

  // Load existing URLs on component mount
  useEffect(() => {
    loadShortenedUrls();
    // Set base URL safely
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const loadShortenedUrls = async () => {
    try {
      setIsLoadingUrls(true);
      const response = await getShortenedUrls({ limit: 20, activeOnly: false });
      console.log('Loaded URLs:', response.data.length, 'URLs');
      setShortenedUrls(response.data);
    } catch (err) {
      console.error('Failed to load URLs:', err);
      setError('Failed to load existing URLs');
    } finally {
      setIsLoadingUrls(false);
    }
  };

  const shortenUrl = async () => {
    if (!originalUrl.trim()) {
      setError('Please enter a URL to shorten');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await createShortenedUrl({
        originalUrl: originalUrl.trim(),
        customAlias: customAlias.trim() || undefined,
        expiresInDays: expiresInDays || undefined
      });

      setShortenedUrls(prev => [response.data, ...prev]);
      setOriginalUrl('');
      setCustomAlias('');
      setExpiresInDays(undefined);
      setSuccess('URL shortened successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to shorten URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setSuccess('URL copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Failed to copy URL');
    }
  };

  const handleShareUrl = async (url: string) => {
    const success = await shareUrl(url, 'Check out this shortened link');
    if (success) {
      setSuccess('URL shared successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDeleteUrl = async (urlId: string) => {
    if (!confirm('Are you sure you want to delete this URL?')) return;

    try {
      await deleteShortenedUrl(urlId);
      setShortenedUrls(prev => prev.filter(url => url._id !== urlId));
      setSuccess('URL deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete URL');
    }
  };

  const handleUrlClick = async (url: DisplayUrl) => {
    // Refresh the URL list to get updated click count
    setTimeout(() => {
      loadShortenedUrls();
    }, 1000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Error and Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          <button
            onClick={() => setError('')}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-xs mt-2"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-800 dark:text-green-200 text-sm">{success}</p>
          <button
            onClick={() => setSuccess('')}
            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 text-xs mt-2"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter URL to Shorten
            </label>
            <input
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://example.com/very-long-url"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Alias (Optional)
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm rounded-l-md">
                {baseUrl}/r/
              </span>
              <input
                type="text"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                placeholder="my-link"
                maxLength={20}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Leave empty for auto-generated alias (letters, numbers, hyphens, and underscores only)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Expiration (Optional)
            </label>
            <select
              value={expiresInDays || ''}
              onChange={(e) => setExpiresInDays(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Never expire</option>
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
          </div>

          <button
            onClick={shortenUrl}
            disabled={!originalUrl.trim() || isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Shortening...' : 'Shorten URL'}
          </button>

          {/* Features */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
              ✨ Features:
            </h3>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Custom aliases for branded links</li>
              <li>• Real click tracking and analytics</li>
              <li>• URL expiration dates</li>
              <li>• QR code generation</li>
              <li>• Easy sharing and copying</li>
              <li>• Persistent storage in database</li>
            </ul>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Shortened URLs ({shortenedUrls.length})
            </h3>
            <button
              onClick={loadShortenedUrls}
              disabled={isLoadingUrls}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
            >
              {isLoadingUrls ? 'Loading...' : '🔄 Refresh'}
            </button>
          </div>

          {isLoadingUrls ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading your URLs...</p>
            </div>
          ) : shortenedUrls.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <div className="text-6xl mb-4">🔗</div>
              <p>Your shortened URLs will appear here</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {shortenedUrls.map((url) => (
                <div 
                  key={url._id}
                  className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border ${
                    url.isExpired ? 'border-red-200 dark:border-red-800' : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Status Badge */}
                    {url.isExpired && (
                      <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                        ⚠️ EXPIRED
                      </div>
                    )}

                    {/* Shortened URL */}
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Shortened URL:</label>
                      <div className="flex items-center space-x-2">
                        <a
                          href={url.shortenedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-blue-600 dark:text-blue-400 font-mono text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          title="Click to visit shortened URL (opens in new tab)"
                          onClick={() => {
                            // Refresh the list after a short delay to show updated click count
                            setTimeout(() => loadShortenedUrls(), 1000);
                          }}
                        >
                          {url.shortenedUrl}
                        </a>
                        <div className="flex space-x-1">
                                      <button
              onClick={() => handleCopyToClipboard(url.shortenedUrl)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Copy to clipboard"
            >
              📋
            </button>
            <button
              onClick={() => loadShortenedUrls()}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Refresh click count"
            >
              🔄
            </button>
                          <button
                            onClick={() => handleShareUrl(url.shortenedUrl)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Share"
                          >
                            📤
                          </button>
                          <button
                            onClick={() => setShowQR(showQR === url.shortenedUrl ? null : url.shortenedUrl)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Show QR code"
                          >
                            📱
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* QR Code */}
                    {showQR === url.shortenedUrl && (
                      <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                        <img
                          src={generateQRCodeUrl(url.shortenedUrl)}
                          alt="QR Code"
                          className="mx-auto"
                        />
                      </div>
                    )}

                    {/* Original URL */}
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Original URL:</label>
                      <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {url.originalUrl}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>Created: {new Date(url.createdAt).toLocaleDateString()}</span>
                      <span>Clicks: {url.clicks}</span>
                      {url.expiresAt && (
                        <span>Expires: {new Date(url.expiresAt).toLocaleDateString()}</span>
                      )}
                      <button
                        onClick={() => handleDeleteUrl(url._id!)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Information */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          🔗 About URL Shortening:
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• <strong>Real URLs:</strong> These links actually redirect to the original URLs</li>
          <li>• <strong>Click Tracking:</strong> Real analytics with click counting</li>
          <li>• <strong>Custom Aliases:</strong> Create branded, memorable links</li>
          <li>• <strong>Expiration:</strong> Set automatic expiration dates for temporary links</li>
          <li>• <strong>QR Codes:</strong> Generate QR codes for easy mobile sharing</li>
        </ul>
      </div>
    </div>
  );
} 
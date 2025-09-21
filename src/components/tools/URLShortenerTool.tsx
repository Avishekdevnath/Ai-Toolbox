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
import { ShortenedUrl } from '@/schemas/urlShortenerSchema';
import URLSuccessModal from './URLSuccessModal';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

interface DisplayUrl extends ShortenedUrl {
  shortenedUrl: string;
  isExpired?: boolean;
}

interface Analytics {
  totalUrls: number;
  totalClicks: number;
  activeUrls: number;
  expiredUrls: number;
  averageClicks: number;
  topPerformingUrl?: DisplayUrl;
}

export default function URLShortenerTool() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(undefined);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [shortenedUrls, setShortenedUrls] = useState<DisplayUrl[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUrls, setIsLoadingUrls] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showQR, setShowQR] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('http://localhost:3000');
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'analytics'>('create');
  const [recentUrl, setRecentUrl] = useState<DisplayUrl | null>(null);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);
  
  // Get authentication state
  const { user } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!user;

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
      const response = await getShortenedUrls({ limit: 50, activeOnly: false });
      console.log('Loaded URLs:', response.data.length, 'URLs');
      setShortenedUrls(response.data);
      
      // Calculate analytics
      calculateAnalytics(response.data);
    } catch (err) {
      console.error('Failed to load URLs:', err);
      setError('Failed to load existing URLs');
    } finally {
      setIsLoadingUrls(false);
    }
  };

  const calculateAnalytics = (urls: DisplayUrl[]) => {
    const totalUrls = urls.length;
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
    const activeUrls = urls.filter(url => !url.isExpired).length;
    const expiredUrls = urls.filter(url => url.isExpired).length;
    const averageClicks = totalUrls > 0 ? Math.round(totalClicks / totalUrls) : 0;
    // Show the most recently created URL instead of highest performing
    const topPerformingUrl = urls.length > 0 ? urls[0] : undefined; // First URL is the most recent

    setAnalytics({
      totalUrls,
      totalClicks,
      activeUrls,
      expiredUrls,
      averageClicks,
      topPerformingUrl
    });
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
        expiresAt: expiresAt || undefined,
        expiresInDays: expiresAt ? undefined : (expiresInDays || undefined)
      });

      setShortenedUrls(prev => [response.data, ...prev]);
      setRecentUrl(response.data); // Show the recent URL modal
      setOriginalUrl('');
      setCustomAlias('');
      setExpiresInDays(undefined);
      setExpiresAt('');
      setSuccess('URL shortened successfully!');
      
      // Track usage
      fetch('/api/tools/url-shortener/track-usage', { method: 'POST' }).catch(err => {
        console.error('Usage tracking failed:', err);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to shorten URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async (text: string, urlId?: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      if (urlId) {
        setCopiedUrlId(urlId);
        setTimeout(() => setCopiedUrlId(null), 2000);
      }
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
      setShortenedUrls(prev => prev.filter(url => url._id?.toString() !== urlId));
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

  const handleCloseRecentUrl = () => {
    setRecentUrl(null);
  };

  const handleRecentUrlCopy = (text: string) => {
    setSuccess('URL copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleRecentUrlShare = (url: string) => {
    setSuccess('URL shared successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleRecentUrlDelete = async (urlId: string) => {
    try {
      await deleteShortenedUrl(urlId);
      setShortenedUrls(prev => prev.filter(url => url._id?.toString() !== urlId));
      setSuccess('URL deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      // Recalculate analytics
      const updatedUrls = shortenedUrls.filter(url => url._id?.toString() !== urlId);
      calculateAnalytics(updatedUrls);
    } catch (err: any) {
      setError(err.message || 'Failed to delete URL');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
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

      {/* Professional Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔗 Professional URL Shortener</h1>
            <p className="text-gray-600 dark:text-gray-400">Create, manage, and analyze your shortened links</p>
          </div>
          {analytics && (
            <div className="hidden md:flex space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.totalUrls}</div>
                <div className="text-xs text-gray-500">Total URLs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analytics.totalClicks}</div>
                <div className="text-xs text-gray-500">Total Clicks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analytics.averageClicks}</div>
                <div className="text-xs text-gray-500">Avg Clicks</div>
              </div>
            </div>
          )}
        </div>

        {/* Anonymous User Notice - Only show for non-authenticated users */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-yellow-600 dark:text-yellow-400 text-lg">🔐</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Anonymous Session
                </h3>
                <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>Your URLs are saved using your device fingerprint. They'll persist as long as you use the same browser.</p>
                  <p className="mt-2">
                    <strong>💡 Pro Tip:</strong> 
                    <a href="/sign-in" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
                      Sign up for free
                    </a> 
                    to access advanced features like unlimited URLs, detailed analytics, and cross-device sync!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Authenticated User Welcome */}
        {isAuthenticated && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-green-600 dark:text-green-400 text-lg">✅</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Welcome back, {user?.username || user?.email}!
                </h3>
                <div className="mt-1 text-sm text-green-700 dark:text-green-300">
                  <p>You're signed in and have access to all professional features including unlimited URLs, detailed analytics, and cross-device sync.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              ✨ Create Link
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              📊 Manage Links ({shortenedUrls.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              📈 Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'create' && (
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
                  {baseUrl}/
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
                <option value="">Lifetime (no expiration)</option>
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Or pick an exact expiration date & time below (takes precedence):
              </p>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white mt-2"
              />
            </div>

            <button
              onClick={shortenUrl}
              disabled={!originalUrl.trim() || isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? 'Creating...' : '✨ Create Shortened URL'}
            </button>

            {/* Features */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
                🚀 Professional Features:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
                <div className="flex items-center">
                  <span className="mr-2">✓</span> Custom branded aliases
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✓</span> Real-time click analytics
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✓</span> Flexible expiration dates
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✓</span> QR code generation
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✓</span> Link health monitoring
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✓</span> Professional dashboard
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📊 Quick Overview
              </h3>
              {analytics ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analytics.totalUrls}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total URLs</div>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analytics.totalClicks}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Clicks</div>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{analytics.activeUrls}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Active URLs</div>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{analytics.averageClicks}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Avg Clicks</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Loading analytics...</p>
                </div>
              )}
            </div>

            {analytics?.topPerformingUrl && (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
                  🔗 Latest Created Link
                </h3>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Short URL:</span>
                    <div className="text-blue-600 dark:text-blue-400 font-mono text-xs break-all">
                      {analytics.topPerformingUrl.shortenedUrl}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Clicks:</span>
                    <span className="text-green-600 font-bold ml-2">{analytics.topPerformingUrl.clicks}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      {new Date(analytics.topPerformingUrl.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              📊 Manage Your Links
            </h3>
            <button
              onClick={loadShortenedUrls}
              disabled={isLoadingUrls}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium"
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
              <p className="text-lg font-medium mb-2">No shortened URLs yet</p>
              <p className="text-sm">Create your first shortened URL to get started!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {shortenedUrls.map((url) => (
                <div 
                  key={url._id?.toString() || url.shortCode}
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
                        <div className="flex flex-wrap gap-x-2 gap-y-1 mt-2">
                          <button
                            onClick={() => handleCopyToClipboard(url.shortenedUrl, url._id?.toString())}
                            className={`transition-colors ${
                              copiedUrlId === url._id?.toString()
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                            title={copiedUrlId === url._id?.toString() ? "Copied!" : "Copy to clipboard"}
                          >
                            {copiedUrlId === url._id?.toString() ? (
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
                          className="mx-auto max-w-full h-auto"
                        />
                      </div>
                    )}

                    {/* Original URL */}
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Original URL:</label>
                      <div className="text-sm text-gray-700 dark:text-gray-300 truncate break-all max-w-full">
                        {url.originalUrl}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>Created: {new Date(url.createdAt).toLocaleString()}</span>
                      <span>Clicks: {url.clicks}</span>
                      {url.expiresAt && (
                        <span>Expires: {new Date(url.expiresAt).toLocaleString()}</span>
                      )}
                      <button
                        onClick={() => handleDeleteUrl(url._id?.toString()!)}
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
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            📈 Detailed Analytics
          </h3>
          
          {analytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total URLs */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <span className="text-white text-xl">🔗</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total URLs</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{analytics.totalUrls}</p>
                  </div>
                </div>
              </div>

              {/* Total Clicks */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <span className="text-white text-xl">👆</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Clicks</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{analytics.totalClicks}</p>
                  </div>
                </div>
              </div>

              {/* Active URLs */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <span className="text-white text-xl">✅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Active URLs</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{analytics.activeUrls}</p>
                  </div>
                </div>
              </div>

              {/* Average Clicks */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Avg Clicks</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{analytics.averageClicks}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading analytics...</p>
            </div>
          )}

          {/* Performance Insights */}
          {analytics && analytics.totalUrls > 0 && (
            <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                💡 Performance Insights
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Engagement Rate</h5>
                  <div className="text-3xl font-bold text-blue-600">
                    {analytics.totalUrls > 0 ? Math.round((analytics.totalClicks / analytics.totalUrls) * 100) / 100 : 0}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">clicks per URL</p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Active Rate</h5>
                  <div className="text-3xl font-bold text-green-600">
                    {analytics.totalUrls > 0 ? Math.round((analytics.activeUrls / analytics.totalUrls) * 100) : 0}%
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">URLs currently active</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Information */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          🔗 About Professional URL Shortening:
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• <strong>Real URLs:</strong> These links actually redirect to the original URLs</li>
          <li>• <strong>Advanced Analytics:</strong> Track clicks, engagement, and performance</li>
          <li>• <strong>Custom Aliases:</strong> Create branded, memorable links</li>
          <li>• <strong>Flexible Expiration:</strong> Set automatic expiration dates for temporary links</li>
          <li>• <strong>QR Codes:</strong> Generate QR codes for easy mobile sharing</li>
          <li>• <strong>Professional Dashboard:</strong> Monitor and manage all your links</li>
        </ul>
      </div>

      {/* URL Success Modal */}
      <URLSuccessModal
        recentUrl={recentUrl}
        onClose={handleCloseRecentUrl}
        onCopy={handleRecentUrlCopy}
        onShare={handleRecentUrlShare}
        onDelete={handleRecentUrlDelete}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
} 
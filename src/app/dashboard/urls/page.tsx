'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createShortenedUrl, 
  getShortenedUrls, 
  deleteShortenedUrl, 
  copyToClipboard,
  shareUrl,
  generateQRCodeUrl
} from '@/lib/urlShortenerService';
import { ShortenedUrl } from '@/schemas/urlShortenerSchema';
import UserPreferences from '@/components/tools/UserPreferences';

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

export default function UserUrlDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
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
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
    loadShortenedUrls();
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        router.push('/auth/signin');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/auth/signin');
    }
  };

  const loadShortenedUrls = async () => {
    try {
      setIsLoadingUrls(true);
      const response = await getShortenedUrls({ limit: 100, activeOnly: false });
      console.log('Loaded URLs:', response.data.length, 'URLs');
      setShortenedUrls(response.data);
      calculateAnalytics(response.data);
    } catch (err) {
      console.error('Failed to load URLs:', err);
      setError('Failed to load your URLs');
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
    const topPerformingUrl = urls.length > 0 ? urls[0] : undefined;

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
      setShortenedUrls(prev => prev.filter(url => url._id?.toString() !== urlId));
      setSuccess('URL deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      const updatedUrls = shortenedUrls.filter(url => url._id?.toString() !== urlId);
      calculateAnalytics(updatedUrls);
    } catch (err: any) {
      setError(err.message || 'Failed to delete URL');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUrls.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedUrls.length} URLs?`)) return;

    try {
      for (const urlId of selectedUrls) {
        await deleteShortenedUrl(urlId);
      }
      setShortenedUrls(prev => prev.filter(url => !selectedUrls.includes(url._id?.toString() || '')));
      setSelectedUrls([]);
      setShowBulkActions(false);
      setSuccess(`${selectedUrls.length} URLs deleted successfully!`);
      setTimeout(() => setSuccess(''), 3000);
      loadShortenedUrls(); // Reload to update analytics
    } catch (err: any) {
      setError(err.message || 'Failed to delete URLs');
    }
  };

  const handleBulkExport = () => {
    if (selectedUrls.length === 0) return;

    const selectedUrlData = shortenedUrls.filter(url => selectedUrls.includes(url._id?.toString() || ''));
    const csvContent = [
      ['Short URL', 'Original URL', 'Clicks', 'Created', 'Expires', 'Status'],
      ...selectedUrlData.map(url => [
        url.shortenedUrl,
        url.originalUrl,
        url.clicks.toString(),
        new Date(url.createdAt).toLocaleString(),
        url.expiresAt ? new Date(url.expiresAt).toLocaleString() : 'Never',
        url.isExpired ? 'Expired' : 'Active'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urls-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setSuccess(`Exported ${selectedUrls.length} URLs successfully!`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSelectUrl = (urlId: string) => {
    setSelectedUrls(prev => 
      prev.includes(urlId) 
        ? prev.filter(id => id !== urlId)
        : [...prev, urlId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUrls.length === shortenedUrls.length) {
      setSelectedUrls([]);
    } else {
      setSelectedUrls(shortenedUrls.map(url => url._id?.toString() || ''));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🔗 URL Management Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Welcome back, {user.name || user.email}! Manage your shortened URLs
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total URLs</div>
                <div className="text-2xl font-bold text-blue-600">{analytics?.totalUrls || 0}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Clicks</div>
                <div className="text-2xl font-bold text-green-600">{analytics?.totalClicks || 0}</div>
              </div>
              <button
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                ⚙️ Preferences
              </button>
            </div>
          </div>
        </div>

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

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              ✨ Create New URL
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              📊 Manage URLs ({shortenedUrls.length})
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

        {/* Tab Content */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Create New Short URL
              </h2>
              <div className="space-y-4">
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
                </div>

                <button
                  onClick={shortenUrl}
                  disabled={!originalUrl.trim() || isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isLoading ? 'Creating...' : '✨ Create Shortened URL'}
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Quick Overview
              </h2>
              {analytics ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analytics.totalUrls}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total URLs</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analytics.totalClicks}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{analytics.activeUrls}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Active URLs</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{analytics.averageClicks}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Clicks</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Loading analytics...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="space-y-6">
            {/* Bulk Actions */}
            {shortenedUrls.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUrls.length === shortenedUrls.length && shortenedUrls.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Select All ({selectedUrls.length} selected)
                      </span>
                    </label>
                  </div>
                  {selectedUrls.length > 0 && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleBulkExport}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        📤 Export ({selectedUrls.length})
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        🗑️ Delete ({selectedUrls.length})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* URL List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
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
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {shortenedUrls.map((url) => (
                    <div key={url._id?.toString() || url.shortCode} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedUrls.includes(url._id?.toString() || '')}
                            onChange={() => handleSelectUrl(url._id?.toString() || '')}
                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <a
                                href={url.shortenedUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 font-mono text-sm hover:underline"
                                onClick={() => {
                                  setTimeout(() => loadShortenedUrls(), 1000);
                                }}
                              >
                                {url.shortenedUrl}
                              </a>
                              <button
                                onClick={() => handleCopyToClipboard(url.shortenedUrl)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                title="Copy to clipboard"
                              >
                                📋
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
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {url.originalUrl}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>Clicks: {url.clicks}</span>
                              <span>Created: {new Date(url.createdAt).toLocaleString()}</span>
                              {url.expiresAt && (
                                <span>Expires: {new Date(url.expiresAt).toLocaleString()}</span>
                              )}
                              {url.isExpired && (
                                <span className="text-red-600 dark:text-red-400 font-medium">EXPIRED</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteUrl(url._id?.toString()!)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-4"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                      {showQR === url.shortenedUrl && (
                        <div className="mt-4 text-center">
                          <img
                            src={generateQRCodeUrl(url.shortenedUrl)}
                            alt="QR Code"
                            className="mx-auto max-w-[200px] h-auto"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              📈 Detailed Analytics
            </h2>
            
            {analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          </div>
        )}

        {/* User Preferences Modal */}
        {showPreferences && (
          <UserPreferences onClose={() => setShowPreferences(false)} />
        )}
      </div>
    </div>
  );
}

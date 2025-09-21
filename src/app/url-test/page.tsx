'use client';

import { useState } from 'react';

export default function URLTestPage() {
  const [originalUrl, setOriginalUrl] = useState('https://www.google.com/search?q=inspect+shortcut&oq=inspect+shortcut&gs_lcrp=EgZjaHJvbWUyCQgAEEUYORiABDIHCAEQABiABDIHCAIQABiABDIHCAMQABiABDIHCAQQABiABDIHCAUQABiABDIHCAYQABiABDIHCAcQABiABDIHCAgQABiABDIHCAkQABiABNIBCDczMTVqMGo3qAIHsAIB8QXI8fsophpL_PEFyPH7KKYaS_w&sourceid=chrome&ie=UTF-8');
  const [customAlias, setCustomAlias] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const shortenUrl = async () => {
    if (!originalUrl.trim()) {
      setError('Please enter a URL to shorten');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/url-shortener', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl: originalUrl.trim(),
          customAlias: customAlias.trim() || undefined,
          description: 'Google Search URL Test'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShortenedUrl(data.data.shortenedUrl);
        setSuccess('URL shortened successfully!');
      } else {
        setError(data.error || 'Failed to shorten URL');
      }
    } catch (err: any) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Copied to clipboard!');
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const urlLength = originalUrl.length;
  const isLongUrl = urlLength > 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            URL Shortener Test
          </h1>
          <p className="text-lg text-gray-600">
            Test our URL shortener with your long Google Search URL
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          {/* URL Analysis */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              📊 URL Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{urlLength}</div>
                <div className="text-sm text-blue-800">Characters</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isLongUrl ? 'text-red-600' : 'text-green-600'}`}>
                  {isLongUrl ? 'Very Long' : 'Normal'}
                </div>
                <div className="text-sm text-blue-800">Length Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(urlLength / 6)}x
                </div>
                <div className="text-sm text-blue-800">Reduction Potential</div>
              </div>
            </div>
          </div>

          {/* URL Input */}
          <div className="mb-6">
            <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Original URL (Google Search)
            </label>
            <textarea
              id="originalUrl"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono"
              placeholder="Enter your long URL here..."
            />
            <div className="mt-2 text-sm text-gray-500">
              Length: {urlLength} characters
            </div>
          </div>

          {/* Custom Alias */}
          <div className="mb-6">
            <label htmlFor="customAlias" className="block text-sm font-medium text-gray-700 mb-2">
              Custom Alias (Optional)
            </label>
            <input
              id="customAlias"
              type="text"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., inspect-shortcut"
            />
            <div className="mt-1 text-sm text-gray-500">
              Leave empty for auto-generated short code
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={shortenUrl}
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Shortening...' : 'Shorten URL'}
            </button>
            <button
              onClick={() => setOriginalUrl('')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Clear
            </button>
          </div>

          {/* Results */}
          {shortenedUrl && (
            <div className="mb-6 p-6 bg-green-50 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-4">
                ✅ Shortened URL Created!
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-2">
                    Shortened URL:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={shortenedUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-green-300 rounded-md bg-white text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(shortenedUrl)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-gray-700">Original Length:</div>
                    <div className="text-gray-600">{urlLength} characters</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-gray-700">Shortened Length:</div>
                    <div className="text-gray-600">{shortenedUrl.length} characters</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-gray-700">Space Saved:</div>
                    <div className="text-gray-600">{urlLength - shortenedUrl.length} characters</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-gray-700">Reduction:</div>
                    <div className="text-gray-600">
                      {Math.round(((urlLength - shortenedUrl.length) / urlLength) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* URL Breakdown */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔍 URL Breakdown
            </h3>
            <div className="text-sm text-gray-700 space-y-2">
              <div>
                <strong>Base URL:</strong> https://www.google.com/search
              </div>
              <div>
                <strong>Search Query:</strong> q=inspect+shortcut
              </div>
              <div>
                <strong>Original Query:</strong> oq=inspect+shortcut
              </div>
              <div>
                <strong>Search Context:</strong> gs_lcrp=... (very long encoded data)
              </div>
              <div>
                <strong>Browser Info:</strong> sourceid=chrome, ie=UTF-8
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

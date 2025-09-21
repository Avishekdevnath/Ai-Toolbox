'use client';

import { useState } from 'react';

export default function DebugUrlShortenerPage() {
  const [debugResults, setDebugResults] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const debugDatabase = async () => {
    setLoading(true);
    setDebugResults(null);

    try {
      const response = await fetch('/api/debug-database');
      const data = await response.json();
      setDebugResults(data);
    } catch (error) {
      setDebugResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testCreateUrl = async () => {
    setLoading(true);
    setTestResults(null);

    try {
      const response = await fetch('/api/test-create-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl: `https://www.google.com/search?q=test-${Date.now()}`,
          customAlias: undefined
        }),
      });
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      setTestResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testRedirect = (shortCode: string) => {
    window.open(`/${shortCode}`, '_blank');
  };

  const testRedirectAPI = async (shortCode: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/test-redirect-simple?shortCode=${shortCode}`);
      const data = await response.json();
      alert(`Redirect Test Result:\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      alert(`Redirect Test Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            URL Shortener Debug Tool
          </h1>
          <p className="text-lg text-gray-600">
            Debug the URL shortener database and redirect issues
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Database Debug */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🔍 Database Debug
            </h2>
            <p className="text-gray-600 mb-4">
              Check what's currently in the database
            </p>
            <button
              onClick={debugDatabase}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Debugging...' : 'Debug Database'}
            </button>

            {debugResults && (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Results:</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
                    {JSON.stringify(debugResults, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* URL Creation Test */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🧪 URL Creation Test
            </h2>
            <p className="text-gray-600 mb-4">
              Create a test URL and check if it can be found immediately
            </p>
            <button
              onClick={testCreateUrl}
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test URL Creation'}
            </button>

            {testResults && (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Results:</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
                    {JSON.stringify(testResults, null, 2)}
                  </pre>
                  
                  {testResults.testResults && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Quick Actions:</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => testRedirect(testResults.testResults.shortCode)}
                          className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                        >
                          Test Redirect
                        </button>
                        <button
                          onClick={() => testRedirectAPI(testResults.testResults.shortCode)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Test Redirect API
                        </button>
                        <button
                          onClick={() => window.open(`/api/debug-url/${testResults.testResults.shortCode}`, '_blank')}
                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                        >
                          Debug This URL
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis */}
        <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔬 Analysis
          </h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <strong>Common Issues:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>URLs created but not found immediately (database sync issue)</li>
                <li>Wrong collection name or database connection</li>
                <li>Query conditions not matching the stored data</li>
                <li>Timing issues with database operations</li>
              </ul>
            </div>
            <div>
              <strong>What to Look For:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Are URLs actually being stored in the database?</li>
                <li>Do the short codes match exactly?</li>
                <li>Are the query conditions correct?</li>
                <li>Is the database connection working properly?</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

export default function TestRedirectPage() {
  const [shortCode, setShortCode] = useState('linkgo001');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testRedirect = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Test the debug endpoint first
      const debugResponse = await fetch(`/api/debug-url/${shortCode}`);
      const debugData = await debugResponse.json();
      
      setResult({
        debug: debugData,
        redirectUrl: `/${shortCode}`,
        apiRedirectUrl: `/api/redirect/${shortCode}`
      });
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testDirectRedirect = () => {
    window.location.href = `/${shortCode}`;
  };

  const testApiRedirect = () => {
    window.location.href = `/api/redirect/${shortCode}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            URL Redirect Test
          </h1>
          <p className="text-lg text-gray-600">
            Test the URL shortener redirect functionality
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-6">
            <label htmlFor="shortCode" className="block text-sm font-medium text-gray-700 mb-2">
              Short Code to Test
            </label>
            <input
              id="shortCode"
              type="text"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter short code (e.g., linkgo001)"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={testRedirect}
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Debug Short Code'}
            </button>
            <button
              onClick={testDirectRedirect}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Test Direct Redirect
            </button>
            <button
              onClick={testApiRedirect}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Test API Redirect
            </button>
          </div>

          {result && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Results:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              🔧 Test Instructions
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>1. Debug Short Code:</strong> Check what's in the database for this short code</p>
              <p><strong>2. Test Direct Redirect:</strong> Try accessing the short code directly (/{shortCode})</p>
              <p><strong>3. Test API Redirect:</strong> Try the API redirect endpoint (/api/redirect/{shortCode})</p>
              <p><strong>Note:</strong> If you see "linkgo001" in the debug results, that means the URL exists in the database.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

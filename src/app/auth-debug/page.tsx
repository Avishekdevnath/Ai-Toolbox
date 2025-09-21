'use client';

import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState } from 'react';

export default function AuthDebugPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [apiResponse, setApiResponse] = useState<any>(null);

  useEffect(() => {
    // Test the API directly
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setApiResponse(data))
      .catch(err => setApiResponse({ error: err.message }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AuthProvider State */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">AuthProvider State</h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
              <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'true' : 'false'}</p>
              <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
            </div>
          </div>

          {/* API Response */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">API Response</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Refresh Page
            </button>
            <button
              onClick={() => {
                fetch('/api/auth/me', { cache: 'no-store' })
                  .then(res => res.json())
                  .then(data => setApiResponse(data))
                  .catch(err => setApiResponse({ error: err.message }));
              }}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test API Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';

export default function ClerkSimpleTestPage() {
  const [envVars, setEnvVars] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEnvVars = async () => {
      try {
        const response = await fetch('/api/test-clerk-env');
        const data = await response.json();
        setEnvVars(data);
      } catch (error) {
        console.error('Error checking environment variables:', error);
        setEnvVars({ error: 'Failed to check environment variables' });
      } finally {
        setLoading(false);
      }
    };

    checkEnvVars();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Clerk Environment Test
          </h1>
          <p className="text-gray-600">
            Testing Clerk environment variables and configuration
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Variables Status</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Checking environment variables...</p>
            </div>
          ) : envVars?.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-semibold">Error</h3>
              <p className="text-red-700">{envVars.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Publishable Key</h3>
                  <p className={`text-sm ${envVars?.clerkPublishableKey === 'SET' ? 'text-green-600' : 'text-red-600'}`}>
                    {envVars?.clerkPublishableKey}
                  </p>
                  {envVars?.publishableKeyPrefix && (
                    <p className="text-xs text-gray-500 mt-1">{envVars.publishableKeyPrefix}</p>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Secret Key</h3>
                  <p className={`text-sm ${envVars?.clerkSecretKey === 'SET' ? 'text-green-600' : 'text-red-600'}`}>
                    {envVars?.clerkSecretKey}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Overall Status</h3>
                <p className={`text-sm ${envVars?.hasValidKeys ? 'text-green-600' : 'text-red-600'}`}>
                  {envVars?.hasValidKeys ? '✅ All Clerk keys are properly configured' : '❌ Clerk keys are missing or invalid'}
                </p>
              </div>

              {envVars?.timestamp && (
                <div className="text-xs text-gray-500 text-center">
                  Last checked: {new Date(envVars.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• If environment variables are ✅ SET: The issue might be with Clerk app configuration</p>
            <p>• If environment variables are ❌ NOT SET: Check your .env.local file</p>
            <p>• Make sure your Clerk app is configured for localhost:3000</p>
            <p>• Verify the publishable key matches your Clerk dashboard</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/clerk-test" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block">
            Test Clerk Components
          </a>
        </div>
      </div>
    </div>
  );
} 
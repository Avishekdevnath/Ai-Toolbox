'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function TestAuthPage() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json();
        setAuthenticated(!!data.authenticated);
        setUser(data.user || null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 p-6">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Custom Authentication Test</h1>
          <p className="text-gray-600 dark:text-gray-400">Testing basic custom auth with JWT cookie</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {loading ? (
                <Loader2 className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : authenticated ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              Authentication Status
            </h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Loading State:</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${!loading ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {!loading ? 'Loaded' : 'Loading...'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Authentication:</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${authenticated ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                  {authenticated ? 'Signed In' : 'Not Signed In'}
                </span>
              </div>
              {authenticated && user && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">User ID:</span>
                    <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">{user.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
                    <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Name:</span>
                    <span className="text-gray-600 dark:text-gray-400">{user.firstName} {user.lastName}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Test Links</h3>
          </div>
          <div className="px-6 py-4">
            <div className="flex flex-wrap gap-4">
              <Link href="/sign-in">
                <Button variant="outline">Sign In Page</Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="outline">Sign Up Page</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Home Page</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
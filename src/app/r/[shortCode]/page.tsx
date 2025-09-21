'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function RedirectPage() {
  const params = useParams();
  const shortCode = params?.shortCode as string;
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Validate shortCode
    if (!shortCode || typeof shortCode !== 'string' || shortCode.trim().length === 0) {
      setError('Invalid short code');
      setStatus('error');
      return;
    }

    // Clean the shortCode
    const cleanShortCode = shortCode.trim();

    const redirectToOriginal = async () => {
      try {
        setStatus('redirecting');
        
        // Call the redirect API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(`/api/redirect/${encodeURIComponent(cleanShortCode)}`, {
          method: 'GET',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          // Parse the response to get the redirect URL
          const data = await response.json();
      
          if (data.success && data.redirectUrl) {
            // Validate the redirect URL
            try {
              new URL(data.redirectUrl);
              // Redirect to the original URL
              window.location.href = data.redirectUrl;
            } catch (urlError) {
              throw new Error('Invalid redirect URL');
            }
          } else {
            throw new Error('No redirect URL found in response');
          }
        } else if (response.status === 404) {
          setError('URL not found');
          setStatus('error');
        } else if (response.status === 410) {
          setError('URL has expired');
          setStatus('error');
        } else if (response.status >= 500) {
          setError('Server error - please try again later');
          setStatus('error');
        } else {
          try {
            const errorData = await response.json();
            setError(errorData.error || 'Failed to redirect');
          } catch (jsonError) {
            setError('Failed to redirect');
          }
          setStatus('error');
        }
      } catch (err: any) {
        console.error('Redirect error:', err);
        if (err.name === 'AbortError') {
          setError('Request timed out - please try again');
        } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
          setError('Network error - please check your connection');
        } else {
          setError('Failed to redirect to the original URL');
        }
        setStatus('error');
      }
    };

    redirectToOriginal();
  }, [shortCode]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Preparing your redirect...</p>
        </div>
      </div>
    );
  }

  if (status === 'redirecting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="text-6xl mb-4">🔗</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Redirecting...
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You're being redirected to the original URL
            </p>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Redirect Failed
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Go Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 
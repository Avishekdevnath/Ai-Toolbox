'use client';

import { useEffect, useState } from 'react';
import { useSignUp, useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function OAuthCallbackPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const router = useRouter();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.log('OAuth callback page loaded');
      console.log('Sign-up loaded:', signUpLoaded, 'Sign-in loaded:', signInLoaded);
      console.log('Sign-up status:', signUp?.status, 'Sign-in status:', signIn?.status);
      
      if (!signUpLoaded && !signInLoaded) {
        console.log('Waiting for Clerk to load...');
        return;
      }

      try {
        console.log('Handling OAuth callback...');
        
        // Try to handle sign-up OAuth callback first
        if (signUpLoaded && signUp.status === 'needs_oauth_callback') {
          console.log('Processing sign-up OAuth callback...');
          const result = await signUp.authenticateWithRedirect();
          console.log('Sign-up OAuth result:', result);
          
          if (result.status === 'complete') {
            console.log('Sign-up OAuth complete, redirecting to dashboard...');
            router.push('/dashboard');
            return;
          }
        }
        
        // Try to handle sign-in OAuth callback
        if (signInLoaded && signIn.status === 'needs_oauth_callback') {
          console.log('Processing sign-in OAuth callback...');
          const result = await signIn.authenticateWithRedirect();
          console.log('Sign-in OAuth result:', result);
          
          if (result.status === 'complete') {
            console.log('Sign-in OAuth complete, redirecting to dashboard...');
            router.push('/dashboard');
            return;
          }
        }
        
        // If no OAuth callback needed, redirect to dashboard
        console.log('No OAuth callback needed, redirecting to dashboard...');
        router.push('/dashboard');
        
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Authentication failed. Please try again.');
        setIsLoading(false);
      }
    };

    handleOAuthCallback();
  }, [signUpLoaded, signInLoaded, signUp, signIn, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/sign-up')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Authentication</h2>
        <p className="text-gray-600">Please wait while we verify your account...</p>
      </div>
    </div>
  );
} 
'use client';

import { useEffect, useState } from 'react';
import { useSignIn, useSignUp } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';

export default function SSOCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!signInLoaded || !signUpLoaded) return;

    const handleCallback = async () => {
      try {
        setStatus('loading');
        setMessage('Processing authentication...');

        // Check for various OAuth callback parameters
        const hasOAuthParams = searchParams.has('__clerk_status') || 
                              searchParams.has('__clerk_oauth_state') ||
                              searchParams.has('code') ||
                              searchParams.has('state') ||
                              searchParams.has('error');

        if (hasOAuthParams) {
          // This is a valid OAuth callback, let Clerk handle it
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Redirect to home page after a short delay
          setTimeout(() => {
            router.push('/');
          }, 2000);
          return;
        }

        // If no OAuth parameters, this might be a direct visit
        // Check if user is already authenticated
        if (signIn?.status === 'complete' || signUp?.status === 'complete') {
          setStatus('success');
          setMessage('Already authenticated! Redirecting...');
          
          setTimeout(() => {
            router.push('/');
          }, 2000);
          return;
        }

        // If not authenticated and no OAuth flow, redirect to sign-in
        setStatus('error');
        setMessage('No active authentication flow. Redirecting to sign-in...');
        
        setTimeout(() => {
          router.push('/sign-in');
        }, 2000);

      } catch (error) {
        console.error('SSO callback error:', error);
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
        
        setTimeout(() => {
          router.push('/sign-in?error=sso_failed');
        }, 3000);
      }
    };

    handleCallback();
  }, [signIn, signUp, signInLoaded, signUpLoaded, router, searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {getStatusIcon()}
              <span className={getStatusColor()}>
                {status === 'loading' && 'Processing Authentication'}
                {status === 'success' && 'Authentication Successful'}
                {status === 'error' && 'Authentication Failed'}
              </span>
            </CardTitle>
            <CardDescription>
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'error' && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>
                  If you continue to experience issues, please try signing in again.
                </AlertDescription>
              </Alert>
            )}
            
            {status === 'success' && (
              <Alert className="mt-4">
                <AlertDescription>
                  You will be redirected to the home page shortly.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
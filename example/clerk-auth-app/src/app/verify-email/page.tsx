'use client';

import { useState, useEffect } from 'react';
import { useSignUp, useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function EmailVerificationPage() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [email, setEmail] = useState('');
  
  const { signUp, isLoaded } = useSignUp();
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  // Get email from URL params or user data
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else if (user?.emailAddresses?.[0]?.emailAddress) {
      setEmail(user.emailAddresses[0].emailAddress);
    }
  }, [searchParams, user]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If already signed in, redirect to dashboard
  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!isLoaded) return;

    try {
      console.log('Attempting email verification with code...');
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.log('Verification result:', result.status);

      if (result.status === 'complete') {
        console.log('Verification complete, redirecting to dashboard...');
        setSuccess('Email verified successfully! Redirecting to dashboard...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        console.log('Verification failed with status:', result.status);
        setError('Verification failed. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Verification error:', err);
      let errorMessage = 'Verification failed';
      
      if (err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors) && err.errors[0]?.message) {
        errorMessage = err.errors[0].message;
      } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || resendCountdown > 0) return;
    
    setError('');
    setSuccess('');
    
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setSuccess('Verification code sent!');
      setResendCountdown(60); // 60 second countdown
    } catch (err: unknown) {
      console.error('Resend error:', err);
      setError('Failed to resend code. Please try again.');
    }
  };

  const handleBackToSignUp = () => {
    router.push('/sign-up');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the verification code sent to your email
          </p>
          {email && (
            <p className="mt-1 text-sm text-gray-500">
              {email}
            </p>
          )}
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-200">
          <form className="space-y-6" onSubmit={handleVerify}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1">
                <input
                  id="code"
                  name="code"
                  type="text"
                  autoComplete="one-time-code"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-center text-lg tracking-widest"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  autoFocus
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleBackToSignUp}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                ← Back to sign up
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCountdown > 0}
                className={`text-sm font-medium ${
                  resendCountdown > 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-blue-600 hover:text-blue-500'
                }`}
              >
                {resendCountdown > 0 
                  ? `Resend in ${resendCountdown}s` 
                  : 'Resend code'
                }
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Verify email'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={handleResendCode}
                disabled={resendCountdown > 0}
                className={`font-medium ${
                  resendCountdown > 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-blue-600 hover:text-blue-500'
                }`}
              >
                try a different email address
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useSignIn, useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertSystem, useAlertSystem } from '@/components/AlertSystem';
import { WarningSystem, useWarningSystem } from '@/components/WarningSystem';

export default function CustomSignInPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const { signIn, isLoaded } = useSignIn();
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { alerts, removeAlert, showSuccess, showError, showWarning } = useAlertSystem();
  const { warnings, removeWarning, showSecurityWarning } = useWarningSystem();

  // Redirect if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn && !isRedirecting) {
      setIsRedirecting(true);
      console.log('User is already signed in, redirecting to dashboard...');
      window.location.href = '/dashboard';
    }
  }, [isLoaded, isSignedIn, isRedirecting]);

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

  // If already signed in, show loading while redirecting
  if (isSignedIn || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isSignedIn ? 'You are already signed in!' : 'Redirecting to dashboard...'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            If you're not redirected automatically, <button 
              onClick={() => window.location.href = '/dashboard'}
              className="text-blue-600 hover:text-blue-500 underline"
            >
              click here
            </button>
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!isLoaded) return;

    try {
      console.log('Attempting sign in with:', identifier);
      
      // Try password-based authentication first
      const result = await signIn.create({
        identifier: identifier,
        password,
      });

      console.log('Sign in result:', result.status);

      if (result.status === 'complete') {
        console.log('Sign in complete, redirecting to dashboard...');
        window.location.href = '/dashboard';
      } else if (result.status === 'needs_first_factor') {
        // If password auth fails, try email code verification
        console.log('Needs first factor, preparing email code verification...');
        setNeedsVerification(true);
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
        });
        setIsVerifying(true);
      } else {
        console.log('Sign in failed with status:', result.status);
        showError('Sign In Failed', 'Please check your credentials and try again.');
      }
    } catch (err: unknown) {
      console.log('Password auth failed, trying email code verification...');
      // If password auth fails, try email code verification
      try {
        await signIn.create({
          identifier: identifier,
        });
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
        });
        setNeedsVerification(true);
        setIsVerifying(true);
      } catch (verificationErr: unknown) {
        console.error('Email verification also failed:', verificationErr);
        let errorMessage = 'An error occurred during sign in';
        
        if (verificationErr && typeof verificationErr === 'object' && 'errors' in verificationErr && Array.isArray(verificationErr.errors) && verificationErr.errors[0]?.message) {
          errorMessage = verificationErr.errors[0].message;
        } else if (verificationErr && typeof verificationErr === 'object' && 'message' in verificationErr && typeof verificationErr.message === 'string') {
          errorMessage = verificationErr.message;
        }
        
        showError('Sign In Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!isLoaded) return;

    try {
      console.log('Attempting email verification with code...');
      const result = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code,
      });

      console.log('Verification result:', result.status);

      if (result.status === 'complete') {
        console.log('Verification complete, redirecting to dashboard...');
        window.location.href = '/dashboard';
      } else {
        console.log('Verification failed with status:', result.status);
        showError('Verification Failed', 'Please check your code and try again.');
      }
          } catch (err: unknown) {
        console.error('Verification error:', err);
        let errorMessage = 'Verification failed';
        
        if (err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors) && err.errors[0]?.message) {
          errorMessage = err.errors[0].message;
        } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
          errorMessage = err.message;
        }
        
        showError('Verification Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'github' | 'facebook') => {
    if (!isLoaded) return;
    setSocialLoading(provider);
    setError('');
    try {
      console.log(`Attempting ${provider} sign in...`);
      await signIn.authenticateWithRedirect({
        strategy: `oauth_${provider}` as const,
        redirectUrl: "/oauth-callback"
      });
    } catch (err: unknown) {
      console.error(`${provider} sign in error:`, err);
      let errorMessage = `Failed to sign in with ${provider}`;
      
      if (err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors) && err.errors[0]?.message) {
        errorMessage = err.errors[0].message;
      } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMessage = err.message;
      }
      
      showError('Social Sign In Error', errorMessage);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded) return;
    setError('');
    try {
      await signIn.prepareFirstFactor({
        strategy: 'email_code',
      });
      showSuccess('Code Sent', 'Verification code sent to your email!');
    } catch (err: unknown) {
      showError('Resend Failed', 'Failed to resend code. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (err) {
      console.error('Error signing out:', err);
      // Fallback: just reload the page
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <AlertSystem alerts={alerts} onDismiss={removeAlert} />
      <WarningSystem warnings={warnings} onDismiss={removeWarning} onAction={(id, type) => {
        removeWarning(id);
      }} />
      
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isVerifying ? 'Verify your email' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isVerifying 
              ? 'Enter the verification code sent to your email'
              : 'Welcome back! Please sign in to continue.'
            }
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-200">
          {!isVerifying && (
            <>
              {/* Social Sign-in Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleSocialSignIn('google')}
                  disabled={socialLoading !== null}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {socialLoading === 'google' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  ) : (
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Continue with Google
                </button>

                <button
                  onClick={() => handleSocialSignIn('github')}
                  disabled={socialLoading !== null}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {socialLoading === 'github' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  )}
                  Continue with GitHub
                </button>

                <button
                  onClick={() => handleSocialSignIn('facebook')}
                  disabled={socialLoading !== null}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {socialLoading === 'facebook' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  )}
                  Continue with Facebook
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with username or email</span>
                </div>
              </div>

              <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                    Username or Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      autoComplete="username"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Enter your username or email"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    You can sign in with either your username or email address
                  </p>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                      Forgot your password?
                    </Link>
                  </div>
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
                      'Sign in'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Verification Code Form */}
          {isVerifying && (
            <form className="space-y-6" onSubmit={handleVerify}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
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
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  ← Back to sign in
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Resend code
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
                    'Verify and sign in'
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/sign-up" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </p>
            <button
              onClick={handleSignOut}
              className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
            >
              Clear session and sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
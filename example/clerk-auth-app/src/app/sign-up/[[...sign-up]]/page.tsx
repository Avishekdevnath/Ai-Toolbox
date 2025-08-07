'use client';

import { useState, useEffect } from 'react';
import { useSignUp, useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CustomSignUpPage() {
  // Form fields - separate username and email as per Clerk's API
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Email verification states
  const [isVerifying, setIsVerifying] = useState(false);
  const [code, setCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const { signUp, isLoaded } = useSignUp();
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  // Redirect if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn && !isRedirecting) {
      setIsRedirecting(true);
      console.log('User is already signed in, redirecting to dashboard...');
      window.location.href = '/dashboard';
    }
  }, [isLoaded, isSignedIn, isRedirecting]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      console.log(`Countdown: ${resendCountdown}s remaining`);
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Auto-start countdown when verification form is shown
  useEffect(() => {
    if (isVerifying && resendCountdown === 0) {
      console.log('Auto-starting countdown for verification form');
      setResendCountdown(60);
    }
  }, [isVerifying, resendCountdown]);

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

  const validateForm = () => {
    // Additional safety checks for edge cases
    if (!firstName.trim()) {
      setError('Please enter your first name');
      return false;
    }
    if (firstName.trim().length < 2) {
      setError('First name must be at least 2 characters long');
      return false;
    }
    if (!lastName.trim()) {
      setError('Please enter your last name');
      return false;
    }
    if (lastName.trim().length < 2) {
      setError('Last name must be at least 2 characters long');
      return false;
    }
    if (!username.trim()) {
      setError('Please enter a username');
      return false;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    if (!email.trim()) {
      setError('Please enter an email address');
      return false;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!acceptTerms) {
      setError('Please accept the Terms of Service and Privacy Policy');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!isLoaded) return;

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('Creating sign-up with:', { firstName, lastName, username, email });
      
      // Create sign-up with proper Clerk API structure
      const result = await signUp.create({
        firstName,
        lastName,
        username,
        emailAddress: email,
        password,
      });

      console.log('Sign-up result:', result.status);

      if (result.status === 'complete') {
        console.log('Sign-up complete, redirecting to dashboard...');
        window.location.href = '/dashboard';
      } else if (result.status === 'missing_requirements') {
        // Simplified status checking - handle verification directly
                  console.log('Email verification required, preparing verification...');
          try {
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setIsVerifying(true);
            setSuccess('Verification code sent to your email!');
            console.log('Setting initial countdown to 60 seconds');
            setResendCountdown(60); // Start countdown when verification form is shown
        } catch (verificationError) {
          console.error('Failed to prepare email verification:', verificationError);
          setError('Failed to send verification code. Please try again.');
        }
      } else {
        console.log('Sign-up failed with status:', result.status);
        setError('Sign-up failed. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Sign-up error:', err);
      let errorMessage = 'An error occurred during sign-up';
      
      // Enhanced error handling with more robust parsing
      if (err && typeof err === 'object' && 'errors' in err) {
        const errors = Array.isArray(err.errors) ? err.errors : [err.errors];
        errorMessage = errors[0]?.message || errors[0]?.longMessage || 'An error occurred during sign-up';
      } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMessage = err.message;
      } else if (err && typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!isLoaded) return;

    try {
      console.log('Attempting email verification with code:', code);
      
      // Attempt email verification
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
      } else if (result.status === 'missing_requirements') {
        console.log('Missing requirements, completing sign-up...');
        // Additional safety checks for edge cases
        try {
          const completeResult = await signUp.completeSignUp();
          console.log('Complete result:', completeResult.status);
          if (completeResult.status === 'complete') {
            setSuccess('Account created successfully! Redirecting to dashboard...');
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 2000);
          } else {
            console.log('Sign-up completion failed with status:', completeResult.status);
            setError('Account creation failed. Please try again.');
          }
        } catch (completeError) {
          console.error('Failed to complete sign-up:', completeError);
          setError('Failed to complete account creation. Please try again.');
        }
      } else {
        console.log('Verification failed with status:', result.status);
        setError('Verification failed. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Verification error:', err);
      let errorMessage = 'Verification failed';
      
      // Enhanced error handling with more robust parsing
      if (err && typeof err === 'object' && 'errors' in err) {
        const errors = Array.isArray(err.errors) ? err.errors : [err.errors];
        errorMessage = errors[0]?.message || errors[0]?.longMessage || 'Verification failed';
      } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMessage = err.message;
      } else if (err && typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: 'google' | 'github' | 'facebook') => {
    if (!isLoaded) {
      console.log('Clerk not loaded yet');
      return;
    }
    
    setSocialLoading(provider);
    setError('');
    setSuccess('');
    
    try {
      console.log(`Attempting ${provider} sign-up...`);
      console.log('Sign-up status before OAuth:', signUp.status);
      
      // Use the correct OAuth strategy
      const strategy = `oauth_${provider}` as const;
      console.log('Using OAuth strategy:', strategy);
      
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/oauth-callback"
      });
      
      console.log(`${provider} OAuth redirect initiated successfully`);
    } catch (err: unknown) {
      console.error(`${provider} sign-up error:`, err);
      let errorMessage = `Failed to sign up with ${provider}`;
      
      // Enhanced error handling with more robust parsing
      if (err && typeof err === 'object' && 'errors' in err) {
        const errors = Array.isArray(err.errors) ? err.errors : [err.errors];
        errorMessage = errors[0]?.message || errors[0]?.longMessage || `Failed to sign up with ${provider}`;
      } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMessage = err.message;
      } else if (err && typeof err === 'string') {
        errorMessage = err;
      }
      
      console.error(`Error details for ${provider}:`, {
        error: err,
        message: errorMessage,
        signUpStatus: signUp.status
      });
      
      setError(errorMessage);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || resendCountdown > 0) return;
    
    setError('');
    setSuccess('');
    
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setSuccess('Verification code sent!');
      console.log('Setting countdown to 60 seconds');
      setResendCountdown(60); // 60 second countdown
    } catch (err: unknown) {
      console.error('Resend error:', err);
      let errorMessage = 'Failed to resend code. Please try again.';
      
      // Enhanced error handling for resend
      if (err && typeof err === 'object' && 'errors' in err) {
        const errors = Array.isArray(err.errors) ? err.errors : [err.errors];
        errorMessage = errors[0]?.message || errors[0]?.longMessage || 'Failed to resend code. Please try again.';
      } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMessage = err.message;
      } else if (err && typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (err) {
      console.error('Error signing out:', err);
      // Additional safety check - force reload even if signOut fails
      try {
        window.location.reload();
      } catch (reloadError) {
        console.error('Failed to reload page:', reloadError);
        // Fallback - redirect to home page
        window.location.href = '/';
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isVerifying ? 'Verify your email' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isVerifying 
              ? 'Enter the verification code sent to your email'
              : 'Join AI Toolbox and unlock powerful features'
            }
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-200">
          {/* CAPTCHA element for Clerk */}
          <div id="clerk-captcha"></div>
          
          {!isVerifying && (
            <>
              {/* Social Sign-up Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleSocialSignUp('google')}
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
                  onClick={() => handleSocialSignUp('github')}
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
                  onClick={() => handleSocialSignUp('facebook')}
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
                  <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                </div>
              </div>

              <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
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

                {/* Name Fields */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <div className="mt-1">
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Enter your first name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <div className="mt-1">
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                </div>

                {/* Username Field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="mt-1">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Choose a username"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    This will be your unique username
                  </p>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Enter your email address"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    We'll send a verification code to this email
                  </p>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Create a password"
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
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters long
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
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

                {/* Terms Checkbox */}
                <div className="flex items-center">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    required
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                    I agree to the{' '}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      'Create account'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Verification Code Form */}
          {isVerifying && (
            <>
              {/* CAPTCHA element for Clerk */}
              <div id="clerk-captcha"></div>
              
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
                    onClick={() => setIsVerifying(false)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    ← Back to sign up
                  </button>
                  <div className="flex items-center space-x-2">
                    {resendCountdown > 0 && (
                      <span className="text-xs text-gray-500">
                        ⏱️ {resendCountdown}s
                      </span>
                    )}
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
                      'Verify and create account'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
                          <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Need to verify your email?{' '}
                <Link href="/verify-email" className="font-medium text-blue-600 hover:text-blue-500">
                  Verify Email
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
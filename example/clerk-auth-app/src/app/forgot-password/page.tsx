'use client';

import { useState, useEffect } from 'react';
import { useSignIn, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const { signIn, isLoaded } = useSignIn();
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  // Redirect if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log('User is already signed in, redirecting to dashboard...');
      window.location.href = '/dashboard';
    }
  }, [isLoaded, isSignedIn]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Auto-start countdown when verification form is shown
  useEffect(() => {
    if (isVerifying && resendCountdown === 0) {
      setResendCountdown(60);
    }
  }, [isVerifying, resendCountdown]);

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validatePasswordForm = () => {
    if (!code.trim()) {
      setError('Verification code is required');
      return false;
    }
    if (code.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return false;
    }
    if (!newPassword.trim()) {
      setError('New password is required');
      return false;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!isLoaded) return;
    if (!validateForm()) { setIsLoading(false); return; }

    try {
      console.log('Sending password reset code to:', email);
      
      // Step 1: Create a sign-in session with the email
      const result = await signIn.create({
        identifier: email,
      });
      
      console.log('Sign-in creation result:', result.status);
      console.log('First factor:', result.firstFactor);
      
      if (result.status === 'needs_first_factor') {
        // Step 2: Check available strategies
        const firstFactor = result.firstFactor;
        console.log('Available strategies:', firstFactor?.strategy);
        
        // Try to prepare email code verification
        try {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
          });
          
          setIsVerifying(true);
          setSuccess('✅ Password reset code sent to your email! Please check your inbox.');
          console.log('Password reset code sent successfully');
        } catch (prepareError) {
          console.error('Prepare first factor error:', prepareError);
          
          // If email_code fails, try password strategy
          try {
            await signIn.prepareFirstFactor({
              strategy: 'password',
            });
            
            setIsVerifying(true);
            setSuccess('✅ Password reset instructions sent to your email! Please check your inbox.');
            console.log('Password reset instructions sent');
          } catch (passwordError) {
            console.error('Password strategy error:', passwordError);
            setError('Unable to send reset code. Please try again.');
          }
        }
      } else {
        setError('Unable to send reset code. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Send reset code error:', err);
      let errorMessage = '❌ Failed to send reset code. Please try again.';
      
      if (err && typeof err === 'object' && 'errors' in err) {
        const errors = Array.isArray(err.errors) ? err.errors : [err.errors];
        const firstError = errors[0];
        
        if (firstError?.code === 'form_identifier_not_found') {
          errorMessage = '❌ Email address not found. Please check your email and try again.';
        } else if (firstError?.code === 'form_identifier_exists') {
          errorMessage = '❌ This email is already registered. Please use a different email.';
        } else if (firstError?.code === 'form_identifier_invalid') {
          errorMessage = '❌ Invalid email address. Please enter a valid email.';
        } else if (firstError?.message) {
          errorMessage = `❌ ${firstError.message}`;
        }
      } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMessage = `❌ ${err.message}`;
      } else if (err && typeof err === 'string') {
        errorMessage = `❌ ${err}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!isLoaded) return;
    if (!validatePasswordForm()) { setIsLoading(false); return; }

    try {
      console.log('Attempting password reset with code:', code);
      
      // Step 1: Try email code verification first
      try {
        const result = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code,
        });

        console.log('Email verification result:', result.status);

        if (result.status === 'complete') {
          // Step 2: Update the password
          await signIn.update({
            password: newPassword,
          });
          
          setSuccess('✅ Password reset successfully! Redirecting to sign-in...');
          setTimeout(() => {
            router.push('/sign-in');
          }, 2000);
        } else {
          console.log('Email verification failed with status:', result.status);
          setError('❌ Invalid verification code. Please check your email and try again.');
        }
      } catch (emailError: any) {
        console.error('Email code verification failed:', emailError);
        
        // Provide specific error messages based on the error type
        let specificError = '❌ Verification failed. Please check your code and try again.';
        
        if (emailError?.errors?.[0]?.code === 'form_identifier_not_found') {
          specificError = '❌ Email address not found. Please check your email and try again.';
        } else if (emailError?.errors?.[0]?.code === 'form_code_incorrect') {
          specificError = '❌ Incorrect verification code. Please check your email and try again.';
        } else if (emailError?.errors?.[0]?.code === 'form_code_expired') {
          specificError = '❌ Verification code has expired. Please request a new code.';
        } else if (emailError?.errors?.[0]?.message) {
          specificError = `❌ ${emailError.errors[0].message}`;
        }
        
        setError(specificError);
        
        // Clear the code field for better UX
        setCode('');
      }
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      let errorMessage = '❌ Password reset failed. Please try again.';
      
      if (err && typeof err === 'object' && 'errors' in err) {
        const errors = Array.isArray(err.errors) ? err.errors : [err.errors];
        const firstError = errors[0];
        
        if (firstError?.code === 'form_identifier_not_found') {
          errorMessage = '❌ Email address not found. Please check your email and try again.';
        } else if (firstError?.code === 'form_code_incorrect') {
          errorMessage = '❌ Incorrect verification code. Please check your email and try again.';
        } else if (firstError?.code === 'form_code_expired') {
          errorMessage = '❌ Verification code has expired. Please request a new code.';
        } else if (firstError?.message) {
          errorMessage = `❌ ${firstError.message}`;
        }
      } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMessage = `❌ ${err.message}`;
      } else if (err && typeof err === 'string') {
        errorMessage = `❌ ${err}`;
      }
      
      setError(errorMessage);
      
      // Clear the code field for better UX
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || resendCountdown > 0) return;
    setError('');
    setSuccess('');
    
    try {
      // Try email code strategy first
      try {
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
        });
                  setSuccess('✅ Reset code sent! Please check your email.');
          setResendCountdown(60);
      } catch (emailError) {
        console.error('Email code resend failed:', emailError);
        
        // If email code fails, try password strategy
        try {
          await signIn.prepareFirstFactor({
            strategy: 'password',
          });
          setSuccess('✅ Reset instructions sent! Please check your email.');
          setResendCountdown(60);
        } catch (passwordError) {
          console.error('Password strategy resend failed:', passwordError);
          setError('Unable to resend code. Please try again.');
        }
      }
    } catch (err: unknown) {
      console.error('Resend error:', err);
      let errorMessage = '❌ Failed to resend code. Please try again.';
      
      if (err && typeof err === 'object' && 'errors' in err) {
        const errors = Array.isArray(err.errors) ? err.errors : [err.errors];
        const firstError = errors[0];
        
        if (firstError?.code === 'form_code_rate_limit') {
          errorMessage = '❌ Too many resend attempts. Please wait before trying again.';
        } else if (firstError?.code === 'form_code_expired') {
          errorMessage = '❌ Previous code has expired. Please request a new code.';
        } else if (firstError?.message) {
          errorMessage = `❌ ${firstError.message}`;
        }
      } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMessage = `❌ ${err.message}`;
      } else if (err && typeof err === 'string') {
        errorMessage = `❌ ${err}`;
      }
      
      setError(errorMessage);
    }
  };

  const handleBackToSignIn = () => {
    router.push('/sign-in');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isVerifying ? 'Reset your password' : 'Forgot your password?'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isVerifying
              ? 'Enter the verification code and your new password'
              : 'Enter your email address and we\'ll send you a reset code'
            }
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-200">
          {!isVerifying && (
            <form className="space-y-6" onSubmit={handleSendResetCode}>
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
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
                    'Send Reset Code'
                  )}
                </button>
              </div>
            </form>
          )}

          {isVerifying && (
            <form className="space-y-6" onSubmit={handleResetPassword}>
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
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Enter the 6-digit code sent to your email</p>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your new password"
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
                <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
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
                    placeholder="Confirm your new password"
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

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  ← Back to email
                </button>
                <div className="flex items-center space-x-2">
                  {resendCountdown > 0 && (
                    <span className="text-xs text-gray-500">⏱️ {resendCountdown}s</span>
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
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code'}
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
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              <Link href="/" className="font-medium text-gray-600 hover:text-gray-500">
                ← Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
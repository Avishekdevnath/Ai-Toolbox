'use client';
import { useState, useEffect } from 'react';
import { useSignIn, useSignUp } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('signin');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();

  // Handle URL parameter for tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'signup') {
      setActiveTab('signup');
    }
  }, [searchParams]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInLoaded) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signIn.create({
        identifier: email,
        password: password,
      });

      if (result.status === 'complete') {
        setSuccess('Sign in successful! Redirecting to your profile...');
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
      } else {
        setError('Sign in failed. Please try again.');
      }
    } catch (error: any) {
      setError(error.errors?.[0]?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpLoaded) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp.create({
        firstName: firstName,
        lastName: lastName,
        emailAddress: email,
        password: password,
      });

      if (result.status === 'complete') {
        setSuccess('Account created successfully! Redirecting to your profile...');
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
      } else if (result.status === 'missing_requirements') {
        if (result.verifications?.emailAddress?.status === 'missing') {
          setSuccess('Please check your email to verify your account before signing in.');
        } else {
          setSuccess('Please complete the verification process.');
        }
      } else if (result.status === 'needs_verification') {
        setSuccess('Please check your email and click the verification link to complete your registration.');
      } else {
        setError('Account creation failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Sign-up error:', error);
      setError(error.errors?.[0]?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    if (!signInLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      const strategy = provider === 'oauth_google' ? 'oauth_google' : 
                      provider === 'oauth_github' ? 'oauth_github' : 
                      provider === 'oauth_facebook' ? 'oauth_facebook' : 'oauth_google';
      
      await signIn.authenticateWithRedirect({
        strategy: strategy as any,
        redirectUrl: '/profile',
        redirectUrlComplete: '/profile',
      });
    } catch (error: any) {
      setError(error.errors?.[0]?.message || 'An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: string) => {
    if (!signUpLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      const strategy = provider === 'oauth_google' ? 'oauth_google' : 
                      provider === 'oauth_github' ? 'oauth_github' : 
                      provider === 'oauth_facebook' ? 'oauth_facebook' : 'oauth_google';
      
      await signUp.authenticateWithRedirect({
        strategy: strategy as any,
        redirectUrl: '/profile',
        redirectUrlComplete: '/profile',
      });
    } catch (error: any) {
      setError(error.errors?.[0]?.message || 'An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block group">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <svg className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                Back to Home
              </span>
            </div>
          </Link>
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              AI Toolbox
            </h1>
          </Link>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to access your profile and preferences
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Success/Error Messages */}
            {success && (
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-sm">
                ✅ {success}
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg text-sm">
                ❌ {error}
              </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleOAuthSignIn('oauth_google')}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleOAuthSignIn('oauth_github')}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Continue with GitHub
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleOAuthSignIn('oauth_facebook')}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Continue with Facebook
                  </Button>
                </div>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleEmailSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="signup-firstname">First Name</Label>
                      <Input
                        id="signup-firstname"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-lastname">Last Name</Label>
                      <Input
                        id="signup-lastname"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password (min 8 characters)"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleOAuthSignUp('oauth_google')}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign up with Google
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleOAuthSignUp('oauth_github')}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Sign up with GitHub
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleOAuthSignUp('oauth_facebook')}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Sign up with Facebook
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 
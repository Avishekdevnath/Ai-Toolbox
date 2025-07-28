'use client';

import { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2, RefreshCw, CheckCircle } from 'lucide-react';
import { generateSecurePassword, getPasswordStrength } from '@/utils/passwordGenerator';

export default function CustomSignUpPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  
  const { signUp, isLoaded } = useSignUp();
  const router = useRouter();

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(12);
    setPassword(newPassword);
    setConfirmPassword(newPassword);
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!isLoaded) {
      setError('Clerk is not loaded yet');
      setIsLoading(false);
      return;
    }

    // Enhanced password validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    // Check for password complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Creating sign-up with:', { firstName, lastName, email, username, password });
      
      // Create sign-up
      const result = await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        username,
        password,
      });

      console.log('Sign up result:', result);

      if (result.status === 'complete') {
        // Account created successfully, redirect to home
        router.push('/');
      } else if (result.status === 'missing_requirements') {
        // Email verification is required
        console.log('Email verification required, preparing verification...');
        
        // Prepare email verification with link strategy
        await signUp.prepareEmailAddressVerification({
          strategy: 'email_link',
          redirectUrl: 'http://localhost:3000/sso-callback'
        });
        
        setNeedsVerification(true);
        setSuccess('✅ Account created successfully! Please check your email for verification.');
        setError(''); // Clear any previous errors
      } else {
        setError(`Sign up failed with status: ${result.status}. Please try again.`);
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.errors?.[0]?.message || 'An error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (strategy: 'oauth_google' | 'oauth_github') => {
    if (!isLoaded) return;

    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (err: any) {
      console.error('OAuth error:', err);
      setError(err.errors?.[0]?.message || 'OAuth sign up failed');
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join AI Toolbox today
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Create your account to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="pl-10 pr-20"
                  />
                  <div className="absolute right-3 top-3 flex space-x-1">
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Generate secure password"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Password Strength:</span>
                      <span className={getPasswordStrength(password).color}>
                        {getPasswordStrength(password).label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          getPasswordStrength(password).label === 'Weak' ? 'bg-red-500' :
                          getPasswordStrength(password).label === 'Medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ 
                          width: getPasswordStrength(password).label === 'Weak' ? '25%' :
                                 getPasswordStrength(password).label === 'Medium' ? '50%' :
                                 getPasswordStrength(password).label === 'Strong' ? '75%' : '100%'
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 space-y-1">
                  <p>Password must contain:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>At least 8 characters</li>
                    <li>One uppercase letter (A-Z)</li>
                    <li>One lowercase letter (a-z)</li>
                    <li>One number (0-9)</li>
                    <li>One special character (!@#$%^&*)</li>
                  </ul>
                  <p className="mt-2 text-blue-600">
                    💡 Click the refresh icon to generate a secure password
                  </p>
                  <div className="mt-2">
                    <Link href="/tools/password-generator" className="text-sm text-blue-600 hover:text-blue-800 underline">
                      🛠️ Use our advanced Password Generator tool
                    </Link>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
              
              {/* Clerk CAPTCHA element - required for bot protection */}
              <div id="clerk-captcha"></div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleOAuthSignUp('oauth_google')}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>

              <Button
                variant="outline"
                onClick={() => handleOAuthSignUp('oauth_github')}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link href="/sign-in" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Email Verification Section */}
        {needsVerification && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Email Verification Required</CardTitle>
              <CardDescription>
                We've sent a verification link to your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Please check your email at <strong>{email}</strong> and click the verification link to complete your account setup.
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  We've sent a verification link to your email. Click the link in your email to complete your account setup.
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Didn't receive the link? Check your spam folder or
                </p>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await signUp.prepareEmailAddressVerification({
                        strategy: 'email_link',
                        redirectUrl: 'http://localhost:3000/sso-callback'
                      });
                      setError('Verification link sent again!');
                    } catch (err: any) {
                      setError(err.errors?.[0]?.message || 'Failed to resend verification link');
                    }
                  }}
                >
                  Resend verification link
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 
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
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2, CheckCircle, Key, RefreshCw } from 'lucide-react';
import { generateSecurePassword, getPasswordStrength } from '@/utils/passwordGenerator';

export default function SimpleSignUpPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'verification' | 'complete'>('form');
  
  const { signUp, isLoaded } = useSignUp();
  const router = useRouter();

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(12);
    setPassword(newPassword);
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
        setSuccess('Account created successfully! Redirecting...');
        setStep('complete');
        setTimeout(() => router.push('/'), 2000);
      } else if (result.status === 'missing_requirements') {
        // Email verification is required
        console.log('Email verification required, preparing verification...');
        
        // Prepare email verification with link strategy
        await signUp.prepareEmailAddressVerification({
          strategy: 'email_link',
          redirectUrl: 'http://localhost:3000/sso-callback'
        });
        
        setStep('verification');
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

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      console.log('Verification result:', result);

      if (result.status === 'complete') {
        setSuccess('Email verified successfully! Redirecting...');
        setStep('complete');
        setTimeout(() => router.push('/'), 2000);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.errors?.[0]?.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_link',
        redirectUrl: 'http://localhost:3000/sso-callback'
      });
      setSuccess('Verification link sent again!');
    } catch (err: any) {
      console.error('Resend error:', err);
      setError(err.errors?.[0]?.message || 'Failed to resend verification link');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600">Your account has been created and verified successfully.</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to home page...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Simple sign-up process
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
            {step === 'form' && (
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
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      required
                    />
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
                      required
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
                      required
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
                      required
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
                
                {/* Clerk CAPTCHA element */}
                <div id="clerk-captcha"></div>
              </form>
            )}

            {step === 'verification' && (
              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Account created successfully! Please check your email at <strong>{email}</strong> for a verification link.
                    </AlertDescription>
                  </Alert>

                  <div className="text-center space-y-4">
                    <p className="text-sm text-gray-600">
                      We've sent a verification link to your email. Click the link in your email to complete your account setup.
                    </p>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Didn't receive the email? Check your spam folder or
                      </p>
                      <Button
                        variant="outline"
                        onClick={resendVerification}
                        disabled={isLoading}
                        type="button"
                      >
                        {isLoading ? 'Sending...' : 'Resend verification link'}
                      </Button>
                    </div>
                  </div>
                
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Didn't receive the code? Check your spam folder or
                  </p>
                  <Button
                    variant="outline"
                    onClick={resendVerification}
                    disabled={isLoading}
                    type="button"
                  >
                    {isLoading ? 'Sending...' : 'Resend verification code'}
                  </Button>
                </div>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setStep('form')}
                    type="button"
                  >
                    Back to form
                  </Button>
                </div>
              </form>
            )}

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link href="/sign-in" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
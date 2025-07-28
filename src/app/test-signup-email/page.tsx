'use client';

import { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail, CheckCircle, User, Lock, RefreshCw } from 'lucide-react';
import { generateSecurePassword, getPasswordStrength } from '@/utils/passwordGenerator';

export default function TestSignupEmailPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, isLoaded } = useSignUp();

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(12);
    setPassword(newPassword);
  };

  const testSignup = async () => {
    if (!email || !password || !firstName || !lastName || !username) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setResult(null);

    try {
      console.log('Testing signup with:', { firstName, lastName, email, username, password });
      
      // Step 1: Create sign-up
      const signUpResult = await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        username,
        password,
      });

      console.log('Step 1 - Sign up result:', signUpResult);
      setResult({ step: 1, result: signUpResult });

      // Step 2: Check if verification is needed
      if (signUpResult.status === 'missing_requirements') {
        console.log('Step 2 - Email verification needed');
        
        // Step 3: Prepare email verification (link method)
        const verificationResult = await signUp.prepareEmailAddressVerification({
          strategy: 'email_link',
          redirectUrl: 'http://localhost:3000/sso-callback'
        });
        console.log('Step 3 - Verification preparation result:', verificationResult);
        
        setResult({ 
          step: 3, 
          signUpResult, 
          verificationResult 
        });
        
        setSuccess('✅ Email verification link sent successfully! Check your email.');
      } else if (signUpResult.status === 'complete') {
        setSuccess('✅ Account created successfully without email verification needed.');
      } else {
        setError(`❌ Unexpected status: ${signUpResult.status}`);
      }

    } catch (err: any) {
      console.error('Error:', err);
      setError(`❌ Error: ${err.errors?.[0]?.message || err.message}`);
      setResult({ error: err });
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sign-up Email Test
          </h1>
          <p className="text-gray-600">
            Test the complete sign-up flow with email verification
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Complete Sign-up Flow</CardTitle>
            <CardDescription>
              Fill in the form to test sign-up with email verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="pl-10 pr-20"
                  required
                />
                <div className="absolute right-3 top-3">
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Generate secure password"
                  >
                    <RefreshCw className="h-4 w-4" />
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

            <Button
              onClick={testSignup}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test Sign-up with Email Verification'}
            </Button>

            {/* Clerk CAPTCHA element - required for bot protection */}
            <div id="clerk-captcha"></div>
            
            {result && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Debug Result:</h3>
                <pre className="text-sm overflow-auto max-h-40">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>What to Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Check your email inbox</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Check spam/junk folder</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Look for email from Clerk</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Email should contain a verification link</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
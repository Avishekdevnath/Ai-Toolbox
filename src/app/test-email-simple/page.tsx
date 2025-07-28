'use client';

import { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail, CheckCircle } from 'lucide-react';

export default function TestEmailSimplePage() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, isLoaded } = useSignUp();

  const testEmail = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setResult(null);

    try {
      console.log('Testing email with:', email);
      
      // Step 1: Create sign-up
      const signUpResult = await signUp.create({
        emailAddress: email,
        password: 'Xk9#mP2$vL8@nQ4!jR7&hF5*wE3^tY6',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
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
            Email Link Test
          </h1>
          <p className="text-gray-600">
            Test if Clerk can send verification links
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Email Link Sending</CardTitle>
            <CardDescription>
              Enter your email to test verification link delivery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                />
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
              onClick={testEmail}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test Email Link Sending'}
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
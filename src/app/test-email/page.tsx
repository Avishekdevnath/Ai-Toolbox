'use client';

import { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail } from 'lucide-react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp, isLoaded } = useSignUp();

  const testEmailVerification = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      // Create a sign-up attempt
      const signUpResult = await signUp.create({
        emailAddress: email,
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
      });

      setResult(signUpResult);
      console.log('Sign up result:', signUpResult);

      if (signUpResult.status === 'missing_requirements') {
        // Try to prepare email verification
        const verificationResult = await signUp.prepareEmailAddressVerification();
        console.log('Verification result:', verificationResult);
        setResult({ ...signUpResult, verificationResult });
      }

    } catch (err: any) {
      console.error('Error:', err);
      setError(err.errors?.[0]?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await signUp.prepareEmailAddressVerification();
      console.log('Resend result:', result);
      setResult({ type: 'resend', result });
    } catch (err: any) {
      console.error('Resend error:', err);
      setError(err.errors?.[0]?.message || 'Failed to resend verification email');
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
            Email Verification Test
          </h1>
          <p className="text-gray-600">
            Test email verification functionality
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Email Verification</CardTitle>
            <CardDescription>
              Enter an email address to test the verification process
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
                  placeholder="Enter email to test"
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

            <div className="flex gap-2">
              <Button 
                onClick={testEmailVerification}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Testing...' : 'Test Email Verification'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={resendVerification}
                disabled={isLoading}
              >
                Resend Email
              </Button>
            </div>

            {result && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Result:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Troubleshooting Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-semibold">1. Check Spam Folder</h4>
              <p className="text-sm text-gray-600">
                Look in your spam/junk folder for emails from Clerk
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold">2. Check Clerk Dashboard</h4>
              <p className="text-sm text-gray-600">
                Go to Clerk Dashboard → User & Authentication → Email, SMS, Phone
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold">3. Verify Email Templates</h4>
              <p className="text-sm text-gray-600">
                Make sure email templates are configured in Clerk
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold">4. Check Domain Settings</h4>
              <p className="text-sm text-gray-600">
                Verify your domain is properly configured for sending emails
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
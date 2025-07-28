'use client';

import { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail, CheckCircle, Info } from 'lucide-react';

export default function EmailDebugPage() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  const { signUp, isLoaded } = useSignUp();

  const testEmailSending = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('Testing email sending to:', email);
      
      // Create a sign-up attempt
      const signUpResult = await signUp.create({
        emailAddress: email,
        password: 'Xk9#mP2$vL8@nQ4!jR7&hF5*wE3^tY6',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
      });

      console.log('Sign up result:', signUpResult);
      setResult(signUpResult);

      // Check if email verification is needed
      if (signUpResult.status === 'missing_requirements') {
        console.log('Email verification needed, attempting to send code...');
        
        try {
          const verificationResult = await signUp.prepareEmailAddressVerification();
          console.log('Verification preparation result:', verificationResult);
          setResult({ ...signUpResult, verificationResult });
          setDebugInfo({
            ...debugInfo,
            verificationAttempted: true,
            verificationResult
          });
        } catch (verificationErr: any) {
          console.error('Verification preparation error:', verificationErr);
          setError(`Verification failed: ${verificationErr.errors?.[0]?.message || verificationErr.message}`);
          setDebugInfo({
            ...debugInfo,
            verificationError: verificationErr
          });
        }
      }

    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.errors?.[0]?.message || 'An error occurred');
      setDebugInfo({
        ...debugInfo,
        signUpError: err
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkEnvironmentVariables = () => {
    const envVars = {
      hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      hasSecretKey: !!process.env.CLERK_SECRET_KEY,
      publishableKeyLength: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.length || 0,
      secretKeyLength: process.env.CLERK_SECRET_KEY?.length || 0,
    };
    
    setDebugInfo({
      ...debugInfo,
      environmentVariables: envVars
    });
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Email Debugging Tool
          </h1>
          <p className="text-gray-600">
            Diagnose why emails aren't being sent from Clerk
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Test Section */}
          <Card>
            <CardHeader>
              <CardTitle>Test Email Sending</CardTitle>
              <CardDescription>
                Test if Clerk can send verification emails
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

              <Button
                onClick={testEmailSending}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Testing...' : 'Test Email Sending'}
              </Button>

              {result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Result:</h3>
                  <pre className="text-sm overflow-auto max-h-40">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Environment Check Section */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Check</CardTitle>
              <CardDescription>
                Verify your Clerk configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={checkEnvironmentVariables}
                variant="outline"
                className="w-full"
              >
                Check Environment Variables
              </Button>

              {debugInfo.environmentVariables && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Environment Variables:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Publishable Key:</span>
                      <span className={debugInfo.environmentVariables.hasPublishableKey ? 'text-green-600' : 'text-red-600'}>
                        {debugInfo.environmentVariables.hasPublishableKey ? '✅ Present' : '❌ Missing'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Secret Key:</span>
                      <span className={debugInfo.environmentVariables.hasSecretKey ? 'text-green-600' : 'text-red-600'}>
                        {debugInfo.environmentVariables.hasSecretKey ? '✅ Present' : '❌ Missing'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Publishable Key Length:</span>
                      <span>{debugInfo.environmentVariables.publishableKeyLength} chars</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Secret Key Length:</span>
                      <span>{debugInfo.environmentVariables.secretKeyLength} chars</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Troubleshooting Guide */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Troubleshooting Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">1. Check Spam Folder</h4>
                <p className="text-sm text-gray-600">
                  Look in your spam/junk folder for emails from Clerk
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. Check Clerk Dashboard</h4>
                <p className="text-sm text-gray-600">
                  Go to Clerk Dashboard → User & Authentication → Email, SMS, Phone
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. Verify Email Templates</h4>
                <p className="text-sm text-gray-600">
                  Make sure email templates are configured in Clerk
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4. Check Domain Settings</h4>
                <p className="text-sm text-gray-600">
                  Verify your domain is properly configured for sending emails
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">5. Check Email Provider</h4>
                <p className="text-sm text-gray-600">
                  Ensure your email provider isn't blocking Clerk emails
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">6. Test with Different Email</h4>
                <p className="text-sm text-gray-600">
                  Try with Gmail, Outlook, or another email provider
                </p>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Quick Fix:</strong> Try using a Gmail address for testing, as some email providers may block Clerk's emails.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 text-center space-x-4">
          <Button variant="outline" onClick={() => window.open('https://dashboard.clerk.com', '_blank')}>
            Open Clerk Dashboard
          </Button>
          <Button variant="outline" onClick={() => window.open('https://clerk.com/docs/email-and-sms/email', '_blank')}>
            Clerk Email Docs
          </Button>
        </div>
      </div>
    </div>
  );
} 
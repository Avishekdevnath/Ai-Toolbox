'use client';

import { useSignIn, useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Github, Chrome, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OAuthTestPage() {
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const router = useRouter();

  if (!signInLoaded || !signUpLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleOAuthSignIn = async (strategy: 'oauth_google' | 'oauth_github') => {
    try {
      console.log(`Starting ${strategy} authentication...`);
      
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (err: any) {
      console.error('OAuth error:', err);
      alert(`OAuth error: ${err.message || 'Unknown error'}`);
    }
  };

  const handleOAuthSignUp = async (strategy: 'oauth_google' | 'oauth_github') => {
    try {
      console.log(`Starting ${strategy} signup...`);
      
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (err: any) {
      console.error('OAuth error:', err);
      alert(`OAuth error: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            OAuth Authentication Test
          </h1>
          <p className="text-gray-600">
            Test OAuth authentication flows and debug issues
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Sign In OAuth */}
          <Card>
            <CardHeader>
              <CardTitle>Sign In with OAuth</CardTitle>
              <CardDescription>
                Test OAuth sign-in flows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleOAuthSignIn('oauth_google')}
              >
                <Chrome className="h-4 w-4 mr-2" />
                Sign In with Google
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleOAuthSignIn('oauth_github')}
              >
                <Github className="h-4 w-4 mr-2" />
                Sign In with GitHub
              </Button>
            </CardContent>
          </Card>

          {/* Sign Up OAuth */}
          <Card>
            <CardHeader>
              <CardTitle>Sign Up with OAuth</CardTitle>
              <CardDescription>
                Test OAuth sign-up flows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleOAuthSignUp('oauth_google')}
              >
                <Chrome className="h-4 w-4 mr-2" />
                Sign Up with Google
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleOAuthSignUp('oauth_github')}
              >
                <Github className="h-4 w-4 mr-2" />
                Sign Up with GitHub
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Debug Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>
              Check these items if OAuth is not working
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>1. Clerk Dashboard Configuration:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Go to your Clerk Dashboard</li>
                  <li>• Navigate to "User & Authentication" → "Social Connections"</li>
                  <li>• Ensure Google and GitHub OAuth are configured</li>
                  <li>• Check that redirect URLs are set correctly</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertDescription>
                <strong>2. Required Redirect URLs in Clerk Dashboard:</strong>
                <ul className="mt-2 space-y-1 text-sm font-mono">
                  <li>• http://localhost:3000/sso-callback</li>
                  <li>• http://localhost:3000/sign-in</li>
                  <li>• http://localhost:3000/sign-up</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertDescription>
                <strong>3. OAuth Provider Configuration:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Google OAuth: Check Client ID and Client Secret</li>
                  <li>• GitHub OAuth: Check Client ID and Client Secret</li>
                  <li>• Ensure authorized redirect URIs match Clerk's callback URL</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertDescription>
                <strong>4. Environment Variables:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Verify NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set</li>
                  <li>• Verify CLERK_SECRET_KEY is set</li>
                  <li>• Check that keys match your Clerk application</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link href="/test-clerk">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Test Page
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';

export default function ClerkDiagnosticPage() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  if (!authLoaded || !userLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Clerk Configuration Diagnostic
          </h1>
          <p className="text-gray-600">
            Check your Clerk authentication setup and identify issues
          </p>
        </div>

        <div className="grid gap-6">
          {/* Environment Variables Check */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Environment Variables
              </CardTitle>
              <CardDescription>
                Check if required Clerk environment variables are set
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Publishable Key</span>
                  {getStatusIcon(!!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Secret Key</span>
                  {getStatusIcon(!!process.env.CLERK_SECRET_KEY)}
                </div>
              </div>
              
              <Alert>
                <AlertDescription>
                  <strong>Required Environment Variables:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing'}</li>
                    <li>• CLERK_SECRET_KEY: {process.env.CLERK_SECRET_KEY ? '✅ Set' : '❌ Missing'}</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Authentication Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Authentication Status
              </CardTitle>
              <CardDescription>
                Current authentication state
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Auth Loaded</span>
                  {getStatusIcon(authLoaded)}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">User Loaded</span>
                  {getStatusIcon(userLoaded)}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Signed In</span>
                  {getStatusIcon(isSignedIn)}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">User Object</span>
                  {getStatusIcon(!!user)}
                </div>
              </div>

              {isSignedIn && user && (
                <Alert>
                  <AlertDescription>
                    <strong>Current User:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• ID: {user.id}</li>
                      <li>• Email: {user.primaryEmailAddress?.emailAddress}</li>
                      <li>• Name: {user.fullName}</li>
                      <li>• Created: {user.createdAt?.toLocaleDateString()}</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* OAuth Configuration Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                OAuth Configuration Issues
              </CardTitle>
              <CardDescription>
                Common issues and solutions for OAuth authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>❌ OAuth Providers Not Configured</strong>
                  <p className="mt-2">
                    The "No active authentication flow" error occurs because OAuth providers 
                    (Google, GitHub) are not configured in your Clerk dashboard.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-semibold">Required Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    <strong>Configure OAuth in Clerk Dashboard:</strong>
                    <ul className="ml-6 mt-1 space-y-1">
                      <li>• Go to <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Clerk Dashboard</a></li>
                      <li>• Select your application</li>
                      <li>• Navigate to "User & Authentication" → "Social Connections"</li>
                      <li>• Add Google and GitHub OAuth providers</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Set up OAuth Apps:</strong>
                    <ul className="ml-6 mt-1 space-y-1">
                      <li>• Create Google OAuth app in Google Cloud Console</li>
                      <li>• Create GitHub OAuth app in GitHub Settings</li>
                      <li>• Configure redirect URIs to match Clerk's callback URLs</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Add Redirect URLs in Clerk:</strong>
                    <ul className="ml-6 mt-1 space-y-1 font-mono text-xs">
                      <li>• http://localhost:3000/sso-callback</li>
                      <li>• http://localhost:3000/sign-in</li>
                      <li>• http://localhost:3000/sign-up</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Test and verify your authentication setup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Button asChild variant="outline">
                  <Link href="/oauth-test">
                    Test OAuth Flows
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/sign-in">
                    Test Sign In
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/sign-up">
                    Test Sign Up
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/test-clerk">
                    Full Test Page
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                Follow these steps to fix OAuth authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Alert>
                  <AlertDescription>
                    <strong>1. Configure OAuth Providers</strong>
                    <p className="mt-1 text-sm">
                      Follow the <Link href="/oauth-setup-guide" className="text-blue-600 hover:underline">OAuth Setup Guide</Link> to configure Google and GitHub OAuth.
                    </p>
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <AlertDescription>
                    <strong>2. Test OAuth Flows</strong>
                    <p className="mt-1 text-sm">
                      Use the <Link href="/oauth-test" className="text-blue-600 hover:underline">OAuth Test Page</Link> to verify your configuration.
                    </p>
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <AlertDescription>
                    <strong>3. Verify Authentication</strong>
                    <p className="mt-1 text-sm">
                      Test the complete authentication flow from sign-in to protected routes.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
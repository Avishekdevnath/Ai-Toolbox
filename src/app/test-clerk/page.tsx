'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, User, Mail, Calendar, Shield } from 'lucide-react';
import Link from 'next/link';

export default function TestClerkPage() {
  const { isLoaded: authLoaded, isSignedIn, signOut } = useAuth();
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Clerk Authentication Test
          </h1>
          <p className="text-gray-600">
            Testing Clerk's default authentication components and flow
          </p>
        </div>

        <div className="grid gap-6">
          {/* Authentication Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication Status
              </CardTitle>
              <CardDescription>
                Current authentication state and user information
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
                <div className="space-y-4">
                  <Separator />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">User ID</span>
                      </div>
                      <p className="text-sm text-gray-600 font-mono">{user.id}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Email</span>
                      </div>
                      <p className="text-sm text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Full Name</span>
                      </div>
                      <p className="text-sm text-gray-600">{user.fullName}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Created</span>
                      </div>
                      <p className="text-sm text-gray-600">{user.createdAt?.toLocaleDateString()}</p>
                    </div>
                  </div>

                  {user.publicMetadata && Object.keys(user.publicMetadata).length > 0 && (
                    <div className="space-y-2">
                      <span className="font-medium">Public Metadata</span>
                      <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(user.publicMetadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clerk Default Components */}
          <Card>
            <CardHeader>
              <CardTitle>Using Clerk's Default Components</CardTitle>
              <CardDescription>
                We're now using Clerk's built-in SignIn and SignUp components for testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Current Setup:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Using Clerk's default <code className="bg-blue-100 px-1 rounded">&lt;SignIn /&gt;</code> component</li>
                  <li>• Using Clerk's default <code className="bg-blue-100 px-1 rounded">&lt;SignUp /&gt;</code> component</li>
                  <li>• Custom appearance styling applied</li>
                  <li>• OAuth providers will work if configured in Clerk dashboard</li>
                </ul>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Button asChild>
                  <Link href="/sign-in">
                    Test Sign In
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/sign-up">
                    Test Sign Up
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Test authentication flows and user management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                {isSignedIn ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => signOut()}
                    >
                      Sign Out
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/profile">
                        View Profile
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild>
                      <Link href="/sign-in">
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/sign-up">
                        Sign Up
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Button asChild variant="outline">
                  <Link href="/clerk-diagnostic">
                    Run Diagnostic
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/oauth-test">
                    Test OAuth
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Environment Check */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Check</CardTitle>
              <CardDescription>
                Verify your Clerk configuration
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

              {!process.env.CLERK_SECRET_KEY && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">⚠️ Missing Secret Key</h4>
                  <p className="text-sm text-yellow-800">
                    Your CLERK_SECRET_KEY is not set. This is required for server-side operations.
                    Add it to your .env.local file.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                What to do after testing the default components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium">If Default Components Work:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Your Clerk configuration is correct</li>
                  <li>• You can switch back to custom components</li>
                  <li>• Configure OAuth providers in Clerk dashboard</li>
                  <li>• Test OAuth flows</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">If Default Components Don't Work:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Check your environment variables</li>
                  <li>• Verify Clerk dashboard configuration</li>
                  <li>• Check browser console for errors</li>
                  <li>• Run the diagnostic tool</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
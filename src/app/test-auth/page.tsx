'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function TestAuthPage() {
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Authentication Test
          </h1>
          <p className="text-gray-600">
            Testing Clerk's catch-all routes
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
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
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">✅ Successfully Authenticated!</h4>
                <p className="text-sm text-green-800">
                  User: {user.fullName} ({user.primaryEmailAddress?.emailAddress})
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {isSignedIn ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => signOut()}
                className="w-full"
              >
                Sign Out
              </Button>
              <Button asChild className="w-full">
                <Link href="/test-clerk">
                  Full Test Page
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="w-full">
                <Link href="/sign-in">
                  Sign In
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/sign-up">
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Catch-all routes are now properly configured! 🎉
          </p>
        </div>
      </div>
    </div>
  );
} 
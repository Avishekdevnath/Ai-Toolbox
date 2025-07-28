'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function OAuthSetupGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔐 OAuth Setup Guide
          </h1>
          <p className="text-gray-600">
            Complete guide to configure OAuth providers for your custom Clerk authentication
          </p>
        </div>

        <div className="grid gap-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Overview</CardTitle>
              <CardDescription>
                This guide will help you configure OAuth providers (Google and GitHub) for your custom Clerk authentication system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  <strong>Why OAuth?</strong> OAuth allows users to sign in with their existing Google or GitHub accounts, 
                  providing a seamless authentication experience without requiring them to create new passwords.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Step 1: Clerk Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle>🚀 Step 1: Configure Clerk Dashboard</CardTitle>
              <CardDescription>
                Set up OAuth providers in your Clerk application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">1.1 Access Clerk Dashboard</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Clerk Dashboard <ExternalLink className="h-3 w-3" /></a></li>
                  <li>Select your application</li>
                  <li>Navigate to <strong>User & Authentication</strong> → <strong>Social Connections</strong></li>
                </ol>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">1.2 Add OAuth Providers</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Click <strong>"Add connection"</strong></li>
                  <li>Select <strong>Google</strong> and <strong>GitHub</strong></li>
                  <li>For each provider, you'll need to configure:
                    <ul className="ml-6 mt-1 space-y-1">
                      <li>• Client ID</li>
                      <li>• Client Secret</li>
                      <li>• Redirect URLs</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Google OAuth */}
          <Card>
            <CardHeader>
              <CardTitle>🔧 Step 2: Configure Google OAuth</CardTitle>
              <CardDescription>
                Set up Google OAuth application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">2.1 Create Google OAuth App</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="h-3 w-3" /></a></li>
                  <li>Create a new project or select existing one</li>
                  <li>Enable the <strong>Google+ API</strong> or <strong>Google Identity API</strong></li>
                  <li>Go to <strong>Credentials</strong> → <strong>Create Credentials</strong> → <strong>OAuth 2.0 Client IDs</strong></li>
                  <li>Configure the OAuth consent screen</li>
                  <li>Create OAuth 2.0 Client ID</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">2.2 Google OAuth Settings</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium mb-2">Application type:</p>
                  <Badge variant="secondary">Web application</Badge>
                  
                  <p className="font-medium mt-3 mb-2">Authorized JavaScript origins:</p>
                  <code className="block bg-white p-2 rounded text-sm font-mono">
                    http://localhost:3000<br/>
                    https://yourdomain.com (for production)
                  </code>
                  
                  <p className="font-medium mt-3 mb-2">Authorized redirect URIs:</p>
                  <code className="block bg-white p-2 rounded text-sm font-mono">
                    https://your-clerk-domain.clerk.accounts.dev/v1/oauth/google/callback
                  </code>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">2.3 Get Google Credentials</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Copy the <strong>Client ID</strong> and <strong>Client Secret</strong></li>
                  <li>Add them to your Clerk dashboard in the Google OAuth settings</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: GitHub OAuth */}
          <Card>
            <CardHeader>
              <CardTitle>🔧 Step 3: Configure GitHub OAuth</CardTitle>
              <CardDescription>
                Set up GitHub OAuth application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">3.1 Create GitHub OAuth App</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to <a href="https://github.com/settings/developers" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">GitHub Settings <ExternalLink className="h-3 w-3" /></a></li>
                  <li>Click <strong>"New OAuth App"</strong></li>
                  <li>Fill in the application details:
                    <ul className="ml-6 mt-1 space-y-1">
                      <li>• <strong>Application name</strong>: Your app name</li>
                      <li>• <strong>Homepage URL</strong>: <code className="bg-gray-100 px-1 rounded">http://localhost:3000</code></li>
                      <li>• <strong>Authorization callback URL</strong>: <code className="bg-gray-100 px-1 rounded">https://your-clerk-domain.clerk.accounts.dev/v1/oauth/github/callback</code></li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">3.2 Get GitHub Credentials</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Copy the <strong>Client ID</strong> and <strong>Client Secret</strong></li>
                  <li>Add them to your Clerk dashboard in the GitHub OAuth settings</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Clerk Redirect URLs */}
          <Card>
            <CardHeader>
              <CardTitle>🔧 Step 4: Configure Clerk Redirect URLs</CardTitle>
              <CardDescription>
                Add required redirect URLs to your Clerk application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">4.1 Add Redirect URLs in Clerk Dashboard</h4>
                <p className="text-sm">In your Clerk dashboard, add these redirect URLs:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="block bg-white p-2 rounded text-sm font-mono">
                    http://localhost:3000/sso-callback<br/>
                    http://localhost:3000/sign-in<br/>
                    http://localhost:3000/sign-up
                  </code>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">4.2 Environment Variables</h4>
                <p className="text-sm">Make sure your <code className="bg-gray-100 px-1 rounded">.env.local</code> file includes:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="block bg-white p-2 rounded text-sm font-mono">
                    # Required<br/>
                    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here<br/>
                    CLERK_SECRET_KEY=sk_test_your_key_here<br/><br/>
                    # Optional (recommended)<br/>
                    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in<br/>
                    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up<br/>
                    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/<br/>
                    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 5: Testing */}
          <Card>
            <CardHeader>
              <CardTitle>🧪 Step 5: Test OAuth Configuration</CardTitle>
              <CardDescription>
                Verify your OAuth setup is working correctly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">5.1 Use the OAuth Test Page</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Visit <Link href="/oauth-test" className="text-blue-600 hover:underline">http://localhost:3000/oauth-test</Link></li>
                  <li>Test both Google and GitHub OAuth flows</li>
                  <li>Check browser console for any errors</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">5.2 Test Sign-In/Sign-Up Pages</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Visit <Link href="/sign-in" className="text-blue-600 hover:underline">/sign-in</Link> or <Link href="/sign-up" className="text-blue-600 hover:underline">/sign-up</Link></li>
                  <li>Click OAuth buttons</li>
                  <li>Complete the authentication flow</li>
                  <li>Verify you're redirected back successfully</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle>🐛 Troubleshooting Common Issues</CardTitle>
              <CardDescription>
                Solutions for common OAuth problems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Issue: "Invalid authentication flow"</strong>
                    <p className="mt-1 text-sm">
                      <strong>Solution:</strong> Check that redirect URLs are correctly configured in Clerk dashboard, 
                      verify OAuth provider settings match Clerk's callback URLs, and ensure environment variables are set correctly.
                    </p>
                  </AlertDescription>
                </Alert>

                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Issue: OAuth provider not working</strong>
                    <p className="mt-1 text-sm">
                      <strong>Solution:</strong> Verify Client ID and Client Secret are correct, check that OAuth app is properly configured, 
                      and ensure redirect URIs match exactly.
                    </p>
                  </AlertDescription>
                </Alert>

                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Issue: Redirect loop</strong>
                    <p className="mt-1 text-sm">
                      <strong>Solution:</strong> Check that redirectUrlComplete is set correctly, verify SSO callback page is handling the flow properly, 
                      and ensure no conflicting redirect configurations.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Verification Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>✅ Verification Checklist</CardTitle>
              <CardDescription>
                Use this checklist to ensure everything is configured correctly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Clerk Dashboard:</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Google OAuth configured with Client ID and Secret
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      GitHub OAuth configured with Client ID and Secret
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Redirect URLs added: /sso-callback, /sign-in, /sign-up
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      OAuth providers are enabled
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">OAuth Providers:</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Google OAuth app created and configured
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      GitHub OAuth app created and configured
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Redirect URIs match Clerk's callback URLs
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Client IDs and Secrets are correct
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Testing:</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      OAuth test page loads without errors
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Google OAuth flow works
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      GitHub OAuth flow works
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Users are redirected back successfully
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Authentication state is maintained
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="text-center">
            <Link href="/clerk-diagnostic">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Diagnostic
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
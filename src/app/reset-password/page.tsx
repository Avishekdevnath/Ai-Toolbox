'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import NewFooter from '@/components/NewFooter';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  // Check if token is valid
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setError('Invalid or missing reset token');
        setIsCheckingToken(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-reset-token?token=${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setIsValidToken(true);
        } else {
          setError(data.error || 'Invalid or expired reset token');
        }
      } catch (err) {
        console.error('Token verification error:', err);
        setError('Failed to verify reset token');
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          password 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Password has been reset successfully! You can now sign in with your new password.');
        setTimeout(() => {
          router.push('/sign-in');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Verifying reset token...</span>
              </div>
            </CardContent>
          </Card>
        </div>
        <NewFooter />
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <div className="flex items-center space-x-2">
                <Link 
                  href="/forgot-password" 
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <CardTitle className="text-2xl font-bold">Invalid Token</CardTitle>
              </div>
              <CardDescription>
                This password reset link is invalid or has expired
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <Link href="/forgot-password">
                  <Button className="w-full">
                    Request New Reset Link
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="outline" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <NewFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Link 
                href="/forgot-password" 
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            </div>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                <p className="font-medium text-gray-700">Password requirements:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>At least 8 characters long</li>
                  <li>Mix of letters, numbers, and symbols recommended</li>
                </ul>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>

            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link
                  href="/sign-in"
                  className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <NewFooter />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

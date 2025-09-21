'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import NewFooter from '@/components/NewFooter';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Password reset instructions have been sent to your email address.');
        setIsSubmitted(true);
      } else {
        setError(data.error || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Password reset instructions have been resent to your email address.');
      } else {
        setError(data.error || 'Failed to resend reset email. Please try again.');
      }
    } catch (err) {
      console.error('Resend email error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Link 
                href="/sign-in" 
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
            </div>
            <CardDescription>
              {isSubmitted 
                ? 'Check your email for reset instructions'
                : 'Enter your email address and we\'ll send you a link to reset your password'
              }
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

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Check Your Email
                  </h3>
                  <p className="text-sm text-gray-600">
                    We've sent password reset instructions to <strong>{email}</strong>
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={handleResendEmail}
                    variant="outline" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      'Resend Email'
                    )}
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                      setError('');
                      setSuccess('');
                    }}
                    variant="ghost" 
                    className="w-full"
                  >
                    Try Different Email
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link
                  href="/sign-in"
                  className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  Sign in
                </Link>
              </div>
              <div className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  href="/sign-up"
                  className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  Create account
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
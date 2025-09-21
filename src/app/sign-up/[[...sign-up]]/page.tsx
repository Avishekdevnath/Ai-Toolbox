'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Mail, Lock, Eye, EyeOff, Loader2, User, CheckCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function SignUpPage() {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [pendingId, setPendingId] = useState('');
  const [otp, setOtp] = useState('');
  const [resendAt, setResendAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateForm = () => {
    if (!firstName.trim()) { setError('First name is required'); return false; }
    if (!lastName.trim()) { setError('Last name is required'); return false; }
    if (!username.trim()) { setError('Username is required'); return false; }
    if (!email.trim()) { setError('Email is required'); return false; }
    if (!email.includes('@')) { setError('Please enter a valid email address'); return false; }
    if (password.length < 8) { setError('Password must be at least 8 characters long'); return false; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return false; }
    return true;
  };

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/register/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, firstName, lastName, email, phoneNumber, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to send verification code.');
        return;
      }
      setPendingId(data.pendingId);
      setResendAt(data.resendAvailableAt ? new Date(data.resendAvailableAt) : null);
      if (data.resendAvailableAt) {
        const secs = Math.max(0, Math.ceil((new Date(data.resendAvailableAt).getTime() - Date.now()) / 1000));
        setCountdown(secs);
      }
      setSuccess('Verification code sent to your email.');
    } catch (err: any) {
      console.error('Initiate error:', err);
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingId || !otp) {
      setError('Please enter the verification code.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingId, otp })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Invalid or expired code.');
        return;
      }
      // success -> redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Verify error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingId) return;
    if (resendAt && resendAt > new Date()) return;
    try {
      const res = await fetch('/api/auth/register/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendAt(data.resendAvailableAt ? new Date(data.resendAvailableAt) : null);
        if (data.resendAvailableAt) {
          const secs = Math.max(0, Math.ceil((new Date(data.resendAvailableAt).getTime() - Date.now()) / 1000));
          setCountdown(secs);
        }
        setSuccess('A new verification code has been sent.');
      } else {
        setError(data.message || 'Failed to resend code.');
      }
    } catch (err: any) {
      console.error('Resend error:', err);
      setError('Failed to resend code.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  const renderForm = () => (
    <form onSubmit={handleInitiate} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="firstName" type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="pl-10" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="lastName" type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="pl-10" required />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (optional)</Label>
          <Input id="phone" type="tel" placeholder="e.g. +1 555 123 4567" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="text-xs text-muted-foreground">Must be at least 8 characters long</div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 pr-10" required />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {confirmPassword && (
          <div className="flex items-center space-x-1 text-xs">
            {password === confirmPassword ? (
              <>
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-green-600">Passwords match</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 text-red-500" />
                <span className="text-red-600">Passwords do not match</span>
              </>
            )}
          </div>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending code...</>) : ('Create Account')}
      </Button>
    </form>
  );

  const renderOtp = () => (
    <form onSubmit={handleVerify} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="otp">Enter verification code</Label>
        <Input id="otp" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required />
        <div className="text-xs text-muted-foreground">We sent a code to {email}. Check your inbox.</div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={isLoading || otp.length !== 6}>
          {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>) : ('Verify & Continue')}
        </Button>
        <Button type="button" variant="outline" onClick={handleResendCode} disabled={!!(resendAt && resendAt > new Date())}>
          {resendAt && resendAt > new Date() ? `Resend in ${countdown}s` : 'Resend Code'}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Navigation showHome={true} showUserMenu={false} showBreadcrumbs={true} />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
            <CardDescription className="text-center">Join AI Toolbox to access all features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>)}
            {success && (<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">{success}</div>)}
            {!pendingId ? renderForm() : renderOtp()}
            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/sign-in" className="text-blue-600 hover:text-blue-800 transition-colors font-medium">Sign in</Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
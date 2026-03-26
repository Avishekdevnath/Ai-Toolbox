'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Wrench } from 'lucide-react';

export default function SignInPage() {
  const { loading, isAuthenticated, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const redirectToDashboard = () => {
    window.location.assign('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.message || 'Failed to sign in.');
      } else {
        setSuccess('Successfully signed in!');
        redirectToDashboard();
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--color-background)]">
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Checking authentication...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--color-background)]">
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Redirecting...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh grid lg:grid-cols-2">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between bg-[var(--color-primary)] p-10 text-white relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/[0.06]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/[0.04]" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">AI Toolbox</span>
        </Link>

        {/* Feature highlights */}
        <div className="relative space-y-8 max-w-sm">
          <h1 className="text-3xl font-bold leading-tight">
            Your all-in-one AI productivity suite
          </h1>
          <div className="space-y-5">
            {[
              { title: 'Smart Tools', desc: 'AI-powered calculators, analyzers, and generators' },
              { title: 'Secure & Private', desc: 'Your data stays yours with end-to-end protection' },
              { title: 'Always Free', desc: 'Core tools free forever, no credit card needed' },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-sm text-blue-100/80">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-blue-200/60">
          &copy; {new Date().getFullYear()} AI Toolbox. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col bg-[var(--color-background)]">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <span className="text-base font-bold text-[var(--color-text-primary)]">AI Toolbox</span>
          </Link>
          <Link href="/sign-up" className="text-sm font-medium text-[var(--color-primary)]">
            Sign Up
          </Link>
        </div>

        {/* Centered form area */}
        <div className="flex-1 flex items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-[400px] space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                Welcome back
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Sign in to your account to continue
              </p>
            </div>

            {/* Alerts */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-3 top-[2.85rem] h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  id="email"
                  label="Email or Username"
                  type="text"
                  placeholder="Enter your email or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="username"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-[2.85rem] h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[2.85rem] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer link */}
            <p className="text-center text-sm text-[var(--color-text-secondary)]">
              Don&apos;t have an account?{' '}
              <Link
                href="/sign-up"
                className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

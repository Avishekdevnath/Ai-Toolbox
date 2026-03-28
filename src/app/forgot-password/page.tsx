'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import NewFooter from '@/components/NewFooter';
import SecurityQuestionChallengeForm, {
  SecurityQuestionPrompt,
} from '@/components/auth/SecurityQuestionChallengeForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ForgotPasswordStep = 'identify' | 'questions' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<ForgotPasswordStep>('identify');
  const [identifier, setIdentifier] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [questions, setQuestions] = useState<SecurityQuestionPrompt[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleStartRecovery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!identifier.trim()) {
      setError('Please enter your email or username');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/forgot-password/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.challengeId || !Array.isArray(data.questions)) {
        setError('We could not start password recovery for that account.');
        return;
      }

      setChallengeId(data.challengeId);
      setQuestions(data.questions);
      setStep('questions');
    } catch (requestError) {
      console.error('Failed to start password recovery:', requestError);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyAnswers(answers: Array<{ questionId: string; answer: string }>) {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/forgot-password/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ challengeId, answers }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Security question verification failed.');
        return;
      }

      setStep('reset');
    } catch (requestError) {
      console.error('Failed to verify security question answers:', requestError);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ challengeId, newPassword }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to reset password.');
        return;
      }

      setStep('done');
      setSuccess('Your password was updated. Sign in again with your new password.');
    } catch (requestError) {
      console.error('Failed to reset password:', requestError);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function resetFlow() {
    setStep('identify');
    setIdentifier('');
    setChallengeId('');
    setQuestions([]);
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Navbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Link
                href="/sign-in"
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
            </div>
            <CardDescription>
              {step === 'identify' && 'Start password recovery with your email or username.'}
              {step === 'questions' && 'Use your saved recovery answers to continue.'}
              {step === 'reset' && 'Choose a fresh password to finish recovery.'}
              {step === 'done' && 'Recovery complete.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle className="mt-0.5 h-4 w-4" />
                <span>{success}</span>
              </div>
            )}

            {step === 'identify' && (
              <form onSubmit={handleStartRecovery} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Email or Username</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="identifier"
                      type="text"
                      placeholder="Enter your email or username"
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" loading={isLoading}>
                  Continue
                </Button>
              </form>
            )}

            {step === 'questions' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Answer your security questions</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    We selected two of your saved questions for recovery.
                  </p>
                </div>

                <SecurityQuestionChallengeForm
                  questions={questions}
                  onSubmit={handleVerifyAnswers}
                  submitLabel="Verify Answers"
                  isLoading={isLoading}
                />

                <Button type="button" variant="ghost" className="w-full" onClick={resetFlow} disabled={isLoading}>
                  Try a different account
                </Button>
              </div>
            )}

            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Create a new password</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Set a new password for your account. You will need to sign in again afterward.
                  </p>
                </div>

                <Input
                  id="newPassword"
                  label="New Password"
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={isLoading}
                />

                <Input
                  id="confirmNewPassword"
                  label="Confirm New Password"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={isLoading}
                />

                <Button type="submit" className="w-full" loading={isLoading}>
                  Reset Password
                </Button>
              </form>
            )}

            {step === 'done' && (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Password reset successfully</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Your password has been updated. Sign in again to continue.
                  </p>
                </div>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => {
                    window.location.href = '/sign-in';
                  }}
                >
                  Go to Sign In
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={resetFlow}>
                  Recover another account
                </Button>
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
                Don&apos;t have an account?{' '}
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

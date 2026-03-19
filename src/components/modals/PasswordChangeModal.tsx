'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff, Shield, X } from 'lucide-react';
import SecurityQuestionChallengeForm, {
  SecurityQuestionPrompt,
} from '@/components/auth/SecurityQuestionChallengeForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

type PasswordChangeMethod = 'current_password' | 'security_questions';

function isStrongEnoughPassword(value: string) {
  return value.length >= 8;
}

export default function PasswordChangeModal({
  isOpen,
  onClose,
  userEmail,
}: PasswordChangeModalProps) {
  const [method, setMethod] = useState<PasswordChangeMethod>('current_password');
  const [currentPassword, setCurrentPassword] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [questions, setQuestions] = useState<SecurityQuestionPrompt[]>([]);
  const [questionsVerified, setQuestionsVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) {
    return null;
  }

  function resetFlow(nextMethod: PasswordChangeMethod = method) {
    setMethod(nextMethod);
    setCurrentPassword('');
    setChallengeId('');
    setQuestions([]);
    setQuestionsVerified(false);
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setIsLoading(false);
  }

  function handleClose() {
    resetFlow('current_password');
    onClose();
  }

  function handleMethodChange(nextMethod: PasswordChangeMethod) {
    resetFlow(nextMethod);
  }

  function validateNewPassword() {
    if (!newPassword || !confirmPassword) {
      return 'Enter and confirm your new password';
    }

    if (!isStrongEnoughPassword(newPassword)) {
      return 'Password must be at least 8 characters long';
    }

    if (newPassword !== confirmPassword) {
      return 'Passwords do not match';
    }

    return '';
  }

  async function handleCurrentPasswordUpdate() {
    const passwordError = validateNewPassword();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!currentPassword) {
      setError('Current password is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/user/change-password/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword,
          verification: {
            method: 'current_password',
            currentPassword,
          },
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to update password');
        return;
      }

      setSuccess('Password updated successfully. Sign in again to continue.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (requestError) {
      console.error('Failed to update password with current password:', requestError);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLoadSecurityQuestions() {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/user/change-password/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to load security questions');
        return;
      }

      setChallengeId(data.challengeId);
      setQuestions(data.questions ?? []);
    } catch (requestError) {
      console.error('Failed to load security questions:', requestError);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifySecurityAnswers(answers: Array<{ questionId: string; answer: string }>) {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/user/change-password/verify-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId,
          answers,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Security question verification failed');
        return;
      }

      setQuestionsVerified(true);
      setSuccess('Security questions verified. Set your new password.');
    } catch (requestError) {
      console.error('Failed to verify security questions:', requestError);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSecurityQuestionUpdate() {
    const passwordError = validateNewPassword();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!challengeId || !questionsVerified) {
      setError('Verify your security questions first');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/user/change-password/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword,
          verification: {
            method: 'security_questions',
            challengeId,
          },
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to update password');
        return;
      }

      setSuccess('Password updated successfully. Sign in again to continue.');
      setChallengeId('');
      setQuestions([]);
      setQuestionsVerified(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (requestError) {
      console.error('Failed to update password with security questions:', requestError);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg">
        <Card className="border-0 shadow-xl">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="flex items-center text-lg text-gray-900">
                <Shield className="mr-2 h-5 w-5 text-gray-700" />
                Change Password
              </CardTitle>
              <CardDescription>
                Use your current password or answer your recovery questions to set a new password.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
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

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-gray-900">Verification Method</legend>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--color-border)] p-4">
                  <input
                    type="radio"
                    name="password-change-method"
                    value="current_password"
                    checked={method === 'current_password'}
                    onChange={() => handleMethodChange('current_password')}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <span className="block text-sm font-medium text-gray-900">Current Password</span>
                    <span className="block text-sm text-gray-600">
                      Verify with the password you use today.
                    </span>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--color-border)] p-4">
                  <input
                    type="radio"
                    name="password-change-method"
                    value="security_questions"
                    checked={method === 'security_questions'}
                    onChange={() => handleMethodChange('security_questions')}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <span className="block text-sm font-medium text-gray-900">Security Questions</span>
                    <span className="block text-sm text-gray-600">
                      Use your saved recovery answers instead.
                    </span>
                  </div>
                </label>
              </div>
            </fieldset>

            {method === 'current_password' && (
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    id="currentPassword"
                    label="Current Password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    placeholder="Enter your current password"
                    className="pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((current) => !current)}
                    className="absolute right-3 top-[2.85rem] text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="relative">
                    <Input
                      id="newPassword"
                      label="New Password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Enter your new password"
                      className="pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((current) => !current)}
                      className="absolute right-3 top-[2.85rem] text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      label="Confirm New Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Confirm your new password"
                      className="pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="absolute right-3 top-[2.85rem] text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="button"
                  className="w-full"
                  onClick={handleCurrentPasswordUpdate}
                  loading={isLoading}
                >
                  Update Password
                </Button>
              </div>
            )}

            {method === 'security_questions' && (
              <div className="space-y-4">
                {!challengeId && (
                  <div className="space-y-4 rounded-lg border border-[var(--color-border)] p-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-gray-900">Verify with your saved questions</h3>
                      <p className="text-sm text-gray-600">
                        We will ask two of your saved recovery questions instead of using the password on
                        {` `}
                        {userEmail || 'this account'}.
                      </p>
                    </div>
                    <Button type="button" className="w-full" onClick={handleLoadSecurityQuestions} loading={isLoading}>
                      Continue
                    </Button>
                  </div>
                )}

                {challengeId && !questionsVerified && (
                  <div className="space-y-3 rounded-lg border border-[var(--color-border)] p-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-gray-900">Answer your security questions</h3>
                      <p className="text-sm text-gray-600">
                        Correct answers will unlock password reset.
                      </p>
                    </div>
                    <SecurityQuestionChallengeForm
                      questions={questions}
                      onSubmit={handleVerifySecurityAnswers}
                      submitLabel="Verify Answers"
                      isLoading={isLoading}
                    />
                  </div>
                )}

                {questionsVerified && (
                  <div className="space-y-4 rounded-lg border border-[var(--color-border)] p-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-gray-900">Set your new password</h3>
                      <p className="text-sm text-gray-600">
                        Choose a new password. You will need to sign in again after this change.
                      </p>
                    </div>

                    <Input
                      id="securityQuestionsNewPassword"
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Enter your new password"
                      disabled={isLoading}
                    />

                    <Input
                      id="securityQuestionsConfirmPassword"
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Confirm your new password"
                      disabled={isLoading}
                    />

                    <Button
                      type="button"
                      className="w-full"
                      onClick={handleSecurityQuestionUpdate}
                      loading={isLoading}
                    >
                      Update Password
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

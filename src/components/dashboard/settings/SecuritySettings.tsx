'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Loader2, Shield } from 'lucide-react';
import SecurityQuestionFieldset, {
  createSecurityQuestionDrafts,
  SecurityQuestionDraft,
} from '@/components/auth/SecurityQuestionFieldset';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SecurityQuestionsResponse {
  success: boolean;
  selectedQuestionIds: string[];
  error?: string;
}

function buildDraftsFromSelections(selectedQuestionIds: string[] = []): SecurityQuestionDraft[] {
  if (selectedQuestionIds.length === 0) {
    return createSecurityQuestionDrafts();
  }

  const selectedDrafts = selectedQuestionIds.slice(0, 5).map((questionId) => ({
    questionId,
    answer: '',
  }));

  while (selectedDrafts.length < 3) {
    selectedDrafts.push({ questionId: '', answer: '' });
  }

  return selectedDrafts;
}

export default function SecuritySettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestionDraft[]>(
    createSecurityQuestionDrafts()
  );
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadSecurityQuestions() {
      try {
        const response = await fetch('/api/user/security-questions', {
          cache: 'no-store',
        });
        const data = (await response.json()) as SecurityQuestionsResponse;

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load security questions');
        }

        setSelectedQuestionIds(data.selectedQuestionIds ?? []);
        setSecurityQuestions(buildDraftsFromSelections(data.selectedQuestionIds));
      } catch (requestError: any) {
        setError(requestError.message || 'Failed to load security questions');
      } finally {
        setIsLoading(false);
      }
    }

    loadSecurityQuestions();
  }, []);

  async function handleSave() {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/user/security-questions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          securityQuestions,
        }),
      });
      const data = (await response.json()) as SecurityQuestionsResponse;

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to save security questions');
        return;
      }

      setSelectedQuestionIds(data.selectedQuestionIds ?? []);
      setSecurityQuestions(buildDraftsFromSelections(data.selectedQuestionIds));
      setCurrentPassword('');
      setSuccess('Recovery questions updated successfully.');
    } catch (requestError) {
      console.error('Failed to save security questions:', requestError);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Recovery Questions</h2>
          <p className="text-sm text-gray-600">
            Replace or rotate the questions used for password recovery.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Status</CardTitle>
          <CardDescription>
            {selectedQuestionIds.length >= 3
              ? `You currently have ${selectedQuestionIds.length} recovery questions configured.`
              : 'You still need to configure your recovery questions.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedQuestionIds.length >= 3 && (
            <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle className="mt-0.5 h-4 w-4" />
              <span>
                Existing answers are never shown here. Saving this form will replace your current recovery
                questions.
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <Input
            id="securitySettingsCurrentPassword"
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Enter your current password to save changes"
            disabled={isSaving}
          />

          <SecurityQuestionFieldset
            value={securityQuestions}
            onChange={setSecurityQuestions}
            disabled={isSaving}
          />

          <div className="flex justify-end">
            <Button type="button" onClick={handleSave} loading={isSaving}>
              Save Recovery Questions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

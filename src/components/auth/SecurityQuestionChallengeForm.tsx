'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface SecurityQuestionPrompt {
  questionId: string;
  label: string;
}

interface SecurityQuestionChallengeFormProps {
  questions: SecurityQuestionPrompt[];
  onSubmit: (answers: Array<{ questionId: string; answer: string }>) => Promise<void> | void;
  submitLabel: string;
  isLoading?: boolean;
}

export default function SecurityQuestionChallengeForm({
  questions,
  onSubmit,
  submitLabel,
  isLoading = false,
}: SecurityQuestionChallengeFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    setAnswers(
      Object.fromEntries(
        questions.map((question) => [question.questionId, ''])
      )
    );
  }, [questions]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit(
      questions.map((question) => ({
        questionId: question.questionId,
        answer: answers[question.questionId] ?? '',
      }))
    );
  }

  const hasBlankAnswer = questions.some(
    (question) => !(answers[question.questionId] ?? '').trim()
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {questions.map((question) => (
        <Input
          key={question.questionId}
          label={question.label}
          value={answers[question.questionId] ?? ''}
          onChange={(event) => setAnswers((current) => ({
            ...current,
            [question.questionId]: event.target.value,
          }))}
          placeholder="Type your answer"
          autoComplete="off"
          disabled={isLoading}
        />
      ))}

      <Button type="submit" className="w-full" loading={isLoading} disabled={hasBlankAnswer}>
        {submitLabel}
      </Button>
    </form>
  );
}

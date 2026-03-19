'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { normalizeSecurityAnswer } from '@/lib/auth/securityAnswers';
import { SECURITY_QUESTION_OPTIONS } from '@/lib/auth/securityQuestions';

export interface SecurityQuestionDraft {
  questionId: string;
  answer: string;
}

interface SecurityQuestionFieldsetProps {
  value: SecurityQuestionDraft[];
  onChange: (nextValue: SecurityQuestionDraft[]) => void;
  disabled?: boolean;
  error?: string;
  minQuestions?: number;
  maxQuestions?: number;
}

const SELECT_CLASS_NAME = [
  'flex h-11 w-full rounded-lg border bg-[var(--color-surface)] px-3 py-2 text-sm',
  'border-[var(--color-border)] text-[var(--color-text-primary)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
].join(' ');

export function createSecurityQuestionDrafts(count = 3): SecurityQuestionDraft[] {
  return Array.from({ length: count }, () => ({ questionId: '', answer: '' }));
}

export default function SecurityQuestionFieldset({
  value,
  onChange,
  disabled = false,
  error,
  minQuestions = 3,
  maxQuestions = 5,
}: SecurityQuestionFieldsetProps) {
  const rows = value.length > 0 ? value : createSecurityQuestionDrafts(minQuestions);
  const selectedQuestionIds = new Set(
    rows
      .map((row) => row.questionId)
      .filter((questionId) => Boolean(questionId))
  );

  const normalizedAnswers = rows
    .map((row) => normalizeSecurityAnswer(row.answer))
    .filter((answer) => Boolean(answer));

  const hasDuplicateQuestions = selectedQuestionIds.size !== rows.filter((row) => row.questionId).length;
  const hasDuplicateAnswers = new Set(normalizedAnswers).size !== normalizedAnswers.length;

  function updateRow(index: number, key: keyof SecurityQuestionDraft, nextValue: string) {
    onChange(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: nextValue } : row
      )
    );
  }

  function addRow() {
    if (rows.length >= maxQuestions) {
      return;
    }

    onChange([...rows, { questionId: '', answer: '' }]);
  }

  function removeRow(index: number) {
    if (rows.length <= minQuestions) {
      return;
    }

    onChange(rows.filter((_, rowIndex) => rowIndex !== index));
  }

  return (
    <fieldset className="space-y-4">
      <div className="space-y-1">
        <legend className="text-base font-semibold text-[var(--color-text-primary)]">
          Security Questions
        </legend>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Choose 3 to 5 questions. These answers will be used for password recovery.
        </p>
      </div>

      {rows.map((row, index) => (
        <div key={`security-question-row-${index}`} className="rounded-lg border border-[var(--color-border)] p-4 space-y-3">
          <div className="space-y-2">
            <Label htmlFor={`security-question-${index}`}>Security Question {index + 1}</Label>
            <select
              id={`security-question-${index}`}
              value={row.questionId}
              onChange={(event) => updateRow(index, 'questionId', event.target.value)}
              className={SELECT_CLASS_NAME}
              disabled={disabled}
            >
              <option value="">Select a question</option>
              {SECURITY_QUESTION_OPTIONS.map((question) => (
                <option
                  key={question.id}
                  value={question.id}
                  disabled={row.questionId !== question.id && selectedQuestionIds.has(question.id)}
                >
                  {question.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            id={`security-answer-${index}`}
            label={`Answer ${index + 1}`}
            value={row.answer}
            onChange={(event) => updateRow(index, 'answer', event.target.value)}
            placeholder="Type your answer"
            autoComplete="off"
            disabled={disabled}
          />

          {rows.length > minQuestions && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRow(index)}
                disabled={disabled}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      ))}

      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={addRow}
          disabled={disabled || rows.length >= maxQuestions}
        >
          Add Another Question
        </Button>

        {hasDuplicateQuestions && (
          <p className="text-sm text-[var(--color-destructive)]">
            Each selected security question must be unique.
          </p>
        )}

        {hasDuplicateAnswers && (
          <p className="text-sm text-[var(--color-destructive)]">
            Each security question answer must be unique.
          </p>
        )}

        {error && (
          <p className="text-sm text-[var(--color-destructive)]">{error}</p>
        )}
      </div>
    </fieldset>
  );
}

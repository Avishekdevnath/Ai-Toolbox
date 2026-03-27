"use client";
import { useState } from 'react';
import Link from 'next/link';
import { FormSchema } from '@/types/forms';
import IdentityGate from '@/components/forms/IdentityGate';
import FormModeB, { QuizResult } from './FormModeB';
import FormModeC from './FormModeC';
import QuizEndScreen from './QuizEndScreen';

function Branding() {
  return (
    <div className="mt-6 mb-4 text-center">
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold">AI Toolbox</span>
        <span className="text-gray-400">·</span>
        <span>by Avishek</span>
      </Link>
    </div>
  );
}

interface PublicFormShellProps {
  schema: FormSchema;
}

type Stage = 'identity' | 'form' | 'quiz-end' | 'submitted';

export default function PublicFormShell({ schema }: PublicFormShellProps) {
  const [stage, setStage] = useState<Stage>(() => {
    if (schema.settings.allowAnonymous) return 'form';
    const needsGate =
      schema.settings.identitySchema.requireName ||
      schema.settings.identitySchema.requireEmail ||
      schema.settings.identitySchema.requireStudentId;
    return needsGate ? 'identity' : 'form';
  });
  const [identityData, setIdentityData] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const handleIdentityComplete = (data: Record<string, string>) => {
    setIdentityData(data);
    setStage('form');
  };

  const handleSubmitSuccess = (id: string, result?: QuizResult) => {
    if (schema.type === 'quiz') {
      setQuizResult(result ?? null);
      setStage('quiz-end');
    } else {
      setStage('submitted');
    }
  };

  if (stage === 'identity') {
    return <><IdentityGate schema={schema} onComplete={handleIdentityComplete} /><Branding /></>;
  }

  if (stage === 'submitted') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-1">Response submitted!</h2>
          <p className="text-[14px] text-slate-500">Thank you for completing this form.</p>
        </div>
        <Branding />
      </div>
    );
  }

  if (stage === 'quiz-end') {
    return (
      <>
        <QuizEndScreen
          score={quizResult?.score ?? 0}
          maxScore={quizResult?.maxScore ?? 0}
          breakdown={quizResult?.breakdown ?? []}
          allowRetake={schema.settings.allowMultipleSubmissions}
          onRetake={() => { setStage('form'); setQuizResult(null); }}
        />
        <Branding />
      </>
    );
  }

  const mode = schema.settings?.displayMode ?? 'all';

  if (mode === 'paginated') {
    return <><FormModeC schema={schema} identityData={identityData} onSubmitSuccess={handleSubmitSuccess} /><Branding /></>;
  }

  return <><FormModeB schema={schema} identityData={identityData} onSubmitSuccess={handleSubmitSuccess} /><Branding /></>;
}

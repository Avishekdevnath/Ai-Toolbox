'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import QuizTimer from './QuizTimer';
import IdentityGate, { IdentityData } from './IdentityGate';
import QuizSecurity from './QuizSecurity';
import QuizResults from './QuizResults';
import CorrectAnswersView from './CorrectAnswersView';
import { useTheme } from '@/hooks/useTheme';
import { getQuizThemeClasses } from '@/lib/themeUtils';

interface Field {
  id: string;
  questionCode?: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
  multiple?: boolean;
  placeholder?: string;
  helpText?: string;
  imageUrl?: string;
}

interface Schema {
  id: string;
  title: string;
  description?: string;
  type: string;
  fields: Field[];
  settings?: {
    identitySchema?: { requireName?: boolean; requireEmail?: boolean; requireStudentId?: boolean };
    timer?: { enabled: boolean; minutes: number };
  };
}

export default function PublicFormRenderer({ schema }: { schema: Schema }) {
  const router = useRouter();
  const [responder, setResponder] = useState({ name: '', email: '', studentId: '' });
  const [values, setValues] = useState<Record<string, any>>({});
  const [startedAt, setStartedAt] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [identityVerified, setIdentityVerified] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [identityError, setIdentityError] = useState<string>('');
  const [securityViolations, setSecurityViolations] = useState<string[]>([]);
  const [result, setResult] = useState<{ score?: number; maxScore?: number } | null>(null);
  const [submittedSnapshot, setSubmittedSnapshot] = useState<Record<string, any> | null>(null);
  const [quizExpired, setQuizExpired] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState<Array<{ fieldId: string; questionCode?: string; value: any }>>([]);
  const [submittedDurationMs, setSubmittedDurationMs] = useState<number>(0);
  const [quizStartTime, setQuizStartTime] = useState<string>('');
  const [quizEndTime, setQuizEndTime] = useState<string>('');
  const waterMarkText = responder.email || responder.name || 'CONFIDENTIAL';

  // Theme system
  const { resolvedTheme } = useTheme();
  const themeClasses = getQuizThemeClasses(resolvedTheme);

  const requiresIdentity = useMemo(() => schema.settings?.identitySchema || {}, [schema]);
  const timerText = useMemo(() => schema.settings?.timer?.enabled ? `${schema.settings?.timer?.minutes} minute(s)` : null, [schema]);
  const hasIdentityRequirements = useMemo(() =>
    requiresIdentity.requireName || requiresIdentity.requireEmail || requiresIdentity.requireStudentId,
    [requiresIdentity]
  );
  const isQuiz = schema.type === 'quiz';

  const handleChange = (field: Field, val: any) => {
    setValues((prev) => ({ ...prev, [field.id]: val }));
  };

  const handleIdentitySubmit = async (identity: IdentityData) => {
    try {
      setIdentityError('');
      setResponder({
        name: identity.name || '',
        email: identity.email || '',
        studentId: identity.studentId || ''
      });
      setIdentityVerified(true);

      // For timed quizzes, do not auto-start. Show the Start screen so questions stay hidden
    } catch (err: any) {
      setIdentityError(err.message || 'Failed to verify identity');
    }
  };

  const handleStartQuiz = () => {
    const now = new Date();
    setStartedAt(now.toISOString());
    setQuizStartTime(now.toLocaleString());
    setQuizStarted(true);

    // Request fullscreen for exam integrity
    if (typeof window !== 'undefined' && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {/* ignore */});
    }
  };

  // Disable text selection & right-click once quiz starts
  useEffect(() => {
    if (isQuiz && quizStarted) {
      const body = document.body;
      body.classList.add('no-select');
      const preventContext = (e: any) => e.preventDefault();
      body.addEventListener('contextmenu', preventContext);

      const onFsChange = () => {
        if (document.fullscreenElement == null) {
          // User exited fullscreen; optional action: display alert or auto-submit
          alert('You exited fullscreen mode. Please return to fullscreen to continue.');
        }
      };
      document.addEventListener('fullscreenchange', onFsChange);
      return () => {
        body.classList.remove('no-select');
        body.removeEventListener('contextmenu', preventContext);
        document.removeEventListener('fullscreenchange', onFsChange);
      };
    }
  }, [isQuiz, quizStarted]);

  const handleSecurityViolation = (violation: string) => {
    setSecurityViolations(prev => [...prev, violation]);
    // Could also send this to the server for logging
    console.warn('Security violation:', violation);
  };

  const handleFullscreenExit = () => {
    // Handle fullscreen exit - could show warning or auto-re-enter
    console.warn('User exited fullscreen mode');
  };

  // Lightweight public branding for all public forms
  const Branding = () => (
    <div className="mt-6 text-center">
      <Link href="/" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 bg-white hover:bg-gray-50 transition-colors">
        <span className="font-semibold">AI Toolbox</span>
        <span className="text-gray-400">•</span>
        <span>by Avishek</span>
      </Link>
    </div>
  );

  const submit = useCallback(async (e: React.FormEvent) => {
    console.log('📝 Submit function called', { isQuiz, quizExpired, submitting });
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMsg('');
    try {
      const answers = schema.fields.map((f) => ({ fieldId: f.id, questionCode: f.questionCode, value: values[f.id] }));
      
      // Store submitted answers for results view
      setSubmittedAnswers(answers);
      
      // Calculate duration properly and store it
      let durationMs = 0;
      const endTime = new Date();
      setQuizEndTime(endTime.toLocaleString());
      
      if (startedAt) {
        const startTime = new Date(startedAt).getTime();
        const currentTime = Date.now();
        durationMs = currentTime - startTime;
        
        console.log('⏰ Duration calculation:', {
          startedAt,
          startTime,
          currentTime,
          calculatedMs: durationMs,
          calculatedMinutes: Math.round(durationMs / 60000 * 100) / 100,
          startTimeFormatted: quizStartTime,
          endTimeFormatted: endTime.toLocaleString()
        });
        
        // Store the calculated duration for results display
        setSubmittedDurationMs(durationMs);
      }
      
      // If this is a quiz with timer and we're auto-submitting due to time up,
      // use the exact allowed time to prevent API rejection
      if (isQuiz && schema.settings?.timer?.enabled && quizExpired) {
        const allowedMs = (schema.settings.timer.minutes || 0) * 60 * 1000;
        durationMs = allowedMs; // Use exact allowed time for auto-submit
        console.log('⏰ Auto-submit: Using exact allowed time', { 
          calculated: durationMs, 
          allowed: allowedMs 
        });
      }
      
      const body = {
        responder: {
          name: responder.name || undefined,
          email: responder.email || undefined,
          studentId: responder.studentId || undefined,
        },
        startedAt: startedAt || new Date().toISOString(),
        durationMs,
        answers,
      };
      console.log('📤 Submitting quiz data:', body);
      const res = await fetch(`/api/forms/${schema.id}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      console.log('📥 Submit response:', data);
      if (!res.ok || !data.success) throw new Error(data.error || 'Submission failed');
      setResult({ score: data.data?.score, maxScore: data.data?.maxScore });
      if (!isQuiz) setSubmittedSnapshot(values);
      setMsg('');
      console.log('✅ Quiz submitted successfully!');
    } catch (e: any) {
      console.error('❌ Submit error:', e);
      setError(e.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  }, [schema.fields, values, responder, startedAt, isQuiz, quizExpired, schema.settings?.timer]);

  const handleTimeUp = useCallback(() => {
    // Auto-submit when time is up
    console.log('🕐 Time up! Auto-submitting quiz...', { submitting, quizExpired });
    
    if (submitting) {
      console.log('⚠️ Already submitting, skipping auto-submit');
      return; // Prevent multiple submissions
    }
    
    setQuizExpired(true);
    setSubmitting(true);
    
    // Use setTimeout to avoid calling during render
    setTimeout(() => {
      console.log('🚀 Executing auto-submit...');
      // Call submit function directly with a synthetic event
      const syntheticEvent = {
        preventDefault: () => {},
        stopPropagation: () => {},
      } as React.FormEvent;
      
      submit(syntheticEvent).catch((error) => {
        console.error('❌ Auto-submit failed, retrying...', error);
        // Retry once after a short delay
        setTimeout(() => {
          console.log('🔄 Retrying auto-submit...');
          submit(syntheticEvent);
        }, 1000);
      });
    }, 100); // Slightly longer delay to ensure state updates
  }, [submitting, submit]);

  // Show identity gate for quizzes only when required and not verified
  if (isQuiz && hasIdentityRequirements && !identityVerified) {
    return (
      <IdentityGate
        requireName={requiresIdentity.requireName}
        requireEmail={requiresIdentity.requireEmail}
        requireStudentId={requiresIdentity.requireStudentId}
        onSubmit={handleIdentitySubmit}
        error={identityError}
        title={isQuiz ? "Start Quiz - Verify Identity" : "Verify Your Identity"}
        description={isQuiz ? "Please verify your identity before starting the quiz." : "Please provide your information to continue."}
      />
    );
  }

  // Show quiz start button for quizzes (always require explicit start)
  if (isQuiz && !quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-2">
        <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">
              Ready to Start Quiz
            </h1>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <p className="text-slate-200 text-sm mb-1">
                You have <span className="font-bold text-orange-300">{schema.settings.timer.minutes} minutes</span> to complete this quiz
              </p>
              <p className="text-slate-300 text-xs">
                Once you start, the timer cannot be paused or restarted
              </p>
            </div>
          </div>

          {/* Main Card */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardContent className="p-4">
              {/* Instructions Section */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Important Instructions</h3>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">1</span>
                      </div>
                      <p className="text-orange-900 text-xs font-medium">Your time will begin immediately after you click Start Quiz</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>
                      <p className="text-orange-900 text-xs font-medium">Do not refresh or close the tab during the quiz</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>
                      <p className="text-orange-900 text-xs font-medium">Avoid switching windows or using copy/paste or external help</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">4</span>
                      </div>
                      <p className="text-orange-900 text-xs font-medium">Your answers are submitted when the timer ends or you click Submit</p>
                    </div>
                  </div>
                </div>

                {/* Availability Info */}
                {((schema as any).settings?.startAt || (schema as any).settings?.endAt) && (
                  <div className="mt-2 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-semibold text-gray-800 text-xs">Quiz Availability</span>
                    </div>
                    <p className="text-xs text-gray-700">
                      {(schema as any).settings?.startAt ? `From ${new Date((schema as any).settings.startAt).toLocaleString()}` : 'Now'}
                      {(schema as any).settings?.endAt ? ` to ${new Date((schema as any).settings.endAt).toLocaleString()}` : ''}
                    </p>
                  </div>
                )}
              </div>

              {/* Start Button */}
              <Button 
                onClick={handleStartQuiz} 
                className="w-full h-10 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Quiz
                </div>
              </Button>

              {/* Security Notice */}
              <div className="mt-4 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <svg className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div className="text-xs text-blue-800">
                    <p className="font-semibold mb-1">Quiz Security</p>
                    <p>This quiz is monitored for academic integrity. Please ensure you follow all instructions carefully.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        <Branding />
      </div>
      </div>
    );
  }

  if (result && isQuiz) {
    const score = result.score ?? 0;
    const max = result.maxScore ?? 0;
    
    // Use the stored duration from submission time, not real-time calculation
    // Fallback to real-time calculation if stored duration is not available
    const durationMs = submittedDurationMs > 0 ? submittedDurationMs : 
      (startedAt ? Date.now() - new Date(startedAt).getTime() : 0);

    if (showCorrectAnswers) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 md:p-6">
          <CorrectAnswersView
            formData={schema}
            answers={submittedAnswers}
            onBack={() => setShowCorrectAnswers(false)}
          />
          <Branding />
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 md:p-6">
        <QuizResults
          score={score}
          maxScore={max}
          responder={responder}
          durationMs={durationMs}
          startTime={quizStartTime}
          endTime={quizEndTime}
          answers={submittedAnswers}
          formData={schema}
          onViewAnswers={() => setShowCorrectAnswers(true)}
          onClose={() => {
            // Navigate to AI toolbox home page
            router.push('/');
          }}
        />
        <Branding />
      </div>
    );
  }

  if (result && !isQuiz && submittedSnapshot) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 md:p-6">
        <Card className="w-full max-w-3xl md:max-w-4xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Thank you!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4 text-center">We’ve recorded your responses.</p>

            <div className="divide-y border rounded-md mb-6">
              {schema.fields.map((f) => (
                <div key={f.id} className="p-3 text-sm">
                  <div className="font-medium text-gray-900 mb-1">{f.label}</div>
                  <div className="text-gray-700">
                    {Array.isArray(submittedSnapshot[f.id])
                      ? (submittedSnapshot[f.id] as any[]).join(', ')
                      : String(submittedSnapshot[f.id] ?? '-')}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center text-sm text-gray-500">You may now close this tab.</div>
          </CardContent>
        </Card>
        <Branding />
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 md:p-6">
        <Card className="w-full max-w-lg md:max-w-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Thank you!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-700 mb-6">Your response has been recorded.</p>
            <div className="text-center text-sm text-gray-500">You may now close this tab.</div>
          </CardContent>
        </Card>
        <Branding />
      </div>
    );
  }

  if (!isQuiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
        <Card className="w-full max-w-3xl md:max-w-4xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold">{schema.title}</CardTitle>
            {schema.description && <p className="text-gray-600 mt-1">{schema.description}</p>}
          </CardHeader>
          <CardContent>
            {error && <div className="text-red-600 text-sm mb-3 p-3 bg-red-50 rounded">{error}</div>}
            {msg && <div className="text-green-600 text-sm mb-3 p-3 bg-green-50 rounded">{msg}</div>}

            <form onSubmit={submit} className="space-y-6">
              {schema.fields.map((f) => (
                <div key={f.id} className="space-y-2">
                  <label className="block text-base font-medium text-gray-900">
                    {f.label}
                    {f.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {f.helpText && <p className="text-xs text-gray-500 mb-1">{f.helpText}</p>}

                  {/* SHORT TEXT*/}
                  {f.type === 'short_text' && (
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={values[f.id] || ''}
                      onChange={(e) => handleChange(f, e.target.value)}
                      required={f.required}
                      placeholder={f.placeholder}
                    />
                  )}

                  {/* LONG TEXT*/}
                  {f.type === 'long_text' && (
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      value={values[f.id] || ''}
                      onChange={(e) => handleChange(f, e.target.value)}
                      required={f.required}
                      placeholder={f.placeholder}
                    />
                  )}

                  {/* EMAIL*/}
                  {f.type === 'email' && (
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={values[f.id] || ''}
                      onChange={(e) => handleChange(f, e.target.value)}
                      required={f.required}
                      placeholder={f.placeholder}
                    />
                  )}

                  {/* NUMBER */}
                  {f.type === 'number' && (
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={values[f.id] || ''}
                      onChange={(e) => handleChange(f, e.target.value)}
                      required={f.required}
                      placeholder={f.placeholder}
                    />
                  )}

                  {/* RADIO */}
                  {(f.type === 'radio' || f.type === 'single_select') && (
                    <div className="space-y-2">
                      {(f.options || []).map((o) => (
                        <label key={o} className="flex items-center gap-2 text-sm text-gray-800">
                          <input
                            type="radio"
                            name={f.id}
                            value={o}
                            checked={values[f.id] === o}
                            onChange={() => handleChange(f, o)}
                            required={f.required}
                          />
                          <span>{o}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* CHECKBOX */}
                  {f.type === 'checkbox' && (
                    <div className="space-y-2 text-sm text-gray-800">
                      {(f.options || []).map((o) => {
                        const arr: string[] = values[f.id] || [];
                        const checked = arr.includes(o);
                        return (
                          <label key={o} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const next = new Set(arr);
                                if (e.target.checked) next.add(o); else next.delete(o);
                                handleChange(f, Array.from(next));
                              }}
                            />
                            <span>{o}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Branding />
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-4 space-y-6 relative ${themeClasses.container}`}>
      {/* Watermark */}
      {isQuiz && quizStarted && (
        <div className="pointer-events-none select-none fixed inset-0 z-30 overflow-hidden" style={{opacity:0.07}}>
          <div className="w-full h-full" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent 0%, transparent 80px, rgba(0,0,0,0.4) 80px, rgba(0,0,0,0.4) 160px), repeating-linear-gradient(-45deg, transparent 0%, transparent 80px, rgba(0,0,0,0.4) 80px, rgba(0,0,0,0.4) 160px)`}}
          >
            {/* overlay text */}
            <div className="w-full h-full flex items-center justify-center" style={{transform:'rotate(-45deg)'}}>
              <span className="text-6xl font-bold text-gray-800 whitespace-nowrap" style={{userSelect:'none'}}>{waterMarkText}</span>
            </div>
          </div>
        </div>
      )}
      {/* Quiz Timer fixed header */}
      {isQuiz && quizStarted && schema.settings?.timer?.enabled && (
        <QuizTimer
          totalMinutes={schema.settings.timer.minutes}
          onTimeUp={handleTimeUp}
          showProgress={true}
          warningThreshold={5}
          autoStart={true}
          allowControls={false}
        />
      )}

      {/* Quiz Security Measures */}
      {/* Hide security monitor UI after start to avoid repetition */}

      {/* Main Form - questions only once started for quiz */}
      <Card className={themeClasses.card}>
        <CardHeader>
          <CardTitle className={themeClasses.title}>{schema.title}</CardTitle>
          {schema.description && <p className={`${themeClasses.description} mt-1`}>{schema.description}</p>}
          {isQuiz && !quizStarted && (
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                📝 Quiz Mode
              </span>
              {schema.settings?.timer?.enabled && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  ⏱️ {schema.settings.timer.minutes} minutes
                </span>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {msg && <div className="text-green-600 text-sm mb-3 p-3 bg-green-50 rounded">{msg}</div>}
          {error && <div className="text-red-600 text-sm mb-3 p-3 bg-red-50 rounded">{error}</div>}

          <form onSubmit={submit} className="space-y-6">
            {(!isQuiz || quizStarted) && schema.fields.map((f) => (
              <div key={f.id} className="space-y-2">
                <label className={`${themeClasses.label} ${quizExpired ? 'text-gray-400' : ''}`}>
                  {f.label}
                  {f.required && <span className={themeClasses.required}>*</span>}
                </label>

                {f.imageUrl && (
                  <div className="mb-2">
                    <img src={f.imageUrl} alt="Question" className="max-h-56 rounded border" />
                  </div>
                )}

                {f.helpText && <div className={`${themeClasses.helpText} mb-2`}>{f.helpText}</div>}

                {f.type === 'short_text' && (
                  <input
                    className={themeClasses.input}
                    value={values[f.id] || ''}
                    onChange={(e) => handleChange(f, e.target.value)}
                    required={f.required}
                    placeholder={f.placeholder}
                    disabled={quizExpired}
                  />
                )}

                {f.type === 'long_text' && (
                  <Textarea
                    value={values[f.id] || ''}
                    onChange={(e) => handleChange(f, e.target.value)}
                    required={f.required}
                    placeholder={f.placeholder}
                    rows={4}
                    disabled={quizExpired}
                    className={themeClasses.textarea}
                  />
                )}

                {f.type === 'email' && (
                  <input
                    type="email"
                    className={themeClasses.input}
                    value={values[f.id] || ''}
                    onChange={(e) => handleChange(f, e.target.value)}
                    required={f.required}
                    placeholder={f.placeholder}
                    disabled={quizExpired}
                  />
                )}

                {f.type === 'number' && (
                  <input
                    type="number"
                    className={themeClasses.input}
                    value={values[f.id] || ''}
                    onChange={(e) => handleChange(f, e.target.value)}
                    required={f.required}
                    placeholder={f.placeholder}
                    disabled={quizExpired}
                  />
                )}

                {f.type === 'date' && (
                  <input
                    type="date"
                    className={themeClasses.input}
                    value={values[f.id] || ''}
                    onChange={(e) => handleChange(f, e.target.value)}
                    required={f.required}
                    disabled={quizExpired}
                  />
                )}

                {f.type === 'time' && (
                  <input
                    type="time"
                    className={themeClasses.input}
                    value={values[f.id] || ''}
                    onChange={(e) => handleChange(f, e.target.value)}
                    required={f.required}
                    disabled={quizExpired}
                  />
                )}

                {f.type === 'dropdown' && !f.multiple && (
                  <select
                    className={themeClasses.select}
                    value={values[f.id] || ''}
                    onChange={(e) => handleChange(f, e.target.value)}
                    required={f.required}
                    disabled={quizExpired}
                  >
                    <option value="">Select an option</option>
                    {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}

                {f.type === 'dropdown' && f.multiple && (
                  <select
                    multiple
                    className={themeClasses.select}
                    value={values[f.id] || []}
                    onChange={(e) => handleChange(f, Array.from(e.target.selectedOptions).map((o) => o.value))}
                    disabled={quizExpired}
                  >
                    {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}

                {(f.type === 'radio' || f.type === 'single_select') && (
                  <div className={themeClasses.radioContainer}>
                    {(f.options || []).map((o) => (
                      <label key={o} className={themeClasses.radioLabel}>
                        <input
                          type="radio"
                          name={f.id}
                          value={o}
                          checked={values[f.id] === o}
                          onChange={() => handleChange(f, o)}
                          required={f.required}
                          disabled={quizExpired}
                          className={themeClasses.radioInput}
                        />
                        <span className={themeClasses.radioText}>{o}</span>
                      </label>
                    ))}
                  </div>
                )}

                {f.type === 'checkbox' && (
                  <div className={themeClasses.checkboxContainer}>
                    {(f.options || []).map((o) => {
                      const arr: string[] = values[f.id] || [];
                      const checked = arr.includes(o);
                      return (
                        <label key={o} className={themeClasses.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const next = new Set(arr);
                              if (e.target.checked) next.add(o); else next.delete(o);
                              handleChange(f, Array.from(next));
                            }}
                            disabled={quizExpired}
                            className={themeClasses.checkboxInput}
                          />
                          <span className={themeClasses.checkboxText}>{o}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-4 border-t">
              <Button type="submit" disabled={submitting} className={themeClasses.button}>
                {submitting ? 'Submitting...' : isQuiz ? 'Submit Quiz' : 'Submit'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Branding />
    </div>
  );
}

// Global style for no-select
if (typeof window !== 'undefined') {
  const styleId = 'quiz-no-select-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `.no-select { -webkit-user-select:none; -moz-user-select:none; -ms-user-select:none; user-select:none; }`;
    document.head.appendChild(style);
  }
}



'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2, Lock, Mail, Shield, User, X, XCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import SecurityQuestionFieldset, {
  createSecurityQuestionDrafts,
  SecurityQuestionDraft,
} from '@/components/auth/SecurityQuestionFieldset';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { normalizeSecurityAnswer } from '@/lib/auth/securityAnswers';

function getCompletedSecurityQuestions(securityQuestions: SecurityQuestionDraft[]) {
  return securityQuestions.filter((securityQuestion) => (
    Boolean(securityQuestion.questionId) && Boolean(normalizeSecurityAnswer(securityQuestion.answer))
  ));
}

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export default function SignUpPage() {
  const { loading, isAuthenticated, register } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestionDraft[]>(
    createSecurityQuestionDrafts()
  );
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [usernameError, setUsernameError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  // Real-time username availability check
  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus('idle');
      setUsernameError('');
      return;
    }

    setUsernameStatus('checking');
    setUsernameError('');

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/auth/check-username?username=${encodeURIComponent(username.trim())}`
        );
        const data = await res.json();

        if (!res.ok) {
          setUsernameStatus('invalid');
          setUsernameError(data.error || 'Invalid username');
        } else {
          setUsernameStatus(data.available ? 'available' : 'taken');
          setUsernameError(data.available ? '' : 'Username is already taken');
        }
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  function validateForm(): string {
    if (!firstName.trim()) return 'First name is required';
    if (!lastName.trim()) return 'Last name is required';
    if (!username.trim()) return 'Username is required';

    if (usernameStatus === 'checking') return 'Please wait while we check username availability';
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
      return usernameError || 'Please choose a different username';
    }
    if (usernameStatus !== 'available') return 'Please enter a valid username';

    if (!email.trim()) return 'Email is required';
    if (!email.includes('@')) return 'Please enter a valid email address';

    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (password !== confirmPassword) return 'Passwords do not match';

    const completedSecurityQuestions = getCompletedSecurityQuestions(securityQuestions);
    if (completedSecurityQuestions.length < 3) return 'Complete at least 3 security questions';

    const hasPartialQuestionRow = securityQuestions.some((sq) => {
      const hasQuestion = Boolean(sq.questionId);
      const hasAnswer = Boolean(normalizeSecurityAnswer(sq.answer));
      return hasQuestion !== hasAnswer;
    });
    if (hasPartialQuestionRow) return 'Complete or remove unfinished security question rows';

    const uniqueQuestionIds = new Set<string>();
    const normalizedAnswers = new Set<string>();
    for (const sq of completedSecurityQuestions) {
      const normalizedAnswer = normalizeSecurityAnswer(sq.answer);
      if (uniqueQuestionIds.has(sq.questionId)) return 'Each selected security question must be unique';
      if (normalizedAnswers.has(normalizedAnswer)) return 'Each security question answer must be unique';
      uniqueQuestionIds.add(sq.questionId);
      normalizedAnswers.add(normalizedAnswer);
    }

    return '';
  }

  // Step 1: validate + check email duplicate → show privacy modal
  async function handleContinue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.available) {
        setError('An account with this email address already exists');
        return;
      }
    } catch {
      setError('Could not verify email. Please try again.');
      return;
    } finally {
      setIsVerifying(false);
    }

    setShowPrivacyModal(true);
  }

  // Step 2: user agreed — create account
  async function handleAgreeAndCreate() {
    setShowPrivacyModal(false);
    setIsSubmitting(true);
    setError('');

    const result = await register({
      firstName,
      lastName,
      username,
      email,
      phoneNumber,
      password,
      securityQuestions: getCompletedSecurityQuestions(securityQuestions),
    });

    if (!result.success) {
      setError(result.message || 'Registration failed');
      setIsSubmitting(false);
      return;
    }

    setSuccess('Account created successfully. Redirecting to your dashboard...');
    window.location.assign('/dashboard');
  }

  function renderUsernameStatus() {
    if (usernameStatus === 'checking') return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    if (usernameStatus === 'available') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') return <XCircle className="h-4 w-4 text-red-500" />;
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Navigation showHome={true} showUserMenu={false} showBreadcrumbs={true} />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
            <CardDescription className="text-center">
              Sign up once, choose your recovery questions, and start using AI Toolbox.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleContinue} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="relative">
                  <User className="absolute left-3 top-[2.85rem] h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    label="First Name"
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="pl-10"
                    disabled={isVerifying || isSubmitting}
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-[2.85rem] h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    label="Last Name"
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="pl-10"
                    disabled={isVerifying || isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="relative">
                  <Input
                    id="username"
                    label="Username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    disabled={isVerifying || isSubmitting}
                    className="pr-10"
                    helperText={!usernameError ? 'Letters, numbers, underscores (3–20 chars)' : undefined}
                    error={usernameError || undefined}
                  />
                  <div className="absolute right-3 top-[2.85rem]">
                    {renderUsernameStatus()}
                  </div>
                </div>
                <span className="sr-only" aria-live="polite">
                  {usernameStatus === 'checking' && 'Checking username availability'}
                  {usernameStatus === 'available' && 'Username is available'}
                  {usernameStatus === 'taken' && 'Username is already taken'}
                  {usernameStatus === 'invalid' && usernameError}
                </span>
                <Input
                  id="phoneNumber"
                  label="Phone Number"
                  type="tel"
                  placeholder="Optional"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  disabled={isVerifying || isSubmitting}
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-[2.85rem] h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="pl-10"
                  disabled={isVerifying || isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-[2.85rem] h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="pl-10 pr-10"
                    helperText="Must be at least 8 characters long"
                    disabled={isVerifying || isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((c) => !c)}
                    className="absolute right-3 top-[2.85rem] text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-[2.85rem] h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="pl-10 pr-10"
                    disabled={isVerifying || isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((c) => !c)}
                    className="absolute right-3 top-[2.85rem] text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <SecurityQuestionFieldset
                value={securityQuestions}
                onChange={setSecurityQuestions}
                disabled={isVerifying || isSubmitting}
              />

              <Button type="submit" className="w-full" loading={isVerifying || isSubmitting}>
                {isVerifying ? 'Verifying…' : isSubmitting ? 'Creating account…' : 'Continue'}
              </Button>
            </form>

            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/sign-in" className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
                  Sign in
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h2 className="text-[15px] font-semibold text-slate-800">Privacy Policy & Terms</h2>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-[13px] text-slate-600 leading-relaxed">
              <p className="text-[13px] font-medium text-slate-800">
                Before creating your account, please read and agree to our Privacy Policy and Terms of Service.
              </p>

              <section>
                <h3 className="font-semibold text-slate-700 mb-1">1. Data We Collect</h3>
                <p>We collect your name, username, email address, and security question answers to create and manage your account. Security answers are stored as one-way hashed values — we cannot read them.</p>
              </section>

              <section>
                <h3 className="font-semibold text-slate-700 mb-1">2. How We Use Your Data</h3>
                <p>Your data is used to authenticate you, allow password recovery via security questions, and personalise your experience on AI Toolbox. We do not sell your personal information to third parties.</p>
              </section>

              <section>
                <h3 className="font-semibold text-slate-700 mb-1">3. Tool Usage</h3>
                <p>We log which tools you use to improve our services and show you personalised recommendations. Usage data is associated with your account but is never shared externally.</p>
              </section>

              <section>
                <h3 className="font-semibold text-slate-700 mb-1">4. Security</h3>
                <p>Passwords and security answers are hashed using industry-standard algorithms before storage. We never store plain-text credentials.</p>
              </section>

              <section>
                <h3 className="font-semibold text-slate-700 mb-1">5. Your Rights</h3>
                <p>You may request deletion of your account and data at any time by contacting us. You can update your profile information from your account settings.</p>
              </section>

              <section>
                <h3 className="font-semibold text-slate-700 mb-1">6. Changes to This Policy</h3>
                <p>We may update this policy from time to time. Continued use of AI Toolbox after changes constitutes acceptance of the updated policy.</p>
              </section>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 space-y-3">
              <p className="text-[11px] text-slate-400 text-center">
                By clicking "I Agree &amp; Create Account" you confirm you have read and accept our Privacy Policy and Terms of Service.
              </p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="flex-1 h-9 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAgreeAndCreate}
                  className="flex-1 h-9 text-[13px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  I Agree &amp; Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

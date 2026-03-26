'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2, Lock, Mail, Shield, Sparkles, User, X, XCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import SecurityQuestionFieldset, {
  createSecurityQuestionDrafts,
  SecurityQuestionDraft,
} from '@/components/auth/SecurityQuestionFieldset';
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

// ─── Confetti canvas ──────────────────────────────────────────────────────────
function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ['#f97316', '#ec4899', '#a855f7', '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#06b6d4'];
    const pieces: {
      x: number; y: number; vx: number; vy: number;
      rotation: number; rotSpeed: number;
      w: number; h: number; color: string; opacity: number;
    }[] = [];

    for (let i = 0; i < 180; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        w: 8 + Math.random() * 8,
        h: 4 + Math.random() * 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: 0.85 + Math.random() * 0.15,
      });
    }

    let frame: number;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.07;
        p.rotation += p.rotSpeed;
        if (p.y < canvas.height + 20) alive = true;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive) frame = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[60]"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}

// ─── Celebration screen ───────────────────────────────────────────────────────
function CelebrationScreen({ firstName }: { firstName: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-violet-50">
      {/* Soft blush glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-pink-300/40 via-rose-200/30 to-purple-300/35 blur-3xl animate-[blushPulse_2.6s_ease-in-out_infinite]" />

      {/* Bloom petals */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-pink-300/70"
            style={{
              width: `${8 + (index % 4) * 5}px`,
              height: `${8 + (index % 3) * 6}px`,
              left: `${(index * 11) % 100}%`,
              bottom: `${-10 - (index % 5) * 8}%`,
              animation: `petalRise ${4.2 + (index % 4) * 0.6}s ease-in-out ${index * 0.15}s infinite`,
              opacity: 0.42,
            }}
          />
        ))}
      </div>

      <ConfettiCanvas />
      <div className="relative text-center px-8 animate-[celebrationPop_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]">
        {/* Bloom rings */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-72 h-72 rounded-full bg-pink-200/40 animate-ping" style={{ animationDuration: '1.6s' }} />
        </div>
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full bg-purple-200/50 animate-ping" style={{ animationDuration: '1.2s' }} />
        </div>

        {/* Icon */}
        <div className="flex items-center justify-center mb-5">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-2xl shadow-purple-300">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-800 mb-2">
          Welcome, {firstName}! 🎉
        </h1>
        <p className="text-lg text-slate-500 mb-1">Your account is ready.</p>
        <p className="text-sm text-slate-400">Blush mode: ON. Taking you to your dashboard…</p>
      </div>

      <style>{`
        @keyframes celebrationPop {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }

        @keyframes blushPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
          50% { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
        }

        @keyframes petalRise {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          15% { opacity: 0.45; }
          55% {
            transform: translateY(-42vh) translateX(16px) rotate(160deg);
            opacity: 0.55;
          }
          100% {
            transform: translateY(-88vh) translateX(-12px) rotate(320deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function useFormProgress(
  firstName: string, lastName: string,
  usernameStatus: UsernameStatus,
  email: string, password: string, confirmPassword: string,
  completedSQCount: number,
) {
  const steps = [
    firstName.trim().length > 0,                         // 14%
    lastName.trim().length > 0,                          // 14%
    usernameStatus === 'available',                      // 15%
    email.trim().includes('@'),                          // 14%
    password.length >= 8,                               // 14%
    confirmPassword.length > 0 && password === confirmPassword, // 15%
    completedSQCount >= 3,                              // 14%
  ];
  const score = steps.filter(Boolean).length;
  return Math.round((score / steps.length) * 100);
}

function progressColor(pct: number): string {
  // 0 → red, 50 → orange/yellow, 100 → green
  if (pct < 50) {
    // red (#ef4444) → yellow (#eab308)
    const t = pct / 50;
    const r = Math.round(239 + (234 - 239) * t);
    const g = Math.round(68  + (179 - 68)  * t);
    const b = Math.round(68  + (8   - 68)  * t);
    return `rgb(${r},${g},${b})`;
  } else {
    // yellow (#eab308) → green (#22c55e)
    const t = (pct - 50) / 50;
    const r = Math.round(234 + (34  - 234) * t);
    const g = Math.round(179 + (197 - 179) * t);
    const b = Math.round(8   + (94  - 8)   * t);
    return `rgb(${r},${g},${b})`;
  }
}

function getProgressMood(pct: number): string {
  if (pct === 0) return 'Let’s begin ✨';
  if (pct < 35) return 'Great start 🌱';
  if (pct < 70) return 'You’re doing awesome 🔥';
  if (pct < 100) return 'Almost there 🌸';
  return 'Ready to bloom 💚';
}

// ─── Main page ────────────────────────────────────────────────────────────────
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
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const completedSQCount = getCompletedSecurityQuestions(securityQuestions).length;
  const progress = useFormProgress(firstName, lastName, usernameStatus, email, password, confirmPassword, completedSQCount);
  const barColor = progressColor(progress);
  const progressMood = getProgressMood(progress);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  // Real-time username availability
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
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username.trim())}`);
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
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') return usernameError || 'Please choose a different username';
    if (usernameStatus !== 'available') return 'Please enter a valid username';
    if (!email.trim()) return 'Email is required';
    if (!email.includes('@')) return 'Please enter a valid email address';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (password !== confirmPassword) return 'Passwords do not match';
    if (completedSQCount < 3) return 'Complete at least 3 security questions';
    const hasPartial = securityQuestions.some((sq) => {
      const hasQ = Boolean(sq.questionId);
      const hasA = Boolean(normalizeSecurityAnswer(sq.answer));
      return hasQ !== hasA;
    });
    if (hasPartial) return 'Complete or remove unfinished security question rows';
    const ids = new Set<string>();
    const answers = new Set<string>();
    for (const sq of getCompletedSecurityQuestions(securityQuestions)) {
      const a = normalizeSecurityAnswer(sq.answer);
      if (ids.has(sq.questionId)) return 'Each selected security question must be unique';
      if (answers.has(a)) return 'Each security question answer must be unique';
      ids.add(sq.questionId);
      answers.add(a);
    }
    return '';
  }

  async function handleContinue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }

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

  async function handleAgreeAndCreate() {
    setShowPrivacyModal(false);
    setIsSubmitting(true);
    setError('');

    const result = await register({
      firstName, lastName, username, email, phoneNumber, password,
      securityQuestions: getCompletedSecurityQuestions(securityQuestions),
    });

    if (!result.success) {
      setError(result.message || 'Registration failed');
      setIsSubmitting(false);
      return;
    }

    setCelebrating(true);
    setTimeout(() => { window.location.assign('/dashboard'); }, 3200);
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
  if (celebrating) return <CelebrationScreen firstName={firstName} />;

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--color-background)]">
      {/* Lightweight header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <span className="text-base font-bold text-[var(--color-text-primary)]">AI Toolbox</span>
        </Link>
        <Link href="/sign-in" className="text-sm font-medium text-[var(--color-primary)]">
          Sign In
        </Link>
      </div>

      {/* Scrollable form area */}
      <div className="flex-1 flex items-start sm:items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
        <Card className="w-full max-w-2xl">
          {/* Progress bar */}
          <div className="h-2 w-full rounded-t-xl overflow-hidden bg-slate-100/90">
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${barColor}, ${progress === 100 ? '#22c55e' : '#f59e0b'})`,
                boxShadow: `0 0 14px ${barColor}`,
              }}
            />
          </div>

          <CardHeader className="space-y-1 pt-5 px-4 sm:px-6">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-xl sm:text-2xl font-bold">Create your account</CardTitle>
              <span
                className="text-[11px] font-semibold tabular-nums transition-colors duration-500 shrink-0"
                style={{ color: barColor }}
              >
                {progress}%
              </span>
            </div>
            <CardDescription className="text-[13px] sm:text-sm">
              Sign up once, choose your recovery questions, and start using AI Toolbox.
            </CardDescription>
            <div className="flex items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/50 px-2.5 py-1.5">
              <p className="text-[11px] font-medium text-[var(--color-text-secondary)]">{progressMood}</p>
              <div className="relative h-2 w-16 overflow-hidden rounded-full bg-white ring-1 ring-[var(--color-border)]">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${Math.max(progress, 6)}%`, backgroundColor: barColor }}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-4 sm:px-6">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 sm:px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleContinue} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="relative">
                  <User className="absolute left-3 top-[2.85rem] h-4 w-4 text-[var(--color-text-secondary)]" />
                  <Input id="firstName" label="First Name" type="text" placeholder="First name"
                    value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    className="pl-10" disabled={isVerifying || isSubmitting} />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-[2.85rem] h-4 w-4 text-[var(--color-text-secondary)]" />
                  <Input id="lastName" label="Last Name" type="text" placeholder="Last name"
                    value={lastName} onChange={(e) => setLastName(e.target.value)}
                    className="pl-10" disabled={isVerifying || isSubmitting} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="relative">
                  <Input id="username" label="Username" type="text" placeholder="Choose a username"
                    value={username} onChange={(e) => setUsername(e.target.value)}
                    disabled={isVerifying || isSubmitting} className="pr-10"
                    helperText={!usernameError ? 'Letters, numbers, underscores (3\u201320 chars)' : undefined}
                    error={usernameError || undefined} />
                  <div className="absolute right-3 top-[2.85rem]">{renderUsernameStatus()}</div>
                </div>
                <span className="sr-only" aria-live="polite">
                  {usernameStatus === 'checking' && 'Checking username availability'}
                  {usernameStatus === 'available' && 'Username is available'}
                  {usernameStatus === 'taken' && 'Username is already taken'}
                  {usernameStatus === 'invalid' && usernameError}
                </span>
                <Input id="phoneNumber" label="Phone Number" type="tel" placeholder="Optional"
                  value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isVerifying || isSubmitting} />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-[2.85rem] h-4 w-4 text-[var(--color-text-secondary)]" />
                <Input id="email" label="Email" type="email" placeholder="Enter your email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="pl-10" disabled={isVerifying || isSubmitting} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-[2.85rem] h-4 w-4 text-[var(--color-text-secondary)]" />
                  <Input id="password" label="Password" type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10" helperText="Must be at least 8 characters long"
                    disabled={isVerifying || isSubmitting} />
                  <button type="button" onClick={() => setShowPassword((c) => !c)}
                    className="absolute right-3 top-[2.85rem] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-[2.85rem] h-4 w-4 text-[var(--color-text-secondary)]" />
                  <Input id="confirmPassword" label="Confirm Password" type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10" disabled={isVerifying || isSubmitting} />
                  <button type="button" onClick={() => setShowConfirmPassword((c) => !c)}
                    className="absolute right-3 top-[2.85rem] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <SecurityQuestionFieldset value={securityQuestions} onChange={setSecurityQuestions}
                disabled={isVerifying || isSubmitting} />

              <Button type="submit" className="w-full h-11" loading={isVerifying || isSubmitting}>
                {isVerifying ? 'Verifying\u2026' : isSubmitting ? 'Creating account\u2026' : 'Continue'}
              </Button>
            </form>

            <p className="text-center text-sm text-[var(--color-text-secondary)]">
              Already have an account?{' '}
              <Link href="/sign-in" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--color-surface)] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg flex flex-col max-h-[85vh] sm:max-h-[90vh]">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--color-primary)]" />
                <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Privacy Policy &amp; Terms</h2>
              </div>
              <button onClick={() => setShowPrivacyModal(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4 text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
              <p className="text-[13px] font-medium text-[var(--color-text-primary)]">
                Before creating your account, please read and agree to our Privacy Policy and Terms of Service.
              </p>
              <section>
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">1. Data We Collect</h3>
                <p>We collect your name, username, email address, and security question answers to create and manage your account. Security answers are stored as one-way hashed values — we cannot read them.</p>
              </section>
              <section>
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">2. How We Use Your Data</h3>
                <p>Your data is used to authenticate you, allow password recovery via security questions, and personalise your experience on AI Toolbox. We do not sell your personal information to third parties.</p>
              </section>
              <section>
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">3. Tool Usage</h3>
                <p>We log which tools you use to improve our services and show you personalised recommendations. Usage data is associated with your account but is never shared externally.</p>
              </section>
              <section>
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">4. Security</h3>
                <p>Passwords and security answers are hashed using industry-standard algorithms before storage. We never store plain-text credentials.</p>
              </section>
              <section>
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">5. Your Rights</h3>
                <p>You may request deletion of your account and data at any time by contacting us. You can update your profile information from your account settings.</p>
              </section>
              <section>
                <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">6. Changes to This Policy</h3>
                <p>We may update this policy from time to time. Continued use of AI Toolbox after changes constitutes acceptance of the updated policy.</p>
              </section>
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-[var(--color-border)] space-y-3">
              <p className="text-[11px] text-[var(--color-text-secondary)] text-center">
                By clicking &ldquo;I Agree &amp; Create Account&rdquo; you confirm you have read and accept our Privacy Policy and Terms of Service.
              </p>
              <div className="flex gap-2.5">
                <button onClick={() => setShowPrivacyModal(false)}
                  className="flex-1 h-11 sm:h-9 text-[13px] font-medium text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-muted)] transition-colors">
                  Cancel
                </button>
                <button onClick={handleAgreeAndCreate}
                  className="flex-1 h-11 sm:h-9 text-[13px] font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors flex items-center justify-center gap-2">
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

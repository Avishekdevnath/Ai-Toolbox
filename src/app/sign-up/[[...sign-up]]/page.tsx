'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const redirectToDashboard = () => {
    window.location.assign('/dashboard');
  };

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  function validateForm() {
    if (!firstName.trim()) {
      return 'First name is required';
    }

    if (!lastName.trim()) {
      return 'Last name is required';
    }

    if (!username.trim()) {
      return 'Username is required';
    }

    if (!email.trim()) {
      return 'Email is required';
    }

    if (!email.includes('@')) {
      return 'Please enter a valid email address';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    const completedSecurityQuestions = getCompletedSecurityQuestions(securityQuestions);

    if (completedSecurityQuestions.length < 3) {
      return 'Complete at least 3 security questions';
    }

    const hasPartialQuestionRow = securityQuestions.some((securityQuestion) => {
      const hasQuestion = Boolean(securityQuestion.questionId);
      const hasAnswer = Boolean(normalizeSecurityAnswer(securityQuestion.answer));
      return hasQuestion !== hasAnswer;
    });

    if (hasPartialQuestionRow) {
      return 'Complete or remove unfinished security question rows';
    }

    const uniqueQuestionIds = new Set<string>();
    const normalizedAnswers = new Set<string>();

    for (const securityQuestion of completedSecurityQuestions) {
      const normalizedAnswer = normalizeSecurityAnswer(securityQuestion.answer);

      if (uniqueQuestionIds.has(securityQuestion.questionId)) {
        return 'Each selected security question must be unique';
      }

      if (normalizedAnswers.has(normalizedAnswer)) {
        return 'Each security question answer must be unique';
      }

      uniqueQuestionIds.add(securityQuestion.questionId);
      normalizedAnswers.add(normalizedAnswer);
    }

    return '';
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

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
    redirectToDashboard();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

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

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  id="username"
                  label="Username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  disabled={isSubmitting}
                />
                <Input
                  id="phoneNumber"
                  label="Phone Number"
                  type="tel"
                  placeholder="Optional"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
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
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute right-3 top-[2.85rem] text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <SecurityQuestionFieldset
                value={securityQuestions}
                onChange={setSecurityQuestions}
                disabled={isSubmitting}
              />

              <Button type="submit" className="w-full" loading={isSubmitting}>
                Create Account
              </Button>
            </form>

            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href="/sign-in"
                  className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

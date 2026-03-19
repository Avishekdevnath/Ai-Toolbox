import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { hashSecurityAnswer, normalizeSecurityAnswer } from '@/lib/auth/securityAnswers';
import {
  isValidSecurityQuestionId,
  SECURITY_QUESTION_OPTIONS,
} from '@/lib/auth/securityQuestions';
import { securityQuestionChallengeService } from '@/lib/auth/securityQuestionChallengeService';
import { AuthUserModel } from '@/models/AuthUserModel';

interface SecurityQuestionInput {
  questionId: string;
  answer: string;
}

function validateSecurityQuestions(securityQuestions: SecurityQuestionInput[]) {
  if (!Array.isArray(securityQuestions) || securityQuestions.length < 3 || securityQuestions.length > 5) {
    return 'Please select 3 to 5 security questions';
  }

  const uniqueQuestionIds = new Set<string>();
  const normalizedAnswers = new Set<string>();

  for (const securityQuestion of securityQuestions) {
    const normalizedAnswer = typeof securityQuestion?.answer === 'string'
      ? normalizeSecurityAnswer(securityQuestion.answer)
      : '';

    if (!securityQuestion?.questionId || !isValidSecurityQuestionId(securityQuestion.questionId)) {
      return 'Each security question must use a valid question option';
    }

    if (uniqueQuestionIds.has(securityQuestion.questionId)) {
      return 'Security question selections must be unique';
    }

    if (!normalizedAnswer) {
      return 'Each security question answer is required';
    }

    if (normalizedAnswers.has(normalizedAnswer)) {
      return 'Security question answers must be unique';
    }

    uniqueQuestionIds.add(securityQuestion.questionId);
    normalizedAnswers.add(normalizedAnswer);
  }

  return null;
}

async function getAuthenticatedUser() {
  const token = await getAuthCookie();
  const claims = token ? verifyAccessToken(token) : null;

  if (!claims?.id) {
    return null;
  }

  return AuthUserModel.findById(claims.id);
}

export async function GET() {
  const token = await getAuthCookie();
  const claims = token ? verifyAccessToken(token) : null;

  if (!claims?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const user = await AuthUserModel.findById(claims.id);

  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    catalog: SECURITY_QUESTION_OPTIONS,
    selectedQuestionIds: (user.securityQuestions ?? []).map((question) => question.questionId),
  });
}

export async function PUT(request: NextRequest) {
  const token = await getAuthCookie();
  const claims = token ? verifyAccessToken(token) : null;

  if (!claims?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  const body = await request.json();
  const { currentPassword, securityQuestions } = body;

  if (!currentPassword) {
    return NextResponse.json(
      { success: false, error: 'Current password is required' },
      { status: 400 }
    );
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isCurrentPasswordValid) {
    return NextResponse.json(
      { success: false, error: 'Current password is incorrect' },
      { status: 400 }
    );
  }

  const validationError = validateSecurityQuestions(securityQuestions);
  if (validationError) {
    return NextResponse.json({ success: false, error: validationError }, { status: 400 });
  }

  const hashedSecurityQuestions = await Promise.all(
    (securityQuestions as SecurityQuestionInput[]).map(async (securityQuestion) => ({
      questionId: securityQuestion.questionId,
      answerHash: await hashSecurityAnswer(securityQuestion.answer),
    }))
  );

  const updatedUser = await AuthUserModel.replaceSecurityQuestions(claims.id, hashedSecurityQuestions);

  await securityQuestionChallengeService.invalidateChallengesForUser(claims.id);

  return NextResponse.json({
    success: true,
    selectedQuestionIds: (updatedUser?.securityQuestions ?? []).map((question) => question.questionId),
  });
}

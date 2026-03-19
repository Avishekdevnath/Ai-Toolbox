import { NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { securityQuestionChallengeService } from '@/lib/auth/securityQuestionChallengeService';
import { AuthUserModel } from '@/models/AuthUserModel';

export async function POST() {
  const token = await getAuthCookie();
  const claims = token ? verifyAccessToken(token) : null;

  if (!claims?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const user = await AuthUserModel.findById(claims.id);

  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  if (!Array.isArray(user.securityQuestions) || user.securityQuestions.length < 3) {
    return NextResponse.json(
      { success: false, error: 'Security questions are not configured' },
      { status: 400 }
    );
  }

  const challenge = await securityQuestionChallengeService.createChallenge(claims.id, 'change_password');

  return NextResponse.json({
    success: true,
    challengeId: challenge.id,
    questions: challenge.questions,
  });
}

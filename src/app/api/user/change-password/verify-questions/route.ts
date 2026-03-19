import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { securityQuestionChallengeService } from '@/lib/auth/securityQuestionChallengeService';

export async function POST(request: NextRequest) {
  const token = await getAuthCookie();
  const claims = token ? verifyAccessToken(token) : null;

  if (!claims?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const challengeId = typeof body?.challengeId === 'string' ? body.challengeId : '';
  const answers = Array.isArray(body?.answers) ? body.answers : [];

  if (!challengeId || answers.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Challenge answers are required' },
      { status: 400 }
    );
  }

  const result = await securityQuestionChallengeService.verifyChallengeAnswers(challengeId, answers);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error || 'Verification failed' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Security questions verified successfully',
  });
}

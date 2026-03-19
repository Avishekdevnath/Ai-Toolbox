import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth/cookies';
import { securityQuestionChallengeService } from '@/lib/auth/securityQuestionChallengeService';
import { AuthUserModel } from '@/models/AuthUserModel';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const challengeId = typeof body?.challengeId === 'string' ? body.challengeId : '';
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

  if (!challengeId || !newPassword) {
    return NextResponse.json(
      { success: false, error: 'Challenge ID and new password are required' },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { success: false, error: 'Password must be at least 8 characters long' },
      { status: 400 }
    );
  }

  const challenge = await securityQuestionChallengeService.getVerifiedChallenge(
    challengeId,
    'forgot_password'
  );

  if (!challenge) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired recovery challenge' },
      { status: 400 }
    );
  }

  const consumed = await securityQuestionChallengeService.consumeVerifiedChallenge(challengeId, 'forgot_password');

  if (!consumed) {
    return NextResponse.json(
      { success: false, error: 'Challenge has already been used or expired' },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await AuthUserModel.updatePassword(challenge.userId, hashedPassword);
  await securityQuestionChallengeService.invalidateChallengesForUser(challenge.userId, 'forgot_password');
  await clearAuthCookie();

  return NextResponse.json({
    success: true,
    message: 'Password reset successfully',
  });
}

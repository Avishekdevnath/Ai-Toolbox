import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie, getAuthCookie } from '@/lib/auth/cookies';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { securityQuestionChallengeService } from '@/lib/auth/securityQuestionChallengeService';
import { AuthUserModel } from '@/models/AuthUserModel';

export async function POST(request: NextRequest) {
  const token = await getAuthCookie();
  const claims = token ? verifyAccessToken(token) : null;

  if (!claims?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';
  const verification = body?.verification;

  if (!newPassword) {
    return NextResponse.json(
      { success: false, error: 'New password is required' },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { success: false, error: 'Password must be at least 8 characters long' },
      { status: 400 }
    );
  }

  if (!verification || typeof verification !== 'object') {
    return NextResponse.json(
      { success: false, error: 'Password verification is required' },
      { status: 400 }
    );
  }

  if (verification.method === 'current_password') {
    const currentPassword =
      typeof verification.currentPassword === 'string' ? verification.currentPassword : '';

    if (!currentPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password is required' },
        { status: 400 }
      );
    }

    const user = await AuthUserModel.findById(claims.id);

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }
  } else if (verification.method === 'security_questions') {
    const challengeId = typeof verification.challengeId === 'string' ? verification.challengeId : '';

    if (!challengeId) {
      return NextResponse.json(
        { success: false, error: 'Challenge ID is required' },
        { status: 400 }
      );
    }

    const challenge = await securityQuestionChallengeService.getVerifiedChallenge(
      challengeId,
      'change_password'
    );

    if (!challenge || challenge.userId !== claims.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired password change challenge' },
        { status: 400 }
      );
    }

    const consumed = await securityQuestionChallengeService.consumeVerifiedChallenge(challengeId, 'change_password');

    if (!consumed) {
      return NextResponse.json(
        { success: false, error: 'Challenge has already been used or expired' },
        { status: 400 }
      );
    }
  } else {
    return NextResponse.json(
      { success: false, error: 'Unsupported verification method' },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await AuthUserModel.updatePassword(claims.id, hashedPassword);
  await securityQuestionChallengeService.invalidateChallengesForUser(claims.id, 'change_password');
  await clearAuthCookie();

  return NextResponse.json({
    success: true,
    message: 'Password updated successfully',
  });
}

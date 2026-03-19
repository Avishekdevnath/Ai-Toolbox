import { NextRequest, NextResponse } from 'next/server';
import { AuthUserModel } from '@/models/AuthUserModel';
import { securityQuestionChallengeService } from '@/lib/auth/securityQuestionChallengeService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = typeof body?.identifier === 'string' ? body.identifier.trim() : '';

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Email or username is required' },
        { status: 400 }
      );
    }

    const user = await AuthUserModel.findByEmailOrUsername(identifier);
    const configuredQuestions = user?.securityQuestions ?? [];

    if (!user || configuredQuestions.length < 3) {
      return NextResponse.json({ success: true });
    }

    const challenge = await securityQuestionChallengeService.createChallenge(
      user._id.toString(),
      'forgot_password'
    );

    return NextResponse.json({
      success: true,
      challengeId: challenge.id,
      questions: challenge.questions,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

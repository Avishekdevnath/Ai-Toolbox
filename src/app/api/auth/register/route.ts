import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/mongodb';
import { UserAuthService } from '@/lib/userAuthService';
import { hashSecurityAnswer, normalizeSecurityAnswer } from '@/lib/auth/securityAnswers';
import { isValidSecurityQuestionId } from '@/lib/auth/securityQuestions';
import { getVisitorIdFromCookieStore } from '@/lib/visitorId';
import { getVisitorIdentityModel } from '@/models/VisitorIdentityModel';

interface RegistrationSecurityQuestionInput {
  questionId: string;
  answer: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      username,
      password,
      name,
      firstName,
      lastName,
      phoneNumber,
      securityQuestions,
    } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const normalizedUsername = username?.toLowerCase().trim();
    if (!normalizedUsername || !/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      return NextResponse.json(
        { success: false, error: 'Username is required (3–20 chars: letters, numbers, underscores only)' },
        { status: 400 }
      );
    }

    if (!Array.isArray(securityQuestions) || securityQuestions.length < 3 || securityQuestions.length > 5) {
      return NextResponse.json(
        { success: false, error: 'Please select 3 to 5 security questions' },
        { status: 400 }
      );
    }

    const uniqueQuestionIds = new Set<string>();
    const normalizedAnswers = new Set<string>();

    for (const securityQuestion of securityQuestions as RegistrationSecurityQuestionInput[]) {
      const questionId = securityQuestion?.questionId;
      const normalizedAnswer = typeof securityQuestion?.answer === 'string'
        ? normalizeSecurityAnswer(securityQuestion.answer)
        : '';

      if (!questionId || !isValidSecurityQuestionId(questionId)) {
        return NextResponse.json(
          { success: false, error: 'Each security question must use a valid question option' },
          { status: 400 }
        );
      }

      if (uniqueQuestionIds.has(questionId)) {
        return NextResponse.json(
          { success: false, error: 'Security question selections must be unique' },
          { status: 400 }
        );
      }

      if (!normalizedAnswer) {
        return NextResponse.json(
          { success: false, error: 'Each security question answer is required' },
          { status: 400 }
        );
      }

      if (normalizedAnswers.has(normalizedAnswer)) {
        return NextResponse.json(
          { success: false, error: 'Security question answers must be unique' },
          { status: 400 }
        );
      }

      uniqueQuestionIds.add(questionId);
      normalizedAnswers.add(normalizedAnswer);
    }

    const hashedSecurityQuestions = await Promise.all(
      (securityQuestions as RegistrationSecurityQuestionInput[]).map(async (securityQuestion) => ({
        questionId: securityQuestion.questionId,
        answerHash: await hashSecurityAnswer(securityQuestion.answer),
      }))
    );

    const cookieStore = await cookies();
    const database = await getDatabase();
    const session = await database.startSession();

    try {
      session.startTransaction();

      const result = await UserAuthService.registerUser({
        email,
        username,
        password,
        name,
        firstName,
        lastName,
        phoneNumber,
        securityQuestions: hashedSecurityQuestions,
      }, {
        session,
      });

      if (!result.success || !result.user) {
        await session.abortTransaction();
        return NextResponse.json(
          { success: false, error: result.error || 'Registration failed' },
          { status: 400 }
        );
      }

      // Only commit the user document after all in-request checks succeed.
      const token = UserAuthService.createUserToken(result.user);
      await session.commitTransaction();

      cookieStore.set('user_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60,
        path: '/',
      });

      // Identity linking: associate visitorId cookie with this userId
      try {
        const visitorId = await getVisitorIdFromCookieStore();
        if (visitorId && result.user.id) {
          const VisitorIdentity = await getVisitorIdentityModel();
          const now = new Date();
          await VisitorIdentity.findOneAndUpdate(
            { visitorId },
            {
              $set: { userId: result.user.id.toString(), lastSeenAt: now },
              $setOnInsert: { firstSeenAt: now },
            },
            { upsert: true }
          );
        }
      } catch { /* non-blocking */ }

      return NextResponse.json({
        success: true,
        message: 'Registration successful',
        token,
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          firstName: result.user.firstName || '',
          lastName: result.user.lastName || '',
          phoneNumber: result.user.phoneNumber,
          role: result.user.role,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      await session.endSession();
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Registration failed',
        message: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

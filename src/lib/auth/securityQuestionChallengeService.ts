import { getDatabase } from '@/lib/mongodb';
import { AuthUserModel } from '@/models/AuthUserModel';
import { verifySecurityAnswer } from '@/lib/auth/securityAnswers';
import { getSecurityQuestionLabel } from '@/lib/auth/securityQuestions';

export type SecurityQuestionChallengePurpose = 'forgot_password' | 'change_password';

export interface SecurityQuestionPrompt {
  questionId: string;
  label: string;
}

export interface SecurityQuestionChallengeView {
  id: string;
  questions: SecurityQuestionPrompt[];
}

export interface SecurityQuestionChallengeVerificationResult {
  success: boolean;
  error?: string;
}

interface SecurityQuestionChallengeDocument {
  id: string;
  userId: string;
  purpose: SecurityQuestionChallengePurpose;
  questionIds: string[];
  expiresAt: Date;
  attemptCount: number;
  maxAttempts: number;
  verifiedAt?: Date;
  usedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CHALLENGE_COLLECTION = 'security_question_challenges';
const CHALLENGE_TTL_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const CHALLENGE_SIZE = 2;

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

async function getChallengeCollection() {
  const database = await getDatabase();
  return database.collection(CHALLENGE_COLLECTION);
}

class SecurityQuestionChallengeService {
  async createChallenge(
    userId: string,
    purpose: SecurityQuestionChallengePurpose
  ): Promise<SecurityQuestionChallengeView> {
    const user = await AuthUserModel.findById(userId);
    const savedQuestions = user?.securityQuestions ?? [];

    if (savedQuestions.length < CHALLENGE_SIZE) {
      throw new Error('User has not configured enough security questions');
    }

    const selectedQuestionIds = shuffleArray(
      savedQuestions.map((question) => question.questionId)
    ).slice(0, CHALLENGE_SIZE);

    const now = new Date();
    const challenge: SecurityQuestionChallengeDocument = {
      id: crypto.randomUUID(),
      userId,
      purpose,
      questionIds: selectedQuestionIds,
      expiresAt: new Date(now.getTime() + CHALLENGE_TTL_MS),
      attemptCount: 0,
      maxAttempts: MAX_ATTEMPTS,
      createdAt: now,
      updatedAt: now
    };

    const collection = await getChallengeCollection();
    await collection.insertOne(challenge);

    return {
      id: challenge.id,
      questions: challenge.questionIds.map((questionId) => ({
        questionId,
        label: getSecurityQuestionLabel(questionId) ?? questionId
      }))
    };
  }

  async verifyChallengeAnswers(
    challengeId: string,
    answers: Array<{ questionId: string; answer: string }>
  ): Promise<SecurityQuestionChallengeVerificationResult> {
    const collection = await getChallengeCollection();
    const challenge = await collection.findOne<SecurityQuestionChallengeDocument>({ id: challengeId });

    if (!challenge) {
      return { success: false, error: 'Challenge not found' };
    }

    if (challenge.usedAt) {
      return { success: false, error: 'Challenge has already been used' };
    }

    if (challenge.expiresAt <= new Date()) {
      return { success: false, error: 'Challenge has expired' };
    }

    if (challenge.attemptCount >= challenge.maxAttempts) {
      return { success: false, error: 'Too many attempts' };
    }

    const user = await AuthUserModel.findById(challenge.userId);
    const savedQuestions = user?.securityQuestions ?? [];
    const savedByQuestionId = new Map(
      savedQuestions.map((question) => [question.questionId, question.answerHash])
    );
    const answersByQuestionId = new Map(
      answers.map((answer) => [answer.questionId, answer.answer])
    );

    let isValid = true;

    for (const questionId of challenge.questionIds) {
      const providedAnswer = answersByQuestionId.get(questionId);
      const expectedHash = savedByQuestionId.get(questionId);

      if (!providedAnswer || !expectedHash) {
        isValid = false;
        break;
      }

      const matches = await verifySecurityAnswer(providedAnswer, expectedHash);
      if (!matches) {
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      await collection.updateOne(
        { id: challengeId },
        {
          $inc: { attemptCount: 1 },
          $set: { updatedAt: new Date() }
        }
      );

      return { success: false, error: 'Incorrect security question answers' };
    }

    await collection.updateOne(
      { id: challengeId },
      {
        $set: {
          verifiedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    return { success: true };
  }

  async getVerifiedChallenge(
    challengeId: string,
    purpose: SecurityQuestionChallengePurpose
  ): Promise<SecurityQuestionChallengeDocument | null> {
    const collection = await getChallengeCollection();

    return collection.findOne<SecurityQuestionChallengeDocument>({
      id: challengeId,
      purpose,
      verifiedAt: { $exists: true },
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() }
    });
  }

  async invalidateChallengesForUser(
    userId: string,
    purpose?: SecurityQuestionChallengePurpose
  ) {
    const collection = await getChallengeCollection();

    await collection.deleteMany({
      userId,
      ...(purpose ? { purpose } : {})
    });
  }

  async consumeVerifiedChallenge(
    challengeId: string,
    purpose: SecurityQuestionChallengePurpose
  ): Promise<boolean> {
    const collection = await getChallengeCollection();
    const result = await collection.updateOne(
      {
        id: challengeId,
        purpose,
        verifiedAt: { $exists: true },
        usedAt: { $exists: false },
        expiresAt: { $gt: new Date() }
      },
      {
        $set: {
          usedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    return Boolean(result?.matchedCount);
  }
}

export const securityQuestionChallengeService = new SecurityQuestionChallengeService();

const insertOne = jest.fn();
const findOne = jest.fn();
const updateOne = jest.fn();
const deleteMany = jest.fn();
const collection = jest.fn(() => ({
  insertOne,
  findOne,
  updateOne,
  deleteMany,
}));
const mockGetDatabase = jest.fn(async () => ({
  collection,
}));
const mockFindById = jest.fn();

jest.mock('@/lib/mongodb', () => ({
  getDatabase: (...args: unknown[]) => mockGetDatabase(...args),
}));

jest.mock('@/models/AuthUserModel', () => ({
  AuthUserModel: {
    findById: (...args: unknown[]) => mockFindById(...args),
  },
}));

import { hashSecurityAnswer } from '@/lib/auth/securityAnswers';
import { securityQuestionChallengeService } from '@/lib/auth/securityQuestionChallengeService';

function createFakeInsertedId(id: string) {
  return {
    toHexString: () => id,
    toString: () => id,
  };
}

describe('securityQuestionChallengeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a 2-question challenge from the user configured set', async () => {
    mockFindById.mockResolvedValue({
      _id: 'user-id-1',
      securityQuestions: [
        { questionId: 'childhood_nickname', answerHash: await hashSecurityAnswer('Sunny') },
        { questionId: 'first_school', answerHash: await hashSecurityAnswer('Green Field') },
        { questionId: 'favorite_food', answerHash: await hashSecurityAnswer('Biryani') },
      ],
    });
    insertOne.mockResolvedValue({ insertedId: createFakeInsertedId('ignored-by-service') });

    const result = await securityQuestionChallengeService.createChallenge(
      'user-id-1',
      'forgot_password'
    );

    expect(result.id).toEqual(expect.any(String));
    expect(result.questions).toHaveLength(2);
    expect(new Set(result.questions.map((question) => question.questionId)).size).toBe(2);
    expect(result.questions.every((question) => [
      'childhood_nickname',
      'first_school',
      'favorite_food',
    ].includes(question.questionId))).toBe(true);
    expect(insertOne).toHaveBeenCalledWith(expect.objectContaining({
      id: result.id,
      userId: 'user-id-1',
      purpose: 'forgot_password',
      questionIds: expect.any(Array),
    }));
  });

  it('rejects verification after too many failed attempts', async () => {
    findOne.mockResolvedValue({
      _id: 'challenge-id-2',
      userId: 'user-id-2',
      purpose: 'forgot_password',
      questionIds: ['childhood_nickname', 'first_school'],
      expiresAt: new Date(Date.now() + 60_000),
      attemptCount: 5,
      maxAttempts: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await securityQuestionChallengeService.verifyChallengeAnswers('challenge-id', [
      { questionId: 'childhood_nickname', answer: 'Sunny' },
      { questionId: 'first_school', answer: 'Green Field' },
    ]);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/too many attempts/i);
    expect(updateOne).not.toHaveBeenCalled();
  });

  it('rejects expired challenges', async () => {
    findOne.mockResolvedValue({
      id: 'challenge-id-3',
      userId: 'user-id-3',
      purpose: 'forgot_password',
      questionIds: ['childhood_nickname', 'first_school'],
      expiresAt: new Date(Date.now() - 60_000),
      attemptCount: 0,
      maxAttempts: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await securityQuestionChallengeService.verifyChallengeAnswers('challenge-id-3', [
      { questionId: 'childhood_nickname', answer: 'Sunny' },
      { questionId: 'first_school', answer: 'Green Field' },
    ]);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/expired/i);
    expect(updateOne).not.toHaveBeenCalled();
  });

  it('consumes a verified challenge exactly once', async () => {
    updateOne.mockResolvedValueOnce({ matchedCount: 1 });
    updateOne.mockResolvedValueOnce({ matchedCount: 0 });

    await expect(
      securityQuestionChallengeService.consumeVerifiedChallenge('challenge-id-4', 'forgot_password')
    ).resolves.toBe(true);
    await expect(
      securityQuestionChallengeService.consumeVerifiedChallenge('challenge-id-4', 'forgot_password')
    ).resolves.toBe(false);
  });
});

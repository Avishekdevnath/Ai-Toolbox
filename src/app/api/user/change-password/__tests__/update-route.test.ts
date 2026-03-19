/** @jest-environment node */

import { NextRequest } from 'next/server';

const mockGetAuthCookie = jest.fn();
const mockClearAuthCookie = jest.fn();
const mockVerifyAccessToken = jest.fn();
const mockFindById = jest.fn();
const mockUpdatePassword = jest.fn();
const mockCreateChallenge = jest.fn();
const mockVerifyChallengeAnswers = jest.fn();
const mockGetVerifiedChallenge = jest.fn();
const mockConsumeVerifiedChallenge = jest.fn();
const mockInvalidateChallengesForUser = jest.fn();
const mockCompare = jest.fn();
const mockHash = jest.fn();

jest.mock('@/lib/auth/cookies', () => ({
  getAuthCookie: (...args: unknown[]) => mockGetAuthCookie(...args),
  clearAuthCookie: (...args: unknown[]) => mockClearAuthCookie(...args),
}));

jest.mock('@/lib/auth/jwt', () => ({
  verifyAccessToken: (...args: unknown[]) => mockVerifyAccessToken(...args),
}));

jest.mock('@/models/AuthUserModel', () => ({
  AuthUserModel: {
    findById: (...args: unknown[]) => mockFindById(...args),
    updatePassword: (...args: unknown[]) => mockUpdatePassword(...args),
  },
}));

jest.mock('@/lib/auth/securityQuestionChallengeService', () => ({
  securityQuestionChallengeService: {
    createChallenge: (...args: unknown[]) => mockCreateChallenge(...args),
    verifyChallengeAnswers: (...args: unknown[]) => mockVerifyChallengeAnswers(...args),
    getVerifiedChallenge: (...args: unknown[]) => mockGetVerifiedChallenge(...args),
    consumeVerifiedChallenge: (...args: unknown[]) => mockConsumeVerifiedChallenge(...args),
    invalidateChallengesForUser: (...args: unknown[]) => mockInvalidateChallengesForUser(...args),
  },
}));

jest.mock('bcryptjs', () => ({
  compare: (...args: unknown[]) => mockCompare(...args),
  hash: (...args: unknown[]) => mockHash(...args),
}));

import { POST as challengePost } from '../challenge/route';
import { POST as verifyQuestionsPost } from '../verify-questions/route';
import { POST as updatePost } from '../update/route';

function createRequest(url: string, body: unknown) {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('logged-in password change routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthCookie.mockResolvedValue('token');
    mockVerifyAccessToken.mockReturnValue({ id: 'user-1' });
  });

  it('starts a question challenge for an authenticated user', async () => {
    mockFindById.mockResolvedValue({
      _id: 'user-1',
      securityQuestions: [
        { questionId: 'childhood_nickname' },
        { questionId: 'first_school' },
        { questionId: 'favorite_food' },
      ],
    });
    mockCreateChallenge.mockResolvedValue({
      id: 'challenge-1',
      questions: [
        { questionId: 'childhood_nickname', label: 'What was your childhood nickname?' },
        { questionId: 'favorite_food', label: 'What is your favorite food?' },
      ],
    });

    const response = await challengePost(createRequest(
      'http://localhost:3000/api/user/change-password/challenge',
      {}
    ));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.challengeId).toBe('challenge-1');
    expect(data.questions).toHaveLength(2);
  });

  it('verifies security-question answers for the logged-in flow', async () => {
    mockVerifyChallengeAnswers.mockResolvedValue({ success: true });

    const response = await verifyQuestionsPost(createRequest(
      'http://localhost:3000/api/user/change-password/verify-questions',
      {
        challengeId: 'challenge-1',
        answers: [
          { questionId: 'childhood_nickname', answer: 'Sunny' },
          { questionId: 'favorite_food', answer: 'Biryani' },
        ],
      }
    ));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('updates the password when the current password is correct', async () => {
    mockFindById.mockResolvedValue({
      _id: 'user-1',
      passwordHash: 'stored-hash',
    });
    mockCompare.mockResolvedValue(true);
    mockHash.mockResolvedValue('new-password-hash');
    mockUpdatePassword.mockResolvedValue({ matchedCount: 1 });

    const response = await updatePost(createRequest(
      'http://localhost:3000/api/user/change-password/update',
      {
        newPassword: 'NewStrongPassword123',
        verification: {
          method: 'current_password',
          currentPassword: 'CurrentPassword123',
        },
      }
    ));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockUpdatePassword).toHaveBeenCalledWith('user-1', 'new-password-hash');
    expect(mockInvalidateChallengesForUser).toHaveBeenCalledWith('user-1', 'change_password');
    expect(mockClearAuthCookie).toHaveBeenCalled();
  });

  it('updates the password when a verified challenge is supplied', async () => {
    mockGetVerifiedChallenge.mockResolvedValue({
      id: 'challenge-1',
      userId: 'user-1',
      purpose: 'change_password',
    });
    mockHash.mockResolvedValue('new-password-hash');
    mockUpdatePassword.mockResolvedValue({ matchedCount: 1 });
    mockConsumeVerifiedChallenge.mockResolvedValue(true);

    const response = await updatePost(createRequest(
      'http://localhost:3000/api/user/change-password/update',
      {
        newPassword: 'NewStrongPassword123',
        verification: {
          method: 'security_questions',
          challengeId: 'challenge-1',
        },
      }
    ));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockConsumeVerifiedChallenge).toHaveBeenCalledWith('challenge-1', 'change_password');
    expect(mockClearAuthCookie).toHaveBeenCalled();
  });

  it('rejects updates without valid proof', async () => {
    mockFindById.mockResolvedValue({
      _id: 'user-1',
      passwordHash: 'stored-hash',
    });
    mockCompare.mockResolvedValue(false);

    const response = await updatePost(createRequest(
      'http://localhost:3000/api/user/change-password/update',
      {
        newPassword: 'NewStrongPassword123',
        verification: {
          method: 'current_password',
          currentPassword: 'WrongPassword123',
        },
      }
    ));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});

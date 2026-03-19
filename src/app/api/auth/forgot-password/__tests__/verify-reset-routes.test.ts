/** @jest-environment node */

import { NextRequest } from 'next/server';

const mockVerifyChallengeAnswers = jest.fn();
const mockGetVerifiedChallenge = jest.fn();
const mockConsumeVerifiedChallenge = jest.fn();
const mockInvalidateChallengesForUser = jest.fn();
const mockClearAuthCookie = jest.fn();
const mockUpdatePassword = jest.fn();
const mockHash = jest.fn();

jest.mock('@/lib/auth/securityQuestionChallengeService', () => ({
  securityQuestionChallengeService: {
    verifyChallengeAnswers: (...args: unknown[]) => mockVerifyChallengeAnswers(...args),
    getVerifiedChallenge: (...args: unknown[]) => mockGetVerifiedChallenge(...args),
    consumeVerifiedChallenge: (...args: unknown[]) => mockConsumeVerifiedChallenge(...args),
    invalidateChallengesForUser: (...args: unknown[]) => mockInvalidateChallengesForUser(...args),
  },
}));

jest.mock('@/lib/auth/cookies', () => ({
  clearAuthCookie: (...args: unknown[]) => mockClearAuthCookie(...args),
}));

jest.mock('bcryptjs', () => ({
  hash: (...args: unknown[]) => mockHash(...args),
}));

jest.mock('@/models/AuthUserModel', () => ({
  AuthUserModel: {
    updatePassword: (...args: unknown[]) => mockUpdatePassword(...args),
  },
}));

import { POST as verifyPost } from '../verify/route';
import { POST as resetPost } from '../reset/route';

function createVerifyRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/auth/forgot-password/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

function createResetRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/auth/forgot-password/reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('forgot-password verify/reset routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('verifies a valid challenge answer set', async () => {
    mockVerifyChallengeAnswers.mockResolvedValue({ success: true });

    const response = await verifyPost(createVerifyRequest({
      challengeId: 'challenge-1',
      answers: [
        { questionId: 'childhood_nickname', answer: 'Sunny' },
        { questionId: 'favorite_food', answer: 'Biryani' },
      ],
    }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('resets the password only after a verified challenge', async () => {
    mockGetVerifiedChallenge.mockResolvedValue({
      id: 'challenge-1',
      userId: 'user-1',
      purpose: 'forgot_password',
    });
    mockHash.mockResolvedValue('new-password-hash');
    mockUpdatePassword.mockResolvedValue({ matchedCount: 1 });
    mockConsumeVerifiedChallenge.mockResolvedValue(true);

    const response = await resetPost(createResetRequest({
      challengeId: 'challenge-1',
      newPassword: 'NewStrongPassword123',
    }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockUpdatePassword).toHaveBeenCalledWith('user-1', 'new-password-hash');
    expect(mockConsumeVerifiedChallenge).toHaveBeenCalledWith('challenge-1', 'forgot_password');
    expect(mockClearAuthCookie).toHaveBeenCalled();
  });

  it('rejects password reset when the challenge is not verified', async () => {
    mockGetVerifiedChallenge.mockResolvedValue(null);

    const response = await resetPost(createResetRequest({
      challengeId: 'challenge-unknown',
      newPassword: 'NewStrongPassword123',
    }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});

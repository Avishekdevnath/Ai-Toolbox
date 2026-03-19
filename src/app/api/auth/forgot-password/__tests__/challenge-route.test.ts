/** @jest-environment node */

import { NextRequest } from 'next/server';

const mockFindByEmailOrUsername = jest.fn();
const mockCreateChallenge = jest.fn();

jest.mock('@/models/AuthUserModel', () => ({
  AuthUserModel: {
    findByEmailOrUsername: (...args: unknown[]) => mockFindByEmailOrUsername(...args),
  },
}));

jest.mock('@/lib/auth/securityQuestionChallengeService', () => ({
  securityQuestionChallengeService: {
    createChallenge: (...args: unknown[]) => mockCreateChallenge(...args),
  },
}));

import { POST } from '../challenge/route';

function createChallengeRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/auth/forgot-password/challenge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/forgot-password/challenge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns success true and questions for an eligible account', async () => {
    mockFindByEmailOrUsername.mockResolvedValue({
      _id: {
        toString: () => 'user-1',
      },
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

    const response = await POST(createChallengeRequest({ identifier: 'jane@example.com' }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.challengeId).toBe('challenge-1');
    expect(data.questions).toHaveLength(2);
  });

  it('returns success true without challenge details for a non-eligible account', async () => {
    mockFindByEmailOrUsername.mockResolvedValue(null);

    const response = await POST(createChallengeRequest({ identifier: 'missing@example.com' }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.challengeId).toBeUndefined();
    expect(data.questions).toBeUndefined();
    expect(mockCreateChallenge).not.toHaveBeenCalled();
  });
});

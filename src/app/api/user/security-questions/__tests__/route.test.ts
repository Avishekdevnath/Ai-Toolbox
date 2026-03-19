/** @jest-environment node */

import { NextRequest } from 'next/server';

const mockGetAuthCookie = jest.fn();
const mockVerifyAccessToken = jest.fn();
const mockFindById = jest.fn();
const mockReplaceSecurityQuestions = jest.fn();
const mockInvalidateChallengesForUser = jest.fn();
const mockCompare = jest.fn();
const mockHash = jest.fn();

jest.mock('@/lib/auth/cookies', () => ({
  getAuthCookie: (...args: unknown[]) => mockGetAuthCookie(...args),
}));

jest.mock('@/lib/auth/jwt', () => ({
  verifyAccessToken: (...args: unknown[]) => mockVerifyAccessToken(...args),
}));

jest.mock('@/models/AuthUserModel', () => ({
  AuthUserModel: {
    findById: (...args: unknown[]) => mockFindById(...args),
    replaceSecurityQuestions: (...args: unknown[]) => mockReplaceSecurityQuestions(...args),
  },
}));

jest.mock('bcryptjs', () => ({
  compare: (...args: unknown[]) => mockCompare(...args),
  hash: (...args: unknown[]) => mockHash(...args),
}));

jest.mock('@/lib/auth/securityQuestionChallengeService', () => ({
  securityQuestionChallengeService: {
    invalidateChallengesForUser: (...args: unknown[]) => mockInvalidateChallengesForUser(...args),
  },
}));

import { GET, PUT } from '../route';

function createPutRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/user/security-questions', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('/api/user/security-questions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthCookie.mockResolvedValue('token');
    mockVerifyAccessToken.mockReturnValue({ id: 'user-1' });
    mockHash.mockResolvedValue('hashed-answer');
  });

  it('returns the fixed catalog and selected question ids without exposing answers', async () => {
    mockFindById.mockResolvedValue({
      _id: 'user-1',
      securityQuestions: [
        { questionId: 'childhood_nickname', answerHash: 'hash-1' },
        { questionId: 'first_school', answerHash: 'hash-2' },
        { questionId: 'favorite_food', answerHash: 'hash-3' },
      ],
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.catalog).toHaveLength(10);
    expect(data.selectedQuestionIds).toEqual([
      'childhood_nickname',
      'first_school',
      'favorite_food',
    ]);
    expect(JSON.stringify(data)).not.toMatch(/hash-1|hash-2|hash-3/);
  });

  it('requires currentPassword when replacing the saved question set', async () => {
    mockFindById.mockResolvedValue({
      _id: 'user-1',
      passwordHash: 'stored-password-hash',
      securityQuestions: [],
    });
    mockCompare.mockResolvedValue(false);

    const response = await PUT(createPutRequest({
      currentPassword: 'wrong-password',
      securityQuestions: [
        { questionId: 'childhood_nickname', answer: 'Sunny' },
        { questionId: 'first_school', answer: 'Green Field School' },
        { questionId: 'favorite_food', answer: 'Biryani' },
      ],
    }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toMatch(/current password/i);
  });

  it('replaces the saved question set when the current password is valid', async () => {
    mockFindById.mockResolvedValue({
      _id: 'user-1',
      passwordHash: 'stored-password-hash',
      securityQuestions: [],
    });
    mockCompare.mockResolvedValue(true);
    mockReplaceSecurityQuestions.mockResolvedValue({
      _id: 'user-1',
      securityQuestions: [
        { questionId: 'childhood_nickname', answerHash: 'new-hash-1' },
        { questionId: 'first_school', answerHash: 'new-hash-2' },
        { questionId: 'favorite_food', answerHash: 'new-hash-3' },
      ],
    });

    const response = await PUT(createPutRequest({
      currentPassword: 'correct-password',
      securityQuestions: [
        { questionId: 'childhood_nickname', answer: 'Sunny' },
        { questionId: 'first_school', answer: 'Green Field School' },
        { questionId: 'favorite_food', answer: 'Biryani' },
      ],
    }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockReplaceSecurityQuestions).toHaveBeenCalled();
    expect(mockInvalidateChallengesForUser).toHaveBeenCalledWith('user-1');
  });
});

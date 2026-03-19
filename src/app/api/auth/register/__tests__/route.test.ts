/** @jest-environment node */

import { NextRequest } from 'next/server';

const mockCookieSet = jest.fn();
const mockRegisterUser = jest.fn();
const mockCreateUserToken = jest.fn(() => 'signed-token');
const mockStartTransaction = jest.fn();
const mockCommitTransaction = jest.fn();
const mockAbortTransaction = jest.fn();
const mockEndSession = jest.fn();
const mockInTransaction = jest.fn(() => false);
const mockStartSession = jest.fn(async () => ({
  startTransaction: mockStartTransaction,
  commitTransaction: mockCommitTransaction,
  abortTransaction: mockAbortTransaction,
  endSession: mockEndSession,
  inTransaction: mockInTransaction,
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(async () => ({
    set: mockCookieSet,
  })),
}));

jest.mock('@/lib/mongodb', () => ({
  getDatabase: jest.fn(async () => ({
    startSession: mockStartSession,
  })),
}));

jest.mock('@/lib/userAuthService', () => ({
  UserAuthService: {
    registerUser: (...args: unknown[]) => mockRegisterUser(...args),
    createUserToken: (...args: unknown[]) => mockCreateUserToken(...args),
  },
}));

import { POST } from '../route';

function createRegisterRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInTransaction.mockReturnValue(false);
  });

  it('creates a user when 3 unique valid questions are provided', async () => {
    mockRegisterUser.mockResolvedValue({
      success: true,
      user: {
        id: 'user-1',
        email: 'jane@example.com',
        username: 'jane',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'user',
      },
    });

    const response = await POST(createRegisterRequest({
      email: 'jane@example.com',
      username: 'jane',
      password: 'StrongPassword123',
      name: 'Jane Doe',
      firstName: 'Jane',
      lastName: 'Doe',
      securityQuestions: [
        { questionId: 'childhood_nickname', answer: 'Sunny' },
        { questionId: 'first_school', answer: 'Green Field School' },
        { questionId: 'favorite_food', answer: 'Biryani' },
      ],
    }));

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.token).toBe('signed-token');
    expect(data.user).toMatchObject({
      id: 'user-1',
      email: 'jane@example.com',
      username: 'jane',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'user',
    });
    expect(mockStartTransaction).toHaveBeenCalled();
    expect(mockCommitTransaction).toHaveBeenCalled();
    expect(mockCookieSet).toHaveBeenCalled();
    expect(mockEndSession).toHaveBeenCalled();
  });

  it('rejects fewer than 3 questions', async () => {
    const response = await POST(createRegisterRequest({
      email: 'jane@example.com',
      username: 'jane',
      password: 'StrongPassword123',
      name: 'Jane Doe',
      firstName: 'Jane',
      lastName: 'Doe',
      securityQuestions: [
        { questionId: 'childhood_nickname', answer: 'Sunny' },
        { questionId: 'first_school', answer: 'Green Field School' },
      ],
    }));

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toMatch(/3 to 5 security questions/i);
    expect(mockStartSession).not.toHaveBeenCalled();
  });

  it('rejects duplicate question ids or duplicate normalized answers', async () => {
    const response = await POST(createRegisterRequest({
      email: 'jane@example.com',
      username: 'jane',
      password: 'StrongPassword123',
      name: 'Jane Doe',
      firstName: 'Jane',
      lastName: 'Doe',
      securityQuestions: [
        { questionId: 'childhood_nickname', answer: 'Sunny' },
        { questionId: 'childhood_nickname', answer: '  sunny  ' },
        { questionId: 'favorite_food', answer: 'Biryani' },
      ],
    }));

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toMatch(/unique/i);
    expect(mockStartSession).not.toHaveBeenCalled();
  });

  it('aborts the transaction when token creation fails', async () => {
    mockRegisterUser.mockResolvedValue({
      success: true,
      user: {
        id: 'user-1',
        email: 'jane@example.com',
        username: 'jane',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'user',
      },
    });
    mockCreateUserToken.mockImplementationOnce(() => {
      throw new Error('JWT_SECRET is not set');
    });
    mockInTransaction.mockReturnValue(true);

    const response = await POST(createRegisterRequest({
      email: 'jane@example.com',
      username: 'jane',
      password: 'StrongPassword123',
      name: 'Jane Doe',
      firstName: 'Jane',
      lastName: 'Doe',
      securityQuestions: [
        { questionId: 'childhood_nickname', answer: 'Sunny' },
        { questionId: 'first_school', answer: 'Green Field School' },
        { questionId: 'favorite_food', answer: 'Biryani' },
      ],
    }));

    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(mockAbortTransaction).toHaveBeenCalled();
    expect(mockCommitTransaction).not.toHaveBeenCalled();
    expect(mockCookieSet).not.toHaveBeenCalled();
    expect(mockEndSession).toHaveBeenCalled();
  });
});

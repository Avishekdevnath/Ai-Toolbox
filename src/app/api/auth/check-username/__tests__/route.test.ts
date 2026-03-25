/**
 * @jest-environment node
 */
import { GET } from '../route';
import { NextRequest } from 'next/server';

jest.mock('@/models/AuthUserModel', () => ({
  AuthUserModel: {
    findByUsername: jest.fn(),
  },
}));

import { AuthUserModel } from '@/models/AuthUserModel';

describe('GET /api/auth/check-username', () => {
  it('returns 400 when username param is missing', async () => {
    const req = new NextRequest('http://localhost/api/auth/check-username');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when username is empty string', async () => {
    const req = new NextRequest('http://localhost/api/auth/check-username?username=');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when username is too short', async () => {
    const req = new NextRequest('http://localhost/api/auth/check-username?username=ab');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/3/);
  });

  it('returns 400 when username has invalid characters', async () => {
    const req = new NextRequest('http://localhost/api/auth/check-username?username=bad+user!');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('returns available: true when username is not taken', async () => {
    (AuthUserModel.findByUsername as jest.Mock).mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/auth/check-username?username=freeuser');
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.available).toBe(true);
  });

  it('returns available: false when username is taken', async () => {
    (AuthUserModel.findByUsername as jest.Mock).mockResolvedValue({ _id: '123' });
    const req = new NextRequest('http://localhost/api/auth/check-username?username=takenuser');
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.available).toBe(false);
  });

  it('returns 500 when DB throws', async () => {
    (AuthUserModel.findByUsername as jest.Mock).mockRejectedValue(new Error('DB down'));
    const req = new NextRequest('http://localhost/api/auth/check-username?username=anyuser');
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});

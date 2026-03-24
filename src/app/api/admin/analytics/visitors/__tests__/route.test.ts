/** @jest-environment node */

import { GET } from '../route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/adminAuthService', () => ({
  AdminAuthService: { getAdminSession: jest.fn().mockResolvedValue({ userId: 'admin-1' }) },
}));
jest.mock('@/lib/mongodb', () => ({ connectToDatabase: jest.fn() }));
jest.mock('@/models/VisitorIdentityModel', () => ({
  getVisitorIdentityModel: jest.fn().mockResolvedValue({
    countDocuments: jest.fn().mockResolvedValue(100),
  }),
}));

test('returns 401 without auth', async () => {
  const { AdminAuthService } = require('@/lib/adminAuthService');
  AdminAuthService.getAdminSession.mockResolvedValueOnce(null);
  const res = await GET(new NextRequest('http://localhost/api/admin/analytics/visitors'));
  expect(res.status).toBe(401);
});

test('returns visitor stats', async () => {
  const res = await GET(new NextRequest('http://localhost/api/admin/analytics/visitors'));
  const json = await res.json();
  expect(res.status).toBe(200);
  expect(json.data).toHaveProperty('total');
  expect(json.data).toHaveProperty('anonymous');
  expect(json.data).toHaveProperty('loggedIn');
});

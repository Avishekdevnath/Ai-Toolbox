/** @jest-environment node */

import { GET } from '../route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/adminAuthService', () => ({
  AdminAuthService: { getAdminSession: jest.fn().mockResolvedValue({ userId: 'admin-1' }) },
}));
jest.mock('@/lib/mongodb', () => ({ connectToDatabase: jest.fn() }));
jest.mock('@/models/VisitorIdentityModel', () => ({
  getVisitorIdentityModel: jest.fn().mockResolvedValue({
    findOne: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ visitorId: 'vid-1', lastSeenAt: new Date() }) }),
  }),
}));
jest.mock('@/models/PageVisitModel', () => ({
  getPageVisitModel: jest.fn().mockResolvedValue({
    countDocuments: jest.fn().mockResolvedValue(5),
    find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }) }) }),
  }),
}));
jest.mock('@/models/ToolUsageModel', () => ({
  ToolUsage: { aggregate: jest.fn().mockResolvedValue([]) },
}));
jest.mock('@/models/FeedbackModel', () => ({
  getFeedbackModel: jest.fn().mockResolvedValue({ countDocuments: jest.fn().mockResolvedValue(0) }),
}));

test('returns 401 without auth', async () => {
  const { AdminAuthService } = require('@/lib/adminAuthService');
  AdminAuthService.getAdminSession.mockResolvedValueOnce(null);
  const req = new NextRequest('http://localhost/api/admin/users/user-1/activity');
  const res = await GET(req, { params: Promise.resolve({ id: 'user-1' }) });
  expect(res.status).toBe(401);
});

test('returns activity data with correct shape for a user', async () => {
  const req = new NextRequest('http://localhost/api/admin/users/user-1/activity');
  const res = await GET(req, { params: Promise.resolve({ id: 'user-1' }) });
  const json = await res.json();
  expect(res.status).toBe(200);
  expect(json.success).toBe(true);
  expect(typeof json.data.totalVisits).toBe('number');
  expect(Array.isArray(json.data.toolsUsed)).toBe(true);
  expect(Array.isArray(json.data.recentPages)).toBe(true);
  expect(typeof json.data.feedbackCount).toBe('number');
});

test('queries VisitorIdentity by userId to resolve visitorId', async () => {
  const { getVisitorIdentityModel } = require('@/models/VisitorIdentityModel');
  const mockModel = await getVisitorIdentityModel();
  const req = new NextRequest('http://localhost/api/admin/users/user-1/activity');
  await GET(req, { params: Promise.resolve({ id: 'user-1' }) });
  expect(mockModel.findOne).toHaveBeenCalledWith({ userId: 'user-1' });
});

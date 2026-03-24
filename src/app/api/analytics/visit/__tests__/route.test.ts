/** @jest-environment node */

import { POST } from '../route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/mongodb', () => ({ connectToDatabase: jest.fn() }));
jest.mock('@/models/PageVisitModel', () => ({
  getPageVisitModel: jest.fn().mockResolvedValue({
    create: jest.fn().mockResolvedValue({}),
  }),
}));
jest.mock('@/models/VisitorIdentityModel', () => ({
  getVisitorIdentityModel: jest.fn().mockResolvedValue({
    findOneAndUpdate: jest.fn().mockResolvedValue({}),
  }),
}));

function makeRequest(body: object, visitorId?: string) {
  const req = new NextRequest('http://localhost/api/analytics/visit', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
  if (visitorId) {
    req.cookies.set('visitorId', visitorId);
  }
  return req;
}

test('returns 400 when path is missing', async () => {
  const res = await POST(makeRequest({ userAgent: 'test' }, 'abc-123'));
  expect(res.status).toBe(400);
});

test('returns 200 with valid request', async () => {
  const res = await POST(makeRequest({ path: '/home', userAgent: 'test' }, 'abc-123'));
  expect(res.status).toBe(200);
});

test('returns 200 even without visitorId cookie (no tracking, no error)', async () => {
  const res = await POST(makeRequest({ path: '/home', userAgent: 'test' }));
  expect(res.status).toBe(200);
});

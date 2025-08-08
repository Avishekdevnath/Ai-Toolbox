'use client';

import { getAnonymousUserSession } from '@/lib/urlShortenerUtils';

export interface CreateShortenedUrlOptions {
  originalUrl: string;
  customAlias?: string;
  expiresInDays?: number;
  expiresAt?: string;
}

export async function createShortenedUrl(opts: CreateShortenedUrlOptions) {
  try {
    const session = await getAnonymousUserSession();
    
    const requestBody = {
      originalUrl: opts.originalUrl,
      customAlias: opts.customAlias,
      expiresInDays: opts.expiresInDays,
      expiresAt: opts.expiresAt,
      anonymousUserId: session.deviceFingerprint,
      deviceFingerprint: session.deviceFingerprint
    };
    
    const res = await fetch('/api/url-shortener', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}: Failed to create shortened URL`);
    }
    
    const responseData = await res.json();
    return responseData;
  } catch (error) {
    console.error('Error in createShortenedUrl:', error);
    throw error;
  }
}

export async function getShortenedUrls(params: { limit?: number; activeOnly?: boolean }) {
  const session = await getAnonymousUserSession();
  const url = new URL('/api/url-shortener', window.location.origin);
  if (params.limit) url.searchParams.set('limit', String(params.limit));
  if (params.activeOnly !== undefined) url.searchParams.set('activeOnly', String(params.activeOnly));
  url.searchParams.set('anonymousUserId', session.deviceFingerprint);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to load URLs');
  return res.json();
}

export async function deleteShortenedUrl(id: string) {
  const res = await fetch(`/api/url-shortener/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete URL');
  return res.json();
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function shareUrl(url: string, text?: string): Promise<boolean> {
  try {
    if (navigator.share) {
      await navigator.share({ url, text });
      return true;
    }
    return await copyToClipboard(url);
  } catch {
    return false;
  }
}

export function generateQRCodeUrl(data: string, size: number = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
} 
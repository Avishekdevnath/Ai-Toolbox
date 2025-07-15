import { ShortenedUrl, CreateUrlRequest, UrlStats } from './urlShortenerUtils';

export interface UrlShortenerResponse {
  success: boolean;
  data: ShortenedUrl & { shortenedUrl: string; isExpired?: boolean };
}

export interface UrlListResponse {
  success: boolean;
  data: (ShortenedUrl & { shortenedUrl: string; isExpired?: boolean })[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Create a new shortened URL
 */
export async function createShortenedUrl(request: CreateUrlRequest): Promise<UrlShortenerResponse> {
  const response = await fetch('/api/url-shortener', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create shortened URL');
  }

  return response.json();
}

/**
 * Get list of shortened URLs
 */
export async function getShortenedUrls(options: {
  userId?: string;
  limit?: number;
  offset?: number;
  activeOnly?: boolean;
} = {}): Promise<UrlListResponse> {
  const params = new URLSearchParams();
  
  if (options.userId) params.append('userId', options.userId);
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.offset) params.append('offset', options.offset.toString());
  if (options.activeOnly) params.append('activeOnly', 'true');

  const response = await fetch(`/api/url-shortener?${params.toString()}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch shortened URLs');
  }

  return response.json();
}

/**
 * Delete a shortened URL
 */
export async function deleteShortenedUrl(urlId: string): Promise<void> {
  const response = await fetch(`/api/url-shortener/${urlId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete shortened URL');
  }
}

/**
 * Update a shortened URL
 */
export async function updateShortenedUrl(
  urlId: string, 
  updates: Partial<ShortenedUrl>
): Promise<UrlShortenerResponse> {
  const response = await fetch(`/api/url-shortener/${urlId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update shortened URL');
  }

  return response.json();
}

/**
 * Get URL statistics
 */
export async function getUrlStats(userId?: string): Promise<UrlStats> {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);

  const response = await fetch(`/api/url-shortener/stats?${params.toString()}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch URL statistics');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Generate a QR code URL for a shortened URL
 */
export function generateQRCodeUrl(shortenedUrl: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shortenedUrl)}`;
}

/**
 * Share URL using Web Share API or fallback
 */
export async function shareUrl(url: string, title: string = 'Check out this link'): Promise<boolean> {
  try {
    if (navigator.share) {
      await navigator.share({
        title,
        url,
      });
      return true;
    } else {
      // Fallback: copy to clipboard
      const success = await copyToClipboard(url);
      if (success) {
        alert('URL copied to clipboard!');
      }
      return success;
    }
  } catch (error) {
    console.error('Failed to share URL:', error);
    return false;
  }
} 
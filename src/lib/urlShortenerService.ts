import { 
  ShortenedUrl, 
  CreateUrlRequest, 
  getAnonymousUserSession,
  getAnonymousUserUrls
} from './urlShortenerUtils';

const API_BASE = '/api/url-shortener';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface GetUrlsParams {
  limit?: number;
  activeOnly?: boolean;
  userId?: string;
  anonymousUserId?: string;
}

/**
 * Create a shortened URL
 * @param request - URL creation request
 * @returns Promise<ApiResponse<ShortenedUrl>>
 */
export async function createShortenedUrl(request: CreateUrlRequest): Promise<ApiResponse<ShortenedUrl>> {
  try {
    // Get anonymous user session if no userId provided
    let anonymousUserData = {};
    if (!request.userId && typeof window !== 'undefined') {
      try {
        const session = await getAnonymousUserSession();
        anonymousUserData = {
          anonymousUserId: session.sessionId,
          deviceFingerprint: session.deviceFingerprint
        };
      } catch (error) {
        console.warn('Failed to get anonymous session:', error);
      }
    }

    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        ...anonymousUserData
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create shortened URL');
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create shortened URL');
  }
}

/**
 * Get shortened URLs
 * @param params - Query parameters
 * @returns Promise<ApiResponse<ShortenedUrl[]>>
 */
export async function getShortenedUrls(params: GetUrlsParams = {}): Promise<ApiResponse<ShortenedUrl[]>> {
  try {
    // Get anonymous user session if no userId provided
    let anonymousUserId = params.anonymousUserId;
    if (!params.userId && !anonymousUserId && typeof window !== 'undefined') {
      try {
        const session = await getAnonymousUserSession();
        anonymousUserId = session.sessionId;
      } catch (error) {
        console.warn('Failed to get anonymous session:', error);
      }
    }

    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.activeOnly !== undefined) queryParams.append('activeOnly', params.activeOnly.toString());
    if (params.userId) queryParams.append('userId', params.userId);
    if (anonymousUserId) queryParams.append('anonymousUserId', anonymousUserId);

    const response = await fetch(`${API_BASE}?${queryParams.toString()}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch shortened URLs');
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch shortened URLs');
  }
}

/**
 * Delete a shortened URL
 * @param urlId - URL ID to delete
 * @returns Promise<ApiResponse<void>>
 */
export async function deleteShortenedUrl(urlId: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${API_BASE}/${urlId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete shortened URL');
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete shortened URL');
  }
}

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise<boolean> - Success status
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
 * Share URL using Web Share API or fallback
 * @param url - URL to share
 * @param title - Share title
 * @returns Promise<boolean> - Success status
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

/**
 * Generate QR code URL
 * @param url - URL to encode in QR code
 * @returns QR code image URL
 */
export function generateQRCodeUrl(url: string): string {
  const encodedUrl = encodeURIComponent(url);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
}

/**
 * Get URL statistics
 * @param userId - Optional user ID
 * @param anonymousUserId - Optional anonymous user ID
 * @returns Promise<ApiResponse<any>>
 */
export async function getUrlStats(userId?: string, anonymousUserId?: string): Promise<ApiResponse<any>> {
  try {
    // Get anonymous user session if no userId provided
    if (!userId && !anonymousUserId && typeof window !== 'undefined') {
      try {
        const session = await getAnonymousUserSession();
        anonymousUserId = session.sessionId;
      } catch (error) {
        console.warn('Failed to get anonymous session:', error);
      }
    }

    const queryParams = new URLSearchParams();
    if (userId) queryParams.append('userId', userId);
    if (anonymousUserId) queryParams.append('anonymousUserId', anonymousUserId);

    const response = await fetch(`/api/url-shortener/stats?${queryParams.toString()}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch URL statistics');
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch URL statistics');
  }
}

/**
 * Check if user is anonymous (no signed-in user)
 * @returns boolean
 */
export function isAnonymousUser(): boolean {
  // This would typically check for authentication state
  // For now, we'll assume anonymous if no user session exists
  if (typeof window === 'undefined') return true;
  
  // Check if user is authenticated (using Clerk)
  const isAuthenticated = () => {
    // For client-side, we'll check if there's a Clerk session
    // This is a simplified check - in a real app, you'd use Clerk's useAuth hook
    return typeof window !== 'undefined' && 
           (localStorage.getItem('clerk-db') || 
            document.cookie.includes('__session'));
  };

  // Get user identifier for anonymous tracking
  const getUserIdentifier = () => {
    if (isAuthenticated()) {
      // TODO: Get actual user ID from Clerk
      return 'authenticated-user';
    }
    
    // For anonymous users, use device fingerprint
    return getDeviceFingerprint();
  };
} 
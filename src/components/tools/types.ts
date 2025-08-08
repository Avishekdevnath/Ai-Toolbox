import type { ShortenedUrl } from '@/schemas/urlShortenerSchema';

export interface DisplayUrl extends ShortenedUrl {
  shortenedUrl: string;
  isExpired?: boolean;
}

export interface Analytics {
  totalUrls: number;
  totalClicks: number;
  activeUrls: number;
  expiredUrls: number;
  averageClicks: number;
  topPerformingUrl?: DisplayUrl;
} 
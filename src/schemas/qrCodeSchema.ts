import { z } from 'zod';

export const QRCodeType = z.enum([
  'url',
  'text',
  'email',
  'phone',
  'sms',
  'wifi',
  'vcard',
  'location',
  'event'
]);

export const QRCodeStatus = z.enum(['active', 'inactive', 'expired']);

export const QRCodeAnalytics = z.object({
  totalScans: z.number().default(0),
  totalDownloads: z.number().default(0),
  totalShares: z.number().default(0),
  lastScannedAt: z.date().optional(),
  lastDownloadedAt: z.date().optional(),
  lastSharedAt: z.date().optional(),
  scanHistory: z.array(z.object({
    timestamp: z.date(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    device: z.string().optional(),
    referer: z.string().optional()
  })).default([]),
  downloadHistory: z.array(z.object({
    timestamp: z.date(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    format: z.string().default('png')
  })).default([]),
  shareHistory: z.array(z.object({
    timestamp: z.date(),
    platform: z.string().optional(),
    method: z.string().optional()
  })).default([])
});

export const CreateQRCodeRequest = z.object({
  content: z.string().min(1, 'Content is required'),
  type: QRCodeType,
  title: z.string().optional(),
  description: z.string().optional(),
  size: z.number().min(100).max(1000).default(200),
  foregroundColor: z.string().default('#000000'),
  backgroundColor: z.string().default('#FFFFFF'),
  errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']).default('M'),
  margin: z.number().min(0).max(10).default(2),
  expiresAt: z.date().optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  // WiFi specific fields
  ssid: z.string().optional(),
  password: z.string().optional(),
  security: z.enum(['WEP', 'WPA', 'WPA2', 'WPA3', 'nopass']).optional(),
  hidden: z.boolean().optional(),
  // vCard specific fields
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  organization: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
  // Location specific fields
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  // Event specific fields
  eventTitle: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  location: z.string().optional(),
  description: z.string().optional()
});

export const QRCode = z.object({
  _id: z.string().optional(),
  content: z.string(),
  type: QRCodeType,
  title: z.string().optional(),
  description: z.string().optional(),
  size: z.number(),
  foregroundColor: z.string(),
  backgroundColor: z.string(),
  errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']),
  margin: z.number(),
  qrCodeDataUrl: z.string(),
  qrCodeImageUrl: z.string().optional(),
  userId: z.string(),
  anonymousUserId: z.string().optional(),
  deviceFingerprint: z.string().optional(),
  ipAddress: z.string().optional(),
  status: QRCodeStatus,
  isPublic: z.boolean(),
  tags: z.array(z.string()),
  expiresAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  analytics: QRCodeAnalytics,
  // Additional fields for specific QR types
  ssid: z.string().optional(),
  password: z.string().optional(),
  security: z.enum(['WEP', 'WPA', 'WPA2', 'WPA3', 'nopass']).optional(),
  hidden: z.boolean().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  organization: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  eventTitle: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  location: z.string().optional()
});

export const QRCodeStats = z.object({
  totalQRCodes: z.number(),
  totalScans: z.number(),
  totalDownloads: z.number(),
  totalShares: z.number(),
  activeQRCodes: z.number(),
  expiredQRCodes: z.number(),
  averageScansPerCode: z.number(),
  topPerformingQRCodes: z.array(z.object({
    id: z.string(),
    title: z.string().optional(),
    content: z.string(),
    scans: z.number(),
    downloads: z.number(),
    shares: z.number(),
    createdAt: z.date()
  })),
  recentActivity: z.array(z.object({
    date: z.string(),
    scans: z.number(),
    downloads: z.number(),
    shares: z.number(),
    newQRCodes: z.number()
  })),
  typeDistribution: z.record(z.string(), z.number()),
  scanTrends: z.array(z.object({
    date: z.string(),
    scans: z.number()
  }))
});

export const UpdateQRCodeRequest = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  expiresAt: z.date().optional(),
  status: QRCodeStatus.optional()
});

export const QRCodeSearchFilters = z.object({
  query: z.string().optional(),
  type: QRCodeType.optional(),
  status: QRCodeStatus.optional(),
  tags: z.array(z.string()).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'scans', 'downloads', 'shares', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
});

// Type exports
export type QRCodeType = z.infer<typeof QRCodeType>;
export type QRCodeStatus = z.infer<typeof QRCodeStatus>;
export type QRCodeAnalytics = z.infer<typeof QRCodeAnalytics>;
export type CreateQRCodeRequest = z.infer<typeof CreateQRCodeRequest>;
export type QRCode = z.infer<typeof QRCode>;
export type QRCodeStats = z.infer<typeof QRCodeStats>;
export type UpdateQRCodeRequest = z.infer<typeof UpdateQRCodeRequest>;
export type QRCodeSearchFilters = z.infer<typeof QRCodeSearchFilters>;

// Helper functions
export function generateQRCodeContent(data: CreateQRCodeRequest): string {
  switch (data.type) {
    case 'url':
      return data.content.startsWith('http') ? data.content : `https://${data.content}`;
    
    case 'email':
      return `mailto:${data.content}`;
    
    case 'phone':
      return `tel:${data.content}`;
    
    case 'sms':
      return `sms:${data.content}`;
    
    case 'wifi':
      if (!data.ssid) throw new Error('SSID is required for WiFi QR codes');
      const security = data.security || 'nopass';
      const hidden = data.hidden ? 'H:true' : 'H:false';
      return `WIFI:T:${security};S:${data.ssid};P:${data.password || ''};${hidden};;`;
    
    case 'vcard':
      const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        data.firstName && `FN:${data.firstName} ${data.lastName || ''}`,
        data.firstName && `N:${data.lastName || ''};${data.firstName};;;`,
        data.organization && `ORG:${data.organization}`,
        data.title && `TITLE:${data.title}`,
        data.phone && `TEL:${data.phone}`,
        data.email && `EMAIL:${data.email}`,
        data.website && `URL:${data.website}`,
        data.address && `ADR:;;${data.address};;;;`,
        'END:VCARD'
      ].filter(Boolean).join('\n');
      return vcard;
    
    case 'location':
      if (!data.latitude || !data.longitude) {
        throw new Error('Latitude and longitude are required for location QR codes');
      }
      return `geo:${data.latitude},${data.longitude}`;
    
    case 'event':
      if (!data.eventTitle || !data.startDate) {
        throw new Error('Event title and start date are required for event QR codes');
      }
      const startDate = data.startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endDate = data.endDate ? data.endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : startDate;
      return `BEGIN:VEVENT\nSUMMARY:${data.eventTitle}\nDTSTART:${startDate}\nDTEND:${endDate}\n${data.location ? `LOCATION:${data.location}` : ''}\n${data.description ? `DESCRIPTION:${data.description}` : ''}\nEND:VEVENT`;
    
    default:
      return data.content;
  }
}

export function validateQRCodeContent(type: QRCodeType, content: string): boolean {
  switch (type) {
    case 'url':
      try {
        new URL(content.startsWith('http') ? content : `https://${content}`);
        return true;
      } catch {
        return false;
      }
    
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content);
    
    case 'phone':
      return /^[\+]?[1-9][\d]{0,15}$/.test(content.replace(/[\s\-\(\)]/g, ''));
    
    case 'sms':
      return /^[\+]?[1-9][\d]{0,15}$/.test(content.replace(/[\s\-\(\)]/g, ''));
    
    case 'text':
    case 'wifi':
    case 'vcard':
    case 'location':
    case 'event':
      return content.length > 0;
    
    default:
      return false;
  }
}

import { z } from 'zod';

// Profile Settings Validation
export const profileSchema = z.object({
  displayName: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must not exceed 50 characters')
    .optional(),
  bio: z.string()
    .max(500, 'Bio must not exceed 500 characters')
    .optional(),
  avatarUrl: z.string()
    .url('Invalid avatar URL')
    .optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).optional(),
});

// Notification Settings Validation
export const notificationsSchema = z.object({
  email: z.object({
    analysisResults: z.boolean().optional(),
    weeklyReports: z.boolean().optional(),
    systemUpdates: z.boolean().optional(),
    marketing: z.boolean().optional(),
  }).optional(),
  push: z.object({
    analysisComplete: z.boolean().optional(),
    newFeatures: z.boolean().optional(),
    reminders: z.boolean().optional(),
  }).optional(),
  frequency: z.enum(['immediate', 'daily', 'weekly']).optional(),
});

// Privacy Settings Validation
export const privacySchema = z.object({
  profileVisibility: z.enum(['public', 'private', 'friends']).optional(),
  shareAnalytics: z.boolean().optional(),
  allowDataCollection: z.boolean().optional(),
  showUsageStats: z.boolean().optional(),
});

// Application Settings Validation
export const applicationSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  compactMode: z.boolean().optional(),
  autoSave: z.boolean().optional(),
  defaultTool: z.string().optional(),
  resultsPerPage: z.number()
    .min(5, 'Results per page must be at least 5')
    .max(100, 'Results per page must not exceed 100')
    .optional(),
});

// Security Settings Validation
export const securitySchema = z.object({
  twoFactorEnabled: z.boolean().optional(),
  sessionTimeout: z.number()
    .min(1, 'Session timeout must be at least 1 hour')
    .max(168, 'Session timeout must not exceed 168 hours (1 week)')
    .optional(),
  loginNotifications: z.boolean().optional(),
  deviceManagement: z.boolean().optional(),
});

// Data Management Settings Validation
export const dataManagementSchema = z.object({
  autoDeleteOldAnalyses: z.boolean().optional(),
  retentionPeriod: z.number()
    .min(30, 'Retention period must be at least 30 days')
    .max(2555, 'Retention period must not exceed 2555 days (7 years)')
    .optional(),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  exportData: z.boolean().optional(),
});

// Integration Settings Validation
export const integrationSchema = z.object({
  exportFormat: z.enum(['json', 'csv', 'pdf']).optional(),
  autoExport: z.boolean().optional(),
  webhookUrl: z.string()
    .url('Invalid webhook URL')
    .optional(),
  apiKey: z.string()
    .min(32, 'API key must be at least 32 characters')
    .max(256, 'API key must not exceed 256 characters')
    .optional(),
});

// Complete User Settings Validation
export const userSettingsSchema = z.object({
  profile: profileSchema.optional(),
  notifications: notificationsSchema.optional(),
  privacy: privacySchema.optional(),
  application: applicationSchema.optional(),
  security: securitySchema.optional(),
  dataManagement: dataManagementSchema.optional(),
  integrations: integrationSchema.optional(),
});

// Type exports for TypeScript
export type ProfileSettings = z.infer<typeof profileSchema>;
export type NotificationSettings = z.infer<typeof notificationsSchema>;
export type PrivacySettings = z.infer<typeof privacySchema>;
export type ApplicationSettings = z.infer<typeof applicationSchema>;
export type SecuritySettings = z.infer<typeof securitySchema>;
export type DataManagementSettings = z.infer<typeof dataManagementSchema>;
export type IntegrationSettings = z.infer<typeof integrationSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>; 
import { z } from 'zod';

// System Overview Schema
export const SystemOverviewSchema = z.object({
  totalUsers: z.number().min(0),
  activeUsers: z.number().min(0),
  totalTools: z.number().min(0),
  totalUsage: z.number().min(0),
  lastUpdated: z.string()
});

// System Health Schema
export const SystemHealthSchema = z.object({
  apiStatus: z.enum(['Online', 'Offline', 'Degraded']),
  database: z.enum(['Connected', 'Disconnected', 'Slow']),
  uptime: z.number().min(0).max(100),
  responseTime: z.number().min(0),
  errorRate: z.number().min(0).max(100),
  lastDowntime: z.string().optional()
});

// Alert Schema
export const AlertSchema = z.object({
  id: z.string(),
  type: z.enum(['info', 'warning', 'error', 'success']),
  title: z.string(),
  message: z.string(),
  timestamp: z.string(),
  isRead: z.boolean().default(false)
});

// Tool Usage Analytics Schema
export const ToolUsageAnalyticsSchema = z.object({
  toolSlug: z.string(),
  toolName: z.string(),
  usageCount: z.number().min(0),
  growthPercentage: z.number(),
  period: z.string()
});

// Recent Activity Schema
export const RecentActivitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  userEmail: z.string(),
  action: z.string(),
  toolSlug: z.string().optional(),
  timestamp: z.string(),
  details: z.string().optional()
});

// Dashboard Stats Schema
export const DashboardStatsSchema = z.object({
  systemOverview: SystemOverviewSchema,
  systemHealth: SystemHealthSchema,
  alerts: z.array(AlertSchema),
  toolUsageAnalytics: z.array(ToolUsageAnalyticsSchema),
  recentActivity: z.array(RecentActivitySchema)
});

// Dashboard Response Schema
export const DashboardResponseSchema = z.object({
  success: z.boolean(),
  data: DashboardStatsSchema.optional(),
  error: z.string().optional()
});

// Notification Schema
export const NotificationSchema = z.object({
  id: z.string(),
  type: z.enum(['system', 'user', 'tool', 'security']),
  title: z.string(),
  message: z.string(),
  timestamp: z.string(),
  isRead: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium')
});

// Quick Action Schema
export const QuickActionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  href: z.string(),
  color: z.string().optional()
});

// Type exports
export type SystemOverview = z.infer<typeof SystemOverviewSchema>;
export type SystemHealth = z.infer<typeof SystemHealthSchema>;
export type Alert = z.infer<typeof AlertSchema>;
export type ToolUsageAnalytics = z.infer<typeof ToolUsageAnalyticsSchema>;
export type RecentActivity = z.infer<typeof RecentActivitySchema>;
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type QuickAction = z.infer<typeof QuickActionSchema>; 
import { z } from 'zod';

// User Analytics Schema
export const UserAnalyticsSchema = z.object({
  totalUsers: z.number().min(0),
  activeUsers: z.number().min(0),
  newUsers: z.number().min(0),
  userGrowth: z.array(z.object({
    date: z.string(),
    count: z.number().min(0)
  })),
  userActivityByTool: z.array(z.object({
    toolSlug: z.string(),
    uniqueUsers: z.number().min(0),
    totalUsage: z.number().min(0)
  }))
});

// Usage Analytics Schema
export const UsageAnalyticsSchema = z.object({
  totalUsage: z.number().min(0),
  uniqueUsers: z.number().min(0),
  avgUsagePerUser: z.number().min(0),
  toolUsage: z.array(z.object({
    toolSlug: z.string(),
    totalUsage: z.number().min(0),
    uniqueUsers: z.number().min(0),
    avgDuration: z.number().min(0)
  }))
});

// Performance Analytics Schema
export const PerformanceAnalyticsSchema = z.object({
  avgResponseTime: z.number().min(0),
  successRate: z.number().min(0).max(100),
  errorRate: z.number().min(0).max(100),
  uptime: z.number().min(0).max(100),
  performanceMetrics: z.array(z.object({
    toolSlug: z.string(),
    avgResponseTime: z.number().min(0),
    successRate: z.number().min(0).max(100)
  }))
});

// Combined Analytics Schema
export const AnalyticsDataSchema = z.object({
  users: UserAnalyticsSchema,
  usage: UsageAnalyticsSchema,
  performance: PerformanceAnalyticsSchema
});

// API Response Schema
export const AnalyticsResponseSchema = z.object({
  success: z.boolean(),
  data: AnalyticsDataSchema.optional(),
  error: z.string().optional()
});

// Time Range Schema
export const TimeRangeSchema = z.enum(['1d', '7d', '30d', '90d', 'all']);

// Tool Usage Schema
export const ToolUsageSchema = z.object({
  toolSlug: z.string(),
  toolName: z.string(),
  totalUsage: z.number().min(0),
  uniqueUsers: z.number().min(0),
  usageByType: z.array(z.object({
    type: z.string(),
    count: z.number().min(0)
  })),
  lastUsed: z.string(),
  firstUsed: z.string(),
  avgUsagePerUser: z.number().min(0)
});

// Overall Stats Schema
export const OverallStatsSchema = z.object({
  totalUsage: z.number().min(0),
  totalUniqueUsers: z.number().min(0),
  totalTools: z.number().min(0),
  averageUsagePerTool: z.number().min(0),
  averageUsagePerUser: z.number().min(0)
});

// Tool Usage Data Schema
export const ToolUsageDataSchema = z.object({
  overallStats: OverallStatsSchema,
  toolUsageStats: z.array(ToolUsageSchema),
  usageByType: z.array(z.object({
    _id: z.string(),
    count: z.number().min(0)
  })),
  dailyUsage: z.array(z.object({
    _id: z.string(),
    tools: z.array(z.object({
      toolSlug: z.string(),
      count: z.number().min(0)
    })),
    totalCount: z.number().min(0)
  })),
  topTools: z.array(ToolUsageSchema),
  recentActivity: z.array(z.object({
    _id: z.string(),
    userId: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string()
    }),
    toolSlug: z.string(),
    toolName: z.string(),
    usageType: z.string(),
    createdAt: z.string()
  })),
  timeRange: z.string(),
  generatedAt: z.string()
});

// Tool Usage Response Schema
export const ToolUsageResponseSchema = z.object({
  success: z.boolean(),
  data: ToolUsageDataSchema.optional(),
  error: z.string().optional()
});

// Type exports
export type UserAnalytics = z.infer<typeof UserAnalyticsSchema>;
export type UsageAnalytics = z.infer<typeof UsageAnalyticsSchema>;
export type PerformanceAnalytics = z.infer<typeof PerformanceAnalyticsSchema>;
export type AnalyticsData = z.infer<typeof AnalyticsDataSchema>;
export type AnalyticsResponse = z.infer<typeof AnalyticsResponseSchema>;
export type TimeRange = z.infer<typeof TimeRangeSchema>;
export type ToolUsage = z.infer<typeof ToolUsageSchema>;
export type OverallStats = z.infer<typeof OverallStatsSchema>;
export type ToolUsageData = z.infer<typeof ToolUsageDataSchema>;
export type ToolUsageResponse = z.infer<typeof ToolUsageResponseSchema>; 
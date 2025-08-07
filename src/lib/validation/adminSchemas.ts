import { z } from 'zod';

// Admin User Schemas
export const AdminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const AdminUserCreateSchema = z.object({
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['super_admin', 'admin', 'moderator']).default('admin'),
  permissions: z.array(z.string()).optional()
});

export const AdminUserUpdateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  role: z.enum(['super_admin', 'admin', 'moderator']).optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
});

// User Management Schemas
export const UserCreateSchema = z.object({
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['user', 'moderator', 'admin']).default('user'),
  status: z.enum(['active', 'inactive']).default('active')
});

export const UserUpdateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  role: z.enum(['user', 'moderator', 'admin']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  password: z.string().min(8).optional()
});

export const UserActionSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'suspend', 'update_role', 'update_profile', 'reset_password']),
  role: z.enum(['user', 'moderator', 'admin']).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional()
});

export const BulkUserActionSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'update_role', 'delete']),
  userIds: z.array(z.string().min(1)),
  role: z.enum(['user', 'moderator', 'admin']).optional()
});

// System Settings Schemas
export const SystemSettingsSchema = z.object({
  general: z.object({
    siteName: z.string().min(1).max(100),
    siteDescription: z.string().max(500),
    maintenanceMode: z.boolean(),
    registrationEnabled: z.boolean(),
    maxUsers: z.number().min(1).max(1000000)
  }),
  security: z.object({
    sessionTimeout: z.number().min(1).max(168), // 1 hour to 1 week
    maxLoginAttempts: z.number().min(1).max(20),
    passwordMinLength: z.number().min(6).max(50),
    requireEmailVerification: z.boolean(),
    enableTwoFactor: z.boolean()
  }),
  notifications: z.object({
    emailNotifications: z.boolean(),
    adminAlerts: z.boolean(),
    userNotifications: z.boolean(),
    alertThreshold: z.number().min(1).max(1000)
  }),
  analytics: z.object({
    dataRetentionDays: z.number().min(1).max(3650), // 1 day to 10 years
    enableTracking: z.boolean(),
    anonymizeData: z.boolean(),
    exportEnabled: z.boolean()
  })
});

// Service Management Schemas
export const ToolStatusSchema = z.enum(['active', 'maintenance', 'disabled', 'deprecated']);

export const ToolUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: ToolStatusSchema.optional(),
  config: z.object({
    rateLimit: z.number().min(1).optional(),
    maxRequests: z.number().min(1).optional(),
    timeout: z.number().min(1000).optional()
  }).optional()
});

export const ServiceToggleSchema = z.object({
  toolId: z.string().min(1),
  status: ToolStatusSchema
});

// Analytics Schemas
export const AnalyticsTimeRangeSchema = z.enum(['7d', '30d', '90d']);

export const AnalyticsQuerySchema = z.object({
  range: AnalyticsTimeRangeSchema.default('7d'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.enum(['all', 'admin', 'user', 'system']).default('all'),
  status: z.enum(['all', 'success', 'failed', 'pending']).default('all')
});

// Activity Log Schemas
export const ActivityLogQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.enum(['all', 'admin', 'user', 'system']).default('all'),
  status: z.enum(['all', 'success', 'failed', 'pending']).default('all'),
  range: AnalyticsTimeRangeSchema.default('7d')
});

// Pagination Schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  role: z.enum(['all', 'user', 'moderator', 'admin']).default('all')
});

// Response Schemas
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  data: z.any().optional()
});

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string().optional()
});

export const PaginatedResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    totalItems: z.number(),
    totalPages: z.number()
  })
});

// Validation helper functions
export const validateAdminLogin = (data: any) => AdminLoginSchema.parse(data);
export const validateAdminUserCreate = (data: any) => AdminUserCreateSchema.parse(data);
export const validateAdminUserUpdate = (data: any) => AdminUserUpdateSchema.parse(data);
export const validateUserCreate = (data: any) => UserCreateSchema.parse(data);
export const validateUserUpdate = (data: any) => UserUpdateSchema.parse(data);
export const validateUserAction = (data: any) => UserActionSchema.parse(data);
export const validateBulkUserAction = (data: any) => BulkUserActionSchema.parse(data);
export const validateSystemSettings = (data: any) => SystemSettingsSchema.parse(data);
export const validateToolUpdate = (data: any) => ToolUpdateSchema.parse(data);
export const validateServiceToggle = (data: any) => ServiceToggleSchema.parse(data);
export const validateAnalyticsQuery = (data: any) => AnalyticsQuerySchema.parse(data);
export const validateActivityLogQuery = (data: any) => ActivityLogQuerySchema.parse(data);
export const validatePagination = (data: any) => PaginationSchema.parse(data); 
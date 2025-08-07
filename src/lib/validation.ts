import { z } from 'zod';

// User validation schemas
export const UserValidationSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  image: z.string().url().optional(),
  avatar: z.string().url().optional(),
  provider: z.string().min(1, 'Provider is required'),
  providerAccountId: z.string().min(1, 'Provider account ID is required'),
  role: z.enum(['user', 'admin']).default('user'),
  isActive: z.boolean().default(true),
  emailVerified: z.boolean().default(false),
  twoFactorEnabled: z.boolean().default(false)
});

// User update validation schema
export const UserUpdateValidationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  image: z.string().url().optional(),
  avatar: z.string().url().optional(),
  role: z.enum(['user', 'admin']).optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional()
});

// Admin user validation schema
export const AdminUserValidationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['super_admin', 'admin', 'moderator']).default('admin'),
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean().default(true)
});

// Admin user update validation schema
export const AdminUserUpdateValidationSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  role: z.enum(['super_admin', 'admin', 'moderator']).optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
});

// Password change validation schema
export const PasswordChangeValidationSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Login validation schema
export const LoginValidationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Tool usage validation schema
export const ToolUsageValidationSchema = z.object({
  toolSlug: z.string().min(1, 'Tool slug is required'),
  toolName: z.string().min(1, 'Tool name is required'),
  usageType: z.enum(['view', 'generate', 'download', 'share']).default('view'),
  metadata: z.record(z.any()).optional()
});

// Analysis validation schema
export const AnalysisValidationSchema = z.object({
  toolSlug: z.string().min(1, 'Tool slug is required'),
  toolName: z.string().min(1, 'Tool name is required'),
  analysisType: z.string().min(1, 'Analysis type is required'),
  parameters: z.record(z.any()),
  result: z.record(z.any()),
  duration: z.number().min(0, 'Duration must be non-negative'),
  success: z.boolean().default(true),
  error: z.string().optional()
});

// User settings validation schema
export const UserSettingsValidationSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
    marketing: z.boolean().default(false),
    updates: z.boolean().default(true),
    security: z.boolean().default(true)
  }).optional(),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'private', 'friends']).default('public'),
    dataSharing: z.boolean().default(false),
    analytics: z.boolean().default(true),
    thirdParty: z.boolean().default(false)
  }).optional(),
  accessibility: z.object({
    highContrast: z.boolean().default(false),
    largeText: z.boolean().default(false),
    screenReader: z.boolean().default(false),
    reducedMotion: z.boolean().default(false)
  }).optional()
});

// Pagination validation schema
export const PaginationValidationSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Search validation schema
export const SearchValidationSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
  filters: z.record(z.any()).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10)
});

// Date range validation schema
export const DateRangeValidationSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "Start date must be before or equal to end date",
  path: ["endDate"]
});

// Export validation schemas
export const ValidationSchemas = {
  User: UserValidationSchema,
  UserUpdate: UserUpdateValidationSchema,
  AdminUser: AdminUserValidationSchema,
  AdminUserUpdate: AdminUserUpdateValidationSchema,
  PasswordChange: PasswordChangeValidationSchema,
  Login: LoginValidationSchema,
  ToolUsage: ToolUsageValidationSchema,
  Analysis: AnalysisValidationSchema,
  UserSettings: UserSettingsValidationSchema,
  Pagination: PaginationValidationSchema,
  Search: SearchValidationSchema,
  DateRange: DateRangeValidationSchema
};

// Validation helper functions
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};

export const validatePartialData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: Partial<T>; errors?: string[] } => {
  try {
    const validatedData = schema.partial().parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}; 
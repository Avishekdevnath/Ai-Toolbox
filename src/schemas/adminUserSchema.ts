import { z } from 'zod';

// Admin User Base Schema
export const AdminUserBaseSchema = z.object({
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  role: z.enum(['super_admin', 'admin', 'moderator'], {
    errorMap: () => ({ message: 'Role must be super_admin, admin, or moderator' })
  }),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  isActive: z.boolean().default(true),
  loginAttempts: z.number().min(0).max(10).default(0),
  lastLoginAt: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Admin User Create Schema
export const AdminUserCreateSchema = AdminUserBaseSchema.extend({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Admin User Update Schema
export const AdminUserUpdateSchema = AdminUserBaseSchema.partial().extend({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .optional(),
  confirmPassword: z.string().optional()
}).refine((data) => {
  if (data.password && data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Admin User Login Schema
export const AdminUserLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Admin User Verification Schema
export const AdminUserVerificationSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  adminId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid admin ID format')
});

// Admin User Permission Schema
export const AdminUserPermissionSchema = z.object({
  permission: z.enum([
    'manage_users',
    'manage_tools', 
    'view_analytics',
    'manage_system',
    'manage_content',
    'view_audit_logs',
    'manage_admins',
    'view_dashboard',
    'manage_settings'
  ]),
  action: z.enum(['grant', 'revoke'])
});

// Admin User Role Assignment Schema
export const AdminUserRoleAssignmentSchema = z.object({
  role: z.enum(['super_admin', 'admin', 'moderator']),
  permissions: z.array(z.string()).min(1, 'At least one permission is required')
});

// Admin User Status Update Schema
export const AdminUserStatusUpdateSchema = z.object({
  isActive: z.boolean(),
  reason: z.string().optional()
});

// Admin User Search Schema
export const AdminUserSearchSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['all', 'super_admin', 'admin', 'moderator']).default('all'),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['email', 'firstName', 'lastName', 'role', 'createdAt', 'lastLoginAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Admin User Bulk Action Schema
export const AdminUserBulkActionSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'delete', 'update_role', 'update_permissions']),
  adminIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid admin ID format')).min(1, 'At least one admin ID is required'),
  role: z.enum(['super_admin', 'admin', 'moderator']).optional(),
  permissions: z.array(z.string()).optional(),
  reason: z.string().optional()
});

// Admin User Activity Log Schema
export const AdminUserActivityLogSchema = z.object({
  adminId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid admin ID format'),
  action: z.string().min(1, 'Action is required'),
  details: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.date().default(() => new Date())
});

// Admin User Session Schema
export const AdminUserSessionSchema = z.object({
  adminId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid admin ID format'),
  token: z.string().min(1, 'Token is required'),
  expiresAt: z.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  isActive: z.boolean().default(true)
});

// Admin User Password Reset Schema
export const AdminUserPasswordResetSchema = z.object({
  email: z.string().email('Invalid email format'),
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"]
});

// Admin User Profile Update Schema
export const AdminUserProfileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email format')
});

// Response Schemas
export const AdminUserResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    admin: z.object({
      id: z.string(),
      email: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      role: z.string(),
      permissions: z.array(z.string()),
      isActive: z.boolean(),
      lastLoginAt: z.date().nullable(),
      createdAt: z.date(),
      updatedAt: z.date()
    }).optional(),
    token: z.string().optional(),
    message: z.string().optional()
  }).optional(),
  error: z.string().optional()
});

export const AdminUserListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    admins: z.array(z.object({
      id: z.string(),
      email: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      role: z.string(),
      permissions: z.array(z.string()),
      isActive: z.boolean(),
      lastLoginAt: z.date().nullable(),
      createdAt: z.date(),
      updatedAt: z.date()
    })),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      totalAdmins: z.number(),
      totalPages: z.number()
    })
  }).optional(),
  error: z.string().optional()
});

// Validation helper functions
export const validateAdminUserCreate = (data: any) => AdminUserCreateSchema.parse(data);
export const validateAdminUserUpdate = (data: any) => AdminUserUpdateSchema.parse(data);
export const validateAdminUserLogin = (data: any) => AdminUserLoginSchema.parse(data);
export const validateAdminUserVerification = (data: any) => AdminUserVerificationSchema.parse(data);
export const validateAdminUserPermission = (data: any) => AdminUserPermissionSchema.parse(data);
export const validateAdminUserRoleAssignment = (data: any) => AdminUserRoleAssignmentSchema.parse(data);
export const validateAdminUserStatusUpdate = (data: any) => AdminUserStatusUpdateSchema.parse(data);
export const validateAdminUserSearch = (data: any) => AdminUserSearchSchema.parse(data);
export const validateAdminUserBulkAction = (data: any) => AdminUserBulkActionSchema.parse(data);
export const validateAdminUserPasswordReset = (data: any) => AdminUserPasswordResetSchema.parse(data);
export const validateAdminUserProfileUpdate = (data: any) => AdminUserProfileUpdateSchema.parse(data); 
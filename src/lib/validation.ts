import { z } from 'zod';

/**
 * Common validation schemas
 */
export const validationSchemas = {
  // User-related schemas
  user: {
    email: z.string().email('Invalid email address'),
    firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username too long')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
    password: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  },

  // Tool usage schemas
  toolUsage: {
    toolSlug: z.string().min(1, 'Tool slug is required').max(100, 'Tool slug too long')
      .regex(/^[a-z0-9-]+$/, 'Tool slug can only contain lowercase letters, numbers, and hyphens'),
    toolName: z.string().min(1, 'Tool name is required').max(100, 'Tool name too long'),
    action: z.string().min(1, 'Action is required').max(50, 'Action too long'),
    processingTime: z.number().min(0, 'Processing time cannot be negative').max(300000, 'Processing time too high'), // 5 minutes max
    success: z.boolean(),
    errorMessage: z.string().max(1000, 'Error message too long').optional(),
  },

  // Admin schemas
  admin: {
    clerkId: z.string().min(1, 'User ID is required'),
    role: z.enum(['user', 'admin'], { errorMap: () => ({ message: 'Role must be either user or admin' }) }),
    isActive: z.boolean(),
    page: z.number().min(1, 'Page must be at least 1').max(1000, 'Page too high'),
    limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit too high'),
    search: z.string().max(100, 'Search term too long').optional(),
  },

  // API request schemas
  api: {
    endpoint: z.string().min(1, 'Endpoint is required').max(200, 'Endpoint too long'),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], { 
      errorMap: () => ({ message: 'Invalid HTTP method' }) 
    }),
  },

  // Pagination schemas
  pagination: {
    page: z.number().min(1, 'Page must be at least 1').max(1000, 'Page too high'),
    limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit too high'),
    sortBy: z.string().max(50, 'Sort field too long').optional(),
    sortOrder: z.enum(['asc', 'desc'], { 
      errorMap: () => ({ message: 'Sort order must be asc or desc' }) 
    }).optional(),
  },

  // Date range schemas
  dateRange: {
    startDate: z.string().datetime('Invalid start date').optional(),
    endDate: z.string().datetime('Invalid end date').optional(),
    period: z.number().min(1, 'Period must be at least 1 day').max(365, 'Period too long').optional(),
  },
};

/**
 * Sanitize input data to prevent injection attacks
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

/**
 * Validate and sanitize request body
 */
export function validateRequestBody<T>(
  body: any,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    // Sanitize input first
    const sanitized = sanitizeInput(body);
    
    // Validate with schema
    const validated = schema.parse(sanitized);
    
    return {
      success: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => err.message),
      };
    }
    
    return {
      success: false,
      errors: ['Invalid request data'],
    };
  }
}

/**
 * Validate query parameters
 */
export function validateQueryParams<T>(
  query: any,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    // Convert string values to appropriate types
    const processed: any = {};
    
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'string') {
        // Try to convert to number if it looks like a number
        if (/^\d+$/.test(value)) {
          processed[key] = parseInt(value, 10);
        } else if (/^\d+\.\d+$/.test(value)) {
          processed[key] = parseFloat(value);
        } else if (value === 'true' || value === 'false') {
          processed[key] = value === 'true';
        } else {
          processed[key] = value;
        }
      } else {
        processed[key] = value;
      }
    }
    
    // Sanitize and validate
    const sanitized = sanitizeInput(processed);
    const validated = schema.parse(sanitized);
    
    return {
      success: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => err.message),
      };
    }
    
    return {
      success: false,
      errors: ['Invalid query parameters'],
    };
  }
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File | null,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    maxFiles?: number;
  } = {}
): { success: true } | { success: false; error: string } {
  if (!file) {
    return { success: false, error: 'No file provided' };
  }
  
  const { maxSize = 10 * 1024 * 1024, allowedTypes = [], maxFiles = 1 } = options;
  
  // Check file size
  if (file.size > maxSize) {
    return { 
      success: false, 
      error: `File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB` 
    };
  }
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { 
      success: false, 
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }
  
  return { success: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number; // 0-4
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }
  
  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one lowercase letter');
  }
  
  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one uppercase letter');
  }
  
  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one number');
  }
  
  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one special character');
  }
  
  return {
    isValid: score >= 4,
    score,
    feedback,
  };
}

/**
 * Create a validation middleware
 */
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: any) => validateRequestBody(data, schema);
}

/**
 * Common validation error response
 */
export function createValidationErrorResponse(errors: string[]) {
  return {
    success: false,
    error: 'Validation failed',
    details: errors,
    timestamp: new Date().toISOString(),
  };
} 
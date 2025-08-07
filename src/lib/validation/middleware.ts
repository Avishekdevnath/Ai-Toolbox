import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export interface ValidationConfig {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}

export function withValidation(handler: Function, config: ValidationConfig) {
  return async (request: NextRequest, context?: any) => {
    try {
      // Validate query parameters
      if (config.query) {
        const url = new URL(request.url);
        const queryParams = Object.fromEntries(url.searchParams.entries());
        config.query.parse(queryParams);
      }

      // Validate URL parameters
      if (config.params && context?.params) {
        config.params.parse(context.params);
      }

      // Validate request body
      if (config.body && request.method !== 'GET') {
        const body = await request.json().catch(() => ({}));
        config.body.parse(body);
      }

      // Call the original handler
      return await handler(request, context);
    } catch (error) {
      if (error instanceof z.ZodError && error.errors) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: errors
        }, { status: 400 });
      }

      // Handle other validation errors
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: [{ field: 'unknown', message: error.message }]
        }, { status: 400 });
      }

      // Re-throw non-validation errors
      throw error;
    }
  };
}

// Helper function to create validated API handlers
export function createValidatedHandler(
  handler: Function,
  config: ValidationConfig
) {
  return withValidation(handler, config);
}

// Common validation patterns
export const validateObjectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');
export const validateEmail = z.string().email('Invalid email format');
export const validatePagination = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
});

// Error response helper
export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({
    success: false,
    error: message
  }, { status });
}

// Success response helper
export function createSuccessResponse(data: any, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message
  });
} 
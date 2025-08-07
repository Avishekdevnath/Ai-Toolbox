/**
 * Centralized Configuration Management
 * 
 * This file standardizes all environment variables and provides
 * validation to ensure required variables are present.
 */

// Configuration and environment variable management
export const config = {
  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || '',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || '',
  },

  // AI Services
  ai: {
    googleApiKey: process.env.GOOGLE_AI_API_KEY || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
  },

  // Application
  app: {
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    secret: process.env.NEXTAUTH_SECRET || '',
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // Security
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // limit each IP to 100 requests per windowMs
    },
    cors: {
      allowedOrigins: [
        'http://localhost:3000',
        'https://ai-toolbox.com',
        'https://www.ai-toolbox.com',
      ],
    },
  },
};

// Validate required environment variables
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.mongodb.uri) {
    errors.push('MONGODB_URI is required');
  }

  if (!config.jwt.secret) {
    errors.push('JWT_SECRET is required');
  }

  if (!config.ai.googleApiKey && !config.ai.geminiApiKey) {
    errors.push('At least one AI API key (GOOGLE_AI_API_KEY or GEMINI_API_KEY) is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Get configuration for specific environment
export function getConfig() {
  const envValidation = validateEnvironment();
  
  if (!envValidation.isValid) {
    console.error('Environment validation failed:', envValidation.errors);
  }

  return config;
} 
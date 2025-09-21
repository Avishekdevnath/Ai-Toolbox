/**
 * Centralized Configuration Management
 * 
 * This file standardizes all environment variables and provides
 * validation to ensure required variables are present.
 */

export interface Config {
  // Google AI Configuration
  googleAI: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  
  // MongoDB Configuration
  mongodb: {
    uri: string;
    dbName: string;
    options: {
      maxPoolSize: number;
      serverSelectionTimeoutMS: number;
      socketTimeoutMS: number;
      retryWrites: boolean;
      retryReads: boolean;
    };
  };
  
  // Clerk Authentication Configuration
  clerk: {
    publishableKey: string;
    secretKey: string;
    signInUrl: string;
    signUpUrl: string;
    afterSignInUrl: string;
    afterSignUpUrl: string;
  };
  
  // Application Configuration
  app: {
    name: string;
    version: string;
    baseUrl: string;
    environment: 'development' | 'production' | 'test';
    port: number;
  };
  
  // Feature Flags
  features: {
    enableAnalytics: boolean;
    enableRateLimiting: boolean;
    enableCaching: boolean;
    enableHealthChecks: boolean;
  };
}

/**
 * Environment variable validation
 */
function validateEnvironmentVariables(): void {
  const required = [
    'GOOGLE_AI_API_KEY',
    'MONGODB_URI',
    'JWT_SECRET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }
  
  // Validate specific formats
  if (process.env.GOOGLE_AI_API_KEY && !process.env.GOOGLE_AI_API_KEY.startsWith('AIza')) {
    console.warn('⚠️  GOOGLE_AI_API_KEY format appears invalid. Should start with "AIza"');
  }
  
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mongodb')) {
    throw new Error('MONGODB_URI must be a valid MongoDB connection string');
  }
  
  if (process.env.CLERK_SECRET_KEY && process.env.CLERK_SECRET_KEY.length < 32) {
    console.warn('⚠️  CLERK_SECRET_KEY should be at least 32 characters long for security');
  }
}

/**
 * Centralized configuration object
 */
export const config: Config = {
  googleAI: {
    apiKey: process.env.GOOGLE_AI_API_KEY || '',
    model: process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash',
    maxTokens: parseInt(process.env.GOOGLE_AI_MAX_TOKENS || '2048'),
    temperature: parseFloat(process.env.GOOGLE_AI_TEMPERATURE || '0.7'),
  },
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-toolbox',
    dbName: process.env.MONGODB_DB_NAME || 'ai-toolbox',
    options: {
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10'),
      serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT || '5000'),
      socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT || '45000'),
      retryWrites: process.env.MONGODB_RETRY_WRITES !== 'false',
      retryReads: process.env.MONGODB_RETRY_READS !== 'false',
    },
  },
  
  clerk: {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
    secretKey: process.env.CLERK_SECRET_KEY || '',
    signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
    signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
    afterSignInUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/',
    afterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/',
  },
  
  app: {
    name: process.env.APP_NAME || 'AI Toolbox',
    version: process.env.APP_VERSION || '1.0.0',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    environment: (process.env.NODE_ENV as Config['app']['environment']) || 'development',
    port: parseInt(process.env.PORT || '3000'),
  },
  
  features: {
    enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false',
    enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false',
    enableCaching: process.env.ENABLE_CACHING !== 'false',
    enableHealthChecks: process.env.ENABLE_HEALTH_CHECKS !== 'false',
  },
};

/**
 * Validate configuration on module load
 */
if (typeof window === 'undefined') {
  // Only validate on server-side
  try {
    validateEnvironmentVariables();
    console.log('✅ Environment variables validated successfully');
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    // Don't throw in development to allow for easier setup
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

/**
 * Get configuration value with type safety
 */
export function getConfig<T extends keyof Config>(
  key: T
): Config[T] {
  return config[key];
}

/**
 * Get nested configuration value
 */
export function getConfigValue<T>(
  path: string,
  defaultValue?: T
): T {
  const keys = path.split('.');
  let value: any = config;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue as T;
    }
  }
  
  return value as T;
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof Config['features']): boolean {
  return config.features[feature];
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
  return {
    isDevelopment: config.app.environment === 'development',
    isProduction: config.app.environment === 'production',
    isTest: config.app.environment === 'test',
    baseUrl: config.app.baseUrl,
    apiKey: config.googleAI.apiKey ? '***' + config.googleAI.apiKey.slice(-4) : 'not set',
  };
}

/**
 * Export commonly used values for convenience
 */
export const {
  googleAI,
  mongodb,
  clerk,
  app,
  features,
} = config;

// Default export for backward compatibility
export default config; 
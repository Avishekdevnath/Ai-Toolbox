/**
 * Configuration Validation Utility
 * 
 * This module provides comprehensive validation for all application
 * configuration and can be used to check system health.
 */

import { getDatabase } from './mongodb';

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  services: {
    database: HealthStatus;
    ai: HealthStatus;
    auth: HealthStatus;
    config: HealthStatus;
  };
  timestamp: string;
  uptime: number;
}

export interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  details?: any;
}

export interface ConfigurationReport {
  environment: {
    nodeEnv: string;
    nextAuthUrl: string;
    googleAIKey: boolean;
    mongodbUri: boolean;
  };
  features: {
    auth: boolean;
    ai: boolean;
    database: boolean;
    fileUpload: boolean;
  };
  recommendations: string[];
}

/**
 * Check overall system health
 */
export async function checkSystemHealth(): Promise<SystemHealth> {
  const startTime = Date.now();
  
  try {
    // Check individual services
    const [dbHealth, aiHealth, authHealth, configHealth] = await Promise.allSettled([
      checkDatabaseHealth(),
      checkAIHealth(),
      checkAuthHealth(),
      checkConfigHealth(),
    ]);

    const services = {
      database: dbHealth.status === 'fulfilled' ? dbHealth.value : {
        status: 'critical' as const,
        message: 'Database health check failed',
        details: dbHealth.reason,
      },
      ai: aiHealth.status === 'fulfilled' ? aiHealth.value : {
        status: 'critical' as const,
        message: 'AI service health check failed',
        details: aiHealth.reason,
      },
      auth: authHealth.status === 'fulfilled' ? authHealth.value : {
        status: 'critical' as const,
        message: 'Authentication health check failed',
        details: authHealth.reason,
      },
      config: configHealth.status === 'fulfilled' ? configHealth.value : {
        status: 'critical' as const,
        message: 'Configuration health check failed',
        details: configHealth.reason,
      },
    };

    // Determine overall health
    const statuses = Object.values(services).map(s => s.status);
    let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (statuses.includes('critical')) {
      overall = 'critical';
    } else if (statuses.includes('warning')) {
      overall = 'warning';
    }

    return {
      overall,
      services,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      overall: 'critical',
      services: {
        database: { status: 'critical', message: 'System health check failed' },
        ai: { status: 'critical', message: 'System health check failed' },
        auth: { status: 'critical', message: 'System health check failed' },
        config: { status: 'critical', message: 'System health check failed' },
      },
      timestamp: new Date().toISOString(),
      uptime: Date.now() - startTime,
    };
  }
}

/**
 * Check database health
 */
async function checkDatabaseHealth(): Promise<HealthStatus> {
  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });
    
    return {
      status: 'healthy',
      message: 'Database connection successful',
    };
  } catch (error: any) {
    return {
      status: 'critical',
      message: 'Database connection failed',
      details: error.message,
    };
  }
}

/**
 * Check AI service health
 */
async function checkAIHealth(): Promise<HealthStatus> {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
      return {
        status: 'critical',
        message: 'Google AI API key not configured',
      };
    }

    // Simple validation - check if key looks valid
    if (apiKey.length < 10) {
      return {
        status: 'warning',
        message: 'Google AI API key appears invalid',
      };
    }

    return {
      status: 'healthy',
      message: 'AI service configured',
    };
  } catch (error: any) {
    return {
      status: 'critical',
      message: 'AI service health check failed',
      details: error.message,
    };
  }
}

/**
 * Check authentication health
 */
async function checkAuthHealth(): Promise<HealthStatus> {
  try {
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    
    if (!clerkPublishableKey || !clerkSecretKey) {
      return {
        status: 'critical',
        message: 'Clerk authentication not configured',
      };
    }

    return {
      status: 'healthy',
      message: 'Authentication service configured',
    };
  } catch (error: any) {
    return {
      status: 'critical',
      message: 'Authentication health check failed',
      details: error.message,
    };
  }
}

/**
 * Check configuration health
 */
async function checkConfigHealth(): Promise<HealthStatus> {
  try {
    const requiredVars = [
      'GOOGLE_AI_API_KEY',
      'MONGODB_URI',
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY',
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
      return {
        status: 'critical',
        message: `Missing required environment variables: ${missing.join(', ')}`,
      };
    }

    return {
      status: 'healthy',
      message: 'All required configuration present',
    };
  } catch (error: any) {
    return {
      status: 'critical',
      message: 'Configuration health check failed',
      details: error.message,
    };
  }
}

/**
 * Get detailed configuration report
 */
export function getConfigurationReport(): ConfigurationReport {
  const recommendations: string[] = [];

  // Check environment
  const nodeEnv = process.env.NODE_ENV || 'development';
  const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const googleAIKey = !!process.env.GOOGLE_AI_API_KEY;
  const mongodbUri = !!process.env.MONGODB_URI;

  // Check features
  const auth = !!(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  const ai = !!process.env.GOOGLE_AI_API_KEY;
  const database = !!process.env.MONGODB_URI;
  const fileUpload = !!(process.env.GOOGLE_DRIVE_CLIENT_EMAIL && process.env.GOOGLE_DRIVE_PRIVATE_KEY);

  // Generate recommendations
  if (!googleAIKey) {
    recommendations.push('Configure GOOGLE_AI_API_KEY for AI features');
  }
  if (!mongodbUri) {
    recommendations.push('Configure MONGODB_URI for data persistence');
  }
  if (!auth) {
    recommendations.push('Configure Clerk authentication for user management');
  }
  if (!fileUpload) {
    recommendations.push('Configure Google Drive for file upload features');
  }
  if (nodeEnv === 'development') {
    recommendations.push('Set NODE_ENV=production for production deployment');
  }

  return {
    environment: {
      nodeEnv,
      nextAuthUrl,
      googleAIKey,
      mongodbUri,
    },
    features: {
      auth,
      ai,
      database,
      fileUpload,
    },
    recommendations,
  };
} 
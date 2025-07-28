import { ObjectId } from 'mongodb';

export interface ToolUsage {
  _id?: ObjectId;
  toolName: string;
  userId?: string;
  anonymousUserId?: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  usageCount: number;
  firstUsed: Date;
  lastUsed: Date;
  totalTimeSpent?: number; // in seconds
  successCount: number;
  errorCount: number;
  metadata?: {
    inputSize?: number;
    outputSize?: number;
    processingTime?: number;
    aiTokensUsed?: number;
    cost?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ToolUsageStats {
  totalUsage: number;
  uniqueUsers: number;
  mostPopularTools: {
    toolName: string;
    usageCount: number;
    uniqueUsers: number;
  }[];
  recentActivity: {
    date: string;
    usageCount: number;
    uniqueUsers: number;
  }[];
  userEngagement: {
    userId: string;
    toolsUsed: number;
    totalUsage: number;
    lastActive: Date;
  }[];
  errorRate: {
    toolName: string;
    totalUsage: number;
    errorCount: number;
    errorRate: number;
  }[];
}

export interface ToolAnalytics {
  toolName: string;
  period: 'day' | 'week' | 'month' | 'year';
  totalUsage: number;
  uniqueUsers: number;
  averageSessionTime: number;
  successRate: number;
  topUsers: {
    userId: string;
    usageCount: number;
    lastUsed: Date;
  }[];
  usageByHour: {
    hour: number;
    usageCount: number;
  }[];
  usageByDay: {
    date: string;
    usageCount: number;
  }[];
  errorAnalysis: {
    errorType: string;
    count: number;
    percentage: number;
  }[];
}

export interface CreateToolUsageRequest {
  toolName: string;
  userId?: string;
  anonymousUserId?: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  metadata?: {
    inputSize?: number;
    outputSize?: number;
    processingTime?: number;
    aiTokensUsed?: number;
    cost?: number;
  };
}

export interface ToolUsageFilters {
  toolName?: string;
  userId?: string;
  anonymousUserId?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
  limit?: number;
  offset?: number;
}

// Tool categories
export const TOOL_CATEGORIES = {
  AI_ANALYSIS: 'ai_analysis',
  UTILITIES: 'utilities',
  PRODUCTIVITY: 'productivity',
  CREATIVE: 'creative',
  FINANCE: 'finance',
  HEALTH: 'health'
} as const;

export type ToolCategory = typeof TOOL_CATEGORIES[keyof typeof TOOL_CATEGORIES];

// Tool definitions
export interface ToolDefinition {
  name: string;
  slug: string;
  category: ToolCategory;
  description: string;
  features: string[];
  isActive: boolean;
  requiresAuth: boolean;
  maxUsagePerDay?: number;
  maxUsagePerMonth?: number;
  costPerUse?: number;
  aiTokensPerUse?: number;
}

export const TOOL_DEFINITIONS: Record<string, ToolDefinition> = {
  'swot-analysis': {
    name: 'SWOT Analysis',
    slug: 'swot-analysis',
    category: TOOL_CATEGORIES.AI_ANALYSIS,
    description: 'Generate comprehensive SWOT analysis for businesses and projects',
    features: ['AI-powered analysis', 'Detailed insights', 'Actionable recommendations'],
    isActive: true,
    requiresAuth: false,
    maxUsagePerDay: 10,
    aiTokensPerUse: 500
  },
  'diet-planner': {
    name: 'Diet Planner',
    slug: 'diet-planner',
    category: TOOL_CATEGORIES.HEALTH,
    description: 'Create personalized diet plans based on your goals and preferences',
    features: ['Personalized plans', 'Multiple diet types', 'Nutritional guidance'],
    isActive: true,
    requiresAuth: false,
    maxUsagePerDay: 5,
    aiTokensPerUse: 800
  },
  'url-shortener': {
    name: 'URL Shortener',
    slug: 'url-shortener',
    category: TOOL_CATEGORIES.UTILITIES,
    description: 'Create short, professional URLs with analytics and tracking',
    features: ['Custom aliases', 'Analytics', 'QR codes', 'Link health monitoring'],
    isActive: true,
    requiresAuth: false,
    maxUsagePerDay: 50
  },
  'password-generator': {
    name: 'Password Generator',
    slug: 'password-generator',
    category: TOOL_CATEGORIES.UTILITIES,
    description: 'Generate secure, random passwords with customizable options',
    features: ['Customizable length', 'Multiple character sets', 'Strength indicator'],
    isActive: true,
    requiresAuth: false,
    maxUsagePerDay: 100
  },
  'qr-generator': {
    name: 'QR Code Generator',
    slug: 'qr-generator',
    category: TOOL_CATEGORIES.UTILITIES,
    description: 'Create QR codes for URLs, text, and contact information',
    features: ['Multiple formats', 'Customizable design', 'High resolution'],
    isActive: true,
    requiresAuth: false,
    maxUsagePerDay: 50
  },
  'finance-advisor': {
    name: 'Finance Advisor',
    slug: 'finance-advisor',
    category: TOOL_CATEGORIES.FINANCE,
    description: 'Get personalized financial advice and planning insights',
    features: ['AI-powered advice', 'Investment analysis', 'Budget planning'],
    isActive: true,
    requiresAuth: false,
    maxUsagePerDay: 5,
    aiTokensPerUse: 1000
  }
};

// Utility functions
export function getToolDefinition(toolName: string): ToolDefinition | null {
  return TOOL_DEFINITIONS[toolName] || null;
}

export function isToolActive(toolName: string): boolean {
  const tool = getToolDefinition(toolName);
  return tool?.isActive || false;
}

export function requiresAuthentication(toolName: string): boolean {
  const tool = getToolDefinition(toolName);
  return tool?.requiresAuth || false;
}

export function getToolCategory(toolName: string): ToolCategory | null {
  const tool = getToolDefinition(toolName);
  return tool?.category || null;
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return Object.values(TOOL_DEFINITIONS).filter(tool => tool.category === category);
}

export function getActiveTools(): ToolDefinition[] {
  return Object.values(TOOL_DEFINITIONS).filter(tool => tool.isActive);
} 
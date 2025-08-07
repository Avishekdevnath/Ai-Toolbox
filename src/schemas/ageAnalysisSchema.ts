import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const AgeAnalysisInputSchema = z.object({
  birthDate: z.string(),
  gender: z.enum(['male', 'female']),
  lifestyle: z.enum(['poor', 'average', 'excellent']),
  healthConditions: z.array(z.string()),
  retirementAge: z.number().min(50).max(80),
  currentSavings: z.number().min(0),
  monthlyIncome: z.number().min(0),
  desiredRetirementIncome: z.number().min(0),
  includeAIInsights: z.boolean().optional()
});

export const AgeAnalysisResultSchema = z.object({
  ageData: z.any(),
  lifeMilestones: z.array(z.any()),
  healthRecommendations: z.array(z.any()),
  retirementPlan: z.any(),
  lifeExpectancy: z.any(),
  ageBasedActivities: z.array(z.any()),
  lifePercentage: z.number(),
  nextBirthday: z.object({
    nextBirthday: z.any(),
    daysUntil: z.number(),
    ageAtNextBirthday: z.number()
  }),
  aiInsights: z.object({
    personalizedAdvice: z.string(),
    lifeOptimizationTips: z.array(z.string()),
    motivationalMessage: z.string(),
    futurePlanningSuggestions: z.array(z.string())
  }).optional()
});

export interface AgeAnalysisRequest {
  birthDate: string;
  gender?: 'male' | 'female';
  lifestyle?: 'poor' | 'average' | 'excellent';
  healthConditions?: string[];
  retirementAge?: number;
  currentSavings?: number;
  monthlyIncome?: number;
  desiredRetirementIncome?: number;
  includeAIInsights?: boolean;
}

export interface AgeData {
  age: {
    years: number;
    months: number;
    days: number;
  };
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
}

export interface LifeMilestone {
  age: number;
  milestone: string;
  description: string;
  category: 'personal' | 'professional' | 'health' | 'financial' | 'social';
  achieved: boolean;
  yearsUntil: number;
}

export interface HealthRecommendation {
  category: string;
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface RetirementPlan {
  yearsToRetirement: number;
  monthlySavingsNeeded: number;
  totalSavingsNeeded: number;
  currentSavingsGap: number;
  onTrackPercentage: number;
  recommendations: string[];
}

export interface LifeExpectancy {
  overall: number;
  healthy: number;
  current: number;
  factors: {
    positive: string[];
    negative: string[];
  };
}

export interface AgeBasedActivity {
  age: number;
  activity: string;
  description: string;
  category: 'physical' | 'mental' | 'social' | 'financial' | 'personal';
  importance: 'high' | 'medium' | 'low';
}

export interface AgeAnalysisResponse {
  ageData: AgeData;
  lifeMilestones: LifeMilestone[];
  healthRecommendations: HealthRecommendation[];
  retirementPlan: RetirementPlan;
  lifeExpectancy: LifeExpectancy;
  ageBasedActivities: AgeBasedActivity[];
  lifePercentage: number;
  nextBirthday: {
    nextBirthday: Date;
    daysUntil: number;
    ageAtNextBirthday: number;
  };
  aiInsights?: {
    personalizedAdvice: string;
    lifeOptimizationTips: string[];
    motivationalMessage: string;
    futurePlanningSuggestions: string[];
  };
}

// Basic Database Operations
import { getDatabase } from '@/lib/mongodb';

export class AgeAnalysisSchema {
  private static collectionName = 'age_analyses';

  static async saveAnalysis(userId: string, request: AgeAnalysisRequest, response: AgeAnalysisResponse): Promise<boolean> {
    const db = await getDatabase();
    
    const result = await db.collection(this.collectionName).insertOne({
      userId,
      request,
      response,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return result.insertedId !== undefined;
  }

  static async getAnalysisHistory(userId: string, limit: number = 10): Promise<any[]> {
    const db = await getDatabase();
    
    return db.collection(this.collectionName)
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }
} 
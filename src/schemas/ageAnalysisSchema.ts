import { ObjectId } from 'mongodb';

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
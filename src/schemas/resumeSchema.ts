import { ObjectId } from 'mongodb';

export interface ResumeRequest {
  resumeText: string;
  industry: string;
  jobTitle: string;
  experienceLevel: string;
  fileName?: string;
}

export interface ResumeAnalysis {
  overallScore: number;
  scoreBreakdown: {
    content: number;
    structure: number;
    keywords: number;
    atsOptimization: number;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: Suggestion[];
  sectionAnalysis: SectionAnalysis[];
  keywordAnalysis: KeywordAnalysis;
  atsOptimization: ATSOptimization;
  actionPlan: ActionItem[];
  summary: string;
}

export interface Suggestion {
  category: 'content' | 'structure' | 'keywords' | 'format';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

export interface SectionAnalysis {
  section: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface KeywordAnalysis {
  foundKeywords: string[];
  missingKeywords: string[];
  suggestedKeywords: string[];
  keywordDensity: Record<string, number>;
}

export interface ATSOptimization {
  score: number;
  issues: string[];
  recommendations: string[];
  formatCompliance: {
    isCompliant: boolean;
    issues: string[];
  };
}

export interface ActionItem {
  priority: 'high' | 'medium' | 'low';
  action: string;
  timeline: string;
  impact: string;
}

export interface ResumeResponse {
  success: boolean;
  analysis?: ResumeAnalysis;
  error?: string;
}

// Industry-specific keyword suggestions
export const industryKeywords: Record<string, string[]> = {
  'technology': [
    'JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
    'Machine Learning', 'API', 'Database', 'Git', 'Agile', 'DevOps', 'Cloud',
    'Frontend', 'Backend', 'Full Stack', 'Mobile Development', 'UI/UX'
  ],
  'healthcare': [
    'Patient Care', 'Clinical', 'HIPAA', 'EMR', 'Nursing', 'Medical',
    'Healthcare', 'Patient Safety', 'Quality Assurance', 'Compliance',
    'Medical Terminology', 'Diagnosis', 'Treatment', 'Healthcare IT'
  ],
  'finance': [
    'Financial Analysis', 'Excel', 'Accounting', 'Budgeting', 'Forecasting',
    'Risk Management', 'Compliance', 'Audit', 'Financial Modeling', 'SAP',
    'QuickBooks', 'Tax Preparation', 'Investment', 'Portfolio Management'
  ],
  'marketing': [
    'Digital Marketing', 'SEO', 'SEM', 'Social Media', 'Content Marketing',
    'Email Marketing', 'Analytics', 'Google Analytics', 'Facebook Ads',
    'Brand Management', 'Campaign Management', 'Lead Generation', 'CRM'
  ],
  'sales': [
    'Sales', 'CRM', 'Lead Generation', 'Account Management', 'Negotiation',
    'Pipeline Management', 'Salesforce', 'B2B', 'B2C', 'Cold Calling',
    'Relationship Building', 'Revenue Growth', 'Sales Strategy'
  ],
  'education': [
    'Teaching', 'Curriculum Development', 'Student Assessment', 'Classroom Management',
    'Educational Technology', 'Lesson Planning', 'Student Engagement', 'Parent Communication',
    'Professional Development', 'Educational Leadership', 'Special Education'
  ]
};

// Basic Database Operations
import { getDatabase } from '@/lib/mongodb';

export class ResumeSchema {
  private static collectionName = 'resume_analyses';

  static async saveAnalysis(userId: string, request: ResumeRequest, analysis: ResumeAnalysis): Promise<boolean> {
    const db = await getDatabase();
    
    const result = await db.collection(this.collectionName).insertOne({
      userId,
      request,
      analysis,
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
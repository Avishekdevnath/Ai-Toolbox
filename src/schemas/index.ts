// User Schemas
export * from './userSchema';

// URL Shortener Schemas
export * from './urlShortenerSchema';

// Tool Usage Schemas
export * from './toolUsageSchema';

// AI Analysis Schemas
export * from './aiAnalysisSchema';

// Resume Schemas
export * from './resumeSchema';

// Quote Schemas
export * from './quoteSchema';

// Age Analysis Schemas
export * from './ageAnalysisSchema';

// Re-export commonly used types
export type {
  User,
  UserProfile,
  UserPreferences,
  UserSecurity,
  UserActivity,
  UserSubscription,
  CreateUserRequest,
  UpdateUserRequest,
  UserStats
} from './userSchema';

export type {
  ShortenedUrl,
  CreateUrlRequest,
  ClickEvent,
  UrlStats,
  AnonymousUserSession,
  UrlAnalytics
} from './urlShortenerSchema';

export type {
  ToolUsage,
  ToolUsageStats,
  ToolAnalytics,
  CreateToolUsageRequest,
  ToolUsageFilters,
  ToolDefinition,
  ToolCategory
} from './toolUsageSchema';

export type {
  DietFormData,
  DietPlan,
  SwotFormData,
  SwotAnalysis,
  FinanceFormData,
  FinancialAnalysis,
  InvestmentFormData,
  InvestmentAnalysis,
  RetirementFormData,
  RetirementAnalysis,
  DebtFormData,
  DebtAnalysis,
  AIAnalysis
} from './aiAnalysisSchema';

export type {
  ResumeRequest,
  ResumeAnalysis,
  Suggestion,
  SectionAnalysis,
  KeywordAnalysis,
  ATSOptimization,
  ActionItem,
  ResumeResponse
} from './resumeSchema';

export type {
  QuoteRequest,
  Quote,
  QuoteResponse
} from './quoteSchema';

export type {
  AgeAnalysisRequest,
  AgeAnalysisResponse,
  AgeData,
  LifeMilestone,
  HealthRecommendation,
  RetirementPlan,
  LifeExpectancy,
  AgeBasedActivity
} from './ageAnalysisSchema'; 
export interface FinanceModule {
  id: string;
  title: string;
  description: string;
  icon?: string;
  complexity: 'Basic' | 'Intermediate' | 'Advanced';
  duration: string;
  features: string[];
  status: 'Available' | 'Coming Soon' | 'Beta';
}

export interface BaseModuleProps {
  onBack: () => void;
}

export interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
}

export interface ModuleCardProps extends FinanceModule {
  onClick: () => void;
}

export interface InvestmentProfile {
  name: string;
  age: string;
  income: string;
  investment_goal: string;
  time_horizon: string;
  target_amount: string;
  current_investments: string;
  monthly_investment: string;
  risk_tolerance: string;
  investment_knowledge: 'Beginner' | 'Intermediate' | 'Expert';
  loss_comfort: string;
  country?: string;
}

export interface InvestmentAnalysis {
  risk_assessment: string;
  portfolio_allocation: {
    stocks: number;
    bonds: number;
    cash: number;
    other: number;
  };
  recommendations: string[];
  action_items: string[];
}

// Debt Management Types
export interface Debt {
  id: string;
  name: string;
  balance: string;
  interest_rate: string;
  minimum_payment: string;
}

export interface DebtData {
  monthly_budget: string;
  debts: Debt[];
}

export interface DebtPriority {
  debtName: string;
  priority: string;
  reason: string;
}

export interface MonthlyAllocation {
  debtName: string;
  amount: string;
  percentage: string;
}

export interface RepaymentStrategy {
  name: string;
  description: string;
  monthlyAllocation: MonthlyAllocation[];
  estimatedPayoffTime: string;
  totalInterestPaid: string;
  savings: string;
}

export interface MonthlyBreakdown {
  debtName: string;
  amount: string;
  priority: string;
}

export interface Timeline {
  shortTerm: string;
  mediumTerm: string;
  longTerm: string;
}

export interface RecommendedStrategy {
  name: string;
  reason: string;
  monthlyBreakdown: MonthlyBreakdown[];
  timeline: Timeline;
}

export interface RiskAssessment {
  currentRisk: string;
  riskFactors: string[];
  mitigationStrategies: string[];
}

export interface EmergencyPlan {
  emergencyFund: string;
  debtPauseStrategy: string;
}

export interface DebtAnalysis {
  totalDebt: string;
  totalInterest: string;
  debtToIncomeRatio: string;
  priorityRanking: DebtPriority[];
}

export interface DebtManagementAnalysis {
  executiveSummary: string;
  debtAnalysis: DebtAnalysis;
  repaymentStrategies: RepaymentStrategy[];
  recommendedStrategy: RecommendedStrategy;
  riskAssessment: RiskAssessment;
  additionalRecommendations: string[];
  emergencyPlan: EmergencyPlan;
}

// Diet Planner Types
export interface DietProfile {
  age: string;
  gender: string;
  height: string;
  heightUnit: 'cm' | 'inch' | 'ft-in';
  weight: string;
  weightUnit: 'kg' | 'lb';
  goal: string;
  country: string;
  area: string;
  activityLevel: string;
  dietaryRestrictions?: string;
  unitSystem: 'metric' | 'imperial';
}

export interface DietMacro {
  protein: string;
  carbs: string;
  fat: string;
}

export interface DietMeal {
  meal: string;
  foods: string[];
  notes?: string;
}

export interface DietExercise {
  activity: string;
  duration: string;
  notes?: string;
}

export interface DietAnalysis {
  summary: string;
  riskFactors: string[];
  dailyCalories: string;
  macros: DietMacro;
  mealPlan: DietMeal[];
  countryFoods: string[];
  exerciseRoutine: DietExercise[];
  unitSystem: string;
  comingSoon: string[];
} 
import { ObjectId } from 'mongodb';

// Diet Analysis Schemas
export interface DietFormData {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number;
  height: string;
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  diet_type: 'weight-loss' | 'muscle-gain' | 'maintenance' | 'keto' | 'vegan' | 'diabetes' | 'heart-healthy' | 'athletic';
  goal_weight?: number;
  current_weight?: number;
  training_frequency?: '1-2' | '3-4' | '5-6' | '7';
  muscle_goals?: 'strength' | 'hypertrophy' | 'endurance' | 'power';
  medical_conditions?: string[];
  food_preferences?: string[];
  allergies?: string[];
  budget?: 'low' | 'medium' | 'high';
  cooking_time?: 'quick' | 'moderate' | 'elaborate';
}

export interface DietPlan {
  diet_plan: {
    daily_calories: number;
    macronutrients: {
      protein: number;
      carbs: number;
      fat: number;
    };
    meals: {
      breakfast: {
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        ingredients: string[];
        instructions: string[];
      };
      lunch: {
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        ingredients: string[];
        instructions: string[];
      };
      dinner: {
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        ingredients: string[];
        instructions: string[];
      };
      snacks: {
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        ingredients: string[];
        instructions: string[];
      }[];
    };
    weekly_plan: {
      [day: string]: {
        breakfast: string;
        lunch: string;
        dinner: string;
        snacks: string[];
      };
    };
    recommendations: string[];
    tips: string[];
  };
}

// SWOT Analysis Schemas
export interface SwotFormData {
  business_name: string;
  industry: string;
  description: string;
  goals: string;
  target_market: string;
  competitors: string[];
  current_position: string;
  resources: string[];
  challenges: string[];
}

export interface SwotAnalysis {
  strengths: {
    internal_factors: string[];
    competitive_advantages: string[];
    resources: string[];
  };
  weaknesses: {
    internal_limitations: string[];
    areas_for_improvement: string[];
    resource_gaps: string[];
  };
  opportunities: {
    market_opportunities: string[];
    external_factors: string[];
    growth_potential: string[];
  };
  threats: {
    external_risks: string[];
    competitive_threats: string[];
    market_challenges: string[];
  };
  recommendations: {
    strategic_actions: string[];
    priority_areas: string[];
    implementation_steps: string[];
  };
  summary: string;
}

// Financial Analysis Schemas
export interface FinanceFormData {
  income: number;
  expenses: {
    housing: number;
    utilities: number;
    food: number;
    transportation: number;
    healthcare: number;
    entertainment: number;
    savings: number;
    debt: number;
  };
  goals: {
    emergency_fund: number;
    retirement: number;
    investment: number;
    debt_payoff: number;
  };
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  timeline: 'short_term' | 'medium_term' | 'long_term';
  age: number;
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
  dependents: number;
}

export interface FinancialAnalysis {
  current_situation: {
    net_worth: number;
    monthly_cash_flow: number;
    debt_to_income_ratio: number;
    emergency_fund_status: string;
  };
  recommendations: {
    budget_optimization: string[];
    debt_management: string[];
    investment_strategy: string[];
    risk_management: string[];
  };
  projections: {
    short_term: {
      emergency_fund_target: number;
      debt_reduction: number;
      savings_increase: number;
    };
    long_term: {
      retirement_goal: number;
      investment_growth: number;
      net_worth_projection: number;
    };
  };
  action_plan: {
    immediate_actions: string[];
    short_term_goals: string[];
    long_term_strategy: string[];
  };
}

// Investment Analysis Schemas
export interface InvestmentFormData {
  investment_amount: number;
  investment_goal: 'growth' | 'income' | 'preservation' | 'speculation';
  time_horizon: number;
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  current_portfolio?: {
    stocks: number;
    bonds: number;
    real_estate: number;
    cash: number;
    other: number;
  };
  additional_income?: number;
  tax_bracket?: string;
  investment_knowledge: 'beginner' | 'intermediate' | 'advanced';
}

export interface InvestmentAnalysis {
  portfolio_recommendation: {
    asset_allocation: {
      stocks: number;
      bonds: number;
      real_estate: number;
      cash: number;
      alternative_investments: number;
    };
    risk_level: string;
    expected_return: number;
    volatility: number;
  };
  investment_options: {
    stocks: {
      recommendation: string[];
      risk_level: string;
      expected_return: number;
    };
    bonds: {
      recommendation: string[];
      risk_level: string;
      expected_return: number;
    };
    etfs: {
      recommendation: string[];
      risk_level: string;
      expected_return: number;
    };
    mutual_funds: {
      recommendation: string[];
      risk_level: string;
      expected_return: number;
    };
  };
  strategy: {
    dollar_cost_averaging: boolean;
    rebalancing_frequency: string;
    tax_optimization: string[];
    risk_management: string[];
  };
  timeline: {
    short_term: string[];
    medium_term: string[];
    long_term: string[];
  };
}

// Retirement Planning Schemas
export interface RetirementFormData {
  current_age: number;
  retirement_age: number;
  current_savings: number;
  monthly_contribution: number;
  expected_income: number;
  expected_expenses: number;
  social_security_estimate: number;
  pension_income: number;
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  life_expectancy: number;
}

export interface RetirementAnalysis {
  retirement_needs: {
    total_required: number;
    annual_expenses: number;
    inflation_adjusted: number;
    healthcare_costs: number;
  };
  current_progress: {
    savings_gap: number;
    years_to_retirement: number;
    monthly_savings_needed: number;
    on_track_percentage: number;
  };
  recommendations: {
    savings_strategy: string[];
    investment_allocation: string[];
    retirement_accounts: string[];
    tax_optimization: string[];
  };
  projections: {
    conservative: {
      final_savings: number;
      monthly_income: number;
      success_probability: number;
    };
    moderate: {
      final_savings: number;
      monthly_income: number;
      success_probability: number;
    };
    aggressive: {
      final_savings: number;
      monthly_income: number;
      success_probability: number;
    };
  };
}

// Debt Management Schemas
export interface DebtFormData {
  debts: {
    name: string;
    balance: number;
    interest_rate: number;
    minimum_payment: number;
    type: 'credit_card' | 'student_loan' | 'mortgage' | 'car_loan' | 'personal_loan';
  }[];
  monthly_income: number;
  monthly_expenses: number;
  available_for_debt: number;
  debt_payoff_goal: 'avalanche' | 'snowball' | 'custom';
  timeline_preference: 'fastest' | 'lowest_cost' | 'balanced';
}

export interface DebtAnalysis {
  current_situation: {
    total_debt: number;
    total_interest: number;
    debt_to_income_ratio: number;
    average_interest_rate: number;
  };
  payoff_strategies: {
    avalanche: {
      total_cost: number;
      timeline: number;
      monthly_payment: number;
      savings: number;
    };
    snowball: {
      total_cost: number;
      timeline: number;
      monthly_payment: number;
      savings: number;
    };
    custom: {
      total_cost: number;
      timeline: number;
      monthly_payment: number;
      savings: number;
    };
  };
  recommendations: {
    strategy: string;
    monthly_payment: number;
    timeline: number;
    total_savings: number;
    steps: string[];
  };
  debt_consolidation: {
    recommended: boolean;
    options: string[];
    potential_savings: number;
    considerations: string[];
  };
}

// AI Analysis Base Interface
export interface AIAnalysis {
  id?: ObjectId;
  userId?: string;
  anonymousUserId?: string;
  analysisType: 'diet' | 'swot' | 'finance' | 'investment' | 'retirement' | 'debt';
  inputData: DietFormData | SwotFormData | FinanceFormData | InvestmentFormData | RetirementFormData | DebtFormData;
  result: DietPlan | SwotAnalysis | FinancialAnalysis | InvestmentAnalysis | RetirementAnalysis | DebtAnalysis;
  metadata: {
    tokensUsed: number;
    processingTime: number;
    model: string;
    cost: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Utility functions
export function getAnalysisType(formData: any): string {
  if ('diet_type' in formData) return 'diet';
  if ('business_name' in formData) return 'swot';
  if ('income' in formData && 'expenses' in formData) return 'finance';
  if ('investment_amount' in formData) return 'investment';
  if ('retirement_age' in formData) return 'retirement';
  if ('debts' in formData) return 'debt';
  return 'unknown';
}

export function validateDietFormData(data: any): data is DietFormData {
  return (
    data.name &&
    data.age &&
    data.gender &&
    data.weight &&
    data.height &&
    data.activity_level &&
    data.diet_type
  );
}

export function validateSwotFormData(data: any): data is SwotFormData {
  return (
    data.business_name &&
    data.industry &&
    data.description &&
    data.goals &&
    data.target_market
  );
}

export function validateFinanceFormData(data: any): data is FinanceFormData {
  return (
    data.income &&
    data.expenses &&
    data.goals &&
    data.risk_tolerance &&
    data.timeline
  );
} 
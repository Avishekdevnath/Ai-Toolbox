import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

interface FinancialHealthProfile {
  // Personal Info
  name: string;
  age: string;
  employment_status: string;
  dependents: string;
  
  // Income
  monthly_income: string;
  income_stability: string;
  additional_income: string;
  
  // Expenses
  monthly_expenses: string;
  housing: string;
  transportation: string;
  food: string;
  utilities: string;
  healthcare: string;
  other_expenses: string;
  
  // Savings & Debt
  current_savings: string;
  emergency_fund: string;
  total_debt: string;
  monthly_debt_payment: string;
  
  // Financial Goals
  primary_goal: string;
  time_horizon: string;
}

interface HealthAnalysis {
  health_score: number;
  health_level: string;
  summary: string;
  strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
  budget_suggestions: {
    housing: number;
    transportation: number;
    food: number;
    savings: number;
    entertainment: number;
  };
  action_plan: string[];
}

interface Props {
  onBack: () => void;
}

export default function GeneralFinancialHealthTool({ onBack }: Props) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<FinancialHealthProfile>({
    name: '', age: '', employment_status: '', dependents: '',
    monthly_income: '', income_stability: '', additional_income: '',
    monthly_expenses: '', housing: '', transportation: '', food: '', utilities: '', healthcare: '', other_expenses: '',
    current_savings: '', emergency_fund: '', total_debt: '', monthly_debt_payment: '',
    primary_goal: '', time_horizon: ''
  });
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedCurrency } = useFinance();

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const calculateHealthScore = () => {
    const income = parseInt(profile.monthly_income) || 0;
    const expenses = parseInt(profile.monthly_expenses) || 0;
    const savings = parseInt(profile.current_savings) || 0;
    const emergencyFund = parseInt(profile.emergency_fund) || 0;
    const debt = parseInt(profile.total_debt) || 0;
    
    let score = 0;
    
    // Income vs Expenses (30 points)
    const savingsRate = income > 0 ? (income - expenses) / income : 0;
    if (savingsRate >= 0.2) score += 30;
    else if (savingsRate >= 0.1) score += 20;
    else if (savingsRate >= 0) score += 10;
    
    // Emergency Fund (25 points)
    const monthsOfExpenses = expenses > 0 ? emergencyFund / expenses : 0;
    if (monthsOfExpenses >= 6) score += 25;
    else if (monthsOfExpenses >= 3) score += 15;
    else if (monthsOfExpenses >= 1) score += 10;
    
    // Debt Management (25 points)
    const debtToIncome = income > 0 ? debt / (income * 12) : 0;
    if (debtToIncome <= 0.36) score += 25;
    else if (debtToIncome <= 0.5) score += 15;
    else if (debtToIncome <= 0.7) score += 10;
    
    // Savings (20 points)
    const savingsToIncome = income > 0 ? savings / (income * 12) : 0;
    if (savingsToIncome >= 1) score += 20;
    else if (savingsToIncome >= 0.5) score += 15;
    else if (savingsToIncome >= 0.25) score += 10;
    
    return Math.min(score, 100);
  };

  const getHealthLevel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const generateAIAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze/finance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: {
            ...profile,
            primary_income: profile.monthly_income,
            secondary_income: profile.additional_income || '0',
            other_income: '0',
            housing: profile.housing || '0',
            transportation: profile.transportation || '0',
            food: profile.food || '0',
            utilities: profile.utilities || '0',
            healthcare: profile.healthcare || '0',
            entertainment: '0',
            shopping: '0',
            other_expenses: profile.other_expenses || '0',
            current_savings: profile.current_savings || '0',
            emergency_fund: profile.emergency_fund || '0',
            debt_total: profile.total_debt || '0',
            debt_monthly_payment: profile.monthly_debt_payment || '0',
            debt_interest_rate: '0',
            short_term_goals: profile.primary_goal,
            medium_term_goals: '',
            long_term_goals: '',
            priority_goal: profile.primary_goal,
            risk_tolerance: 'Moderate',
            household_size: profile.dependents || '1',
            income_frequency: 'monthly',
            currency: 'USD'
          }
        }),
      });

      const data = await response.json();
      
      if (data.success && data.analysis) {
        const aiAnalysis = data.analysis;
        setAnalysis({
          health_score: aiAnalysis.healthScore || calculateHealthScore(),
          health_level: aiAnalysis.healthLevel || getHealthLevel(calculateHealthScore()),
          summary: aiAnalysis.healthSummary || aiAnalysis.summaryMessage || 'Analysis completed',
          strengths: aiAnalysis.insights?.slice(0, 3) || [],
          areas_for_improvement: aiAnalysis.insights?.slice(3) || [],
          recommendations: aiAnalysis.recommendations?.map((r: any) => r.description || r.title) || [],
          budget_suggestions: aiAnalysis.budgetBreakdown || {
            housing: 0,
            transportation: 0,
            food: 0,
            savings: 0,
            entertainment: 0
          },
          action_plan: aiAnalysis.actionPlan || []
        });
      } else {
        throw new Error('AI analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing financial health:', error);
      // Fallback to local calculation
      generateQuickAnalysis();
    } finally {
      setIsLoading(false);
      setStep(5);
    }
  };

  const generateQuickAnalysis = () => {
    const score = calculateHealthScore();
    const level = getHealthLevel(score);
    const income = parseInt(profile.monthly_income) || 0;
    const expenses = parseInt(profile.monthly_expenses) || 0;
    const savings = parseInt(profile.current_savings) || 0;
    const emergencyFund = parseInt(profile.emergency_fund) || 0;
    const debt = parseInt(profile.total_debt) || 0;
    
    const savingsRate = income > 0 ? ((income - expenses) / income * 100).toFixed(1) : '0';
    const monthsOfExpenses = expenses > 0 ? (emergencyFund / expenses).toFixed(1) : '0';
    
    const strengths = [];
    const improvements = [];
    const recommendations = [];
    
    // Analyze strengths and weaknesses
    if (income > 0) strengths.push('You have a regular income stream');
    if (parseFloat(savingsRate) >= 10) strengths.push(`Good savings rate of ${savingsRate}%`);
    if (parseFloat(monthsOfExpenses) >= 3) strengths.push('Adequate emergency fund coverage');
    if (debt === 0) strengths.push('Debt-free financial position');
    
    if (parseFloat(savingsRate) < 10) improvements.push('Increase your savings rate to at least 10-20%');
    if (parseFloat(monthsOfExpenses) < 6) improvements.push('Build emergency fund to 6 months of expenses');
    if (debt > income * 6) improvements.push('Focus on debt reduction strategy');
    if (expenses > income * 0.8) improvements.push('Optimize monthly expenses for better cash flow');
    
    // Generate recommendations
    if (parseFloat(monthsOfExpenses) < 6) {
      recommendations.push(`Build emergency fund to ${formatCurrency(expenses * 6)} (6 months of expenses)`);
    }
    if (parseFloat(savingsRate) < 20) {
      recommendations.push('Aim to save 20% of your income for long-term financial security');
    }
    if (debt > 0) {
      recommendations.push('Create a debt payoff plan using avalanche or snowball method');
    }
    recommendations.push('Review and optimize your monthly budget allocation');
    recommendations.push('Consider investment options for long-term wealth building');
    
    setAnalysis({
      health_score: score,
      health_level: level,
      summary: `Your financial health score is ${score}/100 (${level}). Your current savings rate is ${savingsRate}% and you have ${monthsOfExpenses} months of expenses in emergency funds.`,
      strengths: strengths.length > 0 ? strengths : ['You\'re taking steps to analyze your finances'],
      areas_for_improvement: improvements.length > 0 ? improvements : ['Continue monitoring your financial progress'],
      recommendations,
      budget_suggestions: {
        housing: Math.min(income * 0.28, parseInt(profile.housing) || 0),
        transportation: income * 0.15,
        food: income * 0.12,
        savings: income * 0.20,
        entertainment: income * 0.05
      },
      action_plan: [
        'Set up automatic savings transfers for consistent wealth building',
        'Review monthly expenses and identify optimization opportunities',
        'Research high-yield savings accounts for better returns',
        'Create and stick to a written monthly budget',
        'Track progress monthly and adjust strategies as needed'
      ]
    });
    setStep(5);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">👋 Personal Information</h2>
        <p className="text-gray-600 dark:text-gray-400">Let's start with some basic information about you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Age
          </label>
          <input
            type="number"
            value={profile.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Your age"
            min="18"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Employment Status
          </label>
          <select
            value={profile.employment_status}
            onChange={(e) => handleInputChange('employment_status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select employment status</option>
            <option value="employed-full-time">Employed (Full-time)</option>
            <option value="employed-part-time">Employed (Part-time)</option>
            <option value="self-employed">Self-employed</option>
            <option value="freelancer">Freelancer</option>
            <option value="unemployed">Unemployed</option>
            <option value="retired">Retired</option>
            <option value="student">Student</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number of Dependents
          </label>
          <input
            type="number"
            value={profile.dependents}
            onChange={(e) => handleInputChange('dependents', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Number of dependents"
            min="0"
            max="20"
          />
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← Back to Hub
        </button>
        <button
          onClick={nextStep}
          disabled={!profile.name || !profile.age || !profile.employment_status}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">💰 Income Information</h2>
        <p className="text-gray-600 dark:text-gray-400">Tell us about your monthly income sources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Monthly Income (Primary) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={profile.monthly_income}
            onChange={(e) => handleInputChange('monthly_income', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Enter monthly income"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Income Stability
          </label>
          <select
            value={profile.income_stability}
            onChange={(e) => handleInputChange('income_stability', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select stability level</option>
            <option value="very-stable">Very Stable (Salaried)</option>
            <option value="stable">Stable (Regular contracts)</option>
            <option value="moderate">Moderate (Variable income)</option>
            <option value="unstable">Unstable (Irregular income)</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Income (Optional)
          </label>
          <input
            type="number"
            value={profile.additional_income}
            onChange={(e) => handleInputChange('additional_income', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Side income, investments, etc."
            min="0"
          />
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={prevStep}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={nextStep}
          disabled={!profile.monthly_income}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">💸 Monthly Expenses</h2>
        <p className="text-gray-600 dark:text-gray-400">Break down your monthly spending</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Total Monthly Expenses ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={profile.monthly_expenses}
            onChange={(e) => handleInputChange('monthly_expenses', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Total monthly expenses"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Housing (Rent/Mortgage) ($)
          </label>
          <input
            type="number"
            value={profile.housing}
            onChange={(e) => handleInputChange('housing', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Housing costs"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Transportation ($)
          </label>
          <input
            type="number"
            value={profile.transportation}
            onChange={(e) => handleInputChange('transportation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Car, gas, public transport"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Food & Groceries ($)
          </label>
          <input
            type="number"
            value={profile.food}
            onChange={(e) => handleInputChange('food', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Food and dining"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Utilities ($)
          </label>
          <input
            type="number"
            value={profile.utilities}
            onChange={(e) => handleInputChange('utilities', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Electric, gas, internet"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Healthcare ($)
          </label>
          <input
            type="number"
            value={profile.healthcare}
            onChange={(e) => handleInputChange('healthcare', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Insurance, medical expenses"
            min="0"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Other Expenses ($)
          </label>
          <input
            type="number"
            value={profile.other_expenses}
            onChange={(e) => handleInputChange('other_expenses', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Entertainment, shopping, misc"
            min="0"
          />
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={prevStep}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={nextStep}
          disabled={!profile.monthly_expenses}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🏦 Savings & Debt</h2>
        <p className="text-gray-600 dark:text-gray-400">Current financial position and goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Savings
          </label>
          <input
            type="number"
            value={profile.current_savings}
            onChange={(e) => handleInputChange('current_savings', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Total savings amount"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Emergency Fund
          </label>
          <input
            type="number"
            value={profile.emergency_fund}
            onChange={(e) => handleInputChange('emergency_fund', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Emergency fund amount"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Total Debt
          </label>
          <input
            type="number"
            value={profile.total_debt}
            onChange={(e) => handleInputChange('total_debt', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Credit cards, loans, etc."
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Monthly Debt Payment
          </label>
          <input
            type="number"
            value={profile.monthly_debt_payment}
            onChange={(e) => handleInputChange('monthly_debt_payment', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Monthly debt payments"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Primary Financial Goal
          </label>
          <select
            value={profile.primary_goal}
            onChange={(e) => handleInputChange('primary_goal', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select your primary goal</option>
            <option value="emergency-fund">Build Emergency Fund</option>
            <option value="debt-payoff">Pay Off Debt</option>
            <option value="save-house">Save for House</option>
            <option value="retirement">Retirement Planning</option>
            <option value="investment">Start Investing</option>
            <option value="education">Education Funding</option>
            <option value="financial-independence">Financial Independence</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Time Horizon
          </label>
          <select
            value={profile.time_horizon}
            onChange={(e) => handleInputChange('time_horizon', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select time frame</option>
            <option value="1-year">1 Year</option>
            <option value="2-3-years">2-3 Years</option>
            <option value="4-5-years">4-5 Years</option>
            <option value="6-10-years">6-10 Years</option>
            <option value="10-plus-years">10+ Years</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={prevStep}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={generateAIAnalysis}
          disabled={isLoading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing...
            </>
          ) : (
            'Generate AI Analysis 🚀'
          )}
        </button>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🎯 Your Financial Health Report</h2>
        <p className="text-gray-600 dark:text-gray-400">Personalized insights and recommendations</p>
      </div>

      {analysis && (
        <>
          {/* Health Score */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Financial Health Score</h3>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{analysis.health_score}/100</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{analysis.health_level}</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${analysis.health_score}%` }}
              ></div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mt-4">{analysis.summary}</p>
          </div>

          {/* Strengths */}
          {analysis.strengths.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center">
                ✅ Your Financial Strengths
              </h3>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="text-green-700 dark:text-green-300 flex items-start">
                    <span className="mr-2">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas for Improvement */}
          {analysis.areas_for_improvement.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-4 flex items-center">
                🎯 Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {analysis.areas_for_improvement.map((area, index) => (
                  <li key={index} className="text-yellow-700 dark:text-yellow-300 flex items-start">
                    <span className="mr-2">•</span>
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
              💡 Personalized Recommendations
            </h3>
            <ul className="space-y-3">
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="text-blue-700 dark:text-blue-300 flex items-start">
                  <span className="mr-2 text-blue-500">#{index + 1}</span>
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Plan */}
          {analysis.action_plan.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-4 flex items-center">
                🚀 30-90 Day Action Plan
              </h3>
              <ul className="space-y-3">
                {analysis.action_plan.map((action, index) => (
                  <li key={index} className="text-purple-700 dark:text-purple-300 flex items-start">
                    <span className="mr-2 text-purple-500">▶</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              onClick={() => {
                setStep(1);
                setAnalysis(null);
              }}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Analysis
            </button>
            <button
              onClick={onBack}
              className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Finance Hub
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderProgressBar = () => {
    const progress = ((step - 1) / 4) * 100;
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{step}/5</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl mb-4">
              <span className="text-2xl text-white">💰</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              General Financial Health Assessment
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive analysis of your complete financial situation
            </p>
          </div>

          {step < 5 && renderProgressBar()}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderResults()}
        </div>
      </div>
    </div>
  );
} 
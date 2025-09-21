import { useState } from 'react';
import { BaseModuleLayout } from '../components/BaseModule';
import { FormField } from '../components/FormField';
import { BaseModuleProps } from '../types';

interface FinancialHealthData {
  // Income Information
  monthly_salary: string;
  additional_income: string;
  bonus_income: string;

  // Expense Information
  housing_expense: string;
  utilities_expense: string;
  food_expense: string;
  transportation_expense: string;
  healthcare_expense: string;
  entertainment_expense: string;
  other_expenses: string;

  // Savings & Debt
  total_savings: string;
  emergency_fund: string;
  total_debt: string;
  monthly_debt_payments: string;
}

const initialFormData: FinancialHealthData = {
  monthly_salary: '',
  additional_income: '',
  bonus_income: '',
  housing_expense: '',
  utilities_expense: '',
  food_expense: '',
  transportation_expense: '',
  healthcare_expense: '',
  entertainment_expense: '',
  other_expenses: '',
  total_savings: '',
  emergency_fund: '',
  total_debt: '',
  monthly_debt_payments: ''
};

export default function GeneralFinancialHealth({ onBack }: BaseModuleProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FinancialHealthData>(initialFormData);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [localAnalysis, setLocalAnalysis] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateHealthScore = () => {
    // Convert string values to numbers
    const income = parseFloat(formData.monthly_salary) + 
                  parseFloat(formData.additional_income || '0') + 
                  (parseFloat(formData.bonus_income || '0') / 12);

    const expenses = parseFloat(formData.housing_expense || '0') +
                    parseFloat(formData.utilities_expense || '0') +
                    parseFloat(formData.food_expense || '0') +
                    parseFloat(formData.transportation_expense || '0') +
                    parseFloat(formData.healthcare_expense || '0') +
                    parseFloat(formData.entertainment_expense || '0') +
                    parseFloat(formData.other_expenses || '0');

    const savings = parseFloat(formData.total_savings || '0');
    const emergencyFund = parseFloat(formData.emergency_fund || '0');
    const totalDebt = parseFloat(formData.total_debt || '0');
    const debtPayments = parseFloat(formData.monthly_debt_payments || '0');

    // Calculate key financial ratios
    const savingsRatio = income > 0 ? (income - expenses) / income * 100 : 0;
    const debtToIncomeRatio = income > 0 ? (debtPayments / income) * 100 : 0;
    const emergencyFundRatio = expenses > 0 ? emergencyFund / expenses : 0;
    const debtToAssetsRatio = (savings + emergencyFund) > 0 ? totalDebt / (savings + emergencyFund) : 0;
    const netWorth = savings + emergencyFund - totalDebt;
    const monthlyCashFlow = income - expenses - debtPayments;

    // Calculate health score (0-100)
    let score = 0;
    
    // Savings ratio (0-30 points)
    if (savingsRatio >= 20) score += 30;
    else if (savingsRatio >= 15) score += 25;
    else if (savingsRatio >= 10) score += 20;
    else if (savingsRatio >= 5) score += 15;
    else if (savingsRatio > 0) score += 10;
    
    // Debt-to-income ratio (0-25 points)
    if (debtToIncomeRatio <= 20) score += 25;
    else if (debtToIncomeRatio <= 30) score += 20;
    else if (debtToIncomeRatio <= 40) score += 15;
    else if (debtToIncomeRatio <= 50) score += 10;
    else if (debtToIncomeRatio <= 60) score += 5;
    
    // Emergency fund (0-25 points)
    if (emergencyFundRatio >= 6) score += 25;
    else if (emergencyFundRatio >= 4) score += 20;
    else if (emergencyFundRatio >= 3) score += 15;
    else if (emergencyFundRatio >= 2) score += 10;
    else if (emergencyFundRatio >= 1) score += 5;
    
    // Debt-to-assets ratio (0-20 points)
    if (debtToAssetsRatio <= 0.3) score += 20;
    else if (debtToAssetsRatio <= 0.5) score += 15;
    else if (debtToAssetsRatio <= 0.7) score += 10;
    else if (debtToAssetsRatio <= 1) score += 5;

    return Math.round(score);
  };

  const getDetailedAnalysis = () => {
    const income = parseFloat(formData.monthly_salary) + 
                  parseFloat(formData.additional_income || '0') + 
                  (parseFloat(formData.bonus_income || '0') / 12);

    const expenses = parseFloat(formData.housing_expense || '0') +
                    parseFloat(formData.utilities_expense || '0') +
                    parseFloat(formData.food_expense || '0') +
                    parseFloat(formData.transportation_expense || '0') +
                    parseFloat(formData.healthcare_expense || '0') +
                    parseFloat(formData.entertainment_expense || '0') +
                    parseFloat(formData.other_expenses || '0');

    const savings = parseFloat(formData.total_savings || '0');
    const emergencyFund = parseFloat(formData.emergency_fund || '0');
    const totalDebt = parseFloat(formData.total_debt || '0');
    const debtPayments = parseFloat(formData.monthly_debt_payments || '0');

    // Calculate comprehensive metrics
    const savingsRatio = income > 0 ? (income - expenses) / income * 100 : 0;
    const debtToIncomeRatio = income > 0 ? (debtPayments / income) * 100 : 0;
    const emergencyFundRatio = expenses > 0 ? emergencyFund / expenses : 0;
    const debtToAssetsRatio = (savings + emergencyFund) > 0 ? totalDebt / (savings + emergencyFund) : 0;
    const netWorth = savings + emergencyFund - totalDebt;
    const monthlyCashFlow = income - expenses - debtPayments;
    const annualIncome = income * 12;
    const annualExpenses = expenses * 12;
    const annualSavings = (income - expenses) * 12;

    // Expense breakdown percentages
    const housingPercent = expenses > 0 ? (parseFloat(formData.housing_expense || '0') / expenses) * 100 : 0;
    const transportationPercent = expenses > 0 ? (parseFloat(formData.transportation_expense || '0') / expenses) * 100 : 0;
    const foodPercent = expenses > 0 ? (parseFloat(formData.food_expense || '0') / expenses) * 100 : 0;
    const entertainmentPercent = expenses > 0 ? (parseFloat(formData.entertainment_expense || '0') / expenses) * 100 : 0;

    return {
      income,
      expenses,
      savings,
      emergencyFund,
      totalDebt,
      debtPayments,
      savingsRatio,
      debtToIncomeRatio,
      emergencyFundRatio,
      debtToAssetsRatio,
      netWorth,
      monthlyCashFlow,
      annualIncome,
      annualExpenses,
      annualSavings,
      housingPercent,
      transportationPercent,
      foodPercent,
      entertainmentPercent
    };
  };

  const getHealthLevel = (score: number) => {
    if (score >= 85) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 70) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (score >= 55) return { level: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (score >= 40) return { level: 'Poor', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { level: 'Critical', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const getRecommendations = (analysis: any) => {
    const recommendations = [];
    
    // Emergency fund recommendations
    if (analysis.emergencyFundRatio < 3) {
      recommendations.push({
        priority: 'high',
        category: 'Emergency Fund',
        title: 'Build Emergency Fund',
        description: `You have ${analysis.emergencyFundRatio.toFixed(1)} months of expenses saved. Aim for 3-6 months.`,
        action: `Save $${Math.round((analysis.expenses * 3) - analysis.emergencyFund)} more to reach 3 months coverage.`
      });
    }

    // Debt management recommendations
    if (analysis.debtToIncomeRatio > 36) {
      recommendations.push({
        priority: 'high',
        category: 'Debt Management',
        title: 'Reduce Debt-to-Income Ratio',
        description: `Your debt payments are ${analysis.debtToIncomeRatio.toFixed(1)}% of income. Keep under 36%.`,
        action: 'Consider debt consolidation or increasing income to reduce this ratio.'
      });
    }

    // Savings recommendations
    if (analysis.savingsRatio < 20) {
      recommendations.push({
        priority: 'medium',
        category: 'Savings',
        title: 'Increase Savings Rate',
        description: `You're saving ${analysis.savingsRatio.toFixed(1)}% of income. Aim for 20%+.`,
        action: `Increase monthly savings by $${Math.round((analysis.income * 0.20) - (analysis.income - analysis.expenses))} to reach 20% savings rate.`
      });
    }

    // Housing cost recommendations
    if (analysis.housingPercent > 30) {
      recommendations.push({
        priority: 'medium',
        category: 'Housing',
        title: 'Housing Cost Too High',
        description: `Housing is ${analysis.housingPercent.toFixed(1)}% of expenses. Keep under 30%.`,
        action: 'Consider downsizing, refinancing, or finding ways to reduce housing costs.'
      });
    }

    // Entertainment spending recommendations
    if (analysis.entertainmentPercent > 10) {
      recommendations.push({
        priority: 'low',
        category: 'Spending',
        title: 'Reduce Entertainment Spending',
        description: `Entertainment is ${analysis.entertainmentPercent.toFixed(1)}% of expenses. Consider reducing.`,
        action: 'Look for free or low-cost entertainment options to increase savings.'
      });
    }

    return recommendations;
  };

  const generateAIAnalysis = async () => {
    setIsLoadingAI(true);
    try {
      const analysis = getDetailedAnalysis();
      
      const response = await fetch('/api/analyze/finance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: {
            primary_income: analysis.income.toString(),
            secondary_income: '0',
            other_income: '0',
            housing: parseFloat(formData.housing_expense || '0').toString(),
            transportation: parseFloat(formData.transportation_expense || '0').toString(),
            food: parseFloat(formData.food_expense || '0').toString(),
            utilities: parseFloat(formData.utilities_expense || '0').toString(),
            healthcare: parseFloat(formData.healthcare_expense || '0').toString(),
            entertainment: parseFloat(formData.entertainment_expense || '0').toString(),
            shopping: '0',
            other_expenses: parseFloat(formData.other_expenses || '0').toString(),
            current_savings: analysis.savings.toString(),
            emergency_fund: analysis.emergencyFund.toString(),
            debt_total: analysis.totalDebt.toString(),
            debt_monthly_payment: analysis.debtPayments.toString(),
            debt_interest_rate: '0',
            short_term_goals: 'Financial stability',
            medium_term_goals: 'Build emergency fund',
            long_term_goals: 'Retirement planning',
            priority_goal: 'Improve financial health',
            risk_tolerance: 'Moderate',
            household_size: '1',
            income_frequency: 'monthly',
            currency: 'USD'
          }
        }),
      });

      const data = await response.json();
      
      if (data.success && data.analysis) {
        setAiAnalysis(data.analysis);
      } else {
        console.error('AI Analysis failed:', data.error);
      }
    } catch (error) {
      console.error('Error generating AI analysis:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate local analysis first as foundation
    const score = calculateHealthScore();
    const analysis = getDetailedAnalysis();
    const recommendations = getRecommendations(analysis);
    
    setHealthScore(score);
    setLocalAnalysis({ analysis, recommendations });
    
    // Always generate AI analysis for enhanced insights
    await generateAIAnalysis();
    
    setCurrentStep(4);
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const renderHealthScoreSection = () => {
    if (healthScore === null) return null;

    const analysis = localAnalysis?.analysis || getDetailedAnalysis();
    const recommendations = localAnalysis?.recommendations || getRecommendations(analysis);
    const healthLevel = getHealthLevel(healthScore);

    return (
      <div className="space-y-6">
        {/* AI Processing Header */}
        {isLoadingAI && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Analysis in Progress</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Our AI financial advisor is analyzing your data...</p>
              </div>
            </div>
          </div>
        )}

        {/* Score Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Financial Health Analysis
            </h2>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <div className="text-6xl font-bold mb-2 text-blue-600 dark:text-blue-400">
            {healthScore}
          </div>
          <div className={`text-xl px-4 py-2 rounded-full inline-block ${healthLevel.bgColor} ${healthLevel.color}`}>
            {healthLevel.level}
          </div>
          {aiAnalysis && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              ✨ Enhanced with AI insights
            </div>
          )}
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Income</div>
            <div className="text-2xl font-bold text-green-600">${analysis.income.toLocaleString()}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Expenses</div>
            <div className="text-2xl font-bold text-red-600">${analysis.expenses.toLocaleString()}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Cash Flow</div>
            <div className={`text-2xl font-bold ${analysis.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${analysis.monthlyCashFlow.toLocaleString()}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Net Worth</div>
            <div className={`text-2xl font-bold ${analysis.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${analysis.netWorth.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Key Financial Ratios */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Key Financial Ratios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Savings Rate</span>
                <span className="font-semibold text-lg">{analysis.savingsRatio.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(analysis.savingsRatio, 30)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Target: 20%+</div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Debt-to-Income Ratio</span>
                <span className="font-semibold text-lg">{analysis.debtToIncomeRatio.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${analysis.debtToIncomeRatio <= 36 ? 'bg-green-500' : analysis.debtToIncomeRatio <= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(analysis.debtToIncomeRatio, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Target: &lt;36%</div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Emergency Fund</span>
                <span className="font-semibold text-lg">{analysis.emergencyFundRatio.toFixed(1)} months</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${analysis.emergencyFundRatio >= 6 ? 'bg-green-500' : analysis.emergencyFundRatio >= 3 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min((analysis.emergencyFundRatio / 6) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Target: 3-6 months</div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Debt-to-Assets Ratio</span>
                <span className="font-semibold text-lg">{(analysis.debtToAssetsRatio * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${analysis.debtToAssetsRatio <= 0.3 ? 'bg-green-500' : analysis.debtToAssetsRatio <= 0.7 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(analysis.debtToAssetsRatio * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Target: &lt;30%</div>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Expense Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Housing</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(analysis.housingPercent, 100)}%` }}
                  ></div>
                </div>
                <span className="font-semibold w-16 text-right">{analysis.housingPercent.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Transportation</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(analysis.transportationPercent, 100)}%` }}
                  ></div>
                </div>
                <span className="font-semibold w-16 text-right">{analysis.transportationPercent.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Food & Groceries</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(analysis.foodPercent, 100)}%` }}
                  ></div>
                </div>
                <span className="font-semibold w-16 text-right">{analysis.foodPercent.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Entertainment</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(analysis.entertainmentPercent, 100)}%` }}
                  ></div>
                </div>
                <span className="font-semibold w-16 text-right">{analysis.entertainmentPercent.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Section */}
        {aiAnalysis && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 shadow-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI Financial Advisor Insights</h3>
            </div>
            
            {aiAnalysis.healthSummary && (
              <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Summary</h4>
                <p className="text-gray-700 dark:text-gray-300">{aiAnalysis.healthSummary}</p>
              </div>
            )}

            {aiAnalysis.insights && aiAnalysis.insights.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Insights</h4>
                <div className="space-y-2">
                  {aiAnalysis.insights.map((insight: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">AI Recommendations</h4>
                <div className="space-y-3">
                  {aiAnalysis.recommendations.map((rec: any, index: number) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      rec.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                      rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                      'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {rec.priority?.toUpperCase() || 'MEDIUM'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Local Recommendations (as fallback) */}
        {!aiAnalysis && recommendations.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Personalized Recommendations
            </h3>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  rec.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                  'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-2">{rec.action}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Annual Projections */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Annual Projections
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${analysis.annualIncome.toLocaleString()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Annual Income</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">${analysis.annualExpenses.toLocaleString()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Annual Expenses</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${analysis.annualSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${analysis.annualSavings.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Annual Savings</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <BaseModuleLayout
      title="General Financial Health"
      description="Assess your overall financial well-being and get personalized recommendations"
      onBack={onBack}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && (
          <>
            <h2 className="text-xl font-semibold mb-6">Income Information</h2>
            <FormField
              label="Monthly Salary (USD)"
              name="monthly_salary"
              type="number"
              value={formData.monthly_salary}
              onChange={handleInputChange}
              required
            />
            <FormField
              label="Additional Monthly Income (USD)"
              name="additional_income"
              type="number"
              value={formData.additional_income}
              onChange={handleInputChange}
            />
            <FormField
              label="Annual Bonus/Other Income (USD)"
              name="bonus_income"
              type="number"
              value={formData.bonus_income}
              onChange={handleInputChange}
            />
          </>
        )}

        {currentStep === 2 && (
          <>
            <h2 className="text-xl font-semibold mb-6">Monthly Expenses</h2>
            <FormField
              label="Housing (Rent/Mortgage) ($)"
              name="housing_expense"
              type="number"
              value={formData.housing_expense}
              onChange={handleInputChange}
              required
            />
            <FormField
              label="Utilities ($)"
              name="utilities_expense"
              type="number"
              value={formData.utilities_expense}
              onChange={handleInputChange}
              required
            />
            <FormField
              label="Food & Groceries ($)"
              name="food_expense"
              type="number"
              value={formData.food_expense}
              onChange={handleInputChange}
              required
            />
            <FormField
              label="Transportation ($)"
              name="transportation_expense"
              type="number"
              value={formData.transportation_expense}
              onChange={handleInputChange}
              required
            />
            <FormField
              label="Healthcare ($)"
              name="healthcare_expense"
              type="number"
              value={formData.healthcare_expense}
              onChange={handleInputChange}
              required
            />
            <FormField
              label="Entertainment & Recreation ($)"
              name="entertainment_expense"
              type="number"
              value={formData.entertainment_expense}
              onChange={handleInputChange}
              required
            />
            <FormField
              label="Other Expenses ($)"
              name="other_expenses"
              type="number"
              value={formData.other_expenses}
              onChange={handleInputChange}
              required
            />
          </>
        )}

        {currentStep === 3 && (
          <>
            <h2 className="text-xl font-semibold mb-6">Savings & Debt</h2>
            <FormField
              label="Total Savings (USD)"
              name="total_savings"
              type="number"
              value={formData.total_savings}
              onChange={handleInputChange}
              required
            />
            <FormField
              label="Emergency Fund (USD)"
              name="emergency_fund"
              type="number"
              value={formData.emergency_fund}
              onChange={handleInputChange}
              required
            />
            <FormField
              label="Total Debt (USD)"
              name="total_debt"
              type="number"
              value={formData.total_debt}
              onChange={handleInputChange}
              required
            />
            <FormField
              label="Monthly Debt Payments (USD)"
              name="monthly_debt_payments"
              type="number"
              value={formData.monthly_debt_payments}
              onChange={handleInputChange}
              required
            />
            
            {/* AI Analysis Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mt-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Powered Financial Analysis</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get personalized insights and recommendations from our AI financial advisor
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {currentStep === 4 && renderHealthScoreSection()}

        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back
            </button>
          )}
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto"
            >
              Next
            </button>
          ) : currentStep === 3 ? (
            <button
              type="submit"
              disabled={isLoadingAI}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoadingAI ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>AI Analyzing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Get AI Analysis</span>
                </>
              )}
            </button>
          ) : null}
        </div>
      </form>
    </BaseModuleLayout>
  );
} 
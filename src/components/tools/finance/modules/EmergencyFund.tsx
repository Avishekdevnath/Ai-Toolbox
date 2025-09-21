import { useState } from 'react';
import { BaseModuleLayout } from '../components/BaseModule';
import { FormField } from '../components/FormField';
import { BaseModuleProps } from '../types';
import { useFinance } from '../context/FinanceContext';

interface EmergencyFundData {
  monthly_income: string;
  monthly_expenses: {
    housing: string;
    utilities: string;
    food: string;
    transportation: string;
    insurance: string;
    healthcare: string;
    other: string;
  };
  current_savings: string;
  job_stability: string;
  dependents: string;
  insurance_coverage: string;
}

interface FundAnalysis {
  recommendedMonths: number;
  monthlyExpenses: number;
  targetAmount: number;
  currentAmount: number;
  shortfall: number;
  savingTimeEstimate: number;
}

const initialFormData: EmergencyFundData = {
  monthly_income: '',
  monthly_expenses: {
    housing: '',
    utilities: '',
    food: '',
    transportation: '',
    insurance: '',
    healthcare: '',
    other: ''
  },
  current_savings: '',
  job_stability: '3',
  dependents: '0',
  insurance_coverage: '3'
};

export default function EmergencyFund({ onBack }: BaseModuleProps) {
  const [formData, setFormData] = useState<EmergencyFundData>(initialFormData);
  const [analysis, setAnalysis] = useState<FundAnalysis | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const { selectedCurrency } = useFinance();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name in formData.monthly_expenses) {
      setFormData(prev => ({
        ...prev,
        monthly_expenses: {
          ...prev.monthly_expenses,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const calculateTotalMonthlyExpenses = (): number => {
    return Object.values(formData.monthly_expenses).reduce(
      (sum, value) => sum + (parseFloat(value) || 0),
      0
    );
  };

  const determineRecommendedMonths = (): number => {
    let baseMonths = 3; // Start with 3 months as base
    
    // Add months based on job stability (1-5 scale)
    const stabilityScore = parseInt(formData.job_stability);
    baseMonths += (6 - stabilityScore); // Less stable = more months
    
    // Add months based on number of dependents
    const dependents = parseInt(formData.dependents);
    baseMonths += Math.min(dependents, 3); // Up to 3 additional months for dependents
    
    // Subtract months based on insurance coverage (1-5 scale)
    const insuranceScore = parseInt(formData.insurance_coverage);
    baseMonths -= Math.max(0, insuranceScore - 3); // Better insurance = fewer months needed
    
    // Ensure minimum of 3 months and maximum of 12 months
    return Math.min(Math.max(baseMonths, 3), 12);
  };

  const analyzeEmergencyFund = () => {
    const monthlyExpenses = calculateTotalMonthlyExpenses();
    const recommendedMonths = determineRecommendedMonths();
    const targetAmount = monthlyExpenses * recommendedMonths;
    const currentAmount = parseFloat(formData.current_savings) || 0;
    const shortfall = Math.max(0, targetAmount - currentAmount);
    
    // Estimate time to reach target (assuming 20% of income saved monthly)
    const monthlyIncome = parseFloat(formData.monthly_income) || 0;
    const monthlySavings = monthlyIncome * 0.2;
    const savingTimeEstimate = monthlySavings > 0 ? Math.ceil(shortfall / monthlySavings) : 0;

    return {
      recommendedMonths,
      monthlyExpenses,
      targetAmount,
      currentAmount,
      shortfall,
      savingTimeEstimate
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const results = analyzeEmergencyFund();
    setAnalysis(results);
    setCurrentStep(3);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency.code,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderProgressBar = (current: number, target: number) => {
    const percentage = Math.min((current / target) * 100, 100);
    return (
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getProgressColor(percentage)} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  return (
    <BaseModuleLayout
      title="Emergency Fund Planning"
      description="Calculate and plan your emergency fund needs"
      onBack={onBack}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && (
          <>
            <h2 className="text-xl font-semibold mb-6">Income & Savings</h2>
            <div className="space-y-4">
              <FormField
                label="Monthly Income (USD)"
                name="monthly_income"
                type="number"
                value={formData.monthly_income}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Current Emergency Savings (USD)"
                name="current_savings"
                type="number"
                value={formData.current_savings}
                onChange={handleInputChange}
                required
              />
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <h2 className="text-xl font-semibold mb-6">Monthly Expenses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Housing (Rent/Mortgage) ($)"
                name="housing"
                type="number"
                value={formData.monthly_expenses.housing}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Utilities ($)"
                name="utilities"
                type="number"
                value={formData.monthly_expenses.utilities}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Food & Groceries ($)"
                name="food"
                type="number"
                value={formData.monthly_expenses.food}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Transportation ($)"
                name="transportation"
                type="number"
                value={formData.monthly_expenses.transportation}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Insurance Premiums ($)"
                name="insurance"
                type="number"
                value={formData.monthly_expenses.insurance}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Healthcare ($)"
                name="healthcare"
                type="number"
                value={formData.monthly_expenses.healthcare}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Other Essential Expenses ($)"
                name="other"
                type="number"
                value={formData.monthly_expenses.other}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Stability (1-5)
                </label>
                <select
                  name="job_stability"
                  value={formData.job_stability}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="1">1 - Very Unstable</option>
                  <option value="2">2 - Somewhat Unstable</option>
                  <option value="3">3 - Moderate</option>
                  <option value="4">4 - Stable</option>
                  <option value="5">5 - Very Stable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Dependents
                </label>
                <select
                  name="dependents"
                  value={formData.dependents}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  {[0, 1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Insurance Coverage (1-5)
                </label>
                <select
                  name="insurance_coverage"
                  value={formData.insurance_coverage}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="1">1 - Minimal Coverage</option>
                  <option value="2">2 - Basic Coverage</option>
                  <option value="3">3 - Moderate Coverage</option>
                  <option value="4">4 - Good Coverage</option>
                  <option value="5">5 - Excellent Coverage</option>
                </select>
              </div>
            </div>
          </>
        )}

        {currentStep === 3 && analysis && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Emergency Fund Analysis</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Based on your situation, we recommend saving{' '}
                <span className="font-semibold">{analysis.recommendedMonths} months</span> of expenses
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Monthly Expenses</h3>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(analysis.monthlyExpenses)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Total essential monthly expenses
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Target Amount</h3>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(analysis.targetAmount)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Recommended emergency fund size
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Progress to Goal</h3>
              {renderProgressBar(analysis.currentAmount, analysis.targetAmount)}
              <div className="mt-4 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Current: {formatCurrency(analysis.currentAmount)}</span>
                <span>Target: {formatCurrency(analysis.targetAmount)}</span>
              </div>
              
              {analysis.shortfall > 0 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-blue-900 dark:text-blue-100">
                    You need {formatCurrency(analysis.shortfall)} more to reach your target.
                    {analysis.savingTimeEstimate > 0 && (
                      <> At 20% of your current income, this will take approximately {analysis.savingTimeEstimate} months.</>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Keep your emergency fund in a high-yield savings account for easy access
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Review and update your fund size when major life changes occur
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Consider additional insurance coverage to reduce emergency fund needs
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Automate your savings to consistently build your emergency fund
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back
            </button>
          )}
          
          {currentStep < 2 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto"
            >
              Next
            </button>
          ) : currentStep === 2 ? (
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 ml-auto"
            >
              Calculate Plan
            </button>
          ) : null}
        </div>
      </form>
    </BaseModuleLayout>
  );
} 
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
    const savingsRatio = (income - expenses) / income * 100;
    const debtToIncomeRatio = (debtPayments / income) * 100;
    const emergencyFundRatio = emergencyFund / expenses;
    const debtToAssetsRatio = totalDebt / (savings + emergencyFund);

    // Calculate health score (0-100)
    let score = 0;
    
    // Savings ratio (0-30 points)
    score += Math.min(savingsRatio * 2, 30);
    
    // Debt-to-income ratio (0-25 points)
    score += Math.max(25 - debtToIncomeRatio, 0);
    
    // Emergency fund (0-25 points)
    score += Math.min(emergencyFundRatio * 10, 25);
    
    // Debt-to-assets ratio (0-20 points)
    score += Math.max(20 - (debtToAssetsRatio * 10), 0);

    return Math.round(score);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const score = calculateHealthScore();
    setHealthScore(score);
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

    const getScoreCategory = () => {
      if (healthScore >= 80) return { text: 'Excellent', color: 'text-green-600' };
      if (healthScore >= 60) return { text: 'Good', color: 'text-blue-600' };
      if (healthScore >= 40) return { text: 'Fair', color: 'text-yellow-600' };
      return { text: 'Needs Improvement', color: 'text-red-600' };
    };

    const { text, color } = getScoreCategory();

    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Your Financial Health Score</h2>
        <div className="text-6xl font-bold mb-4 text-gray-900 dark:text-white">
          {healthScore}
        </div>
        <div className={`text-xl font-semibold mb-6 ${color}`}>
          {text}
        </div>
        <div className="space-y-4 text-left">
          <h3 className="text-lg font-semibold">Key Insights:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Monthly savings rate: {((parseFloat(formData.monthly_salary) - parseFloat(formData.monthly_debt_payments)) / parseFloat(formData.monthly_salary) * 100).toFixed(1)}%</li>
            <li>Debt-to-income ratio: {(parseFloat(formData.monthly_debt_payments) / parseFloat(formData.monthly_salary) * 100).toFixed(1)}%</li>
            <li>Emergency fund coverage: {(parseFloat(formData.emergency_fund) / parseFloat(formData.monthly_salary)).toFixed(1)} months</li>
          </ul>
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
              label="Housing (Rent/Mortgage)"
              name="housing_expense"
              type="number"
              value={formData.housing_expense}
              onChange={handleInputChange}
              required
            />
            <FormField
              label="Utilities"
              name="utilities_expense"
              type="number"
              value={formData.utilities_expense}
              onChange={handleInputChange}
              required
            />
            <FormField
              label="Food & Groceries"
              name="food_expense"
              type="number"
              value={formData.food_expense}
              onChange={handleInputChange}
              required
            />
            <FormField
              label="Transportation"
              name="transportation_expense"
              type="number"
              value={formData.transportation_expense}
              onChange={handleInputChange}
              required
            />
            <FormField
              label="Healthcare"
              name="healthcare_expense"
              type="number"
              value={formData.healthcare_expense}
              onChange={handleInputChange}
              required
            />
            <FormField
              label="Entertainment & Recreation"
              name="entertainment_expense"
              type="number"
              value={formData.entertainment_expense}
              onChange={handleInputChange}
              required
            />
            <FormField
              label="Other Expenses"
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
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 ml-auto"
            >
              Calculate Score
            </button>
          ) : null}
        </div>
      </form>
    </BaseModuleLayout>
  );
} 
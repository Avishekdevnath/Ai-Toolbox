import { useState, useCallback } from 'react';
import { FormInput } from '../components/FormInput';
import { FormSelect } from '../components/FormSelect';
import { useFinance } from '../context/FinanceContext';

interface RetirementProfile {
  // Personal Info
  name: string;
  current_age: string;
  retirement_age: string;
  life_expectancy: string;
  
  // Income & Expenses
  current_income: string;
  desired_replacement_ratio: string; // % of current income needed in retirement
  current_monthly_expenses: string;
  expected_retirement_expenses: string;
  
  // Current Savings & Investments
  current_401k: string;
  current_ira: string;
  other_retirement_accounts: string;
  non_retirement_savings: string;
  monthly_401k_contribution: string;
  monthly_ira_contribution: string;
  employer_match: string; // % or $
  
  // Benefits & Plans
  social_security_estimate: string;
  pension_benefits: string;
  other_income_sources: string;
  
  // Goals & Preferences
  retirement_lifestyle: string; // Modest, Comfortable, Luxurious
  healthcare_cost_factor: string; // Low, Average, High
  legacy_goals: string; // None, Modest, Significant
}

interface RetirementAnalysis {
  retirement_readiness_score: number;
  readiness_level: string;
  years_to_retirement: number;
  projected_needs: {
    annual_income_needed: number;
    total_fund_needed: number;
    monthly_savings_needed: number;
  };
  current_projections: {
    total_at_retirement: number;
    social_security_annual: number;
    pension_annual: number;
    gap_amount: number;
  };
  recommendations: string[];
  action_plan: string[];
  withdrawal_strategy: {
    safe_withdrawal_rate: number;
    annual_withdrawal: number;
    strategy_notes: string[];
  };
}

interface Props {
  onBack: () => void;
}

const INITIAL_PROFILE: RetirementProfile = {
  name: '',
  current_age: '',
  retirement_age: '',
  life_expectancy: '',
  current_income: '',
  desired_replacement_ratio: '',
  current_monthly_expenses: '',
  expected_retirement_expenses: '',
  current_401k: '',
  current_ira: '',
  other_retirement_accounts: '',
  non_retirement_savings: '',
  monthly_401k_contribution: '',
  monthly_ira_contribution: '',
  employer_match: '',
  social_security_estimate: '',
  pension_benefits: '',
  other_income_sources: '',
  retirement_lifestyle: '',
  healthcare_cost_factor: '',
  legacy_goals: '',
};

export default function RetirementPlanningTool({ onBack }: Props) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<RetirementProfile>(INITIAL_PROFILE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<RetirementAnalysis | null>(null);
  const { selectedCurrency } = useFinance();

  const handleInputChange = useCallback((field: keyof RetirementProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const nextStep = useCallback(() => {
    setStep(prev => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setStep(prev => prev - 1);
  }, []);

  const generateAnalysis = useCallback(async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/analyze/finance/retirement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile }),
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis as RetirementAnalysis);
        setStep(5);
      } else {
        throw new Error(data.error || 'Failed to generate analysis');
      }
    } catch (error) {
      console.error('Analysis generation error:', error);
      alert('Failed to generate analysis. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [profile]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderProgress = () => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 dark:bg-gray-700">
      <div
        className="bg-orange-500 h-2.5 rounded-full transition-all"
        style={{ width: `${((step - 1) / 4) * 100}%` }}
      />
    </div>
  );

  const renderPersonalInfo = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <FormInput
          label="Name"
          value={profile.name}
          onChange={value => handleInputChange('name', value)}
          placeholder="John Doe"
          required
        />
        <FormInput
          label="Current Age"
          value={profile.current_age}
          onChange={value => handleInputChange('current_age', value)}
          type="number"
          placeholder="35"
          required
        />
        <FormInput
          label="Planned Retirement Age"
          value={profile.retirement_age}
          onChange={value => handleInputChange('retirement_age', value)}
          type="number"
          placeholder="65"
          required
        />
        <FormInput
          label="Life Expectancy"
          value={profile.life_expectancy}
          onChange={value => handleInputChange('life_expectancy', value)}
          type="number"
          placeholder="85"
        />
      </div>
    </div>
  );

  const renderIncomeInfo = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Income & Expenses</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <FormInput
          label="Current Annual Income"
          value={profile.current_income}
          onChange={value => handleInputChange('current_income', value)}
          type="number"
          placeholder="80000"
          required
        />
        <FormInput
          label="Desired Income Replacement (%)"
          value={profile.desired_replacement_ratio}
          onChange={value => handleInputChange('desired_replacement_ratio', value)}
          type="number"
          placeholder="80"
          required
        />
        <FormInput
          label="Current Monthly Expenses"
          value={profile.current_monthly_expenses}
          onChange={value => handleInputChange('current_monthly_expenses', value)}
          type="number"
          placeholder="5000"
          required
        />
        <FormInput
          label="Expected Monthly Retirement Expenses"
          value={profile.expected_retirement_expenses}
          onChange={value => handleInputChange('expected_retirement_expenses', value)}
          type="number"
          placeholder="4000"
        />
      </div>
    </div>
  );

  const renderSavingsInfo = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Current Savings & Contributions</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <FormInput
          label="Current 401(k) Balance"
          value={profile.current_401k}
          onChange={value => handleInputChange('current_401k', value)}
          type="number"
          placeholder="50000"
        />
        <FormInput
          label="Current IRA Balance"
          value={profile.current_ira}
          onChange={value => handleInputChange('current_ira', value)}
          type="number"
          placeholder="25000"
        />
        <FormInput
          label="Other Retirement Accounts"
          value={profile.other_retirement_accounts}
          onChange={value => handleInputChange('other_retirement_accounts', value)}
          type="number"
          placeholder="10000"
        />
        <FormInput
          label="Non-Retirement Savings"
          value={profile.non_retirement_savings}
          onChange={value => handleInputChange('non_retirement_savings', value)}
          type="number"
          placeholder="15000"
        />
        <FormInput
          label="Monthly 401(k) Contribution"
          value={profile.monthly_401k_contribution}
          onChange={value => handleInputChange('monthly_401k_contribution', value)}
          type="number"
          placeholder="800"
        />
        <FormInput
          label="Monthly IRA Contribution"
          value={profile.monthly_ira_contribution}
          onChange={value => handleInputChange('monthly_ira_contribution', value)}
          type="number"
          placeholder="500"
        />
        <FormInput
          label="Employer Match"
          value={profile.employer_match}
          onChange={value => handleInputChange('employer_match', value)}
          placeholder="50% up to 6% of salary"
        />
      </div>
    </div>
  );

  const renderBenefitsInfo = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Benefits & Additional Income</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <FormInput
          label="Estimated Social Security Benefit"
          value={profile.social_security_estimate}
          onChange={value => handleInputChange('social_security_estimate', value)}
          type="number"
          placeholder="2000"
        />
        <FormInput
          label="Monthly Pension Benefits"
          value={profile.pension_benefits}
          onChange={value => handleInputChange('pension_benefits', value)}
          type="number"
          placeholder="1500"
        />
        <FormInput
          label="Other Monthly Income Sources"
          value={profile.other_income_sources}
          onChange={value => handleInputChange('other_income_sources', value)}
          type="number"
          placeholder="500"
        />
      </div>
    </div>
  );

  const renderPreferencesInfo = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Goals & Preferences</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <FormSelect
          label="Desired Retirement Lifestyle"
          value={profile.retirement_lifestyle}
          onChange={value => handleInputChange('retirement_lifestyle', value)}
          options={[
            { value: 'modest', label: 'Modest - Basic needs and some leisure' },
            { value: 'comfortable', label: 'Comfortable - Regular travel and hobbies' },
            { value: 'luxurious', label: 'Luxurious - High-end lifestyle' }
          ]}
          required
        />
        <FormSelect
          label="Expected Healthcare Costs"
          value={profile.healthcare_cost_factor}
          onChange={value => handleInputChange('healthcare_cost_factor', value)}
          options={[
            { value: 'low', label: 'Low - Good health, comprehensive insurance' },
            { value: 'average', label: 'Average - Typical health expenses' },
            { value: 'high', label: 'High - Chronic conditions or limited insurance' }
          ]}
          required
        />
        <FormSelect
          label="Legacy Goals"
          value={profile.legacy_goals}
          onChange={value => handleInputChange('legacy_goals', value)}
          options={[
            { value: 'none', label: 'None - Use all retirement savings' },
            { value: 'modest', label: 'Modest - Leave some inheritance' },
            { value: 'significant', label: 'Significant - Large inheritance planned' }
          ]}
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderIncomeInfo();
      case 3:
        return renderSavingsInfo();
      case 4:
        return renderBenefitsInfo();
      case 5:
        return renderPreferencesInfo();
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return profile.name && profile.current_age && profile.retirement_age;
      case 2:
        return profile.current_income && profile.desired_replacement_ratio && profile.current_monthly_expenses;
      case 3:
        return true; // Optional fields
      case 4:
        return true; // Optional fields
      case 5:
        return profile.retirement_lifestyle && profile.healthcare_cost_factor;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl mb-4">
            <span className="text-2xl text-white">🏖️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Retirement Planning Tool
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Plan your retirement with detailed projections and strategy optimization
          </p>
        </div>

        {renderProgress()}

        {renderCurrentStep()}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Previous
            </button>
          )}
          {step < 5 ? (
            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={generateAnalysis}
              disabled={!isStepValid() || isGenerating}
              className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? 'Generating...' : 'Generate Analysis'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 
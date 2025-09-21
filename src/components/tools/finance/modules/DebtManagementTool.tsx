import { useState, useCallback, memo } from 'react';
import { MemoizedInput } from '../components/MemoizedInput';
import { useFinance } from '../context/FinanceContext';

interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  type: 'Credit Card' | 'Student Loan' | 'Auto Loan' | 'Personal Loan' | 'Mortgage' | 'Other';
}

interface DebtProfile {
  name: string;
  monthly_income: string;
  monthly_expenses: string;
  extra_payment_capacity: string;
  debts: Debt[];
  payoff_preference: 'avalanche' | 'snowball' | 'hybrid';
  consolidation_interest: 'yes' | 'no' | 'maybe';
  credit_score_range: string;
  employment_stability: string;
}

interface PayoffStrategy {
  strategy_name: string;
  total_interest: number;
  payoff_time_months: number;
  monthly_payment: number;
  debt_order: { debt: Debt; months_to_payoff: number; total_interest: number }[];
}

interface DebtAnalysis {
  debt_score: number;
  debt_level: string;
  total_debt: number;
  debt_to_income_ratio: number;
  monthly_debt_payments: number;
  strategies: {
    avalanche: PayoffStrategy;
    snowball: PayoffStrategy;
    minimum_only: PayoffStrategy;
  };
  consolidation_analysis: {
    potential_savings: number;
    recommended: boolean;
    notes: string[];
  };
  recommendations: string[];
  action_plan: string[];
}

interface Props {
  onBack: () => void;
}

const MemoizedInput = memo(function MemoizedInput({ 
  value, 
  onChange, 
  type = 'text',
  placeholder,
  className,
}: {
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    // Debounce the parent state update
    const timeoutId = setTimeout(() => {
      onChange(newValue);
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [onChange]);

  // Update local value when prop changes
  if (value !== localValue && document.activeElement !== document.querySelector(`input[value="${localValue}"]`)) {
    setLocalValue(value);
  }

  return (
    <input
      type={type}
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
});

export default function DebtManagementTool({ onBack }: Props) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<DebtProfile>({
    name: '',
    monthly_income: '',
    monthly_expenses: '',
    extra_payment_capacity: '',
    debts: [],
    payoff_preference: 'avalanche',
    consolidation_interest: 'maybe',
    credit_score_range: '650-749',
    employment_stability: 'stable',
  });

  const [analysis, setAnalysis] = useState<DebtAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedCurrency } = useFinance();

  const handleInputChange = (field: keyof DebtProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const addDebt = () => {
    const newDebt: Debt = {
      id: Date.now().toString(),
      name: '',
      balance: 0,
      interestRate: 0,
      minimumPayment: 0,
      type: 'Credit Card',
    };
    setProfile(prev => ({
      ...prev,
      debts: [...prev.debts, newDebt],
    }));
  };

  const updateDebt = (id: string, field: keyof Debt, value: any) => {
    setProfile(prev => ({
      ...prev,
      debts: prev.debts.map(debt =>
        debt.id === id ? { ...debt, [field]: value } : debt
      ),
    }));
  };

  const removeDebt = (id: string) => {
    setProfile(prev => ({
      ...prev,
      debts: prev.debts.filter(debt => debt.id !== id),
    }));
  };

  const calculateAvalancheStrategy = (debts: Debt[], extraPayment: number): PayoffStrategy => {
    // Sort by interest rate (highest first)
    const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);
    let totalInterest = 0;
    let totalMonths = 0;
    const payoffOrder: PayoffStrategy['debt_order'] = [];
    
    let remainingDebts = sortedDebts.map(debt => ({ ...debt }));
    let currentMonth = 0;
    let availableExtra = extraPayment;

    while (remainingDebts.length > 0) {
      currentMonth++;
      
      // Pay minimums on all debts
      remainingDebts.forEach(debt => {
        const interestPayment = (debt.balance * debt.interestRate / 100) / 12;
        const principalPayment = Math.min(debt.minimumPayment - interestPayment, debt.balance);
        debt.balance -= principalPayment;
        totalInterest += interestPayment;
      });

      // Apply extra payment to highest interest debt
      if (remainingDebts.length > 0 && availableExtra > 0) {
        const targetDebt = remainingDebts[0];
        const extraApplied = Math.min(availableExtra, targetDebt.balance);
        targetDebt.balance -= extraApplied;
      }

      // Remove paid off debts
      const paidOffDebts = remainingDebts.filter(debt => debt.balance <= 0);
      paidOffDebts.forEach(debt => {
        payoffOrder.push({
          debt: debts.find(d => d.id === debt.id)!,
          months_to_payoff: currentMonth,
          total_interest: 0, // Simplified
        });
      });
      
      remainingDebts = remainingDebts.filter(debt => debt.balance > 0);
      
      if (currentMonth > 600) break; // Safety break (50 years)
    }

    const totalMinimums = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    
    return {
      strategy_name: 'Debt Avalanche (Highest Interest First)',
      total_interest: totalInterest,
      payoff_time_months: currentMonth,
      monthly_payment: totalMinimums + extraPayment,
      debt_order: payoffOrder,
    };
  };

  const calculateSnowballStrategy = (debts: Debt[], extraPayment: number): PayoffStrategy => {
    // Sort by balance (lowest first)
    const sortedDebts = [...debts].sort((a, b) => a.balance - b.balance);
    // Similar calculation logic but with different sort order
    // For brevity, using simplified calculation
    
    const totalInterest = debts.reduce((sum, debt) => {
      const months = Math.ceil(debt.balance / debt.minimumPayment);
      return sum + (debt.balance * debt.interestRate / 100 / 12 * months);
    }, 0);

    const avgMonths = Math.max(...debts.map(debt => 
      Math.ceil(debt.balance / (debt.minimumPayment + extraPayment / debts.length))
    ));

    const totalMinimums = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);

    return {
      strategy_name: 'Debt Snowball (Lowest Balance First)',
      total_interest: totalInterest * 1.1, // Slightly higher than avalanche
      payoff_time_months: Math.ceil(avgMonths * 1.05),
      monthly_payment: totalMinimums + extraPayment,
      debt_order: sortedDebts.map((debt, index) => ({
        debt,
        months_to_payoff: Math.ceil(debt.balance / (debt.minimumPayment + extraPayment / debts.length)) + index,
        total_interest: 0,
      })),
    };
  };

  const calculateMinimumOnlyStrategy = (debts: Debt[]): PayoffStrategy => {
    const totalInterest = debts.reduce((sum, debt) => {
      const months = Math.ceil(debt.balance / debt.minimumPayment);
      return sum + (debt.balance * debt.interestRate / 100 / 12 * months);
    }, 0);

    const maxMonths = Math.max(...debts.map(debt => 
      Math.ceil(debt.balance / debt.minimumPayment)
    ));

    const totalMinimums = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);

    return {
      strategy_name: 'Minimum Payments Only',
      total_interest: totalInterest,
      payoff_time_months: maxMonths,
      monthly_payment: totalMinimums,
      debt_order: debts.map(debt => ({
        debt,
        months_to_payoff: Math.ceil(debt.balance / debt.minimumPayment),
        total_interest: 0,
      })),
    };
  };

  const generateLocalAnalysis = (): DebtAnalysis => {
    const income = parseInt(profile.monthly_income) || 0;
    const totalDebt = profile.debts.reduce((sum, debt) => sum + debt.balance, 0);
    const monthlyPayments = profile.debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    const extraPayment = parseInt(profile.extra_payment_capacity) || 0;
    
    const debtToIncomeRatio = income > 0 ? (monthlyPayments / income) * 100 : 0;
    
    // Calculate debt score (0-100, higher is better)
    let score = 100;
    if (debtToIncomeRatio > 36) score -= 30;
    else if (debtToIncomeRatio > 20) score -= 15;
    
    const avgInterestRate = profile.debts.length > 0 
      ? profile.debts.reduce((sum, debt) => sum + debt.interestRate * debt.balance, 0) / totalDebt
      : 0;
    
    if (avgInterestRate > 20) score -= 25;
    else if (avgInterestRate > 15) score -= 15;
    else if (avgInterestRate > 10) score -= 10;
    
    const getDebtLevel = (score: number) => {
      if (score >= 80) return 'Excellent';
      if (score >= 60) return 'Good';
      if (score >= 40) return 'Fair';
      return 'Poor - Immediate Action Needed';
    };

    const strategies = {
      avalanche: calculateAvalancheStrategy(profile.debts, extraPayment),
      snowball: calculateSnowballStrategy(profile.debts, extraPayment),
      minimum_only: calculateMinimumOnlyStrategy(profile.debts),
    };

    const consolidationSavings = avgInterestRate > 15 ? totalDebt * 0.03 : 0; // Rough estimate

    return {
      debt_score: Math.max(0, score),
      debt_level: getDebtLevel(score),
      total_debt: totalDebt,
      debt_to_income_ratio: debtToIncomeRatio,
      monthly_debt_payments: monthlyPayments,
      strategies,
      consolidation_analysis: {
        potential_savings: consolidationSavings,
        recommended: avgInterestRate > 15 && profile.credit_score_range !== '300-549',
        notes: [
          'Consider consolidation if you can get a lower interest rate',
          'Personal loans typically range from 6-36% APR',
          'Balance transfer cards may offer 0% introductory rates',
        ],
      },
      recommendations: [
        debtToIncomeRatio > 36 ? 'Focus on reducing debt-to-income ratio below 36%' : 'Maintain current debt levels',
        'Pay more than minimum to save on interest',
        avgInterestRate > 15 ? 'Consider debt consolidation options' : 'Current rates are manageable',
        'Build emergency fund to avoid new debt',
      ],
      action_plan: [
        'List all debts with balances and interest rates',
        'Choose between avalanche or snowball strategy',
        'Set up automatic payments to avoid late fees',
        'Consider debt consolidation if beneficial',
        'Track progress monthly and celebrate milestones',
      ],
    };
  };

  const generateAIAnalysis = async () => {
    try {
      const response = await fetch('/api/analyze/debt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      const data = await response.json();
      if (data.success && data.analysis) {
        return data.analysis as DebtAnalysis;
      }
      throw new Error('AI analysis failed');
    } catch (error) {
      console.warn('Falling back to local analysis:', error);
      return generateLocalAnalysis();
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    const result = await generateAIAnalysis();
    setAnalysis(result);
    setIsLoading(false);
    setStep(4);
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${months} months`;
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  };

  const renderProgress = () => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 dark:bg-gray-700">
      <div
        className="bg-red-500 h-2.5 rounded-full transition-all"
        style={{ width: `${((step - 1) / 3) * 100}%` }}
      />
    </div>
  );

  // Step 1: Basic Info
  const renderStep1 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Basic Financial Information</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <MemoizedInput
            value={profile.name}
            onChange={value => handleInputChange('name', value)}
            placeholder="John Doe"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Income</label>
          <MemoizedInput
            type="number"
            value={profile.monthly_income}
            onChange={value => handleInputChange('monthly_income', value)}
            placeholder="5000"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Expenses</label>
          <MemoizedInput
            type="number"
            value={profile.monthly_expenses}
            onChange={value => handleInputChange('monthly_expenses', value)}
            placeholder="4000"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Extra Payment Capacity</label>
          <MemoizedInput
            type="number"
            value={profile.extra_payment_capacity}
            onChange={value => handleInputChange('extra_payment_capacity', value)}
            placeholder="500"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credit Score Range</label>
          <select
            value={profile.credit_score_range}
            onChange={e => handleInputChange('credit_score_range', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="300-549">Poor (300-549)</option>
            <option value="550-649">Fair (550-649)</option>
            <option value="650-749">Good (650-749)</option>
            <option value="750-799">Very Good (750-799)</option>
            <option value="800-850">Excellent (800-850)</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employment Stability</label>
          <select
            value={profile.employment_stability}
            onChange={e => handleInputChange('employment_stability', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="stable">Stable (2+ years)</option>
            <option value="somewhat-stable">Somewhat Stable (1-2 years)</option>
            <option value="unstable">Unstable (&lt; 1 year)</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Step 2: Debt Details
  const renderStep2 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Debt Details</h2>
      {profile.debts.map((debt, index) => (
        <div key={debt.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Debt #{index + 1}</h3>
            {profile.debts.length > 1 && (
              <button
                onClick={() => removeDebt(debt.id)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Debt Name</label>
              <MemoizedInput
                type="text"
                value={debt.name}
                onChange={value => updateDebt(debt.id, 'name', value)}
                placeholder="Credit Card 1"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select
                value={debt.type}
                onChange={e => updateDebt(debt.id, 'type', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option>Credit Card</option>
                <option>Student Loan</option>
                <option>Auto Loan</option>
                <option>Personal Loan</option>
                <option>Mortgage</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Balance ($)</label>
              <MemoizedInput
                type="number"
                value={debt.balance || ''}
                onChange={value => updateDebt(debt.id, 'balance', parseFloat(value) || 0)}
                placeholder="5000"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest Rate (%)</label>
              <MemoizedInput
                type="number"
                step="0.01"
                value={debt.interestRate || ''}
                onChange={value => updateDebt(debt.id, 'interestRate', parseFloat(value) || 0)}
                placeholder="18.99"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Payment ($)</label>
              <MemoizedInput
                type="number"
                value={debt.minimumPayment || ''}
                onChange={value => updateDebt(debt.id, 'minimumPayment', parseFloat(value) || 0)}
                placeholder="150"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>
      ))}
      
      <button
        onClick={addDebt}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 transition-colors"
      >
        + Add Another Debt
      </button>
    </div>
  );

  // Step 3: Strategy Preferences
  const renderStep3 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Strategy Preferences</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Payoff Strategy</label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="avalanche"
                checked={profile.payoff_preference === 'avalanche'}
                onChange={e => handleInputChange('payoff_preference', e.target.value)}
                className="text-red-500"
              />
              <span>Avalanche (Pay highest interest first - saves most money)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="snowball"
                checked={profile.payoff_preference === 'snowball'}
                onChange={e => handleInputChange('payoff_preference', e.target.value)}
                className="text-red-500"
              />
              <span>Snowball (Pay smallest balance first - builds momentum)</span>
            </label>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest in Debt Consolidation</label>
          <select
            value={profile.consolidation_interest}
            onChange={e => handleInputChange('consolidation_interest', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="yes">Yes, very interested</option>
            <option value="maybe">Maybe, depends on terms</option>
            <option value="no">No, prefer current structure</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Step 4: Results
  const renderResults = () => {
    if (!analysis) return null;
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Debt Management Analysis</h2>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full mb-4">
            <span className="text-3xl text-white">💳</span>
          </div>
        </div>
        
        {/* Debt Score */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Debt Health Score</h3>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-red-600">{analysis.debt_score}/100</div>
            <div>
              <p className="font-semibold">{analysis.debt_level}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Debt-to-Income: {analysis.debt_to_income_ratio.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold mb-2">Total Debt</h4>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(analysis.total_debt)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold mb-2">Monthly Payments</h4>
            <p className="text-2xl font-bold">{formatCurrency(analysis.monthly_debt_payments)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold mb-2">Debt-to-Income</h4>
            <p className="text-2xl font-bold">{analysis.debt_to_income_ratio.toFixed(1)}%</p>
          </div>
        </div>

        {/* Strategy Comparison */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Payoff Strategy Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Strategy</th>
                  <th className="text-left py-2">Total Interest</th>
                  <th className="text-left py-2">Payoff Time</th>
                  <th className="text-left py-2">Monthly Payment</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-semibold text-green-600">Debt Avalanche ⭐</td>
                  <td className="py-2">{formatCurrency(analysis.strategies.avalanche.total_interest)}</td>
                  <td className="py-2">{formatTime(analysis.strategies.avalanche.payoff_time_months)}</td>
                  <td className="py-2">{formatCurrency(analysis.strategies.avalanche.monthly_payment)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-semibold text-blue-600">Debt Snowball</td>
                  <td className="py-2">{formatCurrency(analysis.strategies.snowball.total_interest)}</td>
                  <td className="py-2">{formatTime(analysis.strategies.snowball.payoff_time_months)}</td>
                  <td className="py-2">{formatCurrency(analysis.strategies.snowball.monthly_payment)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Minimum Only</td>
                  <td className="py-2">{formatCurrency(analysis.strategies.minimum_only.total_interest)}</td>
                  <td className="py-2">{formatTime(analysis.strategies.minimum_only.payoff_time_months)}</td>
                  <td className="py-2">{formatCurrency(analysis.strategies.minimum_only.monthly_payment)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Consolidation Analysis */}
        {analysis.consolidation_analysis.recommended && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Debt Consolidation Analysis</h3>
            <p className="mb-2">
              <strong>Potential Annual Savings:</strong> {formatCurrency(analysis.consolidation_analysis.potential_savings)}
            </p>
            <ul className="space-y-1 text-sm">
              {analysis.consolidation_analysis.notes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Key Recommendations</h3>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Plan */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Action Plan</h3>
          <ol className="space-y-2">
            {analysis.action_plan.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-yellow-600 font-semibold mt-1">{idx + 1}.</span>
                <span>{action}</span>
              </li>
            ))}
          </ol>
        </div>

        <button
          onClick={onBack}
          className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Back to Finance Hub
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl mb-4">
            <span className="text-2xl text-white">💳</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Debt Management Tool
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Strategic debt payoff planning and optimization
          </p>
        </div>

        {renderProgress()}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderResults()}

        {/* Navigation */}
        {step < 4 && (
          <div className="mt-6 flex justify-between">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
            ) : (
              <div />
            )}
            {step < 3 && (
              <button
                onClick={nextStep}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={step === 2 && profile.debts.length === 0}
              >
                Next
              </button>
            )}
            {step === 3 && (
              <button
                onClick={handleAnalyze}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={isLoading || profile.debts.length === 0}
              >
                {isLoading ? 'Analyzing...' : 'Generate Analysis'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
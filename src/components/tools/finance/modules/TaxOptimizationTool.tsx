import { useState } from 'react';

interface TaxProfile {
  name: string;
  filing_status: 'single' | 'married-joint' | 'married-separate' | 'head-of-household';
  annual_income: string;
  spouse_income: string;
  state: string;
  dependents: string;
  current_401k_contribution: string;
  current_ira_contribution: string;
  hsa_contribution: string;
  charitable_giving: string;
  mortgage_interest: string;
  state_local_taxes: string;
  property_taxes: string;
  business_income: string;
  capital_gains: string;
  dividend_income: string;
  retirement_account_types: string[];
  tax_loss_harvesting: 'yes' | 'no' | 'unfamiliar';
  quarterly_payments: 'yes' | 'no';
  tax_professional: 'yes' | 'no' | 'considering';
}

interface TaxStrategy {
  strategy: string;
  description: string;
  potential_savings: number;
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  deadline: string;
  action_required: string;
}

interface TaxAnalysis {
  current_tax_situation: {
    estimated_federal_tax: number;
    estimated_state_tax: number;
    effective_tax_rate: number;
    marginal_tax_rate: number;
    tax_bracket: string;
  };
  optimization_score: number;
  optimization_level: string;
  total_potential_savings: number;
  strategies: TaxStrategy[];
  deduction_analysis: {
    standard_deduction: number;
    itemized_deductions: number;
    recommendation: 'standard' | 'itemize';
    potential_additional_deductions: string[];
  };
  retirement_optimization: {
    max_401k_contribution: number;
    max_ira_contribution: number;
    backdoor_roth_eligible: boolean;
    mega_backdoor_eligible: boolean;
    tax_savings_if_maxed: number;
  };
  year_end_strategies: string[];
  quarterly_planning: {
    q1_actions: string[];
    q2_actions: string[];
    q3_actions: string[];
    q4_actions: string[];
  };
  recommendations: string[];
  action_plan: string[];
}

interface Props {
  onBack: () => void;
}

export default function TaxOptimizationTool({ onBack }: Props) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<TaxProfile>({
    name: '',
    filing_status: 'single',
    annual_income: '',
    spouse_income: '',
    state: '',
    dependents: '0',
    current_401k_contribution: '',
    current_ira_contribution: '',
    hsa_contribution: '',
    charitable_giving: '',
    mortgage_interest: '',
    state_local_taxes: '',
    property_taxes: '',
    business_income: '',
    capital_gains: '',
    dividend_income: '',
    retirement_account_types: [],
    tax_loss_harvesting: 'unfamiliar',
    quarterly_payments: 'no',
    tax_professional: 'no',
  });

  const [analysis, setAnalysis] = useState<TaxAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof TaxProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const calculateTaxBracket = (income: number, filingStatus: string) => {
    // 2024 tax brackets (simplified)
    const brackets = {
      single: [
        { min: 0, max: 11000, rate: 0.10 },
        { min: 11000, max: 44725, rate: 0.12 },
        { min: 44725, max: 95375, rate: 0.22 },
        { min: 95375, max: 182050, rate: 0.24 },
        { min: 182050, max: 231250, rate: 0.32 },
        { min: 231250, max: 578125, rate: 0.35 },
        { min: 578125, max: Infinity, rate: 0.37 },
      ],
      'married-joint': [
        { min: 0, max: 22000, rate: 0.10 },
        { min: 22000, max: 89450, rate: 0.12 },
        { min: 89450, max: 190750, rate: 0.22 },
        { min: 190750, max: 364200, rate: 0.24 },
        { min: 364200, max: 462500, rate: 0.32 },
        { min: 462500, max: 693750, rate: 0.35 },
        { min: 693750, max: Infinity, rate: 0.37 },
      ],
    };

    const applicableBrackets = brackets[filingStatus as keyof typeof brackets] || brackets.single;
    
    let tax = 0;
    let marginalRate = 0;
    
    for (const bracket of applicableBrackets) {
      if (income > bracket.min) {
        const taxableInThisBracket = Math.min(income - bracket.min, bracket.max - bracket.min);
        tax += taxableInThisBracket * bracket.rate;
        marginalRate = bracket.rate;
        
        if (income <= bracket.max) break;
      }
    }
    
    return { tax, marginalRate, effectiveRate: income > 0 ? tax / income : 0 };
  };

  const generateLocalAnalysis = (): TaxAnalysis => {
    const income = parseInt(profile.annual_income) || 0;
    const spouseIncome = parseInt(profile.spouse_income) || 0;
    const totalIncome = income + spouseIncome;
    const dependents = parseInt(profile.dependents) || 0;
    
    const { tax: federalTax, marginalRate, effectiveRate } = calculateTaxBracket(totalIncome, profile.filing_status);
    
    // Estimated state tax (simplified - varies by state)
    const stateTaxRate = profile.state ? 0.05 : 0; // Assume 5% average state tax
    const stateTax = totalIncome * stateTaxRate;
    
    // Current deductions
    const standardDeduction = profile.filing_status === 'married-joint' ? 27700 : 13850; // 2024 amounts
    const itemizedDeductions = (parseInt(profile.mortgage_interest) || 0) +
                              (parseInt(profile.state_local_taxes) || 0) +
                              (parseInt(profile.property_taxes) || 0) +
                              (parseInt(profile.charitable_giving) || 0);
    
    const shouldItemize = itemizedDeductions > standardDeduction;
    
    // Retirement contribution limits (2024)
    const max401k = profile.filing_status === 'married-joint' ? 46000 : 23000; // Including catch-up if applicable
    const maxIRA = 7000; // Including catch-up
    
    const current401k = parseInt(profile.current_401k_contribution) || 0;
    const currentIRA = parseInt(profile.current_ira_contribution) || 0;
    
    const additional401k = Math.max(0, max401k - current401k);
    const additionalIRA = Math.max(0, maxIRA - currentIRA);
    
    const taxSavingsIfMaxed = (additional401k + additionalIRA) * marginalRate;
    
    // Generate optimization strategies
    const strategies: TaxStrategy[] = [
      {
        strategy: 'Maximize 401(k) Contributions',
        description: `Increase 401(k) contribution by $${additional401k.toLocaleString()}`,
        potential_savings: additional401k * marginalRate,
        difficulty: 'Easy',
        deadline: 'December 31st',
        action_required: 'Contact HR to increase payroll deduction',
      },
      {
        strategy: 'Tax-Loss Harvesting',
        description: 'Sell losing investments to offset capital gains',
        potential_savings: Math.min(3000, (parseInt(profile.capital_gains) || 0) * 0.5) * marginalRate,
        difficulty: 'Moderate',
        deadline: 'December 31st',
        action_required: 'Review investment portfolio for losses',
      },
      {
        strategy: 'HSA Contributions',
        description: 'Triple tax advantage: deductible, growth, and withdrawals',
        potential_savings: (4300 - (parseInt(profile.hsa_contribution) || 0)) * marginalRate,
        difficulty: 'Easy',
        deadline: 'April 15th (following year)',
        action_required: 'Open HSA account and contribute maximum',
      },
      {
        strategy: 'Charitable Giving Optimization',
        description: 'Donate appreciated securities instead of cash',
        potential_savings: (parseInt(profile.charitable_giving) || 0) * 0.15, // Capital gains saved
        difficulty: 'Moderate',
        deadline: 'December 31st',
        action_required: 'Transfer appreciated stocks to charity',
      },
    ].filter(s => s.potential_savings > 0);
    
    const totalPotentialSavings = strategies.reduce((sum, s) => sum + s.potential_savings, 0);
    
    // Calculate optimization score
    let score = 50; // Base score
    if (current401k > 0) score += 15;
    if (currentIRA > 0) score += 10;
    if (parseInt(profile.hsa_contribution) > 0) score += 10;
    if (profile.tax_loss_harvesting === 'yes') score += 10;
    if (shouldItemize && itemizedDeductions > standardDeduction * 1.1) score += 5;
    
    const getOptimizationLevel = (score: number) => {
      if (score >= 90) return 'Excellent - Highly Optimized';
      if (score >= 70) return 'Good - Well Optimized';
      if (score >= 50) return 'Fair - Some Optimization';
      return 'Poor - Needs Significant Optimization';
    };

    return {
      current_tax_situation: {
        estimated_federal_tax: federalTax,
        estimated_state_tax: stateTax,
        effective_tax_rate: effectiveRate * 100,
        marginal_tax_rate: marginalRate * 100,
        tax_bracket: `${(marginalRate * 100).toFixed(0)}%`,
      },
      optimization_score: Math.min(100, score),
      optimization_level: getOptimizationLevel(score),
      total_potential_savings: totalPotentialSavings,
      strategies,
      deduction_analysis: {
        standard_deduction: standardDeduction,
        itemized_deductions: itemizedDeductions,
        recommendation: shouldItemize ? 'itemize' : 'standard',
        potential_additional_deductions: [
          'Home office expenses (if self-employed)',
          'Professional development and education',
          'State and local tax payments',
          'Medical expenses exceeding 7.5% of AGI',
        ],
      },
      retirement_optimization: {
        max_401k_contribution: max401k,
        max_ira_contribution: maxIRA,
        backdoor_roth_eligible: totalIncome > 138000,
        mega_backdoor_eligible: current401k < max401k && totalIncome > 200000,
        tax_savings_if_maxed: taxSavingsIfMaxed,
      },
      year_end_strategies: [
        'Accelerate deductible expenses',
        'Defer income to next year if possible',
        'Harvest tax losses',
        'Make charitable contributions',
        'Contribute to retirement accounts',
        'Prepay state and local taxes (if beneficial)',
      ],
      quarterly_planning: {
        q1_actions: ['File prior year taxes', 'Make Q1 estimated payment', 'Contribute to IRA'],
        q2_actions: ['Review mid-year tax situation', 'Make Q2 estimated payment', 'Adjust withholdings'],
        q3_actions: ['Make Q3 estimated payment', 'Plan year-end strategies', 'Review investment gains/losses'],
        q4_actions: ['Execute tax-loss harvesting', 'Make final retirement contributions', 'Charitable giving'],
      },
      recommendations: [
        totalPotentialSavings > 1000 ? `Potential tax savings of $${totalPotentialSavings.toLocaleString()} available` : 'Tax situation appears optimized',
        current401k < max401k ? 'Increase 401(k) contributions for maximum tax benefit' : 'Excellent 401(k) contribution',
        profile.tax_professional === 'no' && totalIncome > 100000 ? 'Consider hiring a tax professional' : 'Tax professional guidance is valuable',
        'Implement tax-loss harvesting strategy',
        'Review quarterly estimated payments',
      ],
      action_plan: [
        'Calculate exact tax savings from each strategy',
        'Prioritize strategies by savings amount and ease of implementation',
        'Set calendar reminders for key tax deadlines',
        'Review and adjust withholdings quarterly',
        'Document all tax-deductible expenses throughout the year',
      ],
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl mb-4">
              <span className="text-2xl text-white">📋</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Tax Optimization Tool
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Tax optimization strategies and planning (Coming Soon)
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-8 mb-8">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This advanced tax optimization tool will provide:
              </p>
              <ul className="text-left max-w-md mx-auto space-y-2 text-gray-700 dark:text-gray-300">
                <li>• Tax Bracket Optimization</li>
                <li>• Deduction Maximization</li>
                <li>• Retirement Account Strategy</li>
                <li>• Tax-Loss Harvesting</li>
                <li>• Estate Tax Planning</li>
                <li>• Quarterly Tax Estimation</li>
                <li>• Year-End Tax Planning</li>
              </ul>
            </div>
            
            <button
              onClick={onBack}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Finance Hub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
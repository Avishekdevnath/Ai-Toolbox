import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

interface EmergencyProfile {
  name: string;
  monthly_income: string;
  monthly_expenses: string;
  job_stability: 'very-stable' | 'stable' | 'somewhat-unstable' | 'unstable';
  industry: string;
  dependents: string;
  health_status: 'excellent' | 'good' | 'fair' | 'poor';
  current_emergency_fund: string;
  current_savings_rate: string;
  high_yield_account: 'yes' | 'no' | 'considering';
  other_liquid_savings: string;
  debt_obligations: string;
  insurance_coverage: 'excellent' | 'good' | 'basic' | 'minimal';
}

interface EmergencyScenario {
  name: string;
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  estimated_cost: number;
  duration_months: number;
}

interface EmergencyAnalysis {
  fund_adequacy_score: number;
  adequacy_level: string;
  recommended_fund_size: number;
  current_months_coverage: number;
  recommended_months: number;
  monthly_gap: number;
  time_to_goal_months: number;
  scenarios: EmergencyScenario[];
  account_recommendations: {
    high_yield_savings: {
      recommended: boolean;
      estimated_apy: number;
      annual_benefit: number;
    };
    money_market: {
      recommended: boolean;
      pros: string[];
      cons: string[];
    };
    cd_ladder: {
      recommended: boolean;
      strategy: string;
    };
  };
  building_strategy: {
    monthly_target: number;
    automatic_transfer: boolean;
    windfall_allocation: number;
    timeline: string;
  };
  recommendations: string[];
  action_plan: string[];
}

interface Props {
  onBack: () => void;
}

export default function EmergencyFundTool({ onBack }: Props) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<EmergencyProfile>({
    name: '',
    monthly_income: '',
    monthly_expenses: '',
    job_stability: 'stable',
    industry: '',
    dependents: '0',
    health_status: 'good',
    current_emergency_fund: '',
    current_savings_rate: '',
    high_yield_account: 'considering',
    other_liquid_savings: '',
    debt_obligations: '',
    insurance_coverage: 'good',
  });

  const [analysis, setAnalysis] = useState<EmergencyAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedCurrency } = useFinance();

  const handleInputChange = (field: keyof EmergencyProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const calculateRecommendedMonths = () => {
    let baseMonths = 3; // Base recommendation
    
    // Adjust for job stability
    switch (profile.job_stability) {
      case 'very-stable': baseMonths += 0; break;
      case 'stable': baseMonths += 1; break;
      case 'somewhat-unstable': baseMonths += 2; break;
      case 'unstable': baseMonths += 3; break;
    }
    
    // Adjust for dependents
    const dependents = parseInt(profile.dependents) || 0;
    baseMonths += Math.min(dependents, 3); // Max 3 extra months for dependents
    
    // Adjust for health status
    if (profile.health_status === 'poor') baseMonths += 2;
    else if (profile.health_status === 'fair') baseMonths += 1;
    
    // Adjust for insurance coverage
    if (profile.insurance_coverage === 'minimal') baseMonths += 2;
    else if (profile.insurance_coverage === 'basic') baseMonths += 1;
    
    return Math.min(baseMonths, 12); // Cap at 12 months
  };

  const generateScenarios = (): EmergencyScenario[] => {
    const monthlyExpenses = parseInt(profile.monthly_expenses) || 0;
    const dependents = parseInt(profile.dependents) || 0;
    
    const scenarios: EmergencyScenario[] = [
      {
        name: 'Job Loss',
        description: 'Temporary unemployment requiring job search',
        likelihood: profile.job_stability === 'unstable' ? 'high' : 
                   profile.job_stability === 'somewhat-unstable' ? 'medium' : 'low',
        estimated_cost: monthlyExpenses * 0.8, // Reduced expenses during unemployment
        duration_months: profile.job_stability === 'unstable' ? 6 : 4,
      },
      {
        name: 'Medical Emergency',
        description: 'Unexpected medical costs not covered by insurance',
        likelihood: profile.health_status === 'poor' ? 'high' :
                   profile.health_status === 'fair' ? 'medium' : 'low',
        estimated_cost: profile.insurance_coverage === 'minimal' ? 8000 :
                       profile.insurance_coverage === 'basic' ? 5000 : 3000,
        duration_months: 1,
      },
      {
        name: 'Major Home Repair',
        description: 'Urgent home repairs (HVAC, roof, plumbing)',
        likelihood: 'medium',
        estimated_cost: 5000,
        duration_months: 1,
      },
      {
        name: 'Car Breakdown',
        description: 'Major car repair or replacement',
        likelihood: 'medium',
        estimated_cost: 3000,
        duration_months: 1,
      },
    ];

    if (dependents > 0) {
      scenarios.push({
        name: 'Family Emergency',
        description: 'Unexpected family-related expenses',
        likelihood: 'medium',
        estimated_cost: 2000 * dependents,
        duration_months: 1,
      });
    }

    return scenarios;
  };

  const generateLocalAnalysis = (): EmergencyAnalysis => {
    const monthlyIncome = parseInt(profile.monthly_income) || 0;
    const monthlyExpenses = parseInt(profile.monthly_expenses) || 0;
    const currentFund = parseInt(profile.current_emergency_fund) || 0;
    const currentSavingsRate = parseInt(profile.current_savings_rate) || 0;
    const otherSavings = parseInt(profile.other_liquid_savings) || 0;
    
    const recommendedMonths = calculateRecommendedMonths();
    const recommendedFundSize = monthlyExpenses * recommendedMonths;
    const currentMonthsCoverage = monthlyExpenses > 0 ? (currentFund + otherSavings) / monthlyExpenses : 0;
    const monthlyGap = Math.max(0, recommendedFundSize - currentFund);
    const timeToGoal = currentSavingsRate > 0 ? Math.ceil(monthlyGap / currentSavingsRate) : 0;
    
    // Calculate adequacy score (0-100)
    let score = Math.min(100, (currentMonthsCoverage / recommendedMonths) * 100);
    
    // Bonus points for having high-yield account
    if (profile.high_yield_account === 'yes') score += 5;
    score = Math.min(100, score);
    
    const getAdequacyLevel = (score: number) => {
      if (score >= 90) return 'Excellent - Fully Prepared';
      if (score >= 70) return 'Good - Well Protected';
      if (score >= 50) return 'Fair - Partially Protected';
      if (score >= 30) return 'Poor - Minimally Protected';
      return 'Critical - Very Vulnerable';
    };

    const scenarios = generateScenarios();
    
    // Calculate potential high-yield benefit
    const currentAPY = profile.high_yield_account === 'yes' ? 4.5 : 0.5;
    const highYieldAPY = 4.5;
    const annualBenefit = currentFund * (highYieldAPY - currentAPY) / 100;

    return {
      fund_adequacy_score: Math.round(score),
      adequacy_level: getAdequacyLevel(score),
      recommended_fund_size: recommendedFundSize,
      current_months_coverage: currentMonthsCoverage,
      recommended_months: recommendedMonths,
      monthly_gap: monthlyGap,
      time_to_goal_months: timeToGoal,
      scenarios,
      account_recommendations: {
        high_yield_savings: {
          recommended: profile.high_yield_account !== 'yes',
          estimated_apy: 4.5,
          annual_benefit: Math.max(0, annualBenefit),
        },
        money_market: {
          recommended: currentFund > 10000,
          pros: ['Higher interest rates', 'Check-writing privileges', 'Debit card access'],
          cons: ['Higher minimum balance', 'Limited transactions', 'Variable rates'],
        },
        cd_ladder: {
          recommended: currentFund > 25000,
          strategy: 'Ladder 3-month CDs for higher rates while maintaining liquidity',
        },
      },
      building_strategy: {
        monthly_target: Math.max(100, monthlyGap / Math.max(12, timeToGoal)),
        automatic_transfer: true,
        windfall_allocation: 50, // 50% of windfalls to emergency fund
        timeline: timeToGoal > 0 ? `${timeToGoal} months to reach goal` : 'Goal achieved',
      },
      recommendations: [
        currentMonthsCoverage < 1 ? 'Prioritize building emergency fund immediately' : 
        currentMonthsCoverage < 3 ? 'Continue building emergency fund before other investments' :
        'Maintain current emergency fund and consider other goals',
        profile.high_yield_account !== 'yes' ? 'Move emergency fund to high-yield savings account' : 'Good choice on high-yield account',
        currentSavingsRate < 100 ? 'Increase automatic savings rate' : 'Excellent savings discipline',
        'Keep emergency fund separate from other savings goals',
        'Review and adjust fund size annually',
      ],
      action_plan: [
        'Open high-yield savings account specifically for emergency fund',
        'Set up automatic monthly transfer to emergency fund',
        'Calculate exact monthly expenses to determine precise goal',
        'Allocate tax refunds and bonuses to emergency fund until goal is met',
        'Review emergency fund size annually or after major life changes',
      ],
    };
  };

  const generateAIAnalysis = async () => {
    try {
      const response = await fetch('/api/analyze/emergency-fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      const data = await response.json();
      if (data.success && data.analysis) {
        return data.analysis as EmergencyAnalysis;
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

  const renderProgress = () => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 dark:bg-gray-700">
      <div
        className="bg-green-500 h-2.5 rounded-full transition-all"
        style={{ width: `${((step - 1) / 3) * 100}%` }}
      />
    </div>
  );

  const Input = ({ label, field, type = 'text', placeholder = '' }: {
    label: string; field: keyof EmergencyProfile; type?: string; placeholder?: string;
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        value={profile[field]}
        onChange={e => handleInputChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
      />
    </div>
  );

  const Select = ({ label, field, options }: {
    label: string; field: keyof EmergencyProfile; options: { value: string; label: string }[];
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <select
        value={profile[field]}
        onChange={e => handleInputChange(field, e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  // Step 1: Basic Information
  const renderStep1 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Name" field="name" placeholder="John Doe" />
        <Input label="Monthly Income" field="monthly_income" type="number" placeholder="5000" />
        <Input label="Monthly Expenses" field="monthly_expenses" type="number" placeholder="4000" />
        <Input label="Number of Dependents" field="dependents" type="number" placeholder="2" />
        <Input label="Industry/Profession" field="industry" placeholder="Technology, Healthcare, etc." />
      </div>
    </div>
  );

  // Step 2: Risk Factors
  const renderStep2 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Select 
          label="Job Stability" 
          field="job_stability" 
          options={[
            { value: 'very-stable', label: 'Very Stable (Government, Tenure)' },
            { value: 'stable', label: 'Stable (Corporate, 2+ years)' },
            { value: 'somewhat-unstable', label: 'Somewhat Unstable (Contract, 1-2 years)' },
            { value: 'unstable', label: 'Unstable (Freelance, <1 year)' },
          ]}
        />
        <Select 
          label="Health Status" 
          field="health_status" 
          options={[
            { value: 'excellent', label: 'Excellent' },
            { value: 'good', label: 'Good' },
            { value: 'fair', label: 'Fair' },
            { value: 'poor', label: 'Poor' },
          ]}
        />
        <Select 
          label="Insurance Coverage" 
          field="insurance_coverage" 
          options={[
            { value: 'excellent', label: 'Excellent (Low deductibles, comprehensive)' },
            { value: 'good', label: 'Good (Moderate deductibles)' },
            { value: 'basic', label: 'Basic (High deductibles)' },
            { value: 'minimal', label: 'Minimal (Very high deductibles)' },
          ]}
        />
        <Input label="Monthly Debt Obligations" field="debt_obligations" type="number" placeholder="500" />
      </div>
    </div>
  );

  // Step 3: Current Savings
  const renderStep3 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Current Emergency Fund Status</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Current Emergency Fund" field="current_emergency_fund" type="number" placeholder="5000" />
        <Input label="Other Liquid Savings" field="other_liquid_savings" type="number" placeholder="2000" />
        <Input label="Monthly Savings Rate" field="current_savings_rate" type="number" placeholder="300" />
        <Select 
          label="High-Yield Savings Account" 
          field="high_yield_account" 
          options={[
            { value: 'yes', label: 'Yes, already using one' },
            { value: 'considering', label: 'Considering switching' },
            { value: 'no', label: 'No, using regular savings' },
          ]}
        />
      </div>
      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">💡 Tip: High-Yield Savings</h3>
        <p className="text-sm text-green-700 dark:text-green-300">
          High-yield savings accounts currently offer 4-5% APY compared to 0.01% from traditional banks. 
          This can add hundreds of dollars annually to your emergency fund growth.
        </p>
      </div>
    </div>
  );

  // Step 4: Results
  const renderResults = () => {
    if (!analysis) return null;
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Emergency Fund Analysis</h2>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
            <span className="text-3xl text-white">🛡️</span>
          </div>
        </div>
        
        {/* Adequacy Score */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Emergency Fund Adequacy</h3>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-green-600">{analysis.fund_adequacy_score}/100</div>
            <div>
              <p className="font-semibold">{analysis.adequacy_level}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current coverage: {analysis.current_months_coverage.toFixed(1)} months
              </p>
            </div>
          </div>
        </div>

        {/* Fund Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold mb-2">Current Fund</h4>
            <p className="text-2xl font-bold">{formatCurrency(parseInt(profile.current_emergency_fund) || 0)}</p>
            <p className="text-sm text-gray-600">{analysis.current_months_coverage.toFixed(1)} months</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold mb-2">Recommended Fund</h4>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(analysis.recommended_fund_size)}</p>
            <p className="text-sm text-gray-600">{analysis.recommended_months} months</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold mb-2">Gap to Goal</h4>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(analysis.monthly_gap)}</p>
            <p className="text-sm text-gray-600">{analysis.time_to_goal_months} months to goal</p>
          </div>
        </div>

        {/* Emergency Scenarios */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Emergency Scenarios Analysis</h3>
          <div className="grid gap-4">
            {analysis.scenarios.map((scenario, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{scenario.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{scenario.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(scenario.estimated_cost)}</p>
                    <p className="text-sm text-gray-600">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                        scenario.likelihood === 'high' ? 'bg-red-500' :
                        scenario.likelihood === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      {scenario.likelihood} risk
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Recommendations */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Account Recommendations</h3>
          
          {analysis.account_recommendations.high_yield_savings.recommended && (
            <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold text-blue-600 mb-2">High-Yield Savings Account ⭐</h4>
              <p className="text-sm mb-2">
                Potential annual benefit: <strong>{formatCurrency(analysis.account_recommendations.high_yield_savings.annual_benefit)}</strong>
              </p>
              <p className="text-sm">Current high-yield rates: ~{analysis.account_recommendations.high_yield_savings.estimated_apy}% APY</p>
            </div>
          )}

          {analysis.account_recommendations.money_market.recommended && (
            <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold text-blue-600 mb-2">Money Market Account</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-green-600">Pros:</p>
                  <ul className="list-disc list-inside">
                    {analysis.account_recommendations.money_market.pros.map((pro, idx) => (
                      <li key={idx}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-red-600">Cons:</p>
                  <ul className="list-disc list-inside">
                    {analysis.account_recommendations.money_market.cons.map((con, idx) => (
                      <li key={idx}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Building Strategy */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Building Strategy</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p><strong>Monthly Target:</strong> {formatCurrency(analysis.building_strategy.monthly_target)}</p>
              <p><strong>Timeline:</strong> {analysis.building_strategy.timeline}</p>
            </div>
            <div>
              <p><strong>Windfall Allocation:</strong> {analysis.building_strategy.windfall_allocation}%</p>
              <p><strong>Automatic Transfer:</strong> {analysis.building_strategy.automatic_transfer ? 'Recommended' : 'Optional'}</p>
            </div>
          </div>
        </div>

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
        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Action Plan</h3>
          <ol className="space-y-2">
            {analysis.action_plan.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-purple-600 font-semibold mt-1">{idx + 1}.</span>
                <span>{action}</span>
              </li>
            ))}
          </ol>
        </div>

        <button
          onClick={onBack}
          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mb-4">
            <span className="text-2xl text-white">🛡️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Emergency Fund Planning Tool
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Emergency fund optimization and contingency planning
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Next
              </button>
            )}
            {step === 3 && (
              <button
                onClick={handleAnalyze}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
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
import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

interface ScenarioProfile {
  name: string;
  current_age: string;
  retirement_age: string;
  annual_income: string;
  annual_expenses: string;
  current_savings: string;
  monthly_savings: string;
  investment_return: string;
  inflation_rate: string;
  
  // Goals
  retirement_goal: string;
  emergency_fund_goal: string;
  major_purchase_goal: string;
  major_purchase_timeline: string;
}

interface ScenarioEvent {
  name: string;
  description: string;
  probability: 'Low' | 'Medium' | 'High';
  timeline: string;
  financial_impact: {
    income_change_percent: number;
    expense_change_percent: number;
    one_time_cost: number;
    duration_months: number;
  };
  enabled: boolean;
}

interface ProjectionResult {
  age: number;
  savings: number;
  annual_income: number;
  annual_expenses: number;
  retirement_readiness: number;
}

interface ScenarioAnalysis {
  baseline_projection: ProjectionResult[];
  scenario_projections: { [key: string]: ProjectionResult[] };
  scenario_summary: {
    scenario_name: string;
    retirement_impact_years: number;
    savings_impact_percent: number;
    goal_achievement_probability: number;
    stress_level: 'Low' | 'Medium' | 'High' | 'Critical';
    mitigation_strategies: string[];
  }[];
  recommendations: {
    emergency_fund_months: number;
    insurance_recommendations: string[];
    investment_adjustments: string[];
    income_diversification: string[];
    expense_optimization: string[];
  };
  stress_test_results: {
    mild_recession: { impact: string; recovery_time: string };
    major_recession: { impact: string; recovery_time: string };
    job_loss: { impact: string; recovery_time: string };
    health_emergency: { impact: string; recovery_time: string };
  };
  monte_carlo_results: {
    success_probability: number;
    median_outcome: number;
    worst_10_percent: number;
    best_10_percent: number;
  };
}

interface Props {
  onBack: () => void;
}

export default function ScenarioPlanningTool({ onBack }: Props) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<ScenarioProfile>({
    name: '',
    current_age: '',
    retirement_age: '65',
    annual_income: '',
    annual_expenses: '',
    current_savings: '',
    monthly_savings: '',
    investment_return: '7',
    inflation_rate: '3',
    retirement_goal: '',
    emergency_fund_goal: '',
    major_purchase_goal: '',
    major_purchase_timeline: '5',
  });

  const [scenarios, setScenarios] = useState<ScenarioEvent[]>([
    {
      name: 'Job Loss',
      description: 'Temporary unemployment period',
      probability: 'Medium',
      timeline: 'Next 10 years',
      financial_impact: {
        income_change_percent: -100,
        expense_change_percent: -20,
        one_time_cost: 0,
        duration_months: 6,
      },
      enabled: true,
    },
    {
      name: 'Economic Recession',
      description: 'Market downturn affecting investments and income',
      probability: 'Medium',
      timeline: 'Next 10 years',
      financial_impact: {
        income_change_percent: -15,
        expense_change_percent: 0,
        one_time_cost: 0,
        duration_months: 18,
      },
      enabled: true,
    },
    {
      name: 'Health Emergency',
      description: 'Major medical expense not covered by insurance',
      probability: 'Low',
      timeline: 'Anytime',
      financial_impact: {
        income_change_percent: -30,
        expense_change_percent: 50,
        one_time_cost: 75000,
        duration_months: 12,
      },
      enabled: true,
    },
    {
      name: 'Home Major Repair',
      description: 'Significant home maintenance or repair costs',
      probability: 'High',
      timeline: 'Next 5 years',
      financial_impact: {
        income_change_percent: 0,
        expense_change_percent: 0,
        one_time_cost: 25000,
        duration_months: 1,
      },
      enabled: true,
    },
    {
      name: 'Career Change',
      description: 'Voluntary career transition with temporary income reduction',
      probability: 'Medium',
      timeline: 'Mid-career',
      financial_impact: {
        income_change_percent: -40,
        expense_change_percent: 0,
        one_time_cost: 15000,
        duration_months: 12,
      },
      enabled: false,
    },
    {
      name: 'Market Crash',
      description: 'Severe market decline affecting investment portfolio',
      probability: 'Low',
      timeline: 'Next 20 years',
      financial_impact: {
        income_change_percent: 0,
        expense_change_percent: 0,
        one_time_cost: 0,
        duration_months: 24,
      },
      enabled: false,
    },
  ]);

  const [analysis, setAnalysis] = useState<ScenarioAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedCurrency } = useFinance();

  const handleInputChange = (field: keyof ScenarioProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const updateScenario = (index: number, field: keyof ScenarioEvent, value: any) => {
    setScenarios(prev => prev.map((scenario, idx) => 
      idx === index ? { ...scenario, [field]: value } : scenario
    ));
  };

  const updateScenarioImpact = (index: number, field: keyof ScenarioEvent['financial_impact'], value: number) => {
    setScenarios(prev => prev.map((scenario, idx) => 
      idx === index 
        ? { ...scenario, financial_impact: { ...scenario.financial_impact, [field]: value } }
        : scenario
    ));
  };

  const calculateProjection = (baseProfile: ScenarioProfile, scenarioEvents: ScenarioEvent[] = []) => {
    const currentAge = parseInt(baseProfile.current_age) || 30;
    const retirementAge = parseInt(baseProfile.retirement_age) || 65;
    const years = retirementAge - currentAge;
    
    let currentSavings = parseInt(baseProfile.current_savings) || 0;
    let annualIncome = parseInt(baseProfile.annual_income) || 60000;
    let annualExpenses = parseInt(baseProfile.annual_expenses) || 50000;
    const monthlySavings = parseInt(baseProfile.monthly_savings) || 500;
    const investmentReturn = (parseInt(baseProfile.investment_return) || 7) / 100;
    const inflationRate = (parseInt(baseProfile.inflation_rate) || 3) / 100;
    
    const projection: ProjectionResult[] = [];
    
    for (let year = 0; year <= years; year++) {
      const age = currentAge + year;
      
      // Apply scenario events
      let yearlyIncomeAdjustment = 1;
      let yearlyExpenseAdjustment = 1;
      let oneTimeCosts = 0;
      
      scenarioEvents.forEach(scenario => {
        if (scenario.enabled) {
          // Simplified: apply scenario in year 5 for demonstration
          if (year === 5) {
            yearlyIncomeAdjustment *= (1 + scenario.financial_impact.income_change_percent / 100);
            yearlyExpenseAdjustment *= (1 + scenario.financial_impact.expense_change_percent / 100);
            oneTimeCosts += scenario.financial_impact.one_time_cost;
          }
        }
      });
      
      // Calculate year-end values
      const yearlyIncome = annualIncome * yearlyIncomeAdjustment;
      const yearlyExpenses = (annualExpenses * yearlyExpenseAdjustment) + oneTimeCosts;
      const yearlySavings = Math.max(0, yearlyIncome - yearlyExpenses + (monthlySavings * 12));
      
      // Investment growth
      currentSavings = (currentSavings * (1 + investmentReturn)) + yearlySavings;
      
      // Inflation adjustments for next year
      annualIncome *= (1 + inflationRate);
      annualExpenses *= (1 + inflationRate);
      
      const retirementGoal = parseInt(baseProfile.retirement_goal) || (annualExpenses * 25);
      const retirementReadiness = Math.min(100, (currentSavings / retirementGoal) * 100);
      
      projection.push({
        age,
        savings: currentSavings,
        annual_income: yearlyIncome,
        annual_expenses: yearlyExpenses,
        retirement_readiness: retirementReadiness,
      });
    }
    
    return projection;
  };

  const generateLocalAnalysis = (): ScenarioAnalysis => {
    const enabledScenarios = scenarios.filter(s => s.enabled);
    const baselineProjection = calculateProjection(profile, []);
    
    const scenarioProjections: { [key: string]: ProjectionResult[] } = {};
    const scenarioSummary = enabledScenarios.map(scenario => {
      const projection = calculateProjection(profile, [scenario]);
      scenarioProjections[scenario.name] = projection;
      
      const baselineFinalSavings = baselineProjection[baselineProjection.length - 1]?.savings || 0;
      const scenarioFinalSavings = projection[projection.length - 1]?.savings || 0;
      const savingsImpact = ((scenarioFinalSavings - baselineFinalSavings) / baselineFinalSavings) * 100;
      
      const stressLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 
        Math.abs(savingsImpact) < 5 ? 'Low' :
        Math.abs(savingsImpact) < 15 ? 'Medium' :
        Math.abs(savingsImpact) < 30 ? 'High' : 'Critical';
      
      return {
        scenario_name: scenario.name,
        retirement_impact_years: Math.abs(savingsImpact) > 10 ? Math.round(Math.abs(savingsImpact) / 5) : 0,
        savings_impact_percent: savingsImpact,
        goal_achievement_probability: Math.max(0, 100 + savingsImpact),
        stress_level: stressLevel,
        mitigation_strategies: [
          stressLevel === 'Critical' ? 'Increase emergency fund significantly' : 'Maintain adequate emergency fund',
          scenario.name === 'Job Loss' ? 'Consider income protection insurance' : 'Review insurance coverage',
          'Diversify income sources',
          stressLevel === 'High' || stressLevel === 'Critical' ? 'Reduce non-essential expenses' : 'Optimize spending',
        ],
      };
    });
    
    const currentIncome = parseInt(profile.annual_income) || 60000;
    const currentExpenses = parseInt(profile.annual_expenses) || 50000;
    const emergencyFundMonths = Math.max(6, scenarioSummary.length > 0 ? 12 : 6);
    
    // Monte Carlo simulation (simplified)
    const runMonteCarloIteration = () => {
      const volatility = 0.15; // 15% volatility
      const randomReturn = (Math.random() - 0.5) * volatility * 2;
      const adjustedProfile = { 
        ...profile, 
        investment_return: String((parseInt(profile.investment_return) || 7) + randomReturn * 100)
      };
      const projection = calculateProjection(adjustedProfile);
      return projection[projection.length - 1]?.savings || 0;
    };
    
    const monteCarloResults = Array.from({ length: 1000 }, () => runMonteCarloIteration()).sort((a, b) => a - b);
    const retirementGoal = parseInt(profile.retirement_goal) || (currentExpenses * 25);
    
    return {
      baseline_projection: baselineProjection,
      scenario_projections: scenarioProjections,
      scenario_summary: scenarioSummary,
      recommendations: {
        emergency_fund_months: emergencyFundMonths,
        insurance_recommendations: [
          'Disability insurance for income protection',
          'Adequate health insurance with reasonable deductibles',
          'Consider umbrella liability policy if high net worth',
          'Review life insurance needs annually',
        ],
        investment_adjustments: [
          scenarioSummary.some(s => s.stress_level === 'Critical') ? 'Consider more conservative allocation' : 'Maintain diversified portfolio',
          'Rebalance portfolio annually',
          'Consider target-date funds for simplicity',
          'Avoid emotional investment decisions during market volatility',
        ],
        income_diversification: [
          'Develop marketable skills in recession-proof areas',
          'Consider part-time business or consulting',
          'Build professional network for career opportunities',
          'Invest in education and professional development',
        ],
        expense_optimization: [
          'Track and categorize all expenses',
          'Identify and eliminate unnecessary subscriptions',
          'Negotiate insurance and utility rates annually',
          'Build habits around conscious spending',
        ],
      },
      stress_test_results: {
        mild_recession: {
          impact: 'Portfolio down 15-20%, income potentially reduced',
          recovery_time: '2-3 years with continued saving',
        },
        major_recession: {
          impact: 'Portfolio down 35-40%, possible job loss',
          recovery_time: '4-6 years with aggressive saving',
        },
        job_loss: {
          impact: '6-12 months of reduced income, emergency fund depletion',
          recovery_time: '1-2 years to rebuild emergency fund',
        },
        health_emergency: {
          impact: 'Significant one-time cost, possible income reduction',
          recovery_time: '2-4 years depending on severity',
        },
      },
      monte_carlo_results: {
        success_probability: (monteCarloResults.filter(result => result >= retirementGoal).length / 1000) * 100,
        median_outcome: monteCarloResults[500],
        worst_10_percent: monteCarloResults[100],
        best_10_percent: monteCarloResults[900],
      },
    };
  };

  const generateAIAnalysis = async () => {
    try {
      const response = await fetch('/api/analyze/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, scenarios }),
      });
      const data = await response.json();
      if (data.success && data.analysis) {
        return data.analysis as ScenarioAnalysis;
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
        className="bg-indigo-500 h-2.5 rounded-full transition-all"
        style={{ width: `${((step - 1) / 3) * 100}%` }}
      />
    </div>
  );

  const Input = ({ label, field, type = 'text', placeholder = '' }: {
    label: string; field: keyof ScenarioProfile; type?: string; placeholder?: string;
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        value={profile[field]}
        onChange={e => handleInputChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
      />
    </div>
  );

  // Step 1: Basic Financial Profile
  const renderStep1 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Financial Profile</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Name" field="name" placeholder="John Doe" />
        <Input label="Current Age" field="current_age" type="number" placeholder="35" />
        <Input label="Planned Retirement Age" field="retirement_age" type="number" placeholder="65" />
        <Input label="Annual Income" field="annual_income" type="number" placeholder="75000" />
        <Input label="Annual Expenses" field="annual_expenses" type="number" placeholder="60000" />
        <Input label="Current Savings/Investments" field="current_savings" type="number" placeholder="100000" />
        <Input label="Monthly Savings Rate" field="monthly_savings" type="number" placeholder="1000" />
        <Input label="Expected Investment Return (%)" field="investment_return" type="number" placeholder="7" />
        <Input label="Expected Inflation Rate (%)" field="inflation_rate" type="number" placeholder="3" />
      </div>
    </div>
  );

  // Step 2: Financial Goals
  const renderStep2 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Financial Goals</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Retirement Savings Goal" field="retirement_goal" type="number" placeholder="1500000" />
        <Input label="Emergency Fund Goal" field="emergency_fund_goal" type="number" placeholder="30000" />
        <Input label="Major Purchase Goal (Home, etc.)" field="major_purchase_goal" type="number" placeholder="400000" />
        <Input label="Major Purchase Timeline (Years)" field="major_purchase_timeline" type="number" placeholder="5" />
      </div>
      <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <h3 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2">💡 Goal Setting Tip</h3>
        <p className="text-sm text-indigo-700 dark:text-indigo-300">
          The retirement goal is often calculated as 25x your annual expenses (4% withdrawal rule). 
          Adjust based on your desired lifestyle and other income sources in retirement.
        </p>
      </div>
    </div>
  );

  // Step 3: Scenario Configuration
  const renderStep3 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Configure Scenarios</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Select and customize the scenarios you want to model. Each scenario represents a potential financial disruption.
      </p>
      
      <div className="space-y-4">
        {scenarios.map((scenario, index) => (
          <div key={index} className="border rounded-lg p-4 dark:border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={scenario.enabled}
                  onChange={e => updateScenario(index, 'enabled', e.target.checked)}
                  className="w-4 h-4"
                />
                <h3 className="font-semibold">{scenario.name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${
                  scenario.probability === 'High' ? 'bg-red-100 text-red-700' :
                  scenario.probability === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {scenario.probability} Probability
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{scenario.description}</p>
            
            {scenario.enabled && (
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="block font-medium mb-1">Income Change (%)</label>
                  <input
                    type="number"
                    value={scenario.financial_impact.income_change_percent}
                    onChange={e => updateScenarioImpact(index, 'income_change_percent', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1 border rounded focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
                    placeholder="-50"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Expense Change (%)</label>
                  <input
                    type="number"
                    value={scenario.financial_impact.expense_change_percent}
                    onChange={e => updateScenarioImpact(index, 'expense_change_percent', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1 border rounded focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">One-time Cost ($)</label>
                  <input
                    type="number"
                    value={scenario.financial_impact.one_time_cost}
                    onChange={e => updateScenarioImpact(index, 'one_time_cost', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1 border rounded focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
                    placeholder="25000"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Duration (Months)</label>
                  <input
                    type="number"
                    value={scenario.financial_impact.duration_months}
                    onChange={e => updateScenarioImpact(index, 'duration_months', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1 border rounded focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
                    placeholder="6"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Step 4: Results
  const renderResults = () => {
    if (!analysis) return null;
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Scenario Planning Analysis</h2>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4">
            <span className="text-3xl text-white">📊</span>
          </div>
        </div>
        
        {/* Monte Carlo Results */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Monte Carlo Simulation Results</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p><strong>Success Probability:</strong> {analysis.monte_carlo_results.success_probability.toFixed(1)}%</p>
              <p><strong>Median Outcome:</strong> {formatCurrency(analysis.monte_carlo_results.median_outcome)}</p>
            </div>
            <div>
              <p><strong>Worst 10%:</strong> {formatCurrency(analysis.monte_carlo_results.worst_10_percent)}</p>
              <p><strong>Best 10%:</strong> {formatCurrency(analysis.monte_carlo_results.best_10_percent)}</p>
            </div>
          </div>
        </div>

        {/* Scenario Impact Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Scenario Impact Analysis</h3>
          <div className="space-y-4">
            {analysis.scenario_summary.map((scenario, idx) => (
              <div key={idx} className="border-l-4 border-indigo-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold flex items-center gap-2">
                      {scenario.scenario_name}
                      <span className={`text-xs px-2 py-1 rounded ${
                        scenario.stress_level === 'Critical' ? 'bg-red-100 text-red-700' :
                        scenario.stress_level === 'High' ? 'bg-orange-100 text-orange-700' :
                        scenario.stress_level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {scenario.stress_level} Stress
                      </span>
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <p>Goal Achievement Probability: {scenario.goal_achievement_probability.toFixed(1)}%</p>
                      {scenario.retirement_impact_years > 0 && (
                        <p>Potential Retirement Delay: {scenario.retirement_impact_years} years</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`font-semibold ${
                      scenario.savings_impact_percent < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {scenario.savings_impact_percent > 0 ? '+' : ''}
                      {scenario.savings_impact_percent.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-600">Savings Impact</p>
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm font-medium">Mitigation Strategies:</p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {scenario.mitigation_strategies.slice(0, 2).map((strategy, sidx) => (
                      <li key={sidx} className="flex items-start gap-1">
                        <span>•</span>
                        <span>{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stress Test Results */}
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Stress Test Results</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {Object.entries(analysis.stress_test_results).map(([test, result]) => (
              <div key={test} className="bg-white dark:bg-gray-800 p-3 rounded">
                <h4 className="font-semibold capitalize mb-1">{test.replace('_', ' ')}</h4>
                <p><strong>Impact:</strong> {result.impact}</p>
                <p><strong>Recovery:</strong> {result.recovery_time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Emergency Fund & Insurance</h3>
            <p className="mb-3">
              <strong>Recommended Emergency Fund:</strong> {analysis.recommendations.emergency_fund_months} months of expenses
            </p>
            <ul className="space-y-1 text-sm">
              {analysis.recommendations.insurance_recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Investment Strategy</h3>
            <ul className="space-y-1 text-sm">
              {analysis.recommendations.investment_adjustments.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Income & Expense Optimization */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Income Diversification</h3>
            <ul className="space-y-1 text-sm">
              {analysis.recommendations.income_diversification.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Expense Optimization</h3>
            <ul className="space-y-1 text-sm">
              {analysis.recommendations.expense_optimization.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-gray-50 dark:bg-gray-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-indigo-600 mb-2">Most Critical Risk</h4>
              <p>{analysis.scenario_summary.find(s => s.stress_level === 'Critical')?.scenario_name || 
                  analysis.scenario_summary.find(s => s.stress_level === 'High')?.scenario_name || 
                  'Job Loss'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-600 mb-2">Success Probability</h4>
              <p className={analysis.monte_carlo_results.success_probability >= 80 ? 'text-green-600' : 
                           analysis.monte_carlo_results.success_probability >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                {analysis.monte_carlo_results.success_probability.toFixed(1)}% chance of meeting goals
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-600 mb-2">Priority Action</h4>
              <p>
                {analysis.recommendations.emergency_fund_months > 8 ? 'Build larger emergency fund' :
                 analysis.scenario_summary.some(s => s.stress_level === 'Critical') ? 'Reduce expense exposure' :
                 'Optimize investment allocation'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-4">
            <span className="text-2xl text-white">📊</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Scenario Planning Tool
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Model different financial scenarios and stress test your plans
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
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Next
              </button>
            )}
            {step === 3 && (
              <button
                onClick={handleAnalyze}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Analyzing...' : 'Run Scenario Analysis'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

interface InsuranceProfile {
  name: string;
  age: string;
  dependents: string;
  annual_income: string;
  spouse_income: string;
  total_assets: string;
  total_debts: string;
  mortgage_balance: string;
  financial_goals: string;
  
  // Current Insurance Coverage
  life_insurance_amount: string;
  life_insurance_type: 'term' | 'whole' | 'universal' | 'none';
  disability_insurance: 'yes' | 'no';
  disability_coverage_amount: string;
  health_insurance_type: 'employer' | 'individual' | 'marketplace' | 'none';
  health_deductible: string;
  auto_insurance: 'yes' | 'no';
  auto_coverage_limits: string;
  homeowners_renters: 'homeowners' | 'renters' | 'none';
  property_coverage_amount: string;
  umbrella_policy: 'yes' | 'no';
  umbrella_amount: string;
  
  // Risk Factors
  health_status: 'excellent' | 'good' | 'fair' | 'poor';
  occupation_risk: 'low' | 'moderate' | 'high';
  lifestyle_activities: string[];
  travel_frequency: 'minimal' | 'moderate' | 'frequent';
}

interface InsuranceCoverage {
  type: string;
  current_coverage: number;
  recommended_coverage: number;
  gap: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  estimated_annual_cost: number;
  reasoning: string;
}

interface InsuranceAnalysis {
  overall_coverage_score: number;
  coverage_level: string;
  total_coverage_gap: number;
  total_estimated_premiums: number;
  coverage_analysis: InsuranceCoverage[];
  life_insurance_analysis: {
    human_life_value: number;
    needs_analysis_amount: number;
    current_coverage: number;
    recommended_type: string;
    term_length_recommendation: string;
  };
  disability_analysis: {
    monthly_benefit_needed: number;
    current_coverage: number;
    coverage_gap: number;
    short_term_vs_long_term: string;
  };
  liability_analysis: {
    net_worth: number;
    recommended_umbrella: number;
    asset_protection_level: string;
  };
  recommendations: string[];
  action_plan: string[];
  cost_optimization_tips: string[];
}

interface Props {
  onBack: () => void;
}

export default function InsuranceAnalysisTool({ onBack }: Props) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<InsuranceProfile>({
    name: '',
    age: '',
    dependents: '0',
    annual_income: '',
    spouse_income: '',
    total_assets: '',
    total_debts: '',
    mortgage_balance: '',
    financial_goals: '',
    life_insurance_amount: '',
    life_insurance_type: 'none',
    disability_insurance: 'no',
    disability_coverage_amount: '',
    health_insurance_type: 'employer',
    health_deductible: '',
    auto_insurance: 'yes',
    auto_coverage_limits: '',
    homeowners_renters: 'none',
    property_coverage_amount: '',
    umbrella_policy: 'no',
    umbrella_amount: '',
    health_status: 'good',
    occupation_risk: 'moderate',
    lifestyle_activities: [],
    travel_frequency: 'moderate',
  });

  const [analysis, setAnalysis] = useState<InsuranceAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedCurrency } = useFinance();

  const handleInputChange = (field: keyof InsuranceProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const calculateLifeInsuranceNeed = () => {
    const income = parseInt(profile.annual_income) || 0;
    const spouseIncome = parseInt(profile.spouse_income) || 0;
    const totalIncome = income + spouseIncome;
    const debts = parseInt(profile.total_debts) || 0;
    const mortgage = parseInt(profile.mortgage_balance) || 0;
    const dependents = parseInt(profile.dependents) || 0;
    
    // Human Life Value method (10-15x annual income)
    const humanLifeValue = totalIncome * 12;
    
    // Needs analysis method
    const finalExpenses = 15000; // Funeral, legal costs
    const emergencyFund = totalIncome * 0.5; // 6 months expenses
    const educationFund = dependents * 150000; // College costs per child
    const incomeReplacement = totalIncome * 8; // 8 years of income
    const debtPayoff = debts + mortgage;
    
    const needsAnalysisAmount = finalExpenses + emergencyFund + educationFund + incomeReplacement + debtPayoff;
    
    return {
      humanLifeValue,
      needsAnalysisAmount: Math.max(humanLifeValue, needsAnalysisAmount),
    };
  };

  const calculateDisabilityNeed = () => {
    const income = parseInt(profile.annual_income) || 0;
    const monthlyIncome = income / 12;
    const recommendedCoverage = monthlyIncome * 0.7; // 70% of income
    
    return recommendedCoverage;
  };

  const generateLocalAnalysis = (): InsuranceAnalysis => {
    const income = parseInt(profile.annual_income) || 0;
    const spouseIncome = parseInt(profile.spouse_income) || 0;
    const totalIncome = income + spouseIncome;
    const assets = parseInt(profile.total_assets) || 0;
    const debts = parseInt(profile.total_debts) || 0;
    const netWorth = assets - debts;
    const dependents = parseInt(profile.dependents) || 0;
    
    const { humanLifeValue, needsAnalysisAmount } = calculateLifeInsuranceNeed();
    const disabilityBenefitNeeded = calculateDisabilityNeed();
    
    const currentLifeInsurance = parseInt(profile.life_insurance_amount) || 0;
    const currentDisabilityCoverage = parseInt(profile.disability_coverage_amount) || 0;
    const currentUmbrella = parseInt(profile.umbrella_amount) || 0;
    
    // Recommended coverage amounts
    const recommendedLife = needsAnalysisAmount;
    const recommendedDisability = disabilityBenefitNeeded * 12; // Annual
    const recommendedUmbrella = Math.max(1000000, netWorth); // At least $1M or net worth
    const recommendedAutoLiability = 500000; // $500K minimum
    
    const coverageAnalysis: InsuranceCoverage[] = [
      {
        type: 'Life Insurance',
        current_coverage: currentLifeInsurance,
        recommended_coverage: recommendedLife,
        gap: Math.max(0, recommendedLife - currentLifeInsurance),
        priority: dependents > 0 || debts > 100000 ? 'Critical' : 'High',
        estimated_annual_cost: (recommendedLife / 1000) * 2, // $2 per $1000 for term
        reasoning: dependents > 0 ? 'Essential for dependents\' financial security' : 'Important for debt coverage',
      },
      {
        type: 'Disability Insurance',
        current_coverage: currentDisabilityCoverage * 12,
        recommended_coverage: recommendedDisability,
        gap: Math.max(0, recommendedDisability - (currentDisabilityCoverage * 12)),
        priority: 'Critical',
        estimated_annual_cost: totalIncome * 0.02, // 2% of income
        reasoning: 'Most likely insurance claim during working years',
      },
      {
        type: 'Umbrella Policy',
        current_coverage: currentUmbrella,
        recommended_coverage: recommendedUmbrella,
        gap: Math.max(0, recommendedUmbrella - currentUmbrella),
        priority: netWorth > 500000 ? 'High' : 'Medium',
        estimated_annual_cost: (recommendedUmbrella / 1000000) * 200, // $200 per $1M
        reasoning: 'Protects assets from lawsuits and major claims',
      },
    ];

    const totalGap = coverageAnalysis.reduce((sum, coverage) => sum + coverage.gap, 0);
    const totalPremiums = coverageAnalysis.reduce((sum, coverage) => sum + coverage.estimated_annual_cost, 0);
    
    // Calculate coverage score
    let score = 100;
    coverageAnalysis.forEach(coverage => {
      const coverageRatio = coverage.current_coverage / coverage.recommended_coverage;
      if (coverageRatio < 0.5) score -= 25;
      else if (coverageRatio < 0.8) score -= 15;
      else if (coverageRatio < 1) score -= 5;
    });
    
    if (profile.health_insurance_type === 'none') score -= 30;
    if (profile.auto_insurance === 'no') score -= 20;
    
    const getCoverageLevel = (score: number) => {
      if (score >= 90) return 'Excellent - Comprehensive Coverage';
      if (score >= 70) return 'Good - Adequate Coverage';
      if (score >= 50) return 'Fair - Some Gaps Exist';
      return 'Poor - Significant Coverage Gaps';
    };

    return {
      overall_coverage_score: Math.max(0, score),
      coverage_level: getCoverageLevel(score),
      total_coverage_gap: totalGap,
      total_estimated_premiums: totalPremiums,
      coverage_analysis: coverageAnalysis,
      life_insurance_analysis: {
        human_life_value: humanLifeValue,
        needs_analysis_amount: needsAnalysisAmount,
        current_coverage: currentLifeInsurance,
        recommended_type: dependents > 0 ? 'Term Life (20-30 year)' : 'Term Life (10-20 year)',
        term_length_recommendation: dependents > 0 ? 'Until youngest child reaches 25' : 'Until retirement',
      },
      disability_analysis: {
        monthly_benefit_needed: disabilityBenefitNeeded,
        current_coverage: currentDisabilityCoverage,
        coverage_gap: Math.max(0, disabilityBenefitNeeded - currentDisabilityCoverage),
        short_term_vs_long_term: 'Both short-term (3-6 months) and long-term (until age 65) recommended',
      },
      liability_analysis: {
        net_worth: netWorth,
        recommended_umbrella: recommendedUmbrella,
        asset_protection_level: currentUmbrella >= recommendedUmbrella ? 'Adequate' : 'Insufficient',
      },
      recommendations: [
        currentLifeInsurance < recommendedLife ? `Increase life insurance by $${(recommendedLife - currentLifeInsurance).toLocaleString()}` : 'Life insurance coverage is adequate',
        profile.disability_insurance === 'no' ? 'Obtain disability insurance immediately' : 'Review disability coverage terms',
        netWorth > 500000 && currentUmbrella === 0 ? 'Consider umbrella liability policy' : 'Umbrella coverage appropriate for net worth',
        'Review all policies annually for coverage adequacy',
        'Bundle policies with same insurer for potential discounts',
      ],
      action_plan: [
        'Get quotes from 3-5 highly rated insurance companies',
        'Review employer-provided insurance benefits and options',
        'Calculate exact life insurance needs using online calculators',
        'Understand policy terms, exclusions, and renewal provisions',
        'Set annual reminder to review coverage amounts and beneficiaries',
      ],
      cost_optimization_tips: [
        'Bundle auto, home, and umbrella policies for discounts',
        'Increase deductibles to lower premiums (if financially feasible)',
        'Maintain good credit score for better insurance rates',
        'Consider working with independent agents for comparison shopping',
        'Review and remove unnecessary coverage riders',
        'Take advantage of employer group rates when available',
      ],
    };
  };

  const generateAIAnalysis = async () => {
    try {
      const response = await fetch('/api/analyze/insurance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      const data = await response.json();
      if (data.success && data.analysis) {
        return data.analysis as InsuranceAnalysis;
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
    setStep(5);
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
        className="bg-purple-500 h-2.5 rounded-full transition-all"
        style={{ width: `${((step - 1) / 4) * 100}%` }}
      />
    </div>
  );

  const Input = ({ label, field, type = 'text', placeholder = '' }: {
    label: string; field: keyof InsuranceProfile; type?: string; placeholder?: string;
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        value={profile[field] as string}
        onChange={e => handleInputChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
      />
    </div>
  );

  const Select = ({ label, field, options }: {
    label: string; field: keyof InsuranceProfile; options: { value: string; label: string }[];
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <select
        value={profile[field] as string}
        onChange={e => handleInputChange(field, e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  // Step 1: Personal & Financial Information
  const renderStep1 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Personal & Financial Information</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Name" field="name" placeholder="John Doe" />
        <Input label="Age" field="age" type="number" placeholder="35" />
        <Input label="Number of Dependents" field="dependents" type="number" placeholder="2" />
        <Input label="Annual Income" field="annual_income" type="number" placeholder="80000" />
        <Input label="Spouse Income" field="spouse_income" type="number" placeholder="60000" />
        <Input label="Total Assets" field="total_assets" type="number" placeholder="500000" />
        <Input label="Total Debts" field="total_debts" type="number" placeholder="200000" />
        <Input label="Mortgage Balance" field="mortgage_balance" type="number" placeholder="300000" />
      </div>
    </div>
  );

  // Step 2: Current Life & Disability Insurance
  const renderStep2 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Life & Disability Insurance</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Life Insurance Amount" field="life_insurance_amount" type="number" placeholder="250000" />
        <Select 
          label="Life Insurance Type" 
          field="life_insurance_type" 
          options={[
            { value: 'none', label: 'No Coverage' },
            { value: 'term', label: 'Term Life' },
            { value: 'whole', label: 'Whole Life' },
            { value: 'universal', label: 'Universal Life' },
          ]}
        />
        <Select 
          label="Disability Insurance" 
          field="disability_insurance" 
          options={[
            { value: 'no', label: 'No Coverage' },
            { value: 'yes', label: 'Have Coverage' },
          ]}
        />
        {profile.disability_insurance === 'yes' && (
          <Input label="Monthly Disability Benefit" field="disability_coverage_amount" type="number" placeholder="4000" />
        )}
      </div>
    </div>
  );

  // Step 3: Property & Liability Insurance
  const renderStep3 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Property & Liability Insurance</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Select 
          label="Health Insurance" 
          field="health_insurance_type" 
          options={[
            { value: 'employer', label: 'Employer-Sponsored' },
            { value: 'individual', label: 'Individual Policy' },
            { value: 'marketplace', label: 'Healthcare Marketplace' },
            { value: 'none', label: 'No Coverage' },
          ]}
        />
        <Input label="Health Insurance Deductible" field="health_deductible" type="number" placeholder="2500" />
        
        <Select 
          label="Auto Insurance" 
          field="auto_insurance" 
          options={[
            { value: 'yes', label: 'Have Auto Insurance' },
            { value: 'no', label: 'No Auto Insurance' },
          ]}
        />
        <Input label="Auto Liability Limits" field="auto_coverage_limits" placeholder="250/500/100" />
        
        <Select 
          label="Home/Renters Insurance" 
          field="homeowners_renters" 
          options={[
            { value: 'homeowners', label: 'Homeowners Insurance' },
            { value: 'renters', label: 'Renters Insurance' },
            { value: 'none', label: 'No Coverage' },
          ]}
        />
        <Input label="Property Coverage Amount" field="property_coverage_amount" type="number" placeholder="400000" />
        
        <Select 
          label="Umbrella Policy" 
          field="umbrella_policy" 
          options={[
            { value: 'no', label: 'No Umbrella Policy' },
            { value: 'yes', label: 'Have Umbrella Policy' },
          ]}
        />
        {profile.umbrella_policy === 'yes' && (
          <Input label="Umbrella Policy Amount" field="umbrella_amount" type="number" placeholder="1000000" />
        )}
      </div>
    </div>
  );

  // Step 4: Risk Assessment
  const renderStep4 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
      <div className="grid md:grid-cols-2 gap-4">
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
          label="Occupation Risk Level" 
          field="occupation_risk" 
          options={[
            { value: 'low', label: 'Low Risk (Office work)' },
            { value: 'moderate', label: 'Moderate Risk' },
            { value: 'high', label: 'High Risk (Manual labor, etc.)' },
          ]}
        />
        <Select 
          label="Travel Frequency" 
          field="travel_frequency" 
          options={[
            { value: 'minimal', label: 'Minimal (< 5 trips/year)' },
            { value: 'moderate', label: 'Moderate (5-15 trips/year)' },
            { value: 'frequent', label: 'Frequent (> 15 trips/year)' },
          ]}
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">High-Risk Activities</label>
          <div className="space-y-2">
            {['Motorcycling', 'Rock Climbing', 'Skiing', 'Scuba Diving', 'Aviation', 'Racing'].map(activity => (
              <label key={activity} className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.lifestyle_activities.includes(activity)}
                  onChange={e => {
                    const activities = e.target.checked 
                      ? [...profile.lifestyle_activities, activity]
                      : profile.lifestyle_activities.filter(a => a !== activity);
                    handleInputChange('lifestyle_activities', activities);
                  }}
                  className="mr-2"
                />
                {activity}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Step 5: Results
  const renderResults = () => {
    if (!analysis) return null;
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Insurance Analysis Results</h2>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
            <span className="text-3xl text-white">🛡️</span>
          </div>
        </div>
        
        {/* Coverage Score */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Overall Coverage Assessment</h3>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-purple-600">{analysis.overall_coverage_score}/100</div>
            <div>
              <p className="font-semibold">{analysis.coverage_level}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Coverage Gap: {formatCurrency(analysis.total_coverage_gap)}
              </p>
            </div>
          </div>
        </div>

        {/* Coverage Analysis */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Coverage Gap Analysis</h3>
          <div className="space-y-4">
            {analysis.coverage_analysis.map((coverage, idx) => (
              <div key={idx} className="border-l-4 border-purple-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold flex items-center gap-2">
                      {coverage.type}
                      <span className={`text-xs px-2 py-1 rounded ${
                        coverage.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                        coverage.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                        coverage.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {coverage.priority}
                      </span>
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{coverage.reasoning}</p>
                    <div className="text-xs text-gray-500">
                      Current: {formatCurrency(coverage.current_coverage)} | 
                      Recommended: {formatCurrency(coverage.recommended_coverage)}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-red-600">Gap: {formatCurrency(coverage.gap)}</p>
                    <p className="text-xs text-gray-600">~{formatCurrency(coverage.estimated_annual_cost)}/year</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Life Insurance Analysis</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Human Life Value:</span>
                <span>{formatCurrency(analysis.life_insurance_analysis.human_life_value)}</span>
              </div>
              <div className="flex justify-between">
                <span>Needs Analysis:</span>
                <span>{formatCurrency(analysis.life_insurance_analysis.needs_analysis_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Coverage:</span>
                <span>{formatCurrency(analysis.life_insurance_analysis.current_coverage)}</span>
              </div>
              <div className="mt-2 pt-2 border-t">
                <p><strong>Recommended:</strong> {analysis.life_insurance_analysis.recommended_type}</p>
                <p><strong>Term Length:</strong> {analysis.life_insurance_analysis.term_length_recommendation}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Disability Insurance Analysis</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Monthly Benefit Needed:</span>
                <span>{formatCurrency(analysis.disability_analysis.monthly_benefit_needed)}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Coverage:</span>
                <span>{formatCurrency(analysis.disability_analysis.current_coverage)}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Gap:</span>
                <span className="text-red-600">{formatCurrency(analysis.disability_analysis.coverage_gap)}</span>
              </div>
              <div className="mt-2 pt-2 border-t">
                <p><strong>Recommendation:</strong> {analysis.disability_analysis.short_term_vs_long_term}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Liability Analysis */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Liability & Asset Protection</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p><strong>Net Worth:</strong> {formatCurrency(analysis.liability_analysis.net_worth)}</p>
            </div>
            <div>
              <p><strong>Recommended Umbrella:</strong> {formatCurrency(analysis.liability_analysis.recommended_umbrella)}</p>
            </div>
            <div>
              <p><strong>Protection Level:</strong> 
                <span className={`ml-1 ${
                  analysis.liability_analysis.asset_protection_level === 'Adequate' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analysis.liability_analysis.asset_protection_level}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Cost Optimization</h3>
          <p className="mb-4">
            <strong>Estimated Annual Premiums:</strong> {formatCurrency(analysis.total_estimated_premiums)}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.cost_optimization_tips.slice(0, 4).map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">💡</span>
                <span className="text-sm">{tip}</span>
              </div>
            ))}
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
        <div className="bg-gray-50 dark:bg-gray-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Action Plan</h3>
          <ol className="space-y-2">
            {analysis.action_plan.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-gray-600 font-semibold mt-1">{idx + 1}.</span>
                <span>{action}</span>
              </li>
            ))}
          </ol>
        </div>

        <button
          onClick={onBack}
          className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mb-4">
            <span className="text-2xl text-white">🛡️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Insurance Analysis Tool
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Insurance needs analysis and coverage optimization
          </p>
        </div>

        {renderProgress()}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderResults()}

        {/* Navigation */}
        {step < 5 && (
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
            {step < 4 && (
              <button
                onClick={nextStep}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Next
              </button>
            )}
            {step === 4 && (
              <button
                onClick={handleAnalyze}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
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
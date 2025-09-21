import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

interface EstateProfile {
  name: string;
  age: string;
  spouse_name: string;
  spouse_age: string;
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
  children: string;
  total_assets: string;
  liquid_assets: string;
  real_estate_value: string;
  business_interests: string;
  retirement_accounts: string;
  life_insurance: string;
  annual_income: string;
  state_residence: string;
  
  // Current Estate Planning Status
  has_will: 'yes' | 'no' | 'outdated';
  will_last_updated: string;
  has_trust: 'yes' | 'no' | 'considering';
  trust_type: string;
  has_power_of_attorney: 'yes' | 'no';
  has_healthcare_directive: 'yes' | 'no';
  beneficiaries_updated: 'yes' | 'no' | 'unsure';
  
  // Goals and Concerns
  primary_goals: string[];
  charitable_interests: string;
  special_circumstances: string[];
  estate_tax_concerns: 'yes' | 'no' | 'unsure';
}

interface EstateRecommendation {
  category: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  recommendation: string;
  reasoning: string;
  estimated_cost: string;
  timeline: string;
  professional_needed: boolean;
}

interface EstateAnalysis {
  estate_size_category: string;
  federal_tax_exposure: number;
  state_tax_exposure: number;
  total_tax_liability: number;
  probate_concerns: string[];
  document_status: {
    will_status: string;
    trust_recommendation: string;
    power_of_attorney_status: string;
    healthcare_directive_status: string;
    beneficiary_status: string;
  };
  tax_strategies: {
    annual_gift_strategy: string;
    life_insurance_strategy: string;
    charitable_giving_strategy: string;
    business_succession_strategy: string;
  };
  recommendations: EstateRecommendation[];
  action_plan: string[];
  estimated_costs: {
    basic_documents: string;
    trust_setup: string;
    ongoing_maintenance: string;
    professional_fees: string;
  };
  timeline: {
    immediate: string[];
    six_months: string[];
    annual_review: string[];
  };
}

interface Props {
  onBack: () => void;
}

export default function EstatePlanningTool({ onBack }: Props) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<EstateProfile>({
    name: '',
    age: '',
    spouse_name: '',
    spouse_age: '',
    marital_status: 'single',
    children: '0',
    total_assets: '',
    liquid_assets: '',
    real_estate_value: '',
    business_interests: '',
    retirement_accounts: '',
    life_insurance: '',
    annual_income: '',
    state_residence: '',
    has_will: 'no',
    will_last_updated: '',
    has_trust: 'no',
    trust_type: '',
    has_power_of_attorney: 'no',
    has_healthcare_directive: 'no',
    beneficiaries_updated: 'no',
    primary_goals: [],
    charitable_interests: '',
    special_circumstances: [],
    estate_tax_concerns: 'unsure',
  });

  const [analysis, setAnalysis] = useState<EstateAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedCurrency } = useFinance();

  const handleInputChange = (field: keyof EstateProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
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
        className="bg-amber-500 h-2.5 rounded-full transition-all"
        style={{ width: `${((step - 1) / 4) * 100}%` }}
      />
    </div>
  );

  const calculateEstateTax = () => {
    const totalAssets = parseInt(profile.total_assets) || 0;
    const federalExemption = 13610000; // 2024 federal exemption
    const federalTaxableEstate = Math.max(0, totalAssets - federalExemption);
    const federalTax = federalTaxableEstate * 0.4; // 40% federal rate
    
    // Simplified state tax (varies by state)
    const stateTaxRate = profile.state_residence ? 0.05 : 0; // Assume 5% for taxable states
    const stateTax = totalAssets * stateTaxRate;
    
    return { federalTax, stateTax, totalTax: federalTax + stateTax };
  };

  const generateLocalAnalysis = (): EstateAnalysis => {
    const totalAssets = parseInt(profile.total_assets) || 0;
    const { federalTax, stateTax, totalTax } = calculateEstateTax();
    
    const getEstateSizeCategory = (assets: number) => {
      if (assets < 100000) return 'Small Estate (under $100K)';
      if (assets < 1000000) return 'Medium Estate ($100K - $1M)';
      if (assets < 5000000) return 'Large Estate ($1M - $5M)';
      if (assets < 13610000) return 'High-Value Estate ($5M - $13.6M)';
      return 'Taxable Estate (over $13.6M)';
    };

    const recommendations: EstateRecommendation[] = [
      {
        category: 'Will',
        priority: profile.has_will === 'no' ? 'Critical' : profile.has_will === 'outdated' ? 'High' : 'Low',
        recommendation: profile.has_will === 'no' ? 'Create a comprehensive will immediately' : 'Update existing will',
        reasoning: 'A will ensures your assets are distributed according to your wishes',
        estimated_cost: '$500 - $2,000',
        timeline: '2-4 weeks',
        professional_needed: true,
      },
      {
        category: 'Trust',
        priority: totalAssets > 1000000 && profile.has_trust === 'no' ? 'High' : 'Medium',
        recommendation: totalAssets > 1000000 ? 'Consider establishing a revocable living trust' : 'Evaluate trust benefits',
        reasoning: 'Trusts can avoid probate and provide privacy',
        estimated_cost: '$2,000 - $5,000',
        timeline: '4-8 weeks',
        professional_needed: true,
      },
      {
        category: 'Power of Attorney',
        priority: profile.has_power_of_attorney === 'no' ? 'Critical' : 'Low',
        recommendation: 'Establish durable power of attorney for finances',
        reasoning: 'Ensures someone can manage your finances if incapacitated',
        estimated_cost: '$200 - $500',
        timeline: '1-2 weeks',
        professional_needed: true,
      },
      {
        category: 'Healthcare Directive',
        priority: profile.has_healthcare_directive === 'no' ? 'Critical' : 'Low',
        recommendation: 'Create advance healthcare directive and living will',
        reasoning: 'Specifies medical care preferences and healthcare proxy',
        estimated_cost: '$200 - $500',
        timeline: '1-2 weeks',
        professional_needed: true,
      },
    ];

    return {
      estate_size_category: getEstateSizeCategory(totalAssets),
      federal_tax_exposure: federalTax,
      state_tax_exposure: stateTax,
      total_tax_liability: totalTax,
      probate_concerns: totalAssets > 500000 ? ['High probate costs', 'Public records', 'Delays in distribution'] : ['Minimal probate concerns'],
      document_status: {
        will_status: profile.has_will === 'no' ? 'Missing - Critical' : profile.has_will === 'outdated' ? 'Needs Update' : 'Current',
        trust_recommendation: totalAssets > 1000000 ? 'Strongly Recommended' : 'Consider Benefits',
        power_of_attorney_status: profile.has_power_of_attorney === 'no' ? 'Missing - Critical' : 'Complete',
        healthcare_directive_status: profile.has_healthcare_directive === 'no' ? 'Missing - Critical' : 'Complete',
        beneficiary_status: profile.beneficiaries_updated === 'no' ? 'Needs Update' : 'Current',
      },
      tax_strategies: {
        annual_gift_strategy: totalAssets > 1000000 ? 'Utilize $18,000 annual gift exclusion per recipient' : 'Annual gifting not critical',
        life_insurance_strategy: totalTax > 0 ? 'Consider life insurance trust for liquidity' : 'Current coverage adequate',
        charitable_giving_strategy: profile.charitable_interests ? 'Explore charitable remainder trusts' : 'Not applicable',
        business_succession_strategy: parseInt(profile.business_interests) > 0 ? 'Develop business succession plan' : 'Not applicable',
      },
      recommendations: recommendations.filter(r => r.priority !== 'Low'),
      action_plan: [
        'Schedule consultation with estate planning attorney',
        'Gather all financial documents and asset information',
        'Review and update all beneficiary designations',
        'Discuss goals and concerns with family members',
        'Implement priority recommendations first',
      ],
      estimated_costs: {
        basic_documents: '$1,000 - $3,000',
        trust_setup: '$2,000 - $5,000',
        ongoing_maintenance: '$500 - $1,000 annually',
        professional_fees: '$300 - $500 per hour',
      },
      timeline: {
        immediate: ['Schedule attorney consultation', 'Gather financial documents'],
        six_months: ['Complete all critical documents', 'Update beneficiaries'],
        annual_review: ['Review and update documents', 'Reassess strategies'],
      },
    };
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    // Simulate analysis time
    setTimeout(() => {
      const result = generateLocalAnalysis();
      setAnalysis(result);
      setIsLoading(false);
      setStep(5);
    }, 2000);
  };

  const Input = ({ label, field, type = 'text', placeholder = '' }: {
    label: string; field: keyof EstateProfile; type?: string; placeholder?: string;
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        value={profile[field] as string}
        onChange={e => handleInputChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
      />
    </div>
  );

  const Select = ({ label, field, options }: {
    label: string; field: keyof EstateProfile; options: { value: string; label: string }[];
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <select
        value={profile[field] as string}
        onChange={e => handleInputChange(field, e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  // Step 1: Personal Information
  const renderStep1 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Personal & Family Information</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Full Name" field="name" placeholder="John Doe" />
        <Input label="Age" field="age" type="number" placeholder="45" />
        <Select 
          label="Marital Status" 
          field="marital_status" 
          options={[
            { value: 'single', label: 'Single' },
            { value: 'married', label: 'Married' },
            { value: 'divorced', label: 'Divorced' },
            { value: 'widowed', label: 'Widowed' },
          ]}
        />
        {profile.marital_status === 'married' && (
          <>
            <Input label="Spouse Name" field="spouse_name" placeholder="Jane Doe" />
            <Input label="Spouse Age" field="spouse_age" type="number" placeholder="42" />
          </>
        )}
        <Input label="Number of Children" field="children" type="number" placeholder="2" />
        <Input label="State of Residence" field="state_residence" placeholder="California" />
      </div>
    </div>
  );

  // Step 2: Assets & Financial Information
  const renderStep2 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Assets & Financial Information</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Total Assets Value" field="total_assets" type="number" placeholder="1500000" />
        <Input label="Liquid Assets (Cash, Savings)" field="liquid_assets" type="number" placeholder="250000" />
        <Input label="Real Estate Value" field="real_estate_value" type="number" placeholder="800000" />
        <Input label="Business Interests Value" field="business_interests" type="number" placeholder="300000" />
        <Input label="Retirement Accounts (401k, IRA)" field="retirement_accounts" type="number" placeholder="400000" />
        <Input label="Life Insurance Death Benefit" field="life_insurance" type="number" placeholder="500000" />
        <Input label="Annual Income" field="annual_income" type="number" placeholder="150000" />
      </div>
      <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
        <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">💡 Asset Valuation Tip</h3>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Use current fair market values for all assets. For complex assets like businesses, 
          consider getting professional appraisals for accurate estate planning.
        </p>
      </div>
    </div>
  );

  // Step 3: Current Estate Planning Status
  const renderStep3 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Current Estate Planning Status</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Select 
          label="Do you have a will?" 
          field="has_will" 
          options={[
            { value: 'no', label: 'No' },
            { value: 'yes', label: 'Yes, current' },
            { value: 'outdated', label: 'Yes, but outdated' },
          ]}
        />
        {profile.has_will !== 'no' && (
          <Input label="Will last updated (year)" field="will_last_updated" placeholder="2020" />
        )}
        
        <Select 
          label="Do you have a trust?" 
          field="has_trust" 
          options={[
            { value: 'no', label: 'No' },
            { value: 'yes', label: 'Yes' },
            { value: 'considering', label: 'Considering' },
          ]}
        />
        {profile.has_trust === 'yes' && (
          <Input label="Trust type" field="trust_type" placeholder="Revocable Living Trust" />
        )}
        
        <Select 
          label="Power of Attorney?" 
          field="has_power_of_attorney" 
          options={[
            { value: 'no', label: 'No' },
            { value: 'yes', label: 'Yes' },
          ]}
        />
        
        <Select 
          label="Healthcare Directive?" 
          field="has_healthcare_directive" 
          options={[
            { value: 'no', label: 'No' },
            { value: 'yes', label: 'Yes' },
          ]}
        />
        
        <Select 
          label="Beneficiaries Updated?" 
          field="beneficiaries_updated" 
          options={[
            { value: 'no', label: 'No' },
            { value: 'yes', label: 'Yes' },
            { value: 'unsure', label: 'Unsure' },
          ]}
        />
      </div>
    </div>
  );

  // Step 4: Goals and Special Circumstances
  const renderStep4 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Goals and Special Circumstances</h2>
      <div className="grid md:grid-cols-1 gap-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Estate Planning Goals</label>
          <div className="space-y-2">
            {[
              'Minimize estate taxes',
              'Avoid probate',
              'Provide for family',
              'Charitable giving',
              'Business succession',
              'Asset protection',
              'Privacy protection'
            ].map(goal => (
              <label key={goal} className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.primary_goals.includes(goal)}
                  onChange={e => {
                    const goals = e.target.checked 
                      ? [...profile.primary_goals, goal]
                      : profile.primary_goals.filter(g => g !== goal);
                    handleInputChange('primary_goals', goals);
                  }}
                  className="mr-2"
                />
                {goal}
              </label>
            ))}
          </div>
        </div>
        
        <Input label="Charitable interests" field="charitable_interests" placeholder="Education, healthcare, etc." />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Special Circumstances</label>
          <div className="space-y-2">
            {[
              'Special needs family member',
              'Blended family',
              'International assets',
              'Family business',
              'Significant debt',
              'Previous marriage'
            ].map(circumstance => (
              <label key={circumstance} className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.special_circumstances.includes(circumstance)}
                  onChange={e => {
                    const circumstances = e.target.checked 
                      ? [...profile.special_circumstances, circumstance]
                      : profile.special_circumstances.filter(c => c !== circumstance);
                    handleInputChange('special_circumstances', circumstances);
                  }}
                  className="mr-2"
                />
                {circumstance}
              </label>
            ))}
          </div>
        </div>
        
        <Select 
          label="Concerned about estate taxes?" 
          field="estate_tax_concerns" 
          options={[
            { value: 'unsure', label: 'Unsure' },
            { value: 'yes', label: 'Yes, very concerned' },
            { value: 'no', label: 'No, not concerned' },
          ]}
        />
      </div>
    </div>
  );

  // Step 5: Results
  const renderResults = () => {
    if (!analysis) return null;
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Estate Planning Analysis</h2>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-4">
            <span className="text-3xl text-white">🏛️</span>
          </div>
        </div>
        
        {/* Estate Overview */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Estate Overview</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p><strong>Estate Size:</strong> {analysis.estate_size_category}</p>
              <p><strong>Total Assets:</strong> {formatCurrency(parseInt(profile.total_assets) || 0)}</p>
            </div>
            <div>
              <p><strong>Federal Tax Exposure:</strong> {formatCurrency(analysis.federal_tax_exposure)}</p>
              <p><strong>Total Tax Liability:</strong> {formatCurrency(analysis.total_tax_liability)}</p>
            </div>
          </div>
        </div>

        {/* Document Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Document Status</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(analysis.document_status).map(([key, status]) => (
              <div key={key} className="flex justify-between items-center p-3 border rounded">
                <span className="capitalize">{key.replace('_', ' ')}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  status.includes('Missing') || status.includes('Needs') ? 'bg-red-100 text-red-700' :
                  status.includes('Current') || status.includes('Complete') ? 'bg-green-100 text-green-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Recommendations */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Priority Recommendations</h3>
          <div className="space-y-4">
            {analysis.recommendations.map((rec, idx) => (
              <div key={idx} className="border-l-4 border-amber-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold flex items-center gap-2">
                      {rec.category}
                      <span className={`text-xs px-2 py-1 rounded ${
                        rec.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                        rec.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                        rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {rec.priority}
                      </span>
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{rec.recommendation}</p>
                    <p className="text-xs text-gray-500">{rec.reasoning}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold">{rec.estimated_cost}</p>
                    <p className="text-xs text-gray-600">{rec.timeline}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tax Strategies */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Tax Strategies</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {Object.entries(analysis.tax_strategies).map(([strategy, description]) => (
              <div key={strategy}>
                <h4 className="font-semibold capitalize mb-1">{strategy.replace('_', ' ')}</h4>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Estimates */}
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Estimated Costs</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(analysis.estimated_costs).map(([item, cost]) => (
              <div key={item} className="flex justify-between">
                <span className="capitalize">{item.replace('_', ' ')}</span>
                <span className="font-semibold">{cost}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Implementation Timeline</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            {Object.entries(analysis.timeline).map(([timeframe, actions]) => (
              <div key={timeframe}>
                <h4 className="font-semibold capitalize mb-2">{timeframe.replace('_', ' ')}</h4>
                <ul className="space-y-1">
                  {actions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Action Plan */}
        <div className="bg-gray-50 dark:bg-gray-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
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
          className="w-full py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl mb-4">
            <span className="text-2xl text-white">🏛️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Estate Planning Tool
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Estate and legacy planning strategies
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
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
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
import { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import PersonalInfoForm from '../components/PersonalInfoForm';
import { InvestmentProfile, InvestmentAnalysis } from '../types';

// Currency-specific default values (rough equivalents)
const DEFAULT_VALUES = {
  USD: { income: 70000, target: 500000, current: 25000, monthly: 600 },
  BDT: { income: 7000000, target: 50000000, current: 2500000, monthly: 60000 },
  INR: { income: 5000000, target: 35000000, current: 1800000, monthly: 45000 },
  PKR: { income: 10000000, target: 70000000, current: 3500000, monthly: 90000 },
  // Add more currencies as needed
};

/***********************
 *  Data Interfaces    *
 ***********************/
interface InvestmentProfile {
  // Personal Info
  name: string;
  age: string;
  income: string;

  // Investment Goals
  investment_goal: string;
  time_horizon: string; // years
  target_amount: string;
  current_investments: string; // current portfolio value
  monthly_investment: string;

  // Risk Assessment
  risk_tolerance: string; // Low, Medium, High
  market_crash_reaction: string; // Sell, Hold, Buy
  investment_knowledge: string; // Beginner, Intermediate, Expert
  loss_comfort: string; // % loss comfort

  // Portfolio Preferences
  preferred_assets: string[]; // e.g., ["Stocks", "Bonds", "Real Estate"]
  esg_preference: string; // Yes / No / Indifferent
  international_exposure: string; // None, Some, Significant
  sector_preferences: string[]; // e.g., Technology, Healthcare
}

interface InvestmentAnalysis {
  risk_score: number;
  risk_profile: 'Conservative' | 'Moderate' | 'Aggressive';
  asset_allocation: {
    stocks: number;
    bonds: number;
    alternatives: number;
    cash: number;
  };
  recommended_portfolio: {
    domestic_stocks: number;
    international_stocks: number;
    bonds: number;
    reits: number;
    commodities: number;
  };
  projected_returns: {
    conservative: number;
    moderate: number;
    optimistic: number;
  };
  action_plan: string[];
}

interface Props {
  onBack: () => void;
}

/***********************
 *    Main Component   *
 ***********************/
export default function InvestmentPlanningTool({ onBack }: Props) {
  const { selectedCurrency } = useFinance();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize profile with empty strings to avoid undefined values
  const [profile, setProfile] = useState<InvestmentProfile>({
    name: '',
    age: '',
    income: '',
    investment_goal: '',
    time_horizon: '',
    target_amount: '',
    current_investments: '',
    monthly_investment: '',
    risk_tolerance: '5', // Default to medium risk
    loss_comfort: '15', // Default to moderate loss comfort
    investment_knowledge: 'Intermediate',
    preferred_assets: ['stocks', 'bonds'],
    esg_preference: 'Moderate',
    international_exposure: 'Medium'
  });

  const [analysis, setAnalysis] = useState<InvestmentAnalysis | null>(null);

  // Get default values based on currency
  const defaultValues = useMemo(() => {
    return DEFAULT_VALUES[selectedCurrency.code as keyof typeof DEFAULT_VALUES] || DEFAULT_VALUES.USD;
  }, [selectedCurrency.code]);

  // Format number based on locale and currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format number with thousands separator
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  /***********************
   *    Helpers          *
   ***********************/
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log('Input changed:', name, value);
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const validateProfile = () => {
    const requiredFields = ['name', 'age', 'income', 'investment_goal', 'time_horizon', 'target_amount'];
    const missingFields = requiredFields.filter(field => !profile[field as keyof InvestmentProfile]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    setError(null);
    return true;
  };

  const generateAIAnalysis = async () => {
    try {
      console.log('Making API request with profile:', profile);
      const response = await fetch('/api/analyze/investment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile }),
      });

      const data = await response.json();
      console.log('API response:', data);

      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.status}`);
      }

      if (!data.success || !data.analysis) {
        throw new Error('Analysis failed: ' + (data.error || 'No analysis returned'));
      }

      return data.analysis as InvestmentAnalysis;
    } catch (error) {
      console.error('Error in generateAIAnalysis:', error);
      throw error;
    }
  };

  const generateLocalAnalysis = (): InvestmentAnalysis => {
    return {
      risk_assessment: "Based on your profile, you have a balanced risk tolerance.",
      portfolio_allocation: {
        stocks: 60,
        bonds: 30,
        cash: 8,
        other: 2
      },
      recommendations: [
        "Consider a mix of low-cost index funds",
        "Maintain emergency fund",
        "Regular portfolio rebalancing"
      ],
      action_items: [
        "Open a brokerage account",
        "Set up automatic monthly investments",
        "Review and rebalance quarterly"
      ]
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form from submitting normally
    setError(null);
    
    if (!validateProfile()) {
      return;
    }

    console.log('Starting analysis with profile:', profile);
    setIsLoading(true);
    
    try {
      let analysis;
      try {
        analysis = await generateAIAnalysis();
        console.log('AI analysis successful:', analysis);
      } catch (error) {
        console.warn('AI analysis failed, falling back to local:', error);
        analysis = generateLocalAnalysis();
      }
      setAnalysis(analysis);
      setStep(2);
    } catch (error: any) {
      console.error('Analysis completely failed:', error);
      setError(error?.message || 'Failed to analyze investment profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /***********************
   *   Render Helpers    *
   ***********************/
  const renderProgress = () => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 dark:bg-gray-700">
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all"
        style={{ width: `${(step - 1) * 33.33}%` }}
      />
    </div>
  );

  const Input = ({ label, field, type = 'text', placeholder = '' }: { label: string; field: keyof InvestmentProfile; type?: string; placeholder?: string; }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        value={profile[field] as string}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
      />
    </div>
  );

  /***********************
   *    Step 1 – Goals   *
   ***********************/
  const renderStep1 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Personal & Goal Information</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <PersonalInfoForm profile={profile} onChange={handleInputChange} />
        
        {/* Helper text for currency */}
        <p className="text-sm text-gray-500 mt-2">
          All monetary values are in {selectedCurrency.code}
        </p>

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed ${
              isLoading ? 'opacity-50' : ''
            }`}
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin mr-2">⚡</span>
                Analyzing...
              </>
            ) : (
              'Analyze Profile'
            )}
          </button>
        </div>

        {isLoading && (
          <div className="text-center mt-4">
            <p className="text-gray-600">
              Analyzing your investment profile...
            </p>
            <div className="mt-2 text-sm text-gray-500">
              This may take a few moments
            </div>
          </div>
        )}
      </form>
    </div>
  );

  /***********************
   *    Step 2 – Risk    *
   ***********************/
  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Risk Assessment</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Risk Tolerance (1-10) *</label>
          <input
            type="number"
            min="1"
            max="10"
            value={profile.risk_tolerance}
            onChange={(e) => handleInputChange(e)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            required
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Risk Tolerance Scale<br />
            1-3: Conservative (Low risk, stable returns)<br />
            4-7: Moderate (Balanced risk and returns)<br />
            8-10: Aggressive (High risk, potential high returns)
          </p>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={prevStep}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              'Submit'
            )}
          </button>
        </div>

        {isLoading && (
          <div className="mt-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Analyzing your investment profile...<br />
              <span className="text-sm">This may take a few moments</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );

  /*****************************
   * Step 3 – Preferences      *
   *****************************/
  const renderStep3 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Portfolio Preferences</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Assets (multi-select)</label>
        <div className="flex flex-wrap gap-2">
          {['Stocks', 'Bonds', 'Real Estate', 'Commodities', 'Crypto'].map(asset => (
            <button
              key={asset}
              onClick={() => {
                const arr = profile.preferred_assets.includes(asset)
                  ? profile.preferred_assets.filter(a => a !== asset)
                  : [...profile.preferred_assets, asset];
                handleInputChange({ target: { name: 'preferred_assets', value: arr } });
              }}
              className={`px-3 py-1 rounded-full border ${profile.preferred_assets.includes(asset) ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-white'}`}
            >
              {asset}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ESG Preference</label>
        <select
          value={profile.esg_preference}
          onChange={(e) => handleInputChange(e)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option>Yes</option>
          <option>No</option>
          <option>Indifferent</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">International Exposure</label>
        <select
          value={profile.international_exposure}
          onChange={(e) => handleInputChange(e)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option>None</option>
          <option>Some</option>
          <option>Significant</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sector Preferences (comma separated)</label>
        <input
          type="text"
          value={profile.sector_preferences.join(', ')}
          onChange={(e) => handleInputChange({ target: { name: 'sector_preferences', value: e.target.value.split(',').map(s => s.trim()) } })}
          placeholder="Technology, Healthcare, Energy"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
      </div>
    </div>
  );

  /***********************
   *   Step 4 – Results  *
   ***********************/
  const renderResults = () => {
    if (!analysis) return null;
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Investment Analysis Results</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 dark:bg-gray-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Risk Profile</h3>
            <p className="text-4xl font-bold mb-2">{analysis.risk_assessment}</p>
          </div>
          <div className="bg-green-50 dark:bg-gray-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Recommended Portfolio Allocation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>Stocks: {analysis.portfolio_allocation.stocks}%</div>
              <div>Bonds: {analysis.portfolio_allocation.bonds}%</div>
              <div>Cash: {analysis.portfolio_allocation.cash}%</div>
              <div>Other: {analysis.portfolio_allocation.other}%</div>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-gray-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
          <ul className="list-disc pl-5 space-y-1">
            {analysis.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Next Steps</h3>
          <ul className="list-disc pl-5 space-y-1">
            {analysis.action_items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Investment Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Investment:</p>
              <p className="text-lg font-semibold">{formatCurrency(Number(profile.monthly_investment))}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Target Amount:</p>
              <p className="text-lg font-semibold">{formatCurrency(Number(profile.target_amount))}</p>
            </div>
          </div>
        </div>
        <button
          onClick={onBack}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Finance Hub
        </button>
      </div>
    );
  };

  /***********************
   *    Main Render      *
   ***********************/
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        {renderProgress()}

        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderResults()}

        {/* Navigation Buttons */}
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            )}
            {step === 3 && (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Analyzing…' : 'Generate Analysis'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
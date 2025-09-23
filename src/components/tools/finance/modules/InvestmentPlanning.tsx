import { useState, useRef } from 'react';
import { BaseModuleLayout } from '../components/BaseModule';
import { FormField } from '../components/FormField';
import { BaseModuleProps, InvestmentProfile } from '../types';
import { useFinance } from '../context/FinanceContext';
import { PersonalInfoForm } from '../components/PersonalInfoForm';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const initialFormData: InvestmentProfile = {
  name: '',
  age: '',
  income: '',
  investment_goal: '',
  time_horizon: '',
  target_amount: '',
  current_investments: '',
  monthly_investment: '',
  risk_tolerance: '5',
  investment_knowledge: 'Beginner',
  loss_comfort: '10'
};

interface InvestmentAnalysis {
  executiveSummary: string;
  portfolioAllocation: Array<{
    asset: string;
    percentage: number;
    rationale: string;
  }>;
  topPicks: {
    stocks: Array<{
      name: string;
      ticker: string;
      allocation: string;
      expectedReturn: string;
      timeframe: string;
      rationale: string;
    }>;
    funds: Array<{
      name: string;
      type: string;
      allocation: string;
      expectedReturn: string;
      timeframe: string;
      rationale: string;
    }>;
    fixedIncome: Array<{
      name: string;
      type: string;
      allocation: string;
      expectedReturn: string;
      timeframe: string;
      rationale: string;
    }>;
  };
  monthlyPlan: {
    totalMonthly: string;
    allocations: Array<{
      investment: string;
      amount: string;
      percentage: string;
    }>;
  };
  actionSteps: string[];
  riskManagement: {
    risks: string[];
    mitigation: string[];
  };
  monitoring: {
    reviewFrequency: string;
    kpis: string[];
    rebalancing: string;
  };
  expectationRealism: string;
  achievabilityPercent: number;
}

const countries = [
  // North America
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  
  // Europe
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'IE', name: 'Ireland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GR', name: 'Greece' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'HU', name: 'Hungary' },
  { code: 'RO', name: 'Romania' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LV', name: 'Latvia' },
  { code: 'EE', name: 'Estonia' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'CY', name: 'Cyprus' },
  
  // Asia
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'SG', name: 'Singapore' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TH', name: 'Thailand' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'LA', name: 'Laos' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'NP', name: 'Nepal' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'MV', name: 'Maldives' },
  { code: 'BN', name: 'Brunei' },
  { code: 'TL', name: 'East Timor' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'AF', name: 'Afghanistan' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'QA', name: 'Qatar' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'OM', name: 'Oman' },
  { code: 'JO', name: 'Jordan' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'SY', name: 'Syria' },
  { code: 'IL', name: 'Israel' },
  { code: 'PS', name: 'Palestine' },
  { code: 'YE', name: 'Yemen' },
  { code: 'TR', name: 'Turkey' },
  { code: 'GE', name: 'Georgia' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AZ', name: 'Azerbaijan' },
  
  // Oceania
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'NC', name: 'New Caledonia' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'TO', name: 'Tonga' },
  { code: 'WS', name: 'Samoa' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'NR', name: 'Nauru' },
  { code: 'PW', name: 'Palau' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'FM', name: 'Micronesia' },
  
  // South America
  { code: 'BR', name: 'Brazil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'GY', name: 'Guyana' },
  { code: 'SR', name: 'Suriname' },
  { code: 'FK', name: 'Falkland Islands' },
  { code: 'GF', name: 'French Guiana' },
  
  // Africa
  { code: 'ZA', name: 'South Africa' },
  { code: 'EG', name: 'Egypt' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'UG', name: 'Uganda' },
  { code: 'GH', name: 'Ghana' },
  { code: 'CI', name: 'Ivory Coast' },
  { code: 'SN', name: 'Senegal' },
  { code: 'ML', name: 'Mali' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'NE', name: 'Niger' },
  { code: 'TD', name: 'Chad' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'CG', name: 'Republic of the Congo' },
  { code: 'CD', name: 'Democratic Republic of the Congo' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ST', name: 'São Tomé and Príncipe' },
  { code: 'AO', name: 'Angola' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
  { code: 'BW', name: 'Botswana' },
  { code: 'NA', name: 'Namibia' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'KM', name: 'Comoros' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'LY', name: 'Libya' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'MA', name: 'Morocco' },
  { code: 'EH', name: 'Western Sahara' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GN', name: 'Guinea' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'LR', name: 'Liberia' },
  { code: 'TG', name: 'Togo' },
  { code: 'BJ', name: 'Benin' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'BI', name: 'Burundi' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'CV', name: 'Cape Verde' },
  { code: 'SH', name: 'Saint Helena' },
  { code: 'RE', name: 'Réunion' },
  { code: 'YT', name: 'Mayotte' },
  
  // Caribbean
  { code: 'CU', name: 'Cuba' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'HT', name: 'Haiti' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'BB', name: 'Barbados' },
  { code: 'GD', name: 'Grenada' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'DM', name: 'Dominica' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'TC', name: 'Turks and Caicos Islands' },
  { code: 'KY', name: 'Cayman Islands' },
  { code: 'BM', name: 'Bermuda' },
  { code: 'AW', name: 'Aruba' },
  { code: 'CW', name: 'Curaçao' },
  { code: 'SX', name: 'Sint Maarten' },
  { code: 'BQ', name: 'Caribbean Netherlands' },
  { code: 'AI', name: 'Anguilla' },
  { code: 'VG', name: 'British Virgin Islands' },
  { code: 'VI', name: 'U.S. Virgin Islands' },
  { code: 'GP', name: 'Guadeloupe' },
  { code: 'MQ', name: 'Martinique' },
  { code: 'BL', name: 'Saint Barthélemy' },
  { code: 'MF', name: 'Saint Martin' },
  { code: 'AN', name: 'Netherlands Antilles' },
  
  // Central America
  { code: 'GT', name: 'Guatemala' },
  { code: 'BZ', name: 'Belize' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'HN', name: 'Honduras' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'PA', name: 'Panama' },
  
  // Other Territories
  { code: 'GL', name: 'Greenland' },
  { code: 'IS', name: 'Iceland' },
  { code: 'FO', name: 'Faroe Islands' },
  { code: 'GI', name: 'Gibraltar' },
  { code: 'AD', name: 'Andorra' },
  { code: 'MC', name: 'Monaco' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'SM', name: 'San Marino' },
  { code: 'VA', name: 'Vatican City' },
  { code: 'AL', name: 'Albania' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'RS', name: 'Serbia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'XK', name: 'Kosovo' },
  { code: 'MD', name: 'Moldova' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'BY', name: 'Belarus' },
  { code: 'RU', name: 'Russia' }
];

export default function InvestmentPlanning({ onBack }: BaseModuleProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<InvestmentProfile>(initialFormData);
  const [analysis, setAnalysis] = useState<InvestmentAnalysis | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [retryCount, setRetryCount] = useState(0);
  const { selectedCurrency, isLoading, setIsLoading } = useFinance();
  const analysisRef = useRef<HTMLDivElement>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate country selection
    if (!selectedCountry) {
      alert('Please select your country of residence before generating the analysis.');
      return;
    }
    
    setIsLoading(true);
    setRetryCount(0);
    
    try {
      const response = await fetch('/api/analyze/investment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          selectedCurrency,
          country: countries.find(c => c.code === selectedCountry)?.name || 'United States'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze investment profile');
      }

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        // Track successful investment analysis generation
        try {
          await fetch('/api/tools/finance-advisor/track-usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usageType: 'generate' })
          });
        } catch (error) {
          console.error('Failed to track usage:', error);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Provide user-friendly error messages based on the error type
      let errorMessage = 'Failed to analyze investment profile. Please try again.';
      let shouldRetry = false;
      
      if (error instanceof Error) {
        if (error.message.includes('503') || error.message.includes('overloaded')) {
          errorMessage = 'The AI service is currently busy. Please wait a moment and try again.';
          shouldRetry = retryCount < 2; // Allow up to 2 retries for overloaded service
        } else if (error.message.includes('429')) {
          errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
          shouldRetry = retryCount < 1; // Allow 1 retry for network errors
        }
      }
      
      if (shouldRetry) {
        setRetryCount(prev => prev + 1);
        // Wait 2 seconds before retrying
        setTimeout(() => {
          handleSubmit(e);
        }, 2000);
        return;
      }
      
      // Show error message to user
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    // Validate country selection in step 2
    if (currentStep === 2 && !selectedCountry) {
      alert('Please select your country of residence before proceeding.');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      onBack();
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const downloadAsImage = async () => {
    if (!analysisRef.current) {
      alert('Analysis section not found.');
      return;
    }
    try {
      const node = analysisRef.current;
      node.classList.add('html2canvas-bw');
      const canvas = await html2canvas(node, { useCORS: true, scale: 2, backgroundColor: '#fff' });
      node.classList.remove('html2canvas-bw');
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'investment-analysis.png';
      link.click();
    } catch (err) {
      console.error(err);
      alert('Failed to download image. Please try again.');
    }
  };

  const downloadAsPDF = async () => {
    if (!analysisRef.current) {
      alert('Analysis section not found.');
      return;
    }
    try {
      const node = analysisRef.current;
      node.classList.add('html2canvas-bw');
      const canvas = await html2canvas(node, { useCORS: true, scale: 2, backgroundColor: '#fff' });
      node.classList.remove('html2canvas-bw');
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('investment-analysis.pdf');
    } catch (err) {
      console.error(err);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const renderAnalysis = () => {
    if (!analysis) return null;

    return (
      <div ref={analysisRef} className="space-y-6 bg-white p-6 rounded-lg max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center border-b-2 border-blue-200 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Investment Analysis Report</h1>
          <p className="text-lg text-gray-600">Generated for {formData.name}</p>
          <p className="text-sm text-gray-500">
            {countries.find(c => c.code === selectedCountry)?.name} • {selectedCurrency.code} • {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Executive Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Executive Summary</h3>
          <p className="text-blue-800 dark:text-blue-200">{analysis.executiveSummary}</p>
        </div>

        {/* Expectation Realism & Achievability */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Expectation Realism</h3>
          <p className="text-yellow-800 dark:text-yellow-200">
            <strong>Status:</strong> {analysis.expectationRealism} <br />
            <strong>Achievability:</strong> {analysis.achievabilityPercent}% of your target is likely achievable with your current plan.
          </p>
        </div>

        {/* Portfolio Allocation */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">Portfolio Allocation</h3>
          <div className="space-y-3">
            {analysis.portfolioAllocation.map((allocation, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 dark:text-green-100">{allocation.asset}</h4>
                  <p className="text-sm text-green-800 dark:text-green-200">{allocation.rationale}</p>
                </div>
                <span className="text-lg font-bold text-green-900 dark:text-green-100 ml-4">
                  {allocation.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Investment Picks */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">Top Investment Picks</h3>
          
          {/* Stocks */}
          {analysis.topPicks.stocks.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Stocks & ETFs</h4>
              <div className="space-y-2">
                {analysis.topPicks.stocks.map((stock, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-medium text-purple-900 dark:text-purple-100">{stock.name}</h5>
                      <span className="bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 px-2 py-1 rounded text-xs">
                        {stock.ticker}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span><strong>Allocation:</strong> {stock.allocation}</span>
                      <span><strong>Expected Return:</strong> {stock.expectedReturn}</span>
                      <span><strong>Timeframe:</strong> {stock.timeframe}</span>
                    </div>
                    <p className="text-xs text-purple-800 dark:text-purple-200 mt-1">{stock.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Funds */}
          {analysis.topPicks.funds.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Mutual Funds & ETFs</h4>
              <div className="space-y-2">
                {analysis.topPicks.funds.map((fund, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-medium text-purple-900 dark:text-purple-100">{fund.name}</h5>
                      <span className="bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 px-2 py-1 rounded text-xs">
                        {fund.type}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span><strong>Allocation:</strong> {fund.allocation}</span>
                      <span><strong>Expected Return:</strong> {fund.expectedReturn}</span>
                      <span><strong>Timeframe:</strong> {fund.timeframe}</span>
                    </div>
                    <p className="text-xs text-purple-800 dark:text-purple-200 mt-1">{fund.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fixed Income */}
          {analysis.topPicks.fixedIncome.length > 0 && (
            <div>
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Fixed Income & Bonds</h4>
              <div className="space-y-2">
                {analysis.topPicks.fixedIncome.map((item, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-medium text-purple-900 dark:text-purple-100">{item.name}</h5>
                      <span className="bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 px-2 py-1 rounded text-xs">
                        {item.type}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span><strong>Allocation:</strong> {item.allocation}</span>
                      <span><strong>Expected Return:</strong> {item.expectedReturn}</span>
                      <span><strong>Timeframe:</strong> {item.timeframe}</span>
                    </div>
                    <p className="text-xs text-purple-800 dark:text-purple-200 mt-1">{item.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Monthly Investment Plan */}
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">Monthly Investment Plan</h3>
          <div className="mb-3">
            <span className="text-orange-800 dark:text-orange-200 font-medium">
              Total Monthly Investment: {selectedCurrency.symbol}{analysis.monthlyPlan.totalMonthly}
            </span>
          </div>
          <div className="space-y-2">
            {analysis.monthlyPlan.allocations.map((allocation, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                <span className="text-orange-900 dark:text-orange-100">{allocation.investment}</span>
                <div className="text-right">
                  <div className="font-semibold text-orange-900 dark:text-orange-100">{allocation.amount}</div>
                  <div className="text-xs text-orange-800 dark:text-orange-200">{allocation.percentage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Steps */}
        <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-100 mb-3">Key Action Steps (Next 30 Days)</h3>
          <ul className="list-decimal list-inside space-y-1 text-teal-800 dark:text-teal-200">
            {analysis.actionSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>

        {/* Risk Management */}
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-3">Risk Management</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Key Risks to Watch:</h4>
              <ul className="list-disc list-inside space-y-1 text-red-800 dark:text-red-200">
                {analysis.riskManagement.risks.map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Mitigation Strategies:</h4>
              <ul className="list-disc list-inside space-y-1 text-red-800 dark:text-red-200">
                {analysis.riskManagement.mitigation.map((strategy, index) => (
                  <li key={index}>{strategy}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Monitoring Schedule */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-3">Monitoring Schedule</h3>
          <div className="mb-3">
            <span className="text-indigo-800 dark:text-indigo-200 font-medium">
              Review Frequency: {analysis.monitoring.reviewFrequency}
            </span>
          </div>
          <div className="mb-3">
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">Key Performance Indicators:</h4>
            <ul className="list-disc list-inside space-y-1 text-indigo-800 dark:text-indigo-200">
              {analysis.monitoring.kpis.map((kpi, index) => (
                <li key={index}>{kpi}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">Rebalancing:</h4>
            <p className="text-indigo-800 dark:text-indigo-200">{analysis.monitoring.rebalancing}</p>
          </div>
        </div>
      </div>
    );
  };

  // Export Text
  const exportText = () => {
    setProcessing('text');
    if (!analysis) return;
    const content = `INVESTMENT ANALYSIS REPORT\n\nName: ${formData.name}\nCountry: ${countries.find(c => c.code === selectedCountry)?.name}\nCurrency: ${selectedCurrency.code}\nDate: ${new Date().toLocaleDateString()}\n\nExecutive Summary:\n${analysis.executiveSummary}\n\nExpectation Realism: ${analysis.expectationRealism}\nAchievability: ${analysis.achievabilityPercent}%\n\nPortfolio Allocation:\n${analysis.portfolioAllocation.map(a => `- ${a.asset}: ${a.percentage}% (${a.rationale})`).join('\n')}\n\nTop Investment Picks:\nStocks: ${analysis.topPicks.stocks.map(s => `${s.name} (${s.ticker}): ${s.allocation}, ${s.expectedReturn}, ${s.timeframe}`).join('; ')}\nFunds: ${analysis.topPicks.funds.map(f => `${f.name} (${f.type}): ${f.allocation}, ${f.expectedReturn}, ${f.timeframe}`).join('; ')}\nFixed Income: ${analysis.topPicks.fixedIncome.map(f => `${f.name} (${f.type}): ${f.allocation}, ${f.expectedReturn}, ${f.timeframe}`).join('; ')}\n\nMonthly Plan:\n${analysis.monthlyPlan.allocations.map(a => `- ${a.investment}: ${a.amount} (${a.percentage})`).join('\n')}\n\nKey Action Steps:\n${analysis.actionSteps.map((s, i) => `${i+1}. ${s}`).join('\n')}\n\nRisk Management:\nRisks: ${analysis.riskManagement.risks.join('; ')}\nMitigation: ${analysis.riskManagement.mitigation.join('; ')}\n\nMonitoring:\nReview Frequency: ${analysis.monitoring.reviewFrequency}\nKPIs: ${analysis.monitoring.kpis.join('; ')}\nRebalancing: ${analysis.monitoring.rebalancing}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `investment-analysis-${formData.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    setProcessing(null);
  };

  // Styled PDF (HTML print window)
  const generateDetailedPDF = () => {
    setProcessing('pdf');
    if (!analysis) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const htmlContent = `
      <!DOCTYPE html>
      <html><head><title>Investment Analysis Report - ${formData.name}</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f3f4f6; margin: 0; padding: 20px; }
        .container { background: white; border-radius: 15px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 800px; margin: auto; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
        .header h1 { color: #2563eb; font-size: 2.5em; margin: 0; font-weight: bold; }
        .header h2 { color: #0ea5e9; font-size: 1.5em; margin: 10px 0; }
        .header p { color: #666; font-size: 1.1em; }
        .section { margin-bottom: 32px; }
        .section h3 { color: #2563eb; font-size: 1.3em; margin-bottom: 10px; }
        .allocation-list, .monthly-list, .action-list, .risk-list, .kpi-list { margin: 0; padding-left: 20px; }
        .allocation-list li, .monthly-list li, .action-list li, .risk-list li, .kpi-list li { margin-bottom: 6px; }
        .footer { text-align: center; color: #666; font-size: 0.9em; margin-top: 40px; border-top: 2px solid #eee; padding-top: 20px; }
        @media print { body { background: white !important; } .container { box-shadow: none; } }
      </style></head><body>
      <div class="container">
        <div class="header">
          <h1>💰 Investment Analysis Report</h1>
          <h2>${formData.name}</h2>
          <p>${countries.find(c => c.code === selectedCountry)?.name} • ${selectedCurrency.code} • ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="section"><h3>Executive Summary</h3><p>${analysis.executiveSummary}</p></div>
        <div class="section"><h3>Expectation Realism</h3><p>Status: <b>${analysis.expectationRealism}</b><br>Achievability: <b>${analysis.achievabilityPercent}%</b></p></div>
        <div class="section"><h3>Portfolio Allocation</h3><ul class="allocation-list">${analysis.portfolioAllocation.map(a => `<li><b>${a.asset}:</b> ${a.percentage}% - ${a.rationale}</li>`).join('')}</ul></div>
        <div class="section"><h3>Top Investment Picks</h3><ul class="allocation-list"><li><b>Stocks:</b> ${analysis.topPicks.stocks.map(s => `${s.name} (${s.ticker}): ${s.allocation}, ${s.expectedReturn}, ${s.timeframe}`).join('; ')}</li><li><b>Funds:</b> ${analysis.topPicks.funds.map(f => `${f.name} (${f.type}): ${f.allocation}, ${f.expectedReturn}, ${f.timeframe}`).join('; ')}</li><li><b>Fixed Income:</b> ${analysis.topPicks.fixedIncome.map(f => `${f.name} (${f.type}): ${f.allocation}, ${f.expectedReturn}, ${f.timeframe}`).join('; ')}</li></ul></div>
        <div class="section"><h3>Monthly Investment Plan</h3><ul class="monthly-list">${analysis.monthlyPlan.allocations.map(a => `<li>${a.investment}: ${a.amount} (${a.percentage})</li>`).join('')}</ul></div>
        <div class="section"><h3>Key Action Steps</h3><ol class="action-list">${analysis.actionSteps.map(s => `<li>${s}</li>`).join('')}</ol></div>
        <div class="section"><h3>Risk Management</h3><ul class="risk-list"><li><b>Risks:</b> ${analysis.riskManagement.risks.join('; ')}</li><li><b>Mitigation:</b> ${analysis.riskManagement.mitigation.join('; ')}</li></ul></div>
        <div class="section"><h3>Monitoring</h3><ul class="kpi-list"><li><b>Review Frequency:</b> ${analysis.monitoring.reviewFrequency}</li><li><b>KPIs:</b> ${analysis.monitoring.kpis.join('; ')}</li><li><b>Rebalancing:</b> ${analysis.monitoring.rebalancing}</li></ul></div>
        <div class="footer">Generated on ${new Date().toLocaleDateString()}<br>Powered by AI Toolbox</div>
      </div></body></html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      setProcessing(null);
    }, 500);
  };

  // Full Analysis Card (Canvas PNG)
  const generateAnalysisCard = async () => {
    setProcessing('card');
    if (!analysis) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1620;
    if (!ctx) return;
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#2563eb');
    gradient.addColorStop(1, '#0ea5e9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Helper for text wrapping
    const wrapText = (text: string, maxWidth: number, fontSize: number) => {
      ctx.font = `${fontSize}px Arial`;
      const words = text.split(' ');
      const lines = [];
      let currentLine = words[0];
      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    };
    let yPos = 60;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💰 INVESTMENT ANALYSIS', canvas.width / 2, yPos);
    yPos += 50;
    ctx.font = 'bold 32px Arial';
    ctx.fillText(formData.name.toUpperCase(), canvas.width / 2, yPos);
    yPos += 40;
    ctx.font = '24px Arial';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`${countries.find(c => c.code === selectedCountry)?.name} • ${selectedCurrency.code}`, canvas.width / 2, yPos);
    yPos += 60;
    // Portfolio Allocation
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#2563eb';
    ctx.textAlign = 'left';
    ctx.fillText('Portfolio Allocation', 60, yPos);
    yPos += 30;
    ctx.font = '16px Arial';
    ctx.fillStyle = '#1f2937';
    analysis.portfolioAllocation.forEach((a, i) => {
      ctx.fillText(`• ${a.asset}: ${a.percentage}% - ${a.rationale}`, 80, yPos);
      yPos += 22;
    });
    yPos += 20;
    // Top Picks
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#0ea5e9';
    ctx.fillText('Top Investment Picks', 60, yPos);
    yPos += 30;
    ctx.font = '16px Arial';
    ctx.fillStyle = '#1f2937';
    analysis.topPicks.stocks.forEach((s, i) => {
      ctx.fillText(`• ${s.name} (${s.ticker}): ${s.allocation}, ${s.expectedReturn}, ${s.timeframe}`, 80, yPos);
      yPos += 20;
    });
    analysis.topPicks.funds.forEach((f, i) => {
      ctx.fillText(`• ${f.name} (${f.type}): ${f.allocation}, ${f.expectedReturn}, ${f.timeframe}`, 80, yPos);
      yPos += 20;
    });
    analysis.topPicks.fixedIncome.forEach((f, i) => {
      ctx.fillText(`• ${f.name} (${f.type}): ${f.allocation}, ${f.expectedReturn}, ${f.timeframe}`, 80, yPos);
      yPos += 20;
    });
    yPos += 20;
    // Monthly Plan
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#2563eb';
    ctx.fillText('Monthly Investment Plan', 60, yPos);
    yPos += 30;
    ctx.font = '16px Arial';
    ctx.fillStyle = '#1f2937';
    analysis.monthlyPlan.allocations.forEach((a, i) => {
      ctx.fillText(`• ${a.investment}: ${a.amount} (${a.percentage})`, 80, yPos);
      yPos += 20;
    });
    yPos += 20;
    // Action Steps
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#0ea5e9';
    ctx.fillText('Key Action Steps', 60, yPos);
    yPos += 30;
    ctx.font = '16px Arial';
    ctx.fillStyle = '#1f2937';
    analysis.actionSteps.forEach((s, i) => {
      ctx.fillText(`• ${s}`, 80, yPos);
      yPos += 20;
    });
    yPos += 20;
    // Risk Management
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#2563eb';
    ctx.fillText('Risk Management', 60, yPos);
    yPos += 30;
    ctx.font = '16px Arial';
    ctx.fillStyle = '#1f2937';
    ctx.fillText(`Risks: ${analysis.riskManagement.risks.join('; ')}`, 80, yPos);
    yPos += 20;
    ctx.fillText(`Mitigation: ${analysis.riskManagement.mitigation.join('; ')}`, 80, yPos);
    yPos += 20;
    // Monitoring
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#0ea5e9';
    ctx.fillText('Monitoring', 60, yPos);
    yPos += 30;
    ctx.font = '16px Arial';
    ctx.fillStyle = '#1f2937';
    ctx.fillText(`Review Frequency: ${analysis.monitoring.reviewFrequency}`, 80, yPos);
    yPos += 20;
    ctx.fillText(`KPIs: ${analysis.monitoring.kpis.join('; ')}`, 80, yPos);
    yPos += 20;
    ctx.fillText(`Rebalancing: ${analysis.monitoring.rebalancing}`, 80, yPos);
    yPos += 40;
    // Footer
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, canvas.width / 2, yPos);
    ctx.fillText('Powered by AI Toolbox', canvas.width / 2, yPos + 30);
    // Download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `investment-analysis-${formData.name.replace(/\s+/g, '-').toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
    setProcessing(null);
  };

  const resetAnalysis = () => {
    setCurrentStep(1);
    setFormData(initialFormData);
    setAnalysis(null);
    setSelectedCountry('');
  };

  // Add spinner component
  const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-white inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
  );

  return (
    <BaseModuleLayout
      title="Investment Planning"
      description="Create a comprehensive investment strategy aligned with your goals"
      onBack={onBack}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && (
          <PersonalInfoForm
            profile={formData}
            onChange={handleInputChange}
          />
        )}

        {currentStep === 2 && (
          <>
            <h2 className="text-xl font-semibold mb-6">Investment Details & Country</h2>
            
            {/* Country Selection - Made more prominent */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <label className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                🌍 Country of Residence *
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select your country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                This helps us provide country-specific investment recommendations and regulatory considerations.
              </p>
            </div>

            <FormField
              label={`Time Horizon (years)`}
              name="time_horizon"
              type="number"
              value={formData.time_horizon}
              onChange={handleInputChange}
              required
            />
            <FormField
              label={`Target Amount (${selectedCurrency.symbol} ${selectedCurrency.code})`}
              name="target_amount"
              type="number"
              value={formData.target_amount}
              onChange={handleInputChange}
              required
            />
            <FormField
              label={`Current Investments (${selectedCurrency.symbol} ${selectedCurrency.code})`}
              name="current_investments"
              type="number"
              value={formData.current_investments}
              onChange={handleInputChange}
              required
            />
            <FormField
              label={`Monthly Investment Capacity (${selectedCurrency.symbol} ${selectedCurrency.code})`}
              name="monthly_investment"
              type="number"
              value={formData.monthly_investment}
              onChange={handleInputChange}
              required
            />
          </>
        )}

        {currentStep === 3 && !analysis && !isLoading && (
          <>
            <h2 className="text-xl font-semibold mb-6">Risk Assessment</h2>
            
            {/* Show selected country for confirmation */}
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="text-lg font-medium text-green-900 dark:text-green-100 mb-2">
                📍 Selected Country: {countries.find(c => c.code === selectedCountry)?.name || 'Not selected'}
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                Your analysis will be tailored for {countries.find(c => c.code === selectedCountry)?.name || 'your selected country'} markets.
              </p>
            </div>
            
            <FormField
              label="Risk Tolerance (1-10)"
              name="risk_tolerance"
              type="number"
              value={formData.risk_tolerance}
              onChange={handleInputChange}
              min={1}
              max={10}
              required
            />
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                Risk Tolerance Scale
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>1-3: Conservative (Low risk, stable returns)</li>
                <li>4-7: Moderate (Balanced risk and returns)</li>
                <li>8-10: Aggressive (High risk, potential high returns)</li>
              </ul>
            </div>
          </>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              {retryCount > 0 
                ? `Analyzing your investment profile... (Attempt ${retryCount + 1})`
                : 'Analyzing your investment profile...'
              }
            </p>
            {retryCount > 0 && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                The AI service was busy, retrying...
              </p>
            )}
          </div>
        )}

        {analysis && (
          <>
            {renderAnalysis()}
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              <button
                onClick={exportText}
                disabled={processing !== null}
                className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center"
              >
                {processing === 'text' && <Spinner />}📄 Export Text
              </button>
              <button
                onClick={generateDetailedPDF}
                disabled={processing !== null}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors flex items-center"
              >
                {processing === 'pdf' && <Spinner />}📋 Detailed PDF Report
              </button>
              <button
                onClick={generateAnalysisCard}
                disabled={processing !== null}
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 px-4 rounded-md hover:from-pink-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors flex items-center"
              >
                {processing === 'card' && <Spinner />}🎨 Full Analysis Card
              </button>
              <button
                onClick={resetAnalysis}
                disabled={processing !== null}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
              >
                🔄 New Analysis
              </button>
            </div>
          </>
        )}

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {currentStep === 1 ? 'Back to Tools' : 'Back'}
          </button>
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={currentStep === 2 && !selectedCountry}
              className={`px-4 py-2 rounded focus:outline-none focus:ring-2 ml-auto ${
                currentStep === 2 && !selectedCountry
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500'
              }`}
            >
              Next
            </button>
          ) : !analysis && !isLoading ? (
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 ml-auto"
            >
              Generate Analysis
            </button>
          ) : null}
        </div>
      </form>
    </BaseModuleLayout>
  );
} 
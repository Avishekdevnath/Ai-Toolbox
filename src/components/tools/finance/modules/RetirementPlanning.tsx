import { useState } from 'react';
import { BaseModuleLayout } from '../components/BaseModule';
import { RetirementFormField } from '../components/RetirementFormField';
import { StepHeader } from '../components/StepHeader';
import { ProfessionTips } from '../components/ProfessionTips';
import { RetirementResults } from '../components/RetirementResults';
import { BaseModuleProps } from '../types';
import { useFinance } from '../context/FinanceContext';
import { generatePDFReport, downloadPDF } from '../utils/reportGenerator';
import {
  RetirementData,
  RetirementProjection,
  calculateRetirementNeeds,
  getProfessionTips,
  professionTips
} from '../utils/retirementUtils';

const initialFormData: RetirementData = {
  current_age: '',
  retirement_age: '',
  life_expectancy: '',
  current_income: '',
  profession: '',
  years_experience: '',
  industry: '',
  education_level: '',
  side_income: '',
  current_savings: '',
  monthly_contribution: '',
  employer_match: '',
  expected_return: '7',
  inflation_rate: '2.5',
  salary_increase: '2',
  desired_retirement_income: '',
  social_security_benefit: '',
  pension_income: ''
};

export default function RetirementPlanning({ onBack }: BaseModuleProps) {
  const { selectedCurrency, setIsLoading, setProgress } = useFinance();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RetirementData>(initialFormData);
  const [projection, setProjection] = useState<RetirementProjection | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency.code,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setProgress(0);
    
    try {
      // First calculate basic retirement needs
      const results = calculateRetirementNeeds(formData, formatCurrency);
      setProjection(results);
      setProgress(50);

      // Then get AI-powered analysis
      const response = await fetch('/api/analyze/retirement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          retirementData: formData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI analysis');
      }

      const aiData = await response.json();
      
      if (aiData.success) {
        // Store AI analysis for use in components
        setProjection(prev => prev ? {
          ...prev,
          aiAnalysis: aiData.analysis
        } : null);
      }
      
      setProgress(100);
      setCurrentStep(5);
    } catch (error) {
      console.error('Error in retirement analysis:', error);
      // Fallback to basic calculation if AI fails
      const results = calculateRetirementNeeds(formData, formatCurrency);
      setProjection(results);
      setCurrentStep(5);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setProjection(null);
    setCurrentStep(1);
  };

  // UI Step rendering
  return (
    <BaseModuleLayout
      title="Retirement Planning"
      description="Plan your retirement and ensure financial security in your golden years"
      onBack={onBack}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && (
          <>
            <StepHeader
              title="Personal Information"
              description="Let's start with your basic information to calculate your retirement needs."
              icon="📋"
              color="blue"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RetirementFormField
                label="Current Age"
                name="current_age"
                type="number"
                value={formData.current_age}
                onChange={handleInputChange}
                placeholder="e.g., 30 (your current age)"
                required
                min={18}
                max={100}
              />
              <RetirementFormField
                label="Desired Retirement Age"
                name="retirement_age"
                type="number"
                value={formData.retirement_age}
                onChange={handleInputChange}
                placeholder="e.g., 65 (when you want to stop working)"
                required
                min={45}
                max={80}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RetirementFormField
                label="Life Expectancy"
                name="life_expectancy"
                type="number"
                value={formData.life_expectancy}
                onChange={handleInputChange}
                placeholder="e.g., 85 (how long you expect to live)"
                required
                min={70}
                max={120}
              />
              <RetirementFormField
                label="Current Annual Income"
                name="current_income"
                type="number"
                value={formData.current_income}
                onChange={handleInputChange}
                placeholder="e.g., 75000 (your yearly salary before taxes)"
                required
                min={0}
                currency={selectedCurrency.code}
              />
            </div>
          </>
        )}
        {currentStep === 2 && (
          <>
            <StepHeader
              title="Professional Background & Income Planning"
              description="Help us understand your career to provide personalized income growth strategies."
              icon="💼"
              color="green"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RetirementFormField
                label="Profession/Industry"
                name="profession"
                type="select"
                value={formData.profession}
                onChange={handleInputChange}
                required
                placeholder="Select your profession"
                options={[
                  { value: 'technology', label: 'Technology/IT' },
                  { value: 'healthcare', label: 'Healthcare/Medical' },
                  { value: 'finance', label: 'Finance/Banking' },
                  { value: 'education', label: 'Education/Teaching' },
                  { value: 'marketing', label: 'Marketing/Advertising' },
                  { value: 'sales', label: 'Sales/Business Development' },
                  { value: 'engineering', label: 'Engineering' },
                  { value: 'other', label: 'Other' }
                ]}
              />
              <RetirementFormField
                label="Years of Experience"
                name="years_experience"
                type="number"
                value={formData.years_experience}
                onChange={handleInputChange}
                placeholder="e.g., 5 (total years in your profession)"
                min={0}
                max={50}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RetirementFormField
                label="Education Level"
                name="education_level"
                type="select"
                value={formData.education_level}
                onChange={handleInputChange}
                placeholder="Select education level"
                options={[
                  { value: 'high_school', label: 'High School' },
                  { value: 'associate', label: 'Associate Degree' },
                  { value: 'bachelor', label: "Bachelor's Degree" },
                  { value: 'master', label: "Master's Degree" },
                  { value: 'doctorate', label: 'Doctorate/PhD' },
                  { value: 'certification', label: 'Professional Certification' }
                ]}
              />
              <RetirementFormField
                label="Monthly Side Income"
                name="side_income"
                type="number"
                value={formData.side_income}
                onChange={handleInputChange}
                placeholder="e.g., 1000 (freelance, consulting, part-time work)"
                min={0}
                currency={selectedCurrency.code}
              />
            </div>
            <ProfessionTips
              profession={formData.profession}
              tips={getProfessionTips(formData.profession).tips}
            />
          </>
        )}
        {currentStep === 3 && (
          <>
            <StepHeader
              title="Current Savings & Contributions"
              description="Tell us about your current retirement savings and monthly contributions."
              icon="💰"
              color="purple"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RetirementFormField
                label="Current Retirement Savings"
                name="current_savings"
                type="number"
                value={formData.current_savings}
                onChange={handleInputChange}
                placeholder="e.g., 25000 (total in 401k, IRA, pension, etc.)"
                required
                min={0}
                currency={selectedCurrency.code}
              />
              <RetirementFormField
                label="Monthly Contribution"
                name="monthly_contribution"
                type="number"
                value={formData.monthly_contribution}
                onChange={handleInputChange}
                placeholder="e.g., 500 (how much you save monthly for retirement)"
                required
                min={0}
                currency={selectedCurrency.code}
              />
            </div>
            <RetirementFormField
              label="Employer Match (%)"
              name="employer_match"
              type="number"
              value={formData.employer_match}
              onChange={handleInputChange}
              placeholder="e.g., 6 (employer matches 6% of your contributions)"
              min={0}
              max={100}
            />
            <StepHeader
              title="Investment Assumptions"
              description="Provide your investment return, inflation, and salary increase assumptions."
              icon="📊"
              color="orange"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <RetirementFormField
                label="Expected Annual Return (%)"
                name="expected_return"
                type="number"
                value={formData.expected_return}
                onChange={handleInputChange}
                placeholder="Typical: 6-10% for diversified portfolio"
                required
                min={1}
                max={15}
              />
              <RetirementFormField
                label="Expected Inflation Rate (%)"
                name="inflation_rate"
                type="number"
                value={formData.inflation_rate}
                onChange={handleInputChange}
                placeholder="Historical average: 2-3%"
                required
                min={0}
                max={10}
              />
              <RetirementFormField
                label="Expected Annual Salary Increase (%)"
                name="salary_increase"
                type="number"
                value={formData.salary_increase}
                onChange={handleInputChange}
                placeholder="Typical: 2-5% annually"
                required
                min={0}
                max={10}
              />
            </div>
          </>
        )}
        {currentStep === 4 && (
          <>
            <StepHeader
              title="Retirement Income Goals"
              description="Define your desired retirement lifestyle and expected income sources."
              icon="🏖️"
              color="orange"
            />
            <RetirementFormField
              label="Desired Annual Retirement Income"
              name="desired_retirement_income"
              type="number"
              value={formData.desired_retirement_income}
              onChange={handleInputChange}
              placeholder="e.g., 60000 (aim for 70-80% of current income)"
              required
              min={0}
              currency={selectedCurrency.code}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RetirementFormField
                label="Expected Annual Social Security Benefit"
                name="social_security_benefit"
                type="number"
                value={formData.social_security_benefit}
                onChange={handleInputChange}
                placeholder="e.g., 20000 (check your Social Security statement)"
                min={0}
                currency={selectedCurrency.code}
              />
              <RetirementFormField
                label="Expected Annual Pension Income"
                name="pension_income"
                type="number"
                value={formData.pension_income}
                onChange={handleInputChange}
                placeholder="e.g., 10000 (if you have a pension plan)"
                min={0}
                currency={selectedCurrency.code}
              />
            </div>
            <StepHeader
              title="Pro Tips"
              description={
                '• Aim for 70-80% of your pre-retirement income\n• Consider healthcare costs and inflation\n• Factor in social security benefits (check your statement)\n• Include any pension or other retirement income\n• Plan for unexpected expenses and emergencies'
              }
              icon="💡"
              color="yellow"
            />
          </>
        )}
        {currentStep === 5 && projection && (
          <RetirementResults
            projection={projection}
            formData={formData}
            formatCurrency={formatCurrency}
            onReset={handleReset}
          />
        )}
        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors flex items-center"
            >
              ← Back
            </button>
          )}
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center ml-auto"
            >
              Next →
            </button>
          ) : currentStep === 4 ? (
            <button
              type="submit"
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors flex items-center ml-auto"
            >
              Calculate Projection
            </button>
          ) : null}
        </div>
      </form>
    </BaseModuleLayout>
  );
} 
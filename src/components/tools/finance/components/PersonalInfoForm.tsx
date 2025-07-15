import { FormField } from './FormField';
import { useFinance } from '../context/FinanceContext';
import { InvestmentProfile } from '../types';

interface PersonalInfoFormProps {
  profile: InvestmentProfile;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function PersonalInfoForm({ profile, onChange }: PersonalInfoFormProps) {
  const { selectedCurrency } = useFinance();

  // Format number with thousands separator
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Default values based on currency
  const getDefaultValues = () => {
    switch (selectedCurrency.code) {
      case 'BDT': return {
        income: 7000000,
        target: 50000000,
        current: 1000000,
        monthly: 50000
      };
      case 'INR': return {
        income: 5000000,
        target: 40000000,
        current: 800000,
        monthly: 40000
      };
      case 'PKR': return {
        income: 10000000,
        target: 80000000,
        current: 2000000,
        monthly: 100000
      };
      case 'EUR': return {
        income: 60000,
        target: 500000,
        current: 50000,
        monthly: 1000
      };
      default: return {
        income: 70000,
        target: 600000,
        current: 60000,
        monthly: 1200
      };
    }
  };

  const defaults = getDefaultValues();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Full Name"
          name="name"
          value={profile.name}
          onChange={onChange}
          placeholder="Enter your full name"
          required
        />

        <FormField
          label="Age"
          name="age"
          type="number"
          value={profile.age}
          onChange={onChange}
          placeholder="Enter your age"
          required
        />

        <FormField
          label={`Annual Income (${selectedCurrency.symbol})`}
          name="income"
          type="number"
          value={profile.income}
          onChange={onChange}
          placeholder={formatNumber(defaults.income).toString()}
          required
        />

        <FormField
          label="Investment Goal"
          name="investment_goal"
          value={profile.investment_goal}
          onChange={onChange}
          placeholder="e.g., Retirement, House, Education"
          required
        />

        <FormField
          label="Time Horizon (years)"
          name="time_horizon"
          type="number"
          value={profile.time_horizon}
          onChange={onChange}
          placeholder="e.g., 10"
          required
        />

        <FormField
          label={`Target Amount (${selectedCurrency.symbol})`}
          name="target_amount"
          type="number"
          value={profile.target_amount}
          onChange={onChange}
          placeholder={formatNumber(defaults.target).toString()}
          required
        />

        <FormField
          label={`Current Investments (${selectedCurrency.symbol})`}
          name="current_investments"
          type="number"
          value={profile.current_investments}
          onChange={onChange}
          placeholder={formatNumber(defaults.current).toString()}
          required
        />

        <FormField
          label={`Monthly Investment Capacity (${selectedCurrency.symbol})`}
          name="monthly_investment"
          type="number"
          value={profile.monthly_investment}
          onChange={onChange}
          placeholder={formatNumber(defaults.monthly).toString()}
          required
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Risk Tolerance (1-10) <span className="text-red-500">*</span>
          </label>
          <input
            type="range"
            name="risk_tolerance"
            min="1"
            max="10"
            value={profile.risk_tolerance}
            onChange={onChange}
            className="w-full"
            required
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Conservative (1)</span>
            <span>Aggressive (10)</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Investment Knowledge <span className="text-red-500">*</span>
          </label>
          <select
            name="investment_knowledge"
            value={profile.investment_knowledge}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Maximum Loss Comfort (%) <span className="text-red-500">*</span>
          </label>
          <select
            name="loss_comfort"
            value={profile.loss_comfort}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="5">Up to 5%</option>
            <option value="10">Up to 10%</option>
            <option value="15">Up to 15%</option>
            <option value="20">Up to 20%</option>
            <option value="30">Up to 30%</option>
          </select>
        </div>
      </div>

      {/* Helper text for currency */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 All monetary values are in {selectedCurrency.code} ({selectedCurrency.name}). 
          The suggested values are based on typical ranges for your selected currency.
        </p>
      </div>
    </div>
  );
} 
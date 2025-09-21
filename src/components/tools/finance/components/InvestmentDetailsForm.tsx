import { FormField } from './FormField';

interface InvestmentDetailsData {
  time_horizon: string;
  target_amount: string;
  current_investments: string;
  monthly_investment: string;
}

interface InvestmentDetailsFormProps {
  data: InvestmentDetailsData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function InvestmentDetailsForm({ data, onChange }: InvestmentDetailsFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-6">Investment Details</h2>
      
      <FormField
        label="Time Horizon (years)"
        name="time_horizon"
        type="number"
        value={data.time_horizon}
        onChange={onChange}
        placeholder="Enter investment time horizon"
        required
      />

      <FormField
        label="Target Amount (USD)"
        name="target_amount"
        type="number"
        value={data.target_amount}
        onChange={onChange}
        placeholder="Enter target amount"
        required
      />

      <FormField
        label="Current Investments (USD)"
        name="current_investments"
        type="number"
        value={data.current_investments}
        onChange={onChange}
        placeholder="Enter current investment amount"
        required
      />

      <FormField
        label="Monthly Investment Capacity (USD)"
        name="monthly_investment"
        type="number"
        value={data.monthly_investment}
        onChange={onChange}
        placeholder="Enter monthly investment capacity"
        required
      />
    </div>
  );
} 
import { useState } from 'react';
import { BaseModuleLayout } from '../components/BaseModule';
import { DebtFormField } from '../components/DebtFormField';
import { DebtResults } from '../components/DebtResults';
import { BaseModuleProps } from '../types';
import { useFinance } from '../context/FinanceContext';
import { Debt, DebtData, DebtManagementAnalysis } from '../types';

const initialDebt: Debt = {
  id: '',
  name: '',
  balance: '',
  interest_rate: '',
  minimum_payment: ''
};

const initialFormData: DebtData = {
  monthly_budget: '',
  debts: []
};

export default function DebtManagement({ onBack }: BaseModuleProps) {
  const { selectedCurrency, setIsLoading, setProgress } = useFinance();
  const [formData, setFormData] = useState<DebtData>(initialFormData);
  const [analysis, setAnalysis] = useState<DebtManagementAnalysis | null>(null);
  const [currentDebt, setCurrentDebt] = useState<Debt>(initialDebt);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDebtInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentDebt(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addDebt = () => {
    if (!currentDebt.name || !currentDebt.balance || !currentDebt.interest_rate || !currentDebt.minimum_payment) {
      alert('Please fill in all debt fields');
      return;
    }

    const newDebt: Debt = {
      ...currentDebt,
      id: Date.now().toString()
    };

    setFormData(prev => ({
      ...prev,
      debts: [...prev.debts, newDebt]
    }));

    setCurrentDebt(initialDebt);
  };

  const removeDebt = (id: string) => {
    setFormData(prev => ({
      ...prev,
      debts: prev.debts.filter(debt => debt.id !== id)
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
    
    if (!formData.monthly_budget) {
      alert('Please enter your monthly budget for debt repayment');
      return;
    }

    if (formData.debts.length === 0) {
      alert('Please add at least one debt');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    
    try {
      const response = await fetch('/api/analyze/debt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          debtData: formData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze debt management scenario');
      }

      const data = await response.json();

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      } else {
        throw new Error(data.error || 'Failed to get analysis');
      }
      
      setProgress(100);
    } catch (error) {
      console.error('Error in debt analysis:', error);
      alert('Failed to analyze debt management scenario. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setAnalysis(null);
    setCurrentDebt(initialDebt);
  };

  if (analysis) {
    return (
      <DebtResults
        analysis={analysis}
        debtData={formData}
        formatCurrency={formatCurrency}
        onReset={handleReset}
      />
    );
  }

  return (
    <BaseModuleLayout
      title="Debt Management"
      description="Analyze and optimize your debt repayment strategy"
      onBack={onBack}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Monthly Budget */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            💰 Monthly Budget for Debt Repayment ({selectedCurrency.code})
          </h2>
          <DebtFormField
            label="Monthly Budget"
            name="monthly_budget"
            type="number"
            value={formData.monthly_budget}
            onChange={handleInputChange}
            placeholder="e.g., 2000 (amount you can afford to pay monthly)"
            required
            min={0}
            currency={selectedCurrency.symbol}
          />
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
            Enter the total amount you can afford to pay toward your debts each month.
          </p>
        </div>

        {/* Your Debts */}
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">
            📋 Your Debts
          </h2>
          
          {formData.debts.length > 0 && (
            <div className="mb-6 space-y-3">
              {formData.debts.map((debt) => (
                <div key={debt.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 dark:text-green-100">{debt.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Balance:</span>
                          <span className="ml-1 font-medium">{formatCurrency(parseFloat(debt.balance))}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Interest Rate:</span>
                          <span className="ml-1 font-medium">{debt.interest_rate}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Min Payment:</span>
                          <span className="ml-1 font-medium">{formatCurrency(parseFloat(debt.minimum_payment))}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDebt(debt.id)}
                      className="ml-4 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Debt Form */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-dashed border-green-300 dark:border-green-600">
            <h3 className="font-medium text-green-900 dark:text-green-100 mb-4">
              Add Debt
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <DebtFormField
                label="Debt Name"
                name="name"
                type="text"
                value={currentDebt.name}
                onChange={handleDebtInputChange}
                placeholder="e.g., Credit Card, Student Loan"
                required
              />
              <DebtFormField
                label="Current Balance"
                name="balance"
                type="number"
                value={currentDebt.balance}
                onChange={handleDebtInputChange}
                placeholder="e.g., 5000"
                required
                min={0}
                currency={selectedCurrency.symbol}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <DebtFormField
                label="Interest Rate (%)"
                name="interest_rate"
                type="number"
                value={currentDebt.interest_rate}
                onChange={handleDebtInputChange}
                placeholder="e.g., 18.99"
                required
                min={0}
                max={100}
                step="0.01"
              />
              <DebtFormField
                label="Minimum Monthly Payment"
                name="minimum_payment"
                type="number"
                value={currentDebt.minimum_payment}
                onChange={handleDebtInputChange}
                placeholder="e.g., 150"
                required
                min={0}
                currency={selectedCurrency.symbol}
              />
            </div>
            
            <button
              type="button"
              onClick={addDebt}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              ➕ Add Debt
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={formData.debts.length === 0 || !formData.monthly_budget}
            className={`px-8 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              formData.debts.length === 0 || !formData.monthly_budget
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            Calculate Strategies
          </button>
        </div>

        {/* Disclaimer */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            This tool provides educational guidance and should not replace professional financial advice. 
            Always consult with a qualified financial advisor for personalized recommendations.
          </p>
        </div>
      </form>
    </BaseModuleLayout>
  );
} 
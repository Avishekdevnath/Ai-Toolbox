import { useRef, useState } from 'react';
import { RetirementProjection, RetirementData, getProfessionTips } from '../utils/retirementUtils';
import { AIRetirementInsights } from './AIRetirementInsights';

interface RetirementResultsProps {
  projection: RetirementProjection;
  formData: RetirementData;
  formatCurrency: (amount: number) => string;
  onReset: () => void;
}

export function RetirementResults({ projection, formData, formatCurrency, onReset }: RetirementResultsProps) {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-white inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
  );

  const exportText = () => {
    setProcessing('text');
    if (!projection) return;
    
    const content = `RETIREMENT PLANNING ANALYSIS\n\nPersonal Information:\nName: ${formData.name || 'Not provided'}\nAge: ${formData.current_age}\nRetirement Age: ${formData.retirement_age}\nProfession: ${formData.profession}\nYears Experience: ${formData.years_experience}\n\nFinancial Summary:\nRequired Savings: ${formatCurrency(projection.requiredSavings)}\nCurrent Trajectory: ${formatCurrency(projection.currentTrajectory)}\nGap: ${formatCurrency(Math.abs(projection.gap))} ${projection.gap <= 0 ? 'Surplus' : 'Shortfall'}\nMonthly Required: ${formatCurrency(projection.monthlyRequired)}\n\nIncome Growth Potential: ${formatCurrency(projection.incomeGrowthPotential)}\nYears to Retirement: ${projection.yearsToRetirement}\n\nRecommended Actions:\n${projection.recommendedActions.map((action, i) => `${i + 1}. ${action}`).join('\n')}\n\nGenerated on: ${new Date().toLocaleDateString()}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'retirement-analysis.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setProcessing(null);
  };

  const generateDetailedPDF = () => {
    setProcessing('pdf');
    if (!projection) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Retirement Planning Analysis</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; }
            .highlight { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .recommendations { background: #f1f8e9; padding: 20px; border-radius: 8px; }
            .recommendations ul { margin: 10px 0; padding-left: 20px; }
            .recommendations li { margin: 8px 0; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Retirement Planning Analysis</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Personal Information</h2>
            <div class="grid">
              <div><strong>Current Age:</strong> ${formData.current_age}</div>
              <div><strong>Retirement Age:</strong> ${formData.retirement_age}</div>
              <div><strong>Profession:</strong> ${formData.profession}</div>
              <div><strong>Years Experience:</strong> ${formData.years_experience}</div>
            </div>
          </div>
          
          <div class="section">
            <h2>Financial Summary</h2>
            <div class="grid">
              <div class="card">
                <h3>Required Savings</h3>
                <h2>${formatCurrency(projection.requiredSavings)}</h2>
                <p>Total amount needed for retirement</p>
              </div>
              <div class="card">
                <h3>Current Trajectory</h3>
                <h2>${formatCurrency(projection.currentTrajectory)}</h2>
                <p>Projected savings at retirement</p>
              </div>
            </div>
            
            <div class="highlight">
              <h3>Retirement Gap Analysis</h3>
              <h2 style="color: ${projection.gap <= 0 ? '#28a745' : '#dc3545'}">
                ${formatCurrency(Math.abs(projection.gap))} ${projection.gap <= 0 ? 'Surplus' : 'Shortfall'}
              </h2>
              <p>${projection.gap <= 0 ? "You're on track to meet your retirement goals!" : "Additional savings needed to meet your retirement goals."}</p>
            </div>
          </div>
          
          <div class="section">
            <h2>Income Growth Opportunities</h2>
            <div class="grid">
              <div>
                <h3>Your Profession: ${formData.profession}</h3>
                <p><strong>Average annual growth:</strong> ${getProfessionTips(formData.profession).avgGrowth}</p>
                <p><strong>Income growth potential:</strong> ${formatCurrency(projection.incomeGrowthPotential)}</p>
              </div>
              <div>
                <h3>Side Income Opportunities</h3>
                <p>${getProfessionTips(formData.profession).sideIncome}</p>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="recommendations">
              <h2>Recommended Actions</h2>
              <ul>
                ${projection.recommendedActions.map(action => `<li>${action}</li>`).join('')}
              </ul>
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      setProcessing(null);
    }, 500);
  };

  const generateAnalysisCard = async () => {
    setProcessing('card');
    if (!projection || !resultsRef.current) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      // Add black & white export class
      resultsRef.current.classList.add('html2canvas-bw');
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      resultsRef.current.classList.remove('html2canvas-bw');
      const link = document.createElement('a');
      link.download = 'retirement-analysis-card.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating analysis card:', error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-8">
      <div ref={resultsRef} className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Retirement Projection</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Based on your {formData.profession} background and {projection.yearsToRetirement} years until retirement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Required Savings</h3>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(projection.requiredSavings)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Total amount needed for retirement
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Current Trajectory</h3>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(projection.currentTrajectory)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Projected savings at retirement
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Retirement Gap Analysis</h3>
          <div className={`text-3xl font-bold mb-2 ${projection.gap <= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(projection.gap))} {projection.gap <= 0 ? 'Surplus' : 'Shortfall'}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {projection.gap <= 0
              ? "You're on track to meet your retirement goals!"
              : "Additional savings needed to meet your retirement goals:"}
          </p>
          {projection.gap > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-blue-900 dark:text-blue-100">
                To close this gap, consider saving an additional{' '}
                <span className="font-bold">
                  {formatCurrency(projection.monthlyRequired - parseFloat(formData.monthly_contribution))}
                </span>
                {' '}per month.
              </p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">💰 Income Growth Opportunities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Your Profession: {formData.profession}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Average annual growth: <span className="font-semibold">{getProfessionTips(formData.profession).avgGrowth}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Income growth potential: <span className="font-semibold">{formatCurrency(projection.incomeGrowthPotential)}</span>
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Side Income Opportunities</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getProfessionTips(formData.profession).sideIncome}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">📈 Recommended Actions</h3>
          <ul className="space-y-2">
            {projection.recommendedActions.map((action, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                <span className="text-sm text-green-900 dark:text-green-100">{action}</span>
              </li>
            ))}
          </ul>
        </div>

        <AIRetirementInsights
          projection={projection}
          formData={formData}
          formatCurrency={formatCurrency}
        />
      </div>

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
          onClick={onReset}
          disabled={processing !== null}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
        >
          🔄 New Analysis
        </button>
      </div>
    </div>
  );
} 
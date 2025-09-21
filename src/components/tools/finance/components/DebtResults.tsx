import React, { useRef, useState } from 'react';
import { DebtData, DebtManagementAnalysis } from '../types';
import { generateDebtReport, createDebtHTML, calculateBasicDebtMetrics } from '../utils/debtUtils';
import { generatePDFReport, downloadPDF } from '../utils/reportGenerator';

interface DebtResultsProps {
  analysis: DebtManagementAnalysis;
  debtData: DebtData;
  formatCurrency: (amount: number) => string;
  onReset: () => void;
}

export function DebtResults({ analysis, debtData, formatCurrency, onReset }: DebtResultsProps) {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [processing, setProcessing] = useState<'text' | 'pdf' | 'card' | null>(null);

  const Spinner = () => (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
  );

  const exportText = () => {
    setProcessing('text');
    const report = generateDebtReport(debtData, analysis, formatCurrency);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'debt-management-analysis.txt';
    link.click();
    URL.revokeObjectURL(url);
    setProcessing(null);
  };

  const generateDetailedPDF = () => {
    setProcessing('pdf');
    const htmlContent = createDebtHTML(debtData, analysis, formatCurrency);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate PDF');
      setProcessing(null);
      return;
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      setProcessing(null);
    }, 500);
  };

  const generateAnalysisCard = async () => {
    setProcessing('card');
    if (!analysis || !resultsRef.current) return;
    
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
      link.download = 'debt-management-analysis-card.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating analysis card:', error);
    } finally {
      setProcessing(null);
    }
  };

  const metrics = calculateBasicDebtMetrics(debtData);

  return (
    <div className="space-y-8">
      <div ref={resultsRef} className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Debt Management Analysis</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive debt repayment strategy and recommendations
          </p>
        </div>

        {/* Executive Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            📋 Executive Summary
          </h3>
          <p className="text-blue-800 dark:text-blue-200">{analysis.executiveSummary}</p>
        </div>

        {/* Debt Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Total Outstanding Debt</h3>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(metrics.totalDebt)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Across {debtData.debts.length} debt accounts
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Monthly Budget</h3>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(metrics.monthlyBudget)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Available for debt repayment
            </p>
          </div>
        </div>

        {/* Recommended Strategy */}
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
            🎯 Recommended Strategy: {analysis.recommendedStrategy.name}
          </h3>
          <p className="text-green-800 dark:text-green-200 mb-4">
            {analysis.recommendedStrategy.reason}
          </p>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-3">
              Monthly Payment Breakdown
            </h4>
            <div className="space-y-2">
              {analysis.recommendedStrategy.monthlyBreakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm font-medium">{item.debtName}</span>
                  <div className="text-right">
                    <div className="font-semibold">{item.amount}</div>
                    <div className="text-xs text-gray-500">Priority: {item.priority}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Goals */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
            📅 Timeline Goals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                Short Term (3-6 months)
              </h4>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                {analysis.recommendedStrategy.timeline.shortTerm}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                Medium Term (6-12 months)
              </h4>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                {analysis.recommendedStrategy.timeline.mediumTerm}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                Long Term (1+ years)
              </h4>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                {analysis.recommendedStrategy.timeline.longTerm}
              </p>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
            ⚠️ Risk Assessment
          </h3>
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Risk Level: {analysis.riskAssessment.currentRisk}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                Risk Factors
              </h4>
              <ul className="space-y-1">
                {analysis.riskAssessment.riskFactors.map((factor, index) => (
                  <li key={index} className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start">
                    <span className="text-yellow-600 dark:text-yellow-400 mr-2 mt-1">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                Mitigation Strategies
              </h4>
              <ul className="space-y-1">
                {analysis.riskAssessment.mitigationStrategies.map((strategy, index) => (
                  <li key={index} className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start">
                    <span className="text-yellow-600 dark:text-yellow-400 mr-2 mt-1">•</span>
                    {strategy}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Recommendations */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-3">
            💡 Additional Recommendations
          </h3>
          <ul className="space-y-2">
            {analysis.additionalRecommendations.map((rec, index) => (
              <li key={index} className="text-indigo-800 dark:text-indigo-200 flex items-start">
                <span className="text-indigo-600 dark:text-indigo-400 mr-2 mt-1">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Emergency Plan */}
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-3">
            🚨 Emergency Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                Recommended Emergency Fund
              </h4>
              <p className="text-red-800 dark:text-red-200">
                {analysis.emergencyPlan.emergencyFund}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                Debt Pause Strategy
              </h4>
              <p className="text-red-800 dark:text-red-200">
                {analysis.emergencyPlan.debtPauseStrategy}
              </p>
            </div>
          </div>
        </div>

        {/* Repayment Strategies Comparison */}
        <div className="bg-gray-50 dark:bg-gray-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📊 Repayment Strategies Comparison
          </h3>
          <div className="space-y-4">
            {analysis.repaymentStrategies.map((strategy, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {strategy.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {strategy.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Payoff Time:</span> {strategy.estimatedPayoffTime}
                  </div>
                  <div>
                    <span className="font-medium">Total Interest:</span> {strategy.totalInterestPaid}
                  </div>
                  <div>
                    <span className="font-medium">Savings:</span> {strategy.savings}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Buttons */}
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
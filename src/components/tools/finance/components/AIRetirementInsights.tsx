import { useState, useEffect } from 'react';
import { RetirementProjection, RetirementData, getProfessionTips } from '../utils/retirementUtils';

interface AIRetirementInsightsProps {
  projection: RetirementProjection;
  formData: RetirementData;
  formatCurrency: (amount: number) => string;
}

interface AIInsight {
  type: 'success' | 'warning' | 'info' | 'action';
  title: string;
  message: string;
  priority: number;
}

export function AIRetirementInsights({ projection, formData, formatCurrency }: AIRetirementInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    generateAIInsights();
  }, [projection, formData]);

  const generateAIInsights = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      const newInsights: AIInsight[] = [];
      const professionData = getProfessionTips(formData.profession);
      const currentAge = parseInt(formData.current_age);
      const retirementAge = parseInt(formData.retirement_age);
      const yearsToRetirement = retirementAge - currentAge;
      const currentSavings = parseFloat(formData.current_savings);
      const monthlyContribution = parseFloat(formData.monthly_contribution);
      const currentIncome = parseFloat(formData.current_income);

      // Gap Analysis
      if (projection.gap > 0) {
        const additionalMonthly = projection.monthlyRequired - monthlyContribution;
        const percentageIncrease = (additionalMonthly / monthlyContribution) * 100;
        
        if (percentageIncrease > 50) {
          newInsights.push({
            type: 'warning',
            title: 'Significant Savings Gap Detected',
            message: `You need to increase your monthly savings by ${formatCurrency(additionalMonthly)} (${percentageIncrease.toFixed(1)}% increase) to meet your retirement goals. Consider aggressive saving strategies.`,
            priority: 1
          });
        } else {
          newInsights.push({
            type: 'action',
            title: 'Moderate Savings Adjustment Needed',
            message: `Increase your monthly savings by ${formatCurrency(additionalMonthly)} to close the retirement gap. This represents a ${percentageIncrease.toFixed(1)}% increase in your current contributions.`,
            priority: 2
          });
        }
      } else {
        newInsights.push({
          type: 'success',
          title: 'On Track for Retirement!',
          message: `Congratulations! You're projected to have a ${formatCurrency(Math.abs(projection.gap))} surplus at retirement. Consider increasing your retirement income goals or retiring earlier.`,
          priority: 1
        });
      }

      // Age-based insights
      if (currentAge < 30) {
        newInsights.push({
          type: 'info',
          title: 'Early Start Advantage',
          message: 'Starting retirement planning in your 20s gives you a significant advantage. Compound interest will work heavily in your favor over the next 35+ years.',
          priority: 3
        });
      } else if (currentAge > 50) {
        newInsights.push({
          type: 'warning',
          title: 'Catch-up Contributions Available',
          message: 'You can make catch-up contributions to your retirement accounts. Consider maximizing these additional contributions to accelerate your savings.',
          priority: 2
        });
      }

      // Income-based insights
      const savingsRate = (monthlyContribution * 12) / currentIncome * 100;
      if (savingsRate < 10) {
        newInsights.push({
          type: 'action',
          title: 'Low Savings Rate',
          message: `Your current savings rate is ${savingsRate.toFixed(1)}%. Aim for 15-20% of your income for a comfortable retirement.`,
          priority: 2
        });
      } else if (savingsRate > 20) {
        newInsights.push({
          type: 'success',
          title: 'Excellent Savings Rate',
          message: `Your ${savingsRate.toFixed(1)}% savings rate is excellent! You're building a strong foundation for retirement.`,
          priority: 3
        });
      }

      // Profession-specific insights
      if (formData.profession === 'technology') {
        newInsights.push({
          type: 'info',
          title: 'Tech Industry Opportunities',
          message: 'The tech industry offers high growth potential. Consider stock options, RSUs, and side projects to accelerate your retirement savings.',
          priority: 2
        });
      } else if (formData.profession === 'healthcare') {
        newInsights.push({
          type: 'info',
          title: 'Healthcare Career Longevity',
          message: 'Healthcare professionals often work longer due to high demand. This can extend your earning years and reduce retirement savings needs.',
          priority: 3
        });
      }

      // Investment strategy insights
      const expectedReturn = parseFloat(formData.expected_return);
      if (expectedReturn < 6) {
        newInsights.push({
          type: 'warning',
          title: 'Conservative Investment Strategy',
          message: `Your expected return of ${expectedReturn}% is conservative. Consider a more diversified portfolio to potentially increase returns.`,
          priority: 2
        });
      } else if (expectedReturn > 10) {
        newInsights.push({
          type: 'warning',
          title: 'Aggressive Return Expectations',
          message: `Your ${expectedReturn}% expected return is optimistic. Ensure your portfolio can handle market volatility.`,
          priority: 2
        });
      }

      // Side income opportunities
      if (parseFloat(formData.side_income) === 0) {
        newInsights.push({
          type: 'action',
          title: 'Side Income Potential',
          message: `Consider developing side income through ${professionData.sideIncome}. Even ${formatCurrency(500)}/month could significantly impact your retirement timeline.`,
          priority: 2
        });
      }

      // Sort by priority and limit to top 6 insights
      newInsights.sort((a, b) => a.priority - b.priority);
      setInsights(newInsights.slice(0, 6));
      setIsAnalyzing(false);
    }, 1500);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'action': return '🎯';
      default: return '💡';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'warning': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'info': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'action': return 'border-purple-500 bg-purple-50 dark:bg-purple-900/20';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  if (isAnalyzing) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              🤖 AI Analysis in Progress
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Analyzing your retirement plan for personalized insights...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
        🤖 AI-Powered Retirement Insights
      </h3>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-l-4 ${getInsightColor(insight.type)}`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-xl">{getInsightIcon(insight.type)}</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {insight.title}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {insight.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          💡 These insights are generated based on your specific financial profile and industry trends. 
          Consider consulting with a financial advisor for personalized advice.
        </p>
      </div>
    </div>
  );
} 
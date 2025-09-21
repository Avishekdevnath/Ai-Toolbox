import { Debt, DebtData, DebtManagementAnalysis } from '../types';

export const calculateBasicDebtMetrics = (debtData: DebtData) => {
  const totalDebt = debtData.debts.reduce((sum, debt) => sum + parseFloat(debt.balance), 0);
  const totalMinimumPayments = debtData.debts.reduce((sum, debt) => sum + parseFloat(debt.minimum_payment), 0);
  const totalAnnualInterest = debtData.debts.reduce((sum, debt) => {
    const balance = parseFloat(debt.balance);
    const rate = parseFloat(debt.interest_rate) / 100;
    return sum + (balance * rate);
  }, 0);

  return {
    totalDebt,
    totalMinimumPayments,
    totalAnnualInterest,
    monthlyBudget: parseFloat(debtData.monthly_budget)
  };
};

export const calculateAvalancheMethod = (debtData: DebtData) => {
  const sortedDebts = [...debtData.debts].sort((a, b) => 
    parseFloat(b.interest_rate) - parseFloat(a.interest_rate)
  );
  
  const monthlyBudget = parseFloat(debtData.monthly_budget);
  const minimumPayments = sortedDebts.reduce((sum, debt) => sum + parseFloat(debt.minimum_payment), 0);
  const extraPayment = monthlyBudget - minimumPayments;
  
  if (extraPayment <= 0) {
    return {
      strategy: 'Minimum Payments Only',
      description: 'Your monthly budget only covers minimum payments. Consider increasing your budget or reducing expenses.',
      monthlyAllocation: sortedDebts.map(debt => ({
        debtName: debt.name,
        amount: debt.minimum_payment,
        percentage: ((parseFloat(debt.minimum_payment) / monthlyBudget) * 100).toFixed(1)
      })),
      estimatedPayoffTime: 'Varies based on minimum payments',
      totalInterestPaid: 'High - minimum payments only',
      savings: 'No additional savings'
    };
  }

  const allocation = [];
  let remainingExtra = extraPayment;
  
  for (const debt of sortedDebts) {
    const minPayment = parseFloat(debt.minimum_payment);
    const extraForThisDebt = remainingExtra > 0 ? remainingExtra : 0;
    const totalPayment = minPayment + extraForThisDebt;
    
    allocation.push({
      debtName: debt.name,
      amount: totalPayment.toFixed(2),
      percentage: ((totalPayment / monthlyBudget) * 100).toFixed(1)
    });
    
    remainingExtra = Math.max(0, remainingExtra - extraForThisDebt);
  }

  return {
    strategy: 'Avalanche Method',
    description: 'Pay extra on the highest interest rate debt first to minimize total interest paid.',
    monthlyAllocation: allocation,
    estimatedPayoffTime: 'Faster than minimum payments',
    totalInterestPaid: 'Minimized through high-interest priority',
    savings: 'Significant interest savings'
  };
};

export const calculateSnowballMethod = (debtData: DebtData) => {
  const sortedDebts = [...debtData.debts].sort((a, b) => 
    parseFloat(a.balance) - parseFloat(b.balance)
  );
  
  const monthlyBudget = parseFloat(debtData.monthly_budget);
  const minimumPayments = sortedDebts.reduce((sum, debt) => sum + parseFloat(debt.minimum_payment), 0);
  const extraPayment = monthlyBudget - minimumPayments;
  
  if (extraPayment <= 0) {
    return {
      strategy: 'Minimum Payments Only',
      description: 'Your monthly budget only covers minimum payments. Consider increasing your budget or reducing expenses.',
      monthlyAllocation: sortedDebts.map(debt => ({
        debtName: debt.name,
        amount: debt.minimum_payment,
        percentage: ((parseFloat(debt.minimum_payment) / monthlyBudget) * 100).toFixed(1)
      })),
      estimatedPayoffTime: 'Varies based on minimum payments',
      totalInterestPaid: 'High - minimum payments only',
      savings: 'No additional savings'
    };
  }

  const allocation = [];
  let remainingExtra = extraPayment;
  
  for (const debt of sortedDebts) {
    const minPayment = parseFloat(debt.minimum_payment);
    const extraForThisDebt = remainingExtra > 0 ? remainingExtra : 0;
    const totalPayment = minPayment + extraForThisDebt;
    
    allocation.push({
      debtName: debt.name,
      amount: totalPayment.toFixed(2),
      percentage: ((totalPayment / monthlyBudget) * 100).toFixed(1)
    });
    
    remainingExtra = Math.max(0, remainingExtra - extraForThisDebt);
  }

  return {
    strategy: 'Snowball Method',
    description: 'Pay extra on the smallest balance debt first for quick wins and motivation.',
    monthlyAllocation: allocation,
    estimatedPayoffTime: 'Faster than minimum payments',
    totalInterestPaid: 'May be higher than avalanche method',
    savings: 'Psychological benefits and momentum'
  };
};

export const generateDebtReport = (debtData: DebtData, analysis: DebtManagementAnalysis, formatCurrency: (amount: number) => string) => {
  const metrics = calculateBasicDebtMetrics(debtData);
  
  return `
DEBT MANAGEMENT ANALYSIS REPORT

EXECUTIVE SUMMARY
${analysis.executiveSummary}

DEBT OVERVIEW
Total Outstanding Debt: ${formatCurrency(metrics.totalDebt)}
Total Annual Interest: ${formatCurrency(metrics.totalAnnualInterest)}
Monthly Budget for Debt Repayment: ${formatCurrency(metrics.monthlyBudget)}
Total Minimum Payments: ${formatCurrency(metrics.totalMinimumPayments)}

DEBT ANALYSIS
${analysis.debtAnalysis.totalDebt}
${analysis.debtAnalysis.totalInterest}
Debt-to-Income Ratio: ${analysis.debtAnalysis.debtToIncomeRatio}

PRIORITY RANKING
${analysis.debtAnalysis.priorityRanking.map(priority => 
  `• ${priority.debtName}: ${priority.priority} Priority - ${priority.reason}`
).join('\n')}

RECOMMENDED STRATEGY: ${analysis.recommendedStrategy.name}
Reason: ${analysis.recommendedStrategy.reason}

MONTHLY BREAKDOWN
${analysis.recommendedStrategy.monthlyBreakdown.map(item => 
  `• ${item.debtName}: ${item.amount} (Priority: ${item.priority})`
).join('\n')}

TIMELINE
Short Term (3-6 months): ${analysis.recommendedStrategy.timeline.shortTerm}
Medium Term (6-12 months): ${analysis.recommendedStrategy.timeline.mediumTerm}
Long Term (1+ years): ${analysis.recommendedStrategy.timeline.longTerm}

RISK ASSESSMENT
Current Risk Level: ${analysis.riskAssessment.currentRisk}
Risk Factors:
${analysis.riskAssessment.riskFactors.map(factor => `• ${factor}`).join('\n')}

Mitigation Strategies:
${analysis.riskAssessment.mitigationStrategies.map(strategy => `• ${strategy}`).join('\n')}

ADDITIONAL RECOMMENDATIONS
${analysis.additionalRecommendations.map(rec => `• ${rec}`).join('\n')}

EMERGENCY PLAN
Recommended Emergency Fund: ${analysis.emergencyPlan.emergencyFund}
Debt Pause Strategy: ${analysis.emergencyPlan.debtPauseStrategy}

REPAYMENT STRATEGIES COMPARISON
${analysis.repaymentStrategies.map(strategy => `
${strategy.name}
${strategy.description}
Estimated Payoff Time: ${strategy.estimatedPayoffTime}
Total Interest Paid: ${strategy.totalInterestPaid}
Interest Savings: ${strategy.savings}
`).join('\n')}

Generated on: ${new Date().toLocaleDateString()}
This report is for educational purposes only. Please consult with a qualified financial advisor for personalized advice.
  `.trim();
};

export const createDebtHTML = (debtData: DebtData, analysis: DebtManagementAnalysis, formatCurrency: (amount: number) => string) => {
  const metrics = calculateBasicDebtMetrics(debtData);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Debt Management Analysis</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #2c5aa0; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        .highlight { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .debt-item { background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin: 10px 0; }
        .strategy { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .recommendations { background: #fff3cd; padding: 15px; border-radius: 5px; }
        .risk-high { color: #dc3545; }
        .risk-medium { color: #ffc107; }
        .risk-low { color: #28a745; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Debt Management Analysis Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="section">
        <h2>Executive Summary</h2>
        <p>${analysis.executiveSummary}</p>
      </div>
      
      <div class="section">
        <h2>Debt Overview</h2>
        <div class="grid">
          <div class="highlight">
            <h3>Total Outstanding Debt</h3>
            <h2>${formatCurrency(metrics.totalDebt)}</h2>
          </div>
          <div class="highlight">
            <h3>Monthly Budget</h3>
            <h2>${formatCurrency(metrics.monthlyBudget)}</h2>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>Recommended Strategy: ${analysis.recommendedStrategy.name}</h2>
        <p><strong>Reason:</strong> ${analysis.recommendedStrategy.reason}</p>
        
        <h3>Monthly Payment Breakdown</h3>
        ${analysis.recommendedStrategy.monthlyBreakdown.map(item => `
          <div class="debt-item">
            <strong>${item.debtName}</strong><br>
            Amount: ${item.amount} | Priority: ${item.priority}
          </div>
        `).join('')}
      </div>
      
      <div class="section">
        <h2>Risk Assessment</h2>
        <p><strong>Current Risk Level:</strong> <span class="risk-${analysis.riskAssessment.currentRisk.toLowerCase()}">${analysis.riskAssessment.currentRisk}</span></p>
        
        <h3>Risk Factors</h3>
        <ul>
          ${analysis.riskAssessment.riskFactors.map(factor => `<li>${factor}</li>`).join('')}
        </ul>
        
        <h3>Mitigation Strategies</h3>
        <ul>
          ${analysis.riskAssessment.mitigationStrategies.map(strategy => `<li>${strategy}</li>`).join('')}
        </ul>
      </div>
      
      <div class="section">
        <h2>Timeline Goals</h2>
        <div class="grid">
          <div class="highlight">
            <h3>Short Term (3-6 months)</h3>
            <p>${analysis.recommendedStrategy.timeline.shortTerm}</p>
          </div>
          <div class="highlight">
            <h3>Medium Term (6-12 months)</h3>
            <p>${analysis.recommendedStrategy.timeline.mediumTerm}</p>
          </div>
        </div>
        <div class="highlight">
          <h3>Long Term (1+ years)</h3>
          <p>${analysis.recommendedStrategy.timeline.longTerm}</p>
        </div>
      </div>
      
      <div class="section">
        <div class="recommendations">
          <h2>Additional Recommendations</h2>
          <ul>
            ${analysis.additionalRecommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
      </div>
      
      <div class="section">
        <h2>Emergency Plan</h2>
        <div class="highlight">
          <p><strong>Recommended Emergency Fund:</strong> ${analysis.emergencyPlan.emergencyFund}</p>
          <p><strong>Debt Pause Strategy:</strong> ${analysis.emergencyPlan.debtPauseStrategy}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}; 
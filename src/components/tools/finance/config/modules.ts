import { FinanceModule } from '../types';

export const financeModules: FinanceModule[] = [
  {
    id: 'general-health',
    title: 'General Financial Health',
    description: 'Assess your overall financial well-being and get personalized recommendations.',
    complexity: 'Basic',
    duration: '10-15 minutes',
    features: [
      'Income and expense analysis',
      'Financial health score',
      'Personalized recommendations',
      'Budget planning assistance'
    ],
    status: 'Available'
  },
  {
    id: 'investment-planning',
    title: 'Investment Planning',
    description: 'Create a comprehensive investment strategy aligned with your goals.',
    complexity: 'Intermediate',
    duration: '15-20 minutes',
    features: [
      'Risk tolerance assessment',
      'Asset allocation suggestions',
      'Investment timeline planning',
      'Portfolio diversification tips'
    ],
    status: 'Available'
  },
  {
    id: 'retirement-planning',
    title: 'Retirement Planning',
    description: 'Plan your retirement and ensure financial security in your golden years.',
    complexity: 'Advanced',
    duration: '20-25 minutes',
    features: [
      'Retirement savings calculator',
      'Social security estimation',
      'Retirement lifestyle planning',
      'Required savings analysis'
    ],
    status: 'Available'
  },
  {
    id: 'debt-management',
    title: 'Debt Management',
    description: 'Analyze and optimize your debt repayment strategy.',
    complexity: 'Intermediate',
    duration: '15-20 minutes',
    features: [
      'Debt consolidation analysis',
      'Repayment strategy optimization',
      'Interest savings calculator',
      'Debt-free timeline projection'
    ],
    status: 'Available'
  },
  {
    id: 'emergency-fund',
    title: 'Emergency Fund Planning',
    description: 'Build and maintain an adequate emergency fund.',
    complexity: 'Basic',
    duration: '10-15 minutes',
    features: [
      'Emergency fund calculator',
      'Savings timeline planner',
      'Risk assessment',
      'Savings strategies'
    ],
    status: 'Available'
  },
  {
    id: 'tax-planning',
    title: 'Tax Planning',
    description: 'Optimize your tax strategy and maximize deductions.',
    complexity: 'Advanced',
    duration: '20-25 minutes',
    features: [
      'Tax bracket analysis',
      'Deduction optimizer',
      'Tax-saving strategies',
      'Investment tax impact'
    ],
    status: 'Available'
  },
  {
    id: 'insurance-analysis',
    title: 'Insurance Analysis',
    description: 'Evaluate your insurance needs and coverage gaps.',
    complexity: 'Intermediate',
    duration: '15-20 minutes',
    features: [
      'Coverage gap analysis',
      'Premium comparison',
      'Policy recommendations',
      'Risk assessment'
    ],
    status: 'Available'
  },
  {
    id: 'estate-planning',
    title: 'Estate Planning',
    description: 'Plan your estate and ensure your legacy.',
    complexity: 'Advanced',
    duration: '25-30 minutes',
    features: [
      'Estate value calculator',
      'Legacy planning tools',
      'Tax impact analysis',
      'Beneficiary planning'
    ],
    status: 'Beta'
  },
  {
    id: 'scenario-planning',
    title: 'Financial Scenario Planning',
    description: 'Analyze different financial scenarios and their impacts.',
    complexity: 'Advanced',
    duration: '20-25 minutes',
    features: [
      'What-if analysis',
      'Multiple scenario comparison',
      'Risk assessment',
      'Impact projections'
    ],
    status: 'Coming Soon'
  }
]; 
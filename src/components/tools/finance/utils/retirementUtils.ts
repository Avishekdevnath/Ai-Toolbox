// Utility functions and constants for Retirement Planning

export interface RetirementData {
  current_age: string;
  retirement_age: string;
  life_expectancy: string;
  current_income: string;
  profession: string;
  years_experience: string;
  industry: string;
  education_level: string;
  side_income: string;
  current_savings: string;
  monthly_contribution: string;
  employer_match: string;
  expected_return: string;
  inflation_rate: string;
  salary_increase: string;
  desired_retirement_income: string;
  social_security_benefit: string;
  pension_income: string;
}

export interface RetirementProjection {
  requiredSavings: number;
  monthlyRequired: number;
  currentTrajectory: number;
  gap: number;
  yearsToRetirement: number;
  incomeGrowthPotential: number;
  recommendedActions: string[];
  aiAnalysis?: {
    retirementReadiness: {
      score: number;
      level: string;
      summary: string;
    };
    financialProjection: {
      yearsToRetirement: number;
      requiredSavings: number;
      currentTrajectory: number;
      gap: number;
      monthlyRequired: number;
      incomeGrowthPotential: number;
    };
    professionInsights: {
      growthPotential: string;
      sideIncomeOpportunities: string;
      careerAdvice: string;
    };
    investmentStrategy: {
      portfolioAllocation: {
        stocks: number;
        bonds: number;
        realEstate: number;
        cash: number;
      };
      riskAssessment: string;
      rebalancingSchedule: string;
    };
    actionPlan: {
      immediate: string[];
      shortTerm: string[];
      longTerm: string[];
    };
    scenarioAnalysis: {
      conservative: {
        description: string;
        projectedSavings: number;
        risk: string;
      };
      moderate: {
        description: string;
        projectedSavings: number;
        risk: string;
      };
      aggressive: {
        description: string;
        projectedSavings: number;
        risk: string;
      };
    };
    keyRecommendations: Array<{
      title: string;
      description: string;
      priority: string;
      impact: string;
    }>;
    riskFactors: string[];
    summaryMessage: string;
  };
}

export const professionTips = {
  technology: {
    tips: [
      'Consider specializing in high-demand areas like AI, cybersecurity, or cloud computing',
      'Pursue certifications (AWS, Azure, Google Cloud) for higher earning potential',
      'Explore remote work opportunities for better work-life balance',
      'Consider freelance consulting on the side',
      'Stay updated with latest technologies and frameworks',
    ],
    avgGrowth: '8-12%',
    sideIncome: 'Freelance development, online courses, tech consulting',
  },
  healthcare: {
    tips: [
      'Specialize in high-demand areas like telemedicine or geriatric care',
      'Consider advanced certifications or specializations',
      'Explore locum tenens opportunities for higher pay',
      'Develop expertise in emerging healthcare technologies',
      'Consider teaching or training roles',
    ],
    avgGrowth: '6-10%',
    sideIncome: 'Telemedicine, medical writing, health consulting',
  },
  finance: {
    tips: [
      'Pursue professional certifications (CFA, CPA, CFP)',
      'Specialize in emerging areas like fintech or ESG investing',
      'Build expertise in data analysis and financial modeling',
      'Consider starting a financial advisory practice',
      'Explore investment banking or private equity opportunities',
    ],
    avgGrowth: '7-11%',
    sideIncome: 'Financial consulting, investment advisory, teaching',
  },
  education: {
    tips: [
      'Pursue advanced degrees or specialized certifications',
      'Consider online teaching or corporate training',
      'Develop expertise in educational technology',
      'Explore international teaching opportunities',
      'Consider educational consulting or curriculum development',
    ],
    avgGrowth: '4-7%',
    sideIncome: 'Online tutoring, course creation, educational consulting',
  },
  marketing: {
    tips: [
      'Specialize in digital marketing and data analytics',
      'Build expertise in emerging platforms and technologies',
      'Consider starting your own agency or consultancy',
      'Develop skills in marketing automation and AI tools',
      'Explore international markets and remote opportunities',
    ],
    avgGrowth: '6-9%',
    sideIncome: 'Freelance marketing, consulting, course creation',
  },
  sales: {
    tips: [
      'Focus on high-value B2B sales or enterprise solutions',
      'Develop expertise in consultative selling techniques',
      'Consider moving into sales management or training',
      'Build a strong network and referral system',
      'Explore commission-based opportunities with higher earning potential',
    ],
    avgGrowth: '5-8%',
    sideIncome: 'Sales training, consulting, affiliate marketing',
  },
  engineering: {
    tips: [
      'Specialize in emerging fields like renewable energy or robotics',
      'Pursue advanced degrees or professional certifications',
      'Consider project management or technical leadership roles',
      'Explore international opportunities in growing markets',
      'Develop expertise in sustainable engineering practices',
    ],
    avgGrowth: '7-10%',
    sideIncome: 'Technical consulting, patent work, teaching',
  },
  other: {
    tips: [
      'Identify high-demand skills in your industry',
      'Pursue professional development and certifications',
      'Consider starting your own business or consultancy',
      'Explore remote work opportunities',
      'Build a strong professional network',
    ],
    avgGrowth: '4-6%',
    sideIncome: 'Consulting, freelancing, online business',
  },
};

export function getProfessionTips(profession: string) {
  const key = profession.toLowerCase();
  for (const [k, value] of Object.entries(professionTips)) {
    if (key.includes(k)) {
      return value;
    }
  }
  return professionTips.other;
}

export function calculateRetirementNeeds(formData: RetirementData, formatCurrency: (amount: number) => string): RetirementProjection {
  const currentAge = parseFloat(formData.current_age);
  const retirementAge = parseFloat(formData.retirement_age);
  const lifeExpectancy = parseFloat(formData.life_expectancy);
  const currentSavings = parseFloat(formData.current_savings);
  const monthlyContribution = parseFloat(formData.monthly_contribution);
  const employerMatch = parseFloat(formData.employer_match || '0');
  const expectedReturn = parseFloat(formData.expected_return) / 100;
  const inflationRate = parseFloat(formData.inflation_rate) / 100;
  const desiredIncome = parseFloat(formData.desired_retirement_income);
  const socialSecurity = parseFloat(formData.social_security_benefit || '0');
  const pension = parseFloat(formData.pension_income || '0');
  const yearsExperience = parseFloat(formData.years_experience || '0');
  const sideIncome = parseFloat(formData.side_income || '0');

  const yearsToRetirement = retirementAge - currentAge;
  const yearsInRetirement = lifeExpectancy - retirementAge;

  // Calculate real rate of return (adjusted for inflation)
  const realReturn = (1 + expectedReturn) / (1 + inflationRate) - 1;

  // Calculate total annual retirement income needed
  const totalAnnualNeed = desiredIncome - (socialSecurity + pension);

  // Calculate required savings using the 4% rule as a baseline
  const requiredSavings = totalAnnualNeed * 25;

  // Calculate future value of current savings
  const futureValueCurrentSavings = currentSavings * Math.pow(1 + realReturn, yearsToRetirement);

  // Calculate future value of monthly contributions
  const monthlyTotal = monthlyContribution * (1 + employerMatch / 100);
  const futureValueContributions = monthlyTotal * 12 * ((Math.pow(1 + realReturn, yearsToRetirement) - 1) / realReturn);

  const currentTrajectory = futureValueCurrentSavings + futureValueContributions;
  const gap = requiredSavings - currentTrajectory;

  // Calculate required monthly savings to close the gap
  const additionalMonthlySavings = gap > 0
    ? (gap * realReturn) / (12 * (Math.pow(1 + realReturn, yearsToRetirement) - 1))
    : 0;

  const monthlyRequired = monthlyTotal + additionalMonthlySavings;

  // Calculate income growth potential based on profession and experience
  const professionData = getProfessionTips(formData.profession);
  const avgGrowthRate = parseFloat(professionData.avgGrowth.split('-')[1]) / 100;
  const incomeGrowthPotential = parseFloat(formData.current_income) * Math.pow(1 + avgGrowthRate, yearsToRetirement);

  // Generate recommended actions
  const recommendedActions = [
    `Increase monthly savings by ${formatCurrency(additionalMonthlySavings)} to meet your retirement goals`,
    `Consider developing side income through ${professionData.sideIncome}`,
    'Maximize employer retirement contributions and take advantage of catch-up contributions',
    'Diversify your investment portfolio to balance risk and return',
    'Regularly review and adjust your retirement plan as your circumstances change',
  ];

  return {
    requiredSavings,
    monthlyRequired,
    currentTrajectory,
    gap,
    yearsToRetirement,
    incomeGrowthPotential,
    recommendedActions,
  };
} 
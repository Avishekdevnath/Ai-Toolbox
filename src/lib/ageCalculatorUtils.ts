export interface AgeData {
  birthDate: Date;
  currentDate: Date;
  age: {
    years: number;
    months: number;
    days: number;
    totalDays: number;
  };
}

export interface LifeMilestone {
  age: number;
  category: 'personal' | 'career' | 'health' | 'financial' | 'social';
  title: string;
  description: string;
  achieved: boolean;
  yearsUntil: number;
  importance: 'low' | 'medium' | 'high';
}

export interface HealthRecommendation {
  category: 'physical' | 'mental' | 'preventive' | 'nutrition';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  frequency: string;
  benefits: string[];
}

export interface RetirementPlan {
  currentAge: number;
  retirementAge: number;
  yearsUntilRetirement: number;
  estimatedLifeExpectancy: number;
  retirementYears: number;
  monthlySavingsNeeded: number;
  totalSavingsNeeded: number;
  currentSavings: number;
  investmentReturn: number;
}

export interface LifeExpectancy {
  overall: number;
  factors: {
    gender: number;
    lifestyle: number;
    health: number;
    genetics: number;
    location: number;
  };
  recommendations: string[];
}

export interface AgeBasedActivity {
  category: 'physical' | 'mental' | 'social' | 'learning' | 'hobby';
  title: string;
  description: string;
  ageRange: string;
  benefits: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date, currentDate: Date = new Date()): AgeData {
  const diffTime = Math.abs(currentDate.getTime() - birthDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const years = Math.floor(diffDays / 365.25);
  const months = Math.floor((diffDays % 365.25) / 30.44);
  const days = Math.floor(diffDays % 30.44);
  
  return {
    birthDate,
    currentDate,
    age: {
      years,
      months,
      days,
      totalDays: diffDays
    }
  };
}

/**
 * Generate life milestones based on age
 */
export function generateLifeMilestones(age: number): LifeMilestone[] {
  const milestones: LifeMilestone[] = [];
  const currentYear = new Date().getFullYear();
  
  // Personal milestones
  if (age < 18) {
    milestones.push({
      age: 18,
      category: 'personal',
      title: 'Legal Adult',
      description: 'Become a legal adult with full rights and responsibilities',
      achieved: age >= 18,
      yearsUntil: Math.max(0, 18 - age),
      importance: 'high'
    });
  }
  
  if (age < 21) {
    milestones.push({
      age: 21,
      category: 'personal',
      title: 'Full Legal Rights',
      description: 'Gain full legal rights including voting and drinking',
      achieved: age >= 21,
      yearsUntil: Math.max(0, 21 - age),
      importance: 'high'
    });
  }
  
  if (age < 25) {
    milestones.push({
      age: 25,
      category: 'health',
      title: 'Brain Development Complete',
      description: 'Prefrontal cortex fully developed',
      achieved: age >= 25,
      yearsUntil: Math.max(0, 25 - age),
      importance: 'medium'
    });
  }
  
  if (age < 30) {
    milestones.push({
      age: 30,
      category: 'career',
      title: 'Career Foundation',
      description: 'Establish career foundation and professional identity',
      achieved: age >= 30,
      yearsUntil: Math.max(0, 30 - age),
      importance: 'high'
    });
  }
  
  if (age < 35) {
    milestones.push({
      age: 35,
      category: 'financial',
      title: 'Financial Stability',
      description: 'Achieve financial stability and emergency fund',
      achieved: age >= 35,
      yearsUntil: Math.max(0, 35 - age),
      importance: 'high'
    });
  }
  
  if (age < 40) {
    milestones.push({
      age: 40,
      category: 'health',
      title: 'Midlife Health Check',
      description: 'Comprehensive health assessment and screening',
      achieved: age >= 40,
      yearsUntil: Math.max(0, 40 - age),
      importance: 'high'
    });
  }
  
  if (age < 50) {
    milestones.push({
      age: 50,
      category: 'health',
      title: 'Colon Cancer Screening',
      description: 'Begin regular colon cancer screening',
      achieved: age >= 50,
      yearsUntil: Math.max(0, 50 - age),
      importance: 'high'
    });
  }
  
  if (age < 65) {
    milestones.push({
      age: 65,
      category: 'financial',
      title: 'Medicare Eligibility',
      description: 'Become eligible for Medicare benefits',
      achieved: age >= 65,
      yearsUntil: Math.max(0, 65 - age),
      importance: 'high'
    });
  }
  
  return milestones;
}

/**
 * Generate health recommendations based on age
 */
export function generateHealthRecommendations(age: number): HealthRecommendation[] {
  const recommendations: HealthRecommendation[] = [];
  
  // Physical health
  if (age < 30) {
    recommendations.push({
      category: 'physical',
      title: 'Build Exercise Foundation',
      description: 'Establish regular exercise routine for long-term health',
      priority: 'high',
      frequency: '3-5 times per week',
      benefits: ['Improved cardiovascular health', 'Better sleep', 'Stress reduction']
    });
  } else if (age < 50) {
    recommendations.push({
      category: 'physical',
      title: 'Maintain Muscle Mass',
      description: 'Focus on strength training to prevent muscle loss',
      priority: 'high',
      frequency: '2-3 times per week',
      benefits: ['Prevent sarcopenia', 'Better metabolism', 'Improved balance']
    });
  } else {
    recommendations.push({
      category: 'physical',
      title: 'Low-Impact Exercise',
      description: 'Focus on walking, swimming, and gentle strength training',
      priority: 'high',
      frequency: 'Daily',
      benefits: ['Joint health', 'Cardiovascular fitness', 'Mental well-being']
    });
  }
  
  // Mental health
  recommendations.push({
    category: 'mental',
    title: 'Stress Management',
    description: 'Practice mindfulness, meditation, or other stress-reduction techniques',
    priority: 'high',
    frequency: 'Daily',
    benefits: ['Reduced anxiety', 'Better sleep', 'Improved focus']
  });
  
  // Preventive care
  if (age >= 18) {
    recommendations.push({
      category: 'preventive',
      title: 'Annual Physical',
      description: 'Regular health check-ups with your primary care physician',
      priority: 'high',
      frequency: 'Yearly',
      benefits: ['Early disease detection', 'Preventive care', 'Health monitoring']
    });
  }
  
  if (age >= 40) {
    recommendations.push({
      category: 'preventive',
      title: 'Heart Health Screening',
      description: 'Regular cardiovascular health assessments',
      priority: 'high',
      frequency: 'Every 2-3 years',
      benefits: ['Early heart disease detection', 'Risk factor management']
    });
  }
  
  // Nutrition
  recommendations.push({
    category: 'nutrition',
    title: 'Balanced Diet',
    description: 'Focus on whole foods, fruits, vegetables, and lean proteins',
    priority: 'high',
    frequency: 'Daily',
    benefits: ['Better energy', 'Disease prevention', 'Healthy weight']
  });
  
  return recommendations;
}

/**
 * Calculate retirement planning
 */
export function calculateRetirementPlan(
  currentAge: number,
  retirementAge: number = 65,
  currentSavings: number = 0,
  monthlyIncome: number = 5000,
  desiredRetirementIncome: number = 4000,
  investmentReturn: number = 0.07
): RetirementPlan {
  const yearsUntilRetirement = retirementAge - currentAge;
  const estimatedLifeExpectancy = 85; // Can be customized
  const retirementYears = estimatedLifeExpectancy - retirementAge;
  
  // Calculate total savings needed
  const annualRetirementIncome = desiredRetirementIncome * 12;
  const totalSavingsNeeded = annualRetirementIncome * retirementYears;
  
  // Calculate monthly savings needed
  const futureValue = currentSavings * Math.pow(1 + investmentReturn, yearsUntilRetirement);
  const additionalSavingsNeeded = totalSavingsNeeded - futureValue;
  const monthlySavingsNeeded = additionalSavingsNeeded / 
    (Math.pow(1 + investmentReturn, yearsUntilRetirement) - 1) * (investmentReturn / 12);
  
  return {
    currentAge,
    retirementAge,
    yearsUntilRetirement,
    estimatedLifeExpectancy,
    retirementYears,
    monthlySavingsNeeded: Math.max(0, monthlySavingsNeeded),
    totalSavingsNeeded,
    currentSavings,
    investmentReturn
  };
}

/**
 * Calculate life expectancy based on various factors
 */
export function calculateLifeExpectancy(
  age: number,
  gender: 'male' | 'female',
  lifestyle: 'poor' | 'average' | 'excellent',
  healthConditions: string[] = []
): LifeExpectancy {
  // Base life expectancy (US averages)
  let baseExpectancy = gender === 'male' ? 76 : 81;
  
  // Adjust for current age
  baseExpectancy = baseExpectancy + (age * 0.1);
  
  // Lifestyle adjustments
  const lifestyleAdjustments = {
    poor: -5,
    average: 0,
    excellent: +8
  };
  
  baseExpectancy += lifestyleAdjustments[lifestyle];
  
  // Health condition adjustments
  const healthAdjustments = healthConditions.reduce((total, condition) => {
    const adjustments: { [key: string]: number } = {
      'diabetes': -5,
      'heart disease': -8,
      'cancer': -10,
      'obesity': -3,
      'smoking': -7,
      'alcoholism': -5
    };
    return total + (adjustments[condition] || 0);
  }, 0);
  
  baseExpectancy += healthAdjustments;
  
  const factors = {
    gender: gender === 'male' ? -5 : 0,
    lifestyle: lifestyleAdjustments[lifestyle],
    health: healthAdjustments,
    genetics: 0, // Would need family history
    location: 0  // Would need location data
  };
  
  const recommendations = [];
  if (lifestyle === 'poor') {
    recommendations.push('Improve diet and exercise habits');
  }
  if (healthConditions.includes('smoking')) {
    recommendations.push('Quit smoking to add 7+ years to life expectancy');
  }
  if (healthConditions.includes('obesity')) {
    recommendations.push('Achieve healthy weight through diet and exercise');
  }
  
  return {
    overall: Math.round(baseExpectancy),
    factors,
    recommendations
  };
}

/**
 * Generate age-appropriate activities
 */
export function generateAgeBasedActivities(age: number): AgeBasedActivity[] {
  const activities: AgeBasedActivity[] = [];
  
  if (age < 30) {
    activities.push(
      {
        category: 'physical',
        title: 'High-Intensity Training',
        description: 'HIIT workouts for maximum fitness gains',
        ageRange: '18-30',
        benefits: ['Peak fitness', 'Metabolism boost', 'Stress relief'],
        difficulty: 'advanced'
      },
      {
        category: 'learning',
        title: 'Skill Development',
        description: 'Learn new professional skills and certifications',
        ageRange: '18-30',
        benefits: ['Career advancement', 'Personal growth', 'Networking'],
        difficulty: 'intermediate'
      }
    );
  } else if (age < 50) {
    activities.push(
      {
        category: 'physical',
        title: 'Strength Training',
        description: 'Moderate strength training to maintain muscle mass',
        ageRange: '30-50',
        benefits: ['Muscle preservation', 'Bone health', 'Metabolism'],
        difficulty: 'intermediate'
      },
      {
        category: 'social',
        title: 'Community Involvement',
        description: 'Join clubs, volunteer, or participate in community events',
        ageRange: '30-50',
        benefits: ['Social connections', 'Purpose', 'Mental health'],
        difficulty: 'beginner'
      }
    );
  } else {
    activities.push(
      {
        category: 'physical',
        title: 'Walking and Swimming',
        description: 'Low-impact exercises for joint health',
        ageRange: '50+',
        benefits: ['Cardiovascular health', 'Joint protection', 'Mental clarity'],
        difficulty: 'beginner'
      },
      {
        category: 'hobby',
        title: 'Creative Pursuits',
        description: 'Painting, writing, gardening, or other creative activities',
        ageRange: '50+',
        benefits: ['Cognitive health', 'Stress reduction', 'Personal fulfillment'],
        difficulty: 'beginner'
      }
    );
  }
  
  // Universal activities
  activities.push(
    {
      category: 'mental',
      title: 'Mindfulness Practice',
      description: 'Meditation, yoga, or other mindfulness activities',
      ageRange: 'All ages',
      benefits: ['Stress reduction', 'Mental clarity', 'Emotional balance'],
      difficulty: 'beginner'
    },
    {
      category: 'learning',
      title: 'Lifelong Learning',
      description: 'Take courses, read books, or learn new skills',
      ageRange: 'All ages',
      benefits: ['Cognitive health', 'Personal growth', 'Social engagement'],
      difficulty: 'beginner'
    }
  );
  
  return activities;
}

/**
 * Calculate percentage of life lived
 */
export function calculateLifePercentage(age: number, lifeExpectancy: number): number {
  return Math.min(100, Math.max(0, (age / lifeExpectancy) * 100));
}

/**
 * Generate next birthday information
 */
export function getNextBirthday(birthDate: Date): {
  nextBirthday: Date;
  daysUntil: number;
  ageAtNextBirthday: number;
} {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // This year's birthday
  const thisYearBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
  
  // If this year's birthday has passed, calculate next year's
  const nextBirthday = now > thisYearBirthday 
    ? new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate())
    : thisYearBirthday;
  
  const daysUntil = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const ageAtNextBirthday = nextBirthday.getFullYear() - birthDate.getFullYear();
  
  return {
    nextBirthday,
    daysUntil,
    ageAtNextBirthday
  };
} 
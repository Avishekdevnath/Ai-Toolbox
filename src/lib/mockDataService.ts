// Mock Data Service for AI Toolbox
// Provides realistic mock data for all tools when APIs are unavailable

export interface MockAnalysisHistory {
  _id: string;
  userId: string;
  clerkId: string;
  analysisType: string;
  toolSlug: string;
  toolName: string;
  inputData: Record<string, any>;
  result: Record<string, any>;
  metadata: {
    processingTime: number;
    tokensUsed?: number;
    model?: string;
    cost?: number;
  };
  status: 'completed' | 'failed' | 'processing';
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockToolUsage {
  _id: string;
  toolSlug: string;
  toolName: string;
  userId?: string;
  clerkId?: string;
  isAnonymous: boolean;
  userAgent: string;
  ipAddress: string;
  processingTime: number;
  tokensUsed?: number;
  cost?: number;
  status: 'success' | 'failed';
  createdAt: string;
}

export interface MockUserStats {
  totalAnalyses: number;
  totalTokens: number;
  totalCost: number;
  favoriteTool: string;
  lastActivity: string;
  toolsUsed: Array<{
    toolSlug: string;
    toolName: string;
    usageCount: number;
    lastUsed: string;
  }>;
  monthlyUsage: Array<{
    month: string;
    analyses: number;
    tokens: number;
    cost: number;
  }>;
}

export class MockDataService {
  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private static randomDate(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  }

  private static randomChoice<T>(choices: T[]): T {
    return choices[Math.floor(Math.random() * choices.length)];
  }

  // SWOT Analysis Mock Data
  static getSwotAnalysisHistory(): MockAnalysisHistory[] {
    const companies = [
      'TechCorp Solutions',
      'GreenEnergy Inc',
      'HealthTech Pro',
      'EduTech Innovations',
      'FinTech Startup',
      'EcoFriendly Products',
      'SmartHome Systems',
      'Digital Marketing Agency'
    ];

    const industries = [
      'Technology',
      'Healthcare',
      'Education',
      'Finance',
      'Manufacturing',
      'Retail',
      'Consulting',
      'Real Estate'
    ];

    return Array.from({ length: 8 }, (_, i) => ({
      _id: this.generateId(),
      userId: 'user_123',
      clerkId: 'clerk_123',
      analysisType: 'swot',
      toolSlug: 'swot-analysis',
      toolName: 'SWOT Analysis',
      inputData: {
        companyName: companies[i],
        industry: industries[i],
        description: `A ${industries[i].toLowerCase()} company specializing in innovative solutions`
      },
      result: {
        strengths: [
          'Strong technical expertise',
          'Innovative product portfolio',
          'Experienced leadership team',
          'Good market positioning'
        ],
        weaknesses: [
          'Limited marketing budget',
          'Small team size',
          'Limited international presence',
          'Dependency on key clients'
        ],
        opportunities: [
          'Growing market demand',
          'Digital transformation trends',
          'Government contracts',
          'Partnership opportunities'
        ],
        threats: [
          'Intense competition',
          'Economic uncertainty',
          'Rapid technology changes',
          'Regulatory challenges'
        ]
      },
      metadata: {
        processingTime: 2.1 + Math.random() * 1.5,
        tokensUsed: 400 + Math.floor(Math.random() * 200),
        model: 'gemini-pro',
        cost: 0.002 + Math.random() * 0.003
      },
      status: 'completed',
      isAnonymous: false,
      createdAt: this.randomDate(i * 2),
      updatedAt: this.randomDate(i * 2)
    }));
  }

  // Finance Analysis Mock Data
  static getFinanceAnalysisHistory(): MockAnalysisHistory[] {
    const scenarios = [
      {
        income: 75000,
        expenses: 45000,
        savings: 15000,
        goals: ['Buy a house', 'Save for retirement', 'Emergency fund']
      },
      {
        income: 120000,
        expenses: 80000,
        savings: 25000,
        goals: ['Investment portfolio', 'Vacation fund', 'Home renovation']
      },
      {
        income: 95000,
        expenses: 60000,
        savings: 20000,
        goals: ['Debt payoff', 'Emergency fund', 'Investment']
      }
    ];

    return scenarios.map((scenario, i) => ({
      _id: this.generateId(),
      userId: 'user_123',
      clerkId: 'clerk_123',
      analysisType: 'finance',
      toolSlug: 'finance-advisor',
      toolName: 'Finance Advisor',
      inputData: scenario,
      result: {
        budget: {
          housing: scenario.income * 0.3,
          transportation: scenario.income * 0.15,
          food: scenario.income * 0.12,
          utilities: scenario.income * 0.08,
          entertainment: scenario.income * 0.10,
          savings: scenario.income * 0.25
        },
        recommendations: [
          'Increase emergency fund to 6 months of expenses',
          'Consider investing in index funds',
          'Review insurance coverage',
          'Create a debt payoff strategy'
        ],
        savingsRate: ((scenario.savings / scenario.income) * 100).toFixed(1) + '%'
      },
      metadata: {
        processingTime: 1.8 + Math.random() * 1.2,
        tokensUsed: 300 + Math.floor(Math.random() * 150),
        model: 'gemini-pro',
        cost: 0.001 + Math.random() * 0.002
      },
      status: 'completed',
      isAnonymous: false,
      createdAt: this.randomDate(i * 3),
      updatedAt: this.randomDate(i * 3)
    }));
  }

  // Diet Analysis Mock Data
  static getDietAnalysisHistory(): MockAnalysisHistory[] {
    const profiles = [
      {
        age: 28,
        weight: 70,
        height: 175,
        activityLevel: 'moderate',
        goals: 'weight_loss',
        preferences: ['vegetarian', 'low_carb']
      },
      {
        age: 35,
        weight: 85,
        height: 180,
        activityLevel: 'active',
        goals: 'muscle_gain',
        preferences: ['high_protein', 'gluten_free']
      },
      {
        age: 42,
        weight: 65,
        height: 165,
        activityLevel: 'sedentary',
        goals: 'maintenance',
        preferences: ['balanced', 'organic']
      }
    ];

    return profiles.map((profile, i) => ({
      _id: this.generateId(),
      userId: 'user_123',
      clerkId: 'clerk_123',
      analysisType: 'diet',
      toolSlug: 'diet-planner',
      toolName: 'Diet Planner',
      inputData: profile,
      result: {
        dailyCalories: 1800 + (i * 200),
        macronutrients: {
          protein: 135 + (i * 20),
          carbs: 135 + (i * 15),
          fat: 60 + (i * 10)
        },
        mealPlan: {
          breakfast: [
            'Greek yogurt with berries and nuts',
            'Protein smoothie with banana',
            'Oatmeal with fruits and seeds'
          ][i],
          lunch: [
            'Quinoa salad with vegetables',
            'Grilled chicken with rice',
            'Tuna sandwich with avocado'
          ][i],
          dinner: [
            'Grilled tofu with steamed vegetables',
            'Salmon with sweet potato',
            'Lentil soup with bread'
          ][i],
          snacks: [
            ['Apple with almond butter', 'Carrot sticks'],
            ['Protein bar', 'Greek yogurt'],
            ['Mixed nuts', 'Dark chocolate']
          ][i]
        },
        recommendations: [
          'Stay hydrated with 8-10 glasses of water daily',
          'Include protein in every meal',
          'Eat slowly and mindfully',
          'Plan meals ahead of time'
        ]
      },
      metadata: {
        processingTime: 2.1 + Math.random() * 1.0,
        tokensUsed: 350 + Math.floor(Math.random() * 100),
        model: 'gemini-pro',
        cost: 0.002 + Math.random() * 0.001
      },
      status: 'completed',
      isAnonymous: false,
      createdAt: this.randomDate(i * 4),
      updatedAt: this.randomDate(i * 4)
    }));
  }

  // Resume Analysis Mock Data
  static getResumeAnalysisHistory(): MockAnalysisHistory[] {
    const resumes = [
      {
        resume: 'Software Engineer with 5 years of experience in React, Node.js, and TypeScript...',
        jobTitle: 'Senior Software Engineer',
        company: 'TechCorp'
      },
      {
        resume: 'Marketing Manager with 8 years of experience in digital marketing, SEO, and analytics...',
        jobTitle: 'Marketing Director',
        company: 'Digital Agency'
      },
      {
        resume: 'Data Scientist with 6 years of experience in machine learning, Python, and SQL...',
        jobTitle: 'Senior Data Scientist',
        company: 'AI Startup'
      }
    ];

    return resumes.map((resume, i) => ({
      _id: this.generateId(),
      userId: 'user_123',
      clerkId: 'clerk_123',
      analysisType: 'resume',
      toolSlug: 'resume-reviewer',
      toolName: 'Resume Reviewer',
      inputData: resume,
      result: {
        score: 85 + (i * 5),
        strengths: [
          'Clear experience description',
          'Good technical skills',
          'Quantified achievements',
          'Professional formatting'
        ],
        improvements: [
          'Add more specific metrics',
          'Include relevant certifications',
          'Optimize for ATS keywords',
          'Highlight leadership experience'
        ],
        suggestions: [
          'Add a professional summary',
          'Include project portfolio link',
          'Highlight leadership experience',
          'Add industry-specific keywords'
        ],
        atsScore: 78 + (i * 7)
      },
      metadata: {
        processingTime: 3.2 + Math.random() * 1.5,
        tokensUsed: 500 + Math.floor(Math.random() * 200),
        model: 'gemini-pro',
        cost: 0.003 + Math.random() * 0.002
      },
      status: 'completed',
      isAnonymous: false,
      createdAt: this.randomDate(i * 5),
      updatedAt: this.randomDate(i * 5)
    }));
  }

  // Interview Analysis Mock Data
  static getInterviewAnalysisHistory(): MockAnalysisHistory[] {
    const interviews = [
      {
        position: 'Frontend Developer',
        experience: '3 years',
        skills: ['React', 'TypeScript', 'Node.js']
      },
      {
        position: 'Product Manager',
        experience: '5 years',
        skills: ['Agile', 'User Research', 'Data Analysis']
      },
      {
        position: 'UX Designer',
        experience: '4 years',
        skills: ['Figma', 'User Testing', 'Prototyping']
      }
    ];

    return interviews.map((interview, i) => ({
      _id: this.generateId(),
      userId: 'user_123',
      clerkId: 'clerk_123',
      analysisType: 'interview',
      toolSlug: 'interview-ai',
      toolName: 'Interview AI',
      inputData: interview,
      result: {
        questions: [
          'Explain the difference between useState and useEffect',
          'How would you optimize a React component?',
          'Describe your experience with TypeScript',
          'How do you handle state management?'
        ],
        answers: [
          'useState manages component state while useEffect handles side effects...',
          'I would use React.memo, useMemo, and useCallback for optimization...',
          'I have 2 years of TypeScript experience with strict typing...',
          'I use Redux for global state and local state for component-specific data...'
        ],
        feedback: 'Good technical knowledge, improve communication skills',
        score: 82 + (i * 8),
        areas: {
          technical: 85 + (i * 5),
          communication: 75 + (i * 3),
          problemSolving: 80 + (i * 4),
          cultureFit: 78 + (i * 6)
        }
      },
      metadata: {
        processingTime: 4.1 + Math.random() * 2.0,
        tokensUsed: 650 + Math.floor(Math.random() * 300),
        model: 'gemini-pro',
        cost: 0.004 + Math.random() * 0.003
      },
      status: 'completed',
      isAnonymous: false,
      createdAt: this.randomDate(i * 6),
      updatedAt: this.randomDate(i * 6)
    }));
  }

  // Combined Analysis History
  static getAllAnalysisHistory(): MockAnalysisHistory[] {
    return [
      ...this.getSwotAnalysisHistory(),
      ...this.getFinanceAnalysisHistory(),
      ...this.getDietAnalysisHistory(),
      ...this.getResumeAnalysisHistory(),
      ...this.getInterviewAnalysisHistory()
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Tool Usage Statistics
  static getToolUsageStats(): MockToolUsage[] {
    const tools = [
      { slug: 'swot-analysis', name: 'SWOT Analysis' },
      { slug: 'finance-advisor', name: 'Finance Advisor' },
      { slug: 'diet-planner', name: 'Diet Planner' },
      { slug: 'resume-reviewer', name: 'Resume Reviewer' },
      { slug: 'interview-ai', name: 'Interview AI' },
      { slug: 'qr-generator', name: 'QR Generator' },
      { slug: 'url-shortener', name: 'URL Shortener' },
      { slug: 'unit-converter', name: 'Unit Converter' }
    ];

    return tools.map((tool, i) => ({
      _id: this.generateId(),
      toolSlug: tool.slug,
      toolName: tool.name,
      userId: 'user_123',
      clerkId: 'clerk_123',
      isAnonymous: false,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ipAddress: '192.168.1.' + (100 + i),
      processingTime: 1.5 + Math.random() * 3.0,
      tokensUsed: 200 + Math.floor(Math.random() * 500),
      cost: 0.001 + Math.random() * 0.005,
      status: 'success',
      createdAt: this.randomDate(i * 2)
    }));
  }

  // User Statistics
  static getUserStats(): MockUserStats {
    const tools = [
      { slug: 'swot-analysis', name: 'SWOT Analysis' },
      { slug: 'finance-advisor', name: 'Finance Advisor' },
      { slug: 'diet-planner', name: 'Diet Planner' },
      { slug: 'resume-reviewer', name: 'Resume Reviewer' },
      { slug: 'interview-ai', name: 'Interview AI' }
    ];

    return {
      totalAnalyses: 25,
      totalTokens: 12500,
      totalCost: 0.045,
      favoriteTool: 'SWOT Analysis',
      lastActivity: this.randomDate(1),
      toolsUsed: tools.map((tool, i) => ({
        toolSlug: tool.slug,
        toolName: tool.name,
        usageCount: 3 + Math.floor(Math.random() * 7),
        lastUsed: this.randomDate(i * 2)
      })),
      monthlyUsage: Array.from({ length: 6 }, (_, i) => ({
        month: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
        analyses: 3 + Math.floor(Math.random() * 5),
        tokens: 1500 + Math.floor(Math.random() * 2000),
        cost: 0.005 + Math.random() * 0.015
      })).reverse()
    };
  }

  // Get filtered history
  static getFilteredHistory(
    searchTerm: string = '',
    analysisType: string = 'all',
    status: string = 'all',
    limit: number = 20,
    offset: number = 0
  ): { history: MockAnalysisHistory[], total: number } {
    let history = this.getAllAnalysisHistory();

    // Apply filters
    if (searchTerm) {
      history = history.filter(item =>
        item.toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.analysisType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (analysisType !== 'all') {
      history = history.filter(item => item.analysisType === analysisType);
    }

    if (status !== 'all') {
      history = history.filter(item => item.status === status);
    }

    const total = history.length;
    const paginatedHistory = history.slice(offset, offset + limit);

    return {
      history: paginatedHistory,
      total
    };
  }
} 
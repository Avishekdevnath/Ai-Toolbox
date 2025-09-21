// Types and interfaces for interview functionality
export interface InterviewQuestion {
  id: string;
  questionCode?: string; // stable code for tracking the question across sessions
  category: 'technical' | 'behavioral' | 'problem-solving' | 'industry-specific' | 'personalized' | 'salary';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  expectedKeywords: string[];
  sampleAnswers: string[];
  timeLimit: number; // in seconds
  maxScore: number;
  roleSpecific?: boolean;
  jobRequirements?: string[];
  topic?: string; // New field for topic tracking
  depth?: 'introductory' | 'intermediate' | 'advanced'; // New field for question depth
  context?: string; // New field for question context
  followUpStrategy?: 'explore' | 'deepen' | 'move_on' | 'challenge'; // New field for follow-up strategy
}

export interface InterviewAnswer {
  questionId: string;
  questionCode?: string;
  answer: string;
  timeSpent: number; // in seconds
  timestamp: Date;
}

export interface AnswerEvaluation {
  score: number;
  maxScore: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  aiAnalysis: {
    technicalAccuracy: number;
    communicationSkills: number;
    problemSolving: number;
    confidence: number;
    relevance: number;
  };
  jobFitScore?: number; // How well the answer matches job requirements
  roleCompetencyScore?: number; // Role-specific competency score
  topicAnalysis?: string; // New field for topic-specific analysis
  improvementSuggestions?: string[]; // New field for specific improvement suggestions
  nextSteps?: string; // New field for recommended next steps
}

export interface InterviewSession {
  id: string;
  type: 'technical' | 'behavioral' | 'mixed' | 'role-based' | 'job-specific';
  industry: string;
  position: string;
  difficulty: 'easy' | 'medium' | 'hard';
  totalQuestions: number;
  currentQuestionIndex: number;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'paused';
  totalScore: number;
  maxPossibleScore: number;
  jobRequirements?: string[]; // For job-specific interviews
  roleCompetencies?: string[]; // For role-based interviews
  salaryRange?: string;
  experienceLevel?: string;
}

// Role competency data for different positions and experience levels
export const roleCompetencyData = {
  'Software Engineer': {
    entry: [
      'Basic programming concepts',
      'Data structures and algorithms',
      'Version control (Git)',
      'Basic debugging skills',
      'Understanding of software development lifecycle'
    ],
    mid: [
      'Advanced programming concepts',
      'System design principles',
      'Database design and optimization',
      'API design and development',
      'Testing methodologies',
      'Performance optimization',
      'Code review and mentoring'
    ],
    senior: [
      'Architecture design',
      'Technical leadership',
      'System scalability',
      'Security best practices',
      'Team management',
      'Project planning',
      'Cross-functional collaboration'
    ]
  },
  'Data Scientist': {
    entry: [
      'Statistical analysis',
      'Data manipulation',
      'Basic machine learning',
      'Data visualization',
      'Python/R programming'
    ],
    mid: [
      'Advanced machine learning',
      'Deep learning',
      'Big data technologies',
      'Model deployment',
      'A/B testing',
      'Feature engineering',
      'Data pipeline design'
    ],
    senior: [
      'MLOps and model lifecycle',
      'Advanced statistical modeling',
      'Business strategy alignment',
      'Team leadership',
      'Research and innovation',
      'Stakeholder communication'
    ]
  },
  'Product Manager': {
    entry: [
      'Product strategy basics',
      'User research',
      'Requirements gathering',
      'Agile methodologies',
      'Basic analytics'
    ],
    mid: [
      'Product roadmap planning',
      'Cross-functional leadership',
      'Market analysis',
      'User experience design',
      'Data-driven decision making',
      'Stakeholder management'
    ],
    senior: [
      'Product vision and strategy',
      'Team leadership',
      'Business model development',
      'Strategic partnerships',
      'Executive communication',
      'Product portfolio management'
    ]
  },
  'UX Designer': {
    entry: [
      'Design principles',
      'User research basics',
      'Wireframing and prototyping',
      'Design tools (Figma, Sketch)',
      'Usability testing'
    ],
    mid: [
      'Advanced user research',
      'Information architecture',
      'Interaction design',
      'Design systems',
      'User testing methodologies',
      'Cross-platform design'
    ],
    senior: [
      'Design strategy',
      'Team leadership',
      'Design operations',
      'Stakeholder collaboration',
      'Design thinking facilitation',
      'Innovation and trends'
    ]
  },
  'Marketing Manager': {
    entry: [
      'Marketing fundamentals',
      'Digital marketing channels',
      'Content creation',
      'Basic analytics',
      'Campaign management'
    ],
    mid: [
      'Marketing strategy',
      'Brand management',
      'Customer segmentation',
      'Marketing automation',
      'Performance marketing',
      'Team coordination'
    ],
    senior: [
      'Marketing leadership',
      'Strategic planning',
      'Budget management',
      'Stakeholder relations',
      'Market expansion',
      'Team development'
    ]
  }
};

// Fallback questions for when AI fails
export const fallbackQuestions = {
  'Software Engineer': {
    technical: {
      easy: [
        {
          id: 'fallback_1',
          category: 'technical',
          difficulty: 'easy',
          question: 'What is the difference between let, const, and var in JavaScript?',
          expectedKeywords: ['block scope', 'hoisting', 'reassignment', 'ES6'],
          sampleAnswers: [
            'let and const are block-scoped, var is function-scoped. const cannot be reassigned, let can be reassigned but not redeclared, var can be both reassigned and redeclared.',
            'let and const were introduced in ES6 and have block scope, while var has function scope and is hoisted.'
          ],
          timeLimit: 180,
          maxScore: 10
        },
        {
          id: 'fallback_2',
          category: 'technical',
          difficulty: 'easy',
          question: 'Explain what a REST API is and its main principles.',
          expectedKeywords: ['stateless', 'HTTP methods', 'resources', 'uniform interface'],
          sampleAnswers: [
            'REST is an architectural style for designing networked applications. It uses HTTP methods (GET, POST, PUT, DELETE) and is stateless.',
            'REST APIs follow principles like statelessness, uniform interface, and resource-based URLs.'
          ],
          timeLimit: 180,
          maxScore: 10
        }
      ],
      medium: [
        {
          id: 'fallback_3',
          category: 'technical',
          difficulty: 'medium',
          question: 'How would you optimize a slow database query?',
          expectedKeywords: ['indexing', 'query optimization', 'execution plan', 'normalization'],
          sampleAnswers: [
            'I would analyze the execution plan, add appropriate indexes, optimize the query structure, and consider database normalization.',
            'Start by examining the execution plan, then add indexes on frequently queried columns, and optimize the WHERE clause.'
          ],
          timeLimit: 240,
          maxScore: 10
        },
        {
          id: 'fallback_3b',
          category: 'technical',
          difficulty: 'medium',
          question: 'Explain the concept of dependency injection and its benefits.',
          expectedKeywords: ['loose coupling', 'testability', 'maintainability', 'inversion of control'],
          sampleAnswers: [
            'Dependency injection is a design pattern where dependencies are provided to a class rather than created inside it. This improves testability, maintainability, and reduces coupling.',
            'It allows us to inject dependencies from outside, making code more modular, testable, and following the dependency inversion principle.'
          ],
          timeLimit: 240,
          maxScore: 10
        },
        {
          id: 'fallback_3c',
          category: 'technical',
          difficulty: 'medium',
          question: 'How would you implement a caching strategy for a web application?',
          expectedKeywords: ['Redis', 'memory cache', 'TTL', 'cache invalidation', 'performance'],
          sampleAnswers: [
            'I would use Redis for distributed caching, implement appropriate TTL, cache invalidation strategies, and consider different cache levels (application, database, CDN).',
            'Start with Redis for session data, implement cache warming, use appropriate expiration times, and have a cache invalidation strategy.'
          ],
          timeLimit: 240,
          maxScore: 10
        },
        {
          id: 'fallback_3d',
          category: 'technical',
          difficulty: 'medium',
          question: 'What are the differences between synchronous and asynchronous programming?',
          expectedKeywords: ['blocking', 'non-blocking', 'callbacks', 'promises', 'async/await'],
          sampleAnswers: [
            'Synchronous programming blocks execution until a task completes, while asynchronous programming allows other tasks to run while waiting. Async programming improves performance and user experience.',
            'Sync is blocking and sequential, while async allows concurrent execution. Modern async uses promises and async/await for better readability.'
          ],
          timeLimit: 240,
          maxScore: 10
        },
        {
          id: 'fallback_3e',
          category: 'technical',
          difficulty: 'medium',
          question: 'How would you handle authentication and authorization in a web application?',
          expectedKeywords: ['JWT', 'OAuth', 'session management', 'role-based access', 'security'],
          sampleAnswers: [
            'I would use JWT for stateless authentication, implement role-based authorization, secure session management, and follow OWASP security guidelines.',
            'Use JWT tokens, implement proper session management, role-based access control, and ensure secure transmission of credentials.'
          ],
          timeLimit: 240,
          maxScore: 10
        }
      ],
      hard: [
        {
          id: 'fallback_4',
          category: 'technical',
          difficulty: 'hard',
          question: 'Design a scalable microservices architecture for an e-commerce platform.',
          expectedKeywords: ['service discovery', 'load balancing', 'circuit breaker', 'API gateway'],
          sampleAnswers: [
            'I would design separate services for user management, product catalog, order processing, and payment. Use API gateway for routing, service discovery for communication, and implement circuit breakers for resilience.',
            'Break down into domain services, implement API gateway, use message queues for async communication, and add monitoring and logging.'
          ],
          timeLimit: 300,
          maxScore: 10
        }
      ]
    },
    behavioral: {
      easy: [
        {
          id: 'fallback_5',
          category: 'behavioral',
          difficulty: 'easy',
          question: 'Tell me about a time when you had to learn a new technology quickly.',
          expectedKeywords: ['learning', 'adaptability', 'problem-solving', 'time management'],
          sampleAnswers: [
            'I had to learn React for a project. I started with official docs, built a small project, and practiced daily.',
            'When my team adopted Docker, I spent weekends learning it through tutorials and hands-on practice.'
          ],
          timeLimit: 180,
          maxScore: 10
        }
      ],
      medium: [
        {
          id: 'fallback_6',
          category: 'behavioral',
          difficulty: 'medium',
          question: 'Describe a situation where you had to work with a difficult team member.',
          expectedKeywords: ['communication', 'conflict resolution', 'teamwork', 'empathy'],
          sampleAnswers: [
            'I had a teammate who was resistant to code reviews. I scheduled a one-on-one to understand their concerns and found a compromise.',
            'I worked with someone who was very critical. I focused on constructive feedback and helped them understand the team\'s goals.'
          ],
          timeLimit: 240,
          maxScore: 10
        }
      ],
      hard: [
        {
          id: 'fallback_7',
          category: 'behavioral',
          difficulty: 'hard',
          question: 'How would you handle a situation where your team is behind schedule on a critical project?',
          expectedKeywords: ['project management', 'communication', 'prioritization', 'leadership'],
          sampleAnswers: [
            'I would assess the situation, communicate with stakeholders, reprioritize tasks, and potentially request additional resources.',
            'First, I\'d analyze why we\'re behind, then communicate transparently with stakeholders and adjust the project plan accordingly.'
          ],
          timeLimit: 300,
          maxScore: 10
        }
      ]
    }
  },
  'Data Scientist': {
    technical: {
      easy: [
        {
          id: 'fallback_8',
          category: 'technical',
          difficulty: 'easy',
          question: 'What is the difference between supervised and unsupervised learning?',
          expectedKeywords: ['labeled data', 'target variable', 'clustering', 'classification'],
          sampleAnswers: [
            'Supervised learning uses labeled data to predict outcomes, while unsupervised learning finds patterns in unlabeled data.',
            'In supervised learning, we have a target variable to predict. In unsupervised learning, we discover hidden patterns.'
          ],
          timeLimit: 180,
          maxScore: 10
        }
      ],
      medium: [
        {
          id: 'fallback_9',
          category: 'technical',
          difficulty: 'medium',
          question: 'How would you handle missing data in a dataset?',
          expectedKeywords: ['imputation', 'deletion', 'analysis', 'domain knowledge'],
          sampleAnswers: [
            'I would first analyze the pattern of missing data, then use appropriate imputation methods or deletion based on the percentage and pattern.',
            'Start by understanding why data is missing, then choose between imputation, deletion, or advanced methods based on the context.'
          ],
          timeLimit: 240,
          maxScore: 10
        }
      ],
      hard: [
        {
          id: 'fallback_10',
          category: 'technical',
          difficulty: 'hard',
          question: 'Design an A/B testing framework for a recommendation system.',
          expectedKeywords: ['hypothesis testing', 'metrics', 'statistical significance', 'experiment design'],
          sampleAnswers: [
            'I would define clear hypotheses, select appropriate metrics, ensure statistical significance, and design the experiment to minimize bias.',
            'Start with hypothesis formulation, then design metrics, ensure proper randomization, and plan for statistical analysis.'
          ],
          timeLimit: 300,
          maxScore: 10
        }
      ]
    },
    behavioral: {
      easy: [
        {
          id: 'fallback_11',
          category: 'behavioral',
          difficulty: 'easy',
          question: 'How do you stay updated with the latest developments in data science?',
          expectedKeywords: ['learning', 'research', 'networking', 'continuous improvement'],
          sampleAnswers: [
            'I follow research papers, attend conferences, participate in online courses, and engage with the data science community.',
            'I read academic papers, follow industry blogs, take online courses, and participate in Kaggle competitions.'
          ],
          timeLimit: 180,
          maxScore: 10
        }
      ],
      medium: [
        {
          id: 'fallback_12',
          category: 'behavioral',
          difficulty: 'medium',
          question: 'Describe a time when you had to explain complex technical concepts to non-technical stakeholders.',
          expectedKeywords: ['communication', 'simplification', 'stakeholder management', 'presentation'],
          sampleAnswers: [
            'I had to explain machine learning results to marketing team. I used analogies, visualizations, and focused on business impact.',
            'I presented data insights to executives by focusing on business outcomes and using simple analogies to explain technical concepts.'
          ],
          timeLimit: 240,
          maxScore: 10
        }
      ],
      hard: [
        {
          id: 'fallback_13',
          category: 'behavioral',
          difficulty: 'hard',
          question: 'How would you handle a situation where your model performs well in development but poorly in production?',
          expectedKeywords: ['debugging', 'monitoring', 'data drift', 'model validation'],
          sampleAnswers: [
            'I would investigate data drift, check for concept drift, validate the model pipeline, and implement proper monitoring.',
            'First, I\'d check for data quality issues, then investigate model drift, and implement comprehensive monitoring and validation.'
          ],
          timeLimit: 300,
          maxScore: 10
        }
      ]
    }
  }
};

// Utility functions that don't require AI
export function buildQuestionPrompt(
  category: string,
  industry: string,
  position: string,
  difficulty: string,
  previousQuestions: string[] = [],
  jobRequirements?: string[],
  roleCompetencies?: string[]
): string {
  const basePrompt = `You are an expert interviewer specializing in ${category} questions for ${position} roles in the ${industry} industry. Generate a ${difficulty} difficulty interview question.`;

  let specificPrompt = '';
  
  if (category === 'technical') {
    specificPrompt = `Focus on technical skills, problem-solving abilities, and hands-on experience relevant to ${position}.`;
  } else if (category === 'behavioral') {
    specificPrompt = `Focus on soft skills, teamwork, leadership, and situational judgment relevant to ${position}.`;
  }

  let requirementsPrompt = '';
  if (jobRequirements && jobRequirements.length > 0) {
    requirementsPrompt = `\n\nJob Requirements: ${jobRequirements.join(', ')}`;
  }

  let competenciesPrompt = '';
  if (roleCompetencies && roleCompetencies.length > 0) {
    competenciesPrompt = `\n\nRole Competencies: ${roleCompetencies.join(', ')}`;
  }

  let previousQuestionsPrompt = '';
  if (previousQuestions.length > 0) {
    previousQuestionsPrompt = `\n\nPrevious questions asked (avoid similar topics): ${previousQuestions.slice(-3).join(', ')}`;
  }

  return `${basePrompt} ${specificPrompt}${requirementsPrompt}${competenciesPrompt}${previousQuestionsPrompt}

Return the response in JSON format with the following structure:
{
  "id": "unique_question_id",
  "questionCode": "stable_code_for_tracking",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "question": "Your interview question here",
  "expectedKeywords": ["keyword1", "keyword2", "keyword3"],
  "sampleAnswers": ["sample answer 1", "sample answer 2"],
  "timeLimit": 180,
  "maxScore": 10,
  "roleSpecific": true
}

The questionCode must be a concise, URL-safe code derived from topic/difficulty (e.g., TECH_SYSTEM_DESIGN_MEDIUM).`;
}

export function buildEvaluationPrompt(
  question: InterviewQuestion,
  answer: string,
  timeSpent: number,
  jobRequirements?: string[],
  roleCompetencies?: string[]
): string {
  const basePrompt = `You are an expert interviewer evaluating a ${question.difficulty} ${question.category} question for a ${question.category} role.`;

  let requirementsPrompt = '';
  if (jobRequirements && jobRequirements.length > 0) {
    requirementsPrompt = `\n\nJob Requirements: ${jobRequirements.join(', ')}`;
  }

  let competenciesPrompt = '';
  if (roleCompetencies && roleCompetencies.length > 0) {
    competenciesPrompt = `\n\nRole Competencies: ${roleCompetencies.join(', ')}`;
  }

  return `${basePrompt}

Question: ${question.question}
Expected Keywords: ${question.expectedKeywords.join(', ')}
Sample Answers: ${question.sampleAnswers.join(' | ')}

Candidate's Answer: ${answer}
Time Spent: ${timeSpent} seconds
Maximum Score: ${question.maxScore}

${requirementsPrompt}${competenciesPrompt}

Evaluate the answer based on:
1. Technical accuracy and relevance
2. Communication clarity
3. Problem-solving approach
4. Confidence and professionalism
5. Alignment with job requirements and role competencies

Return the evaluation in JSON format:
{
  "score": 8,
  "feedback": "Detailed feedback on the answer",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "aiAnalysis": {
    "technicalAccuracy": 8,
    "communicationSkills": 7,
    "problemSolving": 8,
    "confidence": 6,
    "relevance": 9
  },
  "jobFitScore": 8,
  "roleCompetencyScore": 7
}

Score should be between 0 and ${question.maxScore}. Provide specific, actionable feedback.`;
}

export function parseEvaluationResponse(text: string): any {
  // Strategy 1: Direct JSON parsing
  try {
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.log('Direct JSON parsing failed, trying alternative methods');
  }

  // Strategy 2: Extract JSON from text
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.log('JSON extraction failed');
  }

  // Strategy 3: Parse individual fields
  try {
    const scoreMatch = text.match(/"score":\s*(\d+)/);
    const feedbackMatch = text.match(/"feedback":\s*"([^"]+)"/);
    const strengthsMatch = text.match(/"strengths":\s*\[([^\]]+)\]/);
    const weaknessesMatch = text.match(/"weaknesses":\s*\[([^\]]+)\]/);

    return {
      score: scoreMatch ? parseInt(scoreMatch[1]) : 5,
      feedback: feedbackMatch ? feedbackMatch[1] : 'Evaluation completed',
      strengths: strengthsMatch ? strengthsMatch[1].split(',').map(s => s.trim().replace(/"/g, '')) : [],
      weaknesses: weaknessesMatch ? weaknessesMatch[1].split(',').map(s => s.trim().replace(/"/g, '')) : [],
      aiAnalysis: {
        technicalAccuracy: 5,
        communicationSkills: 5,
        problemSolving: 5,
        confidence: 5,
        relevance: 5
      }
    };
  } catch (error) {
    console.log('Field extraction failed');
  }

  // Strategy 4: Return basic structure
  return {
    score: 5,
    feedback: 'Evaluation system temporarily unavailable',
    strengths: ['Good attempt'],
    weaknesses: ['Unable to provide detailed feedback'],
    suggestions: ['Try to be more specific'],
    aiAnalysis: {
      technicalAccuracy: 5,
      communicationSkills: 5,
      problemSolving: 5,
      confidence: 5,
      relevance: 5
    }
  };
}

export function calculateOverallScore(evaluations: AnswerEvaluation[]): {
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  grade: string;
  categoryScores: Record<string, number>;
  jobFitScore?: number;
  roleCompetencyScore?: number;
} {
  if (evaluations.length === 0) {
    return {
      totalScore: 0,
      maxPossibleScore: 0,
      percentage: 0,
      grade: 'N/A',
      categoryScores: {},
      jobFitScore: 0,
      roleCompetencyScore: 0
    };
  }

  const totalScore = evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
  const maxPossibleScore = evaluations.reduce((sum, evaluation) => sum + evaluation.maxScore, 0);
  const percentage = Math.round((totalScore / maxPossibleScore) * 100);

  // Calculate grade
  let grade: string;
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 85) grade = 'A';
  else if (percentage >= 80) grade = 'A-';
  else if (percentage >= 75) grade = 'B+';
  else if (percentage >= 70) grade = 'B';
  else if (percentage >= 65) grade = 'B-';
  else if (percentage >= 60) grade = 'C+';
  else if (percentage >= 55) grade = 'C';
  else if (percentage >= 50) grade = 'C-';
  else grade = 'F';

  // Calculate category scores
  const categoryScores: Record<string, number> = {};
  evaluations.forEach(evaluation => {
    if (!categoryScores[evaluation.score]) {
      categoryScores[evaluation.score] = 0;
    }
    categoryScores[evaluation.score]++;
  });

  // Calculate average job fit and role competency scores
  const jobFitScores = evaluations.filter(e => e.jobFitScore !== undefined).map(e => e.jobFitScore!);
  const roleCompetencyScores = evaluations.filter(e => e.roleCompetencyScore !== undefined).map(e => e.roleCompetencyScore!);

  const avgJobFitScore = jobFitScores.length > 0 ? jobFitScores.reduce((a, b) => a + b, 0) / jobFitScores.length : undefined;
  const avgRoleCompetencyScore = roleCompetencyScores.length > 0 ? roleCompetencyScores.reduce((a, b) => a + b, 0) / roleCompetencyScores.length : undefined;

  return {
    totalScore,
    maxPossibleScore,
    percentage,
    grade,
    categoryScores,
    jobFitScore: avgJobFitScore,
    roleCompetencyScore: avgRoleCompetencyScore
  };
}

// Get fallback question
export function getFallbackQuestion(position: string, category: string, difficulty: string): InterviewQuestion | null {
  const positionFallbacks = fallbackQuestions[position as keyof typeof fallbackQuestions];
  if (!positionFallbacks) return null;

  const categoryFallbacks = positionFallbacks[category as keyof typeof positionFallbacks];
  if (!categoryFallbacks) return null;

  const difficultyFallbacks = categoryFallbacks[difficulty as keyof typeof categoryFallbacks];
  if (!difficultyFallbacks || difficultyFallbacks.length === 0) return null;

  const q = difficultyFallbacks[Math.floor(Math.random() * difficultyFallbacks.length)];
  return { ...q, questionCode: q.id ? `FB_${String(q.id).toUpperCase()}` : undefined } as InterviewQuestion;
}

// Job posting parsing function (moved to API route)
export async function parseJobPosting(jobPosting: string): Promise<{
  title: string;
  requirements: string[];
  skills: string[];
  responsibilities: string[];
  experienceLevel: string;
  salaryRange?: string;
  industry: string;
}> {
  // This function is now handled by the API route
  // Keeping the interface for type safety
  throw new Error('parseJobPosting should be called through the API route');
}

// Interview summary generation (moved to API route)
export async function generateInterviewSummary(
  session: InterviewSession,
  evaluations: AnswerEvaluation[]
): Promise<{
  summary: string;
  recommendations: string[];
  strengths: string[];
  areasForImprovement: string[];
  jobFitAnalysis?: string;
  marketPositioning?: string;
}> {
  // This function is now handled by the API route
  // Keeping the interface for type safety
  throw new Error('generateInterviewSummary should be called through the API route');
} 
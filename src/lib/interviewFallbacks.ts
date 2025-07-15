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
      ]
    }
  }
};

// Question cache for better performance
const questionCache = new Map<string, any[]>();

// Get fallback question
export function getFallbackQuestion(position: string, category: string, difficulty: string): any | null {
  const positionFallbacks = fallbackQuestions[position as keyof typeof fallbackQuestions];
  if (!positionFallbacks) return null;

  const categoryFallbacks = positionFallbacks[category as keyof typeof positionFallbacks];
  if (!categoryFallbacks) return null;

  const difficultyFallbacks = categoryFallbacks[difficulty as keyof typeof categoryFallbacks];
  if (!difficultyFallbacks || difficultyFallbacks.length === 0) return null;

  return difficultyFallbacks[Math.floor(Math.random() * difficultyFallbacks.length)];
}

// Multiple parsing strategies for evaluation responses
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
      strengths: strengthsMatch ? strengthsMatch[1].split(',').map((s: string) => s.trim().replace(/"/g, '')) : [],
      weaknesses: weaknessesMatch ? weaknessesMatch[1].split(',').map((s: string) => s.trim().replace(/"/g, '')) : [],
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

// Cache management functions
export function getCachedQuestions(position: string, category: string, difficulty: string): any[] {
  const cacheKey = `${position}_${category}_${difficulty}`;
  return questionCache.get(cacheKey) || [];
}

export function cacheQuestion(position: string, category: string, difficulty: string, question: any): void {
  const cacheKey = `${position}_${category}_${difficulty}`;
  if (!questionCache.has(cacheKey)) {
    questionCache.set(cacheKey, []);
  }
  questionCache.get(cacheKey)!.push(question);
}

export function clearCache(): void {
  questionCache.clear();
} 
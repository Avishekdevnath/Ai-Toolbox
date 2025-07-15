import { 
  InterviewSession, 
  InterviewQuestion, 
  InterviewAnswer, 
  AnswerEvaluation
} from './interviewAI';

// Interview session management
export class InterviewSessionManager {
  private sessions: Map<string, InterviewSession> = new Map();

  // Create a new interview session
  async createSession(
    type: 'technical' | 'behavioral' | 'mixed' | 'role-based' | 'job-specific',
    industry: string,
    position: string,
    difficulty: 'easy' | 'medium' | 'hard',
    totalQuestions: number = 10,
    experienceLevel?: 'entry' | 'mid' | 'senior',
    jobRequirements?: string[],
    roleCompetencies?: string[]
  ): Promise<InterviewSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: InterviewSession = {
      id: sessionId,
      type,
      industry,
      position,
      difficulty,
      totalQuestions,
      currentQuestionIndex: 0,
      questions: [],
      answers: [],
      startTime: new Date(),
      status: 'active',
      totalScore: 0,
      maxPossibleScore: 0,
      jobRequirements,
      roleCompetencies,
      experienceLevel
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  // Get next question for the session
  async getNextQuestion(sessionId: string): Promise<InterviewQuestion | null> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') {
      return null;
    }

    if (session.currentQuestionIndex >= session.totalQuestions) {
      return null; // Interview completed
    }

    // This function is now handled by the API route
    // Keeping the interface for backward compatibility
    return null;
  }

  // Submit answer for current question
  async submitAnswer(
    sessionId: string,
    answer: string,
    timeSpent: number
  ): Promise<AnswerEvaluation | null> {
    // This function is now handled by the API route
    // Keeping the interface for backward compatibility
    return null;
  }

  // Get session by ID
  getSession(sessionId: string): InterviewSession | null {
    return this.sessions.get(sessionId) || null;
  }

  // Get interview results
  async getInterviewResults(sessionId: string): Promise<{
    session: InterviewSession;
    overallScore: any;
    summary: any;
    evaluations: AnswerEvaluation[];
  } | null> {
    // This function is now handled by the API route
    // Keeping the interface for backward compatibility
    return null;
  }

  // Pause session
  pauseSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session && session.status === 'active') {
      session.status = 'paused';
      return true;
    }
    return false;
  }

  // Resume session
  resumeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session && session.status === 'paused') {
      session.status = 'active';
      return true;
    }
    return false;
  }

  // Delete session
  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  // Get all active sessions
  getActiveSessions(): InterviewSession[] {
    return Array.from(this.sessions.values()).filter(session => session.status === 'active');
  }

  // Get session statistics
  getSessionStats(): {
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    pausedSessions: number;
  } {
    const sessions = Array.from(this.sessions.values());
    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.status === 'active').length,
      completedSessions: sessions.filter(s => s.status === 'completed').length,
      pausedSessions: sessions.filter(s => s.status === 'paused').length
    };
  }
}

// Create a singleton instance
export const sessionManager = new InterviewSessionManager();

// Question bank utilities
export const questionCategories = {
  technical: [
    'programming',
    'system-design',
    'algorithms',
    'databases',
    'networking',
    'security',
    'cloud-computing',
    'devops'
  ],
  behavioral: [
    'leadership',
    'teamwork',
    'problem-solving',
    'communication',
    'conflict-resolution',
    'time-management',
    'adaptability',
    'stress-management'
  ],
  'problem-solving': [
    'case-studies',
    'brain-teasers',
    'scenario-analysis',
    'decision-making',
    'critical-thinking',
    'analytical-skills'
  ]
};

export const industries = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Marketing',
  'Sales',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Government',
  'Non-profit',
  'Media',
  'Real Estate',
  'Transportation',
  'Energy'
];

export const positions = {
  'Technology': [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Machine Learning Engineer',
    'Product Manager',
    'QA Engineer',
    'System Administrator'
  ],
  'Finance': [
    'Financial Analyst',
    'Investment Banker',
    'Accountant',
    'Financial Advisor',
    'Risk Manager',
    'Portfolio Manager',
    'Credit Analyst',
    'Treasury Analyst'
  ],
  'Healthcare': [
    'Nurse',
    'Doctor',
    'Pharmacist',
    'Medical Assistant',
    'Healthcare Administrator',
    'Medical Technologist',
    'Physical Therapist',
    'Mental Health Professional'
  ],
  'Marketing': [
    'Marketing Manager',
    'Digital Marketing Specialist',
    'Content Creator',
    'SEO Specialist',
    'Social Media Manager',
    'Brand Manager',
    'Marketing Analyst',
    'Public Relations Specialist'
  ]
};

// Certificate generation utilities
export interface CertificateData {
  candidateName: string;
  position: string;
  industry: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  date: Date;
  sessionId: string;
}

export function generateCertificateHTML(data: CertificateData): string {
  const dateStr = data.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Interview Certificate</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .certificate {
          background: white;
          padding: 60px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 800px;
          width: 100%;
        }
        .header {
          border-bottom: 3px solid #667eea;
          padding-bottom: 30px;
          margin-bottom: 40px;
        }
        .title {
          font-size: 48px;
          color: #333;
          margin: 0;
          font-weight: bold;
        }
        .subtitle {
          font-size: 24px;
          color: #666;
          margin: 10px 0 0 0;
        }
        .content {
          margin: 40px 0;
        }
        .name {
          font-size: 36px;
          color: #667eea;
          margin: 20px 0;
          font-weight: bold;
        }
        .details {
          font-size: 18px;
          color: #555;
          line-height: 1.6;
          margin: 20px 0;
        }
        .score {
          font-size: 32px;
          color: #28a745;
          font-weight: bold;
          margin: 30px 0;
        }
        .grade {
          font-size: 48px;
          color: #667eea;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 2px solid #eee;
          font-size: 14px;
          color: #888;
        }
        .signature {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .signature-line {
          width: 200px;
          height: 2px;
          background: #333;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="header">
          <h1 class="title">Interview Certificate</h1>
          <p class="subtitle">AI-Powered Mock Interview Assessment</p>
        </div>
        
        <div class="content">
          <p class="details">This is to certify that</p>
          <div class="name">${data.candidateName}</div>
          <p class="details">
            has successfully completed a mock interview for the position of<br>
            <strong>${data.position}</strong><br>
            in the <strong>${data.industry}</strong> industry
          </p>
          
          <div class="score">
            Score: ${data.score}/${data.maxScore} (${data.percentage}%)
          </div>
          
          <div class="grade">
            Grade: ${data.grade}
          </div>
          
          <p class="details">
            Date: ${dateStr}<br>
            Session ID: ${data.sessionId}
          </p>
        </div>
        
        <div class="signature">
          <div>
            <div class="signature-line"></div>
            <p>AI Interview System</p>
          </div>
          <div>
            <div class="signature-line"></div>
            <p>Date</p>
          </div>
        </div>
        
        <div class="footer">
          <p>This certificate is generated by AI Toolbox Mock Interviewer</p>
          <p>Certificate ID: ${data.sessionId}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Time utilities
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function calculateTimeRemaining(startTime: Date, timeLimit: number): number {
  const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
  return Math.max(0, timeLimit - elapsed);
}

// Validation utilities
export function validateInterviewSetup(data: {
  type: string;
  industry: string;
  position: string;
  difficulty: string;
  totalQuestions: number;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!['technical', 'behavioral', 'mixed', 'role-based', 'job-specific'].includes(data.type)) {
    errors.push('Invalid interview type');
  }

  if (!industries.includes(data.industry)) {
    errors.push('Invalid industry');
  }

  if (!data.position.trim()) {
    errors.push('Position is required');
  }

  if (!['easy', 'medium', 'hard'].includes(data.difficulty)) {
    errors.push('Invalid difficulty level');
  }

  if (data.totalQuestions < 1 || data.totalQuestions > 20) {
    errors.push('Total questions must be between 1 and 20');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 
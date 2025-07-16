import { InterviewSession, InterviewQuestion, AnswerEvaluation } from '@/lib/interviewAI';

export interface InterviewState {
  stage: 'setup' | 'interview' | 'results';
  session: InterviewSession | null;
  currentQuestion: InterviewQuestion | null;
  currentAnswer: string;
  timeRemaining: number;
  isTimerRunning: boolean;
  lastEvaluation: AnswerEvaluation | null;
  results: any | null;
  loading: boolean;
  error: string | null;
}

export interface SetupData {
  type: 'technical' | 'behavioral' | 'mixed' | 'role-based';
  industry: string;
  position: string;
  difficulty: 'easy' | 'medium' | 'hard';
  totalQuestions: number;
  candidateName: string;
  experienceLevel: 'entry' | 'mid' | 'senior';
} 
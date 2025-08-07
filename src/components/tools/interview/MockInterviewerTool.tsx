'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mic, MicOff, Send, RefreshCw, Clock, Star } from 'lucide-react';

interface InterviewQuestion {
  id: string;
  question: string;
  category: 'behavioral' | 'technical' | 'case-study' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  followUpQuestions?: string[];
}

interface InterviewSession {
  interviewType: string;
  industry: string;
  duration: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  answers: { [questionId: string]: string };
  feedback: { [questionId: string]: string };
  scores: { [questionId: string]: number };
  isComplete: boolean;
  startTime: Date;
  totalScore: number;
}

export default function MockInterviewerTool() {
  const [interviewType, setInterviewType] = useState('behavioral');
  const [industry, setIndustry] = useState('');
  const [duration, setDuration] = useState('30');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  const startInterview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewType,
          industry,
          duration: parseInt(duration)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate interview');
      }

      const data = await response.json();
      
      const newSession: InterviewSession = {
        interviewType,
        industry,
        duration,
        questions: data.questions || getDefaultQuestions(),
        currentQuestionIndex: 0,
        answers: {},
        feedback: {},
        scores: {},
        isComplete: false,
        startTime: new Date(),
        totalScore: 0
      };

      setSession(newSession);
      
      // Track usage
      fetch('/api/tools/mock-interviewer/track-usage', { method: 'POST' });
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Using default questions.');
      const newSession: InterviewSession = {
        interviewType,
        industry,
        duration,
        questions: getDefaultQuestions(),
        currentQuestionIndex: 0,
        answers: {},
        feedback: {},
        scores: {},
        isComplete: false,
        startTime: new Date(),
        totalScore: 0
      };
      setSession(newSession);
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultQuestions = (): InterviewQuestion[] => {
    const baseQuestions: InterviewQuestion[] = [
      {
        id: '1',
        question: 'Tell me about yourself and your professional background.',
        category: 'general',
        difficulty: 'easy',
        followUpQuestions: ['What motivates you in your career?', 'What are your career goals?']
      },
      {
        id: '2',
        question: 'Describe a time when you had to work with a difficult team member.',
        category: 'behavioral',
        difficulty: 'medium',
        followUpQuestions: ['How did you resolve the conflict?', 'What did you learn from this experience?']
      },
      {
        id: '3',
        question: 'What is your greatest professional achievement?',
        category: 'behavioral',
        difficulty: 'medium',
        followUpQuestions: ['What challenges did you face?', 'How did you measure success?']
      },
      {
        id: '4',
        question: 'How do you handle stress and pressure in the workplace?',
        category: 'behavioral',
        difficulty: 'medium',
        followUpQuestions: ['Can you give a specific example?', 'What strategies do you use?']
      },
      {
        id: '5',
        question: 'Where do you see yourself in 5 years?',
        category: 'general',
        difficulty: 'easy',
        followUpQuestions: ['How does this role fit into your plan?', 'What skills do you want to develop?']
      }
    ];

    // Add type-specific questions
    if (interviewType === 'technical') {
      baseQuestions.push({
        id: '6',
        question: 'Explain a complex technical problem you solved recently.',
        category: 'technical',
        difficulty: 'hard',
        followUpQuestions: ['What was your approach?', 'How did you validate the solution?']
      });
    } else if (interviewType === 'case-study') {
      baseQuestions.push({
        id: '6',
        question: 'How would you approach solving a business problem with limited resources?',
        category: 'case-study',
        difficulty: 'hard',
        followUpQuestions: ['What factors would you consider?', 'How would you prioritize?']
      });
    }

    return baseQuestions;
  };

  const handleAnswerSubmit = async () => {
    if (!session || !currentAnswer.trim()) return;

    const currentQuestion = session.questions[session.currentQuestionIndex];
    const updatedAnswers = { ...session.answers, [currentQuestion.id]: currentAnswer };
    
    // Generate AI feedback and score
    setIsGeneratingFeedback(true);
    try {
      const response = await fetch('/api/analyze/interview-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          answer: currentAnswer,
          category: currentQuestion.category,
          difficulty: currentQuestion.difficulty
        })
      });

      let feedback = 'Good answer! Consider adding more specific examples.';
      let score = 75;
      
      if (response.ok) {
        const data = await response.json();
        feedback = data.feedback || feedback;
        score = data.score || score;
      }

      const updatedFeedback = { ...session.feedback, [currentQuestion.id]: feedback };
      const updatedScores = { ...session.scores, [currentQuestion.id]: score };
      
      // Calculate total score
      const allScores = Object.values(updatedScores);
      const totalScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
      
      setSession({
        ...session,
        answers: updatedAnswers,
        feedback: updatedFeedback,
        scores: updatedScores,
        totalScore
      });
    } catch (error) {
      console.error('Error generating feedback:', error);
      const updatedFeedback = { ...session.feedback, [currentQuestion.id]: 'Good answer! Consider adding more specific examples.' };
      const updatedScores = { ...session.scores, [currentQuestion.id]: 75 };
      setSession({
        ...session,
        answers: updatedAnswers,
        feedback: updatedFeedback,
        scores: updatedScores
      });
    } finally {
      setIsGeneratingFeedback(false);
      setCurrentAnswer('');
    }
  };

  const nextQuestion = () => {
    if (!session) return;
    
    if (session.currentQuestionIndex < session.questions.length - 1) {
      setSession({
        ...session,
        currentQuestionIndex: session.currentQuestionIndex + 1
      });
    } else {
      setSession({
        ...session,
        isComplete: true
      });
    }
  };

  const previousQuestion = () => {
    if (!session && session.currentQuestionIndex > 0) {
      setSession({
        ...session,
        currentQuestionIndex: session.currentQuestionIndex - 1
      });
    }
  };

  const resetInterview = () => {
    setSession(null);
    setCurrentAnswer('');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'behavioral': return 'bg-purple-100 text-purple-800';
      case 'case-study': return 'bg-orange-100 text-orange-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Needs Improvement';
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Mock Interviewer
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Get realistic interview practice with our AI interviewer
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Interview Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Interview Type</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                >
                  <option value="behavioral">Behavioral Interview</option>
                  <option value="technical">Technical Interview</option>
                  <option value="case-study">Case Study Interview</option>
                  <option value="general">General Interview</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Industry</label>
                <Input 
                  placeholder="e.g., Technology, Finance, Healthcare, Marketing" 
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Interview Duration</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
              <Button 
                className="w-full" 
                onClick={startInterview}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing Interview...
                  </>
                ) : (
                  'Begin Mock Interview'
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
              💡 Interview Tips
            </h3>
            <ul className="text-blue-700 dark:text-blue-300 space-y-2">
              <li>• Practice your answers out loud before the interview</li>
              <li>• Use the STAR method for behavioral questions</li>
              <li>• Prepare specific examples from your experience</li>
              <li>• Be honest and authentic in your responses</li>
              <li>• Ask thoughtful questions about the role</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const currentAnswerText = session.answers[currentQuestion.id] || '';
  const currentFeedback = session.feedback[currentQuestion.id] || '';
  const currentScore = session.scores[currentQuestion.id] || 0;

  // Calculate elapsed time
  const elapsedTime = Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000 / 60);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mock Interview
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {session.interviewType.charAt(0).toUpperCase() + session.interviewType.slice(1)} Interview
            {session.industry && ` - ${session.industry}`}
          </p>
          <div className="flex justify-center gap-2 mt-2">
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              {elapsedTime} min elapsed
            </Badge>
            <Badge variant="outline">
              Question {session.currentQuestionIndex + 1} of {session.questions.length}
            </Badge>
            {session.totalScore > 0 && (
              <Badge variant="outline" className={getScoreColor(session.totalScore)}>
                <Star className="w-3 h-3 mr-1" />
                {session.totalScore}/100
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((session.currentQuestionIndex + 1) / session.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge className={getCategoryColor(currentQuestion.category)}>
                    {currentQuestion.category}
                  </Badge>
                  <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                    {currentQuestion.difficulty}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Follow-up questions hint */}
            {currentQuestion.followUpQuestions && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💭 Be prepared for follow-up questions:</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  {currentQuestion.followUpQuestions.map((q, index) => (
                    <li key={index}>• {q}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Answer Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Your Answer:</label>
              <Textarea
                placeholder="Type your answer here..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                rows={4}
                className="mb-3"
              />
              <Button 
                onClick={handleAnswerSubmit}
                disabled={!currentAnswer.trim() || isGeneratingFeedback}
                className="w-full"
              >
                {isGeneratingFeedback ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Answer...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Answer
                  </>
                )}
              </Button>
            </div>

            {/* Previous Answer, Feedback, and Score */}
            {currentAnswerText && (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2">Your Answer:</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{currentAnswerText}</p>
                </div>
                
                {currentFeedback && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">AI Feedback:</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">{currentFeedback}</p>
                  </div>
                )}

                {currentScore > 0 && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Score:</h4>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(currentScore)}`}>
                          {currentScore}/100
                        </div>
                        <div className="text-sm text-yellow-700 dark:text-yellow-300">
                          {getScoreLabel(currentScore)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={session.currentQuestionIndex === 0}
          >
            Previous
          </Button>
          
          <Button
            onClick={nextQuestion}
            disabled={!currentAnswerText}
          >
            {session.currentQuestionIndex === session.questions.length - 1 ? 'Finish Interview' : 'Next Question'}
          </Button>
        </div>

        {/* Reset Button */}
        <div className="text-center mt-6">
          <Button variant="ghost" onClick={resetInterview}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Start New Interview
          </Button>
        </div>
      </div>
    </div>
  );
} 
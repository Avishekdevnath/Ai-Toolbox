'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mic, MicOff, Send, RefreshCw } from 'lucide-react';

interface InterviewQuestion {
  id: string;
  question: string;
  category: 'technical' | 'behavioral' | 'situational' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  tips?: string[];
}

interface InterviewSession {
  jobTitle: string;
  company: string;
  experienceLevel: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  answers: { [questionId: string]: string };
  feedback: { [questionId: string]: string };
  isComplete: boolean;
}

export default function JobInterviewerTool() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('entry');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  const generateInterviewQuestions = async () => {
    if (!jobTitle.trim()) {
      alert('Please enter a job title');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          company,
          experienceLevel,
          type: 'job-specific'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      
      const newSession: InterviewSession = {
        jobTitle,
        company,
        experienceLevel,
        questions: data.questions || getDefaultQuestions(),
        currentQuestionIndex: 0,
        answers: {},
        feedback: {},
        isComplete: false
      };

      setSession(newSession);
      
      // Track usage
      fetch('/api/tools/job-interviewer/track-usage', { method: 'POST' });
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate interview questions. Using default questions.');
      const newSession: InterviewSession = {
        jobTitle,
        company,
        experienceLevel,
        questions: getDefaultQuestions(),
        currentQuestionIndex: 0,
        answers: {},
        feedback: {},
        isComplete: false
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
        question: 'Tell me about yourself and your background.',
        category: 'general',
        difficulty: 'easy',
        tips: ['Keep it concise (1-2 minutes)', 'Focus on relevant experience', 'End with why you\'re interested in this role']
      },
      {
        id: '2',
        question: 'Why are you interested in this position at our company?',
        category: 'behavioral',
        difficulty: 'medium',
        tips: ['Research the company beforehand', 'Connect your skills to the role', 'Show genuine interest']
      },
      {
        id: '3',
        question: 'What are your greatest strengths and weaknesses?',
        category: 'behavioral',
        difficulty: 'medium',
        tips: ['Be honest about weaknesses', 'Show how you\'re working on them', 'Focus on strengths relevant to the job']
      },
      {
        id: '4',
        question: 'Describe a challenging situation you faced at work and how you handled it.',
        category: 'situational',
        difficulty: 'hard',
        tips: ['Use STAR method (Situation, Task, Action, Result)', 'Focus on problem-solving skills', 'Show positive outcomes']
      },
      {
        id: '5',
        question: 'Where do you see yourself in 5 years?',
        category: 'general',
        difficulty: 'medium',
        tips: ['Show ambition but be realistic', 'Connect to the company\'s growth', 'Demonstrate long-term thinking']
      }
    ];

    // Add job-specific questions based on title
    if (jobTitle.toLowerCase().includes('software') || jobTitle.toLowerCase().includes('developer')) {
      baseQuestions.push({
        id: '6',
        question: 'Explain a technical project you worked on recently.',
        category: 'technical',
        difficulty: 'hard',
        tips: ['Explain the problem clearly', 'Describe your technical approach', 'Highlight the impact and results']
      });
    }

    return baseQuestions;
  };

  const handleAnswerSubmit = async () => {
    if (!session || !currentAnswer.trim()) return;

    const currentQuestion = session.questions[session.currentQuestionIndex];
    const updatedAnswers = { ...session.answers, [currentQuestion.id]: currentAnswer };
    
    // Generate AI feedback
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
      if (response.ok) {
        const data = await response.json();
        feedback = data.feedback || feedback;
      }

      const updatedFeedback = { ...session.feedback, [currentQuestion.id]: feedback };
      
      setSession({
        ...session,
        answers: updatedAnswers,
        feedback: updatedFeedback
      });
    } catch (error) {
      console.error('Error generating feedback:', error);
      const updatedFeedback = { ...session.feedback, [currentQuestion.id]: 'Good answer! Consider adding more specific examples.' };
      setSession({
        ...session,
        answers: updatedAnswers,
        feedback: updatedFeedback
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
      case 'situational': return 'bg-orange-100 text-orange-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Job Interviewer
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Practice your interview skills with AI-powered mock interviews tailored to your job
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Interview Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Job Title *</label>
                <Input 
                  placeholder="e.g., Software Engineer, Product Manager, Marketing Specialist" 
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Company</label>
                <Input 
                  placeholder="e.g., Google, Microsoft, Startup XYZ" 
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Your Experience Level</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  <option value="entry">Entry Level (0-2 years)</option>
                  <option value="mid">Mid Level (3-5 years)</option>
                  <option value="senior">Senior Level (6-10 years)</option>
                  <option value="lead">Lead/Manager (10+ years)</option>
                </select>
              </div>
              <Button 
                className="w-full" 
                onClick={generateInterviewQuestions}
                disabled={isLoading || !jobTitle.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  'Start Interview'
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
              💡 Interview Tips
            </h3>
            <ul className="text-blue-700 dark:text-blue-300 space-y-2">
              <li>• Research the company and role beforehand</li>
              <li>• Prepare specific examples from your experience</li>
              <li>• Use the STAR method for behavioral questions</li>
              <li>• Practice your answers out loud</li>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Job Interview Practice
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {session.jobTitle} at {session.company || 'Company'}
          </p>
          <div className="flex justify-center gap-2 mt-2">
            <Badge variant="outline">{session.experienceLevel} Level</Badge>
            <Badge variant="outline">
              Question {session.currentQuestionIndex + 1} of {session.questions.length}
            </Badge>
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
            {/* Tips */}
            {currentQuestion.tips && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">💡 Tips:</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  {currentQuestion.tips.map((tip, index) => (
                    <li key={index}>• {tip}</li>
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
                    Generating Feedback...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Answer
                  </>
                )}
              </Button>
            </div>

            {/* Previous Answer and Feedback */}
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
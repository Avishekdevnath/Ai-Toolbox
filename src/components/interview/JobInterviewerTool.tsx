'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Trophy,
  Target,
  FileText,
  Users,
  Brain,
  Star,
  Briefcase,
  DollarSign,
  Calendar
} from 'lucide-react';
import { 
  InterviewSession, 
  InterviewQuestion, 
  AnswerEvaluation
} from '@/lib/interviewAI';
import { 
  formatTime
} from '@/lib/interviewUtils';
import { CertificateData } from '@/lib/certificateUtils';
import CertificateDownloadModal from '../CertificateDownloadModal';

interface JobPostingData {
  title: string;
  requirements: string[];
  skills: string[];
  responsibilities: string[];
  experienceLevel: string;
  salaryRange?: string;
  industry: string;
}

interface InterviewState {
  stage: 'job-input' | 'setup' | 'interview' | 'results';
  jobPosting: string;
  parsedJob: JobPostingData | null;
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

export default function JobInterviewerTool() {
  const [state, setState] = useState<InterviewState>({
    stage: 'job-input',
    jobPosting: '',
    parsedJob: null,
    session: null,
    currentQuestion: null,
    currentAnswer: '',
    timeRemaining: 0,
    isTimerRunning: false,
    lastEvaluation: null,
    results: null,
    loading: false,
    error: null
  });

  const [setupData, setSetupData] = useState({
    candidateName: '',
    totalQuestions: 5,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard'
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.isTimerRunning && state.timeRemaining > 0) {
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1)
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isTimerRunning, state.timeRemaining]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (state.timeRemaining === 0 && state.isTimerRunning && state.currentAnswer.trim()) {
      handleSubmitAnswer();
    }
  }, [state.timeRemaining, state.isTimerRunning, state.currentAnswer]);

  const handleParseJobPosting = async () => {
    if (!state.jobPosting.trim()) {
      setState(prev => ({ ...prev, error: 'Please paste a job posting' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'parse-job-posting',
          jobPosting: state.jobPosting
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to parse job posting');
      }
      
      setState(prev => ({
        ...prev,
        parsedJob: data.jobData,
        stage: 'setup',
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to parse job posting',
        loading: false
      }));
    }
  };

  const handleStartInterview = async () => {
    if (!setupData.candidateName.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter your name' }));
      return;
    }

    if (!state.parsedJob) {
      setState(prev => ({ ...prev, error: 'No job posting parsed' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          type: 'job-specific',
          industry: state.parsedJob.industry,
          position: state.parsedJob.title,
          difficulty: setupData.difficulty,
          totalQuestions: setupData.totalQuestions,
          jobRequirements: state.parsedJob.requirements,
          roleCompetencies: state.parsedJob.skills
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to start interview');
      }

      setState(prev => ({
        ...prev,
        stage: 'interview',
        session: data.session,
        currentQuestion: data.currentQuestion,
        timeRemaining: data.currentQuestion.timeLimit,
        isTimerRunning: true,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start interview',
        loading: false
      }));
    }
  };

  const handleNextQuestion = async () => {
    if (!state.session) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'next-question',
          sessionId: state.session.id
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get next question');
      }

      setState(prev => ({
        ...prev,
        currentQuestion: data.question,
        currentAnswer: '',
        timeRemaining: data.question.timeLimit,
        isTimerRunning: true,
        lastEvaluation: null,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get next question',
        loading: false
      }));
    }
  };

  const handleSubmitAnswer = async () => {
    if (!state.session || !state.currentQuestion || !state.currentAnswer.trim()) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, isTimerRunning: false }));

    try {
      const timeSpent = state.currentQuestion.timeLimit - state.timeRemaining;
      
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit-answer',
          sessionId: state.session.id,
          answer: state.currentAnswer,
          timeSpent
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit answer');
      }

      setState(prev => ({
        ...prev,
        lastEvaluation: data.evaluation,
        session: data.session,
        loading: false
      }));

      // If interview is complete, get results
      if (data.isComplete) {
        await handleGetResults();
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to submit answer',
        loading: false
      }));
    }
  };

  const handleGetResults = async () => {
    if (!state.session) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get-results',
          sessionId: state.session.id
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get results');
      }

      setState(prev => ({
        ...prev,
        stage: 'results',
        results: data.results,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to get results',
        loading: false
      }));
    }
  };

  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const handleDownloadCertificate = () => {
    if (!state.results || !setupData.candidateName || !state.parsedJob) return;
    setShowCertificateModal(true);
  };

  const handleRestart = () => {
    setState({
      stage: 'job-input',
      jobPosting: '',
      parsedJob: null,
      session: null,
      currentQuestion: null,
      currentAnswer: '',
      timeRemaining: 0,
      isTimerRunning: false,
      lastEvaluation: null,
      results: null,
      loading: false,
      error: null
    });
  };

  // Render job input stage
  if (state.stage === 'job-input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Briefcase className="w-12 h-12 text-blue-600 mr-3" />
                <div>
                  <CardTitle className="text-3xl font-bold">Job-Specific Interviewer</CardTitle>
                  <CardDescription className="text-lg">
                    Paste a job posting and get a targeted interview based on the requirements
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="jobPosting">Job Posting / Job Circular</Label>
                  <Textarea
                    id="jobPosting"
                    value={state.jobPosting}
                    onChange={(e) => setState(prev => ({ ...prev, jobPosting: e.target.value }))}
                    placeholder="Paste the complete job posting, job circular, or job description here..."
                    rows={12}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Include the job title, requirements, responsibilities, and any other relevant details.
                  </p>
                </div>

                {state.error && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {state.error}
                  </div>
                )}

                <div className="text-center">
                  <Button 
                    onClick={handleParseJobPosting} 
                    disabled={state.loading || !state.jobPosting.trim()}
                    className="px-8 py-3 text-lg"
                  >
                    {state.loading ? 'Parsing...' : 'Parse Job Posting'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render setup stage
  if (state.stage === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Job Analysis Complete</CardTitle>
              <CardDescription>
                Review the parsed job details and configure your interview
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.parsedJob && (
                <div className="space-y-6">
                  {/* Job Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Parsed Job Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-lg text-blue-600">{state.parsedJob.title}</h4>
                          <p className="text-gray-600">{state.parsedJob.industry}</p>
                        </div>
                        <div className="text-right">
                          {state.parsedJob.salaryRange && (
                            <div className="flex items-center justify-end text-green-600">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {state.parsedJob.salaryRange}
                            </div>
                          )}
                          <div className="flex items-center justify-end text-gray-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            {state.parsedJob.experienceLevel} level
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-4">
                        <div>
                          <h5 className="font-semibold mb-2">Key Requirements:</h5>
                          <div className="flex flex-wrap gap-2">
                            {state.parsedJob.requirements.map((req, index) => (
                              <Badge key={index} variant="outline">{req}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-semibold mb-2">Required Skills:</h5>
                          <div className="flex flex-wrap gap-2">
                            {state.parsedJob.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-semibold mb-2">Responsibilities:</h5>
                          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            {state.parsedJob.responsibilities.map((resp, index) => (
                              <li key={index}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Interview Setup */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Interview Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="candidateName">Your Name</Label>
                          <Input
                            id="candidateName"
                            value={setupData.candidateName}
                            onChange={(e) => setSetupData(prev => ({ ...prev, candidateName: e.target.value }))}
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div>
                          <Label htmlFor="difficulty">Difficulty Level</Label>
                          <select
                            id="difficulty"
                            value={setupData.difficulty}
                            onChange={(e) => setSetupData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="totalQuestions">Number of Questions</Label>
                          <select
                            id="totalQuestions"
                            value={setupData.totalQuestions}
                            onChange={(e) => setSetupData(prev => ({ ...prev, totalQuestions: parseInt(e.target.value) }))}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value={3}>3 Questions</option>
                            <option value={5}>5 Questions</option>
                            <option value={10}>10 Questions</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {state.error && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      {state.error}
                    </div>
                  )}

                  <div className="text-center">
                    <Button 
                      onClick={handleStartInterview} 
                      disabled={state.loading || !setupData.candidateName.trim()}
                      className="px-8 py-3 text-lg"
                    >
                      {state.loading ? 'Starting...' : 'Start Job-Specific Interview'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render interview stage
  if (state.stage === 'interview') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Question {state.session?.currentQuestionIndex || 0} of {state.session?.totalQuestions || 0}
                  </CardTitle>
                  <CardDescription>
                    {state.parsedJob?.title} • {state.parsedJob?.industry} • {setupData.difficulty}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-lg font-semibold text-red-600">
                    <Clock className="w-5 h-5 mr-2" />
                    {formatTime(state.timeRemaining)}
                  </div>
                </div>
              </div>
              <Progress 
                value={((state.session?.totalQuestions || 0) - (state.session?.currentQuestionIndex || 0)) / (state.session?.totalQuestions || 1) * 100} 
                className="mt-4"
              />
            </CardHeader>
          </Card>

          {/* Question */}
          {state.currentQuestion && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Badge variant="outline" className="mr-2">
                    Job-Specific
                  </Badge>
                  <Badge variant="secondary">
                    {state.currentQuestion.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-xl">
                  {state.currentQuestion.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="answer">Your Answer</Label>
                    <Textarea
                      id="answer"
                      value={state.currentAnswer}
                      onChange={(e) => setState(prev => ({ ...prev, currentAnswer: e.target.value }))}
                      placeholder="Type your answer here..."
                      rows={6}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Time limit: {formatTime(state.currentQuestion.timeLimit)}
                    </div>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setState(prev => ({ ...prev, isTimerRunning: !prev.isTimerRunning }))}
                      >
                        {state.isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {state.isTimerRunning ? 'Pause' : 'Resume'}
                      </Button>
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={!state.currentAnswer.trim() || state.loading}
                      >
                        {state.loading ? 'Submitting...' : 'Submit Answer'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evaluation Feedback */}
          {state.lastEvaluation && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Answer Evaluation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Score:</span>
                    <Badge className="text-lg px-3 py-1">
                      {state.lastEvaluation.score}/{state.lastEvaluation.maxScore}
                    </Badge>
                  </div>

                  {state.lastEvaluation.jobFitScore && (
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Job Fit Score:</span>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {state.lastEvaluation.jobFitScore}/10
                      </Badge>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold mb-2">Feedback:</h4>
                    <p className="text-gray-700">{state.lastEvaluation.feedback}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">Strengths:</h4>
                      <ul className="list-disc list-inside text-sm">
                        {state.lastEvaluation.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-700 mb-2">Areas for Improvement:</h4>
                      <ul className="list-disc list-inside text-sm">
                        {state.lastEvaluation.weaknesses.map((weakness, index) => (
                          <li key={index}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button onClick={handleNextQuestion} disabled={state.loading}>
                      {state.loading ? 'Loading...' : 'Next Question'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {state.error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center text-red-700">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {state.error}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Render results stage
  if (state.stage === 'results') {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-6">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Trophy className="w-12 h-12 text-yellow-600 mr-3" />
                  <div>
                    <CardTitle className="text-3xl font-bold">Job Interview Complete!</CardTitle>
                    <CardDescription className="text-lg">
                      Here are your results and job fit analysis
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {state.results && state.parsedJob && (
              <>
                {/* Overall Score */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-center">Overall Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div className="text-6xl font-bold text-blue-600">
                        {state.results.overallScore.grade}
                      </div>
                      <div className="text-2xl font-semibold">
                        {state.results.overallScore.totalScore}/{state.results.overallScore.maxPossibleScore} 
                        ({state.results.overallScore.percentage}%)
                      </div>
                      <div className="text-gray-600">
                        {state.parsedJob.title} • {state.parsedJob.industry} • {setupData.difficulty}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Job Fit Analysis */}
                {state.results.overallScore.jobFitScore && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="w-5 h-5 mr-2" />
                        Job Fit Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center space-y-4">
                        <div className="text-4xl font-bold text-green-600">
                          {state.results.overallScore.jobFitScore}/10
                        </div>
                        <div className="text-lg font-semibold">Job Fit Score</div>
                        <p className="text-gray-600">
                          How well your responses align with the specific job requirements
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Category Scores */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Performance Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(state.results.overallScore.categoryScores).map(([category, score]) => (
                        <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <span className="font-medium capitalize">{category.replace(/([A-Z])/g, ' $1')}</span>
                          <Badge variant="outline">{(score as number).toFixed(1)}/10</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Summary */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{state.results.summary.summary}</p>
                    {state.results.summary.jobFitAnalysis && (
                      <div className="mb-4 p-4 bg-blue-50 rounded">
                        <h4 className="font-semibold text-blue-800 mb-2">Job Fit Analysis:</h4>
                        <p className="text-blue-700">{state.results.summary.jobFitAnalysis}</p>
                      </div>
                    )}
                    {state.results.summary.marketPositioning && (
                      <div className="mb-4 p-4 bg-green-50 rounded">
                        <h4 className="font-semibold text-green-800 mb-2">Market Positioning:</h4>
                        <p className="text-green-700">{state.results.summary.marketPositioning}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                          <Star className="w-4 h-4 mr-2" />
                          Key Strengths
                        </h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {state.results.summary.strengths.map((strength: string, index: number) => (
                            <li key={index}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-orange-700 mb-2 flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          Areas for Improvement
                        </h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {state.results.summary.areasForImprovement.map((area: string, index: number) => (
                            <li key={index}>{area}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {state.results.summary.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-gray-700">{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button onClick={handleDownloadCertificate} className="flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Download Certificate
                      </Button>
                      <Button variant="outline" onClick={handleRestart}>
                        Start New Interview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
        {/* Certificate Download Modal */}
        {state.results && state.parsedJob && (
          <CertificateDownloadModal
            isOpen={showCertificateModal}
            onClose={() => setShowCertificateModal(false)}
            certificateData={{
              candidateName: setupData.candidateName,
              position: state.parsedJob.title,
              industry: state.parsedJob.industry,
              score: state.results.overallScore.totalScore,
              maxScore: state.results.overallScore.maxPossibleScore,
              percentage: state.results.overallScore.percentage,
              grade: state.results.overallScore.grade,
              date: new Date(),
              sessionId: state.session?.id || '',
              type: 'job-specific'
            }}
          />
        )}
      </>
    );
  }

  return null;
} 
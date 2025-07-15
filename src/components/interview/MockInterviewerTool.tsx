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
  SkipForward, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Trophy,
  Target,
  Users,
  Brain,
  Star
} from 'lucide-react';
import { 
  InterviewSession, 
  InterviewQuestion, 
  AnswerEvaluation,
  roleCompetencyData
} from '@/lib/interviewAI';
import { 
  industries, 
  positions, 
  formatTime, 
  generateCertificateHTML 
} from '@/lib/interviewUtils';

interface InterviewState {
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

export default function MockInterviewerTool() {
  const [state, setState] = useState<InterviewState>({
    stage: 'setup',
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
    type: 'role-based' as 'technical' | 'behavioral' | 'mixed' | 'role-based',
    industry: 'Technology',
    position: 'Software Engineer',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    totalQuestions: 5,
    candidateName: '',
    experienceLevel: 'mid' as 'entry' | 'mid' | 'senior'
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

  const handleStartInterview = async () => {
    if (!setupData.candidateName.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter your name' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          ...setupData,
          ...(setupData.type === 'role-based' && { 
            roleCompetencies: getRoleCompetencies(setupData.position, setupData.experienceLevel)
          })
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
        session: data.session,
        currentQuestion: null, // Clear current question to show "Next Question" button
        currentAnswer: '',
        lastEvaluation: null,
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

  const handleDownloadCertificate = () => {
    if (!state.results || !setupData.candidateName) return;

    const certificateData = {
      candidateName: setupData.candidateName,
      position: setupData.position,
      industry: setupData.industry,
      score: state.results.overallScore.totalScore,
      maxScore: state.results.overallScore.maxPossibleScore,
      percentage: state.results.overallScore.percentage,
      grade: state.results.overallScore.grade,
      date: new Date(),
      sessionId: state.session?.id || ''
    };

    const html = generateCertificateHTML(certificateData);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-certificate-${certificateData.sessionId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestart = () => {
    setState({
      stage: 'setup',
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

  const getPositionOptions = () => {
    return positions[setupData.industry as keyof typeof positions] || [];
  };

  const getRoleCompetencies = (position: string, experienceLevel: string) => {
    const roleData = roleCompetencyData[position as keyof typeof roleCompetencyData];
    if (!roleData) return [];
    
    // Get competencies for the specific experience level
    const competencies = roleData[experienceLevel as keyof typeof roleData];
    if (!competencies) return [];
    
    return competencies;
  };

  if (state.stage === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Users className="w-12 h-12 text-blue-600 mr-3" />
                <div>
                  <CardTitle className="text-3xl font-bold">Mock Interviewer</CardTitle>
                  <CardDescription className="text-lg">
                    AI-Powered Interview Practice & Assessment
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
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
                    <Label htmlFor="industry">Industry</Label>
                    <select
                      id="industry"
                      value={setupData.industry}
                      onChange={(e) => setSetupData(prev => ({ 
                        ...prev, 
                        industry: e.target.value,
                        position: positions[e.target.value as keyof typeof positions]?.[0] || ''
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {industries.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="position">Position</Label>
                    <select
                      id="position"
                      value={setupData.position}
                      onChange={(e) => setSetupData(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {getPositionOptions().map(position => (
                        <option key={position} value={position}>{position}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">Interview Type</Label>
                    <select
                      id="type"
                      value={setupData.type}
                      onChange={(e) => setSetupData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="role-based">Role-Based (Recommended)</option>
                      <option value="technical">Technical</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="mixed">Mixed</option>
                    </select>
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
                      <option value={15}>15 Questions</option>
                    </select>
                  </div>

                  {setupData.type === 'role-based' && (
                    <div>
                      <Label htmlFor="experienceLevel">Experience Level</Label>
                      <select
                        id="experienceLevel"
                        value={setupData.experienceLevel}
                        onChange={(e) => setSetupData(prev => ({ ...prev, experienceLevel: e.target.value as any }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="entry">Entry Level (0-2 years)</option>
                        <option value="mid">Mid Level (2-5 years)</option>
                        <option value="senior">Senior Level (5+ years)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {state.error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {state.error}
                </div>
              )}

              <div className="mt-6 text-center">
                <Button 
                  onClick={handleStartInterview} 
                  disabled={state.loading}
                  className="px-8 py-3 text-lg"
                >
                  {state.loading ? 'Starting...' : 'Start Interview'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                    {setupData.position} • {setupData.industry} • {setupData.difficulty}
                    {state.currentQuestion?.topic && (
                      <span className="ml-2 text-blue-600">
                        • Topic: {state.currentQuestion.topic.replace(/_/g, ' ')}
                      </span>
                    )}
                    {state.currentQuestion?.depth && (
                      <span className="ml-2 text-purple-600">
                        • {state.currentQuestion.depth}
                      </span>
                    )}
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
                    {state.currentQuestion.category}
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

          {/* Next Question Button */}
          {!state.currentQuestion && !state.loading && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-blue-800 mb-4">Answer submitted successfully!</p>
                  <Button onClick={handleNextQuestion} disabled={state.loading}>
                    {state.loading ? 'Loading...' : 'Next Question'}
                  </Button>
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

  if (state.stage === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Trophy className="w-12 h-12 text-yellow-600 mr-3" />
                <div>
                  <CardTitle className="text-3xl font-bold">Interview Complete!</CardTitle>
                  <CardDescription className="text-lg">
                    Here are your results and performance analysis
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {state.results && (
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
                      {setupData.position} • {setupData.industry} • {setupData.difficulty}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overall Stats */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Interview Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">{state.results.summary.overallStats.questionsAnswered}</div>
                      <div className="text-sm text-gray-600">Questions</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">{state.results.summary.overallStats.completionTime}</div>
                      <div className="text-sm text-gray-600">Duration</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="text-2xl font-bold text-purple-600">{state.results.summary.overallStats.percentage}%</div>
                      <div className="text-sm text-gray-600">Score</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded">
                      <div className="text-2xl font-bold text-orange-600">{state.results.summary.overallStats.grade}</div>
                      <div className="text-sm text-gray-600">Grade</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Feedback */}
              {state.results.summary.categoryFeedback && state.results.summary.categoryFeedback.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Category Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {state.results.summary.categoryFeedback.map((feedback: string, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <span className="font-medium">{feedback.split(':')[0]}</span>
                          <Badge variant="outline">{feedback.split(':')[1]}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Summary */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{state.results.summary.summary}</p>
                  
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

              {/* Topic Analysis */}
              {state.results.summary.topicAnalysis && Object.keys(state.results.summary.topicAnalysis).length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Topic Performance Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(state.results.summary.topicAnalysis).map(([topic, analysis]: [string, any]) => (
                        <div key={topic} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold capitalize">{topic.replace(/_/g, ' ')}</h4>
                            <Badge variant={analysis.performance === 'Excellent' ? 'default' : 
                                          analysis.performance === 'Good' ? 'secondary' : 
                                          analysis.performance === 'Fair' ? 'outline' : 'destructive'}>
                              {analysis.performance}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            Score: {analysis.averageScore}% • Questions: {analysis.questions}
                          </div>
                          {analysis.strengths && analysis.strengths.length > 0 && (
                            <div className="text-sm">
                              <span className="font-medium text-green-700">Strengths:</span> {analysis.strengths.slice(0, 2).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Learning Path */}
              {state.results.summary.learningPath && state.results.summary.learningPath.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Personalized Learning Path</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {state.results.summary.learningPath.map((step: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <p className="text-gray-700">{step}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Job Fit & Market Analysis */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Job Fit & Market Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded">
                      <h4 className="font-semibold text-blue-800 mb-2">Job Fit Analysis</h4>
                      <p className="text-blue-700">{state.results.summary.jobFitAnalysis}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                      <h4 className="font-semibold text-green-800 mb-2">Market Positioning</h4>
                      <p className="text-green-700">{state.results.summary.marketPositioning}</p>
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
    );
  }

  return null;
} 
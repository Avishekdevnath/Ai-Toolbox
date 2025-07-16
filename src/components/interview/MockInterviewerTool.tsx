'use client';

import React, { useState, useEffect } from 'react';
import { InterviewSetup } from './components/InterviewSetup';
import { InterviewSession } from './components/InterviewSession';
import { InterviewResults } from './components/InterviewResults';
import CertificateDownloadModal from '../CertificateDownloadModal';
import { CertificateData } from '@/lib/certificateUtils';
import { InterviewState, SetupData } from './types';
import { roleCompetencyData } from '@/lib/interviewAI';

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

  const [setupData, setSetupData] = useState<SetupData>({
    type: 'role-based',
    industry: 'Technology',
    position: 'Software Engineer',
    difficulty: 'medium',
    totalQuestions: 5,
    candidateName: '',
    experienceLevel: 'mid'
  });

  const [showCertificateModal, setShowCertificateModal] = useState(false);

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
        currentQuestion: null,
        currentAnswer: '',
        lastEvaluation: null,
        loading: false
      }));

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
    setShowCertificateModal(true);
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
    setSetupData({
      type: 'role-based',
      industry: 'Technology',
      position: 'Software Engineer',
      difficulty: 'medium',
      totalQuestions: 5,
      candidateName: '',
      experienceLevel: 'mid'
    });
  };

  const getRoleCompetencies = (position: string, experienceLevel: string) => {
    const roleData = roleCompetencyData[position as keyof typeof roleCompetencyData];
    if (!roleData) return [];
    
    // Get competencies for the specific experience level
    const competencies = roleData[experienceLevel as keyof typeof roleData];
    if (!competencies) return [];
    
    return competencies;
  };

  // Render based on stage
  if (state.stage === 'setup') {
    return (
      <InterviewSetup
        setupData={setupData}
        setSetupData={setSetupData}
        state={state}
        onStartInterview={handleStartInterview}
      />
    );
  }

  if (state.stage === 'interview') {
    return (
      <InterviewSession
        state={state}
        setState={setState}
        setupData={setupData}
        onNextQuestion={handleNextQuestion}
        onSubmitAnswer={handleSubmitAnswer}
      />
    );
  }

  if (state.stage === 'results') {
    return (
      <>
        <InterviewResults
          state={state}
          setupData={setupData}
          onDownloadCertificate={handleDownloadCertificate}
          onRestart={handleRestart}
        />
        
        {/* Certificate Download Modal */}
          {state.results && (
          <CertificateDownloadModal
            isOpen={showCertificateModal}
            onClose={() => setShowCertificateModal(false)}
            certificateData={{
              candidateName: setupData.candidateName,
              position: setupData.position,
              industry: setupData.industry,
              score: state.results.overallScore.totalScore,
              maxScore: state.results.overallScore.maxPossibleScore,
              percentage: state.results.overallScore.percentage,
              grade: state.results.overallScore.grade,
              date: new Date(),
              sessionId: state.session?.id || '',
              type: 'mock'
            }}
          />
        )}
      </>
    );
  }

  return null;
} 
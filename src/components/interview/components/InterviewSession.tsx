'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Brain
} from 'lucide-react';
import { InterviewState, SetupData } from '../types';
import { formatTime } from '@/lib/interviewUtils';

interface InterviewSessionProps {
  state: InterviewState;
  setState: React.Dispatch<React.SetStateAction<InterviewState>>;
  setupData: SetupData;
  onNextQuestion: () => void;
  onSubmitAnswer: () => void;
}

export function InterviewSession({ 
  state, 
  setState, 
  setupData, 
  onNextQuestion, 
  onSubmitAnswer 
}: InterviewSessionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Mock Interview</CardTitle>
                <CardDescription>
                  {setupData.position} • {setupData.industry} • {setupData.difficulty}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Question</div>
                <div className="text-2xl font-bold text-blue-600">
                  {state.session?.currentQuestionIndex || 0}/{state.session?.totalQuestions || 0}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Timer */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                <span className="text-lg font-semibold">Time Remaining</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(state.timeRemaining)}
              </div>
            </div>
            <Progress 
              value={(state.timeRemaining / (state.currentQuestion?.timeLimit || 1)) * 100} 
              className="h-2"
            />
          </CardContent>
        </Card>

        {/* Question */}
        {state.currentQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Question {state.session?.currentQuestionIndex || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-4">{state.currentQuestion.question}</p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="answer">Your Answer</Label>
                  <Textarea
                    id="answer"
                    value={state.currentAnswer}
                    onChange={(e) => setState(prev => ({ ...prev, currentAnswer: e.target.value }))}
                    placeholder="Type your answer here..."
                    className="mt-1 min-h-[120px]"
                    disabled={state.loading}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={onSubmitAnswer}
                    disabled={state.loading || !state.currentAnswer.trim()}
                    className="flex-1"
                  >
                    {state.loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit Answer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Question Button */}
        {!state.currentQuestion && state.session && !state.session.isComplete && (
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={onNextQuestion}
                disabled={state.loading}
                className="w-full"
                size="lg"
              >
                {state.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading Next Question...
                  </>
                ) : (
                  <>
                    <SkipForward className="w-4 h-4 mr-2" />
                    Next Question
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {state.error && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{state.error}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';

interface QuizTimerProps {
  totalMinutes: number;
  onTimeUp: () => void;
  onTimeUpdate?: (remainingSeconds: number) => void;
  autoStart?: boolean;
  showProgress?: boolean;
  warningThreshold?: number; // minutes before warning
  className?: string;
  allowControls?: boolean; // whether to show pause/resume/reset controls
}

export default function QuizTimer({
  totalMinutes,
  onTimeUp,
  onTimeUpdate,
  autoStart = false,
  showProgress = true,
  warningThreshold = 5,
  className = '',
  allowControls = true,
}: QuizTimerProps) {
  const totalSeconds = totalMinutes * 60;
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(autoStart);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    return ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  };

  const getTimeColor = (): string => {
    const remainingMinutes = remainingSeconds / 60;
    if (remainingMinutes <= warningThreshold) return 'text-red-600';
    if (remainingMinutes <= warningThreshold * 2) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (): string => {
    const remainingMinutes = remainingSeconds / 60;
    if (remainingMinutes <= warningThreshold) return 'bg-red-500';
    if (remainingMinutes <= warningThreshold * 2) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const startTimer = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    setHasStarted(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
    setIsRunning(false);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const resetTimer = useCallback(() => {
    setRemainingSeconds(totalSeconds);
    setIsRunning(false);
    setIsPaused(false);
    setHasStarted(false);
  }, [totalSeconds]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(prev => {
          const newRemaining = prev - 1;

          if (newRemaining <= 0) {
            console.log('⏰ QuizTimer: Time reached zero, calling onTimeUp');
            setIsRunning(false);
            // Use setTimeout to avoid calling during render
            setTimeout(() => {
              console.log('⏰ QuizTimer: Executing onTimeUp callback');
              onTimeUp();
            }, 0);
            return 0;
          }

          if (onTimeUpdate) {
            onTimeUpdate(newRemaining);
          }

          return newRemaining;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, isPaused, remainingSeconds, onTimeUp, onTimeUpdate]);

  // Auto-start effect
  useEffect(() => {
    if (autoStart && !hasStarted) {
      startTimer();
    }
  }, [autoStart, hasStarted, startTimer]);

  const isWarning = remainingSeconds <= (warningThreshold * 60);
  const isCritical = remainingSeconds <= 60; // Last minute

  return (
    <Card className={`border-l-4 ${isWarning ? 'border-l-red-500' : 'border-l-blue-500'} ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className={`w-5 h-5 ${getTimeColor()}`} />
          Quiz Timer
          {isWarning && (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Time Display */}
        <div className="text-center">
          <div className={`text-4xl font-mono font-bold ${getTimeColor()}`}>
            {formatTime(remainingSeconds)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Total: {totalMinutes} minutes
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="space-y-2">
            <Progress
              value={getProgress()}
              className="h-2"
              // Custom styling for progress bar color
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>Started</span>
              <span>{Math.round(getProgress())}% Complete</span>
              <span>Time Up</span>
            </div>
          </div>
        )}

        {/* Warning Messages */}
        {isCritical && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Less than 1 minute remaining! Please complete your answers.
            </AlertDescription>
          </Alert>
        )}

        {isWarning && !isCritical && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              {Math.ceil(remainingSeconds / 60)} minutes remaining. Please work quickly.
            </AlertDescription>
          </Alert>
        )}

        {/* Timer Controls */}
        {allowControls && (
          <div className="flex justify-center gap-2">
            {!hasStarted ? (
              <Button onClick={startTimer} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Start Quiz
              </Button>
            ) : (
              <>
                {isRunning ? (
                  <Button onClick={pauseTimer} variant="outline" className="flex items-center gap-2">
                    <Pause className="w-4 h-4" />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={resumeTimer} className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Resume
                  </Button>
                )}

                <Button onClick={resetTimer} variant="outline" className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </>
            )}
          </div>
        )}

        {/* Status Information */}
        <div className="text-center text-sm text-gray-600">
          {isPaused && <span className="text-yellow-600">⏸️ Timer Paused</span>}
          {isRunning && !isWarning && <span className="text-green-600">▶️ Timer Running</span>}
          {remainingSeconds === 0 && <span className="text-red-600">⏰ Time's Up!</span>}
        </div>

        {/* Accessibility: Screen reader announcement */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {remainingSeconds <= 60 && remainingSeconds > 0 && `Warning: ${remainingSeconds} seconds remaining`}
          {remainingSeconds === 0 && "Time's up! Quiz timer has expired."}
        </div>
      </CardContent>

      {/* Custom CSS for progress bar color */}
      <style jsx>{`
        .progress-indicator {
          background: ${getProgressColor()};
        }
      `}</style>
    </Card>
  );
}


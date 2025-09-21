import { useMemo, useEffect } from 'react';
import { calculateQuizPoints, debugAllQuizFields, QuizField, QuizPointsCalculation } from '@/lib/quizPointsService';

interface UseQuizPointsOptions {
  enableLogging?: boolean;
  enableDebug?: boolean;
  logOnChange?: boolean;
}

interface UseQuizPointsReturn {
  totalPoints: number;
  calculation: QuizPointsCalculation;
  isQuizForm: boolean;
}

/**
 * Hook for calculating and monitoring quiz points in real-time
 */
export function useQuizPoints(
  fields: QuizField[],
  formType: string,
  options: UseQuizPointsOptions = {}
): UseQuizPointsReturn {
  const {
    enableLogging = true,
    enableDebug = false,
    logOnChange = true
  } = options;

  const isQuizForm = formType === 'quiz';

  const calculation = useMemo(() => {
    if (enableDebug) {
      debugAllQuizFields(fields, formType);
    }
    
    return calculateQuizPoints(fields, formType, enableLogging);
  }, [fields, formType, enableLogging, enableDebug]);

  // Real-time logging when values change
  useEffect(() => {
    if (logOnChange && isQuizForm) {
      console.log('🔄 Quiz Points Updated:', {
        timestamp: new Date().toISOString(),
        totalPoints: calculation.totalPoints,
        fieldCount: calculation.fieldCount,
        fieldsWithPoints: calculation.fieldsWithPoints.length,
        fieldsWithoutPoints: calculation.fieldsWithoutPoints.length
      });
    }
  }, [calculation.totalPoints, calculation.fieldCount, isQuizForm, logOnChange]);

  return {
    totalPoints: calculation.totalPoints,
    calculation,
    isQuizForm
  };
}

/**
 * Hook for debugging quiz field changes
 */
export function useQuizFieldDebugger(fields: QuizField[], formType: string) {
  useEffect(() => {
    if (formType === 'quiz') {
      console.log('🎯 Quiz Field Debugger - Fields Changed:', {
        timestamp: new Date().toISOString(),
        fieldCount: fields.length,
        fields: fields.map((field, index) => ({
          index: index + 1,
          id: field.id,
          label: field.label,
          type: field.type,
          quiz: field.quiz,
          hasPoints: !!(field?.quiz?.points && field.quiz.points > 0)
        }))
      });
    }
  }, [fields, formType]);
}

/**
 * Hook for monitoring specific field changes
 */
export function useQuizFieldMonitor(
  fieldId: string,
  field: QuizField | undefined,
  formType: string
) {
  useEffect(() => {
    if (formType === 'quiz' && field) {
      console.log(`🎯 Field Monitor - ${field.label || fieldId}:`, {
        timestamp: new Date().toISOString(),
        fieldId,
        label: field.label,
        type: field.type,
        quiz: field.quiz,
        points: field?.quiz?.points || 0,
        hasQuizObject: !!field.quiz
      });
    }
  }, [fieldId, field, formType]);
}

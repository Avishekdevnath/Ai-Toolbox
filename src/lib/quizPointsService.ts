/**
 * Quiz Points Service
 * Utility service for calculating and managing quiz points
 */

export interface QuizField {
  id: string;
  label: string;
  type: string;
  quiz?: {
    points?: number;
    correctOptions?: number[];
    explanation?: string;
  };
}

export interface QuizPointsCalculation {
  totalPoints: number;
  fieldCount: number;
  fieldsWithPoints: Array<{
    id: string;
    label: string;
    points: number;
  }>;
  fieldsWithoutPoints: Array<{
    id: string;
    label: string;
  }>;
}

/**
 * Calculate total points for quiz fields
 */
export function calculateQuizPoints(
  fields: QuizField[], 
  formType: string,
  enableLogging: boolean = true
): QuizPointsCalculation {
  if (formType !== 'quiz') {
    if (enableLogging) {
      console.log('🔍 Quiz Points Service: Form type is not "quiz", returning 0 points');
    }
    return {
      totalPoints: 0,
      fieldCount: 0,
      fieldsWithPoints: [],
      fieldsWithoutPoints: []
    };
  }

  const fieldsWithPoints: Array<{ id: string; label: string; points: number }> = [];
  const fieldsWithoutPoints: Array<{ id: string; label: string }> = [];
  let totalPoints = 0;

  fields.forEach((field, index) => {
    const points = field?.quiz?.points || 0;
    
    if (points > 0) {
      fieldsWithPoints.push({
        id: field.id,
        label: field.label || `Question ${index + 1}`,
        points: points
      });
      totalPoints += points;
    } else {
      fieldsWithoutPoints.push({
        id: field.id,
        label: field.label || `Question ${index + 1}`
      });
    }
  });

  const result: QuizPointsCalculation = {
    totalPoints,
    fieldCount: fields.length,
    fieldsWithPoints,
    fieldsWithoutPoints
  };

  if (enableLogging) {
    console.log('📊 Quiz Points Calculation:', {
      formType,
      totalFields: fields.length,
      totalPoints,
      breakdown: {
        fieldsWithPoints: fieldsWithPoints.length,
        fieldsWithoutPoints: fieldsWithoutPoints.length
      },
      details: {
        fieldsWithPoints: fieldsWithPoints.map(f => `${f.label}: ${f.points} pts`),
        fieldsWithoutPoints: fieldsWithoutPoints.map(f => `${f.label}: 0 pts`)
      }
    });
  }

  return result;
}

/**
 * Validate quiz field points
 */
export function validateQuizPoints(field: QuizField): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!field.quiz) {
    errors.push('Field has no quiz object');
    return { isValid: false, errors, warnings };
  }

  const points = field.quiz.points || 0;

  if (points < 0) {
    errors.push('Points cannot be negative');
  }

  if (points === 0) {
    warnings.push('Field has 0 points - it will not contribute to total score');
  }

  if (points > 1000) {
    warnings.push('Points exceed 1000 - consider if this is intentional');
  }

  if (!Number.isInteger(points)) {
    warnings.push('Points should be whole numbers');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get quiz statistics
 */
export function getQuizStatistics(fields: QuizField[], formType: string) {
  const calculation = calculateQuizPoints(fields, formType, false);
  
  return {
    ...calculation,
    averagePoints: calculation.fieldCount > 0 ? calculation.totalPoints / calculation.fieldCount : 0,
    maxPoints: Math.max(...calculation.fieldsWithPoints.map(f => f.points), 0),
    minPoints: Math.min(...calculation.fieldsWithPoints.map(f => f.points), 0),
    hasZeroPointFields: calculation.fieldsWithoutPoints.length > 0
  };
}

/**
 * Debug quiz field structure
 */
export function debugQuizField(field: QuizField, fieldIndex: number) {
  console.log(`🔍 Debug Field ${fieldIndex + 1}:`, {
    id: field.id,
    label: field.label,
    type: field.type,
    hasQuizObject: !!field.quiz,
    quizObject: field.quiz,
    points: field?.quiz?.points,
    correctOptions: field?.quiz?.correctOptions,
    explanation: field?.quiz?.explanation
  });
}

/**
 * Debug all quiz fields
 */
export function debugAllQuizFields(fields: QuizField[], formType: string) {
  console.log('🔍 Debug All Quiz Fields:', {
    formType,
    totalFields: fields.length,
    fields: fields.map((field, index) => ({
      index: index + 1,
      id: field.id,
      label: field.label,
      type: field.type,
      hasQuiz: !!field.quiz,
      points: field?.quiz?.points || 0
    }))
  });
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Eye,
  EyeOff
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { getQuizThemeClasses } from '@/lib/themeUtils';

interface CorrectAnswersViewProps {
  formData: {
    title: string;
    description?: string;
    fields: Array<{
      id: string;
      label: string;
      type: string;
      options?: string[];
      quiz?: {
        points?: number;
        correctOptions?: number[];
        explanation?: string;
      };
    }>;
  };
  answers: Array<{
    fieldId: string;
    questionCode?: string;
    value: any;
  }>;
  onBack: () => void;
}

export default function CorrectAnswersView({
  formData,
  answers,
  onBack
}: CorrectAnswersViewProps) {
  const { resolvedTheme } = useTheme();
  const themeClasses = getQuizThemeClasses(resolvedTheme);
  const [showExplanations, setShowExplanations] = useState(false);

  const getFieldById = (fieldId: string) => {
    return formData.fields.find(f => f.id === fieldId);
  };

  const getAnswerForField = (fieldId: string) => {
    return answers.find(a => a.fieldId === fieldId);
  };

  const isCorrectAnswer = (field: any, answer: any) => {
    if (!field.quiz?.correctOptions || field.quiz.correctOptions.length === 0) {
      return true; // No correct answer defined, consider it correct
    }

    if (field.type === 'checkbox') {
      const given = new Set(Array.isArray(answer?.value) ? answer.value : []);
      const labels = (field.options || []).map((o: any, idx: number) => ({ idx, o }));
      const correctLabels = new Set(labels.filter(x => field.quiz.correctOptions.includes(x.idx)).map(x => x.o));
      const givenClean = new Set((Array.isArray(answer?.value) ? answer.value : []).map((v: any) => String(v)));
      return Array.from(correctLabels).every(l => givenClean.has(String(l))) &&
             Array.from(givenClean).every(l => correctLabels.has(String(l)));
    } else {
      const idx = (field.options || []).findIndex((o: any) => o === answer?.value);
      return idx >= 0 && field.quiz.correctOptions.includes(idx);
    }
  };

  const getCorrectOptions = (field: any) => {
    if (!field.quiz?.correctOptions || field.quiz.correctOptions.length === 0) {
      return [];
    }
    return field.options?.filter((_: any, idx: number) => 
      field.quiz.correctOptions.includes(idx)
    ) || [];
  };

  const renderFieldAnswer = (field: any, answer: any) => {
    const isCorrect = isCorrectAnswer(field, answer);
    const correctOptions = getCorrectOptions(field);

    switch (field.type) {
      case 'short_text':
      case 'long_text':
      case 'email':
      case 'number':
      case 'date':
      case 'time':
        return (
          <div className="space-y-3">
            <div className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-semibold text-sm ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  Your Answer
                </span>
              </div>
              <div className={`text-sm font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {answer?.value || 'No answer provided'}
              </div>
            </div>
            {!isCorrect && correctOptions.length > 0 && (
              <div className="p-4 rounded-lg border-2 border-green-300 bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-sm text-green-800">Correct Answer</span>
                </div>
                <div className="text-sm font-medium text-green-700">
                  {correctOptions.join(', ')}
                </div>
              </div>
            )}
          </div>
        );

      case 'radio':
      case 'single_select':
        return (
          <div className="space-y-2">
            <div className="space-y-2">
              {(field.options || []).map((option: string, idx: number) => {
                const isSelected = answer?.value === option;
                const isCorrectOption = field.quiz?.correctOptions?.includes(idx);
                const isCorrect = isSelected && isCorrectOption;
                const isWrong = isSelected && !isCorrectOption;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      isCorrect
                        ? 'border-green-300 bg-green-50 shadow-sm'
                        : isWrong
                        ? 'border-red-300 bg-red-50 shadow-sm'
                        : isCorrectOption
                        ? 'border-green-300 bg-green-50 shadow-sm'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {isWrong && <XCircle className="w-5 h-5 text-red-600" />}
                      {!isSelected && isCorrectOption && <CheckCircle className="w-5 h-5 text-green-600" />}
                      <input
                        type="radio"
                        checked={isSelected}
                        readOnly
                        className="w-4 h-4 text-blue-600"
                      />
                    </div>
                    <span
                      className={`flex-1 text-sm font-medium ${
                        isCorrect
                          ? 'text-green-800'
                          : isWrong
                          ? 'text-red-800 line-through'
                          : isCorrectOption
                          ? 'text-green-800'
                          : 'text-gray-600'
                      }`}
                    >
                      {option}
                    </span>
                    {isCorrectOption && !isSelected && (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Correct
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            <div className="space-y-2">
              {(field.options || []).map((option: string, idx: number) => {
                const isSelected = Array.isArray(answer?.value) && answer.value.includes(option);
                const isCorrectOption = field.quiz?.correctOptions?.includes(idx);
                const isCorrect = isSelected && isCorrectOption;
                const isWrong = isSelected && !isCorrectOption;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      isCorrect
                        ? 'border-green-300 bg-green-50 shadow-sm'
                        : isWrong
                        ? 'border-red-300 bg-red-50 shadow-sm'
                        : isCorrectOption
                        ? 'border-green-300 bg-green-50 shadow-sm'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {isWrong && <XCircle className="w-5 h-5 text-red-600" />}
                      {!isSelected && isCorrectOption && <CheckCircle className="w-5 h-5 text-green-600" />}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="w-4 h-4 text-blue-600"
                      />
                    </div>
                    <span
                      className={`flex-1 text-sm font-medium ${
                        isCorrect
                          ? 'text-green-800'
                          : isWrong
                          ? 'text-red-800 line-through'
                          : isCorrectOption
                          ? 'text-green-800'
                          : 'text-gray-600'
                      }`}
                    >
                      {option}
                    </span>
                    {isCorrectOption && !isSelected && (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Correct
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {answer?.value || 'No answer provided'}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Answer Review</h1>
          <p className="text-gray-600">Check your answers and see the correct solutions</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{formData.title}</h2>
                {formData.description && (
                  <p className="text-blue-100 text-sm mt-1">{formData.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowExplanations(!showExplanations)}
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  title={showExplanations ? 'Hide Explanations' : 'Show Explanations'}
                >
                  {showExplanations ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                
                <Button
                  onClick={onBack}
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  title="Back to Results"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6 space-y-6">
            {formData.fields.map((field, index) => {
              const answer = getAnswerForField(field.id);
              const isCorrect = isCorrectAnswer(field, answer);
              const points = field.quiz?.points || 0;

              return (
                <div key={field.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCorrect 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </h3>
                      </div>
                      {field.helpText && (
                        <p className="text-sm text-gray-600 ml-11">{field.helpText}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Correct
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                          <XCircle className="w-4 h-4" />
                          Incorrect
                        </div>
                      )}
                      {points > 0 && (
                        <div className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                          {points} point{points !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Answer Display */}
                  <div className="ml-11">
                    {renderFieldAnswer(field, answer)}
                  </div>

                  {/* Explanation */}
                  {showExplanations && field.quiz?.explanation && (
                    <div className="mt-4 ml-11 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <h4 className="font-semibold text-blue-900 mb-2 text-sm">💡 Explanation</h4>
                      <p className="text-blue-800 text-sm leading-relaxed">{field.quiz.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Back Button */}
            <div className="text-center pt-6">
              <Button
                onClick={onBack}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Results
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

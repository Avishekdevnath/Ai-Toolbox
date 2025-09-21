'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download,
  Trophy,
  Target,
  Star
} from 'lucide-react';
import { InterviewState, SetupData } from '../types';

interface InterviewResultsProps {
  state: InterviewState;
  setupData: SetupData;
  onDownloadCertificate: () => void;
  onRestart: () => void;
}

export function InterviewResults({ 
  state, 
  setupData, 
  onDownloadCertificate, 
  onRestart 
}: InterviewResultsProps) {
  if (!state.results) return null;

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
              <Button onClick={onDownloadCertificate} className="flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>
              <Button variant="outline" onClick={onRestart}>
                Start New Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
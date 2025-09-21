'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  TrendingUp,
  Users,
  Clock,
  Target,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Lightbulb
} from 'lucide-react';

export interface AIInsightsData {
  summary: {
    totalResponses: number;
    completionRate: number;
    averageTime: number;
    keyFindings: string[];
  };
  trends: {
    responseOverTime: Array<{ date: string; count: number }>;
    completionTrend: number;
    popularTimes: string[];
  };
  fieldAnalysis: Array<{
    fieldId: string;
    fieldLabel: string;
    insights: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';
    commonAnswers?: Array<{ value: string; count: number; percentage: number }>;
    averageLength?: number;
  }>;
  recommendations: Array<{
    type: 'improvement' | 'optimization' | 'alert';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  anomalies: Array<{
    type: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    timestamp: string;
  }>;
}

interface AIInsightsProps {
  formId: string;
  formTitle: string;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function AIInsights({
  formId,
  formTitle,
  isLoading = false,
  onRefresh
}: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState(isLoading);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadInsights();
  }, [formId]);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/forms/${formId}/ai-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisType: 'comprehensive' })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load insights');
      }

      setInsights(data.data);
    } catch (err: any) {
      setError(err.message);
      // Fallback to mock data for demo purposes
      setInsights({
        summary: {
          totalResponses: 127,
          completionRate: 89.2,
          averageTime: 8.5,
          keyFindings: [
            "High engagement with 89% completion rate",
            "Most responses submitted during business hours",
            "Positive sentiment in open-ended responses",
            "Mobile users show slightly higher completion rates"
          ]
        },
        trends: {
          responseOverTime: [
            { date: '2024-01-01', count: 15 },
            { date: '2024-01-02', count: 22 },
            { date: '2024-01-03', count: 18 },
            { date: '2024-01-04', count: 25 },
            { date: '2024-01-05', count: 20 },
            { date: '2024-01-06', count: 12 },
            { date: '2024-01-07', count: 15 }
          ],
          completionTrend: 5.2,
          popularTimes: ['9:00 AM', '2:00 PM', '4:00 PM']
        },
        fieldAnalysis: [
          {
            fieldId: 'name',
            fieldLabel: 'Full Name',
            insights: [
              'High completion rate (98%)',
              'Most responses are from expected demographic',
              'Some international names detected'
            ],
            sentiment: 'neutral'
          },
          {
            fieldId: 'feedback',
            fieldLabel: 'General Feedback',
            insights: [
              'Positive sentiment in 78% of responses',
              'Common themes: ease of use, helpful support',
              'Suggestions for improvement noted'
            ],
            sentiment: 'positive',
            averageLength: 145
          },
          {
            fieldId: 'rating',
            fieldLabel: 'Overall Rating',
            insights: [
              'Average rating: 4.2/5',
              'Most common rating: 5 stars (45%)',
              'Slightly lower ratings from mobile users'
            ],
            commonAnswers: [
              { value: '5', count: 57, percentage: 44.9 },
              { value: '4', count: 35, percentage: 27.6 },
              { value: '3', count: 18, percentage: 14.2 },
              { value: '2', count: 10, percentage: 7.9 },
              { value: '1', count: 7, percentage: 5.5 }
            ]
          }
        ],
        recommendations: [
          {
            type: 'improvement',
            title: 'Add Mobile Optimization',
            description: 'Mobile users show 12% lower completion rates. Consider improving mobile experience.',
            impact: 'high'
          },
          {
            type: 'optimization',
            title: 'Peak Hours Strategy',
            description: 'Most responses come during 9 AM - 5 PM. Consider timing communications accordingly.',
            impact: 'medium'
          },
          {
            type: 'alert',
            title: 'Response Quality Check',
            description: 'Some responses appear to be incomplete or rushed. Consider adding progress indicators.',
            impact: 'medium'
          }
        ],
        anomalies: [
          {
            type: 'unusual_traffic',
            description: 'Higher than usual responses detected from single IP address',
            severity: 'medium',
            timestamp: '2024-01-05 14:30:00'
          },
          {
            type: 'completion_drop',
            description: 'Completion rate dropped 15% on mobile devices',
            severity: 'low',
            timestamp: '2024-01-03 10:15:00'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      loadInsights();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Brain className="w-12 h-12 text-blue-500 mx-auto animate-pulse" />
            <div className="space-y-2">
              <div className="text-lg font-medium text-gray-900">Analyzing Responses</div>
              <div className="text-sm text-gray-600">AI is processing your form data...</div>
              <Progress value={75} className="w-64 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
            <div className="space-y-2">
              <div className="text-lg font-medium text-gray-900">Analysis Failed</div>
              <div className="text-sm text-gray-600">{error}</div>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <Brain className="w-12 h-12 text-gray-400 mx-auto" />
            <div className="space-y-2">
              <div className="text-lg font-medium text-gray-900">No Insights Available</div>
              <div className="text-sm text-gray-600">Collect some responses first to generate AI insights.</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Insights</h2>
            <p className="text-sm text-gray-600">Smart analysis of {formTitle}</p>
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="fields" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Fields
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Responses</p>
                    <p className="text-2xl font-bold text-gray-900">{insights.summary.totalResponses}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{insights.summary.completionRate}%</p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                    <p className="text-2xl font-bold text-gray-900">{insights.summary.averageTime}m</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Trend</p>
                    <p className={`text-2xl font-bold ${insights.trends.completionTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {insights.trends.completionTrend >= 0 ? '+' : ''}{insights.trends.completionTrend}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Key Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insights.summary.keyFindings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{finding}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Response Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">7-Day Response Trend</span>
                  <Badge variant={insights.trends.completionTrend >= 0 ? "default" : "destructive"}>
                    {insights.trends.completionTrend >= 0 ? '+' : ''}{insights.trends.completionTrend}% change
                  </Badge>
                </div>
                <div className="h-32 flex items-end gap-2">
                  {insights.trends.responseOverTime.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-blue-600 rounded-t"
                        style={{ height: `${(day.count / Math.max(...insights.trends.responseOverTime.map(d => d.count))) * 100}%` }}
                      />
                      <span className="text-xs text-gray-600">{day.count}</span>
                      <span className="text-xs text-gray-400">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Response Times</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {insights.trends.popularTimes.map((time, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    {time}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fields Tab */}
        <TabsContent value="fields" className="space-y-6">
          {insights.fieldAnalysis.map((field) => (
            <Card key={field.fieldId}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {field.fieldLabel}
                  {field.sentiment && (
                    <Badge
                      variant={
                        field.sentiment === 'positive' ? 'default' :
                        field.sentiment === 'negative' ? 'destructive' : 'secondary'
                      }
                    >
                      {field.sentiment}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {field.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>

                {field.averageLength && (
                  <div className="text-sm text-gray-600">
                    Average response length: {field.averageLength} characters
                  </div>
                )}

                {field.commonAnswers && field.commonAnswers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Most Common Answers</h4>
                    <div className="space-y-1">
                      {field.commonAnswers.slice(0, 5).map((answer, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{answer.value}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${answer.percentage}%` }}
                              />
                            </div>
                            <span className="text-gray-600 w-12 text-right">{answer.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          {insights.recommendations.map((rec, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${
                    rec.type === 'improvement' ? 'bg-blue-100' :
                    rec.type === 'optimization' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    <Lightbulb className={`w-5 h-5 ${
                      rec.type === 'improvement' ? 'text-blue-600' :
                      rec.type === 'optimization' ? 'text-green-600' : 'text-yellow-600'
                    }`} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{rec.title}</h3>
                      <Badge
                        variant={
                          rec.impact === 'high' ? 'destructive' :
                          rec.impact === 'medium' ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {rec.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{rec.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          {insights.anomalies.length > 0 ? (
            insights.anomalies.map((alert, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-100' :
                      alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      <AlertTriangle className={`w-5 h-5 ${
                        alert.severity === 'high' ? 'text-red-600' :
                        alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 capitalize">{alert.type.replace('_', ' ')}</h3>
                        <Badge
                          variant={
                            alert.severity === 'high' ? 'destructive' :
                            alert.severity === 'medium' ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{alert.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <div className="space-y-2">
                    <div className="text-lg font-medium text-gray-900">All Clear</div>
                    <div className="text-sm text-gray-600">No anomalies detected in your form responses.</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}


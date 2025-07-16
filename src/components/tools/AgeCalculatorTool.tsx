'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Heart, 
  Target, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Activity,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import type {
  AgeData,
  LifeMilestone,
  HealthRecommendation,
  RetirementPlan,
  LifeExpectancy,
  AgeBasedActivity
} from '@/lib/ageCalculatorUtils';

interface AgeAnalysisResponse {
  ageData: AgeData;
  lifeMilestones: LifeMilestone[];
  healthRecommendations: HealthRecommendation[];
  retirementPlan: RetirementPlan;
  lifeExpectancy: LifeExpectancy;
  ageBasedActivities: AgeBasedActivity[];
  lifePercentage: number;
  nextBirthday: {
    nextBirthday: Date;
    daysUntil: number;
    ageAtNextBirthday: number;
  };
  aiInsights?: {
    personalizedAdvice: string;
    lifeOptimizationTips: string[];
    motivationalMessage: string;
    futurePlanningSuggestions: string[];
  };
}

export default function AgeCalculatorTool() {
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [lifestyle, setLifestyle] = useState<'poor' | 'average' | 'excellent'>('average');
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [desiredRetirementIncome, setDesiredRetirementIncome] = useState(4000);
  const [includeAIInsights, setIncludeAIInsights] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgeAnalysisResponse | null>(null);
  const [error, setError] = useState('');

  const healthConditionOptions = [
    'diabetes', 'heart disease', 'cancer', 'obesity', 'smoking', 'alcoholism'
  ];

  const handleHealthConditionToggle = (condition: string) => {
    setHealthConditions(prev => 
      prev.includes(condition) 
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const handleCalculate = async () => {
    if (!birthDate) {
      setError('Please enter your birth date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze/age', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate,
          gender,
          lifestyle,
          healthConditions,
          retirementAge,
          currentSavings,
          monthlyIncome,
          desiredRetirementIncome,
          includeAIInsights
        })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate age analysis');
      }

      const data = await response.json();
      setResult(data);
      // After age calculation is displayed
      fetch('/api/tools/age-calculator/track-usage', { method: 'POST' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'personal': return <Calendar className="w-4 h-4" />;
      case 'career': return <TrendingUp className="w-4 h-4" />;
      case 'health': return <Heart className="w-4 h-4" />;
      case 'financial': return <DollarSign className="w-4 h-4" />;
      case 'social': return <Activity className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">AI-Powered Age Calculator</h1>
        <p className="text-gray-600">
          Discover your life journey with personalized insights, milestones, and recommendations
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date *</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={(value: 'male' | 'female') => setGender(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lifestyle">Lifestyle</Label>
              <Select value={lifestyle} onValueChange={(value: 'poor' | 'average' | 'excellent') => setLifestyle(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poor">Poor (Sedentary, unhealthy habits)</SelectItem>
                  <SelectItem value="average">Average (Moderate activity, balanced)</SelectItem>
                  <SelectItem value="excellent">Excellent (Active, healthy habits)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retirementAge">Retirement Age</Label>
              <Input
                id="retirementAge"
                type="number"
                value={retirementAge}
                onChange={(e) => setRetirementAge(Number(e.target.value))}
                min="50"
                max="80"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Health Conditions (Optional)</Label>
            <div className="flex flex-wrap gap-2">
              {healthConditionOptions.map(condition => (
                <Badge
                  key={condition}
                  variant={healthConditions.includes(condition) ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => handleHealthConditionToggle(condition)}
                >
                  {condition}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="currentSavings">Current Savings ($)</Label>
              <Input
                id="currentSavings"
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value))}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">Monthly Income ($)</Label>
              <Input
                id="monthlyIncome"
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desiredRetirementIncome">Desired Monthly Retirement Income ($)</Label>
              <Input
                id="desiredRetirementIncome"
                type="number"
                value={desiredRetirementIncome}
                onChange={(e) => setDesiredRetirementIncome(Number(e.target.value))}
                min="0"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeAI"
              checked={includeAIInsights}
              onChange={(e) => setIncludeAIInsights(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="includeAI" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Include AI-powered personalized insights
            </Label>
          </div>

          <Button 
            onClick={handleCalculate} 
            disabled={loading || !birthDate}
            className="w-full"
          >
            {loading ? 'Analyzing...' : 'Calculate Age Analysis'}
          </Button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Age Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Age Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.ageData.age.years}</div>
                  <div className="text-sm text-gray-600">Years</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.ageData.age.months}</div>
                  <div className="text-sm text-gray-600">Months</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{result.ageData.age.days}</div>
                  <div className="text-sm text-gray-600">Days</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{result.lifeExpectancy.overall}</div>
                  <div className="text-sm text-gray-600">Life Expectancy</div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Life Progress</span>
                    <span>{result.lifePercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={result.lifePercentage} className="h-2" />
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-lg font-semibold text-yellow-800">
                    Next Birthday: {new Date(result.nextBirthday.nextBirthday).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-yellow-600">
                    {result.nextBirthday.daysUntil} days away • You'll be {result.nextBirthday.ageAtNextBirthday} years old
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          {result.aiInsights && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Personalized Advice</h3>
                  <p className="text-blue-700">{result.aiInsights.personalizedAdvice}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-green-800 mb-3">Life Optimization Tips</h3>
                    <ul className="space-y-2">
                      {result.aiInsights.lifeOptimizationTips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-purple-800 mb-3">Future Planning Suggestions</h3>
                    <ul className="space-y-2">
                      {result.aiInsights.futurePlanningSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Target className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Motivational Message</h3>
                  <p className="text-green-700 italic">"{result.aiInsights.motivationalMessage}"</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="milestones" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="retirement">Retirement</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="expectancy">Life Expectancy</TabsTrigger>
            </TabsList>

            <TabsContent value="milestones" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Life Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.lifeMilestones.map((milestone, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          {milestone.achieved ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <Clock className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{milestone.title}</h3>
                            <Badge className={getImportanceColor(milestone.importance)}>
                              {milestone.importance}
                            </Badge>
                            {getCategoryIcon(milestone.category)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                          {!milestone.achieved && (
                            <div className="text-sm text-blue-600">
                              {milestone.yearsUntil} years until this milestone
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="health" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Health Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.healthRecommendations.map((recommendation, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{recommendation.title}</h3>
                          <Badge className={getImportanceColor(recommendation.priority)}>
                            {recommendation.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                        <div className="text-sm text-gray-500 mb-2">
                          <strong>Frequency:</strong> {recommendation.frequency}
                        </div>
                        <div>
                          <strong className="text-sm">Benefits:</strong>
                          <ul className="mt-1 space-y-1">
                            {recommendation.benefits.map((benefit, benefitIndex) => (
                              <li key={benefitIndex} className="text-sm text-gray-600 flex items-center gap-1">
                                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="retirement" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Retirement Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {result.retirementPlan.yearsUntilRetirement}
                        </div>
                        <div className="text-sm text-blue-600">Years until retirement</div>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(result.retirementPlan.monthlySavingsNeeded)}
                        </div>
                        <div className="text-sm text-green-600">Monthly savings needed</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(result.retirementPlan.totalSavingsNeeded)}
                        </div>
                        <div className="text-sm text-purple-600">Total savings needed</div>
                      </div>
                      
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {result.retirementPlan.retirementYears}
                        </div>
                        <div className="text-sm text-orange-600">Years in retirement</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Current Status</h3>
                    <div className="space-y-2 text-sm">
                      <div>Current Age: {result.retirementPlan.currentAge}</div>
                      <div>Retirement Age: {result.retirementPlan.retirementAge}</div>
                      <div>Current Savings: {formatCurrency(result.retirementPlan.currentSavings)}</div>
                      <div>Monthly Income: {formatCurrency(result.retirementPlan.monthlyIncome)}</div>
                      <div>Desired Retirement Income: {formatCurrency(result.retirementPlan.desiredRetirementIncome)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Age-Appropriate Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.ageBasedActivities.map((activity, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{activity.title}</h3>
                          <Badge variant="outline">{activity.ageRange}</Badge>
                          <Badge variant="outline">{activity.difficulty}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                        <div>
                          <strong className="text-sm">Benefits:</strong>
                          <ul className="mt-1 space-y-1">
                            {activity.benefits.map((benefit, benefitIndex) => (
                              <li key={benefitIndex} className="text-sm text-gray-600 flex items-center gap-1">
                                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expectancy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Life Expectancy Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {result.lifeExpectancy.overall} years
                      </div>
                      <div className="text-lg text-green-700">Estimated Life Expectancy</div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Factors Affecting Your Life Expectancy</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Gender Factor</span>
                          <span className={result.lifeExpectancy.factors.gender >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {result.lifeExpectancy.factors.gender >= 0 ? '+' : ''}{result.lifeExpectancy.factors.gender} years
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Lifestyle Factor</span>
                          <span className={result.lifeExpectancy.factors.lifestyle >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {result.lifeExpectancy.factors.lifestyle >= 0 ? '+' : ''}{result.lifeExpectancy.factors.lifestyle} years
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Health Conditions</span>
                          <span className={result.lifeExpectancy.factors.health >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {result.lifeExpectancy.factors.health >= 0 ? '+' : ''}{result.lifeExpectancy.factors.health} years
                          </span>
                        </div>
                      </div>
                    </div>

                    {result.lifeExpectancy.recommendations.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Recommendations to Improve Life Expectancy</h3>
                        <ul className="space-y-2">
                          {result.lifeExpectancy.recommendations.map((recommendation, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
} 
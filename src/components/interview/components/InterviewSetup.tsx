'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';
import { InterviewState, SetupData } from '../types';
import { industries, positions } from '@/lib/interviewUtils';

interface InterviewSetupProps {
  setupData: SetupData;
  setSetupData: React.Dispatch<React.SetStateAction<SetupData>>;
  state: InterviewState;
  onStartInterview: () => void;
}

export function InterviewSetup({ setupData, setSetupData, state, onStartInterview }: InterviewSetupProps) {
  const getPositionOptions = () => {
    return positions[setupData.industry as keyof typeof positions] || [];
  };

  const swotTypes = [
    { id: 'technical', title: 'Technical Interview', icon: '💻' },
    { id: 'behavioral', title: 'Behavioral Interview', icon: '🤝' },
    { id: 'mixed', title: 'Mixed Interview', icon: '🔄' },
    { id: 'role-based', title: 'Role-Based Interview', icon: '🎯' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Users className="w-12 h-12 text-blue-600 mr-3" />
              <div>
                <CardTitle className="text-3xl font-bold">Mock Interview Setup</CardTitle>
                <CardDescription className="text-lg">
                  Configure your interview session
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Candidate Name */}
              <div>
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  value={setupData.candidateName}
                  onChange={(e) => setSetupData(prev => ({ ...prev, candidateName: e.target.value }))}
                  placeholder="Enter your full name"
                  className="mt-1"
                />
              </div>

              {/* Interview Type */}
              <div>
                <Label>Interview Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {swotTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant={setupData.type === type.id ? 'default' : 'outline'}
                      onClick={() => setSetupData(prev => ({ ...prev, type: type.id as any }))}
                      className="h-auto p-3 flex flex-col items-center"
                    >
                      <span className="text-2xl mb-1">{type.icon}</span>
                      <span className="text-xs">{type.title}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Industry */}
              <div>
                <Label htmlFor="industry">Industry</Label>
                <select
                  id="industry"
                  value={setupData.industry}
                  onChange={(e) => setSetupData(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                >
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              {/* Position */}
              <div>
                <Label htmlFor="position">Position</Label>
                <select
                  id="position"
                  value={setupData.position}
                  onChange={(e) => setSetupData(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                >
                  {getPositionOptions().map((position) => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <Label>Experience Level</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { id: 'entry', label: 'Entry Level', icon: '🌱' },
                    { id: 'mid', label: 'Mid Level', icon: '🌿' },
                    { id: 'senior', label: 'Senior Level', icon: '🌳' }
                  ].map((level) => (
                    <Button
                      key={level.id}
                      variant={setupData.experienceLevel === level.id ? 'default' : 'outline'}
                      onClick={() => setSetupData(prev => ({ ...prev, experienceLevel: level.id as any }))}
                      className="h-auto p-3 flex flex-col items-center"
                    >
                      <span className="text-2xl mb-1">{level.icon}</span>
                      <span className="text-xs">{level.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <Label>Difficulty Level</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { id: 'easy', label: 'Easy', icon: '😊' },
                    { id: 'medium', label: 'Medium', icon: '😐' },
                    { id: 'hard', label: 'Hard', icon: '😰' }
                  ].map((difficulty) => (
                    <Button
                      key={difficulty.id}
                      variant={setupData.difficulty === difficulty.id ? 'default' : 'outline'}
                      onClick={() => setSetupData(prev => ({ ...prev, difficulty: difficulty.id as any }))}
                      className="h-auto p-3 flex flex-col items-center"
                    >
                      <span className="text-2xl mb-1">{difficulty.icon}</span>
                      <span className="text-xs">{difficulty.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Number of Questions */}
              <div>
                <Label htmlFor="questions">Number of Questions</Label>
                <select
                  id="questions"
                  value={setupData.totalQuestions}
                  onChange={(e) => setSetupData(prev => ({ ...prev, totalQuestions: parseInt(e.target.value) }))}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                >
                  {[3, 5, 7, 10, 15, 20].map((num) => (
                    <option key={num} value={num}>{num} questions</option>
                  ))}
                </select>
              </div>

              {/* Error Display */}
              {state.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{state.error}</p>
                </div>
              )}

              {/* Start Button */}
              <Button
                onClick={onStartInterview}
                disabled={state.loading || !setupData.candidateName.trim()}
                className="w-full"
                size="lg"
              >
                {state.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Starting Interview...
                  </>
                ) : (
                  <>
                    <span className="mr-2">▶️</span>
                    Start Interview
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
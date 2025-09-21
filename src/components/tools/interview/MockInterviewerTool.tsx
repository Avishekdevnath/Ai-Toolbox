'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function MockInterviewerTool() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Mock Interviewer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Get realistic interview practice with our AI interviewer
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Interview Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Interview Type</label>
              <select className="w-full p-2 border rounded-md">
                <option>Behavioral Interview</option>
                <option>Technical Interview</option>
                <option>Case Study Interview</option>
                <option>General Interview</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Industry</label>
              <Input placeholder="e.g., Technology, Finance, Healthcare" />
            </div>
            <div>
              <label className="text-sm font-medium">Interview Duration</label>
              <select className="w-full p-2 border rounded-md">
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>45 minutes</option>
                <option>60 minutes</option>
              </select>
            </div>
            <Button className="w-full">Begin Mock Interview</Button>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Badge variant="outline">Coming Soon</Badge>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            This feature is under development. Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  );
} 
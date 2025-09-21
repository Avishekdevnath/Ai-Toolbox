'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function ResumeReviewerTool() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Resume Reviewer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Get AI-powered feedback on your resume to improve your job applications
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resume Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Paste your resume content</label>
              <Textarea 
                placeholder="Paste your resume text here for AI-powered review and suggestions..."
                rows={10}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Target Job Title (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g., Software Engineer, Marketing Manager"
                className="w-full p-2 border rounded-md mt-2"
              />
            </div>
            <Button className="w-full">Review Resume</Button>
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
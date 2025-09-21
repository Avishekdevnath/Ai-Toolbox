'use client';

import { Suspense } from 'react';
import AnalyticsOverview from '@/components/forms/AnalyticsOverview';
import AIInsights from '@/components/forms/AIInsights';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Brain } from 'lucide-react';

interface AnalyticsTabsProps {
  formId: string;
}

export default function AnalyticsTabs({ formId }: AnalyticsTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Standard Analytics
        </TabsTrigger>
        <TabsTrigger value="insights" className="flex items-center gap-2">
          <Brain className="w-4 h-4" />
          AI Insights
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <Suspense fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Loading analytics...</p>
              </div>
            </CardContent>
          </Card>
        }>
          <AnalyticsOverview formId={formId} />
        </Suspense>
      </TabsContent>

      <TabsContent value="insights" className="space-y-6">
        <Suspense fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">AI analyzing your data...</p>
              </div>
            </CardContent>
          </Card>
        }>
          <AIInsights formId={formId} formTitle="Form Responses" />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}

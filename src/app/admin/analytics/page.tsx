import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity, BarChart2 } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="w-6 h-6 text-orange-600" />Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Visualize trends, user growth, and tool performance.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Analytics & Charts</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Integrate real analytics/charts here (e.g., with recharts, nivo, chart.js) */}
          <div className="text-gray-500 dark:text-gray-400">
            Coming soon: Visual analytics for user growth, tool trends, and more.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  BarChart2, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Wrench, 
  Clock,
  Eye,
  Download,
  Calendar,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalAnalyses: number;
  popularTools: Array<{
    name: string;
    usage: number;
    growth: number;
  }>;
  userGrowth: Array<{
    date: string;
    users: number;
  }>;
  toolUsage: Array<{
    tool: string;
    usage: number;
    percentage: number;
  }>;
  topPerformingTools: Array<{
    name: string;
    successRate: number;
    avgProcessingTime: number;
    userSatisfaction: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 1247,
    activeUsers: 892,
    newUsers: 45,
    totalAnalyses: 15678,
    popularTools: [
      { name: 'SWOT Analysis', usage: 2340, growth: 12.5 },
      { name: 'Finance Advisor', usage: 1890, growth: 8.3 },
      { name: 'Diet Planner', usage: 1567, growth: 15.2 },
      { name: 'QR Generator', usage: 1234, growth: 5.7 },
      { name: 'Resume Reviewer', usage: 987, growth: 22.1 }
    ],
    userGrowth: [
      { date: '2024-01', users: 850 },
      { date: '2024-02', users: 920 },
      { date: '2024-03', users: 1050 },
      { date: '2024-04', users: 1180 },
      { date: '2024-05', users: 1247 }
    ],
    toolUsage: [
      { tool: 'SWOT Analysis', usage: 2340, percentage: 25 },
      { tool: 'Finance Advisor', usage: 1890, percentage: 20 },
      { tool: 'Diet Planner', usage: 1567, percentage: 17 },
      { tool: 'QR Generator', usage: 1234, percentage: 13 },
      { tool: 'Resume Reviewer', usage: 987, percentage: 10 },
      { tool: 'Other Tools', usage: 1660, percentage: 15 }
    ],
    topPerformingTools: [
      { name: 'SWOT Analysis', successRate: 98.5, avgProcessingTime: 2.3, userSatisfaction: 4.8 },
      { name: 'QR Generator', successRate: 99.2, avgProcessingTime: 0.8, userSatisfaction: 4.9 },
      { name: 'Finance Advisor', successRate: 97.8, avgProcessingTime: 4.1, userSatisfaction: 4.7 },
      { name: 'Diet Planner', successRate: 96.3, avgProcessingTime: 3.2, userSatisfaction: 4.6 },
      { name: 'Resume Reviewer', successRate: 95.1, avgProcessingTime: 5.8, userSatisfaction: 4.5 }
    ]
  });
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [timeRange]);

  const getGrowthIcon = (growth: number) => {
    return growth > 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="w-6 h-6 text-orange-600" />
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Visualize trends, user growth, and tool performance metrics.
        </p>
      </div>

      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold">{analyticsData.activeUsers.toLocaleString()}</p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Users</p>
                  <p className="text-2xl font-bold">{analyticsData.newUsers}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                  <p className="text-2xl font-bold">{analyticsData.totalAnalyses.toLocaleString()}</p>
                </div>
                <Wrench className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5" />
              Popular Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.popularTools.map((tool, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{tool.name}</p>
                      <p className="text-sm text-gray-600">{tool.usage.toLocaleString()} uses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getGrowthIcon(tool.growth)}
                    <span className={`text-sm font-medium ${getGrowthColor(tool.growth)}`}>
                      {tool.growth > 0 ? '+' : ''}{tool.growth}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tool Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tool Usage Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.toolUsage.map((tool, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{tool.tool}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${tool.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">{tool.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topPerformingTools.map((tool, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{tool.name}</span>
                      <Badge variant="outline">{tool.successRate}%</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>Avg Time: {tool.avgProcessingTime}s</div>
                      <div>Rating: {tool.userSatisfaction}/5</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              User Growth Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {analyticsData.userGrowth.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="bg-blue-500 rounded-t w-full"
                    style={{ 
                      height: `${(data.users / Math.max(...analyticsData.userGrowth.map(d => d.users))) * 200}px` 
                    }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{data.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
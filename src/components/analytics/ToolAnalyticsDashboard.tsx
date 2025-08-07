'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  Clock, 
  Star,
  BarChart3,
  Eye,
  Download,
  Share2,
  Zap
} from 'lucide-react';

interface ToolAnalytics {
  toolSlug: string;
  toolName: string;
  totalUsage: number;
  uniqueUsers: number;
  usageByType: Record<string, number>;
  averageUsagePerUser: number;
  growthRate: number;
  lastUsed: Date;
  popularityRank: number;
}

interface SystemAnalytics {
  totalUsers: number;
  totalUsage: number;
  mostPopularTools: ToolAnalytics[];
  recentActivity: any[];
  usageByCategory: Record<string, number>;
  peakUsageHours: number[];
  averageSessionDuration: number;
}

export default function ToolAnalyticsDashboard() {
  const [toolAnalytics, setToolAnalytics] = useState<ToolAnalytics[]>([]);
  const [systemAnalytics, setSystemAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'users' | 'trends'>('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [toolsResponse, systemResponse] = await Promise.all([
        fetch(`/api/analytics/tools?days=${timeRange}`),
        fetch('/api/analytics/system')
      ]);

      if (toolsResponse.ok) {
        const toolsData = await toolsResponse.json();
        setToolAnalytics(toolsData.data.toolAnalytics || []);
      }

      if (systemResponse.ok) {
        const systemData = await systemResponse.json();
        setSystemAnalytics(systemData.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthIcon = (growthRate: number) => {
    if (growthRate > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (growthRate < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getUsageTypeIcon = (type: string) => {
    switch (type) {
      case 'view': return <Eye className="w-4 h-4" />;
      case 'generate': return <Zap className="w-4 h-4" />;
      case 'download': return <Download className="w-4 h-4" />;
      case 'share': return <Share2 className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Tool Analytics</h2>
          <div className="flex space-x-2">
            {[7, 30, 90].map(days => (
              <Button
                key={days}
                variant={timeRange === days ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(days)}
              >
                {days}d
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tool Analytics</h2>
        <div className="flex space-x-2">
          {[7, 30, 90].map(days => (
            <Button
              key={days}
              variant={timeRange === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(days)}
            >
              {days}d
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'tools', label: 'Tools', icon: Zap },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'trends', label: 'Trends', icon: TrendingUp }
        ].map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeTab === id ? 'default' : 'ghost'}
            onClick={() => setActiveTab(id as any)}
            className="flex items-center space-x-2"
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && systemAnalytics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemAnalytics.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Active users in the last {timeRange} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemAnalytics.totalUsage.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Tool interactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemAnalytics.averageSessionDuration}m</div>
                <p className="text-xs text-muted-foreground">
                  Average session duration
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemAnalytics.peakUsageHours.slice(0, 2).join(', ')}h
                </div>
                <p className="text-xs text-muted-foreground">
                  Most active hours
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Usage by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Usage by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(systemAnalytics.usageByCategory).map(([category, usage]) => (
                  <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{category}</span>
                    <Badge variant="secondary">{usage.toLocaleString()}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tool Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {toolAnalytics.map((tool, index) => (
                  <div key={tool.toolSlug} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">#{tool.popularityRank}</Badge>
                        <span className="font-medium">{tool.toolName}</span>
                      </div>
                      {getGrowthIcon(tool.growthRate)}
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{tool.totalUsage.toLocaleString()}</div>
                        <div className="text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{tool.uniqueUsers.toLocaleString()}</div>
                        <div className="text-muted-foreground">Users</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{tool.growthRate > 0 ? '+' : ''}{tool.growthRate}%</div>
                        <div className="text-muted-foreground">Growth</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              User-specific analytics would be displayed here
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              Trend charts and graphs would be displayed here
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
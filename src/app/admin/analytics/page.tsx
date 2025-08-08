'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Activity,
  Clock,
  Target,
  Zap,
  AlertTriangle
} from 'lucide-react';

interface AnalyticsData {
  users: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userGrowth: Array<{ date: string; count: number }>;
    userActivityByTool: Array<{ toolSlug: string; uniqueUsers: number; totalUsage: number }>;
  };
  usage: {
    totalUsage: number;
    uniqueUsers: number;
    avgUsagePerUser: number;
    toolUsage: Array<{ toolSlug: string; totalUsage: number; uniqueUsers: number; avgDuration: number }>;
  };
  performance: {
    avgResponseTime: number;
    successRate: number;
    errorRate: number;
    uptime: number;
    performanceMetrics: Array<{ toolSlug: string; avgResponseTime: number; successRate: number }>;
  };
}

export default function AdminAnalyticsPage() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'usage' | 'performance'>('users');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchAnalyticsData();
    }
  }, [isAuthenticated, isAdmin, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch all analytics data in parallel without Authorization headers
      const [usersResponse, usageResponse, performanceResponse] = await Promise.all([
        fetch(`/api/admin/analytics/users?range=${timeRange}`),
        fetch(`/api/admin/analytics/usage?range=${timeRange}`),
        fetch(`/api/admin/analytics/performance?range=${timeRange}`)
      ]);

      // Check if any response failed
      if (!usersResponse.ok || !usageResponse.ok || !performanceResponse.ok) {
        console.error('Analytics API error:', {
          users: usersResponse.status,
          usage: usageResponse.status,
          performance: performanceResponse.status
        });
        
        // Set default data structure to prevent map errors
        setAnalyticsData({
          users: {
            totalUsers: 0,
            activeUsers: 0,
            newUsers: 0,
            userGrowth: [],
            userActivityByTool: []
          },
          usage: {
            totalUsage: 0,
            uniqueUsers: 0,
            avgUsagePerUser: 0,
            toolUsage: []
          },
          performance: {
            avgResponseTime: 0,
            successRate: 100,
            errorRate: 0,
            uptime: 99.9,
            performanceMetrics: []
          }
        });
        return;
      }

      const usersData = await usersResponse.json();
      const usageData = await usageResponse.json();
      const performanceData = await performanceResponse.json();

      // Check if the responses have the expected structure
      if (usersData.success && usageData.success && performanceData.success) {
        setAnalyticsData({ 
          users: usersData.data || usersData, 
          usage: usageData.data || usageData, 
          performance: performanceData.data || performanceData 
        });
      } else {
        console.error('Analytics API response structure error:', {
          users: usersData,
          usage: usageData,
          performance: performanceData
        });
        
        // Set default data structure
        setAnalyticsData({
          users: {
            totalUsers: 0,
            activeUsers: 0,
            newUsers: 0,
            userGrowth: [],
            userActivityByTool: []
          },
          usage: {
            totalUsage: 0,
            uniqueUsers: 0,
            avgUsagePerUser: 0,
            toolUsage: []
          },
          performance: {
            avgResponseTime: 0,
            successRate: 100,
            errorRate: 0,
            uptime: 99.9,
            performanceMetrics: []
          }
        });
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Set default data structure to prevent map errors
      setAnalyticsData({
        users: {
          totalUsers: 0,
          activeUsers: 0,
          newUsers: 0,
          userGrowth: [],
          userActivityByTool: []
        },
        usage: {
          totalUsage: 0,
          uniqueUsers: 0,
          avgUsagePerUser: 0,
          toolUsage: []
        },
        performance: {
          avgResponseTime: 0,
          successRate: 100,
          errorRate: 0,
          uptime: 99.9,
          performanceMetrics: []
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Analytics..." />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  // Check if there's any data
  const hasData = analyticsData?.users.totalUsers > 0 || 
                  analyticsData?.usage.totalUsage > 0 || 
                  analyticsData?.performance.performanceMetrics.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor system usage, user activity, and performance metrics
            </p>
          </div>
        </div>

        {/* No Data Message */}
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Analytics Data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Analytics data will appear here once users start using the tools.
          </p>
          <div className="mt-6">
            <Button onClick={fetchAnalyticsData}>
              Refresh Data
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor system usage, user activity, and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            User Analytics
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'usage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Usage Analytics
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'performance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Zap className="w-4 h-4 inline mr-2" />
            Performance
          </button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Loading analytics data..." />
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* User Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsData?.users.totalUsers || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All registered users
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsData?.users.activeUsers || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Users with activity in last 24h
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Users</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsData?.users.newUsers || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      New registrations in {timeRange}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* User Activity by Tool */}
              <Card>
                <CardHeader>
                  <CardTitle>User Activity by Tool</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData?.users?.userActivityByTool?.map((tool) => (
                      <div key={tool.toolSlug} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium capitalize">
                            {tool.toolSlug.replace('-', ' ')}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {tool.uniqueUsers} unique users
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{tool.totalUsage}</p>
                          <p className="text-sm text-gray-500">total uses</p>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        No user activity data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-6">
              {/* Usage Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsData?.usage.totalUsage || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tool usage in {timeRange}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsData?.usage.uniqueUsers || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active users in {timeRange}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Usage/User</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsData?.usage.avgUsagePerUser?.toFixed(1) || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average tool uses per user
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Tool Usage Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Tool Usage Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData?.usage?.toolUsage?.map((tool) => (
                      <div key={tool.toolSlug} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium capitalize">
                            {tool.toolSlug.replace('-', ' ')}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {tool.uniqueUsers} users • {tool.avgDuration?.toFixed(1) || 0}s avg
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{tool.totalUsage}</p>
                          <p className="text-sm text-gray-500">uses</p>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        No tool usage data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Performance Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsData?.performance.avgResponseTime?.toFixed(0) || 0}ms
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average API response time
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {(analyticsData?.performance.successRate * 100)?.toFixed(1) || 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Successful requests
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {(analyticsData?.performance.errorRate * 100)?.toFixed(1) || 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Failed requests
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {analyticsData?.performance.uptime?.toFixed(2) || 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      System availability
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance by Tool */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Tool</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData?.performance?.performanceMetrics?.map((tool) => (
                      <div key={tool.toolSlug} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium capitalize">
                            {tool.toolSlug.replace('-', ' ')}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {tool.avgResponseTime?.toFixed(2) || 0}ms avg response
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{(tool.successRate * 100)?.toFixed(1) || 0}%</p>
                          <p className="text-sm text-gray-500">success rate</p>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        No performance data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
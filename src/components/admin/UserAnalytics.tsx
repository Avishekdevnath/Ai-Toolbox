'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Activity, 
  BarChart3, 
  Download, 
  RefreshCw,
  AlertCircle,
  Check,
  X,
  Loader2,
  Eye,
  UserPlus,
  UserMinus,
  Shield,
  Crown,
  User,
  Calendar,
  Target,
  Zap,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  userGrowth: number;
  activeUserRate: number;
  averageSessionDuration: number;
  topTools: Array<{
    name: string;
    usage: number;
    percentage: number;
  }>;
  userActivity: Array<{
    date: string;
    activeUsers: number;
    newUsers: number;
  }>;
  roleDistribution: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
  userEngagement: {
    high: number;
    medium: number;
    low: number;
  };
}

export default function UserAnalytics() {
  const [stats, setStats] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const fetchUserAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/admin/users/analytics?timeRange=${timeRange}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Failed to load user analytics');
      }
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      setError('Failed to load user analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAnalytics();
  }, [timeRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserAnalytics();
    setRefreshing(false);
    setSuccessMessage('Analytics refreshed successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const exportAnalyticsData = () => {
    if (!stats) return;

    const csvData = [
      ['Metric', 'Value', 'Time Range'],
      ['Total Users', stats.totalUsers.toString(), timeRange],
      ['Active Users', stats.activeUsers.toString(), timeRange],
      ['New Users', stats.newUsers.toString(), timeRange],
      ['Inactive Users', stats.inactiveUsers.toString(), timeRange],
      ['Suspended Users', stats.suspendedUsers.toString(), timeRange],
      ['User Growth (%)', stats.userGrowth.toString(), timeRange],
      ['Active User Rate (%)', stats.activeUserRate.toString(), timeRange],
      ['Average Session Duration (min)', stats.averageSessionDuration.toString(), timeRange],
      [''],
      ['Top Tools Usage'],
      ['Tool Name', 'Usage Count', 'Percentage'],
      ...stats.topTools.map(tool => [
        tool.name,
        tool.usage.toString(),
        `${tool.percentage.toFixed(1)}%`
      ]),
      [''],
      ['Role Distribution'],
      ['Role', 'Count', 'Percentage'],
      ...stats.roleDistribution.map(role => [
        role.role,
        role.count.toString(),
        `${role.percentage.toFixed(1)}%`
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'totalUsers':
        return <Users className="w-5 h-5" />;
      case 'activeUsers':
        return <Activity className="w-5 h-5" />;
      case 'newUsers':
        return <UserPlus className="w-5 h-5" />;
      case 'userGrowth':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super_admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-green-500" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'user':
        return <User className="w-4 h-4 text-gray-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4" />;
    return <Target className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading user analytics...</span>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <AlertCircle className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={fetchUserAnalytics} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            User Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into user behavior and platform usage
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          <Button 
            onClick={exportAnalyticsData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="flex items-center gap-2"
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 bg-green-100 border border-green-300 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-700">{successMessage}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSuccessMessage('')}
            className="text-green-600 hover:text-green-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 border border-red-300 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError('')}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
              onClick={() => setSelectedMetric(selectedMetric === 'totalUsers' ? null : 'totalUsers')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            {selectedMetric === 'totalUsers' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Total registered users on the platform
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedMetric(selectedMetric === 'activeUsers' ? null : 'activeUsers')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{stats.activeUserRate.toFixed(1)}% of total</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
            {selectedMetric === 'activeUsers' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Users active in the last 7 days
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedMetric(selectedMetric === 'newUsers' ? null : 'newUsers')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newUsers.toLocaleString()}</p>
                <div className={`flex items-center gap-1 text-sm ${getGrowthColor(stats.userGrowth)}`}>
                  {getGrowthIcon(stats.userGrowth)}
                  <span>{stats.userGrowth > 0 ? '+' : ''}{stats.userGrowth.toFixed(1)}%</span>
                </div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserPlus className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            {selectedMetric === 'newUsers' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  New registrations in the selected period
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedMetric(selectedMetric === 'sessionDuration' ? null : 'sessionDuration')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Session</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageSessionDuration} min</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            {selectedMetric === 'sessionDuration' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Average session duration per user
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            User Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.userActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.userActivity.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-gray-900">{day.date}</div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">{day.activeUsers} active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600">{day.newUsers} new</span>
                    </div>
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(day.activeUsers / Math.max(...stats.userActivity.map(d => d.activeUsers))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No activity data available for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Role Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.roleDistribution.length > 0 ? (
            <div className="space-y-4">
              {stats.roleDistribution.map((role) => (
                <div key={role.role} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getRoleIcon(role.role)}
                    <div>
                      <p className="font-medium capitalize">{role.role.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500">{role.count} users</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${role.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{role.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No role distribution data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Tools Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Top Tools Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topTools.length > 0 ? (
            <div className="space-y-4">
              {stats.topTools.map((tool, index) => (
                <div key={tool.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{tool.name}</p>
                      <p className="text-sm text-gray-500">{tool.usage} uses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${tool.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{tool.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Zap className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No tool usage data available for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Engagement Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            User Engagement Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-lg font-bold text-green-600">{stats.userEngagement.high}</p>
              <p className="text-sm text-gray-600">High Engagement</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-lg font-bold text-yellow-600">{stats.userEngagement.medium}</p>
              <p className="text-sm text-gray-600">Medium Engagement</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <UserMinus className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-lg font-bold text-red-600">{stats.userEngagement.low}</p>
              <p className="text-sm text-gray-600">Low Engagement</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
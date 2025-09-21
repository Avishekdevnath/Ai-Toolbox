'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  BarChart3, 
  Clock, 
  Star, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  Target,
  Zap,
  Calendar,
  Users,
  Shield
} from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface DashboardOverviewProps {
  userId: string;
}

interface UserStats {
  totalToolsUsed: number;
  totalUrlsShortened: number;
  totalAnalyses: number;
  lastActivityAt?: string;
  toolsUsed: string[];
  loginCount: number;
  sessionCount: number;
  providers: string[];
}

interface RecentActivity {
  id: string;
  action: string;
  tool?: string;
  timestamp: string;
  details?: string;
}

export default function DashboardOverview({ userId }: DashboardOverviewProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = false;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/user/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.data?.userStats);
        setRecentActivity(data.data?.recentActivity || []);
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (err: any) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading dashboard data..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tools Used</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalToolsUsed || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total tools accessed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAnalyses || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total analyses run
            </p>
            <div className="mt-2">
              <Link href="/dashboard/swot-history" className="text-xs text-blue-600 hover:text-blue-800">
                View SWOT History →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sessionCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Login sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.loginCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total logins
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={activity.id || `activity-${index}`} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      {activity.tool && (
                        <p className="text-xs text-gray-500">Tool: {activity.tool}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{activity.timestamp}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <Link href="/tools/swot-analysis">
                <Button variant="outline" className="w-full h-16 flex-col">
                  <BarChart3 className="w-6 h-6 mb-2" />
                  <span>SWOT Analysis</span>
                </Button>
              </Link>
              <Link href="/tools/finance-advisor">
                <Button variant="outline" className="w-full h-16 flex-col">
                  <TrendingUp className="w-6 h-6 mb-2" />
                  <span>Finance Advisor</span>
                </Button>
              </Link>
              <Link href="/tools/diet-planner">
                <Button variant="outline" className="w-full h-16 flex-col">
                  <Target className="w-6 h-6 mb-2" />
                  <span>Diet Planner</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tools Used */}
      {stats?.toolsUsed && stats.toolsUsed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="w-5 h-5 mr-2" />
              Your Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.toolsUsed.map((tool) => (
                <Badge key={tool} variant="secondary">
                  {tool}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Quick Access */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Admin Quick Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/dashboard/admin">
                <Button variant="outline" className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
              <Link href="/dashboard/admin/users">
                <Button variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  User Management
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button variant="outline" className="w-full">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
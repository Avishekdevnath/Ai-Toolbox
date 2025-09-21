'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Calendar,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Activity
} from 'lucide-react';

interface ToolsAnalyticsProps {
  userId: string;
}

interface ToolAnalytics {
  toolName: string;
  usageCount: number;
  lastUsed: string;
  growth: number;
  category: string;
  averageSessionTime: number;
}

export default function ToolsAnalytics({ userId }: ToolsAnalyticsProps) {
  const [data, setData] = useState<ToolAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchToolsAnalytics();
  }, [userId, timeRange]);

  const fetchToolsAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch user's usage list (aggregated client-side for now)
      const res = await fetch('/api/tools/usage/user?limit=200', { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.error || 'Failed to load');

      const items: any[] = payload.data || [];

      // Aggregate by toolName
      const map = new Map<string, { usageCount: number; lastUsed: string; category: string; averageSessionTime: number }>();
      for (const it of items) {
        const key = it.toolName || it.toolSlug;
        const prev = map.get(key) || { usageCount: 0, lastUsed: '', category: it.category || 'General', averageSessionTime: 0 };
        const created = typeof it.createdAt === 'string' ? it.createdAt : new Date(it.createdAt).toISOString();
        prev.usageCount += 1;
        prev.lastUsed = prev.lastUsed && prev.lastUsed > created ? prev.lastUsed : created;
        // averageSessionTime not tracked; leave 0
        map.set(key, prev);
      }

      const aggregated: ToolAnalytics[] = Array.from(map.entries()).map(([toolName, v]) => ({
        toolName,
        usageCount: v.usageCount,
        lastUsed: v.lastUsed?.slice(0, 10) || '',
        growth: 0,
        category: v.category,
        averageSessionTime: Math.round(v.averageSessionTime * 10) / 10,
      }));

      setData(aggregated);
    } catch (err: any) {
      console.error('Tools analytics fetch error:', err);
      setError(err.message || 'Failed to load tools analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchToolsAnalytics} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tools Used</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
            <p className="text-xs text-muted-foreground">
              Different tools accessed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.reduce((sum, tool) => sum + tool.usageCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.length ? Math.round(data.reduce((sum, tool) => sum + tool.averageSessionTime, 0) / data.length * 10) / 10 : 0}m
            </div>
            <p className="text-xs text-muted-foreground">
              Average per tool
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{data.length ? Math.round(data.reduce((sum, tool) => sum + tool.growth, 0) / data.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average growth
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tools Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Tools Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Tool</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Usage</th>
                  <th className="text-left py-3 px-4 font-medium">Growth</th>
                  <th className="text-left py-3 px-4 font-medium">Avg Time</th>
                  <th className="text-left py-3 px-4 font-medium">Last Used</th>
                </tr>
              </thead>
              <tbody>
                {data.map((tool) => (
                  <tr key={tool.toolName} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{tool.toolName}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{tool.category}</Badge>
                    </td>
                    <td className="py-3 px-4">{tool.usageCount}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {tool.growth > 0 ? (
                          <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
                        )}
                        <span className={tool.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                          {tool.growth > 0 ? '+' : ''}{tool.growth}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{tool.averageSessionTime}m</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{tool.lastUsed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Usage by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Usage by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(
                data.reduce((acc, tool) => {
                  acc[tool.category] = (acc[tool.category] || 0) + tool.usageCount;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="font-medium">{category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ 
                          width: `${(count / data.reduce((sum, tool) => sum + tool.usageCount, 0)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Top Performing Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data
                .sort((a, b) => b.usageCount - a.usageCount)
                .slice(0, 5)
                .map((tool, index) => (
                  <div key={tool.toolName} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{tool.toolName}</p>
                      <p className="text-sm text-gray-500">{tool.usageCount} uses</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {tool.growth > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${tool.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tool.growth > 0 ? '+' : ''}{tool.growth}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
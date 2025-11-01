'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Zap, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface PerformanceData {
  summary: {
    totalRequests: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    successRate: number;
    errorRate: number;
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  endpoints: {
    fastest: Array<{
      endpoint: string;
      count: number;
      avgResponseTime: number;
      minResponseTime: number;
      maxResponseTime: number;
      errorRate: number;
      avgQueryCount: number;
    }>;
    slowest: Array<{
      endpoint: string;
      count: number;
      avgResponseTime: number;
      minResponseTime: number;
      maxResponseTime: number;
      errorRate: number;
      avgQueryCount: number;
    }>;
  };
  database: {
    totalQueries: number;
    averageQueriesPerRequest: number;
    slowQueryCount: number;
    queriesByCollection: Record<string, number>;
    queriesByOperation: Record<string, number>;
  };
  rateLimiter: {
    totalBuckets: number;
    totalLogs: number;
    memoryUsage: number;
  };
  recommendations: string[];
  timestamp: string;
}

export default function PerformanceDashboard() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/metrics/performance');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const clearMetrics = async () => {
    try {
      await fetch('/api/metrics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <p className="font-semibold">Error loading metrics</p>
              <p className="text-sm mt-2">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const getScoreColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600 bg-green-50';
    if (value <= thresholds.warning) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time application metrics and monitoring</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium ${
                autoRefresh
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
            </button>
            <button
              onClick={clearMetrics}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
            >
              🗑️ Clear Metrics
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Avg Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getScoreColor(data.summary.averageResponseTime, { good: 20, warning: 100 })}`}>
                {data.summary.averageResponseTime}ms
              </div>
              <p className="text-xs text-gray-500 mt-1">
                P95: {data.summary.p95ResponseTime}ms | P99: {data.summary.p99ResponseTime}ms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Throughput
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {data.summary.requestsPerSecond}/s
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {data.summary.requestsPerMinute}/min | {data.summary.requestsPerHour}/hr
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getScoreColor(100 - data.summary.successRate, { good: 1, warning: 5 })}`}>
                {data.summary.successRate}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {data.summary.totalRequests.toLocaleString()} total requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Database className="w-4 h-4" />
                DB Queries/Req
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getScoreColor(data.database.averageQueriesPerRequest, { good: 3, warning: 5 })}`}>
                {data.database.averageQueriesPerRequest}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {data.database.totalQueries} total queries
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Performance Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      rec.startsWith('✅')
                        ? 'bg-green-50 text-green-800'
                        : 'bg-yellow-50 text-yellow-800'
                    }`}
                  >
                    {rec}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fastest Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              Top 10 Fastest Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Endpoint</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Avg Time</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Min/Max</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Requests</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Queries</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Error %</th>
                  </tr>
                </thead>
                <tbody>
                  {data.endpoints.fastest.map((endpoint, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 text-sm font-mono">{endpoint.endpoint}</td>
                      <td className="py-2 px-3 text-sm text-right">
                        <Badge className="bg-green-100 text-green-800">
                          {endpoint.avgResponseTime}ms
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-sm text-right text-gray-600">
                        {endpoint.minResponseTime}/{endpoint.maxResponseTime}ms
                      </td>
                      <td className="py-2 px-3 text-sm text-right">{endpoint.count}</td>
                      <td className="py-2 px-3 text-sm text-right">{endpoint.avgQueryCount}</td>
                      <td className="py-2 px-3 text-sm text-right">
                        {endpoint.errorRate > 0 ? (
                          <span className="text-red-600">{endpoint.errorRate}%</span>
                        ) : (
                          <span className="text-green-600">0%</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Slowest Endpoints */}
        {data.endpoints.slowest.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Top 10 Slowest Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Endpoint</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Avg Time</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Min/Max</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Requests</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Queries</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">Error %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.endpoints.slowest.map((endpoint, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-sm font-mono">{endpoint.endpoint}</td>
                        <td className="py-2 px-3 text-sm text-right">
                          <Badge className="bg-red-100 text-red-800">
                            {endpoint.avgResponseTime}ms
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-sm text-right text-gray-600">
                          {endpoint.minResponseTime}/{endpoint.maxResponseTime}ms
                        </td>
                        <td className="py-2 px-3 text-sm text-right">{endpoint.count}</td>
                        <td className="py-2 px-3 text-sm text-right">{endpoint.avgQueryCount}</td>
                        <td className="py-2 px-3 text-sm text-right">
                          {endpoint.errorRate > 0 ? (
                            <span className="text-red-600">{endpoint.errorRate}%</span>
                          ) : (
                            <span className="text-green-600">0%</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Database Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Queries by Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.database.queriesByCollection).map(([collection, count]) => (
                  <div key={collection} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-mono text-sm">{collection}</span>
                    <Badge>{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Queries by Operation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.database.queriesByOperation).map(([operation, count]) => (
                  <div key={operation} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-mono text-sm">{operation}</span>
                    <Badge>{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          Last updated: {new Date(data.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}


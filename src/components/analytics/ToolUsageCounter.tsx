'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Activity } from 'lucide-react';

interface ToolUsageCounterProps {
  toolSlug: string;
  toolName: string;
  showDetails?: boolean;
}

interface ToolStats {
  totalUsage: number;
  uniqueUsers: number;
  growthRate: number;
  usageByType: Record<string, number>;
}

export default function ToolUsageCounter({ toolSlug, toolName, showDetails = false }: ToolUsageCounterProps) {
  const [stats, setStats] = useState<ToolStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchToolStats();
  }, [toolSlug]);

  const fetchToolStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/tools?days=30`);
      if (response.ok) {
        const data = await response.json();
        const toolStats = data.data.toolAnalytics?.find(
          (tool: any) => tool.toolSlug === toolSlug
        );
        setStats(toolStats || {
          totalUsage: 0,
          uniqueUsers: 0,
          growthRate: 0,
          usageByType: {}
        });
      }
    } catch (error) {
      console.error('Error fetching tool stats:', error);
      setStats({
        totalUsage: 0,
        uniqueUsers: 0,
        growthRate: 0,
        usageByType: {}
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const getGrowthIcon = (growthRate: number) => {
    if (growthRate > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (growthRate < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Usage Stats</span>
          {getGrowthIcon(stats.growthRate)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Usage</span>
          <span className="font-semibold">{stats.totalUsage.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Unique Users</span>
          <span className="font-semibold">{stats.uniqueUsers.toLocaleString()}</span>
        </div>

        {showDetails && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Growth Rate</span>
              <Badge variant={stats.growthRate > 0 ? 'default' : stats.growthRate < 0 ? 'destructive' : 'secondary'}>
                {stats.growthRate > 0 ? '+' : ''}{stats.growthRate}%
              </Badge>
            </div>

            {Object.keys(stats.usageByType).length > 0 && (
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Usage by Type</span>
                <div className="space-y-1">
                  {Object.entries(stats.usageByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{type}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 
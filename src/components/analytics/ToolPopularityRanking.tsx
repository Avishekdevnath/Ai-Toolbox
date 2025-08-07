'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Trophy, Medal, Award } from 'lucide-react';

interface ToolRanking {
  toolSlug: string;
  toolName: string;
  totalUsage: number;
  uniqueUsers: number;
  growthRate: number;
  rank: number;
  trend: 'up' | 'down' | 'stable';
}

interface ToolPopularityRankingProps {
  limit?: number;
  showHeader?: boolean;
  days?: number;
}

export default function ToolPopularityRanking({ 
  limit = 10, 
  showHeader = true,
  days = 7 
}: ToolPopularityRankingProps) {
  const [rankings, setRankings] = useState<ToolRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularityRanking();
  }, [days, limit]);

  const fetchPopularityRanking = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/tools?days=${days}`);
      if (response.ok) {
        const data = await response.json();
        setRankings(data.data.popularityRanking?.slice(0, limit) || []);
      }
    } catch (error) {
      console.error('Error fetching popularity ranking:', error);
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 text-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>Popular Tools</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rankings.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>Popular Tools</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center text-muted-foreground py-6">
            <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No usage data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle>Popular Tools</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3">
          {rankings.map((tool) => (
            <Link
              key={tool.toolSlug}
              href={`/tools/${tool.toolSlug}`}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8">
                {getRankIcon(tool.rank)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm truncate">{tool.toolName}</p>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(tool.trend)}
                    <Badge variant="outline" className="text-xs">
                      {tool.totalUsage.toLocaleString()}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{tool.uniqueUsers.toLocaleString()} users</span>
                  <span className={tool.growthRate > 0 ? 'text-green-600' : tool.growthRate < 0 ? 'text-red-600' : 'text-gray-500'}>
                    {tool.growthRate > 0 ? '+' : ''}{tool.growthRate}%
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 
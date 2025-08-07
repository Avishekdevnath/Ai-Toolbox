'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp } from 'lucide-react';

interface RecentlyUsedTool {
  toolSlug: string;
  toolName: string;
  usageType: string;
  createdAt: string;
  icon?: string;
}

interface RecentlyUsedToolsProps {
  userId?: string;
  limit?: number;
  showHeader?: boolean;
}

export default function RecentlyUsedTools({ 
  userId, 
  limit = 5, 
  showHeader = true 
}: RecentlyUsedToolsProps) {
  const [recentTools, setRecentTools] = useState<RecentlyUsedTool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchRecentlyUsedTools();
    }
  }, [userId, limit]);

  const fetchRecentlyUsedTools = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/tools?userId=${userId}&days=30`);
      if (response.ok) {
        const data = await response.json();
        setRecentTools(data.data.recentlyUsed?.slice(0, limit) || []);
      }
    } catch (error) {
      console.error('Error fetching recently used tools:', error);
      setRecentTools([]);
    } finally {
      setLoading(false);
    }
  };

  const getUsageTypeIcon = (type: string) => {
    switch (type) {
      case 'view': return '👁️';
      case 'generate': return '⚡';
      case 'download': return '⬇️';
      case 'share': return '📤';
      default: return '📊';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  if (loading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Recently Used</span>
            </CardTitle>
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

  if (recentTools.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Recently Used</span>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center text-muted-foreground py-6">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent tool usage</p>
            <p className="text-sm">Start using tools to see them here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Recently Used</span>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3">
          {recentTools.map((tool, index) => (
            <Link
              key={`${tool.toolSlug}-${index}`}
              href={`/tools/${tool.toolSlug}`}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-sm font-bold">
                {tool.icon || tool.toolName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm truncate">{tool.toolName}</p>
                  <Badge variant="outline" className="text-xs">
                    {getUsageTypeIcon(tool.usageType)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatTimeAgo(tool.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 
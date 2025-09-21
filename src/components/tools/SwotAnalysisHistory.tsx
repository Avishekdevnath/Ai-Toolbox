'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  History, 
  Trash2, 
  Eye, 
  Calendar, 
  TrendingUp,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface SwotHistoryItem {
  id: string;
  analysisType: string;
  swotType: string;
  name: string;
  createdAt: string;
  lastAccessed: string;
  accessCount: number;
  isDuplicate: boolean;
  result: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

interface SwotAnalysisHistoryProps {
  onLoadAnalysis: (analysis: any) => void;
  onClose: () => void;
}

export default function SwotAnalysisHistory({ onLoadAnalysis, onClose }: SwotAnalysisHistoryProps) {
  const [history, setHistory] = useState<SwotHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/history/swot?limit=20');
      const data = await response.json();
      
      if (data.success) {
        setHistory(data.history);
      } else {
        setError('Failed to load analysis history');
      }
    } catch (err) {
      setError('Failed to load analysis history');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadAnalysis = (item: SwotHistoryItem) => {
    onLoadAnalysis(item.result);
    onClose();
  };

  const handleDeleteAnalysis = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;
    
    try {
      setDeletingId(id);
      const response = await fetch('/api/user/history/swot', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: id })
      });
      
      if (response.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
      } else {
        setError('Failed to delete analysis');
      }
    } catch (err) {
      setError('Failed to delete analysis');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSwotTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      personal: '👤',
      business: '🏢',
      project: '📋',
      career: '💼',
      investment: '💰',
      emotional: '❤️'
    };
    return icons[type] || '📊';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading analysis history...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <History className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your SWOT Analysis History
          </h2>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {history.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Analysis History
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              You haven't created any SWOT analyses yet. Start by creating your first analysis!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {history.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getSwotTypeIcon(item.swotType)}</span>
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-1">
                        <span className="capitalize">{item.swotType} Analysis</span>
                        {item.isDuplicate && (
                          <Badge variant="secondary" className="text-xs">
                            Cached
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadAnalysis(item)}
                      className="flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAnalysis(item.id)}
                      disabled={deletingId === item.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {item.result.strengths.length}
                    </div>
                    <div className="text-sm text-gray-500">Strengths</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {item.result.weaknesses.length}
                    </div>
                    <div className="text-sm text-gray-500">Weaknesses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {item.result.opportunities.length}
                    </div>
                    <div className="text-sm text-gray-500">Opportunities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {item.result.threats.length}
                    </div>
                    <div className="text-sm text-gray-500">Threats</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{item.accessCount} views</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

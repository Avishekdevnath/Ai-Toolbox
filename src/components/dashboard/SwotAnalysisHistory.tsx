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
  AlertCircle,
  BarChart3,
  Target,
  Zap,
  Shield
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
  userId: string;
}

export default function SwotAnalysisHistory({ userId }: SwotAnalysisHistoryProps) {
  const [history, setHistory] = useState<SwotHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/history/swot?limit=50');
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

  const getSwotTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      personal: 'bg-blue-100 text-blue-800',
      business: 'bg-green-100 text-green-800',
      project: 'bg-purple-100 text-purple-800',
      career: 'bg-orange-100 text-orange-800',
      investment: 'bg-yellow-100 text-yellow-800',
      emotional: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading analysis history...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            SWOT Analysis History
          </h2>
        </div>
        <Badge variant="outline" className="text-sm">
          {history.length} analyses
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {history.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Analysis History
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You haven't created any SWOT analyses yet. Start by creating your first analysis!
            </p>
            <Button asChild>
              <a href="/tools/swot-analysis">Create SWOT Analysis</a>
            </Button>
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
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getSwotTypeColor(item.swotType)}>
                          {item.swotType.charAt(0).toUpperCase() + item.swotType.slice(1)} Analysis
                        </Badge>
                        {item.isDuplicate && (
                          <Badge variant="secondary" className="text-xs">
                            Cached
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingId(viewingId === item.id ? null : item.id)}
                      className="flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{viewingId === item.id ? 'Hide' : 'View'}</span>
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

                {/* Detailed View */}
                {viewingId === item.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Strengths */}
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Strengths
                        </h4>
                        <ul className="space-y-2">
                          {item.result.strengths.map((strength, index) => (
                            <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-start">
                              <span className="mr-2 text-green-500 mt-1">•</span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          Weaknesses
                        </h4>
                        <ul className="space-y-2">
                          {item.result.weaknesses.map((weakness, index) => (
                            <li key={index} className="text-sm text-red-700 dark:text-red-300 flex items-start">
                              <span className="mr-2 text-red-500 mt-1">•</span>
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Opportunities */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                          <Zap className="w-4 h-4 mr-2" />
                          Opportunities
                        </h4>
                        <ul className="space-y-2">
                          {item.result.opportunities.map((opportunity, index) => (
                            <li key={index} className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                              <span className="mr-2 text-blue-500 mt-1">•</span>
                              {opportunity}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Threats */}
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-3 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Threats
                        </h4>
                        <ul className="space-y-2">
                          {item.result.threats.map((threat, index) => (
                            <li key={index} className="text-sm text-orange-700 dark:text-orange-300 flex items-start">
                              <span className="mr-2 text-orange-500 mt-1">•</span>
                              {threat}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

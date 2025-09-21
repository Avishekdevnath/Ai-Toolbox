'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  RefreshCw,
  History
} from 'lucide-react';
import Modal from '@/components/ui/modal';

interface AnalysisHistoryItem {
  _id: string;
  analysisType: string;
  toolSlug: string;
  toolName: string;
  inputData: Record<string, any>;
  result: Record<string, any>;
  metadata: {
    processingTime: number;
    tokensUsed?: number;
    model?: string;
    cost?: number;
  };
  status: 'completed' | 'failed' | 'processing';
  createdAt: string;
}

interface UserAnalysisHistoryProps {
  userId: string;
}

export default function UserAnalysisHistory({ userId }: UserAnalysisHistoryProps) {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistoryItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    hasMore: true
  });

  const analysisTypes = [
    'all', 'swot', 'diet', 'finance', 'investment', 'retirement', 'debt',
    'resume', 'quote', 'age', 'qr', 'url-shortener', 'unit-converter',
    'password-generator', 'price-tracker', 'tip-calculator', 'word-counter'
  ];

  const statuses = ['all', 'completed', 'failed', 'processing'];

  // Copy error details function
  const copyErrorDetails = () => {
    const errorDetails = {
      timestamp: new Date().toISOString(),
      error: error,
      searchTerm,
      selectedType,
      selectedStatus,
      pagination,
      userId
    };
    
    const errorText = JSON.stringify(errorDetails, null, 2);
    navigator.clipboard.writeText(errorText).then(() => {
      alert('Error details copied to clipboard!');
    });
  };

  useEffect(() => {
    fetchHistory();
  }, [userId, pagination.offset, selectedType, selectedStatus]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString()
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedType) params.append('analysisType', selectedType);
      if (selectedStatus) params.append('status', selectedStatus);

      const response = await fetch(`/api/user/history?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setHistory(data.data.history || []);
        setPagination(prev => ({
          ...prev,
          hasMore: data.data.history.length === pagination.limit
        }));
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError(err.message || 'Failed to load history');
      
      // Don't use mock data - show empty state instead
      setHistory([]);
      setPagination(prev => ({
        ...prev,
        hasMore: false
      }));
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (analysisId: string) => {
    if (!confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/history?id=${analysisId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setHistory(prev => prev.filter(item => item._id !== analysisId));
      } else {
        throw new Error('Failed to delete analysis');
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Failed to delete analysis: ' + err.message);
    }
  };

  const exportHistory = async () => {
    try {
      const response = await fetch('/api/user/history/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analysis-history-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export history');
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = 
      item.toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.analysisType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const formatDuration = (ms: number) => {
    if (ms < 1000) {
      // For milliseconds, show only 1 decimal place
      return `${ms.toFixed(1)}ms`;
    }
    // For seconds, show only 1 decimal place
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (loading && history.length === 0) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg md:text-xl font-semibold">Analysis History</h2>
          <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
            <History className="w-4 h-4 md:w-5 md:h-5" />
            Analysis History
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            View and manage your AI analysis results
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={exportHistory} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={fetchHistory} className="w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm md:text-base">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search analyses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                {analysisTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedStatus('all');
                }}
                className="w-full text-sm"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
              <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading History</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={copyErrorDetails} variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Copy Error Details
              </Button>
              <Button onClick={fetchHistory} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Grid */}
      {!error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredHistory.map((item) => (
            <Card key={item._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <CardTitle className="text-base md:text-lg truncate">{item.toolName}</CardTitle>
                  </div>
                  <Badge className={`${getStatusColor(item.status)} text-xs`}>
                    {item.status}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm text-gray-500 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(item.metadata.processingTime)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 md:space-y-3">
                  <div>
                    <span className="text-xs md:text-sm font-medium text-gray-700">Type:</span>
                    <span className="text-xs md:text-sm text-gray-600 ml-2 capitalize">{item.analysisType}</span>
                  </div>
                  
                  {item.metadata.tokensUsed && (
                    <div>
                      <span className="text-xs md:text-sm font-medium text-gray-700">Tokens:</span>
                      <span className="text-xs md:text-sm text-gray-600 ml-2">{item.metadata.tokensUsed.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {item.metadata.model && (
                    <div>
                      <span className="text-xs md:text-sm font-medium text-gray-700">Model:</span>
                      <span className="text-xs md:text-sm text-gray-600 ml-2 truncate">{item.metadata.model}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedAnalysis(item);
                        setShowDetailsModal(true);
                      }}
                      className="flex-1 text-xs md:text-sm"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteAnalysis(item._id)}
                      className="text-red-600 hover:text-red-700 text-xs md:text-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredHistory.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <History className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No Analysis History</h3>
              <p className="text-sm md:text-base text-gray-500 mb-4 px-4">
                {history.length === 0 
                  ? "You haven't generated any analyses yet. Start using our AI tools to see your history here."
                  : "No analyses match your current filters. Try adjusting your search criteria."
                }
              </p>
              {history.length === 0 && (
                <Link href="/tools">
                  <Button className="w-full sm:w-auto">Explore Tools</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Load More */}
      {pagination.hasMore && filteredHistory.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Analysis Details"
        size="xl"
      >
        {selectedAnalysis && (
          <div className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Tool</h4>
                <p className="text-gray-600">{selectedAnalysis.toolName}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Type</h4>
                <p className="text-gray-600 capitalize">{selectedAnalysis.analysisType}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Status</h4>
                <Badge className={getStatusColor(selectedAnalysis.status)}>
                  {selectedAnalysis.status}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Processing Time</h4>
                <p className="text-gray-600">{formatDuration(selectedAnalysis.metadata.processingTime)}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Created</h4>
                <p className="text-gray-600">{formatDate(selectedAnalysis.createdAt)}</p>
              </div>
              {selectedAnalysis.metadata.tokensUsed && (
                <div>
                  <h4 className="font-medium text-gray-900">Tokens Used</h4>
                  <p className="text-gray-600">{selectedAnalysis.metadata.tokensUsed.toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Input Data Section */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Input Data</h4>
              <div className="bg-gray-50 p-4 rounded-lg border">
                {selectedAnalysis.analysisType === 'swot' ? (
                  <div className="space-y-3">
                    {selectedAnalysis.inputData.companyName && (
                      <div>
                        <span className="font-medium text-gray-700">Company:</span>
                        <span className="ml-2 text-gray-600">{selectedAnalysis.inputData.companyName}</span>
                      </div>
                    )}
                    {selectedAnalysis.inputData.industry && (
                      <div>
                        <span className="font-medium text-gray-700">Industry:</span>
                        <span className="ml-2 text-gray-600">{selectedAnalysis.inputData.industry}</span>
                      </div>
                    )}
                    {selectedAnalysis.inputData.description && (
                      <div>
                        <span className="font-medium text-gray-700">Description:</span>
                        <p className="mt-1 text-gray-600 text-sm">{selectedAnalysis.inputData.description}</p>
                      </div>
                    )}
                    {selectedAnalysis.inputData.businessType && (
                      <div>
                        <span className="font-medium text-gray-700">Business Type:</span>
                        <span className="ml-2 text-gray-600">{selectedAnalysis.inputData.businessType}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="max-h-40 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(selectedAnalysis.inputData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Results Section */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Analysis Results</h4>
              {selectedAnalysis.analysisType === 'swot' ? (
                <div className="space-y-4">
                  {/* Strengths */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      Strengths
                    </h5>
                    <ul className="space-y-1">
                      {selectedAnalysis.result.strengths?.map((strength: string, index: number) => (
                        <li key={index} className="text-green-700 text-sm flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h5 className="font-semibold text-red-800 mb-2 flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      Weaknesses
                    </h5>
                    <ul className="space-y-1">
                      {selectedAnalysis.result.weaknesses?.map((weakness: string, index: number) => (
                        <li key={index} className="text-red-700 text-sm flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      Opportunities
                    </h5>
                    <ul className="space-y-1">
                      {selectedAnalysis.result.opportunities?.map((opportunity: string, index: number) => (
                        <li key={index} className="text-blue-700 text-sm flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Threats */}
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h5 className="font-semibold text-orange-800 mb-2 flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                      Threats
                    </h5>
                    <ul className="space-y-1">
                      {selectedAnalysis.result.threats?.map((threat: string, index: number) => (
                        <li key={index} className="text-orange-700 text-sm flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          {threat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : selectedAnalysis.analysisType === 'quote' ? (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="text-center">
                    <blockquote className="text-lg italic text-gray-700 mb-3">
                      "{selectedAnalysis.result.quote}"
                    </blockquote>
                    {selectedAnalysis.result.author && (
                      <p className="text-sm text-gray-600">— {selectedAnalysis.result.author}</p>
                    )}
                  </div>
                </div>
              ) : selectedAnalysis.analysisType === 'resume' ? (
                <div className="bg-gray-50 p-4 rounded-lg border max-h-60 overflow-y-auto">
                  <div className="space-y-3">
                    {selectedAnalysis.result.feedback && (
                      <div>
                        <h6 className="font-medium text-gray-700 mb-1">Feedback</h6>
                        <p className="text-sm text-gray-600">{selectedAnalysis.result.feedback}</p>
                      </div>
                    )}
                    {selectedAnalysis.result.suggestions && (
                      <div>
                        <h6 className="font-medium text-gray-700 mb-1">Suggestions</h6>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {selectedAnalysis.result.suggestions.map((suggestion: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border max-h-60 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedAnalysis.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => deleteAnalysis(selectedAnalysis._id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
} 
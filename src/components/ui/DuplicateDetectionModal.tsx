'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Eye, 
  Copy,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import Modal from './modal';

interface DuplicateAnalysis {
  _id: string;
  toolName: string;
  createdAt: string;
  result: any;
  metadata: {
    processingTime: number;
    tokensUsed?: number;
    cost?: number;
  };
  parameterHash: string;
  isDuplicate: boolean;
}

interface DuplicateDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseCached: () => void;
  onRegenerate: () => void;
  onModifyParameters: () => void;
  duplicateAnalysis: DuplicateAnalysis;
  similarity: number;
  differences: string[];
  newParameters: Record<string, any>;
  toolName: string;
}

export default function DuplicateDetectionModal({
  isOpen,
  onClose,
  onUseCached,
  onRegenerate,
  onModifyParameters,
  duplicateAnalysis,
  similarity,
  differences,
  newParameters,
  toolName
}: DuplicateDetectionModalProps) {
  const [selectedOption, setSelectedOption] = useState<'cached' | 'regenerate' | 'modify' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOptionSelect = async (option: 'cached' | 'regenerate' | 'modify') => {
    setIsLoading(true);
    setSelectedOption(option);

    try {
      switch (option) {
        case 'cached':
          await onUseCached();
          break;
        case 'regenerate':
          await onRegenerate();
          break;
        case 'modify':
          onModifyParameters();
          break;
      }
    } catch (error) {
      console.error('Error handling option selection:', error);
    } finally {
      setIsLoading(false);
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
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.95) return 'bg-red-100 text-red-800';
    if (similarity >= 0.9) return 'bg-orange-100 text-orange-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getSimilarityText = (similarity: number) => {
    if (similarity >= 0.95) return 'Exact Match';
    if (similarity >= 0.9) return 'Very Similar';
    return 'Similar';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Duplicate Analysis Detected"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800">
                Similar analysis found
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                We found a {getSimilarityText(similarity).toLowerCase()} analysis from{' '}
                {formatDate(duplicateAnalysis.createdAt)}. You can use the cached result or generate a new one.
              </p>
            </div>
          </div>
        </div>

        {/* Similarity Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5" />
              Analysis Similarity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Similarity Score:</span>
              <Badge className={getSimilarityColor(similarity)}>
                {(similarity * 100).toFixed(1)}% {getSimilarityText(similarity)}
              </Badge>
            </div>
            
            {differences.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">
                  Key Differences:
                </span>
                <ul className="text-sm text-gray-600 space-y-1">
                  {differences.slice(0, 3).map((diff, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <XCircle className="w-3 h-3 text-red-500" />
                      {diff}
                    </li>
                  ))}
                  {differences.length > 3 && (
                    <li className="text-xs text-gray-500">
                      +{differences.length - 3} more differences
                    </li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cached Result Preview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Cached Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Tool:</span>
                <p className="font-medium">{duplicateAnalysis.toolName}</p>
              </div>
              <div>
                <span className="text-gray-500">Created:</span>
                <p className="font-medium">{formatDate(duplicateAnalysis.createdAt)}</p>
              </div>
              <div>
                <span className="text-gray-500">Processing Time:</span>
                <p className="font-medium">{formatDuration(duplicateAnalysis.metadata.processingTime)}</p>
              </div>
              {duplicateAnalysis.metadata.tokensUsed && (
                <div>
                  <span className="text-gray-500">Tokens Used:</span>
                  <p className="font-medium">{duplicateAnalysis.metadata.tokensUsed.toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Result Preview */}
            <div>
              <span className="text-sm font-medium text-gray-700 block mb-2">
                Result Preview:
              </span>
              <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(duplicateAnalysis.result, null, 2).substring(0, 300)}
                  {JSON.stringify(duplicateAnalysis.result, null, 2).length > 300 ? '...' : ''}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">
            Choose an option:
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => handleOptionSelect('cached')}
              disabled={isLoading}
              className="justify-start h-auto p-4"
              variant="outline"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Use Cached Result</div>
                  <div className="text-sm text-gray-500">
                    Use the existing analysis (instant, no cost)
                  </div>
                </div>
              </div>
            </Button>

            <Button
              onClick={() => handleOptionSelect('regenerate')}
              disabled={isLoading}
              className="justify-start h-auto p-4"
              variant="outline"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Generate New Analysis</div>
                  <div className="text-sm text-gray-500">
                    Create a fresh analysis (may take time, uses tokens)
                  </div>
                </div>
              </div>
            </Button>

            <Button
              onClick={() => handleOptionSelect('modify')}
              disabled={isLoading}
              className="justify-start h-auto p-4"
              variant="outline"
            >
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium">Modify Parameters</div>
                  <div className="text-sm text-gray-500">
                    Go back and change your input parameters
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-4">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-600">
              {selectedOption === 'cached' && 'Loading cached result...'}
              {selectedOption === 'regenerate' && 'Generating new analysis...'}
              {selectedOption === 'modify' && 'Preparing parameter form...'}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-xs text-gray-500">
            This helps save API costs and processing time
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
} 
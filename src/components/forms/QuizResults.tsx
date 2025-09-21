'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Clock, 
  User, 
  Mail, 
  IdCard, 
  Share2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  Copy,
  Download,
  Twitter,
  Facebook,
  Linkedin
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { getQuizThemeClasses } from '@/lib/themeUtils';

interface QuizResultsProps {
  score: number;
  maxScore: number;
  responder: {
    name?: string;
    email?: string;
    studentId?: string;
  };
  durationMs: number;
  startTime?: string;
  endTime?: string;
  answers: Array<{
    fieldId: string;
    questionCode?: string;
    value: any;
  }>;
  formData: {
    title: string;
    description?: string;
    fields: Array<{
      id: string;
      label: string;
      type: string;
      options?: string[];
      quiz?: {
        points?: number;
        correctOptions?: number[];
        explanation?: string;
      };
    }>;
  };
  onViewAnswers: () => void;
  onClose: () => void;
}

export default function QuizResults({
  score,
  maxScore,
  responder,
  durationMs,
  startTime,
  endTime,
  answers,
  formData,
  onViewAnswers,
  onClose
}: QuizResultsProps) {
  const { resolvedTheme } = useTheme();
  const themeClasses = getQuizThemeClasses(resolvedTheme);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [copied, setCopied] = useState(false);

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  
  // Format duration properly - handle minutes and seconds
  const formatDuration = (ms: number) => {
    if (ms <= 0) return '0s';
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };
  
  const durationFormatted = formatDuration(durationMs);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 90) return { text: 'Excellent!', color: 'bg-green-100 text-green-800' };
    if (percentage >= 80) return { text: 'Great!', color: 'bg-green-100 text-green-800' };
    if (percentage >= 70) return { text: 'Good!', color: 'bg-yellow-100 text-yellow-800' };
    if (percentage >= 60) return { text: 'Pass', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  const shareText = `I just completed "${formData.title}" and scored ${score}/${maxScore} (${percentage}%)! 🎯`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareOnSocial = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const downloadResults = () => {
    // Create ultra-high resolution canvas for modern quality
    const scale = 3; // Ultra-crisp rendering
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with ultra-high DPI
    const width = 800 * scale;
    const height = 1200 * scale;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = '800px';
    canvas.style.height = '1200px';

    // Scale context for ultra-high DPI
    ctx.scale(scale, scale);

    // Enable premium text rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Modern gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, 1200);
    bgGradient.addColorStop(0, '#f8fafc');
    bgGradient.addColorStop(0.3, '#ffffff');
    bgGradient.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 800, 1200);

    // Modern card with premium shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 15;

    // Main card background with subtle border radius effect
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(50, 50, 700, 1100);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Modern card border with enhanced styling
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, 700, 1100);
    
    // Inner border for depth
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    ctx.strokeRect(52, 52, 696, 1096);

    let currentY = 80;

    // Modern decorative header
    const headerHeight = 120;
    const headerGradient = ctx.createLinearGradient(50, currentY, 50, currentY + headerHeight);
    headerGradient.addColorStop(0, '#f8fafc');
    headerGradient.addColorStop(1, '#ffffff');
    ctx.fillStyle = headerGradient;
    ctx.fillRect(50, currentY, 700, headerHeight);

    // Decorative border at top
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(50, currentY, 700, 4);

    currentY += 30;

    // Modern trophy icon with glassmorphism effect
    const trophyY = currentY + 20;
    const trophyRadius = 35;
    
    // Trophy glow effect
    ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Trophy gradient background
    const trophyGradient = ctx.createRadialGradient(400, trophyY, 0, 400, trophyY, trophyRadius);
    trophyGradient.addColorStop(0, '#60a5fa');
    trophyGradient.addColorStop(0.5, '#3b82f6');
    trophyGradient.addColorStop(1, '#1d4ed8');
    
    ctx.fillStyle = trophyGradient;
    ctx.beginPath();
    ctx.arc(400, trophyY, trophyRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Trophy icon with modern styling
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆', 400, trophyY + 10);

    currentY += 100;

    // Modern quiz title with better typography
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(formData.title, 400, currentY);
    currentY += 50;

    // Modern student info card
    const studentCardY = currentY;
    const studentCardHeight = 90;
    
    // Student card background with modern styling
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(80, studentCardY, 640, studentCardHeight);
    
    // Student card border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(80, studentCardY, 640, studentCardHeight);
    
    // Student card inner highlight
    ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
    ctx.fillRect(80, studentCardY, 640, 2);

    // Student name with modern typography
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(responder.name || 'Student', 400, studentCardY + 35);

    // Student ID with modern styling
    if (responder.studentId) {
      ctx.fillStyle = '#64748b';
      ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`ID: ${responder.studentId}`, 400, studentCardY + 60);
    }

    currentY += studentCardHeight + 40;

    // Modern score grid with glassmorphism
    const scoreGridY = currentY;
    const scoreGridHeight = 80;
    const colWidth = 180;
    const colSpacing = 20;

    // Score column with modern design
    const scoreColX = 100;
    ctx.fillStyle = 'rgba(248, 250, 252, 0.8)';
    ctx.fillRect(scoreColX, scoreGridY, colWidth, scoreGridHeight);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(scoreColX, scoreGridY, colWidth, scoreGridHeight);

    // Score percentage with modern color
    const scoreColor = percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444';
    ctx.fillStyle = scoreColor;
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`${percentage}%`, scoreColX + colWidth / 2, scoreGridY + 45);
    ctx.fillStyle = '#64748b';
    ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Score', scoreColX + colWidth / 2, scoreGridY + 70);

    // Points column
    const pointsColX = scoreColX + colWidth + colSpacing;
    ctx.fillStyle = 'rgba(248, 250, 252, 0.8)';
    ctx.fillRect(pointsColX, scoreGridY, colWidth, scoreGridHeight);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(pointsColX, scoreGridY, colWidth, scoreGridHeight);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`${score}/${maxScore}`, pointsColX + colWidth / 2, scoreGridY + 45);
    ctx.fillStyle = '#64748b';
    ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Points', pointsColX + colWidth / 2, scoreGridY + 70);

    // Time column
    const timeColX = pointsColX + colWidth + colSpacing;
    ctx.fillStyle = 'rgba(248, 250, 252, 0.8)';
    ctx.fillRect(timeColX, scoreGridY, colWidth, scoreGridHeight);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(timeColX, scoreGridY, colWidth, scoreGridHeight);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(durationFormatted, timeColX + colWidth / 2, scoreGridY + 45);
    ctx.fillStyle = '#64748b';
    ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Time', timeColX + colWidth / 2, scoreGridY + 70);

    currentY += scoreGridHeight + 40;

    // Modern grade badge with premium design
    const gradeText = getScoreBadge(percentage).text;
    const badgeWidth = 160;
    const badgeHeight = 40;
    const badgeX = 400 - badgeWidth / 2;
    const badgeY = currentY;

    // Badge shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    // Badge background with modern gradient
    const badgeColor = getScoreBadge(percentage).color.includes('green') ? '#10b981' : 
                      getScoreBadge(percentage).color.includes('yellow') ? '#f59e0b' : '#ef4444';
    
    const badgeGradient = ctx.createLinearGradient(badgeX, badgeY, badgeX, badgeY + badgeHeight);
    badgeGradient.addColorStop(0, badgeColor);
    badgeGradient.addColorStop(0.5, badgeColor + 'ee');
    badgeGradient.addColorStop(1, badgeColor + 'cc');
    
    ctx.fillStyle = badgeGradient;
    ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Badge text with modern typography
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(gradeText, 400, badgeY + 25);

    currentY += 60;

    // Modern separator line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, currentY);
    ctx.lineTo(720, currentY);
    ctx.stroke();

    currentY += 30;

    // Email in modern footer
    if (responder.email) {
      ctx.fillStyle = '#64748b';
      ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`Email: ${responder.email}`, 400, currentY);
      currentY += 40;
    }

    // Modern time information card
    if (startTime || endTime) {
      const timeCardY = currentY;
      const timeCardHeight = 80;
      
      // Time card background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(80, timeCardY, 640, timeCardHeight);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(80, timeCardY, 640, timeCardHeight);

      const timeColWidth = 250;
      const timeColSpacing = 60;

      // Started time with modern styling
      if (startTime) {
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Started:', 100, timeCardY + 30);
        ctx.fillStyle = '#0f172a';
        ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(startTime, 100, timeCardY + 55);
      }

      // Completed time with modern styling
      if (endTime) {
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('Completed:', 100 + timeColWidth + timeColSpacing, timeCardY + 30);
        ctx.fillStyle = '#0f172a';
        ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(endTime, 100 + timeColWidth + timeColSpacing, timeCardY + 55);
      }

      ctx.textAlign = 'center'; // Reset text alignment
    }

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quiz-results-${formData.title.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, 'image/png', 0.98);
  };

  const scoreBadge = getScoreBadge(percentage);

  return (
    <div className={`h-screen ${themeClasses.container} flex items-center justify-center p-2`}>
      <div className="w-full max-w-xl">
        {/* Compact Results Design */}
        <div id="quiz-result-card" className="relative bg-white rounded-lg shadow-2xl border-2 border-gray-300 overflow-hidden">
          
          {/* Header */}
          <div className="text-center py-4 px-4">
            {/* Trophy Icon */}
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-3">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            
            {/* Quiz Title */}
            <h1 className="text-xl font-bold text-gray-800 mb-2">{formData.title}</h1>
            
            {/* Student Name */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {responder.name || 'Student'}
              </h2>
              {responder.studentId && (
                <p className="text-xs text-gray-600 mt-1">ID: {responder.studentId}</p>
              )}
            </div>
            
            {/* Score Display */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(percentage)}`}>
                  {percentage}%
                </div>
                <div className="text-xs text-gray-600">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {score}/{maxScore}
                </div>
                <div className="text-xs text-gray-600">Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {durationFormatted}
                </div>
                <div className="text-xs text-gray-600">Time</div>
              </div>
            </div>
            
            {/* Grade Badge */}
            <div className="mb-4">
              <Badge className={`text-sm px-4 py-1 ${scoreBadge.color}`}>
                {scoreBadge.text}
              </Badge>
            </div>
            
            {/* Footer */}
            <div className="text-xs text-gray-500 border-t pt-2">
              {responder.email && (
                <p>Email: {responder.email}</p>
              )}
            </div>

            {/* Time Information */}
            {(startTime || endTime) && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {startTime && (
                    <div>
                      <span className="text-gray-600 font-medium">Started:</span>
                      <p className="text-gray-800 mt-1">{startTime}</p>
                    </div>
                  )}
                  {endTime && (
                    <div>
                      <span className="text-gray-600 font-medium">Completed:</span>
                      <p className="text-gray-800 mt-1">{endTime}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* All Action Buttons */}
            <div className="flex flex-wrap justify-center gap-1 mt-4">
              <div className="relative group">
                <Button
                  onClick={() => setShowCorrectAnswers(!showCorrectAnswers)}
                  variant="outline"
                  size="sm"
                  className="p-2"
                >
                  {showCorrectAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {showCorrectAnswers ? 'Hide Correct Answers' : 'View Correct Answers'}
                </div>
              </div>
              
              <div className="relative group">
                <Button
                  onClick={onViewAnswers}
                  size="sm"
                  className="p-2"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Review All Questions
                </div>
              </div>
              
              <div className="relative group">
                <Button
                  onClick={downloadResults}
                  variant="outline"
                  size="sm"
                  className="p-2"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Download Results
                </div>
              </div>
              
              <div className="relative group">
                <Button
                  onClick={() => shareOnSocial('twitter')}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2"
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Share on Twitter
                </div>
              </div>
              
              <div className="relative group">
                <Button
                  onClick={() => shareOnSocial('facebook')}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2"
                >
                  <Facebook className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Share on Facebook
                </div>
              </div>
              
              <div className="relative group">
                <Button
                  onClick={() => shareOnSocial('linkedin')}
                  size="sm"
                  className="bg-blue-700 hover:bg-blue-800 text-white p-2"
                >
                  <Linkedin className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Share on LinkedIn
                </div>
              </div>
              
              <div className="relative group">
                <Button
                  onClick={() => copyToClipboard(shareText)}
                  variant="outline"
                  size="sm"
                  className="p-2"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </div>
              </div>
            </div>
            
            {/* Close Button */}
            <div className="mt-4">
              <Button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

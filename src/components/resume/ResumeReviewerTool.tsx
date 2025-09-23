'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Copy,
  Loader2,
  Star,
  Target,
  TrendingUp,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { 
  ResumeRequest, 
  ResumeAnalysis, 
  ResumeResponse,
  extractTextFromFile,
  validateResumeText,
  industryKeywords
} from '@/lib/resumeUtils';

interface AnalysisState {
  loading: boolean;
  result: ResumeAnalysis | null;
  error: string | null;
}

export default function ResumeReviewerTool() {
  const [formData, setFormData] = useState<ResumeRequest>({
    resumeText: '',
    industry: '',
    jobTitle: '',
    experienceLevel: ''
  });
  
  const [analysis, setAnalysis] = useState<AnalysisState>({
    loading: false,
    result: null,
    error: null
  });
  
  const [fileName, setFileName] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const industries = Object.keys(industryKeywords);
  const experienceLevels = ['entry-level', 'mid-level', 'senior-level', 'executive'];

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setFileError('');
    setFileName(file.name);

    try {
      const text = await extractTextFromFile(file);
      setFormData(prev => ({ ...prev, resumeText: text }));
    } catch (error) {
      setFileError(error instanceof Error ? error.message : 'Failed to process file');
      setFileName('');
    }
  };

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  }, []);

  const handleInputChange = (field: keyof ResumeRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.resumeText.trim()) {
      errors.push('Please upload a resume or enter resume text');
    }
    
    if (!formData.industry) {
      errors.push('Please select an industry');
    }
    
    if (!formData.jobTitle.trim()) {
      errors.push('Please enter a target job title');
    }
    
    if (!formData.experienceLevel) {
      errors.push('Please select your experience level');
    }

    const textValidation = validateResumeText(formData.resumeText);
    if (!textValidation.isValid) {
      errors.push(...textValidation.errors);
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setAnalysis(prev => ({ ...prev, error: errors.join(', ') }));
      return;
    }

    setAnalysis({ loading: true, result: null, error: null });

    try {
      const response = await fetch('/api/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          fileName
        }),
      });

      const data: ResumeResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      setAnalysis({ loading: false, result: data.analysis!, error: null });
      
      // Track successful resume analysis generation
      try {
        await fetch('/api/tools/resume-reviewer/track-usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usageType: 'generate' })
        });
      } catch (error) {
        console.error('Failed to track usage:', error);
      }
    } catch (error) {
      setAnalysis({
        loading: false,
        result: null,
        error: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadReport = () => {
    if (!analysis.result) return;
    
    const report = generateReport(analysis.result);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-analysis-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateReport = (result: ResumeAnalysis): string => {
    return `RESUME ANALYSIS REPORT
Generated on: ${new Date().toLocaleDateString()}

OVERALL SCORE: ${result.overallScore}/100

SCORE BREAKDOWN:
- Content: ${result.scoreBreakdown.content}/25
- Structure: ${result.scoreBreakdown.structure}/25
- Keywords: ${result.scoreBreakdown.keywords}/25
- ATS Optimization: ${result.scoreBreakdown.atsOptimization}/25

STRENGTHS:
${result.strengths.map(s => `• ${s}`).join('\n')}

WEAKNESSES:
${result.weaknesses.map(w => `• ${w}`).join('\n')}

SUGGESTIONS:
${result.suggestions.map(s => `• ${s.title}: ${s.description} (${s.priority} priority)`).join('\n')}

ACTION PLAN:
${result.actionPlan.map(a => `• ${a.action} (${a.timeline}) - ${a.impact}`).join('\n')}

SUMMARY:
${result.summary}
`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI Resume Reviewer</h1>
        <p className="text-gray-600">
          Get professional feedback on your resume with AI-powered analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume Upload & Details
            </CardTitle>
            <CardDescription>
              Upload your resume and provide job details for analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resume-file">Upload Resume</Label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="resume-file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <Upload className={`h-8 w-8 mb-2 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="mb-2"
                    >
                      Choose File
                    </Button>
                    <p className="text-sm text-gray-600 mb-1">
                      or drag and drop your resume here
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports PDF, DOCX, and TXT files
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      💡 Tip: DOCX files work best for text extraction
                    </p>
                  </div>
                  {fileName && (
                    <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-700 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        ✓ {fileName}
                      </p>
                    </div>
                  )}
                  {fileError && (
                    <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-700 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        ✗ {fileError}
                      </p>
                      {fileError.includes('PDF') && (
                        <div className="text-xs text-red-600 mt-1 space-y-1">
                          <p>💡 PDF processing tips:</p>
                          <ul className="list-disc list-inside ml-2 space-y-1">
                            <li>Try converting PDF to DOCX using online converters</li>
                            <li>Copy text from PDF and paste below</li>
                            <li>Use DOCX files for best compatibility</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume-text">Or Paste Resume Text</Label>
                <Textarea
                  id="resume-text"
                  placeholder="Paste your resume text here..."
                  value={formData.resumeText}
                  onChange={(e) => handleInputChange('resumeText', e.target.value)}
                  rows={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Target Industry</Label>
                <select
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry.charAt(0).toUpperCase() + industry.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-title">Target Job Title</Label>
                <Input
                  id="job-title"
                  placeholder="e.g., Software Engineer, Marketing Manager"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience-level">Experience Level</Label>
                <select
                  id="experience-level"
                  value={formData.experienceLevel}
                  onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select experience level</option>
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={analysis.loading}
              >
                {analysis.loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {analysis.error && (
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-red-600 mt-2">{analysis.error}</p>
              </CardContent>
            </Card>
          )}

          {analysis.result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Overall Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-blue-600">
                      {analysis.result.overallScore}/100
                    </div>
                    <Progress value={analysis.result.overallScore} className="h-3" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Content</div>
                        <div className="text-gray-500">{analysis.result.scoreBreakdown.content}/25</div>
                      </div>
                      <div>
                        <div className="font-medium">Structure</div>
                        <div className="text-gray-500">{analysis.result.scoreBreakdown.structure}/25</div>
                      </div>
                      <div>
                        <div className="font-medium">Keywords</div>
                        <div className="text-gray-500">{analysis.result.scoreBreakdown.keywords}/25</div>
                      </div>
                      <div>
                        <div className="font-medium">ATS Optimization</div>
                        <div className="text-gray-500">{analysis.result.scoreBreakdown.atsOptimization}/25</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.result.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="h-5 w-5" />
                      Areas to Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.result.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.result.suggestions.map((suggestion, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{suggestion.title}</h4>
                          <Badge variant={
                            suggestion.priority === 'high' ? 'destructive' :
                            suggestion.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {suggestion.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                        <p className="text-xs text-blue-600">Impact: {suggestion.impact}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Action Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.result.actionPlan.map((action, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <Badge variant={
                          action.priority === 'high' ? 'destructive' :
                          action.priority === 'medium' ? 'default' : 'secondary'
                        } className="flex-shrink-0">
                          {action.priority}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{action.action}</p>
                          <p className="text-xs text-gray-500">Timeline: {action.timeline}</p>
                          <p className="text-xs text-blue-600">Impact: {action.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{analysis.result.summary}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => analysis.result && copyToClipboard(generateReport(analysis.result))}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Report
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={downloadReport}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
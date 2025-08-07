'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, CheckCircle, AlertTriangle, Star, Download, Share } from 'lucide-react';

interface ResumeAnalysis {
  overallScore: number;
  sections: {
    contact: { score: number; feedback: string[] };
    summary: { score: number; feedback: string[] };
    experience: { score: number; feedback: string[] };
    education: { score: number; feedback: string[] };
    skills: { score: number; feedback: string[] };
  };
  suggestions: string[];
  atsOptimization: {
    score: number;
    issues: string[];
    improvements: string[];
  };
  industryFit: {
    score: number;
    analysis: string;
    recommendations: string[];
  };
}

interface ResumeReviewerProps {}

export default function ResumeReviewerTool({}: ResumeReviewerProps) {
  const [resumeText, setResumeText] = useState('');
  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      alert('Please paste your resume content');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          targetJobTitle: targetJobTitle || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const data = await response.json();
      setAnalysis(data);
      
      // Track usage
      fetch('/api/tools/resume-reviewer/track-usage', { method: 'POST' });
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Needs Improvement';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  const downloadReport = () => {
    if (!analysis) return;
    
    const report = `
Resume Analysis Report
=====================

Overall Score: ${analysis.overallScore}/100 (${getScoreLabel(analysis.overallScore)})

SECTION ANALYSIS:
----------------
Contact Information: ${analysis.sections.contact.score}/100
${analysis.sections.contact.feedback.map(f => `- ${f}`).join('\n')}

Professional Summary: ${analysis.sections.summary.score}/100
${analysis.sections.summary.feedback.map(f => `- ${f}`).join('\n')}

Work Experience: ${analysis.sections.experience.score}/100
${analysis.sections.experience.feedback.map(f => `- ${f}`).join('\n')}

Education: ${analysis.sections.education.score}/100
${analysis.sections.education.feedback.map(f => `- ${f}`).join('\n')}

Skills: ${analysis.sections.skills.score}/100
${analysis.sections.skills.feedback.map(f => `- ${f}`).join('\n')}

ATS OPTIMIZATION:
----------------
Score: ${analysis.atsOptimization.score}/100
Issues Found:
${analysis.atsOptimization.issues.map(i => `- ${i}`).join('\n')}

Improvements:
${analysis.atsOptimization.improvements.map(i => `- ${i}`).join('\n')}

INDUSTRY FIT:
-------------
Score: ${analysis.industryFit.score}/100
Analysis: ${analysis.industryFit.analysis}

Recommendations:
${analysis.industryFit.recommendations.map(r => `- ${r}`).join('\n')}

GENERAL SUGGESTIONS:
-------------------
${analysis.suggestions.map(s => `- ${s}`).join('\n')}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-analysis-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Resume Reviewer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Get AI-powered feedback on your resume to improve your job applications
          </p>
        </div>

        {!analysis ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Resume Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Paste your resume content *</label>
                <Textarea 
                  placeholder="Paste your resume text here for AI-powered review and suggestions..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include all sections: contact info, summary, experience, education, skills
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Target Job Title (Optional)</label>
                <Input 
                  type="text" 
                  placeholder="e.g., Software Engineer, Marketing Manager, Data Analyst"
                  value={targetJobTitle}
                  onChange={(e) => setTargetJobTitle(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This helps provide more targeted feedback for your specific role
                </p>
              </div>
              
              <Button 
                className="w-full" 
                onClick={analyzeResume}
                disabled={isAnalyzing || !resumeText.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Review Resume
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overall Score Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-2xl font-bold">Overall Resume Score</h2>
                  </div>
                  <div className={`text-4xl font-bold mb-2 ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}/100
                  </div>
                  <div className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                    {getScoreLabel(analysis.overallScore)}
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => setAnalysis(null)}>
                      Analyze Another Resume
                    </Button>
                    <Button onClick={downloadReport}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Tabs */}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  {['overview', 'sections', 'ats', 'industry'].map((tab) => (
                    <Button
                      key={tab}
                      variant={activeTab === tab ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Key Recommendations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.suggestions.map((suggestion, index) => (
                        <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-200">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'sections' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Section Analysis</h3>
                    {Object.entries(analysis.sections).map(([section, data]) => (
                      <div key={section} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium capitalize">{section}</h4>
                          <div className="flex items-center gap-2">
                            {getScoreIcon(data.score)}
                            <span className={`font-bold ${getScoreColor(data.score)}`}>
                              {data.score}/100
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {data.feedback.map((item, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-1 h-1 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'ats' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">ATS Optimization</h3>
                      <div className="flex items-center gap-2">
                        {getScoreIcon(analysis.atsOptimization.score)}
                        <span className={`font-bold ${getScoreColor(analysis.atsOptimization.score)}`}>
                          {analysis.atsOptimization.score}/100
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">Issues Found:</h4>
                        <ul className="space-y-1">
                          {analysis.atsOptimization.issues.map((issue, index) => (
                            <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-green-600 mb-2">Improvements:</h4>
                        <ul className="space-y-1">
                          {analysis.atsOptimization.improvements.map((improvement, index) => (
                            <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'industry' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Industry Fit Analysis</h3>
                      <div className="flex items-center gap-2">
                        {getScoreIcon(analysis.industryFit.score)}
                        <span className={`font-bold ${getScoreColor(analysis.industryFit.score)}`}>
                          {analysis.industryFit.score}/100
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium mb-2">Analysis:</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.industryFit.analysis}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Recommendations:</h4>
                      <ul className="space-y-2">
                        {analysis.industryFit.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
            💡 Resume Writing Tips
          </h3>
          <ul className="text-blue-700 dark:text-blue-300 space-y-2">
            <li>• Use action verbs to start bullet points (e.g., "Developed", "Managed", "Implemented")</li>
            <li>• Quantify achievements with numbers and percentages when possible</li>
            <li>• Keep bullet points concise and impactful (1-2 lines each)</li>
            <li>• Use keywords from the job description to improve ATS compatibility</li>
            <li>• Ensure consistent formatting and professional appearance</li>
            <li>• Proofread carefully for spelling and grammar errors</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 
'use client';

import React, { useCallback, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ResumeAnalysis, ResumeRequest, ResumeResponse } from '@/schemas/resumeSchema';
import { industryKeywords, validateResumeText } from '@/lib/resumeUtils';
import ResumeReviewerBriefPanel from './reviewer/ResumeReviewerBriefPanel';
import ResumeReviewerHeroPanel from './reviewer/ResumeReviewerHeroPanel';
import ResumeReviewerReport from './reviewer/ResumeReviewerReport';
import ResumeReviewerUploadPanel from './reviewer/ResumeReviewerUploadPanel';
import { buildResumeReportText, downloadResumeReportPdf, downloadResumeReportText } from './reviewer/reportExport';
import { allowedFileTypes, experienceLevels } from './reviewer/shared';

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
    experienceLevel: '',
  });
  const [analysis, setAnalysis] = useState<AnalysisState>({
    loading: false,
    result: null,
    error: null,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const industries = Object.keys(industryKeywords);

  const handleInputChange = (field: keyof ResumeRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const clearSelectedFile = useCallback(() => {
    setSelectedFile(null);
    setFileName('');
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const setSelectedResumeFile = useCallback((file: File) => {
    if (!allowedFileTypes.includes(file.type)) {
      clearSelectedFile();
      setFileError('Unsupported file type. Please upload PDF, DOCX, TXT, or image files.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      clearSelectedFile();
      setFileError('File size too large. Please upload files smaller than 10MB.');
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setFileError('');
    setAnalysis((prev) => ({ ...prev, error: null }));
  }, [clearSelectedFile]);

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedResumeFile(file);
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedResumeFile(file);
    }
  }, [setSelectedResumeFile]);

  const validateForm = () => {
    const errors: string[] = [];

    if (!selectedFile && !formData.resumeText.trim()) {
      errors.push('Please upload a resume or paste resume text.');
    }

    if (!formData.industry) {
      errors.push('Please select a target industry.');
    }

    if (!formData.jobTitle.trim()) {
      errors.push('Please enter a target job title.');
    }

    if (!formData.experienceLevel) {
      errors.push('Please select an experience level.');
    }

    if (!selectedFile) {
      const textValidation = validateResumeText(formData.resumeText);
      if (!textValidation.isValid) {
        errors.push(...textValidation.errors);
      }
    }

    return errors;
  };

  const trackUsage = async () => {
    try {
      await fetch('/api/tools/resume-reviewer/track-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usageType: 'generate' }),
      });
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateForm();

    if (errors.length > 0) {
      setAnalysis((prev) => ({ ...prev, error: errors.join(' ') }));
      return;
    }

    setAnalysis({ loading: true, result: null, error: null });

    try {
      const response = selectedFile
        ? await fetch('/api/resume/enhanced', {
            method: 'POST',
            body: (() => {
              const payload = new FormData();
              payload.set('file', selectedFile);
              payload.set('industry', formData.industry);
              payload.set('jobTitle', formData.jobTitle);
              payload.set('experienceLevel', formData.experienceLevel);
              return payload;
            })(),
          })
        : await fetch('/api/resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              fileName,
            }),
          });

      const data: ResumeResponse = await response.json();
      if (!response.ok || !data.success || !data.analysis) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      setAnalysis({ loading: false, result: data.analysis, error: null });
      await trackUsage();
    } catch (error) {
      setAnalysis({
        loading: false,
        result: null,
        error: error instanceof Error ? error.message : 'An error occurred while analyzing the resume.',
      });
    }
  };

  const resetForNewAnalysis = () => {
    setFormData({
      resumeText: '',
      industry: '',
      jobTitle: '',
      experienceLevel: '',
    });
    setAnalysis({ loading: false, result: null, error: null });
    clearSelectedFile();
    setIsDragOver(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getReportExportInput = (result: ResumeAnalysis) => ({
    analysis: result,
    formData,
    fileName,
  });

  const downloadReport = () => {
    if (!analysis.result) {
      return;
    }

    downloadResumeReportText(getReportExportInput(analysis.result));
  };

  const downloadReportPdf = () => {
    if (!analysis.result) {
      return;
    }

    downloadResumeReportPdf(getReportExportInput(analysis.result));
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {analysis.error ? (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="flex items-start gap-3 p-5 text-sm text-rose-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="leading-6">{analysis.error}</p>
          </CardContent>
        </Card>
      ) : null}

      {analysis.result ? (
        <ResumeReviewerReport
          analysis={analysis.result}
          formData={formData}
          fileName={fileName}
          onNewAnalysis={resetForNewAnalysis}
          onCopyReport={() => copyToClipboard(buildResumeReportText(getReportExportInput(analysis.result)))}
          onDownloadReport={downloadReport}
          onDownloadPdf={downloadReportPdf}
        />
      ) : (
        <div className="space-y-6">
          <ResumeReviewerHeroPanel />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <ResumeReviewerUploadPanel
              fileName={fileName}
              fileError={fileError}
              isDragOver={isDragOver}
              fileInputRef={fileInputRef}
              onChooseFile={() => fileInputRef.current?.click()}
              onClearFile={clearSelectedFile}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onFileInputChange={handleFileInputChange}
            />
            <ResumeReviewerBriefPanel
              formData={formData}
              industries={industries}
              experienceLevels={experienceLevels}
              isLoading={analysis.loading}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
}

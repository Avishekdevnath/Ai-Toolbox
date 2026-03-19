import React from 'react';
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ResumeReviewerUploadPanelProps {
  fileName: string;
  fileError: string;
  isDragOver: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onChooseFile: () => void;
  onClearFile: () => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ResumeReviewerUploadPanel({
  fileName,
  fileError,
  isDragOver,
  fileInputRef,
  onChooseFile,
  onClearFile,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
}: ResumeReviewerUploadPanelProps) {
  return (
    <Card className="h-full border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
          Resume file
        </div>
        <div>
          <CardTitle className="text-xl sm:text-2xl">Upload Resume</CardTitle>
          <CardDescription className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            Use the original PDF, DOCX, TXT, or screenshot. The file stays in the private resume pipeline.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'rounded-3xl border border-dashed p-5 transition-all sm:p-6',
            isDragOver
              ? 'border-slate-900 bg-slate-50 shadow-[0_18px_50px_rgba(15,23,42,0.08)]'
              : 'border-slate-300 bg-[linear-gradient(180deg,#fbfdff_0%,#f8fafc_100%)]',
          )}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <Label htmlFor="resume-file" className="sr-only">
            Upload Resume
          </Label>
          <input
            ref={fileInputRef}
            id="resume-file"
            type="file"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.tiff"
            className="hidden"
            onChange={onFileInputChange}
          />

          <div className="flex flex-col items-start gap-4">
            <div className="rounded-2xl bg-slate-950 p-3 text-white shadow-sm">
              <Upload className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-slate-950">Drop the resume here or choose a file.</p>
              <p className="text-sm leading-6 text-slate-600">
                Best for recruiter review: original PDF or DOCX under 10 MB.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={onChooseFile}>
                Choose File
              </Button>
              {fileName ? (
                <Button type="button" variant="outline" onClick={onClearFile}>
                  Remove file
                </Button>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-2.5 py-1">PDF</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1">DOCX</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1">TXT</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1">Image</span>
            </div>
          </div>

          {fileName ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">File ready</p>
                  <p className="mt-1 break-all text-emerald-800">{fileName}</p>
                </div>
              </div>
            </div>
          ) : null}

          {fileError ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="leading-6">{fileError}</p>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

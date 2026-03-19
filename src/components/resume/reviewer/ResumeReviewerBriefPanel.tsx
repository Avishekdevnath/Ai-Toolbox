import { ArrowRight, Loader2, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ResumeRequest } from '@/schemas/resumeSchema';
import { formatExperienceLabel, selectClassName } from './shared';

interface ResumeReviewerBriefPanelProps {
  formData: ResumeRequest;
  industries: string[];
  experienceLevels: string[];
  isLoading: boolean;
  onInputChange: (field: keyof ResumeRequest, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export default function ResumeReviewerBriefPanel({
  formData,
  industries,
  experienceLevels,
  isLoading,
  onInputChange,
  onSubmit,
}: ResumeReviewerBriefPanelProps) {
  return (
    <Card className="border-[var(--color-border)] bg-[linear-gradient(180deg,#ffffff_0%,#fffaf2_100%)] shadow-sm">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-900">
          Role setup
        </div>
        <div>
          <CardTitle className="text-xl sm:text-2xl">Candidate Brief</CardTitle>
          <CardDescription className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            Frame the job target so the review reflects how a recruiter or hiring manager would read the resume.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="industry">Target Industry</Label>
              <select
                id="industry"
                value={formData.industry}
                onChange={(event) => onInputChange('industry', event.target.value)}
                className={selectClassName}
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
              <Label htmlFor="experience-level">Experience Level</Label>
              <select
                id="experience-level"
                value={formData.experienceLevel}
                onChange={(event) => onInputChange('experienceLevel', event.target.value)}
                className={selectClassName}
              >
                <option value="">Select experience level</option>
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>
                    {formatExperienceLabel(level)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-title">Target Job Title</Label>
            <Input
              id="job-title"
              placeholder="e.g. Frontend Engineer, Product Designer, Growth Marketer"
              value={formData.jobTitle}
              onChange={(event) => onInputChange('jobTitle', event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume-text">Or Paste Resume Text</Label>
            <Textarea
              id="resume-text"
              rows={11}
              placeholder="Paste resume text if you do not want to upload a file."
              value={formData.resumeText}
              onChange={(event) => onInputChange('resumeText', event.target.value)}
            />
          </div>

          <div className="rounded-2xl bg-slate-950 p-4 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Ready for review</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Once analyzed, the page switches into a recruiter report workspace with actionable edits.
                </p>
              </div>
              <Button type="submit" size="lg" className="bg-white text-slate-950 hover:bg-slate-100" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing Resume
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4" />
                    Analyze Resume
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

import { AlertTriangle, CheckCircle2, Copy, Download, FileSearch, RotateCcw, Sparkles, Target, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ResumeAnalysis, ResumeRequest } from '@/schemas/resumeSchema';
import { getVerdict } from './shared';

interface ResumeReviewerReportProps {
  analysis: ResumeAnalysis;
  formData: ResumeRequest;
  fileName: string;
  onNewAnalysis: () => void;
  onCopyReport: () => void;
  onDownloadReport: () => void;
  onDownloadPdf: () => void;
}

const scoreCards = [
  { key: 'content', label: 'Content', description: 'How clearly the resume proves relevant work.' },
  { key: 'structure', label: 'Structure', description: 'How easy the document is to scan fast.' },
  { key: 'keywords', label: 'Keyword match', description: 'How well the resume reflects the target role language.' },
  { key: 'atsOptimization', label: 'ATS readiness', description: 'How safely the resume passes machine screening.' },
] as const;

export default function ResumeReviewerReport({
  analysis,
  formData,
  fileName,
  onNewAnalysis,
  onCopyReport,
  onDownloadReport,
  onDownloadPdf,
}: ResumeReviewerReportProps) {
  const verdict = getVerdict(analysis.overallScore);

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,#101828_0%,#18253a_58%,#22314b_100%)] text-white shadow-[0_28px_70px_rgba(15,23,42,0.2)]">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl space-y-4">
              <Badge className="w-fit bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                Recruiter report
              </Badge>
              <div>
                <h1 className="text-3xl font-semibold sm:text-4xl">Evaluation Summary</h1>
                <p className="mt-3 text-sm leading-6 text-slate-200 sm:text-base">{analysis.summary}</p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                {formData.jobTitle ? <span className="rounded-full bg-white/8 px-3 py-1">{formData.jobTitle}</span> : null}
                {formData.industry ? <span className="rounded-full bg-white/8 px-3 py-1">{formData.industry}</span> : null}
                {formData.experienceLevel ? <span className="rounded-full bg-white/8 px-3 py-1">{formData.experienceLevel}</span> : null}
                {fileName ? <span className="rounded-full bg-white/8 px-3 py-1">{fileName}</span> : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[auto_auto] xl:min-w-[320px]">
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Overall score</p>
                <div className="mt-4 text-5xl font-semibold text-white">{analysis.overallScore}</div>
                <p className={`mt-3 text-sm font-medium ${verdict.tone}`}>{verdict.label}</p>
                <Progress value={analysis.overallScore} className="mt-4 bg-white/10" />
              </div>

              <div className="flex flex-col gap-3">
                <div className="rounded-3xl border border-white/10 bg-white/6 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Target className="h-4 w-4 text-amber-300" />
                    Quick read
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    {analysis.overallScore >= 80
                      ? 'This resume is close to interview-ready with focused refinements.'
                      : 'The profile has value, but the signal is not landing fast enough yet.'}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/6 p-4">
                  <Badge className={verdict.badgeClass}>Recruiter verdict</Badge>
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    Use the action plan below for the next edit round, then run a new analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={onNewAnalysis} className="bg-white text-slate-950 hover:bg-slate-100">
              <RotateCcw className="h-4 w-4" />
              New analysis
            </Button>
            <Button type="button" variant="outline" onClick={onCopyReport} className="border-white/20 text-white hover:bg-white/10">
              <Copy className="h-4 w-4" />
              Copy report
            </Button>
            <Button type="button" variant="outline" onClick={onDownloadReport} className="border-white/20 text-white hover:bg-white/10">
              <Download className="h-4 w-4" />
              Download report
            </Button>
            <Button type="button" variant="outline" onClick={onDownloadPdf} className="border-white/20 text-white hover:bg-white/10">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {scoreCards.map((card) => (
          <Card key={card.key} className="border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-slate-900">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {analysis.scoreBreakdown[card.key]}
                <span className="text-base font-medium text-slate-400">/25</span>
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              <h2 className="text-lg font-semibold text-slate-950">Strengths</h2>
            </div>
            <div className="mt-5 space-y-3">
              {analysis.strengths.map((item) => (
                <div key={item} className="rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-950 ring-1 ring-emerald-100">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="text-lg font-semibold text-slate-950">Hiring risks</h2>
            </div>
            <div className="mt-5 space-y-3">
              {analysis.weaknesses.map((item) => (
                <div key={item} className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950 ring-1 ring-amber-100">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <Card className="border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-slate-900">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold">Recommended edits</h2>
            </div>
            <div className="mt-5 space-y-4">
              {analysis.suggestions.map((suggestion) => (
                <div key={`${suggestion.title}-${suggestion.priority}`} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold text-slate-950">{suggestion.title}</p>
                    <Badge
                      variant={suggestion.priority === 'high' ? 'destructive' : suggestion.priority === 'medium' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {suggestion.priority}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {suggestion.category}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{suggestion.description}</p>
                  <p className="mt-3 text-sm font-medium text-slate-900">Impact: {suggestion.impact}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-slate-900">
                <TrendingUp className="h-5 w-5 text-sky-600" />
                <h2 className="text-lg font-semibold">Action plan</h2>
              </div>
              <div className="mt-5 space-y-3">
                {analysis.actionPlan.map((action) => (
                  <div key={`${action.action}-${action.timeline}`} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge
                        variant={action.priority === 'high' ? 'destructive' : action.priority === 'medium' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {action.priority}
                      </Badge>
                      <p className="text-sm font-semibold text-slate-950">{action.action}</p>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">Timeline: {action.timeline}</p>
                    <p className="mt-1 text-sm text-slate-600">Impact: {action.impact}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--color-border)] bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-slate-900">
                <FileSearch className="h-5 w-5 text-slate-700" />
                <h2 className="text-lg font-semibold">Keyword snapshot</h2>
              </div>
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Found</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {analysis.keywordAnalysis.foundKeywords.slice(0, 8).map((keyword) => (
                      <span key={keyword} className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-900">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Missing</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {analysis.keywordAnalysis.missingKeywords.slice(0, 8).map((keyword) => (
                      <span key={keyword} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </section>
  );
}

import { ArrowRight, BriefcaseBusiness, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { intakeHighlights } from './shared';

export default function ResumeReviewerHeroPanel() {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
      <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,#101828_0%,#172033_55%,#22314c_100%)] text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Recruiter-grade review
            </Badge>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Private file analysis
            </div>
          </div>

          <div className="mt-6 max-w-2xl space-y-4">
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Review your resume like a recruiter before you apply.
            </h1>
            <p className="max-w-xl text-sm leading-6 text-slate-200 sm:text-base">
              Upload your file or paste the resume, define the role you want, and get a clear hiring readout built for shortlist decisions.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {intakeHighlights.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Icon className="h-5 w-5 text-amber-300" />
                <h2 className="mt-3 text-sm font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-200">{description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-[var(--color-border)] bg-[linear-gradient(180deg,#fff8ef_0%,#ffffff_100%)] shadow-sm">
        <CardContent className="flex h-full flex-col justify-between p-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">
              <Sparkles className="h-3.5 w-3.5" />
              What you will get
            </div>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                    <BriefcaseBusiness className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Hiring lens</p>
                    <p className="text-sm text-slate-600">Score, risks, and strengths framed for recruiter review.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
                <p className="text-sm font-semibold text-slate-900">Improvement order</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">You get a prioritized action plan instead of a generic list of edits.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-950 p-4 text-slate-100">
            <p className="text-sm font-semibold">Fast workflow</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Intake first, evaluation second. Run a new analysis any time without leaving the page.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-amber-300">
              Built for job search iteration
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

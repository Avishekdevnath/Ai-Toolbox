import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit3, MessageSquare, BarChart, Sparkles } from 'lucide-react';
import { connectToDatabase } from '@/lib/mongodb';
import { getFormModel } from '@/models/FormModel';
import FormAnalytics from '@/components/forms/analytics/FormAnalytics';

export default async function FormAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  const claims = token ? verifyAccessToken(token) : null;
  if (!claims) redirect('/sign-in');

  const { id } = await params;
  await connectToDatabase();
  const Form = await getFormModel();
  const form = await Form.findById(id)
    .select('title aiInsights')
    .lean<{ title: string; aiInsights?: { data?: { summary?: string; summaryGeneratedAt?: string } } }>();
  if (!form) notFound();

  const subNav = [
    { label: 'Edit',      href: `/dashboard/forms/${id}/edit`,      icon: Edit3 },
    { label: 'Responses', href: `/dashboard/forms/${id}/responses`, icon: MessageSquare },
    { label: 'Analytics', href: `/dashboard/forms/${id}/analytics`, icon: BarChart, active: true },
    { label: 'AI Report', href: `/dashboard/forms/${id}/ai-report`, icon: Sparkles },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/dashboard/forms"
          className="text-[12px] text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 mb-1"
        >
          <ArrowLeft size={12} /> Forms
        </Link>
        <h1 className="text-[16px] font-semibold text-slate-800">{form.title}</h1>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {subNav.map(({ label, href, icon: Icon, active }) => (
          <Link
            key={label}
            href={href}
            className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              active
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={13} /> {label}
          </Link>
        ))}
      </div>

      <FormAnalytics
        formId={id}
        initialSummary={form.aiInsights?.data?.summary}
        initialGeneratedAt={form.aiInsights?.data?.summaryGeneratedAt}
      />
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { Save, RefreshCw, CheckCircle, Mail, MapPin, MessageSquare } from 'lucide-react';

interface ContactInfo {
  email?: string; phone?: string; address?: string; portfolioUrl?: string;
  liveChatUrl?: string; description?: string; businessHours?: string;
  socialMedia?: { facebook?: string; twitter?: string; linkedin?: string; instagram?: string };
}

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none';
const labelCls = 'block text-[12px] font-medium text-slate-500 mb-1.5';

function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <Icon className="w-4 h-4 text-slate-400" />
        <h2 className="text-[13px] font-semibold text-slate-700">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function ContactInfoPage() {
  const [info, setInfo] = useState<ContactInfo>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadContactInfo(); }, []);

  const loadContactInfo = async () => {
    try {
      const res = await fetch('/api/contact/settings', { cache: 'no-store' });
      if (res.ok) { const data = await res.json(); setInfo(data?.data || {}); }
    } catch (e) { console.error('Failed to load contact info:', e); }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(info) });
      if (!res.ok) throw new Error('Failed to save');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error('Failed to save contact info:', e); }
    finally { setLoading(false); }
  };

  const set = (key: keyof ContactInfo, val: string) => setInfo(p => ({ ...p, [key]: val }));
  const setSocial = (key: string, val: string) => setInfo(p => ({ ...p, socialMedia: { ...p.socialMedia, [key]: val } }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Contact Information</h1>
        <p className="text-[12px] text-slate-400 mt-0.5">Manage your business contact details displayed on the public contact page.</p>
      </div>

      <SectionCard title="Basic Contact" icon={Mail}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelCls}>Email Address</label><input className={inputCls} value={info.email || ''} onChange={e => set('email', e.target.value)} placeholder="contact@example.com" /></div>
          <div><label className={labelCls}>Phone Number</label><input className={inputCls} value={info.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+1 555 123 4567" /></div>
          <div className="md:col-span-2"><label className={labelCls}>Business Address</label><input className={inputCls} value={info.address || ''} onChange={e => set('address', e.target.value)} placeholder="123 Main St, City, State" /></div>
          <div className="md:col-span-2"><label className={labelCls}>Portfolio URL</label><input className={inputCls} value={info.portfolioUrl || ''} onChange={e => set('portfolioUrl', e.target.value)} placeholder="https://your-portfolio.com" /></div>
          <div className="md:col-span-2"><label className={labelCls}>Live Chat URL</label><input className={inputCls} value={info.liveChatUrl || ''} onChange={e => set('liveChatUrl', e.target.value)} placeholder="https://your-chat-provider-link" /></div>
        </div>
      </SectionCard>

      <SectionCard title="Business Information" icon={MapPin}>
        <div className="space-y-4">
          <div><label className={labelCls}>Business Description</label><textarea className={`${inputCls} resize-none`} rows={3} value={info.description || ''} onChange={e => set('description', e.target.value)} placeholder="Brief description of your business..." /></div>
          <div><label className={labelCls}>Business Hours</label><input className={inputCls} value={info.businessHours || ''} onChange={e => set('businessHours', e.target.value)} placeholder="Mon-Fri: 9AM-5PM, Sat: 10AM-2PM" /></div>
        </div>
      </SectionCard>

      <SectionCard title="Social Media Links" icon={MessageSquare}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['facebook', 'twitter', 'linkedin', 'instagram'] as const).map(key => (
            <div key={key}>
              <label className={labelCls}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
              <input className={inputCls} value={info.socialMedia?.[key] || ''} onChange={e => setSocial(key, e.target.value)} placeholder={`https://${key}.com/yourpage`} />
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-4">
        {saved ? (
          <span className="flex items-center gap-1.5 text-[13px] text-green-600"><CheckCircle className="w-4 h-4" /> Saved successfully!</span>
        ) : <span />}
        <div className="flex gap-2">
          <button onClick={loadContactInfo} disabled={loading} className="inline-flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[13px] px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={handleSave} disabled={loading} className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
            <Save className="w-3.5 h-3.5" /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

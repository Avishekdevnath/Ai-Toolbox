'use client';

import React, { useEffect, useState } from 'react';
import { Save, RefreshCw, CheckCircle, User, Mail, Globe, Edit, Plus, Trash2, Settings } from 'lucide-react';

interface AboutInfo {
  name?: string; title?: string; description?: string; avatar?: string;
  email?: string; phone?: string; location?: string; portfolioUrl?: string;
  socialLinks?: { linkedin?: string; github?: string; twitter?: string; instagram?: string; website?: string };
  experience?: Array<{ title: string; company: string; location: string; period: string; type: string; skills: string[]; website?: string; description?: string; isActive: boolean; order: number }>;
  education?: Array<{ title: string; institution: string; field: string; period: string; isActive: boolean; order: number }>;
  skills?: Array<{ name: string; category: 'frontend' | 'backend' | 'database' | 'devops' | 'other'; level: 'beginner' | 'intermediate' | 'advanced' | 'expert'; isActive: boolean; order: number }>;
}

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none';
const labelCls = 'block text-[12px] font-medium text-slate-500 mb-1.5';
const selectCls = `${inputCls} bg-white`;

function Card({ title, icon: Icon, action, children }: { title: string; icon: any; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2"><Icon className="w-4 h-4 text-slate-400" /><h2 className="text-[13px] font-semibold text-slate-700">{title}</h2></div>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function AboutInfoPage() {
  const [info, setInfo] = useState<AboutInfo>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadAboutInfo(); }, []);

  const loadAboutInfo = async () => {
    try {
      const res = await fetch('/api/about/info', { cache: 'no-store' });
      if (res.ok) { const data = await res.json(); setInfo(data?.data || {}); }
    } catch (e) { console.error('Failed to load about info:', e); }
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!info.name?.trim()) errors.push('Name is required');
    if (!info.title?.trim()) errors.push('Title is required');
    if (!info.description?.trim()) errors.push('Description is required');
    if (!info.email?.trim()) errors.push('Email is required');
    if (!info.phone?.trim()) errors.push('Phone is required');
    if (!info.location?.trim()) errors.push('Location is required');
    if (!info.portfolioUrl?.trim()) errors.push('Portfolio URL is required');
    return errors;
  };

  const handleSave = async () => {
    const errs = validateForm();
    if (errs.length > 0) { alert(`Please fill in all required fields:\n${errs.join('\n')}`); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/about/info', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(info) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `Server error: ${res.status}`); }
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Failed to save');
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error('Failed to save about info:', e); alert(`Failed to save: ${e instanceof Error ? e.message : 'Unknown error'}`); }
    finally { setLoading(false); }
  };

  const set = (k: keyof AboutInfo, v: any) => setInfo(p => ({ ...p, [k]: v }));
  const setSocial = (k: string, v: string) => setInfo(p => ({ ...p, socialLinks: { ...p.socialLinks, [k]: v } }));
  const addExp = () => setInfo(p => ({ ...p, experience: [...(p.experience || []), { title: '', company: '', location: '', period: '', type: 'Full-time', skills: [], website: '', description: '', isActive: true, order: (p.experience?.length || 0) + 1 }] }));
  const removeExp = (i: number) => setInfo(p => ({ ...p, experience: p.experience?.filter((_, x) => x !== i) || [] }));
  const updateExp = (i: number, k: string, v: any) => setInfo(p => ({ ...p, experience: p.experience?.map((e, x) => x === i ? { ...e, [k]: v } : e) || [] }));
  const addEdu = () => setInfo(p => ({ ...p, education: [...(p.education || []), { title: '', institution: '', field: '', period: '', isActive: true, order: (p.education?.length || 0) + 1 }] }));
  const removeEdu = (i: number) => setInfo(p => ({ ...p, education: p.education?.filter((_, x) => x !== i) || [] }));
  const updateEdu = (i: number, k: string, v: any) => setInfo(p => ({ ...p, education: p.education?.map((e, x) => x === i ? { ...e, [k]: v } : e) || [] }));
  const addSkill = () => setInfo(p => ({ ...p, skills: [...(p.skills || []), { name: '', category: 'other' as const, level: 'intermediate' as const, isActive: true, order: (p.skills?.length || 0) + 1 }] }));
  const removeSkill = (i: number) => setInfo(p => ({ ...p, skills: p.skills?.filter((_, x) => x !== i) || [] }));
  const updateSkill = (i: number, k: string, v: any) => setInfo(p => ({ ...p, skills: p.skills?.map((s, x) => x === i ? { ...s, [k]: v } : s) || [] }));

  const addBtn = (onClick: () => void, label: string) => (
    <button onClick={onClick} className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg transition-colors"><Plus className="w-3 h-3" />{label}</button>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">About Page Information</h1>
        <p className="text-[12px] text-slate-400 mt-0.5">Manage your personal information displayed on the About page.</p>
      </div>

      <Card title="Basic Information" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelCls}>Full Name *</label><input className={inputCls} value={info.name || ''} onChange={e => set('name', e.target.value)} placeholder="Your full name" /></div>
          <div><label className={labelCls}>Professional Title *</label><input className={inputCls} value={info.title || ''} onChange={e => set('title', e.target.value)} placeholder="e.g., Full-Stack Developer" /></div>
          <div className="md:col-span-2"><label className={labelCls}>Description *</label><textarea className={`${inputCls} resize-none`} rows={4} value={info.description || ''} onChange={e => set('description', e.target.value)} placeholder="Brief description about yourself..." /></div>
          <div><label className={labelCls}>Avatar URL</label><input className={inputCls} value={info.avatar || ''} onChange={e => set('avatar', e.target.value)} placeholder="https://example.com/avatar.jpg" /></div>
        </div>
      </Card>

      <Card title="Contact Information" icon={Mail}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelCls}>Email Address *</label><input className={inputCls} value={info.email || ''} onChange={e => set('email', e.target.value)} placeholder="your.email@example.com" /></div>
          <div><label className={labelCls}>Phone Number *</label><input className={inputCls} value={info.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+1 555 123 4567" /></div>
          <div><label className={labelCls}>Location *</label><input className={inputCls} value={info.location || ''} onChange={e => set('location', e.target.value)} placeholder="City, Country" /></div>
          <div><label className={labelCls}>Portfolio URL *</label><input className={inputCls} value={info.portfolioUrl || ''} onChange={e => set('portfolioUrl', e.target.value)} placeholder="https://your-portfolio.com" /></div>
        </div>
      </Card>

      <Card title="Social Media Links" icon={Globe}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['linkedin', 'github', 'twitter', 'instagram'] as const).map(k => (
            <div key={k}><label className={labelCls}>{k.charAt(0).toUpperCase() + k.slice(1)}</label><input className={inputCls} value={info.socialLinks?.[k] || ''} onChange={e => setSocial(k, e.target.value)} placeholder={`https://${k}.com/yourprofile`} /></div>
          ))}
        </div>
      </Card>

      <Card title="Work Experience" icon={Edit} action={addBtn(addExp, 'Add Experience')}>
        <div className="space-y-4">
          {info.experience?.map((exp, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between"><span className="text-[12px] font-semibold text-slate-600">Experience #{i + 1}</span><button onClick={() => removeExp(i)} className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className={labelCls}>Job Title</label><input className={inputCls} value={exp.title} onChange={e => updateExp(i, 'title', e.target.value)} placeholder="Job title" /></div>
                <div><label className={labelCls}>Company</label><input className={inputCls} value={exp.company} onChange={e => updateExp(i, 'company', e.target.value)} placeholder="Company name" /></div>
                <div><label className={labelCls}>Location</label><input className={inputCls} value={exp.location} onChange={e => updateExp(i, 'location', e.target.value)} placeholder="City, Country" /></div>
                <div><label className={labelCls}>Period</label><input className={inputCls} value={exp.period} onChange={e => updateExp(i, 'period', e.target.value)} placeholder="Jan 2020 - Present" /></div>
                <div><label className={labelCls}>Type</label><input className={inputCls} value={exp.type} onChange={e => updateExp(i, 'type', e.target.value)} placeholder="Full-time, Part-time, etc." /></div>
                <div><label className={labelCls}>Website</label><input className={inputCls} value={exp.website || ''} onChange={e => updateExp(i, 'website', e.target.value)} placeholder="https://company.com" /></div>
              </div>
              <div><label className={labelCls}>Description</label><textarea className={`${inputCls} resize-none`} rows={2} value={exp.description || ''} onChange={e => updateExp(i, 'description', e.target.value)} placeholder="Brief description of your role..." /></div>
              <div><label className={labelCls}>Skills (comma-separated)</label><input className={inputCls} value={exp.skills.join(', ')} onChange={e => updateExp(i, 'skills', e.target.value.split(',').map(s => s.trim()))} placeholder="React, Node.js, MongoDB" /></div>
            </div>
          ))}
          {!info.experience?.length && <p className="text-[13px] text-slate-400 text-center py-4">No experience entries yet. Click "Add Experience" to get started.</p>}
        </div>
      </Card>

      <Card title="Education" icon={User} action={addBtn(addEdu, 'Add Education')}>
        <div className="space-y-4">
          {info.education?.map((edu, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between"><span className="text-[12px] font-semibold text-slate-600">Education #{i + 1}</span><button onClick={() => removeEdu(i)} className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className={labelCls}>Degree Title</label><input className={inputCls} value={edu.title} onChange={e => updateEdu(i, 'title', e.target.value)} placeholder="Bachelor of Science" /></div>
                <div><label className={labelCls}>Institution</label><input className={inputCls} value={edu.institution} onChange={e => updateEdu(i, 'institution', e.target.value)} placeholder="University name" /></div>
                <div><label className={labelCls}>Field of Study</label><input className={inputCls} value={edu.field} onChange={e => updateEdu(i, 'field', e.target.value)} placeholder="Computer Science" /></div>
                <div><label className={labelCls}>Period</label><input className={inputCls} value={edu.period} onChange={e => updateEdu(i, 'period', e.target.value)} placeholder="2020 - 2024" /></div>
              </div>
            </div>
          ))}
          {!info.education?.length && <p className="text-[13px] text-slate-400 text-center py-4">No education entries yet. Click "Add Education" to get started.</p>}
        </div>
      </Card>

      <Card title="Skills" icon={Settings} action={addBtn(addSkill, 'Add Skill')}>
        <div className="space-y-3">
          {info.skills?.map((skill, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3"><span className="text-[12px] font-semibold text-slate-600">Skill #{i + 1}</span><button onClick={() => removeSkill(i)} className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div><label className={labelCls}>Skill Name</label><input className={inputCls} value={skill.name} onChange={e => updateSkill(i, 'name', e.target.value)} placeholder="JavaScript" /></div>
                <div><label className={labelCls}>Category</label><select className={selectCls} value={skill.category} onChange={e => updateSkill(i, 'category', e.target.value)}><option value="frontend">Frontend</option><option value="backend">Backend</option><option value="database">Database</option><option value="devops">DevOps</option><option value="other">Other</option></select></div>
                <div><label className={labelCls}>Level</label><select className={selectCls} value={skill.level} onChange={e => updateSkill(i, 'level', e.target.value)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="expert">Expert</option></select></div>
              </div>
            </div>
          ))}
          {!info.skills?.length && <p className="text-[13px] text-slate-400 text-center py-4">No skills yet. Click "Add Skill" to get started.</p>}
        </div>
      </Card>

      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-4">
        {saved ? <span className="flex items-center gap-1.5 text-[13px] text-green-600"><CheckCircle className="w-4 h-4" /> Saved successfully!</span> : <span />}
        <div className="flex gap-2">
          <button onClick={loadAboutInfo} disabled={loading} className="inline-flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[13px] px-3 py-2 rounded-lg transition-colors disabled:opacity-50"><RefreshCw className="w-3.5 h-3.5" /> Reset</button>
          <button onClick={handleSave} disabled={loading} className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] px-3 py-2 rounded-lg transition-colors disabled:opacity-50"><Save className="w-3.5 h-3.5" /> {loading ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}

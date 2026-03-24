'use client';

import React, { useState } from 'react';
import { Settings, Save, RefreshCw, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface AdminSettings {
  systemName: string; maintenanceMode: boolean; userRegistration: boolean;
  emailNotifications: boolean; analyticsEnabled: boolean;
  maxFileSize: number; sessionTimeout: number; apiRateLimit: number;
}

const defaults: AdminSettings = {
  systemName: 'AI Toolbox', maintenanceMode: false, userRegistration: true,
  emailNotifications: true, analyticsEnabled: true,
  maxFileSize: 10, sessionTimeout: 24, apiRateLimit: 100,
};

function SwitchRow({ id, label, desc, checked, onChange }: { id: string; label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div><Label htmlFor={id} className="text-[13px] font-medium text-slate-700">{label}</Label><p className="text-[12px] text-slate-400 mt-0.5">{desc}</p></div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(defaults);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try { await new Promise(resolve => setTimeout(resolve, 1000)); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    catch (error) { console.error('Failed to save settings:', error); }
    finally { setLoading(false); }
  };

  const set = (patch: Partial<AdminSettings>) => setSettings(prev => ({ ...prev, ...patch }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Admin Settings</h1>
        <p className="text-[12px] text-slate-400 mt-0.5">Configure system-wide settings and preferences.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-[13px] font-semibold text-slate-800 mb-4">System Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="systemName" className="text-[12px] text-slate-600">System Name</Label>
            <Input id="systemName" value={settings.systemName} onChange={e => set({ systemName: e.target.value })} placeholder="AI Toolbox" className="h-9 text-[13px] border-slate-200" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="maxFileSize" className="text-[12px] text-slate-600">Max File Size (MB)</Label>
            <Input id="maxFileSize" type="number" value={settings.maxFileSize} onChange={e => set({ maxFileSize: parseInt(e.target.value) })} className="h-9 text-[13px] border-slate-200" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-[13px] font-semibold text-slate-800 mb-2">Security &amp; Access</h2>
        <SwitchRow id="maintenanceMode" label="Maintenance Mode" desc="Temporarily disable user access" checked={settings.maintenanceMode} onChange={v => set({ maintenanceMode: v })} />
        <SwitchRow id="userRegistration" label="Allow User Registration" desc="Enable new user sign-ups" checked={settings.userRegistration} onChange={v => set({ userRegistration: v })} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
          <div className="space-y-1.5">
            <Label htmlFor="sessionTimeout" className="text-[12px] text-slate-600">Session Timeout (hours)</Label>
            <Input id="sessionTimeout" type="number" value={settings.sessionTimeout} onChange={e => set({ sessionTimeout: parseInt(e.target.value) })} className="h-9 text-[13px] border-slate-200" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="apiRateLimit" className="text-[12px] text-slate-600">API Rate Limit (req/min)</Label>
            <Input id="apiRateLimit" type="number" value={settings.apiRateLimit} onChange={e => set({ apiRateLimit: parseInt(e.target.value) })} className="h-9 text-[13px] border-slate-200" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-[13px] font-semibold text-slate-800 mb-2">Notifications</h2>
        <SwitchRow id="emailNotifications" label="Email Notifications" desc="Send system notifications via email" checked={settings.emailNotifications} onChange={v => set({ emailNotifications: v })} />
        <SwitchRow id="analyticsEnabled" label="Analytics Collection" desc="Collect usage analytics data" checked={settings.analyticsEnabled} onChange={v => set({ analyticsEnabled: v })} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            {saved && <div className="flex items-center gap-2 text-green-600"><CheckCircle className="h-4 w-4" /><span className="text-[13px]">Settings saved successfully!</span></div>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSettings(defaults)} disabled={loading} className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-[13px] text-slate-600 hover:bg-slate-50 disabled:opacity-50">
              <RefreshCw className="h-3.5 w-3.5" />Reset
            </button>
            <button onClick={handleSave} disabled={loading} className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 disabled:opacity-50">
              <Save className="h-3.5 w-3.5" />{loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

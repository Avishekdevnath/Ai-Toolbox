'use client';

import React, { useState, useEffect } from 'react';
import { Server, CheckCircle, AlertCircle, Activity, Cpu, Network, RefreshCw, Clock } from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  uptime: string; uptimePercentage: number;
  cpuUsage: number; memoryUsage: number; diskUsage: number;
  networkLatency: number; databaseStatus: 'connected' | 'disconnected' | 'error';
  apiResponseTime: number; activeConnections: number; errorRate: number; lastIncident: string;
}

const usageColor = (v: number) => v > 80 ? 'bg-red-500' : v > 60 ? 'bg-yellow-500' : 'bg-blue-500';

function UsageBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-[12px] text-slate-600">{label}</span>
        <span className="text-[12px] font-medium text-slate-700">{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${usageColor(value)}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function AdminSystemPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy', uptime: '15 days, 8 hours, 32 minutes', uptimePercentage: 99.98,
    cpuUsage: 23, memoryUsage: 67, diskUsage: 45, networkLatency: 45,
    databaseStatus: 'connected', apiResponseTime: 120, activeConnections: 156,
    errorRate: 0.2, lastIncident: '2024-07-01 10:15',
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshData = async () => {
    setLoading(true);
    try { await new Promise(resolve => setTimeout(resolve, 1000)); setLastUpdated(new Date()); }
    catch (error) { console.error('Failed to refresh system data:', error); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusCfg = {
    healthy: { label: 'Healthy', dot: 'bg-green-500', text: 'text-green-600', icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
    warning: { label: 'Warning', dot: 'bg-yellow-500', text: 'text-yellow-600', icon: <AlertCircle className="h-4 w-4 text-yellow-500" /> },
    error: { label: 'Error', dot: 'bg-red-500', text: 'text-red-600', icon: <AlertCircle className="h-4 w-4 text-red-500" /> },
  };
  const cfg = statusCfg[systemHealth.status];

  const perfRows = [
    { label: 'API Response Time', value: `${systemHealth.apiResponseTime}ms`, ok: systemHealth.apiResponseTime < 200 },
    { label: 'Network Latency', value: `${systemHealth.networkLatency}ms`, ok: systemHealth.networkLatency < 100 },
    { label: 'Error Rate', value: `${systemHealth.errorRate}%`, ok: systemHealth.errorRate < 1 },
    { label: 'Database Status', value: systemHealth.databaseStatus, ok: systemHealth.databaseStatus === 'connected' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">System Health</h1>
          <p className="text-[12px] text-slate-400 mt-0.5">Monitor system performance and infrastructure status.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-slate-400">Updated: {lastUpdated.toLocaleTimeString()}</span>
          <button onClick={refreshData} disabled={loading} className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-[13px] text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: cfg.icon, label: 'Overall Status', value: cfg.label, valueClass: cfg.text },
          { icon: <Clock className="h-4 w-4 text-blue-500" />, label: 'Uptime', value: systemHealth.uptime, valueClass: 'text-slate-700' },
          { icon: <CheckCircle className="h-4 w-4 text-green-500" />, label: 'Uptime %', value: `${systemHealth.uptimePercentage}%`, valueClass: 'text-green-600' },
          { icon: <Network className="h-4 w-4 text-purple-500" />, label: 'Active Connections', value: systemHealth.activeConnections.toString(), valueClass: 'text-slate-700' },
        ].map(({ icon, label, value, valueClass }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">{icon}<span className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">{label}</span></div>
            <p className={`text-[13px] font-semibold truncate ${valueClass}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4"><Cpu className="h-4 w-4 text-slate-400" /><h2 className="text-[13px] font-semibold text-slate-800">Resource Usage</h2></div>
          <div className="space-y-4">
            <UsageBar label="CPU Usage" value={systemHealth.cpuUsage} />
            <UsageBar label="Memory Usage" value={systemHealth.memoryUsage} />
            <UsageBar label="Disk Usage" value={systemHealth.diskUsage} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4"><Activity className="h-4 w-4 text-slate-400" /><h2 className="text-[13px] font-semibold text-slate-800">Performance Metrics</h2></div>
          <div className="divide-y divide-slate-100">
            {perfRows.map(({ label, value, ok }) => (
              <div key={label} className="flex items-center justify-between py-2.5">
                <span className="text-[13px] text-slate-600">{label}</span>
                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-[13px] font-semibold text-slate-800 mb-4">Recent Incidents</h2>
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 border border-slate-100 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-slate-700">Minor API latency spike</p>
              <p className="text-[12px] text-slate-400 mt-0.5">{systemHealth.lastIncident} — Response times increased to 500ms for 15 minutes</p>
            </div>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 shrink-0">Resolved</span>
          </div>
          <div className="flex items-start gap-3 p-3 border border-slate-100 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-slate-700">System maintenance completed</p>
              <p className="text-[12px] text-slate-400 mt-0.5">2024-06-28 02:00 — Database optimization and security updates applied</p>
            </div>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 shrink-0">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

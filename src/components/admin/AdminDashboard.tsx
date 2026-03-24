'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, Settings, Activity, RefreshCw, Loader2, AlertCircle, CheckCircle, BarChart2, Server, Eye, MessageSquare, Bug, Lightbulb } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number; activeUsers: number; totalTools: number; totalUsage: number;
  systemHealth: { apiStatus: string; databaseStatus: string; errorRate: number; uptime: string; responseTime: string; lastDowntime: string; };
  toolUsage: Array<{ name: string; count: number; growth: number; }>;
  recentActivity: Array<{ user: string; action: string; time: string; type: string; }>;
  alerts: Array<{ type: string; message: string; time: string; }>;
  unreadNotifications: number; lastUpdated: string;
}

const alertStyles: Record<string, string> = {
  warning: 'bg-yellow-50 border-yellow-200', error: 'bg-red-50 border-red-200',
  success: 'bg-green-50 border-green-200', info: 'bg-blue-50 border-blue-200',
};
const AlertIcon = ({ type }: { type: string }) => {
  if (type === 'success') return <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />;
  if (type === 'error') return <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />;
  if (type === 'warning') return <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />;
  return <Activity className="h-4 w-4 text-blue-500 shrink-0" />;
};

interface FeedbackStats { total: number; bugs: number; features: number; new: number; lastWeek: number; }

function FeedbackStatsCard() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  useEffect(() => {
    fetch('/api/admin/feedback/stats').then((r) => r.json()).then(setStats).catch(() => {});
  }, []);
  if (!stats) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-slate-400" /><h2 className="text-[13px] font-semibold text-slate-800">User Feedback</h2></div>
        <Link href="/admin/feedback" className="text-[12px] text-blue-600 hover:underline">View all</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: MessageSquare, color: 'text-slate-700' },
          { label: 'Bug Reports', value: stats.bugs, icon: Bug, color: 'text-red-600' },
          { label: 'Feature Requests', value: stats.features, icon: Lightbulb, color: 'text-amber-600' },
          { label: 'Unreviewed', value: stats.new, icon: AlertCircle, color: 'text-blue-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="border border-slate-100 rounded-lg p-3">
            <Icon className={`h-3.5 w-3.5 ${color} mb-1`} />
            <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/dashboard/stats');
      const result = await response.json();
      if (result.success) setStats(result.data);
      else setError(result.error || 'Failed to fetch dashboard data');
    } catch { setError('Network error. Please try again.'); }
  };

  useEffect(() => { fetchDashboardStats().finally(() => setLoading(false)); }, []);

  const refreshData = async () => { setRefreshing(true); await fetchDashboardStats(); setRefreshing(false); };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center"><Loader2 className="h-7 w-7 animate-spin mx-auto mb-3 text-blue-600" /><p className="text-[13px] text-slate-500">Loading dashboard...</p></div>
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center"><AlertCircle className="h-7 w-7 mx-auto mb-3 text-red-500" /><p className="text-[13px] text-red-600 mb-3">{error}</p>
        <button onClick={refreshData} className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-600 hover:bg-slate-50"><RefreshCw className="h-3.5 w-3.5" />Retry</button>
      </div>
    </div>
  );
  if (!stats) return null;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), sub: 'Registered', icon: Users },
    { label: 'Active Users', value: stats.activeUsers.toLocaleString(), sub: 'Last 7 days', icon: TrendingUp },
    { label: 'Total Tools', value: stats.totalTools, sub: 'Available', icon: Settings },
    { label: 'Total Usage', value: stats.totalUsage.toLocaleString(), sub: 'All-time interactions', icon: Activity },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">System Overview</h1>
          <p className="text-[12px] text-slate-400 mt-0.5">Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}</p>
        </div>
        <button onClick={refreshData} disabled={refreshing} className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-[13px] text-slate-600 hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 relative">
            <span className="absolute top-4 right-4 p-1.5 bg-blue-50 rounded-lg"><Icon className="h-4 w-4 text-blue-600" /></span>
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">{label}</p>
            <p className="text-2xl font-bold tabular-nums text-slate-800 mt-1">{value}</p>
            <p className="text-[12px] text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4"><Server className="h-4 w-4 text-slate-400" /><h2 className="text-[13px] font-semibold text-slate-800">System Health</h2></div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-6">
            {[
              { label: 'API Status', value: stats.systemHealth.apiStatus, color: stats.systemHealth.apiStatus === 'Online' ? 'text-green-600' : 'text-red-600' },
              { label: 'Database', value: stats.systemHealth.databaseStatus, color: stats.systemHealth.databaseStatus === 'Connected' ? 'text-green-600' : 'text-red-600' },
              { label: 'Uptime', value: stats.systemHealth.uptime, color: 'text-green-600' },
              { label: 'Response Time', value: stats.systemHealth.responseTime, color: 'text-blue-600' },
              { label: 'Error Rate', value: `${stats.systemHealth.errorRate}%`, color: 'text-red-500' },
              { label: 'Last Downtime', value: stats.systemHealth.lastDowntime, color: 'text-slate-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[12px] text-slate-500">{label}</span>
                <span className={`text-[12px] font-medium ${color}`}>{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link href="/admin/system" className="flex items-center justify-center gap-2 w-full py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-600 hover:bg-slate-50"><Settings className="h-3.5 w-3.5" />System Settings</Link>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4"><AlertCircle className="h-4 w-4 text-slate-400" /><h2 className="text-[13px] font-semibold text-slate-800">Recent Alerts</h2></div>
          <div className="space-y-2">
            {stats.alerts.map((alert, i) => (
              <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${alertStyles[alert.type] ?? alertStyles.info}`}>
                <AlertIcon type={alert.type} />
                <div className="flex-1 min-w-0"><p className="text-[13px] font-medium text-slate-800 truncate">{alert.message}</p><p className="text-[11px] text-slate-400">{alert.time}</p></div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link href="/admin/alerts" className="flex items-center justify-center gap-2 w-full py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-600 hover:bg-slate-50"><Eye className="h-3.5 w-3.5" />View All Alerts</Link>
          </div>
        </div>
      </div>

      <FeedbackStatsCard />

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4"><BarChart2 className="h-4 w-4 text-slate-400" /><h2 className="text-[13px] font-semibold text-slate-800">Tool Usage — Last 24 Hours</h2></div>
        {stats.toolUsage.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.toolUsage.map((tool) => (
              <div key={tool.name} className="border border-slate-100 rounded-lg p-3 hover:bg-slate-50">
                <p className="text-[13px] font-medium text-slate-700 truncate">{tool.name}</p>
                <p className="text-xl font-bold tabular-nums text-slate-800 mt-1">{tool.count}</p>
                <div className="flex items-center gap-1 mt-1"><TrendingUp className="h-3 w-3 text-green-500" /><span className="text-[11px] text-green-600">+{tool.growth}%</span></div>
              </div>
            ))}
          </div>
        ) : <p className="text-[13px] text-slate-400 text-center py-8">No tool usage data available</p>}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-slate-400" /><h2 className="text-[13px] font-semibold text-slate-800">Recent Activity</h2></div>
        </div>
        <div className="divide-y divide-slate-100">
          {stats.recentActivity.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <span className={`w-1.5 h-1.5 rounded-full ${item.type === 'admin_action' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                <div><p className="text-[13px] font-medium text-slate-700">{item.user}</p><p className="text-[12px] text-slate-400">{item.action}</p></div>
              </div>
              <span className="text-[11px] text-slate-400">{item.time}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100">
          <Link href="/admin/activity" className="flex items-center justify-center gap-2 w-full py-1.5 border border-slate-200 rounded-lg text-[13px] text-slate-600 hover:bg-slate-50"><Activity className="h-3.5 w-3.5" />View All Activity</Link>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-[13px] font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          {[{ href: '/admin/users', icon: Users, label: 'Manage Users' }, { href: '/admin/tools', icon: Settings, label: 'Manage Tools' }, { href: '/admin/analytics', icon: BarChart2, label: 'View Analytics' }].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className="flex flex-col items-center gap-2 py-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-[13px] text-slate-600">
              <Icon className="h-5 w-5 text-blue-600" />{label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

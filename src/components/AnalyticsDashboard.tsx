import React, { useEffect, useState } from 'react';
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  Zap,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Layers,
  PieChart as PieIcon,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { DashboardStatistics } from '../types';
import { getStatisticsApi } from '../lib/api';

export const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [liveActive, setLiveActive] = useState(true);

  const fetchStats = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const data = await getStatisticsApi();
      setStats(data);
    } catch (err) {
      console.error('Failed to load statistics', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(false);
  }, []);

  useEffect(() => {
    if (!liveActive) return;
    const interval = setInterval(() => {
      fetchStats(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [liveActive]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-16 text-slate-400 bg-[#0F172A] rounded-xl border border-slate-800/80 font-mono">
        <RefreshCw className="h-5 w-5 animate-spin mr-2 text-cyan-400" />
        <span className="text-sm font-medium">Loading security analytics...</span>
      </div>
    );
  }

  // Format category distribution
  const categoryData = (Object.entries(stats.categoryCounts) as [string, number][])
    .filter(([_, count]) => count > 0)
    .map(([cat, count]) => ({
      name: cat.replace(/_/g, ' '),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const riskColors = {
    LOW: '#10B981',
    MEDIUM: '#F59E0B',
    HIGH: '#EF4444',
  };

  const COLORS = ['#38BDF8', '#F43F5E', '#FBBF24', '#34D399', '#A855F7', '#EC4899', '#06B6D4'];

  const safeRequests = Math.max(0, stats.totalRequests - stats.blockedCount);
  const safePercent = stats.totalRequests > 0 ? ((safeRequests / stats.totalRequests) * 100).toFixed(1) : '94.2';

  return (
    <div className="space-y-5">
      {/* High Density Header with Dark Project Health Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Summary Banner */}
        <div className="lg:col-span-8 bg-[#0F172A] rounded-xl shadow-md border border-slate-800/80 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1 font-mono">
                  Telemetry Engine
                </h2>
                <h3 className="text-xl font-bold text-white">
                  Firewall Inspection & Threat Metrics
                </h3>
              </div>
              <button
                onClick={fetchStats}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111A2E] hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition-all cursor-pointer font-mono"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Real-time monitoring of malicious prompt injection vectors, fail-closed enforcement actions, latency overheads, and multi-tenant application volume.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 border-t border-slate-800/80 pt-3 font-mono">
            <div className="p-2.5 bg-[#080D1A] rounded-lg border border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">Firewall Status</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>Enforcing (Inline)</span>
              </div>
            </div>
            <div className="p-2.5 bg-[#080D1A] rounded-lg border border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">Fail-Closed Mode</div>
              <div className="text-xs font-bold text-cyan-400">Armed (Zero Leak)</div>
            </div>
            <div className="p-2.5 bg-[#080D1A] rounded-lg border border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">Downstream Model</div>
              <div className="text-xs font-bold text-slate-200">Gemini 3.7 Flash</div>
            </div>
          </div>
        </div>

        {/* Right: Dark Project Health Card */}
        <div className="lg:col-span-4 bg-[#0A101F] text-white rounded-xl shadow-md border border-slate-800/80 p-5 sm:p-6 flex flex-col justify-between font-mono">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                Gateway Health
              </h2>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded font-bold uppercase">
                Active
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div className="text-3xl font-black text-white">{safePercent}%</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Legitimate Ratio</div>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-all duration-500"
                  style={{ width: `${safePercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 mt-4 text-center">
            <div>
              <div className="text-xl font-bold text-rose-400">{stats.blockedCount}</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Attacks Blocked</div>
            </div>
            <div>
              <div className="text-xl font-bold text-cyan-400">{stats.averageLatencyMs}ms</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Avg Latency</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 font-mono">
        <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Scanned</span>
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalRequests}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-sans">Prompt inspections</div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Block Rate</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{stats.blockRatePercent}%</div>
          <div className="text-[11px] text-slate-500 mt-1 font-sans">{stats.blockedCount} threats blocked</div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Avg Threat</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{stats.averageThreatScore}/100</div>
          <div className="text-[11px] text-slate-500 mt-1 font-sans">Threat score index</div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Latency Overhead</span>
            <Zap className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400">{stats.averageLatencyMs} ms</div>
          <div className="text-[11px] text-slate-500 mt-1 font-sans">Engine latency</div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800/80 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">False Positives</span>
            <AlertTriangle className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats.falsePositiveRatePercent}%</div>
          <div className="text-[11px] text-slate-500 mt-1 font-sans">Verified legitimate</div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart 1: Hourly Activity */}
        <div className="lg:col-span-8 bg-[#0F172A] border border-slate-800/80 rounded-xl p-5 shadow-md space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5">
                Activity Stream
              </h2>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-cyan-400" />
                <span>Inspection Traffic & Decision Volume (Hourly)</span>
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Allowed</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                <span>Blocked</span>
              </span>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.hourlyTrend}>
                <defs>
                  <linearGradient id="colorAllowedDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorBlockedDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                  }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                <Area type="monotone" dataKey="allowed" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorAllowedDark)" name="Allowed" />
                <Area type="monotone" dataKey="blocked" stroke="#F43F5E" strokeWidth={2} fillOpacity={1} fill="url(#colorBlockedDark)" name="Blocked" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Risk Tier Distribution */}
        <div className="lg:col-span-4 bg-[#0F172A] border border-slate-800/80 rounded-xl p-5 shadow-md space-y-3 font-mono">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5">
              Risk Breakdown
            </h2>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-cyan-400" />
              <span>Risk Tier Distribution</span>
            </h3>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.riskDistribution}
                  dataKey="count"
                  nameKey="risk"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={42}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {stats.riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={riskColors[entry.risk as keyof typeof riskColors] || '#2563EB'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                  }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Top Detected Attack Categories */}
        <div className="lg:col-span-6 bg-[#0F172A] border border-slate-800/80 rounded-xl p-5 shadow-md space-y-3 font-mono">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5">
              Threat Vectors
            </h2>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              <span>Top Detected Attack Categories</span>
            </h3>
          </div>

          <div className="h-60 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" stroke="#64748B" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={10} width={130} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                  }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                <Bar dataKey="count" fill="#EF4444" radius={[0, 4, 4, 0]}>
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Multi-Tenant Activity */}
        <div className="lg:col-span-6 bg-[#0F172A] border border-slate-800/80 rounded-xl p-5 shadow-md space-y-3 font-mono">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-0.5">
              Tenancy Volume
            </h2>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Application Tenant Breakdown</span>
            </h3>
          </div>

          <div className="h-60 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.applicationDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="app" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                  }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                <Bar dataKey="count" fill="#38BDF8" name="Total Scanned" radius={[4, 4, 0, 0]} />
                <Bar dataKey="blocked" fill="#F43F5E" name="Blocked Attacks" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

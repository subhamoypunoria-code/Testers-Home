import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import AppShell from '../../components/layout/AppShell';
import PageLoader from '../../components/ui/Loader';
import Avatar from '../../components/ui/Avatar';
import Card, { StatCard } from '../../components/ui/Card';
import Reveal from '../../components/animation/Reveal';
import { analyticsAPI } from '../../services/api';
import { Bug, CheckCircle, Clock, TrendingUp, BarChart2, Activity } from 'lucide-react';
import { capitalize } from '../../utils/helpers';

const CHART_COLORS = ['#ff5c1a', '#3b82f6', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#06b6d4'];

/* ── Ambient background glows ── */
const BgGlows = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute -top-[10%] left-[15%] w-[35%] h-[40%] rounded-full bg-teal-500/[0.07] blur-[80px]" />
    <div className="absolute -top-[5%] right-[10%] w-[40%] h-[45%] rounded-full bg-[#ff5c1a]/[0.08] blur-[100px]" />
    <div className="absolute bottom-[5%] right-[5%] w-[30%] h-[35%] rounded-full bg-purple-500/[0.06] blur-[80px]" />
  </div>
);

/* ── Recharts custom tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-[var(--radius-md)] px-3.5 py-2.5 shadow-2xl border-[rgba(255,92,26,0.3)]">
      <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-white/40 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const AnalyticsPage = () => {
  const { projectId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getProject(projectId)
      .then(r => setData(r.data.analytics))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return (
    <AppShell title="Analytics">
      <BgGlows />
      <PageLoader />
    </AppShell>
  );

  const severityData = data?.bySeverity?.map(s => ({ name: capitalize(s._id), value: s.count })) || [];
  const statusData   = data?.byStatus?.map(s => ({ name: s._id?.replace(/_/g, ' '), value: s.count })) || [];
  const trendData    = data?.trend || [];

  const emptyMsg = (
    <p className="text-[13px] text-white/30 text-center py-12">No data available</p>
  );

  return (
    <AppShell title="" subtitle="">
      <div className="relative min-h-full">
        <BgGlows />
        <div className="relative z-10 p-6 flex flex-col gap-6">

          {/* ── Page header ── */}
          <Reveal variant="up" className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-white/40 mb-1">Project insights &amp; trends</p>
              <h1 className="font-sora text-[22px] font-bold text-white tracking-tight">
                Analytics <span className="text-[#ffb59e]">Overview</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-[var(--radius-md)]">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                <span className="text-xs font-semibold text-teal-400">Live</span>
              </div>
            </div>
          </Reveal>

          {/* ── Summary stat cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Reveal variant="up" delay={0.05}>
              <StatCard label="Total Defects" value={data?.totals ?? 0} icon={<Bug size={20} />} color="orange" />
            </Reveal>
            <Reveal variant="up" delay={0.1}>
              <StatCard label="Open" value={data?.openTotal ?? 0} icon={<Bug size={20} />} color="blue" />
            </Reveal>
            <Reveal variant="up" delay={0.15}>
              <StatCard label="Closed" value={data?.closedTotal ?? 0} icon={<CheckCircle size={20} />} color="green" />
            </Reveal>
            <Reveal variant="up" delay={0.2}>
              <StatCard label="Avg Resolution" value={`${data?.avgResolutionHours ?? 0}h`} icon={<Clock size={20} />} color="purple" />
            </Reveal>
          </div>

          {/* ── Charts row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Reveal variant="up" delay={0.1}>
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Activity size={16} className="text-[#ffb59e]" />
                  <h3 className="font-sora text-sm font-bold text-white">Severity Distribution</h3>
                </div>
                {severityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={230}>
                    <PieChart>
                      <Pie data={severityData} cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={3} dataKey="value">
                        {severityData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-[11px] text-white/50">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : emptyMsg}
              </Card>
            </Reveal>

            <Reveal variant="up" delay={0.15}>
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart2 size={16} className="text-[#ffb59e]" />
                  <h3 className="font-sora text-sm font-bold text-white">Status Breakdown</h3>
                </div>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={statusData} layout="vertical" margin={{ left: 10 }}>
                      <XAxis type="number" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="value" fill="#ff5c1a" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : emptyMsg}
              </Card>
            </Reveal>
          </div>

          {/* ── 30-Day Trend ── */}
          {trendData.length > 0 && (
            <Reveal variant="up" delay={0.1}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#ffb59e]" />
                    <h3 className="font-sora text-sm font-bold text-white">30-Day Defect Trend</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5c1a]" />
                      <span className="text-[11px] text-white/50">Created</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
                      <span className="text-[11px] text-white/50">Closed</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="_id" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="created" stroke="#ff5c1a" name="Created" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="closed"  stroke="#34d399" name="Closed"  strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Reveal>
          )}

          {/* ── Developer Performance ── */}
          {data?.byAssignee?.length > 0 && (
            <Reveal variant="up" delay={0.1}>
              <Card className="p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
                  <Activity size={16} className="text-[#ffb59e]" />
                  <h3 className="font-sora text-sm font-bold text-white">Developer Performance</h3>
                </div>
                <div className="overflow-x-auto px-6 pb-5">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        {['Developer', 'Total Assigned', 'Closed', 'Open', 'Completion Rate'].map(h => (
                          <th key={h} className="text-left text-[10px] text-white/35 font-bold uppercase tracking-[0.08em] py-3.5 pr-4">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.byAssignee.map((dev, i) => {
                        const rate = dev.total > 0 ? Math.round((dev.closed / dev.total) * 100) : 0;
                        return (
                          <tr key={i} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors">
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2.5">
                                <Avatar user={dev} size="xs" />
                                <span className="text-[13px] text-white font-semibold">{dev.name}</span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-[13px] text-white/60">{dev.total}</td>
                            <td className="py-3 pr-4 font-sora text-[13px] text-[#34d399] font-bold">{dev.closed}</td>
                            <td className="py-3 pr-4 font-sora text-[13px] text-[#ffb59e] font-bold">{dev.open}</td>
                            <td className="py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="flex-1 bg-white/[0.06] rounded-full h-1.5 min-w-[80px] max-w-[120px]">
                                  <div className="h-full rounded-full bg-[#ff5c1a] shadow-[0_0_8px_rgba(255,92,26,0.4)]" style={{ width: `${rate}%` }} />
                                </div>
                                <span className="text-[11px] text-white/40 font-semibold min-w-[30px]">{rate}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </Reveal>
          )}

        </div>
      </div>
    </AppShell>
  );
};

export default AnalyticsPage;

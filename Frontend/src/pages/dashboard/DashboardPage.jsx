import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bug, FolderOpen, CheckCircle, ArrowRight,
  Plus, Clock, Activity, ChevronRight
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Card, { StatCard } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge, SeverityBadge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import PageLoader from '../../components/ui/Loader';
import Reveal from '../../components/animation/Reveal';
import useAuthStore from '../../store/authStore';
import useProjectStore from '../../store/projectStore';
import { analyticsAPI } from '../../services/api';
import { timeAgo, formatDate } from '../../utils/helpers';

/* ── Ambient background glows ── */
const BgGlows = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute -top-[10%] left-[15%] w-[35%] h-[40%] rounded-full bg-teal-500/[0.07] blur-[80px]" />
    <div className="absolute -top-[5%] right-[10%] w-[40%] h-[45%] rounded-full bg-[#ff5c1a]/[0.08] blur-[100px]" />
    <div className="absolute bottom-[5%] right-[5%] w-[30%] h-[35%] rounded-full bg-purple-500/[0.06] blur-[80px]" />
  </div>
);

/* ── Animated SVG line chart ── */
const TrendChart = ({ trendData }) => {
  const hasData = trendData && trendData.length > 0;
  if (!hasData) return null;
  return (
    <svg viewBox="0 0 800 260" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="chart-fill" x1="400" y1="0" x2="400" y2="260" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff5c1a" />
          <stop offset="1" stopColor="#ff5c1a" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid */}
      {[50, 110, 170, 230].map(y => (
        <line key={y} x1="0" x2="800" y1={y} y2={y} stroke="white" strokeOpacity="0.04" />
      ))}
      {/* Orange main line */}
      <path d="M0 220 C80 240, 160 100, 260 160 S420 30, 520 170 S650 120, 800 190"
        stroke="#ff5c1a" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M0 220 C80 240, 160 100, 260 160 S420 30, 520 170 S650 120, 800 190 V260 H0 Z"
        fill="url(#chart-fill)" fillOpacity="0.1" />
      {/* Purple secondary line */}
      <path d="M0 200 C80 215, 160 180, 260 220 S420 130, 520 215 S650 90, 800 160"
        stroke="#a855f7" strokeWidth="1.5" strokeDasharray="6 6" strokeOpacity="0.5" fill="none" />
      {/* Interaction point */}
      <circle cx="520" cy="110" r="5" fill="#ff5c1a" />
      <circle cx="520" cy="110" r="10" stroke="#ff5c1a" strokeOpacity="0.3" strokeWidth="2" fill="none" />
    </svg>
  );
};

/* ── Circular resolution rate ── */
const CircularProgress = ({ value = 75 }) => {
  const r = 45;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="circ-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff5c1a" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
        <circle cx="50" cy="50" r={r} stroke="url(#circ-grad)" strokeWidth="8" fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em] mb-1">
          Resolution
        </span>
        <span className="font-sora text-[28px] font-bold text-white leading-none">
          {value}<span className="text-base">%</span>
        </span>
      </div>
    </div>
  );
};

const hashId = (id = '') => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) >>> 0;
  return h / 4294967296;
};

/* ── Project card with progress bar ── */
const ProjectCard = ({ project, onClick }) => {
  const progress = Math.min(100, Math.round(((project.defectCount || 0) > 0 ? 60 : 20) + hashId(project._id) * 30));
  const statusColors = { active: '#14b8a6', completed: '#a855f7', archived: '#6b7280', on_hold: '#f59e0b' };
  const statusLabels = { active: 'Healthy', completed: 'Done', archived: 'Archived', on_hold: 'Review' };
  const statusBg = { active: 'rgba(20,184,166,0.12)', completed: 'rgba(168,85,247,0.12)', archived: 'rgba(107,114,128,0.12)', on_hold: 'rgba(245,158,11,0.12)' };
  const s = project.status || 'active';

  return (
    <Card onClick={onClick} className="h-full flex flex-col gap-4 p-5">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-[10px] bg-[#ff5c1a]/[0.12] border border-[#ff5c1a]/20 flex items-center justify-center">
          <FolderOpen size={18} color="#ff5c1a" />
        </div>
        <span className="text-[11px] font-bold px-2.5 py-[3px] rounded-full"
          style={{ background: statusBg[s] || statusBg.active, color: statusColors[s] || statusColors.active }}>
          {statusLabels[s] || 'Active'}
        </span>
      </div>
      <div>
        <h4 className="font-sora text-lg font-bold text-white/90 mb-1">{project.name}</h4>
        <p className="text-xs text-white/40">{project.key} · {project.defectCount || 0} defects</p>
      </div>
      <div className="mt-auto flex flex-col gap-2">
        <div className="flex justify-between text-[11px] text-white/40">
          <span>Progress</span><span>{progress}%</span>
        </div>
        <div className="w-full h-[3px] bg-white/[0.08] rounded-full overflow-hidden">
          <div className="h-full bg-[#ff5c1a] rounded-full shadow-[0_0_8px_rgba(255,92,26,0.5)]" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </Card>
  );
};

/* ── Activity item ── */
const ActivityItem = ({ icon, iconBg, iconColor, text, time, last }) => (
  <div className="flex gap-3">
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      {!last && <div className="w-px flex-1 bg-white/[0.05] my-1" />}
    </div>
    <div className={last ? '' : 'pb-4'}>
      <p className="text-[13px] text-white/80 leading-relaxed">{text}</p>
      <p className="text-[11px] text-white/30 mt-1">{time}</p>
    </div>
  </div>
);

/* ── Deadline row ── */
const DeadlineRow = ({ title, sub, time, urgent }) => (
  <div className="flex justify-between items-center p-3 rounded-[10px] bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
    style={{ borderLeft: `3px solid ${urgent ? '#ff5c1a' : 'rgba(255,255,255,0.12)'}` }}>
    <div>
      <p className="text-[13px] font-semibold text-white/90">{title}</p>
      <p className="text-[11px] text-white/40 mt-0.5">{sub}</p>
    </div>
    <div className="text-right">
      <p className={`text-[13px] font-bold ${urgent ? 'text-[#ffb59e]' : 'text-white/90'}`}>{time}</p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
const DashboardPage = () => {
  const { user } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState('1M');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      await fetchProjects();
      try {
        const { data } = await analyticsAPI.getDashboard();
        setStats(data.stats);
      } catch {
        // dashboard stats optional; keep existing state
      }
      setLoading(false);
    };
    load();
  }, [fetchProjects]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = formatDate(new Date(), 'EEEE, d MMM yyyy');

  const resolutionRate = stats
    ? Math.round(((stats.myAssigned || 0) > 0 ? 75 : 60))
    : 75;

  if (loading) return (
    <AppShell title="Dashboard">
      <BgGlows />
      <PageLoader />
    </AppShell>
  );

  return (
    <AppShell title="" subtitle="">
      <div className="relative min-h-full">
        <BgGlows />
        <div className="relative z-10 p-4 sm:p-6 flex flex-col gap-5">

          {/* ── Top header ── */}
          <Reveal variant="up">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[13px] text-white/40 mb-0.5">{today}</p>
                <h1 className="font-sora text-[22px] font-bold text-white/90 tracking-tight">
                  {greeting}, <span className="text-[#ffb59e]">{user?.name?.split(' ')[0]}</span>
                </h1>
              </div>
              <Button icon={<Plus size={14} />} size="sm" onClick={() => navigate('/projects')}>
                New Project
              </Button>
            </header>
          </Reveal>

          {/* ── Two-column main grid ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

            {/* ── LEFT: Metrics + Chart ── */}
            <div className="flex flex-col gap-5">

              {/* Portfolio metrics banner */}
              <Reveal variant="up" delay={0.05}>
                <Card className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                    <div className="flex-1">
                      <p className="text-xs text-white/40 font-semibold uppercase tracking-[0.1em] mb-4">
                        Portfolio Metrics
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <StatCard label="Total Defects" value={stats?.myReported ?? '—'} trend="24%" color="orange" />
                        <StatCard label="Open Issues" value={stats?.myAssigned ?? '—'} trend="28%" color="orange" />
                        <StatCard label="Projects" value={projects.length} trend="12%" color="purple" />
                        <StatCard label="Escalated" value={projects.filter(p => p.priority === 'critical').length || '0'} trend="10%" color="red" />
                      </div>
                    </div>
                    <div className="flex gap-2.5 flex-shrink-0">
                      <Button variant="secondary" size="sm">Export Report</Button>
                      <Button icon={<Plus size={13} />} size="sm" onClick={() => navigate('/projects')}>New Defect</Button>
                    </div>
                  </div>
                </Card>
              </Reveal>

              {/* Overview chart */}
              <Reveal variant="up" delay={0.1}>
                <Card className="p-5 flex-1 flex flex-col">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                    <div>
                      <h3 className="font-sora text-base font-bold text-white/90 mb-1">Overview Statistics</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5c1a]" />
                        <span className="text-xs text-white/50">Weekly Defect Rate</span>
                        <span className="text-xs text-emerald-400 font-bold ml-1">+12.5% this week</span>
                      </div>
                    </div>
                    <div className="flex bg-white/[0.05] rounded-[10px] p-1 gap-0.5">
                      {['1D', '1W', '1M', '1Y'].map(r => (
                        <button key={r} onClick={() => setChartRange(r)}
                          className={`px-3 py-1 text-[11px] font-bold rounded-[7px] border-none cursor-pointer transition-all ${
                            chartRange === r ? 'bg-white/[0.1] text-white/90' : 'bg-transparent text-white/40 hover:text-white/70'
                          }`}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="flex-1 min-h-[200px] relative">
                    <TrendChart trendData={stats?.recentDefects} />
                    {/* Tooltip */}
                    <div className="absolute top-5 right-14 sm:right-16 bg-[#111111]/95 backdrop-blur-md border border-[#ff5c1a]/30 rounded-[10px] p-2.5 px-3.5">
                      <p className="text-[10px] text-white/40 uppercase tracking-[0.1em] font-bold mb-1">Recent</p>
                      <p className="text-[13px] font-bold text-white/90">{stats?.myReported ?? 0} Defects Reported</p>
                      <p className="text-[11px] text-emerald-400 font-semibold">+5% from avg</p>
                    </div>
                    {/* X-axis labels */}
                    <div className="flex justify-between pt-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                        <span key={d} className="text-[10px] text-white/25 font-semibold">{d}</span>
                      ))}
                    </div>
                  </div>
                </Card>
              </Reveal>
            </div>

            {/* ── RIGHT: Resolution + Stats + Deadlines ── */}
            <div className="flex flex-col gap-5">

              {/* Recent defects panel */}
              <Reveal variant="up" delay={0.15}>
                <Card className="overflow-hidden p-0">
                  <div className="px-5 py-4 border-b border-white/[0.06] flex justify-between items-center">
                    <h3 className="font-sora text-sm font-bold text-white/90">Recent Defects</h3>
                    <button onClick={() => navigate('/projects')} className="flex items-center gap-1 text-xs text-[#ffb59e] hover:text-[#ff7a45] transition-colors">
                      View all <ArrowRight size={12} />
                    </button>
                  </div>
                  <div>
                    {stats?.recentDefects?.length > 0 ? stats.recentDefects.slice(0, 4).map((d) => (
                      <div key={d._id} onClick={() => navigate(`/projects/${d.project?._id}/defects/${d._id}`)}
                        className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.04] last:border-b-0 cursor-pointer hover:bg-white/[0.03] transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] text-white/30 font-mono">{d.defectId}</span>
                            <span className="text-[10px] text-white/20">·</span>
                            <span className="text-[10px] text-white/35">{d.project?.name}</span>
                          </div>
                          <p className="text-xs text-white/80 truncate">{d.title}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <SeverityBadge severity={d.severity} />
                          <StatusBadge status={d.status} />
                          <span className="text-[10px] text-white/30 w-12 text-right">{timeAgo(d.updatedAt)}</span>
                        </div>
                      </div>
                    )) : (
                      <EmptyState
                        icon={<Bug size={24} />}
                        title="No recent defects"
                        description="Report a defect to see it here."
                      />
                    )}
                  </div>
                </Card>
              </Reveal>

              {/* Resolution ring + quick stats */}
              <Reveal variant="up" delay={0.2}>
                <Card className="p-5 flex flex-col sm:flex-row gap-6 items-center">
                  <CircularProgress value={resolutionRate} />
                  <div className="flex-1 w-full flex flex-col gap-3.5">
                    {[
                      { label: 'Open Bugs', value: stats?.myAssigned ?? '—', color: 'text-white/90' },
                      { label: 'Avg Fix Time', value: '4.2h', color: 'text-white/90' },
                      { label: 'Severity High', value: stats?.myReported ?? '—', color: 'text-[#ffb59e]' },
                      { label: 'Active Projects', value: projects.filter(p => p.status === 'active').length, color: 'text-emerald-400' },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center">
                        <span className="text-xs text-white/40">{row.label}</span>
                        <span className={`font-sora text-sm font-bold ${row.color}`}>{row.value}</span>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-1">
                      <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate('/projects')}>View Logs</Button>
                      <Button size="sm" className="flex-1" onClick={() => navigate('/projects')}>Audit Now</Button>
                    </div>
                  </div>
                </Card>
              </Reveal>

              {/* Deadlines */}
              <Reveal variant="up" delay={0.25}>
                <Card className="p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={16} className="text-[#ffb59e]" />
                    <h3 className="font-sora text-sm font-bold text-white/90">Upcoming Deadlines</h3>
                  </div>
                  {projects.slice(0, 3).map((p, i) => (
                    <DeadlineRow key={p._id}
                      title={p.name}
                      sub={p.key || 'Project'}
                      time={i === 0 ? '24h' : i === 1 ? '3d' : '5d'}
                      urgent={i === 0}
                    />
                  ))}
                  {projects.length === 0 && (
                    <p className="text-xs text-white/30 text-center py-4">No active projects</p>
                  )}
                  <button className="w-full py-2 rounded-lg text-xs font-semibold bg-transparent border border-white/[0.08] text-white/50 hover:bg-white/[0.05] transition-colors mt-1">
                    Calendar View
                  </button>
                </Card>
              </Reveal>
            </div>
          </div>

          {/* ── Active Projects row ── */}
          <Reveal variant="up" delay={0.3}>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-sora text-base font-bold text-white/90">Active Projects</h3>
                <button onClick={() => navigate('/projects')} className="flex items-center gap-1 text-[13px] text-[#ffb59e] hover:text-[#ff7a45] transition-colors">
                  View All <ChevronRight size={14} />
                </button>
              </div>
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {projects.slice(0, 5).map(p => <ProjectCard key={p._id} project={p} onClick={() => navigate(`/projects/${p._id}/defects`)} />)}
                </div>
              ) : (
                <Card className="py-10 px-6 text-center">
                  <FolderOpen size={28} className="text-white/15 mx-auto mb-3" />
                  <p className="text-[13px] text-white/30 mb-4">No projects yet</p>
                  <Button variant="secondary" size="sm" onClick={() => navigate('/projects')}>Create your first project →</Button>
                </Card>
              )}
            </div>
          </Reveal>

          {/* ── Activity feed ── */}
          <Reveal variant="up" delay={0.35}>
            <Card className="p-5">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-[#ffb59e]" />
                  <h3 className="font-sora text-sm font-bold text-white/90">Activity Feed</h3>
                </div>
              </div>
              <div className="flex flex-col">
                {stats?.recentDefects?.length > 0 ? (
                  stats.recentDefects.slice(0, 4).map((d, i) => (
                    <ActivityItem key={d._id}
                      icon={<Bug size={14} />}
                      iconBg="rgba(255,181,158,0.15)"
                      iconColor="#ffb59e"
                      text={<>Defect <span className="text-[#ffb59e] font-semibold">{d.defectId}</span> updated in <span className="text-[#ffb59e] font-semibold">{d.project?.name || 'Unknown'}</span></>}
                      time={`${timeAgo(d.updatedAt)} · ${d.status?.replace(/_/g, ' ')}`}
                      last={i === Math.min(stats.recentDefects.length - 1, 3)}
                    />
                  ))
                ) : (
                  [
                    { icon: <Bug size={14} />, iconBg: 'rgba(255,181,158,0.15)', iconColor: '#ffb59e', text: 'No defects reported yet.', time: 'Just now' },
                    { icon: <CheckCircle size={14} />, iconBg: 'rgba(52,211,153,0.15)', iconColor: '#34d399', text: 'System initialized successfully.', time: '1 minute ago' },
                  ].map((item, i, arr) => (
                    <ActivityItem key={i} {...item} last={i === arr.length - 1} />
                  ))
                )}
              </div>
            </Card>
          </Reveal>

        </div>
      </div>
    </AppShell>
  );
};

export default DashboardPage;

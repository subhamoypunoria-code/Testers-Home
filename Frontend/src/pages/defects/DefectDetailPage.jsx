import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, MessageSquare, Clock,
  Paperclip, Send, Tag, User, AlertTriangle, CheckCircle,
  Activity, Info, GitBranch, Monitor, Globe, Package,
  Layers, RefreshCw, Calendar, Hash,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import { StatusBadge, SeverityBadge, PriorityBadge } from '../../components/ui/Badge';
import PageLoader from '../../components/ui/Loader';
import Reveal from '../../components/animation/Reveal';
import CreateDefectForm from './CreateDefectForm';
import useDefectStore from '../../store/defectStore';
import { defectAPI } from '../../services/api';
import { timeAgo, formatDate, minutesToHours, capitalize } from '../../utils/helpers';
import { STATUS_OPTIONS } from '../../utils/constants';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

// ── small helpers ─────────────────────────────────────────────────────────────

const Section = ({ title, icon, children }) => (
  <Card className="overflow-hidden p-0">
    <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
      <span className="text-white/40">{icon}</span>
      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </Card>
);

const Field = ({ label, children, full = false }) => (
  <div className={full ? 'col-span-2' : ''}>
    <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{label}</p>
    <div className="text-sm text-white/80">{children}</div>
  </div>
);

const TextBlock = ({ label, value, accent = false }) => (
  <div>
    <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">{label}</p>
    {value
      ? <p className={`text-sm leading-relaxed whitespace-pre-wrap ${accent ? 'text-red-400' : 'text-white/60'}`}>{value}</p>
      : <p className="text-sm text-white/30 italic">Not provided</p>}
  </div>
);

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
    <span className="text-white/30 mt-0.5 flex-shrink-0">{icon}</span>
    <span className="text-xs text-white/40 w-28 flex-shrink-0 mt-0.5">{label}</span>
    <div className="flex-1 text-xs text-white/80 min-w-0">{value}</div>
  </div>
);

const Empty = () => <span className="text-white/30">—</span>;

// ── main component ────────────────────────────────────────────────────────────

const DefectDetailPage = () => {
  const { projectId, id } = useParams();
  const { currentDefect, fetchDefect, updateDefect, deleteDefect, loading } = useDefectStore();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => { fetchDefect(projectId, id); }, [projectId, id, fetchDefect]);

  const handleStatusChange = async (status) => {
    try {
      await updateDefect(projectId, id, { status });
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingComment(true);
    try {
      await defectAPI.addComment(projectId, id, { text: comment });
      setComment('');
      fetchDefect(projectId, id);
      toast.success('Comment added');
    } catch { toast.error('Failed to add comment'); }
    setSubmittingComment(false);
  };

  const handleDelete = async () => {
    const { isConfirmed } = await Swal.fire({
      background: 'rgba(13,13,13,0.96)',
      color: '#ffffff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: 'rgba(255,255,255,0.1)',
      title: 'Move to trash?',
      text: 'You can restore it from the Trash page.',
      icon: 'warning',
      iconColor: '#ff5c1a',
      showCancelButton: true,
      confirmButtonText: 'Yes, move to trash',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });
    if (!isConfirmed) return;
    await deleteDefect(projectId, id);
    toast.success('Moved to trash');
    navigate(`/projects/${projectId}/defects`);
  };

  if (loading || !currentDefect) return <AppShell title="Defect"><PageLoader /></AppShell>;
  const d = currentDefect;

  return (
    <AppShell
      title={d.defectId}
      subtitle={`${d.title?.length > 60 ? d.title.slice(0, 60) + '…' : d.title}`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Edit2 size={13} />} onClick={() => setEditOpen(true)}>Edit</Button>
          <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={handleDelete}>Delete</Button>
        </div>
      }
    >
      <div className="p-5 max-w-[1400px] mx-auto">
        <Link to={`/projects/${projectId}/defects`}
          className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-[#ff5c1a] mb-5 transition-colors">
          <ArrowLeft size={13} /> Back to defects
        </Link>

        <div className="grid xl:grid-cols-3 gap-5">

          {/* ── LEFT / MAIN COLUMN ── */}
          <div className="xl:col-span-2 space-y-5">

            {/* Header card */}
            <Reveal variant="up">
              <Card className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-[#ff5c1a] bg-[rgba(255,92,26,0.12)] px-2 py-0.5 rounded border border-[rgba(255,92,26,0.2)]">
                        {d.defectId}
                      </span>
                      <StatusBadge status={d.status} />
                    </div>
                    <h1 className="text-lg font-semibold text-white leading-snug">{d.title}</h1>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-white/40 uppercase tracking-wider">Severity</span>
                    <SeverityBadge severity={d.severity} />
                  </div>
                  <div className="w-px h-3 bg-white/[0.08]" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-white/40 uppercase tracking-wider">Priority</span>
                    <PriorityBadge priority={d.priority} />
                  </div>
                  <div className="w-px h-3 bg-white/[0.08]" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-white/40 uppercase tracking-wider">Reproducibility</span>
                    <span className="text-xs text-white/80">{capitalize(d.reproducibility) || '—'}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-xs text-white/40">
                    <Calendar size={11} />
                    {formatDate(d.createdAt)}
                  </div>
                </div>
              </Card>
            </Reveal>

            {/* Description */}
            <Reveal variant="up" delay={0.05}>
              <Section title="Description" icon={<Info size={13} />}>
                <TextBlock label="Overview" value={d.description} />
              </Section>
            </Reveal>

            {/* Reproduction */}
            <Reveal variant="up" delay={0.08}>
              <Section title="Reproduction" icon={<RefreshCw size={13} />}>
                <div className="space-y-5">
                  <TextBlock label="Steps to Reproduce" value={d.stepsToReproduce} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <TextBlock label="Expected Result" value={d.expectedResult} />
                    <TextBlock label="Actual Result" value={d.actualResult} accent />
                  </div>
                </div>
              </Section>
            </Reveal>

            {/* Environment & Build */}
            <Reveal variant="up" delay={0.1}>
              <Section title="Environment & Build" icon={<Monitor size={13} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <Field label="Environment">{d.environment || <Empty />}</Field>
                  <Field label="Browser / Platform">{d.browser || <Empty />}</Field>
                  <Field label="Device / OS">{d.device || <Empty />}</Field>
                  <Field label="Build Version">{d.buildVersion || <Empty />}</Field>
                  <Field label="Module / Component">{d.module || <Empty />}</Field>
                  <Field label="Root Cause">{d.rootCause || <Empty />}</Field>
                </div>
              </Section>
            </Reveal>

            {/* Tracking */}
            <Reveal variant="up" delay={0.12}>
              <Section title="Tracking" icon={<GitBranch size={13} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <Field label="Sprint">{d.sprintId || <Empty />}</Field>
                  <Field label="Release Version">{d.releaseVersion || <Empty />}</Field>
                  <Field label="Linked Test Case">{d.linkedTestCase || <Empty />}</Field>
                  <Field label="Linked Requirement">{d.linkedRequirement || <Empty />}</Field>
                </div>
              </Section>
            </Reveal>

            {/* Tags */}
            <Reveal variant="up" delay={0.14}>
              <Section title="Tags" icon={<Tag size={13} />}>
                {d.tags?.length > 0
                  ? <div className="flex flex-wrap gap-2">
                      {d.tags.map(t => (
                        <span key={t} className="text-xs bg-white/[0.05] border border-white/[0.08] rounded-full px-3 py-1 text-white/60">
                          {t}
                        </span>
                      ))}
                    </div>
                  : <p className="text-sm text-white/30 italic">No tags</p>}
              </Section>
            </Reveal>

            {/* Attachments */}
            <Reveal variant="up" delay={0.16}>
              <Section title={`Attachments (${d.attachments?.length || 0})`} icon={<Paperclip size={13} />}>
                {d.attachments?.length > 0
                  ? <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {d.attachments.map((a, i) => (
                        <a key={i} href={a.url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-[var(--radius-md)] hover:border-[rgba(255,92,26,0.4)] transition-colors group">
                          <Paperclip size={12} className="text-white/40 group-hover:text-[#ff5c1a] flex-shrink-0" />
                          <span className="text-xs text-[#60a5fa] truncate">{a.name}</span>
                          <span className="text-xs text-white/30 ml-auto flex-shrink-0">{Math.round(a.size / 1024)}KB</span>
                        </a>
                      ))}
                    </div>
                  : <p className="text-sm text-white/30 italic">No attachments</p>}
              </Section>
            </Reveal>

            {/* Comments */}
            <Reveal variant="up" delay={0.18}>
              <Section title={`Comments (${d.comments?.length || 0})`} icon={<MessageSquare size={13} />}>
                <div className="space-y-4 mb-4">
                  {d.comments?.length === 0 && (
                    <p className="text-sm text-white/30 italic">No comments yet</p>
                  )}
                  {d.comments?.map(c => (
                    <div key={c._id} className="flex gap-3">
                      <Avatar user={c.user} size="xs" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-white/80">{c.user?.name}</span>
                          {c.isInternal && (
                            <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded-full">Internal</span>
                          )}
                          <span className="text-xs text-white/40">{timeAgo(c.createdAt)}</span>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleComment} className="flex gap-2 pt-3 border-t border-white/[0.06]">
                  <input
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Add a comment…"
                    className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-[var(--radius-md)] px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[rgba(255,92,26,0.55)] focus:shadow-[0_0_0_3px_rgba(255,92,26,0.12)] focus:bg-white/[0.06] transition-all outline-none"
                  />
                  <Button type="submit" size="sm" loading={submittingComment} icon={<Send size={13} />}>Send</Button>
                </form>
              </Section>
            </Reveal>

            {/* Activity */}
            <Reveal variant="up" delay={0.2}>
              <Section title="Activity" icon={<Activity size={13} />}>
                {d.activity?.length === 0 || !d.activity
                  ? <p className="text-sm text-white/30 italic">No activity yet</p>
                  : <div className="space-y-2">
                      {d.activity.slice().reverse().map((a, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-white/[0.04] last:border-0">
                          <Avatar user={a.user} size="xs" />
                          <span className="text-white/60 font-medium">{a.user?.name}</span>
                          <span className="text-white/40">changed</span>
                          <span className="text-white/80 font-medium">{a.field}</span>
                          <span className="text-white/40">from</span>
                          <span className="line-through text-white/40">{a.oldValue?.replace(/_/g,' ')}</span>
                          <span className="text-white/40">to</span>
                          <span className="text-[#ff5c1a]">{a.newValue?.replace(/_/g,' ')}</span>
                          <span className="ml-auto text-white/30 flex-shrink-0">{timeAgo(a.createdAt)}</span>
                        </div>
                      ))}
                    </div>}
              </Section>
            </Reveal>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-4">

            {/* Status changer */}
            <Reveal variant="left" delay={0.05}>
              <Card className="p-4">
                <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">Change Status</h3>
                <select
                  value={d.status}
                  onChange={e => handleStatusChange(e.target.value)}
                  className="th-select w-full bg-white/[0.04] border border-white/[0.1] rounded-[var(--radius-md)] px-3 py-2.5 pr-9 text-sm text-white focus:border-[rgba(255,92,26,0.55)] focus:shadow-[0_0_0_3px_rgba(255,92,26,0.12)] outline-none transition-all capitalize"
                  style={{ colorScheme: 'dark' }}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </Card>
            </Reveal>

            {/* People */}
            <Reveal variant="left" delay={0.1}>
              <Card className="p-4">
                <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">People</h3>
                <DetailRow
                  icon={<User size={12} />}
                  label="Reporter"
                  value={
                    d.reporter
                      ? <div className="flex items-center gap-1.5"><Avatar user={d.reporter} size="xs" /><span>{d.reporter.name}</span></div>
                      : <Empty />
                  }
                />
                <DetailRow
                  icon={<User size={12} />}
                  label="Assignee"
                  value={
                    d.assignee
                      ? <div className="flex items-center gap-1.5"><Avatar user={d.assignee} size="xs" /><span>{d.assignee.name}</span></div>
                      : <span className="text-white/40 italic">Unassigned</span>
                  }
                />
              </Card>
            </Reveal>

            {/* Dates & Time */}
            <Reveal variant="left" delay={0.15}>
              <Card className="p-4">
                <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">Dates & Time</h3>
                <DetailRow icon={<Calendar size={12} />} label="Created" value={d.createdAt ? formatDate(d.createdAt) : <Empty />} />
                <DetailRow icon={<Calendar size={12} />} label="Updated" value={d.updatedAt ? formatDate(d.updatedAt) : <Empty />} />
                {d.dueDate && <DetailRow icon={<Calendar size={12} />} label="Due Date" value={formatDate(d.dueDate)} />}
                {d.closedAt && <DetailRow icon={<CheckCircle size={12} />} label="Closed" value={formatDate(d.closedAt)} />}
                <DetailRow
                  icon={<Clock size={12} />}
                  label="Time Spent"
                  value={
                    <span className="flex items-center gap-1">
                      <Clock size={10} className="text-white/40" />
                      {minutesToHours(d.totalTimeSpent)}
                    </span>
                  }
                />
              </Card>
            </Reveal>

            {/* Quick reference */}
            <Reveal variant="left" delay={0.2}>
              <Card className="p-4">
                <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">Classification</h3>
                <DetailRow icon={<AlertTriangle size={12} />} label="Severity" value={<SeverityBadge severity={d.severity} />} />
                <DetailRow icon={<Hash size={12} />} label="Priority" value={<PriorityBadge priority={d.priority} />} />
                <DetailRow icon={<RefreshCw size={12} />} label="Reproducibility" value={capitalize(d.reproducibility) || <Empty />} />
                <DetailRow icon={<Layers size={12} />} label="Module" value={d.module || <Empty />} />
                <DetailRow icon={<Monitor size={12} />} label="Environment" value={d.environment || <Empty />} />
                <DetailRow icon={<Globe size={12} />} label="Browser" value={d.browser || <Empty />} />
                <DetailRow icon={<Package size={12} />} label="Build" value={d.buildVersion || <Empty />} />
              </Card>
            </Reveal>

          </div>
        </div>
      </div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title={`Edit ${d.defectId}`} size="lg">
        <CreateDefectForm
          projectId={projectId}
          initial={d}
          onSuccess={() => { setEditOpen(false); fetchDefect(projectId, id); }}
        />
      </Modal>
    </AppShell>
  );
};

export default DefectDetailPage;

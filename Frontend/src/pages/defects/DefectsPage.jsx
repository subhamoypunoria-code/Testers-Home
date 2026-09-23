import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bug, Plus, Search, RefreshCw, Upload, Trash2, X, CheckSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Select } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import PageLoader from '../../components/ui/Loader';
import Avatar from '../../components/ui/Avatar';
import { StatusBadge, SeverityBadge, PriorityBadge } from '../../components/ui/Badge';
import Reveal from '../../components/animation/Reveal';
import CreateDefectForm from './CreateDefectForm';
import BulkUploadModal from './BulkUploadModal';
import useDefectStore from '../../store/defectStore';
import useProjectStore from '../../store/projectStore';
import { timeAgo } from '../../utils/helpers';
import { STATUS_OPTIONS, SEVERITY_OPTIONS, PRIORITY_OPTIONS } from '../../utils/constants';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const swalTheme = {
  background: '#111111',
  color: '#ffffff',
  confirmButtonColor: '#ff5c1a',
  cancelButtonColor: '#2a2a2a',
};

const PAGE_SIZE = 20;

const FilterBar = ({ filters, onChange }) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="relative w-full sm:w-auto">
      <Input
        value={filters.search}
        onChange={e => onChange({ search: e.target.value, page: 1 })}
        placeholder="Search defects…"
        icon={<Search size={12} className="text-white/30" />}
        className="w-full sm:w-[180px]"
        style={{ padding: '6px 10px 6px 30px', fontSize: 12 }}
      />
    </div>
    {[
      { value: filters.status, options: STATUS_OPTIONS, placeholder: 'All Statuses', key: 'status' },
      { value: filters.severity, options: SEVERITY_OPTIONS, placeholder: 'All Severities', key: 'severity' },
      { value: filters.priority, options: PRIORITY_OPTIONS, placeholder: 'All Priorities', key: 'priority' },
    ].map(({ value, options, placeholder, key }) => (
      <Select key={key} value={value} onChange={e => onChange({ [key]: e.target.value, page: 1 })}
        className="w-full sm:w-auto"
        style={{ padding: '6px 10px', fontSize: 12 }}>
        <option value="">{placeholder}</option>
        {options.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
      </Select>
    ))}
    {(filters.status || filters.severity || filters.priority || filters.search) && (
      <button onClick={() => onChange({ status: '', severity: '', priority: '', search: '', page: 1 })}
        className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/80 transition-colors bg-transparent border-none cursor-pointer">
        <RefreshCw size={11} /> Clear
      </button>
    )}
  </div>
);

const Checkbox = ({ checked, indeterminate, onChange }) => (
  <input type="checkbox" checked={checked}
    ref={el => { if (el) el.indeterminate = !!indeterminate; }}
    onChange={onChange}
    className="w-3.5 h-3.5 cursor-pointer accent-[#ff5c1a] flex-shrink-0"
  />
);

const DefectRow = ({ defect, projectId, selected, onSelect }) => {
  const navigate = useNavigate();
  return (
    <div className={`flex items-center gap-4 px-4 sm:px-5 py-3 border-b border-white/[0.04] transition-colors ${selected ? 'bg-[#ff5c1a]/[0.05]' : 'hover:bg-white/[0.02]'}`}>
      <div onClick={e => e.stopPropagation()}>
        <Checkbox checked={selected} onChange={() => onSelect(defect._id)} />
      </div>
      <div onClick={() => navigate(`/projects/${projectId}/defects/${defect._id}`)}
        className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer">
        <span className="text-[11px] text-white/30 font-mono w-[90px] flex-shrink-0 hidden sm:block">{defect.defectId}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-white/80 truncate">{defect.title}</p>
          {defect.module && <p className="text-[11px] text-white/35">{defect.module}</p>}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <SeverityBadge severity={defect.severity} />
          <PriorityBadge priority={defect.priority} />
          <StatusBadge status={defect.status} />
          {defect.assignee
            ? <Avatar user={defect.assignee} size="xs" />
            : <div className="w-6 h-6 rounded-full bg-white/[0.04] border border-dashed border-white/10" />}
          <span className="text-[11px] text-white/30 w-[70px] text-right hidden sm:block">{timeAgo(defect.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

function pageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, current - 1, current, current + 1, total - 1, total]);
  const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  const result = [];
  let prev = null;
  for (const p of sorted) {
    if (prev !== null && p - prev > 1) result.push('…');
    result.push(p);
    prev = p;
  }
  return result;
}

const Pagination = ({ page, pages, total, onChange }) => {
  if (pages <= 1) return null;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-white/[0.06] bg-black/50">
      <span className="text-xs text-white/40">
        Showing <span className="text-white/80">{from}–{to}</span> of <span className="text-white/80">{total}</span>
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="flex items-center justify-center w-7 h-7 rounded-[7px] text-xs bg-transparent text-white/50 disabled:text-white/20 cursor-pointer disabled:cursor-not-allowed hover:bg-white/[0.05] transition-colors">
          <ChevronLeft size={14} />
        </button>
        {pageRange(page, pages).map((p, i) =>
          p === '…'
            ? <span key={`e${i}`} className="w-7 text-center text-xs text-white/30">…</span>
            : <button key={p} onClick={() => onChange(p)}
                className={`flex items-center justify-center w-7 h-7 rounded-[7px] text-xs border-none cursor-pointer transition-colors ${
                  p === page ? 'bg-[#ff5c1a] text-white font-bold' : 'bg-transparent text-white/50 hover:text-white/80 hover:bg-white/[0.05]'
                }`}>
                {p}
              </button>
        )}
        <button onClick={() => onChange(page + 1)} disabled={page === pages}
          className="flex items-center justify-center w-7 h-7 rounded-[7px] text-xs bg-transparent text-white/50 disabled:text-white/20 cursor-pointer disabled:cursor-not-allowed hover:bg-white/[0.05] transition-colors">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

const DefectsPage = () => {
  const { projectId } = useParams();
  const { defects, total, pages, loading, fetchDefects, bulkDeleteDefects, filters, setFilters } = useDefectStore();
  const { fetchProject, currentProject } = useProjectStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchProject(projectId); }, [projectId, fetchProject]);
  useEffect(() => { fetchDefects(projectId, filters); }, [projectId, filters, fetchDefects]);
  useEffect(() => { setSelected(() => new Set()); }, [projectId, filters]);

  const handleFilterChange = (updates) => setFilters(updates);
  const handlePageChange = (p) => setFilters({ page: p });
  const toggleOne = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allChecked = defects.length > 0 && selected.size === defects.length;
  const someChecked = selected.size > 0 && selected.size < defects.length;
  const toggleAll = () => setSelected(allChecked || someChecked ? new Set() : new Set(defects.map(d => d._id)));

  const handleBulkDelete = async () => {
    if (!selected.size) return;
    const { isConfirmed } = await Swal.fire({
      ...swalTheme,
      title: `Move ${selected.size} defect${selected.size > 1 ? 's' : ''} to trash?`,
      text: 'You can restore them from the Trash page.',
      icon: 'warning', iconColor: '#ff5c1a',
      showCancelButton: true,
      confirmButtonText: 'Yes, move to trash',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });
    if (!isConfirmed) return;
    setDeleting(true);
    try {
      await bulkDeleteDefects(projectId, [...selected]);
      toast.success(`${selected.size} defect${selected.size > 1 ? 's' : ''} moved to trash`);
      setSelected(new Set());
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Bulk delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    { label: 'All', status: '' },
    { label: 'Open', status: 'open' },
    { label: 'In Progress', status: 'in_progress' },
    { label: 'Closed', status: 'closed' },
  ];

  return (
    <AppShell
      title={currentProject?.name || 'Defects'}
      subtitle={`${total} defects`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={<Upload size={13} />} size="sm" onClick={() => setImportOpen(true)}>
            Import
          </Button>
          <Button icon={<Plus size={14} />} size="sm" onClick={() => setCreateOpen(true)}>Report Defect</Button>
        </div>
      }
    >
      <div className="p-4 sm:p-5">
        <Reveal variant="up">
          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] mb-4 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.label} onClick={() => handleFilterChange({ status: tab.status, page: 1 })}
                className={`px-4 py-2 text-xs font-semibold border-none cursor-pointer -mb-px whitespace-nowrap transition-colors ${
                  filters.status === tab.status
                    ? 'text-[#ffb59e] border-b-2 border-[#ff5c1a]'
                    : 'text-white/40 hover:text-white/70 border-b-2 border-transparent'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <FilterBar filters={filters} onChange={handleFilterChange} />
          </div>
        </Reveal>

        {/* Bulk toolbar */}
        {selected.size > 0 && (
          <Reveal variant="scale">
            <div className="flex items-center gap-3 px-4 py-2.5 mb-3 bg-[#ff5c1a]/[0.08] border border-[#ff5c1a]/20 rounded-[10px]">
              <CheckSquare size={14} className="text-[#ffb59e]" />
              <span className="text-[13px] font-semibold text-[#ffb59e]">{selected.size} selected</span>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => setSelected(new Set())}
                  className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 bg-transparent border-none cursor-pointer">
                  <X size={12} /> Deselect
                </button>
                <button onClick={handleBulkDelete} disabled={deleting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-500/70 hover:bg-red-500/90 disabled:opacity-50 border-none rounded-[7px] cursor-pointer disabled:cursor-not-allowed transition-colors">
                  <Trash2 size={12} /> {deleting ? 'Moving…' : 'Move to Trash'}
                </button>
              </div>
            </div>
          </Reveal>
        )}

        {/* Table */}
        <Reveal variant="up" delay={0.05}>
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              {/* Header */}
              <div className="flex items-center gap-4 px-4 sm:px-5 py-2.5 border-b border-white/[0.06] bg-black/50 min-w-[640px]">
                <Checkbox checked={allChecked} indeterminate={someChecked} onChange={toggleAll} />
                <span className="text-[11px] text-white/30 w-[90px] flex-shrink-0 font-semibold uppercase tracking-[0.06em] hidden sm:block">ID</span>
                <span className="text-[11px] text-white/30 flex-1 font-semibold uppercase tracking-[0.06em]">Title</span>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  {['Severity', 'Priority', 'Status', '', 'Updated'].map((h, i) => (
                    <span key={i} className={`text-[11px] text-white/30 font-semibold uppercase tracking-[0.06em] ${i === 3 ? 'w-6' : i === 4 ? 'w-[70px] text-right hidden sm:block' : ''}`}>
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {loading ? <PageLoader /> : defects.length === 0 ? (
                <EmptyState
                  icon={<Bug size={36} />}
                  title="No defects found"
                  description="Start tracking by reporting your first defect"
                  action={<Button icon={<Plus size={14} />} size="sm" onClick={() => setCreateOpen(true)}>Report Defect</Button>}
                />
              ) : (
                <>
                  <div className="min-w-[640px]">
                    {defects.map(d => (
                      <DefectRow key={d._id} defect={d} projectId={projectId} selected={selected.has(d._id)} onSelect={toggleOne} />
                    ))}
                  </div>
                  <Pagination page={filters.page || 1} pages={pages} total={total} onChange={handlePageChange} />
                </>
              )}
            </div>
          </Card>
        </Reveal>
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Report Defect" size="lg">
        <CreateDefectForm projectId={projectId} onSuccess={() => { setCreateOpen(false); fetchDefects(projectId, filters); }} />
      </Modal>
      <Modal isOpen={importOpen} onClose={() => setImportOpen(false)} title="Import Defects from File" size="md">
        <BulkUploadModal projectId={projectId} onSuccess={() => fetchDefects(projectId, filters)} onClose={() => setImportOpen(false)} />
      </Modal>
    </AppShell>
  );
};

export default DefectsPage;

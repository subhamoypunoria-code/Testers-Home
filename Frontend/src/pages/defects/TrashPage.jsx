import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Trash2, RefreshCw, X, CheckSquare } from 'lucide-react';
import Swal from 'sweetalert2';
import AppShell from '../../components/layout/AppShell';
import EmptyState from '../../components/ui/EmptyState';
import PageLoader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Reveal from '../../components/animation/Reveal';
import { StatusBadge, SeverityBadge } from '../../components/ui/Badge';
import { defectAPI } from '../../services/api';
import { timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';

// ── SweetAlert2 theme matching the app ────────────────────────────────────────
const swalTheme = {
  background: 'rgba(13,13,13,0.96)',
  color: '#ffffff',
  confirmButtonColor: '#ef4444',
  cancelButtonColor: 'rgba(255,255,255,0.1)',
  customClass: {
    popup:         'swal-popup',
    confirmButton: 'swal-confirm',
    cancelButton:  'swal-cancel',
  },
};

async function confirmDelete(count) {
  return Swal.fire({
    ...swalTheme,
    title: count > 1 ? `Delete ${count} defects?` : 'Delete defect?',
    text: 'This is permanent and cannot be undone.',
    icon: 'warning',
    iconColor: '#ef4444',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete permanently',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
  });
}

async function confirmRestore(count) {
  return Swal.fire({
    ...swalTheme,
    confirmButtonColor: '#ff5c1a',
    title: count > 1 ? `Restore ${count} defects?` : 'Restore defect?',
    text: 'They will be moved back to the defects list.',
    icon: 'question',
    iconColor: '#ff5c1a',
    showCancelButton: true,
    confirmButtonText: 'Yes, restore',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
  });
}

// ── checkbox component ────────────────────────────────────────────────────────
const Checkbox = ({ checked, indeterminate, onChange }) => (
  <input
    type="checkbox"
    checked={checked}
    ref={el => { if (el) el.indeterminate = !!indeterminate; }}
    onChange={onChange}
    className="w-3.5 h-3.5 rounded border-white/30 bg-white/[0.04] accent-[#ff5c1a] cursor-pointer flex-shrink-0"
  />
);

// ── main page ─────────────────────────────────────────────────────────────────
const TrashPage = () => {
  const { projectId } = useParams();
  const [defects,  setDefects]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [working,  setWorking]  = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await defectAPI.getTrash(projectId);
      setDefects(data.defects);
    } catch {
      // ignore load errors
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data } = await defectAPI.getTrash(projectId);
        setDefects(data.defects);
      } catch {
        // ignore load errors
      }
      setLoading(false);
    };
    loadData();
    setSelected(new Set());
  }, [projectId]);

  // ── selection helpers ────────────────────────────────────────────────────
  const toggleOne = id => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const allChecked  = defects.length > 0 && selected.size === defects.length;
  const someChecked = selected.size > 0 && selected.size < defects.length;
  const toggleAll   = () => setSelected(allChecked || someChecked ? new Set() : new Set(defects.map(d => d._id)));

  // ── single actions ────────────────────────────────────────────────────────
  const restore = async (id) => {
    const { isConfirmed } = await confirmRestore(1);
    if (!isConfirmed) return;
    try {
      await defectAPI.restore(projectId, id);
      toast.success('Defect restored');
      load();
    } catch { toast.error('Restore failed'); }
  };

  const deletePermanent = async (id) => {
    const { isConfirmed } = await confirmDelete(1);
    if (!isConfirmed) return;
    try {
      await defectAPI.permanentDelete(projectId, id);
      toast.success('Permanently deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  // ── bulk actions ──────────────────────────────────────────────────────────
  const bulkRestore = async () => {
    const { isConfirmed } = await confirmRestore(selected.size);
    if (!isConfirmed) return;
    setWorking(true);
    try {
      await defectAPI.bulkRestore(projectId, [...selected]);
      toast.success(`${selected.size} defect${selected.size > 1 ? 's' : ''} restored`);
      load();
    } catch { toast.error('Bulk restore failed'); }
    setWorking(false);
  };

  const bulkDelete = async () => {
    const { isConfirmed } = await confirmDelete(selected.size);
    if (!isConfirmed) return;
    setWorking(true);
    try {
      await defectAPI.bulkPermanentDelete(projectId, [...selected]);
      toast.success(`${selected.size} defect${selected.size > 1 ? 's' : ''} permanently deleted`);
      load();
    } catch { toast.error('Bulk delete failed'); }
    setWorking(false);
  };

  return (
    <AppShell title="Trash" subtitle={`${defects.length} deleted defect${defects.length !== 1 ? 's' : ''}`}>
      <div className="p-5">

        {/* Bulk toolbar */}
        {selected.size > 0 && (
          <Reveal variant="up">
            <div className="flex items-center gap-3 px-4 py-2.5 mb-4 bg-[rgba(255,92,26,0.1)] border border-[rgba(255,92,26,0.25)] rounded-[var(--radius-lg)]">
              <CheckSquare size={14} className="text-[#ff5c1a]" />
              <span className="text-sm font-medium text-[#ffb59e]">
                {selected.size} selected
              </span>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setSelected(new Set())}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/50 hover:text-white transition-colors"
                >
                  <X size={12} /> Deselect all
                </button>
                <Button size="xs" onClick={bulkRestore} disabled={working} icon={<RefreshCw size={12} />}>
                  {working ? 'Working…' : 'Restore Selected'}
                </Button>
                <Button variant="danger" size="xs" onClick={bulkDelete} disabled={working} icon={<Trash2 size={12} />}>
                  {working ? 'Working…' : 'Delete Selected'}
                </Button>
              </div>
            </div>
          </Reveal>
        )}

        {loading ? <PageLoader /> : defects.length === 0 ? (
          <EmptyState
            icon={<Trash2 size={36} />}
            title="Trash is empty"
            description="Deleted defects appear here"
          />
        ) : (
          <Reveal variant="up" delay={0.05}>
            <Card className="p-0 overflow-hidden">
              {/* Table header */}
              <div className="flex items-center gap-4 px-5 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                <Checkbox checked={allChecked} indeterminate={someChecked} onChange={toggleAll} />
                <span className="text-xs text-white/40 w-24 flex-shrink-0">ID</span>
                <span className="text-xs text-white/40 flex-1">Title</span>
                <span className="text-xs text-white/40 w-16">Severity</span>
                <span className="text-xs text-white/40 w-16">Status</span>
                <span className="text-xs text-white/40 w-40 text-right">Actions</span>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {defects.map(d => (
                  <div
                    key={d._id}
                    className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${selected.has(d._id) ? 'bg-[rgba(255,92,26,0.05)]' : 'hover:bg-white/[0.03]'}`}
                  >
                    <div onClick={e => e.stopPropagation()}>
                      <Checkbox checked={selected.has(d._id)} onChange={() => toggleOne(d._id)} />
                    </div>

                    <span className="text-xs text-white/40 font-mono w-24 flex-shrink-0">{d.defectId}</span>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/70 truncate">{d.title}</p>
                      <p className="text-xs text-white/40">
                        Deleted {timeAgo(d.deletedAt)}{d.deletedBy ? ` by ${d.deletedBy.name}` : ''}
                      </p>
                    </div>

                    <div className="w-16 flex-shrink-0"><SeverityBadge severity={d.severity} /></div>
                    <div className="w-16 flex-shrink-0"><StatusBadge status={d.status} /></div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="success"
                        size="xs"
                        onClick={() => restore(d._id)}
                        icon={<RefreshCw size={11} />}
                      >
                        Restore
                      </Button>
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={() => deletePermanent(d._id)}
                        icon={<X size={11} />}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        )}
      </div>
    </AppShell>
  );
};

export default TrashPage;

import { useState, useEffect } from 'react';
import Input, { Textarea, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import useDefectStore from '../../store/defectStore';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SEVERITIES      = ['blocker', 'critical', 'major', 'minor', 'trivial'];
const PRIORITIES      = ['urgent', 'high', 'medium', 'low'];
const REPRODUCIBILITY = ['always', 'sometimes', 'rarely', 'unable'];
const STATUSES        = ['new','open','assigned','in_progress','ready_for_qa','retest','verified',
                         'closed','reopened','deferred','duplicate','cannot_reproduce','rejected','blocked'];

const BLANK = {
  title: '', description: '', stepsToReproduce: '', expectedResult: '', actualResult: '',
  severity: 'minor', priority: 'medium', reproducibility: 'always', status: 'new',
  environment: '', browser: '', buildVersion: '', device: '',
  module: '', tags: '', assignee: '',
  rootCause: '', linkedTestCase: '', linkedRequirement: '',
  sprintId: '', releaseVersion: '',
};

const CreateDefectForm = ({ projectId, onSuccess, initial }) => {
  const { createDefect, updateDefect } = useDefectStore();
  const [loading, setLoading] = useState(false);
  const [users,   setUsers]   = useState([]);
  const [form,    setForm]    = useState(() => {
    if (!initial) return BLANK;
    return {
      ...BLANK,
      ...initial,
      tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : (initial.tags || ''),
    };
  });

  useEffect(() => {
    userAPI.search('').then(r => setUsers(r.data.users)).catch(() => {});
  }, []);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (form.title.trim().length < 3) return toast.error('Title must be at least 3 characters');
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags:     form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        assignee: form.assignee || undefined,
      };
      if (initial) {
        await updateDefect(projectId, initial._id, payload);
        toast.success('Defect updated');
      } else {
        await createDefect(projectId, payload);
        toast.success('Defect reported!');
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Title ── */}
      <Input
        label="Title *"
        value={form.title}
        onChange={e => set('title', e.target.value)}
        placeholder="Short, descriptive title"
        required
      />

      {/* ── Description ── */}
      <Textarea
        label="Description"
        value={form.description}
        onChange={e => set('description', e.target.value)}
        placeholder="Describe the defect in detail"
        rows={3}
      />

      {/* ── Steps / Expected / Actual ── */}
      <Textarea
        label="Steps to Reproduce"
        value={form.stepsToReproduce}
        onChange={e => set('stepsToReproduce', e.target.value)}
        placeholder={"1. Go to…\n2. Click on…\n3. See error"}
        rows={3}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Textarea label="Expected Result" value={form.expectedResult} onChange={e => set('expectedResult', e.target.value)} rows={2} />
        <Textarea label="Actual Result"   value={form.actualResult}   onChange={e => set('actualResult',   e.target.value)} rows={2} />
      </div>

      {/* ── Classification ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select label="Severity" value={form.severity} onChange={e => set('severity', e.target.value)}>
          {SEVERITIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </Select>
        <Select label="Priority" value={form.priority} onChange={e => set('priority', e.target.value)}>
          {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </Select>
        <Select label="Reproducibility" value={form.reproducibility} onChange={e => set('reproducibility', e.target.value)}>
          {REPRODUCIBILITY.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </Select>
      </div>

      {/* ── Assign / Status ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Assign To" value={form.assignee} onChange={e => set('assignee', e.target.value)}>
          <option value="">Unassigned</option>
          {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
        </Select>
        {initial && (
          <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </Select>
        )}
      </div>

      {/* ── Environment ── */}
      <div className="border-t border-white/[0.06] pt-4">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Environment</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Environment"  value={form.environment}  onChange={e => set('environment',  e.target.value)} placeholder="staging / prod" />
          <Input label="Browser"      value={form.browser}      onChange={e => set('browser',      e.target.value)} placeholder="Chrome 120" />
          <Input label="Build Version" value={form.buildVersion} onChange={e => set('buildVersion', e.target.value)} placeholder="v2.1.0" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Input label="Device / OS"       value={form.device} onChange={e => set('device', e.target.value)} placeholder="Windows 10 / iPhone 14" />
          <Input label="Module / Component" value={form.module} onChange={e => set('module', e.target.value)} placeholder="Authentication" />
        </div>
      </div>

      {/* ── Tracking ── */}
      <div className="border-t border-white/[0.06] pt-4">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Tracking</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Sprint"           value={form.sprintId}          onChange={e => set('sprintId',          e.target.value)} placeholder="Sprint 12" />
          <Input label="Release Version"  value={form.releaseVersion}    onChange={e => set('releaseVersion',    e.target.value)} placeholder="v3.0.0" />
          <Input label="Linked Test Case" value={form.linkedTestCase}    onChange={e => set('linkedTestCase',    e.target.value)} placeholder="TC-001" />
          <Input label="Linked Requirement" value={form.linkedRequirement} onChange={e => set('linkedRequirement', e.target.value)} placeholder="REQ-045" />
        </div>
        <div className="mt-4">
          <Textarea label="Root Cause" value={form.rootCause} onChange={e => set('rootCause', e.target.value)} placeholder="Root cause analysis…" rows={2} />
        </div>
      </div>

      {/* ── Tags ── */}
      <Input
        label="Tags (comma separated)"
        value={form.tags}
        onChange={e => set('tags', e.target.value)}
        placeholder="login, safari, auth"
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {initial ? 'Update Defect' : 'Report Defect'}
        </Button>
      </div>
    </form>
  );
};

export default CreateDefectForm;

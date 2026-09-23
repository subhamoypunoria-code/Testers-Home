import { useState } from 'react';
import Input, { Textarea, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import useProjectStore from '../../store/projectStore';
import toast from 'react-hot-toast';

const CreateProjectForm = ({ onSuccess, initial }) => {
  const { createProject, updateProject } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initial || {
    name: '', key: '', description: '', type: 'web', clientName: '',
    startDate: '', endDate: '', environment: 'staging', priority: 'medium',
    repositoryUrl: '', status: 'active', releaseVersion: '1.0.0', techStack: '',
  });

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (field === 'name' && !initial) {
      setForm(f => ({ ...f, name: value, key: value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.name.trim()) return toast.error('Project name is required');
    if (!form.key || !form.key.trim()) return toast.error('Project key is required');
    if (form.key.trim().length < 2) return toast.error('Project key must be at least 2 characters');
    setLoading(true);
    try {
      const payload = { ...form, techStack: form.techStack ? form.techStack.split(',').map(s => s.trim()).filter(Boolean) : [] };
      if (initial) {
        await updateProject(initial._id, payload);
        toast.success('Project updated');
      } else {
        await createProject(payload);
        toast.success('Project created!');
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Project Name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="My App QA" required />
        <Input label="Project Key *" value={form.key} onChange={e => set('key', e.target.value.toUpperCase())} placeholder="MYAPP" maxLength={8} required />
      </div>
      <Textarea label="Description" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What are we testing?" rows={2} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Type" value={form.type} onChange={e => set('type', e.target.value)}>
          {['web', 'mobile', 'api', 'desktop', 'other'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </Select>
        <Select label="Priority" value={form.priority} onChange={e => set('priority', e.target.value)}>
          {['low', 'medium', 'high', 'critical'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Start Date" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
        <Input label="End Date" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Client Name" value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="Acme Corp" />
        <Input label="Environment" value={form.environment} onChange={e => set('environment', e.target.value)} placeholder="staging / production" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Release Version" value={form.releaseVersion} onChange={e => set('releaseVersion', e.target.value)} placeholder="1.0.0" />
        <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
          {['active', 'inactive', 'archived', 'completed'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </Select>
      </div>
      <Input label="Repository URL" value={form.repositoryUrl} onChange={e => set('repositoryUrl', e.target.value)} placeholder="https://github.com/org/repo" />
      <Input label="Tech Stack (comma separated)" value={form.techStack} onChange={e => set('techStack', e.target.value)} placeholder="React, Node.js, MongoDB" />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {initial ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
};

export default CreateProjectForm;

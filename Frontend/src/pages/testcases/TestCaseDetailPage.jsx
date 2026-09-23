import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipboardList, ArrowLeft, Save, Trash2, Plus, X } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input, { Textarea, Select } from '../../components/ui/Input';
import PageLoader from '../../components/ui/Loader';
import { TestCaseTypeBadge, TestCaseStatusBadge, SeverityBadge, PriorityBadge } from '../../components/ui/Badge';
import Reveal from '../../components/animation/Reveal';
import useTestCaseStore from '../../store/testCaseStore';
import { capitalize } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TestCaseDetailPage = () => {
  const { projectId, id } = useParams();
  const navigate = useNavigate();
  const { currentTestCase, loading, fetchTestCase, updateTestCase, deleteTestCase, setCurrentTestCase } = useTestCaseStore();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTestCase(projectId, id);
    return () => setCurrentTestCase(null);
  }, [projectId, id, fetchTestCase, setCurrentTestCase]);

  useEffect(() => {
    if (currentTestCase) {
      setForm({
        title: currentTestCase.title,
        description: currentTestCase.description || '',
        type: currentTestCase.type,
        status: currentTestCase.status,
        priority: currentTestCase.priority,
        severity: currentTestCase.severity,
        prerequisites: currentTestCase.prerequisites || '',
        steps: [...(currentTestCase.steps || [])],
        expectedResult: currentTestCase.expectedResult || '',
        tags: (currentTestCase.tags || []).join(', '),
      });
    }
  }, [currentTestCase]);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const updateStep = (idx, val) => {
    const steps = [...form.steps];
    steps[idx] = val;
    setForm({ ...form, steps });
  };

  const addStep = () => setForm({ ...form, steps: [...form.steps, ''] });
  const removeStep = (idx) => setForm({ ...form, steps: form.steps.filter((_, i) => i !== idx) });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      await updateTestCase(projectId, id, {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      toast.success('Test case updated');
      navigate(`/projects/${projectId}/testcases`);
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this test case?')) return;
    try {
      await deleteTestCase(projectId, id);
      toast.success('Test case deleted');
      navigate(`/projects/${projectId}/testcases`);
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading || !form) return <AppShell title="Test Case"><PageLoader /></AppShell>;

  return (
    <AppShell
      title="Test Case"
      subtitle={currentTestCase?.testCaseId}
      actions={
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={() => navigate(`/projects/${projectId}/testcases`)}>
          Back
        </Button>
      }
    >
      <div className="p-4 sm:p-6">
        <Reveal variant="up">
          <form onSubmit={handleSave} className="space-y-5">
            <Card className="p-5">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <TestCaseTypeBadge type={form.type} />
                <TestCaseStatusBadge status={form.status} />
                <SeverityBadge severity={form.severity} />
                <PriorityBadge priority={form.priority} />
              </div>

              <Input
                label="Title *"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                required
              />
              <div className="mt-4">
                <Textarea
                  label="Description"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={3}
                />
              </div>
            </Card>

            <Card className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Select label="Type" value={form.type} onChange={e => set('type', e.target.value)}>
                  {['positive', 'negative', 'regression', 'smoke'].map(t => <option key={t} value={t}>{capitalize(t)}</option>)}
                </Select>
                <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
                  {['draft', 'active', 'archived'].map(s => <option key={s} value={s}>{capitalize(s)}</option>)}
                </Select>
                <Select label="Priority" value={form.priority} onChange={e => set('priority', e.target.value)}>
                  {['urgent', 'high', 'medium', 'low'].map(p => <option key={p} value={p}>{capitalize(p)}</option>)}
                </Select>
                <Select label="Severity" value={form.severity} onChange={e => set('severity', e.target.value)}>
                  {['blocker', 'critical', 'major', 'minor', 'trivial'].map(s => <option key={s} value={s}>{capitalize(s)}</option>)}
                </Select>
              </div>
              <Textarea
                label="Prerequisites"
                value={form.prerequisites}
                onChange={e => set('prerequisites', e.target.value)}
                placeholder="Environment, account type, data setup…"
                rows={2}
              />
            </Card>

            <Card className="p-5">
              <label className="text-xs text-white/55 font-semibold tracking-wider block mb-3">STEPS</label>
              {form.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-white/30 w-5">{i + 1}.</span>
                  <Input
                    value={step}
                    onChange={e => updateStep(i, e.target.value)}
                    className="flex-1"
                    placeholder={`Step ${i + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="text-white/30 hover:text-red-400 bg-transparent border-none cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={addStep} icon={<Plus size={14} />}>
                Add Step
              </Button>
            </Card>

            <Card className="p-5">
              <Textarea
                label="Expected Result"
                value={form.expectedResult}
                onChange={e => set('expectedResult', e.target.value)}
                rows={3}
              />
              <div className="mt-4">
                <Input
                  label="Tags (comma separated)"
                  value={form.tags}
                  onChange={e => set('tags', e.target.value)}
                  placeholder="regression, smoke, auth"
                />
              </div>
            </Card>

            <div className="flex justify-between items-center pt-2">
              <Button type="button" variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={handleDelete}>
                Delete
              </Button>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => navigate(`/projects/${projectId}/testcases`)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving} icon={<Save size={14} />}>
                  Save Test Case
                </Button>
              </div>
            </div>
          </form>
        </Reveal>
      </div>
    </AppShell>
  );
};

export default TestCaseDetailPage;

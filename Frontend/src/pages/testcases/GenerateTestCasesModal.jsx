import { useEffect, useState } from 'react';
import { ClipboardList, CheckSquare, Square, Wand2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input, { Textarea, Select } from '../../components/ui/Input';
import { defectAPI } from '../../services/api';
import useTestCaseStore from '../../store/testCaseStore';
import { SeverityBadge, PriorityBadge } from '../../components/ui/Badge';
import { capitalize } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Checkbox = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className="text-white/40 hover:text-[#ff5c1a] bg-transparent border-none cursor-pointer flex items-center"
  >
    {checked ? <CheckSquare size={18} className="text-[#ff5c1a]" /> : <Square size={18} />}
  </button>
);

const GenerateTestCasesModal = ({ projectId, onClose }) => {
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDefects, setSelectedDefects] = useState(new Set());
  const [preview, setPreview] = useState([]);
  const [selectedToSave, setSelectedToSave] = useState(new Set());
  const [expanded, setExpanded] = useState(new Set());

  const { generateFromDefects, saveGenerated, loading: storeLoading } = useTestCaseStore();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    defectAPI.getAll(projectId, { limit: 100, page: 1 })
      .then(({ data }) => { if (mounted) setDefects(data.defects || []); })
      .catch(() => toast.error('Failed to load defects'))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [projectId]);

  const toggleDefect = (id) => {
    setSelectedDefects(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAllDefects = () => {
    if (selectedDefects.size === defects.length) setSelectedDefects(new Set());
    else setSelectedDefects(new Set(defects.map(d => d._id)));
  };

  const handleGenerate = async () => {
    if (selectedDefects.size === 0) return toast.error('Select at least one defect');
    const generated = await generateFromDefects(projectId, Array.from(selectedDefects));
    if (!generated?.length) return toast.error('No test cases generated');
    setPreview(generated.map((tc, i) => ({ ...tc, _genId: `gen-${i}`, title: tc.title || 'Untitled' })));
    setSelectedToSave(new Set(generated.map((_, i) => `gen-${i}`)));
  };

  const toggleSave = (id) => {
    setSelectedToSave(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const updatePreview = (id, field, value) => {
    setPreview(prev => prev.map(tc => tc._genId === id ? { ...tc, [field]: value } : tc));
  };

  const updateStep = (id, idx, value) => {
    setPreview(prev => prev.map(tc => {
      if (tc._genId !== id) return tc;
      const steps = [...tc.steps];
      steps[idx] = value;
      return { ...tc, steps };
    }));
  };

  const addStep = (id) => {
    setPreview(prev => prev.map(tc => tc._genId === id ? { ...tc, steps: [...tc.steps, ''] } : tc));
  };

  const removeStep = (id, idx) => {
    setPreview(prev => prev.map(tc => {
      if (tc._genId !== id) return tc;
      const steps = tc.steps.filter((_, i) => i !== idx);
      return { ...tc, steps };
    }));
  };

  const handleSave = async () => {
    const toSave = preview.filter(tc => selectedToSave.has(tc._genId));
    if (!toSave.length) return toast.error('Select at least one test case to save');
    // Strip internal fields before sending
    const payload = toSave.map(({ _genId, ...tc }) => tc);
    const res = await saveGenerated(projectId, payload);
    if (res?.success) {
      toast.success(`Saved ${res.created} test cases`);
      onClose();
    } else {
      toast.error(res?.failures?.[0]?.reason || 'Failed to save');
    }
  };

  return (
    <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
      {/* Defect selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Select Defects</h3>
          <button
            onClick={toggleAllDefects}
            className="text-[11px] text-white/40 hover:text-white/80 bg-transparent border-none cursor-pointer"
          >
            {selectedDefects.size === defects.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-white/40">Loading defects…</p>
        ) : defects.length === 0 ? (
          <p className="text-xs text-white/40">No defects available in this project.</p>
        ) : (
          <Card className="max-h-[200px] overflow-y-auto p-2">
            {defects.map(d => (
              <div key={d._id} className="flex items-center gap-3 px-2 py-2 hover:bg-white/[0.03] rounded-md">
                <Checkbox checked={selectedDefects.has(d._id)} onChange={() => toggleDefect(d._id)} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-white/80 truncate">{d.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-white/30 font-mono">{d.defectId}</span>
                    <SeverityBadge severity={d.severity} />
                    <PriorityBadge priority={d.priority} />
                  </div>
                </div>
              </div>
            ))}
          </Card>
        )}

        <div className="mt-3">
          <Button onClick={handleGenerate} loading={storeLoading} icon={<Wand2 size={14} />}>
            Generate Preview
          </Button>
        </div>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="border-t border-white/[0.06] pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Generated Preview ({preview.length})</h3>
            <button
              onClick={() => selectedToSave.size === preview.length ? setSelectedToSave(new Set()) : setSelectedToSave(new Set(preview.map(tc => tc._genId)))}
              className="text-[11px] text-white/40 hover:text-white/80 bg-transparent border-none cursor-pointer"
            >
              {selectedToSave.size === preview.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>

          <div className="space-y-3">
            {preview.map((tc, idx) => (
              <Card key={tc._genId} className="p-3">
                <div className="flex items-start gap-3">
                  <Checkbox checked={selectedToSave.has(tc._genId)} onChange={() => toggleSave(tc._genId)} />
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-white/40">#{idx + 1} • {capitalize(tc.type)}</p>
                      <button
                        onClick={() => setExpanded(prev => {
                          const next = new Set(prev);
                          next.has(tc._genId) ? next.delete(tc._genId) : next.add(tc._genId);
                          return next;
                        })}
                        className="text-white/30 hover:text-white/70 bg-transparent border-none cursor-pointer flex items-center"
                      >
                        {expanded.has(tc._genId) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    <Input
                      label="Title"
                      value={tc.title}
                      onChange={e => updatePreview(tc._genId, 'title', e.target.value)}
                      style={{ padding: '8px 12px' }}
                    />

                    {expanded.has(tc._genId) && (
                      <>
                        <Textarea
                          label="Description"
                          value={tc.description}
                          onChange={e => updatePreview(tc._genId, 'description', e.target.value)}
                          rows={2}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Select label="Type" value={tc.type} onChange={e => updatePreview(tc._genId, 'type', e.target.value)}>
                            {['positive', 'negative', 'regression', 'smoke'].map(t => <option key={t} value={t}>{capitalize(t)}</option>)}
                          </Select>
                          <Select label="Priority" value={tc.priority} onChange={e => updatePreview(tc._genId, 'priority', e.target.value)}>
                            {['urgent', 'high', 'medium', 'low'].map(p => <option key={p} value={p}>{capitalize(p)}</option>)}
                          </Select>
                          <Select label="Severity" value={tc.severity} onChange={e => updatePreview(tc._genId, 'severity', e.target.value)}>
                            {['blocker', 'critical', 'major', 'minor', 'trivial'].map(s => <option key={s} value={s}>{capitalize(s)}</option>)}
                          </Select>
                        </div>
                        <Textarea
                          label="Expected Result"
                          value={tc.expectedResult}
                          onChange={e => updatePreview(tc._genId, 'expectedResult', e.target.value)}
                          rows={2}
                        />
                        <div>
                          <label className="text-xs text-white/55 font-semibold tracking-wider block mb-2">STEPS</label>
                          {tc.steps.map((step, i) => (
                            <div key={i} className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-white/30 w-5">{i + 1}.</span>
                              <Input
                                value={step}
                                onChange={e => updateStep(tc._genId, i, e.target.value)}
                                className="flex-1"
                                style={{ padding: '6px 10px' }}
                              />
                              <button
                                onClick={() => removeStep(tc._genId, i)}
                                className="text-white/30 hover:text-red-400 bg-transparent border-none cursor-pointer"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addStep(tc._genId)}
                            className="text-[11px] text-[#ff7a45] hover:text-[#ff5c1a] bg-transparent border-none cursor-pointer"
                          >
                            + Add step
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2 border-t border-white/[0.06]">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} loading={storeLoading} disabled={selectedToSave.size === 0} icon={<Save size={14} />}>
          Save {selectedToSave.size > 0 ? selectedToSave.size : ''} Test Cases
        </Button>
      </div>
    </div>
  );
};

export default GenerateTestCasesModal;

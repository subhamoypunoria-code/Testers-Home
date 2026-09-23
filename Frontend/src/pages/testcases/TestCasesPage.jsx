import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Search, RefreshCw, ChevronLeft, ChevronRight, Trash2, Edit } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Select } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import PageLoader from '../../components/ui/Loader';
import { TestCaseTypeBadge, TestCaseStatusBadge, PriorityBadge, SeverityBadge } from '../../components/ui/Badge';
import Reveal from '../../components/animation/Reveal';
import GenerateTestCasesModal from './GenerateTestCasesModal';
import useTestCaseStore from '../../store/testCaseStore';
import useDefectStore from '../../store/defectStore';
import { timeAgo } from '../../utils/helpers';
import { TESTCASE_TYPE_OPTIONS, TESTCASE_STATUS_OPTIONS, PRIORITY_OPTIONS } from '../../utils/constants';
import toast from 'react-hot-toast';

const PAGE_SIZE = 20;

const FilterBar = ({ filters, onChange }) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="relative w-full sm:w-auto">
      <Input
        value={filters.search}
        onChange={e => onChange({ search: e.target.value, page: 1 })}
        placeholder="Search test cases…"
        icon={<Search size={12} className="text-white/30" />}
        className="w-full sm:w-[180px]"
        style={{ padding: '6px 10px 6px 30px', fontSize: 12 }}
      />
    </div>
    {[
      { value: filters.status, options: TESTCASE_STATUS_OPTIONS, placeholder: 'All Statuses', key: 'status' },
      { value: filters.type, options: TESTCASE_TYPE_OPTIONS, placeholder: 'All Types', key: 'type' },
      { value: filters.priority, options: PRIORITY_OPTIONS, placeholder: 'All Priorities', key: 'priority' },
    ].map(({ value, options, placeholder, key }) => (
      <Select key={key} value={value} onChange={e => onChange({ [key]: e.target.value, page: 1 })}
        className="w-full sm:w-auto"
        style={{ padding: '6px 10px', fontSize: 12 }}>
        <option value="">{placeholder}</option>
        {options.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
      </Select>
    ))}
    {(filters.status || filters.type || filters.priority || filters.search) && (
      <button onClick={() => onChange({ status: '', type: '', priority: '', search: '', page: 1 })}
        className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/80 transition-colors bg-transparent border-none cursor-pointer">
        <RefreshCw size={11} /> Clear
      </button>
    )}
  </div>
);

const TestCaseRow = ({ testCase, projectId, onDelete }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-4 px-4 sm:px-5 py-3 border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/projects/${projectId}/testcases/${testCase._id}`)}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] text-white/30 font-mono w-[110px] flex-shrink-0 hidden sm:block">{testCase.testCaseId}</span>
          <p className="text-[13px] text-white/80 truncate">{testCase.title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 pl-0 sm:pl-[118px]">
          <TestCaseTypeBadge type={testCase.type} />
          <TestCaseStatusBadge status={testCase.status} />
          <SeverityBadge severity={testCase.severity} />
          <PriorityBadge priority={testCase.priority} />
          <span className="text-[11px] text-white/30">{timeAgo(testCase.updatedAt)}</span>
        </div>
      </div>
      <button
        onClick={() => navigate(`/projects/${projectId}/testcases/${testCase._id}`)}
        className="text-white/30 hover:text-white/70 bg-transparent border-none cursor-pointer flex items-center p-1"
        title="Edit"
      >
        <Edit size={14} />
      </button>
      <button
        onClick={() => onDelete(testCase._id)}
        className="text-white/30 hover:text-red-400 bg-transparent border-none cursor-pointer flex items-center p-1"
        title="Delete"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

const TestCasesPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { testCases, total, pages, loading, filters, fetchTestCases, deleteTestCase, setFilters } = useTestCaseStore();
  const { fetchDefects } = useDefectStore();
  const [generateOpen, setGenerateOpen] = useState(false);

  useEffect(() => {
    fetchDefects(projectId);
  }, [projectId, fetchDefects]);

  useEffect(() => {
    fetchTestCases(projectId, filters);
  }, [projectId, filters, fetchTestCases]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this test case?')) return;
    try {
      await deleteTestCase(projectId, id);
      toast.success('Test case deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const page = filters.page || 1;

  return (
    <AppShell
      title="Test Cases"
      subtitle={`${total} total`}
      actions={
        <Button icon={<Plus size={14} />} size="sm" onClick={() => setGenerateOpen(true)}>
          Generate
        </Button>
      }
    >
      <div className="p-4 sm:p-6">
        <Reveal variant="up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <FilterBar filters={filters} onChange={setFilters} />
          </div>
        </Reveal>

        {loading ? <PageLoader /> : testCases.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={40} />}
            title="No test cases yet"
            description="Generate test cases automatically from your defects"
            action={
              <Button icon={<Plus size={14} />} size="sm" onClick={() => setGenerateOpen(true)}>
                Generate from Defects
              </Button>
            }
          />
        ) : (
          <Reveal variant="up" delay={0.05}>
            <Card className="overflow-hidden">
              {testCases.map(tc => (
                <TestCaseRow key={tc._id} testCase={tc} projectId={projectId} onDelete={handleDelete} />
              ))}
            </Card>

            {pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button
                  disabled={page <= 1}
                  onClick={() => setFilters({ page: page - 1 })}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <span className="text-xs text-white/40">Page {page} of {pages}</span>
                <button
                  disabled={page >= pages}
                  onClick={() => setFilters({ page: page + 1 })}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </Reveal>
        )}
      </div>

      <Modal isOpen={generateOpen} onClose={() => setGenerateOpen(false)} title="Generate Test Cases" size="xl">
        <GenerateTestCasesModal projectId={projectId} onClose={() => setGenerateOpen(false)} />
      </Modal>
    </AppShell>
  );
};

export default TestCasesPage;

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, FileSpreadsheet, X, CheckCircle, AlertCircle, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { defectAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ACCEPTED = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md';
const ACCEPTED_EXTS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'md'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const FORMAT_GUIDE = [
  {
    label: 'Excel / CSV',
    icon: <FileSpreadsheet size={14} className="text-green-400" />,
    desc: 'One defect per row. Use these column headers:',
    example: 'Title | Description | Steps to Reproduce | Expected Result | Actual Result | Severity | Priority | Reproducibility | Status | Environment | Browser | Build Version | Device | Module | Tags | Root Cause | Sprint | Release Version',
  },
  {
    label: 'Word / PDF / TXT — Key:Value blocks',
    icon: <FileText size={14} className="text-blue-400" />,
    desc: 'One defect per blank-line block. Fields on separate lines.',
    example: 'Title: Login button unresponsive\nDescription: Clicking Sign In does nothing on mobile\nSteps to Reproduce: 1. Open login page\n2. Tap Sign In button\nExpected Result: Dashboard loads\nActual Result: Nothing happens\nSeverity: critical\nPriority: high\nEnvironment: staging\nBrowser: Chrome 120\nBuild Version: v2.1.0\nModule: Authentication\nTags: login, mobile\n\nTitle: Password reset email not sent\nSeverity: major\n...',
  },
  {
    label: 'Audit / Report format',
    icon: <FileText size={14} className="text-orange-400" />,
    desc: 'Bold heading = title. Inline fields on the same line separated by dots.',
    example: '**EMP-01 — Login button unresponsive**\nModule: Authentication. Severity: Critical. Priority: High.\nDescription: Clicking Sign In does nothing on mobile Safari.\nSteps: 1. Open login. 2. Tap Sign In.\nExpected: Dashboard loads.\nActual: No response.\n\n---\n\n**EMP-02 — Password reset email not sent**\nModule: Auth. Severity: Major. Priority: Medium.\n...',
  },
];

function FileIcon({ name }) {
  const ext = name.split('.').pop().toLowerCase();
  if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileSpreadsheet size={18} className="text-green-400" />;
  return <FileText size={18} className="text-blue-400" />;
}

export default function BulkUploadModal({ projectId, onSuccess, onClose }) {
  const [file, setFile]           = useState(null);
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [result, setResult]       = useState(null); // { created, failed, failures }
  const [guideOpen, setGuideOpen] = useState(false);
  const inputRef = useRef();

  const pickFile = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_EXTS.includes(ext)) {
      toast.error(`Unsupported file type ".${ext}". Allowed: ${ACCEPTED_EXTS.join(', ')}`);
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error(`File is too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Maximum size is 10 MB.`);
      return;
    }
    setFile(f);
    setResult(null);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files[0]);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await defectAPI.bulkUpload(projectId, fd, (e) => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
      });
      setResult(data);
      if (data.created > 0) {
        toast.success(`${data.created} defect${data.created > 1 ? 's' : ''} imported`);
        onSuccess?.();
      } else {
        toast.error('No defects were imported');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => { setFile(null); setResult(null); setProgress(0); };

  return (
    <div className="space-y-4">

      {/* Format guide toggle */}
      <button
        onClick={() => setGuideOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-[var(--radius-md)] text-xs text-white/60 hover:border-[rgba(255,92,26,0.4)] transition-colors"
      >
        <span className="font-medium text-white/80">How to format your file</span>
        {guideOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {guideOpen && (
        <div className="space-y-3">
          {FORMAT_GUIDE.map(g => (
            <Card key={g.label} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                {g.icon}
                <span className="text-xs font-semibold text-white/80">{g.label}</span>
              </div>
              <p className="text-xs text-white/50 mb-2">{g.desc}</p>
              <pre className="text-[11px] text-white/40 bg-black/30 rounded-[var(--radius-sm)] p-2 overflow-x-auto whitespace-pre-wrap">{g.example}</pre>
            </Card>
          ))}
          <p className="text-[11px] text-white/40 px-1">
            Recognized field names: <span className="text-white/60">title, description, steps to reproduce, expected result, actual result, severity, priority, environment, module, browser, build version, tags, reproducibility, root cause</span>
          </p>
        </div>
      )}

      {/* Drop zone */}
      {!result && (
        <>
          <div
            onClick={() => !file && inputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`relative border-2 border-dashed rounded-[var(--radius-lg)] p-8 text-center transition-all cursor-pointer
              ${dragging ? 'border-[#ff5c1a] bg-[rgba(255,92,26,0.05)]' : 'border-white/[0.08] hover:border-white/20'}
              ${file ? 'cursor-default' : ''}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              className="hidden"
              onChange={e => pickFile(e.target.files[0])}
            />

            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileIcon name={file.name} />
                <div className="text-left">
                  <p className="text-sm text-white font-medium">{file.name}</p>
                  <p className="text-xs text-white/40">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="ml-2 text-white/40 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={28} className="mx-auto text-white/40 mb-3" />
                <p className="text-sm text-white/70 font-medium mb-1">Drop your file here or click to browse</p>
                <p className="text-xs text-white/40">PDF, Word (.docx), Excel (.xlsx/.csv), or plain text (.txt)</p>
              </>
            )}
          </div>

          {/* Upload progress */}
          {uploading && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-white/50">
                <span className="flex items-center gap-1.5"><Loader size={11} className="animate-spin" /> Parsing and importing defects…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ff5c1a] rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={handleUpload} disabled={!file || uploading} loading={uploading} icon={<Upload size={14} />}>
              Import Defects
            </Button>
          </div>
        </>
      )}

      {/* Result summary */}
      {result && (
        <div className="space-y-3">
          <div className={`flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border ${result.created > 0 ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
            {result.created > 0
              ? <CheckCircle size={22} className="text-green-400 flex-shrink-0" />
              : <AlertCircle size={22} className="text-red-400 flex-shrink-0" />}
            <div>
              <p className="text-sm font-semibold text-white">
                {result.created} defect{result.created !== 1 ? 's' : ''} imported successfully
              </p>
              {result.failed > 0 && (
                <p className="text-xs text-white/50">{result.failed} row{result.failed !== 1 ? 's' : ''} skipped</p>
              )}
            </div>
          </div>

          {result.failures?.length > 0 && (
            <Card className="p-3 space-y-1 max-h-40 overflow-y-auto">
              <p className="text-xs font-semibold text-white/50 mb-2">Skipped rows</p>
              {result.failures.map((f, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="text-white/40 truncate flex-1">{f.title}</span>
                  <span className="text-red-400/70 flex-shrink-0">{f.reason}</span>
                </div>
              ))}
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={reset}>Upload another file</Button>
            <Button size="sm" onClick={onClose}>Done</Button>
          </div>
        </div>
      )}
    </div>
  );
}

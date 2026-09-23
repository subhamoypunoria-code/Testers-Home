import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserPlus, Trash2 } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Input from '../../components/ui/Input';
import { Select } from '../../components/ui/Input';
import Reveal from '../../components/animation/Reveal';
import useProjectStore from '../../store/projectStore';
import { projectAPI } from '../../services/api';
import { capitalize, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TeamPage = () => {
  const { projectId } = useParams();
  const { fetchProject, currentProject } = useProjectStore();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ email: '', role: 'tester' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchProject(projectId); }, [projectId, fetchProject]);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const addMember = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) return toast.error('Email is required');
    if (!EMAIL_RE.test(form.email)) return toast.error('Please enter a valid email address');
    setLoading(true);
    try {
      await projectAPI.addMember(projectId, form);
      toast.success('Member added');
      fetchProject(projectId);
      setAddOpen(false);
      setForm({ email: '', role: 'tester' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setLoading(false);
  };

  const removeMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await projectAPI.removeMember(projectId, userId);
      toast.success('Member removed');
      fetchProject(projectId);
    } catch { toast.error('Failed'); }
  };

  const roleColors = { project_admin: 'text-[#ff5c1a]', manager: 'text-blue-400', tester: 'text-green-400', developer: 'text-purple-400', viewer: 'text-white/40' };

  return (
    <AppShell
      title="Team"
      subtitle={`${currentProject?.members?.length || 0} members`}
      actions={
        <Button icon={<UserPlus size={14} />} size="sm" onClick={() => setAddOpen(true)}>Add Member</Button>
      }
    >
      <div className="p-5">
        <Reveal variant="up">
          <Card className="p-0 overflow-hidden">
            <div className="grid grid-cols-4 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02] text-xs text-white/40 font-medium uppercase tracking-wider">
              <span>Member</span><span>Role</span><span>Joined</span><span>Actions</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {currentProject?.members?.map(m => (
                <div key={m.user?._id} className="grid grid-cols-4 items-center px-5 py-3.5 hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar user={m.user} size="sm" />
                    <div>
                      <p className="text-sm text-white/80">{m.user?.name}</p>
                      <p className="text-xs text-white/40">{m.user?.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${roleColors[m.role] || 'text-white/40'}`}>
                    {capitalize(m.role)}
                  </span>
                  <span className="text-xs text-white/40">{formatDate(m.joinedAt)}</span>
                  <button onClick={() => removeMember(m.user?._id)} className="text-white/30 hover:text-red-400 transition-colors w-fit">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Team Member" size="sm">
        <form onSubmit={addMember} className="space-y-4">
          <Input label="Email Address" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="colleague@company.com" required />
          <Select label="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            {['project_admin', 'manager', 'tester', 'developer', 'viewer'].map(r => (
              <option key={r} value={r}>{capitalize(r)}</option>
            ))}
          </Select>
          <div className="flex justify-end">
            <Button type="submit" loading={loading}>Add Member</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
};

export default TeamPage;

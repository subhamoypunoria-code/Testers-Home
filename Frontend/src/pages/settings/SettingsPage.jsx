import { useState } from 'react';
import { User, Lock } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Reveal from '../../components/animation/Reveal';
import useAuthStore from '../../store/authStore';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(profileForm);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setLoading(false);
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password too short');
    setLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={14} /> },
    { id: 'security', label: 'Security', icon: <Lock size={14} /> },
  ];

  return (
    <AppShell title="Settings">
      <div className="p-6 max-w-[640px]">
        {/* Tab bar */}
        <Reveal variant="up">
          <div className="flex border-b border-white/[0.06] mb-6">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-transparent border-0 border-b-2 -mb-px cursor-pointer transition-colors ${
                  tab === t.id
                    ? 'text-[#ffb59e] border-[#ff5c1a]'
                    : 'text-white/40 border-transparent hover:text-white/70'
                }`}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </Reveal>

        {tab === 'profile' && (
          <Reveal variant="up" delay={0.05}>
            <form onSubmit={saveProfile} className="flex flex-col gap-4">
              {/* User card */}
              <Card className="flex items-center gap-4 p-5">
                <Avatar user={user} size="lg" />
                <div>
                  <p className="text-sm font-semibold text-white mb-0.5">{user?.name}</p>
                  <p className="text-xs text-white/40 mb-2">{user?.email}</p>
                  <span className="text-[11px] bg-[rgba(255,92,26,0.12)] text-[#ffb59e] px-2.5 py-0.5 rounded-full font-semibold capitalize">
                    {user?.role?.replace(/_/g, ' ')}
                  </span>
                </div>
              </Card>

              <Card className="p-5 flex flex-col gap-4">
                <Input label="Full Name" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
                <Input label="Avatar URL" value={profileForm.avatar} onChange={e => setProfileForm(f => ({ ...f, avatar: e.target.value }))} placeholder="https://example.com/avatar.jpg" />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" loading={loading}>Save Changes</Button>
                </div>
              </Card>
            </form>
          </Reveal>
        )}

        {tab === 'security' && (
          <Reveal variant="up" delay={0.05}>
            <Card className="p-5 flex flex-col gap-4">
              <h3 className="font-sora text-sm font-bold text-white mb-1">Change Password</h3>
              <Input label="Current Password" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required />
              <Input label="New Password" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required />
              <Input label="Confirm New Password" type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
              <div className="flex justify-end">
                <Button type="submit" size="sm" loading={loading} onClick={savePassword}>Update Password</Button>
              </div>
            </Card>
          </Reveal>
        )}
      </div>
    </AppShell>
  );
};

export default SettingsPage;

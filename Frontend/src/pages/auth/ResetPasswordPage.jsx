import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await authAPI.resetPassword(token, form.password);
      setDone(true);
      toast.success('Password reset successfully');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 hero-mesh">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6 no-underline">
            <div className="w-9 h-9 bg-[#ff5c1a] rounded-xl flex items-center justify-center shadow-[0_0_24px_rgba(255,92,26,0.35)]">
              <Shield size={18} className="text-white" />
            </div>
            <span className="font-sora font-bold text-white text-lg">Testers Home</span>
          </Link>
          <h1 className="text-xl font-bold text-white mb-1">Set new password</h1>
          <p className="text-sm text-white/50">Enter your new password below</p>
        </div>

        <div className="glass-card rounded-[20px] p-6">
          {done ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={22} className="text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Password updated</h3>
              <p className="text-xs text-white/50 mb-4">Redirecting you to login…</p>
              <Link to="/login" className="text-sm text-[#ff5c1a] hover:text-[#ff7a45]">Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min 6 characters"
                required
                minLength={6}
                icon={<Lock size={15} />}
              />
              <Input
                label="Confirm Password"
                type="password"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                placeholder="Re-enter password"
                required
                icon={<Lock size={15} />}
              />
              <Button type="submit" loading={loading} className="w-full">
                Reset Password
              </Button>
              <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors no-underline">
                <ArrowLeft size={14} />
                Back to login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

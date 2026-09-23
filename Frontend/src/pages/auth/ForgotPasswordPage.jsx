import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
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
            <span className="font-sora font-bold text-lg text-white/90">Testers Home</span>
          </Link>
          <h1 className="text-xl font-bold text-white/90 mb-1">Reset your password</h1>
          <p className="text-sm text-white/50">We'll send you a reset link</p>
        </div>

        <div className="glass-card rounded-[20px] p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={22} className="text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-white/90 mb-2">Check your inbox</h3>
              <p className="text-xs text-white/40 mb-4">We sent a password reset link to <span className="text-white/60">{email}</span></p>
              <Link to="/login" className="text-sm text-[#ff5c1a] hover:text-[#ff7a45]">Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                icon={<Mail size={15} />}
              />
              <Button type="submit" loading={loading} className="w-full">
                Send Reset Link
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

export default ForgotPasswordPage;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ChevronDown, User, Mail, Lock } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'tester' });
  const [showPass, setShowPass] = useState(false);
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Full name is required');
    if (!EMAIL_RE.test(form.email)) return toast.error('Please enter a valid email address');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      await register(form);
      toast.success('Account created! Welcome to Testers Home.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const navLinks = ['Home', 'About', 'Blog', 'Pages', 'Contact'];

  const inputClass =
    'w-full bg-[rgba(255,255,255,0.88)] hover:bg-white focus:bg-white text-gray-900 placeholder:text-gray-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors duration-200';

  return (
    <div className="min-h-screen w-full bg-black flex overflow-hidden relative">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 lg:px-10 lg:py-6">
        <ul className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((item) => (
            <li key={item}>
              <Link
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className="text-sm text-white/70 hover:text-white transition-colors no-underline"
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4 ml-auto">
          <button className="hidden sm:flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
            English <ChevronDown size={14} />
          </button>
          <Link
            to="/login"
            className="text-sm text-white/80 hover:text-white transition-colors no-underline"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-sm bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-white/90 transition-colors no-underline"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Left panel — hero visual */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-1/2 relative items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/robot-helmet.svg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 relative z-10">
        <div className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-7 sm:p-8 shadow-2xl">
          <div className="text-center mb-7">
            <h1 className="text-[28px] sm:text-[32px] font-bold text-white leading-tight">
              Create Account
            </h1>
            <h2 className="text-[16px] sm:text-[18px] text-white/60">
              Start managing defects the right way
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className={`${inputClass} pl-11`}
              />
            </div>

            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type="email"
                placeholder="Enter Email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                className={`${inputClass} pl-11`}
              />
            </div>

            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className={`${inputClass} appearance-none cursor-pointer`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
              }}
            >
              <option value="tester">Tester</option>
              <option value="developer">Developer</option>
              <option value="manager">Manager</option>
              <option value="viewer">Viewer</option>
            </select>

            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                className={`${inputClass} pl-11 pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer p-1 flex items-center justify-center"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black rounded-xl py-3 text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-none mt-1"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-[13px] text-white/45 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-white font-semibold hover:text-white/90 no-underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

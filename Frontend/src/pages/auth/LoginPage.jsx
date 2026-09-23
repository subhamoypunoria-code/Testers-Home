import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M24 12.073C24 5.403 18.627 0 12 0S0 5.403 0 12.073C0 18.098 4.388 23.093 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.037 1.791-4.746 4.533-4.746 1.312 0 2.686.236 2.686.236v2.99h-1.513c-1.49 0-1.955.94-1.955 1.904v2.334h3.328l-.532 3.49h-2.796V24C19.612 23.093 24 18.098 24 12.073z"
      fill="currentColor"
    />
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) return toast.error('Email is required');
    if (!form.password) return toast.error('Password is required');
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
              Hello!
            </h1>
            <h2 className="text-[24px] sm:text-[28px] font-semibold text-white/90">
              Welcome Back
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Enter Email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              className={inputClass}
            />

            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer p-1 flex items-center justify-center"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-white/55 hover:text-white/85 transition-colors no-underline"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black rounded-xl py-3 text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-none mt-1"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/15" />
            <span className="text-xs text-white/45 whitespace-nowrap">Or continue with</span>
            <div className="flex-1 h-px bg-white/15" />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 h-11 rounded-xl bg-white hover:bg-white/90 flex items-center justify-center text-black transition-colors cursor-pointer border-none"
            >
              <FacebookIcon />
            </button>
            <button
              type="button"
              className="flex-1 h-11 rounded-xl bg-white hover:bg-white/90 flex items-center justify-center text-black transition-colors cursor-pointer border-none"
            >
              <AppleIcon />
            </button>
            <button
              type="button"
              className="flex-1 h-11 rounded-xl bg-white hover:bg-white/90 flex items-center justify-center transition-colors cursor-pointer border-none"
            >
              <GoogleIcon />
            </button>
          </div>

          <p className="text-center text-[13px] text-white/45 mt-6">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-white font-semibold hover:text-white/90 no-underline"
            >
              Create Account!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

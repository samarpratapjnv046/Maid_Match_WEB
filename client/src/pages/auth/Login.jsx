import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      redirectByRole(user.role);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  function redirectByRole(role) {
    if (role === 'worker') navigate('/worker/dashboard', { replace: true });
    else if (role === 'admin') navigate('/admin', { replace: true });
    else navigate('/search', { replace: true });
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      toast.error('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const loggedInUser = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${loggedInUser.name?.split(' ')[0]}!`);
      redirectByRole(loggedInUser.role);
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* ── Left panel ───────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative flex-col justify-between bg-[#1B2B4B] p-12 overflow-hidden">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #C9A84C 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Gold glow blobs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#C9A84C] opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-12 w-64 h-64 bg-[#C9A84C] opacity-10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C9A84C] rounded-full flex items-center justify-center shadow-lg shadow-[#C9A84C]/30">
            <span className="text-white font-bold text-base">M</span>
          </div>
          <span className="font-serif text-2xl font-semibold text-white tracking-wide">
            MaidEase
          </span>
        </div>

        {/* Main content */}
        <div className="relative">
          <div className="w-10 h-0.5 bg-[#C9A84C] mb-8" />
          <h2 className="font-serif text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Welcome<br />
            <span className="text-[#C9A84C] italic">back.</span>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed max-w-xs">
            Sign in to manage your bookings, connect with helpers, and keep your home running smoothly.
          </p>

          {/* Quote card */}
          <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-[#C9A84C] text-sm">★</span>
              ))}
            </div>
            <p className="text-gray-300 text-sm italic leading-relaxed">
              &ldquo;MaidEase has made finding reliable household help effortless. Truly a game-changer
              for busy families.&rdquo;
            </p>
            <p className="mt-3 text-[#C9A84C] text-xs font-semibold uppercase tracking-widest">
              Ananya R. — Delhi
            </p>
          </div>
        </div>

        {/* Bottom trust row */}
        <div className="relative flex items-center gap-6 text-xs text-gray-500 font-medium">
          <span>✓ Verified Workers</span>
          <span>✓ Secure Payments</span>
          <span>✓ 4.8★ Rated</span>
        </div>
      </div>

      {/* ── Right panel (form) ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-[#FAF8F3] px-4 sm:px-8 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#C9A84C] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-serif text-xl font-semibold text-[#1B2B4B]">MaidEase</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-[#1B2B4B] mb-1.5">
              Sign in to your account
            </h1>
            <p className="text-gray-500 text-sm">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="text-[#C9A84C] font-semibold hover:text-[#a8832a] transition-colors"
              >
                Create one free
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#1B2B4B] mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#1B2B4B] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 accent-[#C9A84C] cursor-pointer"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-[#C9A84C] font-medium hover:text-[#a8832a] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2.5 bg-[#1B2B4B] hover:bg-[#152238] disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 px-6 rounded-lg shadow-md shadow-[#1B2B4B]/20 transition-all duration-200 hover:-translate-y-0.5 mt-1"
            >
              {loading ? (
                <>
                  <Spinner size="sm" color="white" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[#FAF8F3] text-xs text-gray-400 font-medium">
                New to MaidEase?
              </span>
            </div>
          </div>

          <Link
            to="/register"
            className="w-full flex items-center justify-center gap-2 border-2 border-[#C9A84C]/50 hover:border-[#C9A84C] text-[#C9A84C] font-semibold text-sm py-3 px-6 rounded-lg transition-all duration-200 hover:bg-[#C9A84C]/5"
          >
            Create a free account
          </Link>

          {/* Footer note */}
          <p className="mt-8 text-center text-xs text-gray-400 leading-relaxed">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-gray-600 transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline hover:text-gray-600 transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

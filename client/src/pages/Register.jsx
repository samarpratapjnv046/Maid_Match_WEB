import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Lock, Phone, Eye, EyeOff, Loader2, AlertCircle, Briefcase, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords don't match.");
      return;
    }
    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }

    try {
      const { name, email, password, phone, role } = formData;
      const data = await register({ name, email, password, phone, role });
      const userRole = data?.user?.role || role;
      if (userRole === 'worker') navigate('/worker/dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
    } catch (err) {
      setLocalError(typeof err === 'string' ? err : 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-2xl font-bold text-primary-600 mb-6">
            Maid<span className="text-gray-900">Match</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-2xl border border-gray-100">
          {/* Role selector */}
          <div className="flex gap-3 mb-6">
            {[
              { value: 'customer', label: 'I need a Maid', icon: ShoppingBag },
              { value: 'worker', label: 'I am a Worker', icon: Briefcase },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData({ ...formData, role: value })}
                className={`flex-1 flex flex-col items-center gap-2 py-3.5 px-3 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
                  formData.role === value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          {localError && (
            <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User size={16} className="text-gray-400" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="input-field pl-10"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone size={16} className="text-gray-400" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  className="input-field pl-10"
                  placeholder="9876543210"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  className="input-field pl-10 pr-10"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  className="input-field pl-10 pr-10"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shadow-primary-200 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            By creating an account, you agree to our{' '}
            <span className="text-primary-600 cursor-pointer hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-primary-600 cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

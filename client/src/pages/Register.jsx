import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import {
  User, Mail, Lock, Phone, Eye, EyeOff, Loader2, AlertCircle,
  Briefcase, ShoppingBag, MapPin, ChevronRight, ChevronLeft,
  DollarSign, Star, Globe, FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SERVICE_OPTIONS = [
  { value: 'house_cleaning', label: 'House Cleaning' },
  { value: 'deep_cleaning', label: 'Deep Cleaning' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'babysitting', label: 'Babysitting' },
  { value: 'elder_care', label: 'Elder Care' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'gardening', label: 'Gardening' },
  { value: 'driver', label: 'Driver' },
  { value: 'security_guard', label: 'Security Guard' },
];

const LANGUAGE_OPTIONS = ['Hindi', 'English', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Urdu'];

const InputField = ({ label, icon: Icon, error, children, className = '' }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon size={16} className="text-gray-400" />
        </div>
      )}
      {children}
    </div>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 — account
    name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'customer',
    // Step 2 — worker profile
    gender: '', bio: '', services: [],
    hourly: '', daily: '', monthly: '',
    experience_years: '', languages: [],
    city: '', state: '', pincode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState('');
  const [step1Loading, setStep1Loading] = useState(false);
  const [step2Loading, setStep2Loading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLocalError('');
  };

  const toggleService = (val) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(val)
        ? prev.services.filter((s) => s !== val)
        : [...prev.services, val],
    }));
  };

  const toggleLanguage = (val) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(val)
        ? prev.languages.filter((l) => l !== val)
        : [...prev.languages, val],
    }));
  };

  // Step 1 validation & submission
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords don't match.");
      return;
    }
    const pwdPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!pwdPattern.test(formData.password)) {
      setLocalError('Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character (@$!%*?&).');
      return;
    }

    setStep1Loading(true);
    try {
      const { name, email, password, phone, role } = formData;
      await register({ name, email, password, phone, role });

      if (role === 'worker') {
        setStep(2);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setLocalError(typeof err === 'string' ? err : 'Registration failed. Please try again.');
    } finally {
      setStep1Loading(false);
    }
  };

  // Step 2 worker profile submission
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (formData.services.length === 0) {
      setLocalError('Please select at least one service you offer.');
      return;
    }
    if (!formData.gender) {
      setLocalError('Please select your gender.');
      return;
    }
    if (!formData.city || !formData.state || !formData.pincode) {
      setLocalError('Please fill in your city, state, and pincode.');
      return;
    }

    try {
      setStep2Loading(true);
      const profilePayload = {
        gender: formData.gender,
        bio: formData.bio,
        services: formData.services,
        pricing: {
          hourly: Number(formData.hourly) || 0,
          daily: Number(formData.daily) || 0,
          monthly: Number(formData.monthly) || 0,
        },
        experience_years: Number(formData.experience_years) || 0,
        languages: formData.languages,
        location: {
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
      };

      await api.post('/workers/profile', profilePayload);
      navigate('/worker/dashboard', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save worker profile.';
      setLocalError(message);
    } finally {
      setStep2Loading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sm:mx-auto sm:w-full sm:max-w-lg"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-2xl font-bold text-primary-600 mb-6">
            Maid<span className="text-gray-900">Match</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {step === 1 ? 'Create your account' : 'Set up your worker profile'}
          </h2>
          {step === 1 ? (
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                Sign in
              </Link>
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              Almost there! Tell customers what you offer.
            </p>
          )}
        </div>

        {/* Progress indicator for workers */}
        {formData.role === 'worker' && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  s < step ? 'bg-primary-600 text-white' :
                  s === step ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 2 && <div className={`w-12 h-0.5 ${s < step ? 'bg-primary-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-2xl border border-gray-100">
          {localError && (
            <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
                onSubmit={handleStep1Submit}
              >
                {/* Role selector */}
                <div className="flex gap-3 mb-2">
                  {[
                    { value: 'customer', label: 'I need a Maid', icon: ShoppingBag },
                    { value: 'worker', label: 'I am a Worker', icon: Briefcase },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, role: value }))}
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

                <InputField label="Full Name" icon={User}>
                  <input
                    name="name" type="text" required autoComplete="name"
                    className="input-field pl-10" placeholder="John Doe"
                    value={formData.name} onChange={handleChange}
                  />
                </InputField>

                <InputField label="Email address" icon={Mail}>
                  <input
                    name="email" type="email" required autoComplete="email"
                    className="input-field pl-10" placeholder="you@example.com"
                    value={formData.email} onChange={handleChange}
                  />
                </InputField>

                <InputField label="Phone Number" icon={Phone}>
                  <input
                    name="phone" type="tel" required autoComplete="tel"
                    className="input-field pl-10" placeholder="9876543210" maxLength={10}
                    value={formData.phone} onChange={handleChange}
                  />
                </InputField>

                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Password" icon={Lock}>
                    <input
                      name="password" type={showPassword ? 'text' : 'password'}
                      required autoComplete="new-password"
                      className="input-field pl-10 pr-10" placeholder="Min. 8 chars"
                      value={formData.password} onChange={handleChange}
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </InputField>

                  <InputField label="Confirm Password" icon={Lock}>
                    <input
                      name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                      required autoComplete="new-password"
                      className="input-field pl-10 pr-10" placeholder="Repeat"
                      value={formData.confirmPassword} onChange={handleChange}
                    />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </InputField>
                </div>

                <button
                  type="submit"
                  disabled={step1Loading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shadow-primary-200 mt-2"
                >
                  {step1Loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Creating account…</>
                  ) : formData.role === 'worker' ? (
                    <><span>Continue</span><ChevronRight size={16} /></>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
                onSubmit={handleStep2Submit}
              >
                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    {['male', 'female', 'other'].map((g) => (
                      <button key={g} type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, gender: g }))}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                          formData.gender === g
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Services Offered <span className="text-red-500">*</span>
                    <span className="ml-1 text-xs text-gray-400">(select all that apply)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_OPTIONS.map(({ value, label }) => (
                      <button key={value} type="button"
                        onClick={() => toggleService(value)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          formData.services.includes(value)
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign size={14} className="inline mr-1" />
                    Pricing (₹)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: 'hourly', label: 'Per Hour' },
                      { name: 'daily', label: 'Per Day' },
                      { name: 'monthly', label: 'Monthly' },
                    ].map(({ name, label }) => (
                      <div key={name}>
                        <label className="block text-xs text-gray-500 mb-1">{label}</label>
                        <input
                          name={name} type="number" min="0"
                          className="input-field text-sm" placeholder="0"
                          value={formData[name]} onChange={handleChange}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience & Bio */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Star size={14} className="inline mr-1" />Experience (years)
                    </label>
                    <input
                      name="experience_years" type="number" min="0" max="50"
                      className="input-field" placeholder="e.g. 3"
                      value={formData.experience_years} onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Globe size={14} className="inline mr-1" />Languages
                    </label>
                    <div className="flex flex-wrap gap-1 p-2 border border-gray-300 rounded-xl min-h-[42px] max-h-24 overflow-y-auto">
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                          className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                            formData.languages.includes(lang)
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <FileText size={14} className="inline mr-1" />Bio
                    <span className="ml-1 text-xs text-gray-400">(optional, max 500 chars)</span>
                  </label>
                  <textarea
                    name="bio" rows={2} maxLength={500}
                    className="input-field resize-none" placeholder="Tell customers about yourself, your experience, and availability…"
                    value={formData.bio} onChange={handleChange}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={14} className="inline mr-1" />
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      name="city" type="text" required
                      className="input-field" placeholder="City"
                      value={formData.city} onChange={handleChange}
                    />
                    <input
                      name="state" type="text" required
                      className="input-field" placeholder="State"
                      value={formData.state} onChange={handleChange}
                    />
                    <input
                      name="pincode" type="text" required maxLength={6}
                      className="input-field col-span-2" placeholder="Pincode"
                      value={formData.pincode} onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button"
                    onClick={() => { setStep(1); setLocalError(''); }}
                    className="flex items-center gap-1.5 px-5 py-3 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={step2Loading}
                    className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shadow-primary-200"
                  >
                    {step2Loading ? (
                      <><Loader2 size={16} className="animate-spin" /> Saving profile…</>
                    ) : (
                      'Complete Registration'
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {step === 1 && (
            <p className="mt-6 text-center text-xs text-gray-400">
              By creating an account, you agree to our{' '}
              <span className="text-primary-600 cursor-pointer hover:underline">Terms of Service</span>
              {' '}and{' '}
              <span className="text-primary-600 cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

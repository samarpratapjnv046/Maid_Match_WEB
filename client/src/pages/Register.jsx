import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import api from '../api/axios';
import {
  User, Mail, Lock, Phone, Eye, EyeOff, Loader2, AlertCircle,
  Briefcase, ShoppingBag, MapPin, ChevronRight, ChevronLeft,
  DollarSign, Star, Globe, FileText, Send, KeyRound, CheckCircle,
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
    name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'customer', pincode: '',
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

  // OTP state
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

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

  // OTP cooldown timer
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setTimeout(() => setOtpCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCooldown]);

  // Validate step 1 form fields (client-side only)
  const validateStep1Fields = () => {
    if (formData.password !== formData.confirmPassword) return "Passwords don't match.";
    const pwdPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!pwdPattern.test(formData.password)) return 'Password must be at least 8 characters and include uppercase, lowercase, number and special character.';
    if (!/^\d{6}$/.test(formData.pincode)) return 'Please enter a valid 6-digit pincode.';
    if (!formData.name.trim()) return 'Name is required.';
    if (!formData.email.trim()) return 'Email is required.';
    if (!formData.phone.trim()) return 'Phone is required.';
    return null;
  };

  const handleSendOTP = async () => {
    const err = validateStep1Fields();
    if (err) { setLocalError(err); return; }
    setLocalError('');
    setOtpSending(true);
    try {
      await api.post('/auth/send-register-otp', { email: formData.email, name: formData.name });
      setOtpSent(true);
      setOtpCooldown(60);
    } catch (e) {
      setLocalError(e.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  // Step 1 validation & submission (now requires OTP)
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!otpSent) {
      setLocalError('Please verify your email first — click "Send OTP".');
      return;
    }
    if (!otp || otp.length !== 6) {
      setLocalError('Please enter the 6-digit OTP sent to your email.');
      return;
    }

    const fieldErr = validateStep1Fields();
    if (fieldErr) { setLocalError(fieldErr); return; }

    setStep1Loading(true);
    try {
      const { name, email, password, phone, role, pincode } = formData;
      await register({ name, email, password, phone, role, pincode, otp });

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Language switcher — fixed top-right */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sm:mx-auto sm:w-full sm:max-w-lg"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-2xl font-bold text-primary-600 mb-6">
            Maid<span className="text-gray-900">Saathi</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {step === 1 ? t('register.step1Title') : t('register.step2Title')}
          </h2>
          {step === 1 ? (
            <p className="mt-2 text-sm text-gray-600">
              {t('register.alreadyHaveAccount')}{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                {t('register.signIn')}
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
                    { value: 'customer', label: t('register.customerDesc'), icon: ShoppingBag },
                    { value: 'worker', label: t('register.workerDesc'), icon: Briefcase },
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

                <InputField label={t('register.fullName')} icon={User}>
                  <input
                    name="name" type="text" required autoComplete="name"
                    className="input-field pl-10" placeholder={t('register.namePlaceholder')}
                    value={formData.name} onChange={handleChange}
                  />
                </InputField>

                <InputField label={t('register.email')} icon={Mail}>
                  <input
                    name="email" type="email" required autoComplete="email"
                    className="input-field pl-10" placeholder={t('register.emailPlaceholder')}
                    value={formData.email} onChange={handleChange}
                  />
                </InputField>

                <div className="grid grid-cols-2 gap-3">
                  <InputField label={t('register.phone')} icon={Phone}>
                    <input
                      name="phone" type="tel" required autoComplete="tel"
                      className="input-field pl-10" placeholder={t('register.phonePlaceholder')} maxLength={10}
                      value={formData.phone} onChange={handleChange}
                    />
                  </InputField>

                  <InputField label={<>{t('register.pincode')} <span className="text-red-500">*</span></>} icon={MapPin}>
                    <input
                      name="pincode" type="text" required maxLength={6}
                      className="input-field pl-10" placeholder={t('register.pincodePlaceholder')}
                      value={formData.pincode} onChange={handleChange}
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InputField label={t('register.password')} icon={Lock}>
                    <input
                      name="password" type={showPassword ? 'text' : 'password'}
                      required autoComplete="new-password"
                      className="input-field pl-10 pr-10" placeholder={t('register.passwordPlaceholder')}
                      value={formData.password} onChange={handleChange}
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </InputField>

                  <InputField label={t('register.confirmPassword')} icon={Lock}>
                    <input
                      name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                      required autoComplete="new-password"
                      className="input-field pl-10 pr-10" placeholder={t('register.confirmPasswordPlaceholder')}
                      value={formData.confirmPassword} onChange={handleChange}
                    />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </InputField>
                </div>

                {/* OTP section */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 space-y-3 mt-1">
                  <p className="text-xs text-blue-800 font-medium flex items-center gap-1.5">
                    <KeyRound size={13} />
                    Verify your email with a one-time code before creating your account.
                  </p>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Enter OTP</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setLocalError(''); }}
                        placeholder={otpSent ? '6-digit code' : 'Send OTP first'}
                        maxLength={6}
                        disabled={!otpSent}
                        className="input-field tracking-widest text-center disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpSending || otpCooldown > 0}
                      className="flex items-center gap-1.5 bg-[#1B2B4B] hover:bg-[#152238] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-2.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <Send size={12} />
                      {otpSending ? 'Sending…' : otpCooldown > 0 ? `Resend (${otpCooldown}s)` : otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                  {otpSent && (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <CheckCircle size={11} /> Code sent to <strong>{formData.email}</strong>. Valid for 10 minutes.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={step1Loading || !otpSent}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shadow-primary-200 mt-2"
                >
                  {step1Loading ? (
                    <><Loader2 size={16} className="animate-spin" /> {t('register.creating')}</>
                  ) : formData.role === 'worker' ? (
                    <><span>{t('register.continue')}</span><ChevronRight size={16} /></>
                  ) : (
                    t('register.createAccount')
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">{t('login.or')}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Google Sign Up */}
                <button
                  type="button"
                  onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google?role=${formData.role}`; }}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  {t('login.continueWithGoogle')} ({formData.role === 'worker' ? t('register.worker') : t('register.customer')})
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
                    <ChevronLeft size={16} /> {t('register.back')}
                  </button>
                  <button
                    type="submit"
                    disabled={step2Loading}
                    className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shadow-primary-200"
                  >
                    {step2Loading ? (
                      <><Loader2 size={16} className="animate-spin" /> {t('register.submitting')}</>
                    ) : (
                      t('register.createAccount')
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {step === 1 && (
            <p className="mt-6 text-center text-xs text-gray-400">
              {t('register.termsPrefix')}{' '}
              <Link to="/terms" className="text-primary-600 hover:underline">{t('register.termsOfService')}</Link>
              {' '}{t('register.and')}{' '}
              <Link to="/privacy" className="text-primary-600 hover:underline">{t('register.privacyPolicy')}</Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

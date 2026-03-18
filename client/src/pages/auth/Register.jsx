import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  User, Mail, Lock, Phone, MapPin, Briefcase, ChevronRight,
  ChevronLeft, Eye, EyeOff, ArrowRight, CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import { serviceIcons, serviceLabels } from '../../utils/helpers';

const SERVICE_KEYS = Object.keys(serviceLabels);

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const STEPS_CUSTOMER = ['Account', 'Personal', 'Done'];
const STEPS_WORKER = ['Account', 'Personal', 'Services', 'Location', 'Done'];

// ─── small helpers ────────────────────────────────────────────────────────────

function InputField({ id, label, icon: Icon, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[#1B2B4B] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        )}
        <input
          id={id}
          {...props}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-white border ${
            error ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]'
          } rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SelectField({ id, label, icon: Icon, error, children, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[#1B2B4B] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
          />
        )}
        <select
          id={id}
          {...props}
          className={`w-full appearance-none ${Icon ? 'pl-10' : 'pl-4'} pr-8 py-3 bg-white border ${
            error ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]'
          } rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 transition-colors cursor-pointer`}
        >
          {children}
        </select>
        <ChevronRight
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepBar({ steps, current }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.slice(0, -1).map((step, idx) => {
        const state = idx < current ? 'done' : idx === current ? 'active' : 'upcoming';
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  state === 'done'
                    ? 'bg-[#C9A84C] text-white'
                    : state === 'active'
                    ? 'bg-[#1B2B4B] text-white ring-4 ring-[#1B2B4B]/15'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {state === 'done' ? <CheckCircle size={14} /> : idx + 1}
              </div>
              <span
                className={`text-[10px] font-medium whitespace-nowrap hidden sm:block ${
                  state === 'active' ? 'text-[#1B2B4B]' : state === 'done' ? 'text-[#C9A84C]' : 'text-gray-400'
                }`}
              >
                {step}
              </span>
            </div>
            <div
              className={`flex-1 h-0.5 mx-2 mb-4 sm:mb-5 rounded transition-all duration-300 ${
                state === 'done' ? 'bg-[#C9A84C]' : 'bg-gray-200'
              }`}
            />
          </div>
        );
      })}
      {/* Last step label */}
      <div className="flex flex-col items-center gap-1">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            current === steps.length - 2 ? 'bg-[#1B2B4B] text-white ring-4 ring-[#1B2B4B]/15' : 'bg-gray-200 text-gray-400'
          }`}
        >
          {steps.length - 1}
        </div>
        <span
          className={`text-[10px] font-medium hidden sm:block ${
            current === steps.length - 2 ? 'text-[#1B2B4B]' : 'text-gray-400'
          }`}
        >
          {steps[steps.length - 2]}
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    // Common
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    // Worker-specific
    services: [],
    hourlyRate: '',
    dailyRate: '',
    monthlyRate: '',
    city: '',
    state: '',
    pincode: '',
    gender: '',
    bio: '',
  });

  const isWorker = form.role === 'worker';
  const STEPS = isWorker ? STEPS_WORKER : STEPS_CUSTOMER;
  // Last real step before "Done" screen
  const LAST_STEP = STEPS.length - 2;

  function set(name, value) {
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    set(name, value);
  }

  function toggleService(key) {
    setForm((p) => ({
      ...p,
      services: p.services.includes(key)
        ? p.services.filter((s) => s !== key)
        : [...p.services, key],
    }));
    setErrors((p) => ({ ...p, services: '' }));
  }

  // ── Validation per step ─────────────────────────────────────────────────

  function validateStep(s) {
    const e = {};

    if (s === 0) {
      // Account step
      if (!form.name.trim()) e.name = 'Full name is required.';
      else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';

      if (!form.email.trim()) e.email = 'Email is required.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.';

      if (!form.password) e.password = 'Password is required.';
      else if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    }

    if (s === 1) {
      // Personal step
      if (!form.phone.trim()) e.phone = 'Phone number is required.';
      else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, '')))
        e.phone = 'Enter a valid 10-digit Indian mobile number.';

      if (isWorker) {
        if (!form.gender) e.gender = 'Please select your gender.';
      }
    }

    if (isWorker) {
      if (s === 2) {
        // Services step
        if (form.services.length === 0) e.services = 'Select at least one service.';
        if (!form.hourlyRate && !form.dailyRate && !form.monthlyRate)
          e.pricing = 'Please provide at least one rate (hourly, daily, or monthly).';
      }

      if (s === 3) {
        // Location step
        if (!form.city.trim()) e.city = 'City is required.';
        if (!form.state) e.state = 'State is required.';
        if (!form.pincode.trim()) e.pincode = 'Pincode is required.';
        else if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit pincode.';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function nextStep() {
    if (validateStep(step)) setStep((s) => s + 1);
  }

  function prevStep() {
    setStep((s) => Math.max(0, s - 1));
  }

  // ── Submit ──────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!validateStep(step)) return;
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        role: form.role,
      };

      if (isWorker) {
        payload.services = form.services;
        if (form.hourlyRate) payload.hourlyRate = Number(form.hourlyRate);
        if (form.dailyRate) payload.dailyRate = Number(form.dailyRate);
        if (form.monthlyRate) payload.monthlyRate = Number(form.monthlyRate);
        payload.city = form.city.trim();
        payload.state = form.state;
        payload.pincode = form.pincode.trim();
        payload.gender = form.gender;
        if (form.bio.trim()) payload.bio = form.bio.trim();
      }

      const registeredUser = await register(payload);
      toast.success(`Welcome to MaidEase, ${registeredUser.name?.split(' ')[0]}!`);
      setStep(STEPS.length - 1); // show "Done" screen briefly then redirect

      setTimeout(() => {
        if (registeredUser.role === 'worker') navigate('/worker/dashboard', { replace: true });
        else navigate('/search', { replace: true });
      }, 1200);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  // ── Role toggle resets step ─────────────────────────────────────────────

  function handleRoleChange(role) {
    setForm((p) => ({ ...p, role }));
    setStep(0);
    setErrors({});
  }

  // ── Render steps ────────────────────────────────────────────────────────

  function renderStep() {
    // Done screen
    if (step === STEPS.length - 1) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#C9A84C]/15 flex items-center justify-center">
            <CheckCircle size={36} className="text-[#C9A84C]" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1B2B4B]">You&apos;re all set!</h3>
          <p className="text-gray-500 text-sm">Redirecting you to your dashboard…</p>
          <Spinner size="md" color="gold" />
        </div>
      );
    }

    // Step 0: Account
    if (step === 0) {
      return (
        <div className="space-y-4">
          <InputField
            id="name"
            name="name"
            label="Full Name"
            icon={User}
            type="text"
            autoComplete="name"
            placeholder="Rahul Sharma"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
          />
          <InputField
            id="email"
            name="email"
            label="Email Address"
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="rahul@example.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#1B2B4B] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-11 py-3 bg-white border ${
                  errors.password
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]'
                } rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            {form.password && (
              <div className="mt-1.5 flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1 rounded-full transition-colors ${
                      form.password.length >= (i === 0 ? 1 : i === 1 ? 6 : 10)
                        ? i === 0
                          ? 'bg-red-400'
                          : i === 1
                          ? 'bg-yellow-400'
                          : 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Step 1: Personal
    if (step === 1) {
      return (
        <div className="space-y-4">
          <InputField
            id="phone"
            name="phone"
            label="Mobile Number"
            icon={Phone}
            type="tel"
            autoComplete="tel"
            placeholder="9876543210"
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
          />
          {isWorker && (
            <>
              <SelectField
                id="gender"
                name="gender"
                label="Gender"
                value={form.gender}
                onChange={handleChange}
                error={errors.gender}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </SelectField>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-[#1B2B4B] mb-1.5">
                  Bio{' '}
                  <span className="text-gray-400 font-normal text-xs">(optional)</span>
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  placeholder="Tell clients a little about yourself, your experience, and what makes you great at your work…"
                  value={form.bio}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-colors resize-none"
                />
              </div>
            </>
          )}
        </div>
      );
    }

    // Step 2 (worker only): Services + Pricing
    if (isWorker && step === 2) {
      return (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#1B2B4B] mb-2">
              Services You Offer
            </label>
            {errors.services && (
              <p className="text-xs text-red-500 mb-2">{errors.services}</p>
            )}
            <div className="grid grid-cols-3 gap-2">
              {SERVICE_KEYS.map((key) => {
                const selected = form.services.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleService(key)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all duration-150 ${
                      selected
                        ? 'border-[#C9A84C] bg-[#C9A84C]/8 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-[#C9A84C]/40'
                    }`}
                  >
                    <span className="text-2xl">{serviceIcons[key]}</span>
                    <span
                      className={`text-[11px] font-medium leading-tight ${
                        selected ? 'text-[#1B2B4B]' : 'text-gray-600'
                      }`}
                    >
                      {serviceLabels[key]}
                    </span>
                    {selected && (
                      <CheckCircle size={12} className="text-[#C9A84C] mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-sm font-medium text-[#1B2B4B] mb-1">
              Your Rates{' '}
              <span className="text-gray-400 font-normal text-xs">(fill at least one)</span>
            </p>
            {errors.pricing && (
              <p className="text-xs text-red-500 mb-2">{errors.pricing}</p>
            )}
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'hourlyRate', label: 'Hourly (₹)', placeholder: '200' },
                { name: 'dailyRate', label: 'Daily (₹)', placeholder: '1500' },
                { name: 'monthlyRate', label: 'Monthly (₹)', placeholder: '15000' },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                  <input
                    type="number"
                    name={name}
                    min="0"
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Step 3 (worker only): Location
    if (isWorker && step === 3) {
      return (
        <div className="space-y-4">
          <InputField
            id="city"
            name="city"
            label="City"
            icon={MapPin}
            type="text"
            placeholder="Mumbai"
            value={form.city}
            onChange={handleChange}
            error={errors.city}
          />
          <SelectField
            id="state"
            name="state"
            label="State"
            value={form.state}
            onChange={handleChange}
            error={errors.state}
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </SelectField>
          <InputField
            id="pincode"
            name="pincode"
            label="Pincode"
            icon={MapPin}
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="400001"
            value={form.pincode}
            onChange={handleChange}
            error={errors.pincode}
          />
        </div>
      );
    }

    return null;
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex overflow-hidden">
      {/* ── Left decorative panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[40%] xl:w-[38%] relative flex-col justify-between bg-[#1B2B4B] p-12 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #C9A84C 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#C9A84C] opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C9A84C] opacity-10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C9A84C] rounded-full flex items-center justify-center shadow-lg shadow-[#C9A84C]/30">
            <span className="text-white font-bold text-base">M</span>
          </div>
          <span className="font-serif text-2xl font-semibold text-white">MaidEase</span>
        </div>

        {/* Content */}
        <div className="relative space-y-6">
          <div className="w-10 h-0.5 bg-[#C9A84C]" />
          <h2 className="font-serif text-4xl xl:text-5xl font-bold text-white leading-tight">
            Join India&apos;s<br />
            <span className="text-[#C9A84C] italic">Premier</span><br />
            Home Services<br />
            Platform
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Whether you need help at home or want to offer your skills —
            MaidEase connects families and professionals across 100+ cities.
          </p>

          <div className="space-y-3">
            {[
              { icon: '🏠', text: 'Browse 10,000+ verified helpers' },
              { icon: '💳', text: 'Secure escrow payments' },
              { icon: '⭐', text: '4.8 average customer rating' },
              { icon: '🔒', text: 'Background-checked professionals' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <span className="text-gray-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-[#C9A84C] font-semibold hover:text-[#e0c570]">
            Sign in
          </Link>
        </div>
      </div>

      {/* ── Right: form panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-[#FAF8F3] px-4 sm:px-8 py-10 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#C9A84C] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-serif text-xl font-semibold text-[#1B2B4B]">MaidEase</span>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="font-serif text-3xl font-bold text-[#1B2B4B] mb-1">
              Create your account
            </h1>
            <p className="text-gray-500 text-sm">
              Already have one?{' '}
              <Link
                to="/login"
                className="text-[#C9A84C] font-semibold hover:text-[#a8832a] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Role selector — only show on step 0 */}
          {step === 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-[#1B2B4B] mb-2">I want to…</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    role: 'customer',
                    icon: '🏠',
                    label: 'Hire a Helper',
                    sub: 'Find & book trusted home workers',
                  },
                  {
                    role: 'worker',
                    icon: <Briefcase size={20} className="text-inherit" />,
                    label: 'Offer Services',
                    sub: 'List your skills & earn money',
                  },
                ].map(({ role, icon, label, sub }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleChange(role)}
                    className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all duration-150 text-left ${
                      form.role === role
                        ? 'border-[#C9A84C] bg-[#C9A84C]/8 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-[#C9A84C]/40'
                    }`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          form.role === role ? 'text-[#1B2B4B]' : 'text-gray-700'
                        }`}
                      >
                        {label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                    </div>
                    {form.role === role && (
                      <CheckCircle size={14} className="text-[#C9A84C] self-end mt-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step progress bar (skip "Done" in bar) */}
          {step < STEPS.length - 1 && (
            <StepBar steps={STEPS} current={step} />
          )}

          {/* Step title */}
          {step < STEPS.length - 1 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-[#C9A84C] uppercase tracking-widest mb-1">
                Step {step + 1} of {STEPS.length - 1}
              </p>
              <h2 className="font-serif text-xl font-bold text-[#1B2B4B]">
                {STEPS[step]}
              </h2>
            </div>
          )}

          {/* Step content */}
          <div className="animate-fadeIn">
            {renderStep()}
          </div>

          {/* Navigation */}
          {step < STEPS.length - 1 && (
            <div className="flex items-center justify-between mt-8 gap-3">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#1B2B4B] px-4 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 bg-white transition-all"
                >
                  <ChevronLeft size={15} /> Back
                </button>
              ) : (
                <div />
              )}

              {step < LAST_STEP ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="group flex items-center gap-2 bg-[#1B2B4B] hover:bg-[#152238] text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-md shadow-[#1B2B4B]/20 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Continue
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="group flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b8923e] disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-md shadow-[#C9A84C]/20 transition-all duration-200 hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" color="white" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight
                        size={15}
                        className="group-hover:translate-x-1 transition-transform duration-200"
                      />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Bottom note */}
          {step === 0 && (
            <p className="mt-6 text-center text-xs text-gray-400 leading-relaxed">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="underline hover:text-gray-600">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

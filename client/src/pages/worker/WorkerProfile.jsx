import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  User,
  MapPin,
  Briefcase,
  DollarSign,
  Globe,
  Camera,
  Save,
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import { serviceIcons, serviceLabels } from '../../utils/helpers';

const ALL_SERVICES = Object.keys(serviceLabels);

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const INITIAL_FORM = {
  services: [],
  pricing: { hourly: '', daily: '', monthly: '' },
  experience_years: '',
  bio: '',
  languages: '',
  gender: '',
  location: { city: '', state: '', pincode: '' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function inputClass(hasError = false) {
  return `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-colors bg-white ${
    hasError ? 'border-red-400' : 'border-gray-200'
  }`;
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-sm font-medium text-[#1B2B4B] mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-gray-100 mb-5">
      <div className="w-9 h-9 rounded-lg bg-[#1B2B4B]/8 flex items-center justify-center flex-shrink-0">
        <Icon size={17} className="text-[#C9A84C]" />
      </div>
      <div>
        <h3 className="font-serif text-base font-semibold text-[#1B2B4B]">{title}</h3>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

// ─── Verification badge ───────────────────────────────────────────────────────
function VerificationBadge({ status }) {
  if (!status) return null;
  const map = {
    verified: {
      cls: 'bg-green-50 border-green-200 text-green-800',
      icon: <CheckCircle size={14} className="text-green-600" />,
      label: 'Verified Worker',
      desc: 'Your profile has been verified by MaidMatch.',
    },
    under_review: {
      cls: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Clock size={14} className="text-blue-600" />,
      label: 'Under Review',
      desc: 'Your profile is being reviewed by our team.',
    },
    pending: {
      cls: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertCircle size={14} className="text-amber-600" />,
      label: 'Pending Verification',
      desc: 'Complete your profile to speed up verification.',
    },
    rejected: {
      cls: 'bg-red-50 border-red-200 text-red-800',
      icon: <AlertCircle size={14} className="text-red-600" />,
      label: 'Verification Rejected',
      desc: 'Please update your profile and contact support.',
    },
  };
  const cfg = map[status] || map.pending;
  return (
    <div className={`flex items-start gap-3 border rounded-xl p-4 ${cfg.cls}`}>
      <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
      <div>
        <p className="font-semibold text-sm">{cfg.label}</p>
        <p className="text-xs mt-0.5 opacity-80">{cfg.desc}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function WorkerProfile() {
  const { user, switchMode } = useAuth();
  const navigate = useNavigate();
  const isSetupMode = user?.role === 'customer'; // customer completing profile to switch to worker
  const photoInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // ─── Fetch existing profile ─────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/workers/profile/me');
      const profile = data.data?.worker || data.data || data.worker || data;
      setProfileExists(true);
      setVerificationStatus(profile.verification_status || 'pending');
      setCurrentPhoto(profile.user_id?.profilePhoto?.url || null);

      // Populate form
      setForm({
        services: profile.services || [],
        pricing: {
          hourly: profile.pricing?.hourly ?? '',
          daily: profile.pricing?.daily ?? '',
          monthly: profile.pricing?.monthly ?? '',
        },
        experience_years: profile.experience_years ?? '',
        bio: profile.bio || '',
        languages: Array.isArray(profile.languages)
          ? profile.languages.join(', ')
          : profile.languages || '',
        gender: profile.gender || '',
        location: {
          city: profile.location?.city || profile.city || '',
          state: profile.location?.state || profile.state || '',
          pincode: profile.location?.pincode || profile.pincode || '',
        },
      });
    } catch (err) {
      if (err?.response?.status === 404) {
        setProfileExists(false);
      } else {
        toast.error('Failed to load profile.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ─── Form change handlers ───────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    if (name.startsWith('pricing.')) {
      const field = name.split('.')[1];
      setForm((prev) => ({ ...prev, pricing: { ...prev.pricing, [field]: value } }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    } else if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setForm((prev) => ({ ...prev, location: { ...prev.location, [field]: value } }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function toggleService(svc) {
    setForm((prev) => {
      const current = prev.services;
      const updated = current.includes(svc)
        ? current.filter((s) => s !== svc)
        : [...current, svc];
      return { ...prev, services: updated };
    });
    setErrors((prev) => ({ ...prev, services: '' }));
  }

  // ─── Photo upload ───────────────────────────────────────────────────────────
  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be under 5 MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    setPhotoPreview(URL.createObjectURL(file));
    handlePhotoUpload(file);
  }

  async function handlePhotoUpload(file) {
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);
      const { data } = await api.post('/workers/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = data.data?.url || data.url || data.data?.photoUrl;
      if (url) setCurrentPhoto(url);
      toast.success('Profile photo updated!');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to upload photo.';
      toast.error(msg);
      setPhotoPreview(null);
    } finally {
      setPhotoUploading(false);
    }
  }

  // ─── Validation ─────────────────────────────────────────────────────────────
  function validate() {
    const e = {};
    if (form.services.length === 0) e.services = 'Select at least one service.';
    if (!form.pricing.hourly && !form.pricing.daily && !form.pricing.monthly) {
      e['pricing.hourly'] = 'Set at least one pricing option.';
    }
    if (form.pricing.hourly && (isNaN(form.pricing.hourly) || Number(form.pricing.hourly) <= 0)) {
      e['pricing.hourly'] = 'Hourly rate must be a positive number.';
    }
    if (form.pricing.daily && (isNaN(form.pricing.daily) || Number(form.pricing.daily) <= 0)) {
      e['pricing.daily'] = 'Daily rate must be a positive number.';
    }
    if (form.pricing.monthly && (isNaN(form.pricing.monthly) || Number(form.pricing.monthly) <= 0)) {
      e['pricing.monthly'] = 'Monthly rate must be a positive number.';
    }
    if (form.experience_years !== '' && (isNaN(form.experience_years) || Number(form.experience_years) < 0)) {
      e.experience_years = 'Experience must be a non-negative number.';
    }
    if (!form.location.city.trim()) e['location.city'] = 'City is required.';
    if (!form.location.state.trim()) e['location.state'] = 'State is required.';
    return e;
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors before saving.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        services: form.services,
        pricing: {
          ...(form.pricing.hourly ? { hourly: Number(form.pricing.hourly) } : {}),
          ...(form.pricing.daily ? { daily: Number(form.pricing.daily) } : {}),
          ...(form.pricing.monthly ? { monthly: Number(form.pricing.monthly) } : {}),
        },
        experience_years: form.experience_years !== '' ? Number(form.experience_years) : undefined,
        bio: form.bio.trim(),
        languages: form.languages
          ? form.languages.split(',').map((l) => l.trim()).filter(Boolean)
          : [],
        gender: form.gender || undefined,
        location: {
          city: form.location.city.trim(),
          state: form.location.state.trim(),
          pincode: form.location.pincode.trim(),
        },
      };

      if (profileExists) {
        await api.patch('/workers/profile', payload);
        toast.success('Profile updated successfully!');
        fetchProfile();
      } else {
        await api.post('/workers/profile', payload);
        toast.success('Profile created! Switching you to worker mode…');
        // If a customer just completed setup, switch their role to worker
        if (isSetupMode) {
          const result = await switchMode('worker');
          if (result?.role === 'worker') {
            navigate('/worker/dashboard');
            return;
          }
        }
        setProfileExists(true);
        fetchProfile();
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save profile.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" color="navy" />
          <p className="text-gray-500 text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  const displayPhoto = photoPreview || currentPhoto;
  const nameInitial = user?.name?.[0]?.toUpperCase() || 'W';

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* ─── Page header ─────────────────────────────────────────────────────── */}
      <div className="bg-[#1B2B4B] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest mb-2">
            {isSetupMode ? 'Become a Worker' : 'Worker Portal'}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            {isSetupMode ? 'Complete Your Worker Profile' : profileExists ? 'Edit Profile' : 'Create Profile'}
          </h1>
          <p className="mt-2 text-gray-400 text-sm">
            {isSetupMode
              ? 'Fill in your details to start offering services and receiving booking requests.'
              : profileExists
              ? 'Keep your profile up-to-date to attract more customers.'
              : 'Set up your worker profile to start receiving booking requests.'}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ─── Verification status ─────────────────────────────────────────── */}
        {profileExists && (
          <VerificationBadge status={verificationStatus} />
        )}

        {/* ─── Photo section ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionHeader
            icon={Camera}
            title="Profile Photo"
            description="A clear photo helps customers recognize you"
          />

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#C9A84C]/20 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#1B2B4B] flex items-center justify-center border-4 border-[#C9A84C]/20 shadow-md">
                  <span className="text-white font-serif font-bold text-3xl">{nameInitial}</span>
                </div>
              )}
              {photoUploading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <Spinner size="md" color="white" />
                </div>
              )}
            </div>

            {/* Upload controls */}
            <div className="flex flex-col gap-3 text-center sm:text-left">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={photoUploading}
                className="inline-flex items-center gap-2 bg-[#1B2B4B] hover:bg-[#152238] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
              >
                <Upload size={14} />
                {photoUploading ? 'Uploading…' : displayPhoto ? 'Change Photo' : 'Upload Photo'}
              </button>
              <p className="text-xs text-gray-400">
                JPG, PNG or WEBP. Max 5 MB. Square images work best.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Profile form ────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">

          {/* Services */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader
              icon={Briefcase}
              title="Services Offered"
              description="Select all services you are able to provide"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ALL_SERVICES.map((svc) => {
                const selected = form.services.includes(svc);
                return (
                  <button
                    key={svc}
                    type="button"
                    onClick={() => toggleService(svc)}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 text-center text-xs font-medium transition-all duration-150 ${
                      selected
                        ? 'border-[#C9A84C] bg-[#C9A84C]/8 text-[#1B2B4B] shadow-sm'
                        : 'border-gray-200 text-gray-500 hover:border-[#C9A84C]/40 hover:bg-[#FAF8F3]'
                    }`}
                  >
                    <span className="text-2xl leading-none">{serviceIcons[svc]}</span>
                    <span>{serviceLabels[svc]}</span>
                    {selected && (
                      <CheckCircle size={12} className="text-[#C9A84C] absolute top-2 right-2" />
                    )}
                  </button>
                );
              })}
            </div>
            {errors.services && (
              <p className="text-red-500 text-xs mt-2">{errors.services}</p>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader
              icon={DollarSign}
              title="Pricing"
              description="Set your rates — leave blank for any duration you don't offer"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { key: 'hourly', label: 'Hourly Rate', placeholder: 'e.g. 150', unit: '/hour' },
                { key: 'daily', label: 'Daily Rate', placeholder: 'e.g. 800', unit: '/day' },
                { key: 'monthly', label: 'Monthly Rate', placeholder: 'e.g. 12000', unit: '/month' },
              ].map(({ key, label, placeholder, unit }) => (
                <div key={key}>
                  <FieldLabel>{label}</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      ₹
                    </span>
                    <input
                      type="number"
                      name={`pricing.${key}`}
                      value={form.pricing[key]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      min="0"
                      className={`w-full pl-7 pr-14 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] transition-colors bg-white ${
                        errors[`pricing.${key}`] ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                      {unit}
                    </span>
                  </div>
                  {errors[`pricing.${key}`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`pricing.${key}`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader
              icon={User}
              title="About You"
              description="Help customers get to know you better"
            />

            <div className="space-y-4">
              {/* Bio */}
              <div>
                <FieldLabel>Bio / Introduction</FieldLabel>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={4}
                  maxLength={1000}
                  placeholder="Tell customers about yourself, your experience, and why they should hire you…"
                  className={inputClass(!!errors.bio)}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.bio && <p className="text-red-500 text-xs">{errors.bio}</p>}
                  <p className="text-xs text-gray-400 ml-auto">{form.bio.length}/1000</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Experience */}
                <div>
                  <FieldLabel>Years of Experience</FieldLabel>
                  <input
                    type="number"
                    name="experience_years"
                    value={form.experience_years}
                    onChange={handleChange}
                    placeholder="e.g. 3"
                    min="0"
                    max="50"
                    className={inputClass(!!errors.experience_years)}
                  />
                  {errors.experience_years && (
                    <p className="text-red-500 text-xs mt-1">{errors.experience_years}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <FieldLabel>Gender</FieldLabel>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className={inputClass(!!errors.gender)}
                  >
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Languages */}
              <div>
                <FieldLabel>Languages Spoken</FieldLabel>
                <input
                  type="text"
                  name="languages"
                  value={form.languages}
                  onChange={handleChange}
                  placeholder="e.g. Hindi, English, Marathi (comma-separated)"
                  className={inputClass(!!errors.languages)}
                />
                <p className="text-xs text-gray-400 mt-1">Separate multiple languages with commas.</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <SectionHeader
              icon={MapPin}
              title="Service Location"
              description="Where are you available to work?"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FieldLabel required>City</FieldLabel>
                <input
                  type="text"
                  name="location.city"
                  value={form.location.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                  className={inputClass(!!errors['location.city'])}
                />
                {errors['location.city'] && (
                  <p className="text-red-500 text-xs mt-1">{errors['location.city']}</p>
                )}
              </div>

              <div>
                <FieldLabel required>State</FieldLabel>
                <input
                  type="text"
                  name="location.state"
                  value={form.location.state}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra"
                  className={inputClass(!!errors['location.state'])}
                />
                {errors['location.state'] && (
                  <p className="text-red-500 text-xs mt-1">{errors['location.state']}</p>
                )}
              </div>

              <div>
                <FieldLabel>Pincode</FieldLabel>
                <input
                  type="text"
                  name="location.pincode"
                  value={form.location.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 400001"
                  maxLength={6}
                  className={inputClass(!!errors['location.pincode'])}
                />
                {errors['location.pincode'] && (
                  <p className="text-red-500 text-xs mt-1">{errors['location.pincode']}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 pb-6">
            <button
              type="submit"
              disabled={saving || photoUploading}
              className="flex-1 flex items-center justify-center gap-2.5 bg-[#C9A84C] hover:bg-[#b8923e] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl shadow-md shadow-[#C9A84C]/20 transition-all duration-150 hover:-translate-y-0.5 text-sm"
            >
              {saving ? (
                <>
                  <Spinner size="sm" color="white" />
                  {profileExists ? 'Saving…' : 'Creating Profile…'}
                </>
              ) : (
                <>
                  <Save size={16} />
                  {profileExists ? 'Save Changes' : 'Create Profile'}
                </>
              )}
            </button>

            {profileExists && (
              <button
                type="button"
                onClick={() => navigate('/worker/dashboard')}
                disabled={saving}
                className="sm:w-36 border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

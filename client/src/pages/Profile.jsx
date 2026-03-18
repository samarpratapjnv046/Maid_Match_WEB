import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Lock, Camera, Save, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const photoRef = useRef(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
    },
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  function handleFormChange(e) {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5 MB.'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return; }

    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('profilePhoto', file);
      const res = await api.patch('/auth/me', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const updated = res.data?.data || res.data;
      if (updated?.profilePhoto?.url) {
        updateUser({ profilePhoto: updated.profilePhoto });
      }
      toast.success('Profile photo updated!');
    } catch {
      toast.error('Failed to upload photo.');
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch('/auth/me', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address,
      });
      const updated = res.data?.data || res.data;
      updateUser({ name: updated?.name, phone: updated?.phone, address: updated?.address });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    setChangingPassword(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
        confirmPassword: pwForm.confirmPassword,
      });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  }

  const photo = user?.profilePhoto?.url;
  const initials = user?.name?.[0]?.toUpperCase() || '?';

  const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors bg-white';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your profile and security settings</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Avatar section */}
        <SectionCard title="Profile Photo">
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              {photo ? (
                <img src={photo} alt={user.name} className="w-20 h-20 rounded-full object-cover border-4 border-primary-100 shadow-md" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center border-4 border-primary-100 shadow-md">
                  <span className="text-white font-bold text-2xl">{initials}</span>
                </div>
              )}
              {photoUploading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <Spinner size="md" color="white" />
                </div>
              )}
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <button
                onClick={() => photoRef.current?.click()}
                disabled={photoUploading}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-200 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <Camera size={14} />
                {photoUploading ? 'Uploading…' : 'Change photo'}
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Personal info */}
        <SectionCard title="Personal Information">
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleFormChange}
                    className={`${inputClass} pl-10`}
                    placeholder="Full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className={`${inputClass} pl-10 bg-gray-50 text-gray-500 cursor-not-allowed`}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleFormChange}
                    maxLength={10}
                    className={`${inputClass} pl-10`}
                    placeholder="9876543210"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    name="address.street"
                    type="text"
                    value={form.address.street}
                    onChange={handleFormChange}
                    className={`${inputClass} pl-10`}
                    placeholder="Street address"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <input
                    name="address.city"
                    type="text"
                    value={form.address.city}
                    onChange={handleFormChange}
                    className={inputClass}
                    placeholder="City"
                  />
                  <input
                    name="address.state"
                    type="text"
                    value={form.address.state}
                    onChange={handleFormChange}
                    className={inputClass}
                    placeholder="State"
                  />
                  <input
                    name="address.pincode"
                    type="text"
                    value={form.address.pincode}
                    onChange={handleFormChange}
                    className={inputClass}
                    placeholder="Pincode"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                {saving ? <><Loader2 size={15} className="animate-spin" />Saving…</> : <><Save size={15} />Save changes</>}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* Change password */}
        <SectionCard title="Change Password">
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { name: 'currentPassword', label: 'Current Password', key: 'current' },
              { name: 'newPassword', label: 'New Password', key: 'new' },
              { name: 'confirmPassword', label: 'Confirm New Password', key: 'confirm' },
            ].map(({ name, label, key }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    name={name}
                    type={showPw[key] ? 'text' : 'password'}
                    required
                    value={pwForm[name]}
                    onChange={(e) => setPwForm((prev) => ({ ...prev, [name]: e.target.value }))}
                    className={`${inputClass} pl-10 pr-10`}
                    placeholder="••••••••"
                    autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((prev) => ({ ...prev, [key]: !prev[key] }))}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={changingPassword}
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                {changingPassword ? (
                  <><Loader2 size={15} className="animate-spin" />Changing…</>
                ) : (
                  <><Lock size={15} />Update Password</>
                )}
              </button>
            </div>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}

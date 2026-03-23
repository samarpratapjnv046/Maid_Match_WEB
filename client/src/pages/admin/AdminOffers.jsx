import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Tag, Video, Image, Clock, X, ChevronDown, Eye,
  Sparkles, Megaphone,
} from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/common/Spinner';

// ─── Gradient palette ─────────────────────────────────────────────────────────
const GRADIENTS = [
  { label: 'Sunset',    value: 'from-orange-500 to-red-500',     preview: 'bg-gradient-to-r from-orange-500 to-red-500' },
  { label: 'Ocean',     value: 'from-blue-500 to-cyan-500',       preview: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
  { label: 'Forest',    value: 'from-emerald-500 to-green-600',   preview: 'bg-gradient-to-r from-emerald-500 to-green-600' },
  { label: 'Purple',    value: 'from-violet-500 to-purple-600',   preview: 'bg-gradient-to-r from-violet-500 to-purple-600' },
  { label: 'Gold',      value: 'from-yellow-400 to-orange-500',   preview: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
  { label: 'Rose',      value: 'from-pink-500 to-rose-500',       preview: 'bg-gradient-to-r from-pink-500 to-rose-500' },
  { label: 'Midnight',  value: 'from-slate-700 to-gray-900',      preview: 'bg-gradient-to-r from-slate-700 to-gray-900' },
  { label: 'Indigo',    value: 'from-indigo-500 to-blue-600',     preview: 'bg-gradient-to-r from-indigo-500 to-blue-600' },
  { label: 'Teal',      value: 'from-teal-500 to-cyan-600',       preview: 'bg-gradient-to-r from-teal-500 to-cyan-600' },
  { label: 'Crimson',   value: 'from-red-600 to-rose-700',        preview: 'bg-gradient-to-r from-red-600 to-rose-700' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isExpired = (expires_at) =>
  expires_at && new Date(expires_at) < new Date();

const formatExpiry = (expires_at) => {
  if (!expires_at) return 'No expiry';
  const d = new Date(expires_at);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getYoutubeThumb = (url) => {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
};

// ─── Offer card preview ───────────────────────────────────────────────────────
function OfferPreviewCard({ offer }) {
  const expired = isExpired(offer.expires_at);
  const thumb   = getYoutubeThumb(offer.video_url);

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-md border border-white/10 h-36 bg-gradient-to-br ${offer.gradient}`}>
      {/* background image / youtube thumb */}
      {(offer.image_url || thumb) && (
        <img
          src={offer.image_url || thumb}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          loading="lazy"
          decoding="async"
        />
      )}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative h-full p-4 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          {offer.badge_text && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/25 text-white backdrop-blur-sm border border-white/30">
              {offer.badge_text}
            </span>
          )}
          {offer.discount_percent > 0 && (
            <span className="ml-auto text-lg font-black text-white drop-shadow">
              {offer.discount_percent}% OFF
            </span>
          )}
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight drop-shadow line-clamp-1">{offer.title}</p>
          {offer.subtitle && (
            <p className="text-white/80 text-xs mt-0.5 line-clamp-1">{offer.subtitle}</p>
          )}
        </div>
      </div>

      {/* Status chips */}
      <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
        {!offer.is_active && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-800/80 text-gray-300">INACTIVE</span>
        )}
        {expired && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600/80 text-white">EXPIRED</span>
        )}
        {offer.video_url && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/50 text-white flex items-center gap-0.5">
            <Video size={8} /> VIDEO
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Create / Edit modal ──────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: '', subtitle: '', description: '',
  badge_text: '', discount_percent: 0,
  gradient: 'from-orange-500 to-red-500',
  accent_color: '#f97316',
  video_url: '', image_url: '',
  cta_text: 'Book Now', cta_link: '/workers',
  is_active: true, expires_at: '', display_order: 0,
};

function OfferModal({ offer, onClose, onSaved }) {
  const isEdit = !!offer?._id;
  const [form, setForm] = useState(
    offer
      ? {
          ...EMPTY_FORM,
          ...offer,
          expires_at: offer.expires_at
            ? new Date(offer.expires_at).toISOString().slice(0, 16)
            : '',
        }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [gradOpen, setGradOpen] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        discount_percent: Number(form.discount_percent) || 0,
        display_order: Number(form.display_order) || 0,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      };
      if (isEdit) {
        await api.patch(`/admin/offers/${offer._id}`, payload);
        toast.success('Offer updated!');
      } else {
        await api.post('/admin/offers', payload);
        toast.success('Offer created!');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save offer.');
    } finally {
      setSaving(false);
    }
  };

  const selectedGrad = GRADIENTS.find((g) => g.value === form.gradient) || GRADIENTS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1B2B4B] flex items-center justify-center">
              <Megaphone size={16} className="text-[#C9A84C]" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#1B2B4B]">
                {isEdit ? 'Edit Offer' : 'Create Offer'}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Displayed on the user home page</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Form body — scrollable */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Live preview */}
          <div className="w-full">
            <OfferPreviewCard offer={form} />
          </div>

          {/* Title + Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                maxLength={100}
                placeholder="e.g. Summer Cleaning Offer"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subtitle</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => set('subtitle', e.target.value)}
                maxLength={150}
                placeholder="e.g. Limited time for new users"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              maxLength={500}
              placeholder="Short description shown on the card…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] resize-none"
            />
          </div>

          {/* Badge + Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Badge Text</label>
              <input
                type="text"
                value={form.badge_text}
                onChange={(e) => set('badge_text', e.target.value)}
                maxLength={30}
                placeholder="e.g. LIMITED TIME"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Discount % <span className="text-gray-400">(0 = hide)</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.discount_percent}
                onChange={(e) => set('discount_percent', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]"
              />
            </div>
          </div>

          {/* Gradient picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Card Gradient</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setGradOpen((v) => !v)}
                className="w-full flex items-center gap-3 px-3 py-2.5 border border-gray-200 rounded-xl text-sm hover:border-[#C9A84C] transition-colors"
              >
                <div className={`w-8 h-5 rounded-md ${selectedGrad.preview} flex-shrink-0`} />
                <span className="text-gray-700 flex-1 text-left">{selectedGrad.label}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${gradOpen ? 'rotate-180' : ''}`} />
              </button>
              {gradOpen && (
                <div className="absolute top-full mt-1 left-0 right-0 z-10 bg-white border border-gray-200 rounded-xl shadow-lg p-2 grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                  {GRADIENTS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => { set('gradient', g.value); setGradOpen(false); }}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors ${form.gradient === g.value ? 'ring-2 ring-[#C9A84C]' : ''}`}
                    >
                      <div className={`w-7 h-4 rounded-md ${g.preview} flex-shrink-0`} />
                      <span className="text-xs text-gray-700">{g.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Accent color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.accent_color}
                  onChange={(e) => set('accent_color', e.target.value)}
                  className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={form.accent_color}
                  onChange={(e) => set('accent_color', e.target.value)}
                  maxLength={7}
                  placeholder="#f97316"
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Display Order</label>
              <input
                type="number"
                min="0"
                value={form.display_order}
                onChange={(e) => set('display_order', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
              />
            </div>
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
              <Video size={12} /> YouTube Video URL
              <span className="text-gray-400 font-normal">(optional — plays in a lightbox on the home page)</span>
            </label>
            <input
              type="url"
              value={form.video_url}
              onChange={(e) => set('video_url', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
              <Image size={12} /> Background Image URL
              <span className="text-gray-400 font-normal">(optional — overlaid on gradient)</span>
            </label>
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => set('image_url', e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C]"
            />
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">CTA Button Text</label>
              <input
                type="text"
                value={form.cta_text}
                onChange={(e) => set('cta_text', e.target.value)}
                maxLength={40}
                placeholder="Book Now"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">CTA Link</label>
              <input
                type="text"
                value={form.cta_link}
                onChange={(e) => set('cta_link', e.target.value)}
                placeholder="/workers"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
              />
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
              <Clock size={12} /> Expiry Date & Time
              <span className="text-gray-400 font-normal">(leave blank for no expiry)</span>
            </label>
            <input
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => set('expires_at', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
            />
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
            <div
              className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-[#1B2B4B]' : 'bg-gray-300'}`}
              onClick={() => set('is_active', !form.is_active)}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_active ? 'left-6' : 'left-1'}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Active</p>
              <p className="text-xs text-gray-400">Show this offer on the home page</p>
            </div>
          </label>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#1B2B4B] text-white hover:bg-[#243a63] transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? <Spinner size={14} /> : <Sparkles size={14} />}
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Offer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────
function DeleteModal({ offer, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/offers/${offer._id}`);
      toast.success('Offer deleted.');
      onDeleted();
    } catch {
      toast.error('Failed to delete offer.');
    } finally {
      setDeleting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <Trash2 size={20} className="text-red-600" />
        </div>
        <div className="text-center">
          <h3 className="font-serif text-lg font-bold text-[#1B2B4B]">Delete Offer?</h3>
          <p className="text-sm text-gray-500 mt-1">
            "<span className="font-semibold">{offer.title}</span>" will be permanently removed from the home page.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5">
            {deleting ? <Spinner size={14} /> : <Trash2 size={14} />}
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminOffers() {
  const [offers,       setOffers]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showCreate,   setShowCreate]   = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [deleteOffer,  setDeleteOffer]  = useState(null);
  const [toggling,     setToggling]     = useState(null);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/offers');
      setOffers(Array.isArray(data.data) ? data.data : []);
    } catch {
      toast.error('Failed to load offers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  const handleToggle = async (offer) => {
    setToggling(offer._id);
    try {
      await api.patch(`/admin/offers/${offer._id}/toggle`);
      toast.success(`Offer ${offer.is_active ? 'deactivated' : 'activated'}.`);
      fetchOffers();
    } catch {
      toast.error('Failed to toggle offer.');
    } finally {
      setToggling(null);
    }
  };

  const active   = offers.filter((o) => o.is_active && !isExpired(o.expires_at));
  const inactive = offers.filter((o) => !o.is_active || isExpired(o.expires_at));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1B2B4B]">Offers & Promotions</h1>
          <p className="text-gray-500 text-sm mt-0.5">Create banners shown on the customer home page</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B2B4B] text-white text-sm font-semibold hover:bg-[#243a63] active:scale-[0.97] transition-all shadow"
        >
          <Plus size={16} />
          New Offer
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total',    value: offers.length,   color: 'text-[#1B2B4B]', bg: 'bg-white' },
          { label: 'Active',   value: active.length,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Inactive', value: inactive.length, color: 'text-gray-400',    bg: 'bg-gray-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-gray-100 shadow-sm p-4 text-center`}>
            <p className={`text-2xl font-black font-serif ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Offer list */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : offers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#C9A84C]/10 flex items-center justify-center mb-4">
            <Megaphone size={28} className="text-[#C9A84C]" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-[#1B2B4B] mb-1">No offers yet</h3>
          <p className="text-gray-400 text-sm mb-5">Create your first offer to display it on the home page.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B2B4B] text-white text-sm font-semibold hover:bg-[#243a63] transition-all"
          >
            <Plus size={16} /> Create Offer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {offers.map((offer) => {
            const expired = isExpired(offer.expires_at);
            const thumb   = getYoutubeThumb(offer.video_url);
            return (
              <div
                key={offer._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Card preview */}
                <OfferPreviewCard offer={offer} />

                {/* Meta */}
                <div className="p-4 flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-[#1B2B4B] text-sm leading-tight">{offer.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      offer.is_active && !expired
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {expired ? 'EXPIRED' : offer.is_active ? 'LIVE' : 'PAUSED'}
                    </span>
                  </div>

                  {offer.subtitle && (
                    <p className="text-xs text-gray-500 line-clamp-1">{offer.subtitle}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
                    {offer.discount_percent > 0 && (
                      <span className="flex items-center gap-1 font-semibold text-orange-600">
                        <Tag size={10} /> {offer.discount_percent}% OFF
                      </span>
                    )}
                    {offer.video_url && (
                      <span className="flex items-center gap-1">
                        <Video size={10} /> Video
                      </span>
                    )}
                    {offer.image_url && (
                      <span className="flex items-center gap-1">
                        <Image size={10} /> Image
                      </span>
                    )}
                    <span className="flex items-center gap-1 ml-auto">
                      <Clock size={10} /> {formatExpiry(offer.expires_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between gap-2">
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(offer)}
                    disabled={toggling === offer._id || expired}
                    title={offer.is_active ? 'Deactivate' : 'Activate'}
                    className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                      offer.is_active
                        ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {toggling === offer._id ? (
                      <Spinner size={12} />
                    ) : offer.is_active ? (
                      <ToggleRight size={14} />
                    ) : (
                      <ToggleLeft size={14} />
                    )}
                    {offer.is_active ? 'Active' : 'Inactive'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingOffer(offer)}
                      className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteOffer(offer)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <OfferModal
          offer={null}
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); fetchOffers(); }}
        />
      )}
      {editingOffer && (
        <OfferModal
          offer={editingOffer}
          onClose={() => setEditingOffer(null)}
          onSaved={() => { setEditingOffer(null); fetchOffers(); }}
        />
      )}
      {deleteOffer && (
        <DeleteModal
          offer={deleteOffer}
          onClose={() => setDeleteOffer(null)}
          onDeleted={() => { setDeleteOffer(null); fetchOffers(); }}
        />
      )}
    </div>
  );
}

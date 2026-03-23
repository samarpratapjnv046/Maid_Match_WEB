import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Tag, X, Percent, IndianRupee, Clock,
} from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/common/Spinner';

const EMPTY_FORM = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '',
  min_order_value: '',
  max_discount: '',
  usage_limit: '',
  is_active: true,
  expires_at: '',
};

const isExpired = (expires_at) => expires_at && new Date(expires_at) < new Date();

const formatExpiry = (expires_at) => {
  if (!expires_at) return 'No expiry';
  return new Date(expires_at).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/coupons');
      setCoupons(data.data || []);
    } catch {
      toast.error('Failed to load coupons.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(coupon) {
    setEditId(coupon._id);
    setForm({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_value: coupon.min_order_value || '',
      max_discount: coupon.max_discount || '',
      usage_limit: coupon.usage_limit || '',
      is_active: coupon.is_active,
      expires_at: coupon.expires_at
        ? new Date(coupon.expires_at).toISOString().slice(0, 16)
        : '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.code.trim()) return toast.error('Coupon code is required.');
    if (!form.discount_value || Number(form.discount_value) <= 0) {
      return toast.error('Enter a valid discount value.');
    }
    if (form.discount_type === 'percentage' && Number(form.discount_value) > 100) {
      return toast.error('Percentage discount cannot exceed 100.');
    }

    const payload = {
      code: form.code.toUpperCase().trim(),
      description: form.description,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_value: form.min_order_value ? Number(form.min_order_value) : 0,
      max_discount: form.max_discount ? Number(form.max_discount) : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      is_active: form.is_active,
      expires_at: form.expires_at || null,
    };

    setSaving(true);
    try {
      if (editId) {
        const { data } = await api.patch(`/admin/coupons/${editId}`, payload);
        setCoupons((prev) => prev.map((c) => (c._id === editId ? data.data : c)));
        toast.success('Coupon updated.');
      } else {
        const { data } = await api.post('/admin/coupons', payload);
        setCoupons((prev) => [data.data, ...prev]);
        toast.success('Coupon created.');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save coupon.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this coupon? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/coupons/${id}`);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      toast.success('Coupon deleted.');
    } catch {
      toast.error('Failed to delete coupon.');
    } finally {
      setDeleting(null);
    }
  }

  async function handleToggle(id) {
    setToggling(id);
    try {
      const { data } = await api.patch(`/admin/coupons/${id}/toggle`);
      setCoupons((prev) => prev.map((c) => (c._id === id ? data.data : c)));
    } catch {
      toast.error('Failed to toggle coupon status.');
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1B2B4B] font-serif">Coupon Codes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage discount coupons for customers</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b8923e] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Coupon
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" color="navy" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Tag size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No coupons yet</p>
          <p className="text-sm mt-1">Click "New Coupon" to create one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Discount</th>
                  <th className="px-4 py-3 text-left">Min Order</th>
                  <th className="px-4 py-3 text-left">Usage</th>
                  <th className="px-4 py-3 text-left">Expires</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((coupon) => {
                  const expired = isExpired(coupon.expires_at);
                  return (
                    <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#1B2B4B] bg-[#1B2B4B]/5 px-2 py-0.5 rounded">
                            {coupon.code}
                          </span>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{coupon.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-600">
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}%${coupon.max_discount ? ` (max ₹${coupon.max_discount})` : ''}`
                          : `₹${coupon.discount_value}`}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {coupon.min_order_value > 0 ? `₹${coupon.min_order_value}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {coupon.used_count}
                        {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ' / ∞'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={expired ? 'text-red-500 text-xs font-medium' : 'text-gray-600 text-xs'}>
                          {formatExpiry(coupon.expires_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {expired ? (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Expired</span>
                        ) : coupon.is_active ? (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Inactive</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggle(coupon._id)}
                            disabled={toggling === coupon._id}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-[#C9A84C] transition-colors"
                            title={coupon.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {toggling === coupon._id ? (
                              <Spinner size="xs" />
                            ) : coupon.is_active ? (
                              <ToggleRight size={16} className="text-emerald-500" />
                            ) : (
                              <ToggleLeft size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => openEdit(coupon)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-[#1B2B4B] transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id)}
                            disabled={deleting === coupon._id}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            {deleting === coupon._id ? <Spinner size="xs" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-serif font-bold text-[#1B2B4B] text-lg">
                {editId ? 'Edit Coupon' : 'Create Coupon'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">
              {/* Code */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Coupon Code *
                </label>
                <input
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. MAID20, SAVE50"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]"
                  required
                  disabled={!!editId}
                />
                {editId && (
                  <p className="text-xs text-gray-400 mt-1">Code cannot be changed after creation.</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Description
                </label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. 20% off on first booking"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]"
                />
              </div>

              {/* Discount type + value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Discount Type *
                  </label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm((p) => ({ ...p, discount_type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C] bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Discount Value *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {form.discount_type === 'percentage' ? (
                        <Percent size={13} />
                      ) : (
                        <IndianRupee size={13} />
                      )}
                    </span>
                    <input
                      type="number"
                      value={form.discount_value}
                      onChange={(e) => setForm((p) => ({ ...p, discount_value: e.target.value }))}
                      placeholder={form.discount_type === 'percentage' ? '20' : '50'}
                      min="1"
                      max={form.discount_type === 'percentage' ? '100' : undefined}
                      className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Min order & max discount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    value={form.min_order_value}
                    onChange={(e) => setForm((p) => ({ ...p, min_order_value: e.target.value }))}
                    placeholder="0 (no minimum)"
                    min="0"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]"
                  />
                </div>
                {form.discount_type === 'percentage' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Max Discount (₹)
                    </label>
                    <input
                      type="number"
                      value={form.max_discount}
                      onChange={(e) => setForm((p) => ({ ...p, max_discount: e.target.value }))}
                      placeholder="No cap"
                      min="1"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]"
                    />
                  </div>
                )}
              </div>

              {/* Usage limit & expiry */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={form.usage_limit}
                    onChange={(e) => setForm((p) => ({ ...p, usage_limit: e.target.value }))}
                    placeholder="Unlimited"
                    min="1"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Expires At
                  </label>
                  <input
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={(e) => setForm((p) => ({ ...p, expires_at: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 focus:border-[#C9A84C]"
                  />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Active</p>
                  <p className="text-xs text-gray-400">Only active coupons can be applied by customers</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
                  className="transition-colors"
                >
                  {form.is_active ? (
                    <ToggleRight size={28} className="text-emerald-500" />
                  ) : (
                    <ToggleLeft size={28} className="text-gray-300" />
                  )}
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#C9A84C] hover:bg-[#b8923e] disabled:opacity-60 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? <Spinner size="sm" color="white" /> : null}
                  {editId ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { getStatusColor, getStatusLabel } from '../../utils/helpers';

const TABS = [
  { key: 'pending',      label: 'Pending' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'verified',     label: 'Verified' },
  { key: 'rejected',     label: 'Rejected' },
];

function RatingStars({ rating }) {
  const r = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={12}
          className={i < r ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-gray-300'}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating ? Number(rating).toFixed(1) : '—'}</span>
    </div>
  );
}

export default function AdminWorkers() {
  const [workers, setWorkers]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('pending');
  const [actionLoading, setActionLoading] = useState(false);

  const [rejectModal, setRejectModal] = useState({ open: false, worker: null });
  const [rejectReason, setRejectReason] = useState('');

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/workers');
      setWorkers(res.data?.workers || res.data || []);
    } catch (err) {
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWorkers(); }, [fetchWorkers]);

  const tabWorkers = workers.filter((w) => {
    const status = w.verificationStatus || w.status;
    return status === activeTab;
  });

  const handleVerify = async (workerId) => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/workers/${workerId}/verify`);
      toast.success('Worker verified');
      fetchWorkers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Verification failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      await api.patch(`/admin/workers/${rejectModal.worker._id}/reject`, { reason: rejectReason });
      toast.success('Worker rejected');
      setRejectModal({ open: false, worker: null });
      fetchWorkers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#1B2B4B]">Workers</h1>
        <p className="text-gray-500 text-sm mt-0.5">Review and manage worker verification status</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1">
        {TABS.map((tab) => {
          const count = workers.filter((w) => (w.verificationStatus || w.status) === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap -mb-px ${
                activeTab === tab.key
                  ? 'border-[#C9A84C] text-[#1B2B4B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === tab.key ? 'bg-[#C9A84C]/20 text-[#1B2B4B]' : 'bg-gray-100 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : tabWorkers.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={`No ${TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} workers`}
          description="No workers match this status."
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Email', 'City', 'Services', 'Rating', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tabWorkers.map((w) => {
                  const status = w.verificationStatus || w.status;
                  return (
                    <tr key={w._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1B2B4B] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {w.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{w.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{w.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{w.city || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {(w.services || []).slice(0, 2).map((s) => (
                            <span key={s} className="bg-[#1B2B4B]/10 text-[#1B2B4B] text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                              {getStatusLabel(s)}
                            </span>
                          ))}
                          {(w.services || []).length > 2 && (
                            <span className="text-xs text-gray-400 self-center">+{w.services.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <RatingStars rating={w.rating} />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${getStatusColor(status)}`}>
                          {getStatusLabel(status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {(status === 'pending' || status === 'under_review') && (
                            <>
                              <button
                                onClick={() => handleVerify(w._id)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors disabled:opacity-50 whitespace-nowrap"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => { setRejectReason(''); setRejectModal({ open: true, worker: w }); }}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 whitespace-nowrap"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {status === 'verified' && (
                            <button
                              onClick={() => { setRejectReason(''); setRejectModal({ open: true, worker: w }); }}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              Revoke
                            </button>
                          )}
                          {status === 'rejected' && (
                            <button
                              onClick={() => handleVerify(w._id)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              Re-verify
                            </button>
                          )}
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

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, worker: null })}
        title="Reject Worker"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are rejecting <span className="font-semibold text-[#1B2B4B]">{rejectModal.worker?.name}</span>.
            Please provide a reason that will be shared with the worker.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete documents, invalid ID..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setRejectModal({ open: false, worker: null })}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectSubmit}
              disabled={actionLoading}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading && <Spinner size="sm" color="white" />}
              Confirm Reject
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

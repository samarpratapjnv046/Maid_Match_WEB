import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Star, Eye, FileText, ShieldCheck, ShieldX, User, Phone, Mail, MapPin, Clock, ExternalLink, Landmark, CheckCircle } from 'lucide-react';
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
        <Star key={i} size={12} className={i < r ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-gray-300'} />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating ? Number(rating).toFixed(1) : '—'}</span>
    </div>
  );
}

// ─── Document viewer modal ────────────────────────────────────────────────────
function WorkerDocModal({ workerId, onClose }) {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aadhaarExpanded, setAadhaarExpanded] = useState(false);
  const [passbookExpanded, setPassbookExpanded] = useState(false);

  useEffect(() => {
    api.get(`/admin/workers/${workerId}`)
      .then(({ data }) => setWorker(data.data))
      .catch(() => toast.error('Failed to load worker details.'))
      .finally(() => setLoading(false));
  }, [workerId]);

  const isPdf = worker?.aadhaar?.url?.includes('/raw/') || worker?.aadhaar?.url?.toLowerCase().includes('.pdf');
  const pdfViewUrl = (url) => `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`;
  const profilePhoto = worker?.user_id?.profilePhoto?.url;
  const name = worker?.user_id?.name || '—';
  const initials = name[0]?.toUpperCase() || '?';

  const rawNumber = worker?.aadhaar?.number || '';
  const maskedNumber = rawNumber.length === 12
    ? `${rawNumber.slice(0,4)} ${rawNumber.slice(4,8)} ${rawNumber.slice(8)}`
    : rawNumber || 'Not provided';

  return (
    <div className="space-y-5">
      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Worker identity */}
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            {profilePhoto ? (
              <img src={profilePhoto} alt={name} loading="lazy" decoding="async" className="w-16 h-16 rounded-full object-cover ring-2 ring-[#C9A84C]/30 ring-offset-2 flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#1B2B4B] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-serif font-bold text-2xl">{initials}</span>
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-serif font-semibold text-[#1B2B4B] text-lg leading-tight">{name}</h3>
              <div className="flex flex-col gap-0.5 mt-1">
                {worker?.user_id?.email && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Mail size={11} />
                    <span className="truncate">{worker.user_id.email}</span>
                  </div>
                )}
                {worker?.user_id?.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone size={11} />
                    <span>{worker.user_id.phone}</span>
                  </div>
                )}
                {worker?.location?.city && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin size={11} />
                    <span>{[worker.location.city, worker.location.state].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile photo section */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Profile Photo</p>
            {profilePhoto ? (
              <div className="relative inline-block">
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="h-36 w-36 rounded-xl object-cover border border-gray-200 shadow-sm"
                />
                <a href={profilePhoto} target="_blank" rel="noreferrer" className="absolute bottom-2 right-2 bg-white/90 hover:bg-white border border-gray-200 rounded-lg p-1.5 shadow text-gray-600 hover:text-[#1B2B4B] transition-colors" title="Open full size">
                  <ExternalLink size={13} />
                </a>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No profile photo uploaded.</p>
            )}
          </div>

          {/* Aadhaar section */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Aadhaar Document</p>

            {/* Number row */}
            <div className="flex items-center gap-2 mb-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <ShieldCheck size={15} className="text-[#C9A84C] flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 leading-none">Aadhaar Number</p>
                <p className="text-sm font-semibold text-[#1B2B4B] tracking-widest mt-0.5">{maskedNumber}</p>
              </div>
            </div>

            {/* Submission date */}
            {worker?.aadhaar?.submitted_at && (
              <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                <Clock size={10} />
                Submitted: {new Date(worker.aadhaar.submitted_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}

            {/* Document viewer */}
            {worker?.aadhaar?.url ? (
              isPdf ? (
                <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                  <FileText size={24} className="text-orange-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">Aadhaar PDF Document</p>
                    <p className="text-xs text-gray-500 mt-0.5">Click to open and review</p>
                  </div>
                  <a href={pdfViewUrl(worker.aadhaar.url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                    <ExternalLink size={12} />
                    View PDF
                  </a>
                </div>
              ) : (
                <div>
                  <div
                    className="relative group cursor-pointer rounded-xl overflow-hidden border border-gray-200 shadow-sm"
                    onClick={() => setAadhaarExpanded(!aadhaarExpanded)}
                  >
                    <img
                      src={worker.aadhaar.url}
                      alt="Aadhaar card"
                      className={`w-full object-contain bg-gray-50 transition-all duration-300 ${aadhaarExpanded ? 'max-h-[500px]' : 'max-h-48'}`}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full shadow transition-opacity">
                        {aadhaarExpanded ? 'Click to collapse' : 'Click to expand'}
                      </span>
                    </div>
                  </div>
                  <a href={worker.aadhaar.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-xs text-[#1B2B4B] hover:text-[#C9A84C] font-medium transition-colors">
                    <ExternalLink size={11} />
                    Open in new tab
                  </a>
                </div>
              )
            ) : (
              <div className="flex items-center gap-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl px-4 py-6 text-center">
                <div className="flex-1">
                  <FileText size={24} className="text-gray-300 mx-auto mb-1" />
                  <p className="text-sm text-gray-400">No Aadhaar document uploaded yet.</p>
                </div>
              </div>
            )}
          </div>

          {/* Bank Details section */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bank Details</p>
            {worker?.bank_details?.submitted_at ? (
              <div className="space-y-2">
                {/* Verified badge */}
                {worker.bank_details.is_verified && (
                  <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 w-fit">
                    <CheckCircle size={12} />
                    OTP Verified
                  </div>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Account Holder', value: worker.bank_details.account_holder_name },
                    { label: 'Bank Name', value: worker.bank_details.bank_name },
                    { label: 'Account Number', value: worker.bank_details.account_number },
                    { label: 'IFSC Code', value: worker.bank_details.ifsc_code },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-400 leading-none">{label}</p>
                      <p className="text-sm font-semibold text-[#1B2B4B] mt-0.5 tracking-wide">{value || '—'}</p>
                    </div>
                  ))}
                </div>

                {/* Submission date */}
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={10} />
                  Submitted: {new Date(worker.bank_details.submitted_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>

                {/* Passbook document */}
                {worker.bank_details.passbook?.url ? (
                  (() => {
                    const pbUrl = worker.bank_details.passbook.url;
                    const isPbPdf = pbUrl.includes('/raw/') || pbUrl.toLowerCase().includes('.pdf');
                    return isPbPdf ? (
                      <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                        <FileText size={22} className="text-orange-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">Bank Passbook (PDF)</p>
                          <p className="text-xs text-gray-500 mt-0.5">Click to open and review</p>
                        </div>
                        <a href={pdfViewUrl(pbUrl)} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                          <ExternalLink size={12} /> View PDF
                        </a>
                      </div>
                    ) : (
                      <div>
                        <div
                          className="relative group cursor-pointer rounded-xl overflow-hidden border border-gray-200 shadow-sm"
                          onClick={() => setPassbookExpanded(!passbookExpanded)}
                        >
                          <img
                            src={pbUrl}
                            alt="Bank passbook"
                            className={`w-full object-contain bg-gray-50 transition-all duration-300 ${passbookExpanded ? 'max-h-[500px]' : 'max-h-48'}`}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full shadow transition-opacity">
                              {passbookExpanded ? 'Click to collapse' : 'Click to expand'}
                            </span>
                          </div>
                        </div>
                        <a href={pbUrl} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 text-xs text-[#1B2B4B] hover:text-[#C9A84C] font-medium transition-colors">
                          <ExternalLink size={11} /> Open in new tab
                        </a>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-xs text-gray-400 italic">No passbook uploaded.</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl px-4 py-5 text-center">
                <div className="flex-1">
                  <Landmark size={22} className="text-gray-300 mx-auto mb-1" />
                  <p className="text-sm text-gray-400">Bank details not submitted yet.</p>
                </div>
              </div>
            )}
          </div>

          {/* Verification status */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusColor(worker?.verification_status)}`}>
              {getStatusLabel(worker?.verification_status)}
            </span>
            {worker?.rejection_reason && (
              <span className="text-xs text-red-600 italic">Reason: {worker.rejection_reason}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminWorkers() {
  const [workers, setWorkers]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState('pending');
  const [actionLoading, setActionLoading] = useState(false);

  const [rejectModal, setRejectModal]     = useState({ open: false, worker: null });
  const [rejectReason, setRejectReason]   = useState('');

  const [docModal, setDocModal]           = useState({ open: false, workerId: null, workerName: '' });

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/workers');
      setWorkers(res.data?.data || []);
    } catch {
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWorkers(); }, [fetchWorkers]);

  const tabWorkers = workers.filter((w) => w.verification_status === activeTab);

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
    if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return; }
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
        <p className="text-gray-500 text-sm mt-0.5">Review Aadhaar documents and manage worker verification</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1">
        {TABS.map((tab) => {
          const count = workers.filter((w) => w.verification_status === tab.key).length;
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
                  {['Worker', 'Contact', 'City', 'Services', 'Rating', 'Aadhaar', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tabWorkers.map((w) => {
                  const status = w.verification_status;
                  const hasAadhaar = !!(w.aadhaar?.url || w.aadhaar?.submitted_at);
                  const profilePhoto = w.user_id?.profilePhoto?.url;
                  const nameInitial = w.user_id?.name?.charAt(0)?.toUpperCase();

                  return (
                    <tr key={w._id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Worker */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {profilePhoto ? (
                            <img src={profilePhoto} alt={w.user_id?.name} loading="lazy" decoding="async" className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-200" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#1B2B4B] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {nameInitial}
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{w.user_id?.name}</span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-gray-600">{w.user_id?.email}</span>
                          {w.user_id?.phone && <span className="text-xs text-gray-400">{w.user_id.phone}</span>}
                        </div>
                      </td>

                      {/* City */}
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{w.location?.city || '—'}</td>

                      {/* Services */}
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

                      {/* Rating */}
                      <td className="px-4 py-3"><RatingStars rating={w.rating} /></td>

                      {/* Aadhaar submitted badge */}
                      <td className="px-4 py-3">
                        {hasAadhaar ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                            <ShieldCheck size={10} />
                            Submitted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                            <ShieldX size={10} />
                            Not yet
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${getStatusColor(status)}`}>
                          {getStatusLabel(status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {/* View Documents — always visible */}
                          <button
                            onClick={() => setDocModal({ open: true, workerId: w._id, workerName: w.user_id?.name || 'Worker' })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2B4B]/5 text-[#1B2B4B] border border-[#1B2B4B]/20 rounded-lg text-xs font-semibold hover:bg-[#1B2B4B]/10 transition-colors whitespace-nowrap"
                          >
                            <Eye size={12} />
                            View Docs
                          </button>

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

      {/* Document viewer modal */}
      <Modal
        isOpen={docModal.open}
        onClose={() => setDocModal({ open: false, workerId: null, workerName: '' })}
        title={`Documents — ${docModal.workerName}`}
        size="md"
      >
        {docModal.open && (
          <WorkerDocModal
            workerId={docModal.workerId}
            onClose={() => setDocModal({ open: false, workerId: null, workerName: '' })}
          />
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, worker: null })}
        title="Reject Worker"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are rejecting <span className="font-semibold text-[#1B2B4B]">{rejectModal.worker?.user_id?.name}</span>.
            Please provide a reason that will be shown to the worker.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Aadhaar image is blurry, number doesn't match…"
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

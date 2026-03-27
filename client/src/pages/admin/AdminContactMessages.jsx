import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Mail, MailOpen, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';

const PAGE_SIZE = 15;

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminContactMessages() {
  const [messages, setMessages]         = useState([]);
  const [total, setTotal]               = useState(0);
  const [unreadCount, setUnreadCount]   = useState(0);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [unreadOnly, setUnreadOnly]     = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // View modal
  const [viewModal, setViewModal]       = useState({ open: false, msg: null });
  // Delete confirm modal
  const [deleteModal, setDeleteModal]   = useState({ open: false, msg: null });

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: PAGE_SIZE });
      if (unreadOnly) params.set('unreadOnly', 'true');
      const res = await api.get(`/contact?${params}`);
      setMessages(res.data?.data || []);
      setTotal(res.data?.total || 0);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleView = async (msg) => {
    setViewModal({ open: true, msg });
    if (!msg.isRead) {
      try {
        await api.patch(`/contact/${msg._id}/read`);
        setMessages((prev) => prev.map((m) => m._id === msg._id ? { ...m, isRead: true } : m));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // non-critical — silently ignore
      }
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await api.delete(`/contact/${deleteModal.msg._id}`);
      toast.success('Message deleted');
      setDeleteModal({ open: false, msg: null });
      fetchMessages();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1B2B4B]">Contact Messages</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Messages submitted via the Contact Us page
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>

        {/* Unread filter toggle */}
        <button
          onClick={() => { setUnreadOnly((v) => !v); setPage(1); }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            unreadOnly
              ? 'bg-[#1B2B4B] text-white border-[#1B2B4B]'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Mail size={15} />
          {unreadOnly ? 'Showing Unread' : 'Show Unread Only'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : messages.length === 0 ? (
        <EmptyState icon="✉️" title="No messages found" description={unreadOnly ? 'No unread messages.' : 'No contact messages yet.'} />
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['', 'Name', 'Email', 'Subject', 'Received', 'Actions'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {messages.map((msg) => (
                    <tr
                      key={msg._id}
                      className={`hover:bg-gray-50/60 transition-colors ${!msg.isRead ? 'bg-blue-50/40' : ''}`}
                    >
                      {/* Read/unread dot */}
                      <td className="pl-4 pr-1 py-3 w-6">
                        {msg.isRead
                          ? <MailOpen size={14} className="text-gray-400" />
                          : <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" title="Unread" />
                        }
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#1B2B4B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {msg.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className={`text-sm whitespace-nowrap ${!msg.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {msg.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{msg.email}</td>

                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                        {msg.subject}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(msg.createdAt)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(msg)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="View message"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, msg })}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Delete message"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total} messages
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${
                        p === page ? 'bg-[#1B2B4B] text-white' : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── View message modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, msg: null })}
        title="Contact Message"
        size="md"
      >
        {viewModal.msg && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">From</p>
                <p className="font-medium text-gray-800">{viewModal.msg.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Email</p>
                <a href={`mailto:${viewModal.msg.email}`} className="text-[#C9A84C] hover:underline">
                  {viewModal.msg.email}
                </a>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Subject</p>
              <p className="font-medium text-gray-800">{viewModal.msg.subject}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Message</p>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
                {viewModal.msg.message}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">Received: {formatDate(viewModal.msg.createdAt)}</p>
              <div className="flex gap-2">
                <a
                  href={`mailto:${viewModal.msg.email}?subject=Re: ${encodeURIComponent(viewModal.msg.subject)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2B4B] text-white text-xs font-semibold rounded-lg hover:bg-[#0A1628] transition-colors"
                >
                  <Mail size={13} /> Reply via Email
                </a>
                <button
                  onClick={() => {
                    setViewModal({ open: false, msg: null });
                    setDeleteModal({ open: true, msg: viewModal.msg });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete confirm modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, msg: null })}
        title="Delete Message"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete the message from{' '}
            <span className="font-semibold text-[#1B2B4B]">{deleteModal.msg?.name}</span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteModal({ open: false, msg: null })}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={actionLoading}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading && <Spinner size="sm" color="white" />}
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

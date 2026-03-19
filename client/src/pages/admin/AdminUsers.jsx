import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, getStatusLabel } from '../../utils/helpers';

const PAGE_SIZE = 10;

function RoleBadge({ role }) {
  const map = {
    admin:  'bg-purple-100 text-purple-800',
    worker: 'bg-blue-100 text-blue-800',
    user:   'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${map[role] || 'bg-gray-100 text-gray-700'}`}>
      {role?.charAt(0).toUpperCase() + role?.slice(1)}
    </span>
  );
}

function StatusBadge({ banned }) {
  return banned
    ? <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-800">Banned</span>
    : <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-green-100 text-green-800">Active</span>;
}

export default function AdminUsers() {
  const [users, setUsers]           = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  // Ban modal
  const [banModal, setBanModal]     = useState({ open: false, user: null });
  const [banReason, setBanReason]   = useState('');

  // Unban confirm
  const [unbanModal, setUnbanModal] = useState({ open: false, user: null });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      const data = res.data?.data || [];
      setUsers(data);
      setFiltered(data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Search filter
  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      setFiltered(users);
    } else {
      setFiltered(
        users.filter(
          (u) =>
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q)
        )
      );
    }
    setPage(1);
  }, [search, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleBanSubmit = async () => {
    if (!banReason.trim()) {
      toast.error('Please provide a ban reason');
      return;
    }
    setActionLoading(true);
    try {
      await api.patch(`/admin/users/${banModal.user._id}/ban`, { ban_reason: banReason });
      toast.success(`${banModal.user.name} has been banned`);
      setBanModal({ open: false, user: null });
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Ban failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnban = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/users/${unbanModal.user._id}/unban`);
      toast.success(`${unbanModal.user.name} has been unbanned`);
      setUnbanModal({ open: false, user: null });
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unban failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1B2B4B]">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage all registered users</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="👤" title="No users found" description="Try adjusting your search." />
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1B2B4B] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {u.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{u.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{u.phone || '—'}</td>
                      <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                      <td className="px-4 py-3"><StatusBadge banned={u.isBanned} /></td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {u.createdAt ? formatDate(u.createdAt) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {u.isBanned ? (
                          <button
                            onClick={() => setUnbanModal({ open: true, user: u })}
                            className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors whitespace-nowrap"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => { setBanReason(''); setBanModal({ open: true, user: u }); }}
                            disabled={u.role === 'admin'}
                            className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Ban
                          </button>
                        )}
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
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users
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
                        p === page
                          ? 'bg-[#1B2B4B] text-white'
                          : 'hover:bg-gray-100 text-gray-600'
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

      {/* Ban Modal */}
      <Modal
        isOpen={banModal.open}
        onClose={() => setBanModal({ open: false, user: null })}
        title="Ban User"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are banning <span className="font-semibold text-[#1B2B4B]">{banModal.user?.name}</span>.
            This will prevent them from accessing the platform.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ban Reason <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="e.g. Violation of terms of service..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setBanModal({ open: false, user: null })}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBanSubmit}
              disabled={actionLoading}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading && <Spinner size="sm" color="white" />}
              Ban User
            </button>
          </div>
        </div>
      </Modal>

      {/* Unban Confirm Modal */}
      <Modal
        isOpen={unbanModal.open}
        onClose={() => setUnbanModal({ open: false, user: null })}
        title="Unban User"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to unban <span className="font-semibold text-[#1B2B4B]">{unbanModal.user?.name}</span>?
            They will regain access to the platform.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setUnbanModal({ open: false, user: null })}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUnban}
              disabled={actionLoading}
              className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading && <Spinner size="sm" color="white" />}
              Unban User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

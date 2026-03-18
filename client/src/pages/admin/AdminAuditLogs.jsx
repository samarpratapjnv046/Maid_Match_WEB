import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDateTime } from '../../utils/helpers';

const PAGE_SIZE = 15;

function ActionBadge({ action }) {
  const action_lower = action?.toLowerCase() || '';
  let classes = 'bg-gray-100 text-gray-700';
  if (action_lower.includes('verify') || action_lower.includes('approve') || action_lower.includes('unban')) {
    classes = 'bg-green-100 text-green-800';
  } else if (action_lower.includes('reject') || action_lower.includes('ban') || action_lower.includes('delete') || action_lower.includes('hide')) {
    classes = 'bg-red-100 text-red-800';
  } else if (action_lower.includes('refund')) {
    classes = 'bg-orange-100 text-orange-800';
  } else if (action_lower.includes('update') || action_lower.includes('edit') || action_lower.includes('show')) {
    classes = 'bg-blue-100 text-blue-800';
  } else if (action_lower.includes('create') || action_lower.includes('add')) {
    classes = 'bg-purple-100 text-purple-800';
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${classes}`}>
      {action}
    </span>
  );
}

function EntityTypeBadge({ entityType }) {
  const map = {
    user:    'bg-indigo-100 text-indigo-800',
    worker:  'bg-blue-100 text-blue-800',
    booking: 'bg-amber-100 text-amber-800',
    payment: 'bg-green-100 text-green-800',
    review:  'bg-pink-100 text-pink-800',
  };
  const key = entityType?.toLowerCase();
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${map[key] || 'bg-gray-100 text-gray-700'}`}>
      {entityType}
    </span>
  );
}

export default function AdminAuditLogs() {
  const [logs, setLogs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]   = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data?.logs || res.data || []);
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const paginated  = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1B2B4B]">Audit Logs</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track all administrative actions across the platform</p>
        </div>
        {!loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm">
            <ClipboardList size={15} className="text-[#C9A84C]" />
            <span className="font-medium text-[#1B2B4B]">{logs.length}</span> total entries
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : logs.length === 0 ? (
        <EmptyState icon="📋" title="No audit logs" description="Administrative actions will be recorded here." />
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['Timestamp', 'Admin', 'Action', 'Entity Type', 'Entity ID', 'Note'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap font-mono">
                        {log.createdAt ? formatDateTime(log.createdAt) : log.timestamp ? formatDateTime(log.timestamp) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#1B2B4B] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {(log.admin?.name || log.adminId?.name || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 whitespace-nowrap">
                              {log.admin?.name || log.adminId?.name || '—'}
                            </p>
                            {(log.admin?.email || log.adminId?.email) && (
                              <p className="text-xs text-gray-400 whitespace-nowrap">
                                {log.admin?.email || log.adminId?.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ActionBadge action={log.action} />
                      </td>
                      <td className="px-4 py-3">
                        {log.entityType ? (
                          <EntityTypeBadge entityType={log.entityType} />
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {log.entityId ? (
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            #{log.entityId?.toString().slice(-8).toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-sm text-gray-600 truncate" title={log.note || log.details || log.reason}>
                          {log.note || log.details || log.reason || <span className="text-gray-400 italic text-xs">No note</span>}
                        </p>
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
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, logs.length)}–{Math.min(page * PAGE_SIZE, logs.length)} of {logs.length} entries
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
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Star, Eye, EyeOff } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/helpers';

function StarDisplay({ rating }) {
  const r = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={13}
          className={i < r ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-gray-300'}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1 font-medium">{Number(rating || 0).toFixed(1)}</span>
    </div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [toggling, setToggling]     = useState(null); // review _id being toggled

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reviews');
      setReviews(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleToggleVisibility = async (review) => {
    const isCurrentlyHidden = review.is_visible === false;
    setToggling(review._id);
    try {
      if (isCurrentlyHidden) {
        await api.patch(`/admin/reviews/${review._id}/hide?show=true`);
        toast.success('Review is now visible');
      } else {
        await api.patch(`/admin/reviews/${review._id}/hide`);
        toast.success('Review hidden');
      }
      fetchReviews();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update review');
    } finally {
      setToggling(null);
    }
  };

  const hiddenCount  = reviews.filter((r) => r.is_visible === false).length;
  const visibleCount = reviews.length - hiddenCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1B2B4B]">Reviews</h1>
          <p className="text-gray-500 text-sm mt-0.5">Moderate and manage platform reviews</p>
        </div>
        {!loading && (
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg font-medium">
              <Eye size={14} />
              {visibleCount} Visible
            </span>
            <span className="flex items-center gap-1.5 text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg font-medium">
              <EyeOff size={14} />
              {hiddenCount} Hidden
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : reviews.length === 0 ? (
        <EmptyState icon="⭐" title="No reviews found" description="Reviews submitted by customers will appear here." />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Worker', 'Customer', 'Rating', 'Comment', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reviews.map((review) => {
                  const isHidden = review.is_visible === false;
                  const isToggling = toggling === review._id;
                  return (
                    <tr
                      key={review._id}
                      className={`transition-colors ${isHidden ? 'bg-gray-50/60 opacity-70' : 'hover:bg-gray-50/50'}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#C9A84C]/20 text-[#1B2B4B] flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {(review.worker_id?.user_id?.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
                            {review.worker_id?.user_id?.name || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#1B2B4B] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {(review.user_id?.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-800 whitespace-nowrap">
                            {review.user_id?.name || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StarDisplay rating={review.rating} />
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-sm text-gray-600 truncate" title={review.comment}>
                          {review.comment || <span className="italic text-gray-400">No comment</span>}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {isHidden ? (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold bg-gray-100 text-gray-600 whitespace-nowrap">
                            <EyeOff size={11} /> Hidden
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold bg-green-100 text-green-700 whitespace-nowrap">
                            <Eye size={11} /> Visible
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {review.createdAt ? formatDate(review.createdAt) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleVisibility(review)}
                          disabled={isToggling}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 whitespace-nowrap ${
                            isHidden
                              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {isToggling ? (
                            <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : isHidden ? (
                            <Eye size={13} />
                          ) : (
                            <EyeOff size={13} />
                          )}
                          {isHidden ? 'Show' : 'Hide'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

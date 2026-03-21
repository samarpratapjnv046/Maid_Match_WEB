import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart, MapPin, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import StarRating from '../../components/common/StarRating';
import Spinner from '../../components/common/Spinner';
import { serviceIcons, serviceLabels, formatCurrency, getStatusColor } from '../../utils/helpers';

function FavoriteCard({ worker, onRemove }) {
  const photo = worker.user_id?.profilePhoto?.url;
  const name = worker.user_id?.name || 'Worker';
  const initials = name[0]?.toUpperCase() || '?';
  const rating = worker.rating || 0;
  const reviewCount = worker.total_reviews || 0;
  const services = worker.services || [];
  const pricing = worker.pricing || {};
  const experience = worker.experience_years;
  const city = worker.location?.city || '';
  const pincode = worker.location?.pincode || '';
  const isVerified = worker.is_verified || worker.verification_status === 'verified';
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await api.post(`/favorites/${worker._id}`);
      onRemove(worker._id);
      toast.success('Removed from favorites.');
    } catch {
      toast.error('Failed to remove. Try again.');
      setRemoving(false);
    }
  };

  return (
    <div className="bg-[#FDFCF8] rounded-2xl border-l-4 border-l-[#C9A84C] border border-[#E8E2D5] shadow-[0_4px_20px_rgba(201,168,76,0.10),0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(201,168,76,0.18),0_2px_8px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-200 p-5 flex flex-col">
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[#C9A84C]/40 ring-offset-2 ring-offset-[#FDFCF8]"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#1B2B4B] flex items-center justify-center ring-2 ring-[#C9A84C]/40 ring-offset-2 ring-offset-[#FDFCF8]">
              <span className="text-white font-bold text-xl font-serif">{initials}</span>
            </div>
          )}
          {isVerified && (
            <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
              <CheckCircle size={14} className="text-green-500 fill-green-100" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif font-semibold text-[#1B2B4B] text-base leading-tight truncate">
              {name}
            </h3>
            {isVerified && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor('verified')}`}>
                Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <StarRating rating={rating} size={13} />
            <span className="text-sm font-semibold text-[#1B2B4B]">{rating > 0 ? rating.toFixed(1) : '—'}</span>
            <span className="text-xs text-gray-400">({reviewCount} reviews)</span>
          </div>

          <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
            <MapPin size={11} />
            <span>{[city, pincode].filter(Boolean).join(' – ') || '—'}</span>
          </div>
        </div>

        {/* Remove from favorites button */}
        <button
          onClick={handleRemove}
          disabled={removing}
          title="Remove from favorites"
          className="flex-shrink-0 p-1.5 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Heart size={18} className="fill-current" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 min-h-[2rem]">
        {services.slice(0, 4).map((svc) => (
          <span
            key={svc}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-white border border-[#C9A84C]/30 text-[#1B2B4B] rounded-full font-medium shadow-sm"
          >
            <span role="img" aria-label={serviceLabels[svc]}>{serviceIcons[svc]}</span>
            {serviceLabels[svc] || svc}
          </span>
        ))}
        {services.length > 4 && (
          <span className="text-xs px-2.5 py-1 bg-white border border-gray-200 text-gray-500 rounded-full font-medium shadow-sm">
            +{services.length - 4} more
          </span>
        )}
      </div>

      <div className="flex-1" />

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Hourly', key: 'hourly' },
          { label: 'Daily', key: 'daily' },
          { label: 'Monthly', key: 'monthly' },
        ].map(({ label, key }) => (
          <div key={key} className="bg-white border border-[#E8E2D5] rounded-lg py-2 px-1 shadow-sm">
            <div className="text-xs text-gray-400 font-medium mb-0.5">{label}</div>
            <div className="text-sm font-semibold text-[#1B2B4B]">
              {pricing[key] ? formatCurrency(pricing[key]) : <span className="text-gray-300 text-xs">N/A</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#E8E2D5]">
        <span className="text-xs text-gray-500">
          {experience != null && experience > 0
            ? <><span className="font-semibold text-[#1B2B4B]">{experience}</span> yr{experience !== 1 ? 's' : ''} exp</>
            : <span className="text-gray-300">—</span>
          }
        </span>
        <Link
          to={`/workers/${worker._id}`}
          className="inline-flex items-center gap-1.5 bg-[#1B2B4B] hover:bg-[#152238] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all duration-150 hover:-translate-y-0.5 shadow-sm"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

export default function FavoriteWorkers() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/favorites');
        setFavorites(data.data || []);
      } catch {
        toast.error('Failed to load favorites.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRemove = (workerId) => {
    setFavorites((prev) => prev.filter((w) => w._id !== workerId));
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <div className="bg-[#1B2B4B] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest mb-2">
            Saved Workers
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
            My Favorites
            <Heart size={28} className="text-red-400 fill-current" />
          </h1>
          <p className="mt-2 text-gray-400 text-sm">
            {loading ? 'Loading…' : `${favorites.length} saved worker${favorites.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" color="gold" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart size={48} className="text-gray-200 mb-4" />
            <h3 className="font-serif text-xl font-semibold text-[#1B2B4B] mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-500 text-sm max-w-xs mb-6">
              Browse workers and tap the heart icon to save them here.
            </p>
            <Link
              to="/workers"
              className="bg-[#C9A84C] hover:bg-[#b8923e] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              Browse Workers
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
            {favorites.map((worker) => (
              <FavoriteCard key={worker._id} worker={worker} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Star, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SearchWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    query: '',
    minRating: 0
  });

  useEffect(() => {
    fetchWorkers();
  }, [filters]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      // Constructing query string based on backend capabilities. Defaulting to empty if none.
      const response = await api.get('/workers/search');
      let data = response.data || [];
      
      // Simple frontend filtering if backend doesn't support full query search out of the box
      if (filters.query) {
        const q = filters.query.toLowerCase();
        data = data.filter(w => 
          w.bio?.toLowerCase().includes(q) || 
          w.user_id?.name?.toLowerCase().includes(q) ||
          w.services?.some(s => s.toLowerCase().includes(q))
        );
      }
      if (filters.minRating > 0) {
        data = data.filter(w => w.rating?.average >= filters.minRating);
      }
      
      setWorkers(data);
    } catch (err) {
      console.error('Error fetching workers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Find the Perfect Maid</h1>
          <p className="mt-4 text-xl text-gray-500">Search by name, skills, or rating</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="query"
                value={filters.query}
                onChange={handleSearchChange}
                className="input-field pl-10"
                placeholder="Search for cooking, cleaning, child care..."
              />
            </div>
            <select
               name="minRating"
               value={filters.minRating}
               onChange={handleSearchChange}
               className="input-field w-auto"
            >
              <option value="0">Any Rating</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
        </div>

        {/* Worker Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-lg">
            No workers found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workers.map((worker, index) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                key={worker._id} 
                className="card flex flex-col hover:shadow-lg transition-shadow"
              >
                <div className="p-6 flex-grow">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={worker.user_id?.profilePhoto || 'https://via.placeholder.com/150'} 
                      alt={worker.user_id?.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary-100"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{worker.user_id?.name || 'Worker'}</h3>
                      <div className="flex items-center text-sm text-yellow-500 font-medium">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        {worker.rating?.average || 'New'} 
                        <span className="text-gray-400 ml-1 font-normal">({worker.rating?.count || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {worker.bio || 'Professional and reliable.'}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {worker.services?.slice(0, 3).map(service => (
                      <span key={service} className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full font-medium capitalize">
                        {service}
                      </span>
                    ))}
                    {worker.services?.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                        +{worker.services.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4 mr-1" /> Available in your area
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                  <div className="text-sm font-medium">
                    <span className="text-lg font-bold text-gray-900">₹{worker.pricing?.hourly || 0}</span>/hr
                  </div>
                  <Link to={`/workers/${worker._id}`} className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors">
                    View Profile &rarr;
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchWorkers;
